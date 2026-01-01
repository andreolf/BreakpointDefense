/**
 * Tower Popup
 * Always shows all towers - disabled ones are shadowed with reason
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { TOWER_CONFIGS, COLORS, TowerType, GAME_CONFIG } from '../game/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TowerPopupProps {
  visible: boolean;
  sol: number;
  maxTowers: boolean;
  onSelect: (type: TowerType) => void;
  onClose: () => void;
}

// Geometric tower icons
const TowerIcon = ({ type, size, color }: { type: TowerType; size: number; color: string }) => {
  const center = size / 2;
  const r = size * 0.35;
  
  switch (type) {
    case 'validator':
      return (
        <Svg width={size} height={size}>
          <Polygon
            points={`${center},${center - r} ${center + r * 0.8},${center + r * 0.5} ${center - r * 0.8},${center + r * 0.5}`}
            fill={color}
            stroke={COLORS.bgDark}
            strokeWidth={2}
          />
        </Svg>
      );
    case 'jupiter':
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        hexPoints.push(`${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`);
      }
      return (
        <Svg width={size} height={size}>
          <Polygon
            points={hexPoints.join(' ')}
            fill={color}
            stroke={COLORS.bgDark}
            strokeWidth={2}
          />
        </Svg>
      );
    case 'tensor':
      return (
        <Svg width={size} height={size}>
          <Polygon
            points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`}
            fill={color}
            stroke={COLORS.bgDark}
            strokeWidth={2}
          />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={r} fill={color} />
        </Svg>
      );
  }
};

export const TowerPopup: React.FC<TowerPopupProps> = ({
  visible,
  sol,
  maxTowers,
  onSelect,
  onClose,
}) => {
  if (!visible) return null;

  const towers: TowerType[] = ['validator', 'jupiter', 'tensor'];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏗️ Build Tower</Text>
            <View style={styles.solBadge}>
              <Text style={styles.solText}>◎ {sol} available</Text>
            </View>
          </View>

          {/* Max towers warning */}
          {maxTowers && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️ Maximum towers reached ({GAME_CONFIG.maxTowers})</Text>
            </View>
          )}

          {/* Tower Options - ALWAYS VISIBLE */}
          <View style={styles.towersGrid}>
            {towers.map((type) => {
              const config = TOWER_CONFIGS[type];
              const canAfford = sol >= config.cost;
              const canBuild = canAfford && !maxTowers;
              
              // Determine why it's disabled
              let disabledReason = '';
              if (maxTowers) {
                disabledReason = 'Max towers';
              } else if (!canAfford) {
                disabledReason = `Need ◎${config.cost - sol} more`;
              }

              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.towerOption, !canBuild && styles.towerDisabled]}
                  onPress={() => canBuild && onSelect(type)}
                  activeOpacity={canBuild ? 0.7 : 1}
                >
                  {/* Icon */}
                  <View style={[styles.iconContainer, { backgroundColor: config.color + '30' }]}>
                    <TowerIcon type={type} size={50} color={canBuild ? config.color : '#555'} />
                  </View>

                  {/* Info */}
                  <Text style={[styles.towerName, !canBuild && styles.textDisabled]}>
                    {config.name}
                  </Text>
                  <Text style={styles.towerDesc}>{config.description}</Text>
                  
                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>⚔️{config.damage[0]}</Text>
                    <Text style={styles.stat}>📡{config.rangeLevels[0]}</Text>
                  </View>

                  {/* Cost / Disabled reason */}
                  {canBuild ? (
                    <View style={styles.costBadge}>
                      <Text style={styles.costText}>◎ {config.cost}</Text>
                    </View>
                  ) : (
                    <View style={styles.disabledBadge}>
                      <Text style={styles.disabledCost}>◎ {config.cost}</Text>
                      <Text style={styles.disabledReason}>{disabledReason}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>✕ Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: COLORS.bgDarker,
    borderRadius: 20,
    padding: 24,
    width: Math.min(SCREEN_WIDTH * 0.9, 520),
    borderWidth: 3,
    borderColor: COLORS.solanaPurple,
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  solBadge: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  solText: {
    color: COLORS.solanaGreen,
    fontSize: 15,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: COLORS.hpLow + '30',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningText: {
    color: COLORS.hpLow,
    fontSize: 13,
    fontWeight: '600',
  },
  towersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  towerOption: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgCardLight,
  },
  towerDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.bgDark,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  towerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
  towerDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stat: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: 6,
  },
  costBadge: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  costText: {
    color: COLORS.bgDark,
    fontSize: 17,
    fontWeight: '800',
  },
  disabledBadge: {
    backgroundColor: COLORS.bgCardLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledCost: {
    color: COLORS.hpLow,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  disabledReason: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 17,
    fontWeight: '600',
  },
});
