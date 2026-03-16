/**
 * AdminV2Gateway — Protótipo visual do novo painel admin
 * Rota: /admin-v2
 * ZERO interferência no admin atual. Dados mockados. Só front.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { SidebarV2, type NavItem } from './components/SidebarV2';
import { CommandPalette } from './components/CommandPalette';
import { HomeV2 } from './pages/HomeV2';
import { DadosV2 } from './pages/DadosV2';
import { AcoesV2 } from './pages/AcoesV2';
import { MaisVantaV2 } from './pages/MaisVantaV2';
import { ConfigV2 } from './pages/ConfigV2';

export const AdminV2Gateway: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('HOME');
  const [showPalette, setShowPalette] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handlePaletteSelect = useCallback((id: string) => {
    // Mapa de command → nav section
    const navMap: Record<string, NavItem> = {
      DASHBOARD: 'HOME',
      PENDENCIAS_HUB: 'HOME',
      FINANCEIRO_MASTER: 'DADOS',
      PRODUCT_ANALYTICS: 'DADOS',
      INTELIGENCIA: 'DADOS',
      RELATORIO_MASTER: 'DADOS',
      MASTER_DASHBOARD: 'DADOS',
      COMUNIDADES: 'ACOES',
      MEUS_EVENTOS: 'ACOES',
      NOTIFICACOES: 'ACOES',
      INDICA: 'ACOES',
      GESTAO_COMPROVANTES: 'ACOES',
      PENDENTES: 'ACOES',
      CURADORIA_MV: 'MV',
      MEMBROS_GLOBAIS_MV: 'MV',
      CONVITES_MV: 'MV',
      MAIS_VANTA_HUB: 'MV',
      ANALYTICS_MV: 'MV',
      MONITORAMENTO_MV: 'MV',
      INFRACOES_GLOBAIS_MV: 'MV',
      MAIS_VANTA_DASHBOARD: 'MV',
      CATEGORIAS: 'CONFIG',
      CARGOS: 'CONFIG',
      SOLICITACOES_PARCERIA: 'CONFIG',
      DIAGNOSTICO: 'CONFIG',
      FAQ: 'CONFIG',
    };
    setActiveNav(navMap[id] ?? 'HOME');
  }, []);

  const handleNavigate = useCallback(
    (view: string) => {
      handlePaletteSelect(view);
    },
    [handlePaletteSelect],
  );

  return (
    <div className="fixed inset-0 flex bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <SidebarV2
        active={activeNav}
        onSelect={setActiveNav}
        onClose={() => window.history.back()}
        isDesktop={isDesktop}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar com busca */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-white/5 bg-[#0A0A0A]">
          <button
            onClick={() => setShowPalette(true)}
            className="flex-1 flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-left active:bg-white/5 transition-colors"
          >
            <Search size="0.875rem" className="text-zinc-500" />
            <span className="text-sm text-zinc-500">Buscar...</span>
            <kbd className="ml-auto px-2 py-0.5 bg-zinc-800 text-zinc-600 text-[0.5rem] font-bold rounded border border-white/10">
              ⌘K
            </kbd>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#FFD300] flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-black">D</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]">
          {activeNav === 'HOME' && <HomeV2 onNavigate={handleNavigate} />}
          {activeNav === 'DADOS' && <DadosV2 />}
          {activeNav === 'ACOES' && <AcoesV2 />}
          {activeNav === 'MV' && <MaisVantaV2 />}
          {activeNav === 'CONFIG' && <ConfigV2 />}
        </div>
      </div>

      {/* Command Palette overlay */}
      <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} onSelect={handlePaletteSelect} />

      {/* Label protótipo */}
      <div className="fixed bottom-4 right-4 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-[0.5rem] font-black uppercase tracking-wider pointer-events-none z-[600]">
        Protótipo V2
      </div>
    </div>
  );
};
