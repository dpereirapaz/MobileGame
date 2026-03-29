// WireZone — SVG connector area displayed between two layer grids.
// Renders drawn connections as arced lines from source column to target column.
// Wire coords: fromCol → x1, toCol → x2, y1=0, y2=40 (var(--wire-zone-height)).
//
// Also hosts the ActivateButton when phase === 'activate' and this zone is active.

import { memo } from 'react';
import type { Connection, GameState } from '../game/engine-v2';
import { LAYER_SIZE } from '../game/engine-v2';
import { ActivateButton } from './ActivateButton';
import './WireZone.css';

const CELL_SIZE = 44; // matches --layer-cell-size
const WIRE_HEIGHT = 40; // matches --wire-zone-height
const TOTAL_WIDTH = LAYER_SIZE * CELL_SIZE; // 176px

/** Map a column index to the horizontal centre of that cell. */
function colToX(col: number): number {
  return col * CELL_SIZE + CELL_SIZE / 2;
}

export interface WireZoneProps {
  /** Connections that cross this wire zone (fromLayer === zoneFromLayer). */
  connections: Connection[];
  /** Index of the "from" layer (0 = Input→Hidden, 1 = Hidden→Output). */
  zoneFromLayer: number;
  phase: GameState['phase'];
  /** canActivate: true when MIN_CONNECTIONS satisfied and phase is 'activate'. */
  canActivate: boolean;
  onActivate: () => void;
}

export const WireZone = memo(function WireZone({
  connections,
  zoneFromLayer,
  phase,
  canActivate,
  onActivate,
}: WireZoneProps) {
  // Only show wires for this zone's connections
  const zoneConns = connections.filter(
    c => c.fromLayer === zoneFromLayer,
  );

  const showActivateButton =
    phase === 'activate' && canActivate;

  return (
    <div className="wire-zone" style={{ width: TOTAL_WIDTH, height: WIRE_HEIGHT }}>
      <svg
        className="wire-zone__svg"
        width={TOTAL_WIDTH}
        height={WIRE_HEIGHT}
        viewBox={`0 0 ${TOTAL_WIDTH} ${WIRE_HEIGHT}`}
        aria-hidden="true"
      >
        {zoneConns.map((conn, i) => {
          const x1 = colToX(conn.fromCol);
          const x2 = colToX(conn.toCol);
          const y1 = 0;
          const y2 = WIRE_HEIGHT;

          // Cubic bezier: control points pull toward centre vertically
          const midY = WIRE_HEIGHT / 2;
          const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

          return (
            <path
              key={i}
              d={d}
              className="wire-zone__wire"
              strokeWidth="1.5"
              fill="none"
            />
          );
        })}
      </svg>

      {showActivateButton && (
        <div className="wire-zone__activate">
          <ActivateButton onClick={onActivate} />
        </div>
      )}
    </div>
  );
});
