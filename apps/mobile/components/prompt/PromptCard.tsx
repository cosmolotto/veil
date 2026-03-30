import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';
import type { Prompt } from '../../lib/types';

interface PromptCardProps {
  prompt: Prompt | null;
  loading?: boolean;
}

export function PromptCard({ prompt, loading }: PromptCardProps) {
  if (loading || !prompt) {
    return (
      <View style={[styles.card, styles.skeleton]}>
        <View style={styles.skeletonLabel} />
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.card}>
      <Text style={styles.category}>{prompt.category}</Text>
      <Text style={styles.text}>{prompt.text}</Text>
      <View style={styles.difficultyRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.dot, i < prompt.difficulty_level && styles.dotFilled]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 28,
    marginBottom: 24,
  },
  skeleton: { opacity: 0.5 },
  skeletonLabel: { height: 10, width: 80, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 16 },
  skeletonLine: { height: 14, width: '100%', backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 10 },
  category: {
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 20,
    color: COLORS.white,
    lineHeight: 32,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  difficultyRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotFilled: { backgroundColor: COLORS.accent },
});
