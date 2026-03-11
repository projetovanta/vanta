import React, { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import { getNoShowAnalysis } from '../../services/insights';
import type { NoShowAnalysis } from '../../services/insights';
import BreakdownCard from '../dashboard/BreakdownCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const NoShowCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<NoShowAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getNoShowAnalysis(eventoId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!data || data.totalVendidos === 0) return null;

  const loteItems = data.porLote.map((l, i) => ({
    label: l.loteNome,
    value: l.noShows,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <UserX className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-semibold text-white">No-Show</h3>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Taxa</p>
          <p className="text-lg font-bold text-red-400">{data.taxaNoShow.toFixed(1)}%</p>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Ausentes</p>
          <p className="text-lg font-bold text-white">{data.totalNoShow}</p>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Custo fantasma</p>
          <p className="text-lg font-bold text-[#FFD300]">
            R$ {data.custoFantasma.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Breakdown por lote */}
      {loteItems.length > 0 && (
        <BreakdownCard title="No-Show por Lote" items={loteItems} formatValue={v => `${v} ausentes`} />
      )}

      {/* Top promoters com mais no-show */}
      {data.porPromoter.length > 0 && (
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50 mb-2">No-Show por Promoter</p>
          <div className="space-y-1.5">
            {data.porPromoter
              .sort((a, b) => b.taxa - a.taxa)
              .slice(0, 5)
              .map(p => (
                <div key={p.promoterId} className="flex items-center justify-between">
                  <span className="text-sm text-white truncate flex-1 min-w-0">{p.promoterNome}</span>
                  <span className="text-xs text-red-400 shrink-0 ml-2">
                    {p.noShows}/{p.convidados} ({p.taxa.toFixed(0)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoShowCard;
