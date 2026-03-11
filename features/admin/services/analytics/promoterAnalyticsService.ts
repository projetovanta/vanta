/**
 * promoterAnalyticsService — Analytics específico por promoter.
 *
 * Métricas de performance: nomes adicionados, check-ins, taxa de conversão,
 * comissão, série temporal de nomes por dia.
 *
 * Fonte de dados: equipe_evento, listas_evento, convidados_lista, profiles.
 * Cache: 30s via getCached.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import type { PromoterMetrics, TimeSeriesPoint } from './types';
import { listasService } from '../listasService';
import { eventosAdminService } from '../eventosAdminService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const round2 = (x: number): number => Math.round(x * 100) / 100;

/** Extrai YYYY-MM-DD de um ISO string */
function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// ── Tipos de resultado ───────────────────────────────────────────────────────

export interface PromoterEventMetrics {
  eventoId: string;
  eventoNome: string;
  listas: number;
  totalNomes: number;
  totalCheckins: number;
  taxaConversao: number;
  comissao: number;
}

export interface PromoterAnalyticsResult {
  promoterId: string;
  promoterNome: string;
  eventos: PromoterEventMetrics[];
  totals: PromoterMetrics;
  nomesTimeSeries: TimeSeriesPoint[];
}

// ── Tipos internos ───────────────────────────────────────────────────────────

interface ConvidadoRow {
  id: string;
  lista_id: string;
  inserido_por: string | null;
  checked_in: boolean;
  created_at: string;
}

interface EquipeRow {
  evento_id: string;
  membro_id: string;
  papel: string;
}

// ── Fetch nome do promoter ───────────────────────────────────────────────────

async function fetchPromoterNome(promoterId: string): Promise<string> {
  const { data } = await supabase.from('profiles').select('nome').eq('id', promoterId).maybeSingle();

  return data?.nome ?? '';
}

// ── Fetch eventos onde o promoter atua ──────────────────────────────────────

async function fetchPromoterEventos(promoterId: string, eventoId?: string): Promise<EquipeRow[]> {
  let query = supabase
    .from('equipe_evento')
    .select('evento_id, membro_id, papel')
    .eq('membro_id', promoterId)
    .eq('papel', 'promoter')
    .limit(500);

  if (eventoId) {
    query = query.eq('evento_id', eventoId);
  }

  const { data } = await query;
  return (data ?? []) as EquipeRow[];
}

// ── Fetch convidados de listas específicas ──────────────────────────────────

async function fetchConvidadosByListas(listaIds: string[]): Promise<ConvidadoRow[]> {
  if (listaIds.length === 0) return [];

  const { data } = await supabase
    .from('convidados_lista')
    .select('id, lista_id, inserido_por, checked_in, created_at')
    .in('lista_id', listaIds)
    .limit(2000);

  return (data ?? []).map(row => ({
    id: row.id,
    lista_id: row.lista_id,
    inserido_por: row.inserido_por,
    checked_in: row.checked_in ?? false,
    created_at: row.created_at,
  }));
}

// ── Calcular métricas por evento ─────────────────────────────────────────────

function calcEventMetrics(
  eventoId: string,
  eventoNome: string,
  promoterId: string,
  convidados: ConvidadoRow[],
  listasDoEvento: string[],
): PromoterEventMetrics {
  // Filtrar convidados deste promoter neste evento
  const convidadosPromoter = convidados.filter(
    c => listasDoEvento.includes(c.lista_id) && c.inserido_por === promoterId,
  );

  const totalNomes = convidadosPromoter.length;
  const totalCheckins = convidadosPromoter.filter(c => c.checked_in).length;
  const taxaConversao = totalNomes > 0 ? round2((totalCheckins / totalNomes) * 100) : 0;

  return {
    eventoId,
    eventoNome,
    listas: listasDoEvento.length,
    totalNomes,
    totalCheckins,
    taxaConversao,
    comissao: 0, // Comissão depende das regras da lista — preenchido abaixo
  };
}

// ── Calcular comissão do promoter ────────────────────────────────────────────

