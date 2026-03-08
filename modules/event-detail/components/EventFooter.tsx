import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Evento } from '../../../types';

interface EventFooterProps {
  evento: Evento;
  minPrice: number;
  hasTicket: boolean;
  hasPresenca: boolean;
  onBuy: () => void;
  onConfirmarPresenca: () => void;
}

export const EventFooter: React.FC<EventFooterProps> = ({
  evento,
  minPrice,
  hasTicket,
  hasPresenca,
  onBuy,
  onConfirmarPresenca,
}) => (
  <div className="shrink-0 w-full p-4 bg-[#0a0a0a] border-t border-white/5 z-50 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">A partir de</p>
        <p className="text-xl font-serif font-bold text-[#FFD300] leading-tight">
          {evento.ocultarValor
            ? 'Sob Consulta'
            : minPrice > 0
              ? `R$ ${minPrice.toFixed(2).replace('.', ',')}`
              : 'Gratuito'}
        </p>
      </div>

      {hasTicket ? (
        <button className="px-6 py-3 bg-green-900/20 text-green-400 border border-green-500/30 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-default">
          <CheckCircle size={16} />
          Garantido
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onConfirmarPresenca}
            disabled={hasPresenca}
            className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all ${
              hasPresenca
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed'
                : 'bg-transparent text-white border-white/20 active:bg-white/10'
            }`}
          >
            {hasPresenca ? 'Confirmado' : 'Eu vou!'}
          </button>
          <button
            onClick={onBuy}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 transition-transform"
          >
            {evento.urlIngressos ? 'Comprar Fora' : 'Ver Ingressos'}
          </button>
        </div>
      )}
    </div>
  </div>
);
