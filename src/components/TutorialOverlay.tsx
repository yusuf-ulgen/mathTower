import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/theme';
import { TR } from '../constants/strings';

const { width } = Dimensions.get('window');

interface Props {
  onClose: () => void;
}

export const TutorialOverlay: React.FC<Props> = ({ onClose }) => {
  return (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={styles.container}
    >
      <Animated.View 
        entering={SlideInUp.duration(600)} 
        style={styles.content}
      >
        <Text style={styles.title}>{TR.TUTORIAL_TITLE}</Text>
        
        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepIcon}>🏰</Text>
            <Text style={styles.stepText}>{TR.TUTORIAL_STEP_1}</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepIcon}>⚔️</Text>
            <Text style={styles.stepText}>{TR.TUTORIAL_STEP_2}</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepIcon}>🔝</Text>
            <Text style={styles.stepText}>{TR.TUTORIAL_STEP_3}</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepIcon}>✖️</Text>
            <Text style={styles.stepText}>{TR.TUTORIAL_STEP_4}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{TR.TUTORIAL_GOT_IT}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: SPACING.xl,
  },
  content: {
    backgroundColor: COLORS.surface,
    width: width * 0.85,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
    letterSpacing: 2,
  },
  steps: {
    width: '100%',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  stepText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '900',
  },
});
