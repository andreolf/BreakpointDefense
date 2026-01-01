/**
 * Tower View
 * Renders a placed tower with range indicator
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Tower } from '../game/types';
import { TOWER_CONFIGS, COLORS } from '../game/config';

interface TowerViewProps {
  tower: Tower;
  isSelected: boolean;
  onPress: () => void;
}

export const TowerView: React.FC<TowerViewProps> = ({ tower, isSelected, onPress }) => {
  const config = TOWER_CONFIGS[tower.type];
  const range = config.rangeLevels[tower.rangeLevel - 1];
  const size = 32;

  return (
    <View
      style={[
        styles.container,
        {
          left: tower.x - range,
          top: tower.y - range,
          width: range * 2,
          height: range * 2,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Range Circle */}
      {isSelected && (
        <Svg
          width={range * 2}
          height={range * 2}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <RadialGradient id="rangeGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={config.color} stopOpacity="0.1" />
              <Stop offset="100%" stopColor={config.color} stopOpacity="0.25" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={range}
            cy={range}
            r={range - 2}
            fill="url(#rangeGrad)"
            stroke={config.color}
            strokeWidth={2}
            strokeDasharray="6 4"
            opacity={0.6}
          />
        </Svg>
      )}

      {/* Tower Body */}
      <TouchableOpacity
        style={[
          styles.tower,
          {
            left: range - size / 2,
            top: range - size / 2,
            width: size,
            height: size,
            backgroundColor: config.color,
            borderColor: isSelected ? COLORS.text : 'transparent',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{config.icon}</Text>
        
        {/* Level indicators */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{tower.level}</Text>
        </View>
        {tower.rangeLevel > 1 && (
          <View style={[styles.rangeBadge, { backgroundColor: COLORS.solanaBlue }]}>
            <Text style={styles.levelText}>{tower.rangeLevel}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  tower: {
    position: 'absolute',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 16,
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.solanaPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '700',
  },
});
