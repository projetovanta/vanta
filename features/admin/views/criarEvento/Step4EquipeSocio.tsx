import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import { authService } from '../../../../services/authService';
import type { Membro, PapelEquipeEvento } from '../../../../types';
import type { EquipeForm, VarListaForm, SocioConviteForm, PermissaoToggle } from './types';
import { inputSmCls, labelCls, PAPEIS_CASA, PERMISSOES_TOGGLE } from './constants';
import { uid, buildLabel } from './utils';
import { CargoModal } from './CargoModal';

interface Props {
  socio: SocioConviteForm | null;
  setSocio: React.Dispatch<React.SetStateAction<SocioConviteForm | null>>;
  permissoes: PermissaoToggle[];
  setPermissoes: React.Dispatch<React.SetStateAction<PermissaoToggle[]>>;
  equipe: EquipeForm[];
  setEquipe: React.Dispatch<React.SetStateAction<EquipeForm[]>>;
  varsLista?: VarListaForm[];
  listasEnabled?: boolean;
}

export const Step4EquipeSocio: React.FC<Props> = ({
  socio,
  setSocio,
  permissoes,
  setPermissoes,
  equipe,
  setEquipe,
  varsLista,
  listasEnabled,
}) => {
  // ── Busca de sócio ──
  const [socioQuery, setSocioQuery] = useState('');
  const [socioResults, setSocioResults] = useState<Membro[]>([]);
  const [socioBuscando, setSocioBuscando] = useState(false);
  const [showSocioResults, setShowSocioResults] = useState(false);

  const socioIdRef = useRef(socio?.membroId);
  socioIdRef.current = socio?.membroId;

  useEffect(() => {
    if (socioQuery.length < 2) {
      setSocioResults([]);
      setSocioBuscando(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setSocioBuscando(true);
      try {
        const r = await authService.buscarMembros(socioQuery, 5);
        if (cancelled) return;
        setSocioResults(r.filter(m => m.id !== socioIdRef.current));
      } catch (err) {
        console.error('[Step4EquipeSocio] busca sócio:', err);
      } finally {
        if (!cancelled) setSocioBuscando(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [socioQuery]);

  const selectSocio = (m: Membro) => {
    setSocio({ membroId: m.id, nome: m.nome, email: m.email, foto: m.foto, permissoes: [] });
    setSocioQuery('');
    setShowSocioResults(false);
  };

  const togglePermissao = (p: PermissaoToggle) => {
    setPermissoes(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  };

  // ── Equipe da casa ──
  const [query, setQuery] = useState('');
  const [cargoTarget, setCargoTarget] = useState<Membro | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultados, setResultados] = useState<Membro[]>([]);
  const [buscando, setBuscando] = useState(false);
  const equipeRef = useRef(equipe);
  equipeRef.current = equipe;
  const socioRef = useRef(socio);
  socioRef.current = socio;

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
        if (socioRef.current) ids.add(socioRef.current.membroId);
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
      {/* ── CONVIDAR SÓCIO ── */}
      <div className="p-4 bg-zinc-900/40 border border-[#FFD300]/15 rounded-2xl space-y-4">
        <div>
          <p className="text-[#FFD300] text-[8px] font-black uppercase tracking-widest mb-1">Convidar Sócio</p>
          <p className="text-zinc-400 text-[10px] leading-relaxed">
            O sócio será convidado para co-gerenciar o evento. Ele receberá uma notificação para aceitar.
          </p>
        </div>

        {!socio ? (
          <div className="relative">
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
              <Search size={14} className="text-zinc-400 shrink-0" />
              <input
                value={socioQuery}
                onChange={e => {
                  setSocioQuery(e.target.value);
                  setShowSocioResults(true);
                }}
                onFocus={() => setShowSocioResults(true)}
                placeholder="Buscar sócio por email ou nome..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
              />
              {socioQuery && (
                <button
                  onClick={() => {
                    setSocioQuery('');
                    setShowSocioResults(false);
                  }}
                  className="text-zinc-400 active:text-zinc-400"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {showSocioResults && socioQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                {socioBuscando && (
                  <div className="p-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Buscando...</span>
                  </div>
                )}
                {!socioBuscando && socioResults.length === 0 && (
                  <p className="p-4 text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
                    Nenhum membro encontrado
                  </p>
                )}
                {!socioBuscando &&
                  socioResults.map(m => (
                    <button
                      key={m.id}
                      onClick={() => selectSocio(m)}
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
                        <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{m.email}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-zinc-800/60 border border-[#FFD300]/20 rounded-xl">
            <img
              loading="lazy"
              src={socio.foto}
              alt={socio.nome}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none truncate">{socio.nome}</p>
              <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{socio.email}</p>
            </div>
            <button
              onClick={() => setSocio(null)}
              className="text-zinc-400 active:text-red-400 transition-colors p-1 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Permissões para o produtor */}
        {socio && (
          <div className="space-y-2">
            <p className={labelCls}>Permissões para o Produtor</p>
            <p className="text-zinc-400 text-[9px] leading-relaxed mb-2">
              O sócio terá acesso total. Selecione o que <span className="text-white">você (produtor)</span> também
              deseja acessar.
            </p>
            {PERMISSOES_TOGGLE.map(p => (
              <button
                key={p.id}
                onClick={() => togglePermissao(p.id)}
                className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all text-left ${
                  permissoes.includes(p.id) ? 'border-[#FFD300]/25 bg-[#FFD300]/5' : 'border-white/5 bg-zinc-900/40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-sm leading-none mb-0.5 ${permissoes.includes(p.id) ? 'text-[#FFD300]' : 'text-white'}`}
                  >
                    {p.label}
                  </p>
                  <p className="text-zinc-400 text-[9px]">{p.desc}</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full border relative transition-all shrink-0 ml-3 ${
                    permissoes.includes(p.id) ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      permissoes.includes(p.id) ? 'left-5 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── EQUIPE DA CASA ── */}
      <div className="space-y-4">
        <div>
          <p className="text-white text-[8px] font-black uppercase tracking-widest mb-1">Equipe da Casa</p>
          <p className="text-zinc-400 text-[10px] leading-relaxed">
            Busque pelo email ou nome do membro para adicioná-lo à equipe.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
            <Search size={14} className="text-zinc-400 shrink-0" />
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
                <X size={13} />
              </button>
            )}
          </div>
          {showResults && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
              {buscando && (
                <div className="p-4 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
                  <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Buscando...</span>
                </div>
              )}
              {!buscando && resultados.length === 0 && (
                <p className="p-4 text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
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
                      <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{m.email}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {equipe.length === 0 && (
          <p className="text-zinc-700 text-[10px] italic text-center py-6">
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
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/5">
                      {papelInfo?.label || m.papel}
                    </span>
                  </div>
                  <button
                    onClick={() => setEquipe(prev => prev.filter(x => x.id !== m.id))}
                    className="text-zinc-700 active:text-red-400 transition-colors p-1.5 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {listasEnabled && varsLista.length > 0 && (
                  <div className="border-t border-white/5">
                    <button
                      onClick={() => toggleLiberarLista(m.id)}
                      className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-all"
                    >
                      <div className="text-left">
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Liberar Lista</p>
                        <p className="text-zinc-700 text-[9px] mt-0.5">
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
                        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                          Limite por variação
                        </p>
                        {varsLista.map(v => (
                          <div key={v.id} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.cor }} />
                            <p className="text-zinc-400 text-[10px] flex-1 truncate">{buildLabel(v)}</p>
                            <input
                              value={getQuota(m, v.id)}
                              onChange={e => setQuota(m.id, v.id, e.target.value)}
                              type="number"
                              min="0"
                              placeholder="0"
                              className={inputSmCls + ' text-center w-14 shrink-0'}
                            />
                            <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest shrink-0">
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
