/**
 * LeaderboardScreen
 * Displays top 10 runs with Solana theming
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { SafeArea } from '../components/SafeArea';
import { RunResult } from '../game/types';
import { loadLeaderboard } from '../storage/leaderboard';
import { COLORS, ECOSYSTEM_ICONS } from '../game/config';
import { formatTime } from '../utils/formatTime';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard()
      .then(setRuns)
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item, index }: { item: RunResult; index: number }) => {
    const isTop3 = index < 3;
    const rankColors = [COLORS.solanaGreen, COLORS.solanaPurple, COLORS.solanaPink];
    const rankColor = isTop3 ? rankColors[index] : COLORS.textMuted;
    
    return (
      <View style={[styles.runItem, isTop3 && styles.runItemTop3]}>
        {/* Rank */}
        <View style={[styles.rankBadge, { borderColor: rankColor }]}>
          <Text style={[styles.rankText, { color: rankColor }]}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </Text>
        </View>
        
        {/* Main info */}
        <View style={styles.runInfo}>
          <View style={styles.runHeader}>
            <Text style={styles.tierIcon}>{item.tierIcon}</Text>
            <Text style={styles.tierName}>{item.tierName}</Text>
          </View>
          <Text style={styles.runTime}>{formatTime(item.survivalTime)}</Text>
        </View>
        
        {/* Stats */}
        <View style={styles.runStats}>
          <View style={styles.runStat}>
            <Text style={styles.runStatLabel}>Wave</Text>
            <Text style={styles.runStatValue}>{item.wave}</Text>
          </View>
          <View style={styles.runStat}>
            <Text style={styles.runStatLabel}>Kills</Text>
            <Text style={styles.runStatValue}>{item.kills}</Text>
          </View>
          <View style={styles.runStat}>
            <Text style={styles.runStatLabel}>{ECOSYSTEM_ICONS.sol}</Text>
            <Text style={[styles.runStatValue, { color: COLORS.solanaGreen }]}>
              {item.solEarned}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeArea style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0D0D0D" />
              <Stop offset="100%" stopColor="#050510" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGrad)" />
          <Circle cx={SCREEN_WIDTH * 0.8} cy={100} r={100} fill={COLORS.solanaPurple} opacity={0.05} />
          <Circle cx={SCREEN_WIDTH * 0.2} cy={SCREEN_HEIGHT * 0.8} r={150} fill={COLORS.solanaGreen} opacity={0.05} />
        </Svg>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>🏆 Leaderboard</Text>
          <Text style={styles.subtitle}>Top Defenders</Text>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : runs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Runs Yet</Text>
            <Text style={styles.emptyText}>
              Play a game to get on the leaderboard!
            </Text>
          </View>
        ) : (
          <FlatList
            data={runs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingBottom: 40,
  },
  runItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  runItemTop3: {
    borderColor: COLORS.solanaPurple,
    borderWidth: 2,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  runInfo: {
    flex: 1,
  },
  runHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tierIcon: {
    fontSize: 16,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  runTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
  },
  runStats: {
    flexDirection: 'row',
    gap: 16,
  },
  runStat: {
    alignItems: 'center',
  },
  runStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  runStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
