import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getMaisVantaAnalytics } from '../../services/analytics';
import type { MaisVantaAnalytics, Periodo } from '../../services/analytics/types';
import { PeriodSelector } from '../../components/dashboard';
import { OverviewTab } from './OverviewTab';
import { TiersTab } from './TiersTab';
import { ResgatesTab } from './ResgatesTab';
import { RetencaoTab } from './RetencaoTab';
import { ParceirosTab } from './ParceirosTab';
import { FinanceiroTab } from './FinanceiroTab';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'visao-geral', label: 'Visão Geral' },
  { key: 'tiers', label: 'Tiers' },
  { key: 'resgates', label: 'Resgates' },
  { key: 'retencao', label: 'Retenção' },
  { key: 'parceiros', label: 'Parceiros' },
  { key: 'financeiro', label: 'Financeiro' },
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

export const MaisVantaDashboard: React.FC<Props> = ({ onBack }) => {
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [activeTab, setActiveTab] = useState<TabKey>('visao-geral');
  const [analytics, setAnalytics] = useState<MaisVantaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch analytics ──────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMaisVantaAnalytics(periodo).then(data => {
      if (!cancelled) {
        setAnalytics(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [periodo]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  // ── Render active tab ──────────────────────────────────────────────────

  const renderTab = () => {
    if (loading) return <Skeleton />;

    switch (activeTab) {
      case 'visao-geral':
        return <OverviewTab analytics={analytics} />;
      case 'tiers':
        return <TiersTab analytics={analytics} />;
      case 'resgates':
        return <ResgatesTab analytics={analytics} />;
      case 'retencao':
        return <RetencaoTab analytics={analytics} />;
      case 'parceiros':
        return <ParceirosTab analytics={analytics} />;
      case 'financeiro':
        return <FinanceiroTab analytics={analytics} />;
      default:
        return null;
    }
  };

  // ── Layout ─────────────────────────────────────────────────────────────

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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles size={18} className="text-[#FFD300] shrink-0" />
            <h1 className="text-white font-black text-base truncate">MAIS VANTA</h1>
          </div>
        </div>

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
