import { useState, useEffect, useCallback } from 'react';
import { offlineEventService } from '../services/offlineEventService';

export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Escuta eventos online/offline
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Atualiza contagem de pendências
  const refreshPendingCount = useCallback(async () => {
    const count = await offlineEventService.getPendingCount();
    setPendingSyncCount(count);
  }, []);

  // Carrega contagem inicial
  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  // Auto-sync quando reconecta
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && !syncing) {
      setSyncing(true);
      void offlineEventService.syncAll().then(() => {
        setSyncing(false);
        void refreshPendingCount();
      });
    }
  }, [isOnline, pendingSyncCount, syncing, refreshPendingCount]);

  return { isOnline, pendingSyncCount, syncing, refreshPendingCount };
};
