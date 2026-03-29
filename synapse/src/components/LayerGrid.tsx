// LayerGrid — 4×4 grid for a single layer of the multi-layer board.
// Renders LayerCell components and manages connect-phase selection state.

import { memo } from 'react';
import { LayerCell } from './LayerCell';
import type { LayerGrid as LayerGridData, Connection } from '../game/engine-v2';
import './LayerGrid.css';

export interface LayerGridProps {
  layerIndex: number;
  grid: LayerGridData;
  isLocked: boolean;
  shakingCell: { row: number; col: number } | null;
  mergingCells: Set<string>;
  mergeTargetCells: Set<string>;
  /** Connect phase: which source cell is currently selected (row, col) */
  connSource: { row: number; col: number } | null;
  /** Connect phase: existing connections originating from this layer */
  connections: Connection[];
  /** Connect phase: is this layer the source layer? */
  isSourceLayer: boolean;
  /** Connect phase: is this layer the target layer? */
  isTargetLayer: boolean;
  onCellClick: (layerIndex: number, row: number, col: number) => void;
}

export const LayerGrid = memo(
  function LayerGrid({
    layerIndex,
    grid,
    isLocked,
    shakingCell,
    mergingCells,
    mergeTargetCells,
    connSource,
    connections,
    isSourceLayer,
    isTargetLayer,
    onCellClick,
  }: LayerGridProps) {
    function handleCellClick(row: number, col: number) {
      onCellClick(layerIndex, row, col);
    }

    return (
      <div
        className={`layer-grid${isLocked ? ' layer-grid--locked' : ''}`}
        role="grid"
        aria-label={`Layer ${layerIndex + 1} game board`}
      >
        {grid.map((rowData, r) =>
          rowData.map((tier, c) => {
            const isConnPhaseSource =
              isSourceLayer &&
              connSource !== null &&
              connSource.row === r &&
              connSource.col === c;

            // Selectable: occupied neuron in source layer, not already the selected source
            const isConnPhaseSelectable =
              isSourceLayer &&
              tier !== null &&
              !isConnPhaseSource;

            // Target: any cell in the target layer when a source is selected
            const isConnPhaseTarget =
              isTargetLayer &&
              connSource !== null;

            return (
              <LayerCell
                key={`${r}-${c}`}
                row={r}
                col={c}
                tier={tier}
                isShaking={
                  shakingCell?.row === r && shakingCell?.col === c
                }
                isLocked={isLocked}
                isMerging={mergingCells.has(`${r}-${c}`)}
                isMergeTarget={mergeTargetCells.has(`${r}-${c}`)}
                isConnPhaseSource={isConnPhaseSource}
                isConnPhaseSelectable={isConnPhaseSelectable}
                isConnPhaseTarget={isConnPhaseTarget}
                onClick={handleCellClick}
              />
            );
          }),
        )}
      </div>
    );
  },
);
