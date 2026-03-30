import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VeilButton } from '../../components/ui/VeilButton';
import { COLORS } from '../../lib/constants';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { label: `${h}:00 ${ampm}`, value: `${String(i).padStart(2, '0')}:00` };
});

export default function DailyTime() {
  const router = useRouter();
  const { alias } = useLocalSearchParams<{ alias: string }>();
  const { setUser } = useAuthStore();
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.onboard(alias ?? '', selectedTime);
      const { data } = await api.updateMe({ onboarding_complete: true });
      setUser(data);
      router.replace('/(tabs)/today');
    } catch (e) {
      // CLAUDE_REVIEW: Add user-facing error toast in Phase 2
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>When should we reach you?</Text>
      <Text style={styles.sub}>We'll send your daily prompt at this time. One notification. That's it.</Text>
      <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
        {HOURS.map((h) => (
          <TouchableOpacity
            key={h.value}
            style={[styles.timeRow, selectedTime === h.value && styles.timeRowSelected]}
            onPress={() => setSelectedTime(h.value)}
          >
            <Text style={[styles.timeText, selectedTime === h.value && styles.timeTextSelected]}>
              {h.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <VeilButton
        label="Start my journey"
        onPress={handleStart}
        loading={loading}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, paddingTop: 80 },
  heading: { fontSize: 26, fontWeight: '700', color: COLORS.white, marginBottom: 10 },
  sub: { fontSize: 14, color: COLORS.muted, lineHeight: 22, marginBottom: 32 },
  picker: { flex: 1, marginBottom: 24 },
  timeRow: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, marginBottom: 6 },
  timeRowSelected: { backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.accent },
  timeText: { fontSize: 16, color: COLORS.muted, textAlign: 'center' },
  timeTextSelected: { color: COLORS.accent, fontWeight: '600' },
  btn: { width: '100%', marginBottom: 40 },
});
