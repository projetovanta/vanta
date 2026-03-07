import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { EventoAdmin, ListaEvento } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import { getResumoFinanceiroComunidade } from '../../services/eventosAdminFinanceiro';
import type { ResumoFinanceiro } from '../../services/eventosAdminFinanceiro';
import { ResumoFinanceiroCard } from '../../components/ResumoFinanceiroCard';
import { CaixaDrilldownModal } from './CaixaDrilldownModal';
import { CaixaTipo } from './types';

export const CaixaTab: React.FC<{ comunidadeId: string }> = ({ comunidadeId }) => {
  const [drilldown, setDrilldown] = useState<CaixaTipo | null>(null);

  // Resumo financeiro da comunidade (async)
  const [resumoFin, setResumoFin] = useState<ResumoFinanceiro | null>(null);
  const [resumoLoading, setResumoLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setResumoLoading(true);
    getResumoFinanceiroComunidade(comunidadeId)
      .then(r => {
        if (!cancelled) {
          setResumoFin(r);
          setResumoLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setResumoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  const eventos = eventosAdminService.getEventosByComunidade(comunidadeId);
  const listas = listasService.getListas();

  const totalIngressos = eventos.reduce((acc, e) => acc + e.lotes.reduce((a, l) => a + l.vendidos, 0), 0);

  const allLotes = eventos.flatMap(e => e.lotes.map(l => ({ ...l, eventoNome: e.nome })));
  const melhorLote = [...allLotes].sort((a, b) => b.vendidos - a.vendidos)[0] ?? null;

  const listaMatches = eventos
    .map(e => ({ evento: e, lista: listas.find(l => l.eventoNome === e.nome) }))
    .filter((x): x is { evento: EventoAdmin; lista: ListaEvento } => x.lista !== undefined);

  const totalNaLista = listaMatches.reduce((acc, x) => acc + x.lista.convidados.length, 0);
  const totalCheckedIn = listaMatches.reduce((acc, x) => acc + x.lista.convidados.filter(c => c.checkedIn).length, 0);
  const freqPct = totalNaLista > 0 ? Math.round((totalCheckedIn / totalNaLista) * 100) : 0;

  // Top promoters aggregado
  const promoterMap: Record<string, { nome: string; total: number }> = {};
  listaMatches.forEach(({ lista }) => {
    lista.convidados.forEach(c => {
      if (!promoterMap[c.inseridoPor]) promoterMap[c.inseridoPor] = { nome: c.inseridoPorNome, total: 0 };
      promoterMap[c.inseridoPor].total += 1;
    });
  });
  const topPromoters = Object.values(promoterMap).sort((a, b) => b.total - a.total);

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <BarChart2 size={28} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
          Nenhum evento realizado
        </p>
        <p className="text-zinc-800 text-[9px] italic text-center">
          Os dados consolidados aparecerão aqui após o primeiro evento.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Resumo financeiro consolidado */}
      {(resumoFin || resumoLoading) && (
        <div className="mb-5">
          <ResumoFinanceiroCard resumo={resumoFin!} loading={resumoLoading} titulo="Financeiro da Comunidade" />
        </div>
      )}

      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-4">
        {eventos.length} evento{eventos.length !== 1 ? 's' : ''} · dados consolidados
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Ingressos */}
        <button
          onClick={() => setDrilldown('INGRESSOS')}
          className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl text-left active:bg-zinc-900/70 active:border-white/10 transition-all"
        >
          <p className="text-[#FFD300] font-black text-2xl leading-none">{totalIngressos}</p>
          <p className="text-white font-bold text-xs mt-1">Ingressos</p>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-0.5">Vendidos total</p>
          <p className="text-zinc-700 text-[8px] mt-2">Toque para detalhar →</p>
        </button>

        {/* Lista */}
        <button
          onClick={() => setDrilldown('LISTA')}
          className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl text-left active:bg-zinc-900/70 active:border-white/10 transition-all"
        >
          <p className="text-[#FFD300] font-black text-2xl leading-none">{totalNaLista}</p>
          <p className="text-white font-bold text-xs mt-1">Lista</p>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-0.5">Nomes adicionados</p>
          <p className="text-zinc-700 text-[8px] mt-2">Toque para detalhar →</p>
        </button>

        {/* Frequência */}
        <button
          onClick={() => setDrilldown('FREQUENCIA')}
          className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left active:bg-emerald-500/10 transition-all"
        >
          <p className="text-emerald-400 font-black text-2xl leading-none">{totalCheckedIn}</p>
          <p className="text-white font-bold text-xs mt-1">Entraram</p>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-0.5">
            {freqPct}% de frequência
          </p>
          <p className="text-zinc-700 text-[8px] mt-2">Toque para detalhar →</p>
        </button>

        {/* Melhor lote */}
        <button
          onClick={() => setDrilldown('LOTES')}
          className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl text-left active:bg-zinc-900/70 active:border-white/10 transition-all"
        >
          <p className="text-[#FFD300] font-black text-2xl leading-none">{melhorLote?.vendidos ?? 0}</p>
          <p className="text-white font-bold text-xs mt-1">Melhor Lote</p>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-0.5 truncate">
            {melhorLote?.nome || '—'}
          </p>
          <p className="text-zinc-700 text-[8px] mt-2">Toque para detalhar →</p>
        </button>
      </div>

      {drilldown && (
        <CaixaDrilldownModal
          tipo={drilldown}
          eventos={eventos}
          listaMatches={listaMatches}
          allLotes={allLotes}
          topPromoters={topPromoters}
          onClose={() => setDrilldown(null)}
        />
      )}
    </div>
  );
};
