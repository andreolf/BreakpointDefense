/**
 * EnemyView Component
 * Renders crypto-themed enemies (FUD, Rug Pulls, Network Congestion)
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
          left: enemy.x - size,
          top: enemy.y - size,
          width: size * 2,
          height: size * 2 + 12,
        },
      ]}
    >
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          {/* Enemy glow */}
          <RadialGradient id={`glow-${enemy.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </RadialGradient>
          
          {/* Enemy body gradient */}
          <RadialGradient id={`body-${enemy.id}`} cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={config.color} />
            <Stop offset="100%" stopColor={darkenColor(config.color, 0.4)} />
          </RadialGradient>
          
          {/* Danger indicator for miniboss */}
          <LinearGradient id="dangerPulse" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.enemyCongestion} />
            <Stop offset="50%" stopColor={COLORS.solanaPink} />
            <Stop offset="100%" stopColor={COLORS.enemyCongestion} />
          </LinearGradient>
        </Defs>
        
        {/* Glow effect */}
        <Circle
          cx={size}
          cy={size}
          r={size + 5}
          fill={`url(#glow-${enemy.id})`}
        />
        
        {/* Enemy type specific shape */}
        {enemy.type === 'fud' && (
          // FUD: Jagged speech bubble / fear icon
          <G>
            {/* Outer spiky shape */}
            <Polygon
              points={getFudShape(size, size, size * 0.9)}
              fill={`url(#body-${enemy.id})`}
              stroke={COLORS.bgDark}
              strokeWidth={1}
            />
            {/* Eyes (worried) */}
            <Circle cx={size - 4} cy={size - 2} r={3} fill={COLORS.bgDark} />
            <Circle cx={size + 4} cy={size - 2} r={3} fill={COLORS.bgDark} />
            {/* Worried mouth */}
            <Path
              d={`M ${size - 4} ${size + 5} Q ${size} ${size + 2} ${size + 4} ${size + 5}`}
              stroke={COLORS.bgDark}
              strokeWidth={2}
              fill="none"
            />
          </G>
        )}
        
        {enemy.type === 'rugpull' && (
          // Rug Pull: Carpet/rug shape being pulled
          <G>
            {/* Rug base (rectangle with wavy edge) */}
            <Rect
              x={size - size * 0.8}
              y={size - size * 0.5}
              width={size * 1.6}
              height={size}
              rx={3}
              fill={`url(#body-${enemy.id})`}
              stroke={COLORS.bgDark}
              strokeWidth={1}
            />
            {/* Carpet pattern */}
            <Rect
              x={size - size * 0.6}
              y={size - size * 0.3}
              width={size * 1.2}
              height={size * 0.6}
              rx={2}
              fill={darkenColor(config.color, 0.3)}
            />
            {/* "Pull" hand icon */}
            <Circle cx={size + size * 0.5} cy={size - size * 0.3} r={4} fill={COLORS.text} opacity={0.8} />
            {/* $ symbol */}
            <G>
              <Rect x={size - 1.5} y={size - 4} width={3} height={8} fill={COLORS.text} opacity={0.9} />
              <Rect x={size - 4} y={size - 2} width={8} height={2} fill={COLORS.text} opacity={0.9} />
              <Rect x={size - 4} y={size + 1} width={8} height={2} fill={COLORS.text} opacity={0.9} />
            </G>
          </G>
        )}
        
        {enemy.type === 'congestion' && (
          // Network Congestion: Warning triangle / traffic jam
          <G>
            {/* Outer danger triangle */}
            <Polygon
              points={getTrianglePoints(size, size, size * 0.95)}
              fill={`url(#body-${enemy.id})`}
              stroke={COLORS.bgDark}
              strokeWidth={2}
            />
            {/* Inner triangle */}
            <Polygon
              points={getTrianglePoints(size, size, size * 0.7)}
              fill={darkenColor(config.color, 0.2)}
            />
            {/* Exclamation mark */}
            <Rect
              x={size - 2}
              y={size - size * 0.3}
              width={4}
              height={size * 0.35}
              rx={2}
              fill={COLORS.bgDark}
            />
            <Circle cx={size} cy={size + size * 0.25} r={3} fill={COLORS.bgDark} />
            
            {/* Pulsing danger rings */}
            <Circle
              cx={size}
              cy={size}
              r={size + 8}
              fill="none"
              stroke={config.color}
              strokeWidth={2}
              strokeOpacity={0.3}
              strokeDasharray="5 5"
            />
          </G>
        )}
      </Svg>
      
      {/* HP Bar */}
      <View style={styles.hpBarContainer}>
        <View style={[styles.hpBarBg]}>
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
      
      {/* Enemy icon (emoji) */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
    </View>
  );
};

// Generate FUD shape (spiky/jagged circle for fear)
function getFudShape(cx: number, cy: number, r: number): string {
  const points = [];
  const spikes = 8;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI / spikes) - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.6;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

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
    marginTop: 2,
    width: '100%',
    alignItems: 'center',
  },
  hpBarBg: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.bgDark,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.bgCard,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  iconContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EnemyView;
