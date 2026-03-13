/**
 * notifyService — Ponto único para notificações em 3 canais:
 *   1. In-app (tabela notifications via notificationsService)
 *   2. Push FCM (Edge Function send-push)
 *   3. Email (Edge Function send-notification-email via Resend)
 *
 * Toda notificação do sistema DEVE passar por aqui.
 * Fire-and-forget: push e email não bloqueiam — falhas logam no console.
 */

import { supabase } from './supabaseClient';
import { notificationsService } from '../features/admin/services/notificationsService';
import type { Notificacao } from '../types';

interface NotifyPayload {
  /** userId do destinatário */
  userId: string;
  /** Título da notificação */
  titulo: string;
  /** Mensagem/corpo */
  mensagem: string;
  /** Tipo para categorização in-app */
  tipo: Notificacao['tipo'];
  /** Link/rota interna (ex: '/evento/abc123') */
  link?: string;
  /** Dados extras para push data payload */
  data?: Record<string, string>;
}

/**
 * Busca nome e email de um userId na tabela profiles.
 * Retorna null se não encontrar.
 */
async function getUserInfo(userId: string): Promise<{ nome: string; email: string } | null> {
  const { data } = await supabase.from('profiles').select('nome, email').eq('id', userId).maybeSingle();
  if (!data) return null;
  return { nome: data.nome ?? '', email: data.email ?? '' };
}

/**
 * Envia notificação nos 3 canais.
 * In-app é síncrono (aguarda insert). Push e email são fire-and-forget.
 */
export async function notify(payload: NotifyPayload): Promise<void> {
  const { userId, titulo, mensagem, tipo, link, data } = payload;

  // 1. In-app — sempre
  try {
    await notificationsService.add({ titulo, mensagem, tipo, lida: false, link: link ?? '', timestamp: '' }, userId);
  } catch (e) {
    console.error('[notifyService] in-app falhou:', e);
  }

  // Buscar info do user para push e email
  const userInfo = await getUserInfo(userId);

  // 2. Push FCM — fire-and-forget
  try {
    supabase.functions
      .invoke('send-push', {
        body: {
          userIds: [userId],
          title: titulo,
          body: mensagem,
          data: { link: link || '', tipo: tipo || '', ...(data ?? {}) },
        },
      })
      .catch(e => console.error('[notifyService] push falhou:', e));
  } catch (e) {
    console.error('[notifyService] push invoke falhou:', e);
  }

  // 3. Email — fire-and-forget (só se tem email)
  if (userInfo?.email) {
    try {
      supabase.functions
        .invoke('send-notification-email', {
          body: {
            email: userInfo.email,
            nome: userInfo.nome || 'Usuário',
            titulo,
            mensagem,
            link: link ?? '',
            tipo: tipo ?? 'SISTEMA',
          },
        })
        .catch(e => console.error('[notifyService] email falhou:', e));
    } catch (e) {
      console.error('[notifyService] email invoke falhou:', e);
    }
  }
}

/**
 * Envia notificação para múltiplos usuários.
 * Útil para notificações em massa (ex: evento cancelado → todos compradores).
 */
export async function notifyMany(userIds: string[], payload: Omit<NotifyPayload, 'userId'>): Promise<void> {
  await Promise.allSettled(userIds.map(uid => notify({ ...payload, userId: uid })));
}

const notifyService = { notify, notifyMany };
