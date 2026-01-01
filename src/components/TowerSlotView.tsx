/**
 * TowerSlotView Component
 * Renders tower slots and placed towers with Solana ecosystem theming
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  G,
  Polygon,
  Rect,
  LinearGradient,
} from 'react-native-svg';
import { TowerSlot, Tower } from '../game/types';
import { COLORS, TOWER_CONFIGS, GAME_CONFIG } from '../game/config';

interface TowerSlotViewProps {
  slot: TowerSlot;
  onPress: () => void;
  isSelected: boolean;
}

export const TowerSlotView: React.FC<TowerSlotViewProps> = ({
  slot,
  onPress,
  isSelected,
}) => {
  const size = GAME_CONFIG.slotRadius * 2;
  const tower = slot.tower;
  const config = tower ? TOWER_CONFIGS[tower.type] : null;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          left: slot.x - GAME_CONFIG.slotRadius,
          top: slot.y - GAME_CONFIG.slotRadius,
          width: size,
          height: size,
          opacity: slot.locked ? 0.4 : 1,
        },
      ]}
      onPress={onPress}
      disabled={slot.locked}
      activeOpacity={0.7}
    >
      <Svg width={size} height={size}>
        <Defs>
          {/* Empty slot gradient */}
          <RadialGradient id="emptySlot" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.bgCard} />
            <Stop offset="100%" stopColor={COLORS.bgDark} />
          </RadialGradient>
          
          {/* Tower gradient based on type */}
          <RadialGradient id="towerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config?.color || COLORS.solanaGreen} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={config?.color || COLORS.solanaGreen} stopOpacity="0" />
          </RadialGradient>
          
          {/* Range indicator */}
          <RadialGradient id="rangeGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} stopOpacity="0" />
            <Stop offset="80%" stopColor={COLORS.solanaGreen} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.3" />
          </RadialGradient>
          
          {/* Locked slot gradient */}
          <LinearGradient id="lockedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaPink} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={COLORS.bgDark} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Selected range indicator */}
        {isSelected && config && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={config.range}
            fill="none"
            stroke={config.color}
            strokeWidth={2}
            strokeDasharray="5 5"
            opacity={0.5}
          />
        )}
        
        {slot.locked ? (
          // Locked slot (X pattern)
          <G>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={GAME_CONFIG.slotRadius - 2}
              fill="url(#lockedGradient)"
              stroke={COLORS.solanaPink}
              strokeWidth={2}
              strokeOpacity={0.5}
            />
            <Rect
              x={size / 2 - 8}
              y={size / 2 - 2}
              width={16}
              height={4}
              fill={COLORS.solanaPink}
              opacity={0.6}
              transform={`rotate(45 ${size/2} ${size/2})`}
            />
            <Rect
              x={size / 2 - 8}
              y={size / 2 - 2}
              width={16}
              height={4}
              fill={COLORS.solanaPink}
              opacity={0.6}
              transform={`rotate(-45 ${size/2} ${size/2})`}
            />
          </G>
        ) : tower && config ? (
          // Tower placed
          <G>
            {/* Tower glow */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={GAME_CONFIG.slotRadius + 5}
              fill="url(#towerGlow)"
            />
            
            {/* Tower base */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={GAME_CONFIG.slotRadius - 2}
              fill={COLORS.bgCard}
              stroke={config.color}
              strokeWidth={3}
            />
            
            {/* Tower center (hexagon shape) */}
            <Polygon
              points={getHexagonPoints(size / 2, size / 2, GAME_CONFIG.slotRadius - 8)}
              fill={config.color}
              opacity={0.8}
            />
            
            {/* Level indicators (dots around edge) */}
            {[...Array(tower.level)].map((_, i) => {
              const angle = (i * (2 * Math.PI / 3)) - Math.PI / 2;
              const dotX = size / 2 + Math.cos(angle) * (GAME_CONFIG.slotRadius - 5);
              const dotY = size / 2 + Math.sin(angle) * (GAME_CONFIG.slotRadius - 5);
              return (
                <Circle
                  key={i}
                  cx={dotX}
                  cy={dotY}
                  r={4}
                  fill={COLORS.solanaGreen}
                  stroke={COLORS.bgDark}
                  strokeWidth={1}
                />
              );
            })}
            
            {/* Selection indicator */}
            {isSelected && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={GAME_CONFIG.slotRadius + 2}
                fill="none"
                stroke={COLORS.solanaGreen}
                strokeWidth={3}
                strokeDasharray="10 5"
              />
            )}
          </G>
        ) : (
          // Empty slot
          <G>
            {/* Slot background */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={GAME_CONFIG.slotRadius - 2}
              fill="url(#emptySlot)"
              stroke={COLORS.solanaPurple}
              strokeWidth={2}
              strokeDasharray="8 4"
              strokeOpacity={0.6}
            />
            
            {/* Plus icon */}
            <Rect
              x={size / 2 - 8}
              y={size / 2 - 2}
              width={16}
              height={4}
              fill={COLORS.solanaPurple}
              opacity={0.6}
            />
            <Rect
              x={size / 2 - 2}
              y={size / 2 - 8}
              width={4}
              height={16}
              fill={COLORS.solanaPurple}
              opacity={0.6}
            />
            
            {/* Selection indicator */}
            {isSelected && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={GAME_CONFIG.slotRadius + 2}
                fill="none"
                stroke={COLORS.solanaGreen}
                strokeWidth={3}
              />
            )}
          </G>
        )}
      </Svg>
      
      {/* Tower icon and level badge */}
      {tower && config && (
        <View style={styles.towerInfo}>
          <Text style={styles.towerIcon}>{config.icon}</Text>
          {tower.level < GAME_CONFIG.maxTowerLevel && (
            <View style={[styles.levelBadge, { backgroundColor: config.color }]}>
              <Text style={styles.levelText}>L{tower.level}</Text>
            </View>
          )}
          {tower.level === GAME_CONFIG.maxTowerLevel && (
            <View style={[styles.maxBadge]}>
              <Text style={styles.maxText}>MAX</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Generate hexagon points for tower center
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerIcon: {
    fontSize: 18,
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  levelText: {
    color: COLORS.bgDark,
    fontSize: 8,
    fontWeight: 'bold',
  },
  maxBadge: {
    position: 'absolute',
    bottom: -8,
    right: -12,
    backgroundColor: COLORS.solanaGreen,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  maxText: {
    color: COLORS.bgDark,
    fontSize: 7,
    fontWeight: 'bold',
  },
});

export default TowerSlotView;
