/**
 * reembolsoService — Reembolso de Ingressos com Cadeia Hierárquica
 * CDC Art. 49: Automático até 7 dias + 48h antes do evento → APROVADO direto
 * Manual: Solicitado → AGUARDANDO_SOCIO → AGUARDANDO_GERENTE → AGUARDANDO_MASTER → APROVADO
 * Níveis vazios são pulados automaticamente.
 * Qualquer nível pode REJEITAR (final).
 * Anti-fraude: máximo 3 reembolsos manuais/mês por solicitante.
 */

import { supabase } from '../../../services/supabaseClient';
import type { Reembolso, StatusReembolso } from './eventosAdminTypes';
import { logger } from '../../../services/logger';
import { tsBR } from '../../../utils';
import { notify, notifyMany } from '../../../services/notifyService';

// ── Mapeador: snake_case (Supabase) → camelCase (TS) ─────────────────────
const mapReembolsoFromDB = (row: any): Reembolso => ({
  id: row.id,
  ticketId: row.ticket_id,
  eventoId: row.evento_id,
  tipo: row.tipo,
  status: row.status,
  motivo: row.motivo,
  valor: Number(row.valor ?? 0),
  solicitadoPor: row.solicitado_por,
  solicitadoEmail: row.solicitado_email,
  solicitadoNome: row.solicitado_nome,
  aprovadoPor: row.aprovado_por,
  solicitadoEm: row.solicitado_em,
  processadoEm: row.processado_em,
  eventoNome: row.evento_nome ?? (row.eventos_admin as any)?.nome,
  produtorNome: row.produtor_nome,
  etapa: row.etapa,
  rejeitadoPor: row.rejeitado_por,
  rejeitadoEm: row.rejeitado_em,
  rejeitadoMotivo: row.rejeitado_motivo,
  socioDecisao: row.socio_decisao,
  socioDecisaoEm: row.socio_decisao_em,
  gerenteDecisao: row.gerente_decisao,
  gerenteDecisaoEm: row.gerente_decisao_em,
  compradorNome: row.comprador_nome,
});

// ── Constantes ───────────────────────────────────────────────────────────────────
const DIAS_DIREITO_ARREPENDIMENTO = 7;
const HORAS_ANTES_EVENTO = 48;
const LIMITE_REEMBOLSOS_MES = 3;

