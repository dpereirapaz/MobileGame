import './TierChain.css';

const TIERS = [
  { label: 'P',   color: 'var(--n-language)',   name: 'Perceptron' },
  { label: 'LL',  color: 'var(--n-vision)',      name: 'Linear Layer' },
  { label: 'HL',  color: 'var(--n-reasoning)',   name: 'Hidden Layer' },
  { label: 'AH',  color: 'var(--n-memory)',      name: 'Attention Head' },
  { label: 'TB',  color: 'var(--n-planning)',    name: 'Transformer Block' },
  { label: 'FM',  color: 'var(--n-creativity)',  name: 'Foundation Model' },
  { label: 'AGI', color: 'var(--accent)',        name: 'AGI' },
] as const;

export function TierChain() {
  return (
    <div className="tier-chain" aria-label="Tier progression: merge same-tier neurons to advance">
      {TIERS.map((t, i) => (
        <span key={t.label} className="tier-chain__node">
          <span
            className="tier-chain__label"
            style={{ color: t.color }}
            title={t.name}
          >
            {t.label}
          </span>
          {i < TIERS.length - 1 && (
            <span className="tier-chain__sep" aria-hidden="true">›</span>
          )}
        </span>
      ))}
    </div>
  );
}
