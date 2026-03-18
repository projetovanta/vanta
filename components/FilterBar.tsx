import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface Props {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onClear: () => void;
}

/**
 * Barra de filtros avançados reutilizável.
 * Mostra pills de filtro com dropdown inline. Botão "Limpar" reseta tudo.
 */
export const FilterBar: React.FC<Props> = ({ filters, values, onChange, onClear }) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const activeCount = Object.values(values).filter(v => v && v !== 'TODOS').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal size="0.75rem" className="text-zinc-500" />
          <span className="text-[0.5rem] font-black uppercase tracking-widest text-zinc-500">Filtros</span>
          {activeCount > 0 && (
            <span className="min-w-[1rem] h-4 rounded-full bg-[#FFD300] text-black text-[0.5rem] font-black flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </div>

        {filters.map(f => {
          const currentValue = values[f.id] || 'TODOS';
          const currentLabel = f.options.find(o => o.value === currentValue)?.label || f.label;
          const isActive = currentValue !== 'TODOS';

          return (
            <div key={f.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOpenFilter(openFilter === f.id ? null : f.id)}
                className={`px-3 py-1.5 rounded-full text-[0.5625rem] font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/30'
                    : 'bg-zinc-900/60 text-zinc-400 border border-white/5 active:bg-white/5'
                }`}
              >
                {currentLabel}
              </button>

              {openFilter === f.id && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[10rem]">
                  {f.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(f.id, opt.value);
                        setOpenFilter(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        currentValue === opt.value
                          ? 'bg-[#FFD300]/10 text-[#FFD300] font-bold'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 text-[0.5rem] font-bold uppercase tracking-widest active:scale-90 transition-all"
          >
            <X size="0.625rem" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};
