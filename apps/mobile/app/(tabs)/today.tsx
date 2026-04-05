import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PromptCard } from '../../components/prompt/PromptCard';
import { ResponseComposer } from '../../components/prompt/ResponseComposer';
import { useTodayPrompt } from '../../hooks/useTodayPrompt';
import { api } from '../../lib/api';
import { COLORS } from '../../lib/constants';
import { ensureDayTwoNotifications } from '../../lib/notifications';
import { useAuthStore } from '../../stores/authStore';

export default function Today() {
  const { user } = useAuthStore();
  const { todayPrompt, hasResponded, isLoading } = useTodayPrompt();
  const [snapshotText, setSnapshotText] = React.useState('');
  const highlightsQuery = useQuery({
    queryKey: ['highlights'],
    queryFn: async () => (await api.getResponseHighlights()).data,
  });
  const snapshotMutation = useMutation({
    mutationFn: () => api.createSoulSnapshot({ snapshot_text: snapshotText.trim() }),
    onSuccess: () => setSnapshotText(''),
  });

  React.useEffect(() => {
    void ensureDayTwoNotifications(user?.created_at);
  }, [user?.created_at]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>{dateStr}</Text>
      </View>

      <PromptCard prompt={todayPrompt?.prompt ?? null} loading={isLoading} />

      {!isLoading && !todayPrompt && (
        <View style={styles.responded}>
          <Text style={styles.respondedSub}>Your next question is gathering itself. Check back in a moment.</Text>
        </View>
      )}

      {!isLoading && todayPrompt && (
        hasResponded ? (
          <View style={styles.responded}>
            <Text style={styles.respondedText}>Responded today</Text>
            <Text style={styles.respondedSub}>Your Soul Map is updating.</Text>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotTitle}>Create a Soul Snapshot</Text>
              <TextInput
                value={snapshotText}
                onChangeText={setSnapshotText}
                placeholder="A short line you feel okay sharing..."
                placeholderTextColor={COLORS.muted}
                style={styles.snapshotInput}
                maxLength={180}
              />
              <TouchableOpacity
                style={[styles.snapshotButton, (!snapshotText.trim() || snapshotMutation.isPending) && styles.snapshotButtonDisabled]}
                disabled={!snapshotText.trim() || snapshotMutation.isPending}
                onPress={() => snapshotMutation.mutate()}
              >
                <Text style={styles.snapshotButtonText}>{snapshotMutation.isPending ? 'Saving...' : 'Save snapshot'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ResponseComposer promptId={todayPrompt.prompt.id} />
        )
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Highlights</Text>
        <Text style={styles.sectionSub}>Anonymized reflections people chose to share.</Text>
        {(highlightsQuery.data || []).slice(0, 6).map((item) => (
          <View key={item.id} style={styles.highlightCard}>
            <Text style={styles.highlightMeta}>
              {item.alias_hint} • {item.emotion} • depth {item.depth_level}
            </Text>
            <Text style={styles.highlightText}>{item.content_preview}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  headerDate: { fontSize: 13, color: COLORS.muted },
  responded: { marginTop: 32, alignItems: 'center', padding: 32 },
  respondedText: { fontSize: 18, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  respondedSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  section: { marginTop: 28 },
  sectionTitle: { fontSize: 17, color: COLORS.white, fontWeight: '700' },
  sectionSub: { fontSize: 12, color: COLORS.muted, marginTop: 4, marginBottom: 10 },
  highlightCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginBottom: 8 },
  highlightMeta: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  highlightText: { color: COLORS.white, fontSize: 13, lineHeight: 18 },
  snapshotCard: { width: '100%', marginTop: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 },
  snapshotTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'left' },
  snapshotInput: { minHeight: 80, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, color: COLORS.white, textAlignVertical: 'top', marginBottom: 8 },
  snapshotButton: { backgroundColor: COLORS.accent, borderRadius: 9, paddingVertical: 10, alignItems: 'center' },
  snapshotButtonDisabled: { opacity: 0.4 },
  snapshotButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
});
