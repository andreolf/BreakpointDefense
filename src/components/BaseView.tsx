/**
 * BaseView Component
 * Renders the player's base (Solana Network Node)
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Circle,
  Polygon,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  G,
  Rect,
  Path,
} from 'react-native-svg';
import { COLORS, getPathPoints, PATH_WAYPOINTS } from '../game/config';

interface BaseViewProps {
  hp: number;
  maxHp: number;
  gameWidth: number;
  gameHeight: number;
}

export const BaseView: React.FC<BaseViewProps> = ({
  hp,
  maxHp,
  gameWidth,
  gameHeight,
}) => {
  const hpPercent = hp / maxHp;
  const size = 50;
  
  // Get base position from path (last point)
  const pathPoints = getPathPoints(gameWidth, gameHeight);
  const basePoint = pathPoints[pathPoints.length - 1];
  const baseX = Math.min(basePoint.x, gameWidth - size);
  const baseY = basePoint.y;
  
  // HP color
  const hpColor = hpPercent > 0.6 
    ? COLORS.hpGood 
    : hpPercent > 0.3 
      ? COLORS.hpMedium 
      : COLORS.hpLow;
  
  // Pulse animation intensity based on HP
  const pulseOpacity = hpPercent < 0.3 ? 0.5 : 0.3;
  
  return (
    <View
      style={[
        styles.container,
        {
          left: baseX - size,
          top: baseY - size,
          width: size * 2,
          height: size * 2 + 20,
        },
      ]}
    >
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          {/* Base glow */}
          <RadialGradient id="baseGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={hpColor} stopOpacity={pulseOpacity} />
            <Stop offset="70%" stopColor={hpColor} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={hpColor} stopOpacity="0" />
          </RadialGradient>
          
          {/* Base body gradient */}
          <RadialGradient id="baseBody" cx="30%" cy="30%" r="80%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} />
            <Stop offset="100%" stopColor={COLORS.solanaPurple} />
          </RadialGradient>
          
          {/* Shield gradient */}
          <LinearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={COLORS.solanaPurple} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        
        {/* Outer glow */}
        <Circle
          cx={size}
          cy={size}
          r={size + 10}
          fill="url(#baseGlow)"
        />
        
        {/* Defense rings */}
        <Circle
          cx={size}
          cy={size}
          r={size - 5}
          fill="none"
          stroke={hpColor}
          strokeWidth={2}
          strokeOpacity={0.3}
          strokeDasharray="10 5"
        />
        
        {/* Main base hexagon */}
        <Polygon
          points={getHexagonPoints(size, size, size - 10)}
          fill="url(#baseBody)"
          stroke={COLORS.text}
          strokeWidth={2}
        />
        
        {/* Inner hexagon */}
        <Polygon
          points={getHexagonPoints(size, size, size - 20)}
          fill={COLORS.bgCard}
          stroke={hpColor}
          strokeWidth={2}
        />
        
        {/* Solana logo simplified (3 lines) */}
        <G>
          <Path
            d={`M ${size - 12} ${size - 8} L ${size + 12} ${size - 8}`}
            stroke={COLORS.solanaGreen}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d={`M ${size - 12} ${size} L ${size + 12} ${size}`}
            stroke={COLORS.solanaPurple}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d={`M ${size - 12} ${size + 8} L ${size + 12} ${size + 8}`}
            stroke={COLORS.solanaPink}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>
        
        {/* HP shield segments */}
        {[...Array(5)].map((_, i) => {
          const segmentPercent = (i + 1) / 5;
          const isActive = hpPercent >= segmentPercent - 0.1;
          const angle = (i * Math.PI / 4) - Math.PI / 2;
          const x = size + Math.cos(angle) * (size - 3);
          const y = size + Math.sin(angle) * (size - 3);
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={isActive ? hpColor : COLORS.bgCard}
              stroke={COLORS.bgDark}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      
      {/* HP Bar */}
      <View style={styles.hpContainer}>
        <View style={styles.hpBarBg}>
          <View
            style={[
              styles.hpBarFill,
              {
                width: `${hpPercent * 100}%`,
                backgroundColor: hpColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.hpText, { color: hpColor }]}>
          {hp}/{maxHp}
        </Text>
      </View>
      
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>NETWORK</Text>
      </View>
    </View>
  );
};

// Generate hexagon points
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
  },
  hpContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  hpBarBg: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.bgDark,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.bgCard,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hpText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  labelContainer: {
    position: 'absolute',
    top: -15,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
  },
  label: {
    color: COLORS.solanaGreen,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default BaseView;
