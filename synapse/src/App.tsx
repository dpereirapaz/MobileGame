import { useEffect, useRef, useState } from 'react';
import {
  createGame,
  placeNeuronWithSteps,
  isGameOver,
  type GameState,
} from './game/engine';
import { Grid } from './components/Grid';
import { ScoreBar } from './components/ScoreBar';
import { AGIModal } from './components/AGIModal';
import { GameOverOverlay } from './components/GameOverOverlay';
import './App.css';

// ─── localStorage helpers (all access in try/catch per spec) ───────

function readPersonalBest(): number {
  try {
    return parseInt(localStorage.getItem('personalBest') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function savePersonalBest(value: number): void {
  try {
    localStorage.setItem('personalBest', String(value));
  } catch {
    // Silent failure — toast would go here in Phase 1
  }
}

function hasNewAGI(
  before: (number | null)[][],
  after: (number | null)[][],
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (before[r][c] !== 7 && after[r][c] === 7) return true;
    }
  }
  return false;
}

// ─── Animation state ───────────────────────────────────────────────

interface AnimState {
  queue: (number | null)[][][];  // intermediate grids to show, front = current
  prevGrid: (number | null)[][];  // grid shown in the previous frame (for cell diffs)
}

// ─── App ───────────────────────────────────────────────────────────

export function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(readPersonalBest()),
  );

  const [animState, setAnimState] = useState<AnimState>({
    queue: [],
    prevGrid: gameState.grid,
  });

  const [showAGIModal, setShowAGIModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shakingCell, setShakingCell] = useState<{ row: number; col: number } | null>(null);
  // Track pre-click grid to detect new AGI neurons after animation completes
  const preClickGridRef = useRef<(number | null)[][]>(gameState.grid);
  // Pending post-animation effects (set on click, consumed when queue empties)
  const pendingRef = useRef<GameState | null>(null);

  const isAnimating = animState.queue.length > 0;
  const displayGrid = isAnimating ? animState.queue[0] : gameState.grid;

  // Advance animation queue at 1.2s per step (DESIGN.md merge duration)
  useEffect(() => {
    if (animState.queue.length === 0) return;
    const timer = setTimeout(() => {
      setAnimState(prev => ({
        prevGrid: prev.queue[0],
        queue: prev.queue.slice(1),
      }));
    }, 1200);
    return () => clearTimeout(timer);
  }, [animState.queue.length]);

  // When queue empties: fire post-animation effects (AGI modal, game-over)
  useEffect(() => {
    if (animState.queue.length > 0) return;
    const final = pendingRef.current;
    if (!final) return;
    pendingRef.current = null;
    triggerPostEffects(final, preClickGridRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animState.queue.length]);

  function triggerPostEffects(
    final: GameState,
    preGrid: (number | null)[][],
  ) {
    if (hasNewAGI(preGrid, final.grid)) {
      setShowAGIModal(true);
    }
    if (isGameOver(final)) {
      setGameOver(true);
      savePersonalBest(final.personalBest);
    }
  }

  function handleCellClick(row: number, col: number) {
    if (showAGIModal || gameOver) return;

    // Any click during animation → skip to final state
    if (isAnimating) {
      setAnimState({ queue: [], prevGrid: gameState.grid });
      return;
    }

    // Occupied cell → shake feedback
    if (gameState.grid[row][col] !== null) {
      setShakingCell({ row, col });
      setTimeout(() => setShakingCell(null), 150);
      return;
    }

    const preGrid = gameState.grid;
    const { finalState, placedGrid, steps } = placeNeuronWithSteps(
      gameState,
      row,
      col,
    );

    setGameState(finalState);

    if (steps.length === 0) {
      // No merges — instant update, check effects immediately
      triggerPostEffects(finalState, preGrid);
      setAnimState(prev => ({ ...prev, prevGrid: finalState.grid }));
    } else {
      // Animate: show placed neuron first, then one merge step per 1.2s
      preClickGridRef.current = preGrid;
      pendingRef.current = finalState;
      setAnimState({
        prevGrid: preGrid,
        queue: [placedGrid, ...steps.map(s => s.grid)],
      });
    }
  }

  function handleNewGame() {
    savePersonalBest(gameState.personalBest);
    const pb = readPersonalBest();
    const fresh = createGame(pb);
    setGameState(fresh);
    setAnimState({ queue: [], prevGrid: fresh.grid });
    setShowAGIModal(false);
    setGameOver(false);
    preClickGridRef.current = fresh.grid;
    pendingRef.current = null;
  }

  const isNewRecord = gameState.compute > 0 && gameState.compute >= gameState.personalBest;

  return (
    <div
      className="app"
      // Board-level click: any click during animation skips it
      onClick={() => {
        if (isAnimating) {
          setAnimState({ queue: [], prevGrid: gameState.grid });
        }
      }}
    >
      <ScoreBar compute={gameState.compute} personalBest={gameState.personalBest} />

      <Grid
        grid={displayGrid}
        isLocked={isAnimating}
        shakingCell={shakingCell}
        onCellClick={handleCellClick}
      />

      <footer className="app__hint">
        {gameOver
          ? null
          : isAnimating
            ? 'tap to skip'
            : 'place a neuron — 3 adjacent same-tier neurons merge'}
      </footer>

      {showAGIModal && (
        <AGIModal
          compute={gameState.compute}
          personalBest={gameState.personalBest}
          isNewRecord={isNewRecord}
          onClose={() => setShowAGIModal(false)}
        />
      )}

      {gameOver && (
        <GameOverOverlay
          compute={gameState.compute}
          personalBest={gameState.personalBest}
          isNewRecord={isNewRecord}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
