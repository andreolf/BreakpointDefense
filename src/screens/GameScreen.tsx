import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { GameState, TowerType, TowerSlot, TowerSelectState, Settings } from '../game/types';
import {
  createInitialState,
  updateGame,
  placeTower,
  upgradeTower,
  canPlaceTower,
  canUpgradeTower,
  resetSpawnTimers,
} from '../game/engine';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
import { Lane } from '../components/Lane';
import { TowerSlotView } from '../components/TowerSlotView';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { TowerSelectPopup } from '../components/TowerSelectPopup';
import { HUD } from '../components/HUD';

interface GameScreenProps {
  onGameOver: (time: number, wave: number, kills: number, slots: TowerSlot[]) => void;
  settings: Settings;
}

/**
 * Main game screen - renders the game world and handles input
 */
export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, settings }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [towerSelect, setTowerSelect] = useState<TowerSelectState>({
    visible: false,
    slotIndex: null,
  });

  const gameStateRef = useRef(gameState);
  const haptics = useHaptics(settings.hapticEnabled);
  const sound = useSound(settings.soundEnabled);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Reset spawn timers when game starts
  useEffect(() => {
    resetSpawnTimers();
  }, []);

  // Game loop callback
  const onUpdate = useCallback((deltaTime: number) => {
    setGameState(prev => {
      if (prev.paused || prev.gameOver) return prev;
      return updateGame(prev, deltaTime);
    });
  }, []);

  // Use game loop
  useGameLoop(onUpdate, 60, gameState.running && !gameState.paused);

  // Check for game over
  useEffect(() => {
    if (gameState.gameOver) {
      haptics.onGameOver();
      sound.playGameOver();
      onGameOver(gameState.time, gameState.wave, gameState.kills, gameState.slots);
    }
  }, [gameState.gameOver]);

  // Handle slot tap
  const handleSlotPress = useCallback((slot: TowerSlot) => {
    if (slot.locked && !slot.tower) return;

    setTowerSelect({
      visible: true,
      slotIndex: slot.index,
    });
  }, []);

  // Handle tower selection
  const handleSelectTower = useCallback((type: TowerType) => {
    if (towerSelect.slotIndex === null) return;

    setGameState(prev => {
      if (!canPlaceTower(prev, towerSelect.slotIndex!, type)) return prev;

      haptics.onTowerPlace();
      sound.playPlace();

      return placeTower(prev, towerSelect.slotIndex!, type);
    });

    setTowerSelect({ visible: false, slotIndex: null });
  }, [towerSelect.slotIndex, haptics, sound]);

  // Handle tower upgrade
  const handleUpgrade = useCallback(() => {
    if (towerSelect.slotIndex === null) return;

    const slot = gameState.slots[towerSelect.slotIndex];
    if (!slot.tower) return;

    setGameState(prev => {
      if (!canUpgradeTower(prev, slot.tower!.id)) return prev;

      haptics.onTowerUpgrade();
      sound.playUpgrade();

      return upgradeTower(prev, slot.tower!.id);
    });

    setTowerSelect({ visible: false, slotIndex: null });
  }, [towerSelect.slotIndex, gameState.slots, haptics, sound]);

  // Handle pause
  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  // Close tower select
  const closeTowerSelect = useCallback(() => {
    setTowerSelect({ visible: false, slotIndex: null });
  }, []);

  // Calculate scale to fit screen
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / GAME_WIDTH, (screenHeight - 100) / GAME_HEIGHT);

  const selectedSlot = towerSelect.slotIndex !== null
    ? gameState.slots[towerSelect.slotIndex]
    : null;

  return (
    <SafeArea style={styles.container} edges={['top']}>
      {/* HUD */}
      <HUD
        time={gameState.time}
        coins={gameState.coins}
        baseHp={gameState.baseHp}
        maxBaseHp={gameState.maxBaseHp}
        wave={gameState.wave}
        paused={gameState.paused}
        onPause={handlePause}
      />

      {/* Game World */}
      <View style={styles.gameContainer}>
        <View
          style={[
            styles.gameWorld,
            {
              width: GAME_WIDTH,
              height: GAME_HEIGHT,
              transform: [{ scale }],
            },
          ]}
        >
          {/* Lane background */}
          <Lane timeMarkerProgress={gameState.timeMarkerX} />

          {/* Tower slots */}
          {gameState.slots.map(slot => (
            <TowerSlotView
              key={slot.index}
              slot={slot}
              onPress={() => handleSlotPress(slot)}
            />
          ))}

          {/* Enemies */}
          {gameState.enemies.map(enemy => (
            <EnemyView key={enemy.id} enemy={enemy} />
          ))}

          {/* Projectiles */}
          {gameState.projectiles.map(projectile => (
            <ProjectileView key={projectile.id} projectile={projectile} />
          ))}

          {/* Base */}
          <BaseView hp={gameState.baseHp} maxHp={gameState.maxBaseHp} />
        </View>
      </View>

      {/* Pause overlay */}
      {gameState.paused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseContent}>
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
            <View style={styles.pauseTextContainer}>
              <View style={styles.pauseLine} />
              <View style={styles.pauseText}>
                <View style={styles.pauseLetter} />
                <View style={styles.pauseLetter} />
                <View style={styles.pauseLetter} />
                <View style={styles.pauseLetter} />
                <View style={styles.pauseLetter} />
                <View style={styles.pauseLetter} />
              </View>
              <View style={styles.pauseLine} />
            </View>
          </View>
        </View>
      )}

      {/* Tower selection popup */}
      <TowerSelectPopup
        visible={towerSelect.visible}
        coins={gameState.coins}
        existingTower={selectedSlot?.tower || null}
        onSelectTower={handleSelectTower}
        onUpgrade={handleUpgrade}
        onClose={closeTowerSelect}
      />
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gameWorld: {
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContent: {
    alignItems: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pauseBar: {
    width: 16,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  pauseTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pauseLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.textDim,
  },
  pauseText: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseLetter: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.textDim,
    borderRadius: 2,
  },
});

