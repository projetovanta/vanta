import { create } from 'zustand';
import { Ingresso, Notificacao } from '../types';
import { vantaService } from '../services/vantaService';
import { cortesiasService, CortesiaPendente } from '../features/admin/services/cortesiasService';
import { transferenciaService } from '../services/transferenciaService';
import { reminderService } from '../services/reminderService';
import type { TransferenciaPendente } from '../types';
import { getCached } from '../services/cache';
import { withCircuitBreaker } from '../services/circuitBreaker';
import { useAuthStore, GUEST_PLACEHOLDER } from './authStore';

interface TicketsState {
  myTickets: Ingresso[];
  myPresencas: string[];
  cortesiasPendentes: CortesiaPendente[];
  transferenciasPendentes: TransferenciaPendente[];

  // setters (para uso externo em composições)
  setMyTickets: (fn: (prev: Ingresso[]) => Ingresso[]) => void;
  setMyPresencas: (fn: (prev: string[]) => string[]) => void;

  // ações puras
  devolverCortesia: (ticket: Ingresso) => void;
  transferirIngresso: (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => Promise<boolean>;
  updateTicketTitular: (ticketId: string, nomeTitular: string, cpf: string) => Promise<boolean>;
  aceitarCortesiaPendente: (cortesiaId: string) => Promise<void>;
  recusarCortesiaPendente: (cortesiaId: string) => Promise<void>;
  aceitarTransferencia: (transferenciaId: string) => Promise<void>;
  recusarTransferencia: (transferenciaId: string) => Promise<void>;
  registerCortesiaCallbacks: (onAddNotification: (notif: Notificacao) => void) => void;

  // init
  init: (userId: string) => () => void;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  myTickets: [],
  myPresencas: [],
  cortesiasPendentes: [],
  transferenciasPendentes: [],

  setMyTickets: fn => set(s => ({ myTickets: fn(s.myTickets) })),
  setMyPresencas: fn => set(s => ({ myPresencas: fn(s.myPresencas) })),

  devolverCortesia: ticket => {
    const { profile } = useAuthStore.getState();
    void cortesiasService.devolverCortesia(ticket.eventoId, ticket.id, ticket.tituloEvento, profile.nome);
  },

  transferirIngresso: async (ticket, destinatarioId, destinatarioNome) => {
    const { currentAccount, profile } = useAuthStore.getState();
    const ok = await transferenciaService.transferir({
      ticket,
      remetenteId: currentAccount.id,
      remetenteNome: profile.nome,
      destinatarioId,
      destinatarioNome,
    });
    if (ok) {
      set(s => ({
        myTickets: s.myTickets.map(t => (t.id === ticket.id ? { ...t, status: 'TRANSFERIDO' as const } : t)),
      }));
    }
    return ok;
  },

  updateTicketTitular: async (ticketId, nomeTitular, cpf) => {
    const res = await vantaService.updateTicketTitular(ticketId, nomeTitular, cpf);
    if (res.ok) {
      set(s => ({
        myTickets: s.myTickets.map(t => (t.id === ticketId ? { ...t, nomeTitular, cpf } : t)),
      }));
    }
    return res.ok;
  },

  aceitarCortesiaPendente: async cortesiaId => {
    const { currentAccount } = useAuthStore.getState();
    const ticket = await cortesiasService.aceitarCortesia(cortesiaId, currentAccount.id);
    if (ticket) {
      set(s => ({
        myTickets: [...s.myTickets, ticket],
        cortesiasPendentes: s.cortesiasPendentes.filter(c => c.id !== cortesiaId),
      }));
    }
  },

  recusarCortesiaPendente: async cortesiaId => {
    const { currentAccount } = useAuthStore.getState();
    await cortesiasService.recusarCortesia(cortesiaId, currentAccount.id);
    set(s => ({ cortesiasPendentes: s.cortesiasPendentes.filter(c => c.id !== cortesiaId) }));
  },

  aceitarTransferencia: async transferenciaId => {
    const { currentAccount } = useAuthStore.getState();
    const ticket = await transferenciaService.aceitar(transferenciaId, currentAccount.id);
    if (ticket) {
      set(s => ({
        myTickets: [...s.myTickets, ticket],
        transferenciasPendentes: s.transferenciasPendentes.filter(t => t.id !== transferenciaId),
      }));
    }
  },

  recusarTransferencia: async transferenciaId => {
    const { currentAccount } = useAuthStore.getState();
    await transferenciaService.recusar(transferenciaId, currentAccount.id);
    set(s => ({ transferenciasPendentes: s.transferenciasPendentes.filter(t => t.id !== transferenciaId) }));
  },

  registerCortesiaCallbacks: onAddNotification => {
    cortesiasService.registerCallbacks(
      (ticket: Ingresso) => set(s => ({ myTickets: [...s.myTickets, ticket] })),
      (ticketId: string) => set(s => ({ myTickets: s.myTickets.filter(t => t.id !== ticketId) })),
      onAddNotification,
    );
  },

  init: userId => {
    if (!userId || userId === GUEST_PLACEHOLDER.id) {
      set({ myTickets: [], myPresencas: [], cortesiasPendentes: [], transferenciasPendentes: [] });
      return () => {};
    }

    // Carrega tickets
    void withCircuitBreaker(
      'supabase-tickets',
      () => getCached(`tickets:${userId}`, () => vantaService.getMyTickets(userId), 30_000),
      [] as Awaited<ReturnType<typeof vantaService.getMyTickets>>,
    ).then(tickets => {
      if (tickets.length === 0) return;
      const mapped: Ingresso[] = tickets.map(t => {
        const dataInicio = new Date(t.eventoDataInicio);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const eventDay = new Date(dataInicio);
        eventDay.setHours(0, 0, 0, 0);
        let dataLabel: string;
        if (eventDay.getTime() === today.getTime()) dataLabel = 'Hoje';
        else if (eventDay.getTime() === tomorrow.getTime()) dataLabel = 'Amanhã';
        else dataLabel = eventDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
        const now = new Date();
        let finalStatus = t.status as Ingresso['status'];
        if (t.eventoDataFim && t.status === 'DISPONIVEL') {
          if (new Date(t.eventoDataFim) < now) finalStatus = 'EXPIRADO';
        }
        return {
          id: t.id,
          eventoId: t.eventoId,
          tituloEvento: t.eventoNome,
          dataEvento: dataLabel,
          status: finalStatus,
          codigoQR: `VNT-${t.id.slice(0, 8).toUpperCase()}`,
          variacaoLabel: t.variacaoLabel,
          nomeTitular: t.nomeTitular,
          cpf: t.cpf,
          eventoLocal: t.eventoLocal,
          eventoImagem: t.eventoImagem,
          eventoDataInicioISO: t.eventoDataInicio,
          eventoDataFimISO: t.eventoDataFim,
        };
      });
      set(s => {
        const existingIds = new Set(s.myTickets.map(t => t.id));
        const newTickets = mapped.filter(t => !existingIds.has(t.id));
        return newTickets.length > 0 ? { myTickets: [...s.myTickets, ...newTickets] } : {};
      });
    });

    // Cortesias + transferências
    void cortesiasService.getCortesiasPendentes(userId).then(c => set({ cortesiasPendentes: c }));
    void transferenciaService.getPendentes(userId).then(t => set({ transferenciasPendentes: t }));

    // Lembretes
    const reminderTimer = setTimeout(() => {
      const { myTickets } = get();
      const active = myTickets.filter(t => t.status === 'DISPONIVEL' && t.eventoDataInicioISO);
      reminderService.scheduleReminders(active);
    }, 3000);

    return () => {
      clearTimeout(reminderTimer);
      reminderService.cancelAll();
    };
  },
}));
