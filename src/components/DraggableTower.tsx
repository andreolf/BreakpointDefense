/**
 * Draggable Tower Component
 * Drag from sidebar to place on map
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TOWER_CONFIGS, COLORS, TowerType, SIDEBAR_WIDTH, LEFT_PANEL_WIDTH } from '../game/config';

interface DraggableTowerProps {
  type: TowerType;
  canAfford: boolean;
  onDrop: (type: TowerType, x: number, y: number) => void;
}

export const DraggableTower: React.FC<DraggableTowerProps> = ({
  type,
  canAfford,
  onDrop,
}) => {
  const config = TOWER_CONFIGS[type];
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(canAfford)
    .onStart((event) => {
      isDragging.value = true;
      scale.value = withSpring(1.2);
      startX.value = event.absoluteX;
      startY.value = event.absoluteY;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      isDragging.value = false;
      scale.value = withSpring(1);
      
      // Calculate final position - offset for sidebar and left panel
      const dropX = startX.value + event.translationX - LEFT_PANEL_WIDTH;
      const dropY = startY.value + event.translationY;
      
      // Only register drop if it's in the game area (left of sidebar)
      if (dropX > 0) {
        runOnJS(onDrop)(type, dropX, dropY);
      }
      
      // Reset position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: isDragging.value ? 0.8 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          !canAfford && styles.disabled,
          animatedStyle,
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{config.name}</Text>
          <Text style={styles.cost}>◎ {config.cost}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  disabled: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  cost: {
    color: COLORS.solanaGreen,
    fontSize: 11,
    fontWeight: '500',
  },
});

