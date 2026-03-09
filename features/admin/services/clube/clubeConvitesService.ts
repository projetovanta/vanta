import { supabase } from '../../../../services/supabaseClient';

export interface ConviteMaisVanta {
  id: string;
  token: string;
  tipo: 'MEMBRO' | 'PARCEIRO';
  tier?: string;
  cidade_id?: string;
  parceiro_nome?: string;
  criado_por: string;
  aceito_por?: string;
  aceito_em?: string;
  expira_em: string;
  status: 'PENDENTE' | 'ACEITO' | 'EXPIRADO' | 'CANCELADO';
  criado_em: string;
  // joins
  criador_nome?: string;
  aceito_nome?: string;
  cidade_nome?: string;
}

export const clubeConvitesService = {
  async listar(): Promise<ConviteMaisVanta[]> {
    const { data, error } = await supabase
      .from('convites_mais_vanta')
      .select(
        `
        *,
        criador:profiles!convites_mais_vanta_criado_por_fkey(nome),
        aceito:profiles!convites_mais_vanta_aceito_por_fkey(nome),
        cidade:cidades_mais_vanta!convites_mais_vanta_cidade_id_fkey(nome)
      `,
      )
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((r: Record<string, unknown>) => ({
      ...(r as unknown as ConviteMaisVanta),
      criador_nome: (r.criador as Record<string, unknown>)?.nome as string | undefined,
      aceito_nome: (r.aceito as Record<string, unknown>)?.nome as string | undefined,
      cidade_nome: (r.cidade as Record<string, unknown>)?.nome as string | undefined,
    }));
  },

  async criar(params: {
    tipo: 'MEMBRO' | 'PARCEIRO';
    tier?: string;
    cidade_id?: string;
    parceiro_nome?: string;
    criado_por: string;
  }): Promise<ConviteMaisVanta> {
    const expira_em =
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
        .replace(' ', 'T') + '-03:00';

    const { data, error } = await supabase
      .from('convites_mais_vanta')
      .insert({
        tipo: params.tipo,
        tier: params.tier ?? null,
        cidade_id: params.cidade_id ?? null,
        parceiro_nome: params.parceiro_nome ?? null,
        criado_por: params.criado_por,
        expira_em,
        criado_em: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ConviteMaisVanta;
  },

  async cancelar(id: string): Promise<void> {
    const { error } = await supabase
      .from('convites_mais_vanta')
      .update({ status: 'CANCELADO' })
      .eq('id', id)
      .eq('status', 'PENDENTE');

    if (error) throw error;
  },

  async aceitarPorToken(token: string): Promise<{ tipo: string; tier?: string }> {
    const { data, error } = await supabase.rpc('aceitar_convite_mv', { p_token: token });
    if (error) throw error;
    return data as { tipo: string; tier?: string };
  },

  async buscarPorToken(token: string): Promise<ConviteMaisVanta | null> {
    const { data, error } = await supabase.from('convites_mais_vanta').select('*').eq('token', token).maybeSingle();

    if (error) return null;
    return data as unknown as ConviteMaisVanta;
  },

  getLinkConvite(token: string): string {
    return `${window.location.origin}/convite-mv/${token}`;
  },
};
