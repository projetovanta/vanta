import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadAreaProps {
  label: string;
  aspectRatio?: string;
  currentUrl?: string;
  onSelect: (dataUrl: string) => void;
  maxSizeMB?: number;
  maxHeight?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export default function UploadArea({
  label,
  aspectRatio = '4/5',
  currentUrl,
  onSelect,
  maxSizeMB = 5,
  maxHeight,
  required,
  hint,
  error: externalError,
  className,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const error = externalError || internalError;

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input para permitir re-seleção do mesmo arquivo
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      setInternalError('Formato aceito: JPEG, PNG ou WebP');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    setInternalError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelect(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#FFD300] ml-0.5">*</span>}
      </label>

      {hint && !error && <p className="text-[0.625rem] text-zinc-600 mb-3">{hint}</p>}

      <button
        type="button"
        onClick={handleClick}
        className={`
          relative w-full overflow-hidden rounded-2xl
          transition-transform duration-300 ease-out
          active:scale-[0.99]
          ${error ? 'border border-red-400/50' : 'border border-dashed border-white/10'}
          ${currentUrl ? '' : 'bg-zinc-900/30'}
        `}
        style={{
          aspectRatio,
          ...(maxHeight ? { maxHeight } : {}),
        }}
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[0.5625rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
              Trocar foto
            </span>
          </>
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Upload size={32} className="text-zinc-500" />
            <span className="text-zinc-400 text-[0.5625rem] font-medium">Toque para escolher</span>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-red-400 text-[0.625rem] mt-1 animate-[fadeIn_150ms_ease-in]">{error}</p>}
    </div>
  );
}
