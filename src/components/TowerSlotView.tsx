import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Polygon, G, Text as SvgText } from 'react-native-svg';
import { TowerSlot, Tower } from '../game/types';
import { COLORS, TOWER_CONFIGS } from '../game/config';

interface TowerSlotViewProps {
    slot: TowerSlot;
    onPress: () => void;
}

const SLOT_SIZE = 32;

/**
 * Renders a tower slot - empty, locked, or with tower
 */
export const TowerSlotView: React.FC<TowerSlotViewProps> = React.memo(
    ({ slot, onPress }) => {
        const { position, locked, tower } = slot;

        return (
            <TouchableOpacity
                style={[
                    styles.container,
                    {
                        left: position.x - SLOT_SIZE / 2,
                        top: position.y - SLOT_SIZE / 2,
                    },
                ]}
                onPress={onPress}
                disabled={locked && !tower}
                activeOpacity={0.7}
            >
                <Svg width={SLOT_SIZE} height={SLOT_SIZE}>
                    {tower ? (
                        <TowerShape tower={tower} />
                    ) : (
                        <SlotShape locked={locked} />
                    )}
                </Svg>
            </TouchableOpacity>
        );
    }
);

/**
 * Empty slot shape
 */
const SlotShape: React.FC<{ locked: boolean }> = ({ locked }) => (
    <G>
        <Rect
            x={2}
            y={2}
            width={SLOT_SIZE - 4}
            height={SLOT_SIZE - 4}
            rx={4}
            fill={locked ? COLORS.slotLocked : COLORS.slotAvailable}
            stroke={locked ? '#333' : COLORS.primary}
            strokeWidth={locked ? 1 : 2}
            opacity={locked ? 0.5 : 1}
        />
        {!locked && (
            <SvgText
                x={SLOT_SIZE / 2}
                y={SLOT_SIZE / 2 + 4}
                fontSize={16}
                fill={COLORS.primary}
                textAnchor="middle"
            >
                +
            </SvgText>
        )}
    </G>
);

/**
 * Tower shape based on type
 */
const TowerShape: React.FC<{ tower: Tower }> = ({ tower }) => {
    const color = getTowerColor(tower.type);
    const levelIndicator = tower.level;

    return (
        <G>
            {/* Base */}
            <Circle
                cx={SLOT_SIZE / 2}
                cy={SLOT_SIZE / 2}
                r={SLOT_SIZE / 2 - 2}
                fill={color}
                opacity={0.3}
            />

            {/* Tower shape by type */}
            {tower.type === 'fast' && (
                // Fast turret: triangle pointing up
                <Polygon
                    points={`${SLOT_SIZE / 2},4 ${SLOT_SIZE - 6},${SLOT_SIZE - 6} 6,${SLOT_SIZE - 6}`}
                    fill={color}
                />
            )}

            {tower.type === 'chain' && (
                // Chain tower: diamond
                <Polygon
                    points={`${SLOT_SIZE / 2},4 ${SLOT_SIZE - 4},${SLOT_SIZE / 2} ${SLOT_SIZE / 2},${SLOT_SIZE - 4} 4,${SLOT_SIZE / 2}`}
                    fill={color}
                />
            )}

            {tower.type === 'splash' && (
                // Splash tower: hexagon-ish
                <Circle
                    cx={SLOT_SIZE / 2}
                    cy={SLOT_SIZE / 2}
                    r={SLOT_SIZE / 2 - 6}
                    fill={color}
                />
            )}

            {/* Level indicator */}
            <SvgText
                x={SLOT_SIZE / 2}
                y={SLOT_SIZE / 2 + 4}
                fontSize={10}
                fill="#fff"
                textAnchor="middle"
                fontWeight="bold"
            >
                {levelIndicator}
            </SvgText>
        </G>
    );
};

function getTowerColor(type: Tower['type']): string {
    switch (type) {
        case 'fast':
            return COLORS.towerFast;
        case 'chain':
            return COLORS.towerChain;
        case 'splash':
            return COLORS.towerSplash;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: SLOT_SIZE,
        height: SLOT_SIZE,
    },
});

