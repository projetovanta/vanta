/**
 * Módulo A — Insights Engine
 * 5 features: VIP Score, No-Show, Previsão Lotação, Radar Cancelamento, Tendência
 * Zero migrations — tudo calculado de dados existentes.
 */
import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import type {
  ClientScore,
  NoShowAnalysis,
  NoShowTrend,
  NoShowByLote,
  NoShowByPromoter,
  HourlyPrediction,
  ChurnRadarResult,
  ChurnClient,
  TrendAlert,
  TrendDirection,
  TimeSeriesPoint,
  Periodo,
} from './insightsTypes';

// ════════════════════════════════════════════════════
// A1: VIP Score
// gasto × 0.4 + frequencia × 0.35 + recencia × 0.25
// ════════════════════════════════════════════════════

export async function getClientScores(comunidadeId: string, limit = 50): Promise<ClientScore[]> {
  return getCached(
    `client-scores-${comunidadeId}-${limit}`,
    async () => {
      // Buscar eventos da comunidade
      const { data: eventos } = await supabase.from('eventos_admin').select('id').eq('comunidade_id', comunidadeId);
      if (!eventos?.length) return [];

      const eventoIds = eventos.map(e => e.id);

      // Buscar todos tickets com check-in (USADO) desses eventos
      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('owner_id, evento_id, valor, status, usado_em, criado_em')
        .in('evento_id', eventoIds)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('owner_id', 'is', null);

      if (!tickets?.length) return [];

      // Agrupar por owner_id
      const byOwner = new Map<string, { gasto: number; eventosUsados: Set<string>; ultimaData: string }>();

      for (const t of tickets) {
        if (!t.owner_id) continue;
        const entry = byOwner.get(t.owner_id) ?? {
          gasto: 0,
          eventosUsados: new Set<string>(),
          ultimaData: '',
        };
        entry.gasto += t.valor;
        if (t.status === 'USADO') {
          entry.eventosUsados.add(t.evento_id);
          const dt = t.usado_em ?? t.criado_em;
          if (dt > entry.ultimaData) entry.ultimaData = dt;
        }
        byOwner.set(t.owner_id, entry);
      }

      // Normalizar — encontrar máximos
      let maxGasto = 0;
      let maxFreq = 0;
      for (const v of byOwner.values()) {
        if (v.gasto > maxGasto) maxGasto = v.gasto;
        if (v.eventosUsados.size > maxFreq) maxFreq = v.eventosUsados.size;
      }
      if (maxGasto === 0) maxGasto = 1;
      if (maxFreq === 0) maxFreq = 1;

      const now = Date.now();
      const maxDias = 180; // 6 meses

      // Calcular scores
      const scored: { userId: string; score: number; gasto: number; freq: number; ultima: string }[] = [];
      for (const [userId, v] of byOwner) {
        const gastoNorm = v.gasto / maxGasto;
        const freqNorm = v.eventosUsados.size / maxFreq;
        const diasDesde = v.ultimaData ? (now - new Date(v.ultimaData).getTime()) / 86_400_000 : maxDias;
        const recenciaNorm = Math.max(0, 1 - diasDesde / maxDias);

        const score = Math.round((gastoNorm * 0.4 + freqNorm * 0.35 + recenciaNorm * 0.25) * 100);

        scored.push({
          userId,
          score,
          gasto: v.gasto,
          freq: v.eventosUsados.size,
          ultima: v.ultimaData,
        });
      }

      // Ordenar por score desc e limitar
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, limit);

      // Buscar profiles
      const userIds = top.map(s => s.userId);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url, instagram')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

      return top.map((s): ClientScore => {
        const p = profileMap.get(s.userId);
        return {
          userId: s.userId,
          nome: p?.nome ?? 'Desconhecido',
          foto: p?.avatar_url ?? null,
          instagram: p?.instagram ?? null,
          gastoTotal: s.gasto,
          frequencia: s.freq,
          ultimoEvento: s.ultima || null,
          score: s.score,
        };
      });
    },
    300_000,
  ); // cache 5min
}

