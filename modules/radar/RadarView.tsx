import React from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import {
  Plus,
  Minus,
  ArrowRight,
  Crosshair,
  Calendar as CalendarIcon,
  RotateCcw,
  Loader2,
  Navigation,
  Radio,
  LocateFixed,
} from 'lucide-react';
import { Evento, TabState } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { MapController } from './components/MapController';
import { PremiumCalendar } from './components/PremiumCalendar';
import { createEventIcon, createUserIcon, createPartnerIcon } from './utils/mapIcons';
import { useRadarLogic } from './hooks/useRadarLogic';
import { useAuthStore } from '../../stores/authStore';
import { useGeolocationPermission } from '../../hooks/usePermission';
import { globalToast } from '../../components/Toast';

interface RadarViewProps {
  onEventSelect: (evento: Evento) => void;
  onNavigateToTab?: (tab: TabState) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ onEventSelect }) => {
  const userPhoto = useAuthStore(s => s.currentAccount.foto);
  const radar = useRadarLogic();
  const geo = useGeolocationPermission();
  const defaultCenter: [number, number] = [-23.5505, -46.6333];

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden animate-in fade-in">
      {/* Mapa */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%', background: '#0A0A0A' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
            maxZoom={20}
          />
          <MapController
            zoomAction={radar.zoomAction}
            activeEventCoords={radar.activeEvent?.coords || null}
            userLocation={radar.userLocation}
            closestEventCoords={radar.closestEventCoords}
            fallbackBounds={radar.fallbackBounds}
            selectedRadius={radar.selectedRadius}
          />
          {/* Círculo de raio visual */}
          {radar.userLocation && radar.selectedRadius && (
            <Circle
              center={[radar.userLocation.lat, radar.userLocation.lng]}
              radius={radar.selectedRadius * 1000}
              pathOptions={{
                color: '#FFD300',
                weight: 1,
                opacity: 0.4,
                fillColor: '#FFD300',
                fillOpacity: 0.05,
                dashArray: '6 4',
              }}
            />
          )}
          {radar.userLocation && (
            <Marker
              position={[radar.userLocation.lat, radar.userLocation.lng]}
              icon={createUserIcon(userPhoto)}
              zIndexOffset={2000}
            />
          )}
          {radar.filteredEvents.map(evento => {
            if (!evento.coords) return null;
            const isActive = radar.activeEventId === evento.id;
            const isLive = radar.isEventLive(evento);
            const isClosest = evento.id === radar.closestEventId;
            return (
              <Marker
                key={evento.id}
                position={[evento.coords.lat, evento.coords.lng]}
                icon={createEventIcon(evento.imagem, { isActive, isLive, isClosest })}
                zIndexOffset={isActive ? 1000 : isClosest ? 600 : 500}
                eventHandlers={{ click: () => radar.setActiveEventId(isActive ? null : evento.id) }}
              />
            );
          })}
          {/* Pins de parceiros MAIS VANTA */}
          {radar.parceiros.map(p => (
            <Marker
              key={`parceiro-${p.id}`}
              position={[p.coords.lat, p.coords.lng]}
              icon={createPartnerIcon(p.foto_url)}
              zIndexOffset={400}
            />
          ))}
        </MapContainer>
      </div>

      {/* Header unificado — título + filtros lint-layout-ok */}
      <div className="absolute top-3 left-0 right-0 z-[1000] pointer-events-none flex flex-col items-center gap-2 px-4">
        {/* Título + indicador */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1
              style={TYPOGRAPHY.screenTitle}
              className="text-2xl text-[#FFD300] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
            >
              Radar
            </h1>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${radar.filteredEvents.length > 0 ? 'bg-[#FFD300] animate-pulse shadow-[0_0_8px_#FFD300]' : 'bg-zinc-600'}`}
            ></span>
            <p className="text-[#FFD300] text-[0.625rem] uppercase tracking-widest font-bold drop-shadow-md">
              {radar.customDateLabel}
            </p>
          </div>
        </div>

        {/* Filtro de data */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-1 rounded-full flex items-center shadow-2xl">
            <button
              onClick={() => {
                radar.resetToToday();
                radar.setShowLiveOnly(false);
              }}
              className={`px-3 py-1.5 rounded-full text-[0.5625rem] font-bold uppercase tracking-widest transition-all ${radar.isToday && !radar.showLiveOnly ? 'bg-[#FFD300] text-black shadow-[0_0_15px_rgba(255,211,0,0.4)]' : 'text-zinc-400 hover:text-white'}`}
            >
              Hoje
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
            <button
              onClick={() => {
                radar.resetToToday();
                radar.setShowLiveOnly(true);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.5625rem] font-bold uppercase tracking-widest transition-all ${radar.showLiveOnly ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-zinc-400 hover:text-white'}`}
            >
              <Radio size="0.625rem" className={radar.showLiveOnly ? 'animate-pulse' : ''} />
              Ao Vivo
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                radar.handleDateSelect(d.toISOString().split('T')[0]);
                radar.setShowLiveOnly(false);
              }}
              className={`px-3 py-1.5 rounded-full text-[0.5625rem] font-bold uppercase tracking-widest transition-all ${radar.customDateLabel === 'Amanhã' && !radar.showLiveOnly ? 'bg-[#FFD300] text-black shadow-[0_0_15px_rgba(255,211,0,0.4)]' : 'text-zinc-400 hover:text-white'}`}
            >
              Amanhã
            </button>
            <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
            <button
              onClick={() => radar.setIsCalendarOpen(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.5625rem] font-bold uppercase tracking-widest transition-all ${!radar.isToday && radar.customDateLabel !== 'Amanhã' ? 'bg-[#FFD300] text-black shadow-[0_0_15px_rgba(255,211,0,0.4)]' : 'bg-transparent text-zinc-400 hover:text-white'}`}
            >
              <CalendarIcon size="0.625rem" />
              {!radar.isToday && radar.customDateLabel !== 'Amanhã' && <span>{radar.customDateLabel}</span>}
            </button>
          </div>
          {!radar.isToday && (
            <button
              onClick={radar.resetToToday}
              className="bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 text-[0.5rem] font-black uppercase tracking-[0.2em] text-[#FFD300] shadow-lg animate-in slide-in-from-top-2"
            >
              <RotateCcw size="0.625rem" />
              Voltar para Hoje
            </button>
          )}
        </div>

        {/* Filtro de raio */}
        {radar.userLocation ? (
          <div className="pointer-events-auto flex gap-1.5 justify-center">
            {[
              { label: 'Todos', value: null },
              { label: '5 km', value: 5 },
              { label: '10 km', value: 10 },
              { label: '25 km', value: 25 },
              { label: '50 km', value: 50 },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => radar.setSelectedRadius(opt.value)}
                className={`shrink-0 px-3 py-1 rounded-full text-[0.5rem] font-black uppercase tracking-widest transition-all border ${
                  radar.selectedRadius === opt.value
                    ? 'bg-[#FFD300] text-black border-[#FFD300] shadow-[0_0_8px_rgba(255,211,0,0.3)]'
                    : 'bg-black/70 backdrop-blur text-zinc-400 border-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="pointer-events-auto flex justify-center">
            <button
              onClick={() => {
                geo.request({ enableHighAccuracy: true, timeout: 10000 }).then(coords => {
                  if (coords) radar.setUserLocation({ lat: coords.latitude, lng: coords.longitude });
                  else globalToast('aviso', 'Permita o acesso à localização nas configurações do navegador.');
                });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFD300] text-black text-[0.5rem] font-black uppercase tracking-widest border border-[#FFD300] shadow-[0_0_8px_rgba(255,211,0,0.3)] active:scale-95 transition-all"
            >
              <LocateFixed size="0.75rem" />
              Ativar localização
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {radar.loading && radar.filteredEvents.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-full shadow-2xl animate-in zoom-in-95 duration-300">
            <Loader2 size="2rem" className="text-[#FFD300] animate-spin" />
          </div>
        </div>
      )}

      {/* Banner discreto — sem eventos para a data */}
      {!radar.loading && radar.filteredEvents.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl text-center animate-in zoom-in-95 duration-300 max-w-[16.25rem]">
            <p className="text-zinc-400 text-xs mb-3">
              Nenhum evento para <span className="text-white font-bold">{radar.customDateLabel}</span>
            </p>
            <button
              onClick={() => radar.findClosestEventGlobal()}
              className="text-[#FFD300] text-[0.625rem] font-black uppercase tracking-widest flex items-center gap-1.5 mx-auto active:opacity-50"
            >
              Ver próximo <ArrowRight size="0.75rem" />
            </button>
          </div>
        </div>
      )}

      {/* Botões laterais — zoom + recenter */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-[1000]">
        <button
          aria-label="Centralizar"
          onClick={radar.handleRecenter}
          className={`w-10 h-10 backdrop-blur border rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${radar.userLocation ? 'bg-zinc-900/90 border-[#FFD300]/30 text-[#FFD300] shadow-[#FFD300]/10' : 'bg-zinc-800/50 border-white/5 text-zinc-400'}`}
        >
          <Crosshair size="1.125rem" />
        </button>
        <div className="h-4" />
        <button
          onClick={() => radar.handleZoom('in')}
          className="w-10 h-10 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-zinc-300 shadow-lg active:bg-zinc-800"
        >
          <Plus size="1.125rem" />
        </button>
        <button
          onClick={() => radar.handleZoom('out')}
          className="w-10 h-10 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-zinc-300 shadow-lg active:bg-zinc-800"
        >
          <Minus size="1.125rem" />
        </button>
      </div>

      {/* Calendário */}
      {radar.isCalendarOpen && (
        <PremiumCalendar
          onSelectDate={radar.handleDateSelect}
          onClose={() => radar.setIsCalendarOpen(false)}
          eventDates={radar.eventDatesSet}
        />
      )}

      {/* Card do evento ativo */}
      {radar.activeEvent && (
        // lint-layout-ok — above Leaflet map z-index
        <div className="absolute bottom-24 left-4 right-4 z-[1000] animate-in slide-in-from-bottom-4 duration-300">
          <div
            onClick={() => onEventSelect(radar.activeEvent!)}
            className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-[#FFD300]/20 rounded-[1.5rem] p-3 shadow-2xl flex gap-3 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
              <img
                src={radar.activeEvent.imagem}
                className="w-full h-full object-cover"
                alt={radar.activeEvent.titulo}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[0.5rem] font-bold text-[#FFD300] uppercase tracking-wider mb-0.5">
                {radar.activeEvent.formato || radar.activeEvent.categoria}
              </span>
              <h3 style={TYPOGRAPHY.cardTitle} className="text-sm text-white leading-tight mb-0.5 truncate">
                {radar.activeEvent.titulo}
              </h3>
              <p className="text-zinc-400 text-[0.625rem] mb-1.5">
                {radar.activeEvent.data} • {radar.activeEvent.horario}
                {radar.activeEvent.coords &&
                  (() => {
                    const dist = radar.getDistanceKm(radar.activeEvent!.coords!);
                    return dist !== null
                      ? ` • ${dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}`
                      : null;
                  })()}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-[0.625rem] font-bold text-white group">
                  Ver detalhes <ArrowRight size="0.75rem" className="ml-1 group-hover:translate-x-1 text-[#FFD300]" />
                </div>
                {radar.activeEvent.coords && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const { lat, lng } = radar.activeEvent!.coords!;
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1 text-[0.625rem] font-bold text-[#FFD300] active:opacity-50"
                  >
                    <Navigation size="0.625rem" />
                    Ir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
