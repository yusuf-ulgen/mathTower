import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGameStore } from './src/store/useGameStore';
import { COLORS, SPACING } from './src/constants/theme';
import { GameArea } from './src/components/GameArea';
import { ShopScreen } from './src/components/ShopScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { QuestModal } from './src/components/QuestModal';
import { LuckyWheelModal } from './src/components/LuckyWheelModal';
import Animated, { FadeIn, FadeOut, withRepeat, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Trophy, Disc } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const { 
    activeTab, 
    isLevelStarted, 
    initLevel, 
    loadProgress,
    gold,
    stats,
    setGameMode,
  } = useGameStore((state: any) => ({
    activeTab: state.activeTab,
    isLevelStarted: state.isLevelStarted,
    initLevel: state.initLevel,
    loadProgress: state.loadProgress,
    gold: state.gold,
    stats: state.stats,
    setGameMode: state.setGameMode,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [questModalVisible, setQuestModalVisible] = useState(false);
  const [wheelVisible, setWheelVisible] = useState(false);
  const [showGameChoice, setShowGameChoice] = useState(false);

  const glowValue = useSharedValue(0.5);

  useEffect(() => {
    const init = async () => {
      await loadProgress();
      setIsLoading(false);
    };
    init();

    glowValue.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const canSpin = Date.now() - (stats?.lastWheelSpin || 0) > 24 * 60 * 60 * 1000;

  const glowStyle = useAnimatedStyle(() => ({
    opacity: canSpin ? glowValue.value : 0.4,
    transform: [{ scale: canSpin ? 1 + (glowValue.value * 0.1) : 1 }]
  }));

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
            {/* Lucky Wheel Trigger */}
            <TouchableOpacity 
              style={styles.wheelTrigger} 
              onPress={() => setWheelVisible(true)}
            >
              <Animated.View style={[styles.wheelGlow, glowStyle]}>
                <Disc color={COLORS.primary} size={32} />
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.title}>MATH TOWER</Text>
            <Text style={styles.subtitle}>BÖLÜMLERİ FETHET!</Text>
            
            {!showGameChoice ? (
              <TouchableOpacity style={styles.playButton} onPress={() => setShowGameChoice(true)}>
                <Text style={styles.playButtonText}>BAŞLA</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.choiceContainer}>
                <TouchableOpacity 
                  style={styles.choiceButton} 
                  onPress={() => {
                    setGameMode('normal');
                    initLevel();
                    setShowGameChoice(false);
                  }}
                >
                  <Text style={styles.choiceButtonText}>NORMAL OYUN</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.choiceButton, styles.weeklyButton]} 
                  onPress={() => {
                    setGameMode('weekly');
                    initLevel();
                    setShowGameChoice(false);
                  }}
                >
                  <Text style={styles.choiceButtonText}>HAFTALIK CHALLENGE</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowGameChoice(false)}>
                  <Text style={styles.cancelText}>VAZGEÇ</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.questButton} 
              onPress={() => setQuestModalVisible(true)}
            >
              <Trophy color={COLORS.primary} size={20} />
              <Text style={styles.questButtonText}>GÖREVLER</Text>
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
      <QuestModal 
        visible={questModalVisible} 
        onClose={() => setQuestModalVisible(false)} 
      />
      <LuckyWheelModal 
        visible={wheelVisible} 
        onClose={() => setWheelVisible(false)} 
      />
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
    marginBottom: 20,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  questButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  questButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  wheelTrigger: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  wheelGlow: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  choiceContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  choiceButton: {
    backgroundColor: COLORS.primary,
    width: width * 0.7,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  weeklyButton: {
    backgroundColor: COLORS.accent,
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.background,
  },
  cancelText: {
    color: '#64748B',
    marginTop: 10,
    fontWeight: 'bold',
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
