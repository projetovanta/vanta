import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { HorarioOverride } from '../types';
import { VantaDatePicker } from './VantaDatePicker';
import { VantaTimePicker } from './VantaTimePicker';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#FFD300]/30';
const labelCls = 'text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const HorarioOverridesEditor: React.FC<{
  overrides: HorarioOverride[];
  onChange: (o: HorarioOverride[]) => void;
}> = ({ overrides, onChange }) => {
  const sorted = [...overrides].sort((a, b) => a.data.localeCompare(b.data));

  const add = () => {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    onChange([...overrides, { data: today, aberto: false }]);
  };

  const remove = (idx: number) => {
    onChange(overrides.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: keyof HorarioOverride, value: unknown) => {
    onChange(overrides.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  };

  return (
    <div className="space-y-2">
      <label className={labelCls}>Exceções de Horário</label>
      <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
        Feriados, datas especiais ou dias que fogem da regra padrão.
      </p>

      <div className="space-y-2">
        {sorted.map((o, idx) => (
          <div key={idx} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <VantaDatePicker
                value={o.data}
                onChange={v => update(idx, 'data', v)}
                className={inputCls + ' flex-1 min-w-0'}
              />
              <button
                type="button"
                onClick={() => update(idx, 'aberto', !o.aberto)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  o.aberto ? 'bg-[#FFD300]' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    o.aberto ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-red-400/60 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {o.aberto && (
              <div className="flex items-center gap-1.5">
                <VantaTimePicker
                  value={o.abertura ?? '18:00'}
                  onChange={v => update(idx, 'abertura', v)}
                  className={inputCls + ' flex-1 min-w-0 text-center'}
                />
                <span className="text-zinc-400 text-[10px] shrink-0">às</span>
                <VantaTimePicker
                  value={o.fechamento ?? '02:00'}
                  onChange={v => update(idx, 'fechamento', v)}
                  className={inputCls + ' flex-1 min-w-0 text-center'}
                />
              </div>
            )}

            <input
              type="text"
              value={o.motivo ?? ''}
              onChange={e => update(idx, 'motivo', e.target.value)}
              placeholder="Motivo (ex: Feriado, Evento especial)"
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider hover:border-[#FFD300]/30 hover:text-[#FFD300]/70 transition-colors"
      >
        <Plus size={12} /> Adicionar exceção
      </button>
    </div>
  );
};
