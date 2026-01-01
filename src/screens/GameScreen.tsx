/**
 * Game Screen
 * Main gameplay with tap-to-place towers, zoom & pan
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  createInitialState,
  updateGame,
  placeTower,
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
import { COLORS, TowerType, GAME_WIDTH, GAME_HEIGHT } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';

import { Lane } from '../components/Lane';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { TowerView } from '../components/TowerView';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { PauseModal } from '../components/PauseModal';
import { ZoomPanContainer } from '../components/ZoomPanContainer';

interface GameScreenProps {
  onGameOver: (state: GameState) => void;
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, onQuit }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [showPause, setShowPause] = useState(false);
  
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

  // Handle tower drop from drag
  const handleDragTower = useCallback((type: TowerType, x: number, y: number) => {
    setGameState((prev) => {
      const next = placeTower(prev, x, y, type);
      if (next !== prev) {
        triggerMedium();
        const newTower = next.towers[next.towers.length - 1];
        setSelectedTowerId(newTower?.id || null);
        setSelectedTowerType(null);
      }
      return next;
    });
  }, [triggerMedium]);

  // Handle click on map to place selected tower type
  const handleMapClick = useCallback((x: number, y: number) => {
    if (!selectedTowerType) return;
    
    setGameState((prev) => {
      const next = placeTower(prev, x, y, selectedTowerType);
      if (next !== prev) {
        triggerMedium();
        const newTower = next.towers[next.towers.length - 1];
        setSelectedTowerId(newTower?.id || null);
      }
      return next;
    });
  }, [selectedTowerType, triggerMedium]);

  // Handle tower type selection from left panel
  const handleSelectTowerType = useCallback((type: TowerType) => {
    setSelectedTowerType((prev) => (prev === type ? null : type));
    setSelectedTowerId(null);
  }, []);

  // Handle tower selection
  const handleTowerPress = useCallback((towerId: string) => {
    setSelectedTowerId((prev) => (prev === towerId ? null : towerId));
    setSelectedTowerType(null);
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
    <GestureHandlerRootView style={styles.container}>
      {/* Left Panel - Towers + Abilities */}
      <LeftPanel
        gameState={gameState}
        selectedTowerType={selectedTowerType}
        onSelectTowerType={handleSelectTowerType}
        onDragTower={handleDragTower}
        onBomb={handleBomb}
        onFreeze={handleFreeze}
        onAirdrop={handleAirdrop}
      />

      {/* Game World with Zoom & Pan */}
      <View style={styles.gameWorldContainer}>
        <ZoomPanContainer
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onMapClick={handleMapClick}
        >
          <Lane width={GAME_WIDTH} height={GAME_HEIGHT} freezeActive={gameState.abilities.freeze.active} />
          
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

      {/* Right Panel - Stats + Upgrades */}
      <RightPanel
        gameState={gameState}
        selectedTower={selectedTower}
        canUpgradeLevel={selectedTowerId ? canUpgradeTowerLevel(gameState, selectedTowerId) : false}
        canUpgradeRange={selectedTowerId ? canUpgradeTowerRange(gameState, selectedTowerId) : false}
        onUpgradeLevel={handleUpgradeLevel}
        onUpgradeRange={handleUpgradeRange}
        onPause={handlePause}
      />

      {/* Pause Modal */}
      {showPause && (
        <PauseModal onResume={handleResume} onQuit={handleQuit} />
      )}
    </GestureHandlerRootView>
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
