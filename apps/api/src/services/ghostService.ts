export const GHOST_AUTO_REPLIES = [
  'Some connections exist just to show us what we are looking for.',
  'I felt this. I am just not ready to be known yet.',
  'You deserved a real answer. I am still finding it.',
  'Part of me leaned closer. Another part stepped back.',
  'I read your message twice and still did not know how to answer honestly.',
  'You touched something quiet in me.',
  'If I disappear, it is not because your words meant nothing.',
  'I am learning that recognition and readiness are not the same thing.',
  'What you sent stayed with me longer than I expected.',
  'There are truths I can feel before I can hold.',
];

export function getGhostReply(count: number): string {
  return GHOST_AUTO_REPLIES[count % GHOST_AUTO_REPLIES.length];
}

export function randomGhostDelayMs(): number {
  const hours = 23 + Math.random() * 2;
  return Math.round(hours * 60 * 60 * 1000);
}

export function getGhostStatus(withdrawn: boolean): string | null {
  return withdrawn ? 'This soul has stepped back into silence.' : null;
}

function normalizeVector(input: unknown): number[] {
  if (Array.isArray(input)) return input.map((value) => Number(value) || 0);
  if (typeof input !== 'string') return [];

  const cleaned = input.trim().replace(/^\[|\]$/g, '');
  if (!cleaned) return [];
  return cleaned.split(',').map((value) => Number(value.trim()) || 0);
}

export function scoreGhostResonance(
  userVector: unknown,
  ghostVector: unknown,
  userPrimaryEmotion?: string | null,
  ghostPrimaryEmotion?: string | null
): number {
  const a = normalizeVector(userVector);
  const b = normalizeVector(ghostVector);

  if (a.length > 0 && a.length === b.length) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const similarity = dot / ((Math.sqrt(magA) * Math.sqrt(magB)) || 1);
    return Math.max(0.58, Math.min(0.97, similarity));
  }

  const sameEmotion = userPrimaryEmotion && ghostPrimaryEmotion && userPrimaryEmotion === ghostPrimaryEmotion;
  return sameEmotion ? 0.9 : 0.74;
}

export function extractPrimaryEmotion(metadata: unknown): string | null {
  const dominant = (metadata as { dominant_emotions?: Array<{ emotion?: string }> } | null)?.dominant_emotions;
  return dominant?.[0]?.emotion || null;
}

export function deriveGhostResonanceType(score: number): 'mirror' | 'contrast' | 'echo' {
  if (score >= 0.88) return 'mirror';
  if (score >= 0.74) return 'echo';
  return 'contrast';
}
