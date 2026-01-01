/**
 * GameScreen
 * Main game - tap anywhere along the path to place towers!
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { GameState, Tower, GameSettings } from '../game/types';
import { TowerType, GAME_CONFIG, TOWER_CONFIGS } from '../game/config';
import {
  createInitialState,
  updateGame,
  placeTowerAt,
  canPlaceTowerAt,
  upgradeTower,
  canUpgradeTower,
  resetSpawnTimers,
} from '../game/engine';
import { COLORS, SIDEBAR_WIDTH } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
import { Lane } from '../components/Lane';
import { TowerView } from '../components/TowerView';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { Sidebar } from '../components/Sidebar';

interface GameScreenProps {
  onGameOver: (time: number, wave: number, kills: number, solEarned: number) => void;
  settings: GameSettings;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, settings }) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const gameWidth = screenWidth - SIDEBAR_WIDTH;
  const gameHeight = screenHeight * 0.92;
  
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(gameWidth, gameHeight)
  );
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);

  const haptics = useHaptics(settings.hapticsEnabled);
  const sound = useSound(settings.soundEnabled);
  const dimensionsRef = useRef({ width: gameWidth, height: gameHeight });

  useEffect(() => {
    resetSpawnTimers();
  }, []);

  // Game loop
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

  useGameLoop(onUpdate, 60, gameState.isRunning && !gameState.isPaused);

  // Game over
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

  // Handle tap on game area - place tower or select existing
  const handleGamePress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Check if tapped on existing tower first
    for (const tower of gameState.towers) {
      const dist = Math.sqrt(
        Math.pow(locationX - tower.x, 2) + Math.pow(locationY - tower.y, 2)
      );
      if (dist < GAME_CONFIG.slotRadius + 10) {
        // Selected existing tower
        setSelectedTower(tower);
        setSelectedTowerType(null);
        return;
      }
    }
    
    // Try to place a new tower
    if (selectedTowerType) {
      const result = canPlaceTowerAt(
        gameState,
        locationX,
        locationY,
        selectedTowerType,
        gameWidth,
        gameHeight
      );
      
      if (result.canPlace) {
        haptics.onTowerPlace();
        sound.playPlace();
        setGameState(prev => 
          placeTowerAt(prev, locationX, locationY, selectedTowerType, gameWidth, gameHeight)
        );
        // Keep tower type selected for quick placement
      }
    }
    
    // Deselect tower if tapped elsewhere
    setSelectedTower(null);
  }, [gameState, selectedTowerType, gameWidth, gameHeight, haptics, sound]);

  // Handle tower type selection from sidebar
  const handleSelectTowerType = useCallback((type: TowerType) => {
    if (selectedTowerType === type) {
      setSelectedTowerType(null); // Toggle off
    } else {
      setSelectedTowerType(type);
      setSelectedTower(null);
    }
  }, [selectedTowerType]);

  // Handle upgrade from sidebar
  const handleUpgrade = useCallback(() => {
    if (!selectedTower) return;
    
    if (canUpgradeTower(gameState, selectedTower.id)) {
      haptics.onTowerUpgrade();
      sound.playUpgrade();
      setGameState(prev => upgradeTower(prev, selectedTower.id));
      
      // Update selected tower reference
      setSelectedTower(prev => {
        if (!prev) return null;
        const updated = gameState.towers.find(t => t.id === prev.id);
        return updated ? { ...updated, level: updated.level + 1 } : null;
      });
    }
  }, [selectedTower, gameState, haptics, sound]);

  // Pause
  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  return (
    <SafeArea style={styles.container} edges={['top']}>
      <View style={styles.mainLayout}>
        {/* Game Area */}
        <TouchableWithoutFeedback onPress={handleGamePress}>
          <View style={[styles.gameWorld, { width: gameWidth, height: gameHeight }]}>
            {/* Lane background */}
            <Lane
              width={gameWidth}
              height={gameHeight}
              timeMarkerProgress={0}
            />

            {/* Towers */}
            {gameState.towers.map(tower => (
              <TowerView
                key={tower.id}
                tower={tower}
                isSelected={selectedTower?.id === tower.id}
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

            {/* Placement hint */}
            {selectedTowerType && (
              <View style={styles.placementHint}>
                <Text style={styles.placementHintText}>
                  Tap near the path to place {TOWER_CONFIGS[selectedTowerType].icon}
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Sidebar */}
        <Sidebar
          sol={gameState.sol}
          time={gameState.elapsedTime}
          wave={gameState.wave}
          kills={gameState.kills}
          baseHp={gameState.baseHp}
          maxBaseHp={gameState.maxBaseHp}
          selectedTowerType={selectedTowerType}
          selectedTower={selectedTower}
          towerCount={gameState.towers.length}
          onSelectTowerType={handleSelectTowerType}
          onUpgrade={handleUpgrade}
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
                1️⃣ Select a tower in the sidebar
              </Text>
              <Text style={styles.pauseInfoText}>
                2️⃣ Tap anywhere near the path to place it
              </Text>
              <Text style={styles.pauseInfoText}>
                3️⃣ Tap a tower to select, then upgrade in sidebar
              </Text>
              <Text style={styles.pauseInfoText}>
                🆙 Upgrades increase damage, fire rate, AND range!
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
  gameWorld: {
    backgroundColor: COLORS.bgDark,
    overflow: 'hidden',
  },
  placementHint: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(153, 69, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  placementHintText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
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
