import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Trash2, Search, X, Check, Loader2 } from 'lucide-react';
import { ListaEvento } from '../../../../types';
import { authService } from '../../../../services/authService';
import { cortesiasService } from '../../services/cortesiasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { rbacService } from '../../services/rbacService';
import { supabase } from '../../../../services/supabaseClient';
import { StaffRecrutamento } from './StaffRecrutamento';
import { Papel, PAPEIS, inputCls } from './types';

type EquipeMembro = {
  id: string;
  membro_id: string;
  nome: string;
  foto?: string;
  papel: string;
  liberar_lista: boolean;
};

/** Seção de staff — deriva contexto do listaId e aplica guard GERIR_EQUIPE */
const StaffRecrutamentoSection: React.FC<{ listaId: string; toastFn?: (t: 'sucesso' | 'erro', m: string) => void }> = ({
  listaId,
  toastFn,
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const eventoAdminId = cortesiasService.getEventoAdminId(listaId) ?? '';
  const evento = eventoAdminId ? eventosAdminService.getEvento(eventoAdminId) : undefined;
  const comunidadeId = evento?.comunidadeId ?? '';

  if (!currentUserId || !eventoAdminId || !comunidadeId) return null;
  if (
    !rbacService.temPermissaoCtx(currentUserId, 'GERIR_EQUIPE', { communityId: comunidadeId, eventId: eventoAdminId })
  )
    return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mb-4">Staff do Evento</p>
      <StaffRecrutamento
        eventoAdminId={eventoAdminId}
        comunidadeId={comunidadeId}
        currentUserId={currentUserId}
        toastFn={toastFn}
      />
    </div>
  );
};

