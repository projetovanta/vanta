/**
 * deepLinkService — Escuta deep links do Capacitor e traduz pra navegação interna.
 * URLs suportadas:
 *   /event/:slug ou /evento/:id → abre detalhe do evento
 *   /community/:id → abre comunidade pública
 *   /checkout/:eventoId → abre checkout
 *   /checkout/sucesso → abre carteira
 *   /perfil → abre perfil
 */

import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export interface DeepLinkResult {
  type: 'EVENT' | 'COMMUNITY' | 'CHECKOUT' | 'WALLET' | 'PROFILE' | 'UNKNOWN';
  id?: string;
}

/** Parseia URL de deep link e retorna tipo + id */
export function parseDeepLink(url: string): DeepLinkResult {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    // /event/:slug ou /evento/:id
    const eventMatch = path.match(/^\/(event|evento)\/(.+)$/);
    if (eventMatch) return { type: 'EVENT', id: eventMatch[2] };

    // /community/:id ou /comunidade/:id
    const comMatch = path.match(/^\/(community|comunidade)\/(.+)$/);
    if (comMatch) return { type: 'COMMUNITY', id: comMatch[2] };

    // /checkout/sucesso
    if (path.includes('/checkout/sucesso')) return { type: 'WALLET' };

    // /checkout/:eventoId
    const checkoutMatch = path.match(/^\/checkout\/(.+)$/);
    if (checkoutMatch) return { type: 'CHECKOUT', id: checkoutMatch[1] };

    // /perfil
    if (path === '/perfil') return { type: 'PROFILE' };

    return { type: 'UNKNOWN' };
  } catch {
    return { type: 'UNKNOWN' };
  }
}

/** Registra listener de deep links no Capacitor (noop na web) */
export function registerDeepLinkListener(onDeepLink: (result: DeepLinkResult) => void): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  const listener = CapApp.addListener('appUrlOpen', event => {
    const result = parseDeepLink(event.url);
    if (result.type !== 'UNKNOWN') {
      onDeepLink(result);
    }
  });

  return () => {
    listener.then(l => l.remove());
  };
}
