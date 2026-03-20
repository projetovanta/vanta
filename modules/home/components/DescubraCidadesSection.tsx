import React, { useEffect, useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { CidadeResumo } from '../../../types';
import { CityCard } from '../../../components/CityCard';
import { vantaService } from '../../../services/vantaService';
import { SectionFilterChips } from '../../../components/SectionFilterChips';

interface DescubraCidadesSectionProps {
  cidadeAtual: string;
  onCidadeClick: (cidade: string) => void;
}

export const DescubraCidadesSection: React.FC<DescubraCidadesSectionProps> = React.memo(
  ({ cidadeAtual, onCidadeClick }) => {
    const [cidades, setCidades] = useState<CidadeResumo[]>([]);
    const [selectedChip, setSelectedChip] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setSelectedChip('Todos');
      vantaService.getCidadesComEventos(cidadeAtual).then(data => {
        if (!cancelled) {
          setCidades(data);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [cidadeAtual]);

    const chips = useMemo(() => {
      const estados = new Set<string>();
      cidades.forEach(c => {
        const parts = c.cidade.split(' - ');
        if (parts.length > 1) estados.add(parts[parts.length - 1].trim());
      });
      if (estados.size <= 1) return [];
      return ['Todos', ...Array.from(estados).sort()];
    }, [cidades]);

    const filtered = useMemo(() => {
      if (selectedChip === 'Todos') return cidades;
      return cidades.filter(c => c.cidade.endsWith(` - ${selectedChip}`) || c.cidade.endsWith(`-${selectedChip}`));
    }, [cidades, selectedChip]);

    if (!loading && cidades.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <Globe size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            Descubra Cidades
          </h3>
        </div>
        <SectionFilterChips chips={chips} selected={selectedChip} onSelect={setSelectedChip} />
        {loading ? (
          <div className="px-5 flex gap-3">
            <div className="w-[9.5rem] aspect-[4/5] rounded-2xl bg-zinc-900 animate-pulse shrink-0" />
            <div className="w-[9.5rem] aspect-[4/5] rounded-2xl bg-zinc-900 animate-pulse shrink-0" />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-3 w-max px-5">
              {filtered.map(c => (
                <CityCard
                  key={c.cidade}
                  cidade={c.cidade}
                  totalEventos={c.totalEventos}
                  fotoDestaque={c.fotoDestaque}
                  onClick={onCidadeClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

DescubraCidadesSection.displayName = 'DescubraCidadesSection';
