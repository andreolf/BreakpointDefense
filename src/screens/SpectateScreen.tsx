/**
 * Spectate Screen
 * Watch a live session + make predictions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Modal,
} from 'react-native';
import Svg, { Circle, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, getTier, TOWER_CONFIGS, GAME_CONFIG } from '../game/config';
import { liveClient } from '../live/wsClient';
import { GameSnapshot, ServerMessage, TierPrediction, TIER_OPTIONS } from '../live/types';
import {
  setCurrentPrediction,
  getCurrentPrediction,
  hasCurrentPrediction,
  savePredictionResult,
  getPredictionStats,
  PredictionStats,
} from '../predictions/storage';
import { Lane } from '../components/Lane';

interface SpectateScreenProps {
  sessionId: string;
  onBack: () => void;
}

export const SpectateScreen: React.FC<SpectateScreenProps> = ({
  sessionId,
  onBack,
}) => {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [finalTier, setFinalTier] = useState<string | null>(null);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  
  // Prediction state
  const [prediction, setPrediction] = useState<TierPrediction | null>(null);
  const [predictionLocked, setPredictionLocked] = useState(false);
  const [predictionsSummary, setPredictionsSummary] = useState<Record<string, number>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [predictionCorrect, setPredictionCorrect] = useState(false);
  const [stats, setStats] = useState<PredictionStats | null>(null);

  // Connect and join session
  useEffect(() => {
    let unsubscribeMessage: (() => void) | null = null;
    let unsubscribeConnection: (() => void) | null = null;
    let lastUpdateTime = 0;

    const setup = async () => {
      const joined = await liveClient.joinSession(sessionId);
      setConnected(joined);

      // Check if we already have a prediction for this session
      const existingPrediction = getCurrentPrediction(sessionId);
      if (existingPrediction) {
        setPrediction(existingPrediction);
        setPredictionLocked(true);
      }

      unsubscribeMessage = liveClient.onMessage((msg: ServerMessage) => {
        if (msg.type === 'snapshot_update' && msg.snapshot) {
          const now = Date.now();
          // Low bandwidth mode: update every 1s instead of every update
          if (lowBandwidth && now - lastUpdateTime < 1000) return;
          lastUpdateTime = now;
          
          setSnapshot(msg.snapshot);
          
          // Auto-lock prediction after 20 seconds
          if (msg.snapshot.time >= 20 && prediction && !predictionLocked) {
            lockPrediction(prediction);
          }
        } else if (msg.type === 'session_ended') {
          setSessionEnded(true);
          if (msg.snapshot) setSnapshot(msg.snapshot);
          if (msg.finalTier) {
            setFinalTier(msg.finalTier);
            handleSessionEnd(msg.finalTier);
          }
          if (msg.predictions) setPredictionsSummary(msg.predictions);
        } else if (msg.type === 'predictions_summary' && msg.predictions) {
          setPredictionsSummary(msg.predictions);
        }
      });

      unsubscribeConnection = liveClient.onConnectionChange((isConnected) => {
        setConnected(isConnected);
      });
    };

    setup();

    return () => {
      unsubscribeMessage?.();
      unsubscribeConnection?.();
      liveClient.leaveSession();
    };
  }, [sessionId]);

  // Lock prediction
  const lockPrediction = useCallback((tier: TierPrediction) => {
    setCurrentPrediction(sessionId, tier);
    setPrediction(tier);
    setPredictionLocked(true);
    liveClient.submitPrediction(tier);
  }, [sessionId]);

  // Handle session end
  const handleSessionEnd = useCallback(async (actualTier: string) => {
    if (!prediction) return;
    
    const correct = prediction === actualTier;
    setPredictionCorrect(correct);
    
    // Save result
    await savePredictionResult({
      sessionId,
      predicted: prediction,
      actual: actualTier,
      correct,
      timestamp: Date.now(),
    });
    
    // Get updated stats
    const newStats = await getPredictionStats();
    setStats(newStats);
    
    setShowResultModal(true);
  }, [sessionId, prediction]);

  // Share link
  const handleShare = useCallback(async () => {
    try {
      const link = `breakpointdefense://live/${sessionId}`;
      const message = `I'm watching a LIVE Breakpoint Defense run! Predict their tier: ${link}`;
      
      await Share.share({
        message,
        url: link,
      });
    } catch (err) {
      console.error('[Share] Error:', err);
    }
  }, [sessionId]);

  // Format time
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate if prediction is still allowed
  const canPredict = !predictionLocked && !sessionEnded && (snapshot?.time || 0) < 20;

  // Render mini game view
  const renderGameView = () => {
    if (!snapshot) {
      return (
        <View style={styles.loadingView}>
          <Text style={styles.loadingText}>📡 Connecting...</Text>
        </View>
      );
    }

    const scale = 0.5; // Scale down to fit
    const scaledWidth = GAME_WIDTH * scale;
    const scaledHeight = GAME_HEIGHT * scale;

    return (
      <View style={[styles.gameView, { width: scaledWidth, height: scaledHeight }]}>
        <View style={{ transform: [{ scale }], width: GAME_WIDTH, height: GAME_HEIGHT }}>
          {/* Lane */}
          <Lane width={GAME_WIDTH} height={GAME_HEIGHT} freezeActive={false} showBuildZones={false} />
          
          {/* Towers */}
          <Svg width={GAME_WIDTH} height={GAME_HEIGHT} style={StyleSheet.absoluteFill}>
            {snapshot.towers.map((tower) => {
              const config = TOWER_CONFIGS[tower.type as keyof typeof TOWER_CONFIGS];
              return (
                <G key={tower.id}>
                  <Circle
                    cx={tower.x}
                    cy={tower.y}
                    r={20}
                    fill={config?.color || COLORS.solanaPurple}
                    stroke="#000"
                    strokeWidth={2}
                  />
                </G>
              );
            })}
            
            {/* Enemies */}
            {snapshot.enemies.map((enemy) => (
              <G key={enemy.id}>
                <Circle
                  cx={enemy.x}
                  cy={enemy.y}
                  r={12}
                  fill={COLORS.hpLow}
                  stroke="#000"
                  strokeWidth={1}
                />
              </G>
            ))}
          </Svg>
        </View>

        {/* LIVE indicator */}
        {!sessionEnded && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        )}

        {/* Ended overlay */}
        {sessionEnded && (
          <View style={styles.endedOverlay}>
            <Text style={styles.endedText}>SESSION ENDED</Text>
            <Text style={styles.endedTier}>{finalTier || 'Unknown'}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render prediction widget
  const renderPredictionWidget = () => {
    const timeLeft = Math.max(0, 20 - (snapshot?.time || 0));

    return (
      <View style={styles.predictionWidget}>
        <Text style={styles.predictionTitle}>🎯 PREDICT THE TIER</Text>
        
        {canPredict && (
          <Text style={styles.predictionTimer}>
            ⏱ {Math.ceil(timeLeft)}s left to predict
          </Text>
        )}
        
        <View style={styles.tierOptions}>
          {TIER_OPTIONS.map((tier) => {
            const isSelected = prediction === tier;
            const count = predictionsSummary[tier] || 0;
            
            return (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierOption,
                  isSelected && styles.tierOptionSelected,
                  predictionLocked && !isSelected && styles.tierOptionDisabled,
                ]}
                onPress={() => {
                  if (canPredict) {
                    setPrediction(tier);
                  }
                }}
                disabled={predictionLocked || sessionEnded}
              >
                <Text style={[styles.tierOptionText, isSelected && styles.tierOptionTextSelected]}>
                  {tier}
                </Text>
                {count > 0 && (
                  <Text style={styles.tierVotes}>{count} 👤</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {prediction && !predictionLocked && canPredict && (
          <TouchableOpacity
            style={styles.lockBtn}
            onPress={() => lockPrediction(prediction)}
          >
            <Text style={styles.lockBtnText}>🔒 LOCK PREDICTION</Text>
          </TouchableOpacity>
        )}
        
        {predictionLocked && (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedBadgeText}>✅ Prediction Locked: {prediction}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.bandwidthToggle, lowBandwidth && styles.bandwidthToggleActive]}
            onPress={() => setLowBandwidth(!lowBandwidth)}
          >
            <Text style={styles.bandwidthToggleText}>
              {lowBandwidth ? '📶 Low' : '📶 High'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudValue}>{formatTime(snapshot?.time || 0)}</Text>
          <Text style={styles.hudLabel}>TIME</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudValue}>{snapshot?.wave || 1}</Text>
          <Text style={styles.hudLabel}>WAVE</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={[styles.hudValue, { color: (snapshot?.baseHp || 100) > 50 ? COLORS.hpGood : COLORS.hpLow }]}>
            {snapshot?.baseHp || 100}
          </Text>
          <Text style={styles.hudLabel}>HP</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudValue}>{snapshot?.kills || 0}</Text>
          <Text style={styles.hudLabel}>KILLS</Text>
        </View>
      </View>

      {/* Game View */}
      {renderGameView()}

      {/* Prediction Widget */}
      {renderPredictionWidget()}

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {predictionCorrect ? '🎉 CORRECT!' : '❌ WRONG'}
            </Text>
            
            <Text style={styles.modalText}>
              You predicted: {prediction}
            </Text>
            <Text style={styles.modalText}>
              Actual tier: {finalTier}
            </Text>
            
            {stats && (
              <View style={styles.statsBox}>
                <Text style={styles.statsTitle}>Your Stats</Text>
                <Text style={styles.statLine}>
                  Accuracy: {stats.totalPredictions > 0 
                    ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100) 
                    : 0}%
                </Text>
                <Text style={styles.statLine}>
                  Current Streak: {stats.currentStreak} 🔥
                </Text>
                <Text style={styles.statLine}>
                  Best Streak: {stats.bestStreak} ⭐
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowResultModal(false);
                onBack();
              }}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgCardLight,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandwidthToggle: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  bandwidthToggleActive: {
    backgroundColor: COLORS.solanaPurple,
  },
  bandwidthToggleText: {
    color: COLORS.text,
    fontSize: 12,
  },
  shareBtn: {
    backgroundColor: COLORS.solanaGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: {
    color: COLORS.bgDark,
    fontSize: 14,
    fontWeight: '700',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: COLORS.bgCard,
  },
  hudItem: {
    alignItems: 'center',
  },
  hudValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  hudLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  gameView: {
    alignSelf: 'center',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.bgCardLight,
    position: 'relative',
  },
  loadingView: {
    width: 400,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    alignSelf: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.hpLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  liveIndicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endedText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  endedTier: {
    color: COLORS.solanaGreen,
    fontSize: 24,
    fontWeight: '800',
  },
  predictionWidget: {
    backgroundColor: COLORS.bgCard,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
  },
  predictionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  predictionTimer: {
    color: COLORS.hpMedium,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  tierOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tierOption: {
    backgroundColor: COLORS.bgCardLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    margin: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  tierOptionSelected: {
    backgroundColor: COLORS.solanaPurple,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  tierOptionDisabled: {
    opacity: 0.4,
  },
  tierOptionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  tierOptionTextSelected: {
    fontWeight: '800',
  },
  tierVotes: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  lockBtn: {
    backgroundColor: COLORS.solanaGreen,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  lockBtnText: {
    color: COLORS.bgDark,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  lockedBadge: {
    backgroundColor: COLORS.bgCardLight,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  lockedBadgeText: {
    color: COLORS.solanaGreen,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.solanaPurple,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  modalText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  statsBox: {
    backgroundColor: COLORS.bgCardLight,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  statsTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  statLine: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginVertical: 4,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: COLORS.solanaPurple,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

