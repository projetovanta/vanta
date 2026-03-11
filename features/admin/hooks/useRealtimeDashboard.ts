/**
 * Hook para dados ao vivo do dashboard via Supabase Realtime.
 *
 * Escuta INSERT em tickets_caixa (vendas + check-ins) para o evento dado.
 * Retorna contadores incrementais que ressetam quando eventoId muda.
 */

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';

interface RealtimeStats {
  vendasRecentes: number;
  checkinsRecentes: number;
  /** Timestamp do último evento recebido */
  lastUpdate: number | null;
}

export function useRealtimeDashboard(eventoId: string | null): RealtimeStats {
  const [stats, setStats] = useState<RealtimeStats>({
    vendasRecentes: 0,
    checkinsRecentes: 0,
    lastUpdate: null,
  });

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!eventoId) return;

    // Reset on event change
    setStats({ vendasRecentes: 0, checkinsRecentes: 0, lastUpdate: null });

    const channel = supabase
      .channel(`dashboard-realtime-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets_caixa',
          filter: `evento_id=eq.${eventoId}`,
        },
        () => {
          setStats(prev => ({
            ...prev,
            vendasRecentes: prev.vendasRecentes + 1,
            lastUpdate: Date.now(),
          }));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets_caixa',
          filter: `evento_id=eq.${eventoId}`,
        },
        payload => {
          const newRow = payload.new as Record<string, unknown>;
          if (newRow.status === 'USADO') {
            setStats(prev => ({
              ...prev,
              checkinsRecentes: prev.checkinsRecentes + 1,
              lastUpdate: Date.now(),
            }));
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [eventoId]);

  return stats;
}
