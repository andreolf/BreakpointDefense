/**
 * Pause Button - Bottom right corner
 * Shows keyboard hint
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../game/config';

interface PauseButtonProps {
  onPause: () => void;
}

export const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPause} activeOpacity={0.7}>
        <Text style={styles.icon}>⏸</Text>
        <Text style={styles.label}>PAUSE</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>[SPACE]</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 100,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
});

