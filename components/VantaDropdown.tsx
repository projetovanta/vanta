import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/** Dropdown customizado — substitui <select> nativo para manter design Vanta */
export const VantaDropdown: React.FC<{
  value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, options, onChange, placeholder, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-1.5 bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs active:scale-[0.98] transition-all"
        style={selected?.color ? { color: selected.color, borderColor: selected.color + '40' } : undefined}
      >
        <span
          className={`truncate ${selected ? 'text-white' : 'text-zinc-400'}`}
          style={selected?.color ? { color: selected.color } : undefined}
        >
          {selected?.label || placeholder || 'Selecione'}
        </span>
        <ChevronDown size={12} className={`text-zinc-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
          {options.map(o => (
            <button
              type="button"
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2 transition-all ${
                o.value === value ? 'bg-white/5' : 'active:bg-white/5'
              }`}
              style={o.color ? { color: o.color } : undefined}
            >
              {o.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.color }} />}
              <span className={o.color ? '' : 'text-zinc-300'}>{o.label}</span>
              {o.value === value && <Check size={10} className="ml-auto text-[#FFD300]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
