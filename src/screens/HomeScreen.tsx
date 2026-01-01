/**
 * HomeScreen
 * Main menu with Solana Breakpoint theming
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
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
  Path,
} from 'react-native-svg';
import { SafeArea } from '../components/SafeArea';
import { COLORS, TOWER_CONFIGS, ENEMY_CONFIGS, TIERS, ECOSYSTEM_ICONS } from '../game/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onLeaderboard }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <SafeArea style={styles.container}>
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0D0D0D" />
              <Stop offset="50%" stopColor="#0A0A1A" />
              <Stop offset="100%" stopColor="#050510" />
            </LinearGradient>
            <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.3" />
              <Stop offset="50%" stopColor={COLORS.solanaPink} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.3" />
            </LinearGradient>
          </Defs>
          
          {/* Background */}
          <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGrad)" />
          
          {/* Grid pattern */}
          {[...Array(20)].map((_, i) => (
            <G key={`grid${i}`}>
              <Path
                d={`M ${i * 40} 0 L ${i * 40} ${SCREEN_HEIGHT}`}
                stroke={COLORS.solanaPurple}
                strokeWidth={0.5}
                strokeOpacity={0.1}
              />
              <Path
                d={`M 0 ${i * 40} L ${SCREEN_WIDTH} ${i * 40}`}
                stroke={COLORS.solanaPurple}
                strokeWidth={0.5}
                strokeOpacity={0.1}
              />
            </G>
          ))}
          
          {/* Decorative circles */}
          <Circle cx={SCREEN_WIDTH * 0.1} cy={SCREEN_HEIGHT * 0.2} r={100} fill={COLORS.solanaPurple} opacity={0.05} />
          <Circle cx={SCREEN_WIDTH * 0.9} cy={SCREEN_HEIGHT * 0.3} r={150} fill={COLORS.solanaGreen} opacity={0.05} />
          <Circle cx={SCREEN_WIDTH * 0.5} cy={SCREEN_HEIGHT * 0.8} r={200} fill={COLORS.solanaPink} opacity={0.03} />
          
          {/* Solana logos */}
          <G transform={`translate(${SCREEN_WIDTH * 0.1}, ${SCREEN_HEIGHT * 0.15})`} opacity={0.1}>
            <Polygon points="0,15 8,0 50,0 42,15" fill={COLORS.solanaGreen} />
            <Polygon points="0,25 8,15 50,15 42,25" fill={COLORS.solanaPurple} />
            <Polygon points="0,35 8,25 50,25 42,35" fill={COLORS.solanaPink} />
          </G>
          
          <G transform={`translate(${SCREEN_WIDTH * 0.75}, ${SCREEN_HEIGHT * 0.7})`} opacity={0.08}>
            <Polygon points="0,20 10,0 70,0 60,20" fill={COLORS.solanaGreen} />
            <Polygon points="0,35 10,20 70,20 60,35" fill={COLORS.solanaPurple} />
            <Polygon points="0,50 10,35 70,35 60,50" fill={COLORS.solanaPink} />
          </G>
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* Solana-style logo mark */}
            <Svg width={80} height={60} viewBox="0 0 80 60">
              <Defs>
                <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={COLORS.solanaGreen} />
                  <Stop offset="50%" stopColor={COLORS.solanaPurple} />
                  <Stop offset="100%" stopColor={COLORS.solanaPink} />
                </LinearGradient>
              </Defs>
              <Polygon points="0,15 10,0 70,0 60,15" fill="url(#logoGrad)" />
              <Polygon points="0,30 10,18 70,18 60,30" fill="url(#logoGrad)" opacity={0.8} />
              <Polygon points="0,45 10,33 70,33 60,45" fill="url(#logoGrad)" opacity={0.6} />
            </Svg>
          </View>
          
          <Text style={styles.title}>BREAKPOINT</Text>
          <Text style={styles.subtitle}>DEFENSE</Text>
          <Text style={styles.tagline}>Defend the Network. Survive the FUD.</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          {/* Play Button */}
          <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.8}>
            <View style={styles.playButtonInner}>
              <Text style={styles.playButtonText}>▶ PLAY</Text>
            </View>
          </TouchableOpacity>

          {/* Secondary Buttons */}
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onLeaderboard}>
              <Text style={styles.secondaryButtonIcon}>🏆</Text>
              <Text style={styles.secondaryButtonText}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowHowToPlay(true)}>
              <Text style={styles.secondaryButtonIcon}>📖</Text>
              <Text style={styles.secondaryButtonText}>How to Play</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Preview */}
        <View style={styles.statsPreview}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statLabel}>3 Towers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👾</Text>
            <Text style={styles.statLabel}>3 Enemies</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎖️</Text>
            <Text style={styles.statLabel}>5 Tiers</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Built for Solana Breakpoint</Text>
        </View>
      </View>

      {/* How to Play Modal */}
      <Modal
        visible={showHowToPlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>How to Play</Text>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Objective</Text>
                <Text style={styles.sectionText}>
                  Defend the Solana network from waves of FUD, Rug Pulls, and Network Congestion. 
                  Survive as long as possible to climb the tier ranks!
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Towers</Text>
                {(['validator', 'jupiter', 'tensor'] as const).map(type => {
                  const config = TOWER_CONFIGS[type];
                  return (
                    <View key={type} style={styles.itemRow}>
                      <Text style={[styles.itemIcon, { color: config.color }]}>{config.icon}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: config.color }]}>{config.name}</Text>
                        <Text style={styles.itemDesc}>{config.description}</Text>
                        <Text style={styles.itemCost}>{ECOSYSTEM_ICONS.sol} {config.cost} SOL</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👾 Enemies</Text>
                {(['fud', 'rugpull', 'congestion'] as const).map(type => {
                  const config = ENEMY_CONFIGS[type];
                  return (
                    <View key={type} style={styles.itemRow}>
                      <Text style={[styles.itemIcon, { color: config.color }]}>{config.icon}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: config.color }]}>{config.name}</Text>
                        <Text style={styles.itemDesc}>{config.description}</Text>
                        <Text style={styles.itemCost}>HP: {config.hp} | Reward: {config.reward} SOL</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎖️ Tier Ranks</Text>
                {TIERS.map((tier, i) => (
                  <View key={i} style={styles.tierRow}>
                    <Text style={styles.tierIcon}>{tier.icon}</Text>
                    <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                    <Text style={styles.tierTime}>{tier.minTime}s+</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏱️ Time Marker Rule</Text>
                <Text style={styles.sectionText}>
                  A marker moves along the path. You can only place towers AHEAD of the marker. 
                  Once the marker passes a slot, it becomes locked forever. Plan ahead!
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHowToPlay(false)}
            >
              <Text style={styles.closeButtonText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.solanaGreen,
    letterSpacing: 12,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 16,
    fontStyle: 'italic',
  },
  buttonsSection: {
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    backgroundColor: COLORS.solanaPurple,
    borderRadius: 40,
    padding: 4,
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonInner: {
    backgroundColor: COLORS.solanaPurple,
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 4,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  secondaryButtonIcon: {
    fontSize: 16,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    opacity: 0.6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
    marginBottom: 12,
  },
  sectionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 16,
  },
  itemCost: {
    color: COLORS.solanaGreen,
    fontSize: 10,
    fontWeight: '600',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  tierIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  tierName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  tierTime: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: COLORS.solanaPurple,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 16,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
