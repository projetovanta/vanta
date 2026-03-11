import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { getLoyaltyDistribution, getLoyaltyLeaderboard } from '../../services/insights/operationsMarketing';
import type { LoyaltyDistribution, LoyaltyEntry } from '../../services/insights/operationsTypes';
import BreakdownCard from '../dashboard/BreakdownCard';
import LeaderboardCard from '../dashboard/LeaderboardCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
}

const TIER_COLORS: Record<string, string> = {
  ouro: '#FFD300',
  prata: '#C0C0C0',
  bronze: '#CD7F32',
  nenhum: '#71717a',
};

const LoyaltyProgramCard: React.FC<Props> = ({ comunidadeId }) => {
  const [dist, setDist] = useState<LoyaltyDistribution | null>(null);
  const [leaders, setLeaders] = useState<LoyaltyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLoyaltyDistribution(comunidadeId), getLoyaltyLeaderboard(comunidadeId, 10)]).then(([d, l]) => {
      if (!cancelled) {
        setDist(d);
        setLeaders(l);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!dist || dist.total === 0) return null;

  const distItems = [
    { label: 'Ouro', value: dist.ouro, color: TIER_COLORS.ouro },
    { label: 'Prata', value: dist.prata, color: TIER_COLORS.prata },
    { label: 'Bronze', value: dist.bronze, color: TIER_COLORS.bronze },
    { label: 'Sem tier', value: dist.nenhum, color: TIER_COLORS.nenhum },
  ].filter(i => i.value > 0);

  const leaderItems = leaders.map(e => ({
    id: e.userId,
    name: e.nome,
    foto: e.foto ?? undefined,
    value: e.pontos,
    subtitle: e.tier,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Award className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Programa de Fidelidade</h3>
      </div>
      <BreakdownCard title="Distribuição por Tier" items={distItems} formatValue={v => `${v} clientes`} />
      {leaderItems.length > 0 && (
        <LeaderboardCard title="Top Clientes Fiéis" items={leaderItems} formatValue={v => `${v} pts`} maxItems={10} />
      )}
    </div>
  );
};

export default LoyaltyProgramCard;
