/**
 * Live List Screen
 * Shows active live sessions that can be spectated
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../game/config';
import { liveClient } from '../live/wsClient';
import { SessionInfo } from '../live/types';

interface LiveListScreenProps {
  onSelectSession: (sessionId: string) => void;
  onBack: () => void;
}

export const LiveListScreen: React.FC<LiveListScreenProps> = ({
  onSelectSession,
  onBack,
}) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    const list = await liveClient.getSessions();
    setSessions(list.filter(s => s.status === 'live')); // Only show live sessions
    setConnected(liveClient.isConnected());
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Initial load and refresh every 3 seconds
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
  }, [fetchSessions]);

  // Format time
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render session item
  const renderSession = ({ item }: { item: SessionInfo }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => onSelectSession(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.liveBadge}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>👁 {item.viewerCount}</Text>
      </View>

      <Text style={styles.alias}>{item.alias}</Text>
      <Text style={styles.biome}>{item.biome}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTime(item.time)}</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.wave}</Text>
          <Text style={styles.statLabel}>WAVE</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: item.baseHp > 50 ? COLORS.hpGood : COLORS.hpLow }]}>
            {item.baseHp}
          </Text>
          <Text style={styles.statLabel}>HP</Text>
        </View>
      </View>

      <Text style={styles.watchBtn}>👆 TAP TO WATCH</Text>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📺</Text>
      <Text style={styles.emptyTitle}>No Live Sessions</Text>
      <Text style={styles.emptyText}>
        {connected
          ? 'No one is streaming right now.\nStart a live run from the home screen!'
          : 'Unable to connect to live server.\nMake sure the server is running.'}
      </Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
        <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔴 LIVE</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: connected ? COLORS.hpGood : COLORS.hpLow }]} />
          <Text style={styles.statusText}>{connected ? 'Connected' : 'Offline'}</Text>
        </View>
      </View>

      {/* Sessions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.solanaPurple} />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          contentContainerStyle={sessions.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.solanaPurple}
            />
          }
        />
      )}
    </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardLight,
  },
  backBtn: {
    padding: 10,
  },
  backBtnText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  title: {
    color: COLORS.hpLow,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  sessionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.hpLow,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.hpLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  viewerCount: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  alias: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  biome: {
    color: COLORS.solanaPurple,
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  watchBtn: {
    color: COLORS.solanaGreen,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

