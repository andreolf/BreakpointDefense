/**
 * TowerSelectPopup Component
 * Modal for selecting tower types (Solana ecosystem projects)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, Circle, G, Polygon } from 'react-native-svg';
import { TowerType, TOWER_CONFIGS, COLORS, GAME_CONFIG, ECOSYSTEM_ICONS } from '../game/config';
import { Tower } from '../game/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TowerSelectPopupProps {
  visible: boolean;
  slotIndex: number;
  existingTower: Tower | null;
  sol: number;
  onSelect: (type: TowerType) => void;
  onUpgrade: () => void;
  onClose: () => void;
}

export const TowerSelectPopup: React.FC<TowerSelectPopupProps> = ({
  visible,
  slotIndex,
  existingTower,
  sol,
  onSelect,
  onUpgrade,
  onClose,
}) => {
  const towerTypes: TowerType[] = ['validator', 'jupiter', 'tensor'];
  
  const renderNewTowerOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.title}>Deploy Tower</Text>
      <Text style={styles.subtitle}>Choose a Solana ecosystem defender</Text>
      
      <View style={styles.towersGrid}>
        {towerTypes.map((type) => {
          const config = TOWER_CONFIGS[type];
          const canAfford = sol >= config.cost;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.towerOption,
                { borderColor: canAfford ? config.color : COLORS.textMuted },
                !canAfford && styles.towerOptionDisabled,
              ]}
              onPress={() => canAfford && onSelect(type)}
              disabled={!canAfford}
              activeOpacity={0.7}
            >
              {/* Tower icon background */}
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Text style={styles.towerIcon}>{config.icon}</Text>
              </View>
              
              {/* Tower info */}
              <Text style={[styles.towerName, { color: canAfford ? config.color : COLORS.textMuted }]}>
                {config.name}
              </Text>
              
              <Text style={styles.towerDesc}>{config.description}</Text>
              
              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>DMG</Text>
                  <Text style={styles.statValue}>{config.damage[0]}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>SPD</Text>
                  <Text style={styles.statValue}>{config.fireRate[0]}/s</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>RNG</Text>
                  <Text style={styles.statValue}>{config.range}</Text>
                </View>
              </View>
              
              {/* Special ability badge */}
              {config.special && (
                <View style={[styles.specialBadge, { backgroundColor: config.color + '30' }]}>
                  <Text style={[styles.specialText, { color: config.color }]}>
                    {config.special === 'chain' ? '🔗 CHAIN' : '💥 SPLASH'}
                  </Text>
                </View>
              )}
              
              {/* Cost */}
              <View style={[styles.costBadge, { opacity: canAfford ? 1 : 0.5 }]}>
                <Text style={styles.costIcon}>{ECOSYSTEM_ICONS.sol}</Text>
                <Text style={[styles.costValue, { color: canAfford ? COLORS.solanaGreen : COLORS.hpLow }]}>
                  {config.cost}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Balance display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance:</Text>
        <Text style={styles.balanceIcon}>{ECOSYSTEM_ICONS.sol}</Text>
        <Text style={styles.balanceValue}>{sol} SOL</Text>
      </View>
    </View>
  );
  
  const renderUpgradeOption = () => {
    if (!existingTower) return null;
    
    const config = TOWER_CONFIGS[existingTower.type];
    const currentLevel = existingTower.level;
    const isMaxLevel = currentLevel >= GAME_CONFIG.maxTowerLevel;
    const upgradeCost = isMaxLevel ? 0 : config.upgradeCost[currentLevel - 1];
    const canAfford = sol >= upgradeCost;
    
    const nextDamage = config.damage[currentLevel];
    const nextFireRate = config.fireRate[currentLevel];
    const currentDamage = config.damage[currentLevel - 1];
    const currentFireRate = config.fireRate[currentLevel - 1];
    
    return (
      <View style={styles.optionsContainer}>
        <Text style={styles.title}>Upgrade Tower</Text>
        <Text style={[styles.towerName, { color: config.color, fontSize: 18 }]}>
          {config.icon} {config.name}
        </Text>
        
        {/* Current level indicator */}
        <View style={styles.levelContainer}>
          {[1, 2, 3].map((lvl) => (
            <View
              key={lvl}
              style={[
                styles.levelDot,
                {
                  backgroundColor: lvl <= currentLevel ? config.color : COLORS.bgCard,
                  borderColor: config.color,
                },
              ]}
            >
              <Text style={styles.levelText}>{lvl}</Text>
            </View>
          ))}
        </View>
        
        {isMaxLevel ? (
          <View style={styles.maxLevelContainer}>
            <Text style={styles.maxLevelText}>🏆 MAX LEVEL</Text>
            <Text style={styles.maxLevelSubtext}>This tower is fully upgraded!</Text>
          </View>
        ) : (
          <>
            {/* Upgrade preview */}
            <View style={styles.upgradePreview}>
              <View style={styles.upgradeRow}>
                <Text style={styles.upgradeLabel}>Damage</Text>
                <Text style={styles.upgradeCurrentValue}>{currentDamage}</Text>
                <Text style={styles.upgradeArrow}>→</Text>
                <Text style={styles.upgradeNewValue}>{nextDamage}</Text>
                <Text style={styles.upgradeDiff}>+{nextDamage - currentDamage}</Text>
              </View>
              <View style={styles.upgradeRow}>
                <Text style={styles.upgradeLabel}>Fire Rate</Text>
                <Text style={styles.upgradeCurrentValue}>{currentFireRate}/s</Text>
                <Text style={styles.upgradeArrow}>→</Text>
                <Text style={styles.upgradeNewValue}>{nextFireRate}/s</Text>
                <Text style={styles.upgradeDiff}>+{(nextFireRate - currentFireRate).toFixed(1)}</Text>
              </View>
            </View>
            
            {/* Upgrade button */}
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                {
                  backgroundColor: canAfford ? config.color : COLORS.bgCard,
                  opacity: canAfford ? 1 : 0.5,
                },
              ]}
              onPress={canAfford ? onUpgrade : undefined}
              disabled={!canAfford}
              activeOpacity={0.7}
            >
              <Text style={styles.upgradeButtonText}>
                Upgrade to Level {currentLevel + 1}
              </Text>
              <View style={styles.upgradeCost}>
                <Text style={styles.costIcon}>{ECOSYSTEM_ICONS.sol}</Text>
                <Text style={[styles.costValue, { color: canAfford ? COLORS.bgDark : COLORS.hpLow }]}>
                  {upgradeCost}
                </Text>
              </View>
            </TouchableOpacity>
            
            {!canAfford && (
              <Text style={styles.insufficientFunds}>
                Need {upgradeCost - sol} more SOL
              </Text>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.popup}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Background gradient */}
          <View style={styles.popupBg}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="popupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={COLORS.bgCard} />
                  <Stop offset="100%" stopColor={COLORS.bgDark} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width="100%" height="100%" fill="url(#popupGrad)" rx={16} />
            </Svg>
          </View>
          
          {/* Content */}
          <View style={styles.popupContent}>
            {existingTower ? renderUpgradeOption() : renderNewTowerOptions()}
            
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
  },
  popupBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupContent: {
    padding: 20,
  },
  optionsContainer: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 16,
  },
  towersGrid: {
    width: '100%',
    gap: 12,
  },
  towerOption: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
  },
  towerOptionDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  towerIcon: {
    fontSize: 24,
  },
  towerName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  towerDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '600',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialBadge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  specialText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
  },
  costIcon: {
    fontSize: 12,
    color: COLORS.solanaGreen,
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.bgCard,
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  balanceIcon: {
    fontSize: 14,
    color: COLORS.solanaGreen,
  },
  balanceValue: {
    color: COLORS.solanaGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  levelDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  levelText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  maxLevelContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  maxLevelText: {
    color: COLORS.solanaGreen,
    fontSize: 18,
    fontWeight: 'bold',
  },
  maxLevelSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  upgradePreview: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  upgradeLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  upgradeCurrentValue: {
    color: COLORS.text,
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  upgradeArrow: {
    color: COLORS.solanaPurple,
    fontSize: 14,
    fontWeight: 'bold',
  },
  upgradeNewValue: {
    color: COLORS.solanaGreen,
    fontSize: 12,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'left',
  },
  upgradeDiff: {
    color: COLORS.solanaGreen,
    fontSize: 10,
    fontWeight: 'bold',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  upgradeButtonText: {
    color: COLORS.bgDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  upgradeCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insufficientFunds: {
    color: COLORS.hpLow,
    fontSize: 10,
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
});

export default TowerSelectPopup;
