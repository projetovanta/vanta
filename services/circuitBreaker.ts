/**
 * Circuit Breaker — protege contra cascata de erros quando Supabase está lento/fora.
 *
 * Estados:
 * - CLOSED: tudo normal, requests passam
 * - OPEN: circuito aberto após N falhas, retorna cache/fallback
 * - HALF_OPEN: teste com 1 request após cooldown
 *
 * Uso:
 *   const result = await withCircuitBreaker('eventos', () => fetchEventos(), fallback);
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitConfig {
  /** Falhas consecutivas para abrir o circuito */
  failureThreshold: number;
  /** Tempo em ms para tentar reconectar (cooldown) */
  resetTimeout: number;
}

interface CircuitEntry {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  config: CircuitConfig;
}

const circuits = new Map<string, CircuitEntry>();

const DEFAULT_CONFIG: CircuitConfig = {
  failureThreshold: 3,
  resetTimeout: 30_000, // 30s
};

function getCircuit(name: string, config?: Partial<CircuitConfig>): CircuitEntry {
  let entry = circuits.get(name);
  if (!entry) {
    entry = {
      state: 'CLOSED',
      failures: 0,
      lastFailure: 0,
      config: { ...DEFAULT_CONFIG, ...config },
    };
    circuits.set(name, entry);
  }
  return entry;
}

/**
 * Executa uma função com circuit breaker.
 *
 * @param name      Identificador do circuito (ex: 'supabase-rest')
 * @param fn        Função a executar
 * @param fallback  Valor de fallback quando circuito está aberto
 * @param config    Config customizada (threshold, resetTimeout)
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback: T,
  config?: Partial<CircuitConfig>,
): Promise<T> {
  const circuit = getCircuit(name, config);

  // OPEN: verifica se cooldown passou → HALF_OPEN
  if (circuit.state === 'OPEN') {
    if (Date.now() - circuit.lastFailure >= circuit.config.resetTimeout) {
      circuit.state = 'HALF_OPEN';
    } else {
      return fallback;
    }
  }

  try {
    const result = await fn();
    // Sucesso → reset
    circuit.failures = 0;
    circuit.state = 'CLOSED';
    return result;
  } catch (error) {
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.failures >= circuit.config.failureThreshold) {
      circuit.state = 'OPEN';
      console.warn(`[CircuitBreaker:${name}] OPEN — ${circuit.failures} falhas consecutivas`);
    }

    return fallback;
  }
}

/** Reseta manualmente um circuito */
export function resetCircuit(name: string): void {
  circuits.delete(name);
}

/** Verifica o estado de um circuito */
export function getCircuitState(name: string): CircuitState {
  return circuits.get(name)?.state ?? 'CLOSED';
}
