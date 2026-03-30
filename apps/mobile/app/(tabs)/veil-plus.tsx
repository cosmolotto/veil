import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS, VEIL_PLUS_PRICE } from '../../lib/constants';
import { purchaseVeilPlus, restorePurchases } from '../../lib/purchases';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';

const FEATURES = [
  { icon: 'infinite', text: 'Unlimited response history' },
  { icon: 'sparkles', text: 'Advanced Soul Map — 10 emotion dimensions' },
  { icon: 'eye-off', text: 'Ghost mode — browse without leaving a presence signal' },
  { icon: 'heart', text: 'Priority resonance matching' },
  { icon: 'time', text: 'Time-locked responses — open only at a chosen moment' },
  { icon: 'shield-checkmark', text: 'Enhanced encryption — zero-knowledge mode' },
];

export default function VeilPlus() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  if (user?.is_plus) {
    return (
      <View style={styles.alreadyContainer}>
        <Text style={styles.alreadyTitle}>You have VEIL+</Text>
        <Text style={styles.alreadySub}>Thank you for supporting VEIL.</Text>
        <VeilButton label="Back" onPress={() => router.back()} style={{ width: '100%' }} />
      </View>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const success = await purchaseVeilPlus();
      if (success) {
        const { data } = await api.updateMe({ is_plus: true } as never);
        setUser(data);
        Alert.alert('Welcome to VEIL+', 'Your subscription is now active.');
        router.back();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Purchase failed';
      if (!msg.includes('cancelled')) Alert.alert('Purchase failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        const { data } = await api.updateMe({ is_plus: true } as never);
        setUser(data);
        Alert.alert('Restored', 'Your VEIL+ subscription has been restored.');
        router.back();
      } else {
        Alert.alert('No subscription found', 'No previous VEIL+ purchase was found for this account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases. Try again later.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={COLORS.muted} />
      </TouchableOpacity>

      <Text style={styles.badge}>VEIL+</Text>
      <Text style={styles.title}>Go deeper.</Text>
      <Text style={styles.sub}>Everything in VEIL, plus tools for those who take their inner world seriously.</Text>

      <View style={styles.featureList}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={f.icon as never} size={18} color={COLORS.gold} style={styles.featureIcon} />
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceBox}>
        <Text style={styles.price}>{VEIL_PLUS_PRICE}</Text>
        <Text style={styles.priceNote}>Cancel anytime. No questions asked.</Text>
      </View>

      <VeilButton
        label={loading ? 'Processing…' : `Subscribe — ${VEIL_PLUS_PRICE}`}
        onPress={handlePurchase}
        loading={loading}
        style={styles.ctaBtn}
      />

      <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
        <Text style={styles.restoreText}>{restoring ? 'Restoring…' : 'Restore purchases'}</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        Payment will be charged to your Google Play account. Subscription renews automatically unless cancelled at least 24 hours before the renewal date.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 28, paddingTop: 60 },
  alreadyContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 40 },
  alreadyTitle: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  alreadySub: { fontSize: 14, color: COLORS.muted, marginBottom: 40 },
  close: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  badge: { fontSize: 12, fontWeight: '700', color: '#0F0820', backgroundColor: COLORS.gold, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, letterSpacing: 2, marginBottom: 20 },
  title: { fontSize: 40, fontWeight: '800', color: COLORS.white, marginBottom: 12 },
  sub: { fontSize: 15, color: COLORS.muted, lineHeight: 24, marginBottom: 36 },
  featureList: { marginBottom: 36 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  featureIcon: { marginRight: 14, marginTop: 1 },
  featureText: { flex: 1, fontSize: 15, color: COLORS.white, lineHeight: 22 },
  priceBox: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 24 },
  price: { fontSize: 36, fontWeight: '800', color: COLORS.gold, marginBottom: 4 },
  priceNote: { fontSize: 12, color: COLORS.muted },
  ctaBtn: { width: '100%', marginBottom: 16 },
  restoreBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 24 },
  restoreText: { color: COLORS.muted, fontSize: 13 },
  legal: { fontSize: 11, color: COLORS.muted, textAlign: 'center', lineHeight: 18 },
});
