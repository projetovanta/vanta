import React from 'react';
import { X, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

export const CityFilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  allCities: string[];
  selectedCities: string[];
  onToggleCity: (city: string) => void;
  onClear: () => void;
}> = ({ isOpen, onClose, allCities, selectedCities, onToggleCity, onClear }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[200] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" onClick={onClose} />
      <div className="absolute top-[10rem] left-0 right-0 flex justify-center px-6 animate-in slide-in-from-top-2 duration-500">
        <div className="w-full max-w-[320px] glass-premium rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900/80">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-xl italic text-white">
                  Localização
                </h2>
                <p className="text-[9px] text-[#FFD300] font-black uppercase tracking-widest mt-1">
                  Filtrar por cidade
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-black/50 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[40vh] overflow-y-auto no-scrollbar space-y-2">
              {allCities.map(c => (
                <button
                  key={c}
                  onClick={() => onToggleCity(c)}
                  className={`w-full p-4 rounded-xl flex justify-between items-center transition-all ${selectedCities.includes(c) ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]' : 'bg-black/40 border border-white/5 text-zinc-400'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{c}</span>
                  {selectedCities.includes(c) && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              onClear();
              onClose();
            }}
            className="w-full py-4 bg-black/60 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
          >
            Limpar Filtro
          </button>
        </div>
      </div>
    </div>
  );
};
