// LayerSection — wraps LayerHeader + LayerGrid for one layer.
// Handles locked-state dimming and connect-phase role (source vs target).

import { memo } from 'react';
import { LayerHeader } from './LayerHeader';
import { LayerGrid } from './LayerGrid';
import type {
  LayerState,
  LayerGrid as LayerGridData,
  Connection,
  PendingCharges,
  GamePhase,
} from '../game/engine-v2';
import './LayerSection.css';

export interface LayerSectionProps {
  layer: LayerState;
  layerIndex: number;
  phase: GamePhase;
  displayGrid: LayerGridData;
  selectedSource: { row: number; col: number } | null;
  connections: Connection[];
  shakingCell: { row: number; col: number } | null;
  mergingCells: Set<string>;
  mergeTargetCells: Set<string>;
  pendingCharges: PendingCharges;
  connectionCount: number;
  minConnections: number;
  onCellClick: (row: number, col: number) => void;
}

export const LayerSection = memo(function LayerSection({
  layer,
  layerIndex,
  phase,
  displayGrid,
  selectedSource,
  connections,
  shakingCell,
  mergingCells,
  mergeTargetCells,
  connectionCount,
  minConnections,
  onCellClick,
}: LayerSectionProps) {
  // During connect phase: the solved layer is the source, the next locked one is the target
  const isSourceLayer = layer.status === 'solved' && phase === 'connect';
  const isTargetLayer =
    layer.status === 'locked' && phase === 'connect' && layerIndex > 0;

  // Grid is interactive only when active (play) or participating in connect phase
  const isLocked =
    layer.status === 'locked' ||
    (phase === 'connect' && !isSourceLayer && !isTargetLayer) ||
    (phase !== 'play' && phase !== 'connect');

  const sectionClass = [
    'layer-section',
    `layer-section--${layer.status}`,
    phase === 'connect' && isSourceLayer && 'layer-section--conn-source',
    phase === 'connect' && isTargetLayer && 'layer-section--conn-target',
  ].filter(Boolean).join(' ');

  return (
    <div className={sectionClass}>
      <LayerHeader
        layer={layer}
        isActive={phase === 'connect' && isSourceLayer}
        connectionCount={connectionCount}
        minConnections={minConnections}
        isConnectPhase={phase === 'connect' && isSourceLayer}
      />
      <LayerGrid
        layerIndex={layerIndex}
        grid={displayGrid}
        isLocked={isLocked}
        shakingCell={shakingCell}
        mergingCells={mergingCells}
        mergeTargetCells={mergeTargetCells}
        connSource={isSourceLayer ? selectedSource : null}
        connections={connections}
        isSourceLayer={isSourceLayer}
        isTargetLayer={isTargetLayer}
        onCellClick={onCellClick}
      />
    </div>
  );
});
