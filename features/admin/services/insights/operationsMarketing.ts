/**
 * Módulo C — Operations & Marketing
 * 4 features: Atribuição de Canal, Comunicação Compradores, Fidelidade, Horário de Compra
 * Canal e Fidelidade precisarão de migrations futuras (utm_source, fidelidade_cliente).
 * Por ora, calculamos do que já existe.
 */
import { supabase } from '../../../../services/supabaseClient';
import { getCached } from '../../../../services/cache';
import { EVENTOS_ADMIN } from '../eventosAdminCore';
import type {
  ChannelAttribution,
  ChannelItem,
  ChannelSource,
  BuyerContact,
  LoyaltyStatus,
  LoyaltyTier,
  LoyaltyEntry,
  LoyaltyDistribution,
  PurchaseTimeAnalysis,
  PurchaseTimeCell,
  TopWindow,
} from './operationsTypes';

const CHANNEL_LABELS: Record<ChannelSource, string> = {
  INSTAGRAM: 'Instagram',
  FLYER_QR: 'Flyer / QR Code',
  PROMOTER: 'Promoter',
  ORGANICO: 'Orgânico',
  WHATSAPP: 'WhatsApp',
  LINK_DIRETO: 'Link Direto',
};

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ════════════════════════════════════════════════════
// C1: Atribuição de Canal
// Usa campo `origem` como proxy até utm_source existir
// ════════════════════════════════════════════════════

export async function getChannelAttribution(eventoId: string): Promise<ChannelAttribution> {
  return getCached(
    `channel-${eventoId}`,
    async () => {
      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('origem, valor')
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO']);

      const all = tickets ?? [];
      const totalVendas = all.length;

      // Mapear origem → canal (proxy até utm_source existir)
      const mapOrigem = (origem: string): ChannelSource => {
        switch (origem) {
          case 'APP':
            return 'ORGANICO';
          case 'LISTA':
            return 'PROMOTER';
          case 'CORTESIA':
            return 'ORGANICO';
          case 'CAIXA':
            return 'ORGANICO';
          default:
            return 'ORGANICO';
        }
      };

      const byCanal = new Map<ChannelSource, { vendas: number; receita: number }>();
      for (const t of all) {
        const canal = mapOrigem(t.origem);
        const entry = byCanal.get(canal) ?? { vendas: 0, receita: 0 };
        entry.vendas++;
        entry.receita += t.valor;
        byCanal.set(canal, entry);
      }

      const canais: ChannelItem[] = [...byCanal.entries()]
        .map(([canal, v]) => ({
          canal,
          label: CHANNEL_LABELS[canal],
          vendas: v.vendas,
          receita: v.receita,
          percentual: totalVendas > 0 ? (v.vendas / totalVendas) * 100 : 0,
        }))
        .sort((a, b) => b.vendas - a.vendas);

      return { eventoId, totalVendas, canais };
    },
    60_000,
  );
}

// ════════════════════════════════════════════════════
// C2: Comunicação com Compradores
// ════════════════════════════════════════════════════

export async function getEventBuyers(eventoId: string): Promise<BuyerContact[]> {
  return getCached(
    `buyers-${eventoId}`,
    async () => {
      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('owner_id')
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('owner_id', 'is', null);

      if (!tickets?.length) return [];

      // Deduplicate owner_ids
      const uniqueIds = [...new Set(tickets.map(t => t.owner_id!))];

      const { data: profiles } = await supabase.from('profiles').select('id, nome').in('id', uniqueIds);

      return (profiles ?? []).map(p => ({
        userId: p.id,
        nome: p.nome,
      }));
    },
    60_000,
  );
}

// ════════════════════════════════════════════════════
// C3: Programa de Fidelidade
// Calculado on-the-fly dos check-ins existentes
// (quando tabela fidelidade_cliente existir, migrar pra lá)
// ════════════════════════════════════════════════════

function getTier(pontos: number): LoyaltyTier {
  if (pontos >= 10) return 'OURO';
  if (pontos >= 5) return 'PRATA';
  if (pontos >= 3) return 'BRONZE';
  return 'NENHUM';
}

function getNextTier(tier: LoyaltyTier): LoyaltyTier | null {
  switch (tier) {
    case 'NENHUM':
      return 'BRONZE';
    case 'BRONZE':
      return 'PRATA';
    case 'PRATA':
      return 'OURO';
    case 'OURO':
      return null;
  }
}

function getNextThreshold(tier: LoyaltyTier): number {
  switch (tier) {
    case 'NENHUM':
      return 3;
    case 'BRONZE':
      return 5;
    case 'PRATA':
      return 10;
    case 'OURO':
      return 0;
  }
}

