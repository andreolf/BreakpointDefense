/**
 * EnemyView Component
 * Renders BIGGER crypto-themed enemies clearly on the path
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Defs,
  RadialGradient,
  Stop,
  G,
  Polygon,
  Path,
  LinearGradient,
} from 'react-native-svg';
import { Enemy } from '../game/types';
import { COLORS, ENEMY_CONFIGS } from '../game/config';

interface EnemyViewProps {
  enemy: Enemy;
}

export const EnemyView: React.FC<EnemyViewProps> = ({ enemy }) => {
  const config = ENEMY_CONFIGS[enemy.type];
  const hpPercent = enemy.hp / enemy.maxHp;
  const size = enemy.size;
  const viewSize = size * 2.2; // Extra space for effects
  
  // HP bar color
  const hpColor = hpPercent > 0.6 
    ? COLORS.hpGood 
    : hpPercent > 0.3 
      ? COLORS.hpMedium 
      : COLORS.hpLow;
  
  return (
    <View
      style={[
        styles.container,
        {
          left: enemy.x - viewSize / 2,
          top: enemy.y - viewSize / 2,
          width: viewSize,
          height: viewSize + 16, // Extra for HP bar
        },
      ]}
    >
      <Svg width={viewSize} height={viewSize}>
        <Defs>
          {/* Enemy glow */}
          <RadialGradient id={`glow-${enemy.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity="0.6" />
            <Stop offset="60%" stopColor={config.color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </RadialGradient>
          
          {/* Enemy body gradient */}
          <RadialGradient id={`body-${enemy.id}`} cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={lightenColor(config.color, 0.3)} />
            <Stop offset="100%" stopColor={config.color} />
          </RadialGradient>
          
          {/* Shadow gradient */}
          <RadialGradient id={`shadow-${enemy.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#000" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Shadow under enemy */}
        <Circle
          cx={viewSize / 2}
          cy={viewSize / 2 + size * 0.3}
          r={size * 0.7}
          fill={`url(#shadow-${enemy.id})`}
        />
        
        {/* Glow effect */}
        <Circle
          cx={viewSize / 2}
          cy={viewSize / 2}
          r={size + 6}
          fill={`url(#glow-${enemy.id})`}
        />
        
        {/* Enemy type specific shape */}
        {enemy.type === 'fud' && (
          <G>
            {/* Outer body - jagged/scary shape */}
            <Circle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={size}
              fill={`url(#body-${enemy.id})`}
              stroke={darkenColor(config.color, 0.3)}
              strokeWidth={2}
            />
            
            {/* Face - worried eyes */}
            <Circle cx={viewSize / 2 - size * 0.25} cy={viewSize / 2 - size * 0.1} r={size * 0.18} fill="#000" />
            <Circle cx={viewSize / 2 + size * 0.25} cy={viewSize / 2 - size * 0.1} r={size * 0.18} fill="#000" />
            
            {/* Eye highlights */}
            <Circle cx={viewSize / 2 - size * 0.3} cy={viewSize / 2 - size * 0.15} r={size * 0.06} fill="#fff" />
            <Circle cx={viewSize / 2 + size * 0.2} cy={viewSize / 2 - size * 0.15} r={size * 0.06} fill="#fff" />
            
            {/* Worried mouth */}
            <Path
              d={`M ${viewSize / 2 - size * 0.3} ${viewSize / 2 + size * 0.35} 
                  Q ${viewSize / 2} ${viewSize / 2 + size * 0.15} 
                  ${viewSize / 2 + size * 0.3} ${viewSize / 2 + size * 0.35}`}
              stroke="#000"
              strokeWidth={2}
              fill="none"
            />
          </G>
        )}
        
        {enemy.type === 'rugpull' && (
          <G>
            {/* Rug shape - rounded rectangle */}
            <Rect
              x={viewSize / 2 - size}
              y={viewSize / 2 - size * 0.6}
              width={size * 2}
              height={size * 1.2}
              rx={size * 0.2}
              fill={`url(#body-${enemy.id})`}
              stroke={darkenColor(config.color, 0.3)}
              strokeWidth={2}
            />
            
            {/* Carpet pattern stripes */}
            {[...Array(3)].map((_, i) => (
              <Rect
                key={i}
                x={viewSize / 2 - size * 0.7 + i * size * 0.5}
                y={viewSize / 2 - size * 0.4}
                width={size * 0.3}
                height={size * 0.8}
                rx={2}
                fill={darkenColor(config.color, 0.2)}
              />
            ))}
            
            {/* $ symbol */}
            <Circle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={size * 0.35}
              fill={darkenColor(config.color, 0.3)}
            />
            <Path
              d={`M ${viewSize / 2} ${viewSize / 2 - size * 0.25} 
                  L ${viewSize / 2} ${viewSize / 2 + size * 0.25}`}
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Path
              d={`M ${viewSize / 2 - size * 0.15} ${viewSize / 2 - size * 0.1}
                  Q ${viewSize / 2 + size * 0.15} ${viewSize / 2 - size * 0.1}
                  ${viewSize / 2 - size * 0.15} ${viewSize / 2 + size * 0.1}`}
              stroke="#fff"
              strokeWidth={2}
              fill="none"
            />
          </G>
        )}
        
        {enemy.type === 'congestion' && (
          <G>
            {/* Warning triangle */}
            <Polygon
              points={getTrianglePoints(viewSize / 2, viewSize / 2, size)}
              fill={`url(#body-${enemy.id})`}
              stroke={darkenColor(config.color, 0.3)}
              strokeWidth={3}
            />
            
            {/* Inner triangle */}
            <Polygon
              points={getTrianglePoints(viewSize / 2, viewSize / 2, size * 0.7)}
              fill={darkenColor(config.color, 0.15)}
            />
            
            {/* Exclamation mark */}
            <Rect
              x={viewSize / 2 - size * 0.08}
              y={viewSize / 2 - size * 0.35}
              width={size * 0.16}
              height={size * 0.4}
              rx={size * 0.08}
              fill="#000"
            />
            <Circle cx={viewSize / 2} cy={viewSize / 2 + size * 0.25} r={size * 0.1} fill="#000" />
            
            {/* Danger pulse rings */}
            <Circle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={size + 8}
              fill="none"
              stroke={config.color}
              strokeWidth={2}
              strokeOpacity={0.4}
              strokeDasharray="6 4"
            />
          </G>
        )}
      </Svg>
      
      {/* HP Bar - larger and more visible */}
      <View style={styles.hpBarContainer}>
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
      </View>
      
      {/* Enemy icon/emoji overlay */}
      <View style={[styles.iconContainer, { top: viewSize * 0.35 }]}>
        <Text style={[styles.icon, { fontSize: size * 0.7 }]}>{config.icon}</Text>
      </View>
    </View>
  );
};

// Generate triangle points for congestion enemy
function getTrianglePoints(cx: number, cy: number, r: number): string {
  const points = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI / 3) - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// Lighten a hex color
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 255) + 255 * amount);
  const b = Math.min(255, (num & 255) + 255 * amount);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Darken a hex color
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 255) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 255) * (1 - amount));
  const b = Math.max(0, (num & 255) * (1 - amount));
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  hpBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  hpBarBg: {
    width: '85%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default EnemyView;
