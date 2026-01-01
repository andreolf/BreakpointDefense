/**
 * Solana Breakpoint Defense
 * A hypercasual tower defense game with LIVE spectating
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar, Linking, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { LiveListScreen } from './src/screens/LiveListScreen';
import { SpectateScreen } from './src/screens/SpectateScreen';
import { GameState } from './src/game/types';
import { COLORS } from './src/game/config';

type Screen = 'home' | 'game' | 'gameover' | 'leaderboard' | 'live' | 'spectate';

interface LiveRunConfig {
  alias: string;
  goLive: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [lastGameState, setLastGameState] = useState<GameState | null>(null);
  const [liveConfig, setLiveConfig] = useState<LiveRunConfig>({ alias: '', goLive: false });
  const [spectateSessionId, setSpectateSessionId] = useState<string | null>(null);

  // Deep linking handler
  useEffect(() => {
    // Handle initial URL (if app was opened from a link)
    const handleInitialUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) handleDeepLink(url);
      } catch (err) {
        console.error('[DeepLink] Initial URL error:', err);
      }
    };

    // Handle URLs while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = useCallback((url: string) => {
    console.log('[DeepLink] Received:', url);
    
    try {
      // Parse URL: breakpointdefense://live/SESSION_ID
      const match = url.match(/live\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        setSpectateSessionId(match[1]);
        setCurrentScreen('spectate');
      }
    } catch (err) {
      console.error('[DeepLink] Parse error:', err);
    }
  }, []);

  const handlePlay = useCallback((alias: string, goLive: boolean) => {
    setLiveConfig({ alias, goLive });
    setCurrentScreen('game');
  }, []);

  const handleGameOver = useCallback((state: GameState) => {
    setLastGameState(state);
    setCurrentScreen('gameover');
  }, []);

  const handleQuit = useCallback(() => {
    setCurrentScreen('home');
    setLiveConfig({ alias: '', goLive: false });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  const handleLive = useCallback(() => {
    setCurrentScreen('live');
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setSpectateSessionId(sessionId);
    setCurrentScreen('spectate');
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
    setSpectateSessionId(null);
  }, []);

  const handleBackFromSpectate = useCallback(() => {
    setSpectateSessionId(null);
    setCurrentScreen('live');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bgDark }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        
        {currentScreen === 'home' && (
          <HomeScreen 
            onPlay={handlePlay} 
            onLeaderboard={handleLeaderboard} 
            onLive={handleLive}
          />
        )}
        
        {currentScreen === 'game' && (
          <GameScreen 
            onGameOver={handleGameOver} 
            onQuit={handleQuit}
            liveConfig={liveConfig}
          />
        )}
        
        {currentScreen === 'gameover' && lastGameState && (
          <GameOverScreen
            gameState={lastGameState}
            onPlayAgain={handlePlayAgain}
            onHome={handleBackToHome}
            liveSessionId={liveConfig.goLive ? undefined : undefined} // Will be set by GameScreen
          />
        )}
        
        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen onBack={handleBackToHome} />
        )}

        {currentScreen === 'live' && (
          <LiveListScreen 
            onSelectSession={handleSelectSession}
            onBack={handleBackToHome}
          />
        )}

        {currentScreen === 'spectate' && spectateSessionId && (
          <SpectateScreen
            sessionId={spectateSessionId}
            onBack={handleBackFromSpectate}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
