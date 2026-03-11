import React from 'react';
import WeeklyReportCard from '../../components/insights/WeeklyReportCard';
import VantaValuePanel from '../../components/insights/VantaValuePanel';
import SmartTipsCard from '../../components/insights/SmartTipsCard';
import BenchmarkCard from '../../components/insights/BenchmarkCard';
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
}

const ValorTab: React.FC<Props> = ({ comunidadeId, eventoId, onAction }) => (
  <div className="space-y-6">
    <VantaValuePanel
      comunidadeId={comunidadeId}
      periodo="MES"
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
);

export default ValorTab;
