import { create } from 'zustand';
import { Membro, FriendshipStatus } from '../types';
import { friendshipsService } from '../services/friendshipsService';
import { notificationsService } from '../features/admin/services/notificationsService';
import { notify } from '../services/notifyService';
import { supabase } from '../services/supabaseClient';
import { tsBR } from '../utils';
import { getCached, invalidateCache } from '../services/cache';
import { withCircuitBreaker } from '../services/circuitBreaker';
import { useAuthStore, GUEST_PLACEHOLDER } from './authStore';

interface SocialState {
  friendships: Record<string, FriendshipStatus>;
  mutualFriends: Membro[];

  // ações
  requestFriendship: (memberId: string) => void;
  cancelFriendshipRequest: (memberId: string) => void;
  handleAcceptFriend: (memberId: string) => void;
  handleDeclineFriend: (memberId: string) => void;
  removeFriend: (memberId: string) => void;

  // init
  init: (userId: string) => () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friendships: {},
  mutualFriends: [],

  requestFriendship: memberId => {
    const { currentAccount } = useAuthStore.getState();
    if (memberId === currentAccount.id) return; // Guard: nunca pedir amizade a si mesmo
    set(s => ({ friendships: { ...s.friendships, [memberId]: 'PENDING_SENT' } }));
    void friendshipsService.request(currentAccount.id, memberId);
    // Notifica o destinatário (3 canais: in-app + push + email)
    void notify({
      userId: memberId,
      titulo: 'Pedido de Amizade',
      mensagem: `${currentAccount.nome || 'Alguém'} quer ser seu amigo.`,
      tipo: 'FRIEND_REQUEST',
      link: currentAccount.id,
    });
  },

  cancelFriendshipRequest: memberId => {
    set(s => ({ friendships: { ...s.friendships, [memberId]: 'NONE' } }));
    const { currentAccount } = useAuthStore.getState();
    void friendshipsService.remove(currentAccount.id, memberId);
    void notificationsService.removeByLink(memberId).then(() => {
      useAuthStore.getState().setNotifications(notificationsService.getAll());
    });
  },

  handleAcceptFriend: memberId => {
    set(s => ({ friendships: { ...s.friendships, [memberId]: 'FRIENDS' } }));
    const { currentAccount } = useAuthStore.getState();
    void friendshipsService.accept(currentAccount.id, memberId);
    // Notifica quem enviou o pedido que foi aceito (3 canais)
    void notify({
      userId: memberId,
      titulo: 'Amizade Aceita',
      mensagem: `${currentAccount.nome || 'Alguém'} aceitou seu pedido de amizade.`,
      tipo: 'FRIEND_ACCEPTED',
      link: currentAccount.id,
    });
    // Remove a notificação de FRIEND_REQUEST do painel local
    void notificationsService.removeByLink(memberId).then(() => {
      useAuthStore.getState().setNotifications(notificationsService.getAll());
    });
  },

  handleDeclineFriend: memberId => {
    set(s => ({ friendships: { ...s.friendships, [memberId]: 'NONE' } }));
    const { currentAccount, unreadNotifications } = useAuthStore.getState();
    void friendshipsService.remove(currentAccount.id, memberId);
    useAuthStore.getState().setUnreadNotifications(Math.max(0, unreadNotifications - 1));
  },

  removeFriend: memberId => {
    set(s => ({ friendships: { ...s.friendships, [memberId]: 'NONE' } }));
    const { currentAccount } = useAuthStore.getState();
    void friendshipsService.remove(currentAccount.id, memberId);
  },

  init: userId => {
    if (!userId || userId === GUEST_PLACEHOLDER.id) {
      set({ friendships: {}, mutualFriends: [] });
      return () => {};
    }

    // Carrega friendships (com cache 60s + circuit breaker)
    const cacheKey = `friendships:${userId}`;
    void withCircuitBreaker(
      'supabase-friendships',
      () => getCached(cacheKey, () => friendshipsService.getAll(userId), 60_000),
      {} as Record<string, import('../types').FriendshipStatus>,
    ).then(f => set({ friendships: f }));

    // Realtime — invalida cache antes de refetch
    const unsubscribe = friendshipsService.subscribe(userId, () => {
      invalidateCache(cacheKey);
      void withCircuitBreaker(
        'supabase-friendships',
        () => getCached(cacheKey, () => friendshipsService.getAll(userId), 60_000),
        {} as Record<string, import('../types').FriendshipStatus>,
      ).then(f => {
        set({ friendships: f });
        // Recomputa mutualFriends
        loadMutualFriends(userId, f);
      });
    });

    // Carrega mutual friends inicialmente (com delay pra friendships carregarem)
    const timer = setTimeout(() => {
      const { friendships } = get();
      loadMutualFriends(userId, friendships);
    }, 1000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  },
}));

function loadMutualFriends(userId: string, friendships: Record<string, FriendshipStatus>) {
  const friendIds = Object.entries(friendships)
    .filter(([, status]) => status === 'FRIENDS')
    .map(([id]) => id);
  if (friendIds.length === 0) {
    useSocialStore.setState({ mutualFriends: [] });
    return;
  }
  void supabase
    .from('profiles')
    .select('id, nome, avatar_url, email, role, genero, cidade, estado, biografia, interesses')
    .in('id', friendIds)
    .limit(500)
    .then(({ data }) => {
      if (!data) return;
      useSocialStore.setState({
        mutualFriends: data.map(p => ({
          id: p.id,
          nome: p.nome ?? '',
          foto: p.avatar_url ?? '',
          email: p.email ?? '',
          role: (p.role ?? 'vanta_member') as Membro['role'],
          genero: (p.genero ?? 'MASCULINO') as Membro['genero'],
          cidade: p.cidade ?? '',
          estado: p.estado ?? '',
          biografia: p.biografia ?? '',
          interesses: p.interesses ?? [],
          selos: [],
        })) as Membro[],
      });
    });
}
