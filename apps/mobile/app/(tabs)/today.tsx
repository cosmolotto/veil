import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { usePromptStore } from '../../stores/promptStore';
import { PromptCard } from '../../components/prompt/PromptCard';
import { ResponseComposer } from '../../components/prompt/ResponseComposer';
import { COLORS } from '../../lib/constants';

export default function Today() {
  const { todayPrompt, hasResponded, setTodayPrompt } = usePromptStore();

  const { data, isLoading } = useQuery({
    queryKey: ['today-prompt'],
    queryFn: () => api.getTodayPrompt(),
  });

  useEffect(() => {
    if (data?.data) setTodayPrompt(data.data);
  }, [data]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>{dateStr}</Text>
      </View>

      <PromptCard prompt={todayPrompt?.prompt ?? null} loading={isLoading} />

      {!isLoading && todayPrompt && (
        hasResponded
          ? (
            <View style={styles.responded}>
              <Text style={styles.respondedText}>✓ Responded today</Text>
              <Text style={styles.respondedSub}>Your Soul Map is updating.</Text>
            </View>
          )
          : (
            <ResponseComposer promptId={todayPrompt.prompt.id} />
          )
      )}
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
  respondedSub: { fontSize: 13, color: COLORS.muted },
});
