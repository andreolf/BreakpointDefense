/**
 * ZoomableView Component
 * Pinch-to-zoom and pan for the game map
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { COLORS } from '../game/config';

interface ZoomableViewProps {
  children: React.ReactNode;
  width: number;
  height: number;
  onTap: (x: number, y: number) => void;
}

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.3;

export const ZoomableView: React.FC<ZoomableViewProps> = ({
  children,
  width,
  height,
  onTap,
}) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  const lastScale = useRef(1);
  const lastDistance = useRef(0);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const isPinching = useRef(false);
  const tapTimeout = useRef<any>(null);
  
  // Calculate distance between two touch points
  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Calculate center point between two touches
  const getCenter = (touches: any[]) => {
    if (touches.length < 2) return { x: touches[0].pageX, y: touches[0].pageY };
    return {
      x: (touches[0].pageX + touches[1].pageX) / 2,
      y: (touches[0].pageY + touches[1].pageY) / 2,
    };
  };
  
  // Clamp translation to keep content in bounds
  const clampTranslation = (tx: number, ty: number, s: number) => {
    const maxTx = Math.max(0, (width * s - width) / 2);
    const maxTy = Math.max(0, (height * s - height) / 2);
    return {
      x: Math.max(-maxTx, Math.min(maxTx, tx)),
      y: Math.max(-maxTy, Math.min(maxTy, ty)),
    };
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Allow move if dragging or pinching
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          lastDistance.current = getDistance(touches);
        }
        lastTranslateX.current = translateX;
        lastTranslateY.current = translateY;
        lastScale.current = scale;
        
        // Clear any pending tap
        if (tapTimeout.current) {
          clearTimeout(tapTimeout.current);
          tapTimeout.current = null;
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 2) {
          // Pinch zoom
          isPinching.current = true;
          const distance = getDistance(touches);
          
          if (lastDistance.current > 0) {
            const newScale = Math.max(
              MIN_ZOOM,
              Math.min(MAX_ZOOM, lastScale.current * (distance / lastDistance.current))
            );
            setScale(newScale);
          }
        } else if (touches.length === 1 && scale > 1 && !isPinching.current) {
          // Pan when zoomed in
          const newTx = lastTranslateX.current + gestureState.dx;
          const newTy = lastTranslateY.current + gestureState.dy;
          const clamped = clampTranslation(newTx, newTy, scale);
          setTranslateX(clamped.x);
          setTranslateY(clamped.y);
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        const touches = evt.nativeEvent.changedTouches;
        
        // Detect tap (minimal movement)
        if (
          !isPinching.current &&
          Math.abs(gestureState.dx) < 10 &&
          Math.abs(gestureState.dy) < 10 &&
          touches.length === 1
        ) {
          const touch = touches[0];
          // Convert screen coordinates to game coordinates
          const gameX = (touch.locationX - translateX) / scale;
          const gameY = (touch.locationY - translateY) / scale;
          
          // Use timeout to avoid conflict with double-tap
          tapTimeout.current = setTimeout(() => {
            onTap(gameX, gameY);
          }, 50);
        }
        
        isPinching.current = false;
        lastScale.current = scale;
        lastTranslateX.current = translateX;
        lastTranslateY.current = translateY;
      },
    })
  ).current;
  
  // Zoom buttons
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_ZOOM, scale + ZOOM_STEP);
    setScale(newScale);
    lastScale.current = newScale;
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(MIN_ZOOM, scale - ZOOM_STEP);
    setScale(newScale);
    lastScale.current = newScale;
    
    // Reset pan when zooming out
    if (newScale <= 1) {
      setTranslateX(0);
      setTranslateY(0);
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    }
  };
  
  const handleResetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={[styles.zoomContainer, { width, height }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.content,
            {
              width,
              height,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
        >
          {children}
        </View>
      </View>
      
      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
        
        {scale !== 1 && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetZoom}>
            <Text style={styles.resetButtonText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Zoom level indicator */}
      {scale !== 1 && (
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomIndicatorText}>{Math.round(scale * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  zoomContainer: {
    overflow: 'hidden',
  },
  content: {
    transformOrigin: 'center',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'column',
    gap: 6,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.solanaPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoomIndicatorText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ZoomableView;

