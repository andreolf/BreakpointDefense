import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { TowerType, Tower } from '../game/types';
import { COLORS, TOWER_CONFIGS } from '../game/config';

interface TowerSelectPopupProps {
    visible: boolean;
    coins: number;
    existingTower: Tower | null;
    onSelectTower: (type: TowerType) => void;
    onUpgrade: () => void;
    onClose: () => void;
}

const TOWER_TYPES: TowerType[] = ['fast', 'chain', 'splash'];

/**
 * Popup for selecting a tower type or upgrading
 */
export const TowerSelectPopup: React.FC<TowerSelectPopupProps> = ({
    visible,
    coins,
    existingTower,
    onSelectTower,
    onUpgrade,
    onClose,
}) => {
    if (!visible) return null;

    const isUpgradeMode = existingTower !== null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.popup}>
                    <Text style={styles.title}>
                        {isUpgradeMode ? 'Upgrade Tower' : 'Select Tower'}
                    </Text>

                    {isUpgradeMode && existingTower ? (
                        <UpgradeOption
                            tower={existingTower}
                            coins={coins}
                            onUpgrade={onUpgrade}
                        />
                    ) : (
                        <View style={styles.optionsRow}>
                            {TOWER_TYPES.map(type => (
                                <TowerOption
                                    key={type}
                                    type={type}
                                    coins={coins}
                                    onSelect={() => onSelectTower(type)}
                                />
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

interface TowerOptionProps {
    type: TowerType;
    coins: number;
    onSelect: () => void;
}

const TowerOption: React.FC<TowerOptionProps> = ({ type, coins, onSelect }) => {
    const config = TOWER_CONFIGS[type];
    const canAfford = coins >= config.cost;

    const color = type === 'fast' ? COLORS.towerFast : type === 'chain' ? COLORS.towerChain : COLORS.towerSplash;

    return (
        <TouchableOpacity
            style={[styles.option, !canAfford && styles.optionDisabled]}
            onPress={onSelect}
            disabled={!canAfford}
        >
            <View style={styles.iconContainer}>
                <Svg width={40} height={40}>
                    {type === 'fast' && (
                        <Polygon
                            points="20,4 36,36 4,36"
                            fill={canAfford ? color : '#666'}
                        />
                    )}
                    {type === 'chain' && (
                        <Polygon
                            points="20,4 36,20 20,36 4,20"
                            fill={canAfford ? color : '#666'}
                        />
                    )}
                    {type === 'splash' && (
                        <Circle
                            cx={20}
                            cy={20}
                            r={16}
                            fill={canAfford ? color : '#666'}
                        />
                    )}
                </Svg>
            </View>
            <Text style={[styles.optionName, !canAfford && styles.textDisabled]}>
                {config.name}
            </Text>
            <Text style={[styles.optionCost, !canAfford && styles.textDisabled]}>
                {config.cost} 🪙
            </Text>
            <Text style={styles.optionStats}>
                DMG: {config.damage[0]} | RoF: {config.fireRate[0]}/s
            </Text>
        </TouchableOpacity>
    );
};

interface UpgradeOptionProps {
    tower: Tower;
    coins: number;
    onUpgrade: () => void;
}

const UpgradeOption: React.FC<UpgradeOptionProps> = ({ tower, coins, onUpgrade }) => {
    const config = TOWER_CONFIGS[tower.type];
    const currentLevel = tower.level;
    const maxLevel = 3;

    if (currentLevel >= maxLevel) {
        return (
            <View style={styles.upgradeContainer}>
                <Text style={styles.maxLevelText}>MAX LEVEL</Text>
                <Text style={styles.statsText}>
                    DMG: {config.damage[currentLevel - 1]} | RoF: {config.fireRate[currentLevel - 1]}/s
                </Text>
            </View>
        );
    }

    const upgradeCost = config.upgradeCost[currentLevel];
    const canAfford = coins >= upgradeCost;

    return (
        <View style={styles.upgradeContainer}>
            <Text style={styles.currentLevel}>
                Level {currentLevel} → {currentLevel + 1}
            </Text>
            <Text style={styles.statsText}>
                DMG: {config.damage[currentLevel - 1]} → {config.damage[currentLevel]}
            </Text>
            <Text style={styles.statsText}>
                RoF: {config.fireRate[currentLevel - 1]}/s → {config.fireRate[currentLevel]}/s
            </Text>
            <TouchableOpacity
                style={[styles.upgradeBtn, !canAfford && styles.upgradeBtnDisabled]}
                onPress={onUpgrade}
                disabled={!canAfford}
            >
                <Text style={styles.upgradeBtnText}>
                    Upgrade ({upgradeCost} 🪙)
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 360,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    option: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#2d2d44',
        borderRadius: 12,
        width: '30%',
    },
    optionDisabled: {
        opacity: 0.5,
    },
    iconContainer: {
        marginBottom: 8,
    },
    optionName: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    optionCost: {
        color: COLORS.gold,
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    optionStats: {
        color: COLORS.textDim,
        fontSize: 9,
        marginTop: 4,
        textAlign: 'center',
    },
    textDisabled: {
        color: '#666',
    },
    cancelBtn: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#333',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: COLORS.textDim,
        fontSize: 14,
    },
    upgradeContainer: {
        alignItems: 'center',
        padding: 16,
    },
    currentLevel: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsText: {
        color: COLORS.text,
        fontSize: 14,
        marginBottom: 4,
    },
    maxLevelText: {
        color: COLORS.gold,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    upgradeBtn: {
        marginTop: 16,
        padding: 12,
        paddingHorizontal: 24,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    upgradeBtnDisabled: {
        backgroundColor: '#444',
    },
    upgradeBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

