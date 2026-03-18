import React, { useEffect, useMemo, useRef } from 'react';
import { Check, Clock } from 'lucide-react';

interface CelebrationScreenProps {
  title: string;
  subtitle?: string;
  icon?: 'check' | 'clock';
  actions: { label: string; onClick: () => void; variant: 'primary' | 'secondary' }[];
  autoCloseMs?: number;
  onClose?: () => void;
}

// Gera partículas com posições aleatórias (estáveis entre renders)
function useParticles(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 70 + 10}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, [count]);
}

export default function CelebrationScreen({
  title,
  subtitle,
  icon = 'check',
  actions,
  autoCloseMs,
  onClose,
}: CelebrationScreenProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (autoCloseMs && onClose) {
      timerRef.current = setTimeout(onClose, autoCloseMs);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [autoCloseMs, onClose]);

  const particles = useParticles(10);

  const isCheck = icon === 'check';

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-10 z-50">
      {/* Estilos de animação inline */}
      <style>{`
        @keyframes celebFloat {
          0% { transform: translateY(0px); opacity: var(--p-opacity); }
          100% { transform: translateY(-12px); opacity: calc(var(--p-opacity) * 0.4); }
        }
        @keyframes celebScaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes celebSlideUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes celebFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Particulas douradas */}
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'celebFadeIn 1s ease-out 300ms both' }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#FFD300]"
            style={
              {
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                '--p-opacity': p.opacity,
                animation: `celebFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
                opacity: p.opacity,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Icone central */}
      <div
        style={{ animation: 'celebScaleIn 500ms ease-out both' }}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          ${
            isCheck
              ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 shadow-[0_0_30px_rgba(255,211,0,0.15)]'
              : 'bg-zinc-800 border border-white/10'
          }
        `}
      >
        {isCheck ? <Check size={36} className="text-[#FFD300]" /> : <Clock size={36} className="text-zinc-400" />}
      </div>

      {/* Titulo */}
      <h1
        className="mt-6 text-white text-center font-bold italic text-[1.75rem] leading-tight"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          animation: 'celebSlideUp 500ms ease-out 200ms both',
        }}
      >
        {title}
      </h1>

      {/* Subtitulo */}
      {subtitle && (
        <p
          className="mt-2 text-zinc-400 text-sm text-center max-w-xs"
          style={{
            fontFamily: "'Inter', sans-serif",
            animation: 'celebFadeIn 500ms ease-out 300ms both',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Acoes */}
      <div className="flex gap-3 mt-8 w-full max-w-xs" style={{ animation: 'celebFadeIn 500ms ease-out 500ms both' }}>
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className={`
              flex-1 rounded-2xl py-4 text-[0.625rem] font-black uppercase tracking-widest
              transition-all duration-300 ease-out active:scale-[0.98]
              ${
                action.variant === 'primary'
                  ? 'bg-[#FFD300] text-black'
                  : 'bg-zinc-800 border border-white/10 text-zinc-400'
              }
            `}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
