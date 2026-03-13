import React, { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import { getNoShowTrend } from '../../services/insights';
import type { NoShowTrend } from '../../services/insights';
import type { Periodo } from '../../services/dashboardAnalyticsService';
import SparklineCard from '../dashboard/SparklineCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
  periodo?: Periodo;
}

const NoShowTrendCard: React.FC<Props> = ({ comunidadeId, periodo = 'MES' as Periodo }) => {
  const [data, setData] = useState<NoShowTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNoShowTrend(comunidadeId, periodo).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, periodo]);

  if (loading) return <DashboardSkeleton cards={1} chart={false} />;
  if (!data?.pontos.length) return null;

  const pontos = data.pontos;
  const ultimo = pontos[pontos.length - 1]?.value ?? 0;
  const penultimo = pontos.length > 1 ? (pontos[pontos.length - 2]?.value ?? 0) : 0;
  const delta = pontos.length > 1 ? ultimo - penultimo : undefined;

  return (
    <SparklineCard
      label="Tendência No-Show"
      value={`${data.mediaGeral.toFixed(1)}%`}
      delta={delta}
      icon={UserX}
      color="#ef4444"
      data={pontos}
    />
  );
};

export default NoShowTrendCard;
