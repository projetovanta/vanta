import { create } from 'zustand';
import { Membro, Notificacao } from '../types';
import { DEFAULT_AVATARS } from '../data/avatars';
import { authService, enrichInstagramFollowers } from '../services/authService';
import { notificationsService } from '../features/admin/services/notificationsService';
import { clearAllCache } from '../services/cache';
import { realtimeManager } from '../services/realtimeManager';
import { comprovanteService } from '../features/admin/services/comprovanteService';
import { getAccessNodes } from '../features/admin/permissoes';
import { rbacService } from '../features/admin/services/rbacService';
import { logger } from '../services/logger';
import { useExtrasStore } from './extrasStore';

const GUEST_PLACEHOLDER: Membro = {
  id: '',
  nome: 'Visitante',
  email: '',
  biografia: '',
  foto: DEFAULT_AVATARS.FEMININO,
  genero: 'FEMININO',
  interesses: [],
  role: 'vanta_guest',
};

export { GUEST_PLACEHOLDER };

interface AuthState {
  // estado
  currentAccount: Membro;
  profile: Membro;
  authLoading: boolean;
  selectedCity: string;
  notifications: Notificacao[];
  unreadNotifications: number;

  // ações
  loginWithMembro: (m: Membro) => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Membro>) => boolean;
  registerUser: (m: Membro) => void;
  setSelectedCity: (city: string) => void;
  setNotifications: (n: Notificacao[]) => void;
  setUnreadNotifications: (n: number) => void;
  addNotification: (notif: Omit<Notificacao, 'id'>) => void;
  markAllNotificationsAsRead: () => void;
  handleNotificationAction: (n: Notificacao) => void;

  // computado
  accessNodes: ReturnType<typeof getAccessNodes>;

  // init (chamado 1x)
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentAccount: GUEST_PLACEHOLDER,
  profile: GUEST_PLACEHOLDER,
  authLoading: true,
  selectedCity: localStorage.getItem('vanta_selected_city') || '',
  notifications: [],
  unreadNotifications: 0,
  accessNodes: [],

  loginWithMembro: m => {
    set({ currentAccount: m, profile: m, authLoading: false });
    // Disparar inicializações imediatamente (sem esperar onAuthStateChange)
    enrichInstagramFollowers(m.id, m.instagram);
    notificationsService.setUserId(m.id);
    void notificationsService.refresh().then(() => {
      set({
        notifications: notificationsService.getAll(),
        unreadNotifications: notificationsService.getUnreadCount(),
      });
    });
    realtimeManager.unsubscribe(`notif:${m.id}`);
    realtimeManager.subscribe(`notif:${m.id}`, channel => {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${m.id}` },
        () => {
          void notificationsService.refresh().then(() => {
            set({
              notifications: notificationsService.getAll(),
              unreadNotifications: notificationsService.getUnreadCount(),
            });
          });
        },
      );
    });
    // Defer: comprovante e clube não são necessários no primeiro render
    setTimeout(() => {
      void comprovanteService.refresh(m.id);
      useExtrasStore.getState().initClubeData();
    }, 3000);
    if (m.role === 'vanta_member') {
      void rbacService.refresh().then(() => {
        const nodes = getAccessNodes(m.id);
        set({ accessNodes: nodes });
      });
    } else {
      set({ accessNodes: [] });
    }
  },

  logout: async () => {
    await authService.signOut();
    clearAllCache();
    realtimeManager.unsubscribeAll();
    sessionStorage.removeItem('vanta_admin_destino');
    sessionStorage.removeItem('vanta_admin_subview');
    set({ currentAccount: GUEST_PLACEHOLDER, profile: GUEST_PLACEHOLDER });
  },

  updateProfile: data => {
    set(s => ({ profile: { ...s.profile, ...data } }));
    return true;
  },

  registerUser: m => {
    set({ currentAccount: { ...m, role: 'vanta_member' }, profile: m });
  },

  setSelectedCity: city => {
    localStorage.setItem('vanta_selected_city', city);
    set({ selectedCity: city });
  },

  setNotifications: n => set({ notifications: n }),
  setUnreadNotifications: n => set({ unreadNotifications: n }),

  addNotification: notif => {
    void notificationsService.add(notif).then(() => {
      set({
        notifications: notificationsService.getAll(),
        unreadNotifications: notificationsService.getUnreadCount(),
      });
    });
  },

  markAllNotificationsAsRead: () => {
    void notificationsService.markAllAsRead().then(() => {
      set({ notifications: notificationsService.getAll(), unreadNotifications: 0 });
    });
  },

  handleNotificationAction: (n: Notificacao) => {
    if (n.id && !n.lida) {
      void notificationsService.markAsRead(n.id);
    }
    set(s => ({
      notifications: s.notifications.map(notif => (notif.id === n.id ? { ...notif, lida: true } : notif)),
      unreadNotifications: Math.max(0, s.unreadNotifications - 1),
    }));
  },

  init: () => {
    // Singleton: se já inicializou, retorna cleanup noop (evita double-init do StrictMode)
    if (_initUnsub) {
      return () => {};
    }

    let resolved = false;

    const applySession = (membro: Membro | null) => {
      if (membro) {
        set({ currentAccount: membro, profile: membro, authLoading: false });
        enrichInstagramFollowers(membro.id, membro.instagram);
        notificationsService.setUserId(membro.id);
        void notificationsService.refresh().then(() => {
          set({
            notifications: notificationsService.getAll(),
            unreadNotifications: notificationsService.getUnreadCount(),
          });
        });

        // Realtime: escuta novas notificações (via RealtimeManager)
        realtimeManager.unsubscribe(`notif:${membro.id}`);
        realtimeManager.subscribe(`notif:${membro.id}`, channel => {
          channel.on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${membro.id}` },
            () => {
              void notificationsService.refresh().then(() => {
                set({
                  notifications: notificationsService.getAll(),
                  unreadNotifications: notificationsService.getUnreadCount(),
                });
              });
            },
          );
        });

        // Defer: comprovante e clube não são necessários no primeiro render
        setTimeout(() => {
          void comprovanteService.refresh(membro.id);
          useExtrasStore.getState().initClubeData();
        }, 3000);

        // compute accessNodes via RBAC (member precisa; master também para permissões plataforma)
        const role = membro.role;
        if (role !== 'vanta_guest') {
          void rbacService.refresh().then(() => {
            const nodes = getAccessNodes(membro.id);
            set({ accessNodes: nodes });
          });
        } else {
          set({ accessNodes: [] });
        }
      } else {
        set({
          currentAccount: GUEST_PLACEHOLDER,
          profile: GUEST_PLACEHOLDER,
          authLoading: false,
          accessNodes: [],
        });
        notificationsService.setUserId(null);
        realtimeManager.unsubscribeAll();
        set({ notifications: [], unreadNotifications: 0 });
      }
    };

    const unsubscribe = authService.onAuthStateChange(membro => {
      resolved = true;
      applySession(membro);
    });

    // Fallback 1: tenta getSession após 2s se onAuthStateChange não disparou
    const fallbackTimer = setTimeout(async () => {
      if (!resolved) {
        try {
          const session = await authService.getSession();
          resolved = true;
          applySession(session);
        } catch (err) {
          logger.warn('[authStore] getSession fallback failed', err);
          if (!resolved) {
            resolved = true;
            applySession(null);
          }
        }
      }
    }, 2000);

    // Fallback 2: timeout absoluto — se NADA resolveu em 6s, libera como guest
    const absoluteTimer = setTimeout(() => {
      if (!resolved) {
        logger.error('[authStore] absolute timeout 6s — forced guest');
        resolved = true;
        applySession(null);
      }
    }, 6000);

    _initUnsub = () => {
      clearTimeout(fallbackTimer);
      clearTimeout(absoluteTimer);
      unsubscribe();
      _initUnsub = null;
    };

    return _initUnsub;
  },
}));

// Singleton guard — evita double-init do StrictMode
let _initUnsub: (() => void) | null = null;
