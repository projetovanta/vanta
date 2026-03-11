/**
 * Módulo B — Financial Intelligence
 * 3 features: Pricing Dinâmico, Split Automático, Break-Even
 * Reutiliza getContractedFees e getResumoFinanceiroEvento.
 */
import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import { EVENTOS_ADMIN } from '../eventosAdminCore';
import { getContractedFees, getResumoFinanceiroEvento } from '../eventosAdminFinanceiro';
import type {
  PricingSuggestion,
  PricingAction,
  SplitResult,
  SplitItem,
  BreakEvenResult,
  TimeSeriesPoint,
} from './financialTypes';

// ════════════════════════════════════════════════════
// B1: Pricing Dinâmico
// ════════════════════════════════════════════════════

export async function getPricingSuggestion(eventoId: string): Promise<PricingSuggestion | null> {
  return getCached(
    `pricing-${eventoId}`,
    async () => {
      const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
      if (!ev) return null;

      // Capacidade total (soma de variações ativas)
      let capacidadeTotal = 0;
      for (const lote of ev.lotes) {
        if (!lote.ativo) continue;
        for (const v of lote.variacoes) {
          capacidadeTotal += v.limite;
        }
      }
      if (capacidadeTotal === 0) return null;

      // Tickets vendidos (não cancelados/reembolsados)
      const { count: vendidos } = await supabase
        .from('tickets_caixa')
        .select('*', { count: 'exact', head: true })
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      const totalVendidos = vendidos ?? 0;
      const percentVendido = (totalVendidos / capacidadeTotal) * 100;

      // Tempo: desde criação do evento até data_inicio
      const criado = new Date(ev.criadoEm).getTime();
      const inicio = new Date(ev.dataInicio).getTime();
      const agora = Date.now();
      const tempoTotal = inicio - criado;
      const tempoPassado = agora - criado;
      const percentTempoPassado = tempoTotal > 0 ? Math.min(100, (tempoPassado / tempoTotal) * 100) : 100;

      const velocidadeRelativa = percentTempoPassado > 0 ? percentVendido / percentTempoPassado : 0;

      // Curva real: vendas acumuladas por dia
      const { data: ticketsDatas } = await supabase
        .from('tickets_caixa')
        .select('criado_em')
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")')
        .order('criado_em', { ascending: true });

      const curvaReal: TimeSeriesPoint[] = [];
      if (ticketsDatas?.length) {
        const byDay = new Map<string, number>();
        let acum = 0;
        for (const t of ticketsDatas) {
          const dia = t.criado_em.slice(0, 10);
          acum++;
          byDay.set(dia, acum);
        }
        for (const [dia, val] of byDay) {
          curvaReal.push({ date: dia, value: val });
        }
      }

      // Curva ideal: linear de 0 até capacidade
      const curvaIdeal: TimeSeriesPoint[] = [];
      if (curvaReal.length >= 2) {
        const primeiroDia = curvaReal[0].date;
        const ultimoDia = new Date(ev.dataInicio).toISOString().slice(0, 10);
        const d1 = new Date(primeiroDia).getTime();
        const d2 = new Date(ultimoDia).getTime();
        const diasTotal = Math.max(1, (d2 - d1) / 86_400_000);

        for (let i = 0; i <= Math.min(diasTotal, 60); i++) {
          const dt = new Date(d1 + i * 86_400_000);
          const dia = dt.toISOString().slice(0, 10);
          const val = Math.round((i / diasTotal) * capacidadeTotal);
          curvaIdeal.push({ date: dia, value: val });
        }
      }

      // Decisão
      let acao: PricingAction;
      let mensagem: string;

      if (velocidadeRelativa > 1.2) {
        acao = 'SUBIR';
        mensagem = `Vendas ${Math.round((velocidadeRelativa - 1) * 100)}% acima da curva ideal. Considere subir o preço do próximo lote.`;
      } else if (velocidadeRelativa < 0.8 && percentTempoPassado > 30) {
        acao = 'DESCONTAR';
        mensagem = `Vendas ${Math.round((1 - velocidadeRelativa) * 100)}% abaixo do esperado. Considere uma promoção ou desconto.`;
      } else {
        acao = 'MANTER';
        mensagem = 'Vendas dentro da faixa esperada. Mantenha o preço atual.';
      }

      return {
        eventoId,
        percentVendido: Math.round(percentVendido * 10) / 10,
        percentTempoPassado: Math.round(percentTempoPassado * 10) / 10,
        velocidadeRelativa: Math.round(velocidadeRelativa * 100) / 100,
        acao,
        mensagem,
        curvaReal,
        curvaIdeal,
      };
    },
    60_000,
  );
}

