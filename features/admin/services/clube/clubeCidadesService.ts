/**
 * clubeCidadesService — CRUD de cidades MAIS VANTA.
 * Master cria cidades; membros solicitam acesso via passport.
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import type { CidadeMaisVanta } from '../../../../types';

function rowToCidade(r: Record<string, unknown>): CidadeMaisVanta {
  return {
    id: r.id as string,
    nome: r.nome as string,
    estado: (r.estado as string) ?? undefined,
    pais: (r.pais as string) ?? 'BR',
    ativo: r.ativo as boolean,
    gerenteId: (r.gerente_id as string) ?? undefined,
    criadoEm: r.criado_em as string,
    criadoPor: r.criado_por as string,
  };
}

export const clubeCidadesService = {
  async listar(): Promise<CidadeMaisVanta[]> {
    const { data } = await supabase.from('cidades_mais_vanta').select('*').order('nome');
    return (data ?? []).map(r => rowToCidade(r as Record<string, unknown>));
  },

  async listarAtivas(): Promise<CidadeMaisVanta[]> {
    const { data } = await supabase.from('cidades_mais_vanta').select('*').eq('ativo', true).order('nome');
    return (data ?? []).map(r => rowToCidade(r as Record<string, unknown>));
  },

  async buscarPorId(id: string): Promise<CidadeMaisVanta | null> {
    const { data } = await supabase.from('cidades_mais_vanta').select('*').eq('id', id).single();
    return data ? rowToCidade(data as Record<string, unknown>) : null;
  },

  async criar(input: {
    nome: string;
    estado?: string;
    pais?: string;
    gerenteId?: string;
    criadoPor: string;
  }): Promise<CidadeMaisVanta | null> {
    const { data } = await supabase
      .from('cidades_mais_vanta')
      .insert({
        nome: input.nome,
        estado: input.estado ?? null,
        pais: input.pais ?? 'BR',
        gerente_id: input.gerenteId ?? null,
        criado_em: tsBR(),
        criado_por: input.criadoPor,
      })
      .select()
      .single();
    return data ? rowToCidade(data as Record<string, unknown>) : null;
  },

  async atualizar(
    id: string,
    updates: {
      nome?: string;
      estado?: string;
      ativo?: boolean;
      gerenteId?: string | null;
    },
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (updates.nome !== undefined) payload.nome = updates.nome;
    if (updates.estado !== undefined) payload.estado = updates.estado;
    if (updates.ativo !== undefined) payload.ativo = updates.ativo;
    if (updates.gerenteId !== undefined) payload.gerente_id = updates.gerenteId;
    const { error } = await supabase.from('cidades_mais_vanta').update(payload).eq('id', id);
    return !error;
  },
};
