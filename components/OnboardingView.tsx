import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Music, Sparkles, ChevronRight } from 'lucide-react';
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

// ── Interesses ──────────────────────────────────────────────────────────────

const INTERESSES = [
  'Funk',
  'Sertanejo',
  'Eletrônica',
  'Pop',
  'Rock',
  'Pagode',
  'Forró',
  'Hip Hop / Rap',
  'Reggaeton',
  'MPB',
  'Jazz',
  'R&B',
  'Trap',
  'Techno',
  'House',
  'Indie',
  'Axé',
  'Brega Funk',
  'Outro',
];

// ── Componente ──────────────────────────────────────────────────────────────

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 — Cidade ──
  const [query, setQuery] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [resultados, setResultados] = useState<Cidade[]>([]);
  const [selecionada, setSelecionada] = useState<Cidade | null>(null);
  const [loadingCidades, setLoadingCidades] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Step 2 — Interesses ──
  const [selectedInteresses, setSelectedInteresses] = useState<string[]>([]);

  // ── Shared ──
  const userId = useAuthStore(s => s.currentAccount?.id);
  const userName = useAuthStore(s => s.currentAccount?.nome);
  const setSelectedCity = useAuthStore(s => s.setSelectedCity);
  const [saving, setSaving] = useState(false);

  // Carrega cidades na montagem
  useEffect(() => {
    carregarCidades().then(c => {
      setCidades(c);
      setLoadingCidades(false);
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

  const handleSelectCidade = (c: Cidade) => {
    setSelecionada(c);
    setQuery(`${c.nome} - ${c.uf}`);
    setResultados([]);
  };

  const toggleInteresse = (interesse: string) => {
    setSelectedInteresses(prev =>
      prev.includes(interesse) ? prev.filter(i => i !== interesse) : [...prev, interesse],
    );
  };

  // Salva cidade + interesses e avança
  const handleFinishStep1 = useCallback(async () => {
    if (!selecionada) return;
    setSaving(true);
    if (userId) {
      await supabase.from('profiles').update({ estado: selecionada.uf, cidade: selecionada.nome }).eq('id', userId);
      setSelectedCity(selecionada.nome);
    }
    setSaving(false);
    setStep(2);
  }, [userId, selecionada, setSelectedCity]);

  const handleFinishStep2 = useCallback(async () => {
    setSaving(true);
    if (userId && selectedInteresses.length > 0) {
      await supabase.from('profiles').update({ interesses: selectedInteresses }).eq('id', userId);
    }
    setSaving(false);
    setStep(3);
  }, [userId, selectedInteresses]);

  const handleSkipStep2 = useCallback(() => {
    setStep(3);
  }, []);

  // ── Step indicators ──
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s === step ? 'w-6 bg-[#FFD300]' : s < step ? 'w-2 bg-[#FFD300]/40' : 'w-2 bg-zinc-700'
          }`}
        />
      ))}
    </div>
  );

  // ── STEP 1: Cidade ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+40px)] pb-6 text-center">
          <StepDots />
          <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-6">
            <MapPin size="1.75rem" className="text-[#FFD300]" />
          </div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2">
            Onde você curte a noite?
          </h2>
          <p className="text-zinc-400 text-sm">Pra mostrar o que tá rolando perto de você</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-8">
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
              placeholder={loadingCidades ? 'Carregando cidades...' : 'Digite sua cidade...'}
              disabled={loadingCidades}
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-[#FFD300]/30 transition-colors"
            />
            {loadingCidades && (
              <Loader2 size="1rem" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" />
            )}
          </div>

          {resultados.length > 0 && !selecionada && (
            <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
              {resultados.map((c, i) => (
                <button
                  key={`${c.nome}-${c.uf}`}
                  onClick={() => handleSelectCidade(c)}
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

          {query.length >= 2 && resultados.length === 0 && !selecionada && !loadingCidades && (
            <p className="text-zinc-500 text-xs text-center mt-4">Nenhuma cidade encontrada.</p>
          )}

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
            onClick={handleFinishStep1}
            disabled={!selecionada || saving}
            className={`w-full py-4 font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
              selecionada && !saving ? 'bg-[#FFD300] text-black' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <Loader2 size="1rem" className="animate-spin" />
            ) : (
              <>
                Continuar <ChevronRight size="0.875rem" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2: Interesses ──────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+40px)] pb-6 text-center">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="w-16" />
            <StepDots />
            <button
              onClick={handleSkipStep2}
              className="text-zinc-400 text-xs font-bold uppercase tracking-wider active:text-white transition-colors w-16 text-right"
            >
              Pular
            </button>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-6">
            <Music size="1.75rem" className="text-[#FFD300]" />
          </div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2">
            O que te move?
          </h2>
          <p className="text-zinc-400 text-sm">Quanto mais a gente sabe, melhor fica</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-8">
          <div className="flex flex-wrap gap-2">
            {INTERESSES.map(interesse => {
              const isSelected = selectedInteresses.includes(interesse);
              return (
                <button
                  key={interesse}
                  onClick={() => toggleInteresse(interesse)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#FFD300] text-black'
                      : 'bg-zinc-900 border border-white/10 text-zinc-300 active:border-[#FFD300]/30'
                  }`}
                >
                  {interesse}
                </button>
              );
            })}
          </div>
          {selectedInteresses.length > 0 && (
            <p className="text-zinc-500 text-xs text-center mt-4">
              {selectedInteresses.length} selecionado{selectedInteresses.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="shrink-0 px-8 pb-[env(safe-area-inset-bottom,32px)] pt-4">
          <button
            onClick={handleFinishStep2}
            disabled={saving}
            className={`w-full py-4 font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
              saving ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-[#FFD300] text-black'
            }`}
          >
            {saving ? (
              <Loader2 size="1rem" className="animate-spin" />
            ) : (
              <>
                Continuar <ChevronRight size="0.875rem" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 3: Boas-vindas ──────────────────────────────────────────────────────
  const firstName = userName?.split(' ')[0] ?? '';

  return (
    <div className="absolute inset-0 z-[400] bg-[#050505] flex flex-col items-center justify-center overflow-hidden px-8">
      {/* Glow dourado de fundo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-[#FFD300]/5 blur-3xl animate-pulse" />
      </div>

      <div className="relative text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-8">
          <Sparkles size="2rem" className="text-[#FFD300]" />
        </div>

        <h2 style={TYPOGRAPHY.screenTitle} className="text-3xl text-white mb-3">
          {firstName ? `Pronto, ${firstName}.` : 'Pronto.'}
        </h2>
        <p className="text-zinc-400 text-base leading-relaxed mb-12">Sua noite começa aqui.</p>

        <button
          onClick={onComplete}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
        >
          Explorar
        </button>
      </div>
    </div>
  );
};
