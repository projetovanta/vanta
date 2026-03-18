import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

interface BatchAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface Props {
  count: number;
  actions: BatchAction[];
  onClear: () => void;
}

/**
 * Barra de ações em lote — aparece quando há itens selecionados.
 * Fixa no bottom com backdrop blur.
 */
export const BatchActionBar: React.FC<Props> = ({ count, actions, onClear }) => {
  if (count === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-4 mb-4 bg-[#0A0A0A]/95 backdrop-blur-xl border border-[#FFD300]/20 rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 min-w-[1.5rem] h-6 rounded-full bg-[#FFD300] text-black text-[0.625rem] font-black flex items-center justify-center px-1.5">
            {count}
          </span>
          <span className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-widest truncate">
            selecionado{count !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-end gap-1.5">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.5625rem] font-bold uppercase tracking-widest active:scale-95 transition-all ${
                  action.variant === 'danger'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20'
                }`}
              >
                <Icon size="0.75rem" />
                {action.label}
              </button>
            );
          })}
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <X size="0.75rem" className="text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
