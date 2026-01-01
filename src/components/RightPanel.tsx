/**
 * Right Panel - Better organized with big SOL display
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
  ABILITIES,
} from '../game/config';

interface RightPanelProps {
  gameState: GameState;
  selectedTower: Tower | null;
  canUpgradeLevel: boolean;
  canUpgradeRange: boolean;
  onUpgradeLevel: () => void;
  onUpgradeRange: () => void;
  onBomb: () => void;
  onFreeze: () => void;
  onAirdrop: () => void;
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
  onBomb,
  onFreeze,
  onAirdrop,
  onPause,
}) => {
  const tier = getTier(gameState.elapsedTime);
  const hpPercent = (gameState.baseHp / gameState.maxBaseHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

  const now = Date.now();
  const bombCooldown = Math.max(0, ABILITIES.bomb.cooldown - (now - gameState.abilities.bomb.lastUsed) / 1000);
  const freezeCooldown = Math.max(0, ABILITIES.freeze.cooldown - (now - gameState.abilities.freeze.lastUsed) / 1000);
  const airdropCooldown = Math.max(0, ABILITIES.airdrop.cooldown - (now - gameState.abilities.airdrop.lastUsed) / 1000);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>🛡️ BREAKPOINT</Text>
            <Text style={styles.logoSub}>DEFENSE</Text>
          </View>
          <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
        </View>

        {/* ===== BIG SOL DISPLAY ===== */}
        <View style={styles.solContainer}>
          <Text style={styles.solLabel}>SOL Balance</Text>
          <Text style={styles.solValue}>◎ {gameState.sol}</Text>
        </View>

        {/* ===== STATS ROW ===== */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(gameState.elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameState.wave}</Text>
            <Text style={styles.statLabel}>Wave</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gameState.kills}</Text>
            <Text style={styles.statLabel}>Kills</Text>
          </View>
        </View>

        {/* ===== NETWORK HEALTH ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌐 Network Health</Text>
            <Text style={styles.hpText}>{gameState.baseHp}/{gameState.maxBaseHp}</Text>
          </View>
          <View style={styles.hpBar}>
            <View style={[styles.hpFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
          </View>
        </View>

        {/* ===== TIER & TOWERS ===== */}
        <View style={styles.tierRow}>
          <View style={styles.tierBox}>
            <Text style={styles.tierIcon}>{tier.icon}</Text>
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
          </View>
          <View style={styles.towerCountBox}>
            <Text style={styles.towerCountValue}>{gameState.towers.length}</Text>
            <Text style={styles.towerCountLabel}>/ {GAME_CONFIG.maxTowers} towers</Text>
          </View>
        </View>

        {/* ===== ABILITIES ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Abilities</Text>
          <View style={styles.abilitiesGrid}>
            <TouchableOpacity
              style={[styles.abilityBtn, bombCooldown > 0 && styles.abilityDisabled]}
              onPress={onBomb}
              disabled={bombCooldown > 0}
            >
              <Text style={styles.abilityEmoji}>💥</Text>
              <Text style={styles.abilityLabel}>Purge All</Text>
              {bombCooldown > 0 && (
                <View style={styles.cooldownOverlay}>
                  <Text style={styles.cooldownText}>{Math.ceil(bombCooldown)}s</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.abilityBtn,
                freezeCooldown > 0 && styles.abilityDisabled,
                gameState.abilities.freeze.active && styles.abilityActive,
              ]}
              onPress={onFreeze}
              disabled={freezeCooldown > 0}
            >
              <Text style={styles.abilityEmoji}>❄️</Text>
              <Text style={styles.abilityLabel}>Freeze</Text>
              {freezeCooldown > 0 && (
                <View style={styles.cooldownOverlay}>
                  <Text style={styles.cooldownText}>{Math.ceil(freezeCooldown)}s</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.abilityBtn, airdropCooldown > 0 && styles.abilityDisabled]}
              onPress={onAirdrop}
              disabled={airdropCooldown > 0}
            >
              <Text style={styles.abilityEmoji}>🪂</Text>
              <Text style={styles.abilityLabel}>+100 SOL</Text>
              {airdropCooldown > 0 && (
                <View style={styles.cooldownOverlay}>
                  <Text style={styles.cooldownText}>{Math.ceil(airdropCooldown)}s</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== SELECTED TOWER ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Tower Info</Text>
          
          {selectedTower ? (
            <View style={styles.towerCard}>
              {(() => {
                const config = TOWER_CONFIGS[selectedTower.type];
                const dmg = config.damage[selectedTower.level - 1];
                const fr = config.fireRate[selectedTower.level - 1];
                const range = config.rangeLevels[selectedTower.rangeLevel - 1];
                
                return (
                  <>
                    <View style={styles.towerHeader}>
                      <View style={[styles.towerIconBox, { backgroundColor: config.color }]}>
                        <Text style={styles.towerEmoji}>{config.icon}</Text>
                      </View>
                      <View style={styles.towerInfo}>
                        <Text style={styles.towerName}>{config.name}</Text>
                        <Text style={styles.towerLevels}>
                          Power Lv.{selectedTower.level} • Range Lv.{selectedTower.rangeLevel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.towerStatsGrid}>
                      <View style={styles.towerStatBox}>
                        <Text style={styles.towerStatValue}>{dmg}</Text>
                        <Text style={styles.towerStatLabel}>Damage</Text>
                      </View>
                      <View style={styles.towerStatBox}>
                        <Text style={styles.towerStatValue}>{fr}/s</Text>
                        <Text style={styles.towerStatLabel}>Fire Rate</Text>
                      </View>
                      <View style={styles.towerStatBox}>
                        <Text style={styles.towerStatValue}>{range}</Text>
                        <Text style={styles.towerStatLabel}>Range</Text>
                      </View>
                    </View>

                    <View style={styles.upgradeRow}>
                      {selectedTower.level < GAME_CONFIG.maxTowerLevel ? (
                        <TouchableOpacity
                          style={[styles.upgradeBtn, !canUpgradeLevel && styles.upgradeBtnDisabled]}
                          onPress={onUpgradeLevel}
                          disabled={!canUpgradeLevel}
                        >
                          <Text style={styles.upgradeBtnIcon}>⬆️</Text>
                          <Text style={styles.upgradeBtnText}>Power</Text>
                          <Text style={styles.upgradeBtnCost}>
                            ◎{config.upgradeCost[selectedTower.level - 1]}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.maxBadge}>
                          <Text style={styles.maxText}>MAX</Text>
                        </View>
                      )}

                      {selectedTower.rangeLevel < GAME_CONFIG.maxRangeLevel ? (
                        <TouchableOpacity
                          style={[styles.upgradeBtn, styles.upgradeBtnBlue, !canUpgradeRange && styles.upgradeBtnDisabled]}
                          onPress={onUpgradeRange}
                          disabled={!canUpgradeRange}
                        >
                          <Text style={styles.upgradeBtnIcon}>📡</Text>
                          <Text style={styles.upgradeBtnText}>Range</Text>
                          <Text style={styles.upgradeBtnCost}>
                            ◎{config.rangeUpgradeCost[selectedTower.rangeLevel - 1]}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.maxBadge}>
                          <Text style={styles.maxText}>MAX</Text>
                        </View>
                      )}
                    </View>
                  </>
                );
              })()}
            </View>
          ) : (
            <View style={styles.noTowerCard}>
              <Text style={styles.noTowerIcon}>👆</Text>
              <Text style={styles.noTowerText}>Click near path to build</Text>
              <Text style={styles.noTowerHint}>or tap a tower to upgrade</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.bgDarker,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.solanaPurple,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoText: {
    color: COLORS.solanaGreen,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 2,
  },
  pauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  pauseIcon: {
    fontSize: 18,
  },

  // SOL Display
  solContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.solanaGreen,
  },
  solLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  solValue: {
    color: COLORS.solanaGreen,
    fontSize: 36,
    fontWeight: '800',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.bgCardLight,
    marginHorizontal: 8,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  hpText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  hpBar: {
    height: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 6,
  },

  // Tier Row
  tierRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tierBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
  },
  tierIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '700',
  },
  towerCountBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  towerCountValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  towerCountLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // Abilities
  abilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  abilityBtn: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  abilityDisabled: {
    opacity: 0.5,
  },
  abilityActive: {
    backgroundColor: COLORS.solanaBlue,
  },
  abilityEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  abilityLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cooldownText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // Tower Card
  towerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  towerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  towerEmoji: {
    fontSize: 24,
  },
  towerInfo: {
    flex: 1,
  },
  towerName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  towerLevels: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  towerStatsGrid: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  towerStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  towerStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  towerStatLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  upgradeRow: {
    flexDirection: 'row',
  },
  upgradeBtn: {
    flex: 1,
    backgroundColor: COLORS.solanaGreen,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  upgradeBtnBlue: {
    backgroundColor: COLORS.solanaBlue,
  },
  upgradeBtnDisabled: {
    opacity: 0.4,
  },
  upgradeBtnIcon: {
    fontSize: 16,
  },
  upgradeBtnText: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '700',
  },
  upgradeBtnCost: {
    color: COLORS.bgDark,
    fontSize: 11,
    marginTop: 2,
  },
  maxBadge: {
    flex: 1,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    justifyContent: 'center',
  },
  maxText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  // No Tower
  noTowerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  noTowerIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  noTowerText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  noTowerHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
});
