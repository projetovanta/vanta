import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Loader2 } from 'lucide-react';
import type { VendasTimelinePoint } from '../admin/services/dashboardAnalyticsService';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Modo = 'valor' | 'quantidade';

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { value: number; payload: VendasTimelinePoint }[];
  modo: Modo;
}> = ({ active, payload, modo }) => {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-zinc-400 text-[0.5625rem] font-bold">{p.data}</p>
      <p className="text-white text-xs font-black">
        {modo === 'valor' ? fmtBRL(p.valor) : `${p.quantidade} ingresso${p.quantidade !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
};

/** Hook simples pra detectar se é desktop (>=1024px) */
function useIsLg() {
  const [isLg, setIsLg] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isLg;
}

interface Props {
  data: VendasTimelinePoint[];
  loading?: boolean;
}

export const VendasTimelineChart: React.FC<Props> = ({ data, loading }) => {
  const [modo, setModo] = useState<Modo>('valor');
  const isLg = useIsLg();
  const chartHeight = isLg ? 200 : 150;

  if (loading) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
        <div className="h-3 w-32 bg-zinc-800 rounded mb-4" />
        <div className="flex items-center justify-center" style={{ height: chartHeight }}>
          <Loader2 size="1.25rem" className="text-[#FFD300] animate-spin" />
        </div>
      </div>
    );
  }

  if (data.length === 0) return null;

  const dataKey = modo === 'valor' ? 'valor' : 'quantidade';

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em]">Vendas ao Longo do Tempo</p>
        <div className="flex gap-1">
          {(['valor', 'quantidade'] as Modo[]).map(m => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`px-2.5 py-1 rounded-full text-[0.5rem] font-black uppercase tracking-wider transition-all ${
                modo === m
                  ? 'bg-[#FFD300] text-black'
                  : 'bg-zinc-900/60 text-zinc-500 border border-white/5 active:bg-white/5'
              }`}
            >
              {m === 'valor' ? 'R$' : 'Qtd'}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD300" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#FFD300" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="data"
            tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={modo === 'valor' ? (v: number) => `${Math.round(v / 1000)}k` : undefined}
          />
          <Tooltip content={<CustomTooltip modo={modo} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#FFD300"
            strokeWidth={2}
            fill="url(#goldGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#FFD300', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
