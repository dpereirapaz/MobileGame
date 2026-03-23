import './ScoreBar.css';

interface ScoreBarProps {
  compute: number;
  personalBest: number;
}

export function ScoreBar({ compute, personalBest }: ScoreBarProps) {
  return (
    <header className="score-bar">
      <div className="score-bar__title">SYNAPSE</div>
      <div className="score-bar__compute" aria-live="polite" aria-label="Current compute">
        <span className="score-bar__compute-label">COMPUTE</span>
        <span className="score-bar__compute-value">
          {compute.toLocaleString()}
        </span>
      </div>
      <div className="score-bar__best">
        <span className="score-bar__best-label">BEST</span>
        <span className="score-bar__best-value">
          {personalBest.toLocaleString()}
        </span>
      </div>
    </header>
  );
}