// ── Anti-fraude: verificar limite mensal ──────────────────────────────────────────
async function verificarLimiteReembolso(userId: string): Promise<{ permitido: boolean; contagem: number }> {
  const now = new Date();
  const inicioMesISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00-03:00`;

  const { count } = await supabase
    .from('reembolsos')
    .select('id', { count: 'exact', head: true })
    .eq('solicitado_por', userId)
    .gte('solicitado_em', inicioMesISO);

  const contagem = count ?? 0;
  return { permitido: contagem < LIMITE_REEMBOLSOS_MES, contagem };
}

// ── Descobrir próximo nível na cadeia hierárquica ─────────────────────────────────
async function detectarNivelInicial(eventoId: string): Promise<StatusReembolso> {
  // Verificar se evento tem sócio
  const { data: evento } = await supabase
    .from('eventos_admin')
    .select('comunidade_id')
    .eq('id', eventoId)
    .maybeSingle();

  if (!evento?.comunidade_id) return 'AGUARDANDO_MASTER';

  const comunidadeId = evento.comunidade_id as string;

  // Tem sócio?
  const { count: socioCount } = await supabase
    .from('atribuicoes_rbac')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_type', 'COMUNIDADE')
    .eq('tenant_id', comunidadeId)
    .eq('cargo', 'SOCIO')
    .eq('ativo', true);

  if (socioCount && socioCount > 0) return 'AGUARDANDO_SOCIO';

  // Tem gerente?
  const { count: gerenteCount } = await supabase
    .from('atribuicoes_rbac')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_type', 'COMUNIDADE')
    .eq('tenant_id', comunidadeId)
    .eq('cargo', 'GERENTE')
    .eq('ativo', true);

  if (gerenteCount && gerenteCount > 0) return 'AGUARDANDO_GERENTE';

  return 'AGUARDANDO_MASTER';
}

async function detectarProximoNivel(eventoId: string, statusAtual: StatusReembolso): Promise<StatusReembolso> {
  const { data: evento } = await supabase
    .from('eventos_admin')
    .select('comunidade_id')
    .eq('id', eventoId)
    .maybeSingle();

  const comunidadeId = (evento?.comunidade_id as string) ?? '';

  if (statusAtual === 'AGUARDANDO_SOCIO') {
    // Próximo: gerente ou master?
    const { count: gerenteCount } = await supabase
      .from('atribuicoes_rbac')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', comunidadeId)
      .eq('cargo', 'GERENTE')
      .eq('ativo', true);

    return gerenteCount && gerenteCount > 0 ? 'AGUARDANDO_GERENTE' : 'AGUARDANDO_MASTER';
  }

  if (statusAtual === 'AGUARDANDO_GERENTE') {
    return 'AGUARDANDO_MASTER';
  }

  // AGUARDANDO_MASTER → APROVADO
  return 'APROVADO';
}

// ── Notificar nível atual ─────────────────────────────────────────────────────────
async function notificarNivel(eventoId: string, status: StatusReembolso, valor: number, motivo: string) {
  const { data: evento } = await supabase
    .from('eventos_admin')
    .select('nome, comunidade_id')
    .eq('id', eventoId)
    .maybeSingle();

  const eventoNome = (evento?.nome as string) ?? 'Evento';
  const comunidadeId = (evento?.comunidade_id as string) ?? '';
  const msgBase = `Reembolso de R$${valor.toFixed(2)} em "${eventoNome}". Motivo: ${motivo}`;

  if (status === 'AGUARDANDO_SOCIO') {
    const { data: socios } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', comunidadeId)
      .eq('cargo', 'SOCIO')
      .eq('ativo', true);

    if (socios?.length) {
      void notifyMany(
        socios.map(s => s.user_id as string),
        { tipo: 'REEMBOLSO_SOLICITADO', titulo: 'Reembolso aguarda sua análise', mensagem: msgBase, link: eventoId },
      );
    }
  } else if (status === 'AGUARDANDO_GERENTE') {
    const { data: gerentes } = await supabase
      .from('atribuicoes_rbac')
      .select('user_id')
      .eq('tenant_type', 'COMUNIDADE')
      .eq('tenant_id', comunidadeId)
      .eq('cargo', 'GERENTE')
      .eq('ativo', true);

    if (gerentes?.length) {
      void notifyMany(
        gerentes.map(g => g.user_id as string),
        {
          tipo: 'REEMBOLSO_SOLICITADO',
          titulo: 'Reembolso aguarda sua autorização',
          mensagem: msgBase,
          link: eventoId,
        },
      );
    }
  } else if (status === 'AGUARDANDO_MASTER') {
    const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');

    if (masters?.length) {
      void notifyMany(
        masters.map(m => m.id as string),
        {
          tipo: 'REEMBOLSO_SOLICITADO',
          titulo: 'Reembolso aguarda aprovação final',
          mensagem: msgBase,
          link: 'ADMIN_HUB',
        },
      );
    }
  }
}

// ── Validar se ingresso pode ser reembolsado automaticamente ────────────────────
export async function podeReembolsoAutomatico(
  ticketId: string,
  eventoId: string,
): Promise<{ pode: boolean; motivo?: string }> {
  try {
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('criado_em, status')
      .eq('id', ticketId)
      .maybeSingle();

    if (ticketErr || !ticket) {
      return { pode: false, motivo: 'Ingresso não encontrado' };
    }

    if (ticket.status !== 'DISPONIVEL') {
      return { pode: false, motivo: `Ingresso com status ${ticket.status}` };
    }

    const { data: evento, error: eventoErr } = await supabase
      .from('eventos_admin')
      .select('data_inicio')
      .eq('id', eventoId)
      .maybeSingle();

    if (eventoErr || !evento) {
      return { pode: false, motivo: 'Evento não encontrado' };
    }

    const agora = new Date();
    const dataCompra = new Date(ticket.criado_em);
    const dataEvento = new Date(evento.data_inicio);

    const diasDesdeCompra = Math.floor((agora.getTime() - dataCompra.getTime()) / (1000 * 60 * 60 * 24));

    if (diasDesdeCompra > DIAS_DIREITO_ARREPENDIMENTO) {
      return { pode: false, motivo: 'Prazo de 7 dias expirou' };
    }

    const horasAteEvento = (dataEvento.getTime() - agora.getTime()) / (1000 * 60 * 60);
    if (horasAteEvento < HORAS_ANTES_EVENTO) {
      return { pode: false, motivo: 'Faltam menos de 48h para o evento' };
    }

    return { pode: true };
  } catch (err) {
    logger.error('[reembolso] validar automático failed', { ticketId, eventoId, err });
    return { pode: false, motivo: 'Erro interno' };
  }
}

// ── Solicitar reembolso automático (CDC Art. 49) ──────────────────────────────────
export async function solicitarReembolsoAutomatico(
  ticketId: string,
  eventoId: string,
  userId: string,
): Promise<{ success: boolean; error?: string; reembolsoId?: string }> {
  try {
    const { pode, motivo } = await podeReembolsoAutomatico(ticketId, eventoId);
    if (!pode) {
      return { success: false, error: motivo || 'Reembolso não permitido' };
    }

    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('valor')
      .eq('id', ticketId)
      .maybeSingle();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Erro ao buscar ticket' };
    }

    // Automático: marcar ticket + inserir reembolso APROVADO de uma vez
    const agora = tsBR();
    const [ticketUpd, reembolsoIns] = await Promise.all([
      supabase.from('tickets_caixa').update({ status: 'REEMBOLSADO' }).eq('id', ticketId),
      supabase
        .from('reembolsos')
        .insert({
          ticket_id: ticketId,
          evento_id: eventoId,
          tipo: 'AUTOMATICO',
          status: 'APROVADO',
          motivo: 'Reembolso automático CDC Art. 49',
          valor: ticket.valor,
          solicitado_por: userId,
          aprovado_por: userId,
          solicitado_em: agora,
          processado_em: agora,
          etapa: 'AUTOMATICO',
        })
        .select('id')
        .single(),
    ]);

    if (ticketUpd.error || reembolsoIns.error || !reembolsoIns.data) {
      return { success: false, error: 'Erro ao processar reembolso' };
    }

    // C4: Refund real no Stripe (automático até R$100, manual acima)
    supabase.functions
      .invoke('process-stripe-refund', {
        body: { reembolso_id: reembolsoIns.data.id },
      })
      .then(({ error: refundErr }) => {
        if (refundErr)
          logger.error('[reembolso] refund Stripe falhou', { reembolsoId: reembolsoIns.data.id, err: refundErr });
      });

    return { success: true, reembolsoId: reembolsoIns.data.id };
  } catch (err) {
    logger.error('[reembolso] solicitar automático failed', { ticketId, eventoId, userId, err });
    return { success: false, error: 'Erro interno' };
  }
}

// ── Solicitar reembolso manual → cadeia hierárquica ──────────────────────────────
export async function solicitarReembolsoManual(
  ticketId: string,
  eventoId: string,
  motivo: string,
  userId: string,
): Promise<{ success: boolean; error?: string; reembolsoId?: string }> {
  try {
    // Anti-fraude
    const { permitido, contagem } = await verificarLimiteReembolso(userId);
    if (!permitido) {
      return {
        success: false,
        error: `Limite de ${LIMITE_REEMBOLSOS_MES} reembolsos/mês atingido (${contagem} usados).`,
      };
    }

    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets_caixa')
      .select('valor, status')
      .eq('id', ticketId)
      .maybeSingle();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Ingresso não encontrado' };
    }

    if (ticket.status !== 'DISPONIVEL') {
      return { success: false, error: `Ingresso com status ${ticket.status}` };
    }

    // Detectar nível inicial na cadeia
    const statusInicial = await detectarNivelInicial(eventoId);
    const agora = tsBR();

    const { data, error } = await supabase
      .from('reembolsos')
      .insert({
        ticket_id: ticketId,
        evento_id: eventoId,
        tipo: 'MANUAL',
        status: statusInicial,
        motivo: motivo || 'Reembolso manual solicitado',
        valor: ticket.valor,
        solicitado_por: userId,
        solicitado_em: agora,
        notificado_em: agora,
        etapa: 'SOLICITADO',
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: 'Erro ao processar reembolso' };
    }

    // Notificar o nível responsável
    void notificarNivel(eventoId, statusInicial, Number(ticket.valor), motivo);

    return { success: true, reembolsoId: data.id };
  } catch (err) {
    logger.error('[reembolso] solicitar manual failed', { ticketId, eventoId, userId, err });
    return { success: false, error: 'Erro interno' };
  }
}

// ── Aprovar reembolso na etapa atual → avança pro próximo nível ───────────────────
export async function aprovarReembolsoEtapa(
  reembolsoId: string,
  aprovadorId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reembolso, error: reembolsoErr } = await supabase
      .from('reembolsos')
      .select('id, ticket_id, evento_id, status, valor, motivo, solicitado_por')
      .eq('id', reembolsoId)
      .maybeSingle();

    if (reembolsoErr || !reembolso) {
      return { success: false, error: 'Reembolso não encontrado' };
    }

    const statusAtual = reembolso.status as StatusReembolso;
    const statusAguardando: StatusReembolso[] = ['AGUARDANDO_SOCIO', 'AGUARDANDO_GERENTE', 'AGUARDANDO_MASTER'];
    if (!statusAguardando.includes(statusAtual)) {
      return { success: false, error: `Reembolso com status ${statusAtual} não pode ser aprovado nesta etapa` };
    }

    const agora = tsBR();
    const proximoStatus = await detectarProximoNivel(reembolso.evento_id as string, statusAtual);

    // Montar update com a decisão do nível atual
    const updateData: Record<string, unknown> = {
      status: proximoStatus,
      updated_at: agora,
    };

    if (statusAtual === 'AGUARDANDO_SOCIO') {
      updateData.socio_id = aprovadorId;
      updateData.socio_decisao = 'APROVADO';
      updateData.socio_decisao_em = agora;
      updateData.etapa = 'SOCIO_ANALISOU';
    } else if (statusAtual === 'AGUARDANDO_GERENTE') {
      updateData.gerente_id = aprovadorId;
      updateData.gerente_decisao = 'APROVADO';
      updateData.gerente_decisao_em = agora;
      updateData.etapa = 'GERENTE_AUTORIZADO';
    } else if (statusAtual === 'AGUARDANDO_MASTER') {
      updateData.aprovado_por = aprovadorId;
      updateData.processado_em = agora;
      updateData.etapa = 'MASTER_DECIDIU';
    }

    const { error: updateErr } = await supabase.from('reembolsos').update(updateData).eq('id', reembolsoId);

    if (updateErr) {
      return { success: false, error: 'Erro ao atualizar reembolso' };
    }

    // Se master aprovou (próximo = APROVADO), marcar ticket como REEMBOLSADO
    if (proximoStatus === 'APROVADO') {
      await supabase.from('tickets_caixa').update({ status: 'REEMBOLSADO' }).eq('id', reembolso.ticket_id);

      // C4: Refund real no Stripe (automático até R$100, manual acima)
      supabase.functions
        .invoke('process-stripe-refund', {
          body: { reembolso_id: reembolsoId },
        })
        .then(({ error: refundErr }) => {
          if (refundErr) logger.error('[reembolso] refund Stripe falhou', { reembolsoId, err: refundErr });
        });

      // Notificar solicitante
      const { data: evento } = await supabase
        .from('eventos_admin')
        .select('nome')
        .eq('id', reembolso.evento_id)
        .maybeSingle();

      void notify({
        userId: reembolso.solicitado_por as string,
        tipo: 'REEMBOLSO_APROVADO',
        titulo: 'Reembolso aprovado!',
        mensagem: `Seu reembolso de R$${Number(reembolso.valor).toFixed(2)}${evento?.nome ? ` (${evento.nome})` : ''} foi processado.`,
        link: 'WALLET',
      });
    } else {
      // Notificar próximo nível
      void notificarNivel(
        reembolso.evento_id as string,
        proximoStatus,
        Number(reembolso.valor),
        reembolso.motivo as string,
      );
    }

    return { success: true };
  } catch (err) {
    logger.error('[reembolso] aprovar etapa failed', { reembolsoId, aprovadorId, err });
    return { success: false, error: 'Erro interno' };
  }
}

// ── Rejeitar reembolso (qualquer nível) → REJEITADO (final) ──────────────────────
export async function rejeitarReembolsoManual(
  reembolsoId: string,
  rejeitadoPorId: string,
  motivo: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reembolso, error: reembolsoErr } = await supabase
      .from('reembolsos')
      .select('id, tipo, status, solicitado_por, evento_id, valor')
      .eq('id', reembolsoId)
      .maybeSingle();

    if (reembolsoErr || !reembolso) {
      return { success: false, error: 'Reembolso não encontrado' };
    }

    const statusAtual = reembolso.status as StatusReembolso;
    const statusPermitidos: StatusReembolso[] = [
      'PENDENTE_APROVACAO',
      'AGUARDANDO_SOCIO',
      'AGUARDANDO_GERENTE',
      'AGUARDANDO_MASTER',
    ];
    if (!statusPermitidos.includes(statusAtual)) {
      return { success: false, error: `Reembolso com status ${statusAtual} não pode ser rejeitado` };
    }

    const agora = tsBR();
    const { error: updateErr } = await supabase
      .from('reembolsos')
      .update({
        status: 'REJEITADO',
        rejeitado_por: rejeitadoPorId,
        rejeitado_em: agora,
        rejeitado_motivo: motivo || 'Rejeitado',
        etapa: 'RECUSADO',
        updated_at: agora,
      })
      .eq('id', reembolsoId);

    if (updateErr) {
      return { success: false, error: 'Erro ao rejeitar reembolso' };
    }

    // Notificar solicitante
    if (reembolso.solicitado_por) {
      const { data: evento } = await supabase
        .from('eventos_admin')
        .select('nome')
        .eq('id', reembolso.evento_id)
        .maybeSingle();

      void notify({
        userId: reembolso.solicitado_por as string,
        tipo: 'REEMBOLSO_RECUSADO',
        titulo: 'Reembolso recusado',
        mensagem: `Seu pedido de reembolso${evento?.nome ? ` para ${evento.nome}` : ''} foi recusado. Motivo: ${motivo}`,
        link: 'WALLET',
      });
    }

    return { success: true };
  } catch (err) {
    logger.error('[reembolso] rejeitar manual failed', { reembolsoId, rejeitadoPorId, motivo, err });
    return { success: false, error: 'Erro interno' };
  }
}

// ── Obter reembolsos de um evento ────────────────────────────────────────────────
export async function getReembolsosPorEvento(eventoId: string): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select('*')
      .eq('evento_id', eventoId)
      .order('solicitado_em', { ascending: false })
      .limit(1000);

    if (error) {
      logger.error('[reembolso] buscar por evento failed', error);
      return [];
    }

    return (data || []).map(mapReembolsoFromDB);
  } catch (err) {
    logger.error('[reembolso] buscar por evento exception', err);
    return [];
  }
}

// ── Obter reembolsos pendentes (qualquer nível aguardando) ───────────────────────
export async function getReembolsosPendentes(): Promise<Reembolso[]> {
  try {
    const { data, error } = await supabase
      .from('reembolsos')
      .select('*, eventos_admin!evento_id(nome)')
      .eq('tipo', 'MANUAL')
      .in('status', ['PENDENTE_APROVACAO', 'AGUARDANDO_SOCIO', 'AGUARDANDO_GERENTE', 'AGUARDANDO_MASTER'])
      .order('solicitado_em', { ascending: true })
      .limit(1000);

    if (error) {
      logger.error('[reembolso] buscar pendentes failed', error);
      return [];
    }

    return (data || []).map(row => {
      const evento = Array.isArray(row.eventos_admin) ? row.eventos_admin[0] : row.eventos_admin;
      return {
        ...mapReembolsoFromDB(row),
        eventoNome: evento?.nome,
      };
    });
  } catch (err) {
    logger.error('[reembolso] buscar pendentes exception', err);
    return [];
  }
}
