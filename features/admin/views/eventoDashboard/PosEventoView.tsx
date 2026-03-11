import React, { useMemo } from 'react';
import { DollarSign, Landmark, CreditCard, Wallet, ArrowDownToLine, PiggyBank } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import type { EventAnalytics } from '../../services/analytics/types';
import { fmtBRL } from '../../../../utils';
import { KpiCard } from '../../components/KpiCards';
import MetricGrid from '../../components/dashboard/MetricGrid';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import TimeSeriesChart from '../../components/dashboard/TimeSeriesChart';
import ProgressRing from '../../components/dashboard/ProgressRing';
import LeaderboardCard from '../../components/dashboard/LeaderboardCard';
import ComparisonCard from '../../components/dashboard/ComparisonCard';
import { ExportButton } from '../../components/dashboard/ExportButton';

// ── Skeleton de loading ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse bg-zinc-800/50 rounded-xl h-24" />
        ))}
      </div>
      {/* Charts */}
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-40" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="flex justify-center">
        <div className="animate-pulse bg-zinc-800/50 rounded-full h-20 w-20" />
      </div>
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-48" />
      <div className="animate-pulse bg-zinc-800/50 rounded-xl h-32" />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildRevenueBreakdownItems(analytics: EventAnalytics) {
  const r = analytics.revenue;
  return [
    { label: 'Receita Bruta', value: r.receitaBruta, color: '#22c55e' },
    { label: 'Gateway', value: r.custoGateway, color: '#ef4444' },
    { label: 'Taxa VANTA', value: r.taxaVanta, color: '#FFD300' },
    { label: 'Receita Líquida', value: r.receitaLiquida, color: '#3b82f6' },
    { label: 'Split Produtor', value: r.splitProdutor, color: '#8b5cf6' },
    { label: 'Split Sócio', value: r.splitSocio, color: '#ec4899' },
  ];
}

function buildPromoterLeaderboard(analytics: EventAnalytics) {
  return analytics.promoters.map(p => ({
    id: p.promoterId,
    name: p.promoterNome,
    foto: p.promoterFoto,
    value: p.totalNomes,
    subtitle: `${p.taxaConversao}% conversão`,
  }));
}

function buildExportData(analytics: EventAnalytics): Record<string, unknown>[] {
  const r = analytics.revenue;
  return [
    { campo: 'Receita Bruta', valor: r.receitaBruta },
    { campo: 'Receita Listas', valor: r.receitaListas },
    { campo: 'Custo Gateway', valor: r.custoGateway },
    { campo: 'Reembolsado', valor: r.totalReembolsado },
    { campo: 'Chargebacks', valor: r.totalChargebacks },
    { campo: 'Receita Líquida', valor: r.receitaLiquida },
    { campo: 'Taxa VANTA', valor: r.taxaVanta },
    { campo: 'Split Produtor', valor: r.splitProdutor },
    { campo: 'Split Sócio', valor: r.splitSocio },
    { campo: 'Saques Processados', valor: r.saquesProcessados },
    { campo: 'Saques Pendentes', valor: r.saquesPendentes },
    { campo: 'Saldo Disponível', valor: r.saldoDisponivel },
    { campo: 'Total Vendidos', valor: analytics.tickets.totalVendidos },
    { campo: 'Total Cortesias', valor: analytics.tickets.totalCortesias },
    { campo: 'Ticket Médio', valor: analytics.tickets.ticketMedio },
    { campo: 'Total Check-ins', valor: analytics.audience.totalCheckins },
    { campo: 'Taxa Check-in', valor: analytics.audience.taxaCheckin },
  ];
}

function calcCheckinRate(analytics: EventAnalytics): number {
  const vendidos = analytics.tickets.totalVendidos;
  if (vendidos === 0) return 0;
  return Math.round((analytics.audience.totalCheckins / vendidos) * 100);
}

function calcCustoTotal(analytics: EventAnalytics): number {
  return analytics.revenue.custoGateway + analytics.revenue.taxaVanta;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
  loading: boolean;
}

// ── Componente ───────────────────────────────────────────────────────────────

export const PosEventoView: React.FC<Props> = ({ evento, analytics, loading }) => {
  const exportData = useMemo(() => {
    if (!analytics) return [];
    return buildExportData(analytics);
  }, [analytics]);

  if (loading || !analytics) {
    return <LoadingSkeleton />;
  }

  const checkinRate = calcCheckinRate(analytics);
  const custoTotal = calcCustoTotal(analytics);

  return (
    <div className="space-y-4">
      {/* ── KPI Grid 2x3 ── */}
      <MetricGrid columns={3}>
        <KpiCard
          label="Receita Bruta"
          value={analytics.revenue.receitaBruta}
          color="#22c55e"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Receita Líquida"
          value={analytics.revenue.receitaLiquida}
          color="#3b82f6"
          icon={Landmark}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Taxa VANTA"
          value={analytics.revenue.taxaVanta}
          color="#FFD300"
          icon={CreditCard}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Gateway"
          value={analytics.revenue.custoGateway}
          color="#ef4444"
          icon={Wallet}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Saques"
          value={analytics.revenue.saquesProcessados}
          color="#8b5cf6"
          icon={ArrowDownToLine}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Saldo"
          value={analytics.revenue.saldoDisponivel}
          color="#ec4899"
          icon={PiggyBank}
          formatValue={fmtBRL}
        />
      </MetricGrid>

      {/* ── Revenue breakdown ── */}
      <BreakdownCard title="Composição da Receita" items={buildRevenueBreakdownItems(analytics)} formatValue={fmtBRL} />

      {/* ── Vendas timeline ── */}
      <TimeSeriesChart title="Histórico de Vendas" data={analytics.vendasTimeSeries} fill formatValue={fmtBRL} />

      {/* ── Audience summary ── */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-4">
        <p className="mb-3 text-[0.6rem] uppercase tracking-widest text-zinc-400">Público</p>
        <div className="flex items-center gap-6">
          <ProgressRing
            value={checkinRate}
            label={`${checkinRate}%`}
            size={72}
            color={checkinRate >= 70 ? '#22c55e' : '#FFD300'}
            thickness={5}
          />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm text-white">
              {analytics.audience.totalCheckins.toLocaleString('pt-BR')}{' '}
              <span className="text-zinc-500">check-ins</span>
            </p>
            <p className="text-xs text-zinc-400">
              {analytics.audience.novos.toLocaleString('pt-BR')} novos ·{' '}
              {analytics.audience.recorrentes.toLocaleString('pt-BR')} recorrentes
            </p>
          </div>
        </div>
      </div>

      {/* ── Promoter ranking ── */}
      {analytics.promoters.length > 0 && (
        <LeaderboardCard
          title="Ranking Promoters"
          items={buildPromoterLeaderboard(analytics)}
          formatValue={v => `${v} nomes`}
          maxItems={10}
        />
      )}

      {/* ── Receita vs Custos ── */}
      <ComparisonCard
        title="Receita vs Custos"
        labelA="Receita Bruta"
        labelB="Custos (Gateway + VANTA)"
        valueA={analytics.revenue.receitaBruta}
        valueB={custoTotal}
        formatValue={fmtBRL}
      />

      {/* ── Exportar dados financeiros ── */}
      <div className="flex justify-end">
        <ExportButton
          data={exportData}
          filename={`financeiro_${evento.nome_evento?.replace(/\s+/g, '_') ?? evento.id}`}
          label="Exportar Financeiro"
        />
      </div>
    </div>
  );
};

export default PosEventoView;
