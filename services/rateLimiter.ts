/**
 * Rate Limiter client-side — token bucket pattern.
 *
 * Protege contra:
 * - Loops infinitos de refetch
 * - Bugs de useEffect que disparam queries em cascata
 * - Usuário clicando repetidamente
 *
 * Uso:
 *   if (!rateLimiter.allow('eventos-fetch')) return;
 *   await fetchEventos();
 */

interface BucketConfig {
  /** Máximo de tokens no bucket */
  maxTokens: number;
  /** Tokens restaurados por segundo */
  refillRate: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
  config: BucketConfig;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_CONFIG: BucketConfig = {
  maxTokens: 30, // 30 requests
  refillRate: 0.5, // 0.5/s = 30/min
};

function getBucket(key: string, config?: Partial<BucketConfig>): Bucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    bucket = { tokens: cfg.maxTokens, lastRefill: Date.now(), config: cfg };
    buckets.set(key, bucket);
  }
  return bucket;
}

function refill(bucket: Bucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.config.maxTokens, bucket.tokens + elapsed * bucket.config.refillRate);
  bucket.lastRefill = now;
}

export const rateLimiter = {
  /**
   * Tenta consumir 1 token. Retorna true se permitido.
   */
  allow(key: string, config?: Partial<BucketConfig>): boolean {
    const bucket = getBucket(key, config);
    refill(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    console.warn(`[RateLimiter] Blocked: ${key} (${bucket.tokens.toFixed(1)} tokens remaining)`);
    return false;
  },

  /** Reseta um bucket */
  reset(key: string): void {
    buckets.delete(key);
  },

  /** Reseta todos os buckets */
  resetAll(): void {
    buckets.clear();
  },
};
