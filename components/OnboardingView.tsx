import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Ticket, ShieldCheck, Users, Sparkles, MapPin, ChevronDown, Check } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { ESTADOS_CIDADES, ESTADOS } from '../data/brData';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabaseClient';

// ── Slides de apresentação ──────────────────────────────────────────────────

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

// ── Tipos ───────────────────────────────────────────────────────────────────

interface InteresseDB {
  id: string;
  label: string;
  icone: string;
}

type Step = 'SLIDES' | 'CIDADE' | 'INTERESSES' | 'DONE';

// ── Componente ──────────────────────────────────────────────────────────────

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('SLIDES');
  const [slideIdx, setSlideIdx] = useState(0);
  const touchStartX = useRef(0);

  // Cidade
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [showEstados, setShowEstados] = useState(false);
  const [showCidades, setShowCidades] = useState(false);

  // Interesses
  const [interesses, setInteresses] = useState<InteresseDB[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingInteresses, setLoadingInteresses] = useState(true);

  const userId = useAuthStore(s => s.currentAccount?.id);
  const setSelectedCity = useAuthStore(s => s.setSelectedCity);
  const updateProfile = useAuthStore(s => s.updateProfile);

  // Pré-carregar interesses enquanto o usuário vê os slides
  useEffect(() => {
    supabase
      .from('interesses')
      .select('id, label, icone')
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .then(({ data }) => {
        if (data) setInteresses(data as InteresseDB[]);
        setLoadingInteresses(false);
      });
  }, []);

  // ── Slides ────────────────────────────────────────────────────────────────

  const isLastSlide = slideIdx === SLIDES.length - 1;

  const nextSlide = () => {
    if (isLastSlide) setStep('CIDADE');
    else setSlideIdx(s => s + 1);
  };
  const prevSlide = () => {
    if (slideIdx > 0) setSlideIdx(s => s - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) nextSlide();
    else prevSlide();
  };

  // ── Salvar e finalizar ────────────────────────────────────────────────────

  const handleFinish = useCallback(async () => {
    setStep('DONE');

    // Salvar no banco
    if (userId) {
      const updates: Record<string, unknown> = {};
      if (estado) updates.estado = estado;
      if (cidade) updates.cidade = cidade;
      if (selected.length > 0) updates.interesses = selected;

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', userId);
      }
    }

    // Salvar na store
    if (cidade) setSelectedCity(cidade);
    if (selected.length > 0) updateProfile({ interesses: selected });

    // Transição de 2s
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [userId, estado, cidade, selected, setSelectedCity, updateProfile, onComplete]);

  // ── RENDER: Slides ────────────────────────────────────────────────────────

  if (step === 'SLIDES') {
    return (
      <div
        className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="shrink-0 flex justify-end px-6 pt-3">
          <button
            onClick={() => setStep('CIDADE')}
            className="py-2 px-4 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:text-zinc-300 transition-colors"
          >
            Pular
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slideIdx * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div key={i} className="w-full shrink-0 flex flex-col items-center text-center px-4">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-10"
                  style={{ backgroundColor: `${slide.color}15`, border: `2px solid ${slide.color}30` }}
                >
                  <slide.icon size="2.75rem" style={{ color: slide.color }} />
                </div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-4 italic">
                  {slide.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[17.5rem]">{slide.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] space-y-6">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIdx ? 'w-6 h-2 bg-[#FFD300]' : 'w-2 h-2 bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            {isLastSlide ? 'Próximo' : 'Próximo'}
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Cidade ──────────────────────────────────────────────────────

  if (step === 'CIDADE') {
    const cidades = estado ? (ESTADOS_CIDADES[estado] ?? []) : [];

    return (
      <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-6">
            <MapPin size="1.75rem" className="text-[#FFD300]" />
          </div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2 italic">
            De que cidade você é?
          </h2>
          <p className="text-zinc-400 text-sm">Vamos mostrar eventos perto de você</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-8 space-y-4">
          {/* Estado */}
          <div>
            <label className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-widest mb-1.5 block">
              Estado
            </label>
            <button
              onClick={() => setShowEstados(!showEstados)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3.5 text-left flex items-center justify-between"
            >
              <span className={estado ? 'text-white text-sm' : 'text-zinc-600 text-sm'}>
                {estado || 'Selecione o estado'}
              </span>
              <ChevronDown size="1rem" className="text-zinc-500" />
            </button>
            {showEstados && (
              <div className="mt-1 bg-zinc-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto no-scrollbar">
                {ESTADOS.map(uf => (
                  <button
                    key={uf}
                    onClick={() => {
                      setEstado(uf);
                      setCidade('');
                      setShowEstados(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-white/5 last:border-0 ${
                      uf === estado ? 'text-[#FFD300] bg-[#FFD300]/5' : 'text-zinc-300'
                    }`}
                  >
                    {uf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cidade */}
          {estado && (
            <div>
              <label className="text-zinc-500 text-[0.625rem] font-bold uppercase tracking-widest mb-1.5 block">
                Cidade
              </label>
              <button
                onClick={() => setShowCidades(!showCidades)}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3.5 text-left flex items-center justify-between"
              >
                <span className={cidade ? 'text-white text-sm' : 'text-zinc-600 text-sm'}>
                  {cidade || 'Selecione a cidade'}
                </span>
                <ChevronDown size="1rem" className="text-zinc-500" />
              </button>
              {showCidades && (
                <div className="mt-1 bg-zinc-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto no-scrollbar">
                  {cidades.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setCidade(c);
                        setShowCidades(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-white/5 last:border-0 ${
                        c === cidade ? 'text-[#FFD300] bg-[#FFD300]/5' : 'text-zinc-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] pt-4">
          <button
            onClick={() => setStep('INTERESSES')}
            disabled={!cidade}
            className={`w-full py-4 font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all ${
              cidade ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Próximo
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Interesses ────────────────────────────────────────────────────

  if (step === 'INTERESSES') {
    return (
      <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-4 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles size="1.75rem" className="text-purple-400" />
          </div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2 italic">
            O que você curte?
          </h2>
          <p className="text-zinc-400 text-sm">Selecione seus interesses pra gente personalizar</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4">
          {loadingInteresses ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {interesses.map(item => {
                const isSelected = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setSelected(s => (s.includes(item.id) ? s.filter(x => x !== item.id) : [...s, item.id]))
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-white'
                        : 'bg-zinc-900/60 border-white/5 text-zinc-400'
                    }`}
                  >
                    {item.icone && <span className="text-base">{item.icone}</span>}
                    <span className="text-sm font-medium">{item.label}</span>
                    {isSelected && <Check size="0.75rem" className="text-[#FFD300]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] pt-4 space-y-3">
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            {selected.length > 0 ? 'Vamos lá!' : 'Pular'}
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Done ──────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 z-[400] bg-[#050505] flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-[#FFD300]/15 border-2 border-[#FFD300]/30 flex items-center justify-center mx-auto mb-6">
          <Check size="2.5rem" className="text-[#FFD300]" />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white italic">
          Tudo pronto!
        </h2>
        <p className="text-zinc-400 text-sm mt-2">Preparando seus eventos...</p>
      </div>
    </div>
  );
};
