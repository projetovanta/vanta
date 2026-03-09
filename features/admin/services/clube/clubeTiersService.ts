import type { TierMaisVanta, TierMaisVantaDef } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { TIER_ORDER, _tiersDef, bump, rowToTierDef } from './clubeCache';

export function getTiers(): TierMaisVantaDef[] {
  return Array.from(_tiersDef.values())
    .filter(t => t.ativo)
    .sort((a, b) => a.ordem - b.ordem);
}

export function getTodosTiers(): TierMaisVantaDef[] {
  return Array.from(_tiersDef.values()).sort((a, b) => a.ordem - b.ordem);
}

export function getTierDef(tierId: string): TierMaisVantaDef | null {
  return _tiersDef.get(tierId) ?? null;
}

export function getTierOrdem(tierId: string): number {
  const def = _tiersDef.get(tierId);
  if (def) return def.ordem;
  return TIER_ORDER[tierId as TierMaisVanta] ?? 0;
}

export async function refreshTiers(): Promise<void> {
  const { data } = await supabase.from('tiers_mais_vanta').select('*').order('ordem').limit(100);
  _tiersDef.clear();
  if (data) {
    for (const r of data) {
      const t = rowToTierDef(r);
      _tiersDef.set(t.id, t);
    }
  }
  bump();
}

export async function criarTier(data: Omit<TierMaisVantaDef, 'criadoEm'>): Promise<TierMaisVantaDef> {
  const row = {
    id: data.id,
    nome: data.nome,
    cor: data.cor,
    ordem: data.ordem,
    beneficios: data.beneficios,
    limite_mensal: data.limiteMensal,
    ativo: data.ativo,
  };
  const { data: res, error } = await supabase.from('tiers_mais_vanta').insert(row).select().single();
  if (error) throw error;
  const tier = rowToTierDef(res);
  _tiersDef.set(tier.id, tier);
  bump();
  return tier;
}

export async function editarTier(
  tierId: string,
  data: Partial<Omit<TierMaisVantaDef, 'id' | 'criadoEm'>>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (data.nome !== undefined) row.nome = data.nome;
  if (data.cor !== undefined) row.cor = data.cor;
  if (data.ordem !== undefined) row.ordem = data.ordem;
  if (data.beneficios !== undefined) row.beneficios = data.beneficios;
  if (data.limiteMensal !== undefined) row.limite_mensal = data.limiteMensal;
  if (data.ativo !== undefined) row.ativo = data.ativo;

  const { error } = await supabase.from('tiers_mais_vanta').update(row).eq('id', tierId);
  if (error) console.error('[clubeTiers] updateTier:', error);
  const cached = _tiersDef.get(tierId);
  if (cached) Object.assign(cached, data);
  bump();
}
