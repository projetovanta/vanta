import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Parceiro } from '../../types';
import { vantaService } from '../../services/vantaService';

interface AllPartnersViewProps {
  cidade: string;
  onBack: () => void;
  onComunidadeClick: (id: string) => void;
}

export const AllPartnersView: React.FC<AllPartnersViewProps> = ({ cidade, onBack, onComunidadeClick }) => {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const loadMore = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      const data = await vantaService.getParceirosPorCidade(cidade, PAGE_SIZE, offset);
      setParceiros(prev => (replace ? data : [...prev, ...data]));
      setHasMore(data.length >= PAGE_SIZE);
      setLoading(false);
    },
    [cidade],
  );

  useEffect(() => {
    setParceiros([]);
    setHasMore(true);
    loadMore(0, true);
  }, [loadMore]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore || loading) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
        loadMore(parceiros.length, false);
      }
    },
    [hasMore, loading, parceiros.length, loadMore],
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="active:scale-90 transition-transform">
            <ArrowLeft size="1.25rem" className="text-white" />
          </button>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
            Parceiros em {cidade}
          </h1>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4" onScroll={handleScroll}>
        <div className="space-y-3">
          {parceiros.map(p => (
            <button
              key={p.id}
              onClick={() => onComunidadeClick(p.id)}
              className="w-full flex items-center gap-3 p-3 bg-[#111] border border-white/5 rounded-xl active:scale-[0.98] transition-transform"
            >
              <img
                src={p.foto || '/icon-192.png'}
                alt={p.nome}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-semibold text-white truncate w-full text-left">{p.nome}</span>
                {p.tipo_comunidade && <span className="text-[0.65rem] text-zinc-500">{p.tipo_comunidade}</span>}
                {p.endereco && (
                  <span className="text-[0.6rem] text-zinc-600 truncate w-full text-left">{p.endereco}</span>
                )}
              </div>
            </button>
          ))}
        </div>
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
          </div>
        )}
        {!loading && parceiros.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-zinc-500 text-sm">Nenhum parceiro nesta cidade</p>
          </div>
        )}
      </div>
    </div>
  );
};
