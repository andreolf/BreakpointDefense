import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Projectile } from '../game/types';
import { COLORS } from '../game/config';

interface ProjectileViewProps {
    projectile: Projectile;
}

const PROJECTILE_SIZE = 8;

/**
 * Renders a projectile
 */
export const ProjectileView: React.FC<ProjectileViewProps> = React.memo(
    ({ projectile }) => {
        const { position, towerType } = projectile;

        const color = getProjectileColor(towerType);

        return (
            <View
                style={[
                    styles.container,
                    {
                        left: position.x - PROJECTILE_SIZE / 2,
                        top: position.y - PROJECTILE_SIZE / 2,
                    },
                ]}
            >
                <Svg width={PROJECTILE_SIZE} height={PROJECTILE_SIZE}>
                    {towerType === 'fast' && (
                        <Circle
                            cx={PROJECTILE_SIZE / 2}
                            cy={PROJECTILE_SIZE / 2}
                            r={PROJECTILE_SIZE / 2 - 1}
                            fill={color}
                        />
                    )}

                    {towerType === 'chain' && (
                        <>
                            <Circle
                                cx={PROJECTILE_SIZE / 2}
                                cy={PROJECTILE_SIZE / 2}
                                r={PROJECTILE_SIZE / 2 - 1}
                                fill={color}
                            />
                            <Line
                                x1={0}
                                y1={PROJECTILE_SIZE / 2}
                                x2={PROJECTILE_SIZE}
                                y2={PROJECTILE_SIZE / 2}
                                stroke={color}
                                strokeWidth={2}
                            />
                        </>
                    )}

                    {towerType === 'splash' && (
                        <Circle
                            cx={PROJECTILE_SIZE / 2}
                            cy={PROJECTILE_SIZE / 2}
                            r={PROJECTILE_SIZE / 2}
                            fill={color}
                            opacity={0.8}
                        />
                    )}
                </Svg>
            </View>
        );
    }
);

function getProjectileColor(type: Projectile['towerType']): string {
    switch (type) {
        case 'fast':
            return COLORS.towerFast;
        case 'chain':
            return COLORS.towerChain;
        case 'splash':
            return COLORS.towerSplash;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: PROJECTILE_SIZE,
        height: PROJECTILE_SIZE,
    },
});

