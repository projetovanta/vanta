import React, { useRef, useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import WeeklyReportCard from '../../components/insights/WeeklyReportCard';
import VantaValuePanel from '../../components/insights/VantaValuePanel';
import SmartTipsCard from '../../components/insights/SmartTipsCard';
import BenchmarkCard from '../../components/insights/BenchmarkCard';
import InsightsEmptyState from '../../components/insights/InsightsEmptyState';
import {
  generateWeeklyReport,
  getVantaValueMetrics,
  getSmartTips,
  getBenchmarkComparison,
} from '../../services/insights';
import type { Periodo } from '../../services/dashboardAnalyticsService';

interface Props {
  comunidadeId: string;
  eventoId?: string;
  onAction?: (target: string, eventoId?: string) => void;
  periodo?: Periodo;
}

const ValorTab: React.FC<Props> = ({ comunidadeId, eventoId, onAction, periodo = 'MES' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    setEmpty(false);
    const timer = setTimeout(() => {
      if (ref.current && ref.current.childElementCount === 0) {
        setEmpty(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [comunidadeId, eventoId]);

  return (
    <>
      <div ref={ref} className="space-y-6">
        <VantaValuePanel
          comunidadeId={comunidadeId}
          periodo={periodo}
          getMetrics={(id, periodo) => getVantaValueMetrics(id, periodo as Periodo)}
        />
        <SmartTipsCard
          comunidadeId={comunidadeId}
          eventoId={eventoId}
          getTips={(id, evId) => getSmartTips(id, evId)}
          onAction={onAction}
        />
        <WeeklyReportCard comunidadeId={comunidadeId} getReport={id => generateWeeklyReport(id)} />
        <BenchmarkCard comunidadeId={comunidadeId} getComparison={id => getBenchmarkComparison(id)} />
      </div>
      {empty && (
        <InsightsEmptyState
          icon={Award}
          message="Dados acumulados ao longo do tempo mostrarão o valor que a VANTA gera para sua operação."
        />
      )}
    </>
  );
};

export default ValorTab;
