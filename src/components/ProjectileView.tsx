/**
 * ProjectileView Component
 * Renders projectiles with Solana-themed visuals
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Line,
  G,
} from 'react-native-svg';
import { Projectile } from '../game/types';
import { COLORS, TOWER_CONFIGS, GAME_CONFIG } from '../game/config';

interface ProjectileViewProps {
  projectile: Projectile;
}

export const ProjectileView: React.FC<ProjectileViewProps> = ({ projectile }) => {
  const config = TOWER_CONFIGS[projectile.towerType];
  const size = GAME_CONFIG.projectileSize * 2;
  const color = config.projectileColor || COLORS.solanaGreen;
  
  // Calculate direction for trail
  const dx = projectile.targetX - projectile.x;
  const dy = projectile.targetY - projectile.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const normalizedDx = len > 0 ? (dx / len) * 10 : 0;
  const normalizedDy = len > 0 ? (dy / len) * 10 : 0;
  
  return (
    <View
      style={[
        styles.container,
        {
          left: projectile.x - size,
          top: projectile.y - size,
          width: size * 2,
          height: size * 2,
        },
      ]}
    >
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          {/* Projectile glow */}
          <RadialGradient id={`glow-${projectile.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
          
          {/* Core gradient */}
          <RadialGradient id={`core-${projectile.id}`} cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={COLORS.text} />
            <Stop offset="100%" stopColor={color} />
          </RadialGradient>
        </Defs>
        
        {/* Glow effect */}
        <Circle
          cx={size}
          cy={size}
          r={size - 2}
          fill={`url(#glow-${projectile.id})`}
        />
        
        {/* Trail line */}
        <Line
          x1={size}
          y1={size}
          x2={size - normalizedDx}
          y2={size - normalizedDy}
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.5}
          strokeLinecap="round"
        />
        
        {/* Core */}
        <Circle
          cx={size}
          cy={size}
          r={GAME_CONFIG.projectileSize}
          fill={`url(#core-${projectile.id})`}
        />
        
        {/* Center highlight */}
        <Circle
          cx={size - 1}
          cy={size - 1}
          r={2}
          fill={COLORS.text}
          opacity={0.9}
        />
        
        {/* Special effect for chain */}
        {config.special === 'chain' && (
          <G>
            <Circle
              cx={size}
              cy={size}
              r={size - 4}
              fill="none"
              stroke={COLORS.chain}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          </G>
        )}
        
        {/* Special effect for splash */}
        {config.special === 'splash' && (
          <G>
            <Circle
              cx={size}
              cy={size}
              r={size - 2}
              fill="none"
              stroke={COLORS.solanaPink}
              strokeWidth={2}
              opacity={0.5}
            />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default ProjectileView;
