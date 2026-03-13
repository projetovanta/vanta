import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, CreditCard, Gem } from 'lucide-react';
import type { MasterAnalytics } from '../../services/analytics/types';
import MetricGrid from '../../components/dashboard/MetricGrid';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import ComparisonCard from '../../components/dashboard/ComparisonCard';
import { ExportButton } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL, fmtBRLCompact } from '../../../../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  analytics: MasterAnalytics | null;
}

// ── Waterfall Line ───────────────────────────────────────────────────────────

const WaterfallLine: React.FC<{
  label: string;
  value: number;
  sign: '+' | '-' | '=';
  color: string;
  isBold?: boolean;
}> = ({ label, value, sign, color, isBold }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs font-bold w-4 text-center shrink-0" style={{ color }}>
        {sign}
      </span>
      <span className={`text-sm truncate ${isBold ? 'text-white font-bold' : 'text-zinc-300'}`}>{label}</span>
    </div>
    <span className={`text-sm shrink-0 ml-2 ${isBold ? 'font-black' : 'font-semibold'}`} style={{ color }}>
      {fmtBRL(value)}
    </span>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const FinanceiroTab: React.FC<Props> = ({ analytics }) => {
  const revenue = analytics?.revenue;

  const breakdownItems = useMemo(() => {
    if (!revenue) return [];
    const total = (revenue.custoGateway || 0) + (analytics?.receitaVanta || 0) + (revenue.splitProdutor || 0);
    if (total === 0) return [];
    return [
      { label: 'Gateway', value: revenue.custoGateway, color: '#ef4444' },
      { label: 'VANTA', value: analytics?.receitaVanta ?? 0, color: '#FFD300' },
      { label: 'Produtores', value: revenue.splitProdutor, color: '#3b82f6' },
    ];
  }, [revenue, analytics?.receitaVanta]);

  const exportData = useMemo(() => {
    if (!analytics || !revenue) return [];
    return [
      {
        'GMV Total': analytics.gmvTotal,
        'Custo Gateway': revenue.custoGateway,
        'Receita Líquida': revenue.receitaLiquida,
        'Split Produtores': revenue.splitProdutor,
        'Receita VANTA': analytics.receitaVanta,
        'Lucro VANTA': analytics.lucroVanta,
      },
    ];
  }, [analytics, revenue]);

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 text-sm">Sem dados</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* KPI Grid */}
      <MetricGrid columns={4}>
        <KpiCard label="GMV" value={analytics.gmvTotal} color="#FFD300" icon={DollarSign} formatValue={fmtBRLCompact} />
        <KpiCard
          label="Receita VANTA"
          value={analytics.receitaVanta}
          color="#10b981"
          icon={TrendingUp}
          formatValue={fmtBRLCompact}
        />
        <KpiCard
          label="Custo Gateway"
          value={analytics.custoGatewayGlobal}
          color="#ef4444"
          icon={CreditCard}
          formatValue={fmtBRLCompact}
        />
        <KpiCard
          label="Lucro VANTA"
          value={analytics.lucroVanta}
          color="#8b5cf6"
          icon={Gem}
          formatValue={fmtBRLCompact}
        />
      </MetricGrid>

      {/* P&L Waterfall */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
        <h3 className="text-white text-sm font-bold mb-3">P&L VANTA</h3>
        <div className="flex flex-col">
          <WaterfallLine label="GMV Total" value={analytics.gmvTotal} sign="+" color="#FFD300" />
          <WaterfallLine label="Gateway Costs" value={revenue?.custoGateway ?? 0} sign="-" color="#ef4444" />
          <WaterfallLine label="Receita Líquida" value={revenue?.receitaLiquida ?? 0} sign="=" color="#10b981" isBold />
          <WaterfallLine label="Splits para Produtores" value={revenue?.splitProdutor ?? 0} sign="-" color="#3b82f6" />
          <WaterfallLine label="Receita VANTA" value={analytics.receitaVanta} sign="=" color="#FFD300" isBold />
        </div>
      </div>

      {/* Revenue breakdown */}
      {breakdownItems.length > 0 && (
        <BreakdownCard title="Distribuição de Receita" items={breakdownItems} formatValue={fmtBRL} />
      )}

      {/* Comparison */}
      <ComparisonCard
        title="GMV vs Receita VANTA"
        labelA="GMV"
        labelB="Receita VANTA"
        valueA={analytics.gmvTotal}
        valueB={analytics.receitaVanta}
        formatValue={fmtBRLCompact}
      />

      {/* Export */}
      {exportData.length > 0 && (
        <ExportButton data={exportData} filename={`master-financeiro-${analytics.periodo}`} label="Exportar P&L" />
      )}
    </div>
  );
};
