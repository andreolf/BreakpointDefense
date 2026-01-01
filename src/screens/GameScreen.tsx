/**
 * GameScreen
 * Main game screen with tower defense gameplay
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { GameState, TowerSlot, GameSettings } from '../game/types';
import { TowerType } from '../game/config';
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

interface TowerSelectState {
  visible: boolean;
  slotIndex: number | null;
}

interface GameScreenProps {
  onGameOver: (time: number, wave: number, kills: number, solEarned: number) => void;
  settings: GameSettings;
}

/**
 * Main game screen - renders the game world and handles input
 */
export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, settings }) => {
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Calculate game area dimensions
  const gameWidth = screenWidth;
  const gameHeight = screenHeight * 0.7;
  
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(gameWidth, gameHeight)
  );
  const [towerSelect, setTowerSelect] = useState<TowerSelectState>({
    visible: false,
    slotIndex: null,
  });
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const gameStateRef = useRef(gameState);
  const haptics = useHaptics(settings.hapticsEnabled);
  const sound = useSound(settings.soundEnabled);
  const dimensionsRef = useRef({ width: gameWidth, height: gameHeight });

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
      if (prev.isPaused || prev.gameOver) return prev;
      return updateGame(
        prev, 
        deltaTime,
        dimensionsRef.current.width,
        dimensionsRef.current.height
      );
    });
  }, []);

  // Use game loop
  useGameLoop(onUpdate, 60, gameState.isRunning && !gameState.isPaused);

  // Check for game over
  useEffect(() => {
    if (gameState.gameOver) {
      haptics.onGameOver();
      sound.playGameOver();
      onGameOver(
        gameState.elapsedTime,
        gameState.wave,
        gameState.kills,
        gameState.solEarned
      );
    }
  }, [gameState.gameOver]);

  // Handle slot tap
  const handleSlotPress = useCallback((slot: TowerSlot) => {
    if (slot.locked && !slot.tower) return;

    setTowerSelect({
      visible: true,
      slotIndex: slot.index,
    });
    setSelectedSlotIndex(slot.index);
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
    setSelectedSlotIndex(null);
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
    setSelectedSlotIndex(null);
  }, [towerSelect.slotIndex, gameState.slots, haptics, sound]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const handleResume = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Close tower select
  const closeTowerSelect = useCallback(() => {
    setTowerSelect({ visible: false, slotIndex: null });
    setSelectedSlotIndex(null);
  }, []);

  const selectedSlot = towerSelect.slotIndex !== null
    ? gameState.slots[towerSelect.slotIndex]
    : null;

  return (
    <SafeArea style={styles.container} edges={['top']}>
      {/* HUD */}
      <HUD
        time={gameState.elapsedTime}
        sol={gameState.sol}
        baseHp={gameState.baseHp}
        maxBaseHp={gameState.maxBaseHp}
        wave={gameState.wave}
        kills={gameState.kills}
        isPaused={gameState.isPaused}
        onPause={handlePause}
        onResume={handleResume}
      />

      {/* Game World */}
      <View style={styles.gameContainer}>
        <View
          style={[
            styles.gameWorld,
            {
              width: gameWidth,
              height: gameHeight,
            },
          ]}
        >
          {/* Lane background with S-curve path */}
          <Lane
            width={gameWidth}
            height={gameHeight}
            timeMarkerProgress={gameState.timeMarkerProgress}
          />

          {/* Tower slots */}
          {gameState.slots.map(slot => (
            <TowerSlotView
              key={slot.index}
              slot={slot}
              onPress={() => handleSlotPress(slot)}
              isSelected={selectedSlotIndex === slot.index}
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
          <BaseView
            hp={gameState.baseHp}
            maxHp={gameState.maxBaseHp}
            gameWidth={gameWidth}
            gameHeight={gameHeight}
          />
        </View>
      </View>

      {/* Pause overlay */}
      {gameState.isPaused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseContent}>
            <Text style={styles.pauseTitle}>PAUSED</Text>
            <Text style={styles.pauseSubtitle}>Solana Breakpoint Defense</Text>
            
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
              <Text style={styles.resumeButtonText}>▶ RESUME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tower selection popup */}
      <TowerSelectPopup
        visible={towerSelect.visible}
        slotIndex={towerSelect.slotIndex || 0}
        sol={gameState.sol}
        existingTower={selectedSlot?.tower || null}
        onSelect={handleSelectTower}
        onUpgrade={handleUpgrade}
        onClose={closeTowerSelect}
      />
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gameWorld: {
    backgroundColor: COLORS.bgDark,
    overflow: 'hidden',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContent: {
    alignItems: 'center',
    padding: 40,
  },
  pauseTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
    marginBottom: 8,
    letterSpacing: 4,
  },
  pauseSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 40,
  },
  resumeButton: {
    backgroundColor: COLORS.solanaPurple,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  resumeButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameScreen;
