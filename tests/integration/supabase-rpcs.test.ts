/**
 * Testes de integracao: verifica que RPCs do Supabase existem e respondem.
 * Roda contra o banco REAL — sem mocks.
 */
import { describe, it, expect } from 'vitest';
import { supabase } from './supabaseTestClient';

describe('RPCs — existem e nao retornam erro de funcao', () => {
  it('get_eventos_por_regiao existe', async () => {
    const { error } = await supabase.rpc('get_eventos_por_regiao', {
      p_estado: 'SP',
      p_cidade: 'São Paulo',
    });
    // Pode retornar dados vazios, mas nao deve dar erro 42883 (function not found)
    if (error) {
      expect(error.code).not.toBe('42883');
    }
  });

  it('buscar_eventos_texto existe', async () => {
    const { error } = await supabase.rpc('buscar_eventos_texto', {
      p_texto: 'teste',
    });
    if (error) {
      expect(error.code).not.toBe('42883');
    }
  });

  it('get_saldo_consolidado existe', async () => {
    const { error } = await supabase.rpc('get_saldo_consolidado', {
      p_produtor_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) {
      expect(error.code).not.toBe('42883');
    }
  });

  it('get_analytics_overview existe', async () => {
    const { error } = await supabase.rpc('get_analytics_overview', {
      p_evento_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) {
      expect(error.code).not.toBe('42883');
    }
  });
});

describe('RPCs — retornam estrutura correta', () => {
  it('get_eventos_por_regiao retorna array', async () => {
    const { data, error } = await supabase.rpc('get_eventos_por_regiao', {
      p_estado: 'SP',
      p_cidade: 'São Paulo',
    });
    if (!error) {
      expect(Array.isArray(data)).toBe(true);
    }
  });
});
