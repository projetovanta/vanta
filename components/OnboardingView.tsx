import React, { useState, useRef } from 'react';
import { Ticket, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';

const SLIDES = [
  {
    icon: Ticket,
    color: '#FFD300',
    title: 'Descubra Eventos',
    text: 'Encontre os melhores eventos da sua cidade. Filtre por categoria, data e localização.',
  },
  {
    icon: ShieldCheck,
    color: '#a78bfa',
    title: 'Carteira Digital',
    text: 'Seus ingressos seguros com QR anti-fraude. Transfira para amigos com um toque.',
  },
  {
    icon: Users,
    color: '#34d399',
    title: 'Comunidades',
    text: 'Siga comunidades e fique por dentro de tudo. Receba cortesias e promoções exclusivas.',
  },
  {
    icon: Sparkles,
    color: '#06b6d4',
    title: 'Sua Experiência',
    text: 'Avalie eventos, colecione conquistas e construa seu histórico VANTA.',
  },
];

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const isLast = current === SLIDES.length - 1;

  const next = () => {
    if (!isLast) setCurrent(c => c + 1);
  };
  const prev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) next();
    else prev();
  };

  return (
    <div
      className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pular */}
      <div className="shrink-0 flex justify-end px-6 pt-3">
        <button
          onClick={onComplete}
          className="py-2 px-4 text-zinc-400 text-[10px] font-black uppercase tracking-widest active:text-zinc-300 transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div
          className="flex w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div key={i} className="w-full shrink-0 flex flex-col items-center text-center px-4">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mb-10"
                style={{ backgroundColor: `${slide.color}15`, border: `2px solid ${slide.color}30` }}
              >
                <slide.icon size={44} style={{ color: slide.color }} />
              </div>
              <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-4 italic">
                {slide.title}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px]">{slide.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + Botão */}
      <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] space-y-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-[#FFD300]' : 'w-2 h-2 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={isLast ? onComplete : next}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
        >
          {isLast ? 'Começar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};
