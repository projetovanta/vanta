import React, { useState, useMemo } from 'react';
import { ArrowLeft, Crown, Building2, Check, Clock, XCircle, RefreshCw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { fmtBRL } from '../../../utils';
import { assinaturaService } from '../services/assinaturaService';
import { comunidadesService } from '../services/comunidadesService';
import type { AssinaturaMaisVanta, StatusAssinatura } from '../../../types';

const STATUS_CONFIG: Record<StatusAssinatura, { label: string; color: string; icon: React.ElementType }> = {
  ATIVA: { label: 'Ativa', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25', icon: Check },
  PENDENTE: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', icon: Clock },
  CANCELADA: { label: 'Cancelada', color: 'text-red-400 bg-red-500/15 border-red-500/25', icon: XCircle },
  EXPIRADA: { label: 'Expirada', color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/25', icon: Clock },
};

export const AssinaturasMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<'TODAS' | StatusAssinatura>('TODAS');
  const [tick, setTick] = useState(0);
  const [confirmar, setConfirmar] = useState<{
    comunidadeId: string;
    acao: 'ATIVAR' | 'CANCELAR';
    nome: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const assinaturas = useMemo(() => {
    const all = assinaturaService.getTodasAssinaturas();
    if (filtro === 'TODAS') return all;
    return all.filter(a => a.status === filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, tick]);

  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  const getComunidadeNome = (comunidadeId: string): string =>
    comunidades.find(c => c.id === comunidadeId)?.nome ?? 'Comunidade desconhecida';

  const getComunidadeFoto = (comunidadeId: string): string => comunidades.find(c => c.id === comunidadeId)?.foto ?? '';

  const totais = useMemo(() => {
    const all = assinaturaService.getTodasAssinaturas();
    return {
      total: all.length,
      ativas: all.filter(a => a.status === 'ATIVA').length,
      pendentes: all.filter(a => a.status === 'PENDENTE').length,
      canceladas: all.filter(a => a.status === 'CANCELADA').length,
      mrr: all.filter(a => a.status === 'ATIVA').reduce((s, a) => s + a.valorMensal, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const handleRefresh = async () => {
    await assinaturaService.refresh();
    setTick(t => t + 1);
  };

  const filtros: { id: 'TODAS' | StatusAssinatura; label: string; count: number }[] = [
    { id: 'TODAS', label: 'Todas', count: totais.total },
    { id: 'ATIVA', label: 'Ativas', count: totais.ativas },
    { id: 'PENDENTE', label: 'Pendentes', count: totais.pendentes },
    { id: 'CANCELADA', label: 'Canceladas', count: totais.canceladas },
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
              Assinaturas MAIS VANTA
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              aria-label="Atualizar"
              onClick={handleRefresh}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <RefreshCw size="1rem" className="text-zinc-400" />
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
            <p className="text-emerald-400 font-black text-2xl leading-none">{totais.ativas}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">Ativas</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-2xl leading-none">{totais.pendentes}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">Pendentes</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-[#FFD300] font-black text-xl leading-none">{fmtBRL(totais.mrr)}</p>
            <p className="text-zinc-400 text-[0.5625rem] font-bold uppercase tracking-wider mt-1">MRR</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filtros.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider shrink-0 border transition-all ${
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
        {assinaturas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Crown size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              {filtro === 'TODAS' ? 'Nenhuma assinatura encontrada' : `Nenhuma assinatura ${filtro.toLowerCase()}`}
            </p>
          </div>
        )}

        {assinaturas.map(a => {
          const st = STATUS_CONFIG[a.status];
          const StIcon = st.icon;
          const plano = assinaturaService.getInfoPlano(a);
          const foto = getComunidadeFoto(a.comunidadeId);

          return (
            <div key={a.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {foto ? (
                  <img loading="lazy" src={foto} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Building2 size="1.25rem" className="text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{getComunidadeNome(a.comunidadeId)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[0.5rem] font-black uppercase tracking-wider ${st.color}`}
                    >
                      <StIcon size="0.5625rem" /> {st.label}
                    </span>
                    <span className="text-[#FFD300] text-[0.5625rem] font-black">{plano.nome}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-black text-sm">R${a.valorMensal}</p>
                  <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">/mês</p>
                </div>
              </div>

              {/* Detalhes + Ações */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  <p className="text-zinc-400 text-[0.5625rem]">
                    <span className="text-zinc-400 font-bold">Membros:</span> {plano.membros}
                  </p>
                  {a.inicio && (
                    <p className="text-zinc-400 text-[0.5625rem]">
                      <span className="text-zinc-400 font-bold">Início:</span>{' '}
                      {new Date(a.inicio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {a.fim && (
                    <p className="text-zinc-400 text-[0.5625rem]">
                      <span className="text-zinc-400 font-bold">Fim:</span>{' '}
                      {new Date(a.fim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {a.status === 'PENDENTE' && (
                    <button
                      onClick={() =>
                        setConfirmar({
                          comunidadeId: a.comunidadeId,
                          acao: 'ATIVAR',
                          nome: getComunidadeNome(a.comunidadeId),
                        })
                      }
                      className="flex-1 py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Ativar
                    </button>
                  )}
                  {(a.status === 'ATIVA' || a.status === 'PENDENTE') && (
                    <button
                      onClick={() =>
                        setConfirmar({
                          comunidadeId: a.comunidadeId,
                          acao: 'CANCELAR',
                          nome: getComunidadeNome(a.comunidadeId),
                        })
                      }
                      className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
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
            <p className="text-white font-bold text-sm text-center">
              {confirmar.acao === 'ATIVAR' ? 'Ativar assinatura?' : 'Cancelar assinatura?'}
            </p>
            <p className="text-zinc-400 text-[0.625rem] text-center leading-relaxed">
              {confirmar.acao === 'ATIVAR'
                ? `A assinatura de "${confirmar.nome}" será ativada imediatamente.`
                : `A assinatura de "${confirmar.nome}" será cancelada. O módulo MAIS VANTA será desativado.`}
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
                  setLoading(true);
                  if (confirmar.acao === 'ATIVAR') {
                    await assinaturaService.ativarAssinatura(confirmar.comunidadeId);
                  } else {
                    await assinaturaService.cancelarAssinatura(confirmar.comunidadeId);
                  }
                  setLoading(false);
                  setConfirmar(null);
                  setTick(t => t + 1);
                }}
                className={`flex-1 py-3 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 ${
                  confirmar.acao === 'ATIVAR' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                }`}
              >
                {loading ? 'Aguarde...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
