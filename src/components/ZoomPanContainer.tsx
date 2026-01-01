/**
 * Zoom & Pan Container
 * - Scroll wheel to zoom
 * - Click & drag to pan
 * - Zoom buttons
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../game/config';

interface ZoomPanContainerProps {
  children: React.ReactNode;
  width: number;
  height: number;
  onMapClick?: (x: number, y: number) => void;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;

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
  const containerRef = useRef<View>(null);

  // Clamp translation to keep content in view
  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    const maxX = Math.max(0, (width * s - width) / 2);
    const maxY = Math.max(0, (height * s - height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }, [width, height]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  // Start drag
  const handleMouseDown = useCallback((e: any) => {
    // Only pan with middle mouse or if holding space (not implemented here, use middle button)
    // For now, right-click or middle-click to pan, left-click to place
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setTranslateStart(translate);
    }
  }, [translate]);

  // Drag move
  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const newTranslate = clampTranslate(
      translateStart.x + dx,
      translateStart.y + dy,
      scale
    );
    setTranslate(newTranslate);
  }, [isDragging, dragStart, translateStart, scale, clampTranslate]);

  // End drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click to place tower (left click only, and only if not dragging)
  const handleClick = useCallback((e: any) => {
    if (e.button !== 0) return; // Left click only
    if (!onMapClick) return;
    
    // Get click position relative to the scaled/translated content
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to map coordinates
    const mapX = (clickX - translate.x - width / 2 * (scale - 1)) / scale;
    const mapY = (clickY - translate.y - height / 2 * (scale - 1)) / scale;
    
    onMapClick(mapX, mapY);
  }, [onMapClick, translate, scale, width, height]);

  // Zoom buttons
  const handleZoomIn = () => setScale((s) => Math.min(MAX_ZOOM, s + ZOOM_STEP));
  const handleZoomOut = () => setScale((s) => Math.max(MIN_ZOOM, s - ZOOM_STEP));
  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Web-specific event handlers
  const webProps = Platform.OS === 'web' ? {
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onClick: handleClick,
    onContextMenu: (e: any) => e.preventDefault(),
  } : {};

  return (
    <View 
      ref={containerRef}
      style={[styles.container, { width, height }]}
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
        pointerEvents="box-none"
      >
        {children}
      </View>

      {/* Zoom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.zoomLevel}>{Math.round(scale * 100)}%</Text>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
        {scale !== 1 && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pan hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>Scroll to zoom • Right-click drag to pan</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    cursor: 'crosshair',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controls: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 6,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.solanaPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  zoomBtnText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  zoomLevel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'center',
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resetBtnText: {
    color: COLORS.text,
    fontSize: 18,
  },
  hint: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
});

