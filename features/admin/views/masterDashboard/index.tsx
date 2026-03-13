import React, { useState, useEffect, useCallback } from 'react';
import { Crown, BarChart3, Building2, DollarSign, Settings2, TrendingUp } from 'lucide-react';
import { getMasterAnalytics } from '../../services/analytics';
import type { MasterAnalytics, Periodo } from '../../services/analytics/types';
import { PeriodSelector } from '../../components/dashboard';
import { OverviewTab } from './OverviewTab';
import { ComunidadesTab } from './ComunidadesTab';
import { FinanceiroTab } from './FinanceiroTab';
import { OperacoesTab } from './OperacoesTab';
import { ProjecaoTab } from './ProjecaoTab';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  onSelectComunidade: (comunidadeId: string) => void;
  onSelectEvento: (eventoId: string) => void;
}

type TabKey = 'overview' | 'comunidades' | 'financeiro' | 'operacoes' | 'projecao';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { key: 'comunidades', label: 'Comunidades', icon: Building2 },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { key: 'operacoes', label: 'Operações', icon: Settings2 },
  { key: 'projecao', label: 'Projeção', icon: TrendingUp },
];

// ── Skeleton ─────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-800/60" />
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="h-48 rounded-2xl bg-zinc-800/60" />
      {/* Cards */}
      <div className="grid grid-cols-1 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-zinc-800/60" />
        ))}
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export const MasterDashboard: React.FC<Props> = ({ onSelectComunidade, onSelectEvento }) => {
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [analytics, setAnalytics] = useState<MasterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (p: Periodo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMasterAnalytics(p);
      setAnalytics(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar analytics';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMasterAnalytics(periodo);
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar analytics';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [periodo]);

  const handlePeriodoChange = useCallback((p: Periodo) => {
    setPeriodo(p);
  }, []);

  // ── Render tab content ───────────────────────────────────────────────────

  const renderTab = () => {
    if (loading) return <LoadingSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button
            onClick={() => void loadAnalytics(periodo)}
            className="text-xs font-bold uppercase tracking-wider text-[#FFD300] active:opacity-70"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab analytics={analytics} onSelectComunidade={onSelectComunidade} onSelectEvento={onSelectEvento} />
        );
      case 'comunidades':
        return <ComunidadesTab analytics={analytics} onSelectComunidade={onSelectComunidade} />;
      case 'financeiro':
        return <FinanceiroTab analytics={analytics} />;
      case 'operacoes':
        return <OperacoesTab analytics={analytics} onSelectEvento={onSelectEvento} />;
      case 'projecao':
        return <ProjecaoTab analytics={analytics} />;
      default:
        return null;
    }
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Crown size={20} className="text-[#FFD300] shrink-0" />
            <h1
              className="text-white font-bold text-lg truncate"
              style={{ fontFamily: "'Playfair Display SC', serif" }}
            >
              Painel Master
            </h1>
          </div>
        </div>

        {/* Period selector */}
        <PeriodSelector value={periodo} onChange={handlePeriodoChange} />
      </div>

      {/* Tab bar — horizontal scroll */}
      <div className="shrink-0 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  uppercase tracking-wider whitespace-nowrap shrink-0 transition-all
                  ${
                    isActive
                      ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/30'
                      : 'bg-zinc-800/60 text-zinc-400 border border-white/5 active:bg-white/5'
                  }
                `}
              >
                <TabIcon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar">{renderTab()}</div>
    </div>
  );
};
