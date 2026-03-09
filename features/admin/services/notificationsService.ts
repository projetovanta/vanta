/**
 * notificationsService — persistência de notificações via Supabase.
 * Cache local + refresh async (mesmo padrão dos demais services).
 */
import { Notificacao } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';

type NotifRow = Database['public']['Tables']['notifications']['Row'];

let _notifs: Notificacao[] = [];
let _userId: string | null = null;

const rowToNotif = (row: NotifRow): Notificacao => ({
  id: row.id,
  titulo: row.titulo ?? '',
  mensagem: row.mensagem ?? '',
  tipo: (row.tipo as Notificacao['tipo']) ?? 'SISTEMA',
  lida: row.lida ?? false,
  link: row.link ?? '',
  timestamp: row.created_at ?? '',
});

export const notificationsService = {
  /** Define o userId do usuário logado (chamado no login) */
  setUserId(userId: string | null): void {
    _userId = userId;
  },

  /** Carrega notificações do Supabase para cache local */
  async refresh(): Promise<void> {
    if (!_userId) {
      _notifs = [];
      return;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', _userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[notificationsService] refresh:', error);
      return;
    }
    _notifs = (data ?? []).map(r => rowToNotif(r));
  },

  /** Retorna cópia do array de notificações atual */
  getAll: (): Notificacao[] => [..._notifs],

  /** Quantidade de notificações não lidas */
  getUnreadCount: (): number => _notifs.filter(n => !n.lida).length,

  /**
   * Adiciona nova notificação. Grava no Supabase + atualiza cache.
   * userId opcional — se omitido, usa o userId logado.
   */
  add: async (notif: Omit<Notificacao, 'id'>, targetUserId?: string): Promise<Notificacao> => {
    const uid = targetUserId ?? _userId;
    const isOwnUser = !targetUserId || targetUserId === _userId;
    const row = {
      user_id: uid,
      titulo: notif.titulo,
      mensagem: notif.mensagem,
      tipo: notif.tipo,
      lida: notif.lida ?? false,
      link: notif.link ?? '',
    };

    // Se inserindo para outro user, NÃO usar .select() (RLS SELECT bloqueia)
    if (isOwnUser) {
      const { data, error } = await supabase.from('notifications').insert(row).select('*').single();

      if (error || !data) {
        console.error('[notificationsService] add:', error);
        const local: Notificacao = { ...notif, id: `notif-${Date.now()}` };
        _notifs = [local, ..._notifs];
        return local;
      }

      const full = rowToNotif(data);
      _notifs = [full, ..._notifs];
      return full;
    } else {
      // Cross-user: usar RPC SECURITY DEFINER para bypass RLS
      const { data: rpcId, error } = await supabase.rpc('inserir_notificacao', {
        p_user_id: uid,
        p_tipo: row.tipo,
        p_titulo: row.titulo,
        p_mensagem: row.mensagem,
        p_link: row.link,
      });

      if (error) {
        console.error('[notificationsService] add (cross-user):', error);
        throw error;
      }

      return { ...notif, id: (rpcId as string) ?? `notif-${Date.now()}` };
    }
  },

  /** Marca uma notificação como lida */
  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase.from('notifications').update({ lida: true }).eq('id', id);
    if (error) {
      console.error('[notificationsService] markAsRead:', error);
      return;
    }
    _notifs = _notifs.map(n => (n.id === id ? { ...n, lida: true } : n));
  },

  /** Marca todas como lidas */
  markAllAsRead: async (): Promise<void> => {
    if (!_userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', _userId)
      .eq('lida', false);
    if (error) {
      console.error('[notificationsService] markAllAsRead:', error);
      return;
    }
    _notifs = _notifs.map(n => ({ ...n, lida: true }));
  },

  /** Remove uma notificação por ID */
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) {
      console.error('[notificationsService] remove:', error);
      return;
    }
    _notifs = _notifs.filter(n => n.id !== id);
  },

  /** Remove todas as notificações de um determinado link */
  removeByLink: async (link: string): Promise<void> => {
    if (!_userId) return;
    const { error } = await supabase.from('notifications').delete().eq('user_id', _userId).eq('link', link);
    if (error) {
      console.error('[notificationsService] removeByLink:', error);
      return;
    }
    _notifs = _notifs.filter(n => n.link !== link);
  },

  /** Compatibilidade — no-op (não usa mais localStorage) */
  rehydrate: (): void => {},
};
