/**
 * Health Overlay
 * Shows Network Health in top-left corner of game map
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../game/config';

interface HealthOverlayProps {
    hp: number;
    maxHp: number;
}

export const HealthOverlay: React.FC<HealthOverlayProps> = ({ hp, maxHp }) => {
    const hpPercent = (hp / maxHp) * 100;
    const hpColor = hpPercent > 60 ? COLORS.hpGood : hpPercent > 30 ? COLORS.hpMedium : COLORS.hpLow;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.icon}>🌐</Text>
                <View style={styles.content}>
                    <Text style={styles.label}>NETWORK HEALTH</Text>
                    <View style={styles.barRow}>
                        <View style={styles.barBg}>
                            <View style={[styles.barFill, { width: `${hpPercent}%`, backgroundColor: hpColor }]} />
                        </View>
                        <Text style={[styles.value, { color: hpColor }]}>{hp}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: [{ translateX: -140 }],
        zIndex: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: 14,
        padding: 14,
        paddingRight: 20,
        borderWidth: 2,
        borderColor: COLORS.solanaPurple,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    icon: {
        fontSize: 32,
        marginRight: 14,
    },
    content: {
        minWidth: 180,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 6,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    barBg: {
        flex: 1,
        height: 12,
        backgroundColor: COLORS.bgCardLight,
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 12,
    },
    barFill: {
        height: '100%',
        borderRadius: 6,
    },
    value: {
        fontSize: 22,
        fontWeight: '800',
        minWidth: 45,
        textAlign: 'right',
    },
});

