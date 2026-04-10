import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../lib/constants';

interface SoulMapOrbProps {
  size?: number;
  color?: string;
}

export function SoulMapOrb({ size = 80, color = COLORS.accent }: SoulMapOrbProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: 2200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 2200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 2200, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, { transform: [{ scale }], opacity }]}>
      <View style={[styles.inner, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, top: size * 0.25, left: size * 0.25 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)' },
});
