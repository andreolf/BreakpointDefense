import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { COLORS } from '../game/config';
import { RunResult, Tier } from '../game/types';
import { getLeaderboard } from '../storage/leaderboard';
import { formatTimeSeconds } from '../utils/formatTime';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<RunResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard();
    setEntries(data);
    setLoading(false);
  };

  const renderItem = ({ item, index }: { item: RunResult; index: number }) => (
    <View style={styles.entry}>
      <View style={styles.rank}>
        <Text style={[styles.rankText, index < 3 && styles.topRank]}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
        </Text>
      </View>

      <View style={styles.entryInfo}>
        <Text style={[styles.tierText, { color: getTierColor(item.tier as Tier) }]}>
          {item.tier}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.entryStats}>
        <Text style={styles.timeText}>{formatTimeSeconds(item.time)}</Text>
        <Text style={styles.statsText}>
          W{item.wave} • {item.kills} kills
        </Text>
      </View>
    </View>
  );

  return (
    <SafeArea style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LEADERBOARD</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>No runs yet!</Text>
          <Text style={styles.emptySubtext}>Play a game to get on the board</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeArea>
  );
};

function getTierColor(tier: Tier): string {
  switch (tier) {
    case 'Attendee':
      return '#888888';
    case 'Builder':
      return '#4CAF50';
    case 'Core Contributor':
      return '#2196F3';
    case 'Infra Guardian':
      return '#9C27B0';
    case 'Conference Legend':
      return COLORS.gold;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  placeholder: {
    width: 60,
  },
  list: {
    padding: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  rank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.textDim,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topRank: {
    fontSize: 24,
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tierText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  entryStats: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsText: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: COLORS.textDim,
    fontSize: 14,
    marginTop: 8,
  },
});

