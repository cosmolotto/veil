import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { COLORS, VEIL_PLUS_PRICE } from '../../lib/constants';
import { useAuthStore } from '../../stores/authStore';
import { getPrimaryPackage, purchaseVeilPlus, restoreVeilPlus } from '../../lib/billing';

const FEATURES = [
  'Unlimited resonance suggestions',
  'Early unveil requests before depth 90',
  'Priority thread delivery and matching',
  'Premium emotional trend insights',
];

export default function PlusScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const isDemo = user?.id === 'demo-user';

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || isDemo) return api.activatePlus('test_unlock');
      const success = await purchaseVeilPlus(user.id);
      if (!success) throw new Error('Purchase not completed');
      return api.activatePlus('playstore');
    },
    onSuccess: ({ data }) => {
      setUser(data);
      router.replace('/(tabs)/self');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || isDemo) return api.restorePlus();
      const restored = await restoreVeilPlus(user.id);
      if (!restored) return api.restorePlus();
      return api.activatePlus('manual');
    },
    onSuccess: ({ data }) => {
      setUser(data);
      router.replace('/(tabs)/self');
    },
  });

  const packageQuery = useQuery({
    queryKey: ['plus-package', user?.id],
    enabled: !!user?.id && !isDemo,
    queryFn: async () => getPrimaryPackage(user!.id),
  });

  const livePrice = packageQuery.data?.product?.priceString || VEIL_PLUS_PRICE;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>VEIL+</Text>
      <Text style={styles.subtitle}>Turn your daily reflection into meaningful connection faster.</Text>
      <Text style={styles.price}>{livePrice}</Text>

      <View style={styles.featureList}>
        {FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => activateMutation.mutate()}
        disabled={activateMutation.isPending}
      >
        <Text style={styles.primaryBtnText}>
          {activateMutation.isPending ? 'Processing...' : 'Upgrade to VEIL+'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => restoreMutation.mutate()}
        disabled={restoreMutation.isPending}
      >
        <Text style={styles.secondaryBtnText}>
          {restoreMutation.isPending ? 'Restoring...' : 'Restore purchase'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{user?.is_plus ? 'Done' : 'Maybe later'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 70, paddingBottom: 80 },
  title: { color: COLORS.gold, fontSize: 38, fontWeight: '800' },
  subtitle: { color: COLORS.muted, marginTop: 12, lineHeight: 22, fontSize: 14 },
  price: { color: COLORS.white, fontSize: 30, fontWeight: '700', marginTop: 24, marginBottom: 16 },
  featureList: { gap: 10, marginBottom: 26 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { color: COLORS.accent, fontSize: 18, marginRight: 10, lineHeight: 20 },
  featureText: { color: COLORS.white, fontSize: 14, flex: 1, lineHeight: 21 },
  primaryBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#1A1035', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: COLORS.white, fontWeight: '600' },
  backBtn: { alignItems: 'center', marginTop: 18 },
  backText: { color: COLORS.muted },
});
