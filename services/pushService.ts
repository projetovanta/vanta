/**
 * pushService — Gerencia subscrições FCM push.
 *
 * Fluxo:
 * 1. requestPermissionAndGetToken() → pede permissão + obtém FCM token
 * 2. saveSubscription() → salva token no Supabase (push_subscriptions)
 * 3. removeSubscription() → remove ao fazer logout
 */

import { getFirebaseMessaging, isFirebaseConfigured } from './firebaseConfig';
import { supabase } from './supabaseClient';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';

export const pushService = {
  /** Solicita permissão e retorna o FCM token (ou null se não disponível) */
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!isFirebaseConfigured()) {
      console.warn('[pushService] Firebase não configurado. Token não obtido.'); // audit-ok: aviso de config
      return null;
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('[pushService] Service Worker não suportado.'); // audit-ok: aviso de compatibilidade
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    try {
      // Registrar o SW do Firebase Messaging (se ainda não registrado)
      let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!swReg) {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Aguardar SW ativar
        await navigator.serviceWorker.ready;
      }

      const { getToken } = await import('firebase/messaging');
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY || undefined,
        serviceWorkerRegistration: swReg,
      });
      return token || null;
    } catch (err) {
      console.error('[pushService] Erro ao obter token FCM:', err);
      return null;
    }
  },

  /** Salva subscrição no Supabase */
  async saveSubscription(userId: string, fcmToken: string): Promise<boolean> {
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        fcm_token: fcmToken,
        device_info: navigator.userAgent.slice(0, 200),
      },
      { onConflict: 'user_id,fcm_token' },
    );

    if (error) {
      console.error('[pushService] saveSubscription erro:', error);
      return false;
    }
    return true;
  },

  /** Remove todas as subscrições do usuário (ex: logout) */
  async removeSubscription(userId: string): Promise<void> {
    const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', userId);

    if (error) {
      console.error('[pushService] removeSubscription erro:', error);
    }
  },
};
