import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getPurchaseTimeRanking } from '../../services/insights/operationsMarketing';
import type { PurchaseTimeAnalysis } from '../../services/insights/operationsTypes';
import type { HeatmapCell } from '../../services/analytics/types';
import HeatmapCard from '../dashboard/HeatmapCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
}

const PurchaseTimeCard: React.FC<Props> = ({ comunidadeId }) => {
  const [data, setData] = useState<PurchaseTimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPurchaseTimeRanking(comunidadeId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  if (loading) return <DashboardSkeleton cards={1} chart={false} />;
  if (!data?.heatmap.length) return null;

  const heatmapData: HeatmapCell[] = data.heatmap.map(c => ({
    dayOfWeek: c.dia,
    hour: c.hora,
    value: c.vendas,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Horário de Compra</h3>
      </div>
      <HeatmapCard title="Vendas por Dia × Hora" data={heatmapData} colorScale={['#1e1b4b', '#FFD300']} />
      {data.topWindows.length > 0 && (
        <div className="rounded-xl bg-zinc-900/40 border border-white/5 p-4 space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Melhores janelas</p>
          {data.topWindows.map((w, i) => (
            <div key={`${w.dia}-${w.hora}`} className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#FFD300] w-5">{i + 1}.</span>
              <span className="text-sm text-white">
                {w.dia} {w.hora}
              </span>
              <span className="text-xs text-zinc-400 ml-auto">{w.vendas} vendas</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseTimeCard;
