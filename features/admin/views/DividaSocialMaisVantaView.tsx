import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Gift, Clock, RefreshCw, User, AlertCircle } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { clubeService } from '../services/clubeService';
import { getResgatesPendentePost, type ResgateMV } from '../services/clube/clubeReservasService';
import { comunidadesService } from '../services/comunidadesService';
import { maisVantaConfigService } from '../services/maisVantaConfigService';
import { supabase } from '../../../services/supabaseClient';

type Filtro = 'PENDENTES' | 'VENCIDAS' | 'TODAS';

export const DividaSocialMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const { toasts, dismiss, toast } = useToast();
  const [filtro, setFiltro] = useState<Filtro>('PENDENTES');
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState<{ reservaId: string; nomeMembro: string } | null>(null);
  const [perfis, setPerfis] = useState<Record<string, { nome: string; foto: string }>>({});

  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  const [reservasPendentes, setReservasPendentes] = useState<ResgateMV[]>([]);

  useEffect(() => {
    let cancelled = false;
    getResgatesPendentePost().then(data => {
      if (!cancelled) setReservasPendentes(data);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // Enriquecer com perfis e eventos
  useEffect(() => {
    const enriquecer = async () => {
      const ids = [...new Set(reservasPendentes.map(r => r.userId))].filter(id => !perfis[id]);
      if (ids.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .in('id', ids.slice(0, 50) as string[]);
      if (!data) return;

      const next = { ...perfis };
      for (const r of data) {
        next[r.id as string] = { nome: (r.nome as string) ?? '', foto: (r.avatar_url as string) ?? '' };
      }
      setPerfis(next);
    };

    enriquecer().catch(() => {
      /* audit-ok */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservasPendentes.length]);

  const filtradas = reservasPendentes
    .map(r => {
      const perfil = perfis[r.userId];
      const now = new Date();
      const reservadoEm = new Date(r.reservadoEm);
      const diasPassados = Math.floor((now.getTime() - reservadoEm.getTime()) / (1000 * 60 * 60 * 24));
      const prazoHoras = maisVantaConfigService.getConfig().prazoPostHoras;
      const horas = prazoHoras - Math.floor(diasPassados * 24 + (now.getHours() - reservadoEm.getHours()));
      const vencida = horas <= 0;

      return { ...r, perfil, diasPassados, horas, vencida };
    })
    .filter(r => {
      if (filtro === 'PENDENTES') return !r.vencida;
      if (filtro === 'VENCIDAS') return r.vencida;
      return true;
    });

  const totais = useMemo(() => {
    const pend = reservasPendentes.filter(r => {
      const now = new Date();
      const reservadoEm = new Date(r.reservadoEm);
      const diasPassados = Math.floor((now.getTime() - reservadoEm.getTime()) / (1000 * 60 * 60 * 24));
      const horas =
        maisVantaConfigService.getConfig().prazoPostHoras -
        Math.floor(diasPassados * 24 + (now.getHours() - reservadoEm.getHours()));
      return horas > 0;
    }).length;

    const venc = reservasPendentes.length - pend;
    return { pendentes: pend, vencidas: venc };
  }, [reservasPendentes]);

  const handleRefresh = async () => {
    setLoading(true);
    await clubeService.refresh();
    setTick(t => t + 1);
    setLoading(false);
  };

  const handleResolverDivida = async (reservaId: string) => {
    setLoading(true);
    try {
      await supabase.from('infracoes_mais_vanta').update({ tipo: 'RESOLVIDO' }).eq('id', reservaId);
      handleRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setConfirmar(null);
    }
  };

  const filtros: { id: Filtro; label: string; count: number }[] = [
    { id: 'PENDENTES', label: 'Pendentes', count: totais.pendentes },
    { id: 'VENCIDAS', label: 'Vencidas', count: totais.vencidas },
    { id: 'TODAS', label: 'Todas', count: reservasPendentes.length },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Dívida Social"
        kicker="Visão Global"
        onBack={onBack}
        actions={[{ icon: RefreshCw, label: 'Atualizar', onClick: handleRefresh }]}
      />
      <div className="px-5 pt-3 pb-2 shrink-0 border-b border-white/5">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-2xl leading-none">{totais.pendentes}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-1">Pendentes</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-red-400 font-black text-2xl leading-none">{totais.vencidas}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-1">Vencidas</p>
          </div>
        </div>
        <p className="text-zinc-400 text-[0.625rem] mb-3">
          Membros que reservaram mas ainda não postaram com #publi/@venue/@maisvanta
        </p>
        <div className="flex flex-wrap gap-1.5">
          {filtros.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                filtro === f.id
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
        {filtradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Gift size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              {filtro === 'PENDENTES' ? 'Nenhuma dívida pendente' : 'Nenhuma dívida vencida'}
            </p>
          </div>
        )}

        {filtradas.map(r => {
          const isLoading = loading;
          const statusColor = r.vencida ? 'border-red-500/25 bg-red-500/10' : 'border-amber-500/25 bg-amber-500/10';
          const timeColor = r.vencida ? 'text-red-400' : r.horas <= 2 ? 'text-orange-400' : 'text-amber-400';

          return (
            <div key={r.id} className={`border rounded-2xl p-4 transition-colors ${statusColor}`}>
              <div className="flex items-center gap-3 mb-3">
                {r.perfil?.foto ? (
                  <img
                    loading="lazy"
                    src={r.perfil.foto}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <User size="1.25rem" className="text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{r.perfil?.nome || r.userId.slice(0, 8)}</p>
                  <p className="text-zinc-400 text-[0.625rem] mt-1">
                    Reserva há {r.diasPassados} dia{r.diasPassados !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Status */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${timeColor}`}>
                    {r.vencida ? (
                      <>
                        <AlertCircle size="0.875rem" className="inline mr-1" />
                        Vencida
                      </>
                    ) : r.horas <= 2 ? (
                      <>
                        <Clock size="0.875rem" className="inline mr-1" />
                        {r.horas}h
                      </>
                    ) : (
                      <>
                        <Clock size="0.875rem" className="inline mr-1" />
                        {r.horas}h
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="text-[0.5625rem] text-zinc-400 mb-3 space-y-1">
                <p>
                  <span className="text-zinc-400 font-bold">Evento ID:</span> {r.eventoId}
                </p>
                <p>
                  <span className="text-zinc-400 font-bold">Reservado em:</span>{' '}
                  {new Date(r.reservadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {r.postUrl && (
                  <p>
                    <span className="text-zinc-400 font-bold">Post URL:</span> {r.postUrl.slice(0, 40)}...
                  </p>
                )}
              </div>

              {/* Ação */}
              <button
                onClick={() => setConfirmar({ reservaId: r.id, nomeMembro: r.perfil?.nome || r.userId })}
                disabled={isLoading}
                className="w-full py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Gift size="0.75rem" /> Resolver Dívida
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal confirmação */}
      {confirmar && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => !loading && setConfirmar(null)}
        >
          <div
            className="w-full max-w-xs bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">Resolver dívida social?</p>
            <p className="text-zinc-400 text-[0.625rem] text-center leading-relaxed">
              A dívida social de "{confirmar.nomeMembro}" será resolvida. O post será marcado como verificado e o membro
              será desbloqueado.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmar(null)}
                disabled={loading}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                Voltar
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  await handleResolverDivida(confirmar.reservaId);
                }}
                className="flex-1 py-3 bg-emerald-500 rounded-xl text-white text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Resolvendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
