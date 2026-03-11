import React, { useState, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';
import { useGeolocationPermission } from '../../../hooks/usePermission';

export const NearYouSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [asked, setAsked] = useState(false);
  const geo = useGeolocationPermission();

  const handleRequestLocation = () => {
    setAsked(true);
    geo.request({ enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }).then(coords => {
      if (coords) setUserLocation({ lat: coords.latitude, lng: coords.longitude });
    });
  };

  const nearbyEvents = useMemo(() => {
    if (!userLocation) return [];
    const R = 6371; // km
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    return eventos
      .filter(e => e.coords)
      .map(e => {
        const dLat = toRad(e.coords!.lat - userLocation.lat);
        const dLng = toRad(e.coords!.lng - userLocation.lng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(e.coords!.lat)) * Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { evento: e, distKm: dist };
      })
      .filter(x => x.distKm <= 50)
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 10);
  }, [eventos, userLocation]);

  // Antes de pedir GPS: mostra botão pra ativar
  if (!userLocation) {
    // Se não tem eventos com coords, nem mostra a seção
    if (!eventos.some(e => e.coords)) return null;
    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <Navigation size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Perto de Você
          </h3>
        </div>
        <div className="px-5">
          <button
            onClick={handleRequestLocation}
            disabled={asked}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-xs active:scale-95 transition-all disabled:opacity-50"
            aria-label="Ativar localização para ver eventos perto de você"
          >
            <MapPin size="0.875rem" className="text-[#FFD300]" />
            {asked ? 'Buscando sua localização...' : 'Ativar localização'}
          </button>
        </div>
      </div>
    );
  }

  if (nearbyEvents.length === 0) return null;

  return (
    /* px-5 individual — carrossel com edge-bleed, não usar px global */
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Navigation size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Perto de Você
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {nearbyEvents.map(({ evento, distKm }) => (
          <div key={evento.id} className="shrink-0 w-[42vw] max-w-[11.25rem] snap-start relative">
            <EventCard evento={evento} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
            <div className="absolute top-2 left-2 z-40 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full">
              <MapPin size="0.4375rem" className="text-[#FFD300]" />
              <span className="text-[0.4375rem] font-black text-white tracking-wider">
                {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
