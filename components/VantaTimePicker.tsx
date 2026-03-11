import React, { useState, useRef, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';

interface VantaTimePickerProps {
  value: string; // HH:MM
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Intervalo em minutos (default: 5) */
  step?: number;
}

export const VantaTimePicker: React.FC<VantaTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Horário',
  className = '',
  style,
  step = 5,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 text-left ${className || 'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FFD300]/30'}`}
        style={style}
      >
        <Clock size="0.875rem" className="text-zinc-500 shrink-0" />
        <span className={value ? 'text-white' : 'text-zinc-500'}>{value || placeholder}</span>
      </button>

      {open && (
        <TimePickerModal
          value={value}
          step={step}
          onSelect={v => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

interface TimePickerModalProps {
  value: string;
  step: number;
  onSelect: (v: string) => void;
  onClose: () => void;
}

const ITEM_H = 40; // px por item na coluna

const TimePickerModal: React.FC<TimePickerModalProps> = ({ value, step, onSelect, onClose }) => {
  useModalBack(true, onClose, 'vanta-time-picker');

  const [h, m] = value ? value.split(':').map(Number) : [12, 0];
  const [selH, setSelH] = useState(h);
  const [selM, setSelM] = useState(() => {
    // Arredonda para o step mais próximo
    return (Math.round(m / step) * step) % 60;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step);

  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  // Scroll para posição inicial
  useEffect(() => {
    if (hourRef.current) {
      hourRef.current.scrollTop = selH * ITEM_H;
    }
    if (minRef.current) {
      const idx = minutes.indexOf(selM);
      if (idx >= 0) minRef.current.scrollTop = idx * ITEM_H;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-72 bg-[#121212] border border-[#FFD300]/20 rounded-3xl p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFD300] font-serif italic text-lg">Escolha o Horário</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-zinc-900 rounded-full text-zinc-400 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="1rem" />
          </button>
        </div>

        {/* Preview */}
        <div className="text-center mb-4">
          <span className="text-white text-3xl font-bold tracking-wider">
            {fmt(selH)}:{fmt(selM)}
          </span>
        </div>

        {/* Colunas hora / minuto */}
        <div className="flex gap-3 mb-4">
          {/* Horas */}
          <div className="flex-1">
            <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-widest text-center mb-1.5">Hora</p>
            <div
              ref={hourRef}
              className="h-[12.5rem] overflow-y-auto no-scrollbar rounded-xl bg-zinc-900/40 border border-white/5"
            >
              {hours.map(hr => (
                <button
                  key={hr}
                  type="button"
                  onClick={() => setSelH(hr)}
                  className={`w-full flex items-center justify-center transition-all ${
                    selH === hr ? 'bg-[#FFD300] text-black font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                  style={{ height: ITEM_H }}
                >
                  <span className="text-sm">{fmt(hr)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minutos */}
          <div className="flex-1">
            <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-widest text-center mb-1.5">Min</p>
            <div
              ref={minRef}
              className="h-[12.5rem] overflow-y-auto no-scrollbar rounded-xl bg-zinc-900/40 border border-white/5"
            >
              {minutes.map(mn => (
                <button
                  key={mn}
                  type="button"
                  onClick={() => setSelM(mn)}
                  className={`w-full flex items-center justify-center transition-all ${
                    selM === mn ? 'bg-[#FFD300] text-black font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                  style={{ height: ITEM_H }}
                >
                  <span className="text-sm">{fmt(mn)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmar */}
        <button
          type="button"
          onClick={() => onSelect(`${fmt(selH)}:${fmt(selM)}`)}
          className="w-full py-3 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};
