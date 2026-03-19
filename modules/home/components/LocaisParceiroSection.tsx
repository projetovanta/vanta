import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Parceiro } from '../../../types';
import { PartnerCard } from '../../../components/PartnerCard';
import { ViewAllCard } from '../../../components/ViewAllCard';
import { vantaService } from '../../../services/vantaService';

interface LocaisParceiroSectionProps {
  cidade: string;
  onComunidadeClick: (id: string) => void;
  onViewAll: () => void;
}

export const LocaisParceiroSection: React.FC<LocaisParceiroSectionProps> = React.memo(
  ({ cidade, onComunidadeClick, onViewAll }) => {
    const [parceiros, setParceiros] = useState<Parceiro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      vantaService.getParceirosPorCidade(cidade, 9, 0).then(data => {
        if (!cancelled) {
          setParceiros(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [cidade]);

    if (!loading && parceiros.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <MapPin size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Locais Parceiros
          </h3>
        </div>
        {loading ? (
          <div className="px-5 flex gap-3">
            <div className="w-[9.5rem] aspect-square rounded-2xl bg-zinc-900 animate-pulse shrink-0" />
            <div className="w-[9.5rem] aspect-square rounded-2xl bg-zinc-900 animate-pulse shrink-0" />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-3 w-max px-5">
              {parceiros.map(p => (
                <PartnerCard key={p.id} parceiro={p} onClick={onComunidadeClick} />
              ))}
              {parceiros.length >= 9 && <ViewAllCard onClick={onViewAll} />}
            </div>
          </div>
        )}
      </div>
    );
  },
);

LocaisParceiroSection.displayName = 'LocaisParceiroSection';
