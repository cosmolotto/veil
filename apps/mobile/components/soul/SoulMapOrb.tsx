import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing
} from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

interface SoulMapOrbProps {
  size?: number;
  color?: string;
}

export function SoulMapOrb({ size = 80, color = COLORS.accent }: SoulMapOrbProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.15, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
    opacity.value = withRepeat(withTiming(0.9, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, animStyle]}>
      <View style={[styles.inner, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, top: size * 0.25, left: size * 0.25 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)' },
});
