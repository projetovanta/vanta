/**
 * Detecta se o app está rodando como app instalado (PWA standalone ou Capacitor).
 * Usado para redirecionar compras ao browser externo (evitar taxa Apple/Google 30%).
 */
export const isInstalledApp = (): boolean => {
  // PWA standalone (iOS / Android)
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;

  // iOS standalone (Safari-based)
  if ((navigator as unknown as Record<string, unknown>).standalone === true) return true;

  // Capacitor WebView
  if ((window as unknown as Record<string, unknown>).Capacitor) return true;

  return false;
};

/**
 * Abre URL de checkout no browser externo quando dentro de app nativo/PWA.
 * Se estiver no browser normal, abre em nova aba.
 */
export const openCheckoutUrl = (eventoId: string): void => {
  const baseUrl = window.location.origin;
  const checkoutUrl = `${baseUrl}/checkout/${eventoId}`;

  if (isInstalledApp()) {
    // Força abertura no browser do sistema (sai do WebView/PWA)
    window.open(checkoutUrl, '_system');
  } else {
    window.open(checkoutUrl, '_blank');
  }
};
