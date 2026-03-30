import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing
} from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

export default function VeilTab() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // CLAUDE_REVIEW: Wire up connections in Phase 2
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orb, animStyle]} />
      <Text style={styles.text}>
        Your resonance engine activates after {'\n'}7 days of responses.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 40 },
  orb: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, opacity: 0.3, marginBottom: 32 },
  text: { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 26 },
});
