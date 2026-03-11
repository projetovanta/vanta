import type { TimeSeriesPoint } from '../analytics/types';
import type { Periodo } from '../dashboardAnalyticsService';

export type { TimeSeriesPoint, Periodo };

// ── C1: Atribuição de Canal ──
export type ChannelSource = 'INSTAGRAM' | 'FLYER_QR' | 'PROMOTER' | 'ORGANICO' | 'WHATSAPP' | 'LINK_DIRETO';

export interface ChannelItem {
  canal: ChannelSource;
  label: string;
  vendas: number;
  receita: number;
  percentual: number;
}

export interface ChannelAttribution {
  eventoId: string;
  totalVendas: number;
  canais: ChannelItem[];
}

// ── C2: Comunicação com Compradores ──
export interface BuyerContact {
  userId: string;
  nome: string;
  pushToken?: string;
}

// ── C3: Programa de Fidelidade ──
export type LoyaltyTier = 'NENHUM' | 'BRONZE' | 'PRATA' | 'OURO';

export interface LoyaltyStatus {
  userId: string;
  comunidadeId: string;
  pontos: number;
  tier: LoyaltyTier;
  proximoTier: LoyaltyTier | null;
  pontosParaProximo: number;
}

export interface LoyaltyEntry {
  userId: string;
  nome: string;
  foto: string | null;
  pontos: number;
  tier: LoyaltyTier;
}

export interface LoyaltyDistribution {
  nenhum: number;
  bronze: number;
  prata: number;
  ouro: number;
  total: number;
}

// ── C4: Ranking de Horário de Compra ──
export interface PurchaseTimeCell {
  dia: number; // 0=dom, 6=sab
  hora: number; // 0-23
  vendas: number;
}

export interface TopWindow {
  dia: string; // 'Segunda', 'Terça', etc.
  hora: string; // '18h-19h'
  vendas: number;
}

export interface PurchaseTimeAnalysis {
  comunidadeId: string;
  heatmap: PurchaseTimeCell[];
  topWindows: TopWindow[];
  totalVendas: number;
}
