/**
 * Game Over Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameState, RunResult } from '../game/types';
import { COLORS, getTier, BIOME } from '../game/config';
import { saveRun } from '../storage/leaderboard';

// Conditionally import sharing modules
let ViewShot: any = null;
let captureRef: any = null;
let shareAsync: any = null;

if (Platform.OS !== 'web') {
  ViewShot = require('react-native-view-shot').default;
  captureRef = require('react-native-view-shot').captureRef;
  shareAsync = require('expo-sharing').shareAsync;
}

interface GameOverScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameState,
  onPlayAgain,
  onHome,
}) => {
  const [shareRef, setShareRef] = useState<any>(null);
  const tier = getTier(gameState.elapsedTime);

  // Save run on mount
  useEffect(() => {
    const run: RunResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      survivalTime: gameState.elapsedTime,
      wave: gameState.wave,
      kills: gameState.kills,
      solEarned: gameState.solEarned,
      tierName: tier.name,
      tierIcon: tier.icon,
    };
    saveRun(run);
  }, []);

  const handleShare = async () => {
    if (!shareRef || !captureRef || !shareAsync) return;
    
    try {
      const uri = await captureRef(shareRef, { format: 'png', quality: 1 });
      await shareAsync(uri);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const ShareCard = () => (
    <View style={styles.shareCard}>
      <Text style={styles.shareTitle}>🛡️ BREAKPOINT DEFENSE</Text>
      <Text style={styles.shareBiome}>{BIOME.name}</Text>
      
      <View style={styles.shareTierContainer}>
        <Text style={styles.shareTierIcon}>{tier.icon}</Text>
        <Text style={[styles.shareTierName, { color: tier.color }]}>{tier.name}</Text>
      </View>
      
      <View style={styles.shareStats}>
        <View style={styles.shareStatRow}>
          <Text style={styles.shareStatLabel}>⏱️ Time</Text>
          <Text style={styles.shareStatValue}>{formatTime(gameState.elapsedTime)}</Text>
        </View>
        <View style={styles.shareStatRow}>
          <Text style={styles.shareStatLabel}>🌊 Wave</Text>
          <Text style={styles.shareStatValue}>{gameState.wave}</Text>
        </View>
        <View style={styles.shareStatRow}>
          <Text style={styles.shareStatLabel}>💀 Kills</Text>
          <Text style={styles.shareStatValue}>{gameState.kills}</Text>
        </View>
        <View style={styles.shareStatRow}>
          <Text style={styles.shareStatLabel}>◎ SOL Earned</Text>
          <Text style={styles.shareStatValue}>{gameState.solEarned}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        
        {/* Hidden share card for capture */}
        {ViewShot && (
          <View style={styles.hiddenShareContainer}>
            <ViewShot ref={setShareRef} options={{ format: 'png', quality: 1 }}>
              <ShareCard />
            </ViewShot>
          </View>
        )}
        
        {/* Visible stats */}
        <View style={styles.tierContainer}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Time Survived</Text>
            <Text style={styles.statValue}>{formatTime(gameState.elapsedTime)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Wave Reached</Text>
            <Text style={styles.statValue}>{gameState.wave}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Enemies Defeated</Text>
            <Text style={styles.statValue}>{gameState.kills}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total SOL Earned</Text>
            <Text style={styles.statValue}>◎ {gameState.solEarned}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Damage Dealt</Text>
            <Text style={styles.statValue}>{Math.floor(gameState.damageDealt)}</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.playButton} onPress={onPlayAgain}>
          <Text style={styles.playButtonText}>🔄 Play Again</Text>
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={onHome}>
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.hpLow,
    letterSpacing: 4,
    marginBottom: 20,
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  tierIcon: {
    fontSize: 50,
    marginRight: 15,
  },
  tierName: {
    fontSize: 28,
    fontWeight: '800',
  },
  statsContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  playButton: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 250,
    alignItems: 'center',
  },
  playButtonText: {
    color: COLORS.bgDark,
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: COLORS.solanaPurple,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 250,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    minWidth: 250,
    alignItems: 'center',
  },
  homeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  hiddenShareContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  shareCard: {
    width: 400,
    backgroundColor: COLORS.bgDark,
    padding: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
  },
  shareTitle: {
    color: COLORS.solanaGreen,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 5,
  },
  shareBiome: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  shareTierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  shareTierIcon: {
    fontSize: 40,
    marginRight: 10,
  },
  shareTierName: {
    fontSize: 22,
    fontWeight: '700',
  },
  shareStats: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 15,
  },
  shareStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareStatLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  shareStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
