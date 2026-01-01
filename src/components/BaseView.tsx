/**
 * Base View
 * The network node that enemies are attacking
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, PATH_WAYPOINTS, GAME_WIDTH, GAME_HEIGHT } from '../game/config';

interface BaseViewProps {
  hp: number;
  maxHp: number;
}

export const BaseView: React.FC<BaseViewProps> = ({ hp, maxHp }) => {
  const hpPercent = (hp / maxHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;
  
  // Position at end of path
  const lastPoint = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  const x = lastPoint.x * GAME_WIDTH;
  const y = lastPoint.y * GAME_HEIGHT;
  const size = 45;

  return (
    <View
      style={[
        styles.container,
        {
          left: x - size,
          top: y - size,
          width: size * 2,
          height: size * 2,
        },
      ]}
    >
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          <RadialGradient id="baseGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} stopOpacity="1" />
            <Stop offset="70%" stopColor={COLORS.solanaPurple} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={COLORS.bgDark} stopOpacity="0.5" />
          </RadialGradient>
        </Defs>
        
        {/* Outer glow */}
        <Circle cx={size} cy={size} r={size - 2} fill="url(#baseGrad)" opacity={0.6} />
        
        {/* Inner circle */}
        <Circle cx={size} cy={size} r={size * 0.7} fill={COLORS.bgDark} />
        
        {/* HP indicator ring */}
        <Circle
          cx={size}
          cy={size}
          r={size * 0.6}
          fill="none"
          stroke={hpColor}
          strokeWidth={4}
          strokeDasharray={`${(hpPercent / 100) * 150} 150`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size} ${size})`}
        />
      </Svg>
      
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>🌐</Text>
        <Text style={[styles.hpText, { color: hpColor }]}>{hp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  hpText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
