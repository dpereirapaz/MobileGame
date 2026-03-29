// Synapse — multi-layer engine (engine-v2)
// Implements the three-layer neural network board: Input → Hidden → Output.
// Spec: multi-layer engine redesign, Steps 1–4.

import { findGroups, applyGroups, MAX_TIER, AGI_BONUS } from './bfs';
import type {
  CellValue,
  LayerGrid,
  LayerState,
  GameState,
  Connection,
  PlaceResult,
  MergeStep,
} from './types';

// Re-export types for consumers who import only from engine-v2.
export type {
  CellValue,
  LayerGrid,
  LayerName,
  LayerStatus,
  GamePhase,
  LayerState,
  GameState,
  Connection,
  PendingCharges,
  MergeStep,
  PlaceResult,
} from './types';

// ─── Constants ────────────────────────────────────────────────────

export const LAYER_SIZE = 4;
export { MAX_TIER, AGI_BONUS };

/** MIN/MAX total connections allowed during Connection Phase. */
export const MIN_CONNECTIONS = 3;
export const MAX_CONNECTIONS = 8;

/** Each source/target cell may participate in at most this many connections. */
export const MAX_CONNECTIONS_PER_SOURCE = 2;
export const MAX_CONNECTIONS_PER_TARGET = 2;

/** Maximum starting tier that can be seeded via a pending charge. */
export const CHARGE_CAP = 3;

/**
 * LAYER_SOLVE_TIERS[i] — the tier at which layer i is considered solved.
 *   Layer 0 (Input):  T4
 *   Layer 1 (Hidden): T5
 *   Layer 2 (Output): T7
 */
export const LAYER_SOLVE_TIERS: [number, number, number] = [4, 5, 7];

// ─── Internal helpers ─────────────────────────────────────────────

/** Create an empty LAYER_SIZE × LAYER_SIZE grid. */
function emptyLayerGrid(): LayerGrid {
  return Array.from({ length: LAYER_SIZE }, () =>
    Array<CellValue>(LAYER_SIZE).fill(null),
  );
}

/** Compute the highest non-null tier on a grid (0 if grid is empty). */
function computeHighestTier(grid: LayerGrid): number {
  let highest = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null && cell > highest) highest = cell;
    }
  }
  return highest;
}

/** Build a LayerState with its solveAtTier pre-set from LAYER_SOLVE_TIERS. */
function makeLayerState(
  index: 0 | 1 | 2,
  grid: LayerGrid,
  status: LayerState['status'],
): LayerState {
  const names: ['input', 'hidden', 'output'] = ['input', 'hidden', 'output'];
  return {
    name: names[index],
    grid,
    status,
    solveAtTier: LAYER_SOLVE_TIERS[index],
    highestTier: computeHighestTier(grid),
  };
}

/**
 * Place two random T1 neurons on distinct empty cells of a 4x4 grid.
 * Uses a seeded approach: picks two cells from the shuffled list of empties.
 */
