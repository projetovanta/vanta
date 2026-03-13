import React, { useState, lazy, Suspense } from 'react';
import { ArrowLeft, Shield, ShieldPlus, Loader2 } from 'lucide-react';
import type { Notificacao } from '../../../../types';

const CargosPlataformaContent = lazy(() =>
  import('../cargosPlataforma').then(m => ({ default: m.CargosPlataformaView })),
);
const DefinirCargosContent = lazy(() => import('../definirCargos').then(m => ({ default: m.DefinirCargosView })));

interface Props {
  onBack: () => void;
  currentUserId: string;
  addNotification: (n: Omit<Notificacao, 'id'>) => void;
}

export const CargosUnificadoView: React.FC<Props> = ({ onBack, currentUserId, addNotification }) => {
  const [tab, setTab] = useState<'PLATAFORMA' | 'CUSTOMIZADOS'>('PLATAFORMA');

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <Shield size={20} className="text-amber-400" />
        <h1 className="text-lg font-bold text-white">Cargos</h1>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-white/10">
        <button
          onClick={() => setTab('PLATAFORMA')}
          className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
            tab === 'PLATAFORMA' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50'
          }`}
        >
          <Shield size={14} />
          Plataforma
        </button>
        <button
          onClick={() => setTab('CUSTOMIZADOS')}
          className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
            tab === 'CUSTOMIZADOS' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50'
          }`}
        >
          <ShieldPlus size={14} />
          Comunidade / Evento
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-amber-400" />
            </div>
          }
        >
          {tab === 'PLATAFORMA' ? (
            <CargosPlataformaContent currentUserId={currentUserId} onBack={onBack} embedded />
          ) : (
            <DefinirCargosContent
              onBack={onBack}
              currentUserId={currentUserId}
              addNotification={addNotification}
              embedded
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};
