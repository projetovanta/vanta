/**
 * Tipos exportados do dominio eventosAdmin.
 * Compartilhados entre os sub-modulos e consumidores externos.
 */

export type OrigemIngresso = 'ANTECIPADO' | 'PORTA' | 'LISTA' | 'CORTESIA';

export interface VendaLog {
  variacaoId: string;
  variacaoLabel: string;
  valor: number;
  produtorId: string;
  ts: string;
  origem: OrigemIngresso;
}

export interface TicketCaixa {
  id: string;
  eventoId: string;
  variacaoId: string;
  variacaoLabel: string;
  valor: number;
  email: string;
  nomeTitular: string;
  cpf: string;
  selfieBase64?: string;
  selfieUrl?: string;
  status: 'DISPONIVEL' | 'USADO' | 'CANCELADO' | 'REEMBOLSADO';
  emitidoEm: string;
  usadoEm?: string;
}

export type ValidacaoIngresso = 'VALIDO' | 'JA_UTILIZADO' | 'EVENTO_INCORRETO' | 'INVALIDO';

export type StatusSaque = 'PENDENTE' | 'GERENTE_AUTORIZADO' | 'CONCLUIDO' | 'ESTORNADO' | 'RECUSADO';
export type StatusChargeback = 'ABERTO' | 'DEDUZIDO' | 'REVERTIDO';

export interface SolicitacaoSaque {
  id: string;
  produtorId: string;
  produtorNome: string;
  eventoId: string;
  eventoNome: string;
  valor: number;
  valorLiquido: number;
  valorTaxa: number;
  pixTipo: string;
  pixChave: string;
  status: StatusSaque;
  solicitadoEm: string;
  processadoEm?: string;
  /** Etapa atual na hierarquia tripla */
  etapa?: string;
  /** Gerente que autorizou */
  gerenteAprovadoPor?: string;
  gerenteAprovadoEm?: string;
  /** Motivo da recusa (obrigatório ao recusar) */
  motivoRecusa?: string;
}

export interface Reembolso {
  id: string;
  ticketId: string;
  eventoId: string;
  tipo: 'AUTOMATICO' | 'MANUAL';
  status?: 'APROVADO' | 'PENDENTE_APROVACAO' | 'REJEITADO';
  motivo: string;
  valor: number;
  solicitadoPor: string;
  solicitadoEmail?: string;
  solicitadoNome?: string;
  aprovadoPor?: string;
  solicitadoEm: string;
  processadoEm?: string;
  eventoNome?: string;
  produtorNome?: string;
  /** Etapa na hierarquia: SOLICITADO → SOCIO_ANALISOU → GERENTE_AUTORIZADO → MASTER_DECIDIU */
  etapa?: string;
}

export interface Chargeback {
  id: string;
  ticketId: string;
  eventoId: string;
  valor: number;
  motivo: string;
  status: StatusChargeback;
  gatewayRef: string;
  criadoEm: string;
  eventoNome?: string;
  comunidadeNome?: string;
}

export interface SaldoFinanceiro {
  totalVendas: number;
  saldoDisponivel: number;
  aReceber: number;
  saquesProcessados: number;
}

export interface ContractedFees {
  feePercent: number; // taxa de serviço %
  feeFixed: number; // taxa fixa por ingresso (legado)
  gatewayMode: 'ABSORVER' | 'REPASSAR';
  fonte: 'evento' | 'comunidade' | 'padrao';
  // ── Novos campos do modelo completo ──
  taxaProcessamento: number; // gateway % (default 2,5%)
  taxaPorta: number; // % sobre vendas na porta
  taxaMinima: number; // mínimo por ingresso app (default R$2)
  taxaFixaEvento: number; // custo fixo do evento
  quemPagaServico: 'PRODUTOR_ABSORVE' | 'COMPRADOR_PAGA' | 'PRODUTOR_ESCOLHE';
  cotaNomesLista: number; // nomes grátis na lista
  taxaNomeExcedente: number; // R$/nome excedente
  cotaCortesias: number; // cortesias grátis
  taxaCortesiaExcedentePct: number; // % valor face cortesia excedente
  prazoPagamentoDias: number | null; // dias pós-evento pra acerto
}

export type MetodoPagamento = 'CREDITO' | 'PIX';

// ── Constantes ──────────────────────────────────────────────────────────────

export const VANTA_FEE = 0.05;

// ── Gateway Pagar.me — custos fixos plataforma ──────────────────────────────
export const GATEWAY_CREDITO_PERCENT = 0.035; // 3.5%
export const GATEWAY_CREDITO_FIXO = 0.39; // R$0.39 por venda
export const GATEWAY_PIX_PERCENT = 0.01; // 1%

/** Calcula custo do gateway para uma venda */
export const calcGatewayCost = (valor: number, metodo: MetodoPagamento): number => {
  if (metodo === 'PIX') return Math.round(valor * GATEWAY_PIX_PERCENT * 100) / 100;
  return Math.round((valor * GATEWAY_CREDITO_PERCENT + GATEWAY_CREDITO_FIXO) * 100) / 100;
};
