/**
 * Tower Popup
 * Appears when clicking near the path, lets you choose which tower to place
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { TOWER_CONFIGS, COLORS, TowerType } from '../game/config';

interface TowerPopupProps {
  visible: boolean;
  position: { x: number; y: number };
  sol: number;
  onSelect: (type: TowerType) => void;
  onClose: () => void;
}

export const TowerPopup: React.FC<TowerPopupProps> = ({
  visible,
  position,
  sol,
  onSelect,
  onClose,
}) => {
  if (!visible) return null;

  const towers: TowerType[] = ['validator', 'jupiter', 'tensor'];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View
          style={[
            styles.popup,
            {
              left: Math.min(position.x, 400),
              top: Math.min(position.y, 500),
            },
          ]}
        >
          <Text style={styles.title}>Build Tower</Text>
          
          {towers.map((type) => {
            const config = TOWER_CONFIGS[type];
            const canAfford = sol >= config.cost;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.towerOption, !canAfford && styles.disabled]}
                onPress={() => canAfford && onSelect(type)}
                disabled={!canAfford}
              >
                <View style={[styles.icon, { backgroundColor: config.color }]}>
                  <Text style={styles.iconText}>{config.icon}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{config.name}</Text>
                  <Text style={styles.desc}>{config.description}</Text>
                </View>
                <Text style={[styles.cost, !canAfford && styles.costRed]}>
                  ◎{config.cost}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    position: 'absolute',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    minWidth: 260,
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  towerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  cost: {
    color: COLORS.solanaGreen,
    fontSize: 16,
    fontWeight: '700',
  },
  costRed: {
    color: COLORS.hpLow,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});

