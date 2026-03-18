/**
 * indicaTemplatesService — CRUD de templates salvos do VANTA Indica.
 * Tabela: vanta_indica_templates (RLS: master write, authenticated read).
 */

import { supabase } from '../../../services/supabaseClient';
import { tsBR } from '../../../utils';
import type { Json } from '../../../types/supabase';

export interface IndicaTemplate {
  id: string;
  label: string;
  descricao: string;
  form_data: Json;
  criado_em: string;
  ativo: boolean;
}

const TABLE = 'vanta_indica_templates' as const;

export const indicaTemplatesService = {
  async list(): Promise<IndicaTemplate[]> {
    const { data } = await supabase
      .from(TABLE)
      .select('id, label, descricao, form_data, criado_em, ativo')
      .eq('ativo', true)
      .order('criado_em', { ascending: false });
    return (data ?? []) as IndicaTemplate[];
  },

  async save(label: string, descricao: string, formData: Json): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from(TABLE).insert({
      label,
      descricao,
      form_data: formData,
      criado_por: userId,
      criado_em: tsBR(),
    });
  },

  async update(
    id: string,
    fields: { label?: string; descricao?: string; form_data?: Json; ativo?: boolean },
  ): Promise<void> {
    await supabase
      .from(TABLE)
      .update({ ...fields, atualizado_em: tsBR() })
      .eq('id', id);
  },

  async remove(id: string): Promise<void> {
    await supabase.from(TABLE).update({ ativo: false, atualizado_em: tsBR() }).eq('id', id);
  },
};
