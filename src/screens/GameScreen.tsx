/**
 * Game Screen
 * Click near path → popup → select tower → place
 * Broadcasts snapshots when live
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import {
  createInitialState,
  updateGame,
  placeTower,
  canPlaceTower,
  isNearPath,
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
  setGameSpeed,
} from '../game/engine';
import { GameState } from '../game/types';
import { COLORS, TowerType, GAME_WIDTH, GAME_HEIGHT, getTier } from '../game/config';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHaptics } from '../hooks/useHaptics';
import { liveClient } from '../live/wsClient';
import { GameSnapshot } from '../live/types';

import { Lane } from '../components/Lane';
import { EnemyView } from '../components/EnemyView';
import { ProjectileView } from '../components/ProjectileView';
import { BaseView } from '../components/BaseView';
import { TowerView } from '../components/TowerView';
import { RightPanel } from '../components/RightPanel';
import { PauseModal } from '../components/PauseModal';
import { TowerPopup } from '../components/TowerPopup';
import { ZoomPanContainer } from '../components/ZoomPanContainer';
import { HealthOverlay } from '../components/HealthOverlay';
import { SpeedControl } from '../components/SpeedControl';
import { PauseButton } from '../components/PauseButton';

interface LiveConfig {
  alias: string;
  goLive: boolean;
}

interface GameScreenProps {
  onGameOver: (state: GameState) => void;
  onQuit: () => void;
  liveConfig?: LiveConfig;
}

// Convert GameState to compact snapshot for streaming
function createSnapshot(state: GameState): GameSnapshot {
  return {
    time: state.elapsedTime,
    wave: state.wave,
    baseHp: state.baseHp,
    maxBaseHp: state.maxBaseHp,
    kills: state.kills,
    sol: state.sol,
    gameSpeed: state.gameSpeed,
    gameOver: state.gameOver,
    enemies: state.enemies.map(e => ({
      id: e.id,
      type: e.type,
      x: e.x,
      y: e.y,
      hp: e.hp,
      maxHp: e.maxHp,
    })),
    towers: state.towers.map(t => ({
      id: t.id,
      type: t.type,
      x: t.x,
      y: t.y,
      level: t.level,
      rangeLevel: t.rangeLevel,
    })),
    finalTier: state.gameOver ? getTier(state.elapsedTime).name : undefined,
  };
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  onGameOver, 
  onQuit,
  liveConfig,
}) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [showPause, setShowPause] = useState(false);
  
  // Live streaming state
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const lastSnapshotTime = useRef(0);
  const SNAPSHOT_INTERVAL = 300; // Send snapshot every 300ms

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [pendingPlacePosition, setPendingPlacePosition] = useState({ x: 0, y: 0 });

  const { triggerLight, triggerMedium } = useHaptics();

  // Initialize live session if goLive is enabled
  useEffect(() => {
    if (liveConfig?.goLive && liveConfig.alias) {
      const startLiveSession = async () => {
        const id = await liveClient.createSession(liveConfig.alias);
        if (id) {
          setSessionId(id);
          setIsLive(true);
          console.log('[Live] Session started:', id);
        } else {
          console.log('[Live] Failed to start session');
        }
      };
      startLiveSession();
    }

    return () => {
      // End session when leaving game
      if (isLive) {
        liveClient.endSession();
      }
    };
  }, []);

  // Keyboard controls (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (showPause) {
            handleResume();
          } else {
            handlePause();
          }
          break;
        case 'Digit1':
          handleSpeedChange(1);
          break;
        case 'Digit2':
          handleSpeedChange(2);
          break;
        case 'Digit3':
          handleSpeedChange(3);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPause]);

  // Game loop
  useGameLoop((delta) => {
    setGameState((prev) => {
      if (prev.gameOver) return prev;
      const next = updateGame(prev, delta);
      
      // Send snapshot if live
      if (isLive) {
        const now = Date.now();
        if (now - lastSnapshotTime.current >= SNAPSHOT_INTERVAL) {
          lastSnapshotTime.current = now;
          liveClient.sendSnapshot(createSnapshot(next));
        }
      }
      
      // Handle game over
      if (next.gameOver && !prev.gameOver) {
        // End live session with final snapshot
        if (isLive) {
          const finalSnapshot = createSnapshot(next);
          finalSnapshot.finalTier = getTier(next.elapsedTime).name;
          liveClient.endSession(finalSnapshot);
          setIsLive(false);
        }
        onGameOver(next);
      }
      
      return next;
    });
  }, !gameState.isPaused && gameState.isRunning);

  // Handle click on map - ALWAYS show popup if near path (even if can't afford)
  const handleMapClick = useCallback((x: number, y: number) => {
    // Check if click is near the path (not checking cost!)
    if (isNearPath(x, y)) {
      setPendingPlacePosition({ x, y });
      setPopupVisible(true);
      setSelectedTowerId(null);
    }
  }, []);

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
    // End live session if active
    if (isLive) {
      liveClient.endSession(createSnapshot(gameState));
      setIsLive(false);
    }
    onQuit();
  }, [onQuit, isLive, gameState]);

  // Speed control
  const handleSpeedChange = useCallback((speed: number) => {
    setGameState((prev) => setGameSpeed(prev, speed));
  }, []);

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

        {/* Live Indicator */}
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        )}

        {/* Health Overlay - Top center of game area */}
        <HealthOverlay hp={gameState.baseHp} maxHp={gameState.maxBaseHp} />

        {/* Speed Control - Top right */}
        <SpeedControl speed={gameState.gameSpeed} onChangeSpeed={handleSpeedChange} />

        {/* Pause Button - Bottom right */}
        <PauseButton onPause={handlePause} />
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
      />

      {/* Tower Selection Popup */}
      <TowerPopup
        visible={popupVisible}
        sol={gameState.sol}
        maxTowers={gameState.towers.length >= 20}
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
  liveIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.hpLow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  liveIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  liveIndicatorText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
