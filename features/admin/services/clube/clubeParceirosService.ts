/**
 * clubeParceirosService — CRUD de parceiros MAIS VANTA (venues externos).
 * Master cadastra; parceiro acessa painel limitado.
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import type { ParceiroMaisVanta, PlanoParceiro, TipoParceiro } from '../../../../types';

function rowToParceiro(r: Record<string, unknown>): ParceiroMaisVanta {
  return {
    id: r.id as string,
    nome: r.nome as string,
    tipo: r.tipo as TipoParceiro,
    descricao: (r.descricao as string) ?? undefined,
    fotoUrl: (r.foto_url as string) ?? undefined,
    endereco: (r.endereco as string) ?? undefined,
    cidadeId: r.cidade_id as string,
    instagramHandle: (r.instagram_handle as string) ?? undefined,
    contatoNome: (r.contato_nome as string) ?? undefined,
    contatoTelefone: (r.contato_telefone as string) ?? undefined,
    contatoEmail: (r.contato_email as string) ?? undefined,
    plano: (r.plano as PlanoParceiro) ?? 'STARTER',
    planoInicio: (r.plano_inicio as string) ?? undefined,
    planoFim: (r.plano_fim as string) ?? undefined,
    resgatesMesLimite: (r.resgates_mes_limite as number) ?? 5,
    resgatesMesUsados: (r.resgates_mes_usados as number) ?? 0,
    trialAtivo: (r.trial_ativo as boolean) ?? false,
    userId: (r.user_id as string) ?? undefined,
    ativo: r.ativo as boolean,
    criadoEm: r.criado_em as string,
    criadoPor: r.criado_por as string,
  };
}

export const clubeParceirosService = {
  async listar(): Promise<ParceiroMaisVanta[]> {
    const { data } = await supabase.from('parceiros_mais_vanta').select('*').order('nome');
    return (data ?? []).map(r => rowToParceiro(r as Record<string, unknown>));
  },

  async listarPorCidade(cidadeId: string): Promise<ParceiroMaisVanta[]> {
    const { data } = await supabase
      .from('parceiros_mais_vanta')
      .select('*')
      .eq('cidade_id', cidadeId)
      .eq('ativo', true)
      .order('nome');
    return (data ?? []).map(r => rowToParceiro(r as Record<string, unknown>));
  },

  async buscarPorId(id: string): Promise<ParceiroMaisVanta | null> {
    const { data } = await supabase.from('parceiros_mais_vanta').select('*').eq('id', id).single();
    return data ? rowToParceiro(data as Record<string, unknown>) : null;
  },

  async criar(input: {
    nome: string;
    tipo: TipoParceiro;
    descricao?: string;
    fotoUrl?: string;
    endereco?: string;
    cidadeId: string;
    instagramHandle?: string;
    contatoNome?: string;
    contatoTelefone?: string;
    contatoEmail?: string;
    criadoPor: string;
  }): Promise<ParceiroMaisVanta | null> {
    const { data } = await supabase
      .from('parceiros_mais_vanta')
      .insert({
        nome: input.nome,
        tipo: input.tipo,
        descricao: input.descricao ?? null,
        foto_url: input.fotoUrl ?? null,
        endereco: input.endereco ?? null,
        cidade_id: input.cidadeId,
        instagram_handle: input.instagramHandle ?? null,
        contato_nome: input.contatoNome ?? null,
        contato_telefone: input.contatoTelefone ?? null,
        contato_email: input.contatoEmail ?? null,
        criado_em: tsBR(),
        criado_por: input.criadoPor,
      })
      .select()
      .single();
    return data ? rowToParceiro(data as Record<string, unknown>) : null;
  },

  async atualizar(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const map: Record<string, string> = {
      nome: 'nome',
      tipo: 'tipo',
      descricao: 'descricao',
      fotoUrl: 'foto_url',
      endereco: 'endereco',
      cidadeId: 'cidade_id',
      instagramHandle: 'instagram_handle',
      contatoNome: 'contato_nome',
      contatoTelefone: 'contato_telefone',
      contatoEmail: 'contato_email',
      plano: 'plano',
      planoInicio: 'plano_inicio',
      planoFim: 'plano_fim',
      resgatesMesLimite: 'resgates_mes_limite',
      trialAtivo: 'trial_ativo',
      userId: 'user_id',
      ativo: 'ativo',
    };
    const payload: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      const col = map[key];
      if (col) payload[col] = val;
    }
    if (Object.keys(payload).length === 0) return true;
    const { error } = await supabase.from('parceiros_mais_vanta').update(payload).eq('id', id);
    return !error;
  },

  async resetarResgatesMensais(): Promise<void> {
    await supabase.from('parceiros_mais_vanta').update({ resgates_mes_usados: 0 }).gt('resgates_mes_usados', 0);
  },
};
