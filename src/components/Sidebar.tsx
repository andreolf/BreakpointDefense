/**
 * Sidebar Component
 * Right panel with tower selection, info, and game stats
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TOWER_CONFIGS, SIDEBAR_WIDTH, ECOSYSTEM_ICONS, getTier, TowerType } from '../game/config';
import { formatTime } from '../utils/formatTime';

interface SidebarProps {
  sol: number;
  time: number;
  wave: number;
  kills: number;
  baseHp: number;
  maxBaseHp: number;
  selectedSlotIndex: number | null;
  canPlace: boolean;
  onSelectTower: (type: TowerType) => void;
  onPause: () => void;
  isPaused: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sol,
  time,
  wave,
  kills,
  baseHp,
  maxBaseHp,
  selectedSlotIndex,
  canPlace,
  onSelectTower,
  onPause,
  isPaused,
}) => {
  const tier = getTier(time);
  const hpPercent = baseHp / maxBaseHp;
  const hpColor = hpPercent > 0.6 ? COLORS.hpGood : hpPercent > 0.3 ? COLORS.hpMedium : COLORS.hpLow;
  
  const towerTypes: TowerType[] = ['validator', 'jupiter', 'tensor'];

  return (
    <View style={styles.container}>
      {/* Header - SOL Balance */}
      <View style={styles.solSection}>
        <Text style={styles.solIcon}>{ECOSYSTEM_ICONS.sol}</Text>
        <Text style={styles.solValue}>{sol}</Text>
        <Text style={styles.solLabel}>SOL</Text>
      </View>
      
      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>⏱</Text>
          <Text style={styles.statValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🌊</Text>
          <Text style={styles.statValue}>{wave}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>💀</Text>
          <Text style={styles.statValue}>{kills}</Text>
        </View>
      </View>
      
      {/* Base HP */}
      <View style={styles.hpSection}>
        <Text style={styles.hpLabel}>NETWORK</Text>
        <View style={styles.hpBarBg}>
          <View style={[styles.hpBarFill, { width: `${hpPercent * 100}%`, backgroundColor: hpColor }]} />
        </View>
        <Text style={[styles.hpText, { color: hpColor }]}>{baseHp} HP</Text>
      </View>
      
      {/* Tier Badge */}
      <View style={[styles.tierBadge, { borderColor: tier.color }]}>
        <Text style={styles.tierIcon}>{tier.icon}</Text>
        <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Tower Selection - Always visible */}
      <Text style={styles.sectionTitle}>TOWERS</Text>
      
      {selectedSlotIndex !== null && canPlace ? (
        <Text style={styles.tapHint}>Tap to place:</Text>
      ) : (
        <Text style={styles.tapHint}>Select a slot first</Text>
      )}
      
      <ScrollView style={styles.towersScroll} showsVerticalScrollIndicator={false}>
        {towerTypes.map((type) => {
          const config = TOWER_CONFIGS[type];
          const canAfford = sol >= config.cost;
          const isDisabled = !canPlace || selectedSlotIndex === null || !canAfford;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.towerCard,
                { borderColor: canAfford ? config.color : COLORS.bgCardLight },
                isDisabled && styles.towerCardDisabled,
              ]}
              onPress={() => !isDisabled && onSelectTower(type)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              {/* Icon and name */}
              <View style={styles.towerHeader}>
                <Text style={styles.towerIcon}>{config.icon}</Text>
                <Text style={[styles.towerName, { color: canAfford ? config.color : COLORS.textMuted }]}>
                  {config.name}
                </Text>
              </View>
              
              {/* Description */}
              <Text style={styles.towerDesc}>{config.description}</Text>
              
              {/* Stats row */}
              <View style={styles.towerStats}>
                <Text style={styles.towerStat}>⚔️{config.damage[0]}</Text>
                <Text style={styles.towerStat}>🎯{config.range}</Text>
              </View>
              
              {/* Cost */}
              <View style={[styles.costBadge, { backgroundColor: canAfford ? config.color : COLORS.bgCardLight }]}>
                <Text style={[styles.costText, { color: canAfford ? COLORS.bgDark : COLORS.textMuted }]}>
                  {ECOSYSTEM_ICONS.sol} {config.cost}
                </Text>
              </View>
              
              {/* Special ability indicator */}
              {config.special && (
                <View style={styles.specialBadge}>
                  <Text style={styles.specialText}>
                    {config.special === 'chain' ? '🔗' : '💥'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Pause button */}
      <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
        <Text style={styles.pauseText}>{isPaused ? '▶ PLAY' : '⏸ PAUSE'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.bgCard,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.solanaPurple,
    padding: 10,
  },
  solSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 4,
  },
  solIcon: {
    fontSize: 14,
    color: COLORS.solanaGreen,
  },
  solValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
  },
  solLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  statsSection: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  hpSection: {
    marginBottom: 8,
  },
  hpLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 3,
  },
  hpBarBg: {
    height: 8,
    backgroundColor: COLORS.bgDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hpText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 10,
  },
  tierIcon: {
    fontSize: 12,
  },
  tierName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgCardLight,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  towersScroll: {
    flex: 1,
  },
  towerCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    position: 'relative',
  },
  towerCardDisabled: {
    opacity: 0.5,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  towerIcon: {
    fontSize: 16,
  },
  towerName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  towerDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  towerStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  towerStat: {
    fontSize: 9,
    color: COLORS.text,
  },
  costBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  costText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  specialBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  specialText: {
    fontSize: 10,
  },
  pauseButton: {
    backgroundColor: COLORS.bgCardLight,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  pauseText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default Sidebar;

