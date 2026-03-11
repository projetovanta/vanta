import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useModalBack } from '../hooks/useModalStack';

interface VantaColorPickerProps {
  value: string; // hex
  onChange: (value: string) => void;
  className?: string;
}

const PALETTE = [
  '#FFD300',
  '#FF6B35',
  '#FF3366',
  '#E040FB',
  '#7C4DFF',
  '#536DFE',
  '#448AFF',
  '#00BCD4',
  '#00C853',
  '#76FF03',
  '#FFAB00',
  '#FF6D00',
  '#DD2C00',
  '#D500F9',
  '#651FFF',
  '#304FFE',
  '#0091EA',
  '#00BFA5',
  '#00C853',
  '#64DD17',
  '#FFFFFF',
  '#B0BEC5',
  '#78909C',
  '#546E7A',
  '#37474F',
  '#263238',
  '#1A1A1A',
  '#0A0A0A',
  '#000000',
  '#F5F5F5',
];

export const VantaColorPicker: React.FC<VantaColorPickerProps> = ({ value, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`flex items-center gap-2 ${className}`}>
        <div
          className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
          style={{ backgroundColor: value || '#FFD300' }}
        />
      </button>

      {open && (
        <ColorPickerModal
          value={value}
          onSelect={v => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

const ColorPickerModal: React.FC<{
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}> = ({ value, onSelect, onClose }) => {
  useModalBack(true, onClose, 'vanta-color-picker');
  const [hex, setHex] = useState(value || '#FFD300');

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-72 bg-[#121212] border border-[#FFD300]/20 rounded-3xl p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFD300] font-serif italic text-lg">Escolha a Cor</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center bg-zinc-900 rounded-full text-zinc-400 active:opacity-70 transition-opacity -mr-2"
          >
            <X size="1rem" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl border border-white/10" style={{ backgroundColor: hex }} />
          <input
            value={hex}
            onChange={e => setHex(e.target.value)}
            placeholder="#FFD300"
            className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-mono outline-none focus:border-[#FFD300]/30"
          />
        </div>

        {/* Palette */}
        <div className="grid grid-cols-10 gap-1.5 mb-4">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setHex(c)}
              className="w-6 h-6 rounded-md border transition-all active:scale-90"
              style={{
                backgroundColor: c,
                borderColor: hex.toLowerCase() === c.toLowerCase() ? '#FFD300' : 'rgba(255,255,255,0.1)',
                boxShadow: hex.toLowerCase() === c.toLowerCase() ? '0 0 6px rgba(255,211,0,0.5)' : 'none',
              }}
            >
              {hex.toLowerCase() === c.toLowerCase() && (
                <Check
                  size="0.625rem"
                  className="mx-auto"
                  style={{
                    color:
                      c === '#000000' || c === '#0A0A0A' || c === '#1A1A1A' || c === '#263238' ? '#FFD300' : '#000',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelect(hex)}
          className="w-full py-3 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};
