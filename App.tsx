import React, { useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from './src/store/useGameStore';
import { Tower } from './src/components/Tower';
import { EntityCard } from './src/components/EntityCard';
import { Background } from './src/components/Background';
import { FloatingText } from './src/components/FloatingText';
import { SkinPicker } from './src/components/SkinPicker';
import { COLORS, SPACING } from './src/constants/theme';
import { Trophy, RefreshCw, Cpu, Zap } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming
} from 'react-native-reanimated';

const EffectsOverlay = () => {
  const { effects, removeEffect } = useGameStore();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {effects.map(effect => (
        <FloatingText 
          key={effect.id} 
          text={effect.text} 
          x={effect.x} 
          y={effect.y} 
          onComplete={() => removeEffect(effect.id)}
        />
      ))}
    </View>
  );
};

export default function App() {
  const { 
    hero, towers, score, gold, currentLevel, isGameOver, 
    effects, isAiMode, combo,
    initLevel, resetGame, toggleAiMode, runAiStep 
  } = useGameStore();

  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    initLevel(1);
  }, []);

  // Screen Shake Trigger on Combat
  useEffect(() => {
    if (effects.length > 0) {
      shakeTranslateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [effects.length]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeTranslateX.value }],
  }));

  // AI Interval Logic
  useEffect(() => {
    let interval: any;
    if (isAiMode && !isGameOver) {
      interval = setInterval(() => {
        runAiStep();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAiMode, isGameOver]);

  // Visual Frenzy check
  const isFrenzy = combo > 4;

  if (isGameOver) {
    return (
      <View style={styles.gameOverContainer}>
        <Background />
        <Trophy size={80} color={COLORS.accent} />
        <Text style={styles.gameOverTitle}>GAME OVER</Text>
        <Text style={styles.finalScore}>Final Score: {score}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <RefreshCw color={COLORS.background} size={24} />
          <Text style={styles.resetText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Background />
      
      <Animated.View style={[styles.mainWrapper, shakeStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>MATH TOWER</Text>
            <View style={styles.levelRow}>
              <Text style={styles.headerSubtitle}>LEVEL {currentLevel}</Text>
              {isAiMode && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiText}>AD-FAIL AI</Text>
                </View>
              )}
              {isFrenzy && (
                <View style={styles.frenzyBadge}>
                  <Zap size={10} color={COLORS.background} />
                  <Text style={styles.frenzyText}>FRENZY!</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.headerRight}>
             <View style={styles.statsColumn}>
                <Text style={styles.scoreValue}>{score}</Text>
                <Text style={styles.goldValue}>💰 {gold}</Text>
             </View>
             <TouchableOpacity 
                style={[styles.aiToggle, isAiMode && { backgroundColor: COLORS.accent }]} 
                onPress={toggleAiMode}
              >
                <Cpu color={isAiMode ? COLORS.background : COLORS.textDim} size={20} />
              </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          horizontal 
          contentContainerStyle={styles.gameArea}
          showsHorizontalScrollIndicator={false}
        >
          {/* User Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.sectionLabel}>YOUR POWER</Text>
            <EntityCard entity={hero} isHero />
            {combo > 1 && (
              <View style={[styles.comboBanner, isFrenzy && { backgroundColor: COLORS.accent }]}>
                <Text style={[styles.comboText, isFrenzy && { color: COLORS.background }]}>
                  x{combo} COMBO
                </Text>
              </View>
            )}
          </View>

          {/* Towers Section */}
          <View style={styles.towersSection}>
            {towers.map((tower) => (
              <Tower key={tower.id} tower={tower} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Footer / Shop */}
      <View style={styles.footer}>
        <SkinPicker />
      </View>

      <EffectsOverlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsColumn: {
    alignItems: 'flex-end',
    marginRight: SPACING.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadge: {
    backgroundColor: COLORS.enemy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  frenzyBadge: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  frenzyText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 2,
  },
  comboBanner: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  comboText: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 14,
  },
  aiText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '900',
  },
  aiToggle: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  goldValue: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameArea: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  heroSection: {
    marginRight: SPACING.xl,
    alignItems: 'center',
  },
  sectionLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  towersSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    zIndex: 10,
  },
  gameOverContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  gameOverTitle: {
    color: COLORS.enemy,
    fontSize: 48,
    fontWeight: '900',
    marginTop: SPACING.lg,
    zIndex: 10,
  },
  finalScore: {
    color: COLORS.text,
    fontSize: 20,
    marginTop: SPACING.md,
    zIndex: 10,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    marginTop: SPACING.xl,
    alignItems: 'center',
    zIndex: 10,
  },
  resetText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});
