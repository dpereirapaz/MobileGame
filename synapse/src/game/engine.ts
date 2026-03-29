// Synapse — pure game engine (zero DOM/React dependencies)
// Reusable in Phase 1 React Native build.

// BFS helpers live in bfs.ts so engine-v2.ts can share them.
import { findGroups, applyGroups, GRID_SIZE, MAX_TIER, AGI_BONUS } from './bfs';

/** A single cell value — null is empty, 1–7 is a neuron tier. */
export type CellValue = number | null;

/** The 8×8 game board. */
export type BoardGrid = CellValue[][];

export interface GameState {
  grid: BoardGrid;
  compute: number;     // accumulated FLOPs score
  personalBest: number; // set by React layer from localStorage
}

export interface MergeStep {
  grid: BoardGrid;
  pointsEarned: number;
}

export interface PlaceResult {
  finalState: GameState;
  placedGrid: BoardGrid;  // grid after placement, before any merges
  steps: MergeStep[];     // one entry per merge pass (empty = no merges)
}

export { GRID_SIZE, MAX_TIER, AGI_BONUS };

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a fresh game state.
 * Pre-places 2 Tier-1 neurons at (3,3) and (3,4) so the player's first
 * click on an adjacent cell immediately triggers a merge — teaching the
 * core mechanic through action with no tutorial text.
 *
 * @param personalBest - Read from localStorage by the React layer; default 0.
 *                       The engine never touches localStorage.
 */
export function createGame(personalBest = 0): GameState {
  const grid = emptyGrid();
  grid[3][3] = 1;
  grid[3][4] = 1;
  return { grid, compute: 0, personalBest };
}

/**
 * Place a Tier-1 neuron and resolve all resulting merges.
 * Pure — returns new state, does not mutate input.
 * Returns input state unchanged for occupied or out-of-bounds cells.
 */
export function placeNeuron(state: GameState, row: number, col: number): GameState {
  return placeNeuronWithSteps(state, row, col).finalState;
}

/**
 * Same as placeNeuron but also returns intermediate grid states for
 * animation. The React layer uses steps[] to play chain merges at 1.2s
 * per step. Skip-to-end is handled by discarding the queue and rendering
 * finalState directly.
 */
export function placeNeuronWithSteps(
  state: GameState,
  row: number,
  col: number,
): PlaceResult {
  // Out-of-bounds or occupied → no-op (return same reference for === check)
  if (
    row < 0 || row >= GRID_SIZE ||
    col < 0 || col >= GRID_SIZE ||
    state.grid[row][col] !== null
  ) {
    return { finalState: state, placedGrid: state.grid, steps: [] };
  }

  // Place Tier-1 neuron
  let grid = state.grid.map(r => [...r]);
  grid[row][col] = 1;
  const placedGrid = grid.map(r => [...r]);  // snapshot before merges

  const steps: MergeStep[] = [];
  let totalPoints = 0;
  let firstPass = true;

  // Resolve merge passes until the board stabilises
  while (true) {
    const groups = findGroups(grid);
    if (groups.length === 0) break;

    const { newGrid, points } = applyGroups(
      grid,
      groups,
      firstPass ? { row, col } : null,
    );

    grid = newGrid;
    totalPoints += points;
    steps.push({ grid: grid.map(r => [...r]), pointsEarned: points });
    firstPass = false;
  }

  const newCompute = state.compute + totalPoints;
  const finalState: GameState = {
    grid,
    compute: newCompute,
    personalBest: Math.max(state.personalBest, newCompute),
  };

  return { finalState, placedGrid, steps };
}

/**
 * Game over when:
 *   (a) no empty cells remain, AND
 *   (b) no adjacent same-tier pairs exist where tier < 7.
 *
 * The tier < 7 exclusion is critical: adjacent AGI neurons cannot merge
 * and must not prevent game-over detection.
 */
export function isGameOver(state: GameState): boolean {
  const { grid } = state;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return false;
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tier = grid[r][c];
      if (tier !== null && tier < MAX_TIER) {
        if (r + 1 < GRID_SIZE && grid[r + 1][c] === tier) return false;
        if (c + 1 < GRID_SIZE && grid[r][c + 1] === tier) return false;
      }
    }
  }

  return true;
}

// ─── Internal helpers ─────────────────────────────────────────────

function emptyGrid(): (number | null)[][] {
  return Array.from({ length: GRID_SIZE }, () => Array<number | null>(GRID_SIZE).fill(null));
}
