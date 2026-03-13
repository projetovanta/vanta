/**
 * eventosAdminAprovacao — Aprovacao, rejeicao e listagem de pendentes.
 */

import { EventoAdmin } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import { notify } from '../../../services/notifyService';
import { EVENTOS_ADMIN, bumpVersion, ts, refresh } from './eventosAdminCore';

export const aprovarEvento = async (
  eventoId: string,
  masterUserId: string,
  negociacao?: {
    feePercent?: number;
    feeFixed?: number;
    gatewayMode?: 'ABSORVER' | 'REPASSAR';
    taxaProcessamento?: number;
    taxaPorta?: number;
    taxaMinima?: number;
    taxaFixaEvento?: number;
    cotaNomesLista?: number;
    taxaNomeExcedente?: number;
    cotaCortesias?: number;
    taxaCortesiaExcedentePct?: number;
    prazoPagamentoDias?: number | null;
  },
): Promise<boolean> => {
  const updates: Record<string, unknown> = {
    publicado: true,
    motivo_rejeicao: null,
    rejeicao_campos: null,
    rodada_rejeicao: 0,
    status_evento: 'ATIVO',
  };
  if (negociacao?.feePercent !== undefined) updates.vanta_fee_percent = negociacao.feePercent;
  if (negociacao?.feeFixed !== undefined) updates.vanta_fee_fixed = negociacao.feeFixed;
  if (negociacao?.gatewayMode !== undefined) updates.gateway_fee_mode = negociacao.gatewayMode;
  if (negociacao?.taxaProcessamento !== undefined) updates.taxa_processamento_percent = negociacao.taxaProcessamento;
  if (negociacao?.taxaPorta !== undefined) updates.taxa_porta_percent = negociacao.taxaPorta;
  if (negociacao?.taxaMinima !== undefined) updates.taxa_minima = negociacao.taxaMinima;
  if (negociacao?.taxaFixaEvento !== undefined) updates.taxa_fixa_evento = negociacao.taxaFixaEvento;
  if (negociacao?.cotaNomesLista !== undefined) updates.cota_nomes_lista = negociacao.cotaNomesLista;
  if (negociacao?.taxaNomeExcedente !== undefined) updates.taxa_nome_excedente = negociacao.taxaNomeExcedente;
  if (negociacao?.cotaCortesias !== undefined) updates.cota_cortesias = negociacao.cotaCortesias;
  if (negociacao?.taxaCortesiaExcedentePct !== undefined)
    updates.taxa_cortesia_excedente_pct = negociacao.taxaCortesiaExcedentePct;
  if (negociacao?.prazoPagamentoDias !== undefined) updates.prazo_pagamento_dias = negociacao.prazoPagamentoDias;

  const { error } = await supabase.from('eventos_admin').update(updates).eq('id', eventoId);

  if (error) {
    console.error('[eventosAdminService] aprovarEvento erro:', error);
    return false;
  }

  // Audit
  const { auditService } = await import('./auditService');
  auditService.log(
    masterUserId,
    'EVENTO_APROVADO',
    'evento',
    eventoId,
    { publicado: false },
    { publicado: true, negociacao },
  );

  // Notifica o CRIADOR do evento (não o master que aprovou)
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (ev?.criadorId) {
    void notify({
      userId: ev.criadorId,
      titulo: 'Evento aprovado!',
      mensagem: `"${ev.nome}" foi aprovado e já aparece no app.`,
      tipo: 'EVENTO_APROVADO',
      link: eventoId,
    });
  }

  // Auto-aceitar sócios + criar RBAC + notificar
  if (ev?.socios && ev.socios.length > 0) {
    await supabase.from('socios_evento').update({ status: 'ACEITO' }).eq('evento_id', eventoId).neq('status', 'ACEITO');

    try {
      const { rbacService, CARGO_PERMISSOES } = await import('./rbacService');
      for (const socio of ev.socios) {
        await rbacService.atribuir({
          userId: socio.socioId,
          tenant: { tipo: 'EVENTO', id: eventoId, nome: ev.nome ?? '', foto: ev.foto },
          cargo: 'SOCIO',
          permissoes: CARGO_PERMISSOES.SOCIO,
          atribuidoPor: masterUserId,
          ativo: true,
        });
        void notify({
          userId: socio.socioId,
          titulo: 'Você foi adicionado a um evento',
          mensagem: `Você foi adicionado ao evento "${ev.nome}" com ${socio.splitPercentual}% de participação.`,
          tipo: 'SOCIO_ADICIONADO',
          link: eventoId,
        });
      }
    } catch {
      /* silencioso — RBAC pode já existir */
    }
  }

  await refresh();
  bumpVersion();
  return true;
};

