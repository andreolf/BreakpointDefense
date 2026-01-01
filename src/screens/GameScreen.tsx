/**
 * GameScreen
 * Main game screen with tower defense gameplay and sidebar
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { GameState, TowerSlot, GameSettings } from '../game/types';
import { TowerType, GAME_CONFIG } from '../game/config';
import {
  createInitialState,
  updateGame,
  placeTower,
  upgradeTower,
  canPlaceTower,
  canUpgradeTower,
  resetSpawnTimers,
} from '../game/engine';
import { COLORS, SIDEBAR_WIDTH } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
import { Lane } from '../components/Lane';
import { TowerSlotView } from '../components/TowerSlotView';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { Sidebar } from '../components/Sidebar';

interface GameScreenProps {
  onGameOver: (time: number, wave: number, kills: number, solEarned: number) => void;
  settings: GameSettings;
}

/**
 * Main game screen
 */
export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, settings }) => {
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Calculate game area dimensions (minus sidebar)
  const gameWidth = screenWidth - SIDEBAR_WIDTH;
  const gameHeight = screenHeight * 0.92;
  
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(gameWidth, gameHeight)
  );
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

  // Handle slot tap - just select it
  const handleSlotPress = useCallback((slot: TowerSlot) => {
    if (slot.tower) {
      // Already has tower - could upgrade
      setSelectedSlotIndex(slot.index);
    } else if (!slot.locked) {
      // Empty slot - select for placement
      setSelectedSlotIndex(slot.index);
    }
  }, []);

  // Handle tower selection from sidebar
  const handleSelectTower = useCallback((type: TowerType) => {
    if (selectedSlotIndex === null) return;

    setGameState(prev => {
      if (!canPlaceTower(prev, selectedSlotIndex, type)) return prev;

      haptics.onTowerPlace();
      sound.playPlace();

      return placeTower(prev, selectedSlotIndex, type);
    });

    setSelectedSlotIndex(null);
  }, [selectedSlotIndex, haptics, sound]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Check if selected slot can place
  const selectedSlot = selectedSlotIndex !== null ? gameState.slots[selectedSlotIndex] : null;
  const canPlace = selectedSlot !== null && !selectedSlot.locked && !selectedSlot.tower;

  return (
    <SafeArea style={styles.container} edges={['top']}>
      <View style={styles.mainLayout}>
        {/* Game Area */}
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

        {/* Right Sidebar */}
        <Sidebar
          sol={gameState.sol}
          time={gameState.elapsedTime}
          wave={gameState.wave}
          kills={gameState.kills}
          baseHp={gameState.baseHp}
          maxBaseHp={gameState.maxBaseHp}
          selectedSlotIndex={selectedSlotIndex}
          canPlace={canPlace}
          onSelectTower={handleSelectTower}
          onPause={handlePause}
          isPaused={gameState.isPaused}
        />
      </View>

      {/* Pause overlay */}
      {gameState.isPaused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseContent}>
            <Text style={styles.pauseTitle}>PAUSED</Text>
            <Text style={styles.pauseSubtitle}>Solana Breakpoint Defense</Text>
            
            <View style={styles.pauseInfo}>
              <Text style={styles.pauseInfoText}>
                🎮 Tap a slot on the map, then tap a tower in the sidebar to place it
              </Text>
              <Text style={styles.pauseInfoText}>
                ⬆️ Towers auto-upgrade when you have enough SOL
              </Text>
              <Text style={styles.pauseInfoText}>
                🛡️ Defend the network from FUD, Rug Pulls, and Congestion!
              </Text>
            </View>
            
            <TouchableOpacity style={styles.resumeButton} onPress={handlePause}>
              <Text style={styles.resumeButtonText}>▶ RESUME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  gameContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  gameWorld: {
    backgroundColor: COLORS.bgDark,
    overflow: 'hidden',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContent: {
    alignItems: 'center',
    padding: 30,
    maxWidth: 350,
  },
  pauseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
    marginBottom: 6,
    letterSpacing: 4,
  },
  pauseSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 30,
  },
  pauseInfo: {
    marginBottom: 30,
    gap: 12,
  },
  pauseInfoText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  resumeButton: {
    backgroundColor: COLORS.solanaPurple,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  resumeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameScreen;
