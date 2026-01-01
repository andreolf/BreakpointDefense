/**
 * Lane Component
 * Smooth bezier path with buildable zone indicators
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { PATH_WAYPOINTS, COLORS, GAME_CONFIG } from '../game/config';

interface LaneProps {
  width: number;
  height: number;
  freezeActive?: boolean;
  showBuildZones?: boolean;
  towers?: { x: number; y: number }[];
}

// Generate smooth bezier curve through points
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  
  let d = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Catmull-Rom to Bezier conversion
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  
  return d;
}

// Get points along the bezier path for build zones
function getPathSamplePoints(
  points: { x: number; y: number }[],
  numSamples: number
): { x: number; y: number }[] {
  const samples: { x: number; y: number }[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const segmentSamples = Math.ceil(numSamples / (points.length - 1));
    for (let t = 0; t < segmentSamples; t++) {
      const ratio = t / segmentSamples;
      samples.push({
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      });
    }
  }
  
  return samples;
}

export const Lane: React.FC<LaneProps> = ({ 
  width, 
  height, 
  freezeActive = false,
  showBuildZones = true,
  towers = [],
}) => {
  const points = useMemo(() => 
    PATH_WAYPOINTS.map(p => ({ x: p.x * width, y: p.y * height })),
    [width, height]
  );
  
  const pathData = useMemo(() => generateSmoothPath(points), [points]);
  
  // Build zone positions (CLEARLY OUTSIDE the path)
  const buildZones = useMemo(() => {
    const samples = getPathSamplePoints(points, 24);
    const zones: { x: number; y: number; available: boolean }[] = [];
    const offset = GAME_CONFIG.towerOffsetFromPath + 10; // Extra offset to be clearly outside
    
    for (let i = 1; i < samples.length - 1; i += 2) {
      const prev = samples[i - 1];
      const curr = samples[i];
      const next = samples[i + 1];
      
      // Get perpendicular direction
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      
      // Create zones on both sides of path
      const zone1 = { x: curr.x + nx * offset, y: curr.y + ny * offset };
      const zone2 = { x: curr.x - nx * offset, y: curr.y - ny * offset };
      
      // Check if tower already exists nearby
      const isTaken = (z: { x: number; y: number }) => 
        towers.some(t => Math.hypot(t.x - z.x, t.y - z.y) < GAME_CONFIG.minDistanceBetweenTowers);
      
      if (zone1.x > 20 && zone1.x < width - 20 && zone1.y > 20 && zone1.y < height - 20) {
        zones.push({ ...zone1, available: !isTaken(zone1) });
      }
      if (zone2.x > 20 && zone2.x < width - 20 && zone2.y > 20 && zone2.y < height - 20) {
        zones.push({ ...zone2, available: !isTaken(zone2) });
      }
    }
    
    return zones;
  }, [points, towers, width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.9" />
            <Stop offset="50%" stopColor={COLORS.solanaPink} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.9" />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={COLORS.solanaPurple} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={COLORS.solanaGreen} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Background glow */}
        <Path
          d={pathData}
          stroke="url(#glowGrad)"
          strokeWidth={GAME_CONFIG.pathWidth + 30}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main path - outer edge */}
        <Path
          d={pathData}
          stroke={COLORS.bgCardLight}
          strokeWidth={GAME_CONFIG.pathWidth + 6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
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

        {/* Center dashed line */}
        <Path
          d={pathData}
          stroke={COLORS.bgDark}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="10 15"
          opacity={0.6}
        />

        {/* Freeze overlay */}
        {freezeActive && (
          <Path
            d={pathData}
            stroke={COLORS.solanaBlue}
            strokeWidth={GAME_CONFIG.pathWidth + 10}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
        )}

        {/* Build zones */}
        {showBuildZones && (
          <G>
            {buildZones.map((zone, i) => (
              <G key={i}>
                {/* Outer ring */}
                <Circle
                  cx={zone.x}
                  cy={zone.y}
                  r={18}
                  fill="none"
                  stroke={zone.available ? COLORS.solanaGreen : COLORS.bgCardLight}
                  strokeWidth={2}
                  strokeDasharray={zone.available ? "4 3" : "0"}
                  opacity={zone.available ? 0.5 : 0.15}
                />
                {/* Inner dot */}
                {zone.available && (
                  <Circle
                    cx={zone.x}
                    cy={zone.y}
                    r={4}
                    fill={COLORS.solanaGreen}
                    opacity={0.4}
                  />
                )}
              </G>
            ))}
          </G>
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
