import { memo } from 'react';
import './Cell.css';

const TIER_LABELS: Record<number, string> = {
  1: 'P',   // Perceptron
  2: 'LL',  // Linear Layer
  3: 'HL',  // Hidden Layer
  4: 'AH',  // Attention Head
  5: 'TB',  // Transformer Block
  6: 'FM',  // Foundation Model
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

interface CellProps {
  row: number;
  col: number;
  tier: number | null;
  isShaking: boolean;
  isLocked: boolean;
  isMerging: boolean;
  isMergeTarget: boolean;
  onClick: (row: number, col: number) => void;
}

export const Cell = memo(
  function Cell({ row, col, tier, isShaking, isLocked, isMerging, isMergeTarget, onClick }: CellProps) {
    const cellClass = [
      'cell',
      isShaking && 'cell--shake',
      tier !== null && 'cell--occupied',
      isMerging && 'cell--merging',
      isMergeTarget && 'cell--merge-target',
    ].filter(Boolean).join(' ');

    return (
      <div
        className={cellClass}
        onClick={() => onClick(row, col)}
        role="gridcell"
        aria-label={`Row ${row + 1}, column ${col + 1}, ${tier !== null ? TIER_FULL_NAMES[tier] : 'empty'}`}
      >
        {tier !== null && (
          <div
            className={`neuron tier-${tier}${tier === 7 ? ' neuron--agi' : ''}`}
            style={{ backgroundColor: TIER_COLORS[tier] }}
            title={TIER_FULL_NAMES[tier]}
          >
            <span className="neuron__label">{TIER_LABELS[tier]}</span>
          </div>
        )}
      </div>
    );
  },
  // Custom comparator — only re-render if visual state changes.
  // Ignores row/col (positional, never changes) and onClick (stable ref).
  (prev, next) =>
    prev.tier === next.tier &&
    prev.isShaking === next.isShaking &&
    prev.isLocked === next.isLocked &&
    prev.isMerging === next.isMerging &&
    prev.isMergeTarget === next.isMergeTarget,
);
