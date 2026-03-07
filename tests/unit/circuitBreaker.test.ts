import { describe, it, expect, beforeEach } from 'vitest';
import { withCircuitBreaker, resetCircuit, getCircuitState } from '../../services/circuitBreaker';

beforeEach(() => {
  resetCircuit('test');
});

describe('withCircuitBreaker', () => {
  it('retorna resultado quando fn sucede', async () => {
    const result = await withCircuitBreaker('test', async () => 'ok', 'fallback');
    expect(result).toBe('ok');
    expect(getCircuitState('test')).toBe('CLOSED');
  });

  it('retorna fallback quando fn falha', async () => {
    const result = await withCircuitBreaker(
      'test',
      async () => {
        throw new Error('fail');
      },
      'fallback',
    );
    expect(result).toBe('fallback');
  });

  it('abre circuito após N falhas consecutivas', async () => {
    const fail = async () => {
      throw new Error('fail');
    };
    const config = { failureThreshold: 3 };

    await withCircuitBreaker('test', fail, 'fb', config);
    expect(getCircuitState('test')).toBe('CLOSED'); // 1 falha

    await withCircuitBreaker('test', fail, 'fb', config);
    expect(getCircuitState('test')).toBe('CLOSED'); // 2 falhas

    await withCircuitBreaker('test', fail, 'fb', config);
    expect(getCircuitState('test')).toBe('OPEN'); // 3 falhas → OPEN
  });

  it('circuito OPEN retorna fallback sem chamar fn', async () => {
    const fail = async () => {
      throw new Error('fail');
    };
    const config = { failureThreshold: 1, resetTimeout: 60_000 };

    await withCircuitBreaker('test', fail, 'fb', config); // abre

    let fnCalled = false;
    const result = await withCircuitBreaker(
      'test',
      async () => {
        fnCalled = true;
        return 'ok';
      },
      'fb',
      config,
    );

    expect(result).toBe('fb');
    expect(fnCalled).toBe(false);
  });

  it('reseta para CLOSED após sucesso em HALF_OPEN', async () => {
    const fail = async () => {
      throw new Error('fail');
    };
    const config = { failureThreshold: 1, resetTimeout: 1 }; // 1ms reset

    await withCircuitBreaker('test', fail, 'fb', config); // OPEN
    expect(getCircuitState('test')).toBe('OPEN');

    await new Promise(r => setTimeout(r, 10)); // esperar cooldown

    const result = await withCircuitBreaker('test', async () => 'recovered', 'fb', config);

    expect(result).toBe('recovered');
    expect(getCircuitState('test')).toBe('CLOSED');
  });

  it('resetCircuit limpa o estado', async () => {
    const fail = async () => {
      throw new Error('fail');
    };
    await withCircuitBreaker('test', fail, 'fb', { failureThreshold: 1 });
    expect(getCircuitState('test')).toBe('OPEN');

    resetCircuit('test');
    expect(getCircuitState('test')).toBe('CLOSED');
  });
});
