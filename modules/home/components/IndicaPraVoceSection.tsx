import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import type { DealMaisVanta } from '../../../types';
import { EventCarousel } from './EventCarousel';
import { vantaService } from '../../../services/vantaService';
import { clubeDealsService } from '../../../features/admin/services/clube/clubeDealsService';
import { useAuthStore } from '../../../stores/authStore';
import { EventCardSkeleton } from '../../../components/Skeleton';
import { SectionFilterChips } from '../../../components/SectionFilterChips';
import { filterTopGroups } from '../utils/filterSubCarousels';

interface IndicaPraVoceSectionProps {
  cidade: string;
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
  onViewAll?: () => void;
}

const TIPO_PARCEIRO_LABEL: Record<string, string> = {
  RESTAURANTE: 'Restaurante',
  BAR: 'Bar',
  CLUB: 'Club',
  GYM: 'Academia',
  SALAO: 'Salão',
  HOTEL: 'Hotel',
  LOJA: 'Loja',
  OUTRO: 'Outro',
};

const DealCard: React.FC<{ deal: DealMaisVanta }> = ({ deal }) => (
  <div className="shrink-0 w-[10rem] bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
    {deal.fotoUrl ? (
      <img src={deal.fotoUrl} alt={deal.titulo} className="w-full aspect-[4/3] object-cover" loading="lazy" />
    ) : (
      <div className="w-full aspect-[4/3] bg-zinc-900 flex items-center justify-center">
        <Sparkles size="1.5rem" className="text-[#FFD300]/30" />
      </div>
    )}
    <div className="p-2.5">
      <p className="text-[0.6875rem] text-white font-semibold leading-tight line-clamp-2">{deal.titulo}</p>
      {deal.parceiroNome && <p className="text-[0.6rem] text-zinc-500 mt-1 truncate">{deal.parceiroNome}</p>}
      {deal.parceiroTipo && (
        <span className="inline-block mt-1 text-[0.5rem] font-bold uppercase tracking-wider text-[#FFD300]/70 bg-[#FFD300]/8 px-1.5 py-0.5 rounded">
          {TIPO_PARCEIRO_LABEL[deal.parceiroTipo] ?? deal.parceiroTipo}
        </span>
      )}
      {deal.descontoPercentual != null && deal.descontoPercentual > 0 && (
        <span className="inline-block mt-1 ml-1 text-[0.5rem] font-bold text-emerald-400">
          -{deal.descontoPercentual}%
        </span>
      )}
    </div>
  </div>
);

const DealCarousel: React.FC<{ deals: DealMaisVanta[] }> = ({ deals }) => (
  <div className="overflow-x-auto no-scrollbar">
    <div className="flex gap-3 w-max px-5">
      {deals.map(d => (
        <DealCard key={d.id} deal={d} />
      ))}
    </div>
  </div>
);

