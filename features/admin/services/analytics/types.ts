/**
 * Analytics Engine — Tipos centrais do dashboard VANTA.
 *
 * Todos os services de analytics retornam esses tipos.
 * Reutiliza tipos existentes de eventosAdminTypes e dashboardAnalyticsService.
 */

import type { Periodo } from '../dashboardAnalyticsService';

// ── Re-export para conveniência ──────────────────────────────────────────────
export type { Periodo };

// ── Primitivas de série temporal ─────────────────────────────────────────────

export interface TimeSeriesPoint {
  /** ISO date string (YYYY-MM-DD ou YYYY-MM-DDTHH:mm) */
  date: string;
  value: number;
  label?: string;
}

export interface FunnelStep {
  name: string;
  value: number;
  /** Cor hex opcional */
  color?: string;
}

export interface HeatmapCell {
  /** 0-6 (dom-sab) */
  dayOfWeek: number;
  /** 0-23 */
  hour: number;
  value: number;
}

// ── Breakdown de receita ─────────────────────────────────────────────────────

export interface RevenueBreakdown {
  receitaBruta: number;
  receitaListas: number;
  custoGateway: number;
  totalReembolsado: number;
  totalChargebacks: number;
  receitaLiquida: number;
  taxaVanta: number;
  splitProdutor: number;
  splitSocio: number;
  saquesProcessados: number;
  saquesPendentes: number;
  saldoDisponivel: number;
}

// ── Breakdown de tickets ─────────────────────────────────────────────────────

export interface TicketBreakdown {
  totalVendidos: number;
  totalCortesias: number;
  totalLista: number;
  totalCaixa: number;
  totalOnline: number;
  totalCancelados: number;
  totalReembolsados: number;
  ticketMedio: number;
  porLote: LoteBreakdown[];
  porVariacao: VariacaoBreakdown[];
  porMetodoPagamento: MetodoPagamentoBreakdown[];
}

export interface LoteBreakdown {
  loteId: string;
  loteNome: string;
  vendidos: number;
  limite: number;
  receita: number;
  /** % do total de vendas */
  percentual: number;
}

export interface VariacaoBreakdown {
  variacaoId: string;
  label: string;
  area: string;
  genero: string;
  valor: number;
  vendidos: number;
  limite: number;
  receita: number;
}

export interface MetodoPagamentoBreakdown {
  metodo: 'CREDITO' | 'PIX' | 'CAIXA' | 'CORTESIA' | 'LISTA';
  quantidade: number;
  valor: number;
  percentual: number;
}

// ── Métricas de público/audiência ────────────────────────────────────────────

export interface AudienceMetrics {
  totalCheckins: number;
  taxaCheckin: number;
  totalPresentes: number;
  totalAusentes: number;
  checkinsPorHora: TimeSeriesPoint[];
  heatmapCheckins: HeatmapCell[];
  /** Públicos que já foram a outros eventos da mesma comunidade */
  recorrentes: number;
  novos: number;
}

// ── Métricas operacionais ────────────────────────────────────────────────────

export interface OperationalMetrics {
  checkinRate: number;
  vendasCaixaTotal: number;
  vendasCaixaValor: number;
  cortesiasEnviadas: number;
  cortesiasUsadas: number;
  listasAtivas: number;
  nomesNasListas: number;
}

// ── Métricas de promoter ─────────────────────────────────────────────────────

export interface PromoterMetrics {
  promoterId: string;
  promoterNome: string;
  promoterFoto?: string;
  listasAtribuidas: number;
  totalNomes: number;
  totalCheckins: number;
  taxaConversao: number;
  comissao: number;
}

// ── Métricas de staff ────────────────────────────────────────────────────────

export interface StaffMemberMetrics {
  membroId: string;
  membroNome: string;
  papel: string;
  checkins: number;
  vendasCaixa: number;
  valorVendasCaixa: number;
}

// ── Analytics consolidado por EVENTO ─────────────────────────────────────────

export type TemporalMode = 'PRE_EVENTO' | 'OPERACAO' | 'POS_EVENTO';

export interface EventAnalytics {
  eventoId: string;
  eventoNome: string;
  comunidadeId: string;
  temporalMode: TemporalMode;
  revenue: RevenueBreakdown;
  tickets: TicketBreakdown;
  audience: AudienceMetrics;
  operations: OperationalMetrics;
  promoters: PromoterMetrics[];
  staff: StaffMemberMetrics[];
  vendasTimeSeries: TimeSeriesPoint[];
  funnelConversao: FunnelStep[];
  heatmapVendas: HeatmapCell[];
}

// ── Analytics consolidado por COMUNIDADE ─────────────────────────────────────

export interface CommunityAnalytics {
  comunidadeId: string;
  comunidadeNome: string;
  periodo: Periodo;
  totalEventos: number;
  eventosAtivos: number;
  eventosFinalizados: number;
  revenue: RevenueBreakdown;
  tickets: TicketBreakdown;
  audience: AudienceMetrics;
  topPromoters: PromoterMetrics[];
  eventosRanking: EventoRankingItem[];
  vendasTimeSeries: TimeSeriesPoint[];
  retencaoPublico: number;
}

export interface EventoRankingItem {
  eventoId: string;
  eventoNome: string;
  dataInicio: string;
  receita: number;
  vendidos: number;
  checkinRate: number;
}

// ── Analytics consolidado MASTER (global) ────────────────────────────────────

export interface MasterAnalytics {
  periodo: Periodo;
  gmvTotal: number;
  receitaVanta: number;
  custoGatewayGlobal: number;
  lucroVanta: number;
  totalEventos: number;
  totalTickets: number;
  totalComunidades: number;
  comunidadesRanking: CommunityRankingItem[];
  vendasTimeSeries: TimeSeriesPoint[];
  topEventos: EventoRankingItem[];
  revenue: RevenueBreakdown;
}

export interface CommunityRankingItem {
  comunidadeId: string;
  comunidadeNome: string;
  comunidadeFoto?: string;
  gmv: number;
  taxaVanta: number;
  eventos: number;
  tickets: number;
}

// ── MAIS VANTA Analytics ─────────────────────────────────────────────────────

export interface MaisVantaAnalytics {
  periodo: Periodo;
  totalMembros: number;
  mrrAtual: number;
  churnRate: number;
  ltv: number;
  novosMembros: number;
  cancelamentos: number;
  tierDistribution: TierDistributionItem[];
  resgatesTotal: number;
  dealsAtivos: number;
  parceirosAtivos: number;
  mrrTimeSeries: TimeSeriesPoint[];
  membrosTimeSeries: TimeSeriesPoint[];
  retencaoCohort: CohortRow[];
}

export interface TierDistributionItem {
  tier: string;
  membros: number;
  receita: number;
  percentual: number;
  color: string;
}

export interface CohortRow {
  /** Mês de entrada (YYYY-MM) */
  cohort: string;
  /** Retenção por mês subsequente (0=mês entrada, 1=mês seguinte, etc.) */
  retention: number[];
}
