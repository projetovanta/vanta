/**
 * staffAnalyticsService — Métricas de performance de equipe por evento.
 *
 * Agrega check-ins e vendas de caixa (porta) por membro da equipe.
 *
 * Fonte de dados: equipe_evento, tickets_caixa, profiles.
 * Cache: 30s via getCached.
 */

import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import type { StaffMemberMetrics } from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const round2 = (x: number): number => Math.round(x * 100) / 100;

// ── Tipos de resultado ───────────────────────────────────────────────────────

export interface StaffMetricsResult {
  eventoId: string;
  members: StaffMemberMetrics[];
  totalCheckins: number;
  totalVendasCaixa: number;
  totalValorCaixa: number;
}

// ── Tipos internos ───────────────────────────────────────────────────────────

interface EquipeMemberRow {
  id: string;
  membro_id: string;
  papel: string;
}

interface TicketCaixaRow {
  id: string;
  criado_por: string | null;
  usado_por: string | null;
  usado_em: string | null;
  origem: string;
  status: string;
  valor: number;
}

interface ProfileRow {
  id: string;
  nome: string;
}

// ── Fetch equipe do evento ──────────────────────────────────────────────────

async function fetchEquipe(eventoId: string): Promise<EquipeMemberRow[]> {
  const { data } = await supabase
    .from('equipe_evento')
    .select('id, membro_id, papel')
    .eq('evento_id', eventoId)
    .limit(200);

  return (data ?? []).map(row => ({
    id: row.id,
    membro_id: row.membro_id,
    papel: row.papel,
  }));
}

// ── Fetch tickets_caixa do evento ───────────────────────────────────────────

async function fetchTicketsCaixa(eventoId: string): Promise<TicketCaixaRow[]> {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('id, criado_por, usado_por, usado_em, origem, status, valor')
    .eq('evento_id', eventoId)
    .limit(2000);

  return (data ?? []).map(row => ({
    id: row.id,
    criado_por: row.criado_por,
    usado_por: row.usado_por,
    usado_em: row.usado_em,
    origem: row.origem ?? '',
    status: row.status ?? '',
    valor: Number(row.valor ?? 0),
  }));
}

// ── Fetch nomes de profiles ─────────────────────────────────────────────────

async function fetchProfileNames(memberIds: string[]): Promise<Map<string, string>> {
  if (memberIds.length === 0) return new Map();

  const { data } = await supabase.from('profiles').select('id, nome').in('id', memberIds).limit(200);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.id, row.nome ?? '');
  }
  return map;
}

// ── Calcular métricas de vendas de caixa (porta) por membro ─────────────────

function calcVendasCaixa(membroId: string, tickets: TicketCaixaRow[]): { vendas: number; valor: number } {
  // Vendas de porta: tickets criados por este membro com origem='PORTA'
  const vendasPorta = tickets.filter(t => t.criado_por === membroId && t.origem === 'PORTA');

  return {
    vendas: vendasPorta.length,
    valor: round2(vendasPorta.reduce((sum, t) => sum + t.valor, 0)),
  };
}

// ── Calcular check-ins por membro ───────────────────────────────────────────

function calcCheckins(membroId: string, tickets: TicketCaixaRow[]): number {
  // Check-ins realizados por este membro (usado_por = membroId)
  return tickets.filter(t => t.usado_por === membroId && t.usado_em !== null).length;
}

// ── Calcular check-ins não atribuídos (distribuir entre portaria) ───────────

function calcUnattributedCheckins(
  tickets: TicketCaixaRow[],
  equipe: EquipeMemberRow[],
): { total: number; portariaIds: string[] } {
  // Check-ins sem usado_por (legados ou sistema)
  const unattributed = tickets.filter(t => t.usado_em !== null && !t.usado_por);

  const portariaIds = equipe.filter(m => m.papel === 'portaria').map(m => m.membro_id);

  return { total: unattributed.length, portariaIds };
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function getStaffMetrics(eventoId: string): Promise<StaffMetricsResult> {
  return getCached(
    `analytics:staff:${eventoId}`,
    async () => {
      // Fetch dados em paralelo
      const [equipe, tickets] = await Promise.all([fetchEquipe(eventoId), fetchTicketsCaixa(eventoId)]);

      if (equipe.length === 0) {
        return {
          eventoId,
          members: [],
          totalCheckins: 0,
          totalVendasCaixa: 0,
          totalValorCaixa: 0,
        };
      }

      // Fetch nomes
      const memberIds = [...new Set(equipe.map(m => m.membro_id))];
      const namesMap = await fetchProfileNames(memberIds);

      // Check-ins não atribuídos
      const { total: unattributedCheckins, portariaIds } = calcUnattributedCheckins(tickets, equipe);
      const unattributedPerPortaria =
        portariaIds.length > 0 ? Math.floor(unattributedCheckins / portariaIds.length) : 0;
      const unattributedRemainder = portariaIds.length > 0 ? unattributedCheckins % portariaIds.length : 0;

      // Métricas por membro
      const members: StaffMemberMetrics[] = [];
      let totalCheckins = 0;
      let totalVendasCaixa = 0;
      let totalValorCaixa = 0;

      // Agrupar equipe por membro_id (pode ter múltiplos papéis)
      const membroMap = new Map<string, Set<string>>();
      for (const m of equipe) {
        const papeis = membroMap.get(m.membro_id) ?? new Set();
        papeis.add(m.papel);
        membroMap.set(m.membro_id, papeis);
      }

      let portariaIndex = 0;

      for (const [membroId, papeis] of membroMap) {
        const papel = Array.from(papeis).join(', ');

        // Check-ins atribuídos a este membro
        let checkins = calcCheckins(membroId, tickets);

        // Distribuir check-ins não atribuídos entre membros de portaria
        if (portariaIds.includes(membroId)) {
          checkins += unattributedPerPortaria;
          // Distribuir o resto para os primeiros membros de portaria
          if (portariaIndex < unattributedRemainder) {
            checkins += 1;
          }
          portariaIndex += 1;
        }

        // Vendas de caixa (porta)
        const { vendas, valor } = calcVendasCaixa(membroId, tickets);

        members.push({
          membroId,
          membroNome: namesMap.get(membroId) ?? '',
          papel,
          checkins,
          vendasCaixa: vendas,
          valorVendasCaixa: round2(valor),
        });

        totalCheckins += checkins;
        totalVendasCaixa += vendas;
        totalValorCaixa += valor;
      }

      // Ordenar por check-ins (desc)
      members.sort((a, b) => b.checkins - a.checkins);

      return {
        eventoId,
        members,
        totalCheckins,
        totalVendasCaixa,
        totalValorCaixa: round2(totalValorCaixa),
      };
    },
    30_000,
  );
}
