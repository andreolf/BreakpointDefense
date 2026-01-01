/**
 * Leaderboard Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RunResult } from '../game/types';
import { COLORS } from '../game/config';
import { loadRuns } from '../storage/leaderboard';

interface LeaderboardScreenProps {
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [runs, setRuns] = useState<RunResult[]>([]);

  useEffect(() => {
    loadRuns().then(setRuns);
  }, []);

  const renderItem = ({ item, index }: { item: RunResult; index: number }) => (
    <View style={styles.runRow}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.tierIcon}>{item.tierIcon}</Text>
      <View style={styles.runInfo}>
        <Text style={styles.tierName}>{item.tierName}</Text>
        <Text style={styles.runDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.runStats}>
        <Text style={styles.time}>{formatTime(item.survivalTime)}</Text>
        <Text style={styles.details}>
          🌊 {item.wave} • 💀 {item.kills}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      {runs.length > 0 ? (
        <FlatList
          data={runs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No runs yet!</Text>
          <Text style={styles.emptySubtext}>Play a game to see your stats here</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardLight,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: COLORS.solanaGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  placeholder: {
    width: 70,
  },
  list: {
    padding: 16,
  },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rank: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
    width: 40,
  },
  tierIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  runInfo: {
    flex: 1,
  },
  tierName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  runDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  runStats: {
    alignItems: 'flex-end',
  },
  time: {
    color: COLORS.solanaGreen,
    fontSize: 18,
    fontWeight: '700',
  },
  details: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
