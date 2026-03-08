import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Gift, Clock, RefreshCw, User, AlertCircle } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { clubeService } from '../services/clubeService';
import { comunidadesService } from '../services/comunidadesService';
import { maisVantaConfigService } from '../services/maisVantaConfigService';
import { supabase } from '../../../services/supabaseClient';
import type { ReservaMaisVanta } from '../../../types';

type Filtro = 'PENDENTES' | 'VENCIDAS' | 'TODAS';

export const DividaSocialMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<Filtro>('PENDENTES');
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState<{ reservaId: string; nomeMembro: string } | null>(null);
  const [perfis, setPerfis] = useState<Record<string, { nome: string; foto: string }>>({});

  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  const getReservasPendentes = (): (ReservaMaisVanta & { nomeMembro?: string; nomeEvento?: string })[] => {
    // Buscar todas as reservas com post não verificado
    const todas = clubeService.getReservasPendentePost?.() ?? [];
    return todas as any;
  };

  const reservasPendentes = useMemo(() => getReservasPendentes(), []);

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
      await supabase.from('reservas_mais_vanta').update({ post_verificado: true }).eq('id', reservaId);
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
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Visão Global
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Dívida Social
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-40"
            >
              <RefreshCw size={16} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-2xl leading-none">{totais.pendentes}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Pendentes</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-red-400 font-black text-2xl leading-none">{totais.vencidas}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Vencidas</p>
          </div>
        </div>

        {/* Info */}
        <p className="text-zinc-500 text-[10px] mb-3">
          Membros que reservaram mas ainda não postaram com #publi/@venue/@maisvanta
        </p>

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filtros.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border transition-all ${
                filtro === f.id
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 text-zinc-500 border-white/5 active:bg-zinc-800'
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
              <Gift size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
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
                    <User size={20} className="text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{r.perfil?.nome || r.userId.slice(0, 8)}</p>
                  <p className="text-zinc-600 text-[10px] mt-1">
                    Reserva há {r.diasPassados} dia{r.diasPassados !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Status */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${timeColor}`}>
                    {r.vencida ? (
                      <>
                        <AlertCircle size={14} className="inline mr-1" />
                        Vencida
                      </>
                    ) : r.horas <= 2 ? (
                      <>
                        <Clock size={14} className="inline mr-1" />
                        {r.horas}h
                      </>
                    ) : (
                      <>
                        <Clock size={14} className="inline mr-1" />
                        {r.horas}h
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="text-[9px] text-zinc-500 mb-3 space-y-1">
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
                className="w-full py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Gift size={12} /> Resolver Dívida
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
            <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
              A dívida social de "{confirmar.nomeMembro}" será resolvida. O post será marcado como verificado e o membro
              será desbloqueado.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmar(null)}
                disabled={loading}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                Voltar
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  await handleResolverDivida(confirmar.reservaId);
                }}
                className="flex-1 py-3 bg-emerald-500 rounded-xl text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Resolvendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
