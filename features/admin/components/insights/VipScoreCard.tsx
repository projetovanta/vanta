import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { getClientScores } from '../../services/insights';
import type { ClientScore } from '../../services/insights';
import LeaderboardCard from '../dashboard/LeaderboardCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
}

const VipScoreCard: React.FC<Props> = ({ comunidadeId }) => {
  const [scores, setScores] = useState<ClientScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getClientScores(comunidadeId, 20).then(data => {
      if (!cancelled) {
        setScores(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  if (loading) return <DashboardSkeleton cards={3} chart={false} />;
  if (!scores.length) return null;

  const items = scores.map(s => ({
    id: s.userId,
    name: s.nome,
    foto: s.foto ?? undefined,
    value: s.score,
    subtitle: `${s.frequencia} eventos · R$ ${s.gastoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Crown className="w-4 h-4 text-[#FFD300]" />
        <span className="text-xs text-white/50">Score 0-100</span>
      </div>
      <LeaderboardCard title="Top Clientes VIP" items={items} formatValue={v => `${v} pts`} maxItems={20} />
    </div>
  );
};

export default VipScoreCard;
