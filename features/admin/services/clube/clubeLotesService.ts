import type { LoteMaisVanta } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { _lotes, bump, rowToLote } from './clubeCache';
import { getTier, tierSuficiente } from './clubeMembrosService';

/** @deprecated Retorna primeiro lote do evento (legado). Usar getLotesEvento() */
export function getLoteMaisVanta(eventoId: string): LoteMaisVanta | null {
  return _lotes.find(l => l.eventoId === eventoId) ?? null;
}

export function getLotesEvento(eventoId: string): LoteMaisVanta[] {
  return _lotes.filter(l => l.eventoId === eventoId);
}

export function getLoteParaTier(eventoId: string, userId: string): LoteMaisVanta | null {
  const tier = getTier(userId);
  if (!tier) return null;
  const lotesEvento = getLotesEvento(eventoId);
  const loteExato = lotesEvento.find(l => l.tierId === tier);
  if (loteExato) return loteExato;
  const loteLegado = lotesEvento.find(l => !l.tierId);
  if (loteLegado && tierSuficiente(userId, loteLegado.tierMinimo)) return loteLegado;
  return null;
}

export function getAllLotes(): LoteMaisVanta[] {
  return [..._lotes];
}

export async function upsertLotesMaisVanta(
  eventoId: string,
  lotes: Array<Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>>,
): Promise<LoteMaisVanta[]> {
  const { error: errDel } = await supabase.from('lotes_mais_vanta').delete().eq('evento_id', eventoId);
  if (errDel) console.error('[clubeLotes] upsertLotes delete:', errDel);
  const idxs = _lotes.reduce<number[]>((acc, l, i) => (l.eventoId === eventoId ? [...acc, i] : acc), []);
  for (let i = idxs.length - 1; i >= 0; i--) _lotes.splice(idxs[i], 1);

  const results: LoteMaisVanta[] = [];
  for (const lote of lotes) {
    const row = {
      evento_id: eventoId,
      tier_minimo: lote.tierMinimo,
      tier_id: lote.tierId ?? null,
      quantidade: lote.quantidade,
      prazo: lote.prazo ?? null,
      descricao: lote.descricao ?? null,
      com_acompanhante: lote.comAcompanhante ?? false,
      acompanhantes: lote.acompanhantes ?? 0,
      tipo_acesso: lote.tipoAcesso ?? 'Pista',
    };
    const { data, error } = await supabase.from('lotes_mais_vanta').insert(row).select().single();
    if (error) throw error;
    const created = rowToLote(data);
    _lotes.push(created);
    results.push(created);
  }
  bump();
  return results;
}

/** @deprecated Manter compat — upsert de lote único legado */
export async function upsertLoteMaisVanta(
  eventoId: string,
  lote: Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>,
): Promise<LoteMaisVanta> {
  const existing = _lotes.find(l => l.eventoId === eventoId && (!l.tierId || l.tierId === lote.tierId));
  if (existing) {
    await supabase
      .from('lotes_mais_vanta')
      .update({
        tier_minimo: lote.tierMinimo,
        tier_id: lote.tierId ?? null,
        quantidade: lote.quantidade,
        prazo: lote.prazo ?? null,
        descricao: lote.descricao ?? null,
        com_acompanhante: lote.comAcompanhante ?? false,
        acompanhantes: lote.acompanhantes ?? 0,
        tipo_acesso: lote.tipoAcesso ?? 'Pista',
      })
      .eq('id', existing.id);
    Object.assign(existing, {
      tierMinimo: lote.tierMinimo,
      tierId: lote.tierId,
      quantidade: lote.quantidade,
      prazo: lote.prazo,
      descricao: lote.descricao,
      comAcompanhante: lote.comAcompanhante,
      acompanhantes: lote.acompanhantes ?? 0,
      tipoAcesso: lote.tipoAcesso ?? 'Pista',
    });
    bump();
    return existing;
  }

  const row = {
    evento_id: eventoId,
    tier_minimo: lote.tierMinimo,
    tier_id: lote.tierId ?? null,
    quantidade: lote.quantidade,
    prazo: lote.prazo ?? null,
    descricao: lote.descricao ?? null,
    com_acompanhante: lote.comAcompanhante ?? false,
    acompanhantes: lote.acompanhantes ?? 0,
    tipo_acesso: lote.tipoAcesso ?? 'Pista',
  };
  const { data, error } = await supabase.from('lotes_mais_vanta').insert(row).select().single();
  if (error) throw error;
  const created = rowToLote(data);
  _lotes.push(created);
  bump();
  return created;
}

export async function removeLotesMaisVanta(eventoId: string): Promise<void> {
  const { error } = await supabase.from('lotes_mais_vanta').delete().eq('evento_id', eventoId);
  if (error) console.error('[clubeLotes] removeLotes:', error);
  const idxs = _lotes.reduce<number[]>((acc, l, i) => (l.eventoId === eventoId ? [...acc, i] : acc), []);
  for (let i = idxs.length - 1; i >= 0; i--) _lotes.splice(idxs[i], 1);
  bump();
}

/** @deprecated Usar removeLotesMaisVanta */
export async function removeLoteMaisVanta(eventoId: string): Promise<void> {
  return removeLotesMaisVanta(eventoId);
}
