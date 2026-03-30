import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIGNAL_COLORS } from '../../lib/constants';

export default function Self() {
  const { user, signOut } = useAuthStore();
  const meta = user?.soul_map_metadata;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.alias}>{user?.alias ?? '—'}</Text>
      {user?.is_plus && (
        <View style={styles.plusBadge}>
          <Text style={styles.plusText}>VEIL+</Text>
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
              <Text style={styles.statNum}>{meta.streak_days}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 32, paddingTop: 70 },
  alias: { fontSize: 32, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  plusBadge: { backgroundColor: COLORS.gold, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 24 },
  plusText: { fontSize: 11, fontWeight: '700', color: '#0F0820', letterSpacing: 1 },
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
});
