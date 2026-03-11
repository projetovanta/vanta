import React from 'react';
import { UserCheck, Percent, UserX, Store, Gift, Send } from 'lucide-react';
import type { EventAnalytics } from '../../services/analytics/types';
import { BreakdownCard, TimeSeriesChart, HeatmapCard, MetricGrid, ComparisonCard } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import type { EventoAdmin } from '../../../../types';

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
}

const EMPTY = (
  <div className="flex items-center justify-center py-12">
    <p className="text-zinc-500 text-xs">Carregando analytics...</p>
  </div>
);

export const PublicoTab: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return EMPTY;

  const { audience, operations, tickets } = analytics;

  const novosRecorrentesItems = [
    { label: 'Novos', value: audience.novos, color: '#22d3ee' },
    { label: 'Recorrentes', value: audience.recorrentes, color: '#a78bfa' },
  ];

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <MetricGrid columns={3}>
        <KpiCard label="Check-ins" value={audience.totalCheckins} color="#22d3ee" icon={UserCheck} />
        <KpiCard
          label="Taxa Check-in"
          value={audience.taxaCheckin}
          color="#34d399"
          icon={Percent}
          formatValue={v => `${v.toFixed(1)}%`}
        />
        <KpiCard label="Ausentes" value={audience.totalAusentes} color="#ef4444" icon={UserX} />
      </MetricGrid>

      {/* Check-in vs Vendidos */}
      <ComparisonCard
        title="Check-in vs Vendidos"
        labelA="Vendidos"
        labelB="Check-ins"
        valueA={tickets.totalVendidos}
        valueB={audience.totalCheckins}
      />

      {/* Check-ins por hora */}
      <TimeSeriesChart title="Check-ins por hora" data={audience.checkinsPorHora} color="#22d3ee" fill />

      {/* Heatmap check-ins */}
      <HeatmapCard title="Heatmap de check-ins" data={audience.heatmapCheckins} colorScale={['#18181b', '#22d3ee']} />

      {/* Novos vs Recorrentes */}
      <BreakdownCard title="Novos vs Recorrentes" items={novosRecorrentesItems} />

      {/* Operacional */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-3">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Operacional</h3>
        <MetricGrid columns={3}>
          <KpiCard label="Vendas Caixa" value={operations.vendasCaixaTotal} color="#f59e0b" icon={Store} />
          <KpiCard label="Cortesias Enviadas" value={operations.cortesiasEnviadas} color="#a78bfa" icon={Send} />
          <KpiCard label="Cortesias Usadas" value={operations.cortesiasUsadas} color="#34d399" icon={Gift} />
        </MetricGrid>
      </div>
    </div>
  );
};
