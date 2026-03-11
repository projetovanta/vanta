import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Trash2, RefreshCw, User } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { supabase } from '../../../services/supabaseClient';
import { clubeService } from '../services/clubeService';
import { maisVantaConfigService } from '../services/maisVantaConfigService';

type Filtro = 'TODAS' | 'NO_SHOW' | 'NAO_POSTOU';

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  NO_SHOW: { label: 'Não Compareceu', color: 'text-red-400 bg-red-500/15 border-red-500/25' },
  NAO_POSTOU: { label: 'Não Postou', color: 'text-amber-400 bg-amber-500/15 border-amber-500/25' },
};

interface InfracaoRow {
  id: string;
  user_id: string;
  tipo: string;
  evento_id?: string;
  evento_nome?: string;
  criado_em: string;
  criado_por?: string;
  nomeMembro?: string;
}

export const InfracoesGlobaisMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<Filtro>('TODAS');
  const [infracoes, setInfracoes] = useState<InfracaoRow[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState<{ id: string; userId: string; nomeMembro: string } | null>(null);

  // Carregar infrações do Supabase + batch de perfis
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from('infracoes_mais_vanta')
        .select('*')
        .order('criado_em', { ascending: false });
      if (cancelled || error || !data) return;

      // Batch: buscar nomes dos perfis
      const userIds = [...new Set(data.map((r: any) => r.user_id as string))];
      const perfis: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, nome').in('id', userIds.slice(0, 100));
        if (profiles)
          for (const p of profiles) perfis[p.id as string] = (p.nome as string) || (p.id as string).slice(0, 8);
      }

      if (cancelled) return;
      setInfracoes(
        data.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          tipo: r.tipo,
          evento_id: r.evento_id,
          evento_nome: r.evento_nome,
          criado_em: r.criado_em,
          criado_por: r.criado_por,
          nomeMembro: perfis[r.user_id] || (r.user_id as string).slice(0, 8),
        })),
      );
    };

    load().catch(() => {
      /* audit-ok */
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const filtradas = infracoes.filter(inf => {
    if (filtro === 'TODAS') return true;
    return inf.tipo === filtro;
  });

  const totais = useMemo(
    () => ({
      total: infracoes.length,
      noShow: infracoes.filter(i => i.tipo === 'NO_SHOW').length,
      naoPostou: infracoes.filter(i => i.tipo === 'NAO_POSTOU').length,
    }),
    [infracoes],
  );

  const handleRefresh = async () => {
    setLoading(true);
    await clubeService.refresh();
    setTick(t => t + 1);
    setLoading(false);
  };

  const handleDeletarInfracao = async (infracao: InfracaoRow) => {
    setLoading(true);
    try {
      await supabase.from('infracoes_mais_vanta').delete().eq('id', infracao.id);
      // Recalcular bloqueio_nivel baseado nas infrações restantes
      const remainingCount = infracoes.filter(i => i.user_id === infracao.user_id && i.id !== infracao.id).length;
      const limite = maisVantaConfigService.getConfig().infracoesLimite;
      let newNivel = 0;
      if (remainingCount >= limite * 2) newNivel = 2;
      else if (remainingCount >= limite) newNivel = 1;
      await supabase.from('membros_clube').update({ bloqueio_nivel: newNivel }).eq('user_id', infracao.user_id);
      setTick(t => t + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setConfirmar(null);
    }
  };

  const filtros: { id: Filtro; label: string; count: number }[] = [
    { id: 'TODAS', label: 'Todas', count: totais.total },
    { id: 'NO_SHOW', label: 'No-Show', count: totais.noShow },
    { id: 'NAO_POSTOU', label: 'Não Postou', count: totais.naoPostou },
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
              Infrações MAIS VANTA
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              aria-label="Atualizar"
              onClick={handleRefresh}
              disabled={loading}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-40"
            >
              <RefreshCw size="1rem" className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size="1.125rem" className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-white font-black text-xl leading-none">{totais.total}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">Total</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-red-400 font-black text-xl leading-none">{totais.noShow}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">No-Show</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-xl leading-none">{totais.naoPostou}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">Não Postou</p>
          </div>
        </div>

        {/* Filtros */}
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
              <AlertCircle size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhuma infração encontrada
            </p>
          </div>
        )}

        {filtradas.map(inf => {
          const tipoInfo = TIPO_CONFIG[inf.tipo];

          return (
            <div key={inf.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                  <User size="1rem" className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{inf.nomeMembro}</p>
                  <p className="text-zinc-400 text-[0.625rem] mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md border text-[0.5rem] font-black uppercase tracking-wider ${tipoInfo?.color ?? 'text-zinc-400 bg-zinc-500/15 border-zinc-500/25'}`}
                    >
                      {tipoInfo?.label ?? inf.tipo}
                    </span>
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="space-y-1.5 text-[0.5625rem] text-zinc-400 mb-3">
                {inf.evento_nome && (
                  <p>
                    <span className="text-zinc-400 font-bold">Evento:</span> {inf.evento_nome}
                  </p>
                )}
                <p>
                  <span className="text-zinc-400 font-bold">Data:</span>{' '}
                  {new Date(inf.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })}
                </p>
              </div>

              {/* Ação */}
              <button
                onClick={() => setConfirmar({ id: inf.id, userId: inf.user_id, nomeMembro: inf.nomeMembro || '' })}
                disabled={loading}
                className="w-full py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Trash2 size="0.75rem" /> Deletar Infração
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
            <p className="text-white font-bold text-sm text-center">Deletar infração?</p>
            <p className="text-zinc-400 text-[0.625rem] text-center leading-relaxed">
              A infração de "{confirmar.nomeMembro}" será deletada. Seu nível de bloqueio será recalculado
              automaticamente.
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
                  const infracao = infracoes.find(i => i.id === confirmar.id);
                  if (infracao) await handleDeletarInfracao(infracao);
                }}
                className="flex-1 py-3 bg-red-500 rounded-xl text-white text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Deletando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
