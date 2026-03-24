import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { Cloud } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CloudItem = ({ delay, top, size, speed }: { delay: number, top: number, size: number, speed: number }) => {
  const offset = useSharedValue(-size);

  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(width + size, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    opacity: 0.1,
    position: 'absolute',
    top: top,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Cloud size={size} color={COLORS.text} />
    </Animated.View>
  );
};

export const Background = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <CloudItem delay={0} top={100} size={100} speed={40000} />
      <CloudItem delay={5000} top={250} size={60} speed={30000} />
      <CloudItem delay={2000} top={400} size={150} speed={60000} />
      <CloudItem delay={8000} top={550} size={80} speed={35000} />
    </View>
  );
};
