import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCached, invalidateCache, invalidateCacheByPrefix, clearAllCache } from '../../services/cache';

beforeEach(() => {
  clearAllCache();
});

describe('getCached', () => {
  it('chama fetchFn na primeira vez e retorna o resultado', async () => {
    const fetchFn = vi.fn().mockResolvedValue('dados');
    const result = await getCached('key1', fetchFn);
    expect(result).toBe('dados');
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('retorna cache na segunda chamada sem chamar fetchFn novamente', async () => {
    const fetchFn = vi.fn().mockResolvedValue('dados');
    await getCached('key2', fetchFn, 60_000);
    const result = await getCached('key2', fetchFn, 60_000);
    expect(result).toBe('dados');
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('deduplica chamadas inflight para a mesma key', async () => {
    let resolvePromise: (v: string) => void;
    const fetchFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>(r => {
          resolvePromise = r;
        }),
    );

    const p1 = getCached('key3', fetchFn);
    const p2 = getCached('key3', fetchFn);

    resolvePromise!('resultado');
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe('resultado');
    expect(r2).toBe('resultado');
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('retorna stale data quando TTL expirou e revalida em background', async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce('v2');

    await getCached('key4', fetchFn, 1); // TTL = 1ms
    await new Promise(r => setTimeout(r, 10)); // esperar TTL expirar

    const result = await getCached('key4', fetchFn, 1);
    expect(result).toBe('v1'); // retorna stale
    expect(fetchFn).toHaveBeenCalledTimes(2); // mas revalida em background
  });
});

describe('invalidateCache', () => {
  it('remove entrada especifica do cache', async () => {
    const fetchFn = vi.fn().mockResolvedValue('dados');
    await getCached('rem1', fetchFn);
    invalidateCache('rem1');

    await getCached('rem1', fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('invalidateCacheByPrefix', () => {
  it('remove todas as entradas com o prefixo', async () => {
    const fn = vi.fn().mockResolvedValue('x');
    await getCached('tickets:ev1', fn);
    await getCached('tickets:ev2', fn);
    await getCached('eventos:1', fn);

    invalidateCacheByPrefix('tickets:');

    // tickets foram removidos, eventos não
    await getCached('tickets:ev1', fn);
    await getCached('eventos:1', fn);

    // tickets:ev1 chamou de novo (4a), eventos:1 usou cache (não chamou de novo)
    expect(fn).toHaveBeenCalledTimes(4);
  });
});

describe('clearAllCache', () => {
  it('remove tudo', async () => {
    const fn = vi.fn().mockResolvedValue('x');
    await getCached('a', fn);
    await getCached('b', fn);
    clearAllCache();

    await getCached('a', fn);
    await getCached('b', fn);
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
