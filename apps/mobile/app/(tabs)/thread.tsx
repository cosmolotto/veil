import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

// CLAUDE_REVIEW: Wire up threads in Phase 2
export default function Thread() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Threads appear when you form your first connection.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 40 },
  text: { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 26 },
});
