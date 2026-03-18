import React, { useMemo, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Ingresso } from '../../types';

const eventoId = window.location.pathname.split('/checkout/')[1]?.split('?')[0]?.split('/')[0] ?? '';

// ── Confete simples ─────────────────────────────────────────────────────────
const Confetti: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
        color: ['#FFD300', '#FFD300', '#B8860B', '#FFFFFF', '#a855f7'][i % 5],
        size: 4 + Math.random() * 6,
      })),
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.9,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100dvh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall { animation: confetti-fall linear forwards; }
      `}</style>
    </div>
  );
};

// ── QR Grid ──────────────────────────────────────────────────────────────────
const QRGrid: React.FC<{ seed: string }> = ({ seed }) => {
  const bits = useMemo(
    () => Array.from({ length: 49 }, (_, i) => (seed.charCodeAt(i % seed.length) ^ (i * 37)) % 2 === 0),
    [seed],
  );
  return (
    <div className="bg-white rounded-xl p-2.5 inline-flex">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 0.75rem)' }}>
        {bits.map((on, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${on ? 'bg-black' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
};

// ── Success Screen ───────────────────────────────────────────────────────────
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
      <Confetti />

      {/* Header celebratório */}
      <div className="relative flex flex-col items-center pt-16 px-6 pb-6 text-center shrink-0">
        <div className="w-20 h-20 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mb-5">
          <Sparkles size="2rem" className="text-[#FFD300]" />
        </div>
        <p className="font-serif text-2xl text-white mb-2">Presença garantida!</p>
        <p className="text-zinc-400 text-sm">
          {titulo} · {data}
        </p>
        <button
          onClick={handleShare}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full active:scale-95 transition-all"
        >
          <span className="text-xs font-bold text-zinc-300">Compartilhar</span>
        </button>
      </div>

      {/* Ingressos */}
      <div className="flex-1 overflow-y-auto px-5 space-y-3">
        {tickets.map((t, i) => (
          <div key={t.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <QRGrid seed={t.codigoQR} />
            <div className="min-w-0">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-0.5">
                Ingresso {tickets.length > 1 ? i + 1 : ''}
              </p>
              <p className="text-white font-mono text-xs font-bold truncate">{t.codigoQR}</p>
              {t.variacaoLabel && <p className="text-zinc-400 text-[0.5625rem] mt-0.5">{t.variacaoLabel}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-5 bg-[#0A0A0A]">
        <button
          onClick={() => window.close()}
          className="w-full py-4 bg-[#FFD300] rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-black active:scale-95 transition-all"
        >
          Ver meu ingresso
        </button>
        <p className="text-center text-zinc-600 text-[0.5625rem] mt-2">
          Seus ingressos já aparecem na sua experiência no app.
        </p>
      </div>
    </div>
  );
};
