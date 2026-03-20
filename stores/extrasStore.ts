import { create } from 'zustand';
import { Evento, Ingresso } from '../types';
import { vantaService } from '../services/vantaService';
import { favoritosService } from '../services/favoritosService';
import { behaviorService } from '../services/behaviorService';
import { clubeService } from '../features/admin/services/clubeService';
import { assinaturaService } from '../features/admin/services/assinaturaService';
import { maisVantaConfigService } from '../features/admin/services/maisVantaConfigService';
import { getCached, invalidateCache } from '../services/cache';
import { withCircuitBreaker } from '../services/circuitBreaker';
import { rateLimiter } from '../services/rateLimiter';
import { useAuthStore, GUEST_PLACEHOLDER } from './authStore';
import { useTicketsStore } from './ticketsStore';

const EVENTS_PAGE_SIZE = 20;

interface ExtrasState {
  allEvents: Evento[];
  savedEvents: string[];
  hasMoreEvents: boolean;
  eventsLoading: boolean;

  // ações
  refreshEvents: () => void;
  loadMoreEvents: () => void;
  searchEventsServerSide: (query: string) => Promise<Evento[]>;
  toggleFavorito: (eventoId: string) => void;
  confirmarPresenca: (evento: Evento) => boolean;
  addExternalTicket: (ticket: Ingresso) => void;

  // init
  initEvents: () => void;
  initClubeData: () => void;
  initFavoritos: (userId: string) => void;
}

export const useExtrasStore = create<ExtrasState>((set, get) => ({
  allEvents: [],
  savedEvents: [],
  hasMoreEvents: true,
  eventsLoading: false,

  refreshEvents: () => {
    if (!rateLimiter.allow('eventos-fetch')) return;
    invalidateCache('eventos');
    set({ hasMoreEvents: true });
    void withCircuitBreaker(
      'supabase-eventos',
      () => getCached('eventos:p0', () => vantaService.getEventosPaginated(0, EVENTS_PAGE_SIZE - 1), 60_000),
      [] as Evento[],
    ).then(eventos => set({ allEvents: eventos, hasMoreEvents: eventos.length >= EVENTS_PAGE_SIZE }));
  },

  loadMoreEvents: () => {
    const { allEvents, hasMoreEvents, eventsLoading } = get();
    if (!hasMoreEvents || eventsLoading) return;
    if (!rateLimiter.allow('eventos-fetch')) return;
    set({ eventsLoading: true });
    const from = allEvents.length;
    const to = from + EVENTS_PAGE_SIZE - 1;
    const page = Math.floor(from / EVENTS_PAGE_SIZE);
    void withCircuitBreaker(
      'supabase-eventos',
      () => getCached(`eventos:p${page}`, () => vantaService.getEventosPaginated(from, to), 60_000),
      [] as Evento[],
    )
      .then(newEvents => {
        set(s => ({
          allEvents: [...s.allEvents, ...newEvents],
          hasMoreEvents: newEvents.length >= EVENTS_PAGE_SIZE,
          eventsLoading: false,
        }));
      })
      .catch(() => set({ eventsLoading: false }));
  },

  searchEventsServerSide: (query: string) => {
    return vantaService.searchEventos(query, 30);
  },

  toggleFavorito: eventoId => {
    const { currentAccount } = useAuthStore.getState();
    const userId = currentAccount.id;
    if (!userId || userId === GUEST_PLACEHOLDER.id) return;
    const isFavoriting = !get().savedEvents.includes(eventoId);
    set(s => ({
      savedEvents: s.savedEvents.includes(eventoId)
        ? s.savedEvents.filter(id => id !== eventoId)
        : [...s.savedEvents, eventoId],
    }));
    void favoritosService.toggle(userId, eventoId);
    if (isFavoriting) {
      void behaviorService.trackFavorite(userId, eventoId);
    }
  },

  confirmarPresenca: evento => {
    const { myPresencas, setMyPresencas } = useTicketsStore.getState();
    if (!myPresencas.includes(evento.id)) {
      setMyPresencas(prev => [...prev, evento.id]);
      set(s => ({
        allEvents: s.allEvents.map(e =>
          e.id === evento.id ? { ...e, membrosConfirmados: e.membrosConfirmados + 1 } : e,
        ),
      }));
      return true;
    }
    return false;
  },

  addExternalTicket: ticket => {
    const { setMyTickets } = useTicketsStore.getState();
    setMyTickets(prev => [...prev, ticket]);
    set(s => ({
      allEvents: s.allEvents.map(e =>
        e.id === ticket.eventoId ? { ...e, membrosConfirmados: e.membrosConfirmados + 1 } : e,
      ),
    }));
  },

  initEvents: () => {
    void getCached('eventos:p0', () => vantaService.getEventosPaginated(0, EVENTS_PAGE_SIZE - 1), 60_000).then(
      eventos => set({ allEvents: eventos, hasMoreEvents: eventos.length >= EVENTS_PAGE_SIZE }),
    );
  },

  initClubeData: () => {
    void Promise.all([clubeService.refresh(), assinaturaService.refresh(), maisVantaConfigService.refresh()]);
  },

  initFavoritos: userId => {
    if (!userId || userId === GUEST_PLACEHOLDER.id) {
      set({ savedEvents: [] });
      return;
    }
    void favoritosService.getMyFavoritos(userId).then(f => set({ savedEvents: f }));
  },
}));
