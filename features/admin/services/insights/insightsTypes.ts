import type { Periodo } from '../dashboardAnalyticsService';
import type { TimeSeriesPoint } from '../analytics/types';

export type { Periodo, TimeSeriesPoint };

// ── A1: VIP Score ──
export interface ClientScore {
  userId: string;
  nome: string;
  foto: string | null;
  instagram: string | null;
  gastoTotal: number;
  frequencia: number; // eventos com check-in
  ultimoEvento: string | null; // data
  score: number; // 0-100
}

// ── A2: No-Show ──
export interface NoShowAnalysis {
  eventoId: string;
  totalVendidos: number;
  totalUsados: number;
  totalNoShow: number;
  taxaNoShow: number; // %
  custoFantasma: number; // R$
  porLote: NoShowByLote[];
  porPromoter: NoShowByPromoter[];
}

export interface NoShowByLote {
  loteId: string;
  loteNome: string;
  vendidos: number;
  noShows: number;
  taxa: number;
}

export interface NoShowByPromoter {
  promoterId: string;
  promoterNome: string;
  convidados: number;
  noShows: number;
  taxa: number;
}

export interface NoShowTrend {
  comunidadeId: string;
  pontos: TimeSeriesPoint[];
  mediaGeral: number;
}

// ── A3: Previsão de Lotação ──
export interface HourlyPrediction {
  hora: number; // 0-23
  estimado: number;
  min: number;
  max: number;
  confianca: number; // 0-1
}

// ── A4: Radar de Cancelamento ──
export interface ChurnRadarResult {
  comunidadeId: string;
  clientesEmRisco: ChurnClient[];
  totalEmRisco: number;
}

export interface ChurnClient {
  userId: string;
  nome: string;
  foto: string | null;
  ultimoEvento: string;
  ultimaData: string;
  gastoTotal: number;
  eventosAnteriores: number;
}

// ── A5: Alerta de Tendência ──
export type TrendMetric = 'VENDAS' | 'PUBLICO' | 'TICKET_MEDIO' | 'CHECKIN_RATE';
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface TrendAlert {
  metrica: TrendMetric;
  direcao: TrendDirection;
  valorAtual: number;
  valorAnterior: number;
  variacao: number; // %
  sugestao: string;
}
