import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { ESTADOS_CIDADES } from '../data/brData';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabaseClient';

// ── Tipo cidade ─────────────────────────────────────────────────────────────

interface Cidade {
  nome: string;
  uf: string;
}

// ── Carrega cidades do IBGE (1x, cacheado) ──────────────────────────────────

let cidadesCache: Cidade[] | null = null;

async function carregarCidades(): Promise<Cidade[]> {
  if (cidadesCache) return cidadesCache;

  try {
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');
    if (!res.ok) throw new Error('IBGE API error');
    const data = await res.json();
    cidadesCache = (data as { nome: string; microrregiao: { mesorregiao: { UF: { sigla: string } } } }[]).map(m => ({
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
    }));
    return cidadesCache;
  } catch {
    // Fallback: brData
    const fallback: Cidade[] = [];
    for (const [uf, cidades] of Object.entries(ESTADOS_CIDADES)) {
      for (const c of cidades) {
        fallback.push({ nome: c, uf });
      }
    }
    cidadesCache = fallback.sort((a, b) => a.nome.localeCompare(b.nome));
    return cidadesCache;
  }
}

// ── Componente ──────────────────────────────────────────────────────────────

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [query, setQuery] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [resultados, setResultados] = useState<Cidade[]>([]);
  const [selecionada, setSelecionada] = useState<Cidade | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = useAuthStore(s => s.currentAccount?.id);
  const setSelectedCity = useAuthStore(s => s.setSelectedCity);

  // Carrega cidades na montagem
  useEffect(() => {
    carregarCidades().then(c => {
      setCidades(c);
      setLoading(false);
    });
  }, []);

  // Filtra quando digita 2+ caracteres
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = cidades.filter(
      c => c.nome.toLowerCase().startsWith(lower) || `${c.nome} - ${c.uf}`.toLowerCase().includes(lower),
    );
    setResultados(filtered.slice(0, 15));
  }, [query, cidades]);

  const handleSelect = (c: Cidade) => {
    setSelecionada(c);
    setQuery(`${c.nome} - ${c.uf}`);
    setResultados([]);
  };

  const handleFinish = useCallback(async () => {
    if (!selecionada) return;
    if (userId) {
      await supabase.from('profiles').update({ estado: selecionada.uf, cidade: selecionada.nome }).eq('id', userId);
      setSelectedCity(selecionada.nome);
    }
    onComplete();
  }, [userId, selecionada, setSelectedCity, onComplete]);

  return (
    <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+40px)] pb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-6">
          <MapPin size="1.75rem" className="text-[#FFD300]" />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2 italic">
          De que cidade você é?
        </h2>
        <p className="text-zinc-400 text-sm">Vamos mostrar eventos perto de você</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8">
        {/* Campo de busca */}
        <div className="relative">
          <Search size="1rem" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (selecionada) setSelecionada(null);
            }}
            placeholder={loading ? 'Carregando cidades...' : 'Digite sua cidade...'}
            disabled={loading}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-[#FFD300]/30 transition-colors"
          />
          {loading && (
            <Loader2 size="1rem" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" />
          )}
        </div>

        {/* Resultados */}
        {resultados.length > 0 && !selecionada && (
          <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            {resultados.map((c, i) => (
              <button
                key={`${c.nome}-${c.uf}`}
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${
                  i < resultados.length - 1 ? 'border-b border-white/5' : ''
                } active:bg-white/5 transition-colors`}
              >
                <span className="text-white">{c.nome}</span>
                <span className="text-zinc-500 text-xs shrink-0 ml-2">{c.uf}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sem resultados */}
        {query.length >= 2 && resultados.length === 0 && !selecionada && !loading && (
          <p className="text-zinc-500 text-xs text-center mt-4">Nenhuma cidade encontrada.</p>
        )}

        {/* Cidade selecionada */}
        {selecionada && (
          <div className="mt-4 bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <MapPin size="1rem" className="text-[#FFD300] shrink-0" />
            <div>
              <p className="text-white text-sm font-bold">{selecionada.nome}</p>
              <p className="text-zinc-400 text-xs">{selecionada.uf}</p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] pt-4">
        <button
          onClick={handleFinish}
          disabled={!selecionada}
          className={`w-full py-4 font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all ${
            selecionada ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          Começar
        </button>
      </div>
    </div>
  );
};
