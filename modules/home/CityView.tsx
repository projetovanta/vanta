import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Evento, Parceiro } from '../../types';
import { EventCarousel } from './components/EventCarousel';
import { PartnerCard } from '../../components/PartnerCard';
import { ViewAllCard } from '../../components/ViewAllCard';
import { EventCardSkeleton } from '../../components/Skeleton';
import { vantaService } from '../../services/vantaService';
import { LazySection } from './components/LazySection';

interface CityViewProps {
  cidade: string;
  onBack: () => void;
  onEventClick: (e: Evento) => void;
  onComunidadeClick: (id: string) => void;
  onOpenAllEvents: (cidade: string) => void;
  onOpenAllPartners: (cidade: string) => void;
}

export const CityView: React.FC<CityViewProps> = ({
  cidade,
  onBack,
  onEventClick,
  onComunidadeClick,
  onOpenAllEvents,
  onOpenAllPartners,
}) => {
  const [proximos, setProximos] = useState<Evento[]>([]);
  const [passados, setPassados] = useState<Evento[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [heroFoto, setHeroFoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      vantaService.getEventosPorCidade(cidade, true, 9, 0),
      vantaService.getEventosPorCidade(cidade, false, 9, 0),
      vantaService.getParceirosPorCidade(cidade, 9, 0),
      vantaService.getCidadesComEventos(),
    ]).then(([prox, pass, parc, cidades]) => {
      if (cancelled) return;
      setProximos(prox);
      setPassados(pass);
      setParceiros(parc);
      const cidadeInfo = cidades.find(c => c.cidade === cidade);
      setHeroFoto(cidadeInfo?.fotoDestaque ?? prox[0]?.imagem);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cidade]);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Hero + Header */}
      <div className="shrink-0 relative">
        <div className="h-44 w-full overflow-hidden">
          <img src={heroFoto || '/icon-192.png'} alt={cidade} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>
        <div className="absolute top-0 left-0 right-0 px-5 pt-5 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size="1rem" className="text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white">
            {cidade}
          </h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="px-5 py-6">
            <EventCardSkeleton />
          </div>
        ) : (
          <>
            {/* Próximos Eventos */}
            {proximos.length > 0 && (
              <div className="py-4">
                <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm px-5 mb-3">
                  Próximos Eventos
                </h3>
                <EventCarousel
                  eventos={proximos}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  onViewAll={() => onOpenAllEvents(cidade)}
                  maxCards={9}
                />
              </div>
            )}

            {/* Locais Parceiros */}
            {parceiros.length > 0 && (
              <LazySection>
                <div className="py-4">
                  <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm px-5 mb-3">
                    Locais Parceiros
                  </h3>
                  <div className="overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 w-max px-5">
                      {parceiros.map(p => (
                        <PartnerCard key={p.id} parceiro={p} onClick={onComunidadeClick} />
                      ))}
                      {parceiros.length >= 9 && <ViewAllCard onClick={() => onOpenAllPartners(cidade)} />}
                    </div>
                  </div>
                </div>
              </LazySection>
            )}

            {/* Eventos Passados */}
            {passados.length > 0 && (
              <LazySection>
                <div className="py-4">
                  <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm px-5 mb-3">
                    Eventos Passados
                  </h3>
                  <EventCarousel
                    eventos={passados}
                    onEventClick={onEventClick}
                    onComunidadeClick={onComunidadeClick}
                    onViewAll={() => onOpenAllEvents(cidade)}
                    maxCards={9}
                  />
                </div>
              </LazySection>
            )}

            {/* Empty */}
            {proximos.length === 0 && passados.length === 0 && parceiros.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <p className="text-zinc-500 text-sm">Nenhum conteúdo para esta cidade ainda.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