export const TabEquipeSocio: React.FC<{
  listaId: string;
  lista: ListaEvento;
  onUpdate: () => void;
  toastFn?: (t: 'sucesso' | 'erro', m: string) => void;
}> = ({ listaId, lista, onUpdate, toastFn }) => {
  const [membros, setMembros] = useState<EquipeMembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cargoTarget, setCargoTarget] = useState<{ id: string; nome: string; foto: string; email: string } | null>(
    null,
  );
  const [selPapel, setSelPapel] = useState<Papel>('Promoter');

  const eventoId = cortesiasService.getEventoAdminId(listaId) ?? '';

  // Carregar equipe do Supabase
  const fetchEquipe = useCallback(async () => {
    if (!eventoId) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('equipe_evento')
        .select('id, membro_id, papel, liberar_lista, profiles!equipe_evento_membro_id_fkey(nome, avatar_url)')
        .eq('evento_id', eventoId);
      if (error) throw error;
      setMembros(
        (data ?? []).map((r: any) => {
          const p = r.profiles;
          return {
            id: r.id as string,
            membro_id: r.membro_id as string,
            nome: (p?.nome as string) ?? 'Sem nome',
            foto: (p?.avatar_url as string) ?? undefined,
            papel: r.papel as string,
            liberar_lista: r.liberar_lista as boolean,
          };
        }),
      );
    } catch (err) {
      console.error('[TabEquipeSocio] fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    fetchEquipe();
  }, [fetchEquipe]);

  const [resultados, setResultados] = useState<{ id: string; nome: string; email: string; foto: string }[]>([]);
  const membrosRef = useRef(membros);
  membrosRef.current = membros;

  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const r = await authService.buscarMembros(query, 8);
        if (cancelled) return;
        const ids = new Set(membrosRef.current.map(m => m.membro_id));
        setResultados(r.filter(m => !ids.has(m.id)).slice(0, 5));
      } catch {
        /* audit-ok */
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const handleAdd = async (papel: Papel) => {
    if (!cargoTarget || !eventoId) return;
    try {
      const { error } = await supabase.from('equipe_evento').insert({
        evento_id: eventoId,
        membro_id: cargoTarget.id,
        papel,
        liberar_lista: papel === 'Promoter',
      });
      if (error) throw error;
      // Notifica membro escalado
      const evNome = eventosAdminService.getEvento(eventoId)?.nome ?? '';
      void eventosAdminService.notificarEscalacao(cargoTarget.id, papel, eventoId, evNome);
      toastFn?.('sucesso', `${cargoTarget.nome} adicionado à equipe`);
      onUpdate();
      await fetchEquipe();
    } catch (err) {
      console.error('[TabEquipeSocio] add:', err);
      toastFn?.('erro', 'Erro ao adicionar membro');
    } finally {
      setCargoTarget(null);
      setSelPapel('Promoter');
      setQuery('');
      setShowResults(false);
    }
  };

  const handleRemover = async (rowId: string) => {
    const m = membros.find(m => m.id === rowId);
    try {
      const { error } = await supabase.from('equipe_evento').delete().eq('id', rowId);
      if (error) throw error;
      toastFn?.('sucesso', `${m?.nome ?? 'Membro'} removido da equipe`);
      onUpdate();
      await fetchEquipe();
    } catch (err) {
      console.error('[TabEquipeSocio] remove:', err);
      toastFn?.('erro', 'Erro ao remover membro');
    }
  };

  const toggleLiberarLista = async (rowId: string) => {
    const m = membros.find(m => m.id === rowId);
    if (!m) return;
    try {
      const { error } = await supabase
        .from('equipe_evento')
        .update({ liberar_lista: !m.liberar_lista })
        .eq('id', rowId);
      if (error) throw error;
      setMembros(prev => prev.map(x => (x.id === rowId ? { ...x, liberar_lista: !x.liberar_lista } : x)));
    } catch (err) {
      console.error('[TabEquipeSocio] toggle:', err);
      toastFn?.('erro', 'Erro ao atualizar permissão');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
          <Search size="0.875rem" className="text-zinc-400 shrink-0" />
          <input
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Buscar por email ou nome..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="text-zinc-400 active:text-zinc-400"
            >
              <X size="0.8125rem" />
            </button>
          )}
        </div>
        {showResults && resultados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl">
            {resultados.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setCargoTarget({ id: m.id, nome: m.nome, foto: m.foto, email: m.email });
                  setShowResults(false);
                }}
                className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-all text-left"
              >
                <img loading="lazy" src={m.foto} alt={m.nome} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-none truncate">{m.nome}</p>
                  <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{m.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {membros.length === 0 && (
        <div className="flex flex-col items-center py-10 gap-3">
          <Users size="1.75rem" className="text-zinc-800" />
          <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
            Nenhum membro na equipe ainda
          </p>
        </div>
      )}

      <div className="space-y-3">
        {membros.map(m => (
          <div key={m.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                {m.foto ? (
                  <img loading="lazy" src={m.foto} alt={m.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-base">
                    {m.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none truncate mb-1">{m.nome}</p>
                <span className="text-[0.5rem] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/5">
                  {m.papel}
                </span>
              </div>
              <button
                onClick={() => handleRemover(m.id)}
                className="text-zinc-700 active:text-red-400 transition-colors p-1.5 shrink-0"
              >
                <Trash2 size="0.8125rem" />
              </button>
            </div>

            {lista.regras.length > 0 && (
              <div className="border-t border-white/5">
                <button
                  onClick={() => toggleLiberarLista(m.id)}
                  className="w-full flex items-center justify-between px-4 py-3 active:bg-white/3 transition-all"
                >
                  <div className="text-left">
                    <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">Liberar Lista</p>
                    <p className="text-zinc-700 text-[0.5625rem] mt-0.5">
                      {m.liberar_lista ? 'Pode inserir nomes com as cotas abaixo' : 'Sem acesso à lista de convidados'}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full border relative transition-all shrink-0 ${m.liberar_lista ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${m.liberar_lista ? 'left-5 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
                    />
                  </div>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Staff do Evento (Recrutamento V2) ─────────────────────────── */}
      <StaffRecrutamentoSection listaId={listaId} toastFn={toastFn} />

      {/* Modal de cargo */}
      {cargoTarget && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setCargoTarget(null)}
        >
          <div
            className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-4 pb-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                {cargoTarget.foto && (
                  <img
                    loading="lazy"
                    src={cargoTarget.foto}
                    alt={cargoTarget.nome}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-base leading-none truncate">{cargoTarget.nome}</p>
                <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{cargoTarget.email}</p>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-3">
                Cargo neste evento
              </p>
              {PAPEIS.map(p => (
                <button
                  key={p}
                  onClick={() => setSelPapel(p)}
                  className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all text-left ${selPapel === p ? 'border-[#FFD300]/30 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${selPapel === p ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
                  />
                  <p className={`font-bold text-sm leading-none ${selPapel === p ? 'text-[#FFD300]' : 'text-white'}`}>
                    {p}
                  </p>
                </button>
              ))}
            </div>
            <div className="px-5" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
              <button
                onClick={() => handleAdd(selPapel)}
                className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Check size="0.8125rem" /> Adicionar à Equipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
