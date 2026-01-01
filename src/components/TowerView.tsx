/**
 * TowerView Component
 * Renders a placed tower with range indicator
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  G,
  Polygon,
} from 'react-native-svg';
import { Tower } from '../game/types';
import { COLORS, TOWER_CONFIGS, GAME_CONFIG } from '../game/config';

interface TowerViewProps {
  tower: Tower;
  isSelected: boolean;
}

export const TowerView: React.FC<TowerViewProps> = ({ tower, isSelected }) => {
  const config = TOWER_CONFIGS[tower.type];
  const range = config.range[tower.level - 1];  // Range increases with level!
  const slotSize = GAME_CONFIG.slotRadius * 2;
  
  // Container size to fit range indicator
  const containerSize = Math.max(slotSize + 10, range * 2 + 10);
  const centerOffset = containerSize / 2;

  return (
    <View
      style={[
        styles.container,
        {
          left: tower.x - centerOffset,
          top: tower.y - centerOffset,
          width: containerSize,
          height: containerSize,
        },
      ]}
    >
      <Svg width={containerSize} height={containerSize}>
        <Defs>
          {/* Range gradient */}
          <RadialGradient id={`range-${tower.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity="0" />
            <Stop offset="75%" stopColor={config.color} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={config.color} stopOpacity="0.2" />
          </RadialGradient>
          
          {/* Tower glow */}
          <RadialGradient id={`glow-${tower.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Range circle - always visible */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={range}
          fill={`url(#range-${tower.id})`}
        />
        
        {/* Range border */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={range}
          fill="none"
          stroke={config.color}
          strokeWidth={isSelected ? 2.5 : 1}
          strokeOpacity={isSelected ? 0.7 : 0.3}
          strokeDasharray={isSelected ? "0" : "6 4"}
        />
        
        {/* Tower glow */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={GAME_CONFIG.slotRadius + 5}
          fill={`url(#glow-${tower.id})`}
        />
        
        {/* Tower base */}
        <Circle
          cx={centerOffset}
          cy={centerOffset}
          r={GAME_CONFIG.slotRadius}
          fill={COLORS.bgDark}
          stroke={config.color}
          strokeWidth={3}
        />
        
        {/* Tower center hexagon */}
        <Polygon
          points={getHexagonPoints(centerOffset, centerOffset, GAME_CONFIG.slotRadius - 8)}
          fill={config.color}
          opacity={0.9}
        />
        
        {/* Inner hexagon */}
        <Polygon
          points={getHexagonPoints(centerOffset, centerOffset, GAME_CONFIG.slotRadius - 14)}
          fill={COLORS.bgDark}
          opacity={0.6}
        />
        
        {/* Level dots */}
        {[...Array(tower.level)].map((_, i) => {
          const angle = (i * (2 * Math.PI / 3)) - Math.PI / 2;
          const dotX = centerOffset + Math.cos(angle) * (GAME_CONFIG.slotRadius - 3);
          const dotY = centerOffset + Math.sin(angle) * (GAME_CONFIG.slotRadius - 3);
          return (
            <Circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={3}
              fill={COLORS.solanaGreen}
              stroke={COLORS.bgDark}
              strokeWidth={1}
            />
          );
        })}
        
        {/* Selection ring */}
        {isSelected && (
          <Circle
            cx={centerOffset}
            cy={centerOffset}
            r={GAME_CONFIG.slotRadius + 3}
            fill="none"
            stroke={COLORS.text}
            strokeWidth={2}
          />
        )}
      </Svg>
      
      {/* Tower icon */}
      <View style={[styles.iconContainer, { left: centerOffset - 10, top: centerOffset - 12 }]}>
        <Text style={styles.towerIcon}>{config.icon}</Text>
      </View>
      
      {/* Level badge */}
      <View
        style={[
          styles.levelBadge,
          {
            backgroundColor: config.color,
            left: centerOffset + GAME_CONFIG.slotRadius - 12,
            top: centerOffset + GAME_CONFIG.slotRadius - 8,
          },
        ]}
      >
        <Text style={styles.levelText}>
          {tower.level === GAME_CONFIG.maxTowerLevel ? '★' : `L${tower.level}`}
        </Text>
      </View>
    </View>
  );
};

function getHexagonPoints(cx: number, cy: number, r: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
    width: 20,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.bgDark,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default TowerView;

