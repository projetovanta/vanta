import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';

interface PickerItem {
  value: string;
  label: string;
}

interface VantaPickerModalProps {
  items: PickerItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
}

const PickerModal: React.FC<{
  items: PickerItem[];
  value: string;
  onChange: (value: string) => void;
  title: string;
  searchable: boolean;
  onClose: () => void;
}> = ({ items, value, onChange, title, searchable, onClose }) => {
  const [search, setSearch] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = search ? items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div className="absolute inset-0 z-[600] flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" role="presentation" onClick={onClose} />
      <div className="relative w-full max-w-[500px] bg-[#0A0A0A] border-t border-white/10 rounded-t-[2rem] animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-3">
          <h3 className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">{title}</h3>
          <button
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="0.875rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Search */}
        {searchable && (
          <div className="shrink-0 px-6 pb-3">
            <div className="relative">
              <Search size="0.875rem" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {filtered.length === 0 && <p className="text-zinc-400 text-xs text-center py-8">Nenhum resultado</p>}
          {filtered.map(item => {
            const selected = item.value === value;
            return (
              <button
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-0.5 transition-all active:scale-[0.98] ${
                  selected
                    ? 'bg-[#FFD300]/10 border border-[#FFD300]/20'
                    : 'border border-transparent active:bg-zinc-900/60'
                }`}
              >
                <span className={`text-sm font-medium ${selected ? 'text-[#FFD300]' : 'text-zinc-300'}`}>
                  {item.label}
                </span>
                {selected && <Check size="0.875rem" className="text-[#FFD300] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const VantaPickerModal: React.FC<VantaPickerModalProps> = ({
  items,
  value,
  onChange,
  label,
  placeholder = 'Selecione...',
  searchable = false,
  disabled = false,
  error = false,
}) => {
  const [open, setOpen] = useState(false);
  useModalBack(open, () => setOpen(false), 'vanta-picker');
  const selected = items.find(i => i.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        className={`w-full flex items-center justify-between bg-zinc-900/40 border rounded-xl p-4 text-left transition-all active:scale-[0.98] ${
          error ? 'border-red-500/40' : 'border-white/5'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <span className={`text-sm ${selected ? 'text-white font-medium' : 'text-zinc-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-zinc-400 shrink-0">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <PickerModal
          items={items}
          value={value}
          onChange={onChange}
          title={label}
          searchable={searchable}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
