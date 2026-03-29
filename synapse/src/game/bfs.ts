// Synapse — BFS group-finding and group-application helpers.
// Extracted from engine.ts so engine-v2.ts can share the same logic
// without duplicating code.

export const GRID_SIZE = 8;
export const MAX_TIER = 7;
export const AGI_BONUS = 500;

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

export interface Group {
  cells: { row: number; col: number }[];
  tier: number;
}

/**
 * BFS in row-major order (top-to-bottom, left-to-right).
 * Finds all contiguous groups of 3+ same-tier neurons, excluding tier 7.
 * Each cell belongs to exactly one group.
 *
 * @param grid     - Any NxM grid of CellValue (number | null).
 * @param gridSize - The side length of the grid (default: GRID_SIZE = 8).
 */
export function findGroups(
  grid: (number | null)[][],
  gridSize: number = GRID_SIZE,
): Group[] {
  const visited: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false),
  );
  const groups: Group[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
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
            nr >= 0 && nr < gridSize &&
            nc >= 0 && nc < gridSize &&
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
export function applyGroups(
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
