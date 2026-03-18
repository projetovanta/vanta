import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TYPOGRAPHY } from '../../../constants';
import { adminService } from '../../../features/admin/services/adminService';
import { VantaIndicaCard } from '../../../types';
import { OptimizedImage } from '../../../components/OptimizedImage';

interface HighlightsProps {
  currentCity: string;
  onEventoClick?: (eventoId: string) => void;
  onComemorarClick?: (comunidadeId?: string) => void;
  onComunidadeClick?: (comunidadeId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToProfile?: (sub: string) => void;
}

const BADGE_COLORS: Record<string, string> = {
  EVENTO: 'bg-emerald-500/80 text-white border border-emerald-400/30',
  DESTAQUE_EVENTO: 'bg-emerald-500/80 text-white border border-emerald-400/30',
  PARCEIRO: 'bg-amber-500/80 text-black border border-amber-400/30',
  MAIS_VANTA: 'bg-[#FFD300]/90 text-black border border-[#FFD300]/40',
  PUBLICIDADE: 'bg-[#FFD300]/80 text-black border border-[#FFD300]/30',
  EXPERIENCIA: 'bg-purple-500/80 text-white border border-purple-400/30',
  INFORMATIVO: 'bg-zinc-700/80 text-white border border-white/10',
};

export const Highlights: React.FC<HighlightsProps> = React.memo(
  ({ currentCity, onEventoClick, onComemorarClick, onComunidadeClick, onNavigateToTab, onNavigateToProfile }) => {
    const [allCards, setAllCards] = useState<VantaIndicaCard[]>([]);

    useEffect(() => {
      void adminService.refreshIndicaCards().then(() => {
        const cards = adminService.getIndicaCards();
        setAllCards(cards);
        // Primeiro card usa loading="eager" — preload manual não é necessário
      });
    }, []);

    const slides = allCards.filter(
      c => c.ativo && (!currentCity || c.alvoLocalidades.includes('GLOBAL') || c.alvoLocalidades.includes(currentCity)),
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const autoPlayTimer = useRef<number | null>(null);

    const nextSlide = useCallback(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
      setActiveIndex(prev => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
      if (!isPaused && !isDragging && slides.length > 1) {
        autoPlayTimer.current = window.setInterval(nextSlide, 5000);
      }
      return () => {
        if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      };
    }, [nextSlide, isPaused, isDragging, slides.length]);

    const handleStart = (clientX: number) => {
      dragStartX.current = clientX;
      setIsDragging(true);
      setIsPaused(true);
    };
    const handleMove = (clientX: number) => {
      if (!isDragging) return;
      setDragOffset(clientX - dragStartX.current);
    };
    const handleEnd = () => {
      if (!isDragging) return;
      const threshold = 60;
      if (dragOffset > threshold) prevSlide();
      else if (dragOffset < -threshold) nextSlide();
      setIsDragging(false);
      setDragOffset(0);
      setTimeout(() => setIsPaused(false), 3000);
    };

    const handleCardClick = (item: (typeof slides)[0]) => {
      const acao = item.acao;
      if (!acao && !item.acaoLink) return;

      if (acao) {
        switch (acao.tipo) {
          case 'evento':
            onEventoClick?.(acao.valor);
            return;
          case 'comemorar':
            onComemorarClick?.(acao.valor);
            return;
          case 'comunidade':
            onComunidadeClick?.(acao.valor);
            return;
          case 'rota': {
            const val = acao.valor;
            if (val.startsWith('tab:')) {
              onNavigateToTab?.(val.replace('tab:', ''));
            } else if (val.startsWith('perfil:')) {
              onNavigateToProfile?.(val.replace('perfil:', ''));
            } else if (val === 'comemorar') {
              onComemorarClick?.();
            }
            return;
          }
          case 'cupom':
            // Cupom: navega pra busca com cupom pré-aplicado (futuro)
            // Por enquanto, abre link se existir
            break;
          case 'link':
            break;
        }
      }

      if (item.acaoLink) {
        window.open(item.acaoLink, '_blank', 'noopener,noreferrer');
      }
    };

    if (slides.length === 0) return null;

    return (
      /* px-5 individual — carrossel com edge-bleed, não usar px global */
      <div className="relative w-full pt-2 mb-2 overflow-x-hidden select-none">
        <div className="px-5 mb-4 text-center">
          <h2 style={TYPOGRAPHY.sectionKicker} className="opacity-50">
            Vanta Indica
          </h2>
        </div>
        <div
          className="relative w-full overflow-hidden touch-pan-y"
          onMouseDown={e => handleStart(e.clientX)}
          onMouseMove={e => handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={e => handleStart(e.touches[0].clientX)}
          onTouchMove={e => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          <div
            className={`flex w-full ${!isDragging ? 'transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]' : ''}`}
            style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` }}
          >
            {slides.map((item, idx) => (
              <div
                key={item.id}
                className="min-w-full px-5 shrink-0 overflow-hidden py-2"
                onClick={() => handleCardClick(item)}
              >
                <div
                  className={`relative w-full rounded-[2rem] overflow-hidden glass-card shadow-lg transition-transform duration-200 ${item.acaoLink ? 'active:scale-[0.98] cursor-pointer' : ''}`}
                  style={{ aspectRatio: '5 / 3', containerType: 'inline-size' }}
                >
                  {item.imagem ? (
                    <OptimizedImage
                      src={item.imagem}
                      alt={item.titulo}
                      width={400}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {item.badge && (
                    <div
                      style={
                        item.layoutConfig?.badge
                          ? {
                              position: 'absolute' as const,
                              left: `${item.layoutConfig.badge.x}%`,
                              top: `${item.layoutConfig.badge.y}%`,
                              transform: `scale(${item.layoutConfig?.badgeScale ?? 1})`,
                              transformOrigin: 'top left',
                            }
                          : {
                              position: 'absolute' as const,
                              bottom: '18%',
                              left: '5%',
                              transform: `translateY(${item.layoutConfig?.badgeY ?? 0}px)`,
                            }
                      }
                    >
                      <span
                        style={{
                          fontSize: '2.1cqw',
                          lineHeight: 1,
                          ...(item.layoutConfig?.badgeColor
                            ? {
                                backgroundColor: item.layoutConfig.badgeColor + 'cc',
                                borderColor: item.layoutConfig.badgeColor + '50',
                              }
                            : {}),
                        }}
                        className={`${item.layoutConfig?.badgeColor ? 'text-black border' : (BADGE_COLORS[item.tipo] ?? 'bg-[#FFD300]/80 text-black border border-[#FFD300]/30')} font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg backdrop-blur-md`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}
                  {item.titulo && (
                    <div
                      style={
                        item.layoutConfig?.titulo
                          ? {
                              position: 'absolute' as const,
                              left: `${item.layoutConfig.titulo.x}%`,
                              top: `${item.layoutConfig.titulo.y}%`,
                              transform: `scale(${item.layoutConfig?.tituloScale ?? 1})`,
                              transformOrigin: 'top left',
                            }
                          : {
                              position: 'absolute' as const,
                              bottom: '8%',
                              left: '5%',
                              transform: `translateY(${item.layoutConfig?.tituloY ?? 0}px)`,
                            }
                      }
                      className="max-w-[95%]"
                    >
                      <h2
                        style={{
                          ...TYPOGRAPHY.screenTitle,
                          fontSize: `${item.layoutConfig?.tituloFontSize ?? 5.3}cqw`,
                          lineHeight: 1.2,
                        }}
                        className="drop-shadow-lg truncate"
                      >
                        {item.titulo}
                      </h2>
                    </div>
                  )}
                  {item.subtitulo && (
                    <div
                      style={
                        item.layoutConfig?.subtitulo
                          ? {
                              position: 'absolute' as const,
                              left: `${item.layoutConfig.subtitulo.x}%`,
                              top: `${item.layoutConfig.subtitulo.y}%`,
                              transform: `scale(${item.layoutConfig?.subtituloScale ?? 1})`,
                              transformOrigin: 'top left',
                            }
                          : {
                              position: 'absolute' as const,
                              bottom: '2%',
                              left: '5%',
                              transform: `translateY(${item.layoutConfig?.subtituloY ?? 0}px)`,
                            }
                      }
                      className="max-w-[95%]"
                    >
                      <p
                        style={{
                          fontSize: `${item.layoutConfig?.subtituloFontSize ?? 2.6}cqw`,
                          lineHeight: `${(item.layoutConfig?.subtituloFontSize ?? 2.6) * 1.6}cqw`,
                          fontStyle: 'italic',
                        }}
                        className="text-[#FFD300] font-semibold leading-relaxed drop-shadow-md"
                      >
                        {item.subtitulo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {slides.length > 1 && (
          <div className="flex justify-center mt-3 space-x-1.5 pb-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${activeIndex === idx ? 'w-6 bg-[#FFD300] shadow-[0_0_8px_rgba(255,211,0,0.5)]' : 'w-2 bg-zinc-600'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
