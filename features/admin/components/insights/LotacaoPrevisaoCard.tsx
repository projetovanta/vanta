import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { getLotacaoPrevisao } from '../../services/insights';
import type { HourlyPrediction } from '../../services/insights';
import TimeSeriesChart from '../dashboard/TimeSeriesChart';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const LotacaoPrevisaoCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<HourlyPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLotacaoPrevisao(eventoId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  if (loading) return <DashboardSkeleton cards={1} chart />;
  if (!data.length) return null;

  // Converter para TimeSeriesPoint para usar TimeSeriesChart
  const chartData = data.map(d => ({
    date: `${d.hora}h`,
    value: d.estimado,
    label: `${d.hora}h`,
  }));

  const pico = data.reduce((max, d) => (d.estimado > max.estimado ? d : max), data[0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Previsão de Lotação</h3>
        </div>
        <span className="text-xs text-white/50">
          Pico: {pico.hora}h (~{pico.estimado} pessoas)
        </span>
      </div>

      <TimeSeriesChart title="" data={chartData} color="#22c55e" fill formatValue={v => `~${v} pessoas`} height={160} />

      {/* Faixa de confiança */}
      <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
        <p className="text-xs text-white/50 mb-2">Confiança da previsão</p>
        <div className="flex items-center gap-3">
          {data.slice(0, 6).map(d => (
            <div key={d.hora} className="text-center flex-1 min-w-0">
              <p className="text-xs text-white/70">{d.hora}h</p>
              <p className="text-xs text-white/40">
                {d.min}-{d.max}
              </p>
              <div
                className="mx-auto mt-1 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: d.confianca >= 0.7 ? '#22c55e' : d.confianca >= 0.4 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotacaoPrevisaoCard;
