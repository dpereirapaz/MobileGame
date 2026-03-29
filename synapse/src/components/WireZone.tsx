// WireZone — SVG connection area between two adjacent layer grids.
// Wire coords: fromCol → x1 (y=0), toCol → x2 (y=WIRE_HEIGHT).

import { memo } from 'react';
import type { Connection, GameState } from '../game/engine-v2';
import { LAYER_SIZE } from '../game/engine-v2';
import { ActivateButton } from './ActivateButton';
import './WireZone.css';

const CELL_SIZE = 44;
const WIRE_HEIGHT = 40;
const TOTAL_WIDTH = LAYER_SIZE * CELL_SIZE; // 176

function colToX(col: number): number {
  return col * CELL_SIZE + CELL_SIZE / 2;
}

export interface WireZoneProps {
  connections: Connection[];
  zoneFromLayer: number;
  phase: GameState['phase'];
  activeLayer: number;
  canActivate: boolean;
  onActivate: () => void;
  onUndo: () => void;
  connectionCount: number;
  minConnections: number;
}

export const WireZone = memo(function WireZone({
  connections,
  zoneFromLayer,
  phase,
  activeLayer,
  canActivate,
  onActivate,
  onUndo,
  connectionCount,
  minConnections,
}: WireZoneProps) {
  const zoneConns = connections.filter(c => c.fromLayer === zoneFromLayer);

  // Show activate UI when this zone's layer is the active connect-phase source
  const isActiveZone = phase === 'connect' && activeLayer === zoneFromLayer;

  return (
    <div className="wire-zone" style={{ width: TOTAL_WIDTH }}>
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
          const midY = WIRE_HEIGHT / 2;
          const d = `M ${x1} 0 C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${WIRE_HEIGHT}`;
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

      {isActiveZone && (
        <div className="wire-zone__controls">
          {!canActivate ? (
            <span className="wire-zone__count">
              CONNECTIONS: {connectionCount} / {minConnections}
            </span>
          ) : (
            <ActivateButton onClick={onActivate} />
          )}
          {connectionCount > 0 && (
            <button className="wire-zone__undo" onClick={onUndo}>
              UNDO
            </button>
          )}
        </div>
      )}
    </div>
  );
});
