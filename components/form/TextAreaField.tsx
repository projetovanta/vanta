import React from 'react';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}

const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

const baseTextAreaCls =
  'w-full bg-zinc-900/60 border rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-zinc-600 resize-none transition-colors';

export default function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  required,
  maxLength,
  rows = 4,
  className,
}: TextAreaFieldProps) {
  const borderCls = error ? 'border-red-400/50' : 'border-white/5 focus:border-[#FFD300]/30';

  const pct = maxLength ? (value.length / maxLength) * 100 : 0;
  const counterColor = pct >= 100 ? 'text-red-400' : pct > 80 ? 'text-amber-500' : 'text-zinc-600';

  return (
    <div className={className}>
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#FFD300] ml-0.5">*</span>}
      </label>

      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`${baseTextAreaCls} ${borderCls}`}
        />

        {maxLength != null && (
          <span className={`absolute right-3 bottom-2 text-[0.625rem] pointer-events-none ${counterColor}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-[0.625rem] mt-1 animate-[fadeIn_150ms_ease-in]">{error}</p>}

      {!error && hint && <p className="text-zinc-600 text-[0.625rem] mt-1">{hint}</p>}
    </div>
  );
}
