import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

interface VeilButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function VeilButton({ label, onPress, variant = 'primary', disabled, loading, style }: VeilButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.96, {}, () => { scale.value = withSpring(1); });
    onPress();
  };

  const bg = variant === 'primary' ? COLORS.accent
    : variant === 'secondary' ? COLORS.surface
    : 'transparent';

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={styles.label}>{label}</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
