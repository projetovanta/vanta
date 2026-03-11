import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { getBreakEvenProjection } from '../../services/insights';
import type { BreakEvenResult } from '../../services/insights';
import ProgressRing from '../dashboard/ProgressRing';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const BreakEvenCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<BreakEvenResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getBreakEvenProjection(eventoId).then(d => {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Target className="w-4 h-4 text-[#FFD300]" />
        <h3 className="text-sm font-semibold text-white">Break-Even</h3>
      </div>

      <div className="bg-zinc-900/40 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="shrink-0">
            <ProgressRing
              value={data.percentProgresso}
              label={`${Math.round(data.percentProgresso)}%`}
              size={80}
              color={data.atingido ? '#22c55e' : '#FFD300'}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            {data.atingido ? (
              <p className="text-sm font-medium text-emerald-400">Break-even atingido!</p>
            ) : (
              <p className="text-sm font-medium text-[#FFD300]">Faltam {data.ingressosFaltam} ingressos</p>
            )}
            <p className="text-xs text-white/50">
              {data.ingressosVendidos} vendidos de {data.ingressosBreakEven} necessários
            </p>
          </div>
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
          <div>
            <p className="text-xs text-white/40">Custo total</p>
            <p className="text-sm text-white">{fmt(data.custoTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Receita atual</p>
            <p className="text-sm text-white">{fmt(data.receitaAtual)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Ticket médio</p>
            <p className="text-sm text-white">{fmt(data.ticketMedio)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Progresso</p>
            <p className="text-sm text-white">{data.percentProgresso}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCard;
