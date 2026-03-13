/**
 * storeLogger — Observa mudanças nas stores Zustand e loga via devLogger.
 *
 * Usa subscribe() nativo do Zustand (zero alteração nos stores).
 * Ativo APENAS em dev.
 */

import { devLogger } from './devLogger';

const isDev = import.meta.env.DEV;

/** Resumo compacto de um valor para log */
function summarize(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return val.length > 40 ? `"${val.slice(0, 40)}..."` : `"${val}"`;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return `${val.length} items`;
  if (typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>);
    if (keys.includes('id') && keys.includes('nome')) {
      return `{id: "${(val as Record<string, unknown>).id}", nome: "${(val as Record<string, unknown>).nome}"}`;
    }
    return `{${keys.length} keys}`;
  }
  return String(val);
}

/** Keys que geram muito ruído e devem ser ignoradas */
const IGNORED_KEYS = new Set(['init', 'authLoading', 'selectedCity']);

/** Mudanças triviais: array vazio→vazio, 0→0, objeto vazio→vazio */
function isTrivialChange(oldVal: unknown, newVal: unknown): boolean {
  if (Array.isArray(oldVal) && Array.isArray(newVal) && oldVal.length === 0 && newVal.length === 0) return true;
  if (oldVal === 0 && newVal === 0) return true;
  if (
    oldVal &&
    newVal &&
    typeof oldVal === 'object' &&
    typeof newVal === 'object' &&
    !Array.isArray(oldVal) &&
    !Array.isArray(newVal) &&
    Object.keys(oldVal as Record<string, unknown>).length === 0 &&
    Object.keys(newVal as Record<string, unknown>).length === 0
  )
    return true;
  return false;
}

/**
 * Inscreve um observer em uma store Zustand.
 * Retorna cleanup function.
 */
export function observeStore(
  storeName: string,
  store: { subscribe: (fn: (state: any, prev: any) => void) => () => void },
): () => void {
  if (!isDev) return () => {};

  return store.subscribe((state, prev) => {
    // Detectar quais keys mudaram
    for (const key of Object.keys(state)) {
      if (IGNORED_KEYS.has(key)) continue;
      if (typeof state[key] === 'function') continue;

      const newVal = state[key];
      const oldVal = prev[key];

      // Comparação por referência (Zustand imutável)
      if (newVal !== oldVal && !isTrivialChange(oldVal, newVal)) {
        devLogger.store(`${storeName}.${key}: ${summarize(oldVal)} → ${summarize(newVal)}`);
      }
    }
  });
}
