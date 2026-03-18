import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Users } from 'lucide-react';
import { authService } from '../../../../services/authService';
import AccordionSection from '../../../../components/form/AccordionSection';
import { Membro } from '../../../../types';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const Step4ProdutoresTaxas: React.FC<{
  produtores: Membro[];
  setProdutores(v: Membro[]): void;
  taxaVantaStr: string;
  setTaxaVantaStr(v: string): void;
  taxaProcStr: string;
  setTaxaProcStr(v: string): void;
  taxaPortaStr: string;
  setTaxaPortaStr(v: string): void;
  taxaMinimaStr: string;
  setTaxaMinimaStr(v: string): void;
  cotaNomesStr: string;
  setCotaNomesStr(v: string): void;
  taxaNomeExcStr: string;
  setTaxaNomeExcStr(v: string): void;
  cotaCortesiasStr: string;
  setCotaCortesiasStr(v: string): void;
  taxaCortExcStr: string;
  setTaxaCortExcStr(v: string): void;
}> = ({
  produtores,
  setProdutores,
  taxaVantaStr,
  setTaxaVantaStr,
  taxaProcStr,
  setTaxaProcStr,
  taxaPortaStr,
  setTaxaPortaStr,
  taxaMinimaStr,
  setTaxaMinimaStr,
  cotaNomesStr,
  setCotaNomesStr,
  taxaNomeExcStr,
  setTaxaNomeExcStr,
  cotaCortesiasStr,
  setCotaCortesiasStr,
  taxaCortExcStr,
  setTaxaCortExcStr,
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [resultados, setResultados] = useState<Membro[]>([]);
  const [searching, setSearching] = useState(false);

  // Ref para acessar produtores atuais sem causar re-run do useEffect
  const produtoresRef = useRef(produtores);
  produtoresRef.current = produtores;

  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setSearching(true);
      try {
        const todos = await authService.buscarMembros(query, 8);
        if (cancelled) return;
        const ids = new Set(produtoresRef.current.map(p => p.id));
        setResultados(todos.filter(m => !ids.has(m.id)));
      } catch (err) {
        console.error('[Step4] busca falhou:', err);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const addProdutor = (m: Membro) => {
    setProdutores([...produtores, m]);
    setQuery('');
    setShowResults(false);
  };

  const removeProdutor = (id: string) => setProdutores(produtores.filter(p => p.id !== id));

  return (
    <div className="space-y-6">
      {/* Produtor responsável */}
      <div>
        <label className={labelCls}>Produtor Responsável * (ao menos 1)</label>
        <p className="text-[0.625rem] text-zinc-700 mb-3 font-black uppercase tracking-widest">
          Busque pelo email ou nome do membro na base VANTA.
        </p>

        {/* Busca */}
        <div className="relative mb-3">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
            {searching ? (
              <Loader2 size="0.875rem" className="text-zinc-400 shrink-0 animate-spin" />
            ) : (
              <Search size="0.875rem" className="text-zinc-400 shrink-0" />
            )}
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
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowResults(false);
                  setResultados([]);
                }}
                className="text-zinc-400 active:text-zinc-400"
              >
                <X size="0.8125rem" />
              </button>
            )}
          </div>
          {showResults && query.length >= 2 && !searching && resultados.length === 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl px-4 py-3">
              <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
                Nenhum membro encontrado
              </p>
            </div>
          )}
          {showResults && resultados.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl">
              {resultados.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => addProdutor(m)}
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

        {/* Lista de produtores */}
        {produtores.length === 0 ? (
          <div className="flex items-center gap-3 p-4 border border-dashed border-white/10 rounded-2xl">
            <Users size="1.125rem" className="text-zinc-700 shrink-0" />
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhum produtor adicionado
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {produtores.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 bg-zinc-900/40 border border-white/5 rounded-2xl"
              >
                <img loading="lazy" src={p.foto} alt={p.nome} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none truncate">{p.nome}</p>
                  <p className="text-[#FFD300]/60 text-[0.625rem] font-black uppercase tracking-widest mt-0.5">
                    Produtor
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProdutor(p.id)}
                  className="text-zinc-700 active:text-red-400 transition-colors p-1.5 shrink-0"
                >
                  <X size="0.8125rem" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Taxa Vanta */}
      <div className="pt-3 border-t border-white/5 space-y-1.5">
        <label className={labelCls}>Taxa Vanta (%) — Seu lucro por ingresso *</label>
        <p className="text-[0.625rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed mb-2">
          Percentual que o VANTA recebe sobre cada ingresso vendido nesta comunidade. Esse valor é descontado do repasse
          ao dono da comunidade. Ex: 10% = R$10 a cada R$100 vendidos.
        </p>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxaVantaStr}
            onChange={e => setTaxaVantaStr(e.target.value)}
            placeholder="Ex: 10.0"
            className={inputCls + ' pr-10'}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
        </div>
        <p className="text-[0.625rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
          O custo do gateway de pagamento (ex: cartão, PIX) é cobrado separadamente e sempre pago pelo dono da
          comunidade.
        </p>
      </div>

      {/* Taxas Avançadas — colapsável */}
      <AccordionSection title="Taxas Avançadas" defaultOpen={false} badge="Padrão para eventos">
        <p className="text-[0.625rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed mb-3">
          Valores padrão para novos eventos desta comunidade. O produtor pode propor alterações na criação do evento.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">
              Taxa Processamento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxaProcStr}
              onChange={e => setTaxaProcStr(e.target.value)}
              placeholder="2.5"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">Taxa Porta (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxaPortaStr}
              onChange={e => setTaxaPortaStr(e.target.value)}
              placeholder="= Taxa App"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">
              Taxa Mínima (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={taxaMinimaStr}
              onChange={e => setTaxaMinimaStr(e.target.value)}
              placeholder="2.00"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">
              Cota Nomes Lista
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={cotaNomesStr}
              onChange={e => setCotaNomesStr(e.target.value)}
              placeholder="500"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">
              R$/Nome Excedente
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={taxaNomeExcStr}
              onChange={e => setTaxaNomeExcStr(e.target.value)}
              placeholder="0.50"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">Cota Cortesias</label>
            <input
              type="number"
              min="0"
              step="1"
              value={cotaCortesiasStr}
              onChange={e => setCotaCortesiasStr(e.target.value)}
              placeholder="50"
              className={inputCls}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest">
              % Cortesia Excedente (sobre valor face)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxaCortExcStr}
              onChange={e => setTaxaCortExcStr(e.target.value)}
              placeholder="5.0"
              className={inputCls}
            />
          </div>
        </div>
      </AccordionSection>
    </div>
  );
};
