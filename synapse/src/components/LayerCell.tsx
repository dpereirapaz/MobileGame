import { memo } from 'react';
import './LayerCell.css';

const TIER_LABELS: Record<number, string> = {
  1: 'P',
  2: 'LL',
  3: 'HL',
  4: 'AH',
  5: 'TB',
  6: 'FM',
  7: 'AGI',
};

const TIER_FULL_NAMES: Record<number, string> = {
  1: 'Perceptron',
  2: 'Linear Layer',
  3: 'Hidden Layer',
  4: 'Attention Head',
  5: 'Transformer Block',
  6: 'Foundation Model',
  7: 'AGI — Artificial General Intelligence',
};

const TIER_COLORS: Record<number, string> = {
  1: 'var(--n-language)',
  2: 'var(--n-vision)',
  3: 'var(--n-reasoning)',
  4: 'var(--n-memory)',
  5: 'var(--n-planning)',
  6: 'var(--n-creativity)',
  7: 'var(--accent)',
};

export interface LayerCellProps {
  row: number;
  col: number;
  tier: number | null;
  isShaking: boolean;
  isLocked: boolean;
  isMerging: boolean;
  isMergeTarget: boolean;
  /** Connect phase: this cell IS the currently selected source (strong ring) */
  isConnPhaseSource: boolean;
  /** Connect phase: this cell is an occupied neuron in the source layer (selectable indicator) */
  isConnPhaseSelectable: boolean;
  /** Connect phase: this cell is a valid destination target (faint ring when source selected) */
  isConnPhaseTarget: boolean;
  onClick: (row: number, col: number) => void;
}

export const LayerCell = memo(
  function LayerCell({
    row,
    col,
    tier,
    isShaking,
    isLocked,
    isMerging,
    isMergeTarget,
    isConnPhaseSource,
    isConnPhaseSelectable,
    isConnPhaseTarget,
    onClick,
  }: LayerCellProps) {
    const cellClass = [
      'layer-cell',
      isShaking && 'layer-cell--shake',
      tier !== null && 'layer-cell--occupied',
      isMerging && 'layer-cell--merging',
      isMergeTarget && 'layer-cell--merge-target',
      isConnPhaseSource && 'layer-cell--conn-source',
      isConnPhaseSelectable && 'layer-cell--conn-selectable',
      isConnPhaseTarget && 'layer-cell--conn-target',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={cellClass}
        onClick={() => !isLocked && onClick(row, col)}
        role="gridcell"
        aria-label={`Row ${row + 1}, column ${col + 1}, ${
          tier !== null ? TIER_FULL_NAMES[tier] : 'empty'
        }`}
        aria-selected={isConnPhaseSource || undefined}
      >
        {tier !== null && (
          <div
            className={`layer-neuron tier-${tier}${tier === 7 ? ' layer-neuron--agi' : ''}`}
            style={{ backgroundColor: TIER_COLORS[tier] }}
            title={TIER_FULL_NAMES[tier]}
          >
            <span className="layer-neuron__label">{TIER_LABELS[tier]}</span>
          </div>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.tier === next.tier &&
    prev.isShaking === next.isShaking &&
    prev.isLocked === next.isLocked &&
    prev.isMerging === next.isMerging &&
    prev.isMergeTarget === next.isMergeTarget &&
    prev.isConnPhaseSource === next.isConnPhaseSource &&
    prev.isConnPhaseSelectable === next.isConnPhaseSelectable &&
    prev.isConnPhaseTarget === next.isConnPhaseTarget,
);
