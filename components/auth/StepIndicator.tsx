import React from 'react';
import { Check } from 'lucide-react';

export const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse mt-1.5 px-1">{msg}</p>
  ) : null;

export const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center gap-3 mb-6">
    {[1, 2, 3].map(s => (
      <React.Fragment key={s}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            s < step
              ? 'bg-[#FFD300] border-[#FFD300]'
              : s === step
                ? 'bg-[#FFD300]/10 border-[#FFD300] text-[#FFD300]'
                : 'bg-zinc-900 border-white/10 text-zinc-600'
          }`}
        >
          {s < step ? <Check size={14} className="text-black" /> : <span className="text-[10px] font-black">{s}</span>}
        </div>
        {s < 3 && (
          <div className={`h-px w-10 transition-all duration-500 ${s < step ? 'bg-[#FFD300]' : 'bg-zinc-800'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);
