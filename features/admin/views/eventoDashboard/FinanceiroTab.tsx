import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import type { EventAnalytics } from '../../services/analytics/types';
import { BreakdownCard, MetricGrid, ExportButton } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';
import type { EventoAdmin } from '../../../../types';

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
}

interface PLLine {
  label: string;
  value: number;
  type: 'revenue' | 'cost' | 'vanta' | 'subtotal' | 'neutral';
}

const TYPE_COLORS: Record<PLLine['type'], string> = {
  revenue: 'text-emerald-400',
  cost: 'text-red-400',
  vanta: 'text-[#FFD300]',
  subtotal: 'text-white',
  neutral: 'text-zinc-400',
};

const TYPE_PREFIX: Record<PLLine['type'], string> = {
  revenue: '(+)',
  cost: '(-)',
  vanta: '(-)',
  subtotal: '(=)',
  neutral: '',
};

const EMPTY = (
  <div className="flex items-center justify-center py-12">
    <p className="text-zinc-500 text-xs">Carregando analytics...</p>
  </div>
);

export const FinanceiroTab: React.FC<Props> = ({ analytics }) => {
  const plLines = useMemo((): PLLine[] => {
    if (!analytics) return [];
    const r = analytics.revenue;
    const paraDistribuir = r.receitaLiquida - r.taxaVanta;

    return [
      { label: 'Receita Bruta (vendas + listas)', value: r.receitaBruta + r.receitaListas, type: 'revenue' },
      { label: 'Custo Gateway', value: r.custoGateway, type: 'cost' },
      { label: 'Reembolsos', value: r.totalReembolsado, type: 'cost' },
      { label: 'Chargebacks', value: r.totalChargebacks, type: 'cost' },
      { label: 'Receita Liquida', value: r.receitaLiquida, type: 'subtotal' },
      { label: 'Taxa VANTA', value: r.taxaVanta, type: 'vanta' },
      { label: 'Para Distribuir', value: paraDistribuir, type: 'subtotal' },
      { label: 'Split Produtor', value: r.splitProdutor, type: 'neutral' },
      { label: 'Split Socio', value: r.splitSocio, type: 'neutral' },
      { label: 'Saques Processados', value: r.saquesProcessados, type: 'neutral' },
      { label: 'Saques Pendentes', value: r.saquesPendentes, type: 'neutral' },
      { label: 'Saldo Disponivel', value: r.saldoDisponivel, type: 'subtotal' },
    ];
  }, [analytics]);

  const splitItems = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Produtor', value: analytics.revenue.splitProdutor, color: '#22d3ee' },
      { label: 'Socio', value: analytics.revenue.splitSocio, color: '#a78bfa' },
    ];
  }, [analytics]);

  const exportData = useMemo(() => {
    return plLines.map(l => ({
      item: l.label,
      valor: l.value,
      tipo: l.type,
    }));
  }, [plLines]);

  if (!analytics) return EMPTY;

  const { revenue } = analytics;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <MetricGrid columns={3}>
        <KpiCard
          label="Receita Bruta"
          value={revenue.receitaBruta}
          color="#22d3ee"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Receita Liquida"
          value={revenue.receitaLiquida}
          color="#34d399"
          icon={TrendingUp}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Saldo Disponivel"
          value={revenue.saldoDisponivel}
          color="#FFD300"
          icon={Wallet}
          formatValue={fmtBRL}
        />
      </MetricGrid>

      {/* P&L waterfall */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-1">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400 mb-3">Demonstrativo (P&L)</h3>
        <div className="divide-y divide-white/5">
          {plLines.map(line => {
            const color = TYPE_COLORS[line.type];
            const prefix = TYPE_PREFIX[line.type];
            const isBold = line.type === 'subtotal';
            return (
              <div
                key={line.label}
                className={`flex items-center justify-between py-2 ${isBold ? 'bg-white/[0.02] -mx-2 px-2 rounded' : ''}`}
              >
                <span className={`text-xs ${isBold ? 'font-bold text-white' : 'text-zinc-400'} min-w-0 truncate`}>
                  {prefix && <span className={`${color} mr-1 text-[0.5rem] font-bold`}>{prefix}</span>}
                  {line.label}
                </span>
                <span className={`text-xs font-semibold shrink-0 ml-3 ${color}`}>{fmtBRL(line.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Splits */}
      <BreakdownCard title="Splits" items={splitItems} formatValue={fmtBRL} />

      {/* Saques summary */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-3">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Saques</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Processados</span>
            <span className="text-emerald-400 font-semibold">{fmtBRL(revenue.saquesProcessados)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Pendentes</span>
            <span className="text-amber-400 font-semibold">{fmtBRL(revenue.saquesPendentes)}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold">Disponivel</span>
            <span className="text-[#FFD300] font-bold">{fmtBRL(revenue.saldoDisponivel)}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportButton data={exportData} filename="financeiro-pl" label="Exportar P&L" />
      </div>
    </div>
  );
};
