/**
 * clubeDealsService — CRUD de deals MAIS VANTA.
 * Parceiros criam deals; membros aplicam; master/gerente seleciona.
 */
import { supabase } from '../../../../services/supabaseClient';
import { tsBR } from '../../../../utils';
import type { DealMaisVanta, StatusDeal, TipoDeal, GeneroMembro } from '../../../../types';

function rowToDeal(r: Record<string, unknown>): DealMaisVanta {
  return {
    id: r.id as string,
    parceiroId: r.parceiro_id as string,
    cidadeId: r.cidade_id as string,
    titulo: r.titulo as string,
    descricao: (r.descricao as string) ?? undefined,
    fotoUrl: (r.foto_url as string) ?? undefined,
    tipo: r.tipo as TipoDeal,
    obrigacaoBarter: (r.obrigacao_barter as string) ?? undefined,
    descontoPercentual: (r.desconto_percentual as number) ?? undefined,
    descontoValor: (r.desconto_valor as number) ?? undefined,
    filtroGenero: (r.filtro_genero as GeneroMembro) ?? undefined,
    filtroAlcance: (r.filtro_alcance as string[]) ?? [],
    filtroCategoria: (r.filtro_categoria as string[]) ?? [],
    vagas: (r.vagas as number) ?? 5,
    vagasPreenchidas: (r.vagas_preenchidas as number) ?? 0,
    inicio: r.inicio as string,
    fim: (r.fim as string) ?? undefined,
    status: r.status as StatusDeal,
    criadoEm: r.criado_em as string,
    atualizadoEm: (r.atualizado_em as string) ?? undefined,
    // Joined fields (populated when using select with joins)
    parceiroNome: (r.parceiro_nome as string) ?? undefined,
    parceiroFotoUrl: (r.parceiro_foto_url as string) ?? undefined,
    cidadeNome: (r.cidade_nome as string) ?? undefined,
  };
}

/** Mapper para resultado com join */
function rowWithJoinToDeal(r: Record<string, unknown>): DealMaisVanta {
  const parceiro = r.parceiros_mais_vanta as Record<string, unknown> | null;
  const cidade = r.cidades_mais_vanta as Record<string, unknown> | null;
  const deal = rowToDeal(r);
  if (parceiro) {
    deal.parceiroNome = parceiro.nome as string;
    deal.parceiroFotoUrl = (parceiro.foto_url as string) ?? undefined;
    deal.parceiroTipo = (parceiro.tipo as string) ?? undefined;
  }
  if (cidade) {
    deal.cidadeNome = cidade.nome as string;
  }
  return deal;
}

export const clubeDealsService = {
  async listar(): Promise<DealMaisVanta[]> {
    const { data } = await supabase
      .from('deals_mais_vanta')
      .select('*, parceiros_mais_vanta(nome, foto_url, tipo), cidades_mais_vanta(nome)')
      .order('criado_em', { ascending: false });
    return (data ?? []).map(r => rowWithJoinToDeal(r as Record<string, unknown>));
  },

  async listarPorCidade(cidadeId: string): Promise<DealMaisVanta[]> {
    const { data } = await supabase
      .from('deals_mais_vanta')
      .select('*, parceiros_mais_vanta(nome, foto_url, tipo), cidades_mais_vanta(nome)')
      .eq('cidade_id', cidadeId)
      .eq('status', 'ATIVO')
      .order('criado_em', { ascending: false });
    return (data ?? []).map(r => rowWithJoinToDeal(r as Record<string, unknown>));
  },

  async listarPorParceiro(parceiroId: string): Promise<DealMaisVanta[]> {
    const { data } = await supabase
      .from('deals_mais_vanta')
      .select('*, parceiros_mais_vanta(nome, foto_url, tipo), cidades_mais_vanta(nome)')
      .eq('parceiro_id', parceiroId)
      .order('criado_em', { ascending: false });
    return (data ?? []).map(r => rowWithJoinToDeal(r as Record<string, unknown>));
  },

  async buscarPorId(id: string): Promise<DealMaisVanta | null> {
    const { data } = await supabase
      .from('deals_mais_vanta')
      .select('*, parceiros_mais_vanta(nome, foto_url, tipo), cidades_mais_vanta(nome)')
      .eq('id', id)
      .maybeSingle();
    return data ? rowWithJoinToDeal(data as Record<string, unknown>) : null;
  },

  async criar(input: {
    parceiroId: string;
    cidadeId: string;
    titulo: string;
    descricao?: string;
    fotoUrl?: string;
    tipo: TipoDeal;
    obrigacaoBarter?: string;
    descontoPercentual?: number;
    descontoValor?: number;
    filtroGenero?: GeneroMembro;
    filtroAlcance?: string[];
    filtroCategoria?: string[];
    vagas?: number;
    inicio?: string;
    fim?: string;
  }): Promise<DealMaisVanta | null> {
    const now = tsBR();
    const { data } = await supabase
      .from('deals_mais_vanta')
      .insert({
        parceiro_id: input.parceiroId,
        cidade_id: input.cidadeId,
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        foto_url: input.fotoUrl ?? null,
        tipo: input.tipo,
        obrigacao_barter: input.obrigacaoBarter ?? null,
        desconto_percentual: input.descontoPercentual ?? null,
        desconto_valor: input.descontoValor ?? null,
        filtro_genero: input.filtroGenero ?? null,
        filtro_alcance: input.filtroAlcance ?? [],
        filtro_categoria: input.filtroCategoria ?? [],
        vagas: input.vagas ?? 5,
        inicio: input.inicio ?? now,
        fim: input.fim ?? null,
        status: 'ATIVO',
        criado_em: now,
        atualizado_em: now,
      })
      .select()
      .single();
    return data ? rowToDeal(data as Record<string, unknown>) : null;
  },

  async atualizarStatus(id: string, status: StatusDeal): Promise<boolean> {
    const { error } = await supabase.from('deals_mais_vanta').update({ status, atualizado_em: tsBR() }).eq('id', id);
    return !error;
  },

  async atualizar(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const map: Record<string, string> = {
      titulo: 'titulo',
      descricao: 'descricao',
      fotoUrl: 'foto_url',
      tipo: 'tipo',
      obrigacaoBarter: 'obrigacao_barter',
      descontoPercentual: 'desconto_percentual',
      descontoValor: 'desconto_valor',
      filtroGenero: 'filtro_genero',
      filtroAlcance: 'filtro_alcance',
      filtroCategoria: 'filtro_categoria',
      vagas: 'vagas',
      inicio: 'inicio',
      fim: 'fim',
      status: 'status',
    };
    const payload: Record<string, unknown> = { atualizado_em: tsBR() };
    for (const [key, val] of Object.entries(updates)) {
      const col = map[key];
      if (col) payload[col] = val;
    }
    const { error } = await supabase.from('deals_mais_vanta').update(payload).eq('id', id);
    return !error;
  },
};
