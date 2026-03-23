import { describe, test, expect } from 'vitest';
import {
  createGame,
  placeNeuron,
  placeNeuronWithSteps,
  isGameOver,
  type GameState,
} from './engine';

// ─── Test helpers ──────────────────────────────────────────────────

/** Build a GameState from a sparse list of [row, col, tier] entries. */
function makeState(
  entries: [number, number, number][],
  compute = 0,
  personalBest = 0,
): GameState {
  const grid: (number | null)[][] = Array.from({ length: 8 }, () =>
    Array<number | null>(8).fill(null),
  );
  for (const [r, c, tier] of entries) {
    grid[r][c] = tier;
  }
  return { grid, compute, personalBest };
}

/** Fill entire 8×8 board with one tier, with optional cell overrides. */
function fullBoard(
  defaultTier: number,
  overrides: [number, number, number][] = [],
): GameState {
  const entries: [number, number, number][] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      entries.push([r, c, defaultTier]);
    }
  }
  for (const [r, c, tier] of overrides) {
    const idx = entries.findIndex(e => e[0] === r && e[1] === c);
    if (idx >= 0) entries[idx][2] = tier;
  }
  return makeState(entries);
}

// ─── Tests 1–4: createGame + basic placement ───────────────────────

describe('createGame', () => {
  test('1 — returns 8×8 grid with 2 Tier-1 neurons pre-placed at (3,3) and (3,4)', () => {
    const state = createGame(0);
    expect(state.grid.length).toBe(8);
    expect(state.grid[0].length).toBe(8);
    expect(state.grid[3][3]).toBe(1);
    expect(state.grid[3][4]).toBe(1);
    expect(state.compute).toBe(0);
    expect(state.personalBest).toBe(0);
    const occupied = state.grid.flat().filter(x => x !== null).length;
    expect(occupied).toBe(2);
  });

  test('2 — personalBest parameter is carried into state', () => {
    const state = createGame(100);
    expect(state.personalBest).toBe(100);
    expect(state.compute).toBe(0);
  });
});

describe('placeNeuron — basic', () => {
  test('3 — places Tier-1 neuron on an empty cell', () => {
    const state = createGame(0);
    const next = placeNeuron(state, 0, 0);
    expect(next.grid[0][0]).toBe(1);
    expect(next.grid[3][3]).toBe(1); // pre-placed unchanged
  });

  test('4 — ignores click on occupied cell (returns same reference)', () => {
    const state = createGame(0);
    const next = placeNeuron(state, 3, 3); // pre-placed at (3,3)
    expect(next).toBe(state);
  });
});

// ─── Tests 5–8: merge detection and placement rules ────────────────

describe('merge detection', () => {
  test('5 — group of 3 merges into Tier+1', () => {
    const state = makeState([[0, 0, 1], [0, 1, 1]]);
    const next = placeNeuron(state, 0, 2);
    // Group: (0,0),(0,1),(0,2) → Tier-2 at placed pos (0,2)
    expect(next.grid[0][2]).toBe(2);
    expect(next.grid[0][0]).toBeNull();
    expect(next.grid[0][1]).toBeNull();
  });

  test('6 — group of 5 produces exactly ONE Tier+1 neuron', () => {
    const state = makeState([[0, 0, 1], [0, 1, 1], [0, 2, 1], [0, 3, 1]]);
    const next = placeNeuron(state, 0, 4);
    // 5-cell group → one Tier-2, all others null
    const tier2s = next.grid.flat().filter(x => x === 2).length;
    expect(tier2s).toBe(1);
    expect(next.grid[0][4]).toBe(2); // at placed position
  });

  test('7 — upgrade lands at placed position when group contains it', () => {
    // (0,0) and (0,1) are Tier-1; place at (0,2)
    // Group = [(0,0),(0,1),(0,2)], contains placed pos (0,2)
    // Upgrade → (0,2), NOT (0,0) [first BFS cell]
    const state = makeState([[0, 0, 1], [0, 1, 1]]);
    const next = placeNeuron(state, 0, 2);
    expect(next.grid[0][2]).toBe(2);           // placed pos gets upgrade
    expect(next.grid[0][0]).toBeNull();         // first BFS cell — NOT upgrade pos
  });

  test('8 — upgrade lands at first BFS cell (row-major) for group not containing placed pos', () => {
    // Two simultaneous groups when tier-1 is placed at (5,2):
    //   Group A (Tier-1): (5,0),(5,1),(5,2) — contains placed pos → upgrade at (5,2)
    //   Group B (Tier-2): (0,0),(0,1),(0,2) — does NOT contain (5,2) → upgrade at (0,0)
    const state = makeState([
      [0, 0, 2], [0, 1, 2], [0, 2, 2],   // pre-existing Tier-2 group (row-major first)
      [5, 0, 1], [5, 1, 1],               // Tier-1s to complete with placed neuron
    ]);
    const next = placeNeuron(state, 5, 2);

    // Group A result: Tier-2 at placed pos (5,2)
    expect(next.grid[5][2]).toBe(2);

    // Group B result: Tier-3 at first BFS cell (0,0)
    expect(next.grid[0][0]).toBe(3);
    expect(next.grid[0][1]).toBeNull();
    expect(next.grid[0][2]).toBeNull();
  });
});

// ─── Tests 9–11: chain merges + AGI ───────────────────────────────