export const rejeitarEvento = async (
  eventoId: string,
  masterUserId: string,
  motivo: string,
  campos?: Record<string, string>,
): Promise<boolean> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  const rodadaAtual = (ev?.rodadaRejeicao ?? 0) + 1;
  const cancelado = rodadaAtual >= 3;

  const { error } = await supabase
    .from('eventos_admin')
    .update({
      publicado: false,
      motivo_rejeicao: motivo,
      rejeicao_campos: campos ?? null,
      rodada_rejeicao: rodadaAtual,
      status_evento: cancelado ? 'CANCELADO' : 'EM_REVISAO',
    })
    .eq('id', eventoId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(masterUserId, 'EVENTO_REJEITADO', 'evento', eventoId, {}, { motivo, campos, rodada: rodadaAtual });

  // Notifica o CRIADOR do evento (push + in-app + email)
  if (ev?.criadorId) {
    const msg = cancelado
      ? `"${ev.nome}" foi cancelado após ${rodadaAtual} rejeições.`
      : `"${ev.nome}" precisa de correções (rodada ${rodadaAtual}/3). ${motivo}`;
    void notify({
      userId: ev.criadorId,
      titulo: cancelado ? 'Evento cancelado' : 'Evento precisa de correções',
      mensagem: msg,
      tipo: 'EVENTO_RECUSADO',
      link: eventoId,
    });
  }

  await refresh();
  bumpVersion();
  return true;
};

export const getEventosPendentes = (): EventoAdmin[] => EVENTOS_ADMIN.filter(e => e.statusEvento === 'PENDENTE');

const getEventosEmRevisao = (criadorId: string): EventoAdmin[] =>
  EVENTOS_ADMIN.filter(e => e.statusEvento === 'EM_REVISAO' && e.criadorId === criadorId);

const getEventosRejeitados = (criadorId: string): EventoAdmin[] =>
  EVENTOS_ADMIN.filter(e => e.statusEvento === 'CANCELADO' && e.criadorId === criadorId);

/** Gerente envia correções após rejeição. Só pode editar os campos apontados em rejeicao_campos. */
export const enviarCorrecao = async (
  eventoId: string,
  gerenteId: string,
  correcoes: Record<string, unknown>,
): Promise<boolean> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev || ev.statusEvento !== 'EM_REVISAO') return false;
  if (ev.criadorId !== gerenteId) return false;

  // Validar que só está alterando campos permitidos
  const camposPermitidos = ev.rejeicaoCampos ? Object.keys(ev.rejeicaoCampos) : [];
  const camposEnviados = Object.keys(correcoes);
  const camposNaoPermitidos = camposEnviados.filter(c => !camposPermitidos.includes(c));
  if (camposNaoPermitidos.length > 0) return false;

  const { error } = await supabase
    .from('eventos_admin')
    .update({
      ...correcoes,
      status_evento: 'PENDENTE',
      rejeicao_campos: null,
      motivo_rejeicao: null,
    })
    .eq('id', eventoId);

  if (error) return false;

  const { auditService } = await import('./auditService');
  auditService.log(
    gerenteId,
    'EVENTO_CORRECAO_ENVIADA',
    'evento',
    eventoId,
    {},
    { campos: camposEnviados, rodada: ev.rodadaRejeicao },
  );

  await refresh();
  bumpVersion();
  return true;
};

// ── Proposta VANTA (eventos SEM VENDA) ────────────────────────────────────────

/**
 * Master envia Proposta VANTA para evento sem venda.
 * Proposta inclui: % comissão como afiliado + código/link de comissário + mensagem.
 */
export const enviarPropostaVanta = async (
  eventoId: string,
  masterUserId: string,
  proposta: { comissao: number; codigoAfiliado: string; mensagem?: string },
): Promise<boolean> => {
  const { error } = await supabase
    .from('eventos_admin')
    .update({
      proposta_status: 'ENVIADA',
      proposta_rodada: 1,
      comissao_vanta: proposta.comissao,
      codigo_afiliado: proposta.codigoAfiliado,
      proposta_mensagem: proposta.mensagem ?? null,
      status_evento: 'PENDENTE',
    })
    .eq('id', eventoId);

  if (error) {
    console.error('[eventosAdminAprovacao] enviarPropostaVanta erro:', error);
    return false;
  }

  const { auditService } = await import('./auditService');
  auditService.log(masterUserId, 'PROPOSTA_VANTA_ENVIADA', 'evento', eventoId, {}, { proposta });

  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (ev?.criadorId) {
    void notify({
      userId: ev.criadorId,
      titulo: 'Proposta VANTA recebida',
      mensagem: `Recebemos seu evento "${ev.nome}" e enviamos uma proposta de parceria. Avalie no seu painel.`,
      tipo: 'EVENTO_PENDENTE',
      link: eventoId,
    });
  }

  await refresh();
  bumpVersion();
  return true;
};

