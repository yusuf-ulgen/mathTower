import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { X, ArrowDown } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDecay,
  runOnJS,
  useDerivedValue,
  cancelAnimation,
  FadeInUp
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;

const REWARDS = [
  { id: 1, type: 'gold', amount: 50, label: '50 💰' },
  { id: 2, type: 'joker', jokerType: 'timeFreeze', amount: 1, label: '⏱️ Freeze' },
  { id: 3, type: 'gold', amount: 100, label: '100 💰' },
  { id: 4, type: 'joker', jokerType: 'shield', amount: 1, label: '🛡️ Shield' },
  { id: 5, type: 'joker', jokerType: 'weaken', amount: 1, label: '⚔️ Weaken' },
  { id: 6, type: 'gold', amount: 1000, label: '1000 💰' }, // Jackpot
  { id: 7, type: 'gold', amount: 25, label: '25 💰' },
  { id: 8, type: 'gold', amount: 200, label: '200 💰' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LuckyWheelModal: React.FC<Props> = ({ visible, onClose }) => {
  const { spinWheelReward, stats } = useGameStore((state: any) => ({
    spinWheelReward: state.spinWheelReward,
    stats: state.stats
  }));

  const rotation = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const [result, setResult] = useState<any>(null);
  const [showMessage, setShowMessage] = useState(true);

  const SEGMENT_ANGLE = 360 / REWARDS.length;

  const handleReward = (finalRotation: number) => {
    'worklet';
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;
    // The arrow is at the top (0 deg). 
    // Wheel rotates clockwise. Segment 1 is at 0-45 index 0.
    // Index increases clockwise.
    const index = Math.floor(normalizedRotation / SEGMENT_ANGLE);
    const rewardIndex = (REWARDS.length - index) % REWARDS.length;
    const reward = REWARDS[rewardIndex];
    
    runOnJS(finalizeReward)(reward);
  };

  const finalizeReward = (reward: any) => {
    setResult(reward);
    spinWheelReward(reward.type, reward.amount, reward.jokerType);
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      if (isSpinning.value) return;
      cancelAnimation(rotation);
      runOnJS(setShowMessage)(false);
    })
    .onUpdate((event) => {
      if (isSpinning.value) return;
      rotation.value += event.velocityX / 50; 
    })
    .onEnd((event) => {
      if (isSpinning.value) return;
      isSpinning.value = true;
      
      rotation.value = withDecay({
        velocity: event.velocityX / 10,
        clamp: undefined,
      }, (finished) => {
        if (finished) {
          isSpinning.value = false;
          handleReward(rotation.value);
        }
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  const canSpin = Date.now() - stats.lastWheelSpin > 24 * 60 * 60 * 1000;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>ŞANS ÇARKINI ÇEVİR!</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={COLORS.text} size={24} />
              </TouchableOpacity>
            </View>

            {showMessage && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>Eliyle çarkı hızla kaydırarak çevir! 🎡</Text>
              </View>
            )}

            <View style={styles.wheelContainer}>
              <View style={styles.arrowContainer}>
                <ArrowDown color={COLORS.primary} size={40} />
              </View>
              
              <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.wheel, animatedStyle]}>
                  {REWARDS.map((reward, i) => (
                    <View key={reward.id} style={[
                      styles.segment, 
                      { 
                        transform: [
                          { rotate: `${i * SEGMENT_ANGLE}deg` },
                          { translateY: -WHEEL_SIZE / 4 }
                        ] 
                      }
                    ]}>
                      <Text style={styles.segmentText}>{reward.label}</Text>
                    </View>
                  ))}
                  {/* Decorative lines */}
                  {REWARDS.map((_, i) => (
                    <View key={i} style={[
                      styles.line, 
                      { transform: [{ rotate: `${i * SEGMENT_ANGLE + SEGMENT_ANGLE/2}deg` }] }
                    ]} />
                  ))}
                </Animated.View>
              </GestureDetector>
            </View>

            {result && (
              <Animated.View entering={FadeInUp} style={styles.resultCard}>
                <Text style={styles.resultTitle}>TEBRİKLER!</Text>
                <Text style={styles.resultReward}>{result.label} kazandın!</Text>
                <TouchableOpacity onPress={onClose} style={styles.okButton}>
                  <Text style={styles.okButtonText}>HARİKA</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {!canSpin && !result && (
              <View style={styles.waitContainer}>
                <Text style={styles.waitText}>Bir sonraki çevirme için 24 saat beklemen gerekiyor.</Text>
              </View>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 40,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  hintContainer: {
    position: 'absolute',
    top: 100,
    zIndex: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  arrowContainer: {
    position: 'absolute',
    top: -30,
    zIndex: 20,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
  },
  segmentText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    transform: [{ rotate: '0deg' }], // Keep text orientation? No, it rotates with segment.
  },
  line: {
    position: 'absolute',
    width: 2,
    height: WHEEL_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: 0,
  },
  resultCard: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 24,
    width: '100%',
  },
  resultTitle: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultReward: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
  },
  okButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  waitContainer: {
    marginTop: 20,
    padding: 16,
  },
  waitText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  }
});
