import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Compass, Check, X, User, RefreshCw, Trash2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { clubeService } from '../services/clubeService';
import { comunidadesService } from '../services/comunidadesService';
import { supabase } from '../../../services/supabaseClient';
import { tsBR } from '../../../utils';

export const PassaportesMaisVantaView: React.FC<{
  onBack: () => void;
  masterId: string;
}> = ({ onBack, masterId }) => {
  const [filtro, setFiltro] = useState<'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'TODOS'>('PENDENTE');
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [perfis, setPerfis] = useState<Record<string, { nome: string; foto: string }>>({});
  const [confirmar, setConfirmar] = useState<{ id: string; nome: string } | null>(null);

  const allPassports = useMemo(() => clubeService.getAllPassports(), [tick]);
  const passports = useMemo(() => {
    if (filtro === 'TODOS') return allPassports;
    return allPassports.filter(p => p.status === filtro);
  }, [filtro, allPassports]);

  const comunidades = useMemo(() => comunidadesService.getAll(), []);
  const getCidadeLabel = (p: (typeof allPassports)[0]) =>
    p.cidade ?? comunidades.find(c => c.id === p.comunidadeId)?.cidade ?? '—';

  // Carregar perfis dos solicitantes
  useEffect(() => {
    const ids = [...new Set(allPassports.map(p => p.userId))].filter(id => !perfis[id]);
    if (ids.length === 0) return;
    supabase
      .from('profiles')
      .select('id, nome, avatar_url')
      .in('id', ids.slice(0, 50) as string[])
      .then(
        ({ data }) => {
          if (!data) return;
          const next = { ...perfis };
          for (const r of data)
            next[r.id as string] = { nome: (r.nome as string) ?? '', foto: (r.avatar_url as string) ?? '' };
          setPerfis(next);
        },
        () => {
          /* audit-ok */
        },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPassports.length]);

  const totais = useMemo(
    () => ({
      pendentes: allPassports.filter(p => p.status === 'PENDENTE').length,
      aprovados: allPassports.filter(p => p.status === 'APROVADO').length,
      rejeitados: allPassports.filter(p => p.status === 'REJEITADO').length,
    }),
    [allPassports],
  );

  const handleAprovar = async (id: string) => {
    setLoading(id);
    await clubeService.aprovarPassport(id, masterId);
    setLoading(null);
    setTick(t => t + 1);
  };

  const handleRejeitar = async (id: string) => {
    setLoading(id);
    await clubeService.rejeitarPassport(id, masterId);
    setLoading(null);
    setTick(t => t + 1);
  };

  const handleRevogar = async (id: string) => {
    setLoading(id);
    try {
      // Marcar como rejeitado (revogação é uma rejeição posterior)
      await supabase
        .from('passport_aprovacoes')
        .update({
          status: 'REJEITADO',
          resolvido_em: tsBR(),
          resolvido_por: masterId,
        })
        .eq('id', id);
      await clubeService.refresh();
      setTick(t => t + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmar(null);
    }
  };

  const handleRefresh = async () => {
    await clubeService.refresh();
    setTick(t => t + 1);
  };

  const filtros: { id: typeof filtro; label: string; count: number }[] = [
    { id: 'PENDENTE', label: 'Pendentes', count: totais.pendentes },
    { id: 'APROVADO', label: 'Aprovados', count: totais.aprovados },
    { id: 'REJEITADO', label: 'Rejeitados', count: totais.rejeitados },
    { id: 'TODOS', label: 'Todos', count: allPassports.length },
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
              Passaportes Globais
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <RefreshCw size={16} className="text-zinc-400" />
            </button>
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

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
        {passports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Compass size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
              Nenhum passaporte {filtro === 'TODOS' ? '' : filtro.toLowerCase()}
            </p>
          </div>
        )}

        {passports.map(p => {
          const perfil = perfis[p.userId];
          const isLoading = loading === p.id;

          return (
            <div key={p.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {perfil?.foto ? (
                  <img
                    loading="lazy"
                    src={perfil.foto}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <User size={18} className="text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{perfil?.nome || p.userId.slice(0, 8)}</p>
                  <p className="text-zinc-500 text-[10px] truncate">{getCidadeLabel(p)}</p>
                  <p className="text-zinc-700 text-[9px] mt-0.5">
                    {new Date(p.solicitadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {p.status === 'PENDENTE' ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAprovar(p.id)}
                      disabled={isLoading}
                      className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
                    >
                      <Check size={14} className="text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handleRejeitar(p.id)}
                      disabled={isLoading}
                      className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : p.status === 'APROVADO' ? (
                  <button
                    onClick={() => setConfirmar({ id: p.id, nome: perfil?.nome || p.userId.slice(0, 8) })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={10} /> Revogar
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider shrink-0 text-red-400 bg-red-500/15 border-red-500/25">
                    Rejeitado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal revogação */}
      {confirmar && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => !loading && setConfirmar(null)}
        >
          <div
            className="w-full max-w-xs bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">Revogar passport?</p>
            <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
              O passport de "{confirmar.nome}" será revogado. O membro não poderá mais acessar eventos dessa cidade a
              menos que solicite novamente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmar(null)}
                disabled={loading !== null}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                Voltar
              </button>
              <button
                disabled={loading !== null}
                onClick={async () => {
                  await handleRevogar(confirmar.id);
                }}
                className="flex-1 py-3 bg-red-500 rounded-xl text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Revogando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
