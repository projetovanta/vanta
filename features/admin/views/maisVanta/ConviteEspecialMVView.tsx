/**
 * ConviteEspecialMVView — Admin envia convites especiais para membros em eventos (V3 S6)
 * Filtro por tier, cidade, tags, sublevel creator. Seleção individual ou em massa.
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Send, RefreshCw, Users, Filter, Check, X, Sparkles } from 'lucide-react';
import { clubeService } from '../../services/clube';
import type { FiltroMembros } from '../../services/clube/clubeConviteEspecialService';
import { supabase } from '../../../../services/supabaseClient';
import { useAuthStore } from '../../../../stores/authStore';
import { TYPOGRAPHY } from '../../../../constants';
import { tsBR } from '../../../../utils';
import { VantaDropdown } from '../../../../components/VantaDropdown';
import type { TierMaisVanta } from '../../../../types';

interface EventoOption {
  id: string;
  nome: string;
}

interface MembroResult {
  userId: string;
  nome: string;
  tier: string;
  cidade?: string;
}

const TIERS: { value: TierMaisVanta | ''; label: string }[] = [
  { value: '', label: 'Todos os tiers' },
  { value: 'lista', label: 'Lista' },
  { value: 'presenca', label: 'Presença' },
  { value: 'social', label: 'Social' },
  { value: 'creator', label: 'Creator' },
  { value: 'black', label: 'Black' },
];

const SUBLEVELS = [
  { value: '', label: 'Todos' },
  { value: 'creator_200k', label: '200K+' },
  { value: 'creator_500k', label: '500K+' },
  { value: 'creator_1m', label: '1M+' },
];

export const ConviteEspecialMVView: React.FC = () => {
  const adminId = useAuthStore(s => s.currentAccount?.id ?? '');
  const mounted = useRef(true);

  // Estado
  const [eventos, setEventos] = useState<EventoOption[]>([]);
  const [eventoId, setEventoId] = useState('');
  const [filtro, setFiltro] = useState<FiltroMembros>({});
  const [cidade, setCidade] = useState('');
  const [sublevel, setSublevel] = useState('');
  const [membros, setMembros] = useState<MembroResult[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [mensagem, setMensagem] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ enviados: number; erros: number } | null>(null);
  const [showFiltro, setShowFiltro] = useState(true);

  // Carregar eventos futuros
  useEffect(() => {
    mounted.current = true;
    (async () => {
      const now = tsBR();
      const { data } = await supabase
        .from('eventos_admin')
        .select('id, nome')
        .gte('data_hora', now)
        .order('data_hora')
        .limit(50);
      if (data && mounted.current) {
        setEventos(data.map(e => ({ id: e.id, nome: ((e as Record<string, unknown>).nome as string) ?? '' })));
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  const buscarMembros = useCallback(async () => {
    setBuscando(true);
    setResultado(null);
    const f: FiltroMembros = {};
    if (filtro.tier) f.tier = filtro.tier;
    if (cidade.trim()) f.cidade = cidade.trim();
    if (sublevel) f.creatorSublevelMinimo = sublevel;
    const result = await clubeService.buscarMembrosPorFiltro(f);
    if (mounted.current) {
      setMembros(result);
      setSelecionados(new Set());
    }
    setBuscando(false);
  }, [filtro.tier, cidade, sublevel]);

  const toggleMembro = (userId: string) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selecionados.size === membros.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(membros.map(m => m.userId)));
    }
  };

  const enviar = async () => {
    if (!eventoId || selecionados.size === 0) return;
    setEnviando(true);
    const eventoNome = eventos.find(e => e.id === eventoId)?.nome ?? 'Evento';
    const result = await clubeService.enviarConvitesEspeciais(
      eventoId,
      eventoNome,
      [...selecionados],
      adminId,
      mensagem,
    );
    if (mounted.current) {
      setResultado(result);
      setSelecionados(new Set());
    }
    setEnviando(false);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
      <p style={TYPOGRAPHY.sectionKicker} className="mb-2">
        Convite especial do Vanta
      </p>

      {/* Selecionar evento */}
      <div className="space-y-1.5">
        <label className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">Evento</label>
        <VantaDropdown
          value={eventoId}
          options={eventos.map(ev => ({ value: ev.id, label: ev.nome }))}
          onChange={setEventoId}
          placeholder="Selecione um evento"
        />
      </div>

      {/* Filtros */}
      <button
        onClick={() => setShowFiltro(!showFiltro)}
        className="flex items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-widest text-zinc-400 active:text-zinc-300"
      >
        <Filter size="0.75rem" />
        {showFiltro ? 'Esconder filtros' : 'Mostrar filtros'}
      </button>

      {showFiltro && (
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
          {/* Tier */}
          <div className="flex gap-1.5 flex-wrap">
            {TIERS.map(t => (
              <button
                key={t.value}
                onClick={() => setFiltro(f => ({ ...f, tier: (t.value || undefined) as TierMaisVanta | undefined }))}
                className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                  (filtro.tier ?? '') === t.value
                    ? 'bg-[#FFD300] text-black border-transparent'
                    : 'bg-zinc-800 text-zinc-400 border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sublevel creator */}
          {filtro.tier === 'creator' && (
            <div className="flex gap-1.5">
              {SUBLEVELS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSublevel(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                    sublevel === s.value
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Cidade */}
          <div className="flex gap-2">
            <input
              value={cidade}
              onChange={e => setCidade(e.target.value)}
              placeholder="Cidade (ex: São Paulo)"
              className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600"
            />
          </div>

          <button
            onClick={buscarMembros}
            disabled={buscando}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] text-[0.625rem] font-black uppercase tracking-wider hover:bg-[#FFD300]/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {buscando ? <RefreshCw size="0.75rem" className="animate-spin" /> : <Search size="0.75rem" />}
            Buscar membros
          </button>
        </div>
      )}

      {/* Resultado da busca */}
      {membros.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              {membros.length} membro{membros.length !== 1 ? 's' : ''} encontrado{membros.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={toggleTodos}
              className="text-[0.625rem] font-black uppercase tracking-widest text-[#FFD300] active:opacity-70"
            >
              {selecionados.size === membros.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>

          <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
            {membros.map(m => (
              <button
                key={m.userId}
                onClick={() => toggleMembro(m.userId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selecionados.has(m.userId) ? 'bg-[#FFD300]/5 border-[#FFD300]/20' : 'bg-zinc-900/40 border-white/5'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    selecionados.has(m.userId) ? 'bg-[#FFD300] border-[#FFD300]' : 'border-white/20'
                  }`}
                >
                  {selecionados.has(m.userId) && <Check size="0.75rem" className="text-black" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm font-semibold truncate">{m.nome || 'Sem nome'}</p>
                  <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest">
                    {m.tier}
                    {m.cidade ? ` · ${m.cidade}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {membros.length === 0 && !buscando && filtro.tier && (
        <div className="text-center py-8">
          <Users size="1.75rem" className="text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Nenhum membro encontrado com esse filtro</p>
        </div>
      )}

      {/* Mensagem + enviar */}
      {selecionados.size > 0 && eventoId && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          <label className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
            Mensagem do convite ({selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''})
          </label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Ex: Você foi convidado para um evento especial..."
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 resize-none"
          />
          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFD300] text-black text-sm font-black uppercase tracking-wider active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {enviando ? <RefreshCw size="0.875rem" className="animate-spin" /> : <Send size="0.875rem" />}
            Enviar convites
          </button>
        </div>
      )}

      {!eventoId && selecionados.size > 0 && (
        <p className="text-amber-400 text-xs text-center">Selecione um evento antes de enviar</p>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <Sparkles size="1rem" className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm font-semibold">
              {resultado.enviados} convite{resultado.enviados !== 1 ? 's' : ''} enviado
              {resultado.enviados !== 1 ? 's' : ''}
            </p>
            {resultado.erros > 0 && (
              <p className="text-red-400 text-xs">
                {resultado.erros} erro{resultado.erros !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={() => setResultado(null)} className="ml-auto">
            <X size="0.875rem" className="text-zinc-400" />
          </button>
        </div>
      )}
    </div>
  );
};
