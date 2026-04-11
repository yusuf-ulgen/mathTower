// =============================================
// MATH TOWER WAR — Battle Screen
// Real-time tower defense gameplay
// =============================================

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/theme';
import { TR } from '../constants/strings';
import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { BattleTower } from '../components/BattleTower';
import { UnitQueue } from '../components/UnitQueue';
import { AttackLines } from '../components/AttackLine';
import { Background } from '../components/Background';
import { MathGateView } from '../components/MathGateView';
import { ArtilleryView } from '../components/ArtilleryView';
import { DragonDenView } from '../components/DragonDenView';
import { HazardOverlay } from '../components/HazardOverlay';
import { getTowerUpgradeCost } from '../engine/gameEngine';
import { calculateStars } from '../engine/gameEngine';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TICK_INTERVAL = 50; // 20 fps game logic

export const BattleScreen: React.FC = () => {
  const {
    towers,
    paths,
    movingUnits,
    artillery,
    dragonDens,
    activeHazards,
    isPlaying,
    isPaused,
    isVictory,
    isDefeat,
    elapsedTime,
    goldEarned,
    selectedLevel,
    levelConfig,
    sendAttack,
    upgradeTower,
    disableArtillery,
    tick,
    pauseGame,
    resumeGame,
    endBattle,
    setScreen,
    startLevel,
  } = useGameStore((state) => ({
    towers: state.towers,
    paths: state.paths,
    movingUnits: state.movingUnits,
    artillery: state.artillery,
    dragonDens: state.dragonDens,
    activeHazards: state.activeHazards,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isVictory: state.isVictory,
    isDefeat: state.isDefeat,
    elapsedTime: state.elapsedTime,
    goldEarned: state.goldEarned,
    selectedLevel: state.selectedLevel,
    levelConfig: state.levelConfig,
    sendAttack: state.sendAttack,
    upgradeTower: state.upgradeTower,
    disableArtillery: state.disableArtillery,
    tick: state.tick,
    pauseGame: state.pauseGame,
    resumeGame: state.resumeGame,
    endBattle: state.endBattle,
    setScreen: state.setScreen,
    startLevel: state.startLevel,
  }));

  const { getProductionBonus, getArtilleryResistance, completeLevel, getStartingUnitsBonus } =
    useProgressStore((s) => ({
      getProductionBonus: s.getProductionBonus,
      getArtilleryResistance: s.getArtilleryResistance,
      completeLevel: s.completeLevel,
      getStartingUnitsBonus: s.getStartingUnitsBonus,
    }));

  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const prodBonus = getProductionBonus();
      const artResist = getArtilleryResistance();

      tickRef.current = setInterval(() => {
        tick(TICK_INTERVAL / 1000, prodBonus, artResist);
      }, TICK_INTERVAL);
    }

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isPlaying, isPaused]);

  // Handle victory
  useEffect(() => {
    if (isVictory && levelConfig) {
      const stars = calculateStars(elapsedTime, levelConfig.starThresholds);
      completeLevel(selectedLevel, stars, goldEarned, elapsedTime);
    }
  }, [isVictory]);

  // Tower tap handler
  const handleTowerTap = (towerId: string) => {
    const tower = towers.find((t) => t.id === towerId);
    if (!tower) return;

    if (tower.color === 'blue') {
      if (selectedTowerId === towerId) {
        // Double tap own tower = upgrade
        upgradeTower(towerId);
        setSelectedTowerId(null);
      } else {
        // Select own tower
        setSelectedTowerId(towerId);
      }
    } else {
      // Tap enemy tower while own tower selected = attack
      if (selectedTowerId) {
        sendAttack(selectedTowerId, towerId);
        setSelectedTowerId(null);
      }
    }
  };

  const handleTowerLongPress = (towerId: string) => {
    const tower = towers.find((t) => t.id === towerId);
    if (tower && tower.color === 'blue') {
      upgradeTower(towerId);
    }
  };

  const playerTowers = towers.filter((t) => t.color === 'blue');
  const stars = levelConfig ? calculateStars(elapsedTime, levelConfig.starThresholds) : 0;
  const hasNight = activeHazards.includes('nightMode');

  // All gates from all paths
  const allGates = paths.flatMap((p) => p.gates);

  return (
    <View style={styles.container}>
      {/* HUD Header */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Text style={styles.levelLabel}>{TR.LEVEL} {selectedLevel}</Text>
          {levelConfig && selectedLevel % 10 === 0 && selectedLevel >= 10 && (
            <Text style={styles.bossTag}>👑 {TR.BOSS_LEVEL}</Text>
          )}
        </View>

        <View style={styles.hudCenter}>
          <Text style={styles.timeText}>{Math.floor(elapsedTime)}s</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Text key={s} style={[styles.starIcon, elapsedTime <= (levelConfig?.starThresholds[s === 1 ? 'oneStar' : s === 2 ? 'twoStar' : 'threeStar'] || 999) && styles.starActive]}>
                ★
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => (isPaused ? resumeGame() : pauseGame())}
        >
          <Text style={styles.pauseText}>{isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
      </View>

      {/* Hazard indicators */}
      {activeHazards.length > 0 && (
        <View style={styles.hazardBar}>
          {activeHazards.map((h) => (
            <View key={h} style={styles.hazardBadge}>
              <Text style={styles.hazardText}>
                {h === 'nightMode' ? `🌙 ${TR.NIGHT_MODE}` : `❄️ ${TR.ICY_GROUND}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Battlefield */}
      <View style={styles.battlefield}>
        <Background />
        
        {/* SVG Attack Lines */}
        <AttackLines />

        {/* Math Gates */}
        {allGates.map((gate) => (
          <MathGateView key={gate.id} gate={gate} />
        ))}

        {/* Artillery */}
        {artillery.map((art) => (
          <ArtilleryView
            key={art.id}
            artillery={art}
            onDisable={disableArtillery}
          />
        ))}

        {/* Dragon Dens */}
        {dragonDens.map((den) => (
          <DragonDenView key={den.id} den={den} />
        ))}

        {/* Towers */}
        {towers.map((tower) => (
          <BattleTower
            key={tower.id}
            tower={tower}
            onTap={handleTowerTap}
            onLongPress={handleTowerLongPress}
            isSelected={selectedTowerId === tower.id}
            isNightHidden={
              hasNight &&
              tower.color !== 'blue' &&
              !playerTowers.some((pt) => {
                const dx = pt.position.x - tower.position.x;
                const dy = pt.position.y - tower.position.y;
                return Math.sqrt(dx * dx + dy * dy) < 120;
              })
            }
          />
        ))}

        {/* Moving Units */}
        <UnitQueue />

        {/* Hazard overlays */}
        <HazardOverlay hazards={activeHazards} playerTowers={playerTowers} />
      </View>

      {/* Selection hint */}
      {selectedTowerId && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.selectionHint}>
          <Text style={styles.selectionHintText}>
            🎯 Saldırmak için düşman kaleye dokun
          </Text>
          <TouchableOpacity onPress={() => setSelectedTowerId(null)}>
            <Text style={styles.cancelSelection}>{TR.CANCEL}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Text style={styles.overlayTitle}>{TR.PAUSE}</Text>
          <TouchableOpacity style={styles.overlayButton} onPress={resumeGame}>
            <Text style={styles.overlayButtonText}>{TR.RESUME}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.overlayButton, styles.secondaryBtn]}
            onPress={() => {
              endBattle();
              setScreen('menu');
            }}
          >
            <Text style={styles.secondaryBtnText}>{TR.BACK_TO_MENU}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Victory Overlay */}
      {isVictory && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Text style={styles.victoryTitle}>{TR.VICTORY}</Text>
          <Text style={styles.victorySubtitle}>{TR.LEVEL_COMPLETE}</Text>

          <View style={styles.victoryStars}>
            {[1, 2, 3].map((s) => (
              <Animated.Text
                key={s}
                entering={FadeInUp.delay(s * 300)}
                style={[styles.victoryStar, s <= stars && styles.victoryStarEarned]}
              >
                ★
              </Animated.Text>
            ))}
          </View>

          <View style={styles.victoryStats}>
            <Text style={styles.victoryGold}>💰 +{goldEarned} {TR.GOLD_LABEL}</Text>
            <Text style={styles.victoryTime}>⏱ {Math.floor(elapsedTime)}s</Text>
          </View>

          <TouchableOpacity
            style={styles.overlayButton}
            onPress={() => {
              startLevel(selectedLevel + 1, getStartingUnitsBonus());
            }}
          >
            <Text style={styles.overlayButtonText}>{TR.NEXT_LEVEL}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.overlayButton, styles.secondaryBtn]}
            onPress={() => {
              endBattle();
              setScreen('menu');
            }}
          >
            <Text style={styles.secondaryBtnText}>{TR.BACK_TO_MENU}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Defeat Overlay */}
      {isDefeat && (
        <Animated.View entering={FadeIn} style={styles.overlay}>
          <Text style={styles.defeatTitle}>{TR.DEFEAT}</Text>
          <Text style={styles.defeatSubtitle}>{TR.GAME_OVER}</Text>

          <TouchableOpacity
            style={styles.overlayButton}
            onPress={() => {
              startLevel(selectedLevel, getStartingUnitsBonus());
            }}
          >
            <Text style={styles.overlayButtonText}>{TR.RETRY}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.overlayButton, styles.secondaryBtn]}
            onPress={() => {
              endBattle();
              setScreen('menu');
            }}
          >
            <Text style={styles.secondaryBtnText}>{TR.BACK_TO_MENU}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 48,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
  },
  hudLeft: {
    flex: 1,
  },
  levelLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  bossTag: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  hudCenter: {
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  starIcon: {
    fontSize: 14,
    color: COLORS.neutralDark,
  },
  starActive: {
    color: COLORS.gold,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 18,
    color: COLORS.text,
  },
  hazardBar: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 45,
  },
  hazardBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hazardText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  battlefield: {
    flex: 1,
    position: 'relative',
  },
  selectionHint: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  selectionHintText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelSelection: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: SPACING.xl,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 20,
  },
  overlayButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    width: 250,
    alignItems: 'center',
  },
  overlayButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.background,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  victoryTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  victorySubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 20,
  },
  victoryStars: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  victoryStar: {
    fontSize: 40,
    color: COLORS.neutralDark,
  },
  victoryStarEarned: {
    color: COLORS.gold,
  },
  victoryStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  victoryGold: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  victoryTime: {
    color: COLORS.textDim,
    fontSize: 18,
    fontWeight: 'bold',
  },
  defeatTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.danger,
    marginBottom: 10,
  },
  defeatSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDim,
    marginBottom: 30,
  },
});
