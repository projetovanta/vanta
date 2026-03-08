import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, Shield, Ban, AlertCircle, RefreshCw, LogOut, Gift } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { tsBR } from '../../../utils';
import { clubeService } from '../services/clubeService';
import { comunidadesService } from '../services/comunidadesService';
import { supabase } from '../../../services/supabaseClient';
import type { MembroClubeVanta } from '../../../types';

type Filtro = 'ATIVOS' | 'BLOQUEADOS' | 'BANIDOS' | 'DIVIDA_SOCIAL' | 'TODOS';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ATIVO: { label: 'Ativo', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25', icon: Users },
  BLOQUEADO: { label: 'Bloqueado', color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', icon: Shield },
  BANIDO: { label: 'Banido', color: 'text-red-400 bg-red-500/15 border-red-500/25', icon: Ban },
  DIVIDA: { label: 'Dívida Social', color: 'text-orange-400 bg-orange-500/15 border-orange-500/25', icon: AlertCircle },
};

export const MembrosGlobaisMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<Filtro>('ATIVOS');
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<{
    memberId: string;
    acao: 'DESBLOQUEAR' | 'BANIR' | 'RESOLVER_DIVIDA';
    nome: string;
  } | null>(null);
  const [perfis, setPerfis] = useState<Record<string, { nome: string; foto: string }>>({});
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmaBulk, setConfirmaBulk] = useState<{
    acao: 'BLOQUEAR' | 'DESBLOQUEAR' | 'BANIR';
    count: number;
  } | null>(null);

  const membros = useMemo(() => clubeService.getAllMembros(), []);
  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  // Carregar perfis
  useEffect(() => {
    const ids = [...new Set(membros.map(m => m.userId))].filter(id => !perfis[id]);
    if (ids.length === 0) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, nome, avatar_url')
      .in('id', ids.slice(0, 100) as string[])
      .then(
        ({ data }) => {
          if (cancelled || !data) return;
          const next = { ...perfis };
          for (const r of data)
            next[r.id as string] = { nome: (r.nome as string) ?? '', foto: (r.avatar_url as string) ?? '' };
          setPerfis(next);
        },
        () => {
          /* audit-ok */
        },
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membros.length]);

  const getMembrosFiltered = () => {
    switch (filtro) {
      case 'BLOQUEADOS':
        return membros.filter(m => m.bloqueioNivel > 0 && !m.banidoPermanente);
      case 'BANIDOS':
        return membros.filter(m => m.banidoPermanente);
      case 'DIVIDA_SOCIAL':
        return membros.filter(m => temDividaSocial(m.userId));
      case 'ATIVOS':
        return membros.filter(
          m => m.ativo && m.bloqueioNivel === 0 && !m.banidoPermanente && !temDividaSocial(m.userId),
        );
      default:
        return membros;
    }
  };

  const temDividaSocial = (userId: string): boolean => {
    // Verificar se tem reserva com post não verificado
    const reservasUser = clubeService.getReservasUsuario?.(userId) ?? [];
    return reservasUser.some((r: any) => !r.postVerificado && r.status === 'RESERVADO');
  };

  const getStatusMembro = (m: MembroClubeVanta): string => {
    if (m.banidoPermanente) return 'BANIDO';
    if (m.bloqueioNivel > 0) return 'BLOQUEADO';
    if (temDividaSocial(m.userId)) return 'DIVIDA';
    return 'ATIVO';
  };

  const getComunidadeNome = (id?: string) => {
    if (!id) return '—';
    return comunidades.find(c => c.id === id)?.nome ?? '—';
  };

  const totais = useMemo(
    () => ({
      ativos: membros.filter(m => m.ativo && m.bloqueioNivel === 0 && !m.banidoPermanente && !temDividaSocial(m.userId))
        .length,
      bloqueados: membros.filter(m => m.bloqueioNivel > 0 && !m.banidoPermanente).length,
      banidos: membros.filter(m => m.banidoPermanente).length,
      divida: membros.filter(m => temDividaSocial(m.userId)).length,
    }),
    [membros],
  );

  const handleRefresh = async () => {
    await clubeService.refresh();
    setTick(t => t + 1);
  };

  const handleDesbloquear = async (userId: string) => {
    setLoading(userId);
    try {
      await supabase.from('membros_clube').update({ bloqueio_nivel: 0, bloqueio_ate: null }).eq('user_id', userId);
      handleRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmar(null);
    }
  };

  const handleBanir = async (userId: string) => {
    setLoading(userId);
    try {
      await supabase
        .from('membros_clube')
        .update({
          banido_permanente: true,
          banido_em: tsBR(),
        })
        .eq('user_id', userId);
      handleRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmar(null);
    }
  };

  const handleResolverDivida = async (userId: string) => {
    setLoading(userId);
    try {
      // Marcar todas as reservas como postVerificado
      const reservasUser = clubeService.getReservasUsuario?.(userId) ?? [];
      for (const r of reservasUser) {
        await supabase.from('reservas_mais_vanta').update({ post_verificado: true }).eq('id', r.id);
      }
      handleRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmar(null);
    }
  };

  const handleBulkBloquear = async () => {
    const ids = Array.from(selecionados);
    setLoading('BULK');
    try {
      for (const userId of ids) {
        await supabase
          .from('membros_clube')
          .update({
            bloqueio_nivel: 1,
            bloqueio_ate:
              new Date(Date.now() + 30 * 24 * 3600000)
                .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
                .replace(' ', 'T') + '-03:00',
          })
          .eq('user_id', userId as string);
      }
      handleRefresh();
      setSelecionados(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmaBulk(null);
    }
  };

  const handleBulkDesbloquear = async () => {
    const ids = Array.from(selecionados);
    setLoading('BULK');
    try {
      for (const userId of ids) {
        await supabase
          .from('membros_clube')
          .update({ bloqueio_nivel: 0, bloqueio_ate: null })
          .eq('user_id', userId as string);
      }
      handleRefresh();
      setSelecionados(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmaBulk(null);
    }
  };

  const handleBulkBanir = async () => {
    const ids = Array.from(selecionados);
    setLoading('BULK');
    try {
      for (const userId of ids) {
        await supabase
          .from('membros_clube')
          .update({
            banido_permanente: true,
            banido_em: tsBR(),
          })
          .eq('user_id', userId as string);
      }
      handleRefresh();
      setSelecionados(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setConfirmaBulk(null);
    }
  };

  const filtrados = getMembrosFiltered();

  const filtros: { id: Filtro; label: string; count: number }[] = [
    { id: 'ATIVOS', label: 'Ativos', count: totais.ativos },
    { id: 'BLOQUEADOS', label: 'Bloqueados', count: totais.bloqueados },
    { id: 'BANIDOS', label: 'Banidos', count: totais.banidos },
    { id: 'DIVIDA_SOCIAL', label: 'Dívida Social', count: totais.divida },
    { id: 'TODOS', label: 'Todos', count: membros.length },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        {selecionados.size > 0 && (
          <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center justify-between">
            <span className="text-amber-400 text-[9px] font-black uppercase tracking-widest">
              {selecionados.size} selecionado(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmaBulk({ acao: 'BLOQUEAR', count: selecionados.size })}
                className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-[8px] font-black uppercase active:scale-95 transition-all"
              >
                Bloquear
              </button>
              <button
                onClick={() => setConfirmaBulk({ acao: 'DESBLOQUEAR', count: selecionados.size })}
                className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[8px] font-black uppercase active:scale-95 transition-all"
              >
                Desbloquear
              </button>
              <button
                onClick={() => setConfirmaBulk({ acao: 'BANIR', count: selecionados.size })}
                className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-[8px] font-black uppercase active:scale-95 transition-all"
              >
                Banir
              </button>
              <button
                onClick={() => setSelecionados(new Set())}
                className="px-2 py-1 bg-zinc-800 border border-white/10 rounded-lg text-zinc-500 text-[8px] font-black uppercase active:scale-95 transition-all"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Visão Global
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Membros MAIS VANTA
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-black text-xl leading-none">{totais.ativos}</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mt-1">Ativos</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-xl leading-none">{totais.bloqueados}</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mt-1">Bloqueados</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-red-400 font-black text-xl leading-none">{totais.banidos}</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mt-1">Banidos</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-orange-400 font-black text-xl leading-none">{totais.divida}</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider mt-1">Dívida</p>
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
        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Users size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nenhum membro encontrado</p>
          </div>
        )}

        {filtrados.map(m => {
          const perfil = perfis[m.userId];
          const status = getStatusMembro(m);
          const st = STATUS_CONFIG[status];
          const StIcon = st.icon;
          const isLoading = loading === m.userId;
          const isSelected = selecionados.has(m.userId);

          return (
            <div
              key={m.userId}
              className={`bg-zinc-900/40 border rounded-2xl p-4 transition-all ${isSelected ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={e => {
                    const next = new Set(selecionados);
                    if (e.target.checked) {
                      next.add(m.userId);
                    } else {
                      next.delete(m.userId);
                    }
                    setSelecionados(next);
                  }}
                  className="w-5 h-5 rounded border-white/20 accent-amber-400 shrink-0 cursor-pointer"
                />
                {perfil?.foto ? (
                  <img
                    loading="lazy"
                    src={perfil.foto}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{perfil?.nome || m.userId.slice(0, 8)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${st.color}`}
                    >
                      <StIcon size={9} /> {st.label}
                    </span>
                    <span className="text-[#FFD300] text-[9px] font-black">{m.tier}</span>
                  </div>
                  <p className="text-zinc-600 text-[9px] mt-1">Origem: {getComunidadeNome(m.comunidadeOrigem)}</p>
                </div>

                {/* Status info */}
                <div className="text-right shrink-0 text-[9px] text-zinc-500">
                  {m.bloqueioAte && (
                    <p>Até {new Date(m.bloqueioAte).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                  )}
                  {m.instagramHandle && <p className="text-zinc-600">@{m.instagramHandle}</p>}
                </div>
              </div>

              {/* Ações */}
              <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                {m.bloqueioNivel > 0 && !m.banidoPermanente && (
                  <button
                    onClick={() =>
                      setConfirmar({ memberId: m.userId, acao: 'DESBLOQUEAR', nome: perfil?.nome || m.userId })
                    }
                    disabled={isLoading}
                    className="flex-1 py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
                  >
                    <LogOut size={12} className="inline mr-1" /> Desbloquear
                  </button>
                )}
                {!m.banidoPermanente && (
                  <button
                    onClick={() => setConfirmar({ memberId: m.userId, acao: 'BANIR', nome: perfil?.nome || m.userId })}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Ban size={12} className="inline mr-1" /> Banir
                  </button>
                )}
                {temDividaSocial(m.userId) && (
                  <button
                    onClick={() =>
                      setConfirmar({ memberId: m.userId, acao: 'RESOLVER_DIVIDA', nome: perfil?.nome || m.userId })
                    }
                    disabled={isLoading}
                    className="flex-1 py-2 bg-orange-500/15 border border-orange-500/25 rounded-xl text-orange-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Gift size={12} className="inline mr-1" /> Resolver
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal confirmação unitária */}
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
              {confirmar.acao === 'DESBLOQUEAR'
                ? 'Desbloquear membro?'
                : confirmar.acao === 'BANIR'
                  ? 'Banir permanentemente?'
                  : 'Resolver dívida social?'}
            </p>
            <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
              {confirmar.acao === 'DESBLOQUEAR'
                ? `"${confirmar.nome}" poderá participar de eventos MAIS VANTA novamente.`
                : confirmar.acao === 'BANIR'
                  ? `"${confirmar.nome}" será banido permanentemente. Não poderá solicitar entrada novamente.`
                  : `A dívida social de "${confirmar.nome}" será resolvida.`}
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
                  if (confirmar.acao === 'DESBLOQUEAR') {
                    await handleDesbloquear(confirmar.memberId);
                  } else if (confirmar.acao === 'BANIR') {
                    await handleBanir(confirmar.memberId);
                  } else {
                    await handleResolverDivida(confirmar.memberId);
                  }
                }}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 ${
                  confirmar.acao === 'DESBLOQUEAR'
                    ? 'bg-emerald-500 text-black'
                    : confirmar.acao === 'BANIR'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white'
                }`}
              >
                {loading ? 'Aguarde...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmação bulk */}
      {confirmaBulk && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => !loading && setConfirmaBulk(null)}
        >
          <div
            className="w-full max-w-xs bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">
              {confirmaBulk.acao === 'BLOQUEAR'
                ? 'Bloquear membros?'
                : confirmaBulk.acao === 'DESBLOQUEAR'
                  ? 'Desbloquear membros?'
                  : 'Banir membros?'}
            </p>
            <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
              Esta ação afetará {confirmaBulk.count} membro{confirmaBulk.count > 1 ? 's' : ''}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmaBulk(null)}
                disabled={loading === 'BULK'}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                disabled={loading === 'BULK'}
                onClick={async () => {
                  if (confirmaBulk.acao === 'BLOQUEAR') {
                    await handleBulkBloquear();
                  } else if (confirmaBulk.acao === 'DESBLOQUEAR') {
                    await handleBulkDesbloquear();
                  } else {
                    await handleBulkBanir();
                  }
                }}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 ${
                  confirmaBulk.acao === 'BLOQUEAR'
                    ? 'bg-amber-500 text-black'
                    : confirmaBulk.acao === 'DESBLOQUEAR'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-red-500 text-white'
                }`}
              >
                {loading === 'BULK' ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
