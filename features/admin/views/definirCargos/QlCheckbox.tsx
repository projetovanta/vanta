import React from 'react';

export const QlCheckbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  sublabel?: string;
}> = ({ checked, onChange, label, sublabel }) => (
  <button type="button" onClick={onChange} className="w-full flex items-center gap-3 text-left">
    <span
      className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
        checked ? 'bg-[#FFD300] border-[#FFD300]' : 'bg-zinc-900 border-white/20'
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    <div className="min-w-0">
      <p className={`text-sm font-bold leading-none ${checked ? 'text-white' : 'text-zinc-400'}`}>{label}</p>
      {sublabel && <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">{sublabel}</p>}
    </div>
  </button>
);
