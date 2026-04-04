import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';

export default function FirstPrompt() {
  const router = useRouter();
  const { alias, referral_code } = useLocalSearchParams<{ alias: string; referral_code?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Every day, one question.</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>desire</Text>
        <Text style={styles.cardText}>
          "What do you wish someone had noticed about you today?"
        </Text>
      </View>
      <Text style={styles.sub}>
        You answer it however you want. Voice, words, or a sketch.{'\n'}
        Nobody sees it unless you choose.
      </Text>
      <VeilButton
        label="I understand"
        onPress={() => router.push({ pathname: '/(auth)/soul-intro', params: { alias, referral_code } })}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, paddingTop: 100, alignItems: 'center' },
  heading: { fontSize: 26, fontWeight: '700', color: COLORS.white, textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 28, marginBottom: 32, width: '100%' },
  cardLabel: { fontSize: 11, color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  cardText: { fontSize: 20, color: COLORS.white, lineHeight: 30, fontStyle: 'italic' },
  sub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 56 },
  btn: { width: '100%' },
});
