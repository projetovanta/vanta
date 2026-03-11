import React, { useMemo } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, Gift } from 'lucide-react';
import type { EventAnalytics } from '../../services/analytics/types';
import {
  BarChartCard,
  BreakdownCard,
  TimeSeriesChart,
  HeatmapCard,
  MetricGrid,
  ExportButton,
} from '../../components/dashboard';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';
import type { EventoAdmin } from '../../../../types';

interface Props {
  evento: EventoAdmin;
  analytics: EventAnalytics | null;
}

const METODO_COLORS: Record<string, string> = {
  PIX: '#22d3ee',
  CREDITO: '#a78bfa',
  CAIXA: '#f59e0b',
  CORTESIA: '#34d399',
  LISTA: '#fb923c',
};

const EMPTY = (
  <div className="flex items-center justify-center py-12">
    <p className="text-zinc-500 text-xs">Carregando analytics...</p>
  </div>
);

export const VendasTab: React.FC<Props> = ({ analytics }) => {
  const loteBarData = useMemo(() => {
    if (!analytics) return [];
    return analytics.tickets.porLote.map(l => ({
      name: l.loteNome,
      value: l.vendidos,
    }));
  }, [analytics]);

  const metodoItems = useMemo(() => {
    if (!analytics) return [];
    return analytics.tickets.porMetodoPagamento.map(m => ({
      label: m.metodo,
      value: m.quantidade,
      color: METODO_COLORS[m.metodo] ?? '#FFD300',
    }));
  }, [analytics]);

  const exportData = useMemo(() => {
    if (!analytics) return [];
    return analytics.tickets.porVariacao.map(v => ({
      variacao: v.label,
      area: v.area,
      genero: v.genero,
      valor: v.valor,
      vendidos: v.vendidos,
      limite: v.limite,
      receita: v.receita,
    }));
  }, [analytics]);

  if (!analytics) return EMPTY;

  const { tickets, vendasTimeSeries, heatmapVendas } = analytics;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <MetricGrid columns={4}>
        <KpiCard label="Vendidos" value={tickets.totalVendidos} color="#FFD300" icon={ShoppingCart} />
        <KpiCard
          label="Receita"
          value={analytics.revenue.receitaBruta}
          color="#22d3ee"
          icon={DollarSign}
          formatValue={fmtBRL}
        />
        <KpiCard
          label="Ticket Medio"
          value={tickets.ticketMedio}
          color="#a78bfa"
          icon={TrendingUp}
          formatValue={fmtBRL}
        />
        <KpiCard label="Cortesias" value={tickets.totalCortesias} color="#34d399" icon={Gift} />
      </MetricGrid>

      {/* Vendas por lote */}
      <BarChartCard title="Vendas por lote" data={loteBarData} />

      {/* Vendas por variacao */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-3">
        <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">Vendas por variacao</h3>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 text-[0.5rem] uppercase tracking-widest">
                <th className="text-left pb-2 font-medium">Variacao</th>
                <th className="text-left pb-2 font-medium">Area</th>
                <th className="text-right pb-2 font-medium">Valor</th>
                <th className="text-right pb-2 font-medium">Vendas</th>
                <th className="text-right pb-2 font-medium min-w-[4rem]">Ocupacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets.porVariacao.map(v => {
                const pct = v.limite > 0 ? Math.min((v.vendidos / v.limite) * 100, 100) : 0;
                return (
                  <tr key={v.variacaoId} className="text-zinc-300">
                    <td className="py-2 pr-2 truncate max-w-[8rem]">{v.label}</td>
                    <td className="py-2 pr-2">
                      <span className="inline-block bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5 text-[0.5rem] uppercase tracking-wider">
                        {v.area}
                      </span>
                    </td>
                    <td className="py-2 text-right text-white">{fmtBRL(v.valor)}</td>
                    <td className="py-2 text-right">
                      {v.vendidos}/{v.limite > 0 ? v.limite : '--'}
                    </td>
                    <td className="py-2 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22d3ee',
                            }}
                          />
                        </div>
                        <span className="text-zinc-500 text-[0.5rem] w-8 text-right shrink-0">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metodo de pagamento */}
      <BreakdownCard title="Metodo de pagamento" items={metodoItems} />

      {/* Timeline vendas */}
      <TimeSeriesChart title="Timeline de vendas" data={vendasTimeSeries} fill formatValue={v => String(v)} />

      {/* Heatmap vendas */}
      <HeatmapCard title="Heatmap de vendas" data={heatmapVendas} />

      {/* Export */}
      <div className="flex justify-end">
        <ExportButton data={exportData} filename="vendas-variacoes" label="Exportar vendas" />
      </div>
    </div>
  );
};
