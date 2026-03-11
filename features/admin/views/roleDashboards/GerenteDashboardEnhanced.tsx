import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { ComunidadeDashboard } from '../comunidadeDashboard';

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  comunidadeId: string;
  onBack: () => void;
  onSelectEvento: (eventoId: string) => void;
}

// ── Main Component ───────────────────────────────────────────────────────────

export const GerenteDashboardEnhanced: React.FC<Props> = ({ comunidadeId, onBack, onSelectEvento }) => {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Gerente branding header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center -ml-2 active:bg-white/5 rounded-lg"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-base font-bold truncate">Dashboard Gerente</h1>
          <p className="text-zinc-400 text-xs truncate">Visao completa da comunidade</p>
        </div>
        <Shield size={20} className="text-amber-400 shrink-0" />
      </div>

      {/* ComunidadeDashboard - takes remaining space */}
      <div className="flex-1 overflow-hidden relative">
        <ComunidadeDashboard
          comunidadeId={comunidadeId}
          comunidadeNome=""
          onBack={onBack}
          onSelectEvento={onSelectEvento}
        />
      </div>
    </div>
  );
};
