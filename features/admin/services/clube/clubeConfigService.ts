import type { ClubeConfig } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import type { Database } from '../../../../types/supabase';

type ClubeConfigInsert = Database['public']['Tables']['clube_config']['Insert'];
import { tsBR } from '../../../../utils';
import { rowToConfig } from './clubeCache';

export async function getConfig(comunidadeId: string): Promise<ClubeConfig | null> {
  const { data } = await supabase.from('clube_config').select('*').eq('comunidade_id', comunidadeId).maybeSingle();
  if (!data) return null;
  return rowToConfig(data);
}

export async function saveConfig(
  comunidadeId: string,
  config: Partial<Omit<ClubeConfig, 'id' | 'comunidadeId'>>,
): Promise<ClubeConfig> {
  const row: Record<string, unknown> = { comunidade_id: comunidadeId, atualizado_em: tsBR() };
  // App tiers → DB columns (lista→bronze, presenca→prata, creator→ouro, black→diamante)
  if (config.beneficiosLista !== undefined) row.beneficios_bronze = config.beneficiosLista;
  if (config.beneficiosPresenca !== undefined) row.beneficios_prata = config.beneficiosPresenca;
  if (config.beneficiosCreator !== undefined) row.beneficios_ouro = config.beneficiosCreator;
  if (config.beneficiosBlack !== undefined) row.beneficios_diamante = config.beneficiosBlack;
  if (config.limiteLista !== undefined) row.limite_bronze = config.limiteLista;
  if (config.limitePresenca !== undefined) row.limite_prata = config.limitePresenca;
  if (config.limiteCreator !== undefined) row.limite_ouro = config.limiteCreator;
  if (config.limiteBlack !== undefined) row.limite_diamante = config.limiteBlack;
  if (config.prazoPostHoras !== undefined) row.prazo_post_horas = config.prazoPostHoras;
  if (config.infracoesLimite !== undefined) row.infracoes_limite = config.infracoesLimite;
  if (config.bloqueio1Dias !== undefined) row.bloqueio1_dias = config.bloqueio1Dias;
  if (config.bloqueio2Dias !== undefined) row.bloqueio2_dias = config.bloqueio2Dias;
  if (config.convitesLista !== undefined) row.convites_lista = config.convitesLista;
  if (config.convitesPresenca !== undefined) row.convites_presenca = config.convitesPresenca;
  if (config.convitesSocial !== undefined) row.convites_social = config.convitesSocial;
  if (config.convitesCreator !== undefined) row.convites_creator = config.convitesCreator;
  if (config.convitesBlack !== undefined) row.convites_black = config.convitesBlack;

  const { data, error } = await supabase
    .from('clube_config')
    .upsert(row as ClubeConfigInsert, { onConflict: 'comunidade_id' })
    .select()
    .single();
  if (error) throw error;
  return rowToConfig(data);
}
