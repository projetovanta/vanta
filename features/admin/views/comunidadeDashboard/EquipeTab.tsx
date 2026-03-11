import React, { useMemo } from 'react';
import { Users, UserCheck, BarChart3 } from 'lucide-react';
import type { CommunityAnalytics } from '../../services/analytics/types';
import { LeaderboardCard } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: CommunityAnalytics | null;
}

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY = (
  <div className="flex items-center justify-center py-16">
    <p className="text-zinc-500 text-xs">Sem dados de equipe para o período</p>
  </div>
);

const EMPTY_PROMOTERS = (
  <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5">
    <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400 mb-4">Promoters</h3>
    <div className="flex items-center justify-center py-8">
      <p className="text-zinc-500 text-xs">Nenhum promoter registrado</p>
    </div>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const EquipeTab: React.FC<Props> = ({ analytics }) => {
  // ── Aggregated metrics ─────────────────────────────────────────────────

  const aggregated = useMemo(() => {
    if (!analytics?.topPromoters) {
      return { totalNomes: 0, totalCheckins: 0, conversaoMedia: 0 };
    }

    const promoters = analytics.topPromoters;
    if (promoters.length === 0) {
      return { totalNomes: 0, totalCheckins: 0, conversaoMedia: 0 };
    }

    const totalNomes = promoters.reduce((sum, p) => sum + p.totalNomes, 0);
    const totalCheckins = promoters.reduce((sum, p) => sum + p.totalCheckins, 0);
    const conversaoMedia = totalNomes > 0 ? totalCheckins / totalNomes : 0;

    return { totalNomes, totalCheckins, conversaoMedia };
  }, [analytics?.topPromoters]);

  // ── Leaderboard items ──────────────────────────────────────────────────

  const leaderboardItems = useMemo(() => {
    if (!analytics?.topPromoters) return [];
    return analytics.topPromoters.map(p => ({
      id: p.promoterId,
      name: p.promoterNome,
      foto: p.promoterFoto,
      value: p.totalNomes,
      subtitle: `${p.totalCheckins} check-ins · ${(p.taxaConversao * 100).toFixed(0)}%`,
    }));
  }, [analytics?.topPromoters]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!analytics) return EMPTY;

  const hasPromoters = analytics.topPromoters.length > 0;

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* KPI Grid */}
      {hasPromoters && (
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Total Nomes" value={aggregated.totalNomes} color="#8B5CF6" icon={Users} />
          <KpiCard label="Check-ins" value={aggregated.totalCheckins} color="#10B981" icon={UserCheck} />
          <KpiCard
            label="Conversão"
            value={Math.round(aggregated.conversaoMedia * 100)}
            color="#FFD300"
            icon={BarChart3}
            formatValue={v => `${v}%`}
          />
        </div>
      )}

      {/* Leaderboard */}
      {hasPromoters ? (
        <LeaderboardCard
          title="Ranking de Promoters"
          items={leaderboardItems}
          formatValue={v => `${v} nomes`}
          maxItems={20}
        />
      ) : (
        EMPTY_PROMOTERS
      )}
    </div>
  );
};
