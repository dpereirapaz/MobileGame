import './GameOverOverlay.css';

interface GameOverOverlayProps {
  compute: number;
  personalBest: number;
  isNewRecord: boolean;
  onNewGame: () => void;
}

export function GameOverOverlay({ compute, personalBest, isNewRecord, onNewGame }: GameOverOverlayProps) {
  return (
    <div className="gameover" role="dialog" aria-modal="true" aria-label="Training run complete">
      <div className="gameover__inner">
        <div className="gameover__eyebrow">TRAINING HALTED</div>
        <h2 className="gameover__title">Run Complete</h2>
        <div className="gameover__score">
          {compute.toLocaleString()}
          <span className="gameover__flops"> FLOPs</span>
        </div>
        <div className="gameover__best">
          {isNewRecord ? (
            <span className="gameover__best--new">↑ Personal Best: {personalBest.toLocaleString()}</span>
          ) : (
            <span className="gameover__best--prev">Personal Best: {personalBest.toLocaleString()}</span>
          )}
        </div>
        <button className="gameover__btn" onClick={onNewGame}>
          New Training Run
        </button>
      </div>
    </div>
  );
}