describe('chain merges and AGI', () => {
  test('9 — chain merge fires when merged Tier matches adjacent cells', () => {
    // Pre-place: Tier-2 at (0,0),(0,1); Tier-1 at (1,1),(1,2)
    // Place Tier-1 at (1,0):
    //   Pass 1: Tier-1 group (1,0),(1,1),(1,2) → Tier-2 at (1,0) [placed pos]
    //   Chain:  Tier-2 group (0,0),(0,1),(1,0) → Tier-3 at (0,0) [first BFS]
    const state = makeState([[0, 0, 2], [0, 1, 2], [1, 1, 1], [1, 2, 1]]);
    const next = placeNeuron(state, 1, 0);

    expect(next.grid[0][0]).toBe(3);   // chain result
    expect(next.grid[0][1]).toBeNull();
    expect(next.grid[1][0]).toBeNull(); // merged away in chain
    expect(next.grid[1][1]).toBeNull();
    expect(next.grid[1][2]).toBeNull();
  });

  test('10 — AGI creation: Tier-6 group → Tier-7, compute += 500', () => {
    // Pre-place 3 adjacent Tier-6s (engine merges all groups after any placement)
    const state = makeState([[0, 0, 6], [0, 1, 6], [0, 2, 6]]);
    const next = placeNeuron(state, 7, 7); // trigger merge pass via any placement
    expect(next.grid[0][0]).toBe(7);       // AGI at first BFS cell
    expect(next.grid[0][1]).toBeNull();
    expect(next.grid[0][2]).toBeNull();
    expect(next.grid[7][7]).toBe(1);       // placed neuron still there
    expect(next.compute).toBe(500);        // AGI bonus
  });

  test('11 — Tier-7 (AGI) neurons are excluded from merge detection', () => {
    // 3 adjacent AGIs — must NOT trigger a merge (no Tier-8)
    const state = makeState([[0, 0, 7], [0, 1, 7], [0, 2, 7]]);
    const next = placeNeuron(state, 7, 7);
    expect(next.grid[0][0]).toBe(7); // unchanged
    expect(next.grid[0][1]).toBe(7); // unchanged
    expect(next.grid[0][2]).toBe(7); // unchanged
    expect(next.compute).toBe(0);   // no points
  });
});

// ─── Tests 12–13: scoring and personalBest ────────────────────────

describe('scoring', () => {
  test('12 — compute increments by tier of newly created neuron (Tier-2 = +2 pts)', () => {
    const state = makeState([[0, 0, 1], [0, 1, 1]], 5); // starting compute = 5
    const next = placeNeuron(state, 0, 2); // Tier-1 group → Tier-2
    expect(next.compute).toBe(7);          // 5 + 2 = 7
  });

  test('13 — personalBest updates to max(prev, compute) after each turn', () => {
    // Case A: new compute (2) < personalBest (3) → no update
    const stateA = makeState([[0, 0, 1], [0, 1, 1]], 0, 3);
    const nextA = placeNeuron(stateA, 0, 2);
    expect(nextA.personalBest).toBe(3);

    // Case B: new compute (3) > personalBest (0) → update
    const stateB = makeState([[0, 0, 2], [0, 1, 2], [0, 2, 2]], 0, 0);
    const nextB = placeNeuron(stateB, 7, 7); // Tier-2 group → Tier-3 (+3 pts)
    expect(nextB.compute).toBe(3);
    expect(nextB.personalBest).toBe(3);
  });
});

// ─── Tests 14–18: isGameOver ──────────────────────────────────────

describe('isGameOver', () => {
  test('14 — returns false when any empty cell exists', () => {
    const state = createGame(0); // mostly empty
    expect(isGameOver(state)).toBe(false);
  });

  test('15 — returns false when board full but a mergeable Tier<7 pair exists', () => {
    // Fill board by row alternation: even rows = Tier-1, odd rows = Tier-2
    // Row 0: all Tier-1 → (0,0) and (0,1) are adjacent same-tier → mergeable
    const entries: [number, number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        entries.push([r, c, r % 2 === 0 ? 1 : 2]);
      }
    }
    expect(isGameOver(makeState(entries))).toBe(false);
  });

  test('16 — returns true when board full with no mergeable pairs (checkerboard)', () => {
    // Checkerboard: (r+c)%2===0 → Tier-1, else → Tier-2
    // Every adjacent pair has different tiers → no merges possible
    const entries: [number, number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        entries.push([r, c, (r + c) % 2 === 0 ? 1 : 2]);
      }
    }
    expect(isGameOver(makeState(entries))).toBe(true);
  });

  test('17 — returns true when board full with only tier-7 adjacent pairs (AGI cannot merge)', () => {
    expect(isGameOver(fullBoard(7))).toBe(true);
  });

  test('18 — returns false when board full with tier-7 AND a tier-5 adjacent pair', () => {
    // Mostly AGIs but one pair of adjacent Tier-5s → game is NOT over
    const state = fullBoard(7, [[0, 0, 5], [0, 1, 5]]);
    expect(isGameOver(state)).toBe(false);
  });
});

// ─── placeNeuronWithSteps: verify steps structure ─────────────────

describe('placeNeuronWithSteps', () => {
  test('returns empty steps when no merge occurs', () => {
    const state = createGame(0);
    const { steps } = placeNeuronWithSteps(state, 0, 0);
    expect(steps).toHaveLength(0);
  });

  test('returns one step for single merge, two steps for chain', () => {
    // Setup for chain (same as test 9)
    const state = makeState([[0, 0, 2], [0, 1, 2], [1, 1, 1], [1, 2, 1]]);
    const { steps, finalState } = placeNeuronWithSteps(state, 1, 0);
    expect(steps).toHaveLength(2);             // pass 1 + chain pass
    expect(steps[0].pointsEarned).toBe(2);     // Tier-2 created
    expect(steps[1].pointsEarned).toBe(3);     // Tier-3 created (chain)
    expect(finalState.compute).toBe(5);        // 2 + 3
  });
});
