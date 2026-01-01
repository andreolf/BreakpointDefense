import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Polygon, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS, SLOT_COUNT, GAME_WIDTH, LANE_Y } from '../game/config';
import { Tier, TowerSlot } from '../game/types';

interface ShareCardProps {
    time: number;
    wave: number;
    kills: number;
    tier: Tier;
    slots?: TowerSlot[];
}

/**
 * Share card component for social sharing
 * Designed for 1080x1920 ratio (9:16)
 */
export const ShareCard = forwardRef<View, ShareCardProps>(
    ({ time, wave, kills, tier, slots }, ref) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return (
            <View ref={ref} style={styles.container}>
                {/* Background gradient */}
                <View style={styles.background}>
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                        <Defs>
                            <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor="#0D0D0D" />
                                <Stop offset="0.3" stopColor="#1a1a2e" />
                                <Stop offset="0.7" stopColor="#16213e" />
                                <Stop offset="1" stopColor="#0D0D0D" />
                            </LinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" />
                    </Svg>
                </View>

                {/* Decorative grid lines */}
                <View style={styles.gridOverlay}>
                    <Svg width="100%" height="100%">
                        {[...Array(20)].map((_, i) => (
                            <Line
                                key={`h${i}`}
                                x1="0"
                                y1={`${i * 5}%`}
                                x2="100%"
                                y2={`${i * 5}%`}
                                stroke={COLORS.primary}
                                strokeWidth={0.5}
                                opacity={0.1}
                            />
                        ))}
                        {[...Array(10)].map((_, i) => (
                            <Line
                                key={`v${i}`}
                                x1={`${i * 10}%`}
                                y1="0"
                                x2={`${i * 10}%`}
                                y2="100%"
                                stroke={COLORS.primary}
                                strokeWidth={0.5}
                                opacity={0.1}
                            />
                        ))}
                    </Svg>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>⚡</Text>
                        <Text style={styles.title}>SOLANA BREAKPOINT</Text>
                        <Text style={styles.subtitle}>DEFENSE</Text>
                    </View>

                    {/* Mini map visualization */}
                    <View style={styles.minimapContainer}>
                        <MiniMap slots={slots} />
                    </View>

                    {/* Tier badge */}
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierLabel}>TIER ACHIEVED</Text>
                        <Text style={[styles.tierName, { color: getTierColor(tier) }]}>
                            {tier.toUpperCase()}
                        </Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <StatBox label="TIME SURVIVED" value={timeString} highlight />
                        <View style={styles.statsRow}>
                            <StatBox label="WAVES" value={wave.toString()} />
                            <StatBox label="KILLS" value={kills.toString()} />
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Can you survive longer?</Text>
                        <Text style={styles.hashtag}>#BreakpointDefense #Solana</Text>
                    </View>
                </View>
            </View>
        );
    }
);

const StatBox: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
    label,
    value,
    highlight,
}) => (
    <View style={[styles.statBox, highlight && styles.statBoxHighlight]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
            {value}
        </Text>
    </View>
);

const MiniMap: React.FC<{ slots?: TowerSlot[] }> = ({ slots }) => {
    const width = 280;
    const height = 80;

    return (
        <View style={styles.minimap}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="laneGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#1a1a2e" />
                        <Stop offset="0.5" stopColor="#2d2d44" />
                        <Stop offset="1" stopColor="#1a1a2e" />
                    </LinearGradient>
                </Defs>

                {/* Lane */}
                <Rect
                    x={10}
                    y={20}
                    width={width - 20}
                    height={40}
                    rx={4}
                    fill="url(#laneGrad)"
                    stroke={COLORS.primary}
                    strokeWidth={1}
                    opacity={0.8}
                />

                {/* Tower slots */}
                {slots?.map((slot, i) => {
                    const x = 20 + (i * (width - 50)) / (SLOT_COUNT - 1);
                    const y = 40;

                    if (slot.tower) {
                        const color =
                            slot.tower.type === 'fast'
                                ? COLORS.towerFast
                                : slot.tower.type === 'chain'
                                    ? COLORS.towerChain
                                    : COLORS.towerSplash;

                        return (
                            <G key={i}>
                                {slot.tower.type === 'fast' && (
                                    <Polygon
                                        points={`${x},${y - 8} ${x + 8},${y + 6} ${x - 8},${y + 6}`}
                                        fill={color}
                                    />
                                )}
                                {slot.tower.type === 'chain' && (
                                    <Polygon
                                        points={`${x},${y - 8} ${x + 8},${y} ${x},${y + 8} ${x - 8},${y}`}
                                        fill={color}
                                    />
                                )}
                                {slot.tower.type === 'splash' && (
                                    <Circle cx={x} cy={y} r={7} fill={color} />
                                )}
                            </G>
                        );
                    }

                    return (
                        <Rect
                            key={i}
                            x={x - 6}
                            y={y - 6}
                            width={12}
                            height={12}
                            rx={2}
                            fill="#333"
                            opacity={0.5}
                        />
                    );
                })}

                {/* Base */}
                <Rect
                    x={width - 18}
                    y={25}
                    width={12}
                    height={30}
                    rx={2}
                    fill={COLORS.primary}
                />

                {/* Spawn */}
                <Circle cx={12} cy={40} r={6} fill={COLORS.danger} opacity={0.8} />
            </Svg>
        </View>
    );
};

function getTierColor(tier: Tier): string {
    switch (tier) {
        case 'Attendee':
            return '#888888';
        case 'Builder':
            return '#4CAF50';
        case 'Core Contributor':
            return '#2196F3';
        case 'Infra Guardian':
            return '#9C27B0';
        case 'Conference Legend':
            return COLORS.gold;
    }
}

const styles = StyleSheet.create({
    container: {
        width: 360,
        height: 640,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
    },
    logo: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        color: COLORS.primary,
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '300',
        letterSpacing: 8,
        marginTop: 4,
    },
    minimapContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    minimap: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    tierBadge: {
        alignItems: 'center',
        marginVertical: 16,
    },
    tierLabel: {
        color: COLORS.textDim,
        fontSize: 12,
        letterSpacing: 2,
    },
    tierName: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
        letterSpacing: 1,
    },
    statsContainer: {
        gap: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statBoxHighlight: {
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        borderColor: COLORS.primary,
    },
    statLabel: {
        color: COLORS.textDim,
        fontSize: 11,
        letterSpacing: 1,
    },
    statValue: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statValueHighlight: {
        color: COLORS.primary,
        fontSize: 36,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        color: COLORS.text,
        fontSize: 16,
        fontStyle: 'italic',
    },
    hashtag: {
        color: COLORS.secondary,
        fontSize: 12,
        marginTop: 8,
        letterSpacing: 1,
    },
});

