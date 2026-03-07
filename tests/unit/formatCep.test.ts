import { describe, it, expect } from 'vitest';
import { formatCep } from '../../services/cepService';

describe('formatCep', () => {
  it('formata CEP completo com hifen', () => {
    expect(formatCep('01310100')).toBe('01310-100');
  });

  it('formata CEP parcial sem hifen', () => {
    expect(formatCep('01310')).toBe('01310');
  });

  it('remove caracteres nao numericos', () => {
    expect(formatCep('01.310-100')).toBe('01310-100');
  });

  it('limita a 8 digitos', () => {
    expect(formatCep('013101001234')).toBe('01310-100');
  });

  it('string vazia retorna vazia', () => {
    expect(formatCep('')).toBe('');
  });

  it('apenas letras retorna vazia', () => {
    expect(formatCep('abcde')).toBe('');
  });

  it('6 digitos adiciona hifen', () => {
    expect(formatCep('013101')).toBe('01310-1');
  });
});
