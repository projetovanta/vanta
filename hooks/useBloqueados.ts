import { useEffect, useState } from 'react';
import { listarBloqueados } from '../services/reportBlockService';
import { useAuthStore } from '../stores/authStore';

/** Set reativo de IDs bloqueados pelo usuário logado */
export function useBloqueados(): Set<string> {
  const userId = useAuthStore(s => s.currentAccount.id);
  const role = useAuthStore(s => s.currentAccount.role);
  const [bloqueados, setBloqueados] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || role === 'vanta_guest') return;
    let cancelled = false;
    listarBloqueados().then(ids => {
      if (!cancelled) setBloqueados(new Set(ids));
    });
    return () => {
      cancelled = true;
    };
  }, [userId, role]);

  return bloqueados;
}
