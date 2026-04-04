import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing
} from 'react-native-reanimated';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';

function PulsingOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    opacity.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.orb, animStyle]}>
      <View style={styles.orbInner} />
    </Animated.View>
  );
}

export default function SoulIntro() {
  const router = useRouter();
  const { alias, referral_code } = useLocalSearchParams<{ alias: string; referral_code?: string }>();

  return (
    <View style={styles.container}>
      <PulsingOrb />
      <Text style={styles.heading}>Your Soul Map</Text>
      <Text style={styles.body}>
        As you respond, VEIL builds a private map of your emotional world.
        It never reads your words — only the feeling beneath them.
        It uses this to find people who resonate with you.
      </Text>
      <VeilButton
        label="Interesting"
        onPress={() => router.push({ pathname: '/(auth)/privacy-promise', params: { alias, referral_code } })}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.accent, opacity: 0.7, marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  orbInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 20, textAlign: 'center' },
  body: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 24, marginBottom: 56 },
  btn: { width: '100%' },
});
