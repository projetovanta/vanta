/**
 * Cache in-memory com stale-while-revalidate.
 *
 * Pattern: getCached(key, fetchFn, ttlMs)
 * - Se cache fresh → retorna imediato
 * - Se cache stale → retorna stale, refetch em background
 * - Se cache vazio → fetch síncrono
 *
 * invalidateCache(key) → remove entry
 * clearAllCache() → limpa tudo
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, CacheEntry<unknown>>();

// Previne múltiplos fetches simultâneos para a mesma key
const inflight = new Map<string, Promise<unknown>>();

function isFresh<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Busca dados com cache stale-while-revalidate.
 *
 * @param key     Chave única do cache (ex: 'eventos', 'tickets:userId')
 * @param fetchFn Função que busca os dados frescos
 * @param ttlMs   Time-to-live em ms (default 60s)
 * @returns       Dados (do cache ou fetch)
 */
export async function getCached<T>(key: string, fetchFn: () => Promise<T>, ttlMs = 60_000): Promise<T> {
  const cached = store.get(key) as CacheEntry<T> | undefined;

  // Cache fresh → retorna imediato
  if (cached && isFresh(cached)) {
    return cached.data;
  }

  // Cache stale → retorna stale, refetch em background
  if (cached) {
    revalidate(key, fetchFn, ttlMs);
    return cached.data;
  }

  // Sem cache → fetch síncrono (deduplica inflight)
  return fetchAndStore(key, fetchFn, ttlMs);
}

async function fetchAndStore<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetchFn()
    .then(data => {
      store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

function revalidate<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number): void {
  if (inflight.has(key)) return; // já revalidando
  void fetchAndStore(key, fetchFn, ttlMs);
}

/** Remove uma entrada do cache */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Remove múltiplas entradas por prefixo (ex: 'tickets:' limpa todos os tickets) */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/** Limpa todo o cache */
export function clearAllCache(): void {
  store.clear();
  inflight.clear();
}
