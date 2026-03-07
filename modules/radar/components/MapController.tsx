import { useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export interface MapControllerProps {
  zoomAction: 'in' | 'out' | null;
  activeEventCoords: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  closestEventCoords: { lat: number; lng: number } | null;
  fallbackBounds: L.LatLngBoundsExpression | null;
  selectedRadius: number | null;
  onMove?: (center: L.LatLng) => void;
}

// Raio em km → zoom level aproximado
const radiusToZoom = (km: number): number => {
  if (km <= 5) return 14;
  if (km <= 10) return 13;
  if (km <= 25) return 11;
  return 10;
};

export function MapController({
  zoomAction,
  activeEventCoords,
  userLocation,
  closestEventCoords,
  fallbackBounds,
  selectedRadius,
  onMove,
}: MapControllerProps) {
  const map = useMap();

  const debouncedOnMove = useCallback(
    (center: L.LatLng) => {
      if (onMove) {
        const handler = setTimeout(() => {
          onMove(center);
        }, 200);
        return () => clearTimeout(handler);
      }
    },
    [onMove],
  );

  useMapEvents({
    moveend: () => {
      debouncedOnMove(map.getCenter());
    },
  });

  useEffect(() => {
    if (zoomAction === 'in') map.zoomIn();
    if (zoomAction === 'out') map.zoomOut();
  }, [zoomAction, map]);

  // Raio selecionado → centraliza no usuário com zoom proporcional
  useEffect(() => {
    if (!userLocation) return;
    if (selectedRadius) {
      map.flyTo([userLocation.lat, userLocation.lng], radiusToZoom(selectedRadius), { animate: true, duration: 1 });
    }
  }, [selectedRadius, userLocation, map]);

  useEffect(() => {
    if (activeEventCoords) {
      map.flyTo([activeEventCoords.lat, activeEventCoords.lng], 16, { animate: true, duration: 1 });
      return;
    }

    if (userLocation && closestEventCoords) {
      const latDiff = Math.abs(closestEventCoords.lat - userLocation.lat);
      const lngDiff = Math.abs(closestEventCoords.lng - userLocation.lng);
      const factor = 1.3;
      const safeLatDiff = Math.max(latDiff, 0.002);
      const safeLngDiff = Math.max(lngDiff, 0.002);

      const southWest = L.latLng(userLocation.lat - safeLatDiff * factor, userLocation.lng - safeLngDiff * factor);
      const northEast = L.latLng(userLocation.lat + safeLatDiff * factor, userLocation.lng + safeLngDiff * factor);
      const bounds = L.latLngBounds(southWest, northEast);

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 1.5 });
      return;
    }

    if (userLocation && !closestEventCoords) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true, duration: 1.5 });
      return;
    }

    if (fallbackBounds) {
      map.fitBounds(fallbackBounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [activeEventCoords, userLocation, closestEventCoords, fallbackBounds, map]);

  return null;
}
