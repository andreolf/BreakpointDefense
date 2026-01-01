/**
 * Game Screen
 * Click near path → popup → select tower → place
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  createInitialState,
  updateGame,
  placeTower,
  canPlaceTower,
  canUpgradeTowerLevel,
  canUpgradeTowerRange,
  upgradeTowerLevel,
  upgradeTowerRange,
  canUseBomb,
  useBomb,
  canUseFreeze,
  useFreeze,
  canUseAirdrop,
  useAirdrop,
} from '../game/engine';
import { GameState } from '../game/types';
import { COLORS, TowerType, GAME_WIDTH, GAME_HEIGHT, GAME_CONFIG } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';

import { Lane } from '../components/Lane';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { TowerView } from '../components/TowerView';
import { RightPanel } from '../components/RightPanel';
import { PauseModal } from '../components/PauseModal';
import { TowerPopup } from '../components/TowerPopup';
import { ZoomPanContainer } from '../components/ZoomPanContainer';

interface GameScreenProps {
  onGameOver: (state: GameState) => void;
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, onQuit }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [showPause, setShowPause] = useState(false);
  
  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [pendingPlacePosition, setPendingPlacePosition] = useState({ x: 0, y: 0 });
  
  const { triggerLight, triggerMedium } = useHaptics();

  // Game loop
  useGameLoop((delta) => {
    setGameState((prev) => {
      if (prev.gameOver) return prev;
      const next = updateGame(prev, delta);
      if (next.gameOver && !prev.gameOver) {
        onGameOver(next);
      }
      return next;
    });
  }, !gameState.isPaused && gameState.isRunning);

  // Handle click on map - show popup if valid placement spot
  const handleMapClick = useCallback((x: number, y: number) => {
    // Check if any tower type can be placed here
    const canPlace = canPlaceTower(gameState, x, y, 'validator'); // Just check with cheapest
    
    if (canPlace) {
      setPendingPlacePosition({ x, y });
      setPopupPosition({ x: x + 50, y: y - 50 }); // Offset popup from click
      setPopupVisible(true);
      setSelectedTowerId(null);
    }
  }, [gameState]);

  // Handle tower type selection from popup
  const handleSelectTowerType = useCallback((type: TowerType) => {
    setGameState((prev) => {
      const next = placeTower(prev, pendingPlacePosition.x, pendingPlacePosition.y, type);
      if (next !== prev) {
        triggerMedium();
        const newTower = next.towers[next.towers.length - 1];
        setSelectedTowerId(newTower?.id || null);
      }
      return next;
    });
    setPopupVisible(false);
  }, [pendingPlacePosition, triggerMedium]);

  // Handle tower selection (tap existing tower)
  const handleTowerPress = useCallback((towerId: string) => {
    setSelectedTowerId((prev) => (prev === towerId ? null : towerId));
    triggerLight();
  }, [triggerLight]);

  // Handle upgrades
  const handleUpgradeLevel = useCallback(() => {
    if (!selectedTowerId) return;
    setGameState((prev) => {
      const next = upgradeTowerLevel(prev, selectedTowerId);
      if (next !== prev) triggerMedium();
      return next;
    });
  }, [selectedTowerId, triggerMedium]);

  const handleUpgradeRange = useCallback(() => {
    if (!selectedTowerId) return;
    setGameState((prev) => {
      const next = upgradeTowerRange(prev, selectedTowerId);
      if (next !== prev) triggerMedium();
      return next;
    });
  }, [selectedTowerId, triggerMedium]);

  // Abilities
  const handleBomb = useCallback(() => {
    setGameState((prev) => {
      if (!canUseBomb(prev)) return prev;
      triggerMedium();
      return useBomb(prev);
    });
  }, [triggerMedium]);

  const handleFreeze = useCallback(() => {
    setGameState((prev) => {
      if (!canUseFreeze(prev)) return prev;
      triggerMedium();
      return useFreeze(prev);
    });
  }, [triggerMedium]);

  const handleAirdrop = useCallback(() => {
    setGameState((prev) => {
      if (!canUseAirdrop(prev)) return prev;
      triggerMedium();
      return useAirdrop(prev);
    });
  }, [triggerMedium]);

  // Pause
  const handlePause = useCallback(() => {
    setShowPause(true);
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const handleResume = useCallback(() => {
    setShowPause(false);
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const handleQuit = useCallback(() => {
    setShowPause(false);
    onQuit();
  }, [onQuit]);

  const selectedTower = gameState.towers.find((t) => t.id === selectedTowerId) || null;

  return (
    <View style={styles.container}>
      {/* Game World with Zoom & Pan */}
      <View style={styles.gameWorldContainer}>
        <ZoomPanContainer
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onMapClick={handleMapClick}
        >
          <Lane 
            width={GAME_WIDTH} 
            height={GAME_HEIGHT} 
            freezeActive={gameState.abilities.freeze.active}
            showBuildZones={true}
            towers={gameState.towers.map(t => ({ x: t.x, y: t.y }))}
          />
          
          {/* Base */}
          <BaseView hp={gameState.baseHp} maxHp={gameState.maxBaseHp} />

          {/* Towers */}
          {gameState.towers.map((tower) => (
            <TowerView
              key={tower.id}
              tower={tower}
              isSelected={tower.id === selectedTowerId}
              onPress={() => handleTowerPress(tower.id)}
            />
          ))}

          {/* Enemies */}
          {gameState.enemies.map((enemy) => (
            <EnemyView key={enemy.id} enemy={enemy} />
          ))}

          {/* Projectiles */}
          {gameState.projectiles.map((proj) => (
            <ProjectileView key={proj.id} projectile={proj} />
          ))}
        </ZoomPanContainer>
      </View>

      {/* Right Panel - Stats + Upgrades + Abilities */}
      <RightPanel
        gameState={gameState}
        selectedTower={selectedTower}
        canUpgradeLevel={selectedTowerId ? canUpgradeTowerLevel(gameState, selectedTowerId) : false}
        canUpgradeRange={selectedTowerId ? canUpgradeTowerRange(gameState, selectedTowerId) : false}
        onUpgradeLevel={handleUpgradeLevel}
        onUpgradeRange={handleUpgradeRange}
        onBomb={handleBomb}
        onFreeze={handleFreeze}
        onAirdrop={handleAirdrop}
        onPause={handlePause}
      />

      {/* Tower Selection Popup */}
      <TowerPopup
        visible={popupVisible}
        position={popupPosition}
        sol={gameState.sol}
        onSelect={handleSelectTowerType}
        onClose={() => setPopupVisible(false)}
      />

      {/* Pause Modal */}
      {showPause && (
        <PauseModal onResume={handleResume} onQuit={handleQuit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
  },
  gameWorldContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    overflow: 'hidden',
  },
});
