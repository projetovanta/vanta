import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Trash2, Check } from 'lucide-react';
import { authService } from '../../../../services/authService';
import type { Membro, PapelEquipeEvento } from '../../../../types';
import type { EquipeForm, VarListaForm } from './types';
import { inputSmCls, labelCls, PAPEIS_CASA } from './constants';
import { uid, buildLabel } from './utils';
import { CargoModal } from './CargoModal';

interface GerenteForm {
  membroId: string;
  nome: string;
  email: string;
  foto: string;
}

const GERENTE_PERMISSOES = [
  { id: 'VER_FINANCEIRO', label: 'Ver Financeiro' },
  { id: 'GERIR_EQUIPE', label: 'Gerir Equipe' },
  { id: 'GERIR_LISTAS', label: 'Gerir Listas' },
  { id: 'INSERIR_LISTA', label: 'Inserir na Lista' },
  { id: 'CRIAR_REGRA_LISTA', label: 'Criar Variações' },
  { id: 'VER_LISTA', label: 'Ver Lista' },
  { id: 'CHECKIN_LISTA', label: 'Check-in por Lista' },
  { id: 'VALIDAR_QR', label: 'Validar QR Code' },
] as const;

interface Props {
  gerente: GerenteForm | null;
  setGerente: React.Dispatch<React.SetStateAction<GerenteForm | null>>;
  gerentePermissoes: string[];
  setGerentePermissoes: React.Dispatch<React.SetStateAction<string[]>>;
  equipe: EquipeForm[];
  setEquipe: React.Dispatch<React.SetStateAction<EquipeForm[]>>;
  varsLista?: VarListaForm[];
  listasEnabled?: boolean;
}

