/**
 * Lane Component
 * Renders the S-curve path with Solana theming
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Rect } from 'react-native-svg';
import { PATH_WAYPOINTS, COLORS, GAME_CONFIG } from '../game/config';

interface LaneProps {
  width: number;
  height: number;
  freezeActive?: boolean;
}

export const Lane: React.FC<LaneProps> = ({ width, height, freezeActive = false }) => {
  const pathData = useMemo(() => {
    const points = PATH_WAYPOINTS.map(p => ({ x: p.x * width, y: p.y * height }));
    
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.5;
      const cp2x = curr.x - (next.x - prev.x) * 0.2;
      const cp2y = curr.y - (next.y - prev.y) * 0.2;
      
      d += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
    }
    
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    
    return d;
  }, [width, height]);

  // Decorative elements
  const decorations = useMemo(() => {
    const items = [];
    const gridSize = 80;
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        if (Math.random() > 0.7) {
          items.push({
            x: x + Math.random() * 40,
            y: y + Math.random() * 40,
            size: 2 + Math.random() * 3,
            opacity: 0.1 + Math.random() * 0.2,
          });
        }
      }
    }
    return items;
  }, [width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Path gradient */}
          <LinearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={COLORS.solanaPink} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.8" />
          </LinearGradient>
          
          {/* Freeze overlay gradient */}
          <LinearGradient id="freezeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaBlue} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={COLORS.solanaBlue} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background grid dots */}
        <G opacity={0.3}>
          {decorations.map((dec, i) => (
            <Circle
              key={i}
              cx={dec.x}
              cy={dec.y}
              r={dec.size}
              fill={COLORS.solanaPurple}
              opacity={dec.opacity}
            />
          ))}
        </G>

        {/* Main path - outer glow */}
        <Path
          d={pathData}
          stroke={freezeActive ? COLORS.solanaBlue : COLORS.solanaPurple}
          strokeWidth={GAME_CONFIG.pathWidth + 12}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.15}
        />

        {/* Main path - body */}
        <Path
          d={pathData}
          stroke="url(#pathGrad)"
          strokeWidth={GAME_CONFIG.pathWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Path center line */}
        <Path
          d={pathData}
          stroke={COLORS.bgDark}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 12"
          opacity={0.5}
        />

        {/* Freeze overlay */}
        {freezeActive && (
          <Path
            d={pathData}
            stroke="url(#freezeGrad)"
            strokeWidth={GAME_CONFIG.pathWidth + 6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.bgDark,
  },
});
