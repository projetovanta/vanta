import React, { useEffect, useState } from 'react';
import { ArrowLeft, DoorOpen, UserCheck, Users, Activity } from 'lucide-react';
import { getStaffMetrics } from '../../services/analytics';
import type { StaffMetricsResult } from '../../services/analytics/staffAnalyticsService';
import type { StaffMemberMetrics } from '../../services/analytics/types';
import ProgressRing from '../../components/dashboard/ProgressRing';
import { KpiCard } from '../../components/KpiCards';
import { useAuthStore } from '../../../../stores/authStore';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMyMetrics(members: StaffMemberMetrics[], userId: string | undefined): StaffMemberMetrics | null {
  if (!userId) return null;
  return members.find(m => m.membroId === userId) ?? null;
}

// ── Main Component ───────────────────────────────────────────────────────────

export const PortariaDashboardView: React.FC<Props> = ({ eventoId, onBack }) => {
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
  const totalCheckins = data?.totalCheckins ?? 0;
  const totalVendas = data?.totalVendasCaixa ?? 0;
  const taxaCheckin = totalVendas > 0 ? Math.round((totalCheckins / totalVendas) * 100) : 0;

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
          <h1 className="text-white text-base font-bold truncate">Minha Portaria</h1>
          {myMetrics && <p className="text-zinc-400 text-xs truncate">{myMetrics.membroNome}</p>}
        </div>
        <DoorOpen size={20} className="text-blue-400 shrink-0" />
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
          <DoorOpen size={40} className="text-zinc-600" />
          <p className="text-zinc-400 text-sm text-center">Sem dados de portaria.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Meus Check-ins" value={myMetrics?.checkins ?? 0} color="#FFD300" icon={UserCheck} />
            <KpiCard label="Total Check-ins" value={totalCheckins} color="#8B5CF6" icon={Users} />
            <div className="flex items-center justify-center bg-zinc-900/60 border border-white/5 rounded-2xl p-3">
              <ProgressRing value={taxaCheckin} label="Taxa Check-in" size={64} color="#10B981" />
            </div>
            <KpiCard label="Publico Presente" value={totalCheckins} color="#F59E0B" icon={Activity} />
          </div>

          {/* My performance summary */}
          {myMetrics && totalCheckins > 0 && (
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-center space-y-2">
              <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider">Minha Contribuicao</p>
              <p className="text-white text-2xl font-black">
                {totalCheckins > 0 ? Math.round((myMetrics.checkins / totalCheckins) * 100) : 0}%
              </p>
              <p className="text-zinc-500 text-xs">
                {myMetrics.checkins} de {totalCheckins} check-ins
              </p>
            </div>
          )}

          {/* Portaria team */}
          {data.members.filter(m => m.papel === 'portaria').length > 1 && (
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider px-1">Equipe Portaria</p>
              {data.members
                .filter(m => m.papel === 'portaria')
                .sort((a, b) => b.checkins - a.checkins)
                .map(m => (
                  <div
                    key={m.membroId}
                    className={`flex items-center gap-3 bg-zinc-900/60 border rounded-2xl p-3 ${
                      m.membroId === userId ? 'border-amber-400/30' : 'border-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">
                        {m.membroNome}
                        {m.membroId === userId && <span className="text-amber-400 text-xs ml-1">(voce)</span>}
                      </p>
                    </div>
                    <p className="text-white text-sm font-black shrink-0">
                      {m.checkins} check-in{m.checkins !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
