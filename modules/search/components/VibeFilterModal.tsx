import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { supabase } from '../../../services/supabaseClient';
import { useModalBack } from '../../../hooks/useModalStack';

interface VibeFilters {
  formatos: string[];
  estilos: string[];
  experiencias: string[];
}

export const VibeFilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onToggleCategory: (id: string) => void;
  onClear: () => void;
  // Novos filtros expandidos
  vibeFilters?: VibeFilters;
  onVibeFiltersChange?: (filters: VibeFilters) => void;
}> = ({ isOpen, onClose, selectedCategories, onToggleCategory, onClear, vibeFilters, onVibeFiltersChange }) => {
  useModalBack(isOpen, onClose, 'vibe-filter');
  const [dbFormatos, setDbFormatos] = useState<string[]>([]);
  const [dbEstilos, setDbEstilos] = useState<string[]>([]);
  const [dbExperiencias, setDbExperiencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FORMATO' | 'ESTILO' | 'EXPERIENCIA'>('FORMATO');

  // Filtros locais (usa vibeFilters se disponível, senão fallback para selectedCategories)
  const filters = vibeFilters ?? { formatos: selectedCategories, estilos: [], experiencias: [] };

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoading(true);
      const [f, e, x] = await Promise.all([
        supabase.from('formatos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('estilos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('experiencias').select('label').eq('ativo', true).order('ordem', { ascending: true }),
      ]);
      setDbFormatos((f.data ?? []).map((d: { label: string }) => d.label));
      setDbEstilos((e.data ?? []).map((d: { label: string }) => d.label));
      setDbExperiencias((x.data ?? []).map((d: { label: string }) => d.label));
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [isOpen]);

  const toggle = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter(x => x !== item) : [...list, item];

  const handleToggle = (item: string) => {
    if (onVibeFiltersChange) {
      const updated = { ...filters };
      if (activeTab === 'FORMATO') updated.formatos = toggle(updated.formatos, item);
      else if (activeTab === 'ESTILO') updated.estilos = toggle(updated.estilos, item);
      else updated.experiencias = toggle(updated.experiencias, item);
      onVibeFiltersChange(updated);
    } else {
      onToggleCategory(item);
    }
  };

  const handleClear = () => {
    if (onVibeFiltersChange) {
      onVibeFiltersChange({ formatos: [], estilos: [], experiencias: [] });
    }
    onClear();
    onClose();
  };

  const currentItems = activeTab === 'FORMATO' ? dbFormatos : activeTab === 'ESTILO' ? dbEstilos : dbExperiencias;
  const currentSelected =
    activeTab === 'FORMATO' ? filters.formatos : activeTab === 'ESTILO' ? filters.estilos : filters.experiencias;
  const totalSelected = filters.formatos.length + filters.estilos.length + filters.experiencias.length;

  const TABS = [
    { id: 'FORMATO' as const, label: 'Formato', emoji: '🧱' },
    { id: 'ESTILO' as const, label: 'Estilo', emoji: '🎵' },
    { id: 'EXPERIENCIA' as const, label: 'Experiência', emoji: '✨' },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] animate-in fade-in duration-300">
      <div
        className="absolute inset-0"
        role="presentation"
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
      <div className="absolute top-[10rem] left-0 right-0 flex justify-center px-6 animate-in slide-in-from-top-2 duration-500">
        <div
          className="w-full max-w-[20rem] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{
            background: 'rgba(30,30,30,0.7)',
            WebkitBackdropFilter: 'blur(80px) saturate(1.8)',
            backdropFilter: 'blur(80px) saturate(1.8)',
            isolation: 'isolate',
          }}
        >
          <div className="p-6">
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
              <button
                onClick={onClose}
                className="p-2 bg-black/50 rounded-full text-zinc-400 hover-real:text-white transition-colors"
              >
                <X size="1rem" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-black/30 rounded-xl p-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/20' : 'text-zinc-400'}`}
                >
                  {tab.emoji} {tab.label}
                  {(activeTab === 'FORMATO'
                    ? filters.formatos
                    : activeTab === 'ESTILO'
                      ? filters.estilos
                      : filters.experiencias
                  ).length > 0 &&
                    tab.id === activeTab && <span className="ml-1 text-[0.5rem]">({currentSelected.length})</span>}
                </button>
              ))}
            </div>

            <div className="max-h-[35vh] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentItems.map(item => (
                    <button
                      key={item}
                      onClick={() => handleToggle(item)}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-[0.625rem] font-bold uppercase tracking-wider ${currentSelected.includes(item) ? 'bg-[#FFD300]/15 border border-[#FFD300]/30 text-[#FFD300]' : 'bg-black/40 border border-white/5 text-zinc-400'}`}
                    >
                      <span className="truncate">{item}</span>
                      {currentSelected.includes(item) && <Check size="0.6875rem" className="shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClear}
            className="w-full py-4 bg-black/60 border-t border-white/5 text-[0.5625rem] font-black uppercase tracking-[0.3em] text-zinc-400 hover-real:text-white transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
