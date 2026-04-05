import OpenAI from 'openai';
import { EmotionalSignature, EmotionType } from '@veil/shared';

const EXTRACTION_SYSTEM_PROMPT = `You are an emotional intelligence system for a private journaling app called VEIL.
Your job is to extract an emotional signature from a user's reflective text response.

CRITICAL RULES:
- Never quote or repeat any content from the user's text
- Never store or reference the user's actual words
- Output ONLY a valid JSON object, no markdown, no explanation
- Be accurate and empathetic, not clinical

Return exactly this JSON structure:
{
  "primary_emotion": "<one of: grief|wonder|identity|desire|fear|joy|loss|becoming|nostalgia|anger|peace|confusion>",
  "secondary_emotion": "<same options or null>",
  "depth_level": <integer 1-10>,
  "vulnerability_score": <integer 1-10>,
  "temporal_orientation": "<past|present|future>",
  "energy_level": "<low|medium|high>"
}`;

export async function extractEmotionalSignature(
  openai: OpenAI,
  responseContent: string
): Promise<EmotionalSignature | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: responseContent }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Omit<EmotionalSignature, 'extracted_at'>;
    return { ...parsed, extracted_at: new Date().toISOString() };
  } catch {
    // CLAUDE_REVIEW: Silent fail intentional — signature is non-blocking
    return null;
  }
}

export async function generateSoulMapEmbedding(
  openai: OpenAI,
  signature: EmotionalSignature
): Promise<number[]> {
  const descriptor = `Emotional state: ${signature.primary_emotion}. ` +
    (signature.secondary_emotion ? `Also: ${signature.secondary_emotion}. ` : '') +
    `Depth: ${signature.depth_level}/10. Vulnerability: ${signature.vulnerability_score}/10. ` +
    `Time orientation: ${signature.temporal_orientation}. Energy: ${signature.energy_level}.`;

  const result = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: descriptor
  });

  return result.data[0].embedding;
}

export async function updateSoulMapVector(
  // CLAUDE_REVIEW: Replace `any` with typed Supabase client when schema types are generated
  supabase: any,
  openai: OpenAI,
  userId: string
): Promise<void> {
  const { data: signatures } = await supabase
    .from('responses')
    .select('emotional_signature')
    .eq('user_id', userId)
    .not('emotional_signature', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!signatures || signatures.length < 1) return;

  const embeddings = await Promise.all(
    signatures.map((r: { emotional_signature: EmotionalSignature }) =>
      generateSoulMapEmbedding(openai, r.emotional_signature))
  );

  const avgVector = embeddings[0].map((_: number, i: number) => {
    const sum = embeddings.reduce((acc: number, emb: number[]) => acc + emb[i], 0);
    return sum / embeddings.length;
  });

  const emotionCounts: Record<string, number> = {};
  let totalDepth = 0;
  let totalVuln = 0;
  const temporalCounts = { past: 0, present: 0, future: 0 };

  for (const r of signatures) {
    const sig: EmotionalSignature = r.emotional_signature;
    emotionCounts[sig.primary_emotion] = (emotionCounts[sig.primary_emotion] || 0) + 1;
    totalDepth += sig.depth_level;
    totalVuln += sig.vulnerability_score;
    temporalCounts[sig.temporal_orientation]++;
  }

  const dominant_emotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      weight: count / signatures.length
    }));

  const temporal_orientation = (Object.entries(temporalCounts)
    .sort(([, a], [, b]) => b - a)[0][0]) as 'past' | 'present' | 'future';

  const { data: user } = await supabase
    .from('users')
    .select('streak_days')
    .eq('id', userId)
    .single();

  const metadata = {
    dominant_emotions,
    avg_depth_score: totalDepth / signatures.length,
    avg_vulnerability_score: totalVuln / signatures.length,
    temporal_orientation,
    response_count: signatures.length,
    streak_days: Number(user?.streak_days || 0),
    last_updated: new Date().toISOString(),
  };

  await supabase
    .from('users')
    .update({ soul_map_vector: avgVector, soul_map_metadata: metadata })
    .eq('id', userId);
}
