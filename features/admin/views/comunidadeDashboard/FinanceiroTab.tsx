import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, CreditCard, Crown, Users, Wallet } from 'lucide-react';
import type { CommunityAnalytics } from '../../services/analytics/types';
import { BreakdownCard, ComparisonCard, ExportButton } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: CommunityAnalytics | null;
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

// ── Empty state ──────────────────────────────────────────────────────────────

const EMPTY = (
  <div className="flex items-center justify-center py-16">
    <p className="text-zinc-500 text-xs">Sem dados financeiros para o período</p>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const FinanceiroTab: React.FC<Props> = ({ analytics }) => {
  // ── P&L waterfall ──────────────────────────────────────────────────────

  const plLines = useMemo((): PLLine[] => {
    if (!analytics) return [];
    const r = analytics.revenue;
    const paraDistribuir = r.receitaLiquida - r.taxaVanta;

    return [
      { label: 'Receita Bruta (vendas + listas)', value: r.receitaBruta + r.receitaListas, type: 'revenue' },
      { label: 'Custo Gateway', value: r.custoGateway, type: 'cost' },
      { label: 'Reembolsos', value: r.totalReembolsado, type: 'cost' },
      { label: 'Chargebacks', value: r.totalChargebacks, type: 'cost' },
      { label: 'Receita Líquida', value: r.receitaLiquida, type: 'subtotal' },
      { label: 'Taxa VANTA', value: r.taxaVanta, type: 'vanta' },
      { label: 'Para distribuir', value: paraDistribuir, type: 'subtotal' },
      { label: 'Split Produtor', value: r.splitProdutor, type: 'neutral' },
      { label: 'Split Sócio', value: r.splitSocio, type: 'neutral' },
      { label: 'Saques processados', value: r.saquesProcessados, type: 'cost' },
      { label: 'Saques pendentes', value: r.saquesPendentes, type: 'neutral' },
      { label: 'Saldo disponível', value: r.saldoDisponivel, type: 'subtotal' },
    ];
  }, [analytics]);

  // ── Breakdown items ────────────────────────────────────────────────────

  const breakdownItems = useMemo(() => {
    if (!analytics) return [];
    const r = analytics.revenue;
    return [
      { label: 'Receita Líquida', value: r.receitaLiquida, color: '#10B981' },
      { label: 'Custo Gateway', value: r.custoGateway, color: '#EF4444' },
      { label: 'Taxa VANTA', value: r.taxaVanta, color: '#FFD300' },
      { label: 'Reembolsos', value: r.totalReembolsado, color: '#F97316' },
    ];
  }, [analytics]);

  // ── Export data ────────────────────────────────────────────────────────

  const exportData = useMemo((): Record<string, unknown>[] => {
    return plLines.map(l => ({
      Item: l.label,
      Valor: l.value,
      Tipo: l.type,
    }));
  }, [plLines]);

  // ── Render ─────────────────────────────────────────────────────────────

  if (!analytics) return EMPTY;

  const { revenue } = analytics;
  const totalCustos = revenue.custoGateway + revenue.totalReembolsado + revenue.totalChargebacks;

  return (
    <div className="p-4 space-y-5 pb-8">
      {/* KPI Grid 2x3 */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Receita Bruta"
          value={revenue.receitaBruta}
          color="#10B981"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Receita Líquida"
          value={revenue.receitaLiquida}
          color="#06B6D4"
          icon={TrendingUp}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Custo Gateway"
          value={revenue.custoGateway}
          color="#EF4444"
          icon={CreditCard}
          formatValue={fmtBRL}
        />
        <KpiCard label="Taxa VANTA" value={revenue.taxaVanta} color="#FFD300" icon={Crown} formatValue={fmtBRL} />
        <KpiCard
          label="Splits"
          value={revenue.splitProdutor + revenue.splitSocio}
          color="#8B5CF6"
          icon={Users}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Saldo Disponível"
          value={revenue.saldoDisponivel}
          color="#F59E0B"
          icon={Wallet}
          formatValue={fmtBRL}
        />
      </div>

      {/* Revenue breakdown */}
      <BreakdownCard title="Breakdown de Receita" items={breakdownItems} formatValue={fmtBRL} />

      {/* Comparison: Receita vs Custos */}
      <ComparisonCard
        title="Receita vs Custos"
        labelA="Receita Líquida"
        labelB="Total Custos"
        valueA={revenue.receitaLiquida}
        valueB={totalCustos}
        formatValue={fmtBRL}
      />

      {/* P&L Waterfall */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-3">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Demonstrativo (P&L)</h3>
        <div className="space-y-1.5">
          {plLines.map((line, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1 ${
                line.type === 'subtotal' ? 'border-t border-white/10 pt-2' : ''
              }`}
            >
              <span className="text-zinc-400 text-xs truncate flex-1 min-w-0">
                <span className={`${TYPE_COLORS[line.type]} mr-1`}>{TYPE_PREFIX[line.type]}</span>
                {line.label}
              </span>
              <span className={`shrink-0 text-xs font-bold ml-2 ${TYPE_COLORS[line.type]}`}>{fmtBRL(line.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <ExportButton
        data={exportData}
        filename={`financeiro-comunidade-${analytics.comunidadeId}`}
        label="Exportar P&L"
      />
    </div>
  );
};
