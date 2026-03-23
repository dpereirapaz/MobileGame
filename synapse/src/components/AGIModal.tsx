import './AGIModal.css';

interface AGIModalProps {
  compute: number;
  personalBest: number;
  isNewRecord: boolean;
  onClose: () => void;
}

export function AGIModal({ compute, personalBest, isNewRecord, onClose }: AGIModalProps) {
  return (
    <div className="agi-modal-backdrop" onClick={onClose}>
      <div className="agi-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="AGI achieved">
        <div className="agi-modal__eyebrow">ARTIFICIAL GENERAL</div>
        <div className="agi-modal__tag">AGI</div>
        <h2 className="agi-modal__title">Intelligence Achieved</h2>
        <div className="agi-modal__compute">{compute.toLocaleString()}</div>
        <div className="agi-modal__record">
          {isNewRecord ? (
            <span className="agi-modal__record--new">↑ New Record</span>
          ) : (
            <span className="agi-modal__record--prev">was {personalBest.toLocaleString()}</span>
          )}
        </div>
        <button className="agi-modal__btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