export const Step4EquipeCasa: React.FC<Props> = ({
  gerente,
  setGerente,
  gerentePermissoes,
  setGerentePermissoes,
  equipe,
  setEquipe,
  varsLista,
  listasEnabled,
}) => {
  const toggleGerPerm = (p: string) =>
    setGerentePermissoes(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  const [gerenteEnabled, setGerenteEnabled] = useState(!!gerente);
  const [gerenteQuery, setGerenteQuery] = useState('');
  const [gerenteResults, setGerenteResults] = useState<Membro[]>([]);
  const [gerenteBuscando, setGerenteBuscando] = useState(false);
  const [showGerenteResults, setShowGerenteResults] = useState(false);
  const gerenteRef = useRef(gerente);
  gerenteRef.current = gerente;

  useEffect(() => {
    if (gerenteQuery.length < 2) {
      setGerenteResults([]);
      setGerenteBuscando(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setGerenteBuscando(true);
      try {
        const r = await authService.buscarMembros(gerenteQuery, 5);
        if (cancelled) return;
        setGerenteResults(r.filter(m => m.id !== gerenteRef.current?.membroId));
      } catch {
        /* audit-ok */
      } finally {
        if (!cancelled) setGerenteBuscando(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [gerenteQuery]);

  const selectGerente = (m: Membro) => {
    setGerente({ membroId: m.id, nome: m.nome, email: m.email, foto: m.foto });
    setGerenteQuery('');
    setShowGerenteResults(false);
  };

  // ── Equipe ──
  const [query, setQuery] = useState('');
  const [cargoTarget, setCargoTarget] = useState<Membro | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultados, setResultados] = useState<Membro[]>([]);
  const [buscando, setBuscando] = useState(false);
  const equipeRef = useRef(equipe);
  equipeRef.current = equipe;

  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setBuscando(true);
      try {
        const r = await authService.buscarMembros(query, 8);
        if (cancelled) return;
        const ids = new Set(equipeRef.current.map(e => e.membroId));
        if (gerenteRef.current) ids.add(gerenteRef.current.membroId);
        setResultados(r.filter(m => !ids.has(m.id)).slice(0, 5));
      } catch {
        /* audit-ok */
      } finally {
        if (!cancelled) setBuscando(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const handleAdd = (membro: Membro, papel: PapelEquipeEvento) => {
    setEquipe(prev => [
      ...prev,
      {
        id: uid(),
        membroId: membro.id,
        nome: membro.nome,
        email: membro.email,
        foto: membro.foto,
        papel,
        liberarLista: papel === 'PROMOTER',
        quotas: (varsLista ?? []).map(v => ({ varListaId: v.id, quantidade: '' })),
      },
    ]);
    setCargoTarget(null);
    setQuery('');
    setShowResults(false);
  };

  const toggleLiberarLista = (equipeId: string) =>
    setEquipe(prev => prev.map(e => (e.id !== equipeId ? e : { ...e, liberarLista: !e.liberarLista })));

  const getQuota = (eq: EquipeForm, varId: string) => eq.quotas.find(q => q.varListaId === varId)?.quantidade || '';

  const setQuota = (equipeId: string, varId: string, qtd: string) =>
    setEquipe(prev =>
      prev.map(e => {
        if (e.id !== equipeId) return e;
        const exists = e.quotas.find(q => q.varListaId === varId);
        return {
          ...e,
          quotas: exists
            ? e.quotas.map(q => (q.varListaId !== varId ? q : { ...q, quantidade: qtd }))
            : [...e.quotas, { varListaId: varId, quantidade: qtd }],
        };
      }),
    );

  return (
    <div className="space-y-6">
      {/* ── GERENTE DE EVENTO ── */}
      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4">
        <button
          onClick={() => {
            setGerenteEnabled(!gerenteEnabled);
            if (gerenteEnabled) setGerente(null);
          }}
          className="w-full flex items-center justify-between"
        >
          <div className="text-left">
            <p className="text-white text-[0.5rem] font-black uppercase tracking-widest mb-0.5">Gerente de Evento</p>
            <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
              Opcional. Designe alguém para supervisionar a operação.
            </p>
          </div>
          <div
            className={`w-12 h-6 rounded-full border relative transition-all shrink-0 ml-3 ${
              gerenteEnabled ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                gerenteEnabled ? 'left-6 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'
              }`}
            />
          </div>
        </button>

        {gerenteEnabled && !gerente && (
          <div className="relative">
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
              <Search size="0.875rem" className="text-zinc-400 shrink-0" />
              <input
                value={gerenteQuery}
                onChange={e => {
                  setGerenteQuery(e.target.value);
                  setShowGerenteResults(true);
                }}
                onFocus={() => setShowGerenteResults(true)}
                placeholder="Buscar gerente por email ou nome..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
              />
              {gerenteQuery && (
                <button
                  onClick={() => {
                    setGerenteQuery('');
                    setShowGerenteResults(false);
                  }}
                  className="text-zinc-400 active:text-zinc-400"
                >
                  <X size="0.8125rem" />
                </button>
              )}
            </div>
            {showGerenteResults && gerenteQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                {gerenteBuscando && (
                  <div className="p-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
                    <span className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
                      Buscando...
                    </span>
                  </div>
                )}
                {!gerenteBuscando && gerenteResults.length === 0 && (
                  <p className="p-4 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
                    Nenhum membro encontrado
                  </p>
                )}
                {!gerenteBuscando &&
                  gerenteResults.map(m => (
                    <button
                      key={m.id}
                      onClick={() => selectGerente(m)}
                      className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-all text-left"
                    >
                      <img
                        loading="lazy"
                        src={m.foto}
                        alt={m.nome}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-sm leading-none truncate">{m.nome}</p>
                        <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{m.email}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {gerenteEnabled && gerente && (
          <div className="flex items-center gap-3 p-3 bg-zinc-800/60 border border-emerald-500/20 rounded-xl">
            <img
              loading="lazy"
              src={gerente.foto}
              alt={gerente.nome}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none truncate">{gerente.nome}</p>
              <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{gerente.email}</p>
            </div>
            <span className="text-[0.4375rem] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              Gerente
            </span>
            <button
              onClick={() => {
                setGerente(null);
                setGerentePermissoes([]);
              }}
              className="text-zinc-400 active:text-red-400 transition-colors p-1 shrink-0"
            >
              <X size="0.875rem" />
            </button>
          </div>
        )}

        {/* Permissões do Gerente */}
        {gerenteEnabled && gerente && (
          <div className="space-y-2">
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Permissões do Gerente</p>
            {GERENTE_PERMISSOES.map(p => (
              <button
                key={p.id}
                onClick={() => toggleGerPerm(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  gerentePermissoes.includes(p.id)
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    gerentePermissoes.includes(p.id) ? 'border-emerald-400 bg-emerald-400' : 'border-zinc-600'
                  }`}
                >
                  {gerentePermissoes.includes(p.id) && <Check size="0.5rem" className="text-black" strokeWidth={3} />}
                </div>
                <span className="text-zinc-300 text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── EQUIPE DA CASA ── */}
      <div className="space-y-4">
        <div>
          <p className="text-white text-[0.5rem] font-black uppercase tracking-widest mb-1">Equipe da Casa</p>
          <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
            Busque pelo email ou nome do membro para adicioná-lo à equipe.
          </p>
        </div>

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
          {showResults && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
              {buscando && (
                <div className="p-4 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
                  <span className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
                    Buscando...
                  </span>
                </div>
              )}
              {!buscando && resultados.length === 0 && (
                <p className="p-4 text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
                  Nenhum membro encontrado
                </p>
              )}
              {!buscando &&
                resultados.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCargoTarget(m);
                      setShowResults(false);
                    }}
                    className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-all text-left"
                  >
                    <img
                      loading="lazy"
                      src={m.foto}
                      alt={m.nome}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm leading-none truncate">{m.nome}</p>
                      <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{m.email}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {equipe.length === 0 && (
          <p className="text-zinc-700 text-[0.625rem] italic text-center py-6">
            Nenhum membro adicionado. A equipe pode ser definida depois.
          </p>
        )}

        <div className="space-y-3">
          {equipe.map(m => {
            const papelInfo = PAPEIS_CASA.find(p => p.id === m.papel);
            return (
              <div key={m.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <img
                    loading="lazy"
                    src={m.foto}
                    alt={m.nome}
                    className="w-11 h-11 rounded-2xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-none mb-1 truncate">{m.nome}</p>
                    <span className="text-[0.5rem] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/5">
                      {papelInfo?.label || m.papel}
                    </span>
                  </div>
                  <button
                    onClick={() => setEquipe(prev => prev.filter(x => x.id !== m.id))}
                    className="text-zinc-700 active:text-red-400 transition-colors p-1.5 shrink-0"
                  >
                    <Trash2 size="0.8125rem" />
                  </button>
                </div>

                {listasEnabled && varsLista.length > 0 && (
                  <div className="border-t border-white/5">
                    <button
                      onClick={() => toggleLiberarLista(m.id)}
                      className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-all"
                    >
                      <div className="text-left">
                        <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
                          Liberar Lista
                        </p>
                        <p className="text-zinc-700 text-[0.5625rem] mt-0.5">
                          {m.liberarLista
                            ? 'Pode inserir nomes com as cotas abaixo'
                            : 'Não tem acesso à lista de convidados'}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full border relative transition-all shrink-0 ${m.liberarLista ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${m.liberarLista ? 'left-5 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
                        />
                      </div>
                    </button>
                    {m.liberarLista && (
                      <div className="px-4 pb-4 space-y-2">
                        <p className={labelCls}>Limite por variação</p>
                        {varsLista.map(v => (
                          <div key={v.id} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.cor }} />
                            <p className="text-zinc-400 text-[0.625rem] flex-1 truncate">{buildLabel(v)}</p>
                            <input
                              value={getQuota(m, v.id)}
                              onChange={e => setQuota(m.id, v.id, e.target.value)}
                              type="number"
                              min="0"
                              placeholder="0"
                              className={inputSmCls + ' text-center w-14 shrink-0'}
                            />
                            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest shrink-0">
                              nomes
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {cargoTarget && (
        <CargoModal
          membro={cargoTarget}
          papeis={PAPEIS_CASA}
          onSelect={handleAdd}
          onClose={() => setCargoTarget(null)}
        />
      )}
    </div>
  );
};
