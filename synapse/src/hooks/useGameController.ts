import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createGame,
  placeNeuronWithSteps,
  addConnection,
  removeConnection,
  commitConnections,
  activateNextLayer,
  MIN_CONNECTIONS,
  LAYER_SIZE,
  type GameState,
  type GamePhase,
  type LayerGrid,
  type Connection,
} from '../game/engine-v2';
import { readPersonalBest, savePersonalBest } from '../game/storage';

// ─── Animation state (per active layer) ───────────────────────────────────────

interface AnimState {
  queue: LayerGrid[];
  prevGrid: LayerGrid;
}

const MERGE_DURATION_MS = 1200;

function emptyAnim(grid: LayerGrid): AnimState {
  return { queue: [], prevGrid: grid };
}

// ─── Hook interface ────────────────────────────────────────────────────────────

export interface GameController {
  gameState: GameState;
  displayGrid: (layerIndex: number) => LayerGrid;
  animatingLayerIndex: number | null;
  mergingCells: Set<string>;
  mergeTargetCells: Set<string>;
  shakingCell: { row: number; col: number } | null;
  selectedSource: { row: number; col: number } | null;
  handleCellClick: (layerIndex: number, row: number, col: number) => void;
  handleNewGame: () => void;
  canActivate: boolean;
  handleActivate: () => void;
  handleUndoConnection: () => void;
  hintText: string;
}

// ─── useGameController ────────────────────────────────────────────────────────

