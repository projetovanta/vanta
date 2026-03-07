import { useState, useMemo, useEffect } from 'react';
import L from 'leaflet';
import { Evento } from '../../../types';
import { isEventExpired, todayBR } from '../../../utils';
import { vantaService } from '../../../services/vantaService';
import { useGeolocationPermission } from '../../../hooks/usePermission';

export const useRadarLogic = () => {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [zoomAction, setZoomAction] = useState<'in' | 'out' | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null); // km
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const geo = useGeolocationPermission();

  // Fallback: São Paulo centro
  const DEFAULT_COORDS = { lat: -23.5505, lng: -46.6333 };
  const RADAR_RADIUS_KM = 100;

  // Geolocalização silenciosa — sem modal, sem perguntar
  useEffect(() => {
    geo.request({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }).then(coords => {
      if (coords) setUserLocation({ lat: coords.latitude, lng: coords.longitude });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Carregar eventos por região (server-side) — recarrega quando localização muda
  useEffect(() => {
    const coords = userLocation ?? DEFAULT_COORDS;
    setLoading(true);
    vantaService
      .getEventosPorRegiao(coords.lat, coords.lng, RADAR_RADIUS_KM)
      .then(data => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userLocation]);

  const activeEvent = activeEventId ? events.find(e => e.id === activeEventId) : null;

  const customDateLabel = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    if (selected.getTime() === today.getTime()) return 'Hoje';
    if (selected.getTime() === tomorrow.getTime()) return 'Amanhã';
    return selected.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  }, [selectedDate]);

  const getDistanceKm = (coords: { lat: number; lng: number }): number | null => {
    if (!userLocation) return null;
    return L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(coords.lat, coords.lng)) / 1000;
  };

  const isEventLive = (e: Evento): boolean => {
    if (!e.horario) return false;
    const now = new Date();
    const [h, m] = e.horario.split(':').map(Number);
    const start = new Date(e.dataReal + 'T00:00:00');
    start.setHours(h, m, 0, 0);
    // Evento "ao vivo" = começou e não acabou (usa horarioFim ou +6h default)
    if (now < start) return false;
    if (e.horarioFim) {
      const [hf, mf] = e.horarioFim.split(':').map(Number);
      const end = new Date(e.dataReal + 'T00:00:00');
      end.setHours(hf, mf, 0, 0);
      if (hf < h) end.setDate(end.getDate() + 1); // cruza meia-noite
      return now <= end;
    }
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
    return now <= end;
  };

  const filteredEvents = useMemo(() => {
    const targetDateISO = selectedDate.toISOString().split('T')[0];
    let eventsOnDate = events.filter(e => e.dataReal === targetDateISO && !isEventExpired(e));
    if (selectedRadius && userLocation) {
      eventsOnDate = eventsOnDate.filter(e => {
        if (!e.coords) return false;
        const dist =
          L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(e.coords.lat, e.coords.lng)) / 1000;
        return dist <= selectedRadius;
      });
    }
    if (showLiveOnly) {
      eventsOnDate = eventsOnDate.filter(isEventLive);
    }
    return eventsOnDate;
  }, [selectedDate, events, selectedRadius, userLocation, showLiveOnly]);

  // ID do evento mais próximo (para glow)
  const closestEventId = useMemo(() => {
    if (!userLocation) return null;
    const withCoords = filteredEvents.filter(e => e.coords);
    if (withCoords.length === 0) return null;
    const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
    let minDist = Infinity;
    let closestId: string | null = null;
    withCoords.forEach(e => {
      const dist = userLatLng.distanceTo(L.latLng(e.coords!.lat, e.coords!.lng));
      if (dist < minDist) {
        minDist = dist;
        closestId = e.id;
      }
    });
    return closestId;
  }, [filteredEvents, userLocation]);

  const { closestEventCoords, fallbackBounds } = useMemo(() => {
    const validEvents = filteredEvents.filter(e => e.coords);
    if (validEvents.length === 0) return { closestEventCoords: null, fallbackBounds: null };
    const bounds = L.latLngBounds(validEvents.map(e => L.latLng(e.coords!.lat, e.coords!.lng)));
    let closest = null;
    if (userLocation) {
      const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
      let minDist = Infinity;
      validEvents.forEach(e => {
        const dist = userLatLng.distanceTo(L.latLng(e.coords!.lat, e.coords!.lng));
        if (dist < minDist) {
          minDist = dist;
          closest = e.coords;
        }
      });
    }
    return { closestEventCoords: closest, fallbackBounds: bounds };
  }, [filteredEvents, userLocation]);

  const handleDateSelect = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
    setActiveEventId(null);
  };

  const isToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  }, [selectedDate]);

  const findClosestEventGlobal = (): Evento | null => {
    const todayISO = todayBR();
    const futureWithCoords = events.filter(e => e.dataReal >= todayISO && e.coords && !isEventExpired(e));
    if (futureWithCoords.length === 0) return null;

    let closest: Evento;
    if (userLocation) {
      const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
      closest = futureWithCoords.sort(
        (a, b) =>
          userLatLng.distanceTo(L.latLng(a.coords!.lat, a.coords!.lng)) -
          userLatLng.distanceTo(L.latLng(b.coords!.lat, b.coords!.lng)),
      )[0];
    } else {
      closest = futureWithCoords.sort((a, b) => a.dataReal.localeCompare(b.dataReal))[0];
    }

    const eventDate = new Date(closest.dataReal + 'T00:00:00');
    eventDate.setHours(0, 0, 0, 0);
    setSelectedDate(eventDate);
    setActiveEventId(closest.id);
    return closest;
  };

  return {
    activeEventId,
    setActiveEventId,
    activeEvent,
    zoomAction,
    handleZoom: (t: 'in' | 'out') => {
      setZoomAction(t);
      setTimeout(() => setZoomAction(null), 100);
    },
    isCalendarOpen,
    setIsCalendarOpen,
    customDateLabel,
    userLocation,
    setUserLocation,
    filteredEvents,
    allEvents: events,
    closestEventCoords,
    fallbackBounds,
    handleDateSelect,
    handleRecenter: () => {
      if (userLocation) setActiveEventId(null);
    },
    resetToToday: () => {
      setSelectedDate(new Date());
      setActiveEventId(null);
    },
    findClosestEventGlobal,
    loading,
    isToday,
    selectedRadius,
    setSelectedRadius,
    getDistanceKm,
    showLiveOnly,
    setShowLiveOnly,
    isEventLive,
    closestEventId,
    selectedDate,
    eventDatesSet: useMemo(() => {
      const set = new Set<string>();
      for (const e of events) {
        if (e.dataReal) set.add(e.dataReal);
      }
      return set;
    }, [events]),
  };
};
