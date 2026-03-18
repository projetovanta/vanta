import React from 'react';
import { MapPin, Users, Star } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { OptimizedImage } from '../../../components/OptimizedImage';

interface Comunidade {
  id: string;
  nome: string;
  cidade: string;
  foto: string;
  tipo_comunidade?: string;
}

interface Props {
  results: Comunidade[];
  onPlaceClick: (id: string) => void;
}

export const PlacesResults: React.FC<Props> = ({ results, onPlaceClick }) => {
  if (results.length === 0) {
    return <EmptyState icon={MapPin} title="Nenhum lugar encontrado" subtitle="Tente outro nome ou cidade." compact />;
  }

  return (
    <div className="space-y-2 px-1">
      {results.map(place => (
        <button
          key={place.id}
          onClick={() => onPlaceClick(place.id)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/5 text-left active:scale-[0.98] transition-all hover:border-white/10"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
            {place.foto ? (
              <OptimizedImage src={place.foto} alt={place.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin size="1rem" className="text-zinc-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{place.nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size="0.625rem" className="text-zinc-500 shrink-0" />
              <p className="text-zinc-500 text-xs truncate">{place.cidade || 'Sem cidade'}</p>
              {place.tipo_comunidade && (
                <>
                  <span className="text-zinc-700">·</span>
                  <p className="text-zinc-600 text-xs truncate">{place.tipo_comunidade}</p>
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
