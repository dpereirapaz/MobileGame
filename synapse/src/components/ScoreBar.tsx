import { useEffect, useRef, useState } from 'react';
import './ScoreBar.css';

interface ScoreBarProps {
  compute: number;
  personalBest: number;
  onNewGame: () => void;
}

export function ScoreBar({ compute, personalBest, onNewGame }: ScoreBarProps) {
  const [flash, setFlash] = useState(false);
  const prevComputeRef = useRef(compute);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (compute > prevComputeRef.current) {
      // Reset animation by briefly removing class, then re-adding
      setFlash(false);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      const raf = requestAnimationFrame(() => {
        setFlash(true);
        flashTimerRef.current = setTimeout(() => setFlash(false), 280);
      });
      return () => {
        cancelAnimationFrame(raf);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      };
    }
    prevComputeRef.current = compute;
  }, [compute]);

  return (
    <header className="score-bar">
      <div className="score-bar__title">SYNAPSE</div>
      <div className="score-bar__compute" aria-live="polite" aria-label="Current compute">
        <span className="score-bar__compute-label">COMPUTE</span>
        <span className={`score-bar__compute-value${flash ? ' score-bar__compute-value--flash' : ''}`}>
          {compute.toLocaleString()}
        </span>
      </div>
      <div className="score-bar__best">
        <span className="score-bar__best-label">BEST</span>
        <span className="score-bar__best-value">
          {personalBest.toLocaleString()}
        </span>
      </div>
      <button
        className="score-bar__restart"
        onClick={onNewGame}
        aria-label="New training run"
        title="New training run"
      >
        ↺
      </button>
    </header>
  );
}
