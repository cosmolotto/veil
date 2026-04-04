import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { useSoulMap } from '../../hooks/useSoulMap';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../../lib/api';
import { COLORS, SIGNAL_COLORS } from '../../lib/constants';

export default function Self() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { data: soulMap } = useSoulMap();
  const accessQuery = useQuery({
    queryKey: ['access'],
    enabled: user?.id !== 'demo-user',
    queryFn: async () => (await api.getAccess()).data,
  });
  const referralQuery = useQuery({
    queryKey: ['referral'],
    enabled: user?.id !== 'demo-user',
    queryFn: async () => (await api.getReferral()).data,
  });
  const meta = soulMap ?? user?.soul_map_metadata;
  const streakDays = meta?.streak_days ?? user?.streak_days ?? 0;
  const hasPlusAccess = accessQuery.data?.has_plus_access ?? !!user?.is_plus;

  const enableNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const token = await Notifications.getExpoPushTokenAsync();
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
      await api.registerPushToken(token.data, platform);
    } catch {
      // CLAUDE_REVIEW: show toast for notification registration failures in next iteration.
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.alias}>{user?.alias ?? '—'}</Text>
      {!!user?.is_plus && (
        <View style={styles.plusBadge}>
          <Text style={styles.plusBadgeText}>VEIL+</Text>
        </View>
      )}
      {!user?.is_plus && hasPlusAccess && (
        <View style={styles.plusBadge}>
          <Text style={styles.plusBadgeText}>TRIAL</Text>
        </View>
      )}
      {meta && (
        <>
          <Text style={styles.sectionLabel}>Soul Map</Text>
          <View style={styles.emotions}>
            {meta.dominant_emotions.slice(0, 5).map((e) => (
              <View key={e.emotion} style={[styles.tag, { borderColor: SIGNAL_COLORS[e.emotion.toUpperCase()] ?? COLORS.accent }]}>
                <Text style={[styles.tagText, { color: SIGNAL_COLORS[e.emotion.toUpperCase()] ?? COLORS.accent }]}>
                  {e.emotion}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{meta.response_count}</Text>
              <Text style={styles.statLabel}>responses</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{streakDays}</Text>
              <Text style={styles.statLabel}>streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{(meta.avg_depth_score ?? 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>avg depth</Text>
            </View>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notify} onPress={enableNotifications}>
        <Text style={styles.notifyText}>Enable push notifications</Text>
      </TouchableOpacity>

      {!!referralQuery.data?.invite_code && (
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Invite and unlock more trial time</Text>
          <Text style={styles.referralCode}>{referralQuery.data.invite_code}</Text>
          <Text style={styles.referralMeta}>
            {referralQuery.data.successful_invites} successful invites
          </Text>
          {!!referralQuery.data.trial_ends_at && (
            <Text style={styles.referralMeta}>
              Trial ends {new Date(referralQuery.data.trial_ends_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {!hasPlusAccess && (
        <TouchableOpacity style={styles.plusCta} onPress={() => router.push('/(tabs)/plus')}>
          <Text style={styles.plusCtaText}>Upgrade to VEIL+</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 32, paddingTop: 70 },
  alias: { fontSize: 32, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  plusBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 12 },
  plusBadgeText: { color: '#1A1035', fontWeight: '800', fontSize: 11, letterSpacing: 0.4 },
  sectionLabel: { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, marginTop: 24 },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tagText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 48 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '700', color: COLORS.accent },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  signOut: { padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, alignItems: 'center' },
  signOutText: { color: COLORS.muted, fontSize: 14 },
  notify: { padding: 16, borderWidth: 1, borderColor: COLORS.accent, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  notifyText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  referralCard: { marginTop: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14 },
  referralTitle: { color: COLORS.white, fontWeight: '700', fontSize: 13, marginBottom: 8 },
  referralCode: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  referralMeta: { color: COLORS.muted, fontSize: 12 },
  plusCta: { padding: 16, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  plusCtaText: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
});
