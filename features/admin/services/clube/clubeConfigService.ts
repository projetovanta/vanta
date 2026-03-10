import type { ClubeConfig } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
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
  // App tiers → DB columns (convidado→bronze, presenca→prata, creator→ouro, vanta_black→diamante)
  if (config.beneficiosConvidado !== undefined) row.beneficios_bronze = config.beneficiosConvidado;
  if (config.beneficiosPresenca !== undefined) row.beneficios_prata = config.beneficiosPresenca;
  if (config.beneficiosCreator !== undefined) row.beneficios_ouro = config.beneficiosCreator;
  if (config.beneficiosVantaBlack !== undefined) row.beneficios_diamante = config.beneficiosVantaBlack;
  if (config.limiteConvidado !== undefined) row.limite_bronze = config.limiteConvidado;
  if (config.limitePresenca !== undefined) row.limite_prata = config.limitePresenca;
  if (config.limiteCreator !== undefined) row.limite_ouro = config.limiteCreator;
  if (config.limiteVantaBlack !== undefined) row.limite_diamante = config.limiteVantaBlack;
  if (config.prazoPostHoras !== undefined) row.prazo_post_horas = config.prazoPostHoras;
  if (config.infracoesLimite !== undefined) row.infracoes_limite = config.infracoesLimite;
  if (config.bloqueio1Dias !== undefined) row.bloqueio1_dias = config.bloqueio1Dias;
  if (config.bloqueio2Dias !== undefined) row.bloqueio2_dias = config.bloqueio2Dias;

  const { data, error } = await supabase
    .from('clube_config')
    .upsert(row as any, { onConflict: 'comunidade_id' })
    .select()
    .single();
  if (error) throw error;
  return rowToConfig(data);
}
