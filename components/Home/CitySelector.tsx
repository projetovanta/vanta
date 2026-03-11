import React from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import { useExtrasStore } from '../../stores/extrasStore';

export const CitySelector: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const selectedCity = useAuthStore(s => s.selectedCity);
  const onSelectCity = useAuthStore(s => s.setSelectedCity);
  const eventos = useExtrasStore(s => s.allEvents);
  const cidades = Array.from(new Set(eventos.map(e => e.cidade).filter(Boolean))).sort();
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[100] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" onClick={onClose} />
      <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-[85%] bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-top-2 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-black/50 rounded-full text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X size="0.875rem" />
        </button>
        <div className="p-4">
          <h4 style={TYPOGRAPHY.uiLabel} className="text-[0.4375rem] text-center opacity-40 mb-3">
            Selecionar Localidade
          </h4>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectCity('');
                onClose();
              }}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl ${!selectedCity ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'text-zinc-400'}`}
            >
              <div className="flex items-center">
                <MapPin size="0.75rem" className="mr-2.5" />
                <span className="text-[0.6875rem] font-bold uppercase">Todas as cidades</span>
              </div>
              {!selectedCity && <Check size="0.75rem" />}
            </button>
            {cidades.map(city => (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl ${selectedCity === city ? 'bg-[#FFD300]/10 text-[#FFD300]' : 'text-zinc-400'}`}
              >
                <div className="flex items-center">
                  <MapPin size="0.75rem" className="mr-2.5" />
                  <span className="text-[0.6875rem] font-bold uppercase">{city}</span>
                </div>
                {selectedCity === city && <Check size="0.75rem" />}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-black/40 border-t border-white/5 text-[0.5rem] font-black uppercase text-zinc-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
