import React from 'react';
import { ArrowLeft, TrendingUp, Users, Ticket, ListChecks, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { EventoAdmin, ListaEvento } from '../../../../types';
import { getContractedFees } from '../../services/eventosAdminFinanceiro';
import { PublicoDrilldown } from './PublicoDrilldown';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bgClass?: string;
}> = ({ label, value, sub, color = 'text-zinc-300', bgClass = 'bg-zinc-900/40 border-white/5' }) => (
  <div className={`p-3.5 border rounded-xl text-center ${bgClass}`}>
    <p className={`${color} font-black text-xl leading-none`}>{value}</p>
    <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider mt-1.5">{label}</p>
    {sub && <p className="text-zinc-400 text-[8px] mt-0.5">{sub}</p>}
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2.5">
      {icon}
      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

export const ResumoEventoView: React.FC<{
  evento: EventoAdmin;
  lista?: ListaEvento;
  onClose: () => void;
}> = ({ evento, lista, onClose }) => {
  // ── Ingressos ──
  const allVar = evento.lotes.flatMap(l => l.variacoes);
  const totalVendidos = allVar.reduce((a, v) => a + v.vendidos, 0);
  const totalCapacidade = allVar.reduce((a, v) => a + v.limite, 0);
  const mascVendidos = allVar.filter(v => v.genero === 'MASCULINO').reduce((a, v) => a + v.vendidos, 0);
  const femVendidos = allVar.filter(v => v.genero === 'FEMININO').reduce((a, v) => a + v.vendidos, 0);

  // ── Faturamento Ingressos (bruto) ──
  const faturamentoBrutoIngressos = allVar.reduce((a, v) => a + v.vendidos * v.valor, 0);
  const ticketMedioIngresso = totalVendidos > 0 ? faturamentoBrutoIngressos / totalVendidos : 0;

  // ── Lista ──
  const totalLista = lista?.convidados.length ?? 0;
  const totalCheckedIn = lista?.convidados.filter(c => c.checkedIn).length ?? 0;
  const naoFoi = totalLista - totalCheckedIn;
  const freqPct = totalLista > 0 ? Math.round((totalCheckedIn / totalLista) * 100) : 0;

  // ── Faturamento Lista (convidados que pagaram na porta) ──
  const regraMap = new Map<string, { valor?: number; genero: 'M' | 'F' | 'U' }>(
    lista?.regras.map(r => [r.id, { valor: r.valor, genero: r.genero }]) ?? [],
  );
  let faturamentoLista = 0;
  let listaGratis = 0;
  let listaPago = 0;
  lista?.convidados
    .filter(c => c.checkedIn)
    .forEach(c => {
      const regra = regraMap.get(c.regraId);
      const valor = regra?.valor ?? 0;
      if (valor > 0) {
        faturamentoLista += valor;
        listaPago++;
      } else {
        listaGratis++;
      }
    });

  // ── Faturamento Total ──
  const faturamentoBrutoTotal = faturamentoBrutoIngressos + faturamentoLista;

  // ── Cortesias ──
  const cortesiasEnviadas = evento.cortesiasEnviadas ?? 0;

  // ── Taxas VANTA (modelo completo) ──
  const fees = getContractedFees(evento.id);
  const taxaServicoApp = Math.max(faturamentoBrutoIngressos * fees.feePercent, totalVendidos * fees.taxaMinima);
  const taxaProcessamento = faturamentoBrutoIngressos * fees.taxaProcessamento;
  const taxaPorta = faturamentoLista * fees.taxaPorta;
  const taxaFixa = fees.taxaFixaEvento;

  // Lista excedente
  const nomesExcedentes = Math.max(0, totalLista - fees.cotaNomesLista);
  const taxaListaExcedente = nomesExcedentes * fees.taxaNomeExcedente;

  // Cortesia excedente
  const cortesiasExcedentes = Math.max(0, cortesiasEnviadas - fees.cotaCortesias);
  const valorFaceMedio = totalVendidos > 0 ? faturamentoBrutoIngressos / totalVendidos : 0;
  const taxaCortesiaExcedente = cortesiasExcedentes * valorFaceMedio * fees.taxaCortesiaExcedentePct;

  const taxaVantaTotal =
    taxaServicoApp + taxaProcessamento + taxaPorta + taxaFixa + taxaListaExcedente + taxaCortesiaExcedente;
  const liquidoTotal = faturamentoBrutoTotal - taxaVantaTotal;

  // ── Promoters ranking ──
  const promoterMap: Record<string, { nome: string; total: number; checkins: number }> = {};
  lista?.convidados.forEach(c => {
    if (!promoterMap[c.inseridoPor]) promoterMap[c.inseridoPor] = { nome: c.inseridoPorNome, total: 0, checkins: 0 };
    promoterMap[c.inseridoPor].total += 1;
    if (c.checkedIn) promoterMap[c.inseridoPor].checkins += 1;
  });
  const topPromoters = Object.values(promoterMap).sort((a, b) => b.total - a.total);

  // ── Lotes ranking ──
  const lotesOrdenados = [...evento.lotes].sort((a, b) => b.vendidos - a.vendidos);

  // ── Gênero lista ──
  const listaM =
    lista?.convidados.filter(c => {
      const r = regraMap.get(c.regraId);
      return r?.genero === 'M';
    }).length ?? 0;
  const listaF =
    lista?.convidados.filter(c => {
      const r = regraMap.get(c.regraId);
      return r?.genero === 'F';
    }).length ?? 0;
  const listaU = totalLista - listaM - listaF;

  const dataLabel = new Date(evento.dataInicio).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const medalCls = (i: number) =>
    i === 0
      ? 'bg-[#FFD300] text-black'
      : i === 1
        ? 'bg-zinc-600 text-white'
        : i === 2
          ? 'bg-amber-700 text-white'
          : 'bg-zinc-800 text-zinc-400';

  // ── Público total estimado ──
  const publicoTotal = totalVendidos + totalCheckedIn + cortesiasEnviadas;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            onClick={onClose}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 shrink-0 active:scale-90 transition-all"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-0.5">Resumo do Evento</p>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic truncate">
              {evento.nome}
            </h2>
            <p className="text-zinc-400 text-[10px] font-bold mt-0.5">{dataLabel}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
      >
        {/* ══ FATURAMENTO TOTAL ══ */}
        <Section icon={<DollarSign size={10} className="text-zinc-400" />} title="Faturamento">
          <div className="p-4 bg-gradient-to-br from-[#FFD300]/10 to-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl mb-3">
            <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider mb-1">Receita Bruta Total</p>
            <p className="text-[#FFD300] font-black text-2xl leading-none">{fmt(faturamentoBrutoTotal)}</p>
            {publicoTotal > 0 && <p className="text-zinc-400 text-[10px] mt-1.5">~{publicoTotal} pessoas no evento</p>}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-wider">Ingressos</p>
              <p className="text-white font-black text-base mt-1">{fmt(faturamentoBrutoIngressos)}</p>
              <p className="text-zinc-400 text-[9px] mt-0.5">{totalVendidos} vendidos</p>
            </div>
            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-wider">Lista (porta)</p>
              <p className="text-white font-black text-base mt-1">{fmt(faturamentoLista)}</p>
              <p className="text-zinc-400 text-[9px] mt-0.5">
                {listaPago} pagaram · {listaGratis} grátis
              </p>
            </div>
          </div>
          {taxaVantaTotal > 0 && (
            <div className="mt-2.5 p-3.5 bg-zinc-900/40 border border-white/5 rounded-xl space-y-2">
              <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-widest">Taxas VANTA</p>
              {taxaServicoApp > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Serviço app ({(fees.feePercent * 100).toFixed(0)}%)</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaServicoApp)}</span>
                </div>
              )}
              {taxaProcessamento > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Processamento ({(fees.taxaProcessamento * 100).toFixed(1)}%)</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaProcessamento)}</span>
                </div>
              )}
              {taxaPorta > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Porta ({(fees.taxaPorta * 100).toFixed(0)}%)</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaPorta)}</span>
                </div>
              )}
              {taxaFixa > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Fixo evento</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaFixa)}</span>
                </div>
              )}
              {taxaListaExcedente > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Lista excedente ({nomesExcedentes} nomes)</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaListaExcedente)}</span>
                </div>
              )}
              {taxaCortesiaExcedente > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Cortesias excedentes ({cortesiasExcedentes})</span>
                  <span className="text-red-400 font-bold">-{fmt(taxaCortesiaExcedente)}</span>
                </div>
              )}
              <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Total taxas</p>
                <p className="text-red-400 font-black text-sm">-{fmt(taxaVantaTotal)}</p>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Líquido Produtor</p>
                <p className="text-emerald-400 font-black text-lg">{fmt(liquidoTotal)}</p>
              </div>
            </div>
          )}
          {ticketMedioIngresso > 0 && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-zinc-900/20 rounded-lg">
              <TrendingUp size={10} className="text-zinc-400" />
              <p className="text-zinc-400 text-[9px]">
                Ticket médio ingresso: <span className="text-white font-bold">{fmt(ticketMedioIngresso)}</span>
              </p>
            </div>
          )}
        </Section>

        {/* ══ PUBLICO — DRILL-DOWN ══ */}
        <Section icon={<PieIcon size={10} className="text-zinc-400" />} title="Publico — De onde veio?">
          <PublicoDrilldown evento={evento} lista={lista} />
        </Section>

        {/* ══ INGRESSOS ══ */}
        <Section icon={<Ticket size={10} className="text-zinc-400" />} title="Ingressos">
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              label="Total"
              value={totalVendidos}
              color="text-[#FFD300]"
              bgClass="bg-[#FFD300]/5 border-[#FFD300]/10"
            />
            <StatCard
              label="Masc."
              value={mascVendidos}
              color="text-blue-400"
              bgClass="bg-blue-500/5 border-blue-500/10"
            />
            <StatCard
              label="Fem."
              value={femVendidos}
              color="text-pink-400"
              bgClass="bg-pink-500/5 border-pink-500/10"
            />
          </div>
          {totalCapacidade > 0 && (
            <div className="mt-2.5 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-zinc-400 text-[10px]">Ocupação</p>
                <p className="text-[#FFD300] font-black text-sm">
                  {Math.round((totalVendidos / totalCapacidade) * 100)}%
                </p>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD300] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalVendidos / totalCapacidade) * 100)}%` }}
                />
              </div>
              <p className="text-zinc-400 text-[9px] mt-1">
                {totalVendidos} / {totalCapacidade} ingressos
              </p>
            </div>
          )}
          {cortesiasEnviadas > 0 && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-purple-500/5 border border-purple-500/10 rounded-lg">
              <p className="text-purple-400 text-[9px] font-bold">{cortesiasEnviadas} cortesias enviadas</p>
            </div>
          )}
        </Section>

        {/* ══ LISTA DE CONVIDADOS ══ */}
        {totalLista > 0 && (
          <Section icon={<ListChecks size={10} className="text-zinc-400" />} title="Lista de Convidados">
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Na lista" value={totalLista} />
              <StatCard
                label="Entraram"
                value={totalCheckedIn}
                color="text-emerald-400"
                bgClass="bg-emerald-500/5 border-emerald-500/10"
              />
              <StatCard
                label="Não foram"
                value={naoFoi}
                color="text-red-400"
                bgClass="bg-red-500/5 border-red-500/10"
              />
            </div>
            <div className="mt-2.5 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-zinc-400 text-[10px]">Frequência</p>
                <p className="text-emerald-400 font-black text-sm">{freqPct}%</p>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${freqPct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              <StatCard label="Masc." value={listaM} color="text-blue-400" bgClass="bg-blue-500/5 border-blue-500/10" />
              <StatCard label="Fem." value={listaF} color="text-pink-400" bgClass="bg-pink-500/5 border-pink-500/10" />
              <StatCard label="Unisex" value={listaU} color="text-zinc-400" />
            </div>
          </Section>
        )}

        {/* ══ RANKING PROMOTERS ══ */}
        {topPromoters.length > 0 && (
          <Section icon={<Users size={10} className="text-zinc-400" />} title="Ranking de Promoters">
            <div className="space-y-2">
              {topPromoters.map((p, i) => {
                const convPct = p.total > 0 ? Math.round((p.checkins / p.total) * 100) : 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 bg-zinc-900/40 border border-white/5 rounded-xl"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${medalCls(i)}`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{p.nome}</p>
                      <p className="text-zinc-400 text-[9px]">
                        {p.checkins} entraram ({convPct}% conversão)
                      </p>
                    </div>
                    <p className="text-[#FFD300] font-black text-sm shrink-0">{p.total}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ══ RANKING LOTES ══ */}
        <Section icon={<Ticket size={10} className="text-zinc-400" />} title="Ranking de Lotes">
          <div className="space-y-2">
            {lotesOrdenados.map((lote, i) => {
              const faturamentoLote = lote.variacoes.reduce((a, v) => a + v.vendidos * v.valor, 0);
              return (
                <div
                  key={lote.id}
                  className="flex items-center gap-2.5 p-3 bg-zinc-900/40 border border-white/5 rounded-xl"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${medalCls(i)}`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{lote.nome}</p>
                    <p className="text-zinc-400 text-[9px]">{fmt(faturamentoLote)}</p>
                  </div>
                  <p className="text-[#FFD300] font-black text-sm shrink-0">
                    {lote.vendidos} <span className="text-zinc-400 text-[9px] font-normal">vendidos</span>
                  </p>
                </div>
              );
            })}
            {lotesOrdenados.length === 0 && (
              <p className="text-zinc-700 text-[10px] italic text-center py-4">Nenhum dado de vendas.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