// ════════════════════════════════════════════════════
// A2: Detector de No-Show
// ════════════════════════════════════════════════════

export async function getNoShowAnalysis(eventoId: string): Promise<NoShowAnalysis> {
  return getCached(
    `no-show-${eventoId}`,
    async () => {
      // Tickets do evento (excluindo cortesias e caixa para focar em vendas reais)
      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('id, status, valor, lote_id, origem')
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      if (!tickets?.length) {
        return {
          eventoId,
          totalVendidos: 0,
          totalUsados: 0,
          totalNoShow: 0,
          taxaNoShow: 0,
          custoFantasma: 0,
          porLote: [],
          porPromoter: [],
        };
      }

      const totalVendidos = tickets.length;
      const usados = tickets.filter(t => t.status === 'USADO');
      const totalUsados = usados.length;
      const noShows = tickets.filter(t => t.status === 'DISPONIVEL');
      const totalNoShow = noShows.length;
      const taxaNoShow = totalVendidos > 0 ? (totalNoShow / totalVendidos) * 100 : 0;
      const custoFantasma = noShows.reduce((sum, t) => sum + t.valor, 0);

      // Por lote
      const loteMap = new Map<string, { vendidos: number; noShows: number }>();
      for (const t of tickets) {
        const lid = t.lote_id ?? 'sem-lote';
        const entry = loteMap.get(lid) ?? { vendidos: 0, noShows: 0 };
        entry.vendidos++;
        if (t.status === 'DISPONIVEL') entry.noShows++;
        loteMap.set(lid, entry);
      }

      // Buscar nomes dos lotes
      const loteIds = [...loteMap.keys()].filter(id => id !== 'sem-lote');
      const { data: lotes } = loteIds.length
        ? await supabase.from('lotes').select('id, nome').in('id', loteIds)
        : { data: [] };
      const loteNomes = new Map<string, string>(lotes?.map(l => [l.id, l.nome] as [string, string]) ?? []);

      const porLote: NoShowByLote[] = [...loteMap.entries()].map(([loteId, v]) => ({
        loteId,
        loteNome: loteNomes.get(loteId) ?? 'Sem lote',
        vendidos: v.vendidos,
        noShows: v.noShows,
        taxa: v.vendidos > 0 ? (v.noShows / v.vendidos) * 100 : 0,
      }));

      // Por promoter — via convidados_lista
      const { data: convidados } = await supabase
        .from('convidados_lista')
        .select('lista_id, checked_in, listas_evento!inner(evento_id, promoter_id)')
        .eq('listas_evento.evento_id', eventoId);

      const promoterMap = new Map<string, { convidados: number; noShows: number }>();
      if (convidados) {
        for (const c of convidados) {
          const lista = c.listas_evento as unknown as {
            promoter_id: string;
          };
          if (!lista?.promoter_id) continue;
          const entry = promoterMap.get(lista.promoter_id) ?? {
            convidados: 0,
            noShows: 0,
          };
          entry.convidados++;
          if (!c.checked_in) entry.noShows++;
          promoterMap.set(lista.promoter_id, entry);
        }
      }

      // Buscar nomes promoters
      const promoterIds = [...promoterMap.keys()];
      const { data: promoterProfiles } = promoterIds.length
        ? await supabase.from('profiles').select('id, nome').in('id', promoterIds)
        : { data: [] };
      const promoterNomes = new Map<string, string>(
        promoterProfiles?.map(p => [p.id, p.nome] as [string, string]) ?? [],
      );

      const porPromoter: NoShowByPromoter[] = [...promoterMap.entries()].map(([pid, v]) => ({
        promoterId: pid,
        promoterNome: promoterNomes.get(pid) ?? 'Desconhecido',
        convidados: v.convidados,
        noShows: v.noShows,
        taxa: v.convidados > 0 ? (v.noShows / v.convidados) * 100 : 0,
      }));

      return {
        eventoId,
        totalVendidos,
        totalUsados,
        totalNoShow,
        taxaNoShow,
        custoFantasma,
        porLote,
        porPromoter,
      };
    },
    60_000,
  );
}

