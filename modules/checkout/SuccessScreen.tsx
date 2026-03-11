import React, { useMemo } from 'react';
import { Check, Share2 } from 'lucide-react';
import type { Ingresso } from '../../types';

const eventoId = window.location.pathname.split('/checkout/')[1]?.split('?')[0]?.split('/')[0] ?? '';

const QRGrid: React.FC<{ seed: string; size?: 'sm' | 'lg' }> = ({ seed, size = 'lg' }) => {
  const bits = useMemo(
    () => Array.from({ length: 49 }, (_, i) => (seed.charCodeAt(i % seed.length) ^ (i * 37)) % 2 === 0),
    [seed],
  );
  const cell = size === 'lg' ? 'w-5 h-5' : 'w-3 h-3';
  return (
    <div className="bg-white rounded-xl p-3 inline-flex">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(7, ${size === 'lg' ? '1.25rem' : '0.75rem'})` }}
      >
        {bits.map((on, i) => (
          <div key={i} className={`${cell} rounded-[2px] ${on ? 'bg-black' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
};

interface Props {
  tickets: Ingresso[];
  titulo: string;
  data: string;
}

export const SuccessScreen: React.FC<Props> = ({ tickets, titulo, data }) => {
  const handleShare = async () => {
    const url = `https://maisvanta.com/event/${eventoId}`;
    const shareData = {
      title: titulo,
      text: `Eu vou pra "${titulo}"! Garanta o seu no VANTA`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelado */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${url}`);
      } catch {
        /* sem clipboard */
      }
    }
  };

  return (
    <div
      className="h-[100dvh] bg-[#0A0A0A] text-white flex flex-col overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex flex-col items-center pt-14 px-6 pb-6 text-center shrink-0">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <Check size="1.75rem" className="text-emerald-400" />
        </div>
        <p className="font-serif italic text-2xl text-white">
          {tickets.length === 1 ? 'Ingresso Confirmado!' : `${tickets.length} Ingressos Confirmados!`}
        </p>
        <p className="text-zinc-400 text-xs mt-1">
          {titulo} · {data}
        </p>
        <button
          onClick={handleShare}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-zinc-800/80 border border-white/10 rounded-full active:scale-95 transition-all"
        >
          <Share2 size="0.875rem" className="text-[#FFD300]" />
          <span className="text-xs font-bold text-white">Compartilhar</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-3">
        {tickets.map((t, i) => (
          <div key={t.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <QRGrid seed={t.codigoQR} size="sm" />
            <div className="min-w-0">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-0.5">
                Ingresso {i + 1}
              </p>
              <p className="text-white font-mono text-xs font-bold truncate">{t.codigoQR}</p>
              {t.variacaoLabel && <p className="text-zinc-400 text-[0.5625rem] mt-0.5">{t.variacaoLabel}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-4 bg-[#0A0A0A] border-t border-white/5 space-y-2">
        <button
          onClick={() => window.close()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-white active:scale-95 transition-all"
        >
          Voltar ao App
        </button>
        <p className="text-center text-zinc-700 text-[0.5625rem]">Seus ingressos já aparecem na Carteira do App.</p>
      </div>
    </div>
  );
};
