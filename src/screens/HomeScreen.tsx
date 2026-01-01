import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';
import { SafeArea } from '../components/SafeArea';
import Svg, { Circle, Polygon, Rect, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS, TOWER_CONFIGS, BIOME } from '../game/config';

interface HomeScreenProps {
    onPlay: () => void;
    onLeaderboard: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onLeaderboard }) => {
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    return (
        <SafeArea style={styles.container}>
            {/* Background */}
            <View style={styles.background}>
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#0D0D0D" />
                            <Stop offset="0.4" stopColor="#1a1a2e" />
                            <Stop offset="1" stopColor="#0D0D0D" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
                </Svg>

                {/* Animated grid */}
                <Svg width="100%" height="100%" style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}>
                    {[...Array(15)].map((_, i) => (
                        <Line
                            key={`h${i}`}
                            x1="0"
                            y1={`${i * 7}%`}
                            x2="100%"
                            y2={`${i * 7}%`}
                            stroke={COLORS.primary}
                            strokeWidth={0.5}
                        />
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <Line
                            key={`v${i}`}
                            x1={`${i * 14}%`}
                            y1="0"
                            x2={`${i * 14}%`}
                            y2="100%"
                            stroke={COLORS.primary}
                            strokeWidth={0.5}
                        />
                    ))}
                </Svg>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.lightning}>⚡</Text>
                    <Text style={styles.title}>SOLANA</Text>
                    <Text style={styles.titleBreakpoint}>BREAKPOINT</Text>
                    <Text style={styles.subtitle}>DEFENSE</Text>
                </View>

                {/* Decorative towers */}
                <View style={styles.towerShowcase}>
                    <Svg width={200} height={60}>
                        <G transform="translate(30, 30)">
                            <Polygon points="0,-20 20,15 -20,15" fill={COLORS.towerFast} />
                        </G>
                        <G transform="translate(100, 30)">
                            <Polygon points="0,-20 20,0 0,20 -20,0" fill={COLORS.towerChain} />
                        </G>
                        <G transform="translate(170, 30)">
                            <Circle r={18} fill={COLORS.towerSplash} />
                        </G>
                    </Svg>
                </View>

                {/* Biome badge */}
                <View style={styles.biomeBadge}>
                    <Text style={styles.biomeLabel}>BIOME</Text>
                    <Text style={styles.biomeName}>{BIOME.name}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.playButton} onPress={onPlay}>
                        <Text style={styles.playButtonText}>PLAY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onLeaderboard}>
                        <Text style={styles.secondaryButtonText}>LEADERBOARD</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setShowHowToPlay(true)}
                    >
                        <Text style={styles.secondaryButtonText}>HOW TO PLAY</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* How to Play Modal */}
            <HowToPlayModal
                visible={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
            />
        </SafeArea>
    );
};

const HowToPlayModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
    visible,
    onClose,
}) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalTitle}>HOW TO PLAY</Text>

                    <Section title="OBJECTIVE">
                        Defend your base from waves of enemies. Survive as long as possible!
                    </Section>

                    <Section title="PLACEMENT RULE">
                        You can only place towers AHEAD of the red time marker.
                        As time passes, slots behind the marker become locked forever.
                    </Section>

                    <Section title="TOWERS">
                        <TowerInfo
                            name="Fast Turret"
                            color={COLORS.towerFast}
                            desc="High fire rate, low damage. Great for swarms."
                        />
                        <TowerInfo
                            name="Chain Tower"
                            color={COLORS.towerChain}
                            desc="Chains to nearby enemies. Good crowd control."
                        />
                        <TowerInfo
                            name="Splash Tower"
                            color={COLORS.towerSplash}
                            desc="Area damage. Slow but powerful."
                        />
                    </Section>

                    <Section title="ENEMIES">
                        <Text style={styles.enemyInfo}>
                            🔴 <Text style={styles.highlight}>Swarm</Text> - Fast, low HP{'\n'}
                            🟥 <Text style={styles.highlight}>Tank</Text> - Slow, high HP{'\n'}
                            🟣 <Text style={styles.highlight}>MiniBoss</Text> - Appears every 60s
                        </Text>
                    </Section>

                    <Section title="UPGRADES">
                        Tap an existing tower to upgrade it (max level 3).
                        Upgrades increase damage and fire rate.
                    </Section>

                    <Section title="TIERS">
                        <Text style={styles.tierList}>
                            {'⬜ Attendee: 0-90s\n'}
                            {'🟩 Builder: 90-180s\n'}
                            {'🟦 Core Contributor: 180-300s\n'}
                            {'🟪 Infra Guardian: 300-420s\n'}
                            {'🟨 Conference Legend: 420s+'}
                        </Text>
                    </Section>
                </ScrollView>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>GOT IT</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {typeof children === 'string' ? (
            <Text style={styles.sectionText}>{children}</Text>
        ) : (
            children
        )}
    </View>
);

const TowerInfo: React.FC<{ name: string; color: string; desc: string }> = ({
    name,
    color,
    desc,
}) => (
    <View style={styles.towerInfo}>
        <View style={[styles.towerDot, { backgroundColor: color }]} />
        <View style={styles.towerInfoText}>
            <Text style={[styles.towerName, { color }]}>{name}</Text>
            <Text style={styles.towerDesc}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    lightning: {
        fontSize: 64,
        marginBottom: 8,
    },
    title: {
        color: COLORS.primary,
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 8,
    },
    titleBreakpoint: {
        color: COLORS.text,
        fontSize: 36,
        fontWeight: '300',
        letterSpacing: 4,
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: 24,
        letterSpacing: 12,
        marginTop: 8,
    },
    towerShowcase: {
        marginVertical: 24,
    },
    biomeBadge: {
        backgroundColor: 'rgba(153, 69, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginBottom: 32,
    },
    biomeLabel: {
        color: COLORS.textDim,
        fontSize: 10,
        textAlign: 'center',
        letterSpacing: 2,
    },
    biomeName: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttons: {
        width: '100%',
        maxWidth: 280,
        gap: 12,
    },
    playButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    playButtonText: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.textDim,
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    modalTitle: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    sectionText: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
    },
    highlight: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    enemyInfo: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 24,
    },
    tierList: {
        color: COLORS.text,
        fontSize: 13,
        lineHeight: 22,
    },
    towerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    towerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    towerInfoText: {
        flex: 1,
    },
    towerName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    towerDesc: {
        color: COLORS.textDim,
        fontSize: 12,
    },
    closeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