export async function getNoShowTrend(comunidadeId: string, _periodo: Periodo): Promise<NoShowTrend> {
  return getCached(
    `no-show-trend-${comunidadeId}`,
    async () => {
      const { data: eventos } = (await supabase
        .from('eventos_admin')
        .select('id, nome, data_inicio')
        .eq('comunidade_id', comunidadeId)
        .eq('status_evento', 'FINALIZADO')
        .order('data_inicio', { ascending: false })
        .limit(10)) as { data: { id: string; nome: string; data_inicio: string }[] | null };

      if (!eventos?.length) {
        return { comunidadeId, pontos: [], mediaGeral: 0 };
      }

      const pontos: TimeSeriesPoint[] = [];
      let somaTotal = 0;

      for (const ev of eventos) {
        const { count: vendidos } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .eq('evento_id', ev.id)
          .in('status', ['DISPONIVEL', 'USADO'])
          .not('origem', 'in', '("CORTESIA","CAIXA")');

        const { count: usados } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .eq('evento_id', ev.id)
          .eq('status', 'USADO')
          .not('origem', 'in', '("CORTESIA","CAIXA")');

        const total = vendidos ?? 0;
        const used = usados ?? 0;
        const taxa = total > 0 ? ((total - used) / total) * 100 : 0;
        somaTotal += taxa;

        pontos.push({
          date: ev.data_inicio,
          value: Math.round(taxa * 10) / 10,
          label: ev.nome,
        });
      }

      pontos.reverse(); // cronológico
      const mediaGeral = pontos.length > 0 ? somaTotal / pontos.length : 0;

      return {
        comunidadeId,
        pontos,
        mediaGeral: Math.round(mediaGeral * 10) / 10,
      };
    },
    300_000,
  );
}

// ════════════════════════════════════════════════════
// A3: Previsão de Lotação
// ════════════════════════════════════════════════════

export async function getLotacaoPrevisao(eventoId: string): Promise<HourlyPrediction[]> {
  return getCached(
    `lotacao-previsao-${eventoId}`,
    async () => {
      // Buscar evento alvo
      const { data: evento } = (await supabase
        .from('eventos_admin')
        .select('id, comunidade_id, data_inicio')
        .eq('id', eventoId)
        .maybeSingle()) as { data: { id: string; comunidade_id: string; data_inicio: string } | null };

      if (!evento) return [];

      const eventoDate = new Date(evento.data_inicio);
      const diaSemana = eventoDate.getDay();

      // Buscar eventos similares: mesma comunidade, mesmo dia da semana, encerrados
      const { data: similares } = (await supabase
        .from('eventos_admin')
        .select('id, data_inicio')
        .eq('comunidade_id', evento.comunidade_id)
        .eq('status_evento', 'FINALIZADO')
        .neq('id', eventoId)
        .order('data_inicio', { ascending: false })
        .limit(20)) as { data: { id: string; data_inicio: string }[] | null };

      // Filtrar por dia da semana similar
      const eventosSimilares = (similares ?? [])
        .filter(e => {
          const d = new Date(e.data_inicio);
          return d.getDay() === diaSemana;
        })
        .slice(0, 8);

      if (!eventosSimilares.length) return [];

      // Buscar check-ins por hora de cada evento similar
      const hourlyData = new Map<number, number[]>(); // hora → [contagens]

      for (const ev of eventosSimilares) {
        const { data: checkins } = await supabase
          .from('tickets_caixa')
          .select('usado_em')
          .eq('evento_id', ev.id)
          .eq('status', 'USADO')
          .not('usado_em', 'is', null);

        if (!checkins?.length) continue;

        const byHour = new Map<number, number>();
        for (const c of checkins) {
          if (!c.usado_em) continue;
          const h = new Date(c.usado_em).getHours();
          byHour.set(h, (byHour.get(h) ?? 0) + 1);
        }

        for (const [hora, count] of byHour) {
          const arr = hourlyData.get(hora) ?? [];
          arr.push(count);
          hourlyData.set(hora, arr);
        }
      }

      // Calcular média e desvio por hora
      const predictions: HourlyPrediction[] = [];
      for (let h = 0; h < 24; h++) {
        const values = hourlyData.get(h);
        if (!values?.length) continue;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
        const stdDev = Math.sqrt(variance);

        predictions.push({
          hora: h,
          estimado: Math.round(mean),
          min: Math.max(0, Math.round(mean - stdDev)),
          max: Math.round(mean + stdDev),
          confianca: values.length >= 3 ? 0.8 : values.length >= 2 ? 0.5 : 0.3,
        });
      }

      predictions.sort((a, b) => a.hora - b.hora);
      return predictions;
    },
    600_000,
  ); // cache 10min
}

