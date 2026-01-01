/**
 * Left Panel - Tower Selection + Abilities
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GameState } from '../game/types';
import {
  COLORS,
  TowerType,
  TOWER_CONFIGS,
  ABILITIES,
  LEFT_PANEL_WIDTH,
  GAME_CONFIG,
} from '../game/config';
import { DraggableTower } from './DraggableTower';

interface LeftPanelProps {
  gameState: GameState;
  selectedTowerType: TowerType | null;
  onSelectTowerType: (type: TowerType) => void;
  onDragTower: (type: TowerType, x: number, y: number) => void;
  onBomb: () => void;
  onFreeze: () => void;
  onAirdrop: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  gameState,
  selectedTowerType,
  onSelectTowerType,
  onDragTower,
  onBomb,
  onFreeze,
  onAirdrop,
}) => {
  const now = Date.now();
  
  const bombCooldown = Math.max(0, ABILITIES.bomb.cooldown - (now - gameState.abilities.bomb.lastUsed) / 1000);
  const freezeCooldown = Math.max(0, ABILITIES.freeze.cooldown - (now - gameState.abilities.freeze.lastUsed) / 1000);
  const airdropCooldown = Math.max(0, ABILITIES.airdrop.cooldown - (now - gameState.abilities.airdrop.lastUsed) / 1000);

  const towers: TowerType[] = ['validator', 'jupiter', 'tensor'];
  const atMaxTowers = gameState.towers.length >= GAME_CONFIG.maxTowers;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>TOWERS</Text>
      <Text style={styles.hint}>Tap to select, then tap map</Text>
      
      {/* Tower Cards - Click to select */}
      {towers.map((type) => {
        const config = TOWER_CONFIGS[type];
        const canAfford = gameState.sol >= config.cost;
        const isSelected = selectedTowerType === type;

        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.towerCard,
              isSelected && styles.towerCardSelected,
              (!canAfford || atMaxTowers) && styles.towerCardDisabled,
            ]}
            onPress={() => canAfford && !atMaxTowers && onSelectTowerType(type)}
            disabled={!canAfford || atMaxTowers}
          >
            <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
              <Text style={styles.icon}>{config.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{config.name}</Text>
              <Text style={styles.cost}>◎ {config.cost}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
      
      {selectedTowerType && (
        <Text style={styles.selectedHint}>
          ✓ {TOWER_CONFIGS[selectedTowerType].name} selected
        </Text>
      )}
      
      {/* Spacer */}
      <View style={styles.spacer} />
      
      {/* Abilities */}
      <Text style={styles.title}>ABILITIES</Text>
      
      <TouchableOpacity
        style={[styles.abilityBtn, bombCooldown > 0 && styles.abilityBtnDisabled]}
        onPress={onBomb}
        disabled={bombCooldown > 0}
      >
        <Text style={styles.abilityIcon}>{ABILITIES.bomb.icon}</Text>
        {bombCooldown > 0 && (
          <Text style={styles.cooldownText}>{Math.ceil(bombCooldown)}s</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.abilityBtn,
          freezeCooldown > 0 && styles.abilityBtnDisabled,
          gameState.abilities.freeze.active && styles.abilityActive,
        ]}
        onPress={onFreeze}
        disabled={freezeCooldown > 0}
      >
        <Text style={styles.abilityIcon}>{ABILITIES.freeze.icon}</Text>
        {freezeCooldown > 0 && (
          <Text style={styles.cooldownText}>{Math.ceil(freezeCooldown)}s</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.abilityBtn, airdropCooldown > 0 && styles.abilityBtnDisabled]}
        onPress={onAirdrop}
        disabled={airdropCooldown > 0}
      >
        <Text style={styles.abilityIcon}>{ABILITIES.airdrop.icon}</Text>
        {airdropCooldown > 0 && (
          <Text style={styles.cooldownText}>{Math.ceil(airdropCooldown)}s</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: LEFT_PANEL_WIDTH,
    backgroundColor: COLORS.bgDarker,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.bgCardLight,
  },
  title: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  towerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  towerCardSelected: {
    borderColor: COLORS.solanaGreen,
    backgroundColor: COLORS.bgCardLight,
  },
  towerCardDisabled: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  cost: {
    color: COLORS.solanaGreen,
    fontSize: 11,
    fontWeight: '500',
  },
  selectedHint: {
    color: COLORS.solanaGreen,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  abilityBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgCardLight,
  },
  abilityBtnDisabled: {
    opacity: 0.4,
  },
  abilityActive: {
    borderColor: COLORS.solanaBlue,
    backgroundColor: COLORS.bgCardLight,
  },
  abilityIcon: {
    fontSize: 22,
  },
  cooldownText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 4,
  },
});