export const IndicaPraVoceSection: React.FC<IndicaPraVoceSectionProps> = React.memo(
  ({ cidade, onEventClick, onComunidadeClick, onViewAll }) => {
    const isGuest = useAuthStore(s => s.currentAccount.role) === 'vanta_guest';
    const interesses = useAuthStore(s => s.currentAccount.interesses);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [deals, setDeals] = useState<DealMaisVanta[]>([]);
    const [selectedChip, setSelectedChip] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (isGuest || !interesses || interesses.length === 0) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      setLoading(true);
      setSelectedChip('Todos');

      Promise.all([
        vantaService.getEventosPorCidade(cidade, true, 30, 0),
        clubeDealsService.listarAtivosPorNomeCidade(cidade),
      ]).then(([eventosData, dealsData]) => {
        if (cancelled) return;
        const interesseSet = new Set(interesses.map(i => i.toLowerCase()));
        const filtered = eventosData.filter(e => {
          const tags = [
            e.formato?.toLowerCase(),
            ...(e.estilos ?? []).map((s: string) => s.toLowerCase()),
            ...(e.experiencias ?? []).map((x: string) => x.toLowerCase()),
            e.categoria?.toLowerCase(),
            ...(e.subcategorias ?? []).map((s: string) => s.toLowerCase()),
          ].filter(Boolean);
          return tags.some(t => t && interesseSet.has(t));
        });
        setEventos(filtered.slice(0, 20));
        setDeals(dealsData);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [cidade, isGuest, interesses]);

    const chips = useMemo(() => {
      const c = ['Todos'];
      if (eventos.length > 0) c.push('Eventos');
      if (deals.length > 0) c.push('Parceiros');
      return c.length <= 1 ? [] : c;
    }, [eventos, deals]);

    // Sub-carrosséis de eventos por formato (filtrados por relevância)
    const formatoGroups = useMemo(() => {
      const fmts = new Set<string>();
      eventos.forEach(e => {
        if (e.formato) fmts.add(e.formato);
      });
      const groups = Array.from(fmts)
        .sort()
        .map(f => ({ label: f, items: eventos.filter(e => e.formato === f) }))
        .filter(g => g.items.length > 0);
      return filterTopGroups(groups, eventos.length);
    }, [eventos]);

    // Sub-carrosséis de eventos por estilo (filtrados por relevância)
    const estiloGroups = useMemo(() => {
      const set = new Set<string>();
      eventos.forEach(e => e.estilos?.forEach(s => set.add(s)));
      const groups = Array.from(set)
        .sort()
        .map(s => ({ label: s, items: eventos.filter(e => e.estilos?.[0] === s) }))
        .filter(g => g.items.length > 0);
      return filterTopGroups(groups, eventos.length);
    }, [eventos]);

    // Deals agrupados por tipo de parceiro
    const dealGroups = useMemo(() => {
      const byTipo = new Map<string, DealMaisVanta[]>();
      deals.forEach(d => {
        const tipo = d.parceiroTipo ?? 'OUTRO';
        const arr = byTipo.get(tipo) ?? [];
        arr.push(d);
        byTipo.set(tipo, arr);
      });
      return Array.from(byTipo.entries())
        .map(([tipo, items]) => ({ label: TIPO_PARCEIRO_LABEL[tipo] ?? tipo, items }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }, [deals]);

    const showEventos = selectedChip === 'Todos' || selectedChip === 'Eventos';
    const showParceiros = selectedChip === 'Todos' || selectedChip === 'Parceiros';

    if (isGuest || !interesses || interesses.length === 0) return null;
    if (!loading && eventos.length === 0 && deals.length === 0) return null;

    return (
      <div className="py-4 w-full">
        <div className="flex items-center gap-2 px-5 mb-3">
          <Sparkles size="0.875rem" className="text-[#FFD300]" />
          <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
            VANTA Indica pra Você
          </h3>
        </div>
        <SectionFilterChips chips={chips} selected={selectedChip} onSelect={setSelectedChip} />
        {loading ? (
          <div className="px-5">
            <EventCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Eventos — carrossel principal + sub por formato + sub por estilo */}
            {showEventos && eventos.length > 0 && (
              <>
                <EventCarousel
                  eventos={eventos.slice(0, 9)}
                  onEventClick={onEventClick}
                  onComunidadeClick={onComunidadeClick}
                  onViewAll={onViewAll}
                  maxCards={9}
                />
                {formatoGroups.map(g => (
                  <div key={`fmt-${g.label}`}>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">
                      {g.label}
                    </p>
                    <EventCarousel
                      eventos={g.items.slice(0, 9)}
                      onEventClick={onEventClick}
                      onComunidadeClick={onComunidadeClick}
                      maxCards={9}
                    />
                  </div>
                ))}
                {estiloGroups.map(g => (
                  <div key={`sty-${g.label}`}>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">
                      {g.label}
                    </p>
                    <EventCarousel
                      eventos={g.items.slice(0, 9)}
                      onEventClick={onEventClick}
                      onComunidadeClick={onComunidadeClick}
                      maxCards={9}
                    />
                  </div>
                ))}
              </>
            )}

            {/* Parceiros — deals agrupados por tipo */}
            {showParceiros && deals.length > 0 && (
              <>
                {dealGroups.length <= 1 ? (
                  <DealCarousel deals={deals} />
                ) : (
                  dealGroups.map(g => (
                    <div key={`deal-${g.label}`}>
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-500 px-5 mb-2">
                        {g.label}
                      </p>
                      <DealCarousel deals={g.items} />
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

IndicaPraVoceSection.displayName = 'IndicaPraVoceSection';