// ════════════════════════════════════════════════════
// A4: Radar de Cancelamento (Churn)
// ════════════════════════════════════════════════════

export async function getChurnRadar(comunidadeId: string): Promise<ChurnRadarResult> {
  return getCached(
    `churn-radar-${comunidadeId}`,
    async () => {
      // Eventos encerrados nos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: eventos } = (await supabase
        .from('eventos_admin')
        .select('id, data_inicio, nome')
        .eq('comunidade_id', comunidadeId)
        .eq('status_evento', 'FINALIZADO')
        .gte('data_inicio', sixMonthsAgo.toISOString())
        .order('data_inicio', { ascending: false })) as {
        data: { id: string; data_inicio: string; nome: string }[] | null;
      };

      if (!eventos || eventos.length < 3) {
        return { comunidadeId, clientesEmRisco: [], totalEmRisco: 0 };
      }

      const ultimos2 = eventos.slice(0, 2).map(e => e.id);
      const anteriores = eventos.slice(2).map(e => e.id);

      // Clientes que compraram nos eventos anteriores
      const { data: ticketsAnteriores } = await supabase
        .from('tickets_caixa')
        .select('owner_id, evento_id, valor')
        .in('evento_id', anteriores)
        .eq('status', 'USADO')
        .not('owner_id', 'is', null);

      if (!ticketsAnteriores?.length) {
        return { comunidadeId, clientesEmRisco: [], totalEmRisco: 0 };
      }

      // Contar por cliente
      const clienteAnterior = new Map<string, { eventos: Set<string>; gasto: number }>();
      for (const t of ticketsAnteriores) {
        if (!t.owner_id) continue;
        const entry = clienteAnterior.get(t.owner_id) ?? {
          eventos: new Set<string>(),
          gasto: 0,
        };
        entry.eventos.add(t.evento_id);
        entry.gasto += t.valor;
        clienteAnterior.set(t.owner_id, entry);
      }

      // Filtrar: ≥3 eventos anteriores
      const frequentes = [...clienteAnterior.entries()].filter(([, v]) => v.eventos.size >= 3);

      if (!frequentes.length) {
        return { comunidadeId, clientesEmRisco: [], totalEmRisco: 0 };
      }

      // Clientes dos últimos 2 eventos
      const { data: ticketsRecentes } = await supabase
        .from('tickets_caixa')
        .select('owner_id')
        .in('evento_id', ultimos2)
        .not('owner_id', 'is', null);

      const recentes = new Set(ticketsRecentes?.map(t => t.owner_id) ?? []);

      // Em risco = frequente + NÃO comprou nos últimos 2
      const emRisco = frequentes.filter(([uid]) => !recentes.has(uid));

      if (!emRisco.length) {
        return { comunidadeId, clientesEmRisco: [], totalEmRisco: 0 };
      }

      // Buscar profiles
      const userIds = emRisco.map(([uid]) => uid);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .in('id', userIds.slice(0, 50));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

      // Encontrar último evento de cada cliente em risco
      const eventoMap = new Map(eventos.map(e => [e.id, e]));

      const clientesEmRisco: ChurnClient[] = emRisco
        .map(([uid, v]) => {
          const p = profileMap.get(uid);
          // Achar último evento
          let ultimoEventoId = '';
          let ultimaData = '';
          for (const eid of v.eventos) {
            const ev = eventoMap.get(eid);
            if (ev && ev.data_inicio > ultimaData) {
              ultimaData = ev.data_inicio;
              ultimoEventoId = eid;
            }
          }
          const ultimoEv = eventoMap.get(ultimoEventoId);

          return {
            userId: uid,
            nome: p?.nome ?? 'Desconhecido',
            foto: p?.avatar_url ?? null,
            ultimoEvento: ultimoEv?.nome ?? '',
            ultimaData,
            gastoTotal: v.gasto,
            eventosAnteriores: v.eventos.size,
          };
        })
        .sort((a, b) => b.gastoTotal - a.gastoTotal)
        .slice(0, 50);

      return {
        comunidadeId,
        clientesEmRisco,
        totalEmRisco: emRisco.length,
      };
    },
    300_000,
  ); // cache 5min
}

