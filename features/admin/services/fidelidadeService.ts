/**
 * fidelidadeService — acúmulo e consulta de pontos de fidelidade por usuário/comunidade.
 * Tabela: fidelidade_cliente (user_id, comunidade_id, pontos, tier, ultimo_evento_id)
 * Tiers: NENHUM (0-2pts), BRONZE (3-4pts), PRATA (5-9pts), OURO (10+pts)
 */
import { supabase } from '../../../services/supabaseClient';

type Tier = 'NENHUM' | 'BRONZE' | 'PRATA' | 'OURO';

function calcTier(pontos: number): Tier {
  if (pontos >= 10) return 'OURO';
  if (pontos >= 5) return 'PRATA';
  if (pontos >= 3) return 'BRONZE';
  return 'NENHUM';
}

interface FidelidadeCliente {
  id: string;
  userId: string;
  comunidadeId: string;
  pontos: number;
  tier: Tier;
  ultimoEventoId?: string;
  atualizadoEm: string;
}

function rowToFidelidade(r: Record<string, unknown>): FidelidadeCliente {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    comunidadeId: r.comunidade_id as string,
    pontos: (r.pontos as number) ?? 0,
    tier: (r.tier as Tier) ?? 'NENHUM',
    ultimoEventoId: (r.ultimo_evento_id as string) ?? undefined,
    atualizadoEm: (r.atualizado_em as string) ?? '',
  };
}

export const fidelidadeService = {
  /**
   * Acumula 1 ponto para o usuário na comunidade (idempotente por evento).
   * Chamado após check-in confirmado.
   * Usa upsert: se já existe registro, incrementa pontos e recalcula tier.
   */
  async acumularPonto(userId: string, comunidadeId: string, eventoId: string): Promise<void> {
    // Verificar se já acumulou ponto para este evento (idempotência)
    const { data: existing } = await supabase
      .from('fidelidade_cliente')
      .select('id, pontos, ultimo_evento_id')
      .eq('user_id', userId)
      .eq('comunidade_id', comunidadeId)
      .maybeSingle();

    if (existing) {
      // Já acumulou ponto para este evento
      if ((existing.ultimo_evento_id as string) === eventoId) return;

      const novosPontos = ((existing.pontos as number) ?? 0) + 1;
      const novoTier = calcTier(novosPontos);
      const ts = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

      await supabase
        .from('fidelidade_cliente')
        .update({
          pontos: novosPontos,
          tier: novoTier,
          ultimo_evento_id: eventoId,
          atualizado_em: ts,
        })
        .eq('id', existing.id as string);
    } else {
      // Primeiro evento — criar registro
      const ts = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

      await supabase.from('fidelidade_cliente').insert({
        user_id: userId,
        comunidade_id: comunidadeId,
        pontos: 1,
        tier: 'NENHUM', // 1 ponto = NENHUM (precisa de 3 para BRONZE)
        ultimo_evento_id: eventoId,
        atualizado_em: ts,
      });
    }
  },

  /** Consulta fidelidade do usuário em uma comunidade */
  async getFidelidade(userId: string, comunidadeId: string): Promise<FidelidadeCliente | null> {
    const { data } = await supabase
      .from('fidelidade_cliente')
      .select('*')
      .eq('user_id', userId)
      .eq('comunidade_id', comunidadeId)
      .maybeSingle();

    return data ? rowToFidelidade(data as Record<string, unknown>) : null;
  },

  /** Ranking de clientes fiéis de uma comunidade */
  async getRanking(comunidadeId: string, limit = 20): Promise<FidelidadeCliente[]> {
    const { data } = await supabase
      .from('fidelidade_cliente')
      .select('*')
      .eq('comunidade_id', comunidadeId)
      .order('pontos', { ascending: false })
      .limit(limit);

    return (data ?? []).map(r => rowToFidelidade(r as Record<string, unknown>));
  },

  /** Distribuição de tiers em uma comunidade */
  async getDistribuicao(comunidadeId: string): Promise<Record<Tier, number>> {
    const { data } = await supabase
      .from('fidelidade_cliente')
      .select('tier')
      .eq('comunidade_id', comunidadeId)
      .limit(5000);

    const dist: Record<Tier, number> = { NENHUM: 0, BRONZE: 0, PRATA: 0, OURO: 0 };
    for (const row of data ?? []) {
      const tier = (row.tier as Tier) ?? 'NENHUM';
      dist[tier]++;
    }
    return dist;
  },
};
