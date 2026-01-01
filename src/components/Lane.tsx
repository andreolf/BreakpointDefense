/**
 * Lane Component
 * Renders the snake-like S-curve path - enemies walk ON this
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Circle,
  Rect,
  G,
  Polygon,
} from 'react-native-svg';
import { COLORS, getPathPoints, BIOME, GAME_CONFIG } from '../game/config';

interface LaneProps {
  width: number;
  height: number;
  timeMarkerProgress: number;
}

export const Lane: React.FC<LaneProps> = ({ width, height, timeMarkerProgress }) => {
  // Generate smooth path from waypoints
  const pathPoints = useMemo(() => getPathPoints(width, height), [width, height]);
  
  // Create SVG path string with bezier curves for smooth curves
  const pathData = useMemo(() => {
    if (pathPoints.length < 2) return '';
    
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      
      // Control points for smooth bezier
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2y = curr.y;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [pathPoints]);
  
  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const spacing = 45;
    
    for (let x = 0; x < width; x += spacing) {
      lines.push({ x1: x, y1: 0, x2: x, y2: height, key: `v${x}` });
    }
    for (let y = 0; y < height; y += spacing) {
      lines.push({ x1: 0, y1: y, x2: width, y2: y, key: `h${y}` });
    }
    
    return lines;
  }, [width, height]);
  
  // Particles
  const particles = useMemo(() => {
    const list = [];
    const count = 25;
    for (let i = 0; i < count; i++) {
      const seed = i * 5432.1;
      list.push({
        x: (Math.sin(seed) * 0.5 + 0.5) * width,
        y: (Math.cos(seed * 1.3) * 0.5 + 0.5) * height,
        size: 1 + (i % 2),
        opacity: 0.15 + (i % 4) * 0.08,
        key: `p${i}`,
      });
    }
    return list;
  }, [width, height]);

  const pathWidth = GAME_CONFIG.pathWidth;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Background gradient */}
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#040406" />
            <Stop offset="50%" stopColor="#08080E" />
            <Stop offset="100%" stopColor="#060608" />
          </LinearGradient>
          
          {/* Path glow */}
          <LinearGradient id="pathGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.35" />
            <Stop offset="50%" stopColor={COLORS.solanaPink} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.35" />
          </LinearGradient>
          
          {/* Path border */}
          <LinearGradient id="pathBorder" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} />
            <Stop offset="50%" stopColor={COLORS.solanaPink} />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} />
          </LinearGradient>
          
          {/* Path surface */}
          <LinearGradient id="pathFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#100E18" />
            <Stop offset="50%" stopColor="#0C0A12" />
            <Stop offset="100%" stopColor="#081210" />
          </LinearGradient>
          
          {/* Solana gradient */}
          <LinearGradient id="solanaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} />
            <Stop offset="50%" stopColor={COLORS.solanaPurple} />
            <Stop offset="100%" stopColor={COLORS.solanaPink} />
          </LinearGradient>
        </Defs>
        
        {/* Background */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#bgGradient)" />
        
        {/* Grid */}
        {gridLines.map(line => (
          <Path
            key={line.key}
            d={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
            stroke={COLORS.solanaPurple}
            strokeWidth={0.5}
            strokeOpacity={0.05}
          />
        ))}
        
        {/* Particles */}
        {particles.map(p => (
          <Circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={COLORS.solanaGreen}
            opacity={p.opacity}
          />
        ))}
        
        {/* Decorative Solana logos */}
        <G transform={`translate(${width * 0.03}, ${height * 0.04})`} opacity={0.1}>
          <Polygon points="0,10 5,0 32,0 27,10" fill="url(#solanaGrad)" />
          <Polygon points="0,17 5,10 32,10 27,17" fill="url(#solanaGrad)" />
          <Polygon points="0,24 5,17 32,17 27,24" fill="url(#solanaGrad)" />
        </G>
        
        <G transform={`translate(${width * 0.82}, ${height * 0.88})`} opacity={0.08}>
          <Polygon points="0,12 6,0 40,0 34,12" fill="url(#solanaGrad)" />
          <Polygon points="0,20 6,12 40,12 34,20" fill="url(#solanaGrad)" />
          <Polygon points="0,28 6,20 40,20 34,28" fill="url(#solanaGrad)" />
        </G>
        
        {/* === THE PATH === */}
        
        {/* Outer glow */}
        <Path
          d={pathData}
          stroke="url(#pathGlow)"
          strokeWidth={pathWidth + 25}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Border */}
        <Path
          d={pathData}
          stroke="url(#pathBorder)"
          strokeWidth={pathWidth + 5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Road surface */}
        <Path
          d={pathData}
          stroke="url(#pathFill)"
          strokeWidth={pathWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center dashed line */}
        <Path
          d={pathData}
          stroke={COLORS.solanaGreen}
          strokeWidth={1.5}
          strokeDasharray="8 12"
          strokeOpacity={0.45}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Watermark */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>{BIOME.name.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    opacity: 0.1,
  },
  watermarkText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default Lane;