function calcComissao(eventoId: string, promoterId: string, totalCheckins: number): number {
  // Comissão baseada nas cotas do promoter
  // Usa listasService para acessar as regras de comissão
  if (!listasService.isReady) return 0;

  const listas = listasService.getListasByEvento(eventoId);
  let comissaoTotal = 0;

  for (const lista of listas) {
    const cotas = lista.cotas?.filter(c => c.promoterId === promoterId) ?? [];
    for (const cota of cotas) {
      // Regra de comissão: verificar na lista se existe valor por check-in
      const regra = lista.regras?.find(r => r.id === cota.regraId);
      if (regra) {
        // Comissão = número de check-ins usados * valor da regra (se aplicável)
        // Como o schema não tem campo de comissão explícito, usamos usado da cota
        comissaoTotal += cota.usado;
      }
    }
  }

  // Se não há regras de comissão explícitas, retorna 0
  // O sistema real de comissão deve ser implementado via regras da lista
  return round2(comissaoTotal);
}

// ── Build time series de nomes adicionados ──────────────────────────────────

function buildNomesTimeSeries(convidados: ConvidadoRow[], promoterId: string): TimeSeriesPoint[] {
  const dailyMap = new Map<string, number>();

  for (const c of convidados) {
    if (c.inserido_por !== promoterId) continue;
    const key = toDateKey(c.created_at);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function getPromoterAnalytics(promoterId: string, eventoId?: string): Promise<PromoterAnalyticsResult> {
  return getCached(
    `analytics:promoter:${promoterId}:${eventoId ?? 'all'}`,
    async () => {
      // Garantir services prontos
      if (!eventosAdminService.isReady) await eventosAdminService.refresh();
      if (!listasService.isReady) await listasService.refresh();

      // Fetch dados em paralelo
      const [promoterNome, equipeRows] = await Promise.all([
        fetchPromoterNome(promoterId),
        fetchPromoterEventos(promoterId, eventoId),
      ]);

      if (equipeRows.length === 0) {
        return {
          promoterId,
          promoterNome,
          eventos: [],
          totals: {
            promoterId,
            promoterNome,
            listasAtribuidas: 0,
            totalNomes: 0,
            totalCheckins: 0,
            taxaConversao: 0,
            comissao: 0,
          },
          nomesTimeSeries: [],
        };
      }

      // IDs de eventos onde o promoter atua
      const eventoIds = equipeRows.map(e => e.evento_id);

      // Buscar listas dos eventos
      const allListas: { eventoId: string; listaIds: string[] }[] = [];
      const allListaIds: string[] = [];

      for (const evId of eventoIds) {
        const listas = listasService.getListasByEvento(evId);
        // Filtrar listas onde o promoter tem cotas
        const listasPromoter = listas.filter(l => l.cotas?.some(c => c.promoterId === promoterId));
        const ids = listasPromoter.map(l => l.id);
        allListas.push({ eventoId: evId, listaIds: ids });
        allListaIds.push(...ids);
      }

      // Fetch convidados de todas as listas relevantes
      const convidados = await fetchConvidadosByListas(allListaIds);

      // Lookup nomes de eventos
      const eventosMap = new Map<string, string>();
      for (const ev of eventosAdminService.getEventos()) {
        eventosMap.set(ev.id, ev.nome);
      }

      // Métricas por evento
      const eventMetrics: PromoterEventMetrics[] = [];

      for (const { eventoId: evId, listaIds } of allListas) {
        const metrics = calcEventMetrics(evId, eventosMap.get(evId) ?? '', promoterId, convidados, listaIds);

        // Calcular comissão
        metrics.comissao = calcComissao(evId, promoterId, metrics.totalCheckins);

        eventMetrics.push(metrics);
      }

      // Totais
      const totalListas = eventMetrics.reduce((sum, e) => sum + e.listas, 0);
      const totalNomes = eventMetrics.reduce((sum, e) => sum + e.totalNomes, 0);
      const totalCheckins = eventMetrics.reduce((sum, e) => sum + e.totalCheckins, 0);
      const totalComissao = eventMetrics.reduce((sum, e) => sum + e.comissao, 0);
      const taxaConversaoGlobal = totalNomes > 0 ? round2((totalCheckins / totalNomes) * 100) : 0;

      // Time series
      const nomesTimeSeries = buildNomesTimeSeries(convidados, promoterId);

      return {
        promoterId,
        promoterNome,
        eventos: eventMetrics,
        totals: {
          promoterId,
          promoterNome,
          listasAtribuidas: totalListas,
          totalNomes,
          totalCheckins,
          taxaConversao: taxaConversaoGlobal,
          comissao: round2(totalComissao),
        },
        nomesTimeSeries,
      };
    },
    30_000,
  );
}
