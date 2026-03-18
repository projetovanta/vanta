import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: 'text' | 'number' | 'tel' | 'email';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

const baseInputCls =
  'w-full bg-zinc-900/60 border rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-zinc-600 transition-colors';

export default function InputField({
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  inputMode,
  placeholder,
  required,
  disabled,
  maxLength,
  prefix,
  suffix,
  className,
}: InputFieldProps) {
  const borderCls = error ? 'border-red-400/50' : 'border-white/5 focus:border-[#FFD300]/30';

  const disabledCls = disabled ? 'opacity-40 cursor-not-allowed' : '';

  const showCounter = maxLength != null && !suffix;

  return (
    <div className={className}>
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#FFD300] ml-0.5">*</span>}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseInputCls} ${borderCls} ${disabledCls} ${prefix ? 'pl-10' : ''} ${suffix || showCounter ? 'pr-14' : ''}`}
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}

        {showCounter && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[0.625rem] pointer-events-none">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {error && <p className="text-red-400 text-[0.625rem] mt-1 animate-[fadeIn_150ms_ease-in]">{error}</p>}

      {!error && hint && <p className="text-zinc-600 text-[0.625rem] mt-1">{hint}</p>}
    </div>
  );
}
