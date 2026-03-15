import L from 'leaflet';

interface EventIconOptions {
  isActive?: boolean;
  isLive?: boolean;
  isClosest?: boolean;
}

export const createEventIcon = (imageUrl: string, opts: EventIconOptions = {}) => {
  const { isActive = false, isLive = false, isClosest = false } = opts;
  const size = isActive ? 64 : 48;
  const borderColor = isLive ? '#ef4444' : '#FFD300';
  const glowColor = isLive ? 'rgba(239, 68, 68,' : 'rgba(255, 211, 0,';
  const glowIntensity = isActive ? '0.8)' : isClosest ? '0.6)' : '0.4)';
  const liveRing = isLive
    ? `<div style="position: absolute; inset: -4px; border: 2px solid ${borderColor}; border-radius: 50%; animation: ping 1.5s infinite; opacity: 0.6;"></div>`
    : '';
  const closestGlow = isClosest && !isActive ? `box-shadow: 0 0 20px ${glowColor}0.7), 0 0 40px ${glowColor}0.3);` : '';
  return L.divIcon({
    className: 'custom-event-pin',
    html: `<div style="position: relative; width: ${size}px; height: ${size}px; animation: bounceIn 0.4s ease-out;">${liveRing}<div style="position: relative; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${isActive ? 3 : 2}px solid ${borderColor}; box-shadow: 0 0 15px ${glowColor}${glowIntensity}; ${closestGlow} background: #000; overflow: hidden;"><img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" /></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
export const createPartnerIcon = (photoUrl?: string | null) => {
  const size = 40;
  const inner = photoUrl
    ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" referrerpolicy="no-referrer" />`
    : `<div style="width: 100%; height: 100%; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18M5 21V7l8-4 8 4v14"/></svg></div>`;
  return L.divIcon({
    className: 'partner-pin',
    html: `<div style="position: relative; width: ${size}px; height: ${size}px;"><div style="position: relative; width: ${size}px; height: ${size}px; border: 2px solid #f59e0b; border-radius: 50%; overflow: hidden; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); background: #000;">${inner}</div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const createUserIcon = (photoUrl?: string) => {
  const size = 36;
  const inner = photoUrl
    ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" referrerpolicy="no-referrer" />`
    : `<div style="width: 100%; height: 100%; background: #3b82f6; border-radius: 50%;"></div>`;
  return L.divIcon({
    className: 'user-location-icon',
    html: `<div style="position: relative; width: ${size}px; height: ${size}px;"><div style="position: absolute; inset: -4px; background: rgba(255, 211, 0, 0.3); border-radius: 50%; animation: ping 2s infinite;"></div><div style="position: relative; width: ${size}px; height: ${size}px; border: 2px solid #FFD300; border-radius: 50%; overflow: hidden; box-shadow: 0 0 12px rgba(255, 211, 0, 0.5);">${inner}</div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
