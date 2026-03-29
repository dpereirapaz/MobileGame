// Tests for engine-v2.ts — multi-layer Synapse engine.
// Covers all 15 required scenarios from the spec.

import { describe, test, expect } from 'vitest';
import {
  createGame,
  placeNeuronWithSteps,
  isLayerSolved,
  isLayerGameOver,
  isGameWon,
  addConnection,
  removeConnection,
  chargeForTier,
  commitConnections,
  activateNextLayer,
  LAYER_SIZE,
  MIN_CONNECTIONS,
  MAX_CONNECTIONS_PER_SOURCE,
  MAX_CONNECTIONS_PER_TARGET,
  LAYER_SOLVE_TIERS,
} from './engine-v2';
import type { GameState, LayerState, Connection } from './types';

// ─── Test helpers ─────────────────────────────────────────────────

/**
 * Build a LayerState from a sparse list of [row, col, tier] entries
 * on a LAYER_SIZE × LAYER_SIZE grid.
 */
function makeLayer(
  index: 0 | 1 | 2,
  entries: [number, number, number][] = [],
  status: LayerState['status'] = 'active',
): LayerState {
  const names: ['input', 'hidden', 'output'] = ['input', 'hidden', 'output'];
  const solveAtTiers: [number, number, number] = LAYER_SOLVE_TIERS;
  const grid = Array.from({ length: LAYER_SIZE }, () =>
    Array<number | null>(LAYER_SIZE).fill(null),
  );
  for (const [r, c, tier] of entries) {
    grid[r][c] = tier;
  }
  let highest = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null && cell > highest) highest = cell;
    }
  }
  return {
    name: names[index],
    grid,
    status,
    solveAtTier: solveAtTiers[index],
    highestTier: highest,
  };
}

/**
 * Build a minimal GameState for testing.
 * Defaults: Input active, Hidden+Output locked.
 */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    layers: [
      makeLayer(0, [], 'active'),
      makeLayer(1, [], 'locked'),
      makeLayer(2, [], 'locked'),
    ],
    activeLayer: 0,
    phase: 'play',
    connections: [],
    pendingCharges: {},
    compute: 0,
    personalBest: 0,
    ...overrides,
  };
}

/** Fill a 4×4 layer grid entirely, alternating tiers to prevent merges. */
function makeFullGameOverLayer(index: 0 | 1 | 2): LayerState {
  // Checkerboard: (r+c)%2===0 → tier 1, else → tier 2
  const entries: [number, number, number][] = [];
  for (let r = 0; r < LAYER_SIZE; r++) {
    for (let c = 0; c < LAYER_SIZE; c++) {
      entries.push([r, c, (r + c) % 2 === 0 ? 1 : 2]);
    }
  }
  return makeLayer(index, entries, 'active');
}

// ─── Test 1: createGame ───────────────────────────────────────────

describe('createGame', () => {
  test('1 — Input active, Hidden+Output locked, 2 T1 neurons on Input', () => {
    const state = createGame();

    // Layer count
    expect(state.layers).toHaveLength(3);

    // Input layer
    const input = state.layers[0];
    expect(input.name).toBe('input');
    expect(input.status).toBe('active');
    expect(input.solveAtTier).toBe(4);
    const t1Count = input.grid.flat().filter(x => x === 1).length;
    expect(t1Count).toBe(2);
    const occupied = input.grid.flat().filter(x => x !== null).length;
    expect(occupied).toBe(2);

    // Hidden layer
    const hidden = state.layers[1];
    expect(hidden.name).toBe('hidden');
    expect(hidden.status).toBe('locked');
    expect(hidden.grid.flat().every(x => x === null)).toBe(true);

    // Output layer
    const output = state.layers[2];
    expect(output.name).toBe('output');
    expect(output.status).toBe('locked');
    expect(output.grid.flat().every(x => x === null)).toBe(true);

    // Phase / misc
    expect(state.activeLayer).toBe(0);
    expect(state.phase).toBe('play');
    expect(state.compute).toBe(0);

    // personalBest forwarded
    const statePB = createGame(150);
    expect(statePB.personalBest).toBe(150);
  });
});

