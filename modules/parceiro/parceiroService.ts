import { supabase } from '../../services/supabaseClient';

export interface ParceiroDados {
  id: string;
  nome: string;
  tipo: string;
  foto_url?: string;
  cidade_nome?: string;
  plano: string;
  resgates_mes_limite: number;
  resgates_mes_usados: number;
}

export interface DealParceiro {
  id: string;
  titulo: string;
  tipo: string;
  status: string;
  vagas: number;
  vagas_preenchidas: number;
  inicio?: string;
  fim?: string;
}

export interface ResgateParceiro {
  id: string;
  deal_titulo?: string;
  user_nome?: string;
  status: string;
  aplicado_em: string;
  checkin_em?: string;
}

export interface MetricasParceiro {
  totalResgates: number;
  resgatesMes: number;
  membrosUnicos: number;
}

export const parceiroService = {
  async getMeuParceiro(userId: string): Promise<ParceiroDados | null> {
    const { data, error } = await supabase
      .from('parceiros_mais_vanta')
      .select(
        `
        id, nome, tipo, foto_url, plano, resgates_mes_limite, resgates_mes_usados,
        cidade:cidades_mais_vanta!parceiros_mais_vanta_cidade_id_fkey(nome)
      `,
      )
      .eq('user_id', userId)
      .eq('ativo', true)
      .maybeSingle();

    if (error || !data) return null;

    const r = data as Record<string, unknown>;
    return {
      id: r.id as string,
      nome: r.nome as string,
      tipo: r.tipo as string,
      foto_url: r.foto_url as string | undefined,
      cidade_nome: (r.cidade as Record<string, unknown>)?.nome as string | undefined,
      plano: r.plano as string,
      resgates_mes_limite: r.resgates_mes_limite as number,
      resgates_mes_usados: r.resgates_mes_usados as number,
    };
  },

  async getDeals(parceiroId: string): Promise<DealParceiro[]> {
    const { data, error } = await supabase
      .from('deals_mais_vanta')
      .select('id, titulo, tipo, status, vagas, vagas_preenchidas, inicio, fim')
      .eq('parceiro_id', parceiroId)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as DealParceiro[];
  },

  async getResgates(parceiroId: string): Promise<ResgateParceiro[]> {
    const { data, error } = await supabase
      .from('resgates_mais_vanta')
      .select(
        `
        id, status, aplicado_em, checkin_em,
        deal:deals_mais_vanta!resgates_mais_vanta_deal_id_fkey(titulo),
        user:profiles!resgates_mais_vanta_user_id_fkey(nome)
      `,
      )
      .eq('parceiro_id', parceiroId)
      .order('aplicado_em', { ascending: false })
      .limit(100);

    if (error) throw error;

    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      deal_titulo: (r.deal as Record<string, unknown>)?.titulo as string | undefined,
      user_nome: (r.user as Record<string, unknown>)?.nome as string | undefined,
      status: r.status as string,
      aplicado_em: r.aplicado_em as string,
      checkin_em: r.checkin_em as string | undefined,
    }));
  },

  async getMetricas(parceiroId: string): Promise<MetricasParceiro> {
    const { data: resgates } = await supabase
      .from('resgates_mais_vanta')
      .select('id, user_id, aplicado_em')
      .eq('parceiro_id', parceiroId)
      .in('status', ['CHECK_IN', 'PENDENTE_POST', 'CONCLUIDO']);

    const todos = resgates ?? [];
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
    const resgatesMes = todos.filter(r => ((r as Record<string, unknown>).aplicado_em as string) >= inicioMes).length;
    const membrosUnicos = new Set(todos.map(r => (r as Record<string, unknown>).user_id as string)).size;

    return {
      totalResgates: todos.length,
      resgatesMes,
      membrosUnicos,
    };
  },

  async sugerirDeal(params: {
    parceiro_id: string;
    cidade_id: string;
    titulo: string;
    tipo: string;
    obrigacao_barter?: string;
    desconto_percentual?: number;
    vagas: number;
  }): Promise<void> {
    const { error } = await supabase.from('deals_mais_vanta').insert({
      ...params,
      status: 'RASCUNHO',
      vagas_preenchidas: 0,
      criado_em: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
    });

    if (error) throw error;
  },
};
