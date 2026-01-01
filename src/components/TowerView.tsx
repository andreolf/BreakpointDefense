/**
 * Tower View
 * Renders a placed tower with range indicator - MORE VISIBLE
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, G, Rect, Polygon } from 'react-native-svg';
import { Tower } from '../game/types';
import { TOWER_CONFIGS, COLORS } from '../game/config';

interface TowerViewProps {
  tower: Tower;
  isSelected: boolean;
  onPress: () => void;
}

// Tower icons as geometric shapes
const TowerIcon: React.FC<{ type: string; color: string; size: number }> = ({ type, color, size }) => {
  const center = size / 2;
  const r = size * 0.32;

  switch (type) {
    case 'validator':
      // Triangle
      return (
        <Polygon
          points={`${center},${center - r} ${center + r * 0.9},${center + r * 0.6} ${center - r * 0.9},${center + r * 0.6}`}
          fill="#FFF"
          stroke="#000"
          strokeWidth={1.5}
        />
      );
    case 'jupiter':
      // Hexagon
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        hexPoints.push(`${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`);
      }
      return (
        <Polygon
          points={hexPoints.join(' ')}
          fill="#FFF"
          stroke="#000"
          strokeWidth={1.5}
        />
      );
    case 'tensor':
      // Diamond
      return (
        <Polygon
          points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`}
          fill="#FFF"
          stroke="#000"
          strokeWidth={1.5}
        />
      );
    default:
      return <Circle cx={center} cy={center} r={r} fill="#FFF" />;
  }
};

export const TowerView: React.FC<TowerViewProps> = ({ tower, isSelected, onPress }) => {
  const config = TOWER_CONFIGS[tower.type];
  const range = config.rangeLevels[tower.rangeLevel - 1];
  const size = 44; // Bigger tower

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
      {/* Range Circle - always show when selected */}
      {isSelected && (
        <Svg
          width={range * 2}
          height={range * 2}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <RadialGradient id="rangeGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={config.color} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={config.color} stopOpacity="0.35" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={range}
            cy={range}
            r={range - 2}
            fill="url(#rangeGrad)"
            stroke={config.color}
            strokeWidth={3}
            strokeDasharray="8 5"
          />
        </Svg>
      )}

      {/* Tower Body - Much more visible */}
      <TouchableOpacity
        style={[
          styles.towerOuter,
          {
            left: range - size / 2 - 4,
            top: range - size / 2 - 4,
            width: size + 8,
            height: size + 8,
            borderColor: isSelected ? COLORS.text : config.color,
            shadowColor: config.color,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={`towerGrad-${tower.id}`} cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={config.color} />
              <Stop offset="100%" stopColor={config.color} stopOpacity={0.7} />
            </RadialGradient>
          </Defs>
          
          {/* Base circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 3}
            fill={`url(#towerGrad-${tower.id})`}
            stroke={isSelected ? COLORS.text : '#000'}
            strokeWidth={isSelected ? 3 : 2}
          />
          
          {/* Inner icon */}
          <TowerIcon type={tower.type} color={config.color} size={size} />
        </Svg>
        
        {/* Level badge - Power */}
        <View style={[styles.levelBadge, { backgroundColor: COLORS.solanaPurple }]}>
          <Text style={styles.levelText}>{tower.level}</Text>
        </View>
        
        {/* Range badge - only if upgraded */}
        {tower.rangeLevel > 1 && (
          <View style={[styles.rangeBadge, { backgroundColor: COLORS.solanaBlue }]}>
            <Text style={styles.levelText}>R{tower.rangeLevel}</Text>
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
  towerOuter: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // Strong glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  levelBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  rangeBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  levelText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },
});
