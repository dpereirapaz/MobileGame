// Synapse — pure game engine (zero DOM/React dependencies)
// Reusable in Phase 1 React Native build.

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

export const GRID_SIZE = 8;
export const MAX_TIER = 7;
export const AGI_BONUS = 500;
const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

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

interface Group {
  cells: { row: number; col: number }[];
  tier: number;
}

/**
 * BFS in row-major order (top-to-bottom, left-to-right).
 * Finds all contiguous groups of 3+ same-tier neurons, excluding tier 7.
 * Each cell belongs to exactly one group.
 */
function findGroups(grid: (number | null)[][]): Group[] {
  const visited: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false),
  );
  const groups: Group[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tier = grid[r][c];
      // Skip: empty, already visited, or AGI (tier 7 never merges)
      if (tier === null || visited[r][c] || tier === MAX_TIER) continue;

      const cells: { row: number; col: number }[] = [];
      const queue: [number, number][] = [[r, c]];
      visited[r][c] = true;

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        cells.push({ row: cr, col: cc });

        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (
            nr >= 0 && nr < GRID_SIZE &&
            nc >= 0 && nc < GRID_SIZE &&
            !visited[nr][nc] &&
            grid[nr][nc] === tier
          ) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }

      if (cells.length >= 3) {
        groups.push({ cells, tier });
      }
    }
  }

  return groups;
}

/**
 * Apply all groups simultaneously (groups are disjoint by construction).
 *
 * Upgrade position rules:
 * - If placedPos is in the group → upgrade lands at placedPos.
 * - Otherwise → upgrade lands at cells[0] (first cell in BFS / row-major order).
 *
 * Scoring:
 * - Each merge awards tier_output points (the tier of the newly created neuron).
 * - Exception: AGI (tier 7) creation awards +500 (override).
 */
function applyGroups(
  grid: (number | null)[][],
  groups: Group[],
  placedPos: { row: number; col: number } | null,
): { newGrid: (number | null)[][]; points: number } {
  const newGrid = grid.map(r => [...r]);
  let points = 0;

  for (const group of groups) {
    // Remove all cells in the group
    for (const { row, col } of group.cells) {
      newGrid[row][col] = null;
    }

    const newTier = group.tier + 1;

    // Determine upgrade position
    let targetRow: number;
    let targetCol: number;

    if (
      placedPos !== null &&
      group.cells.some(c => c.row === placedPos.row && c.col === placedPos.col)
    ) {
      targetRow = placedPos.row;
      targetCol = placedPos.col;
    } else {
      // First cell in BFS (row-major order)
      targetRow = group.cells[0].row;
      targetCol = group.cells[0].col;
    }

    newGrid[targetRow][targetCol] = newTier;

    // Score: AGI override or tier value
    points += newTier === MAX_TIER ? AGI_BONUS : newTier;
  }

  return { newGrid, points };
}
