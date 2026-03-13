import React, { useRef, useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import VipScoreCard from '../../components/insights/VipScoreCard';
import ChurnRadarCard from '../../components/insights/ChurnRadarCard';
import TrendAlertCard from '../../components/insights/TrendAlertCard';
import NoShowCard from '../../components/insights/NoShowCard';
import NoShowTrendCard from '../../components/insights/NoShowTrendCard';
import LotacaoPrevisaoCard from '../../components/insights/LotacaoPrevisaoCard';
import InsightsEmptyState from '../../components/insights/InsightsEmptyState';
import type { Periodo } from '../../services/dashboardAnalyticsService';

interface Props {
  comunidadeId: string;
  eventoId?: string;
  periodo?: Periodo;
}

const InsightsTab: React.FC<Props> = ({ comunidadeId, eventoId, periodo = 'MES' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current && ref.current.childElementCount === 0) {
        setEmpty(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [comunidadeId, eventoId, periodo]);

  return (
    <>
      <div ref={ref} className="space-y-6">
        <TrendAlertCard comunidadeId={comunidadeId} />
        <VipScoreCard comunidadeId={comunidadeId} />
        <ChurnRadarCard comunidadeId={comunidadeId} />
        {eventoId && <NoShowCard eventoId={eventoId} />}
        <NoShowTrendCard comunidadeId={comunidadeId} periodo={periodo} />
        {eventoId && <LotacaoPrevisaoCard eventoId={eventoId} />}
      </div>
      {empty && (
        <InsightsEmptyState
          icon={TrendingUp}
          message="Crie eventos e venda ingressos para ver tendências, análises de no-show e previsões de lotação."
        />
      )}
    </>
  );
};

export default InsightsTab;
