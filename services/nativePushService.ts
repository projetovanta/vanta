/**
 * nativePushService — Push nativo via Capacitor (APNs/FCM direto).
 *
 * Detecta se roda no Capacitor:
 *   - SIM → usa @capacitor/push-notifications (token nativo)
 *   - NÃO → delega para pushService.ts (Firebase Web SDK + Service Worker)
 *
 * O token obtido (nativo ou web) é salvo na mesma tabela push_subscriptions.
 */

import { Capacitor } from '@capacitor/core';
import { pushService } from './pushService';
import { supabase } from './supabaseClient';

const isNative = Capacitor.isNativePlatform();

async function registerNativePush(userId: string): Promise<string | null> {
  const { PushNotifications } = await import('@capacitor/push-notifications');

  // Checar permissão atual
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    return null;
  }

  // Registrar no APNs/FCM
  await PushNotifications.register();

  // Aguardar token via listener (promise wrapper)
  return new Promise<string | null>(resolve => {
    const timeout = setTimeout(() => resolve(null), 10_000);

    PushNotifications.addListener('registration', token => {
      clearTimeout(timeout);
      resolve(token.value);
    });

    PushNotifications.addListener('registrationError', err => {
      clearTimeout(timeout);
      console.error('[nativePush] registrationError:', err);
      resolve(null);
    });
  });
}

export const nativePushService = {
  /**
   * Registra push e salva token no Supabase.
   * Detecta automaticamente se deve usar nativo ou web.
   */
  async registerAndSave(userId: string): Promise<boolean> {
    let token: string | null = null;

    if (isNative) {
      token = await registerNativePush(userId);
    } else {
      token = await pushService.requestPermissionAndGetToken();
    }

    if (!token) return false;

    return pushService.saveSubscription(userId, token);
  },

  /**
   * Configura listeners de notificação recebida (apenas nativo).
   * Chama callback quando usuário toca na notificação.
   */
  async setupNativeListeners(onNotificationTap: (data: Record<string, string>) => void): Promise<void> {
    if (!isNative) return;

    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Notificação recebida com app aberto
    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.debug('[nativePush] received:', notification.title);
    });

    // Usuário tocou na notificação
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const data = (action.notification.data ?? {}) as Record<string, string>;
      onNotificationTap(data);
    });
  },

  /** Remove subscriptions ao logout */
  async unregister(userId: string): Promise<void> {
    if (isNative) {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.removeAllListeners();
      } catch {
        // plugin pode não estar disponível
      }
    }
    await supabase.from('push_subscriptions').delete().eq('user_id', userId);
  },
};
