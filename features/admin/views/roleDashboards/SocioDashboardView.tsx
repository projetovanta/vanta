import React, { useEffect, useState } from 'react';
import { ArrowLeft, Handshake, Wallet, ArrowDownToLine, Clock } from 'lucide-react';
import { getEventAnalytics } from '../../services/analytics';
import type { EventAnalytics } from '../../services/analytics/types';
import { KpiCard } from '../../components/KpiCards';
import { fmtBRL } from '../../../../utils';

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  eventoId: string;
  onBack: () => void;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-zinc-900/60 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="h-32 bg-zinc-900/60 rounded-2xl animate-pulse" />
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export const SocioDashboardView: React.FC<Props> = ({ eventoId, onBack }) => {
  const [data, setData] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEventAnalytics(eventoId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const revenue = data?.revenue;
  const splitSocio = revenue?.splitSocio ?? 0;
  const saldoDisponivel = revenue?.saldoDisponivel ?? 0;
  const saquesProcessados = revenue?.saquesProcessados ?? 0;
  const saquesPendentes = revenue?.saquesPendentes ?? 0;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center -ml-2 active:bg-white/5 rounded-lg"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-base font-bold truncate">Meu Investimento</h1>
          {data?.eventoNome && <p className="text-zinc-400 text-xs truncate">{data.eventoNome}</p>}
        </div>
        <Handshake size={20} className="text-emerald-400 shrink-0" />
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      ) : !data || !revenue ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <Handshake size={40} className="text-zinc-600" />
          <p className="text-zinc-400 text-sm text-center">Sem dados financeiros.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Meu Split" value={splitSocio} color="#FFD300" icon={Handshake} formatValue={fmtBRL} />
            <KpiCard
              label="Saldo Disponivel"
              value={saldoDisponivel}
              color="#10B981"
              icon={Wallet}
              formatValue={fmtBRL}
            />
            <KpiCard
              label="Saques Processados"
              value={saquesProcessados}
              color="#8B5CF6"
              icon={ArrowDownToLine}
              formatValue={fmtBRL}
            />
            <KpiCard
              label="Saques Pendentes"
              value={saquesPendentes}
              color="#F59E0B"
              icon={Clock}
              formatValue={fmtBRL}
            />
          </div>

          {/* Revenue summary */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider">Resumo Financeiro</p>
            <div className="space-y-2">
              <SummaryRow label="Receita Bruta" value={revenue.receitaBruta} />
              <SummaryRow label="(-) Gateway" value={revenue.custoGateway} negative />
              <SummaryRow label="(-) Reembolsos" value={revenue.totalReembolsado} negative />
              <SummaryRow label="(-) Chargebacks" value={revenue.totalChargebacks} negative />
              <div className="border-t border-white/5 pt-2">
                <SummaryRow label="Receita Liquida" value={revenue.receitaLiquida} highlight />
              </div>
              <SummaryRow label="Taxa VANTA" value={revenue.taxaVanta} negative />
              <SummaryRow label="Split Produtor" value={revenue.splitProdutor} />
              <div className="border-t border-amber-400/20 pt-2">
                <SummaryRow label="Seu Split" value={revenue.splitSocio} highlight gold />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Summary Row ──────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{
  label: string;
  value: number;
  negative?: boolean;
  highlight?: boolean;
  gold?: boolean;
}> = ({ label, value, negative, highlight, gold }) => (
  <div className="flex items-center justify-between">
    <p className={`text-xs ${highlight ? 'font-bold' : 'font-medium'} ${gold ? 'text-amber-400' : 'text-zinc-400'}`}>
      {label}
    </p>
    <p
      className={`text-xs font-bold ${
        gold ? 'text-amber-400' : highlight ? 'text-white' : negative ? 'text-red-400' : 'text-zinc-300'
      }`}
    >
      {negative && value > 0 ? '-' : ''}
      {fmtBRL(value)}
    </p>
  </div>
);
