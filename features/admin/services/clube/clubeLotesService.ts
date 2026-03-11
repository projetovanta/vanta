/**
 * clubeLotesService — CRUD para mais_vanta_config_evento.
 * Liga tier MAIS VANTA → lote real ou lista real de um evento.
 */
import { supabase } from '../../../../services/supabaseClient';
import type { Database } from '../../../../types/supabase';

type Row = Database['public']['Tables']['mais_vanta_config_evento']['Row'];
type Insert = Database['public']['Tables']['mais_vanta_config_evento']['Insert'];

export interface BeneficioMV {
  id: string;
  eventoId: string;
  tierMinimo: string;
  tipo: 'ingresso' | 'lista';
  loteId: string | null;
  listaId: string | null;
  descontoPercentual: number | null;
  creatorSublevelMinimo: string | null;
  vagasLimite: number | null;
  vagasResgatadas: number;
  ativo: boolean;
}

const rowToBeneficio = (r: Row): BeneficioMV => ({
  id: r.id,
  eventoId: r.evento_id,
  tierMinimo: r.tier_minimo,
  tipo: r.tipo as 'ingresso' | 'lista',
  loteId: r.lote_id,
  listaId: r.lista_id,
  descontoPercentual: r.desconto_percentual,
  creatorSublevelMinimo: r.creator_sublevel_minimo,
  vagasLimite: r.vagas_limite,
  vagasResgatadas: r.vagas_resgatadas ?? 0,
  ativo: r.ativo,
});

/** Busca todos os benefícios MV de um evento */
export async function getBeneficiosEvento(eventoId: string): Promise<BeneficioMV[]> {
  const { data, error } = await supabase
    .from('mais_vanta_config_evento')
    .select('*')
    .eq('evento_id', eventoId)
    .order('tier_minimo');
  if (error) {
    console.error('[clubeLotesService] getBeneficiosEvento:', error);
    return [];
  }
  return (data ?? []).map(rowToBeneficio);
}

/** Salva benefícios MV de um evento (delete + insert atômico) */
export async function salvarBeneficiosEvento(
  eventoId: string,
  beneficios: Omit<BeneficioMV, 'id' | 'eventoId'>[],
): Promise<BeneficioMV[]> {
  // Remover existentes
  const { error: delErr } = await supabase.from('mais_vanta_config_evento').delete().eq('evento_id', eventoId);
  if (delErr) {
    console.error('[clubeLotesService] delete benefícios:', delErr);
    return [];
  }

  if (beneficios.length === 0) return [];

  const rows: Insert[] = beneficios.map(b => ({
    evento_id: eventoId,
    tier_minimo: b.tierMinimo,
    tipo: b.tipo,
    lote_id: b.tipo === 'ingresso' ? b.loteId : null,
    lista_id: b.tipo === 'lista' ? b.listaId : null,
    desconto_percentual: b.descontoPercentual,
    creator_sublevel_minimo: b.creatorSublevelMinimo ?? null,
    vagas_limite: b.vagasLimite ?? null,
    ativo: b.ativo,
  }));

  const { data, error } = await supabase.from('mais_vanta_config_evento').insert(rows).select('*');
  if (error) {
    console.error('[clubeLotesService] insert benefícios:', error);
    return [];
  }
  return (data ?? []).map(rowToBeneficio);
}

/** Remove todos os benefícios MV de um evento */
export async function removerBeneficiosEvento(eventoId: string): Promise<void> {
  const { error } = await supabase.from('mais_vanta_config_evento').delete().eq('evento_id', eventoId);
  if (error) console.error('[clubeLotesService] removerBeneficiosEvento:', error);
}

// ── Stubs legados (consumers antigos) ────────────────────────────────────────
import type { LoteMaisVanta } from '../../../../types';

/** @deprecated use getBeneficiosEvento */
export function getLoteMaisVanta(_eventoId: string): LoteMaisVanta | null {
  return null;
}
/** @deprecated use getBeneficiosEvento */
export function getLotesEvento(_eventoId: string): LoteMaisVanta[] {
  return [];
}
/** @deprecated */
export function getLoteParaTier(_eventoId: string, _userId: string): LoteMaisVanta | null {
  return null;
}
/** @deprecated */
export function getAllLotes(): LoteMaisVanta[] {
  return [];
}
/** @deprecated use salvarBeneficiosEvento */
export async function upsertLotesMaisVanta(
  _eventoId: string,
  _lotes: Array<Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>>,
): Promise<LoteMaisVanta[]> {
  return [];
}
/** @deprecated use salvarBeneficiosEvento */
export async function upsertLoteMaisVanta(
  _eventoId: string,
  _lote: Omit<LoteMaisVanta, 'id' | 'eventoId' | 'reservados'>,
): Promise<LoteMaisVanta> {
  throw new Error('use salvarBeneficiosEvento');
}
/** @deprecated use removerBeneficiosEvento */
export async function removeLotesMaisVanta(_eventoId: string): Promise<void> {}
/** @deprecated */
export async function removeLoteMaisVanta(_eventoId: string): Promise<void> {}
