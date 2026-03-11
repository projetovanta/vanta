import React from 'react';
import type { HorarioSemanal } from '../types';
import { VantaTimePicker } from './VantaTimePicker';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#FFD300]/30 text-center';
const labelCls = 'text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const DEFAULT_HORARIOS: HorarioSemanal[] = [
  { dia: 0, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 1, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 2, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 3, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 4, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 5, aberto: false, abertura: '00:00', fechamento: '00:00' },
  { dia: 6, aberto: false, abertura: '00:00', fechamento: '00:00' },
];

export const HorarioFuncionamentoEditor: React.FC<{
  horarios: HorarioSemanal[];
  onChange: (h: HorarioSemanal[]) => void;
}> = ({ horarios, onChange }) => {
  const update = (dia: number, field: keyof HorarioSemanal, value: unknown) => {
    onChange(horarios.map(h => (h.dia === dia ? { ...h, [field]: value } : h)));
  };

  return (
    <div className="space-y-2">
      <label className={labelCls}>Horário de Funcionamento</label>
      <div className="space-y-1.5">
        {horarios.map(h => (
          <div
            key={h.dia}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              h.aberto ? 'bg-zinc-900/60 border border-white/5' : 'bg-zinc-900/30 border border-white/3 opacity-60'
            }`}
          >
            {/* Dia */}
            <span className="text-[0.625rem] font-bold text-zinc-400 w-8 shrink-0">{DIAS[h.dia]}</span>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => update(h.dia, 'aberto', !h.aberto)}
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                h.aberto ? 'bg-[#FFD300]' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  h.aberto ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </button>

            {h.aberto ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <VantaTimePicker
                  value={h.abertura}
                  onChange={v => update(h.dia, 'abertura', v)}
                  className={inputCls + ' flex-1 min-w-0'}
                />
                <span className="text-zinc-400 text-[0.625rem] shrink-0">às</span>
                <VantaTimePicker
                  value={h.fechamento}
                  onChange={v => update(h.dia, 'fechamento', v)}
                  className={inputCls + ' flex-1 min-w-0'}
                />
              </div>
            ) : (
              <span className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider">Fechado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
