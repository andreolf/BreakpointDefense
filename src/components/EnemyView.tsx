import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, G } from 'react-native-svg';
import { Enemy } from '../game/types';
import { COLORS } from '../game/config';

interface EnemyViewProps {
    enemy: Enemy;
}

const ENEMY_SIZE = 24;

/**
 * Renders an enemy with health bar
 */
export const EnemyView: React.FC<EnemyViewProps> = React.memo(({ enemy }) => {
    const { position, type, hp, maxHp } = enemy;
    const hpPercent = hp / maxHp;

    const color = getEnemyColor(type);
    const size = getEnemySize(type);

    return (
        <View
            style={[
                styles.container,
                {
                    left: position.x - size / 2,
                    top: position.y - size / 2,
                    width: size,
                    height: size + 8, // extra for HP bar
                },
            ]}
        >
            <Svg width={size} height={size}>
                {type === 'swarm' && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={size / 2 - 2}
                        fill={color}
                    />
                )}

                {type === 'tank' && (
                    <G>
                        <Rect
                            x={2}
                            y={2}
                            width={size - 4}
                            height={size - 4}
                            rx={3}
                            fill={color}
                        />
                        <Rect
                            x={size / 4}
                            y={size / 4}
                            width={size / 2}
                            height={size / 2}
                            fill="#000"
                            opacity={0.3}
                        />
                    </G>
                )}

                {type === 'miniboss' && (
                    <G>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 2 - 2}
                            fill={color}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 3}
                            fill="#000"
                            opacity={0.3}
                        />
                        {/* Crown-like spikes */}
                        <Circle cx={size / 2} cy={4} r={3} fill={COLORS.gold} />
                        <Circle cx={size / 4} cy={6} r={2} fill={COLORS.gold} />
                        <Circle cx={(size * 3) / 4} cy={6} r={2} fill={COLORS.gold} />
                    </G>
                )}
            </Svg>

            {/* HP Bar */}
            <View style={styles.hpBarContainer}>
                <View style={styles.hpBarBg}>
                    <View
                        style={[
                            styles.hpBarFill,
                            {
                                width: `${hpPercent * 100}%`,
                                backgroundColor: hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FFC107' : '#F44336',
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
});

function getEnemyColor(type: Enemy['type']): string {
    switch (type) {
        case 'swarm':
            return COLORS.enemySwarm;
        case 'tank':
            return COLORS.enemyTank;
        case 'miniboss':
            return COLORS.enemyMiniboss;
    }
}

function getEnemySize(type: Enemy['type']): number {
    switch (type) {
        case 'swarm':
            return 18;
        case 'tank':
            return 26;
        case 'miniboss':
            return 32;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
    },
    hpBarContainer: {
        position: 'absolute',
        bottom: -6,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hpBarBg: {
        width: '80%',
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        overflow: 'hidden',
    },
    hpBarFill: {
        height: '100%',
        borderRadius: 2,
    },
});