// ─── Test 2: placeNeuronWithSteps — occupied cell ─────────────────

describe('placeNeuronWithSteps — no-op cases', () => {
  test('2 — occupied cell returns same state reference', () => {
    const state = makeState({
      layers: [
        makeLayer(0, [[0, 0, 1]], 'active'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
    });
    const result = placeNeuronWithSteps(state, 0, 0);
    // Same reference = no-op
    expect(result.finalState).toBe(state);
    expect(result.steps).toHaveLength(0);
  });

  test('phase !== play returns same state reference', () => {
    const state = makeState({ phase: 'connect' });
    const result = placeNeuronWithSteps(state, 0, 0);
    expect(result.finalState).toBe(state);
  });
});

// ─── Test 3: BFS merge fires on 3 adjacent same-tier cells ────────

describe('placeNeuronWithSteps — BFS merge', () => {
  test('3 — triggers BFS merge when 3 adjacent same-tier cells exist', () => {
    const state = makeState({
      layers: [
        makeLayer(0, [[0, 0, 1], [0, 1, 1]], 'active'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
    });
    // Place T1 at (0,2) → 3-cell group → T2
    const { finalState, steps } = placeNeuronWithSteps(state, 0, 2);
    expect(steps.length).toBeGreaterThanOrEqual(1);
    const grid = finalState.layers[0].grid;
    // T2 should appear at placed pos (0,2)
    expect(grid[0][2]).toBe(2);
    expect(grid[0][0]).toBeNull();
    expect(grid[0][1]).toBeNull();
  });
});

// ─── Test 4: T4 in Input layer → phase 'connect' ─────────────────

describe('placeNeuronWithSteps — solve transitions', () => {
  test('4 — T4 created in Input layer triggers phase connect', () => {
    // Build a state where placing one T1 will chain up to T4.
    // Pre-place: 3×T3 adjacent → group merges to T4 on any placement.
    // We just need a T3 group ready; placing any T1 elsewhere triggers the merge pass.
    const state = makeState({
      layers: [
        makeLayer(0, [[0, 0, 3], [0, 1, 3], [0, 2, 3]], 'active'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
    });
    // Place T1 at (3, 3) — triggers BFS which finds the T3 group
    const { finalState } = placeNeuronWithSteps(state, 3, 3);
    expect(finalState.phase).toBe('connect');
    expect(finalState.layers[0].highestTier).toBeGreaterThanOrEqual(4);
  });

  // ─── Test 5: T5 in Hidden layer → phase 'connect' ───────────────

  test('5 — T5 created in Hidden layer triggers phase connect', () => {
    const state: GameState = {
      layers: [
        makeLayer(0, [], 'connected'),
        makeLayer(1, [[0, 0, 4], [0, 1, 4], [0, 2, 4]], 'active'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 1,
      phase: 'play',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
    // T4 group → T5, which meets Hidden's solveAtTier (5)
    const { finalState } = placeNeuronWithSteps(state, 3, 3);
    expect(finalState.phase).toBe('connect');
    expect(finalState.layers[1].highestTier).toBeGreaterThanOrEqual(5);
  });

  // ─── Test 6: T7 in Output layer → phase 'won' ───────────────────

  test('6 — T7 created in Output layer triggers phase won', () => {
    const state: GameState = {
      layers: [
        makeLayer(0, [], 'connected'),
        makeLayer(1, [], 'connected'),
        makeLayer(2, [[0, 0, 6], [0, 1, 6], [0, 2, 6]], 'active'),
      ],
      activeLayer: 2,
      phase: 'play',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
    // T6 group → T7. Output solveAtTier is 7 → won.
    const { finalState } = placeNeuronWithSteps(state, 3, 3);
    expect(finalState.phase).toBe('won');
    expect(finalState.layers[2].highestTier).toBeGreaterThanOrEqual(7);
  });
});

// ─── Test 7: isLayerGameOver ──────────────────────────────────────

describe('isLayerGameOver', () => {
  test('7 — returns true on full 4×4 board with no adjacent same-tier cells', () => {
    const layer = makeFullGameOverLayer(0);
    expect(isLayerGameOver(layer)).toBe(true);
  });

  test('returns false when board has empty cells', () => {
    const layer = makeLayer(0, [[0, 0, 1]], 'active');
    expect(isLayerGameOver(layer)).toBe(false);
  });

  test('returns false when board full but adjacent same-tier pair exists', () => {
    // Fill entirely with tier 1 → every adjacent pair matches → not game over
    const entries: [number, number, number][] = [];
    for (let r = 0; r < LAYER_SIZE; r++) {
      for (let c = 0; c < LAYER_SIZE; c++) {
        entries.push([r, c, 1]);
      }
    }
    const layer = makeLayer(0, entries, 'active');
    expect(isLayerGameOver(layer)).toBe(false);
  });
});

// ─── Tests 8–10: addConnection validation ────────────────────────

describe('addConnection', () => {
  function makeConnectState(): GameState {
    return {
      layers: [
        makeLayer(0, [[1, 1, 3]], 'solved'),  // source cell exists at (1,1)
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 0,
      phase: 'connect',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
  }

  const validConn: Connection = {
    fromLayer: 0, fromRow: 1, fromCol: 1,
    toLayer: 1, toRow: 0, toCol: 0,
  };

  test('8 — rejects when phase !== connect', () => {
    const state = makeConnectState();
    const playState = { ...state, phase: 'play' as const };
    expect(addConnection(playState, validConn)).toBe(playState);
  });

  test('accepts valid connection', () => {
    const state = makeConnectState();
    const next = addConnection(state, validConn);
    expect(next.connections).toHaveLength(1);
    expect(next.connections[0]).toEqual(validConn);
  });

  test('9 — rejects when source exceeds MAX_CONNECTIONS_PER_SOURCE', () => {
    let state = makeConnectState();
    // Add MAX_CONNECTIONS_PER_SOURCE connections from same source
    for (let i = 0; i < MAX_CONNECTIONS_PER_SOURCE; i++) {
      state = addConnection(state, {
        fromLayer: 0, fromRow: 1, fromCol: 1,
        toLayer: 1, toRow: i, toCol: 0,
      });
    }
    expect(state.connections).toHaveLength(MAX_CONNECTIONS_PER_SOURCE);
    // One more from same source → rejected
    const attempted = addConnection(state, {
      fromLayer: 0, fromRow: 1, fromCol: 1,
      toLayer: 1, toRow: 3, toCol: 3,
    });
    expect(attempted.connections).toHaveLength(MAX_CONNECTIONS_PER_SOURCE);
  });

  test('10 — rejects when target exceeds MAX_CONNECTIONS_PER_TARGET', () => {
    // Need multiple source cells to saturate a single target
    const stateWithSources: GameState = {
      layers: [
        makeLayer(0, [[0, 0, 3], [0, 1, 3], [0, 2, 3]], 'solved'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 0,
      phase: 'connect',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };

    let state = stateWithSources;
    for (let i = 0; i < MAX_CONNECTIONS_PER_TARGET; i++) {
      state = addConnection(state, {
        fromLayer: 0, fromRow: 0, fromCol: i,
        toLayer: 1, toRow: 0, toCol: 0,
      });
    }
    expect(state.connections).toHaveLength(MAX_CONNECTIONS_PER_TARGET);
    // Another connection to same target → rejected
    const attempted = addConnection(state, {
      fromLayer: 0, fromRow: 0, fromCol: 2,
      toLayer: 1, toRow: 0, toCol: 0,
    });
    expect(attempted.connections).toHaveLength(MAX_CONNECTIONS_PER_TARGET);
  });
});

// ─── Test 11: chargeForTier ───────────────────────────────────────

describe('chargeForTier', () => {
  test('11 — null=0, T3=1, T5=2, T7=3 (and boundary values)', () => {
    expect(chargeForTier(null)).toBe(0);
    expect(chargeForTier(1)).toBe(1);
    expect(chargeForTier(3)).toBe(1);
    expect(chargeForTier(4)).toBe(1);
    expect(chargeForTier(5)).toBe(2);
    expect(chargeForTier(6)).toBe(2);
    expect(chargeForTier(7)).toBe(3);
  });
});

// ─── Test 12: commitConnections ───────────────────────────────────

describe('commitConnections', () => {
  function makeCommitState(connections: Connection[]): GameState {
    return {
      layers: [
        makeLayer(0, [[0, 0, 5], [0, 1, 3], [0, 2, 1]], 'solved'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 0,
      phase: 'connect',
      connections,
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
  }

  test('rejects when phase !== connect', () => {
    const state = { ...makeCommitState([]), phase: 'play' as const };
    expect(commitConnections(state)).toBe(state);
  });

  test('rejects when fewer than MIN_CONNECTIONS connections', () => {
    const conn: Connection = { fromLayer: 0, fromRow: 0, fromCol: 0, toLayer: 1, toRow: 0, toCol: 0 };
    const state = makeCommitState([conn]); // only 1, need MIN_CONNECTIONS
    expect(commitConnections(state)).toBe(state);
  });

  test('12a — single connection: pendingCharges computed correctly', () => {
    // T5 source → chargeForTier(5) = 2
    const conns: Connection[] = Array.from({ length: MIN_CONNECTIONS }, (_, i) => ({
      fromLayer: 0, fromRow: 0, fromCol: 0,  // T5 source
      toLayer: 1, toRow: 0, toCol: i,
    }));
    const state = makeCommitState(conns);
    const next = commitConnections(state);
    expect(next.phase).toBe('activate');
    // Each target gets charge 2 (from T5)
    for (let i = 0; i < MIN_CONNECTIONS; i++) {
      expect(next.pendingCharges[`1:0:${i}`]).toBe(2);
    }
  });

  test('12b — multi-connection max rule: two connections to same target → MAX charge wins', () => {
    // Source A at (0,0) = T5 → charge 2
    // Source B at (0,1) = T3 → charge 1
    // Both point to target (1, 0, 0) → should resolve to 2 (MAX)
    // Add a third valid connection to meet MIN_CONNECTIONS
    const conns: Connection[] = [
      { fromLayer: 0, fromRow: 0, fromCol: 0, toLayer: 1, toRow: 0, toCol: 0 }, // T5 → charge 2
      { fromLayer: 0, fromRow: 0, fromCol: 1, toLayer: 1, toRow: 0, toCol: 0 }, // T3 → charge 1
      { fromLayer: 0, fromRow: 0, fromCol: 2, toLayer: 1, toRow: 0, toCol: 1 }, // T1 → charge 1
    ];
    const state = makeCommitState(conns);
    const next = commitConnections(state);
    expect(next.phase).toBe('activate');
    // Target (1,0,0): MAX(2, 1) = 2
    expect(next.pendingCharges['1:0:0']).toBe(2);
    // Target (1,0,1): just 1
    expect(next.pendingCharges['1:0:1']).toBe(1);
  });
});

// ─── Test 13: activateNextLayer ───────────────────────────────────

describe('activateNextLayer', () => {
  test('13 — seeds Hidden layer grid with charged neurons at correct tiers', () => {
    const state: GameState = {
      layers: [
        makeLayer(0, [[0, 0, 5]], 'solved'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 0,
      phase: 'activate',
      connections: [],
      pendingCharges: {
        '1:0:0': 2, // Hidden layer, row 0, col 0 → tier 2
        '1:1:1': 1, // Hidden layer, row 1, col 1 → tier 1
        '1:3:3': 3, // Hidden layer, row 3, col 3 → tier 3
      },
      compute: 0,
      personalBest: 0,
    };

    const next = activateNextLayer(state);

    // Phase and layer progression
    expect(next.phase).toBe('play');
    expect(next.activeLayer).toBe(1);

    // Current layer (Input) → 'connected'
    expect(next.layers[0].status).toBe('connected');

    // Next layer (Hidden) → 'active', seeded
    const hidden = next.layers[1];
    expect(hidden.status).toBe('active');
    expect(hidden.grid[0][0]).toBe(2);
    expect(hidden.grid[1][1]).toBe(1);
    expect(hidden.grid[3][3]).toBe(3);

    // Charges and connections cleared
    expect(next.pendingCharges).toEqual({});
    expect(next.connections).toHaveLength(0);
  });

  test('rejects when phase !== activate', () => {
    const state = makeState({ phase: 'play' });
    expect(activateNextLayer(state)).toBe(state);
  });
});

// ─── Test 14: removeConnection ────────────────────────────────────

describe('removeConnection', () => {
  test('14 — removes matching connection and decrements length', () => {
    const conn1: Connection = { fromLayer: 0, fromRow: 0, fromCol: 0, toLayer: 1, toRow: 0, toCol: 0 };
    const conn2: Connection = { fromLayer: 0, fromRow: 0, fromCol: 1, toLayer: 1, toRow: 0, toCol: 1 };
    const state = makeState({
      phase: 'connect',
      connections: [conn1, conn2],
    });

    const next = removeConnection(state, conn1);
    expect(next.connections).toHaveLength(1);
    expect(next.connections[0]).toEqual(conn2);
  });

  test('returns same state when connection not found', () => {
    const state = makeState({ phase: 'connect' });
    const conn: Connection = { fromLayer: 0, fromRow: 0, fromCol: 0, toLayer: 1, toRow: 0, toCol: 0 };
    expect(removeConnection(state, conn)).toBe(state);
  });
});

// ─── Test 15: isGameWon ───────────────────────────────────────────

describe('isGameWon', () => {
  test('15a — returns true when Output layer has T7', () => {
    const state: GameState = {
      layers: [
        makeLayer(0, [], 'connected'),
        makeLayer(1, [], 'connected'),
        makeLayer(2, [[0, 0, 7]], 'active'),
      ],
      activeLayer: 2,
      phase: 'play',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
    expect(isGameWon(state)).toBe(true);
  });

  test('15b — returns false when Output layer has no T7', () => {
    const state = makeState();
    expect(isGameWon(state)).toBe(false);
  });

  test('15c — returns false when only Input layer has T7', () => {
    const state: GameState = {
      layers: [
        makeLayer(0, [[0, 0, 7]], 'active'),
        makeLayer(1, [], 'locked'),
        makeLayer(2, [], 'locked'),
      ],
      activeLayer: 0,
      phase: 'play',
      connections: [],
      pendingCharges: {},
      compute: 0,
      personalBest: 0,
    };
    expect(isGameWon(state)).toBe(false);
  });
});

// ─── Additional: isLayerSolved boundaries ────────────────────────

describe('isLayerSolved', () => {
  test('Input layer: solved at T4, not at T3', () => {
    expect(isLayerSolved(makeLayer(0, [[0, 0, 4]], 'active'))).toBe(true);
    expect(isLayerSolved(makeLayer(0, [[0, 0, 3]], 'active'))).toBe(false);
  });

  test('Hidden layer: solved at T5, not at T4', () => {
    expect(isLayerSolved(makeLayer(1, [[0, 0, 5]], 'active'))).toBe(true);
    expect(isLayerSolved(makeLayer(1, [[0, 0, 4]], 'active'))).toBe(false);
  });

  test('Output layer: solved at T7, not at T6', () => {
    expect(isLayerSolved(makeLayer(2, [[0, 0, 7]], 'active'))).toBe(true);
    expect(isLayerSolved(makeLayer(2, [[0, 0, 6]], 'active'))).toBe(false);
  });
});
