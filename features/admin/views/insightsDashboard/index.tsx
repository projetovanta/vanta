import React, { useState, useMemo } from 'react';
import { ArrowLeft, Lightbulb, Brain, DollarSign, Settings2, Sparkles } from 'lucide-react';
import { EVENTOS_ADMIN } from '../../services/eventosAdminCore';
import type { Periodo } from '../../services/dashboardAnalyticsService';
import InsightsTab from './InsightsTab';
import FinanceiroTab from './FinanceiroTab';
import OperacoesTab from './OperacoesTab';
import ValorTab from './ValorTab';
import { AdminViewHeader } from '../../components/AdminViewHeader';

type TabId = 'insights' | 'financeiro' | 'operacoes' | 'valor';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'HOJE', label: 'Hoje' },
  { id: 'SEMANA', label: 'Semana' },
  { id: 'MES', label: 'Mês' },
  { id: 'ANO', label: 'Ano' },
];

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'insights', label: 'Insights', icon: Brain },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'operacoes', label: 'Operações', icon: Settings2 },
  { id: 'valor', label: 'Valor', icon: Sparkles },
];

interface Props {
  onBack: () => void;
  comunidadeId?: string;
  onNavigate?: (subView: string) => void;
}

export const InsightsDashboardView: React.FC<Props> = ({ onBack, comunidadeId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabId>('insights');
  const [selectedEventoId, setSelectedEventoId] = useState<string>('');
  const [periodo, setPeriodo] = useState<Periodo>('MES');

  const handleTipAction = (target: string) => {
    const targetMap: Record<string, string> = {
      CUPONS: 'CUPONS',
      LOTES: 'LOTES',
      LISTAS: 'LISTAS',
      COMUNICACAO: 'NOTIFICACOES',
      EVENTO_DASHBOARD: 'MEUS_EVENTOS',
    };
    const subView = targetMap[target];
    if (subView && onNavigate) onNavigate(subView);
  };

  // Eventos da comunidade selecionada (ou todos se master sem comunidade)
  const eventos = useMemo(() => {
    if (!comunidadeId) return EVENTOS_ADMIN;
    return EVENTOS_ADMIN.filter(e => e.comunidadeId === comunidadeId);
  }, [comunidadeId]);

  // Comunidade default — primeiro evento ou prop
  const comId = comunidadeId ?? eventos[0]?.comunidadeId ?? '';

  const evId = selectedEventoId || undefined;

  if (!comId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
        <AdminViewHeader title="Inteligência VANTA" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Nenhum evento encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
      <AdminViewHeader title="Inteligência VANTA" onBack={onBack} />
      <div className="shrink-0 px-4 py-2 border-b border-white/5 space-y-3">
        {/* Seletor de evento */}
        {eventos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 shrink-0">Evento:</span>
            <div className="flex-1 overflow-x-auto no-scrollbar flex gap-1.5">
              <button
                onClick={() => setSelectedEventoId('')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !selectedEventoId
                    ? 'bg-[#FFD300]/20 text-[#FFD300] border border-[#FFD300]/30'
                    : 'bg-zinc-800 text-zinc-400 border border-white/5'
                }`}
              >
                Todos
              </button>
              {eventos.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventoId(ev.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors truncate max-w-[160px] ${
                    selectedEventoId === ev.id
                      ? 'bg-[#FFD300]/20 text-[#FFD300] border border-[#FFD300]/30'
                      : 'bg-zinc-800 text-zinc-400 border border-white/5'
                  }`}
                >
                  {ev.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Período */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 shrink-0">Período:</span>
          <div className="flex gap-1.5">
            {PERIODOS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  periodo === p.id
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-zinc-800/60 text-zinc-500 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-white/10 text-white' : 'text-zinc-500 hover-real:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {activeTab === 'insights' && <InsightsTab comunidadeId={comId} eventoId={evId} periodo={periodo} />}
        {activeTab === 'financeiro' && <FinanceiroTab eventoId={evId} />}
        {activeTab === 'operacoes' && <OperacoesTab comunidadeId={comId} eventoId={evId} />}
        {activeTab === 'valor' && (
          <ValorTab comunidadeId={comId} eventoId={evId} onAction={handleTipAction} periodo={periodo} />
        )}
      </div>
    </div>
  );
};
