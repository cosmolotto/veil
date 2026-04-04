import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { COLORS } from '../../lib/constants';
import { useAuthStore } from '../../stores/authStore';

export default function Thread() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const connectionsQuery = useQuery({
    queryKey: ['connections'],
    enabled: user?.id !== 'demo-user',
    queryFn: async () => (await api.getMyConnections()).data,
  });
  const accessQuery = useQuery({
    queryKey: ['access'],
    enabled: user?.id !== 'demo-user',
    queryFn: async () => (await api.getAccess()).data,
  });

  const activeConnectionId = selectedConnectionId || connectionsQuery.data?.[0]?.id || null;

  const threadQuery = useQuery({
    queryKey: ['thread', activeConnectionId],
    enabled: !!activeConnectionId && user?.id !== 'demo-user',
    queryFn: async () => (await api.getThread(activeConnectionId!)).data,
  });

  const sendMutation = useMutation({
    mutationFn: () => api.sendThreadMessage(activeConnectionId!, draft.trim()),
    onSuccess: async () => {
      setDraft('');
      await queryClient.invalidateQueries({ queryKey: ['thread', activeConnectionId] });
      await queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const demoMessages = useMemo(() => ([
    { id: '1', is_mine: false, body: 'I read your silence as care, not distance.' },
    { id: '2', is_mine: true, body: 'That lands. I have been scared of being misread.' },
  ]), []);

  if (user?.id === 'demo-user') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thread</Text>
        <Text style={styles.sub}>Demo conversation preview</Text>
        <ScrollView contentContainerStyle={styles.messages}>
          {demoMessages.map((m) => (
            <View key={m.id} style={[styles.message, m.is_mine ? styles.mine : styles.theirs]}>
              <Text style={styles.messageText}>{m.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const isPlus = accessQuery.data?.has_plus_access ?? !!user?.is_plus;
  const messageLimit = isPlus ? Number.POSITIVE_INFINITY : 8;
  const messageCount = (threadQuery.data || []).length;
  const isLocked = messageCount >= messageLimit;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thread</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.connectionStrip}>
        {(connectionsQuery.data || []).map((connection) => (
          <TouchableOpacity
            key={connection.id}
            style={[styles.connectionPill, activeConnectionId === connection.id && styles.connectionPillActive]}
            onPress={() => setSelectedConnectionId(connection.id)}
          >
            <Text style={styles.connectionPillText}>
              {connection.partner_alias || `Soul-${connection.partner_user_id.slice(0, 6)}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.messages}>
        {(threadQuery.data || []).map((message) => (
          <View key={message.id} style={[styles.message, message.is_mine ? styles.mine : styles.theirs]}>
            <Text style={styles.messageText}>{message.body}</Text>
          </View>
        ))}
      </ScrollView>

      {!isPlus && isLocked && (
        <TouchableOpacity style={styles.lockBox} onPress={() => router.push('/(tabs)/plus')}>
          <Text style={styles.lockTitle}>Thread limit reached</Text>
          <Text style={styles.lockSub}>Upgrade to VEIL+ for unlimited conversation depth.</Text>
        </TouchableOpacity>
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Send a quiet truth..."
          placeholderTextColor={COLORS.muted}
        />
        <TouchableOpacity
          style={[styles.send, (!draft.trim() || !activeConnectionId) && styles.sendDisabled]}
          disabled={!draft.trim() || !activeConnectionId || sendMutation.isPending || isLocked}
          onPress={() => {
            if (isLocked) {
              router.push('/(tabs)/plus');
              return;
            }
            sendMutation.mutate();
          }}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 56 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '700', paddingHorizontal: 18 },
  sub: { color: COLORS.muted, paddingHorizontal: 18, marginTop: 8 },
  connectionStrip: { marginTop: 14, maxHeight: 48, paddingHorizontal: 12 },
  connectionPill: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, paddingHorizontal: 14, justifyContent: 'center', marginHorizontal: 6 },
  connectionPillActive: { borderColor: COLORS.accent },
  connectionPillText: { color: COLORS.white, fontSize: 12 },
  messages: { padding: 16, paddingBottom: 90, gap: 10 },
  message: { maxWidth: '85%', borderRadius: 14, padding: 12 },
  mine: { alignSelf: 'flex-end', backgroundColor: COLORS.accent },
  theirs: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  messageText: { color: COLORS.white, lineHeight: 20 },
  composer: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, color: COLORS.white, height: 42 },
  send: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
  sendText: { color: COLORS.white, fontWeight: '600' },
  lockBox: { marginHorizontal: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gold, padding: 12, backgroundColor: 'rgba(201,168,76,0.08)' },
  lockTitle: { color: COLORS.gold, fontWeight: '700' },
  lockSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
});
