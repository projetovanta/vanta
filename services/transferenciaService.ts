import { supabase } from './supabaseClient';
import type { Ingresso, TransferenciaPendente } from '../types';
import { logger } from './logger';
import { tsBR } from '../utils';
const mkQR = () => `VNT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const rowToTransferencia = (r: Record<string, unknown>): TransferenciaPendente => ({
  id: r.id as string,
  ticketId: r.ticket_id as string,
  eventoId: r.evento_id as string,
  remetenteId: r.remetente_id as string,
  remetenteNome: (r.remetente_nome as string) ?? '',
  destinatarioId: r.destinatario_id as string,
  destinatarioNome: (r.destinatario_nome as string) ?? '',
  variacaoLabel: (r.variacao_label as string) ?? undefined,
  tituloEvento: (r.titulo_evento as string) ?? undefined,
  dataEvento: (r.data_evento as string) ?? undefined,
  eventoLocal: (r.evento_local as string) ?? undefined,
  eventoImagem: (r.evento_imagem as string) ?? undefined,
  status: (r.status as TransferenciaPendente['status']) ?? 'PENDENTE',
  criadoEm: (r.criado_em as string) ?? '',
});

export const transferenciaService = {
  /** Envia ingresso para outro membro. Cria pendente + marca original como TRANSFERIDO. */
  async transferir(params: {
    ticket: Ingresso;
    remetenteId: string;
    remetenteNome: string;
    destinatarioId: string;
    destinatarioNome: string;
  }): Promise<boolean> {
    const { ticket, remetenteId, remetenteNome, destinatarioId, destinatarioNome } = params;

    // Inserir transferência pendente
    const { error } = await supabase.from('transferencias_ingresso').insert({
      ticket_id: ticket.id,
      evento_id: ticket.eventoId,
      remetente_id: remetenteId,
      remetente_nome: remetenteNome,
      destinatario_id: destinatarioId,
      destinatario_nome: destinatarioNome,
      variacao_label: ticket.variacaoLabel ?? null,
      titulo_evento: ticket.tituloEvento,
      data_evento: ticket.dataEvento,
      evento_local: ticket.eventoLocal ?? null,
      evento_imagem: ticket.eventoImagem ?? null,
    });

    if (error) {
      logger.error('[transferenciaService] transferir:', error);
      return false;
    }

    // Marcar ingresso original como TRANSFERIDO no Supabase
    const { error: errUpdate } = await supabase
      .from('tickets_caixa')
      .update({ status: 'TRANSFERIDO' })
      .eq('id', ticket.id);
    if (errUpdate) {
      logger.error('[transferenciaService] marcar TRANSFERIDO:', errUpdate);
      // Rollback: remover transferência criada
      const { error: errRb } = await supabase
        .from('transferencias_ingresso')
        .delete()
        .eq('ticket_id', ticket.id)
        .eq('status', 'PENDENTE');
      if (errRb) logger.error('[transferenciaService] rollback delete:', errRb);
      return false;
    }

    // Notificação in-app para destinatário
    try {
      const { notificationsService } = await import('../features/admin/services/notificationsService');
      void notificationsService.add(
        {
          titulo: 'Ingresso recebido!',
          mensagem: `${remetenteNome} te enviou um ingresso para ${ticket.tituloEvento}. Aceite na sua carteira!`,
          tipo: 'TRANSFERENCIA_PENDENTE',
          lida: false,
          link: ticket.eventoId,
          timestamp: tsBR(),
        },
        destinatarioId,
      );
    } catch {
      /* silencioso */
    }

    return true;
  },

  /** Lista transferências pendentes recebidas pelo usuário */
  async getPendentes(userId: string): Promise<TransferenciaPendente[]> {
    const { data } = await supabase
      .from('transferencias_ingresso')
      .select('*')
      .eq('destinatario_id', userId)
      .eq('status', 'PENDENTE')
      .order('criado_em', { ascending: false })
      .limit(500);
    return (data ?? []).map(rowToTransferencia);
  },

  /** Aceitar transferência → cria ingresso na wallet do destinatário */
  async aceitar(transferenciaId: string, userId: string): Promise<Ingresso | null> {
    const { data: row } = await supabase
      .from('transferencias_ingresso')
      .select('*')
      .eq('id', transferenciaId)
      .eq('destinatario_id', userId)
      .eq('status', 'PENDENTE')
      .maybeSingle();

    if (!row) return null;

    // 1. Marcar transferência como ACEITO
    const { error: errAceitar } = await supabase
      .from('transferencias_ingresso')
      .update({ status: 'ACEITO' })
      .eq('id', transferenciaId);
    if (errAceitar) {
      logger.error('[transferenciaService] aceitar status:', errAceitar);
      return null;
    }

    const t = rowToTransferencia(row);

    // 2. Buscar dados do ticket original para copiar lote_id e variacao_id
    const { data: ticketOriginal } = await supabase
      .from('tickets_caixa')
      .select('lote_id, variacao_id')
      .eq('id', t.ticketId)
      .maybeSingle();

    // 3. Criar novo ingresso para o destinatário (colunas alinhadas com schema)
    const { data: novoTicket, error: errInsert } = await supabase
      .from('tickets_caixa')
      .insert({
        evento_id: t.eventoId,
        lote_id: ticketOriginal?.lote_id ?? null,
        variacao_id: ticketOriginal?.variacao_id ?? null,
        email: '',
        owner_id: userId,
        valor: 0,
        status: 'DISPONIVEL',
      })
      .select('id')
      .single();

    if (errInsert || !novoTicket) {
      logger.error('[transferenciaService] criar ticket:', errInsert);
      // Rollback: reverter transferência para PENDENTE
      const { error: errRb2 } = await supabase
        .from('transferencias_ingresso')
        .update({ status: 'PENDENTE' })
        .eq('id', transferenciaId);
      if (errRb2) logger.error('[transferenciaService] rollback aceitar:', errRb2);
      return null;
    }

    const newQR = mkQR();

    const ticket: Ingresso = {
      id: novoTicket.id as string,
      eventoId: t.eventoId,
      tituloEvento: t.tituloEvento ?? '',
      dataEvento: t.dataEvento ?? '',
      status: 'DISPONIVEL',
      codigoQR: newQR,
      variacaoLabel: t.variacaoLabel,
      nomeTitular: '',
      cpf: '',
      eventoLocal: t.eventoLocal,
      eventoImagem: t.eventoImagem,
    };

    return ticket;
  },

  /** Recusar transferência → restaura status do ingresso original */
  async recusar(transferenciaId: string, userId: string): Promise<boolean> {
    const { data: row } = await supabase
      .from('transferencias_ingresso')
      .select('*')
      .eq('id', transferenciaId)
      .eq('destinatario_id', userId)
      .eq('status', 'PENDENTE')
      .maybeSingle();

    if (!row) return false;

    const { error: errRecusar } = await supabase
      .from('transferencias_ingresso')
      .update({ status: 'RECUSADO' })
      .eq('id', transferenciaId);
    if (errRecusar) {
      logger.error('[transferenciaService] recusar:', errRecusar);
      return false;
    }

    // Restaurar ingresso original para DISPONIVEL
    const { error: errRestore } = await supabase
      .from('tickets_caixa')
      .update({ status: 'DISPONIVEL' })
      .eq('id', row.ticket_id as string);
    if (errRestore) {
      logger.error('[transferenciaService] restaurar ticket:', errRestore);
      // Transferência já foi recusada mas ticket não voltou — log para investigar
    }

    return true;
  },
};
