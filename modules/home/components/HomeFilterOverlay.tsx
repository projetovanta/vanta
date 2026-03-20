import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, RotateCcw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { supabase } from '../../../services/supabaseClient';
import { ModalPortal } from '../../../components/ModalPortal';

interface HomeFilterOverlayProps {
  onClose: () => void;
  cidade: string;
  currentFilters?: string[] | null;
  onApply: (filters: string[] | null) => void;
}

type TabType = 'FORMATO' | 'ESTILO';

const TABS: { id: TabType; label: string; emoji: string }[] = [
  { id: 'FORMATO', label: 'Tipo de Evento', emoji: '🧱' },
  { id: 'ESTILO', label: 'Estilo Musical', emoji: '🎵' },
];

export const HomeFilterOverlay: React.FC<HomeFilterOverlayProps> = ({ onClose, cidade, currentFilters, onApply }) => {
  const [dbFormatos, setDbFormatos] = useState<string[]>([]);
  const [dbEstilos, setDbEstilos] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentFilters ?? []));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('FORMATO');

  useEffect(() => {
    let cancelled = false;

    // Carregar formatos e estilos que EXISTEM em eventos da cidade
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    supabase
      .from('eventos_admin')
      .select('formato, estilos')
      .eq('publicado', true)
      .eq('status_evento', 'ATIVO')
      .eq('cidade', cidade)
      .gte('data_fim', now)
      .then(({ data }) => {
        if (cancelled) return;
        const fmtSet = new Set<string>();
        const stlSet = new Set<string>();
        (data ?? []).forEach((e: { formato: string | null; estilos: string[] | null }) => {
          if (e.formato) fmtSet.add(e.formato);
          (e.estilos ?? []).forEach(s => stlSet.add(s));
        });
        setDbFormatos(Array.from(fmtSet).sort((a, b) => a.localeCompare(b, 'pt-BR')));
        setDbEstilos(Array.from(stlSet).sort((a, b) => a.localeCompare(b, 'pt-BR')));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cidade]);

  const toggle = (label: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleSave = () => {
    const filtersArr: string[] = Array.from(selected);
    onApply(filtersArr.length > 0 ? filtersArr : null);
    onClose();
  };

  const handleReset = () => {
    onApply(null);
    onClose();
  };

  const currentItems = activeTab === 'FORMATO' ? dbFormatos : dbEstilos;
  const selectedFormatosCount = dbFormatos.filter(f => selected.has(f)).length;
  const selectedEstilosCount = dbEstilos.filter(s => selected.has(s)).length;
  const totalSelected = selected.size;

  return (
    <ModalPortal>
      <div className="absolute inset-0 z-[200] animate-in fade-in duration-300">
        <div
          className="absolute inset-0"
          role="presentation"
          onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.4)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
          <div
            className="w-full max-w-[20rem] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30,30,30,0.7)',
              WebkitBackdropFilter: 'blur(80px) saturate(1.8)',
              backdropFilter: 'blur(80px) saturate(1.8)',
              isolation: 'isolate',
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
                    Filtros
                  </h2>
                  {totalSelected > 0 && (
                    <p className="text-[0.5625rem] text-[#FFD300] font-black uppercase tracking-widest mt-1">
                      {totalSelected} selecionado{totalSelected > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="p-2 bg-black/50 rounded-full text-zinc-400 transition-colors">
                  <X size="1rem" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-black/30 rounded-xl p-1">
                {TABS.map(tab => {
                  const count = tab.id === 'FORMATO' ? selectedFormatosCount : selectedEstilosCount;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/20'
                          : 'text-zinc-400'
                      }`}
                    >
                      {tab.emoji} {tab.label}
                      {count > 0 && <span className="ml-1 text-[0.5rem]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Items */}
              <div className="max-h-[35vh] overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentItems.map(item => {
                      const active = selected.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggle(item)}
                          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 ${
                            active
                              ? 'bg-[#FFD300]/15 border border-[#FFD300]/30 text-[#FFD300]'
                              : 'bg-black/40 border border-white/5 text-zinc-400'
                          }`}
                        >
                          <span className="truncate">{item}</span>
                          {active && <Check size="0.6875rem" className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-white/5">
              <button
                onClick={handleReset}
                className="flex-1 py-4 flex items-center justify-center gap-1.5 border-r border-white/5 text-[0.5625rem] font-black uppercase tracking-[0.2em] text-zinc-400 transition-colors"
              >
                <RotateCcw size="0.625rem" />
                Resetar
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-4 flex items-center justify-center gap-1.5 bg-[#FFD300]/10 text-[0.5625rem] font-black uppercase tracking-[0.2em] text-[#FFD300] transition-colors"
              >
                <Check size="0.625rem" />
                Salvar{totalSelected > 0 ? ` (${totalSelected})` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
