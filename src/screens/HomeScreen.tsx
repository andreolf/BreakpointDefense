/**
 * Home Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, BIOME } from '../game/config';

interface HomeScreenProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onLeaderboard }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🛡️</Text>
          <Text style={styles.title}>BREAKPOINT</Text>
          <Text style={styles.subtitle}>DEFENSE</Text>
        </View>

        {/* Biome badge */}
        <View style={styles.biomeBadge}>
          <Text style={styles.biomeText}>🎯 {BIOME.name}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Text style={styles.playButtonText}>▶️ PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onLeaderboard}>
          <Text style={styles.secondaryButtonText}>🏆 Leaderboard</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Defend the Solana network!</Text>
          <Text style={styles.footerSubtext}>Drag towers onto the path • Upgrade damage & range</Text>
        </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.solanaGreen,
    letterSpacing: 4,
    textShadowColor: COLORS.solanaPurple,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 8,
    marginTop: -5,
  },
  biomeBadge: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
    marginBottom: 40,
  },
  biomeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: COLORS.solanaGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  playButtonText: {
    color: COLORS.bgDark,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
    minWidth: 250,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  footerSubtext: {
    color: COLORS.textMuted,
    fontSize: 11,
    opacity: 0.7,
  },
});
