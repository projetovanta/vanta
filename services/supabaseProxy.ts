/**
 * supabaseProxy — Interceptor transparente para todas as chamadas Supabase.
 *
 * Wrapa o cliente Supabase para logar automaticamente:
 *   - .from(table).select/insert/update/delete/upsert → resultado logado
 *   - .rpc(fn) → resultado logado
 *   - Tempo de resposta, contagem de rows, erros
 *
 * Ativo APENAS em dev. Em produção, retorna o cliente original sem proxy.
 *
 * Abordagem: Proxy recursivo que intercepta .then() no final da chain.
 * Todos os métodos intermediários (.eq, .order, .limit, .single, etc.)
 * são chamados normalmente, mantendo o builder intacto.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { devLogger } from './devLogger';

const isDev = import.meta.env.DEV;
const SLOW_THRESHOLD_MS = 3000;

function logResult(label: string, startTime: number, data: unknown, error: unknown) {
  const elapsed = Math.round(performance.now() - startTime);

  if (error) {
    const err = error as { message?: string; code?: string; hint?: string; details?: string };
    devLogger.apiError(`${label} → ERRO: "${err.message}" (code: ${err.code || 'unknown'})`, {
      hint: err.hint,
      details: err.details,
      elapsed: `${elapsed}ms`,
    });
  } else if (elapsed > SLOW_THRESHOLD_MS) {
    const rowCount = Array.isArray(data) ? data.length : data ? 1 : 0;
    devLogger.apiSlow(`${label} → 200 (${elapsed}ms, ${rowCount} rows) ⚠️ LENTO`);
  } else {
    const rowCount = Array.isArray(data) ? data.length : data ? 1 : 0;
    devLogger.apiSuccess(`${label} → 200 (${elapsed}ms, ${rowCount} rows)`);
  }
}

/**
 * Wrapa um query builder (retornado por .from/.rpc) com logging no .then().
 * Mantém TODOS os métodos originais intactos.
 */
function wrapBuilder(builder: unknown, label: string, startTime: number): unknown {
  if (!builder || typeof builder !== 'object') return builder;

  return new Proxy(builder as object, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);

      // Interceptar .then — o ponto final da chain
      if (prop === 'then' && typeof val === 'function') {
        return function interceptedThen(onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
          return val.call(
            target,
            (result: { data: unknown; error: unknown }) => {
              logResult(label, startTime, result.data, result.error);
              return onFulfilled ? onFulfilled(result) : result;
            },
            onRejected,
          );
        };
      }

      // Para métodos encadeáveis (.eq, .order, .limit, .select, .single, etc.)
      // chamar o original e re-wrapar o resultado
      if (typeof val === 'function') {
        return function wrappedMethod(this: unknown, ...args: unknown[]) {
          const result = val.apply(target, args);
          // Se retorna um builder (objeto com .then), wrapar também
          if (result && typeof result === 'object' && 'then' in result) {
            return wrapBuilder(result, label, startTime);
          }
          return result;
        };
      }

      return val;
    },
  });
}

/**
 * Wrapa o cliente Supabase inteiro com proxy de logging.
 * Em produção, retorna o cliente original inalterado.
 */
export function wrapSupabaseWithLogging<T extends SupabaseClient>(client: T): T {
  if (!isDev) return client;

  return new Proxy(client, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);

      // Interceptar .from(table)
      if (prop === 'from' && typeof original === 'function') {
        return function wrappedFrom(table: string, ...rest: unknown[]) {
          const startTime = performance.now();
          const builder = original.call(target, table, ...rest);
          return wrapBuilder(builder, `from(${table})`, startTime);
        };
      }

      // Interceptar .rpc(fn, params)
      if (prop === 'rpc' && typeof original === 'function') {
        return function wrappedRpc(fn: string, ...rest: unknown[]) {
          const startTime = performance.now();
          const builder = original.call(target, fn, ...rest);
          return wrapBuilder(builder, `rpc(${fn})`, startTime);
        };
      }

      return original;
    },
  }) as T;
}
