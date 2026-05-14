// =============================================
// MATH TOWER WAR — Main Menu Screen
// Epic war-themed menu with torch effects
// =============================================

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Modal } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LayoutGrid, X } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { TR } from '../constants/strings';
import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { redirectToDeveloperProfile } from '../utils/updateManager';

const { width, height } = Dimensions.get('window');

export const MainMenu: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const { gold, currentLevel } = useProgressStore((s) => ({
    gold: s.gold,
    currentLevel: s.currentLevel,
  }));
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  const titleGlow = useSharedValue(0.7);
  const torchFlicker1 = useSharedValue(1);
  const torchFlicker2 = useSharedValue(1);
  const dustFloat = useSharedValue(0);

  useEffect(() => {
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    torchFlicker1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(0.8, { duration: 300 }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      true
    );
    torchFlicker2.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 300 }),
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 250 })
      ),
      -1,
      true
    );
    dustFloat.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const titleGlowStyle = useAnimatedStyle(() => ({
    opacity: titleGlow.value,
    textShadowRadius: 20 * titleGlow.value,
  }));

  const torch1Style = useAnimatedStyle(() => ({
    transform: [{ scale: torchFlicker1.value }],
    opacity: 0.4 + torchFlicker1.value * 0.3,
  }));

  const torch2Style = useAnimatedStyle(() => ({
    transform: [{ scale: torchFlicker2.value }],
    opacity: 0.4 + torchFlicker2.value * 0.3,
  }));

  return (
    <View style={styles.container}>
      {/* Developer Button */}
      <TouchableOpacity
        style={styles.developerButton}
        onPress={() => setShowDeveloperModal(true)}
        activeOpacity={0.7}
      >
        <LayoutGrid color={COLORS.primary} size={28} />
      </TouchableOpacity>

      {/* Background castle silhouette */}
      <View style={styles.castleBg}>
        <View style={styles.castleWall} />
        <View style={styles.castleTower1} />
        <View style={styles.castleTower2} />
        <View style={styles.castleTower3} />
      </View>

      {/* Dust particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dustParticle,
            {
              left: (i * 47 + 20) % width,
              top: 100 + ((i * 89 + 30) % (height - 300)),
              opacity: 0.2 + (i % 3) * 0.1,
            },
          ]}
        />
      ))}

      {/* Torches */}
      <Animated.View style={[styles.torch, styles.torchLeft, torch1Style]} />
      <Animated.View style={[styles.torch, styles.torchRight, torch2Style]} />

      {/* Title */}
      <Animated.View entering={FadeInDown.duration(1000).delay(200)} style={styles.titleContainer}>
        <Animated.Text style={[styles.title, titleGlowStyle]}>
          {TR.GAME_TITLE}
        </Animated.Text>
        <Text style={styles.subtitle}>{TR.GAME_SUBTITLE}</Text>
      </Animated.View>

      {/* Level indicator */}
      <Animated.View entering={FadeIn.delay(500)} style={styles.levelIndicator}>
        <Text style={styles.levelText}>{TR.CURRENT_LEVEL}: {currentLevel}</Text>
      </Animated.View>

      {/* Main Buttons */}
      <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.buttonsContainer}>
        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            const store = useGameStore.getState();
            const progressStore = useProgressStore.getState();
            store.startLevel(progressStore.currentLevel, progressStore.getStartingUnitsBonus());
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.playIcon}>⚔️</Text>
          <Text style={styles.playButtonText}>{TR.PLAY}</Text>
        </TouchableOpacity>

        {/* Level Map Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setScreen('levelMap')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>🗺️</Text>
          <Text style={styles.menuButtonText}>{TR.LEVELS}</Text>
        </TouchableOpacity>

        {/* Research Lab Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setScreen('researchLab')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>🔬</Text>
          <Text style={styles.menuButtonText}>{TR.RESEARCH_LAB}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Gold Display */}
      <Animated.View entering={FadeIn.delay(800)} style={styles.goldContainer}>
        <Text style={styles.goldText}>💰 {gold} {TR.GOLD_LABEL}</Text>
      </Animated.View>

      {/* Developer Modal */}
      <Modal visible={showDeveloperModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp} style={styles.developerModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDeveloperModal(false)}
            >
              <X color={COLORS.textDim} size={24} />
            </TouchableOpacity>

            <View style={styles.modalIconContainer}>
              <LayoutGrid color={COLORS.primary} size={48} />
            </View>

            <Text style={styles.modalTitle}>BU OYUNU BEĞENDİNİZ Mİ?</Text>
            <Text style={styles.modalSubtitle}>
              Benzer oyunlar ve içerikler için yapımcının diğer uygulamalarına göz atmak ister misiniz?
            </Text>

            <View style={styles.modalActionContainer}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.cancelBtn]}
                onPress={() => setShowDeveloperModal(false)}
              >
                <Text style={styles.cancelBtnText}>VAZGEÇ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, styles.confirmBtn]}
                onPress={() => {
                  redirectToDeveloperProfile();
                  setShowDeveloperModal(false);
                }}
              >
                <Text style={styles.confirmBtnText}>GÖZ AT</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  developerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  castleBg: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 0.4,
    opacity: 0.06,
  },
  castleWall: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 100,
    backgroundColor: COLORS.text,
  },
  castleTower1: {
    position: 'absolute',
    bottom: 100,
    left: width * 0.15,
    width: 40,
    height: 120,
    backgroundColor: COLORS.text,
  },
  castleTower2: {
    position: 'absolute',
    bottom: 100,
    left: width * 0.5 - 25,
    width: 50,
    height: 160,
    backgroundColor: COLORS.text,
  },
  castleTower3: {
    position: 'absolute',
    bottom: 100,
    right: width * 0.15,
    width: 40,
    height: 130,
    backgroundColor: COLORS.text,
  },
  dustParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  torch: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF8C00',
  },
  torchLeft: {
    top: height * 0.25,
    left: 30,
  },
  torchRight: {
    top: height * 0.25,
    right: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 6,
    marginTop: 8,
    opacity: 0.6,
  },
  levelIndicator: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 40,
  },
  levelText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: width * 0.75,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  playIcon: {
    fontSize: 24,
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.background,
    letterSpacing: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    width: width * 0.75,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
  },
  goldContainer: {
    marginTop: 40,
    backgroundColor: 'rgba(252, 211, 77, 0.08)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.15)',
  },
  goldText: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  developerModal: {
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textBright,
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalActionContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtnText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtnText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
  },
});
