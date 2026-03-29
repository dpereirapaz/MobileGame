// ActivateButton — fires activateNextLayer when clicked.
// Shown in the WireZone between layers when phase === 'activate'.

import { memo } from 'react';
import './ActivateButton.css';

export interface ActivateButtonProps {
  onClick: () => void;
}

export const ActivateButton = memo(function ActivateButton({
  onClick,
}: ActivateButtonProps) {
  return (
    <button
      className="activate-btn"
      onClick={onClick}
      aria-label="Activate next layer"
      title="Activate next layer"
    >
      <span className="activate-btn__label">ACTIVATE</span>
      <span className="activate-btn__arrow" aria-hidden="true">&#x25BC;</span>
    </button>
  );
});
