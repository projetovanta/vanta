/**
 * devLogInit — Inicializa todos os observers de logging em dev.
 *
 * Chamado 1x no App.tsx. Configura:
 *   - Interceptors globais (console.error, console.warn, unhandledrejection, error)
 *   - Store observers (Zustand)
 *
 * REGRA: NENHUM erro passa em silêncio. Todo console.error, console.warn,
 * promise rejection e erro uncaught é capturado e aparece no DevLog.
 *
 * Em produção: noop.
 */

import { devLogger } from './devLogger';

const isDev = import.meta.env.DEV;
let _initialized = false;

export function initDevLogging(): () => void {
  if (!isDev || _initialized) return () => {};
  _initialized = true;

  const cleanups: (() => void)[] = [];

  // ── Interceptar console.error — NENHUM erro silencioso ─────
  const _originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : a instanceof Error ? a.message : String(a))).join(' ');
    // Evitar loop: não logar erros gerados pelo próprio devLogger
    if (!msg.includes('[ERRO]') && !msg.includes('[API]')) {
      devLogger.error(`console.error: ${msg.slice(0, 300)}`, args.length > 1 ? args : undefined);
    }
    _originalError.apply(console, args);
  };
  cleanups.push(() => {
    console.error = _originalError;
  });

  // ── Interceptar console.warn — NENHUM warning silencioso ───
  const _originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : String(a))).join(' ');
    // Evitar loop: não logar warns gerados pelo próprio devLogger
    if (!msg.includes('[API]') && !msg.includes('[RT]')) {
      devLogger.error(`console.warn: ${msg.slice(0, 300)}`, args.length > 1 ? args : undefined);
    }
    _originalWarn.apply(console, args);
  };
  cleanups.push(() => {
    console.warn = _originalWarn;
  });

  // ── Erros uncaught (window.onerror) ────────────────────────
  const errorHandler = (event: ErrorEvent) => {
    devLogger.error(`uncaught: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };
  window.addEventListener('error', errorHandler);
  cleanups.push(() => window.removeEventListener('error', errorHandler));

  // ── Promise rejections não tratadas ────────────────────────
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    devLogger.error(`unhandled rejection: ${reason}`, event.reason);
  };
  window.addEventListener('unhandledrejection', rejectionHandler);
  cleanups.push(() => window.removeEventListener('unhandledrejection', rejectionHandler));

  // ── Fetch failures (erros de rede silenciosos) ────────────
  const _originalFetch = window.fetch;
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
    try {
      const res = await _originalFetch(...args);
      // Log fetch errors (4xx/5xx) exceto os já logados pelo supabaseProxy
      if (!res.ok && !url.includes('supabase') && !url.includes('rest/v1')) {
        devLogger.error(`fetch ${res.status}: ${url.slice(0, 120)}`, { status: res.status });
      }
      return res;
    } catch (err) {
      devLogger.error(`fetch failed: ${url.slice(0, 120)}`, err instanceof Error ? err.message : err);
      throw err;
    }
  };
  cleanups.push(() => {
    window.fetch = _originalFetch;
  });

  // ── CSP violations ─────────────────────────────────────────
  const cspHandler = (event: Event) => {
    const e = event as SecurityPolicyViolationEvent;
    devLogger.error(`CSP violation: ${e.violatedDirective} bloqueou ${e.blockedURI}`, {
      directive: e.violatedDirective,
      blocked: e.blockedURI,
      source: e.sourceFile,
      line: e.lineNumber,
    });
  };
  document.addEventListener('securitypolicyviolation', cspHandler);
  cleanups.push(() => document.removeEventListener('securitypolicyviolation', cspHandler));

  // ── Store observers ────────────────────────────────────────
  import('./storeLogger').then(({ observeStore }) => {
    import('../stores/authStore').then(({ useAuthStore }) => {
      cleanups.push(observeStore('authStore', useAuthStore));
    });
    import('../stores/ticketsStore').then(({ useTicketsStore }) => {
      cleanups.push(observeStore('ticketsStore', useTicketsStore));
    });
    import('../stores/chatStore').then(({ useChatStore }) => {
      cleanups.push(observeStore('chatStore', useChatStore));
    });
    import('../stores/socialStore').then(({ useSocialStore }) => {
      cleanups.push(observeStore('socialStore', useSocialStore));
    });
    import('../stores/extrasStore').then(({ useExtrasStore }) => {
      cleanups.push(observeStore('extrasStore', useExtrasStore));
    });
  });

  devLogger.nav('🚀 DevLogging initialized — ZERO erros silenciosos');

  return () => {
    cleanups.forEach(fn => fn());
    _initialized = false;
  };
}
