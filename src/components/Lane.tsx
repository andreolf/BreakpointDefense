/**
 * Lane Component
 * Renders the S-curve path with Solana-themed background
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
  
  // Create SVG path string with bezier curves
  const pathData = useMemo(() => {
    if (pathPoints.length < 2) return '';
    
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      const next = pathPoints[i + 1];
      
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
    const spacing = 40;
    
    // Vertical lines
    for (let x = 0; x < width; x += spacing) {
      lines.push({ x1: x, y1: 0, x2: x, y2: height, key: `v${x}` });
    }
    // Horizontal lines
    for (let y = 0; y < height; y += spacing) {
      lines.push({ x1: 0, y1: y, x2: width, y2: y, key: `h${y}` });
    }
    
    return lines;
  }, [width, height]);
  
  // Generate random "stars" (small dots for space effect)
  const stars = useMemo(() => {
    const starList = [];
    const count = 50;
    // Use deterministic positions based on width/height
    for (let i = 0; i < count; i++) {
      const seed = i * 12345.6789;
      starList.push({
        x: (Math.sin(seed) * 0.5 + 0.5) * width,
        y: (Math.cos(seed * 2) * 0.5 + 0.5) * height,
        size: 1 + (i % 3),
        opacity: 0.3 + (i % 4) * 0.15,
        key: `star${i}`,
      });
    }
    return starList;
  }, [width, height]);
  
  // Solana logo positions for decoration
  const solanaLogos = useMemo(() => {
    return [
      { x: width * 0.08, y: height * 0.08, size: 35, opacity: 0.15 },
      { x: width * 0.92, y: height * 0.12, size: 28, opacity: 0.12 },
      { x: width * 0.15, y: height * 0.88, size: 32, opacity: 0.1 },
      { x: width * 0.85, y: height * 0.92, size: 40, opacity: 0.15 },
      { x: width * 0.5, y: height * 0.05, size: 25, opacity: 0.08 },
    ];
  }, [width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Background gradient */}
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.bgDarker} />
            <Stop offset="50%" stopColor={COLORS.bgDark} />
            <Stop offset="100%" stopColor="#0A0A1A" />
          </LinearGradient>
          
          {/* Path gradient (purple to green) */}
          <LinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} />
            <Stop offset="50%" stopColor={COLORS.solanaPink} />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} />
          </LinearGradient>
          
          {/* Path inner gradient */}
          <LinearGradient id="pathInner" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1A0A2E" />
            <Stop offset="100%" stopColor="#0A1A1A" />
          </LinearGradient>
          
          {/* Time marker glow */}
          <RadialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.solanaPink} stopOpacity="0.8" />
            <Stop offset="70%" stopColor={COLORS.solanaPurple} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={COLORS.solanaPurple} stopOpacity="0" />
          </RadialGradient>
          
          {/* Solana gradient for logos */}
          <LinearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaGreen} />
            <Stop offset="50%" stopColor={COLORS.solanaPurple} />
            <Stop offset="100%" stopColor={COLORS.solanaPink} />
          </LinearGradient>
          
          {/* Grid glow effect */}
          <LinearGradient id="gridGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.1" />
            <Stop offset="50%" stopColor={COLORS.solanaPurple} stopOpacity="0.02" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.1" />
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
            strokeOpacity={0.08}
          />
        ))}
        
        {/* Stars/particles */}
        {stars.map(star => (
          <Circle
            key={star.key}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={COLORS.solanaGreen}
            opacity={star.opacity}
          />
        ))}
        
        {/* Decorative Solana logos */}
        {solanaLogos.map((logo, i) => (
          <G key={`logo${i}`} transform={`translate(${logo.x - logo.size/2}, ${logo.y - logo.size/2})`}>
            {/* Simplified Solana logo (3 parallelograms) */}
            <Polygon
              points={`0,${logo.size*0.3} ${logo.size*0.15},0 ${logo.size},0 ${logo.size*0.85},${logo.size*0.3}`}
              fill="url(#solanaGradient)"
              opacity={logo.opacity}
            />
            <Polygon
              points={`0,${logo.size*0.5} ${logo.size*0.15},${logo.size*0.35} ${logo.size},${logo.size*0.35} ${logo.size*0.85},${logo.size*0.5}`}
              fill="url(#solanaGradient)"
              opacity={logo.opacity * 0.8}
            />
            <Polygon
              points={`0,${logo.size*0.7} ${logo.size*0.15},${logo.size*0.55} ${logo.size},${logo.size*0.55} ${logo.size*0.85},${logo.size*0.7}`}
              fill="url(#solanaGradient)"
              opacity={logo.opacity * 0.6}
            />
          </G>
        ))}
        
        {/* Path glow (outer) */}
        <Path
          d={pathData}
          stroke={COLORS.solanaPurple}
          strokeWidth={50}
          strokeOpacity={0.15}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Path border */}
        <Path
          d={pathData}
          stroke="url(#pathGradient)"
          strokeWidth={36}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Path inner (dark road) */}
        <Path
          d={pathData}
          stroke="url(#pathInner)"
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center line (dashed) */}
        <Path
          d={pathData}
          stroke={COLORS.solanaGreen}
          strokeWidth={2}
          strokeDasharray="8 12"
          strokeOpacity={0.4}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Time marker glow */}
        <Circle
          cx={timeMarkerPos.x}
          cy={timeMarkerPos.y}
          r={60}
          fill="url(#markerGlow)"
        />
        
        {/* Time marker line (vertical) */}
        <Path
          d={`M ${timeMarkerPos.x} ${timeMarkerPos.y - 40} L ${timeMarkerPos.x} ${timeMarkerPos.y + 40}`}
          stroke={COLORS.solanaPink}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.8}
        />
        
        {/* Time marker center */}
        <Circle
          cx={timeMarkerPos.x}
          cy={timeMarkerPos.y}
          r={8}
          fill={COLORS.solanaPink}
          stroke={COLORS.text}
          strokeWidth={2}
        />
        
        {/* "LOCKED" label for passed area */}
        {timeMarkerProgress > 0.15 && (
          <SvgText
            x={timeMarkerPos.x - 80}
            y={timeMarkerPos.y - 50}
            fill={COLORS.solanaPink}
            fontSize={10}
            fontWeight="bold"
            opacity={0.7}
          >
            ◀ LOCKED
          </SvgText>
        )}
      </Svg>
      
      {/* Conference name watermark */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>SOLANA BREAKPOINT</Text>
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
    bottom: 10,
    left: 10,
    opacity: 0.15,
  },
  watermarkText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});

export default Lane;
