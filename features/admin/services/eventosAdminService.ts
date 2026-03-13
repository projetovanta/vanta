/**
 * eventosAdminService — Fachada publica que re-exporta todos os sub-modulos.
 *
 * A API publica (eventosAdminService.xxx) permanece inalterada.
 * Tipos e constantes sao re-exportados para manter compatibilidade com imports existentes.
 */

// ── Re-export de tipos e constantes ─────────────────────────────────────────

export type {
  OrigemIngresso,
  VendaLog,
  TicketCaixa,
  ValidacaoIngresso,
  StatusSaque,
  StatusChargeback,
  SolicitacaoSaque,
  Reembolso,
  Chargeback,
  SaldoFinanceiro,
  ContractedFees,
  MetodoPagamento,
} from './eventosAdminTypes';

export type { CheckinsPorOrigem } from './eventosAdminTickets';

export {
  VANTA_FEE,
  GATEWAY_CREDITO_PERCENT,
  GATEWAY_CREDITO_FIXO,
  GATEWAY_PIX_PERCENT,
  calcGatewayCost,
} from './eventosAdminTypes';

// ── Re-export _registerRbac (usado pelo rbacService) ────────────────────────

export { _registerRbac } from './eventosAdminCore';

// ── Imports dos sub-modulos ─────────────────────────────────────────────────

import { _version as _getVersion, _refreshed as _getRefreshed } from './eventosAdminCore';
import { refresh } from './eventosAdminCore';

import {
  getEventos,
  getEvento,
  getEventosByComunidade,
  criarEvento,
  updateEvento,
  submeterEdicao,
  aprovarEdicao,
  rejeitarEdicao,
  getNomeById,
  notificarEscalacao,
  solicitarCancelamento,
} from './eventosAdminCrud';

import {
  aprovarEvento,
  rejeitarEvento,
  getEventosPendentes,
  enviarPropostaVanta,
  aceitarPropostaVanta,
  recusarPropostaVanta,
  reenviarPropostaVanta,
  getPropostasPendentes,
} from './eventosAdminAprovacao';

import {
  getContractedFees,
  setContractedFees,
  getSaldoFinanceiro,
  solicitarSaque,
  getSolicitacoesSaque,
  getSaquesByProdutor,
  confirmarSaque,
  estornarSaque,
  isReembolsoAutomaticoElegivel,
  processarReembolsoAutomatico,
  aprovarReembolsoManual,
  getReembolsos,
  registrarChargeback,
  getChargebacks,
  getGatewayCostByEvento,
  getGatewayCostGlobal,
  autorizarSaqueGerente,
  recusarSaque,
  verificarLimiteReembolso,
  solicitarReembolso,
  aprovarReembolsoEtapa,
  executarReembolsoFinal,
  recusarReembolso,
} from './eventosAdminFinanceiro';

import {
  registrarVendaEfetiva,
  registrarVenda,
  getVendasLog,
  registrarCortesia,
  getCheckinsIngresso,
  getCheckinsPorOrigem,
  validarEQueimarIngresso,
  getTicketsCaixaByEvento,
  addTicketToCaixa,
  editarTitular,
  atualizarSelfieUrl,
  reenviarIngresso,
  cancelarIngresso,
} from './eventosAdminTickets';

// ── Objeto publico (mantém API identica) ────────────────────────────────────

export const eventosAdminService = {
  // Core
  get isReady(): boolean {
    return _getRefreshed;
  },
  refresh,
  getEventos,
  getVersion: (): number => _getVersion,
  getEvento,
  getEventosByComunidade,

  // CRUD
  criarEvento,
  updateEvento,
  submeterEdicao,
  aprovarEdicao,
  rejeitarEdicao,
  getNomeById,
  notificarEscalacao,
  solicitarCancelamento,

  // Aprovacao
  aprovarEvento,
  rejeitarEvento,
  getEventosPendentes,
  enviarPropostaVanta,
  aceitarPropostaVanta,
  recusarPropostaVanta,
  reenviarPropostaVanta,
  getPropostasPendentes,

  // Financeiro
  getContractedFees,
  setContractedFees,
  getSaldoFinanceiro,
  solicitarSaque,
  getSolicitacoesSaque,
  getSaquesByProdutor,
  confirmarSaque,
  estornarSaque,
  isReembolsoAutomaticoElegivel,
  processarReembolsoAutomatico,
  aprovarReembolsoManual,
  getReembolsos,
  registrarChargeback,
  getChargebacks,
  getGatewayCostByEvento,
  getGatewayCostGlobal,
  autorizarSaqueGerente,
  recusarSaque,
  verificarLimiteReembolso,
  solicitarReembolso,
  aprovarReembolsoEtapa,
  executarReembolsoFinal,
  recusarReembolso,

  // Tickets / Vendas
  registrarVendaEfetiva,
  registrarVenda,
  getVendasLog,
  registrarCortesia,
  getCheckinsIngresso,
  getCheckinsPorOrigem,
  validarEQueimarIngresso,
  getTicketsCaixaByEvento,
  addTicketToCaixa,
  editarTitular,
  atualizarSelfieUrl,
  reenviarIngresso,
  cancelarIngresso,
};
