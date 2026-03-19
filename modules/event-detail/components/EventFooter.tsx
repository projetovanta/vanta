import React, { useState } from 'react';
import { CheckCircle, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { Evento } from '../../../types';

interface EventFooterProps {
  evento: Evento;
  minPrice: number;
  hasTicket: boolean;
  hasPresenca: boolean;
  capacityPct?: number;
  temBeneficioMV?: boolean;
  beneficioMVDetalhe?: string;
  onBuy: () => void;
  onConfirmarPresenca: () => void;
}

export const EventFooter: React.FC<EventFooterProps> = ({
  evento,
  minPrice,
  hasTicket,
  hasPresenca,
  capacityPct,
  temBeneficioMV,
  beneficioMVDetalhe,
  onBuy,
  onConfirmarPresenca,
}) => {
  const isFree = !evento.ocultarValor && minPrice === 0;
  const isLotando = (capacityPct ?? 0) >= 80;
  const [showBeneficioDetalhe, setShowBeneficioDetalhe] = useState(false);

  return (
    <div className="shrink-0 w-full p-4 bg-[#0a0a0a] border-t border-white/5 z-50 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <p className="text-[0.625rem] text-zinc-400 uppercase font-bold tracking-wider">A partir de</p>
          <p className="text-xl font-serif text-[#FFD300] leading-tight">
            {evento.ocultarValor
              ? 'Sob Consulta'
              : minPrice > 0
                ? `R$ ${minPrice.toFixed(2).replace('.', ',')}`
                : 'Entrada VIP'}
          </p>
          {isLotando && !hasTicket && (
            <p className="text-[0.5rem] font-bold uppercase tracking-widest text-red-400 mt-0.5">Últimas vagas</p>
          )}
        </div>

        {hasTicket ? (
          <div className="flex gap-2">
            {/* Eu vou! sempre visível — declaração social */}
            <button
              onClick={onConfirmarPresenca}
              disabled={hasPresenca}
              className={`px-4 py-3 rounded-xl font-bold text-[0.625rem] uppercase tracking-widest border transition-all ${
                hasPresenca
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed'
                  : 'bg-transparent text-white border-white/20 active:bg-white/10'
              }`}
            >
              {hasPresenca ? 'Confirmado' : 'Eu vou!'}
            </button>
            <button className="px-6 py-3 bg-green-900/20 text-green-400 border border-green-500/30 rounded-xl font-bold text-[0.625rem] uppercase tracking-widest flex items-center gap-2 cursor-default">
              <CheckCircle size="1rem" />
              Garantido
            </button>
          </div>
        ) : isFree ? (
          /* Gratuito: "Eu vou!" é o botão principal dourado */
          <button
            onClick={onConfirmarPresenca}
            disabled={hasPresenca}
            className={`px-6 py-3 rounded-xl font-bold text-[0.625rem] uppercase tracking-widest transition-all ${
              hasPresenca
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-[#FFD300] text-black shadow-[0_0_20px_rgba(255,211,0,0.3)] active:scale-95'
            }`}
          >
            {hasPresenca ? 'Confirmado ✓' : 'Eu vou!'}
          </button>
        ) : (
          /* Pago: "Eu vou!" secundário + "Garantir Ingresso" dourado */
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={onConfirmarPresenca}
                disabled={hasPresenca}
                className={`px-4 py-3 rounded-xl font-bold text-[0.625rem] uppercase tracking-widest border transition-all ${
                  hasPresenca
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed'
                    : 'bg-transparent text-white border-white/20 active:bg-white/10'
                }`}
              >
                {hasPresenca ? 'Confirmado' : 'Eu vou!'}
              </button>
              <button
                onClick={onBuy}
                className="px-5 py-3 bg-[#FFD300] rounded-xl font-bold text-[0.625rem] uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,211,0,0.3)] active:scale-95 transition-transform"
              >
                {evento.urlIngressos ? 'Comprar Fora' : 'Garantir Ingresso'}
              </button>
            </div>
            {temBeneficioMV && (
              <button onClick={() => setShowBeneficioDetalhe(p => !p)} className="flex items-center gap-1.5 self-end">
                <Crown size={16} className="text-[#FFD300] shrink-0" />
                <span className="text-[#FFD300] text-[0.625rem] font-bold">Você tem benefício</span>
                {showBeneficioDetalhe ? (
                  <ChevronUp size={12} className="text-[#FFD300]" />
                ) : (
                  <ChevronDown size={12} className="text-[#FFD300]" />
                )}
              </button>
            )}
            {temBeneficioMV && showBeneficioDetalhe && beneficioMVDetalhe && (
              <div className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl p-4 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-zinc-300 text-xs leading-relaxed">{beneficioMVDetalhe}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
