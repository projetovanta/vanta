/**
 * useDevNavLogger — Hook que observa mudanças de rota e loga via devLogger.
 *
 * Deve ser chamado 1x dentro do BrowserRouter (no App.tsx).
 * Em produção: hooks rodam mas callbacks são noop.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { devLogger } from '../services/devLogger';

const isDev = import.meta.env.DEV;

export function useDevNavLogger(activeTab: string) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const prevTab = useRef(activeTab);

  // Logar mudanças de rota
  useEffect(() => {
    if (!isDev) return;
    if (prevPath.current !== location.pathname) {
      devLogger.nav(`${prevPath.current} → ${location.pathname}`);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Logar mudanças de tab
  useEffect(() => {
    if (!isDev) return;
    if (prevTab.current !== activeTab) {
      devLogger.nav(`tab:${prevTab.current} → tab:${activeTab}`);
      prevTab.current = activeTab;
    }
  }, [activeTab]);
}