// ════════════════════════════════════════════════════
// B2: Split Automático
// ════════════════════════════════════════════════════

export async function calculateSplits(eventoId: string): Promise<SplitResult | null> {
  return getCached(
    `splits-${eventoId}`,
    async () => {
      const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
      if (!ev) return null;

      const resumo = await getResumoFinanceiroEvento(eventoId);
      const fees = getContractedFees(eventoId);

      const receitaBruta = resumo.receitaBruta;
      const custoGateway = resumo.custoGateway;
      const taxaVanta = resumo.taxaVanta;
      const receitaDistribuivel = receitaBruta - custoGateway - taxaVanta;

      const splits: SplitItem[] = [];

      // Gateway
      splits.push({
        tipo: 'GATEWAY',
        nome: 'Gateway (processamento)',
        percentual: fees.taxaProcessamento * 100,
        valor: custoGateway,
      });

      // VANTA
      splits.push({
        tipo: 'VANTA',
        nome: 'Taxa VANTA',
        percentual: fees.feePercent * 100,
        valor: taxaVanta,
      });

      // Sócios
      const socios = ev.socios ?? [];
      let totalSocioPercent = 0;

      for (const socio of socios) {
        if (socio.status !== 'ACEITO') continue;
        const pct = socio.splitPercentual;
        totalSocioPercent += pct;
        splits.push({
          tipo: 'SOCIO',
          nome: socio.nome ?? `Sócio ${socio.socioId.slice(0, 8)}`,
          percentual: pct,
          valor: Math.round((receitaDistribuivel * pct) / 100),
        });
      }

      // Casa (produtor) — o que sobra
      const casaPercent = Math.max(0, 100 - totalSocioPercent);
      splits.push({
        tipo: 'CASA',
        nome: 'Casa (produtor)',
        percentual: casaPercent,
        valor: Math.round((receitaDistribuivel * casaPercent) / 100),
      });

      return {
        eventoId,
        receitaBruta,
        custoGateway,
        taxaVanta,
        receitaDistribuivel,
        splits,
      };
    },
    60_000,
  );
}

// ════════════════════════════════════════════════════
// B3: Projeção de Break-Even
// ════════════════════════════════════════════════════

export async function getBreakEvenProjection(eventoId: string): Promise<BreakEvenResult | null> {
  return getCached(
    `break-even-${eventoId}`,
    async () => {
      const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
      if (!ev) return null;

      const resumo = await getResumoFinanceiroEvento(eventoId);
      const fees = getContractedFees(eventoId);

      // Custos fixos
      const custoFixo = fees.taxaFixaEvento;

      // Custo variável por ingresso (gateway % + VANTA fee %)
      const custoVarPercent = fees.taxaProcessamento + fees.feePercent;

      const ticketMedio = resumo.ticketMedio;
      const ingressosVendidos = resumo.totalVendidos;
      const receitaAtual = resumo.receitaBruta;

      // Receita líquida por ingresso = ticketMedio × (1 - custoVar%)
      const receitaLiqPorIngresso = ticketMedio * (1 - custoVarPercent);

      // Break-even = custoFixo / receitaLiqPorIngresso
      const ingressosBreakEven = receitaLiqPorIngresso > 0 ? Math.ceil(custoFixo / receitaLiqPorIngresso) : 0;

      const ingressosFaltam = Math.max(0, ingressosBreakEven - ingressosVendidos);

      // Custo total incorrido até agora
      const custoTotal = custoFixo + resumo.custoGateway + resumo.taxaVanta;

      const percentProgresso = custoTotal > 0 ? Math.min(100, (receitaAtual / custoTotal) * 100) : 100;

      return {
        eventoId,
        custoTotal,
        receitaAtual,
        ticketMedio,
        ingressosVendidos,
        ingressosBreakEven,
        ingressosFaltam,
        percentProgresso: Math.round(percentProgresso * 10) / 10,
        atingido: ingressosFaltam === 0,
      };
    },
    30_000,
  );
}
