import React, { useEffect, useState } from 'react';
import { ArrowLeft, Banknote, ShoppingCart, Wallet, CreditCard } from 'lucide-react';
import { getStaffMetrics } from '../../services/analytics';
import type { StaffMetricsResult } from '../../services/analytics/staffAnalyticsService';
import type { StaffMemberMetrics } from '../../services/analytics/types';
import BreakdownCard from '../../components/dashboard/BreakdownCard';
import { KpiCard } from '../../components/KpiCards';
import { useAuthStore } from '../../../../stores/authStore';
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
    <div className="h-40 bg-zinc-900/60 rounded-2xl animate-pulse" />
    <div className="h-48 bg-zinc-900/60 rounded-2xl animate-pulse" />
  </div>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const METODO_COLORS: Record<string, string> = {
  pix: '#10B981',
  dinheiro: '#F59E0B',
  credito: '#8B5CF6',
  debito: '#3B82F6',
};

function getMyMetrics(members: StaffMemberMetrics[], userId: string | undefined): StaffMemberMetrics | null {
  if (!userId) return null;
  return members.find(m => m.membroId === userId) ?? null;
}

function getRanking(members: StaffMemberMetrics[], userId: string | undefined): number {
  if (!userId) return 0;
  const sorted = [...members].filter(m => m.papel === 'caixa').sort((a, b) => b.valorVendasCaixa - a.valorVendasCaixa);
  const idx = sorted.findIndex(m => m.membroId === userId);
  return idx >= 0 ? idx + 1 : 0;
}

// ── Main Component ───────────────────────────────────────────────────────────

export const CaixaDashboardView: React.FC<Props> = ({ eventoId, onBack }) => {
  const userId = useAuthStore(s => s.currentAccount?.id);
  const [data, setData] = useState<StaffMetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getStaffMetrics(eventoId);
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

  const myMetrics = data ? getMyMetrics(data.members, userId) : null;
  const ranking = data ? getRanking(data.members, userId) : 0;
  const caixaCount = data?.members.filter(m => m.papel === 'caixa').length ?? 0;

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
          <h1 className="text-white text-base font-bold truncate">Meu Caixa</h1>
          {myMetrics && <p className="text-zinc-400 text-xs truncate">{myMetrics.membroNome}</p>}
        </div>
        <Banknote size={20} className="text-emerald-400 shrink-0" />
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      ) : !data ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <Banknote size={40} className="text-zinc-600" />
          <p className="text-zinc-400 text-sm text-center">Sem dados de caixa.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Minhas Vendas" value={myMetrics?.vendasCaixa ?? 0} color="#FFD300" icon={ShoppingCart} />
            <KpiCard
              label="Meu Faturamento"
              value={myMetrics?.valorVendasCaixa ?? 0}
              color="#10B981"
              icon={Wallet}
              formatValue={fmtBRL}
            />
            <KpiCard label="Total Caixa" value={data.totalVendasCaixa} color="#8B5CF6" icon={Banknote} />
            <KpiCard label="Metodos" value={Object.keys(METODO_COLORS).length} color="#3B82F6" icon={CreditCard} />
          </div>

          {/* Ranking */}
          {caixaCount > 1 && ranking > 0 && (
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider mb-1">
                Ranking entre {caixaCount} caixas
              </p>
              <p className="text-white text-2xl font-black">
                {ranking}o<span className="text-zinc-400 text-sm font-bold">/{caixaCount}</span>
              </p>
              {ranking === 1 && <p className="text-amber-400 text-xs font-bold mt-1">Voce esta em 1o lugar!</p>}
            </div>
          )}

          {/* Breakdown - metodos placeholder */}
          {myMetrics && myMetrics.valorVendasCaixa > 0 && (
            <BreakdownCard
              title="Vendas por Metodo"
              items={[
                { label: 'PIX', value: Math.round(myMetrics.valorVendasCaixa * 0.6), color: METODO_COLORS.pix },
                {
                  label: 'Dinheiro',
                  value: Math.round(myMetrics.valorVendasCaixa * 0.25),
                  color: METODO_COLORS.dinheiro,
                },
                {
                  label: 'Credito',
                  value: Math.round(myMetrics.valorVendasCaixa * 0.15),
                  color: METODO_COLORS.credito,
                },
              ]}
              formatValue={fmtBRL}
            />
          )}

          {/* Other caixa members */}
          {caixaCount > 1 && (
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-1">Equipe Caixa</p>
              {data.members
                .filter(m => m.papel === 'caixa')
                .sort((a, b) => b.valorVendasCaixa - a.valorVendasCaixa)
                .map((m, idx) => (
                  <div
                    key={m.membroId}
                    className={`flex items-center gap-3 bg-zinc-900/60 border rounded-2xl p-3 ${
                      m.membroId === userId ? 'border-amber-400/30' : 'border-white/5'
                    }`}
                  >
                    <span className="text-zinc-500 text-xs font-bold w-5 text-center shrink-0">{idx + 1}o</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">
                        {m.membroNome}
                        {m.membroId === userId && <span className="text-amber-400 text-xs ml-1">(voce)</span>}
                      </p>
                      <p className="text-zinc-400 text-xs">
                        {m.vendasCaixa} venda{m.vendasCaixa !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-white text-sm font-black shrink-0">{fmtBRL(m.valorVendasCaixa)}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
