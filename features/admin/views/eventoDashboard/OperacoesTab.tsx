import React from 'react';
import { UserCheck, DollarSign, Gift, ListChecks, Users, ClipboardList } from 'lucide-react';
import type { EventAnalytics } from '../../services/analytics/types';
import { LeaderboardCard, BreakdownCard, MetricGrid, ProgressRing } from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';
import type { EventoAdmin } from '../../../../types';

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
}

const BREAKDOWN_COLORS = ['#FFD300', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899'];

export const OperacoesTab: React.FC<Props> = ({ evento: _evento, analytics }) => {
  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
        <ClipboardList size={32} className="mb-3 opacity-40" />
        <p className="text-sm">Sem dados operacionais disponíveis</p>
      </div>
    );
  }

  const { operations, staff } = analytics;

  const cortesiaPct =
    operations.cortesiasEnviadas > 0
      ? Math.round((operations.cortesiasUsadas / operations.cortesiasEnviadas) * 100)
      : 0;

  // Staff leaderboard: sort by checkins + vendas desc
  const staffSorted = [...staff].sort((a, b) => b.checkins + b.vendasCaixa - (a.checkins + a.vendasCaixa));

  const staffItems = staffSorted.map(s => ({
    id: s.membroId,
    name: s.membroNome,
    value: s.checkins,
    subtitle: `${s.papel} · ${s.vendasCaixa} vendas caixa`,
  }));

  // Caixa members breakdown
  const caixaMembers = staff.filter(s => s.vendasCaixa > 0);
  const caixaBreakdown = caixaMembers.map((s, idx) => ({
    label: s.membroNome,
    value: s.valorVendasCaixa,
    color: BREAKDOWN_COLORS[idx % BREAKDOWN_COLORS.length],
  }));

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <MetricGrid columns={3}>
        <KpiCard
          label="Check-in Rate"
          value={operations.checkinRate}
          color="#10b981"
          icon={UserCheck}
          formatValue={v => `${Math.round(v * 100)}%`}
        />
        <KpiCard
          label="Vendas Caixa"
          value={operations.vendasCaixaValor}
          color="#f59e0b"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard label="Cortesias" value={operations.cortesiasEnviadas} color="#a855f7" icon={Gift} />
      </MetricGrid>

      {/* Staff leaderboard */}
      <LeaderboardCard title="Performance da Equipe" items={staffItems} formatValue={v => `${v} check-ins`} />

      {/* Operations summary */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Resumo Operacional</h3>

        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <ListChecks size={12} />
                Listas ativas
              </span>
              <span className="text-xs font-bold text-white">{operations.listasAtivas}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Users size={12} />
                Nomes nas listas
              </span>
              <span className="text-xs font-bold text-white">{operations.nomesNasListas}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Cortesias usadas</span>
              <span className="text-xs font-bold text-white">
                {operations.cortesiasUsadas}/{operations.cortesiasEnviadas}
              </span>
            </div>
          </div>

          <ProgressRing value={cortesiaPct} label="Cortesias usadas" size={72} color="#a855f7" />
        </div>
      </div>

      {/* Vendas caixa breakdown */}
      {caixaBreakdown.length > 0 && (
        <BreakdownCard title="Vendas por Caixa" items={caixaBreakdown} formatValue={fmtBRL} />
      )}
    </div>
  );
};

export default OperacoesTab;
