import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getCommunityAnalytics } from '../../services/analytics';
import type { CommunityAnalytics, Periodo } from '../../services/analytics/types';
import { PeriodSelector, DrillBreadcrumb } from '../../components/dashboard';
import { OverviewTab } from './OverviewTab';
import { EventosTab } from './EventosTab';
import { FinanceiroTab } from './FinanceiroTab';
import { AudienciaTab } from './AudienciaTab';
import { EquipeTab } from './EquipeTab';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  onBack: () => void;
  onSelectEvento: (eventoId: string) => void;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'visao-geral', label: 'Visão Geral' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'audiencia', label: 'Audiência' },
  { key: 'equipe', label: 'Equipe' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="animate-pulse bg-zinc-800/50 rounded-xl h-24" />
    ))}
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────

export const ComunidadeDashboard: React.FC<Props> = ({ comunidadeId, comunidadeNome, onBack, onSelectEvento }) => {
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [activeTab, setActiveTab] = useState<TabKey>('visao-geral');
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch analytics ──────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getCommunityAnalytics(comunidadeId, periodo).then(data => {
      if (!cancelled) {
        setAnalytics(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [comunidadeId, periodo]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  // ── Render active tab ────────────────────────────────────────────────────

  const renderTab = () => {
    if (loading) return <Skeleton />;

    switch (activeTab) {
      case 'visao-geral':
        return <OverviewTab analytics={analytics} onSelectEvento={onSelectEvento} />;
      case 'eventos':
        return <EventosTab analytics={analytics} onSelectEvento={onSelectEvento} />;
      case 'financeiro':
        return <FinanceiroTab analytics={analytics} />;
      case 'audiencia':
        return <AudienciaTab analytics={analytics} />;
      case 'equipe':
        return <EquipeTab analytics={analytics} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-[env(safe-area-inset-top)] pb-2 space-y-3">
        {/* Top row: back + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 p-1.5 rounded-lg active:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </button>
          <h1 className="text-white font-black text-base truncate flex-1 min-w-0">{comunidadeNome}</h1>
        </div>

        {/* Breadcrumb */}
        <DrillBreadcrumb items={[{ label: 'Comunidades', onClick: onBack }, { label: comunidadeNome }]} />

        {/* Period selector */}
        <PeriodSelector value={periodo} onChange={setPeriodo} />

        {/* Tab bar */}
        <div className="overflow-x-auto snap-x no-scrollbar -mx-4 px-4">
          <div className="flex gap-2">
            {TABS.map(({ key, label }) => {
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                    isSelected
                      ? 'bg-[#FFD300]/10 text-[#FFD300] border-[#FFD300]/20'
                      : 'bg-zinc-900/40 text-zinc-400 border-white/5 active:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">{renderTab()}</div>
    </div>
  );
};
