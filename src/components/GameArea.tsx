import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { Tower } from './Tower';
import { RushAnimation } from './RushAnimation';
import { JokerBar } from './JokerBar';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const GameArea: React.FC = () => {
  const {
    playerTower,
    enemyTowers,
    timeLeft,
    isGameOver,
    isLevelCleared,
    currentLevel,
    gold,
    difficulty,
    resetGame,
    initLevel,
    tick,
    goToMenu
  } = useGameStore((state: any) => ({
    playerTower: state.playerTower,
    enemyTowers: state.enemyTowers,
    timeLeft: state.timeLeft,
    isGameOver: state.isGameOver,
    isLevelCleared: state.isLevelCleared,
    currentLevel: state.currentLevel,
    gold: state.gold,
    difficulty: state.difficulty,
    resetGame: state.resetGame,
    initLevel: state.initLevel,
    tick: state.tick,
    goToMenu: state.goToMenu,
  }));

  useEffect(() => {
    initLevel();
    const interval = setInterval(() => tick(), 100);
    return () => clearInterval(interval);
  }, []);

  const isLowTime = timeLeft < 5 && timeLeft > 0;

  return (
    <View style={styles.container}>
      {isLowTime && <View style={styles.vignette} />}

      <View style={styles.header}>
        <View>
          <Text style={styles.levelLabel}>BÖLÜM {currentLevel}</Text>
          <Text style={styles.difficultyLabel}>{difficulty.toUpperCase()}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isLowTime && styles.lowTimeText]}>
            {Math.ceil(timeLeft)}s
          </Text>
        </View>

        <View style={styles.goldContainer}>
          <Text style={styles.goldText}>💰 {gold}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.gameArea}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.towersWrapper}>
          <Tower tower={playerTower} />
          {enemyTowers.map((tower: any) => (
            <Tower key={tower.id} tower={tower} />
          ))}
          <RushAnimation />
        </View>
      </ScrollView>

      {/* Game Over Message Overlay */}
      {isGameOver && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Text style={styles.gameOverText}>OYUN BİTTİ!</Text>
          <TouchableOpacity style={styles.mainButton} onPress={resetGame}>
            <Text style={styles.mainButtonText}>TEKRAR DENE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={goToMenu}>
            <Text style={styles.secondaryButtonText}>MENÜYE DÖN</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Level Complete Overlay */}
      {isLevelCleared && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Text style={styles.winText}>BÖLÜM TAMAMLANDI!</Text>
          <Text style={styles.goldBonus}>+{Math.floor(timeLeft * (difficulty === 'easy' ? 1 : difficulty === 'normal' ? 3 : 7))} Altın Bonus!</Text>

          <TouchableOpacity style={styles.mainButton} onPress={initLevel}>
            <Text style={styles.mainButtonText}>SONRAKİ BÖLÜM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={goToMenu}>
            <Text style={styles.secondaryButtonText}>MENÜYE DÖN</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Joker Bar (Only visible if level started and not over) */}
      {!isGameOver && !isLevelCleared && <JokerBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  levelLabel: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  difficultyLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lowTimeText: {
    color: COLORS.enemy,
  },
  goldContainer: {
    alignItems: 'flex-end',
  },
  goldText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FCD34D',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 60,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    zIndex: 5,
    pointerEvents: 'none',
  },
  gameArea: {
    flexGrow: 1,
    paddingVertical: 100,
    alignItems: 'center',
  },
  towersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: width,
    justifyContent: 'center',
    paddingHorizontal: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.enemy,
    marginBottom: 30,
  },
  winText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.player,
    marginBottom: 10,
  },
  goldBonus: {
    fontSize: 20,
    color: '#FCD34D',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 15,
    width: 250,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: 250,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});