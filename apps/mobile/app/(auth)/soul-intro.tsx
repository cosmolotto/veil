import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';

function PulsingOrb() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.orb, { transform: [{ scale }], opacity }]}>
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
  orb: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.accent, marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  orbInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 20, textAlign: 'center' },
  body: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 24, marginBottom: 56 },
  btn: { width: '100%' },
});
