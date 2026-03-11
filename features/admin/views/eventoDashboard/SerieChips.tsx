import React, { useEffect, useState } from 'react';
import { Repeat, X, Loader2 } from 'lucide-react';
import { supabase } from '../../../../services/supabaseClient';

interface Ocorrencia {
  id: string;
  data_inicio: string;
  publicado: boolean;
  status_evento: string | null;
  total_vendidos: number;
}

interface SerieChipsProps {
  eventoId: string;
  eventoOrigemId: string | undefined;
  recorrencia: string | undefined;
  onSelectOcorrencia: (eventoId: string) => void;
}

const fmtChip = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const SerieChips: React.FC<SerieChipsProps> = ({
  eventoId,
  eventoOrigemId,
  recorrencia,
  onSelectOcorrencia,
}) => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelar, setShowCancelar] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // Determina o ID raiz da série (pode ser o próprio evento ou o evento_origem)
  const serieRaizId = eventoOrigemId ?? eventoId;
  const isSerie = recorrencia && recorrencia !== 'UNICO';

  useEffect(() => {
    if (!isSerie) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase.rpc('get_ocorrencias_serie', { p_evento_origem_id: serieRaizId }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error('[SerieChips] erro:', error);
        setOcorrencias([]);
      } else {
        setOcorrencias((data ?? []) as Ocorrencia[]);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [serieRaizId, isSerie]);

  if (!isSerie || (ocorrencias.length <= 1 && !loading)) return null;

  const handleCancelarSerie = async () => {
    setCancelando(true);
    const { data, error } = await supabase.rpc('cancelar_serie_recorrente', {
      p_evento_origem_id: serieRaizId,
    });
    setCancelando(false);
    setShowCancelar(false);
    if (!error) {
      // Recarregar ocorrências
      const { data: novas } = await supabase.rpc('get_ocorrencias_serie', {
        p_evento_origem_id: serieRaizId,
      });
      setOcorrencias((novas ?? []) as Ocorrencia[]);
    }
  };

  const labelRecorrencia =
    recorrencia === 'SEMANAL'
      ? 'Semanal'
      : recorrencia === 'QUINZENAL'
        ? 'Quinzenal'
        : recorrencia === 'MENSAL'
          ? 'Mensal'
          : '';

  const futurasSemPublicar = ocorrencias.filter(o => !o.publicado && new Date(o.data_inicio) > new Date()).length;

  return (
    <>
      <div className="flex items-center gap-2 mb-3 -mt-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <Repeat size="0.6875rem" className="text-[#FFD300]" />
          <span className="text-[0.5625rem] font-black uppercase tracking-wider text-[#FFD300]">
            {labelRecorrencia}
          </span>
        </div>

        {loading ? (
          <Loader2 size="0.75rem" className="text-zinc-400 animate-spin" />
        ) : (
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {ocorrencias.map(o => {
                const isAtual = o.id === eventoId;
                return (
                  <button
                    key={o.id}
                    onClick={() => !isAtual && onSelectOcorrencia(o.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[0.625rem] font-bold transition-all active:scale-90 ${
                      isAtual
                        ? 'bg-[#FFD300] text-black'
                        : o.publicado
                          ? 'bg-zinc-800 text-zinc-300 border border-white/10'
                          : 'bg-zinc-900 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {fmtChip(o.data_inicio)}
                    {o.total_vendidos > 0 && !isAtual && (
                      <span className="ml-1 text-[0.5rem] opacity-60">{o.total_vendidos}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {futurasSemPublicar > 0 && (
          <button
            onClick={() => setShowCancelar(true)}
            className="shrink-0 p-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 active:scale-90"
            title="Cancelar datas futuras"
          >
            <X size="0.75rem" />
          </button>
        )}
      </div>

      {/* Modal cancelar série */}
      {showCancelar && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-sm mb-2">Cancelar datas futuras?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              {futurasSemPublicar} data{futurasSemPublicar > 1 ? 's' : ''} futura{futurasSemPublicar > 1 ? 's' : ''} não
              publicada{futurasSemPublicar > 1 ? 's' : ''} será{futurasSemPublicar > 1 ? 'ão' : ''} removida
              {futurasSemPublicar > 1 ? 's' : ''}. Datas já publicadas ou com vendas não são afetadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelar(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold active:scale-95"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelarSerie}
                disabled={cancelando}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold active:scale-95 disabled:opacity-50"
              >
                {cancelando ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
