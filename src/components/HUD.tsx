/**
 * HUD Component
 * Game heads-up display with Solana theming
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Circle, Path } from 'react-native-svg';
import { COLORS, getTier, ECOSYSTEM_ICONS } from '../game/config';
import { formatTime } from '../utils/formatTime';

interface HUDProps {
  time: number;
  sol: number;
  baseHp: number;
  maxBaseHp: number;
  wave: number;
  kills: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  time,
  sol,
  baseHp,
  maxBaseHp,
  wave,
  kills,
  isPaused,
  onPause,
  onResume,
}) => {
  const tier = getTier(time);
  const hpPercent = baseHp / maxBaseHp;
  
  const hpColor = hpPercent > 0.6 
    ? COLORS.hpGood 
    : hpPercent > 0.3 
      ? COLORS.hpMedium 
      : COLORS.hpLow;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.bgContainer}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="hudBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.bgDark} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={COLORS.bgCard} stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#hudBg)" />
        </Svg>
      </View>
      
      <View style={styles.content}>
        {/* Left section: Time & Tier */}
        <View style={styles.leftSection}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>TIME</Text>
            <Text style={styles.timeValue}>{formatTime(time)}</Text>
          </View>
          <View style={[styles.tierBadge, { borderColor: tier.color }]}>
            <Text style={styles.tierIcon}>{tier.icon}</Text>
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
          </View>
        </View>
        
        {/* Center section: Wave & Kills */}
        <View style={styles.centerSection}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>WAVE</Text>
            <Text style={styles.statValue}>{wave}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>KILLS</Text>
            <Text style={styles.statValue}>{kills}</Text>
          </View>
        </View>
        
        {/* Right section: SOL & HP */}
        <View style={styles.rightSection}>
          {/* SOL balance */}
          <View style={styles.solContainer}>
            <Text style={styles.solIcon}>{ECOSYSTEM_ICONS.sol}</Text>
            <Text style={styles.solValue}>{sol}</Text>
            <Text style={styles.solLabel}>SOL</Text>
          </View>
          
          {/* Base HP */}
          <View style={styles.hpContainer}>
            <View style={styles.hpBarBg}>
              <View
                style={[
                  styles.hpBarFill,
                  {
                    width: `${hpPercent * 100}%`,
                    backgroundColor: hpColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.hpText, { color: hpColor }]}>
              {baseHp} HP
            </Text>
          </View>
          
          {/* Pause button */}
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={isPaused ? onResume : onPause}
          >
            <View style={styles.pauseIcon}>
              {isPaused ? (
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path
                    d="M4 2 L14 8 L4 14 Z"
                    fill={COLORS.solanaGreen}
                  />
                </Svg>
              ) : (
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Rect x={2} y={2} width={4} height={12} fill={COLORS.text} />
                  <Rect x={10} y={2} width={4} height={12} fill={COLORS.text} />
                </Svg>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom accent line */}
      <View style={styles.accentLine}>
        <Svg width="100%" height={3}>
          <Defs>
            <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={COLORS.solanaPurple} />
              <Stop offset="50%" stopColor={COLORS.solanaPink} />
              <Stop offset="100%" stopColor={COLORS.solanaGreen} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height={3} fill="url(#accentGrad)" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    position: 'relative',
  },
  bgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  timeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  timeValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tierIcon: {
    fontSize: 12,
  },
  tierName: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerSection: {
    flexDirection: 'row',
    gap: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  solContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
  },
  solIcon: {
    fontSize: 14,
    color: COLORS.solanaGreen,
  },
  solValue: {
    color: COLORS.solanaGreen,
    fontSize: 16,
    fontWeight: 'bold',
  },
  solLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  hpContainer: {
    alignItems: 'flex-end',
  },
  hpBarBg: {
    width: 60,
    height: 8,
    backgroundColor: COLORS.bgDark,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.bgCard,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hpText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  pauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  pauseIcon: {
    width: 16,
    height: 16,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default HUD;
