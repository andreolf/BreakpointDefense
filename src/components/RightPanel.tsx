/**
 * Right Panel - Game Stats, Tower Info, Abilities
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️ BREAKPOINT</Text>
          <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
            <Text style={styles.pauseBtnText}>⏸</Text>
          </TouchableOpacity>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>◎ {gameState.sol}</Text>
            <Text style={styles.statLabel}>SOL</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(gameState.elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{gameState.wave}</Text>
            <Text style={styles.statLabel}>Wave</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{gameState.kills}</Text>
            <Text style={styles.statLabel}>Kills</Text>
          </View>
        </View>

        {/* HP Bar */}
        <View style={styles.hpSection}>
          <View style={styles.hpHeader}>
            <Text style={styles.hpLabel}>🌐 Network Health</Text>
            <Text style={styles.hpValue}>{gameState.baseHp}/{gameState.maxBaseHp}</Text>
          </View>
          <View style={styles.hpBar}>
            <View style={[styles.hpFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
          </View>
        </View>

        {/* Tier */}
        <View style={styles.tierSection}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
        </View>

        {/* Towers count */}
        <Text style={styles.towerCount}>
          🗼 Towers: {gameState.towers.length}/{GAME_CONFIG.maxTowers}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Abilities */}
        <Text style={styles.sectionTitle}>⚡ Abilities</Text>
        <View style={styles.abilitiesRow}>
          <TouchableOpacity
            style={[styles.abilityBtn, bombCooldown > 0 && styles.abilityDisabled]}
            onPress={onBomb}
            disabled={bombCooldown > 0}
          >
            <Text style={styles.abilityIcon}>{ABILITIES.bomb.icon}</Text>
            {bombCooldown > 0 ? (
              <Text style={styles.cooldown}>{Math.ceil(bombCooldown)}s</Text>
            ) : (
              <Text style={styles.abilityName}>Purge</Text>
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
            <Text style={styles.abilityIcon}>{ABILITIES.freeze.icon}</Text>
            {freezeCooldown > 0 ? (
              <Text style={styles.cooldown}>{Math.ceil(freezeCooldown)}s</Text>
            ) : (
              <Text style={styles.abilityName}>Freeze</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abilityBtn, airdropCooldown > 0 && styles.abilityDisabled]}
            onPress={onAirdrop}
            disabled={airdropCooldown > 0}
          >
            <Text style={styles.abilityIcon}>{ABILITIES.airdrop.icon}</Text>
            {airdropCooldown > 0 ? (
              <Text style={styles.cooldown}>{Math.ceil(airdropCooldown)}s</Text>
            ) : (
              <Text style={styles.abilityName}>+100◎</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Selected Tower */}
        {selectedTower ? (
          <View style={styles.towerInfo}>
            <Text style={styles.sectionTitle}>🎯 Selected Tower</Text>
            
            {(() => {
              const config = TOWER_CONFIGS[selectedTower.type];
              const dmg = config.damage[selectedTower.level - 1];
              const fr = config.fireRate[selectedTower.level - 1];
              const range = config.rangeLevels[selectedTower.rangeLevel - 1];
              
              return (
                <>
                  <View style={styles.towerHeader}>
                    <View style={[styles.towerIconBig, { backgroundColor: config.color }]}>
                      <Text style={styles.towerEmoji}>{config.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.towerName}>{config.name}</Text>
                      <Text style={styles.towerLevels}>
                        Power Lv.{selectedTower.level} • Range Lv.{selectedTower.rangeLevel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.towerStats}>
                    <View style={styles.towerStatRow}>
                      <Text style={styles.towerStatLabel}>⚔️ Damage</Text>
                      <Text style={styles.towerStatValue}>{dmg}</Text>
                    </View>
                    <View style={styles.towerStatRow}>
                      <Text style={styles.towerStatLabel}>⚡ Fire Rate</Text>
                      <Text style={styles.towerStatValue}>{fr}/s</Text>
                    </View>
                    <View style={styles.towerStatRow}>
                      <Text style={styles.towerStatLabel}>📡 Range</Text>
                      <Text style={styles.towerStatValue}>{range}</Text>
                    </View>
                  </View>

                  {/* Upgrade buttons */}
                  <View style={styles.upgradeButtons}>
                    {selectedTower.level < GAME_CONFIG.maxTowerLevel ? (
                      <TouchableOpacity
                        style={[styles.upgradeBtn, !canUpgradeLevel && styles.upgradeBtnDisabled]}
                        onPress={onUpgradeLevel}
                        disabled={!canUpgradeLevel}
                      >
                        <Text style={styles.upgradeBtnText}>⬆️ Power</Text>
                        <Text style={styles.upgradeCost}>◎{config.upgradeCost[selectedTower.level - 1]}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.maxBadge}>
                        <Text style={styles.maxText}>MAX PWR</Text>
                      </View>
                    )}

                    {selectedTower.rangeLevel < GAME_CONFIG.maxRangeLevel ? (
                      <TouchableOpacity
                        style={[styles.upgradeBtn, styles.rangeBtnColor, !canUpgradeRange && styles.upgradeBtnDisabled]}
                        onPress={onUpgradeRange}
                        disabled={!canUpgradeRange}
                      >
                        <Text style={styles.upgradeBtnText}>📡 Range</Text>
                        <Text style={styles.upgradeCost}>◎{config.rangeUpgradeCost[selectedTower.rangeLevel - 1]}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.maxBadge}>
                        <Text style={styles.maxText}>MAX RNG</Text>
                      </View>
                    )}
                  </View>
                </>
              );
            })()}
          </View>
        ) : (
          <View style={styles.noSelection}>
            <Text style={styles.noSelectionIcon}>👆</Text>
            <Text style={styles.noSelectionText}>Click near the path to build</Text>
            <Text style={styles.noSelectionHint}>Tap a tower to upgrade it</Text>
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
    borderLeftWidth: 2,
    borderLeftColor: COLORS.bgCardLight,
  },
  scroll: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    color: COLORS.solanaGreen,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBtnText: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statBox: {
    width: '50%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  hpSection: {
    marginBottom: 16,
  },
  hpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hpLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  hpValue: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  hpBar: {
    height: 10,
    backgroundColor: COLORS.bgCard,
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 5,
  },
  tierSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tierIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '700',
  },
  towerCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgCardLight,
    marginVertical: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  abilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  abilityBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  abilityDisabled: {
    opacity: 0.4,
  },
  abilityActive: {
    backgroundColor: COLORS.solanaBlue,
    opacity: 0.8,
  },
  abilityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  abilityName: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  cooldown: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  towerInfo: {
    marginBottom: 20,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  towerIconBig: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  towerEmoji: {
    fontSize: 26,
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
  towerStats: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  towerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  towerStatLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  towerStatValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upgradeBtn: {
    flex: 1,
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rangeBtnColor: {
    backgroundColor: COLORS.solanaBlue,
  },
  upgradeBtnDisabled: {
    opacity: 0.4,
  },
  upgradeBtnText: {
    color: COLORS.bgDark,
    fontSize: 13,
    fontWeight: '700',
  },
  upgradeCost: {
    color: COLORS.bgDark,
    fontSize: 11,
    marginTop: 2,
  },
  maxBadge: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  maxText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  noSelection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noSelectionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  noSelectionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noSelectionHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
