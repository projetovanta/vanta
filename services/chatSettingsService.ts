import { supabase } from './supabaseClient';
import { tsBR } from '../utils';

export interface ChatSetting {
  partnerId: string;
  archived: boolean;
  muted: boolean;
  keepArchived: boolean;
}

// Tabela chat_settings ainda não está no types gerado — usar cast
const db = () =>
  (supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> }).from('chat_settings');

export const chatSettingsService = {
  async getAll(userId: string): Promise<Map<string, ChatSetting>> {
    const { data } = await (db() as any).select('partner_id, archived, muted, keep_archived').eq('user_id', userId);

    const map = new Map<string, ChatSetting>();
    if (data) {
      for (const row of data as Record<string, unknown>[]) {
        map.set(row.partner_id as string, {
          partnerId: row.partner_id as string,
          archived: row.archived as boolean,
          muted: row.muted as boolean,
          keepArchived: row.keep_archived as boolean,
        });
      }
    }
    return map;
  },

  async archive(partnerId: string, keepArchived: boolean): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await (db() as any).upsert(
      {
        user_id: auth.user.id,
        partner_id: partnerId,
        archived: true,
        muted: true,
        keep_archived: keepArchived,
        archived_at: tsBR(),
      } as never,
      { onConflict: 'user_id,partner_id' },
    );
  },

  async unarchive(partnerId: string): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await (db() as any)
      .update({ archived: false, muted: false, keep_archived: false, archived_at: null } as never)
      .eq('user_id', auth.user.id)
      .eq('partner_id', partnerId);
  },

  async mute(partnerId: string): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await (db() as any).upsert({ user_id: auth.user.id, partner_id: partnerId, muted: true } as never, {
      onConflict: 'user_id,partner_id',
    });
  },

  async unmute(partnerId: string): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await (db() as any)
      .update({ muted: false } as never)
      .eq('user_id', auth.user.id)
      .eq('partner_id', partnerId);
  },
};
