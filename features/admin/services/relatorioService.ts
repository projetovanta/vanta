/**
 * relatorioService — Agrega dados pós-evento de múltiplas fontes.
 */

import { eventosAdminService } from './eventosAdminService';
import { getContractedFees, getGatewayCostByEvento } from './eventosAdminFinanceiro';
import { listasService } from './listasService';
import { reviewsService } from './reviewsService';
import { getReembolsosPorEvento } from './reembolsoService';
import type { VendaLog } from './eventosAdminTypes';

export interface VendaVariacao {
  label: string;
  qtd: number;
  receita: number;
}

export interface RelatorioEvento {
  eventoId: string;
  eventoNome: string;
  dataInicio: string;
  dataFim: string;
  local: string;

  totalVendidos: number;
  receitaBruta: number;
  receitaLiquida: number;
  ticketMedio: number;
  vendasPorOrigem: { antecipado: number; porta: number; cortesia: number };
  vendasPorVariacao: VendaVariacao[];

  totalCheckins: number;
  checkinsPorOrigem: { antecipado: number; porta: number; cortesia: number };
  taxaConversao: number;

  cortesiasEnviadas: number;

  feePercent: number;
  gatewayMode: 'ABSORVER' | 'REPASSAR';
  valorTaxa: number;

  reviewMedia: number;
  reviewCount: number;

  reembolsosAprovados: number;
  totalReembolsos: number;
}

export const gerarRelatorio = async (eventoId: string): Promise<RelatorioEvento | null> => {
  const evento = eventosAdminService.getEvento(eventoId);
  if (!evento) return null;

  const [vendasLog, checkinsIngresso, checkinsPorOrigem, review, reembolsos] = await Promise.all([
    eventosAdminService.getVendasLog(eventoId),
    eventosAdminService.getCheckinsIngresso(eventoId),
    eventosAdminService.getCheckinsPorOrigem(eventoId),
    reviewsService.getMediaEvento(eventoId),
    getReembolsosPorEvento(eventoId),
  ]);

  // Check-ins de lista (convidados_lista com checked_in=true)
  const listasEvento = listasService.getListasByEvento(eventoId);
  const checkinsLista = listasEvento.reduce((sum, l) => sum + l.convidados.filter(c => c.checkedIn).length, 0);
  const totalCheckins = checkinsIngresso + checkinsLista;

  const fees = getContractedFees(eventoId);

  // Receita de ingressos + listas pagas
  const receitaIngressos = vendasLog.reduce((s, v) => s + v.valor, 0);
  const receitaListasPagas = listasEvento.reduce((acc, l) => {
    return (
      acc +
      l.regras
        .filter(r => (r.valor ?? 0) > 0)
        .reduce((rAcc, r) => {
          const ci = l.convidados.filter(c => c.regraId === r.id && c.checkedIn).length;
          return rAcc + ci * (r.valor ?? 0);
        }, 0)
    );
  }, 0);
  const receitaBruta = receitaIngressos + receitaListasPagas;
  const totalVendidos = vendasLog.length;
  const ticketMedio = totalVendidos > 0 ? Math.round((receitaBruta / totalVendidos) * 100) / 100 : 0;

  const valorTaxa = Math.round((receitaBruta * fees.feePercent + fees.feeFixed * totalVendidos) * 100) / 100;
  // Taxa VANTA sempre do cliente — receitaLiquida desconta gateway se ABSORVER
  const gwCost = await getGatewayCostByEvento(eventoId);
  const receitaLiquida =
    fees.gatewayMode === 'ABSORVER' ? Math.round((receitaBruta - gwCost.totalCusto) * 100) / 100 : receitaBruta;

  // Vendas por origem
  const vendasPorOrigem = { antecipado: 0, porta: 0, cortesia: 0 };
  for (const v of vendasLog) {
    if (v.origem === 'ANTECIPADO') vendasPorOrigem.antecipado++;
    else if (v.origem === 'CORTESIA') vendasPorOrigem.cortesia++;
    else vendasPorOrigem.porta++;
  }

  // Vendas por variação
  const varMap: Record<string, VendaVariacao> = {};
  for (const v of vendasLog) {
    if (!varMap[v.variacaoLabel]) varMap[v.variacaoLabel] = { label: v.variacaoLabel, qtd: 0, receita: 0 };
    varMap[v.variacaoLabel].qtd++;
    varMap[v.variacaoLabel].receita += v.valor;
  }

  const taxaConversao = totalVendidos > 0 ? Math.round((totalCheckins / totalVendidos) * 100) : 0;

  const reembolsosAprovados = reembolsos.filter(r => r.status === 'APROVADO').length;
  const totalReembolsos = reembolsos.length;

  return {
    eventoId,
    eventoNome: evento.nome,
    dataInicio: evento.dataInicio,
    dataFim: evento.dataFim,
    local: evento.local,
    totalVendidos,
    receitaBruta,
    receitaLiquida,
    ticketMedio,
    vendasPorOrigem,
    vendasPorVariacao: Object.values(varMap),
    totalCheckins,
    checkinsPorOrigem,
    taxaConversao,
    cortesiasEnviadas: evento.cortesiasEnviadas ?? 0,
    feePercent: fees.feePercent,
    gatewayMode: fees.gatewayMode,
    valorTaxa,
    reviewMedia: review.media,
    reviewCount: review.count,
    reembolsosAprovados,
    totalReembolsos,
  };
};
