/**
 * brandProfilesService — CRUD de perfis visuais de marca.
 * Tabela: brand_profiles (RLS: master write, authenticated read validados).
 * Usado pelo agente Lux (Artista IA) pra salvar/ler identidades visuais.
 */

import { supabase } from '../../../services/supabaseClient';
import { tsBR } from '../../../utils';
import type { Json } from '../../../types/supabase';

export interface BrandProfile {
  id: string;
  comunidade_id: string | null;
  nome: string;
  perfil_visual: Json;
  referencias: string[];
  ideogram_style_code: string | null;
  flux_lora_id: string | null;
  validado: boolean;
  criado_em: string;
}

const TABLE = 'brand_profiles' as const;

export const brandProfilesService = {
  async list(): Promise<BrandProfile[]> {
    const { data } = await supabase
      .from(TABLE)
      .select(
        'id, comunidade_id, nome, perfil_visual, referencias, ideogram_style_code, flux_lora_id, validado, criado_em',
      )
      .order('criado_em', { ascending: false });
    return (data ?? []) as BrandProfile[];
  },

  async getByComunidade(comunidadeId: string): Promise<BrandProfile | null> {
    const { data } = await supabase
      .from(TABLE)
      .select('*')
      .eq('comunidade_id', comunidadeId)
      .eq('validado', true)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as BrandProfile) ?? null;
  },

  async save(nome: string, perfilVisual: Json, referencias: string[], comunidadeId?: string): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data } = await supabase
      .from(TABLE)
      .insert({
        nome,
        perfil_visual: perfilVisual,
        referencias,
        comunidade_id: comunidadeId ?? null,
        criado_por: userId,
        criado_em: tsBR(),
      })
      .select('id')
      .single();
    return data?.id ?? '';
  },

  async validate(id: string): Promise<void> {
    await supabase.from(TABLE).update({ validado: true, atualizado_em: tsBR() }).eq('id', id);
  },

  async update(
    id: string,
    fields: {
      perfil_visual?: Json;
      referencias?: string[];
      ideogram_style_code?: string;
      flux_lora_id?: string;
      validado?: boolean;
    },
  ): Promise<void> {
    await supabase
      .from(TABLE)
      .update({ ...fields, atualizado_em: tsBR() })
      .eq('id', id);
  },
};
