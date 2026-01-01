/**
 * Enemy View
 * Enemies with faces and expressions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Enemy } from '../game/types';
import { COLORS } from '../game/config';

interface EnemyViewProps {
  enemy: Enemy;
}

export const EnemyView: React.FC<EnemyViewProps> = ({ enemy }) => {
  const size = enemy.size;
  const svgSize = size * 2;
  const center = size;
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

  // Different faces for each enemy type
  const renderFace = () => {
    const eyeY = center - size * 0.15;
    const eyeSpacing = size * 0.25;
    const eyeSize = size * 0.12;
    
    switch (enemy.type) {
      case 'fud':
        // Scared/worried face - wide eyes, wavy mouth
        return (
          <G>
            {/* Eyes - wide and worried */}
            <Ellipse cx={center - eyeSpacing} cy={eyeY} rx={eyeSize} ry={eyeSize * 1.3} fill="#FFF" />
            <Ellipse cx={center + eyeSpacing} cy={eyeY} rx={eyeSize} ry={eyeSize * 1.3} fill="#FFF" />
            <Circle cx={center - eyeSpacing} cy={eyeY + 2} r={eyeSize * 0.5} fill="#000" />
            <Circle cx={center + eyeSpacing} cy={eyeY + 2} r={eyeSize * 0.5} fill="#000" />
            {/* Eyebrows - worried angle */}
            <Path
              d={`M${center - eyeSpacing - eyeSize} ${eyeY - eyeSize * 1.5} L${center - eyeSpacing + eyeSize} ${eyeY - eyeSize * 2}`}
              stroke="#000"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path
              d={`M${center + eyeSpacing + eyeSize} ${eyeY - eyeSize * 1.5} L${center + eyeSpacing - eyeSize} ${eyeY - eyeSize * 2}`}
              stroke="#000"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Wavy worried mouth */}
            <Path
              d={`M${center - size * 0.25} ${center + size * 0.3} Q${center} ${center + size * 0.2} ${center + size * 0.25} ${center + size * 0.3}`}
              stroke="#000"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      
      case 'rugpull':
        // Evil/sneaky face - narrow eyes, smirk
        return (
          <G>
            {/* Narrow evil eyes */}
            <Ellipse cx={center - eyeSpacing} cy={eyeY} rx={eyeSize * 1.2} ry={eyeSize * 0.6} fill="#FFF" />
            <Ellipse cx={center + eyeSpacing} cy={eyeY} rx={eyeSize * 1.2} ry={eyeSize * 0.6} fill="#FFF" />
            <Circle cx={center - eyeSpacing + 2} cy={eyeY} r={eyeSize * 0.4} fill="#000" />
            <Circle cx={center + eyeSpacing + 2} cy={eyeY} r={eyeSize * 0.4} fill="#000" />
            {/* Angry eyebrows */}
            <Path
              d={`M${center - eyeSpacing - eyeSize} ${eyeY - eyeSize * 1.2} L${center - eyeSpacing + eyeSize} ${eyeY - eyeSize * 0.8}`}
              stroke="#000"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <Path
              d={`M${center + eyeSpacing + eyeSize} ${eyeY - eyeSize * 1.2} L${center + eyeSpacing - eyeSize} ${eyeY - eyeSize * 0.8}`}
              stroke="#000"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            {/* Evil smirk */}
            <Path
              d={`M${center - size * 0.2} ${center + size * 0.25} Q${center + size * 0.1} ${center + size * 0.45} ${center + size * 0.3} ${center + size * 0.2}`}
              stroke="#000"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      
      case 'congestion':
        // Boss face - angry, determined
        return (
          <G>
            {/* Big angry eyes */}
            <Circle cx={center - eyeSpacing * 1.1} cy={eyeY} r={eyeSize * 1.3} fill="#FFF" />
            <Circle cx={center + eyeSpacing * 1.1} cy={eyeY} r={eyeSize * 1.3} fill="#FFF" />
            <Circle cx={center - eyeSpacing * 1.1} cy={eyeY + 2} r={eyeSize * 0.7} fill="#000" />
            <Circle cx={center + eyeSpacing * 1.1} cy={eyeY + 2} r={eyeSize * 0.7} fill="#000" />
            {/* Red glint */}
            <Circle cx={center - eyeSpacing * 1.1 + 2} cy={eyeY} r={eyeSize * 0.25} fill="#FF0000" />
            <Circle cx={center + eyeSpacing * 1.1 + 2} cy={eyeY} r={eyeSize * 0.25} fill="#FF0000" />
            {/* Heavy angry brows */}
            <Path
              d={`M${center - eyeSpacing * 1.1 - eyeSize * 1.5} ${eyeY - eyeSize * 1.3} L${center - eyeSpacing * 1.1 + eyeSize * 1.2} ${eyeY - eyeSize * 0.6}`}
              stroke="#000"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Path
              d={`M${center + eyeSpacing * 1.1 + eyeSize * 1.5} ${eyeY - eyeSize * 1.3} L${center + eyeSpacing * 1.1 - eyeSize * 1.2} ${eyeY - eyeSize * 0.6}`}
              stroke="#000"
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* Angry frown */}
            <Path
              d={`M${center - size * 0.3} ${center + size * 0.35} Q${center} ${center + size * 0.2} ${center + size * 0.3} ${center + size * 0.35}`}
              stroke="#000"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </G>
        );
      
      default:
        return null;
    }
  };

  // Body colors
  const getColors = () => {
    switch (enemy.type) {
      case 'fud':
        return { body: '#FF6B6B', edge: '#CC4444' };
      case 'rugpull':
        return { body: '#8B4444', edge: '#5C2222' };
      case 'congestion':
        return { body: '#FFD700', edge: '#CC9900' };
      default:
        return { body: '#FF4444', edge: '#CC0000' };
    }
  };
  
  const colors = getColors();
  const bodyRadius = size * 0.85;

  return (
    <View
      style={[
        styles.container,
        {
          left: enemy.x - size,
          top: enemy.y - size,
          width: svgSize,
          height: svgSize + 10,
        },
      ]}
    >
      <Svg width={svgSize} height={svgSize}>
        <Defs>
          <RadialGradient id={`bodyGrad-${enemy.id}`} cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={colors.body} />
            <Stop offset="100%" stopColor={colors.edge} />
          </RadialGradient>
        </Defs>
        
        {/* Shadow */}
        <Ellipse
          cx={center}
          cy={center + size * 0.8}
          rx={bodyRadius * 0.7}
          ry={bodyRadius * 0.25}
          fill="#000"
          opacity={0.3}
        />
        
        {/* Body */}
        <Circle
          cx={center}
          cy={center}
          r={bodyRadius}
          fill={`url(#bodyGrad-${enemy.id})`}
          stroke={colors.edge}
          strokeWidth={2}
        />
        
        {/* Face */}
        {renderFace()}
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
    width: '90%',
    marginTop: 2,
  },
  hpBarBg: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
