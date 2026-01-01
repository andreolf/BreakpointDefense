/**
 * Solana Breakpoint Defense
 * A hypercasual tower defense game
 */

import React, { useState, useCallback, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GameSettings } from './src/game/types';
import { loadSettings, saveSettings } from './src/storage/settings';
import { saveRun } from './src/storage/leaderboard';
import { getTier } from './src/game/config';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';

// Conditionally import SafeAreaProvider for native platforms
let SafeAreaProvider: React.ComponentType<{ children: ReactNode }>;
try {
  if (Platform.OS !== 'web') {
    SafeAreaProvider = require('react-native-safe-area-context').SafeAreaProvider;
  }
} catch (e) {
  // Fallback
}

// Fallback SafeAreaProvider for web
const WebSafeAreaProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <View style={{ flex: 1 }}>{children}</View>
);

const SafeProvider = Platform.OS === 'web' ? WebSafeAreaProvider : (SafeAreaProvider || WebSafeAreaProvider);

type Screen = 'home' | 'game' | 'gameOver' | 'leaderboard';

interface GameOverData {
  survivalTime: number;
  wave: number;
  kills: number;
  solEarned: number;
}

// Error Boundary for catching runtime errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>⚠️ Network Error</Text>
          <Text style={errorStyles.message}>{this.state.error?.message}</Text>
          <Text style={errorStyles.stack}>{this.state.error?.stack?.substring(0, 500)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FF4757',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  stack: {
    color: '#888',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

/**
 * Main App component - handles screen navigation
 */
function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
    showFps: false,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((loaded) => {
      if (loaded) {
        setSettings(loaded);
      }
    });
  }, []);

  // Navigation handlers
  const goToGame = useCallback(() => {
    setGameOverData(null);
    setScreen('game');
  }, []);

  const goToHome = useCallback(() => {
    setScreen('home');
  }, []);

  const goToLeaderboard = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  const handleGameOver = useCallback(
    async (survivalTime: number, wave: number, kills: number, solEarned: number) => {
      // Save to leaderboard
      const tier = getTier(survivalTime);
      await saveRun({
        id: `${Date.now()}`,
        timestamp: Date.now(),
        survivalTime,
        wave,
        kills,
        solEarned,
        tierName: tier.name,
        tierIcon: tier.icon,
      });
      
      setGameOverData({ survivalTime, wave, kills, solEarned });
      setScreen('gameOver');
    },
    []
  );

  return (
    <>
      <StatusBar style="light" />

      {screen === 'home' && (
        <HomeScreen onPlay={goToGame} onLeaderboard={goToLeaderboard} />
      )}

      {screen === 'game' && (
        <GameScreen onGameOver={handleGameOver} settings={settings} />
      )}

      {screen === 'gameOver' && gameOverData && (
        <GameOverScreen
          survivalTime={gameOverData.survivalTime}
          wave={gameOverData.wave}
          kills={gameOverData.kills}
          solEarned={gameOverData.solEarned}
          onPlayAgain={goToGame}
          onHome={goToHome}
        />
      )}

      {screen === 'leaderboard' && <LeaderboardScreen onBack={goToHome} />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeProvider>
        <AppContent />
      </SafeProvider>
    </ErrorBoundary>
  );
}
