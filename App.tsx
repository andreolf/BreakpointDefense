/**
 * Solana Breakpoint Defense
 * A hypercasual tower defense game
 */

import React, { useState, useCallback } from 'react';
import { StatusBar, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { GameState } from './src/game/types';
import { COLORS } from './src/game/config';

type Screen = 'home' | 'game' | 'gameover' | 'leaderboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [lastGameState, setLastGameState] = useState<GameState | null>(null);

  const handlePlay = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleGameOver = useCallback((state: GameState) => {
    setLastGameState(state);
    setCurrentScreen('gameover');
  }, []);

  const handleQuit = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bgDark }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        
        {currentScreen === 'home' && (
          <HomeScreen onPlay={handlePlay} onLeaderboard={handleLeaderboard} />
        )}
        
        {currentScreen === 'game' && (
          <GameScreen onGameOver={handleGameOver} onQuit={handleQuit} />
        )}
        
        {currentScreen === 'gameover' && lastGameState && (
          <GameOverScreen
            gameState={lastGameState}
            onPlayAgain={handlePlayAgain}
            onHome={handleBackToHome}
          />
        )}
        
        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen onBack={handleBackToHome} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
