import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, BASE_X, BASE_Y } from '../game/config';

interface BaseViewProps {
  hp: number;
  maxHp: number;
}

const BASE_SIZE = 50;

/**
 * Renders the player base at the end of the path
 * Now positioned at BASE_X, BASE_Y from config
 */
export const BaseView: React.FC<BaseViewProps> = React.memo(({ hp, maxHp }) => {
  const hpPercent = hp / maxHp;
  const isHurt = hpPercent < 0.5;
  const isCritical = hpPercent < 0.25;
  
  // Base is already rendered in Lane.tsx as part of the background
  // This component now just shows the HP indicator overlay
  
  return (
    <View
      style={[
        styles.container,
        {
          left: BASE_X - BASE_SIZE / 2,
          top: BASE_Y - BASE_SIZE / 2 - 20,
        },
      ]}
    >
      <Svg width={BASE_SIZE} height={BASE_SIZE + 30}>
        <Defs>
          <RadialGradient id="hpGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={isCritical ? COLORS.danger : isHurt ? COLORS.gold : COLORS.primary}
              stopOpacity={0.5}
            />
            <Stop offset="1" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        
        {/* HP Glow effect */}
        <Circle
          cx={BASE_SIZE / 2}
          cy={BASE_SIZE / 2 + 10}
          r={BASE_SIZE / 2}
          fill="url(#hpGlow)"
        />
        
        {/* HP Bar background */}
        <Rect
          x={5}
          y={BASE_SIZE + 15}
          width={BASE_SIZE - 10}
          height={8}
          rx={4}
          fill="#333"
        />
        
        {/* HP Bar fill */}
        <Rect
          x={5}
          y={BASE_SIZE + 15}
          width={(BASE_SIZE - 10) * hpPercent}
          height={8}
          rx={4}
          fill={isCritical ? COLORS.danger : isHurt ? COLORS.gold : COLORS.primary}
        />
        
        {/* HP Text */}
        <SvgText
          x={BASE_SIZE / 2}
          y={BASE_SIZE + 10}
          fontSize={12}
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
        >
          {hp}
        </SvgText>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
