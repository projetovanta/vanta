import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';

interface VantaDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  /** Data mínima (YYYY-MM-DD). Se não informado, permite datas passadas */
  min?: string;
  /** Data máxima (YYYY-MM-DD) */
  max?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Formata YYYY-MM-DD para DD/MM/YYYY (exibição BR) */
const formatBR = (iso: string): string => {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const parseISO = (iso: string): Date | null => {
  if (!iso || iso.length < 10) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const VantaDatePicker: React.FC<VantaDatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Selecionar data',
  className = '',
  style,
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
        <Calendar size="0.875rem" className="text-zinc-500 shrink-0" />
        <span className={value ? 'text-white' : 'text-zinc-500'}>{value ? formatBR(value) : placeholder}</span>
      </button>

      {open && (
        <CalendarModal
          value={value}
          min={min}
          max={max}
          onSelect={d => {
            onChange(d);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

// ── Modal do calendário ───────────────────────────────────────────────────────

interface CalendarModalProps {
  value: string;
  min?: string;
  max?: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ value, min, max, onSelect, onClose }) => {
  useModalBack(true, onClose, 'vanta-date-picker');

  const selectedDate = parseISO(value);
  const minDate = parseISO(min ?? '');
  const maxDate = parseISO(max ?? '');

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const [showYearPicker, setShowYearPicker] = useState(false);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const isDisabled = (day: number): boolean => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewDate.getFullYear() &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number): boolean => {
    const now = new Date();
    return (
      now.getFullYear() === viewDate.getFullYear() && now.getMonth() === viewDate.getMonth() && now.getDate() === day
    );
  };

  const changeMonth = (delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  // Year picker: range de 100 anos
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const arr: number[] = [];
    const start = minDate ? minDate.getFullYear() : current - 100;
    const end = maxDate ? maxDate.getFullYear() : current + 10;
    for (let y = end; y >= start; y--) arr.push(y);
    return arr;
  }, [minDate, maxDate]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-xs bg-[#121212] border border-[#FFD300]/20 rounded-3xl p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => setShowYearPicker(!showYearPicker)}
            className="text-[#FFD300] font-serif italic text-lg hover-real:opacity-80 transition-opacity"
          >
            {showYearPicker ? 'Voltar' : `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-zinc-900 rounded-full text-zinc-400 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="1rem" />
          </button>
        </div>

        {showYearPicker ? (
          <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto no-scrollbar">
            {years.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setViewDate(new Date(y, viewDate.getMonth(), 1));
                  setShowYearPicker(false);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  y === viewDate.getFullYear() ? 'bg-[#FFD300] text-black' : 'text-zinc-400 hover-real:bg-zinc-800'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Month nav */}
            <div className="flex justify-between items-center mb-3 px-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 hover-real:text-white active:opacity-70 transition-opacity -ml-2"
              >
                <ChevronLeft size="1.125rem" />
              </button>
              <span className="text-white font-bold uppercase tracking-widest text-[0.625rem]">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 hover-real:text-white active:opacity-70 transition-opacity -mr-2"
              >
                <ChevronRight size="1.125rem" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="text-[0.5625rem] text-zinc-500 font-bold">
                  {d}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 place-items-center">
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`e-${i}`} className="w-9 h-9" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const disabled = isDisabled(day);
                const selected = isSelected(day);
                const today = isToday(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(toISO(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)))}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all active:scale-90 ${
                      disabled
                        ? 'text-zinc-700 cursor-not-allowed'
                        : selected
                          ? 'bg-[#FFD300] text-black font-bold'
                          : today
                            ? 'border border-[#FFD300] text-[#FFD300] font-bold'
                            : 'text-zinc-200 hover-real:bg-zinc-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
