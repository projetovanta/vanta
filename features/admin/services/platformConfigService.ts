/**
 * platformConfigService — Configurações dinâmicas da plataforma.
 * Substitui constantes hardcoded por valores editáveis pelo master.
 */
import { supabase } from '../../../services/supabaseClient';

export interface PlatformConfigItem {
  key: string;
  value: string;
  label: string | null;
  descricao: string | null;
  tipo: string | null;
}

let cache: PlatformConfigItem[] | null = null;

export const platformConfigService = {
  async getAll(): Promise<PlatformConfigItem[]> {
    if (cache) return cache;
    const { data } = await supabase.from('platform_config').select('key, value, label, descricao, tipo').order('key');
    cache = (data ?? []) as PlatformConfigItem[];
    return cache;
  },

  async get(key: string): Promise<string | null> {
    const all = await this.getAll();
    return all.find(c => c.key === key)?.value ?? null;
  },

  async getNumber(key: string, fallback: number): Promise<number> {
    const val = await this.get(key);
    if (val === null) return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  },

  async update(key: string, value: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('platform_config')
      .update({
        value,
        updated_at: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
        updated_by: userId,
      })
      .eq('key', key);
    if (error) {
      console.error('[platformConfig] update:', error);
      return false;
    }
    cache = null; // invalidar cache
    return true;
  },

  invalidateCache() {
    cache = null;
  },
};
