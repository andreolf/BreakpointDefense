/**
 * Enemy View
 * Geometric Solana-style enemy shapes
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Enemy } from '../game/types';
import { COLORS } from '../game/config';

interface EnemyViewProps {
  enemy: Enemy;
}

// Solana-style geometric shapes for each enemy type
const renderEnemyShape = (type: string, size: number, color: string) => {
  const half = size;
  const center = size;
  
  switch (type) {
    case 'fud':
      // Triangle (pointing right - direction of movement)
      return (
        <Polygon
          points={`${center - half * 0.7},${center - half * 0.6} ${center + half * 0.8},${center} ${center - half * 0.7},${center + half * 0.6}`}
          fill={`url(#grad-${type})`}
          stroke={color}
          strokeWidth={2}
        />
      );
    
    case 'rugpull':
      // Hexagon (stable, tank-like)
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        hexPoints.push(
          `${center + Math.cos(angle) * half * 0.8},${center + Math.sin(angle) * half * 0.8}`
        );
      }
      return (
        <Polygon
          points={hexPoints.join(' ')}
          fill={`url(#grad-${type})`}
          stroke={color}
          strokeWidth={2}
        />
      );
    
    case 'congestion':
      // Diamond/rhombus (boss)
      return (
        <G>
          <Polygon
            points={`${center},${center - half * 0.9} ${center + half * 0.7},${center} ${center},${center + half * 0.9} ${center - half * 0.7},${center}`}
            fill={`url(#grad-${type})`}
            stroke={color}
            strokeWidth={3}
          />
          {/* Inner diamond */}
          <Polygon
            points={`${center},${center - half * 0.4} ${center + half * 0.3},${center} ${center},${center + half * 0.4} ${center - half * 0.3},${center}`}
            fill={COLORS.bgDark}
            opacity={0.5}
          />
        </G>
      );
    
    default:
      return (
        <Circle cx={center} cy={center} r={half * 0.7} fill={color} />
      );
  }
};

export const EnemyView: React.FC<EnemyViewProps> = ({ enemy }) => {
  const size = enemy.size;
  const svgSize = size * 2;
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

  // Get gradient colors based on enemy type
  const getGradientColors = () => {
    switch (enemy.type) {
      case 'fud':
        return { start: '#FF6B6B', end: '#FF3333' };
      case 'rugpull':
        return { start: '#A52A2A', end: '#5C1515' };
      case 'congestion':
        return { start: '#FFD700', end: '#FFA500' };
      default:
        return { start: '#FF4444', end: '#CC0000' };
    }
  };
  
  const gradColors = getGradientColors();

  return (
    <View
      style={[
        styles.container,
        {
          left: enemy.x - size,
          top: enemy.y - size,
          width: svgSize,
          height: svgSize + 8,
        },
      ]}
    >
      {/* Enemy shape */}
      <Svg width={svgSize} height={svgSize}>
        <Defs>
          <LinearGradient id={`grad-${enemy.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradColors.start} />
            <Stop offset="100%" stopColor={gradColors.end} />
          </LinearGradient>
        </Defs>
        
        {/* Shadow */}
        <Circle
          cx={size}
          cy={size + 3}
          r={size * 0.6}
          fill="#000"
          opacity={0.3}
        />
        
        {renderEnemyShape(enemy.type, size, gradColors.end)}
      </Svg>

      {/* HP bar */}
      <View style={styles.hpBarContainer}>
        <View style={styles.hpBarBg}>
          <View style={[styles.hpBarFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  hpBarContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  hpBarBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
