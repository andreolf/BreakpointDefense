/**
 * Home Screen
 * With alias input, Go Live toggle, and LIVE button
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, BIOME } from '../game/config';

const ALIAS_KEY = '@breakpoint_alias';

interface HomeScreenProps {
  onPlay: (alias: string, goLive: boolean) => void;
  onLeaderboard: () => void;
  onLive: () => void;
}

// Generate random alias
function generateAlias(): string {
  return `anon_${Math.random().toString(36).substring(2, 6)}`;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onPlay, 
  onLeaderboard,
  onLive,
}) => {
  const [alias, setAlias] = useState('');
  const [goLive, setGoLive] = useState(false);

  // Load saved alias
  useEffect(() => {
    AsyncStorage.getItem(ALIAS_KEY).then((saved) => {
      setAlias(saved || generateAlias());
    });
  }, []);

  // Save alias when changed
  const handleAliasChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);
    setAlias(cleaned);
    AsyncStorage.setItem(ALIAS_KEY, cleaned);
  };

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

        {/* Alias Input */}
        <View style={styles.aliasContainer}>
          <Text style={styles.aliasLabel}>YOUR ALIAS</Text>
          <TextInput
            style={styles.aliasInput}
            value={alias}
            onChangeText={handleAliasChange}
            placeholder="Enter alias..."
            placeholderTextColor={COLORS.textMuted}
            maxLength={16}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Go Live Toggle */}
        <View style={styles.liveToggleContainer}>
          <View style={styles.liveToggleInfo}>
            <Text style={styles.liveToggleLabel}>🔴 GO LIVE</Text>
            <Text style={styles.liveToggleDesc}>Stream your run for others to watch</Text>
          </View>
          <Switch
            value={goLive}
            onValueChange={setGoLive}
            trackColor={{ false: COLORS.bgCardLight, true: COLORS.hpLow }}
            thumbColor={goLive ? COLORS.text : COLORS.textMuted}
          />
        </View>

        {/* Play Button */}
        <TouchableOpacity 
          style={[styles.playButton, goLive && styles.playButtonLive]} 
          onPress={() => onPlay(alias || generateAlias(), goLive)}
        >
          <Text style={styles.playButtonText}>
            {goLive ? '🔴 PLAY LIVE' : '▶️ PLAY'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Buttons */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onLive}>
            <Text style={styles.secondaryButtonText}>📺 LIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onLeaderboard}>
            <Text style={styles.secondaryButtonText}>🏆 Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Defend the Solana network!</Text>
          <Text style={styles.footerSubtext}>
            Click near path to build • Upgrade towers • Watch & predict live runs
          </Text>
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
    marginBottom: 30,
  },
  logoEmoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.solanaGreen,
    letterSpacing: 4,
    textShadowColor: COLORS.solanaPurple,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 22,
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
    marginBottom: 24,
  },
  biomeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  aliasContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  aliasLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  aliasInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgCardLight,
  },
  liveToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  liveToggleInfo: {
    flex: 1,
  },
  liveToggleLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  liveToggleDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
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
  playButtonLive: {
    backgroundColor: COLORS.hpLow,
    shadowColor: COLORS.hpLow,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
    marginHorizontal: 8,
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
    textAlign: 'center',
  },
});
