/**
 * Lane Component
 * Renders the S-curve path clearly - enemies walk ON this, towers are BESIDE it
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
  Text as SvgText,
} from 'react-native-svg';
import { COLORS, PATH_WAYPOINTS, getPathPoints, BIOME, GAME_CONFIG } from '../game/config';

interface LaneProps {
  width: number;
  height: number;
  timeMarkerProgress: number;
}

export const Lane: React.FC<LaneProps> = ({ width, height, timeMarkerProgress }) => {
  // Generate smooth path from waypoints
  const pathPoints = useMemo(() => getPathPoints(width, height), [width, height]);
  
  // Create SVG path string with bezier curves for smooth S-curve
  const pathData = useMemo(() => {
    if (pathPoints.length < 2) return '';
    
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      
      // Calculate control points for smooth bezier curve
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2y = curr.y;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [pathPoints]);
  
  // Calculate time marker position along the path
  const timeMarkerPos = useMemo(() => {
    const totalLength = pathPoints.length - 1;
    const index = timeMarkerProgress * totalLength;
    const i = Math.floor(index);
    const t = index - i;
    
    if (i >= pathPoints.length - 1) {
      return pathPoints[pathPoints.length - 1];
    }
    
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };
  }, [pathPoints, timeMarkerProgress]);
  
  // Generate background grid pattern
  const gridLines = useMemo(() => {
    const lines = [];
    const spacing = 50;
    
    for (let x = 0; x < width; x += spacing) {
      lines.push({ x1: x, y1: 0, x2: x, y2: height, key: `v${x}` });
    }
    for (let y = 0; y < height; y += spacing) {
      lines.push({ x1: 0, y1: y, x2: width, y2: y, key: `h${y}` });
    }
    
    return lines;
  }, [width, height]);
  
  // Decorative dots/particles
  const particles = useMemo(() => {
    const list = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      const seed = i * 7654.321;
      list.push({
        x: (Math.sin(seed) * 0.5 + 0.5) * width,
        y: (Math.cos(seed * 1.5) * 0.5 + 0.5) * height,
        size: 1 + (i % 3),
        opacity: 0.2 + (i % 5) * 0.1,
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
            <Stop offset="0%" stopColor="#050508" />
            <Stop offset="50%" stopColor="#0A0A12" />
            <Stop offset="100%" stopColor="#080810" />
          </LinearGradient>
          
          {/* Path outer glow */}
          <LinearGradient id="pathGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.4" />
            <Stop offset="50%" stopColor={COLORS.solanaPink} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.4" />
          </LinearGradient>
          
          {/* Path border gradient */}
          <LinearGradient id="pathBorder" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} />
            <Stop offset="50%" stopColor={COLORS.solanaPink} />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} />
          </LinearGradient>
          
          {/* Path fill (dark road) */}
          <LinearGradient id="pathFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#12101A" />
            <Stop offset="50%" stopColor="#0E0C14" />
            <Stop offset="100%" stopColor="#0A1410" />
          </LinearGradient>
          
          {/* Time marker glow */}
          <RadialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.solanaPink} stopOpacity="0.9" />
            <Stop offset="50%" stopColor={COLORS.solanaPurple} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={COLORS.solanaPurple} stopOpacity="0" />
          </RadialGradient>
          
          {/* Solana gradient for decorations */}
          <LinearGradient id="solanaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} />
            <Stop offset="50%" stopColor={COLORS.solanaPurple} />
            <Stop offset="100%" stopColor={COLORS.solanaPink} />
          </LinearGradient>
        </Defs>
        
        {/* Background */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#bgGradient)" />
        
        {/* Grid pattern */}
        {gridLines.map(line => (
          <Path
            key={line.key}
            d={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
            stroke={COLORS.solanaPurple}
            strokeWidth={0.5}
            strokeOpacity={0.06}
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
        
        {/* Decorative Solana logos in corners */}
        <G transform={`translate(${width * 0.05}, ${height * 0.05})`} opacity={0.12}>
          <Polygon points="0,12 6,0 40,0 34,12" fill="url(#solanaGrad)" />
          <Polygon points="0,20 6,12 40,12 34,20" fill="url(#solanaGrad)" />
          <Polygon points="0,28 6,20 40,20 34,28" fill="url(#solanaGrad)" />
        </G>
        
        <G transform={`translate(${width * 0.85}, ${height * 0.85})`} opacity={0.1}>
          <Polygon points="0,15 8,0 50,0 42,15" fill="url(#solanaGrad)" />
          <Polygon points="0,25 8,15 50,15 42,25" fill="url(#solanaGrad)" />
          <Polygon points="0,35 8,25 50,25 42,35" fill="url(#solanaGrad)" />
        </G>
        
        {/* === THE PATH (where enemies walk) === */}
        
        {/* Path outer glow */}
        <Path
          d={pathData}
          stroke="url(#pathGlow)"
          strokeWidth={pathWidth + 30}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Path border (colored edge) */}
        <Path
          d={pathData}
          stroke="url(#pathBorder)"
          strokeWidth={pathWidth + 6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Path fill (dark road surface) */}
        <Path
          d={pathData}
          stroke="url(#pathFill)"
          strokeWidth={pathWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center dashed line (road marking) */}
        <Path
          d={pathData}
          stroke={COLORS.solanaGreen}
          strokeWidth={2}
          strokeDasharray="10 15"
          strokeOpacity={0.5}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* === TIME MARKER === */}
        
        {/* Marker vertical sweep line */}
        <Path
          d={`M ${timeMarkerPos.x} 0 L ${timeMarkerPos.x} ${height}`}
          stroke={COLORS.solanaPink}
          strokeWidth={1}
          strokeOpacity={0.3}
          strokeDasharray="4 4"
        />
        
        {/* Marker glow */}
        <Circle
          cx={timeMarkerPos.x}
          cy={timeMarkerPos.y}
          r={50}
          fill="url(#markerGlow)"
        />
        
        {/* Marker crosshair lines */}
        <Path
          d={`M ${timeMarkerPos.x - 25} ${timeMarkerPos.y} L ${timeMarkerPos.x + 25} ${timeMarkerPos.y}`}
          stroke={COLORS.solanaPink}
          strokeWidth={2}
          strokeLinecap="round"
          strokeOpacity={0.8}
        />
        <Path
          d={`M ${timeMarkerPos.x} ${timeMarkerPos.y - 25} L ${timeMarkerPos.x} ${timeMarkerPos.y + 25}`}
          stroke={COLORS.solanaPink}
          strokeWidth={2}
          strokeLinecap="round"
          strokeOpacity={0.8}
        />
        
        {/* Marker center dot */}
        <Circle
          cx={timeMarkerPos.x}
          cy={timeMarkerPos.y}
          r={6}
          fill={COLORS.solanaPink}
          stroke={COLORS.text}
          strokeWidth={2}
        />
        
        {/* "LOCKED" indicator */}
        {timeMarkerProgress > 0.1 && (
          <G>
            <Rect
              x={timeMarkerPos.x - 45}
              y={timeMarkerPos.y - 55}
              width={40}
              height={16}
              rx={4}
              fill="rgba(0,0,0,0.6)"
            />
            <SvgText
              x={timeMarkerPos.x - 25}
              y={timeMarkerPos.y - 43}
              fill={COLORS.solanaPink}
              fontSize={9}
              fontWeight="bold"
              textAnchor="middle"
            >
              LOCKED
            </SvgText>
          </G>
        )}
      </Svg>
      
      {/* Conference watermark */}
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
    bottom: 8,
    left: 12,
    opacity: 0.12,
  },
  watermarkText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});

export default Lane;