// ════════════════════════════════════════════════════
// A5: Alerta de Tendência Negativa
// ════════════════════════════════════════════════════

export async function getTrendAlerts(comunidadeId: string): Promise<TrendAlert[]> {
  return getCached(
    `trend-alerts-${comunidadeId}`,
    async () => {
      const { data: eventos } = (await supabase
        .from('eventos_admin')
        .select('id, data_inicio')
        .eq('comunidade_id', comunidadeId)
        .eq('status_evento', 'FINALIZADO')
        .order('data_inicio', { ascending: false })
        .limit(6)) as { data: { id: string; data_inicio: string }[] | null };

      if (!eventos || eventos.length < 4) return [];

      const recentes = eventos.slice(0, 3);
      const anteriores = eventos.slice(3, 6);

      async function getMetricas(eventoIds: string[]) {
        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('status, valor, origem')
          .in('evento_id', eventoIds)
          .in('status', ['DISPONIVEL', 'USADO'])
          .not('origem', 'in', '("CORTESIA","CAIXA")');

        const all = tickets ?? [];
        const vendas = all.length;
        const usados = all.filter(t => t.status === 'USADO').length;
        const receita = all.reduce((s, t) => s + t.valor, 0);
        const ticketMedio = vendas > 0 ? receita / vendas : 0;
        const checkinRate = vendas > 0 ? (usados / vendas) * 100 : 0;

        return { vendas, usados, receita, ticketMedio, checkinRate };
      }

      const metricasRecentes = await getMetricas(recentes.map(e => e.id));
      const metricasAnteriores = await getMetricas(anteriores.map(e => e.id));

      const alerts: TrendAlert[] = [];

      function addAlert(metrica: TrendAlert['metrica'], atual: number, anterior: number, sugestaoDown: string) {
        if (anterior === 0) return;
        const variacao = ((atual - anterior) / anterior) * 100;
        const direcao: TrendDirection = variacao < -15 ? 'DOWN' : variacao > 15 ? 'UP' : 'STABLE';

        // Só alerta se queda ou subida significativa
        if (direcao === 'STABLE') return;

        alerts.push({
          metrica,
          direcao,
          valorAtual: Math.round(atual * 100) / 100,
          valorAnterior: Math.round(anterior * 100) / 100,
          variacao: Math.round(variacao * 10) / 10,
          sugestao: direcao === 'DOWN' ? sugestaoDown : '',
        });
      }

      addAlert(
        'VENDAS',
        metricasRecentes.vendas,
        metricasAnteriores.vendas,
        'Considere ajustar preços ou investir mais em divulgação',
      );
      addAlert(
        'PUBLICO',
        metricasRecentes.usados,
        metricasAnteriores.usados,
        'A presença está caindo. Verifique se a experiência está à altura',
      );
      addAlert(
        'TICKET_MEDIO',
        metricasRecentes.ticketMedio,
        metricasAnteriores.ticketMedio,
        'O ticket médio está caindo. Revise a estratégia de lotes',
      );
      addAlert(
        'CHECKIN_RATE',
        metricasRecentes.checkinRate,
        metricasAnteriores.checkinRate,
        'Mais gente comprando e não indo. Considere confirmar presença pré-evento',
      );

      return alerts;
    },
    300_000,
  );
}
