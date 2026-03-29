// LayerHeader — label and status indicator for a single layer panel.

import { memo } from 'react';
import type { LayerState } from '../game/engine-v2';
import './LayerHeader.css';

const LAYER_LABELS: Record<string, string> = {
  input:  'INPUT',
  hidden: 'HIDDEN',
  output: 'OUTPUT',
};

export interface LayerHeaderProps {
  layer: LayerState;
  isActive: boolean;
  isConnectPhase?: boolean;
  connectionCount?: number;
  minConnections?: number;
}

export const LayerHeader = memo(function LayerHeader({
  layer,
  isActive,
  isConnectPhase = false,
  connectionCount = 0,
  minConnections = 3,
}: LayerHeaderProps) {
  const wrapperClass = [
    'layer-header',
    isActive && 'layer-header--active',
    isConnectPhase && 'layer-header--connect',
    `layer-header--${layer.status}`,
  ].filter(Boolean).join(' ');

  const goalLabel =
    layer.status === 'locked'   ? '🔒' :
    layer.status === 'solved' || layer.status === 'connected' ? 'SOLVED ✓' :
    `GOAL: T${layer.solveAtTier}`;

  return (
    <div className={wrapperClass} role="region" aria-label={`${LAYER_LABELS[layer.name] ?? layer.name} layer`}>
      <div className="layer-header__eyebrow">
        {layer.status === 'locked'    ? `LOCKED — SOLVE LAYER ABOVE FIRST` :
         layer.status === 'connected' ? 'SOLVED — CONNECTED' :
         layer.status === 'solved'    ? 'SOLVE CONDITION MET' :
         'ACTIVE LAYER'}
      </div>
      <div className="layer-header__row">
        <span className="layer-header__name">
          {isConnectPhase ? 'CONNECTION PHASE' : (LAYER_LABELS[layer.name] ?? layer.name.toUpperCase())}
        </span>
        <span className="layer-header__goal" aria-label={`Layer goal: ${goalLabel}`}>
          {goalLabel}
        </span>
      </div>
      {isActive && !isConnectPhase && layer.highestTier > 0 && (
        <div className="layer-header__progress">
          BEST: T{layer.highestTier} → T{layer.solveAtTier}
        </div>
      )}
      {isConnectPhase && (
        <div className="layer-header__conn-count" aria-live="polite">
          {connectionCount} / {minConnections} CONNECTIONS
        </div>
      )}
    </div>
  );
});
