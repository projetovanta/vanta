/**
 * offlineEventService — camada offline unificada para operações do dia do evento.
 *
 * Tickets (QR), Lista (convidados), Caixa (venda na porta), Cortesias.
 * Online → Supabase direto + atualiza cache IndexedDB.
 * Offline → IndexedDB + fila de sync automática.
 */

import { eventosAdminService } from '../features/admin/services/eventosAdminService';
import type { TicketCaixa } from '../features/admin/services/eventosAdminService';
import {
  CachedTicket,
  CachedConvidado,
  CachedLoteVariacao,
  cacheTickets,
  getCachedTickets,
  markAsUsedLocally,
  cacheConvidados,
  getCachedConvidados,
  markConvidadoCheckedIn,
  cacheLotesVariacoes,
  getCachedLotesVariacoes,
  incrementVendidoLocal,
  addToSyncQueue,
  getSyncQueue,
  removeSyncItem,
  getSyncQueueCount,
} from './offlineDB';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toCachedTicket(t: TicketCaixa): CachedTicket {
  return {
    id: t.id,
    eventoId: t.eventoId,
    nomeTitular: t.nomeTitular ?? '',
    email: t.email,
    variacaoLabel: t.variacaoLabel ?? '',
    status: t.status as CachedTicket['status'],
    usadoEm: t.usadoEm,
  };
}

type CheckResult = { resultado: 'VALIDO' | 'JA_UTILIZADO' | 'INVALIDO'; nomeTitular?: string };

// ── Service ──────────────────────────────────────────────────────────────────

class OfflineEventService {
  // ═══════════════════════════════════════════════════════════════════════════
  // TICKETS (QR) — migrado de offlineCheckinService
  // ═══════════════════════════════════════════════════════════════════════════

  async loadTickets(eventoId: string): Promise<CachedTicket[]> {
    if (navigator.onLine) {
      try {
        const tickets = await eventosAdminService.getTicketsCaixaByEvento(eventoId);
        const cached = tickets.map(toCachedTicket);
        await cacheTickets(eventoId, cached);
        return cached;
      } catch {
        return getCachedTickets(eventoId);
      }
    }
    return getCachedTickets(eventoId);
  }

  async validateAndBurn(ticketId: string, eventoId: string): Promise<CheckResult> {
    if (navigator.onLine) {
      try {
        const { resultado } = await eventosAdminService.validarEQueimarIngresso(ticketId, eventoId);
        if (resultado === 'VALIDO') {
          await markAsUsedLocally(ticketId, eventoId);
        }
        const cached = await getCachedTickets(eventoId);
        const ticket = cached.find(t => t.id === ticketId);
        return {
          resultado: resultado as CheckResult['resultado'],
          nomeTitular: ticket?.nomeTitular || ticket?.email,
        };
      } catch {
        return this._validateTicketOffline(ticketId, eventoId);
      }
    }
    return this._validateTicketOffline(ticketId, eventoId);
  }

