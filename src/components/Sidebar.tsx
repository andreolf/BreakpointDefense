/**
 * Sidebar Component
 * Tower selection, upgrades, and game info
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TOWER_CONFIGS, SIDEBAR_WIDTH, ECOSYSTEM_ICONS, getTier, TowerType, GAME_CONFIG } from '../game/config';
import { Tower } from '../game/types';
import { formatTime } from '../utils/formatTime';

interface SidebarProps {
  sol: number;
  time: number;
  wave: number;
  kills: number;
  baseHp: number;
  maxBaseHp: number;
  selectedTowerType: TowerType | null;
  selectedTower: Tower | null;
  towerCount: number;
  onSelectTowerType: (type: TowerType) => void;
  onUpgrade: () => void;
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
  selectedTowerType,
  selectedTower,
  towerCount,
  onSelectTowerType,
  onUpgrade,
  onPause,
  isPaused,
}) => {
  const tier = getTier(time);
  const hpPercent = baseHp / maxBaseHp;
  const hpColor = hpPercent > 0.6 ? COLORS.hpGood : hpPercent > 0.3 ? COLORS.hpMedium : COLORS.hpLow;
  
  const towerTypes: TowerType[] = ['validator', 'jupiter', 'tensor'];
  
  // Selected tower info for upgrade
  const selectedTowerConfig = selectedTower ? TOWER_CONFIGS[selectedTower.type] : null;
  const canUpgrade = selectedTower && selectedTower.level < GAME_CONFIG.maxTowerLevel;
  const upgradeCost = selectedTower && canUpgrade 
    ? selectedTowerConfig!.upgradeCost[selectedTower.level - 1] 
    : 0;
  const canAffordUpgrade = sol >= upgradeCost;

  return (
    <View style={styles.container}>
      {/* SOL Balance */}
      <View style={styles.solSection}>
        <Text style={styles.solIcon}>{ECOSYSTEM_ICONS.sol}</Text>
        <Text style={styles.solValue}>{sol}</Text>
        <Text style={styles.solLabel}>SOL</Text>
      </View>
      
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⏱</Text>
          <Text style={styles.statValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🌊</Text>
          <Text style={styles.statValue}>{wave}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>💀</Text>
          <Text style={styles.statValue}>{kills}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🗼</Text>
          <Text style={styles.statValue}>{towerCount}/{GAME_CONFIG.maxTowers}</Text>
        </View>
      </View>
      
      {/* HP Bar */}
      <View style={styles.hpSection}>
        <View style={styles.hpBarBg}>
          <View style={[styles.hpBarFill, { width: `${hpPercent * 100}%`, backgroundColor: hpColor }]} />
        </View>
        <Text style={[styles.hpText, { color: hpColor }]}>{baseHp} HP</Text>
      </View>
      
      {/* Tier */}
      <View style={[styles.tierBadge, { borderColor: tier.color }]}>
        <Text style={styles.tierIcon}>{tier.icon}</Text>
        <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
      </View>
      
      <View style={styles.divider} />
      
      {/* Tower info for selected tower (upgrade mode) */}
      {selectedTower && selectedTowerConfig && (
        <View style={styles.upgradeSection}>
          <Text style={styles.sectionTitle}>SELECTED TOWER</Text>
          
          <View style={styles.selectedTowerInfo}>
            <Text style={styles.selectedTowerIcon}>{selectedTowerConfig.icon}</Text>
            <Text style={[styles.selectedTowerName, { color: selectedTowerConfig.color }]}>
              {selectedTowerConfig.name} L{selectedTower.level}
            </Text>
          </View>
          
          {/* Current stats */}
          <View style={styles.towerStatsGrid}>
            <View style={styles.towerStatItem}>
              <Text style={styles.towerStatLabel}>DMG</Text>
              <Text style={styles.towerStatValue}>{selectedTowerConfig.damage[selectedTower.level - 1]}</Text>
            </View>
            <View style={styles.towerStatItem}>
              <Text style={styles.towerStatLabel}>RNG</Text>
              <Text style={styles.towerStatValue}>{selectedTowerConfig.range[selectedTower.level - 1]}</Text>
            </View>
            <View style={styles.towerStatItem}>
              <Text style={styles.towerStatLabel}>SPD</Text>
              <Text style={styles.towerStatValue}>{selectedTowerConfig.fireRate[selectedTower.level - 1]}/s</Text>
            </View>
          </View>
          
          {/* Upgrade button */}
          {canUpgrade ? (
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: canAffordUpgrade ? selectedTowerConfig.color : COLORS.bgCardLight }
              ]}
              onPress={onUpgrade}
              disabled={!canAffordUpgrade}
            >
              <Text style={[styles.upgradeButtonText, { color: canAffordUpgrade ? COLORS.bgDark : COLORS.textMuted }]}>
                ⬆️ UPGRADE L{selectedTower.level + 1}
              </Text>
              <Text style={[styles.upgradeCost, { color: canAffordUpgrade ? COLORS.bgDark : COLORS.textMuted }]}>
                {ECOSYSTEM_ICONS.sol} {upgradeCost}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.maxLevelBadge}>
              <Text style={styles.maxLevelText}>★ MAX LEVEL</Text>
            </View>
          )}
          
          {/* Upgrade preview */}
          {canUpgrade && (
            <View style={styles.upgradePreview}>
              <Text style={styles.upgradePreviewTitle}>After upgrade:</Text>
              <Text style={styles.upgradePreviewText}>
                DMG: {selectedTowerConfig.damage[selectedTower.level - 1]} → {selectedTowerConfig.damage[selectedTower.level]}
              </Text>
              <Text style={styles.upgradePreviewText}>
                RNG: {selectedTowerConfig.range[selectedTower.level - 1]} → {selectedTowerConfig.range[selectedTower.level]}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
        </View>
      )}
      
      {/* Tower Selection */}
      <Text style={styles.sectionTitle}>
        {selectedTower ? 'OR PLACE NEW' : 'SELECT TOWER'}
      </Text>
      
      <ScrollView style={styles.towersScroll} showsVerticalScrollIndicator={false}>
        {towerTypes.map((type) => {
          const config = TOWER_CONFIGS[type];
          const canAfford = sol >= config.cost;
          const isSelected = selectedTowerType === type;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.towerCard,
                { borderColor: isSelected ? COLORS.text : (canAfford ? config.color : COLORS.bgCardLight) },
                isSelected && styles.towerCardSelected,
                !canAfford && styles.towerCardDisabled,
              ]}
              onPress={() => onSelectTowerType(type)}
              activeOpacity={0.7}
            >
              <View style={styles.towerHeader}>
                <Text style={styles.towerIcon}>{config.icon}</Text>
                <Text style={[styles.towerName, { color: canAfford ? config.color : COLORS.textMuted }]}>
                  {config.name}
                </Text>
                {config.special && (
                  <Text style={styles.specialBadge}>
                    {config.special === 'chain' ? '🔗' : '💥'}
                  </Text>
                )}
              </View>
              
              <View style={styles.towerMiniStats}>
                <Text style={styles.towerMiniStat}>⚔️{config.damage[0]}</Text>
                <Text style={styles.towerMiniStat}>🎯{config.range[0]}</Text>
              </View>
              
              <View style={[styles.costBadge, { backgroundColor: canAfford ? config.color : COLORS.bgCardLight }]}>
                <Text style={[styles.costText, { color: canAfford ? COLORS.bgDark : COLORS.textMuted }]}>
                  {ECOSYSTEM_ICONS.sol} {config.cost}
                </Text>
              </View>
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
    padding: 8,
  },
  solSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
    gap: 3,
  },
  solIcon: {
    fontSize: 13,
    color: COLORS.solanaGreen,
  },
  solValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.solanaGreen,
  },
  solLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  hpSection: {
    marginBottom: 6,
  },
  hpBarBg: {
    height: 6,
    backgroundColor: COLORS.bgDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hpText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  tierIcon: {
    fontSize: 11,
  },
  tierName: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgCardLight,
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  // Upgrade section
  upgradeSection: {
    marginBottom: 4,
  },
  selectedTowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  selectedTowerIcon: {
    fontSize: 20,
  },
  selectedTowerName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  towerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  towerStatItem: {
    alignItems: 'center',
  },
  towerStatLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  towerStatValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  upgradeButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  upgradeButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  upgradeCost: {
    fontSize: 10,
  },
  maxLevelBadge: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  maxLevelText: {
    color: COLORS.bgDark,
    fontSize: 11,
    fontWeight: 'bold',
  },
  upgradePreview: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  upgradePreviewTitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  upgradePreviewText: {
    fontSize: 9,
    color: COLORS.solanaGreen,
  },
  // Tower cards
  towersScroll: {
    flex: 1,
  },
  towerCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
    borderWidth: 2,
  },
  towerCardSelected: {
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
  },
  towerCardDisabled: {
    opacity: 0.5,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  towerIcon: {
    fontSize: 14,
  },
  towerName: {
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  specialBadge: {
    fontSize: 9,
  },
  towerMiniStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  towerMiniStat: {
    fontSize: 9,
    color: COLORS.text,
  },
  costBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  costText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: COLORS.bgCardLight,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  pauseText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default Sidebar;
