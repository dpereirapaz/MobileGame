import { Cell } from './Cell';
import './Grid.css';

interface GridProps {
  grid: (number | null)[][];
  isLocked: boolean;
  shakingCell: { row: number; col: number } | null;
  mergingCells: Set<string>;
  mergeTargetCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function Grid({ grid, isLocked, shakingCell, mergingCells, mergeTargetCells, onCellClick }: GridProps) {
  return (
    <div
      className={`grid${isLocked ? ' grid--locked' : ''}`}
      role="grid"
      aria-label="Synapse game board"
    >
      {grid.map((row, r) =>
        row.map((tier, c) => (
          <Cell
            key={`${r}-${c}`}
            row={r}
            col={c}
            tier={tier}
            isShaking={shakingCell?.row === r && shakingCell?.col === c}
            isLocked={isLocked}
            isMerging={mergingCells.has(`${r}-${c}`)}
            isMergeTarget={mergeTargetCells.has(`${r}-${c}`)}
            onClick={onCellClick}
          />
        )),
      )}
    </div>
  );
}
