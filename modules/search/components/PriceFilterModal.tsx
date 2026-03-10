import React, { useState } from 'react';
import { X, DollarSign, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { useModalBack } from '../../../hooks/useModalStack';
import { VantaSlider } from '../../../components/VantaSlider';

interface PriceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxPrice: number | null;
  onSelectMaxPrice: (price: number | null) => void;
}

const QUICK_PRICES = [
  { label: 'Até R$ 100', value: 100 },
  { label: 'Até R$ 250', value: 250 },
  { label: 'Até R$ 500', value: 500 },
  { label: 'Acima de R$ 500', value: 5000 },
];

export const PriceFilterModal: React.FC<PriceFilterModalProps> = ({ isOpen, onClose, maxPrice, onSelectMaxPrice }) => {
  useModalBack(isOpen, onClose, 'price-filter');
  const [tempPrice, setTempPrice] = useState<number>(maxPrice || 1000);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectMaxPrice(tempPrice);
    onClose();
  };

  const handleClear = () => {
    onSelectMaxPrice(null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[200] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" onClick={onClose} />
      <div className="absolute top-[10rem] left-0 right-0 flex justify-center px-6 animate-in slide-in-from-top-2 duration-500">
        <div className="w-full max-w-[320px] glass-premium rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900/80">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-xl italic text-white">
                  Investimento
                </h2>
                <p className="text-[9px] text-[#FFD300] font-black uppercase tracking-widest mt-1">Filtrar por valor</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-black/50 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Valor Máximo</span>
                <span className="text-xl font-serif font-bold text-white">
                  {tempPrice >= 5000 ? 'R$ 5000+' : `R$ ${tempPrice}`}
                </span>
              </div>

              <div className="relative pt-2">
                <VantaSlider
                  min={0}
                  max={5000}
                  step={50}
                  value={tempPrice}
                  onChange={setTempPrice}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {QUICK_PRICES.map(price => (
                  <button
                    key={price.value}
                    onClick={() => setTempPrice(price.value)}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                      tempPrice === price.value
                        ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                        : 'bg-black/40 border-white/5 text-zinc-400'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider">{price.label}</span>
                    {tempPrice === price.value && <Check size={12} className="text-[#FFD300]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex border-t border-white/5">
            <button
              onClick={handleClear}
              className="flex-1 py-4 bg-black/60 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-4 bg-[#FFD300] text-[9px] font-black uppercase tracking-[0.2em] text-black transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
