import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeArea } from '../components/SafeArea';
import { COLORS } from '../game/config';
import { Tier, TowerSlot } from '../game/types';
import { calculateTier, saveRunResult } from '../storage/leaderboard';
import { formatTimeSeconds } from '../utils/formatTime';
import { ShareCard } from '../components/ShareCard';

// Conditionally import native-only modules
let ViewShot: any = null;
let Sharing: any = null;

if (Platform.OS !== 'web') {
  try {
    ViewShot = require('react-native-view-shot').default;
    Sharing = require('expo-sharing');
  } catch (e) {
    // Native modules not available
  }
}

interface GameOverScreenProps {
  time: number; // in ms
  wave: number;
  kills: number;
  slots: TowerSlot[];
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  time,
  wave,
  kills,
  slots,
  onPlayAgain,
  onHome,
}) => {
  const shareCardRef = useRef<any>(null);
  const [tier, setTier] = useState<Tier>('Attendee');
  const [isSharing, setIsSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  const timeInSeconds = Math.floor(time / 1000);
  const canShare = Platform.OS !== 'web' && ViewShot && Sharing;

  // Calculate tier and save result
  useEffect(() => {
    const calculatedTier = calculateTier(timeInSeconds);
    setTier(calculatedTier);

    if (!saved) {
      saveRunResult(time, wave, kills).then(() => {
        setSaved(true);
      });
    }
  }, [time, wave, kills, saved, timeInSeconds]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (isSharing || !canShare) return;

    setIsSharing(true);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        setIsSharing(false);
        return;
      }

      if (shareCardRef.current?.capture) {
        const uri = await shareCardRef.current.capture();
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Breakpoint Defense score!',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share failed', 'Could not share the score card');
    }

    setIsSharing(false);
  }, [isSharing, canShare]);

  // Render share card only on native
  const renderShareCard = () => {
    if (!canShare || !ViewShot) return null;

    return (
      <View style={styles.shareCardContainer}>
        <ViewShot
          ref={shareCardRef}
          options={{ format: 'png', quality: 1 }}
        >
          <ShareCard
            time={timeInSeconds}
            wave={wave}
            kills={kills}
            tier={tier}
            slots={slots}
          />
        </ViewShot>
      </View>
    );
  };

  return (
    <SafeArea style={styles.container}>
      {/* Hidden share card for capture (native only) */}
      {renderShareCard()}

      {/* Visible content */}
      <View style={styles.content}>
        <Text style={styles.gameOverText}>GAME OVER</Text>

        <View style={styles.tierContainer}>
          <Text style={styles.tierLabel}>TIER ACHIEVED</Text>
          <Text style={[styles.tierName, { color: getTierColor(tier) }]}>
            {tier.toUpperCase()}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatItem label="TIME" value={formatTimeSeconds(timeInSeconds)} large />
          <View style={styles.statsRow}>
            <StatItem label="WAVE" value={wave.toString()} />
            <StatItem label="KILLS" value={kills.toString()} />
          </View>
        </View>

        <View style={styles.buttons}>
          {canShare && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'SHARING...' : '📤 SHARE SCORE'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={onHome}>
            <Text style={styles.homeButtonText}>HOME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeArea>
  );
};

const StatItem: React.FC<{ label: string; value: string; large?: boolean }> = ({
  label,
  value,
  large,
}) => (
  <View style={[styles.statItem, large && styles.statItemLarge]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, large && styles.statValueLarge]}>{value}</Text>
  </View>
);

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
  shareCardContainer: {
    position: 'absolute',
    left: -1000,
    top: -1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gameOverText: {
    color: COLORS.danger,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 24,
  },
  tierContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  tierLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 2,
  },
  tierName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statsGrid: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItemLarge: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    borderColor: COLORS.primary,
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statValueLarge: {
    color: COLORS.primary,
    fontSize: 40,
  },
  buttons: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  playAgainText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textDim,
  },
  homeButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
