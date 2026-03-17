/**
 * siteContentService — CMS de textos editáveis pelo master.
 * Tabela site_content (key/value). Cache em memória.
 */
import { supabase } from '../../../services/supabaseClient';

export interface SiteContentItem {
  key: string;
  value: string;
  label: string | null;
  categoria: string | null;
}

let cache: SiteContentItem[] | null = null;

export const siteContentService = {
  async getAll(): Promise<SiteContentItem[]> {
    if (cache) return cache;
    const { data } = await supabase
      .from('site_content')
      .select('key, value, label, categoria')
      .order('categoria')
      .order('key');
    cache = (data ?? []) as SiteContentItem[];
    return cache;
  },

  async get(key: string): Promise<string> {
    const all = await this.getAll();
    return all.find(c => c.key === key)?.value ?? '';
  },

  async getByCategoria(cat: string): Promise<SiteContentItem[]> {
    const all = await this.getAll();
    return all.filter(c => c.categoria === cat);
  },

  async update(key: string, value: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('site_content')
      .update({
        value,
        updated_at: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
        updated_by: userId,
      })
      .eq('key', key);
    if (error) {
      console.error('[siteContent] update:', error);
      return false;
    }
    cache = null;
    return true;
  },

  async create(key: string, value: string, label: string, categoria: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('site_content').insert({ key, value, label, categoria, updated_by: userId });
    if (error) {
      console.error('[siteContent] create:', error);
      return false;
    }
    cache = null;
    return true;
  },

  async remove(key: string): Promise<boolean> {
    const { error } = await supabase.from('site_content').delete().eq('key', key);
    if (error) {
      console.error('[siteContent] remove:', error);
      return false;
    }
    cache = null;
    return true;
  },

  invalidateCache() {
    cache = null;
  },
};
