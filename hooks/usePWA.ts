/**
 * usePWA — gerencia o ciclo de vida completo do PWA:
 *   - Registro do Service Worker (via workbox-window)
 *   - Permissão de notificações push
 *   - Prompt de instalação (Add to Home Screen)
 *   - Detecção de atualização disponível
 *
 * iOS Safari: não suporta beforeinstallprompt nem Push API completa.
 * Android Chrome / desktop: suporte total.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Workbox } from 'workbox-window';
import { nativePushService } from '../services/nativePushService';

export type NotifPermission = 'idle' | 'granted' | 'denied' | 'unavailable';

interface UsePWAReturn {
  // Notificações
  notifPermission: NotifPermission;
  requestNotifPermission: () => Promise<NotifPermission>;
  sendLocalNotification: (title: string, body: string, url?: string) => void;
  registerFcmPush: (userId: string) => Promise<void>;

  // Instalação
  canInstall: boolean;
  installApp: () => Promise<void>;
  isInstalled: boolean;

  // Atualização
  updateAvailable: boolean;
  applyUpdate: () => void;
}

// Instância global do Workbox (singleton)
let wb: Workbox | null = null;

export const usePWA = (): UsePWAReturn => {
  const [notifPermission, setNotifPermission] = useState<NotifPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unavailable';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'idle';
  });

  const [canInstall, setCanInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Detecta se já está instalado como PWA (standalone)
  const isInstalled =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true));

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // ── Registro do Service Worker ──────────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

    wb = new Workbox('/sw.js');

    wb.addEventListener('waiting', () => setUpdateAvailable(true));
    wb.addEventListener('controlling', () => window.location.reload());

    wb.register().catch(() => {
      // Falha silenciosa — app funciona sem SW
    });
  }, []);

  // ── Prompt de instalação (Android/Desktop) ──────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ── Notificações ────────────────────────────────────────────────────────────
  const requestNotifPermission = useCallback(async (): Promise<NotifPermission> => {
    if (!('Notification' in window)) {
      setNotifPermission('unavailable');
      return 'unavailable';
    }
    if (Notification.permission === 'granted') {
      setNotifPermission('granted');
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      setNotifPermission('denied');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      const mapped: NotifPermission = result === 'granted' ? 'granted' : 'denied';
      setNotifPermission(mapped);
      return mapped;
    } catch {
      setNotifPermission('denied');
      return 'denied';
    }
  }, []);

  // Notificação local via SW (funciona mesmo com app em background)
  const sendLocalNotification = useCallback(
    (title: string, body: string, url = '/') => {
      if (notifPermission !== 'granted') return;
      if (!('serviceWorker' in navigator)) {
        // Fallback: notificação direta sem SW
        new Notification(title, { body, icon: '/icon-192.png' });
        return;
      }
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'vanta-local',
          data: { url },
          vibrate: [100, 50, 100],
        } as NotificationOptions);
      });
    },
    [notifPermission],
  );

  // ── Instalação ──────────────────────────────────────────────────────────────
  const installApp = useCallback(async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      deferredPromptRef.current = null;
    }
  }, []);

  // ── Atualização ─────────────────────────────────────────────────────────────
  const applyUpdate = useCallback(() => {
    if (wb) {
      wb.messageSkipWaiting();
    }
  }, []);

  // ── FCM Push Registration ─────────────────────────────────────────────────
  const registerFcmPush = useCallback(async (userId: string) => {
    // nativePushService detecta automaticamente: Capacitor → plugin nativo, browser → Firebase Web SDK
    await nativePushService.registerAndSave(userId);
  }, []);

  return {
    notifPermission,
    requestNotifPermission,
    sendLocalNotification,
    registerFcmPush,
    canInstall,
    installApp,
    isInstalled,
    updateAvailable,
    applyUpdate,
  };
};

// Tipo nativo que o TypeScript não tem por padrão
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