export async function getClientLoyalty(userId: string, comunidadeId: string): Promise<LoyaltyStatus> {
  return getCached(
    `loyalty-${userId}-${comunidadeId}`,
    async () => {
      const eventoIds = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId).map(e => e.id);

      let pontos = 0;
      if (eventoIds.length) {
        const { count } = await supabase
          .from('tickets_caixa')
          .select('*', { count: 'exact', head: true })
          .in('evento_id', eventoIds)
          .eq('owner_id', userId)
          .eq('status', 'USADO');
        pontos = count ?? 0;
      }

      const tier = getTier(pontos);
      const proximoTier = getNextTier(tier);
      const threshold = getNextThreshold(tier);
      const pontosParaProximo = Math.max(0, threshold - pontos);

      return { userId, comunidadeId, pontos, tier, proximoTier, pontosParaProximo };
    },
    300_000,
  );
}

export async function getLoyaltyLeaderboard(comunidadeId: string, limit = 20): Promise<LoyaltyEntry[]> {
  return getCached(
    `loyalty-board-${comunidadeId}`,
    async () => {
      const eventoIds = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId).map(e => e.id);

      if (!eventoIds.length) return [];

      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('owner_id')
        .in('evento_id', eventoIds)
        .eq('status', 'USADO')
        .not('owner_id', 'is', null);

      if (!tickets?.length) return [];

      // Contar check-ins por usuário
      const countMap = new Map<string, number>();
      for (const t of tickets) {
        if (!t.owner_id) continue;
        countMap.set(t.owner_id, (countMap.get(t.owner_id) ?? 0) + 1);
      }

      // Ordenar e limitar
      const sorted = [...countMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

      const userIds = sorted.map(([uid]) => uid);
      const { data: profiles } = await supabase.from('profiles').select('id, nome, avatar_url').in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

      return sorted.map(([uid, pontos]): LoyaltyEntry => {
        const p = profileMap.get(uid);
        return {
          userId: uid,
          nome: p?.nome ?? 'Desconhecido',
          foto: p?.avatar_url ?? null,
          pontos,
          tier: getTier(pontos),
        };
      });
    },
    300_000,
  );
}

export async function getLoyaltyDistribution(comunidadeId: string): Promise<LoyaltyDistribution> {
  return getCached(
    `loyalty-dist-${comunidadeId}`,
    async () => {
      const leaderboard = await getLoyaltyLeaderboard(comunidadeId, 500);

      const dist: LoyaltyDistribution = {
        nenhum: 0,
        bronze: 0,
        prata: 0,
        ouro: 0,
        total: leaderboard.length,
      };

      for (const entry of leaderboard) {
        switch (entry.tier) {
          case 'OURO':
            dist.ouro++;
            break;
          case 'PRATA':
            dist.prata++;
            break;
          case 'BRONZE':
            dist.bronze++;
            break;
          default:
            dist.nenhum++;
            break;
        }
      }

      return dist;
    },
    300_000,
  );
}

// ════════════════════════════════════════════════════
// C4: Ranking de Horário de Compra
// ════════════════════════════════════════════════════

export async function getPurchaseTimeRanking(comunidadeId: string): Promise<PurchaseTimeAnalysis> {
  return getCached(
    `purchase-time-${comunidadeId}`,
    async () => {
      const eventoIds = EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId).map(e => e.id);

      if (!eventoIds.length) {
        return { comunidadeId, heatmap: [], topWindows: [], totalVendas: 0 };
      }

      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('criado_em')
        .in('evento_id', eventoIds)
        .in('status', ['DISPONIVEL', 'USADO'])
        .not('origem', 'in', '("CORTESIA","CAIXA")');

      if (!tickets?.length) {
        return { comunidadeId, heatmap: [], topWindows: [], totalVendas: 0 };
      }

      // Heatmap: dia × hora
      const grid = new Map<string, number>();
      for (const t of tickets) {
        const d = new Date(t.criado_em);
        const dia = d.getDay();
        const hora = d.getHours();
        const key = `${dia}-${hora}`;
        grid.set(key, (grid.get(key) ?? 0) + 1);
      }

      const heatmap: PurchaseTimeCell[] = [];
      for (const [key, vendas] of grid) {
        const [dia, hora] = key.split('-').map(Number);
        heatmap.push({ dia, hora, vendas });
      }

      // Top 3 janelas
      const sorted = [...heatmap].sort((a, b) => b.vendas - a.vendas);
      const topWindows: TopWindow[] = sorted.slice(0, 3).map(cell => ({
        dia: DAY_NAMES[cell.dia],
        hora: `${cell.hora}h-${cell.hora + 1}h`,
        vendas: cell.vendas,
      }));

      return {
        comunidadeId,
        heatmap,
        topWindows,
        totalVendas: tickets.length,
      };
    },
    300_000,
  );
}
