import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getPricingSuggestion } from '../../services/insights';
import type { PricingSuggestion } from '../../services/insights';
import TimeSeriesChart from '../dashboard/TimeSeriesChart';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const ACTION_CONFIG = {
  SUBIR: {
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'Subir preço',
  },
  DESCONTAR: {
    icon: TrendingDown,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    label: 'Dar desconto',
  },
  MANTER: {
    icon: Minus,
    color: 'text-white/50',
    bg: 'bg-zinc-800/50',
    border: 'border-white/5',
    label: 'Manter preço',
  },
} as const;

const PricingSuggestionCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<PricingSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPricingSuggestion(eventoId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  if (loading) return <DashboardSkeleton cards={2} chart />;
  if (!data) return null;

  const config = ACTION_CONFIG[data.acao];
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <h3 className="text-sm font-semibold text-white">Pricing Dinâmico</h3>
      </div>

      {/* Sugestão */}
      <div className={`${config.bg} rounded-xl p-3 border ${config.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-white/70 mt-1">{data.mensagem}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Vendido</p>
          <p className="text-lg font-bold text-white">{data.percentVendido}%</p>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Tempo</p>
          <p className="text-lg font-bold text-white">{data.percentTempoPassado}%</p>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Velocidade</p>
          <p className={`text-lg font-bold ${data.velocidadeRelativa >= 1 ? 'text-emerald-400' : 'text-orange-400'}`}>
            {data.velocidadeRelativa}x
          </p>
        </div>
      </div>

      {/* Curva de vendas */}
      {data.curvaReal.length >= 2 && (
        <TimeSeriesChart
          title="Vendas acumuladas vs ideal"
          data={data.curvaReal}
          color="#FFD300"
          fill
          formatValue={v => `${v} vendidos`}
          height={140}
        />
      )}
    </div>
  );
};

export default PricingSuggestionCard;
