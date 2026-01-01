/**
 * Projectile View
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Projectile } from '../game/types';
import { TOWER_CONFIGS, GAME_CONFIG } from '../game/config';

interface ProjectileViewProps {
  projectile: Projectile;
}

export const ProjectileView: React.FC<ProjectileViewProps> = ({ projectile }) => {
  const config = TOWER_CONFIGS[projectile.towerType];
  const size = GAME_CONFIG.projectileSize;

  return (
    <View
      style={[
        styles.projectile,
        {
          left: projectile.x - size,
          top: projectile.y - size,
          width: size * 2,
          height: size * 2,
          backgroundColor: config.projectileColor,
          shadowColor: config.projectileColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  projectile: {
    position: 'absolute',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
});
