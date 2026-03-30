import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { VeilButton } from '../ui/VeilButton';
import { COLORS } from '../../lib/constants';
import { api } from '../../lib/api';
import { usePromptStore } from '../../stores/promptStore';

interface ResponseComposerProps {
  promptId: string;
}

type Mode = 'text' | 'voice' | 'sketch';

export function ResponseComposer({ promptId }: ResponseComposerProps) {
  const { markResponded } = usePromptStore();
  const [mode, setMode] = useState<Mode>('text');
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (content.length < 10) return;
    setLoading(true);
    try {
      await api.submitResponse({ prompt_id: promptId, type: 'text', content, is_shared: isShared });
      markResponded();
    } catch {
      // CLAUDE_REVIEW: Add user-facing error toast in Phase 2
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeTabs}>
        {(['text', 'voice', 'sketch'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, mode === m && styles.modeTabActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeLabel, mode === m && styles.modeLabelActive]}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'text' ? (
        <>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={6}
            placeholder="Write what's true for you..."
            placeholderTextColor={COLORS.muted}
            value={content}
            onChangeText={setContent}
            maxLength={10000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length.toLocaleString()} / 10,000</Text>
          <View style={styles.shareRow}>
            <Text style={styles.shareLabel}>Share with resonance matches</Text>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ true: COLORS.accent, false: COLORS.border }}
              thumbColor={COLORS.white}
            />
          </View>
          <VeilButton
            label="Submit"
            onPress={handleSubmit}
            disabled={content.length < 10}
            loading={loading}
            style={styles.btn}
          />
        </>
      ) : (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>{mode === 'voice' ? '🎙' : '✏️'} Coming soon</Text>
          {/* CLAUDE_REVIEW: implement voice + sketch in Phase 2 */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 40 },
  modeTabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: COLORS.surface, borderRadius: 10, padding: 4 },
  modeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeTabActive: { backgroundColor: COLORS.surfaceLight },
  modeLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', letterSpacing: 1 },
  modeLabelActive: { color: COLORS.accent },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 150,
    marginBottom: 8,
  },
  charCount: { fontSize: 11, color: COLORS.muted, textAlign: 'right', marginBottom: 16 },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shareLabel: { fontSize: 13, color: COLORS.muted },
  btn: { width: '100%' },
  comingSoon: { padding: 40, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 16 },
  comingSoonText: { color: COLORS.muted, fontSize: 16 },
});
