// =============================================
// MATH TOWER WAR — Research Lab Screen
// Meta-progression upgrade system
// =============================================

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../constants/theme';
import { TR } from '../constants/strings';
import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { ResearchUpgrade } from '../types/game';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const UPGRADE_ICONS: { [key: string]: string } = {
  startingUnits: '🏰',
  productionSpeed: '⚡',
  defenseResistance: '🛡️',
};

const UPGRADE_COLORS: { [key: string]: string } = {
  startingUnits: COLORS.playerBlue,
  productionSpeed: COLORS.success,
  defenseResistance: COLORS.warning,
};

const UpgradeCard: React.FC<{
  upgrade: ResearchUpgrade;
  gold: number;
  cost: number;
  onBuy: () => void;
  index: number;
  isJustUpgraded: boolean;
}> = ({ upgrade, gold, cost, onBuy, index, isJustUpgraded }) => {
  const canAfford = gold >= cost;
  const isMaxed = upgrade.level >= upgrade.maxLevel;
  const progressPercent = (upgrade.level / upgrade.maxLevel) * 100;
  const icon = UPGRADE_ICONS[upgrade.id] || '⚙️';
  const color = UPGRADE_COLORS[upgrade.id] || COLORS.primary;
  const name = (TR as any)[upgrade.nameKey] || upgrade.nameKey;
  const description = (TR as any)[upgrade.descriptionKey] || upgrade.descriptionKey;

  // Calculate current effect
  const currentEffect = upgrade.level * upgrade.effectPerLevel;
  const nextEffect = (upgrade.level + 1) * upgrade.effectPerLevel;

  let effectDisplay = '';
  if (upgrade.id === 'startingUnits') {
    effectDisplay = `+${currentEffect} birim → +${nextEffect} birim`;
  } else if (upgrade.id === 'productionSpeed') {
    effectDisplay = `+${Math.round(currentEffect * 100)}% → +${Math.round(nextEffect * 100)}%`;
  } else if (upgrade.id === 'defenseResistance') {
    effectDisplay = `-${currentEffect} hasar → -${nextEffect} hasar`;
  }

  return (
    <Animated.View entering={FadeInUp.delay(index * 150)} style={styles.card}>
      {/* Icon & Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>
        {isJustUpgraded && (
          <Animated.View entering={FadeInUp.springify()} exiting={FadeOutUp} style={styles.upgradeEffect}>
             <Text style={[styles.upgradeEffectText, { color }]}>⬆ SEVİYE ATLADI!</Text>
          </Animated.View>
        )}
      </View>

      {/* Level Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {TR.LEVEL_LABEL} {upgrade.level}/{upgrade.maxLevel}
          </Text>
          {!isMaxed && (
            <Text style={[styles.effectText, { color }]}>{effectDisplay}</Text>
          )}
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>

      {/* Buy Button */}
      {isMaxed ? (
        <View style={styles.maxedBadge}>
          <Text style={styles.maxedText}>{TR.MAX_LEVEL} ✓</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.buyButton,
            { backgroundColor: canAfford ? color : COLORS.neutralDark },
          ]}
          onPress={onBuy}
          disabled={!canAfford}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>
            {canAfford ? `${TR.BUY} — 💰 ${cost}` : `${TR.INSUFFICIENT_GOLD} (${cost})`}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export const ResearchLab: React.FC = () => {
  const [upgradedId, setUpgradedId] = useState<string | null>(null);
  const setScreen = useGameStore((s) => s.setScreen);
  const { gold, researchUpgrades, buyUpgrade, getUpgradeCost } = useProgressStore((s) => ({
    gold: s.gold,
    researchUpgrades: s.researchUpgrades,
    buyUpgrade: s.buyUpgrade,
    getUpgradeCost: s.getUpgradeCost,
  }));

  const insets = useSafeAreaInsets();

  const handleBuy = (upgradeId: string) => {
    const success = buyUpgrade(upgradeId);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUpgradedId(upgradeId);
      setTimeout(() => setUpgradedId(null), 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => setScreen('menu')} style={styles.backButton}>
          <Text style={styles.backText}>← {TR.BACK}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>🔬 {TR.RESEARCH_TITLE}</Text>
        </View>
        <View style={styles.goldBadge}>
          <Text style={styles.goldText}>💰 {gold}</Text>
        </View>
      </Animated.View>

      {/* Upgrade Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {researchUpgrades.map((upgrade, index) => (
          <UpgradeCard
            key={upgrade.id}
            upgrade={upgrade}
            gold={gold}
            cost={getUpgradeCost(upgrade)}
            onBuy={() => handleBuy(upgrade.id)}
            index={index}
            isJustUpgraded={upgradedId === upgrade.id}
          />
        ))}

        <Text style={styles.infoText}>
          Bölüm kazandıkça altın topla, araştırmaları geliştir!
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 10,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  goldBadge: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goldText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  labDecor: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  blueprint: {
    height: 100,
    backgroundColor: 'rgba(44, 82, 130, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 82, 130, 0.2)',
    overflow: 'hidden',
  },
  blueprintLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(44, 82, 130, 0.15)',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  cardDesc: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: 'bold',
  },
  effectText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  buyButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  maxedBadge: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  maxedText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '900',
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
  upgradeEffect: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  upgradeEffectText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
