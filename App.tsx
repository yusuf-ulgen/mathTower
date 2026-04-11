// =============================================
// MATH TOWER WAR — App Entry Point
// =============================================

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGameStore } from './src/store/useGameStore';
import { useProgressStore } from './src/store/useProgressStore';
import { MainMenu } from './src/screens/MainMenu';
import { LevelMap } from './src/screens/LevelMap';
import { ResearchLab } from './src/screens/ResearchLab';
import { BattleScreen } from './src/screens/BattleScreen';
import { COLORS } from './src/constants/theme';
import { TR } from './src/constants/strings';

export default function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const loadProgress = useProgressStore((state) => state.loadProgress);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadProgress();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.loadingTitle}>{TR.GAME_TITLE}</Text>
        <Text style={styles.loadingSubtitle}>{TR.LOADING}</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'levelMap':
        return <LevelMap />;
      case 'researchLab':
        return <ResearchLab />;
      case 'battle':
        return <BattleScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  loadingSubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    marginTop: 12,
  },
});