function seedTwoT1(grid: LayerGrid): LayerGrid {
  const empties: [number, number][] = [];
  for (let r = 0; r < LAYER_SIZE; r++) {
    for (let c = 0; c < LAYER_SIZE; c++) {
      if (grid[r][c] === null) empties.push([r, c]);
    }
  }
  // Fisher-Yates partial shuffle to pick 2
  for (let i = 0; i < 2 && i < empties.length; i++) {
    const j = i + Math.floor(Math.random() * (empties.length - i));
    [empties[i], empties[j]] = [empties[j], empties[i]];
  }
  const result = grid.map(r => [...r]);
  for (let i = 0; i < Math.min(2, empties.length); i++) {
    const [r, c] = empties[i];
    result[r][c] = 1;
  }
  return result;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a fresh GameState.
 * Input layer is active with 2 random T1 neurons.
 * Hidden and Output layers are locked and empty.
 */
export function createGame(personalBest = 0): GameState {
  const inputGrid = seedTwoT1(emptyLayerGrid());
  return {
    layers: [
      makeLayerState(0, inputGrid, 'active'),
      makeLayerState(1, emptyLayerGrid(), 'locked'),
      makeLayerState(2, emptyLayerGrid(), 'locked'),
    ],
    activeLayer: 0,
    phase: 'play',
    connections: [],
    pendingCharges: {},
    compute: 0,
    personalBest,
  };
}

/**
 * Returns true when the layer has achieved its solve tier.
 * Implements: layer.highestTier >= layer.solveAtTier.
 */
export function isLayerSolved(layer: LayerState): boolean {
  return layer.highestTier >= layer.solveAtTier;
}

/**
 * Returns true when the layer is stuck: all LAYER_SIZE² cells are occupied
 * AND no two orthogonally adjacent cells share the same tier (no possible merges).
 *
 * Per architecture decision #1: locked layer → run ends immediately.
 */
export function isLayerGameOver(layer: LayerState): boolean {
  const { grid } = layer;

  // Check all cells occupied
  for (let r = 0; r < LAYER_SIZE; r++) {
    for (let c = 0; c < LAYER_SIZE; c++) {
      if (grid[r][c] === null) return false;
    }
  }

  // Check for any adjacent same-tier pair (excluding T7, which cannot merge)
  for (let r = 0; r < LAYER_SIZE; r++) {
    for (let c = 0; c < LAYER_SIZE; c++) {
      const tier = grid[r][c];
      if (tier !== null && tier < MAX_TIER) {
        if (r + 1 < LAYER_SIZE && grid[r + 1][c] === tier) return false;
        if (c + 1 < LAYER_SIZE && grid[r][c + 1] === tier) return false;
      }
    }
  }

  return true;
}

/**
 * Returns true when the Output layer (layers[2]) has reached T7 (AGI).
 */
export function isGameWon(state: GameState): boolean {
  return state.layers[2].highestTier >= MAX_TIER;
}

/**
 * Place a T1 neuron in the active layer's grid and resolve all BFS merges.
 * Pure — returns new state; does not mutate input.
 *
 * Returns input state unchanged (same reference) when:
 *   - phase !== 'play'
 *   - cell is occupied or out-of-bounds
 *
 * After placement + merges:
 *   1. Updates highestTier on the active layer.
 *   2. If the Output layer (index 2) is now solved → phase 'won'.
 *   3. Else if the active layer is solved → phase 'connect' (Connection Phase).
 *   4. Else if the active layer is game-over → phase 'gameover'.
 *   (Solved always beats game-over per architecture decision #1/#4.)
 */
export function placeNeuronWithSteps(
  state: GameState,
  row: number,
  col: number,
): PlaceResult {
  if (state.phase !== 'play') {
    return { finalState: state, placedGrid: state.layers[state.activeLayer].grid, steps: [] };
  }

  const activeIdx = state.activeLayer;
  const activeLayer = state.layers[activeIdx];

  // Out-of-bounds or occupied → no-op
  if (
    row < 0 || row >= LAYER_SIZE ||
    col < 0 || col >= LAYER_SIZE ||
    activeLayer.grid[row][col] !== null
  ) {
    return { finalState: state, placedGrid: activeLayer.grid, steps: [] };
  }

  // Place T1 neuron
  let grid: LayerGrid = activeLayer.grid.map(r => [...r]);
  grid[row][col] = 1;
  const placedGrid: LayerGrid = grid.map(r => [...r]);

  const steps: MergeStep[] = [];
  let totalPoints = 0;
  let firstPass = true;

  // Resolve merge passes until the board stabilises (using bfs.ts, LAYER_SIZE grid)
  while (true) {
    const groups = findGroups(grid, LAYER_SIZE);
    if (groups.length === 0) break;

    const { newGrid, points } = applyGroups(
      grid,
      groups,
      firstPass ? { row, col } : null,
    );

    grid = newGrid as LayerGrid;
    totalPoints += points;
    steps.push({ grid: grid.map(r => [...r]), pointsEarned: points });
    firstPass = false;
  }

  const newCompute = state.compute + totalPoints;
  const newHighestTier = computeHighestTier(grid);

  const updatedLayer: LayerState = {
    ...activeLayer,
    grid,
    highestTier: newHighestTier,
  };

  // Rebuild layers array immutably
  const newLayers = state.layers.map((l, i) =>
    i === activeIdx ? updatedLayer : l,
  ) as GameState['layers'];

  // Determine new phase.
  // Special path: Output layer solved → immediate win.
  // For other layers solved → Connection Phase.
  // Solved takes priority over game-over.
  let newPhase = state.phase;

  if (activeIdx === 2 && isLayerSolved(updatedLayer)) {
    // Output solved → won
    newPhase = 'won';
  } else if (isLayerSolved(updatedLayer)) {
    // Input or Hidden solved → Connection Phase
    newPhase = 'connect';
  } else if (isLayerGameOver(updatedLayer)) {
    newPhase = 'gameover';
  }

  const finalState: GameState = {
    ...state,
    layers: newLayers,
    phase: newPhase,
    compute: newCompute,
    personalBest: Math.max(state.personalBest, newCompute),
  };

  return { finalState, placedGrid, steps };
}

/**
 * Add a connection during Connection Phase.
 * Validates:
 *   - phase === 'connect'
 *   - fromLayer === activeLayer
 *   - toLayer === activeLayer + 1
 *   - source cell is non-null in layers[fromLayer].grid
 *   - total connections < MAX_CONNECTIONS
 *   - source has not reached MAX_CONNECTIONS_PER_SOURCE
 *   - target has not reached MAX_CONNECTIONS_PER_TARGET
 *
 * Returns state unchanged if any validation fails.
 */
export function addConnection(state: GameState, conn: Connection): GameState {
  if (state.phase !== 'connect') return state;
  if (conn.fromLayer !== state.activeLayer) return state;
  if (conn.toLayer !== state.activeLayer + 1) return state;

  const sourceLayer = state.layers[conn.fromLayer];
  if (
    conn.fromRow < 0 || conn.fromRow >= LAYER_SIZE ||
    conn.fromCol < 0 || conn.fromCol >= LAYER_SIZE ||
    sourceLayer.grid[conn.fromRow][conn.fromCol] === null
  ) return state;

  if (state.connections.length >= MAX_CONNECTIONS) return state;

  // Count existing connections from this source
  const fromCount = state.connections.filter(
    c => c.fromLayer === conn.fromLayer &&
         c.fromRow === conn.fromRow &&
         c.fromCol === conn.fromCol,
  ).length;
  if (fromCount >= MAX_CONNECTIONS_PER_SOURCE) return state;

  // Count existing connections to this target
  const toCount = state.connections.filter(
    c => c.toLayer === conn.toLayer &&
         c.toRow === conn.toRow &&
         c.toCol === conn.toCol,
  ).length;
  if (toCount >= MAX_CONNECTIONS_PER_TARGET) return state;

  return {
    ...state,
    connections: [...state.connections, conn],
  };
}

/**
 * Remove a matching connection (matched by all 6 fields).
 * Returns state unchanged if not found.
 */
export function removeConnection(state: GameState, conn: Connection): GameState {
  const idx = state.connections.findIndex(
    c =>
      c.fromLayer === conn.fromLayer &&
      c.fromRow   === conn.fromRow   &&
      c.fromCol   === conn.fromCol   &&
      c.toLayer   === conn.toLayer   &&
      c.toRow     === conn.toRow     &&
      c.toCol     === conn.toCol,
  );
  if (idx === -1) return state;

  const connections = [
    ...state.connections.slice(0, idx),
    ...state.connections.slice(idx + 1),
  ];
  return { ...state, connections };
}

/**
 * Determine the charge value produced by a source neuron of a given tier.
 *   null    → 0
 *   T1–T4   → 1
 *   T5–T6   → 2
 *   T7      → 3
 */
export function chargeForTier(sourceTier: CellValue): number {
  if (sourceTier === null) return 0;
  if (sourceTier <= 4)     return 1;
  if (sourceTier <= 6)     return 2;
  return 3; // T7
}

/**
 * Commit the current connections and compute pendingCharges.
 *
 * Rules:
 *   - phase must be 'connect'
 *   - connections.length must be >= MIN_CONNECTIONS
 *   - For each connection, charge = chargeForTier(source tier)
 *   - Multiple connections pointing to the same target → take MAX charge (not sum)
 *   - Cap each charge at CHARGE_CAP
 *   - Transition phase → 'activate'
 *
 * Returns state unchanged if preconditions fail.
 */
export function commitConnections(state: GameState): GameState {
  if (state.phase !== 'connect') return state;
  if (state.connections.length < MIN_CONNECTIONS) return state;

  const pendingCharges: Record<string, number> = {};

  for (const conn of state.connections) {
    const sourceGrid = state.layers[conn.fromLayer].grid;
    const sourceTier = sourceGrid[conn.fromRow]?.[conn.fromCol] ?? null;
    const charge = Math.min(chargeForTier(sourceTier), CHARGE_CAP);

    const key = `${conn.toLayer}:${conn.toRow}:${conn.toCol}`;
    // Multiple connections to same target → take MAX
    if (pendingCharges[key] === undefined || charge > pendingCharges[key]) {
      pendingCharges[key] = charge;
    }
  }

  return {
    ...state,
    pendingCharges,
    phase: 'activate',
  };
}

/**
 * Activate the next layer: seed it with pendingCharges, advance activeLayer,
 * and transition phase back to 'play'.
 *
 * - phase must be 'activate'
 * - Seeds next layer's grid: places a neuron of tier = charge value at each
 *   keyed cell (key format: "layerIdx:row:col").
 * - Sets current layer status → 'connected'
 * - Sets next layer status → 'active'
 * - Advances activeLayer by 1
 * - Clears pendingCharges and connections
 * - Transitions phase → 'play'
 *
 * Special: activeLayer === 2 (Output) should never reach 'activate' — Output
 * solve transitions directly to 'won'. This function returns state unchanged
 * in that case.
 */
export function activateNextLayer(state: GameState): GameState {
  if (state.phase !== 'activate') return state;
  if (state.activeLayer >= 2) return state; // Output has no next layer

  const currentIdx = state.activeLayer;
  const nextIdx = currentIdx + 1;

  // Build seeded grid for the next layer
  let nextGrid: LayerGrid = emptyLayerGrid();

  for (const [key, charge] of Object.entries(state.pendingCharges)) {
    const parts = key.split(':');
    const layerIdx = parseInt(parts[0], 10);
    const r = parseInt(parts[1], 10);
    const c = parseInt(parts[2], 10);
    if (
      layerIdx === nextIdx &&
      r >= 0 && r < LAYER_SIZE &&
      c >= 0 && c < LAYER_SIZE &&
      charge > 0
    ) {
      nextGrid[r][c] = charge;
    }
  }

  const newLayers = state.layers.map((layer, i) => {
    if (i === currentIdx) {
      return { ...layer, status: 'connected' as const };
    }
    if (i === nextIdx) {
      return {
        ...layer,
        grid: nextGrid,
        status: 'active' as const,
        highestTier: computeHighestTier(nextGrid),
      };
    }
    return layer;
  }) as GameState['layers'];

  return {
    ...state,
    layers: newLayers,
    activeLayer: nextIdx,
    phase: 'play',
    connections: [],
    pendingCharges: {},
  };
}
