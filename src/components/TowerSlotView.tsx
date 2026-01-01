/**
 * TowerSlotView Component
 * Renders tower slots BESIDE the path with visible range indicators
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
  const tower = slot.tower;
  const config = tower ? TOWER_CONFIGS[tower.type] : null;
  const slotSize = GAME_CONFIG.slotRadius * 2;
  
  // Range indicator size (for towers)
  const rangeSize = config ? config.range * 2 : 0;
  
  // Total container size needs to accommodate range indicator
  const containerSize = tower && config ? Math.max(slotSize, rangeSize) : slotSize;
  const offset = (containerSize - slotSize) / 2;

  return (
    <View
      style={[
        styles.container,
        {
          left: slot.x - containerSize / 2,
          top: slot.y - containerSize / 2,
          width: containerSize,
          height: containerSize,
          opacity: slot.locked && !tower ? 0.3 : 1,
        },
      ]}
    >
      {/* Range indicator (always visible for placed towers) */}
      {tower && config && (
        <Svg
          width={containerSize}
          height={containerSize}
          style={StyleSheet.absoluteFillObject}
        >
          <Defs>
            <RadialGradient id={`range-${slot.index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={config.color} stopOpacity="0" />
              <Stop offset="70%" stopColor={config.color} stopOpacity="0.05" />
              <Stop offset="90%" stopColor={config.color} stopOpacity="0.1" />
              <Stop offset="100%" stopColor={config.color} stopOpacity="0.15" />
            </RadialGradient>
          </Defs>
          
          {/* Range circle fill */}
          <Circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={config.range}
            fill={`url(#range-${slot.index})`}
          />
          
          {/* Range circle border */}
          <Circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={config.range}
            fill="none"
            stroke={config.color}
            strokeWidth={isSelected ? 2 : 1}
            strokeOpacity={isSelected ? 0.6 : 0.25}
            strokeDasharray={isSelected ? "0" : "8 4"}
          />
        </Svg>
      )}
      
      {/* Touchable slot area */}
      <TouchableOpacity
        style={[
          styles.slotTouchable,
          {
            left: offset,
            top: offset,
            width: slotSize,
            height: slotSize,
          },
        ]}
        onPress={onPress}
        disabled={slot.locked && !tower}
        activeOpacity={0.7}
      >
        <Svg width={slotSize} height={slotSize}>
          <Defs>
            {/* Empty slot gradient */}
            <RadialGradient id={`emptySlot-${slot.index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={COLORS.bgCard} />
              <Stop offset="100%" stopColor={COLORS.bgDark} />
            </RadialGradient>
            
            {/* Tower gradient based on type */}
            <RadialGradient id={`towerGlow-${slot.index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={config?.color || COLORS.solanaGreen} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={config?.color || COLORS.solanaGreen} stopOpacity="0" />
            </RadialGradient>
            
            {/* Locked slot gradient */}
            <LinearGradient id={`locked-${slot.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.solanaPink} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={COLORS.bgDark} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          
          {slot.locked && !tower ? (
            // Locked slot (X pattern)
            <G>
              <Circle
                cx={slotSize / 2}
                cy={slotSize / 2}
                r={GAME_CONFIG.slotRadius - 2}
                fill={`url(#locked-${slot.index})`}
                stroke={COLORS.solanaPink}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
              <Rect
                x={slotSize / 2 - 6}
                y={slotSize / 2 - 1.5}
                width={12}
                height={3}
                fill={COLORS.solanaPink}
                opacity={0.5}
                transform={`rotate(45 ${slotSize/2} ${slotSize/2})`}
              />
              <Rect
                x={slotSize / 2 - 6}
                y={slotSize / 2 - 1.5}
                width={12}
                height={3}
                fill={COLORS.solanaPink}
                opacity={0.5}
                transform={`rotate(-45 ${slotSize/2} ${slotSize/2})`}
              />
            </G>
          ) : tower && config ? (
            // Tower placed
            <G>
              {/* Tower glow */}
              <Circle
                cx={slotSize / 2}
                cy={slotSize / 2}
                r={GAME_CONFIG.slotRadius + 3}
                fill={`url(#towerGlow-${slot.index})`}
              />
              
              {/* Tower base (dark circle) */}
              <Circle
                cx={slotSize / 2}
                cy={slotSize / 2}
                r={GAME_CONFIG.slotRadius - 2}
                fill={COLORS.bgDark}
                stroke={config.color}
                strokeWidth={3}
              />
              
              {/* Tower center (hexagon shape) */}
              <Polygon
                points={getHexagonPoints(slotSize / 2, slotSize / 2, GAME_CONFIG.slotRadius - 10)}
                fill={config.color}
                opacity={0.9}
              />
              
              {/* Inner hexagon */}
              <Polygon
                points={getHexagonPoints(slotSize / 2, slotSize / 2, GAME_CONFIG.slotRadius - 16)}
                fill={COLORS.bgDark}
                opacity={0.7}
              />
              
              {/* Level indicators (dots) */}
              {[...Array(tower.level)].map((_, i) => {
                const angle = (i * (2 * Math.PI / 3)) - Math.PI / 2;
                const dotX = slotSize / 2 + Math.cos(angle) * (GAME_CONFIG.slotRadius - 4);
                const dotY = slotSize / 2 + Math.sin(angle) * (GAME_CONFIG.slotRadius - 4);
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
                  cx={slotSize / 2}
                  cy={slotSize / 2}
                  r={GAME_CONFIG.slotRadius + 1}
                  fill="none"
                  stroke={COLORS.text}
                  strokeWidth={2}
                />
              )}
            </G>
          ) : (
            // Empty slot (available for placement)
            <G>
              {/* Slot background */}
              <Circle
                cx={slotSize / 2}
                cy={slotSize / 2}
                r={GAME_CONFIG.slotRadius - 2}
                fill={`url(#emptySlot-${slot.index})`}
                stroke={COLORS.solanaPurple}
                strokeWidth={2}
                strokeDasharray="6 3"
                strokeOpacity={0.7}
              />
              
              {/* Plus icon */}
              <Rect
                x={slotSize / 2 - 6}
                y={slotSize / 2 - 1.5}
                width={12}
                height={3}
                fill={COLORS.solanaPurple}
                opacity={0.7}
              />
              <Rect
                x={slotSize / 2 - 1.5}
                y={slotSize / 2 - 6}
                width={3}
                height={12}
                fill={COLORS.solanaPurple}
                opacity={0.7}
              />
              
              {/* Selection ring */}
              {isSelected && (
                <Circle
                  cx={slotSize / 2}
                  cy={slotSize / 2}
                  r={GAME_CONFIG.slotRadius + 1}
                  fill="none"
                  stroke={COLORS.solanaGreen}
                  strokeWidth={2}
                />
              )}
            </G>
          )}
        </Svg>
        
        {/* Tower icon */}
        {tower && config && (
          <View style={styles.towerIconContainer}>
            <Text style={styles.towerIcon}>{config.icon}</Text>
          </View>
        )}
        
        {/* Level badge */}
        {tower && config && (
          <View style={[styles.levelBadge, { backgroundColor: config.color }]}>
            <Text style={styles.levelText}>
              {tower.level === GAME_CONFIG.maxTowerLevel ? '★' : `L${tower.level}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
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
  },
  slotTouchable: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 18,
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.bgDark,
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default TowerSlotView;
