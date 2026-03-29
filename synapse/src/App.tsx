import { useState } from 'react';
import { useGameController } from './hooks/useGameController';
import { LayerSection } from './components/LayerSection';
import { WireZone } from './components/WireZone';
import { ScoreBar } from './components/ScoreBar';
import { AGIModal } from './components/AGIModal';
import { GameOverOverlay } from './components/GameOverOverlay';
import { TierChain } from './components/TierChain';
import { MIN_CONNECTIONS } from './game/engine-v2';
import './App.css';

export function App() {
  const ctrl = useGameController();
  const { gameState: gs } = ctrl;
  const isAnimating = ctrl.animatingLayerIndex !== null;

  // Allow dismissing the AGI modal to view the final board state
  const [agiDismissed, setAgiDismissed] = useState(false);

  const isNewRecord = gs.compute > 0 && gs.compute > gs.personalBest;

  const showAGIModal = gs.phase === 'won' && !agiDismissed;
  const showGameOver = gs.phase === 'gameover';

  function handleNewGame() {
    setAgiDismissed(false);
    ctrl.handleNewGame();
  }

  return (
    <div
      className="app"
      onClick={() => {
        if (isAnimating) ctrl.handleCellClick(-1, -1, -1);
      }}
    >
      <ScoreBar
        compute={gs.compute}
        personalBest={gs.personalBest}
        onNewGame={handleNewGame}
      />

      {/* INPUT layer */}
      <LayerSection
        layer={gs.layers[0]}
        layerIndex={0}
        phase={gs.phase}
        displayGrid={ctrl.displayGrid(0)}
        selectedSource={gs.activeLayer === 0 ? ctrl.selectedSource : null}
        connections={gs.connections}
        shakingCell={ctrl.animatingLayerIndex === 0 ? ctrl.shakingCell : ctrl.animatingLayerIndex === null ? ctrl.shakingCell : null}
        mergingCells={ctrl.animatingLayerIndex === 0 ? ctrl.mergingCells : new Set()}
        mergeTargetCells={ctrl.animatingLayerIndex === 0 ? ctrl.mergeTargetCells : new Set()}
        pendingCharges={gs.pendingCharges}
        connectionCount={gs.connections.filter(c => c.fromLayer === 0).length}
        minConnections={MIN_CONNECTIONS}
        onCellClick={(r, c) => ctrl.handleCellClick(0, r, c)}
      />

      {/* Wire zone: INPUT → HIDDEN */}
      <WireZone
        connections={gs.connections}
        zoneFromLayer={0}
        phase={gs.phase}
        activeLayer={gs.activeLayer}
        canActivate={ctrl.canActivate}
        onActivate={ctrl.handleActivate}
        onUndo={ctrl.handleUndoConnection}
        connectionCount={gs.connections.filter(c => c.fromLayer === 0).length}
        minConnections={MIN_CONNECTIONS}
      />

      {/* HIDDEN layer */}
      <LayerSection
        layer={gs.layers[1]}
        layerIndex={1}
        phase={gs.phase}
        displayGrid={ctrl.displayGrid(1)}
        selectedSource={gs.activeLayer === 1 ? ctrl.selectedSource : null}
        connections={gs.connections}
        shakingCell={ctrl.animatingLayerIndex === 1 ? ctrl.shakingCell : null}
        mergingCells={ctrl.animatingLayerIndex === 1 ? ctrl.mergingCells : new Set()}
        mergeTargetCells={ctrl.animatingLayerIndex === 1 ? ctrl.mergeTargetCells : new Set()}
        pendingCharges={gs.pendingCharges}
        connectionCount={gs.connections.filter(c => c.fromLayer === 1).length}
        minConnections={MIN_CONNECTIONS}
        onCellClick={(r, c) => ctrl.handleCellClick(1, r, c)}
      />

      {/* Wire zone: HIDDEN → OUTPUT */}
      <WireZone
        connections={gs.connections}
        zoneFromLayer={1}
        phase={gs.phase}
        activeLayer={gs.activeLayer}
        canActivate={ctrl.canActivate}
        onActivate={ctrl.handleActivate}
        onUndo={ctrl.handleUndoConnection}
        connectionCount={gs.connections.filter(c => c.fromLayer === 1).length}
        minConnections={MIN_CONNECTIONS}
      />

      {/* OUTPUT layer */}
      <LayerSection
        layer={gs.layers[2]}
        layerIndex={2}
        phase={gs.phase}
        displayGrid={ctrl.displayGrid(2)}
        selectedSource={gs.activeLayer === 2 ? ctrl.selectedSource : null}
        connections={gs.connections}
        shakingCell={ctrl.animatingLayerIndex === 2 ? ctrl.shakingCell : null}
        mergingCells={ctrl.animatingLayerIndex === 2 ? ctrl.mergingCells : new Set()}
        mergeTargetCells={ctrl.animatingLayerIndex === 2 ? ctrl.mergeTargetCells : new Set()}
        pendingCharges={gs.pendingCharges}
        connectionCount={0}
        minConnections={MIN_CONNECTIONS}
        onCellClick={(r, c) => ctrl.handleCellClick(2, r, c)}
      />

      <footer className="app__hint">{ctrl.hintText}</footer>

      <TierChain />

      {showAGIModal && (
        <AGIModal
          compute={gs.compute}
          personalBest={gs.personalBest}
          isNewRecord={isNewRecord}
          onClose={() => setAgiDismissed(true)}
          onNewGame={handleNewGame}
        />
      )}

      {showGameOver && (
        <GameOverOverlay
          compute={gs.compute}
          personalBest={gs.personalBest}
          isNewRecord={isNewRecord}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
