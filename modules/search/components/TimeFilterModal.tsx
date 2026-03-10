import React, { useState, useMemo } from 'react';
import { X, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { useModalBack } from '../../../hooks/useModalStack';

// Filtros predefinidos
const PRESET_FILTERS = [
  { id: 'Qualquer Data', label: 'Qualquer Data' },
  { id: 'Hoje', label: 'Hoje' },
  { id: 'Amanhã', label: 'Amanhã' },
  { id: 'Essa Semana', label: 'Essa Semana' },
  { id: 'Esse Fim de Semana', label: 'Esse Fim de Semana' },
  { id: 'Esse Mês', label: 'Esse Mês' },
] as const;

// ── Mini Calendário ──────────────────────────────────────────────────────────
const MiniCalendar: React.FC<{
  rangeStart: string | null;
  rangeEnd: string | null;
  onSelectDate: (date: string) => void;
}> = ({ rangeStart, rangeEnd, onSelectDate }) => {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = rangeStart ? new Date(rangeStart + 'T00:00:00') : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { days, weekDayHeaders } = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startWeekDay = firstDay.getDay(); // 0=dom
    const totalDays = lastDay.getDate();

    const headers = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const grid: (number | null)[] = [];
    for (let i = 0; i < startWeekDay; i++) grid.push(null);
    for (let d = 1; d <= totalDays; d++) grid.push(d);
    while (grid.length % 7 !== 0) grid.push(null);

    return { days: grid, weekDayHeaders: headers };
  }, [viewMonth]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  const prevMonth = () =>
    setViewMonth(p => (p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 }));
  const nextMonth = () =>
    setViewMonth(p => (p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 }));

  const toDateStr = (day: number) => {
    const m = String(viewMonth.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewMonth.year}-${m}-${d}`;
  };

  const isInRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const ds = toDateStr(day);
    return ds >= rangeStart && ds <= rangeEnd;
  };

  const isStart = (day: number) => rangeStart === toDateStr(day);
  const isEnd = (day: number) => rangeEnd === toDateStr(day);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-3">
      {/* Header mês */}
      <div className="flex items-center justify-between">
        <button
          aria-label="Voltar"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 active:scale-90 transition-all"
        >
          <ChevronLeft size={14} className="text-zinc-400" />
        </button>
        <p className="text-white text-xs font-bold">{monthLabel}</p>
        <button
          aria-label="Avançar"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 active:scale-90 transition-all"
        >
          <ChevronRight size={14} className="text-zinc-400" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDayHeaders.map((h, i) => (
          <div key={i} className="text-center text-[8px] text-zinc-400 font-black uppercase py-1">
            {h}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(day);
          const isPast = dateStr < todayStr;
          const inRange = isInRange(day);
          const start = isStart(day);
          const end = isEnd(day);
          const isSelected = start || end;

          return (
            <button
              key={i}
              onClick={() => !isPast && onSelectDate(dateStr)}
              disabled={isPast}
              className={`h-8 rounded-lg text-[11px] font-bold transition-all ${
                isSelected
                  ? 'bg-[#FFD300] text-black'
                  : inRange
                    ? 'bg-[#FFD300]/15 text-[#FFD300]'
                    : isPast
                      ? 'text-zinc-800 cursor-default'
                      : 'text-zinc-400 active:bg-white/5'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── TimeFilterModal ──────────────────────────────────────────────────────────
export const TimeFilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedTimeFilter: string | null;
  onSelectTimeFilter: (f: string | null) => void;
}> = ({ isOpen, onClose, selectedTimeFilter, onSelectTimeFilter }) => {
  useModalBack(isOpen, onClose, 'time-filter');
  const [showCalendar, setShowCalendar] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Inicializa range se já tem um selecionado
  const isRangeActive = selectedTimeFilter?.startsWith('RANGE:') ?? false;

  // Ao abrir, se o filtro ativo é range, popular os campos
  React.useEffect(() => {
    if (isOpen && selectedTimeFilter?.startsWith('RANGE:')) {
      const [, start, end] = selectedTimeFilter.split(':');
      setRangeStart(start);
      setRangeEnd(end);
      setShowCalendar(true);
    } else if (isOpen) {
      setShowCalendar(false);
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [isOpen, selectedTimeFilter]);

  const handleSelectDate = (date: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Primeiro clique ou reset
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      // Segundo clique
      if (date < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
    }
  };

  const handleApplyRange = () => {
    if (rangeStart && rangeEnd) {
      onSelectTimeFilter(`RANGE:${rangeStart}:${rangeEnd}`);
      onClose();
    }
  };

  const handlePreset = (id: string) => {
    if (id === 'Qualquer Data') {
      onSelectTimeFilter(null);
    } else {
      onSelectTimeFilter(id);
    }
    onClose();
  };

  const formatRange = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" onClick={onClose} />
      <div className="absolute top-[10rem] left-0 right-0 flex justify-center px-6 animate-in slide-in-from-top-2 duration-500">
        <div className="w-full max-w-[340px] glass-premium rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900/80">
          <div className="p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-xl italic text-white">
                  Período
                </h2>
                <p className="text-[9px] text-[#FFD300] font-black uppercase tracking-widest mt-1">Filtrar por data</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-black/50 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto no-scrollbar space-y-3">
              {!showCalendar ? (
                <>
                  {/* Presets */}
                  <div className="space-y-2">
                    {PRESET_FILTERS.map(f => {
                      const isActive = f.id === 'Qualquer Data' ? !selectedTimeFilter : selectedTimeFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => handlePreset(f.id)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]'
                              : 'bg-black/40 border border-white/5 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span>
                          </div>
                          {isActive && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Separador */}
                  <div className="h-px bg-white/5" />

                  {/* Botão intervalo customizado */}
                  <button
                    onClick={() => setShowCalendar(true)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                      isRangeActive
                        ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]'
                        : 'bg-black/40 border border-white/5 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {isRangeActive && rangeStart && rangeEnd
                          ? `${formatRange(rangeStart)} — ${formatRange(rangeEnd)}`
                          : 'Intervalo Personalizado'}
                      </span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  {/* Voltar */}
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1 active:text-white transition-colors"
                  >
                    <ChevronLeft size={12} /> Voltar
                  </button>

                  {/* Range labels */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`flex-1 text-center py-2 rounded-lg text-[10px] font-bold ${rangeStart ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20' : 'bg-black/40 text-zinc-400 border border-white/5'}`}
                    >
                      {rangeStart ? formatRange(rangeStart) : 'Início'}
                    </div>
                    <span className="text-zinc-400 text-[10px]">—</span>
                    <div
                      className={`flex-1 text-center py-2 rounded-lg text-[10px] font-bold ${rangeEnd ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/20' : 'bg-black/40 text-zinc-400 border border-white/5'}`}
                    >
                      {rangeEnd ? formatRange(rangeEnd) : 'Fim'}
                    </div>
                  </div>

                  {/* Calendário */}
                  <MiniCalendar rangeStart={rangeStart} rangeEnd={rangeEnd} onSelectDate={handleSelectDate} />

                  {/* Aplicar */}
                  <button
                    onClick={handleApplyRange}
                    disabled={!rangeStart || !rangeEnd}
                    className="w-full py-3.5 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-widest rounded-xl disabled:opacity-30 active:scale-[0.98] transition-all mt-2"
                  >
                    Aplicar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Limpar */}
          {!showCalendar && (
            <button
              onClick={() => {
                onSelectTimeFilter(null);
                onClose();
              }}
              className="w-full py-4 bg-black/60 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors"
            >
              Limpar Filtro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
