import type { Periodo } from '../dashboardAnalyticsService';
import type { TrendAlert } from './insightsTypes';
import type { TimeSeriesPoint } from '../analytics/types';

export type { Periodo, TimeSeriesPoint };

// ── D1: Relatório Semanal ──
export interface WeeklyReport {
  comunidadeId: string;
  semanaInicio: string; // YYYY-MM-DD
  semanaFim: string;
  vendas: {
    total: number;
    delta: number; // % vs semana anterior
    receita: number;
    receitaDelta: number;
  };
  publico: {
    checkins: number;
    checkinsDelta: number;
    taxaNoShow: number;
  };
  topPromoters: { nome: string; vendas: number }[];
  topClientes: { nome: string; score: number }[];
  alertas: TrendAlert[];
  geradoEm: string;
}

// ── D2: Painel Valor VANTA ──
export interface VantaValueMetrics {
  comunidadeId: string;
  periodo: Periodo;
  insightsGerados: number;
  tempoEconomizadoHoras: number;
  operacoesAutomatizadas: number;
  receitaOtimizada: number;
  eventosGerenciados: number;
  ticketsProcessados: number;
}

// ── D3: Dicas Inteligentes ──
export type TipPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TipCategory = 'PRICING' | 'MARKETING' | 'OPERACAO' | 'PUBLICO' | 'FINANCEIRO';

export interface SmartTip {
  id: string;
  categoria: TipCategory;
  prioridade: TipPriority;
  titulo: string;
  descricao: string;
  acao?: string; // texto do CTA
  dado: string; // dado que gerou a dica
}

// ── D4: Benchmark ──
export interface PlatformBenchmarks {
  checkinRateMedio: number;
  ticketMedio: number;
  noShowMedio: number;
  taxaLotacaoMedia: number;
  totalEventos: number;
}

export interface BenchmarkComparison {
  comunidadeId: string;
  metricas: BenchmarkItem[];
}

export interface BenchmarkItem {
  metrica: string;
  label: string;
  valorComunidade: number;
  valorPlataforma: number;
  delta: number; // % acima/abaixo
  melhor: boolean;
}
