/**
 * Hook compartilhado para período do dashboard com persistência localStorage.
 */

import { useState, useCallback } from 'react';
import type { Periodo } from '../services/analytics/types';

const STORAGE_KEY = 'vanta-dashboard-periodo';

function getInitial(): Periodo {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'HOJE' || stored === 'SEMANA' || stored === 'MES' || stored === 'ANO') {
      return stored;
    }
  } catch {
    // localStorage indisponível
  }
  return 'MES';
}

export function useDashboardPeriod(): [Periodo, (p: Periodo) => void] {
  const [periodo, setPeriodoState] = useState<Periodo>(getInitial);

  const setPeriodo = useCallback((p: Periodo) => {
    setPeriodoState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      // ignore
    }
  }, []);

  return [periodo, setPeriodo];
}
