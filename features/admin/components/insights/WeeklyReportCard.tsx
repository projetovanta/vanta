import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface WeeklyReportData {
  vendas: { total: number; delta: number; receita: number; receitaDelta: number };
  publico: { checkins: number; checkinsDelta: number; taxaNoShow: number };
  topPromoters: { nome: string; vendas: number }[];
  semanaInicio: string;
  semanaFim: string;
}

interface Props {
  comunidadeId: string;
  getReport: (id: string) => Promise<WeeklyReportData | null>;
}

const WeeklyReportCard: React.FC<Props> = ({ comunidadeId, getReport }) => {
  const [data, setData] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getReport(comunidadeId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, getReport]);

  if (loading) return <DashboardSkeleton cards={3} chart={false} />;
  if (!data) return null;

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  const DeltaBadge = ({ value }: { value: number }) => {
    const positive = value >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        <Icon className="w-3 h-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#FFD300]" />
          <h3 className="text-sm font-semibold text-white">Resumo Semanal</h3>
        </div>
        <span className="text-xs text-white/30">
          {data.semanaInicio} — {data.semanaFim}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Vendas</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-white">{data.vendas.total}</p>
            <DeltaBadge value={data.vendas.delta} />
          </div>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Receita</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-[#FFD300]">{fmt(data.vendas.receita)}</p>
            <DeltaBadge value={data.vendas.receitaDelta} />
          </div>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">Check-ins</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-white">{data.publico.checkins}</p>
            <DeltaBadge value={data.publico.checkinsDelta} />
          </div>
        </div>
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50">No-Show</p>
          <p className="text-lg font-bold text-red-400">{data.publico.taxaNoShow.toFixed(1)}%</p>
        </div>
      </div>

      {/* Top promoters */}
      {data.topPromoters.length > 0 && (
        <div className="bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-white/50 mb-2">Top Promoters da Semana</p>
          {data.topPromoters.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-sm text-white truncate flex-1 min-w-0">{p.nome}</span>
              <span className="text-xs text-[#FFD300] shrink-0 ml-2">{p.vendas} vendas</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyReportCard;
