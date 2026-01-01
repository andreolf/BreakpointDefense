/**
 * Right Panel - Clean layout (Health moved to top-left overlay)
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
}) => {
  const tier = getTier(gameState.elapsedTime);

  const now = Date.now();
  const bombCooldown = Math.max(0, ABILITIES.bomb.cooldown - (now - gameState.abilities.bomb.lastUsed) / 1000);
  const freezeCooldown = Math.max(0, ABILITIES.freeze.cooldown - (now - gameState.abilities.freeze.lastUsed) / 1000);
  const airdropCooldown = Math.max(0, ABILITIES.airdrop.cooldown - (now - gameState.abilities.airdrop.lastUsed) / 1000);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.logoText}>🛡️ BREAKPOINT DEFENSE</Text>
        </View>

        {/* ===== SOL BALANCE - BIG & TOP ===== */}
        <View style={styles.solCard}>
          <Text style={styles.solLabel}>SOL BALANCE</Text>
          <Text style={styles.solValue}>◎ {gameState.sol}</Text>
        </View>

        {/* ===== STATS GRID ===== */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(gameState.elapsedTime)}</Text>
            <Text style={styles.statLabel}>TIME</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{gameState.wave}</Text>
            <Text style={styles.statLabel}>WAVE</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{gameState.kills}</Text>
            <Text style={styles.statLabel}>KILLS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{gameState.towers.length}</Text>
            <Text style={styles.statLabel}>TOWERS</Text>
          </View>
        </View>

        {/* ===== TIER BADGE ===== */}
        <View style={[styles.tierCard, { borderColor: tier.color }]}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
        </View>

        {/* ===== ABILITIES - BIGGER ===== */}
        <Text style={styles.sectionTitle}>⚡ ABILITIES</Text>
        <View style={styles.abilitiesRow}>
          <TouchableOpacity
            style={[styles.abilityBtn, bombCooldown > 0 && styles.abilityDisabled]}
            onPress={onBomb}
            disabled={bombCooldown > 0}
          >
            <Text style={styles.abilityEmoji}>💥</Text>
            <Text style={styles.abilityName}>Purge</Text>
            {bombCooldown > 0 && (
              <View style={styles.cooldownBadge}>
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
            <Text style={styles.abilityName}>Freeze</Text>
            {freezeCooldown > 0 && (
              <View style={styles.cooldownBadge}>
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
            <Text style={styles.abilityName}>+100◎</Text>
            {airdropCooldown > 0 && (
              <View style={styles.cooldownBadge}>
                <Text style={styles.cooldownText}>{Math.ceil(airdropCooldown)}s</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===== TOWER INFO ===== */}
        <Text style={styles.sectionTitle}>🎯 TOWER</Text>

        {selectedTower ? (
          <View style={styles.towerCard}>
            {(() => {
              const config = TOWER_CONFIGS[selectedTower.type];
              const dmg = config.damage[selectedTower.level - 1];
              const fr = config.fireRate[selectedTower.level - 1];
              const range = config.rangeLevels[selectedTower.rangeLevel - 1];

              return (
                <>
                  {/* Tower Header */}
                  <View style={styles.towerHeader}>
                    <View style={[styles.towerIcon, { backgroundColor: config.color }]}>
                      <Text style={styles.towerEmoji}>{config.icon}</Text>
                    </View>
                    <View style={styles.towerMeta}>
                      <Text style={styles.towerName}>{config.name}</Text>
                      <Text style={styles.towerLevels}>
                        Pwr {selectedTower.level} • Rng {selectedTower.rangeLevel}
                      </Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.towerStatsRow}>
                    <View style={styles.towerStat}>
                      <Text style={styles.towerStatVal}>{dmg}</Text>
                      <Text style={styles.towerStatLbl}>DMG</Text>
                    </View>
                    <View style={styles.towerStat}>
                      <Text style={styles.towerStatVal}>{fr}/s</Text>
                      <Text style={styles.towerStatLbl}>RATE</Text>
                    </View>
                    <View style={styles.towerStat}>
                      <Text style={styles.towerStatVal}>{range}</Text>
                      <Text style={styles.towerStatLbl}>RNG</Text>
                    </View>
                  </View>

                  {/* Upgrades */}
                  <View style={styles.upgradeRow}>
                    {selectedTower.level < GAME_CONFIG.maxTowerLevel ? (
                      <TouchableOpacity
                        style={[styles.upgradeBtn, !canUpgradeLevel && styles.upgradeBtnOff]}
                        onPress={onUpgradeLevel}
                        disabled={!canUpgradeLevel}
                      >
                        <Text style={styles.upgradeTxt}>⬆️ Power</Text>
                        <Text style={styles.upgradeCost}>◎{config.upgradeCost[selectedTower.level - 1]}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.maxBox}><Text style={styles.maxTxt}>MAX</Text></View>
                    )}

                    {selectedTower.rangeLevel < GAME_CONFIG.maxRangeLevel ? (
                      <TouchableOpacity
                        style={[styles.upgradeBtn, styles.upgradeBtnBlue, !canUpgradeRange && styles.upgradeBtnOff]}
                        onPress={onUpgradeRange}
                        disabled={!canUpgradeRange}
                      >
                        <Text style={styles.upgradeTxt}>📡 Range</Text>
                        <Text style={styles.upgradeCost}>◎{config.rangeUpgradeCost[selectedTower.rangeLevel - 1]}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.maxBox}><Text style={styles.maxTxt}>MAX</Text></View>
                    )}
                  </View>
                </>
              );
            })()}
          </View>
        ) : (
          <View style={styles.noTower}>
            <Text style={styles.noTowerIcon}>👆</Text>
            <Text style={styles.noTowerTxt}>Click near path to build</Text>
            <Text style={styles.noTowerHint}>Tap tower to upgrade</Text>
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
    borderLeftWidth: 3,
    borderLeftColor: COLORS.solanaPurple,
  },
  scroll: {
    padding: 14,
    paddingBottom: 30,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardLight,
  },
  logoText: {
    color: COLORS.solanaGreen,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // SOL Card - NOW AT TOP, BIG
  solCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.solanaGreen,
  },
  solLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 6,
  },
  solValue: {
    color: COLORS.solanaGreen,
    fontSize: 36,
    fontWeight: '800',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statBox: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Tier
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  tierIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  tierName: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Section
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Abilities - BIGGER
  abilitiesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  abilityBtn: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginHorizontal: 3,
    position: 'relative',
  },
  abilityDisabled: {
    opacity: 0.4,
  },
  abilityActive: {
    backgroundColor: COLORS.solanaBlue,
  },
  abilityEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  abilityName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  cooldownBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooldownText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  // Tower Card
  towerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  towerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  towerEmoji: {
    fontSize: 22,
  },
  towerMeta: {
    flex: 1,
  },
  towerName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  towerLevels: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  towerStatsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  towerStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
  },
  towerStatVal: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  towerStatLbl: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  upgradeRow: {
    flexDirection: 'row',
  },
  upgradeBtn: {
    flex: 1,
    backgroundColor: COLORS.solanaGreen,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  upgradeBtnBlue: {
    backgroundColor: COLORS.solanaBlue,
  },
  upgradeBtnOff: {
    opacity: 0.3,
  },
  upgradeTxt: {
    color: COLORS.bgDark,
    fontSize: 12,
    fontWeight: '700',
  },
  upgradeCost: {
    color: COLORS.bgDark,
    fontSize: 10,
    marginTop: 2,
  },
  maxBox: {
    flex: 1,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  maxTxt: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  // No Tower
  noTower: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noTowerIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  noTowerTxt: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  noTowerHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
