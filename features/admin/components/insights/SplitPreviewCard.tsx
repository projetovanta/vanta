import React, { useEffect, useState } from 'react';
import { PieChart } from 'lucide-react';
import { calculateSplits } from '../../services/insights';
import type { SplitResult } from '../../services/insights';
import BreakdownCard from '../dashboard/BreakdownCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const TIPO_COLORS: Record<string, string> = {
  CASA: '#FFD300',
  SOCIO: '#3b82f6',
  VANTA: '#a855f7',
  GATEWAY: '#6b7280',
  PROMOTER: '#22c55e',
};

const SplitPreviewCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<SplitResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    calculateSplits(eventoId).then(d => {
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
  if (!data) return null;

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  const items = data.splits.map(s => ({
    label: s.nome,
    value: s.valor,
    color: TIPO_COLORS[s.tipo] ?? '#FFD300',
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <PieChart className="w-4 h-4 text-[#FFD300]" />
        <h3 className="text-sm font-semibold text-white">Split Automático</h3>
      </div>

      {/* Waterfall resumo */}
      <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Receita bruta</span>
          <span className="text-white font-medium">{fmt(data.receitaBruta)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Gateway</span>
          <span className="text-red-400">-{fmt(data.custoGateway)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Taxa VANTA</span>
          <span className="text-red-400">-{fmt(data.taxaVanta)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
          <span className="text-white/70 font-medium">Distribuível</span>
          <span className="text-[#FFD300] font-bold">{fmt(data.receitaDistribuivel)}</span>
        </div>
      </div>

      {/* Breakdown visual */}
      <BreakdownCard title="Distribuição" items={items} formatValue={v => fmt(v)} />
    </div>
  );
};

export default SplitPreviewCard;
