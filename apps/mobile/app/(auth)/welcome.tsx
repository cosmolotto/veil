import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(800).duration(1000)} style={styles.content}>
        <Text style={styles.title}>VEIL</Text>
        <Text style={styles.tagline}>Be Known Before You Are Seen.</Text>
        <Text style={styles.sub}>A different kind of social</Text>
        <VeilButton
          label="Begin"
          onPress={() => router.push('/(auth)/create-alias')}
          style={styles.btn}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  content: { width: '100%', paddingHorizontal: 40, alignItems: 'center' },
  title: { fontSize: 64, fontWeight: '800', color: COLORS.accent, letterSpacing: 8, marginBottom: 16 },
  tagline: { fontSize: 18, color: COLORS.accent, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 13, color: COLORS.muted, marginBottom: 56 },
  btn: { width: '100%' },
});
