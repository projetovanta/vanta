import React from 'react';
import type { Periodo } from '../../services/analytics/types';

interface Props {
  value: Periodo;
  onChange: (p: Periodo) => void;
}

const OPTIONS: { key: Periodo; label: string }[] = [
  { key: 'HOJE', label: 'Hoje' },
  { key: 'SEMANA', label: 'Semana' },
  { key: 'MES', label: 'Mês' },
  { key: 'ANO', label: 'Ano' },
];

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="overflow-x-auto snap-x no-scrollbar">
      <div className="flex gap-2">
        {OPTIONS.map(({ key, label }) => {
          const isSelected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full
                text-[0.625rem] font-bold uppercase tracking-widest
                border transition-colors
                ${
                  isSelected
                    ? 'bg-[#FFD300]/10 text-[#FFD300] border-[#FFD300]/20'
                    : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:text-zinc-300'
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
