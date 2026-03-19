import React from 'react';
import { TYPOGRAPHY } from '../constants';

interface CityCardProps {
  cidade: string;
  totalEventos: number;
  fotoDestaque?: string;
  onClick: (cidade: string) => void;
}

export const CityCard: React.FC<CityCardProps> = React.memo(({ cidade, totalEventos, fotoDestaque, onClick }) => (
  <button
    onClick={() => onClick(cidade)}
    className="shrink-0 snap-start w-[9.5rem] aspect-[4/5] rounded-2xl overflow-hidden relative active:scale-95 transition-transform"
  >
    <img
      src={fotoDestaque || '/icon-192.png'}
      alt={cidade}
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-start">
      <span style={TYPOGRAPHY.cardTitle} className="text-base text-white leading-tight">
        {cidade}
      </span>
      <span className="text-[0.6rem] text-zinc-300 mt-0.5">
        {totalEventos} {totalEventos === 1 ? 'evento' : 'eventos'}
      </span>
    </div>
  </button>
));

CityCard.displayName = 'CityCard';
