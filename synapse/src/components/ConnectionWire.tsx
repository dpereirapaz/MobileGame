// ConnectionWire — a single SVG bezier path drawn between two cells.

import { memo } from 'react';
import './ConnectionWire.css';

export interface ConnectionWireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isNew?: boolean;    // draw-in animation on mount
  isGhost?: boolean;  // faded persistent wire (after phase ends)
  isActive?: boolean; // dashed accent colour (during connect phase)
}

export const ConnectionWire = memo(function ConnectionWire({
  x1, y1, x2, y2,
  isNew = false,
  isGhost = false,
  isActive = false,
}: ConnectionWireProps) {
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  const cls = [
    'wire',
    isNew && 'wire--new',
    isGhost && 'wire--ghost',
    isActive && 'wire--active',
  ].filter(Boolean).join(' ');

  return (
    <path
      d={d}
      className={cls}
      pathLength="1"
      fill="none"
      aria-hidden="true"
    />
  );
});
