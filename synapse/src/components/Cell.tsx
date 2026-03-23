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
  onClick: (row: number, col: number) => void;
}

export function Cell({ row, col, tier, isShaking, isLocked, onClick }: CellProps) {
  return (
    <div
      className={`cell${isShaking ? ' cell--shake' : ''}${tier !== null ? ' cell--occupied' : ''}`}
      onClick={() => onClick(row, col)}
      role="gridcell"
      aria-label={`Row ${row + 1}, column ${col + 1}, ${tier !== null ? TIER_LABELS[tier] : 'empty'}`}
    >
      {tier !== null && (
        <div
          key={`${row}-${col}-${tier}`}
          className={`neuron${tier === 7 ? ' neuron--agi' : ''}`}
          style={{ backgroundColor: TIER_COLORS[tier] }}
        >
          <span className="neuron__label">{TIER_LABELS[tier]}</span>
        </div>
      )}
    </div>
  );
}
