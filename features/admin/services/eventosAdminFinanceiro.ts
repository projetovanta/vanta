/**
 * eventosAdminFinanceiro — Taxas, fees, saques, reembolsos, chargebacks, gateway.
 */

import { supabase } from '../../../services/supabaseClient';
import { EVENTOS_ADMIN, bumpVersion, ts, getRbac, refresh } from './eventosAdminCore';
import type {
  ContractedFees,
  SolicitacaoSaque,
  SaldoFinanceiro,
  StatusSaque,
  Reembolso,
  Chargeback,
  StatusChargeback,
  TicketCaixa,
  VendaLog,
  MetodoPagamento,
} from './eventosAdminTypes';
import { VANTA_FEE, calcGatewayCost } from './eventosAdminTypes';
import { comunidadesService } from './comunidadesService';
import { listasService } from './listasService';
import { notify, notifyMany } from '../../../services/notifyService';
import { logger } from '../../../services/logger';

// ── Contracted Fees ─────────────────────────────────────────────────────────

export const getContractedFees = (eventoId: string): ContractedFees => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  const com = ev?.comunidadeId ? comunidadesService.get(ev.comunidadeId) : undefined;

  // Helper: evento → comunidade → default
  const pick = <T>(evVal: T | undefined | null, comVal: T | undefined | null, def: T): T =>
    evVal != null ? evVal : comVal != null ? comVal : def;

  const fonte: ContractedFees['fonte'] = !ev
    ? 'padrao'
    : ev.vanta_fee_percent !== undefined
      ? 'evento'
      : com?.vanta_fee_percent !== undefined
        ? 'comunidade'
        : 'padrao';

  return {
    feePercent: pick(ev?.vanta_fee_percent, com?.vanta_fee_percent, VANTA_FEE),
    feeFixed: pick(ev?.vanta_fee_fixed, com?.vanta_fee_fixed, 0),
    gatewayMode: pick(ev?.gateway_fee_mode, com?.gateway_fee_mode, 'ABSORVER'),
    fonte,
    taxaProcessamento: pick(ev?.taxa_processamento_percent, com?.taxa_processamento_percent, 0.025),
    taxaPorta:
      pick(ev?.taxa_porta_percent, com?.taxa_porta_percent, null) ??
      pick(ev?.vanta_fee_percent, com?.vanta_fee_percent, VANTA_FEE),
    taxaMinima: pick(ev?.taxa_minima, com?.taxa_minima, 2.0),
    taxaFixaEvento: ev?.taxa_fixa_evento ?? 0,
    quemPagaServico: ev?.quem_paga_servico ?? 'PRODUTOR_ESCOLHE',
    cotaNomesLista: pick(ev?.cota_nomes_lista, com?.cota_nomes_lista, 500),
    taxaNomeExcedente: pick(ev?.taxa_nome_excedente, com?.taxa_nome_excedente, 0.5),
    cotaCortesias: pick(ev?.cota_cortesias, com?.cota_cortesias, 50),
    taxaCortesiaExcedentePct: pick(ev?.taxa_cortesia_excedente_pct, com?.taxa_cortesia_excedente_pct, 0.05),
    prazoPagamentoDias: ev?.prazo_pagamento_dias ?? null,
  };
};

export const setContractedFees = async (
  targetType: 'COMUNIDADE' | 'EVENTO',
  targetId: string,
  fields: Partial<{
    feePercent: number;
    feeFixed: number;
    gatewayMode: 'ABSORVER' | 'REPASSAR';
    taxaProcessamento: number;
    taxaPorta: number;
    taxaMinima: number;
    taxaFixaEvento: number;
    quemPagaServico: 'PRODUTOR_ABSORVE' | 'COMPRADOR_PAGA' | 'PRODUTOR_ESCOLHE';
    cotaNomesLista: number;
    taxaNomeExcedente: number;
    cotaCortesias: number;
    taxaCortesiaExcedentePct: number;
    prazoPagamentoDias: number | null;
  }>,
  requestorRole: import('../../../types').ContaVanta,
): Promise<{ ok: boolean; erro?: string }> => {
  const isMaster = requestorRole === 'vanta_masteradm';

  if (!isMaster) {
    return { ok: false, erro: 'Somente administradores VANTA podem alterar taxas contratuais.' };
  }

  const updates: Record<string, unknown> = {};
  if (fields.feePercent !== undefined) updates.vanta_fee_percent = fields.feePercent;
  if (fields.feeFixed !== undefined) updates.vanta_fee_fixed = fields.feeFixed;
  if (fields.gatewayMode !== undefined) updates.gateway_fee_mode = fields.gatewayMode;
  if (fields.taxaProcessamento !== undefined) updates.taxa_processamento_percent = fields.taxaProcessamento;
  if (fields.taxaPorta !== undefined) updates.taxa_porta_percent = fields.taxaPorta;
  if (fields.taxaMinima !== undefined) updates.taxa_minima = fields.taxaMinima;
  if (fields.taxaFixaEvento !== undefined) updates.taxa_fixa_evento = fields.taxaFixaEvento;
  if (fields.quemPagaServico !== undefined) updates.quem_paga_servico = fields.quemPagaServico;
  if (fields.cotaNomesLista !== undefined) updates.cota_nomes_lista = fields.cotaNomesLista;
  if (fields.taxaNomeExcedente !== undefined) updates.taxa_nome_excedente = fields.taxaNomeExcedente;
  if (fields.cotaCortesias !== undefined) updates.cota_cortesias = fields.cotaCortesias;
  if (fields.taxaCortesiaExcedentePct !== undefined)
    updates.taxa_cortesia_excedente_pct = fields.taxaCortesiaExcedentePct;
  if (fields.prazoPagamentoDias !== undefined) updates.prazo_pagamento_dias = fields.prazoPagamentoDias;

  const table = targetType === 'EVENTO' ? 'eventos_admin' : 'comunidades';
  const { error } = await supabase.from(table).update(updates).eq('id', targetId);

  if (error) return { ok: false, erro: error.message };

  // Atualiza cache local (evento)
  if (targetType === 'EVENTO') {
    const ev = EVENTOS_ADMIN.find(e => e.id === targetId);
    if (ev) {
      if (fields.feePercent !== undefined) ev.vanta_fee_percent = fields.feePercent;
      if (fields.feeFixed !== undefined) ev.vanta_fee_fixed = fields.feeFixed;
      if (fields.gatewayMode !== undefined) ev.gateway_fee_mode = fields.gatewayMode;
      if (fields.taxaProcessamento !== undefined) ev.taxa_processamento_percent = fields.taxaProcessamento;
      if (fields.taxaPorta !== undefined) ev.taxa_porta_percent = fields.taxaPorta;
      if (fields.taxaMinima !== undefined) ev.taxa_minima = fields.taxaMinima;
      if (fields.taxaFixaEvento !== undefined) ev.taxa_fixa_evento = fields.taxaFixaEvento;
      if (fields.quemPagaServico !== undefined) ev.quem_paga_servico = fields.quemPagaServico;
      if (fields.cotaNomesLista !== undefined) ev.cota_nomes_lista = fields.cotaNomesLista;
      if (fields.taxaNomeExcedente !== undefined) ev.taxa_nome_excedente = fields.taxaNomeExcedente;
      if (fields.cotaCortesias !== undefined) ev.cota_cortesias = fields.cotaCortesias;
      if (fields.taxaCortesiaExcedentePct !== undefined)
        ev.taxa_cortesia_excedente_pct = fields.taxaCortesiaExcedentePct;
      if (fields.prazoPagamentoDias !== undefined) ev.prazo_pagamento_dias = fields.prazoPagamentoDias;
    }
  }

  return { ok: true };
};

