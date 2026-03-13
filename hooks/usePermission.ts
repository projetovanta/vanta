/**
 * usePermission — hook centralizado para verificar e solicitar permissões do navegador.
 *
 * Funciona em iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari.
 * Segue o padrão "verificar antes de pedir":
 *   - Se já concedida  → retorna 'granted'  (sem pop-up)
 *   - Se prompt        → solicita ao usuário
 *   - Se negada        → retorna 'denied'   (sem loop infinito)
 *
 * iOS Safari: não suporta navigator.permissions.query para 'camera'.
 * Nesses casos, vai direto para getUserMedia e trata o erro.
 */

import { useState, useCallback } from 'react';

type PermissionState = 'idle' | 'checking' | 'granted' | 'denied' | 'unavailable';

// ── Câmera ────────────────────────────────────────────────────────────────────

/**
 * Verifica e solicita acesso à câmera.
 * Retorna `stream` em caso de sucesso para que o chamador possa reutilizá-lo.
 */
export const useCameraPermission = () => {
  const [state, setState] = useState<PermissionState>('idle');

  const request = useCallback(
    async (
      constraints: MediaStreamConstraints = { video: { facingMode: 'user' } },
    ): Promise<{ stream: MediaStream | null; denied: boolean }> => {
      setState('checking');

      // Tenta via Permissions API (Chrome/Firefox/Android — iOS Safari não suporta)
      if (navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (perm.state === 'denied') {
            setState('denied');
            return { stream: null, denied: true };
          }
        } catch {
          // iOS Safari lança erro — ignoramos e vamos direto para getUserMedia
        }
      }

      // Solicita stream (pede permissão ao usuário se ainda não concedida)
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setState('granted');
        return { stream, denied: false };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.name : '';
        // NotAllowedError = usuário recusou; OverconstrainedError = hardware
        setState(msg === 'NotAllowedError' || msg === 'PermissionDeniedError' ? 'denied' : 'unavailable');
        return { stream: null, denied: true };
      }
    },
    [],
  );

  const check = useCallback(async (): Promise<PermissionState> => {
    if (!navigator.permissions) return 'idle';
    try {
      const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const mapped: PermissionState =
        perm.state === 'granted' ? 'granted' : perm.state === 'denied' ? 'denied' : 'idle';
      setState(mapped);
      return mapped;
    } catch {
      return 'idle';
    }
  }, []);

  return { state, request, check };
};

// ── Geolocalização ────────────────────────────────────────────────────────────

export const useGeolocationPermission = () => {
  const [state, setState] = useState<PermissionState>('idle');

  /** Verifica sem pedir — útil para não mostrar modal se já concedida. */
  const check = useCallback(async (): Promise<PermissionState> => {
    if (!('geolocation' in navigator)) {
      setState('unavailable');
      return 'unavailable';
    }
    if (!navigator.permissions) return 'idle';
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' });
      const mapped: PermissionState =
        perm.state === 'granted' ? 'granted' : perm.state === 'denied' ? 'denied' : 'idle';
      setState(mapped);
      return mapped;
    } catch {
      return 'idle';
    }
  }, []);

  /** Solicita posição — dispara pop-up do browser se necessário. */
  const request = useCallback((options?: PositionOptions): Promise<GeolocationCoordinates | null> => {
    setState('checking');
    return new Promise(resolve => {
      if (!('geolocation' in navigator)) {
        setState('unavailable');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          setState('granted');
          resolve(pos.coords);
        },
        () => {
          setState('denied');
          resolve(null);
        },
        options ?? { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    });
  }, []);

  return { state, check, request };
};
