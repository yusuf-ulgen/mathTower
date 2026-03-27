import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from './src/store/useGameStore';
import { COLORS, SPACING } from './src/constants/theme';
import { GameArea } from './src/components/GameArea';
import { ShopScreen } from './src/components/ShopScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function App() {
  const { 
    activeTab, 
    isLevelStarted, 
    initLevel, 
    loadProgress,
    gold
  } = useGameStore((state: any) => ({
    activeTab: state.activeTab,
    isLevelStarted: state.isLevelStarted,
    initLevel: state.initLevel,
    loadProgress: state.loadProgress,
    gold: state.gold,
  }));

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
        <Text style={styles.loadingText}>MATH TOWER</Text>
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'shop':
        return <ShopScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'game':
        if (isLevelStarted) {
          return <GameArea />;
        }
        return (
          <View style={styles.menuContainer}>
            <Text style={styles.title}>MATH TOWER</Text>
            <Text style={styles.subtitle}>BÖLÜMLERİ FETHET!</Text>
            
            <TouchableOpacity style={styles.playButton} onPress={initLevel}>
              <Text style={styles.playButtonText}>BAŞLA</Text>
            </TouchableOpacity>

            <View style={styles.statsContainer}>
              <Text style={styles.goldLabel}>MEVCUT ALTIN: 💰 {gold}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // User want: nav bar hides when game starts, but stays in shop/settings
  const showNavBar = !isLevelStarted || activeTab !== 'game';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {renderContent()}
      </View>
      {showNavBar && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <BottomNavBar />
        </Animated.View>
      )}
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
  loadingText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 50,
    letterSpacing: 4,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 80,
    paddingVertical: 20,
    borderRadius: 40,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  statsContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  goldLabel: {
    color: '#FCD34D',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