// ── Saldo ───────────────────────────────────────────────────────────────────

export const getSaldoFinanceiro = async (currentUserId: string): Promise<SaldoFinanceiro> => {
  const rbacService = getRbac() ?? (await import('./rbacService')).rbacService;
  const meusEventos = EVENTOS_ADMIN.filter(e =>
    rbacService
      .getAtribuicoes(currentUserId)
      .some(a => a.ativo && a.tenant.tipo === 'EVENTO' && a.tenant.id === e.id && a.cargo === 'SOCIO'),
  );

  let totalVendas = 0;
  for (const ev of meusEventos) {
    const fees = getContractedFees(ev.id);
    const { data } = await supabase
      .from('vendas_log')
      .select('variacao_id, variacao_label, valor, produtor_id, ts, origem')
      .eq('evento_id', ev.id)
      .order('ts', { ascending: false })
      .limit(2000);

    const logs: VendaLog[] = (data ?? []).map(row => ({
      variacaoId: row.variacao_id ?? '',
      variacaoLabel: row.variacao_label ?? '',
      valor: Number(row.valor ?? 0),
      produtorId: row.produtor_id ?? '',
      ts: row.ts ?? '',
      origem: (row.origem ?? 'PORTA') as VendaLog['origem'],
    }));

    const bruto = logs.reduce((s, v) => s + v.valor, 0);

    // Receita de listas pagas (convidados com check-in em regras com valor > 0)
    const listas = listasService.getListasByEvento(ev.id);
    const receitaListas = listas.reduce((acc, l) => {
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

    const brutoTotal = bruto + receitaListas;

    // Taxa VANTA sempre cobrada do cliente — produtor recebe bruto integral
    // Se gatewayMode === 'ABSORVER', produtor paga custo do gateway
    if (fees.gatewayMode === 'ABSORVER') {
      const gwCost = await getGatewayCostByEvento(ev.id);
      totalVendas += brutoTotal - gwCost.totalCusto;
    } else {
      totalVendas += brutoTotal;
    }
  }

  // Saques do Supabase
  const { data: saques } = await supabase
    .from('solicitacoes_saque')
    .select('valor, status')
    .eq('produtor_id', currentUserId)
    .limit(1000);

  const meusSaques = saques ?? [];
  const saquesProcessados = meusSaques
    .filter(s => s.status === 'CONCLUIDO')
    .reduce((s, sq) => s + Number(sq.valor ?? 0), 0);
  const aReceber = meusSaques.filter(s => s.status === 'PENDENTE').reduce((s, sq) => s + Number(sq.valor ?? 0), 0);
  const saldoDisponivel = Math.max(0, totalVendas - saquesProcessados - aReceber);

  return { totalVendas, saldoDisponivel, aReceber, saquesProcessados };
};

// ── Saques ──────────────────────────────────────────────────────────────────

export const solicitarSaque = async (
  data: Omit<SolicitacaoSaque, 'id' | 'solicitadoEm' | 'status' | 'valorLiquido' | 'valorTaxa'>,
): Promise<string> => {
  const fees = getContractedFees(data.eventoId);
  // Taxa VANTA sempre do cliente — não desconta do saque
  // Gateway: se ABSORVER, desconta proporcionalmente do saque
  const gwCost = await getGatewayCostByEvento(data.eventoId);
  const proporcao = gwCost.totalVendas > 0 ? data.valor / gwCost.totalVendas : 0;
  const valorTaxa = fees.gatewayMode === 'ABSORVER' ? Math.round(gwCost.totalCusto * proporcao * 100) / 100 : 0;
  const valorLiquido = Math.round((data.valor - valorTaxa) * 100) / 100;

  const { data: inserted, error } = await supabase
    .from('solicitacoes_saque')
    .insert({
      produtor_id: data.produtorId,
      evento_id: data.eventoId,
      valor: data.valor,
      valor_liquido: valorLiquido,
      valor_taxa: valorTaxa,
      pix_tipo: data.pixTipo,
      pix_chave: data.pixChave,
      status: 'PENDENTE',
      etapa: 'SOLICITADO',
    })
    .select('id')
    .single();

  if (error || !inserted) {
    logger.error('[financeiro] solicitarSaque failed', {
      produtorId: data.produtorId,
      eventoId: data.eventoId,
      valor: data.valor,
      error,
    });
    return '';
  }

  const id = inserted.id as string;

  const { auditService } = await import('./auditService');
  auditService.log(data.produtorId, 'SAQUE_SOLICITADO', 'saque', id, undefined, {
    valor: data.valor,
    valorLiquido,
    valorTaxa,
    feePercent: fees.feePercent,
    status: 'PENDENTE',
  });

  // Notificar gerente(s) da comunidade — hierarquia: sócio→gerente→master
  const ev = EVENTOS_ADMIN.find(e => e.id === data.eventoId);
  if (ev?.comunidadeId) {
    const { data: gerentes } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', ev.comunidadeId)
      .eq('cargo', 'GERENTE')
      .eq('ativo', true);
    if (gerentes && gerentes.length > 0) {
      void notifyMany(
        gerentes.map(g => g.user_id as string),
        {
          tipo: 'SAQUE_SOLICITADO',
          titulo: 'Saque solicitado',
          mensagem: `Saque de R$${data.valor.toFixed(2)} para ${ev.nome}. Autorize para prosseguir.`,
          link: data.eventoId,
        },
      );
    }
  }

  bumpVersion();
  return id;
};

export const getSolicitacoesSaque = async (): Promise<SolicitacaoSaque[]> => {
  // FK para profiles foi dropada (nuclear fix) — buscar nomes separadamente
  const { data } = await supabase
    .from('solicitacoes_saque')
    .select('*, eventos_admin!inner(nome)')
    .order('solicitado_em', { ascending: false })
    .limit(1000);

  if (!data || !data.length) return [];

  // Buscar nomes dos produtores
  const produtorIds = [...new Set(data.map(r => r.produtor_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, nome').in('id', produtorIds);
  const nomeMap = new Map((profiles ?? []).map(p => [p.id, p.nome]));

  return data.map(row => ({
    id: row.id,
    produtorId: row.produtor_id,
    produtorNome: nomeMap.get(row.produtor_id) ?? '',
    eventoId: row.evento_id,
    eventoNome: ((row.eventos_admin as any)?.nome as string) ?? '',
    valor: Number(row.valor ?? 0),
    valorLiquido: Number(row.valor_liquido ?? 0),
    valorTaxa: Number(row.valor_taxa ?? 0),
    pixTipo: row.pix_tipo ?? '',
    pixChave: row.pix_chave ?? '',
    status: (row.status as StatusSaque) ?? 'PENDENTE',
    solicitadoEm: row.solicitado_em ?? '',
    processadoEm: row.processado_em ?? undefined,
    etapa: row.etapa ?? undefined,
    gerenteAprovadoPor: row.gerente_aprovado_por ?? undefined,
    gerenteAprovadoEm: row.gerente_aprovado_em ?? undefined,
    motivoRecusa: row.motivo_recusa ?? undefined,
  }));
};

export const getSaquesByProdutor = async (produtorId: string): Promise<SolicitacaoSaque[]> => {
  const all = await getSolicitacoesSaque();
  return all.filter(s => s.produtorId === produtorId);
};

export const confirmarSaque = async (saqueId: string, operadorId?: string): Promise<void> => {
  // Busca dados do saque antes de atualizar
  const { data: saqueRow } = await supabase
    .from('solicitacoes_saque')
    .select('produtor_id, valor_liquido, evento_id, eventos_admin!inner(nome)')
    .eq('id', saqueId)
    .maybeSingle();

  const { error: errConfirm } = await supabase
    .from('solicitacoes_saque')
    .update({ status: 'CONCLUIDO', processado_em: ts() })
    .eq('id', saqueId);
  if (errConfirm) throw new Error(`Erro ao confirmar saque: ${errConfirm.message}`);

  const { auditService } = await import('./auditService');
  auditService.log(
    operadorId ?? 'masteradm',
    'SAQUE_CONFIRMADO',
    'saque',
    saqueId,
    { status: 'PENDENTE' },
    { status: 'CONCLUIDO' },
  );

  // Notifica produtor (3 canais)
  if (saqueRow?.produtor_id) {
    const evNome = ((saqueRow as any).eventos_admin?.nome as string) ?? '';
    void notify({
      userId: saqueRow.produtor_id as string,
      tipo: 'SAQUE_APROVADO',
      titulo: 'Saque confirmado!',
      mensagem: `Seu saque de R$${Number(saqueRow.valor_liquido ?? 0).toFixed(2)}${evNome ? ` (${evNome})` : ''} foi processado.`,
      link: (saqueRow.evento_id as string) ?? '',
    });
  }

  bumpVersion();
};

export const estornarSaque = async (saqueId: string, operadorId?: string): Promise<void> => {
  // Busca dados do saque antes de atualizar
  const { data: saqueRow } = await supabase
    .from('solicitacoes_saque')
    .select('produtor_id, valor_liquido, evento_id, eventos_admin!inner(nome)')
    .eq('id', saqueId)
    .maybeSingle();

  const { error: errEstorno } = await supabase
    .from('solicitacoes_saque')
    .update({ status: 'ESTORNADO', processado_em: ts() })
    .eq('id', saqueId);
  if (errEstorno) throw new Error(`Erro ao estornar saque: ${errEstorno.message}`);

  const { auditService } = await import('./auditService');
  auditService.log(
    operadorId ?? 'masteradm',
    'SAQUE_ESTORNADO',
    'saque',
    saqueId,
    { status: 'PENDENTE' },
    { status: 'ESTORNADO' },
  );

  // Notifica produtor (3 canais)
  if (saqueRow?.produtor_id) {
    const evNome = ((saqueRow as any).eventos_admin?.nome as string) ?? '';
    void notify({
      userId: saqueRow.produtor_id as string,
      tipo: 'SAQUE_RECUSADO',
      titulo: 'Saque estornado',
      mensagem: `Seu saque de R$${Number(saqueRow.valor_liquido ?? 0).toFixed(2)}${evNome ? ` (${evNome})` : ''} foi estornado. O valor retornou ao saldo.`,
      link: (saqueRow.evento_id as string) ?? '',
    });
  }

  bumpVersion();
};

// ── Reembolsos ──────────────────────────────────────────────────────────────

/**
 * Verifica se um ticket esta dentro da janela de reembolso automatico.
 * Regra: ate 7 dias apos compra E no minimo 48h antes do evento.
 */
export const isReembolsoAutomaticoElegivel = (ticket: TicketCaixa): boolean => {
  if (ticket.status !== 'DISPONIVEL') return false;
  const compra = new Date(ticket.emitidoEm).getTime();
  const agora = Date.now();
  const seteDias = 7 * 24 * 60 * 60 * 1000;
  if (agora - compra > seteDias) return false;

  const ev = EVENTOS_ADMIN.find(e => e.id === ticket.eventoId);
  if (!ev) return false;
  const inicioEvento = new Date(ev.dataInicio).getTime();
  const quarentaEOitoH = 48 * 60 * 60 * 1000;
  return agora < inicioEvento - quarentaEOitoH;
};

/**
 * Processa reembolso automatico (CDC Art. 49).
 * Sem aprovacao humana — ticket elegivel e reembolsado imediatamente.
 */
export const processarReembolsoAutomatico = async (ticketId: string, solicitadoPor: string): Promise<boolean> => {
  // Busca ticket atual
  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('id, evento_id, variacao_id, valor, status, criado_em')
    .eq('id', ticketId)
    .maybeSingle();

  if (!ticketRow || ticketRow.status !== 'DISPONIVEL') return false;

  // Verifica elegibilidade com dados frescos
  const ticket: TicketCaixa = {
    id: ticketRow.id as string,
    eventoId: ticketRow.evento_id as string,
    variacaoId: (ticketRow.variacao_id as string) ?? '',
    variacaoLabel: '',
    email: '',
    nomeTitular: '',
    cpf: '',
    valor: Number(ticketRow.valor),
    status: ticketRow.status as TicketCaixa['status'],
    emitidoEm: ticketRow.criado_em as string,
  };
  if (!isReembolsoAutomaticoElegivel(ticket)) return false;

  // Atualiza ticket + insere registro de reembolso
  const [ticketUpd, reembolsoIns] = await Promise.all([
    supabase.from('tickets_caixa').update({ status: 'REEMBOLSADO' }).eq('id', ticketId),
    supabase.from('reembolsos').insert({
      ticket_id: ticketId,
      evento_id: ticketRow.evento_id,
      tipo: 'AUTOMATICO',
      motivo: 'Direito de arrependimento — CDC Art. 49',
      valor: ticketRow.valor,
      solicitado_por: solicitadoPor,
      solicitado_em: ts(),
      processado_em: ts(),
    }),
  ]);

  if (ticketUpd.error || reembolsoIns.error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(
    solicitadoPor,
    'REEMBOLSO_AUTOMATICO',
    'ticket',
    ticketId,
    { status: 'DISPONIVEL' },
    { status: 'REEMBOLSADO' },
  );

  // Notificar solicitante (3 canais)
  const ev = EVENTOS_ADMIN.find(e => e.id === ticketRow.evento_id);
  void notify({
    userId: solicitadoPor,
    tipo: 'REEMBOLSO_APROVADO',
    titulo: 'Reembolso processado!',
    mensagem: `Seu reembolso de R$${Number(ticketRow.valor).toFixed(2)}${ev ? ` (${ev.nome})` : ''} foi processado automaticamente (CDC Art. 49).`,
    link: 'WALLET',
  });

  // Notificar waitlist — vaga abriu
  if (ticketRow.evento_id && ticketRow.variacao_id) {
    try {
      const { waitlistService } = await import('../../../services/waitlistService');
      void waitlistService.notificarProximos(ticketRow.evento_id as string, ticketRow.variacao_id as string, 1);
    } catch {
      /* silencioso */
    }
  }

  await refresh();
  bumpVersion();
  return true;
};

/**
 * Anti-fraude: verifica contagem mensal de reembolsos do usuário.
 * Limite: 3 reembolsos/mês por conta.
 */
export const verificarLimiteReembolso = async (userId: string): Promise<{ permitido: boolean; contagem: number }> => {
  const now = new Date();
  const inicioMesISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00-03:00`;

  const { count } = await supabase
    .from('reembolsos')
    .select('id', { count: 'exact', head: true })
    .eq('solicitado_por', userId)
    .gte('solicitado_em', inicioMesISO);

  const contagem = count ?? 0;
  return { permitido: contagem < 3, contagem };
};

/**
 * Solicita reembolso manual (fora do prazo CDC).
 * Hierarquia: sócio analisa → gerente autoriza → master executa.
 * Anti-fraude: verificar limite mensal.
 */
export const solicitarReembolso = async (
  ticketId: string,
  motivo: string,
  solicitadoPor: string,
): Promise<{ ok: boolean; erro?: string }> => {
  // Anti-fraude
  const { permitido, contagem } = await verificarLimiteReembolso(solicitadoPor);
  if (!permitido) {
    return { ok: false, erro: `Limite de 3 reembolsos/mês atingido (${contagem} usados). Aguarde o próximo mês.` };
  }

  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('id, evento_id, variacao_id, valor, email')
    .eq('id', ticketId)
    .maybeSingle();

  if (!ticketRow) return { ok: false, erro: 'Ticket não encontrado.' };

  // Insere reembolso com etapa SOLICITADO
  const { error } = await supabase.from('reembolsos').insert({
    ticket_id: ticketId,
    evento_id: ticketRow.evento_id,
    tipo: 'MANUAL',
    motivo,
    valor: ticketRow.valor,
    solicitado_por: solicitadoPor,
    solicitado_em: ts(),
    status: 'PENDENTE_APROVACAO',
    etapa: 'SOLICITADO',
  });

  if (error) return { ok: false, erro: 'Erro ao registrar solicitação.' };

  // Notificar sócio da comunidade do evento (primeiro nível)
  const ev = EVENTOS_ADMIN.find(e => e.id === ticketRow.evento_id);
  if (ev?.comunidadeId) {
    const { data: socios } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', ev.comunidadeId)
      .eq('cargo', 'SOCIO')
      .eq('ativo', true);
    if (socios && socios.length > 0) {
      void notifyMany(
        socios.map(s => s.user_id as string),
        {
          tipo: 'REEMBOLSO_SOLICITADO',
          titulo: 'Reembolso solicitado',
          mensagem: `Reembolso de R$${Number(ticketRow.valor).toFixed(2)} para "${ev.nome}". Motivo: ${motivo}`,
          link: ev.id,
        },
      );
    }
  }

  const { auditService } = await import('./auditService');
  auditService.log(solicitadoPor, 'REEMBOLSO_MANUAL', 'ticket', ticketId, undefined, { status: 'SOLICITADO', motivo });

  return { ok: true };
};

/**
 * Sócio ou gerente analisa reembolso → aprova para próximo nível.
 */
export const aprovarReembolsoEtapa = async (
  reembolsoId: string,
  aprovadorId: string,
  etapaAtual: 'SOLICITADO' | 'SOCIO_ANALISOU',
): Promise<boolean> => {
  const proximaEtapa = etapaAtual === 'SOLICITADO' ? 'SOCIO_ANALISOU' : 'GERENTE_AUTORIZADO';
  const proximaDecisao = etapaAtual === 'SOLICITADO' ? 'socio_decisao' : 'gerente_decisao';
  const proximaDecisaoEm = etapaAtual === 'SOLICITADO' ? 'socio_decisao_em' : 'gerente_decisao_em';

  const { error } = await supabase
    .from('reembolsos')
    .update({
      etapa: proximaEtapa,
      [proximaDecisao]: 'APROVADO',
      [proximaDecisaoEm]: ts(),
    })
    .eq('id', reembolsoId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(
    aprovadorId,
    'REEMBOLSO_MANUAL',
    'reembolso',
    reembolsoId,
    { etapa: etapaAtual },
    { etapa: proximaEtapa },
  );

  // Se gerente autorizou → notificar master para execução final
  if (proximaEtapa === 'GERENTE_AUTORIZADO') {
    const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
    if (masters && masters.length > 0) {
      void notifyMany(
        masters.map(m => m.id as string),
        {
          tipo: 'REEMBOLSO_SOLICITADO',
          titulo: 'Reembolso aguarda aprovação final',
          mensagem: 'Um reembolso foi autorizado pelo gerente e aguarda execução.',
          link: 'ADMIN_HUB',
        },
      );
    }
  }

  return true;
};

/**
 * Master executa reembolso final — atualiza ticket + processa.
 */
export const executarReembolsoFinal = async (reembolsoId: string, executorId: string): Promise<boolean> => {
  const { data: reembolsoRow } = await supabase
    .from('reembolsos')
    .select('ticket_id, evento_id, valor, solicitado_por')
    .eq('id', reembolsoId)
    .maybeSingle();

  if (!reembolsoRow) return false;

  const ticketId = reembolsoRow.ticket_id as string;

  const [ticketUpd, reembolsoUpd] = await Promise.all([
    supabase.from('tickets_caixa').update({ status: 'REEMBOLSADO' }).eq('id', ticketId),
    supabase
      .from('reembolsos')
      .update({
        status: 'APROVADO',
        etapa: 'MASTER_DECIDIU',
        aprovado_por: executorId,
        processado_em: ts(),
      })
      .eq('id', reembolsoId),
  ]);

  if (ticketUpd.error || reembolsoUpd.error) return false;

  // Notificar solicitante
  if (reembolsoRow.solicitado_por) {
    const ev = EVENTOS_ADMIN.find(e => e.id === reembolsoRow.evento_id);
    void notify({
      userId: reembolsoRow.solicitado_por as string,
      tipo: 'REEMBOLSO_APROVADO',
      titulo: 'Reembolso aprovado!',
      mensagem: `Seu reembolso de R$${Number(reembolsoRow.valor).toFixed(2)}${ev ? ` (${ev.nome})` : ''} foi processado.`,
      link: 'WALLET',
    });
  }

  const { auditService } = await import('./auditService');
  auditService.log(
    executorId,
    'REEMBOLSO_MANUAL',
    'ticket',
    ticketId,
    { status: 'DISPONIVEL' },
    { status: 'REEMBOLSADO' },
  );

  // Notificar waitlist
  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('evento_id, variacao_id')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketRow?.evento_id && ticketRow?.variacao_id) {
    try {
      const { waitlistService } = await import('../../../services/waitlistService');
      void waitlistService.notificarProximos(ticketRow.evento_id as string, ticketRow.variacao_id as string, 1);
    } catch {
      /* silencioso */
    }
  }

  await refresh();
  bumpVersion();
  return true;
};

/** Recusar reembolso — motivo obrigatório */
export const recusarReembolso = async (
  reembolsoId: string,
  recusadoPorId: string,
  motivo: string,
): Promise<boolean> => {
  const { data: reembolsoRow } = await supabase
    .from('reembolsos')
    .select('solicitado_por, evento_id, valor')
    .eq('id', reembolsoId)
    .maybeSingle();

  const { error } = await supabase
    .from('reembolsos')
    .update({
      status: 'REJEITADO',
      etapa: 'RECUSADO',
      processado_em: ts(),
    })
    .eq('id', reembolsoId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(recusadoPorId, 'REEMBOLSO_MANUAL', 'reembolso', reembolsoId, undefined, {
    status: 'REJEITADO',
    motivo,
  });

  // Notificar solicitante
  if (reembolsoRow?.solicitado_por) {
    const ev = EVENTOS_ADMIN.find(e => e.id === reembolsoRow.evento_id);
    void notify({
      userId: reembolsoRow.solicitado_por as string,
      tipo: 'REEMBOLSO_RECUSADO',
      titulo: 'Reembolso recusado',
      mensagem: `Seu pedido de reembolso${ev ? ` para ${ev.nome}` : ''} foi recusado. Motivo: ${motivo}`,
      link: 'WALLET',
    });
  }

  return true;
};

/**
 * Produtor aprova reembolso manual legado (manter retrocompatibilidade).
 */
export const aprovarReembolsoManual = async (
  ticketId: string,
  motivo: string,
  aprovadoPor: string,
): Promise<boolean> => {
  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('id, evento_id, variacao_id, valor, email')
    .eq('id', ticketId)
    .maybeSingle();

  if (!ticketRow) return false;

  const [ticketUpd, reembolsoIns] = await Promise.all([
    supabase.from('tickets_caixa').update({ status: 'REEMBOLSADO' }).eq('id', ticketId),
    supabase.from('reembolsos').insert({
      ticket_id: ticketId,
      evento_id: ticketRow.evento_id,
      tipo: 'MANUAL',
      motivo,
      valor: ticketRow.valor,
      solicitado_por: aprovadoPor,
      aprovado_por: aprovadoPor,
      solicitado_em: ts(),
      processado_em: ts(),
      etapa: 'MASTER_DECIDIU',
    }),
  ]);

  if (ticketUpd.error || reembolsoIns.error) return false;

  // Notifica masters (3 canais)
  const ev = EVENTOS_ADMIN.find(e => e.id === ticketRow.evento_id);
  const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
  if (masters && masters.length > 0) {
    void notifyMany(
      masters.map(m => m.id as string),
      {
        tipo: 'REEMBOLSO_APROVADO',
        titulo: 'Reembolso Manual Aprovado',
        mensagem: `Reembolso de R$${Number(ticketRow.valor).toFixed(2)} em "${ev?.nome ?? ''}". Motivo: ${motivo}`,
        link: (ticketRow.evento_id as string) ?? '',
      },
    );
  }

  const { auditService } = await import('./auditService');
  auditService.log(
    aprovadoPor,
    'REEMBOLSO_MANUAL',
    'ticket',
    ticketId,
    { status: 'DISPONIVEL' },
    { status: 'REEMBOLSADO', motivo },
  );

  // Notificar waitlist — vaga abriu
  if (ticketRow.evento_id && ticketRow.variacao_id) {
    try {
      const { waitlistService } = await import('../../../services/waitlistService');
      void waitlistService.notificarProximos(ticketRow.evento_id as string, ticketRow.variacao_id as string, 1);
    } catch {
      /* silencioso */
    }
  }

  await refresh();
  bumpVersion();
  return true;
};

/**
 * Lista todos os reembolsos (para o Financeiro Master).
 */
export const getReembolsos = async (): Promise<Reembolso[]> => {
  // FK para profiles dropada — buscar nomes separadamente
  const { data } = await supabase
    .from('reembolsos')
    .select('*, eventos_admin!inner(nome)')
    .order('solicitado_em', { ascending: false })
    .limit(2000);

  if (!data || !data.length) return [];

  const solicitanteIds = [...new Set(data.map(r => r.solicitado_por).filter(Boolean))] as string[];
  const { data: profiles } = solicitanteIds.length
    ? await supabase.from('profiles').select('id, nome').in('id', solicitanteIds)
    : { data: [] };
  const nomeMap = new Map((profiles ?? []).map(p => [p.id, p.nome]));

  return data.map(row => ({
    id: row.id,
    ticketId: row.ticket_id,
    eventoId: row.evento_id,
    tipo: row.tipo as 'AUTOMATICO' | 'MANUAL',
    motivo: row.motivo ?? '',
    valor: Number(row.valor ?? 0),
    solicitadoPor: row.solicitado_por ?? '',
    aprovadoPor: row.aprovado_por ?? undefined,
    solicitadoEm: row.solicitado_em ?? '',
    processadoEm: row.processado_em ?? undefined,
    eventoNome: ((row.eventos_admin as any)?.nome as string) ?? '',
    produtorNome: nomeMap.get(row.solicitado_por ?? '') ?? '',
    status: (row.status as Reembolso['status']) ?? undefined,
    etapa: row.etapa ?? undefined,
  }));
};

// ── Chargebacks ─────────────────────────────────────────────────────────────

/**
 * Recebe webhook de chargeback do gateway.
 * Deduz imediatamente do saldo do produtor (bloqueio).
 */
export const registrarChargeback = async (ticketId: string, motivo: string, gatewayRef: string): Promise<boolean> => {
  const { data: ticketRow } = await supabase
    .from('tickets_caixa')
    .select('id, evento_id, valor')
    .eq('id', ticketId)
    .maybeSingle();

  if (!ticketRow) return false;

  const { error } = await supabase.from('chargebacks').insert({
    ticket_id: ticketId,
    evento_id: ticketRow.evento_id,
    valor: ticketRow.valor,
    motivo,
    gateway_ref: gatewayRef,
    status: 'ABERTO',
  });

  if (error) return false;

  // Marca ticket como cancelado (chargeback = perda)
  const { error: errCancel } = await supabase.from('tickets_caixa').update({ status: 'CANCELADO' }).eq('id', ticketId);
  if (errCancel) logger.error('[chargeback] ticket cancelamento falhou', errCancel);

  // Alerta masteradm
  const ev = EVENTOS_ADMIN.find(e => e.id === ticketRow.evento_id);
  const { notificationsService } = await import('./notificationsService');
  const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
  for (const master of masters ?? []) {
    void notificationsService.add(
      {
        tipo: 'SISTEMA',
        titulo: 'Chargeback Registrado',
        mensagem: `Chargeback de R$${Number(ticketRow.valor).toFixed(2)} em "${ev?.nome ?? ''}". Ref: ${gatewayRef}`,
        link: ticketRow.evento_id as string,
        lida: false,
        timestamp: ts(),
      },
      master.id as string,
    );
  }

  const { auditService } = await import('./auditService');
  auditService.log(
    'gateway',
    'CHARGEBACK_REGISTRADO',
    'ticket',
    ticketId,
    { status: 'DISPONIVEL' },
    { status: 'CANCELADO', motivo, gatewayRef },
  );

  await refresh();
  bumpVersion();
  return true;
};

/**
 * Lista chargebacks (para KPI global no Financeiro Master).
 */
export const getChargebacks = async (): Promise<Chargeback[]> => {
  const { data } = await supabase
    .from('chargebacks')
    .select('*, eventos_admin!inner(nome, comunidade_id)')
    .order('criado_em', { ascending: false })
    .limit(1000);

  if (!data) return [];
  const { comunidadesService: comSvc } = await import('./comunidadesService');
  return data.map(row => {
    const evData = (row as any).eventos_admin as { nome?: string; comunidade_id?: string } | undefined;
    const comId = evData?.comunidade_id;
    const com = comId ? comSvc.getAll().find(c => c.id === comId) : undefined;
    return {
      id: row.id,
      ticketId: row.ticket_id,
      eventoId: row.evento_id,
      valor: Number(row.valor ?? 0),
      motivo: row.motivo ?? '',
      status: (row.status as StatusChargeback) ?? 'ABERTO',
      gatewayRef: row.gateway_ref ?? '',
      criadoEm: row.criado_em ?? '',
      eventoNome: evData?.nome ?? '',
      comunidadeNome: com?.nome ?? '',
    };
  });
};

// ── Gateway Cost ────────────────────────────────────────────────────────────

/**
 * Calcula custo total de gateway para um conjunto de vendas.
 * Usa metodo de pagamento do ticket (default: CREDITO).
 */
export const getGatewayCostByEvento = async (
  eventoId: string,
): Promise<{ totalCusto: number; totalVendas: number }> => {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('valor, metodo_pagamento')
    .eq('evento_id', eventoId)
    .in('status', ['DISPONIVEL', 'USADO'])
    .limit(1000);

  if (!data) return { totalCusto: 0, totalVendas: 0 };
  let totalCusto = 0;
  let totalVendas = 0;
  for (const row of data) {
    const valor = Number(row.valor ?? 0);
    const metodo = ((row.metodo_pagamento as string) ?? 'CREDITO') as MetodoPagamento;
    totalVendas += valor;
    totalCusto += calcGatewayCost(valor, metodo);
  }
  return { totalCusto: Math.round(totalCusto * 100) / 100, totalVendas: Math.round(totalVendas * 100) / 100 };
};

/**
 * Calcula custo de gateway global (todos os eventos).
 */
export const getGatewayCostGlobal = async (): Promise<{ totalCusto: number; totalVendas: number }> => {
  const { data } = await supabase
    .from('tickets_caixa')
    .select('valor, metodo_pagamento')
    .in('status', ['DISPONIVEL', 'USADO'])
    .limit(1000);

  if (!data) return { totalCusto: 0, totalVendas: 0 };
  let totalCusto = 0;
  let totalVendas = 0;
  for (const row of data) {
    const valor = Number(row.valor ?? 0);
    const metodo = ((row.metodo_pagamento as string) ?? 'CREDITO') as MetodoPagamento;
    totalVendas += valor;
    totalCusto += calcGatewayCost(valor, metodo);
  }
  return { totalCusto: Math.round(totalCusto * 100) / 100, totalVendas: Math.round(totalVendas * 100) / 100 };
};

// ── Hierarquia tripla de saque ────────────────────────────────────────────────

/** Gerente autoriza saque → notifica master para aprovação final */
export const autorizarSaqueGerente = async (saqueId: string, gerenteId: string): Promise<void> => {
  const { data: saqueRow } = await supabase
    .from('solicitacoes_saque')
    .select('produtor_id, valor_liquido, evento_id, eventos_admin!inner(nome, comunidade_id)')
    .eq('id', saqueId)
    .maybeSingle();

  const { error } = await supabase
    .from('solicitacoes_saque')
    .update({
      etapa: 'GERENTE_AUTORIZADO',
      gerente_aprovado_por: gerenteId,
      gerente_aprovado_em: ts(),
    })
    .eq('id', saqueId);

  if (error) throw new Error(`Erro ao autorizar saque: ${error.message}`);

  const { auditService } = await import('./auditService');
  auditService.log(
    gerenteId,
    'SAQUE_CONFIRMADO',
    'saque',
    saqueId,
    { etapa: 'SOLICITADO' },
    { etapa: 'GERENTE_AUTORIZADO' },
  );

  // Notificar solicitante
  if (saqueRow?.produtor_id) {
    void notify({
      userId: saqueRow.produtor_id as string,
      tipo: 'SAQUE_AUTORIZADO',
      titulo: 'Saque autorizado pelo gerente',
      mensagem: 'Seu saque foi autorizado e aguarda aprovação final do master.',
      link: (saqueRow.evento_id as string) ?? '',
    });
  }

  // Notificar masters
  const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');
  if (masters && masters.length > 0) {
    const evNome = ((saqueRow as any)?.eventos_admin?.nome as string) ?? '';
    void notifyMany(
      masters.map(m => m.id as string),
      {
        tipo: 'SAQUE_SOLICITADO',
        titulo: 'Saque aguarda aprovação',
        mensagem: `Saque autorizado pelo gerente para ${evNome}. Aprovação final necessária.`,
        link: 'ADMIN_HUB',
      },
    );
  }

  bumpVersion();
};

/** Master ou gerente recusa saque — motivo obrigatório */
export const recusarSaque = async (saqueId: string, recusadoPorId: string, motivo: string): Promise<void> => {
  const { data: saqueRow } = await supabase
    .from('solicitacoes_saque')
    .select('produtor_id, evento_id, eventos_admin!inner(nome)')
    .eq('id', saqueId)
    .maybeSingle();

  const { error } = await supabase
    .from('solicitacoes_saque')
    .update({
      status: 'RECUSADO',
      etapa: 'RECUSADO',
      motivo_recusa: motivo,
      processado_em: ts(),
    })
    .eq('id', saqueId);

  if (error) throw new Error(`Erro ao recusar saque: ${error.message}`);

  const { auditService } = await import('./auditService');
  auditService.log(recusadoPorId, 'SAQUE_ESTORNADO', 'saque', saqueId, undefined, { status: 'RECUSADO', motivo });

  // Notificar solicitante
  if (saqueRow?.produtor_id) {
    const evNome = ((saqueRow as any).eventos_admin?.nome as string) ?? '';
    void notify({
      userId: saqueRow.produtor_id as string,
      tipo: 'SAQUE_RECUSADO',
      titulo: 'Saque recusado',
      mensagem: `Seu saque para ${evNome} foi recusado. Motivo: ${motivo}`,
      link: (saqueRow.evento_id as string) ?? '',
    });
  }

  bumpVersion();
};

// ── Resumo Financeiro (por evento / comunidade / global) ──────────────────

export interface ResumoFinanceiro {
  receitaBruta: number;
  receitaListas: number;
  custoGateway: number;
  receitaLiquida: number;
  taxaVanta: number;
  totalVendidos: number;
  ticketMedio: number;
  splitProdutor: number;
  splitSocio: number;
  saquesProcessados: number;
  saquesPendentes: number;
  saldoDisponivel: number;
}

/** Resumo financeiro completo de um evento */
export const getResumoFinanceiroEvento = async (eventoId: string): Promise<ResumoFinanceiro> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return emptyResumo();

  const fees = getContractedFees(eventoId);

  const { data: vendasData } = await supabase.from('vendas_log').select('valor').eq('evento_id', eventoId).limit(2000);
  const vendas = vendasData ?? [];
  const receitaBruta = vendas.reduce((s, v) => s + Number(v.valor ?? 0), 0);
  const totalVendidos = vendas.length;

  const listas = listasService.getListasByEvento(eventoId);
  const receitaListas = listas.reduce((acc, l) => {
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

  const brutoTotal = receitaBruta + receitaListas;
  const gwCost = await getGatewayCostByEvento(eventoId);
  const custoGateway = fees.gatewayMode === 'ABSORVER' ? gwCost.totalCusto : 0;
  const receitaLiquida = Math.round((brutoTotal - custoGateway) * 100) / 100;
  const taxaVanta = Math.round((brutoTotal * fees.feePercent + fees.feeFixed * totalVendidos) * 100) / 100;
  const ticketMedio = totalVendidos > 0 ? Math.round((brutoTotal / totalVendidos) * 100) / 100 : 0;

  const splitPct = ev.splitProdutor ?? 100;
  const socioPct = ev.splitSocio ?? 0;
  const splitProdutor = Math.round(((receitaLiquida * splitPct) / 100) * 100) / 100;
  const splitSocio = Math.round(((receitaLiquida * socioPct) / 100) * 100) / 100;

  const { data: saques } = await supabase
    .from('solicitacoes_saque')
    .select('valor, status')
    .eq('evento_id', eventoId)
    .limit(500);
  const saquesProcessados = (saques ?? [])
    .filter(s => s.status === 'CONCLUIDO')
    .reduce((s, sq) => s + Number(sq.valor ?? 0), 0);
  const saquesPendentes = (saques ?? [])
    .filter(s => s.status === 'PENDENTE')
    .reduce((s, sq) => s + Number(sq.valor ?? 0), 0);
  const saldoDisponivel = Math.max(0, receitaLiquida - saquesProcessados - saquesPendentes);

  return {
    receitaBruta: Math.round(brutoTotal * 100) / 100,
    receitaListas: Math.round(receitaListas * 100) / 100,
    custoGateway: Math.round(custoGateway * 100) / 100,
    receitaLiquida,
    taxaVanta,
    totalVendidos,
    ticketMedio,
    splitProdutor,
    splitSocio,
    saquesProcessados: Math.round(saquesProcessados * 100) / 100,
    saquesPendentes: Math.round(saquesPendentes * 100) / 100,
    saldoDisponivel: Math.round(saldoDisponivel * 100) / 100,
  };
};

/** Resumo financeiro de todos os eventos de uma comunidade */
export const getResumoFinanceiroComunidade = async (comunidadeId: string): Promise<ResumoFinanceiro> => {
  const eventos = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId);
  const resumos = await Promise.all(eventos.map(e => getResumoFinanceiroEvento(e.id)));
  return mergeResumos(resumos);
};

/** Resumo financeiro global (todas as comunidades — visao master) */
export const getResumoFinanceiroGlobal = async (): Promise<ResumoFinanceiro> => {
  const resumos = await Promise.all(EVENTOS_ADMIN.map(e => getResumoFinanceiroEvento(e.id)));
  return mergeResumos(resumos);
};

const emptyResumo = (): ResumoFinanceiro => ({
  receitaBruta: 0,
  receitaListas: 0,
  custoGateway: 0,
  receitaLiquida: 0,
  taxaVanta: 0,
  totalVendidos: 0,
  ticketMedio: 0,
  splitProdutor: 0,
  splitSocio: 0,
  saquesProcessados: 0,
  saquesPendentes: 0,
  saldoDisponivel: 0,
});

const mergeResumos = (arr: ResumoFinanceiro[]): ResumoFinanceiro => {
  const r = emptyResumo();
  for (const x of arr) {
    r.receitaBruta += x.receitaBruta;
    r.receitaListas += x.receitaListas;
    r.custoGateway += x.custoGateway;
    r.receitaLiquida += x.receitaLiquida;
    r.taxaVanta += x.taxaVanta;
    r.totalVendidos += x.totalVendidos;
    r.splitProdutor += x.splitProdutor;
    r.splitSocio += x.splitSocio;
    r.saquesProcessados += x.saquesProcessados;
    r.saquesPendentes += x.saquesPendentes;
    r.saldoDisponivel += x.saldoDisponivel;
  }
  r.ticketMedio = r.totalVendidos > 0 ? Math.round((r.receitaBruta / r.totalVendidos) * 100) / 100 : 0;
  for (const k of Object.keys(r) as (keyof ResumoFinanceiro)[]) {
    r[k] = Math.round((r[k] as number) * 100) / 100;
  }
  return r;
};
