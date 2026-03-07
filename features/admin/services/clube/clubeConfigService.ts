import type { ClubeConfig } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import { rowToConfig } from './clubeCache';

export async function getConfig(comunidadeId: string): Promise<ClubeConfig | null> {
  const { data } = await supabase.from('clube_config').select('*').eq('comunidade_id', comunidadeId).single();
  if (!data) return null;
  return rowToConfig(data);
}

export async function saveConfig(
  comunidadeId: string,
  config: Partial<Omit<ClubeConfig, 'id' | 'comunidadeId'>>,
): Promise<ClubeConfig> {
  const row: Record<string, unknown> = { comunidade_id: comunidadeId, atualizado_em: tsBR() };
  if (config.beneficiosBronze !== undefined) row.beneficios_bronze = config.beneficiosBronze;
  if (config.beneficiosPrata !== undefined) row.beneficios_prata = config.beneficiosPrata;
  if (config.beneficiosOuro !== undefined) row.beneficios_ouro = config.beneficiosOuro;
  if (config.beneficiosDiamante !== undefined) row.beneficios_diamante = config.beneficiosDiamante;
  if (config.limiteBronze !== undefined) row.limite_bronze = config.limiteBronze;
  if (config.limitePrata !== undefined) row.limite_prata = config.limitePrata;
  if (config.limiteOuro !== undefined) row.limite_ouro = config.limiteOuro;
  if (config.limiteDiamante !== undefined) row.limite_diamante = config.limiteDiamante;
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