  private async _validateTicketOffline(ticketId: string, eventoId: string): Promise<CheckResult> {
    const cached = await getCachedTickets(eventoId);
    const ticket = cached.find(t => t.id === ticketId);
    if (!ticket) return { resultado: 'INVALIDO' };
    if (ticket.status === 'USADO')
      return { resultado: 'JA_UTILIZADO', nomeTitular: ticket.nomeTitular || ticket.email };
    if (ticket.status === 'CANCELADO') return { resultado: 'INVALIDO' };
    await markAsUsedLocally(ticketId, eventoId);
    // Log offline de queima para rastreabilidade
    void import('../features/admin/services/auditService')
      .then(({ auditService }) =>
        auditService.log(
          'portaria_offline',
          'TICKET_QUEIMADO_OFFLINE',
          'ticket',
          ticketId,
          { status: 'DISPONIVEL' },
          { status: 'USADO', eventoId },
        ),
      )
      .catch(() => {
        /* offline: log será gerado no sync */
      });
    return { resultado: 'VALIDO', nomeTitular: ticket.nomeTitular || ticket.email };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTA (convidados)
  // ═══════════════════════════════════════════════════════════════════════════

  async loadConvidados(eventoId: string): Promise<CachedConvidado[]> {
    if (navigator.onLine) {
      try {
        const { listasService } = await import('../features/admin/services/listasService');
        const listas = listasService.getListasByEvento(eventoId);
        const convidados: CachedConvidado[] = [];
        for (const lista of listas) {
          for (const c of lista.convidados) {
            const regra = lista.regras.find(r => r.id === c.regraId);
            convidados.push({
              id: c.id,
              listaId: lista.id,
              eventoId,
              regraId: c.regraId,
              nome: c.nome,
              telefone: c.telefone,
              checkedIn: c.checkedIn,
              checkedInEm: c.checkedInEm,
              checkedInPorNome: c.checkedInPorNome,
              regraLabel: regra?.label,
              regraCor: regra?.cor,
            });
          }
        }
        await cacheConvidados(eventoId, convidados);
        return convidados;
      } catch {
        return getCachedConvidados(eventoId);
      }
    }
    return getCachedConvidados(eventoId);
  }

  async checkInConvidado(
    listaId: string,
    convidadoId: string,
    eventoId: string,
    porteiroNome?: string,
  ): Promise<{
    ok: boolean;
    pendente?: boolean;
    bloqueado?: boolean;
    horaCorte?: string;
    valorAbobora?: number;
    convidadoId?: string;
    listaId?: string;
  }> {
    const logCheckin = (offline: boolean) =>
      void import('../features/admin/services/auditService')
        .then(({ auditService }) =>
          auditService.log(
            porteiroNome ?? 'portaria',
            offline ? 'CHECKIN_LISTA_OFFLINE' : 'CHECKIN_LISTA',
            'convidado',
            convidadoId,
            { checkedIn: false },
            { checkedIn: true, listaId, eventoId, porteiroNome },
          ),
        )
        .catch(() => {});

    const doCheckIn = async (offline: boolean) => {
      const { listasService } = await import('../features/admin/services/listasService');
      const result = await listasService.checkIn(listaId, convidadoId, porteiroNome);
      if (result.bloqueado) return { ok: false, bloqueado: true, horaCorte: result.horaCorte };
      if (result.pendente)
        return {
          ok: false,
          pendente: true,
          horaCorte: result.horaCorte,
          valorAbobora: result.valorAbobora,
          convidadoId,
          listaId,
        };
      if (result.ok) {
        await markConvidadoCheckedIn(convidadoId, eventoId, listaId, porteiroNome);
        logCheckin(offline);
      }
      return { ok: result.ok };
    };

    if (navigator.onLine) {
      try {
        return await doCheckIn(false);
      } catch {
        return await doCheckIn(true);
      }
    }
    return await doCheckIn(true);
  }

  async confirmarCheckInAbobora(
    listaId: string,
    convidadoId: string,
    eventoId: string,
    porteiroNome?: string,
  ): Promise<{ ok: boolean }> {
    const { listasService } = await import('../features/admin/services/listasService');
    const result = await listasService.confirmarCheckInAbobora(listaId, convidadoId, porteiroNome);
    if (result.ok) {
      await markConvidadoCheckedIn(convidadoId, eventoId, listaId, porteiroNome);
    }
    return { ok: result.ok };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CAIXA (venda na porta)
  // ═══════════════════════════════════════════════════════════════════════════

  async loadLotesVariacoes(eventoId: string): Promise<CachedLoteVariacao[]> {
    if (navigator.onLine) {
      try {
        const ev = eventosAdminService.getEvento(eventoId);
        if (!ev) return getCachedLotesVariacoes(eventoId);
        const cached: CachedLoteVariacao[] = [];
        for (const lote of ev.lotes) {
          if (!lote.ativo) continue;
          for (const v of lote.variacoes) {
            cached.push({
              id: v.id,
              eventoId,
              loteId: lote.id,
              loteNome: lote.nome,
              area: v.area,
              areaCustom: v.areaCustom,
              genero: v.genero,
              valor: v.valor,
              limite: v.limite,
              vendidosLocal: 0,
            });
          }
        }
        await cacheLotesVariacoes(eventoId, cached);
        return cached;
      } catch {
        return getCachedLotesVariacoes(eventoId);
      }
    }
    return getCachedLotesVariacoes(eventoId);
  }

  async registrarVendaOffline(
    eventoId: string,
    loteId: string,
    variacaoId: string,
    email: string,
    titular?: { nomeTitular: string; cpf: string },
  ): Promise<{ ok: boolean; ticketId?: string }> {
    if (navigator.onLine) {
      try {
        const ticketId = await eventosAdminService.registrarVendaEfetiva(
          eventoId,
          loteId,
          variacaoId,
          email,
          titular ? { ...titular, selfieBase64: undefined } : undefined,
        );
        if (ticketId) {
          await incrementVendidoLocal(variacaoId);
          return { ok: true, ticketId };
        }
        return { ok: false };
      } catch {
        return this._vendaOffline(eventoId, loteId, variacaoId, email, titular);
      }
    }
    return this._vendaOffline(eventoId, loteId, variacaoId, email, titular);
  }

  private async _vendaOffline(
    eventoId: string,
    loteId: string,
    variacaoId: string,
    email: string,
    titular?: { nomeTitular: string; cpf: string },
  ): Promise<{ ok: boolean }> {
    await incrementVendidoLocal(variacaoId);
    await addToSyncQueue({
      type: 'VENDA_CAIXA',
      eventoId,
      payload: { loteId, variacaoId, email, nomeTitular: titular?.nomeTitular ?? '', cpf: titular?.cpf ?? '' },
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00'),
      retries: 0,
    });
    return { ok: true };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORTESIAS
  // ═══════════════════════════════════════════════════════════════════════════

  async enviarCortesiaOffline(params: {
    eventoAdminId: string;
    eventoNome: string;
    eventoData: string;
    remetenteNome: string;
    destinatarioId: string;
    destinatarioNome: string;
    variacaoLabel: string;
    quantidade: number;
  }): Promise<{ ok: boolean }> {
    if (navigator.onLine) {
      try {
        const { cortesiasService } = await import('../features/admin/services/cortesiasService');
        const ok = await cortesiasService.enviarParaDestinatario(params);
        return { ok };
      } catch {
        return this._cortesiaOffline(params);
      }
    }
    return this._cortesiaOffline(params);
  }

  private async _cortesiaOffline(params: Record<string, unknown>): Promise<{ ok: boolean }> {
    await addToSyncQueue({
      type: 'CORTESIA',
      eventoId: (params.eventoAdminId as string) ?? '',
      payload: params,
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString().replace('Z', '-03:00'),
      retries: 0,
    });
    return { ok: true };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC UNIFICADO
  // ═══════════════════════════════════════════════════════════════════════════

  async syncAll(): Promise<{ synced: number; failed: number }> {
    const queue = await getSyncQueue();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'CHECKIN_TICKET': {
            const { resultado } = await eventosAdminService.validarEQueimarIngresso(
              item.payload.ticketId as string,
              item.eventoId,
            );
            // Duplicata detectada: ingresso já foi queimado por outro operador
            if (resultado === 'JA_UTILIZADO') {
              void import('../features/admin/services/auditService')
                .then(({ auditService }) =>
                  auditService.log(
                    'sync_offline',
                    'TICKET_DUPLICATA_DETECTADA',
                    'ticket',
                    item.payload.ticketId as string,
                    { syncTimestamp: item.timestamp },
                    { eventoId: item.eventoId, resultado },
                  ),
                )
                .catch(() => {});
            }
            break;
          }
          case 'CHECKIN_LISTA': {
            const { listasService } = await import('../features/admin/services/listasService');
            await listasService.checkIn(
              item.payload.listaId as string,
              item.payload.convidadoId as string,
              (item.payload.porteiroNome as string) || undefined,
            );
            break;
          }
          case 'VENDA_CAIXA': {
            await eventosAdminService.registrarVendaEfetiva(
              item.eventoId,
              item.payload.loteId as string,
              item.payload.variacaoId as string,
              item.payload.email as string,
              (item.payload.nomeTitular as string)
                ? { nomeTitular: item.payload.nomeTitular as string, cpf: item.payload.cpf as string }
                : undefined,
            );
            break;
          }
          case 'CORTESIA': {
            const { cortesiasService } = await import('../features/admin/services/cortesiasService');
            await cortesiasService.enviarParaDestinatario(
              item.payload as Parameters<typeof cortesiasService.enviarParaDestinatario>[0],
            );
            break;
          }
        }
        if (item.id != null) await removeSyncItem(item.id);
        synced++;
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  }

  async getPendingCount(): Promise<number> {
    return getSyncQueueCount();
  }
}

export const offlineEventService = new OfflineEventService();
