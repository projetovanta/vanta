import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PremiumCalendarProps {
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  /** Datas ISO (YYYY-MM-DD) que tem eventos — mostra dot indicador */
  eventDates?: Set<string>;
}

export const PremiumCalendar: React.FC<PremiumCalendarProps> = ({ onSelectDate, onClose, eventDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    dateToCheck.setHours(0, 0, 0, 0);
    const isPast = dateToCheck < today;
    const isToday = dateToCheck.getTime() === today.getTime();
    const dateISO = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const hasEvent = eventDates?.has(dateISO);

    days.push(
      <button
        key={i}
        disabled={isPast}
        onClick={() => {
          onSelectDate(dateToCheck);
          onClose();
        }}
        className={`relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all ${isPast ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-200 hover:bg-zinc-800'} ${isToday ? 'border border-[#FFD300] text-[#FFD300] font-bold shadow-[0_0_10px_rgba(255,211,0,0.2)]' : ''} active:scale-90`}
      >
        {i}
        {hasEvent && !isPast && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFD300]" />
        )}
      </button>,
    );
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    if (newDate < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    setCurrentDate(newDate);
  };

  const monthNames = [
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

  return (
    // lint-layout-ok — modal above Leaflet map
    <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#121212] border border-[#FFD300]/20 rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#FFD300] font-serif italic text-xl">Escolha a Data</h2>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-between items-center mb-4 px-2">
          <button onClick={() => changeMonth(-1)} className="p-1 text-zinc-400 hover:text-white">
            <ChevronLeft />
          </button>
          <span className="text-white font-bold uppercase tracking-widest text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-1 text-zinc-400 hover:text-white">
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
            <span key={idx} className="text-[10px] text-zinc-400 font-bold">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">{days}</div>
      </div>
    </div>
  );
};
