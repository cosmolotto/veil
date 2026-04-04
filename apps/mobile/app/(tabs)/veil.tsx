import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { COLORS } from '../../lib/constants';
import { useAuthStore } from '../../stores/authStore';

export default function VeilTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isDemo = user?.id === 'demo-user';
  const accessQuery = useQuery({
    queryKey: ['access'],
    enabled: !isDemo,
    queryFn: async () => (await api.getAccess()).data,
  });
  const isPlus = accessQuery.data?.has_plus_access ?? !!user?.is_plus;

  const suggestionsQuery = useQuery({
    queryKey: ['resonance-suggestions'],
    enabled: !isDemo,
    queryFn: async () => (await api.getResonanceSuggestions()).data,
  });

  const connectionsQuery = useQuery({
    queryKey: ['connections'],
    enabled: !isDemo,
    queryFn: async () => (await api.getMyConnections()).data,
  });

  const proposeMutation = useMutation({
    mutationFn: (body: { partner_user_id: string; resonance_type: 'mirror' | 'contrast' | 'echo' }) => api.proposeConnection(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.acceptConnection(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const unveilMutation = useMutation({
    mutationFn: (id: string) => api.requestUnveil(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  if (isDemo) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Veil</Text>
        <Text style={styles.demoText}>
          Demo mode is active. Sign in with real Supabase credentials to unlock resonance matching,
          connection threads, and the unveil ceremony.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Resonance Engine</Text>
      <Text style={styles.sub}>People who emotionally rhyme with you.</Text>

      {(suggestionsQuery.data || []).slice(0, isPlus ? 6 : 3).map((match) => (
        <View key={match.partner_user_id} style={styles.card}>
          <Text style={styles.alias}>{match.partner_alias}</Text>
          <Text style={styles.meta}>{match.resonance_type.toUpperCase()} • {Math.round(match.score * 100)}%</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => proposeMutation.mutate({ partner_user_id: match.partner_user_id, resonance_type: match.resonance_type })}
          >
            <Text style={styles.buttonText}>Propose Connection</Text>
          </TouchableOpacity>
        </View>
      ))}

      {!isPlus && (
        <TouchableOpacity style={styles.upgradeBox} onPress={() => router.push('/(tabs)/plus')}>
          <Text style={styles.upgradeTitle}>VEIL+ unlocks full resonance</Text>
          <Text style={styles.upgradeSub}>See more matches and send early unveil requests.</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.section}>Your Veil Space</Text>
      {(connectionsQuery.data || []).map((connection) => (
        <View key={connection.id} style={styles.card}>
          <Text style={styles.alias}>{connection.partner_alias || `Soul-${connection.partner_user_id.slice(0, 6)}`}</Text>
          <Text style={styles.meta}>
            {connection.state.replace('_', ' ')} • depth {Math.round(connection.depth_score)}
          </Text>
          {connection.state === 'proposed' && (
            <TouchableOpacity style={styles.button} onPress={() => acceptMutation.mutate(connection.id)}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          )}
          {(connection.state === 'veiled' || connection.state === 'accepted') && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (!isPlus && connection.depth_score < 90) {
                  router.push('/(tabs)/plus');
                  return;
                }
                unveilMutation.mutate(connection.id);
              }}
            >
              <Text style={styles.buttonText}>Request Unveil</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 90 },
  header: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
  sub: { color: COLORS.muted, marginTop: 6, marginBottom: 20 },
  section: { color: COLORS.white, fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  alias: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  meta: { color: COLORS.muted, marginTop: 4, marginBottom: 10, fontSize: 12 },
  button: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  demoText: { color: COLORS.muted, marginTop: 14, lineHeight: 22, fontSize: 14, paddingRight: 20 },
  upgradeBox: { borderWidth: 1, borderColor: COLORS.gold, borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: 'rgba(201,168,76,0.08)' },
  upgradeTitle: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
  upgradeSub: { color: COLORS.muted, marginTop: 6, fontSize: 12 },
});
