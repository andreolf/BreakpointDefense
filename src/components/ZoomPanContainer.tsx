/**
 * Zoom & Pan Container
 * - Scroll wheel to zoom
 * - Left-click drag to pan
 * - Can't zoom out past map boundaries
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { COLORS } from '../game/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ZoomPanContainerProps {
  children: React.ReactNode;
  width: number;
  height: number;
  onMapClick?: (x: number, y: number) => void;
}

// Minimum zoom is 1.0 - can't zoom out past the map filling the screen
const MIN_ZOOM = 1.0;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;
const DRAG_THRESHOLD = 5;

export const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({
  children,
  width,
  height,
  onMapClick,
}) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translateStart, setTranslateStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Clamp translation so map edges stay at screen edges when zoomed in
  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) {
      // No panning when not zoomed in
      return { x: 0, y: 0 };
    }

    // How much extra space we have when zoomed in
    const extraX = (width * s - width) / 2;
    const extraY = (height * s - height) / 2;

    return {
      x: Math.max(-extraX, Math.min(extraX, tx)),
      y: Math.max(-extraY, Math.min(extraY, ty)),
    };
  }, [width, height]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale + delta));

    if (newScale === scale) return;

    // Zoom toward mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const scaleChange = newScale / scale;
    const newTranslateX = mouseX - (mouseX - translate.x) * scaleChange;
    const newTranslateY = mouseY - (mouseY - translate.y) * scaleChange;

    setScale(newScale);
    setTranslate(clampTranslate(newTranslateX, newTranslateY, newScale));
  }, [scale, translate, width, height, clampTranslate]);

  // Start drag
  const handleMouseDown = useCallback((e: any) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setTranslateStart(translate);
  }, [translate]);

  // Drag move
  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      setHasMoved(true);
    }

    // Only allow panning when zoomed in
    if (scale > 1) {
      const newTranslate = clampTranslate(
        translateStart.x + dx,
        translateStart.y + dy,
        scale
      );
      setTranslate(newTranslate);
    }
  }, [isDragging, dragStart, translateStart, scale, clampTranslate]);

  // End drag
  const handleMouseUp = useCallback((e: any) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!hasMoved && onMapClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert to map coords
      const mapX = (clickX - width / 2 - translate.x) / scale + width / 2;
      const mapY = (clickY - height / 2 - translate.y) / scale + height / 2;

      onMapClick(mapX, mapY);
    }
  }, [isDragging, hasMoved, onMapClick, translate, scale, width, height]);

  // Zoom buttons
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_ZOOM, scale + ZOOM_STEP);
    setScale(newScale);
    setTranslate(clampTranslate(translate.x, translate.y, newScale));
  };

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_ZOOM, scale - ZOOM_STEP);
    setScale(newScale);
    setTranslate(clampTranslate(translate.x, translate.y, newScale));
  };

  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const webProps = Platform.OS === 'web' ? {
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: () => setIsDragging(false),
  } : {};

  const isZoomed = scale > 1;

  return (
    <View
      style={[styles.container, { width, height, cursor: isDragging ? 'grabbing' : (isZoomed ? 'grab' : 'crosshair') }]}
      {...webProps}
    >
      {/* Transformed content */}
      <View
        style={[
          styles.content,
          {
            width,
            height,
            transform: [
              { translateX: translate.x },
              { translateY: translate.y },
              { scale },
            ],
          },
        ]}
        pointerEvents="none"
      >
        {children}
      </View>

      {/* Zoom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.zoomBtn, scale >= MAX_ZOOM && styles.zoomBtnDisabled]}
          onPress={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
        >
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>

        <Text style={styles.zoomLevel}>{Math.round(scale * 100)}%</Text>

        <TouchableOpacity
          style={[styles.zoomBtn, scale <= MIN_ZOOM && styles.zoomBtnDisabled]}
          onPress={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
        >
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>

        {isZoomed && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          {isZoomed ? 'Drag to pan • Click to build' : 'Scroll to zoom in • Click to build'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controls: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
    shadowColor: COLORS.solanaPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  zoomBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.solanaPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  zoomBtnDisabled: {
    opacity: 0.3,
    backgroundColor: COLORS.bgCardLight,
  },
  zoomBtnText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  zoomLevel: {
    color: COLORS.solanaGreen,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 2,
    borderColor: COLORS.bgCardLight,
  },
  resetBtnText: {
    color: COLORS.text,
    fontSize: 24,
  },
  hint: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
