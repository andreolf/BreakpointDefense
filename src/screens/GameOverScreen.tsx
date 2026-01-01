/**
 * GameOverScreen
 * Shows results with Solana theming and share functionality
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Polygon,
  G,
} from 'react-native-svg';
import { SafeArea } from '../components/SafeArea';
import { COLORS, getTier, BIOME, ECOSYSTEM_ICONS } from '../game/config';
import { formatTime } from '../utils/formatTime';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Conditionally import native modules (not available on web)
let ViewShot: any = null;
let captureRef: any = null;
let shareAsync: any = null;

if (Platform.OS !== 'web') {
  try {
    ViewShot = require('react-native-view-shot').default;
    captureRef = require('react-native-view-shot').captureRef;
    shareAsync = require('expo-sharing').shareAsync;
  } catch (e) {
    console.log('Native sharing modules not available');
  }
}

interface GameOverScreenProps {
  survivalTime: number;
  wave: number;
  kills: number;
  solEarned: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  survivalTime,
  wave,
  kills,
  solEarned,
  onPlayAgain,
  onHome,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<any>(null);
  const tier = getTier(survivalTime);

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      // Web sharing via clipboard
      const shareText = `🛡️ ${BIOME.name} Defense\n\n⏱️ ${formatTime(survivalTime)}\n🏆 ${tier.icon} ${tier.name}\n🌊 Wave ${wave}\n💀 ${kills} Kills\n\n#SolanaBreakpoint #TowerDefense`;
      
      try {
        await navigator.clipboard.writeText(shareText);
        Alert.alert('Copied!', 'Share text copied to clipboard');
      } catch (e) {
        Alert.alert('Share', shareText);
      }
      return;
    }

    // Native sharing with screenshot
    if (!captureRef || !shareAsync || !shareCardRef.current) {
      Alert.alert('Error', 'Sharing not available');
      return;
    }

    setIsSharing(true);
    try {
      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1,
      });
      await shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your score',
      });
    } catch (e) {
      console.error('Share error:', e);
      Alert.alert('Error', 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const ShareCardContent = () => (
    <View style={styles.shareCard}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.bgDark} />
            <Stop offset="100%" stopColor="#0A0A20" />
          </LinearGradient>
          <LinearGradient id="tierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} />
            <Stop offset="100%" stopColor={tier.color} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#cardBg)" />
        
        {/* Decorative elements */}
        <Circle cx="10%" cy="20%" r={50} fill={COLORS.solanaPurple} opacity={0.1} />
        <Circle cx="90%" cy="80%" r={80} fill={COLORS.solanaGreen} opacity={0.1} />
      </Svg>
      
      {/* Share card content */}
      <View style={styles.shareCardContent}>
        {/* Header */}
        <View style={styles.shareHeader}>
          <Svg width={40} height={30} viewBox="0 0 40 30">
            <Polygon points="0,8 5,0 35,0 30,8" fill={COLORS.solanaGreen} />
            <Polygon points="0,15 5,9 35,9 30,15" fill={COLORS.solanaPurple} />
            <Polygon points="0,22 5,16 35,16 30,22" fill={COLORS.solanaPink} />
          </Svg>
          <Text style={styles.shareTitle}>{BIOME.name}</Text>
          <Text style={styles.shareSubtitle}>DEFENSE</Text>
        </View>
        
        {/* Tier badge */}
        <View style={[styles.shareTierBadge, { borderColor: tier.color }]}>
          <Text style={styles.shareTierIcon}>{tier.icon}</Text>
          <Text style={[styles.shareTierName, { color: tier.color }]}>{tier.name}</Text>
        </View>
        
        {/* Stats */}
        <View style={styles.shareStats}>
          <View style={styles.shareStatRow}>
            <Text style={styles.shareStatLabel}>⏱️ Time</Text>
            <Text style={styles.shareStatValue}>{formatTime(survivalTime)}</Text>
          </View>
          <View style={styles.shareStatRow}>
            <Text style={styles.shareStatLabel}>🌊 Wave</Text>
            <Text style={styles.shareStatValue}>{wave}</Text>
          </View>
          <View style={styles.shareStatRow}>
            <Text style={styles.shareStatLabel}>💀 Kills</Text>
            <Text style={styles.shareStatValue}>{kills}</Text>
          </View>
          <View style={styles.shareStatRow}>
            <Text style={styles.shareStatLabel}>{ECOSYSTEM_ICONS.sol} SOL</Text>
            <Text style={[styles.shareStatValue, { color: COLORS.solanaGreen }]}>{solEarned}</Text>
          </View>
        </View>
        
        {/* Footer */}
        <Text style={styles.shareFooter}>#SolanaBreakpoint</Text>
      </View>
    </View>
  );

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
          <Circle cx={SCREEN_WIDTH * 0.2} cy={SCREEN_HEIGHT * 0.3} r={100} fill={tier.color} opacity={0.05} />
          <Circle cx={SCREEN_WIDTH * 0.8} cy={SCREEN_HEIGHT * 0.7} r={150} fill={COLORS.solanaPurple} opacity={0.05} />
        </Svg>
      </View>

      <View style={styles.content}>
        {/* Game Over Title */}
        <View style={styles.titleSection}>
          <Text style={styles.gameOverText}>NETWORK DOWN</Text>
          <Text style={styles.gameOverSubtext}>The attackers got through</Text>
        </View>

        {/* Result Card */}
        <View style={styles.resultCard}>
          {/* Tier Display */}
          <View style={styles.tierSection}>
            <Text style={styles.tierIcon}>{tier.icon}</Text>
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
            <Text style={styles.tierDesc}>{tier.description}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{formatTime(survivalTime)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>WAVE</Text>
              <Text style={styles.statValue}>{wave}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>KILLS</Text>
              <Text style={styles.statValue}>{kills}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SOL EARNED</Text>
              <Text style={[styles.statValue, { color: COLORS.solanaGreen }]}>
                {ECOSYSTEM_ICONS.sol} {solEarned}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Text style={styles.playAgainText}>▶ PLAY AGAIN</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? '...' : '📤 Share'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={onHome}>
              <Text style={styles.homeButtonText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hidden share card for capture */}
      {Platform.OS !== 'web' && ViewShot && (
        <View style={styles.hiddenShareCard}>
          <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 1 }}>
            <ShareCardContent />
          </ViewShot>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  titleSection: {
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.hpLow,
    letterSpacing: 4,
  },
  gameOverSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  tierSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardLight,
  },
  tierIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tierDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  buttonsSection: {
    gap: 16,
  },
  playAgainButton: {
    backgroundColor: COLORS.solanaPurple,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 2,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.solanaGreen,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.solanaGreen,
  },
  homeButton: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Hidden share card
  hiddenShareCard: {
    position: 'absolute',
    top: -1000,
    left: -1000,
  },
  shareCard: {
    width: 360,
    height: 640,
    backgroundColor: COLORS.bgDark,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareCardContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareHeader: {
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    letterSpacing: 2,
  },
  shareSubtitle: {
    fontSize: 14,
    color: COLORS.solanaGreen,
    letterSpacing: 4,
  },
  shareTierBadge: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shareTierIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  shareTierName: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  shareStats: {
    width: '100%',
    gap: 12,
  },
  shareStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shareStatLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  shareStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  shareFooter: {
    fontSize: 12,
    color: COLORS.textMuted,
    opacity: 0.7,
  },
});

export default GameOverScreen;