/**
 * Dono (gerente/sócio) aceita a Proposta VANTA.
 * Evento é aprovado e publicado.
 */
export const aceitarPropostaVanta = async (eventoId: string, donoId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('eventos_admin')
    .update({
      proposta_status: 'ACEITA',
      publicado: true,
      status_evento: 'ATIVO',
      motivo_rejeicao: null,
    })
    .eq('id', eventoId);

  if (error) {
    console.error('[eventosAdminAprovacao] aceitarPropostaVanta erro:', error);
    return false;
  }

  const { auditService } = await import('./auditService');
  auditService.log(donoId, 'PROPOSTA_VANTA_ACEITA', 'evento', eventoId, {}, {});

  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (ev?.criadorId) {
    void notify({
      userId: ev.criadorId,
      titulo: 'Evento aprovado!',
      mensagem: `"${ev.nome}" foi aprovado e já aparece no app.`,
      tipo: 'EVENTO_APROVADO',
      link: eventoId,
    });
  }

  await refresh();
  bumpVersion();
  return true;
};

/**
 * Dono recusa a Proposta VANTA.
 * Se rodada < 3 → volta para PENDENTE (master pode reenviar).
 * Se rodada >= 3 → RECUSADA definitivamente, evento fica publicado SEM acordo.
 */
export const recusarPropostaVanta = async (
  eventoId: string,
  donoId: string,
  motivo?: string,
): Promise<{ ok: boolean; definitivo: boolean }> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  const rodada = ev?.propostaRodada ?? 1;
  const definitivo = rodada >= 3;

  const updates: Record<string, unknown> = definitivo
    ? { proposta_status: 'RECUSADA', publicado: true, status_evento: 'ATIVO', motivo_rejeicao: null }
    : { proposta_status: 'RECUSADA', status_evento: 'PENDENTE', proposta_mensagem: motivo ?? null };

  const { error } = await supabase.from('eventos_admin').update(updates).eq('id', eventoId);
  if (error) return { ok: false, definitivo };

  const { auditService } = await import('./auditService');
  auditService.log(donoId, 'PROPOSTA_VANTA_RECUSADA', 'evento', eventoId, {}, { motivo, rodada, definitivo });

  await refresh();
  bumpVersion();
  return { ok: true, definitivo };
};

/**
 * Master reenvia Proposta VANTA com valores ajustados (máx 3 rodadas).
 */
export const reenviarPropostaVanta = async (
  eventoId: string,
  masterUserId: string,
  proposta: { comissao: number; codigoAfiliado: string; mensagem?: string },
): Promise<{ ok: boolean; erro?: string }> => {
  const ev = EVENTOS_ADMIN.find(e => e.id === eventoId);
  if (!ev) return { ok: false, erro: 'Evento não encontrado' };

  const rodadaAtual = ev.propostaRodada ?? 1;
  if (rodadaAtual >= 3) return { ok: false, erro: 'Limite de 3 rodadas atingido' };

  const novaRodada = rodadaAtual + 1;
  const { error } = await supabase
    .from('eventos_admin')
    .update({
      proposta_status: 'ENVIADA',
      proposta_rodada: novaRodada,
      comissao_vanta: proposta.comissao,
      codigo_afiliado: proposta.codigoAfiliado,
      proposta_mensagem: proposta.mensagem ?? null,
      status_evento: 'PENDENTE',
    })
    .eq('id', eventoId);

  if (error) return { ok: false, erro: error.message };

  const { auditService } = await import('./auditService');
  auditService.log(masterUserId, 'PROPOSTA_VANTA_REENVIADA', 'evento', eventoId, {}, { proposta, rodada: novaRodada });

  if (ev.criadorId) {
    void notify({
      userId: ev.criadorId,
      titulo: 'Proposta VANTA atualizada',
      mensagem: `Nova proposta para "${ev.nome}" (rodada ${novaRodada}/3). Avalie no seu painel.`,
      tipo: 'EVENTO_PENDENTE',
      link: eventoId,
    });
  }

  await refresh();
  bumpVersion();
  return { ok: true };
};

/** Retorna eventos SEM VENDA com proposta pendente para o dono responder */
export const getPropostasPendentes = (donoId: string): EventoAdmin[] =>
  EVENTOS_ADMIN.filter(e => e.vendaVanta === false && e.propostaStatus === 'ENVIADA' && e.criadorId === donoId);
