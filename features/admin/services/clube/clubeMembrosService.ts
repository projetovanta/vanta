import type { TierMaisVanta, MembroClubeVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { TIER_ORDER, _tiersDef, _membros, bump } from './clubeCache';

export function getMembroClubeByUserId(userId: string): MembroClubeVanta | null {
  return _membros.get(userId) ?? null;
}

export function isMembro(userId: string): boolean {
  const m = _membros.get(userId);
  return !!m && m.ativo;
}

export function getTier(userId: string): TierMaisVanta | null {
  const m = _membros.get(userId);
  return m?.ativo ? m.tier : null;
}

export function tierSuficiente(userId: string, tierMinimo: TierMaisVanta): boolean {
  const tier = getTier(userId);
  if (!tier) return false;
  const tierDef = _tiersDef.get(tier);
  const minDef = _tiersDef.get(tierMinimo);
  if (tierDef && minDef) return tierDef.ordem >= minDef.ordem;
  return TIER_ORDER[tier] >= TIER_ORDER[tierMinimo];
}

export function getAllMembros(): MembroClubeVanta[] {
  return Array.from(_membros.values());
}

export function getAlcanceEstimado(tierMinimo: TierMaisVanta): { membros: number; alcance: number } {
  let membros = 0;
  let alcance = 0;
  const minDef = _tiersDef.get(tierMinimo);
  const minOrdem = minDef?.ordem ?? TIER_ORDER[tierMinimo] ?? 1;
  for (const m of _membros.values()) {
    if (!m.ativo) continue;
    const mDef = _tiersDef.get(m.tier);
    const mOrdem = mDef?.ordem ?? TIER_ORDER[m.tier] ?? 0;
    if (mOrdem >= minOrdem) {
      membros++;
      alcance += m.instagramSeguidores ?? 0;
    }
  }
  return { membros, alcance };
}

export async function alterarTier(userId: string, novoTier: TierMaisVanta, _masterId: string): Promise<void> {
  const { error } = await supabase
    .from('membros_clube')
    .update({ tier: novoTier, categoria: novoTier })
    .eq('user_id', userId);
  if (error) console.error('[clubeMembros] alterarTier:', error);
  const m = _membros.get(userId);
  if (m) {
    m.tier = novoTier;
    m.categoria = novoTier;
  }
  bump();
}
