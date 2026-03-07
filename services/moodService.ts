import { supabase } from './supabaseClient';

const nowBRT = () => new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

const expires24h = () => {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
};

export const MOOD_EMOJIS = ['🍾', '🎶', '🔥', '💃', '🎉', '🍻', '🌙', '✨', '🤙', '😴', '🏠', '🤷'] as const;

export interface MoodData {
  emoji: string;
  text: string | null;
  expiresAt: string | null;
}

export const moodService = {
  async set(userId: string, emoji: string, text?: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({
        mood_emoji: emoji,
        mood_text: text?.trim() || null,
        mood_expires_at: expires24h(),
      })
      .eq('id', userId);
    if (error) console.error('[moodService] set erro:', error);
    return !error;
  },

  async clear(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({
        mood_emoji: null,
        mood_text: null,
        mood_expires_at: null,
      })
      .eq('id', userId);
    if (error) console.error('[moodService] clear erro:', error);
    return !error;
  },

  /** Buscar mood de múltiplos users (para amigos). Filtra expirados. */
  async getMany(userIds: string[]): Promise<Record<string, MoodData>> {
    if (userIds.length === 0) return {};
    const now = nowBRT();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, mood_emoji, mood_text, mood_expires_at')
      .in('id', userIds)
      .not('mood_emoji', 'is', null)
      .gte('mood_expires_at', now);

    if (error || !data) return {};
    const result: Record<string, MoodData> = {};
    for (const row of data) {
      result[row.id] = {
        emoji: row.mood_emoji!,
        text: row.mood_text,
        expiresAt: row.mood_expires_at,
      };
    }
    return result;
  },
};
