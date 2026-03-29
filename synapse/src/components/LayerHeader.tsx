// LayerHeader — label and status indicator for a single layer panel.
// Height expands to fit content — not clipped.

import { memo } from 'react';
import type { LayerState } from '../game/engine-v2';
import './LayerHeader.css';

const LAYER_LABELS: Record<string, string> = {
  input:  'INPUT',
  hidden: 'HIDDEN',
  output: 'OUTPUT',
};

const SOLVE_TIER_LABELS: Record<number, string> = {
  4: 'T4',
  5: 'T5',
  7: 'T7',
};

export interface LayerHeaderProps {
  layer: LayerState;
  isActive: boolean;
}

export const LayerHeader = memo(function LayerHeader({
  layer,
  isActive,
}: LayerHeaderProps) {
  const statusClass = [
    'layer-header__status',
    `layer-header__status--${layer.status}`,
    isActive && 'layer-header__status--active',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClass = [
    'layer-header',
    isActive && 'layer-header--active',
    layer.status === 'solved' && 'layer-header--solved',
    layer.status === 'connected' && 'layer-header--connected',
    layer.status === 'locked' && 'layer-header--locked',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <span className="layer-header__name">
        {LAYER_LABELS[layer.name] ?? layer.name.toUpperCase()}
      </span>
      <span className={statusClass} aria-label={`Layer status: ${layer.status}`}>
        {layer.status === 'locked'
          ? 'LOCKED'
          : layer.status === 'connected'
            ? 'CONNECTED'
            : layer.status === 'solved'
              ? 'SOLVED'
              : `GOAL: ${SOLVE_TIER_LABELS[layer.solveAtTier] ?? `T${layer.solveAtTier}`}`}
      </span>
    </div>
  );
});
