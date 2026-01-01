import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PATH_WAYPOINTS,
  LANE_WIDTH,
  COLORS,
  BASE_X,
  BASE_Y,
} from '../game/config';
import { getPositionAlongPath } from '../game/engine';

interface LaneProps {
  timeMarkerProgress: number; // 0-1
}

/**
 * Renders the S-curve lane with Solana Breakpoint theming
 */
export const Lane: React.FC<LaneProps> = React.memo(({ timeMarkerProgress }) => {
  // Generate smooth path string from waypoints
  const pathD = generateSmoothPath(PATH_WAYPOINTS);
  
  // Get marker position along path
  const markerPos = getPositionAlongPath(timeMarkerProgress);
  
  return (
    <Svg
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        {/* Background gradient */}
        <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0a0a12" />
          <Stop offset="0.3" stopColor="#0D0D0D" />
          <Stop offset="0.7" stopColor="#1a1a2e" />
          <Stop offset="1" stopColor="#0f0f1a" />
        </LinearGradient>
        
        {/* Path gradient */}
        <LinearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#14F195" stopOpacity="0.3" />
          <Stop offset="0.5" stopColor="#9945FF" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#DC1FFF" stopOpacity="0.3" />
        </LinearGradient>
        
        {/* Path stroke gradient */}
        <LinearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#14F195" />
          <Stop offset="0.5" stopColor="#9945FF" />
          <Stop offset="1" stopColor="#DC1FFF" />
        </LinearGradient>
        
        {/* Glow effect */}
        <RadialGradient id="glowGradient" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#14F195" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#14F195" stopOpacity="0" />
        </RadialGradient>
        
        {/* Base glow */}
        <RadialGradient id="baseGlow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#14F195" stopOpacity="0.8" />
          <Stop offset="0.5" stopColor="#14F195" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#14F195" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      
      {/* Background */}
      <Rect x="0" y="0" width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#bgGradient)" />
      
      {/* Grid pattern - Solana circuit board style */}
      <G opacity={0.08}>
        {[...Array(20)].map((_, i) => (
          <Line
            key={`h${i}`}
            x1="0"
            y1={i * 35}
            x2={GAME_WIDTH}
            y2={i * 35}
            stroke={COLORS.primary}
            strokeWidth={0.5}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <Line
            key={`v${i}`}
            x1={i * 35}
            y1="0"
            x2={i * 35}
            y2={GAME_HEIGHT}
            stroke={COLORS.primary}
            strokeWidth={0.5}
          />
        ))}
      </G>
      
      {/* Decorative Solana logo patterns */}
      <G opacity={0.05}>
        <SolanaLogo x={50} y={50} size={40} />
        <SolanaLogo x={320} y={100} size={30} />
        <SolanaLogo x={30} y={400} size={25} />
        <SolanaLogo x={350} y={500} size={35} />
      </G>
      
      {/* Conference name */}
      <SvgText
        x={GAME_WIDTH / 2}
        y={30}
        fontSize={12}
        fill={COLORS.primary}
        textAnchor="middle"
        opacity={0.4}
        fontWeight="bold"
      >
        SOLANA BREAKPOINT 2024
      </SvgText>
      
      {/* Main path glow */}
      <Path
        d={pathD}
        stroke="#14F195"
        strokeWidth={LANE_WIDTH + 20}
        strokeOpacity={0.1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Main path fill */}
      <Path
        d={pathD}
        stroke="url(#pathGradient)"
        strokeWidth={LANE_WIDTH}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Path border - outer */}
      <Path
        d={pathD}
        stroke="#9945FF"
        strokeWidth={LANE_WIDTH + 4}
        strokeOpacity={0.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Path inner edge */}
      <Path
        d={pathD}
        stroke={COLORS.background}
        strokeWidth={LANE_WIDTH - 4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Path center line (direction indicator) */}
      <Path
        d={pathD}
        stroke="#14F195"
        strokeWidth={2}
        strokeOpacity={0.3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10,15"
      />
      
      {/* Spawn point */}
      <G>
        <Circle
          cx={PATH_WAYPOINTS[0].x + 30}
          cy={PATH_WAYPOINTS[0].y}
          r={25}
          fill="#FF4757"
          opacity={0.3}
        />
        <Circle
          cx={PATH_WAYPOINTS[0].x + 30}
          cy={PATH_WAYPOINTS[0].y}
          r={15}
          fill="#FF4757"
          opacity={0.6}
        />
        <SvgText
          x={PATH_WAYPOINTS[0].x + 30}
          y={PATH_WAYPOINTS[0].y + 4}
          fontSize={10}
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
        >
          ⚠
        </SvgText>
      </G>
      
      {/* Base (endpoint) */}
      <G>
        <Circle
          cx={BASE_X}
          cy={BASE_Y}
          r={40}
          fill="url(#baseGlow)"
        />
        <Rect
          x={BASE_X - 20}
          y={BASE_Y - 30}
          width={40}
          height={60}
          rx={8}
          fill={COLORS.primary}
          opacity={0.9}
        />
        <Rect
          x={BASE_X - 14}
          y={BASE_Y - 24}
          width={28}
          height={48}
          rx={4}
          fill="#0D0D0D"
          opacity={0.5}
        />
        <SvgText
          x={BASE_X}
          y={BASE_Y + 5}
          fontSize={16}
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
        >
          ⚡
        </SvgText>
      </G>
      
      {/* Time marker - moving indicator */}
      <G>
        <Circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={20}
          fill="#DC1FFF"
          opacity={0.3}
        />
        <Circle
          cx={markerPos.x}
          cy={markerPos.y}
          r={8}
          fill="#DC1FFF"
          stroke="#fff"
          strokeWidth={2}
        />
      </G>
      
      {/* Marker trail line */}
      <Path
        d={generatePartialPath(PATH_WAYPOINTS, timeMarkerProgress)}
        stroke="#DC1FFF"
        strokeWidth={3}
        strokeOpacity={0.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
});

/**
 * Simple Solana logo shape
 */
const SolanaLogo: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Path
      d={`M0,${size * 0.2} L${size},0 L${size},${size * 0.25} L0,${size * 0.45} Z`}
      fill={COLORS.primary}
    />
    <Path
      d={`M0,${size * 0.4} L${size},${size * 0.2} L${size},${size * 0.45} L0,${size * 0.65} Z`}
      fill={COLORS.secondary}
    />
    <Path
      d={`M0,${size * 0.6} L${size},${size * 0.4} L${size},${size * 0.65} L0,${size * 0.85} Z`}
      fill={COLORS.tertiary}
    />
  </G>
);

/**
 * Generate smooth SVG path from waypoints using bezier curves
 */
function generateSmoothPath(waypoints: { x: number; y: number }[]): string {
  if (waypoints.length < 2) return '';
  
  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
  
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];
    
    if (i === 1) {
      // First segment - quadratic curve
      const cp = {
        x: (prev.x + curr.x) / 2,
        y: (prev.y + curr.y) / 2,
      };
      d += ` Q ${cp.x} ${cp.y} ${curr.x} ${curr.y}`;
    } else if (next) {
      // Middle segments - smooth curve through point
      const cp1 = {
        x: prev.x + (curr.x - waypoints[i - 2].x) * 0.2,
        y: prev.y + (curr.y - waypoints[i - 2].y) * 0.2,
      };
      const cp2 = {
        x: curr.x - (next.x - prev.x) * 0.2,
        y: curr.y - (next.y - prev.y) * 0.2,
      };
      d += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${curr.x} ${curr.y}`;
    } else {
      // Last segment
      d += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  return d;
}

/**
 * Generate partial path up to a certain progress
 */
function generatePartialPath(waypoints: { x: number; y: number }[], progress: number): string {
  if (progress <= 0 || waypoints.length < 2) return '';
  
  const totalSegments = waypoints.length - 1;
  const segmentProgress = progress * totalSegments;
  const endSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const t = segmentProgress - endSegment;
  
  // Get waypoints up to current progress
  const partialWaypoints = waypoints.slice(0, endSegment + 1);
  
  // Add interpolated end point
  if (endSegment < totalSegments) {
    const start = waypoints[endSegment];
    const end = waypoints[endSegment + 1];
    partialWaypoints.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }
  
  return generateSmoothPath(partialWaypoints);
}
