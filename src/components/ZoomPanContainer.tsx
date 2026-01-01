/**
 * Zoom & Pan Container
 * - Scroll wheel to zoom
 * - Left-click drag to pan (hold and drag)
 * - Single click to place tower
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

const MIN_ZOOM = 0.4;  // Can zoom out more to see full map
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;
const DRAG_THRESHOLD = 5; // Pixels moved before it's considered a drag

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
  const containerRef = useRef<View>(null);

  // Clamp translation
  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    const maxX = Math.max(0, (width * s - width) / 2 + 100);
    const maxY = Math.max(0, (height * s - height) / 2 + 100);
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  }, [width, height]);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale + delta));
    
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
    if (e.button !== 0) return; // Left click only
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
    
    // Check if we've moved enough to be considered a drag
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      setHasMoved(true);
    }
    
    const newTranslate = clampTranslate(
      translateStart.x + dx,
      translateStart.y + dy,
      scale
    );
    setTranslate(newTranslate);
  }, [isDragging, dragStart, translateStart, scale, clampTranslate]);

  // End drag - if didn't move much, treat as click
  const handleMouseUp = useCallback((e: any) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If we didn't drag, treat as click
    if (!hasMoved && onMapClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convert screen coords to map coords
      const mapX = (clickX - width / 2 - translate.x) / scale + width / 2;
      const mapY = (clickY - height / 2 - translate.y) / scale + height / 2;
      
      onMapClick(mapX, mapY);
    }
  }, [isDragging, hasMoved, onMapClick, translate, scale, width, height]);

  // Zoom buttons
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_ZOOM, scale + ZOOM_STEP * 2);
    setScale(newScale);
    setTranslate(clampTranslate(translate.x, translate.y, newScale));
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(MIN_ZOOM, scale - ZOOM_STEP * 2);
    setScale(newScale);
    setTranslate(clampTranslate(translate.x, translate.y, newScale));
  };
  
  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Web event handlers
  const webProps = Platform.OS === 'web' ? {
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: () => setIsDragging(false),
  } : {};

  return (
    <View 
      ref={containerRef}
      style={[styles.container, { width, height, cursor: isDragging ? 'grabbing' : 'grab' }]}
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
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.zoomLevel}>{Math.round(scale * 100)}%</Text>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
        {(scale !== 1 || translate.x !== 0 || translate.y !== 0) && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>Scroll to zoom • Drag to pan • Click to build</Text>
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
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.solanaPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  zoomBtnText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  zoomLevel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resetBtnText: {
    color: COLORS.text,
    fontSize: 20,
  },
  hint: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
