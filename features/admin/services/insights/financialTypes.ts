import type { TimeSeriesPoint } from '../analytics/types';

export type { TimeSeriesPoint };

// ── B1: Pricing Dinâmico ──
export type PricingAction = 'SUBIR' | 'MANTER' | 'DESCONTAR';

export interface PricingSuggestion {
  eventoId: string;
  percentVendido: number; // % ingressos vendidos
  percentTempoPassado: number; // % tempo entre abertura e evento
  velocidadeRelativa: number; // vendido/tempo (>1 = acima da curva)
  acao: PricingAction;
  mensagem: string;
  curvaReal: TimeSeriesPoint[];
  curvaIdeal: TimeSeriesPoint[];
}

// ── B2: Split Automático ──
export type SplitTipo = 'CASA' | 'SOCIO' | 'PROMOTER' | 'VANTA' | 'GATEWAY';

export interface SplitItem {
  tipo: SplitTipo;
  nome: string;
  percentual: number;
  valor: number;
}

export interface SplitResult {
  eventoId: string;
  receitaBruta: number;
  custoGateway: number;
  taxaVanta: number;
  receitaDistribuivel: number;
  splits: SplitItem[];
}

// ── B3: Break-Even ──
export interface BreakEvenResult {
  eventoId: string;
  custoTotal: number; // gateway + vanta + fixo
  receitaAtual: number;
  ticketMedio: number;
  ingressosVendidos: number;
  ingressosBreakEven: number; // quanto precisa vender pra empatar
  ingressosFaltam: number; // negativo = já passou
  percentProgresso: number; // % do break-even atingido
  atingido: boolean;
}
