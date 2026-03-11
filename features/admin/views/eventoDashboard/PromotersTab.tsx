import React, { useMemo } from 'react';
import { Megaphone, Users, TrendingUp } from 'lucide-react';
import type { EventAnalytics } from '../../services/analytics/types';
import { LeaderboardCard, BarChartCard, MetricGrid, ExportButton } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import type { EventoAdmin } from '../../../../types';

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
}

export const PromotersTab: React.FC<Props> = ({ evento, analytics }) => {
  const promoters = analytics?.promoters ?? [];

  const sorted = useMemo(() => [...promoters].sort((a, b) => b.totalNomes - a.totalNomes), [promoters]);

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <Megaphone size={32} className="mb-3 opacity-40" />
        <p className="text-sm">Sem dados de analytics disponíveis</p>
      </div>
    );
  }

  if (promoters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <Megaphone size={32} className="mb-3 opacity-40" />
        <p className="text-sm">Nenhum promoter atribuído a este evento</p>
      </div>
    );
  }

  const totalNomes = sorted.reduce((sum, p) => sum + p.totalNomes, 0);
  const avgConversao = sorted.length > 0 ? sorted.reduce((sum, p) => sum + p.taxaConversao, 0) / sorted.length : 0;

  // Leaderboard items
  const leaderboardItems = sorted.map(p => ({
    id: p.promoterId,
    name: p.promoterNome,
    foto: p.promoterFoto,
    value: p.totalNomes,
    subtitle: `${p.totalCheckins} check-ins · ${(p.taxaConversao * 100).toFixed(0)}% conversão`,
  }));

  // Bar chart data
  const barData = sorted.map(p => ({
    name: p.promoterNome.split(' ')[0],
    value: Math.round(p.taxaConversao * 100),
  }));

  // Export CSV data
  const csvData: Record<string, unknown>[] = sorted.map(p => ({
    nome: p.promoterNome,
    listas: p.listasAtribuidas,
    nomes: p.totalNomes,
    checkins: p.totalCheckins,
    conversao: `${(p.taxaConversao * 100).toFixed(1)}%`,
    comissao: p.comissao,
  }));

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <MetricGrid columns={3}>
        <KpiCard label="Promoters" value={sorted.length} color="#FFD300" icon={Megaphone} />
        <KpiCard label="Total Nomes" value={totalNomes} color="#3b82f6" icon={Users} />
        <KpiCard
          label="Conversão Média"
          value={avgConversao}
          color="#10b981"
          icon={TrendingUp}
          formatValue={v => `${(v * 100).toFixed(0)}%`}
        />
      </MetricGrid>

      {/* Promoter ranking */}
      <LeaderboardCard title="Ranking de Promoters" items={leaderboardItems} formatValue={v => `${v} nomes`} />

      {/* Conversão bar chart */}
      <BarChartCard title="Conversão por Promoter" data={barData} formatValue={v => `${v}%`} />

      {/* Export */}
      <div className="flex justify-end">
        <ExportButton
          data={csvData}
          filename={`promoters_${evento.nome_evento?.replace(/\s+/g, '_') ?? evento.id}`}
          label="Exportar Promoters"
        />
      </div>
    </div>
  );
};

export default PromotersTab;
