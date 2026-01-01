/**
* Speed Control
* Toggle game speed between 1x, 2x, 3x
*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../game/config';

interface SpeedControlProps {
    speed: number;
    onChangeSpeed: (speed: number) => void;
}

export const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onChangeSpeed }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.speedBtn, speed === 1 && styles.speedBtnActive]}
                onPress={() => onChangeSpeed(1)}
            >
                <Text style={[styles.speedText, speed === 1 && styles.speedTextActive]}>1x</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.speedBtn, speed === 2 && styles.speedBtnActive]}
                onPress={() => onChangeSpeed(2)}
            >
                <Text style={[styles.speedText, speed === 2 && styles.speedTextActive]}>2x</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.speedBtn, speed === 3 && styles.speedBtnActive]}
                onPress={() => onChangeSpeed(3)}
            >
                <Text style={[styles.speedText, speed === 3 && styles.speedTextActive]}>3x</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: 12,
        padding: 6,
        borderWidth: 2,
        borderColor: COLORS.solanaPurple,
        zIndex: 100,
    },
    speedBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 3,
    },
    speedBtnActive: {
        backgroundColor: COLORS.solanaPurple,
    },
    speedText: {
        color: COLORS.textMuted,
        fontSize: 16,
        fontWeight: '700',
    },
    speedTextActive: {
        color: COLORS.text,
    },
});

