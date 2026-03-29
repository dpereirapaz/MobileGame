// Synapse — shared type definitions for the multi-layer engine (engine-v2).
// These types describe the three-layer neural network board: Input, Hidden, Output.

export type CellValue = number | null;
export type LayerGrid = CellValue[][];
export type LayerName = 'input' | 'hidden' | 'output';
export type LayerStatus = 'locked' | 'active' | 'solved' | 'connected';
export type GamePhase = 'play' | 'connect' | 'activate' | 'won' | 'gameover';

export interface LayerState {
  name: LayerName;
  grid: LayerGrid;
  status: LayerStatus;
  solveAtTier: number;  // 4 for Input, 5 for Hidden, 7 for Output
  highestTier: number;  // cached — max tier currently on this layer's grid
}

export interface Connection {
  fromLayer: number;
  fromRow: number;
  fromCol: number;
  toLayer: number;
  toRow: number;
  toCol: number;
}

export type PendingCharges = Record<string, number>;  // key: "layerIdx:row:col"

export interface GameState {
  layers: [LayerState, LayerState, LayerState];
  activeLayer: number;
  phase: GamePhase;
  connections: Connection[];
  pendingCharges: PendingCharges;
  compute: number;
  personalBest: number;
}

export interface MergeStep {
  grid: LayerGrid;
  pointsEarned: number;
}

export interface PlaceResult {
  finalState: GameState;
  placedGrid: LayerGrid;
  steps: MergeStep[];
}
