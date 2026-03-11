import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface BenchmarkItemData {
  label: string;
  valorComunidade: number;
  valorPlataforma: number;
  delta: number;
  melhor: boolean;
}

interface BenchmarkData {
  metricas: BenchmarkItemData[];
}

interface Props {
  comunidadeId: string;
  getComparison: (id: string) => Promise<BenchmarkData | null>;
}

const BenchmarkCard: React.FC<Props> = ({ comunidadeId, getComparison }) => {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getComparison(comunidadeId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, getComparison]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!data?.metricas?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Você vs Mercado</h3>
      </div>

      <div className="space-y-2">
        {data.metricas.map(m => {
          const maxVal = Math.max(m.valorComunidade, m.valorPlataforma, 1);
          const widthCom = (m.valorComunidade / maxVal) * 100;
          const widthPlat = (m.valorPlataforma / maxVal) * 100;

          return (
            <div key={m.label} className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/70">{m.label}</span>
                <span className={`text-xs font-medium ${m.melhor ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.delta > 0 ? '+' : ''}
                  {m.delta.toFixed(1)}%{m.melhor ? ' acima' : ' abaixo'}
                </span>
              </div>

              {/* Barras comparativas */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#FFD300] w-12 shrink-0">Você</span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#FFD300]" style={{ width: `${widthCom}%` }} />
                  </div>
                  <span className="text-xs text-white/50 w-14 text-right shrink-0">{m.valorComunidade.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 w-12 shrink-0">Média</span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-white/20" style={{ width: `${widthPlat}%` }} />
                  </div>
                  <span className="text-xs text-white/30 w-14 text-right shrink-0">{m.valorPlataforma.toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenchmarkCard;
