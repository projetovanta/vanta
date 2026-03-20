/**
 * cargosPlataformaService — CRUD de cargos de plataforma (prédio) via Supabase.
 * Apenas master pode criar/editar/atribuir.
 */

import { supabase } from '../../../services/supabaseClient';

// Permissões válidas de plataforma
export const PERMISSOES_PLATAFORMA = [
  'GERIR_MAIS_VANTA',
  'GERIR_COMUNIDADES',
  'VER_ANALYTICS',
  'GERIR_FINANCEIRO_GLOBAL',
  'GERIR_INDICACOES',
] as const;

export type PermissaoPlataforma = (typeof PERMISSOES_PLATAFORMA)[number];

export const PERMISSAO_LABELS: Record<PermissaoPlataforma, string> = {
  GERIR_MAIS_VANTA: 'Gerenciar MAIS VANTA',
  GERIR_COMUNIDADES: 'Gerenciar Comunidades',
  VER_ANALYTICS: 'Ver Analytics e Relatórios',
  GERIR_FINANCEIRO_GLOBAL: 'Gerenciar Financeiro Global',
  GERIR_INDICACOES: 'Gerenciar Indicações',
};

export interface CargoPlataforma {
  id: string;
  nome: string;
  descricao: string;
  permissoes: PermissaoPlataforma[];
  criadoPor: string;
  criadoEm: string;
  ativo: boolean;
}

export interface AtribuicaoPlataforma {
  id: string;
  userId: string;
  cargoId: string;
  cargoNome: string;
  userNome: string;
  atribuidoPor: string;
  atribuidoEm: string;
  ativo: boolean;
}

export const cargosPlataformaService = {
  /** Lista todos os cargos de plataforma ativos */
  async getCargos(): Promise<CargoPlataforma[]> {
    const { data } = await supabase.from('cargos_plataforma').select('*').eq('ativo', true).order('nome');

    return (data ?? []).map(r => ({
      id: r.id,
      nome: r.nome,
      descricao: r.descricao ?? '',
      permissoes: (r.permissoes ?? []) as PermissaoPlataforma[],
      criadoPor: r.criado_por,
      criadoEm: r.criado_em,
      ativo: r.ativo,
    }));
  },

  /** Cria novo cargo de plataforma */
  async criarCargo(args: {
    nome: string;
    descricao: string;
    permissoes: PermissaoPlataforma[];
    criadoPor: string;
  }): Promise<CargoPlataforma> {
    const { data, error } = await supabase
      .from('cargos_plataforma')
      .insert({
        nome: args.nome,
        descricao: args.descricao,
        permissoes: args.permissoes,
        criado_por: args.criadoPor,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar cargo: ${error.message}`);

    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao ?? '',
      permissoes: (data.permissoes ?? []) as PermissaoPlataforma[],
      criadoPor: data.criado_por,
      criadoEm: data.criado_em,
      ativo: data.ativo,
    };
  },

  /** Atualiza cargo existente */
  async atualizarCargo(
    id: string,
    updates: { nome?: string; descricao?: string; permissoes?: PermissaoPlataforma[] },
  ): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (updates.nome !== undefined) payload.nome = updates.nome;
    if (updates.descricao !== undefined) payload.descricao = updates.descricao;
    if (updates.permissoes !== undefined) payload.permissoes = updates.permissoes;

    const { error } = await supabase.from('cargos_plataforma').update(payload).eq('id', id);

    if (error) throw new Error(`Erro ao atualizar cargo: ${error.message}`);
  },

  /** Desativa cargo (soft delete) */
  async desativarCargo(id: string): Promise<void> {
    const { error } = await supabase.from('cargos_plataforma').update({ ativo: false }).eq('id', id);

    if (error) throw new Error(`Erro ao desativar cargo: ${error.message}`);
  },

  /** Lista atribuições de um cargo */
  async getAtribuicoes(cargoId?: string): Promise<AtribuicaoPlataforma[]> {
    let query = supabase
      .from('atribuicoes_plataforma')
      .select('*, cargos_plataforma(nome), profiles!atribuicoes_plataforma_user_id_fkey(nome)')
      .eq('ativo', true);

    if (cargoId) query = query.eq('cargo_id', cargoId);

    const { data } = await query;

    return (data ?? []).map(r => ({
      id: r.id,
      userId: r.user_id,
      cargoId: r.cargo_id,
      cargoNome: (r as unknown as { cargos_plataforma?: { nome: string } }).cargos_plataforma?.nome ?? '',
      userNome: (r as unknown as { profiles?: { nome: string } }).profiles?.nome ?? '',
      atribuidoPor: r.atribuido_por,
      atribuidoEm: r.atribuido_em,
      ativo: r.ativo,
    }));
  },

  /** Atribui cargo a um usuário */
  async atribuir(args: { userId: string; cargoId: string; atribuidoPor: string }): Promise<void> {
    const { error } = await supabase.from('atribuicoes_plataforma').insert({
      user_id: args.userId,
      cargo_id: args.cargoId,
      atribuido_por: args.atribuidoPor,
    });

    if (error) throw new Error(`Erro ao atribuir cargo: ${error.message}`);
  },

  /** Remove atribuição (soft delete) */
  async revogar(atribuicaoId: string): Promise<void> {
    const { error } = await supabase.from('atribuicoes_plataforma').update({ ativo: false }).eq('id', atribuicaoId);

    if (error) throw new Error(`Erro ao revogar: ${error.message}`);
  },

  /** Busca usuários por nome (para atribuição) */
  async buscarUsuarios(termo: string): Promise<{ id: string; nome: string; email: string }[]> {
    const { data } = await supabase.from('profiles').select('id, nome, email').ilike('nome', `%${termo}%`).limit(10);

    return (data ?? []).map(r => ({
      id: r.id,
      nome: r.nome ?? '',
      email: r.email ?? '',
    }));
  },
};
