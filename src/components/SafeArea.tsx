import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

// Web-compatible SafeAreaView wrapper
// Uses react-native-safe-area-context on native, simple View on web

interface SafeAreaProps {
    children: ReactNode;
    style?: ViewStyle;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

let NativeSafeAreaView: React.ComponentType<SafeAreaProps> | null = null;

if (Platform.OS !== 'web') {
    try {
        NativeSafeAreaView = require('react-native-safe-area-context').SafeAreaView;
    } catch (e) {
        // Fallback to View
    }
}

export const SafeArea: React.FC<SafeAreaProps> = ({ children, style, edges }) => {
    if (Platform.OS === 'web' || !NativeSafeAreaView) {
        // On web, add some padding to simulate safe areas
        return (
            <View style={[styles.webContainer, style]}>
                {children}
            </View>
        );
    }

    return (
        <NativeSafeAreaView style={style} edges={edges}>
            {children}
        </NativeSafeAreaView>
    );
};

const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'web' ? 20 : 0,
    },
});

