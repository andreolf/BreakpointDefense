/**
 * Enemy View
 * Renders an enemy with HP bar
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Enemy } from '../game/types';
import { ENEMY_CONFIGS, COLORS } from '../game/config';

interface EnemyViewProps {
  enemy: Enemy;
}

export const EnemyView: React.FC<EnemyViewProps> = ({ enemy }) => {
  const config = ENEMY_CONFIGS[enemy.type];
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

  return (
    <View
      style={[
        styles.container,
        {
          left: enemy.x - enemy.size,
          top: enemy.y - enemy.size,
          width: enemy.size * 2,
          height: enemy.size * 2,
        },
      ]}
    >
      {/* Enemy body */}
      <View
        style={[
          styles.body,
          {
            width: enemy.size * 2,
            height: enemy.size * 2,
            backgroundColor: config.color,
            borderRadius: enemy.size,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: enemy.size * 0.8 }]}>
          {config.icon}
        </Text>
      </View>

      {/* HP bar */}
      <View style={styles.hpBarBg}>
        <View style={[styles.hpBarFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  body: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    textAlign: 'center',
  },
  hpBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.bgDark,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
