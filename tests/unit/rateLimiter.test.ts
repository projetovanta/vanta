import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter } from '../../services/rateLimiter';

beforeEach(() => {
  rateLimiter.resetAll();
});

describe('rateLimiter', () => {
  it('permite requests dentro do limite', () => {
    const config = { maxTokens: 3, refillRate: 0 };
    expect(rateLimiter.allow('test', config)).toBe(true);
    expect(rateLimiter.allow('test', config)).toBe(true);
    expect(rateLimiter.allow('test', config)).toBe(true);
  });

  it('bloqueia quando tokens esgotam', () => {
    const config = { maxTokens: 2, refillRate: 0 };
    rateLimiter.allow('test', config);
    rateLimiter.allow('test', config);
    expect(rateLimiter.allow('test', config)).toBe(false);
  });

  it('buckets sao independentes por key', () => {
    const config = { maxTokens: 1, refillRate: 0 };
    expect(rateLimiter.allow('a', config)).toBe(true);
    expect(rateLimiter.allow('b', config)).toBe(true);
    expect(rateLimiter.allow('a', config)).toBe(false);
    expect(rateLimiter.allow('b', config)).toBe(false);
  });

  it('tokens recarregam com o tempo', async () => {
    const config = { maxTokens: 1, refillRate: 100 }; // 100 tokens/s
    rateLimiter.allow('test', config); // consome 1
    expect(rateLimiter.allow('test', config)).toBe(false); // 0

    await new Promise(r => setTimeout(r, 50)); // esperar refill
    expect(rateLimiter.allow('test', config)).toBe(true); // recarregou
  });

  it('reset limpa o bucket', () => {
    const config = { maxTokens: 1, refillRate: 0 };
    rateLimiter.allow('test', config);
    expect(rateLimiter.allow('test', config)).toBe(false);

    rateLimiter.reset('test');
    expect(rateLimiter.allow('test', config)).toBe(true);
  });

  it('resetAll limpa todos os buckets', () => {
    const config = { maxTokens: 1, refillRate: 0 };
    rateLimiter.allow('a', config);
    rateLimiter.allow('b', config);
    rateLimiter.resetAll();

    expect(rateLimiter.allow('a', config)).toBe(true);
    expect(rateLimiter.allow('b', config)).toBe(true);
  });
});
