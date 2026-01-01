/**
 * Pause Modal
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../game/config';

interface PauseModalProps {
  onResume: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onQuit }) => {
  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>PAUSED</Text>
          <Text style={styles.subtitle}>Solana Breakpoint Defense</Text>

          <TouchableOpacity style={styles.button} onPress={onResume}>
            <Text style={styles.buttonText}>▶️ Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.quitButton]} onPress={onQuit}>
            <Text style={styles.buttonText}>🚪 Quit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
    minWidth: 280,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  quitButton: {
    backgroundColor: COLORS.bgCardLight,
  },
  buttonText: {
    color: COLORS.bgDark,
    fontSize: 16,
    fontWeight: '700',
  },
});

