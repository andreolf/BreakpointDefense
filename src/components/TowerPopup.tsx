/**
 * Tower Popup
 * Centered modal for tower selection with better visuals
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Svg, { Circle, Polygon, G } from 'react-native-svg';
import { TOWER_CONFIGS, COLORS, TowerType } from '../game/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TowerPopupProps {
  visible: boolean;
  position: { x: number; y: number };
  sol: number;
  onSelect: (type: TowerType) => void;
  onClose: () => void;
}

// Geometric tower icons
const TowerIcon = ({ type, size, color }: { type: TowerType; size: number; color: string }) => {
  const center = size / 2;
  const r = size * 0.35;
  
  switch (type) {
    case 'validator':
      // Lightning bolt shape (triangle pointing up)
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
      // Hexagon (planet-like)
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
      // Diamond
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
  position,
  sol,
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
            <Text style={styles.title}>Build Tower</Text>
            <Text style={styles.solDisplay}>◎ {sol} available</Text>
          </View>

          {/* Tower Options */}
          <View style={styles.towersGrid}>
            {towers.map((type) => {
              const config = TOWER_CONFIGS[type];
              const canAfford = sol >= config.cost;

              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.towerOption, !canAfford && styles.disabled]}
                  onPress={() => canAfford && onSelect(type)}
                  disabled={!canAfford}
                  activeOpacity={0.7}
                >
                  {/* Icon */}
                  <View style={[styles.iconContainer, { backgroundColor: config.color + '30' }]}>
                    <TowerIcon type={type} size={50} color={config.color} />
                  </View>

                  {/* Info */}
                  <Text style={styles.towerName}>{config.name}</Text>
                  <Text style={styles.towerDesc}>{config.description}</Text>
                  
                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>⚔️{config.damage[0]}</Text>
                    <Text style={styles.stat}>📡{config.rangeLevels[0]}</Text>
                  </View>

                  {/* Cost */}
                  <View style={[styles.costBadge, !canAfford && styles.costBadgeRed]}>
                    <Text style={[styles.costText, !canAfford && styles.costTextRed]}>
                      ◎ {config.cost}
                    </Text>
                  </View>
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
    width: Math.min(SCREEN_WIDTH * 0.9, 500),
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  solDisplay: {
    color: COLORS.solanaGreen,
    fontSize: 14,
    marginTop: 8,
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
  disabled: {
    opacity: 0.4,
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
  towerDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 30,
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  costBadgeRed: {
    backgroundColor: COLORS.bgCardLight,
  },
  costText: {
    color: COLORS.bgDark,
    fontSize: 16,
    fontWeight: '800',
  },
  costTextRed: {
    color: COLORS.hpLow,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
