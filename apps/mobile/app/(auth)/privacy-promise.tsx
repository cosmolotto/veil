import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';

const PROMISES = [
  'Your responses are encrypted and never sold.',
  'No ads. No tracking. No data brokers.',
  'You are anonymous until you choose otherwise.',
  'Delete everything. Anytime. Instantly.',
];

export default function PrivacyPromise() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={56} color={COLORS.accent} style={styles.icon} />
      <Text style={styles.heading}>Privacy is not a feature here.</Text>
      <View style={styles.list}>
        {PROMISES.map((p, i) => (
          <View key={i} style={styles.item}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.check} />
            <Text style={styles.text}>{p}</Text>
          </View>
        ))}
      </View>
      <VeilButton
        label="I trust this"
        onPress={() => router.push('/(auth)/daily-time')}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, paddingTop: 80, alignItems: 'center' },
  icon: { marginBottom: 28 },
  heading: { fontSize: 24, fontWeight: '700', color: COLORS.white, textAlign: 'center', marginBottom: 40 },
  list: { width: '100%', marginBottom: 56 },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  check: { marginRight: 12, marginTop: 1 },
  text: { flex: 1, fontSize: 15, color: COLORS.muted, lineHeight: 22 },
  btn: { width: '100%' },
});