export function useGameController(): GameController {
  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(readPersonalBest()),
  );

  const [animState, setAnimState] = useState<AnimState>(() =>
    emptyAnim(gameState.layers[0].grid),
  );

  const [shakingCell, setShakingCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedSource, setSelectedSource] = useState<{ row: number; col: number } | null>(null);

  // Which layer's animation queue is active
  const animLayerRef = useRef<number>(0);
  const pendingStateRef = useRef<GameState | null>(null);

  const isAnimating = animState.queue.length > 0;
  const animatingLayerIndex = isAnimating ? animLayerRef.current : null;

  // ─── Advance animation queue at MERGE_DURATION_MS per step ──────────────────

  useEffect(() => {
    if (animState.queue.length === 0) return;
    const timer = setTimeout(() => {
      setAnimState(prev => ({
        prevGrid: prev.queue[0],
        queue: prev.queue.slice(1),
      }));
    }, MERGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [animState.queue.length]);

  // ─── When queue empties: apply pending state ─────────────────────────────────

  useEffect(() => {
    if (animState.queue.length > 0) return;
    const pending = pendingStateRef.current;
    if (!pending) return;
    pendingStateRef.current = null;
    setGameState(pending);
  }, [animState.queue.length]);

  // ─── Persist personalBest whenever it increases ───────────────────────────────

  useEffect(() => {
    if (gameState.personalBest > 0) {
      savePersonalBest(gameState.personalBest);
    }
  }, [gameState.personalBest]);

  // ─── mergingCells / mergeTargetCells lookahead ────────────────────────────────

  const mergingCells = useMemo((): Set<string> => {
    if (animState.queue.length < 2) return new Set();
    const current = animState.queue[0];
    const next = animState.queue[1];
    const s = new Set<string>();
    for (let r = 0; r < LAYER_SIZE; r++)
      for (let c = 0; c < LAYER_SIZE; c++)
        if (current[r][c] !== null && next[r][c] === null) s.add(`${r}-${c}`);
    return s;
  }, [animState.queue]);

  const mergeTargetCells = useMemo((): Set<string> => {
    if (animState.queue.length < 2) return new Set();
    const current = animState.queue[0];
    const next = animState.queue[1];
    const s = new Set<string>();
    for (let r = 0; r < LAYER_SIZE; r++)
      for (let c = 0; c < LAYER_SIZE; c++) {
        const prev = current[r][c];
        const nxt = next[r][c];
        if (nxt !== null && (prev === null || nxt > prev)) s.add(`${r}-${c}`);
      }
    return s;
  }, [animState.queue]);

  // ─── displayGrid ─────────────────────────────────────────────────────────────

  const displayGrid = useCallback((layerIndex: number): LayerGrid => {
    if (isAnimating && layerIndex === animLayerRef.current) {
      return animState.queue[0];
    }
    return gameState.layers[layerIndex].grid;
  }, [isAnimating, animState.queue, gameState.layers]);

  // ─── handleCellClick ─────────────────────────────────────────────────────────

  const handleCellClick = useCallback((layerIndex: number, row: number, col: number) => {
    // Sentinel: -1,-1,-1 = skip animation
    if (layerIndex === -1) {
      if (isAnimating) {
        const pending = pendingStateRef.current;
        pendingStateRef.current = null;
        setAnimState(prev => emptyAnim(prev.prevGrid));
        if (pending) setGameState(pending);
      }
      return;
    }

    const phase: GamePhase = gameState.phase;

    if (phase === 'play') {
      // Only active layer is playable
      if (layerIndex !== gameState.activeLayer) return;

      // Skip animation if tapped during animation
      if (isAnimating) {
        const pending = pendingStateRef.current;
        pendingStateRef.current = null;
        setAnimState(prev => emptyAnim(prev.prevGrid));
        if (pending) setGameState(pending);
        return;
      }

      // Occupied cell → shake
      if (gameState.layers[layerIndex].grid[row][col] !== null) {
        setShakingCell({ row, col });
        setTimeout(() => setShakingCell(null), 150);
        return;
      }

      const { finalState, placedGrid, steps } = placeNeuronWithSteps(gameState, row, col);

      if (steps.length === 0) {
        setGameState(finalState);
        setAnimState(prev => ({ ...prev, prevGrid: finalState.layers[layerIndex].grid }));
      } else {
        animLayerRef.current = layerIndex;
        pendingStateRef.current = finalState;
        setGameState(finalState);
        setAnimState({
          prevGrid: gameState.layers[layerIndex].grid,
          queue: [placedGrid, ...steps.map(s => s.grid)],
        });
      }
      return;
    }

    if (phase === 'connect') {
      const activeLayer = gameState.activeLayer;

      if (layerIndex === activeLayer) {
        // Source layer: tap to select/deselect source
        const cell = gameState.layers[layerIndex].grid[row][col];
        if (cell === null) return; // must tap an occupied neuron

        if (selectedSource?.row === row && selectedSource?.col === col) {
          setSelectedSource(null); // deselect
        } else {
          setSelectedSource({ row, col });
        }
        return;
      }

      if (layerIndex === activeLayer + 1 && selectedSource !== null) {
        // Target layer: draw a wire
        const target = gameState.layers[layerIndex].grid[row][col];
        if (target === null) return; // target must be occupied (or allow empty? spec says occupied)
        // Actually spec says target is ANY cell in target layer — let's allow empty too
        const conn: Connection = {
          fromLayer: activeLayer,
          fromRow: selectedSource.row,
          fromCol: selectedSource.col,
          toLayer: layerIndex,
          toRow: row,
          toCol: col,
        };
        const newState = addConnection(gameState, conn);
        if (newState !== gameState) {
          setGameState(newState);
          setSelectedSource(null);
        }
        return;
      }
    }
  }, [gameState, isAnimating, selectedSource]);

  // ─── handleActivate ──────────────────────────────────────────────────────────

  const handleActivate = useCallback(() => {
    const s1 = commitConnections(gameState);
    if (s1 === gameState) return; // preconditions not met
    const s2 = activateNextLayer(s1);
    setGameState(s2);
    setSelectedSource(null);
    // Reset anim state for new layer
    setAnimState(emptyAnim(s2.layers[s2.activeLayer].grid));
  }, [gameState]);

  // ─── handleUndoConnection ────────────────────────────────────────────────────

  const handleUndoConnection = useCallback(() => {
    const last = gameState.connections[gameState.connections.length - 1];
    if (!last) return;
    setGameState(removeConnection(gameState, last));
  }, [gameState]);

  // ─── handleNewGame ────────────────────────────────────────────────────────────

  const handleNewGame = useCallback(() => {
    savePersonalBest(gameState.personalBest);
    const pb = readPersonalBest();
    const fresh = createGame(pb);
    setGameState(fresh);
    setAnimState(emptyAnim(fresh.layers[0].grid));
    setSelectedSource(null);
    pendingStateRef.current = null;
  }, [gameState.personalBest]);

  // ─── canActivate ─────────────────────────────────────────────────────────────

  const canActivate =
    gameState.phase === 'connect' &&
    gameState.connections.length >= MIN_CONNECTIONS;

  // ─── hintText ────────────────────────────────────────────────────────────────

  const LAYER_NAMES: Record<number, string> = { 0: 'INPUT', 1: 'HIDDEN', 2: 'OUTPUT' };

  const hintText = useMemo((): string => {
    if (isAnimating) return 'TAP TO SKIP';
    switch (gameState.phase) {
      case 'play':
        return 'PLACE A NEURON — 3 ADJACENT SAME-TIER NEURONS MERGE';
      case 'connect': {
        const layerName = LAYER_NAMES[gameState.activeLayer] ?? 'LAYER';
        const nextName = LAYER_NAMES[gameState.activeLayer + 1] ?? 'NEXT';
        if (selectedSource === null) return `TAP A NEURON IN ${layerName}`;
        return `NOW TAP TARGET IN ${nextName}`;
      }
      case 'won':
      case 'gameover':
        return '';
      default:
        return '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, gameState.phase, gameState.activeLayer, selectedSource]);

  return {
    gameState,
    displayGrid,
    animatingLayerIndex,
    mergingCells,
    mergeTargetCells,
    shakingCell,
    selectedSource,
    handleCellClick,
    handleNewGame,
    canActivate,
    handleActivate,
    handleUndoConnection,
    hintText,
  };
}
