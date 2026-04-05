import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { COLORS, VEIL_PLUS_PRICE } from '../../lib/constants';
import { markPaywallSeen, startVeilPlusTrial } from '../../lib/paywall';

const FEATURES = [
  'Reveal your resonance matches',
  'Unlock the people already waiting',
  'Cancel anytime after your trial',
  'Keep VEIL ad-free and quiet',
];

export default function PlusScreen() {
  const router = useRouter();

  const activateMutation = useMutation({
    mutationFn: async () => {
      await startVeilPlusTrial();
    },
    onSuccess: () => {
      router.back();
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      await markPaywallSeen();
    },
    onSuccess: () => {
      router.back();
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>VEIL+</Text>
      <Text style={styles.title}>You have resonance matches waiting</Text>
      <Text style={styles.subtitle}>Discover who thinks like you. Cancel anytime.</Text>
      <Text style={styles.price}>
        {VEIL_PLUS_PRICE}
        {'\n'}
        <Text style={styles.trial}>7 day free trial</Text>
      </Text>

      <View style={styles.featureList}>
        {FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => activateMutation.mutate()} disabled={activateMutation.isPending}>
        <Text style={styles.primaryBtnText}>{activateMutation.isPending ? 'Opening checkout...' : 'Start Free Trial'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => dismissMutation.mutate()} disabled={dismissMutation.isPending}>
        <Text style={styles.secondaryBtnText}>Maybe later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 70, paddingBottom: 80 },
  eyebrow: { color: COLORS.gold, fontSize: 14, fontWeight: '800', letterSpacing: 1.2, marginBottom: 14 },
  title: { color: COLORS.white, fontSize: 34, fontWeight: '800', lineHeight: 40 },
  subtitle: { color: COLORS.muted, marginTop: 12, lineHeight: 22, fontSize: 14 },
  price: { color: COLORS.white, fontSize: 30, fontWeight: '700', marginTop: 24, marginBottom: 16 },
  trial: { color: COLORS.gold, fontSize: 16, fontWeight: '700' },
  featureList: { gap: 10, marginBottom: 26 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { color: COLORS.accent, fontSize: 18, marginRight: 10, lineHeight: 20 },
  featureText: { color: COLORS.white, fontSize: 14, flex: 1, lineHeight: 21 },
  primaryBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#1A1035', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: COLORS.white, fontWeight: '600' },
});
