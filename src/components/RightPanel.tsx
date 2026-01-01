/**
 * Right Panel - Stats & Tower Upgrades
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { GameState, Tower } from '../game/types';
import {
  COLORS,
  TOWER_CONFIGS,
  SIDEBAR_WIDTH,
  GAME_CONFIG,
  getTier,
} from '../game/config';

interface RightPanelProps {
  gameState: GameState;
  selectedTower: Tower | null;
  canUpgradeLevel: boolean;
  canUpgradeRange: boolean;
  onUpgradeLevel: () => void;
  onUpgradeRange: () => void;
  onPause: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  gameState,
  selectedTower,
  canUpgradeLevel,
  canUpgradeRange,
  onUpgradeLevel,
  onUpgradeRange,
  onPause,
}) => {
  const tier = getTier(gameState.elapsedTime);
  const hpPercent = (gameState.baseHp / gameState.maxBaseHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Pause Button */}
        <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
          <Text style={styles.pauseText}>⏸</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>◎ SOL</Text>
          <Text style={styles.statValue}>{gameState.sol}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>⏱ Time</Text>
          <Text style={styles.statValue}>{formatTime(gameState.elapsedTime)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🌊 Wave</Text>
          <Text style={styles.statValue}>{gameState.wave}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>💀 Kills</Text>
          <Text style={styles.statValue}>{gameState.kills}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🗼 Towers</Text>
          <Text style={styles.statValue}>{gameState.towers.length}/{GAME_CONFIG.maxTowers}</Text>
        </View>

        {/* HP Bar */}
        <View style={styles.hpContainer}>
          <Text style={styles.hpLabel}>Network HP</Text>
          <View style={styles.hpBar}>
            <View style={[styles.hpFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
          </View>
          <Text style={styles.hpText}>{gameState.baseHp}/{gameState.maxBaseHp}</Text>
        </View>

        {/* Tier */}
        <View style={styles.tierContainer}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Selected Tower */}
        {selectedTower ? (
          <View style={styles.towerInfo}>
            <Text style={styles.sectionTitle}>Selected Tower</Text>
            
            {(() => {
              const config = TOWER_CONFIGS[selectedTower.type];
              const levelDmg = config.damage[selectedTower.level - 1];
              const levelFR = config.fireRate[selectedTower.level - 1];
              const rangeVal = config.rangeLevels[selectedTower.rangeLevel - 1];
              
              return (
                <>
                  <View style={[styles.towerIcon, { backgroundColor: config.color }]}>
                    <Text style={styles.towerEmoji}>{config.icon}</Text>
                  </View>
                  <Text style={styles.towerName}>{config.name}</Text>
                  
                  {/* Current Stats */}
                  <View style={styles.statsBox}>
                    <Text style={styles.statsLabel}>
                      ⚔️ DMG: {levelDmg} (Lv {selectedTower.level})
                    </Text>
                    <Text style={styles.statsLabel}>
                      ⚡ Rate: {levelFR}/s
                    </Text>
                    <Text style={styles.statsLabel}>
                      📡 Range: {rangeVal} (Lv {selectedTower.rangeLevel})
                    </Text>
                  </View>

                  {/* Upgrade Level */}
                  {selectedTower.level < GAME_CONFIG.maxTowerLevel ? (
                    <TouchableOpacity
                      style={[styles.upgradeBtn, !canUpgradeLevel && styles.upgradeBtnDisabled]}
                      onPress={onUpgradeLevel}
                      disabled={!canUpgradeLevel}
                    >
                      <Text style={styles.upgradeBtnText}>
                        ⬆️ Upgrade DMG
                      </Text>
                      <Text style={styles.upgradeCost}>
                        ◎ {config.upgradeCost[selectedTower.level - 1]}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.maxLevel}>DMG MAX</Text>
                  )}

                  {/* Upgrade Range */}
                  {selectedTower.rangeLevel < GAME_CONFIG.maxRangeLevel ? (
                    <TouchableOpacity
                      style={[styles.upgradeBtn, styles.rangeBtnStyle, !canUpgradeRange && styles.upgradeBtnDisabled]}
                      onPress={onUpgradeRange}
                      disabled={!canUpgradeRange}
                    >
                      <Text style={styles.upgradeBtnText}>
                        📡 Upgrade Range
                      </Text>
                      <Text style={styles.upgradeCost}>
                        ◎ {config.rangeUpgradeCost[selectedTower.rangeLevel - 1]}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.maxLevel}>RANGE MAX</Text>
                  )}
                </>
              );
            })()}
          </View>
        ) : (
          <View style={styles.noSelection}>
            <Text style={styles.noSelectionText}>Tap a tower to upgrade</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.bgDarker,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.bgCardLight,
  },
  scroll: {
    padding: 10,
  },
  pauseBtn: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pauseText: {
    fontSize: 18,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  hpContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  hpLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  hpBar: {
    height: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 4,
  },
  hpText: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  tierIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  tierName: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgCardLight,
    marginVertical: 14,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  towerInfo: {
    alignItems: 'center',
  },
  towerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  towerEmoji: {
    fontSize: 26,
  },
  towerName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  statsBox: {
    backgroundColor: COLORS.bgCard,
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  statsLabel: {
    color: COLORS.text,
    fontSize: 11,
    marginBottom: 4,
  },
  upgradeBtn: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeBtnStyle: {
    backgroundColor: COLORS.solanaBlue,
  },
  upgradeBtnDisabled: {
    opacity: 0.4,
  },
  upgradeBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '700',
  },
  upgradeCost: {
    color: COLORS.bgDark,
    fontSize: 10,
    marginTop: 2,
  },
  maxLevel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 8,
  },
  noSelection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSelectionText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
});

