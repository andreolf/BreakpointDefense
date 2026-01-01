import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../game/config';
import { formatTime } from '../utils/formatTime';

interface HUDProps {
    time: number;
    coins: number;
    baseHp: number;
    maxBaseHp: number;
    wave: number;
    paused: boolean;
    onPause: () => void;
}

/**
 * Heads-up display showing game stats
 */
export const HUD: React.FC<HUDProps> = ({
    time,
    coins,
    baseHp,
    maxBaseHp,
    wave,
    paused,
    onPause,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>TIME</Text>
                    <Text style={styles.value}>{formatTime(time)}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.label}>WAVE</Text>
                    <Text style={styles.value}>{wave}</Text>
                </View>
            </View>

            <View style={styles.centerSection}>
                <View style={styles.hpContainer}>
                    <Text style={styles.hpLabel}>BASE HP</Text>
                    <View style={styles.hpBar}>
                        <View
                            style={[
                                styles.hpFill,
                                {
                                    width: `${(baseHp / maxBaseHp) * 100}%`,
                                    backgroundColor:
                                        baseHp > maxBaseHp * 0.5
                                            ? COLORS.primary
                                            : baseHp > maxBaseHp * 0.25
                                                ? COLORS.gold
                                                : COLORS.danger,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.hpText}>{baseHp}/{maxBaseHp}</Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>COINS</Text>
                    <Text style={[styles.value, styles.coins]}>{coins} 🪙</Text>
                </View>
                <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
                    <Text style={styles.pauseIcon}>{paused ? '▶' : '⏸'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    leftSection: {
        flexDirection: 'row',
        gap: 12,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 12,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statBox: {
        alignItems: 'center',
    },
    label: {
        color: COLORS.textDim,
        fontSize: 10,
        fontWeight: '600',
    },
    value: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    coins: {
        color: COLORS.gold,
    },
    hpContainer: {
        alignItems: 'center',
        width: '100%',
    },
    hpLabel: {
        color: COLORS.textDim,
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
    },
    hpBar: {
        width: '100%',
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
        overflow: 'hidden',
    },
    hpFill: {
        height: '100%',
        borderRadius: 6,
    },
    hpText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    pauseBtn: {
        width: 36,
        height: 36,
        backgroundColor: '#333',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseIcon: {
        color: COLORS.text,
        fontSize: 14,
    },
});

