import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  TrendingUp,
  Users,
  Ticket,
  ListChecks,
  DollarSign,
  PieChart as PieIcon,
  Clock,
  BarChart3,
  Activity,
  Gift,
  ChevronDown,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { EventoAdmin, ListaEvento } from '../../../../types';
import { getContractedFees } from '../../services/eventosAdminFinanceiro';
import { getVendasLog } from '../../services/eventosAdminTickets';
import type { VendaLog } from '../../services/eventosAdminTypes';
import { PublicoDrilldown, CortesiaLogItem } from './PublicoDrilldown';
import { supabase } from '../../../../services/supabaseClient';

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

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  icon,
  title,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center gap-1.5 mb-2.5 active:opacity-70 transition-opacity"
      >
        {icon}
        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest flex-1 text-left">{title}</p>
        <ChevronDown size={12} className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
};

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
  const allPromoters = Object.values(promoterMap);

  type PromoterSort = 'total' | 'checkins' | 'conversao';
  const [promoterSortKey, setPromoterSortKey] = useState<PromoterSort>('total');
  const [promoterSortAsc, setPromoterSortAsc] = useState(false);

  const handlePromoterSort = (key: PromoterSort) => {
    if (promoterSortKey === key) {
      setPromoterSortAsc(prev => !prev);
    } else {
      setPromoterSortKey(key);
      setPromoterSortAsc(false);
    }
  };

  const topPromoters = [...allPromoters].sort((a, b) => {
    let diff = 0;
    if (promoterSortKey === 'total') diff = b.total - a.total;
    else if (promoterSortKey === 'checkins') diff = b.checkins - a.checkins;
    else {
      const ca = a.total > 0 ? a.checkins / a.total : 0;
      const cb = b.total > 0 ? b.checkins / b.total : 0;
      diff = cb - ca;
    }
    return promoterSortAsc ? -diff : diff;
  });

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

  // ── Vendas Log (async) ──
  const [vendasLog, setVendasLog] = useState<VendaLog[]>([]);
  const [vendasLoading, setVendasLoading] = useState(true);

  // ── Cortesias detalhadas (async) ──
  const [cortesiasDetalhe, setCortesiasDetalhe] = useState<{ pendentes: number; aceitas: number; recusadas: number }>({
    pendentes: 0,
    aceitas: 0,
    recusadas: 0,
  });
  const [cortesiasTotal, setCortesiasTotal] = useState(cortesiasEnviadas);

  // ── Cortesias detalhadas para drill-down ──
  const [cortesiasLogItems, setCortesiasLogItems] = useState<CortesiaLogItem[]>([]);

  // ── Público total estimado ──
  const publicoTotal = totalVendidos + totalCheckedIn + cortesiasTotal;

  useEffect(() => {
    const ctrl = new AbortController();
    getVendasLog(evento.id).then(logs => {
      if (!ctrl.signal.aborted) {
        setVendasLog(logs);
        setVendasLoading(false);
      }
    });
    supabase
      .from('cortesias_pendentes')
      .select('status')
      .eq('evento_id', evento.id)
      .then(({ data }) => {
        if (!ctrl.signal.aborted && data) {
          const p = data.filter(c => c.status === 'PENDENTE').length;
          const a = data.filter(c => c.status === 'ACEITO').length;
          const r = data.filter(c => c.status === 'RECUSADO').length;
          setCortesiasDetalhe({ pendentes: p, aceitas: a, recusadas: r });
        }
      });
    // Cortesias enviadas com detalhes (cortesias_log)
    supabase
      .from('cortesias_log')
      .select('variacao_label, remetente_nome, destinatario_nome')
      .eq('evento_id', evento.id)
      .then(({ data }) => {
        if (!ctrl.signal.aborted && data && data.length > 0) {
          setCortesiasTotal(data.length);
          setCortesiasLogItems(
            data.map(d => ({
              variacaoLabel: d.variacao_label ?? '',
              remetente: d.remetente_nome ?? '',
              destinatario: d.destinatario_nome ?? '',
            })),
          );
        }
      });
    return () => ctrl.abort();
  }, [evento.id, cortesiasEnviadas]);

  // ── Timeline de vendas (por dia) ──
  const vendasPorDia = useMemo(() => {
    if (vendasLog.length === 0) return [];
    const map: Record<string, { dia: string; vendas: number; receita: number }> = {};
    for (const v of vendasLog) {
      const dia = v.ts.slice(0, 10);
      if (!map[dia]) map[dia] = { dia, vendas: 0, receita: 0 };
      map[dia].vendas += 1;
      map[dia].receita += v.valor;
    }
    return Object.values(map).sort((a, b) => a.dia.localeCompare(b.dia));
  }, [vendasLog]);

  // ── Horário de pico ──
  const picoVendas = useMemo(() => {
    if (vendasLog.length === 0) return null;
    const map: Record<string, number> = {};
    for (const v of vendasLog) {
      const h = v.ts.slice(11, 13) + ':00';
      map[h] = (map[h] ?? 0) + 1;
    }
    let best = { hora: '', qtd: 0 };
    for (const [hora, qtd] of Object.entries(map)) {
      if (qtd > best.qtd) best = { hora, qtd };
    }
    return best.qtd > 0 ? best : null;
  }, [vendasLog]);

  // ── Ticket médio por canal ──
  const ticketMedioPorCanal = useMemo(() => {
    if (vendasLog.length === 0) return null;
    const canais: Record<string, { total: number; receita: number }> = {};
    for (const v of vendasLog) {
      const o = v.origem;
      if (!canais[o]) canais[o] = { total: 0, receita: 0 };
      canais[o].total += 1;
      canais[o].receita += v.valor;
    }
    return Object.entries(canais)
      .filter(([, d]) => d.total > 0)
      .map(([canal, d]) => ({
        canal:
          canal === 'ANTECIPADO'
            ? 'App'
            : canal === 'PORTA'
              ? 'Porta'
              : canal === 'LISTA'
                ? 'Lista'
                : canal === 'CORTESIA'
                  ? 'Cortesia'
                  : canal,
        ticketMedio: d.receita / d.total,
        total: d.total,
        receita: d.receita,
      }))
      .sort((a, b) => b.ticketMedio - a.ticketMedio);
  }, [vendasLog]);

  // ── Ocupação por variação ──
  const ocupacaoPorVariacao = useMemo(() => {
    return allVar
      .filter(v => v.limite > 0)
      .map(v => ({
        label: `${v.areaCustom || v.area} ${v.genero === 'MASCULINO' ? 'Masc' : v.genero === 'FEMININO' ? 'Fem' : 'Uni'}`,
        vendidos: v.vendidos,
        limite: v.limite,
        pct: Math.round((v.vendidos / v.limite) * 100),
        receita: v.vendidos * v.valor,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [allVar]);

  // ── Check-in geral ──
  const checkinIngressos =
    vendasLog.length > 0
      ? vendasLog.filter(v => v.origem === 'ANTECIPADO' || v.origem === 'PORTA').length
      : totalVendidos;
  const totalPresencas = totalCheckedIn + cortesiasDetalhe.aceitas; // lista checkins + cortesias aceitas
  const totalEsperado = totalVendidos + totalLista + cortesiasTotal;
  const checkinGeralPct = totalEsperado > 0 ? Math.round((totalPresencas / totalEsperado) * 100) : 0;

  // ── Ranking lotes com filtro ──
  type LoteSort = 'vendidos' | 'faturamento' | 'ocupacao';
  const [loteSortKey, setLoteSortKey] = useState<LoteSort>('vendidos');
  const [loteSortAsc, setLoteSortAsc] = useState(false);

  const handleLoteSort = (key: LoteSort) => {
    if (loteSortKey === key) setLoteSortAsc(prev => !prev);
    else {
      setLoteSortKey(key);
      setLoteSortAsc(false);
    }
  };

  const lotesOrdenadosFiltrado = useMemo(() => {
    const sorted = [...evento.lotes].sort((a, b) => {
      let diff = 0;
      if (loteSortKey === 'vendidos') diff = b.vendidos - a.vendidos;
      else if (loteSortKey === 'faturamento') {
        const fa = a.variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
        const fb = b.variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
        diff = fb - fa;
      } else {
        const pa = a.limitTotal > 0 ? a.vendidos / a.limitTotal : 0;
        const pb = b.limitTotal > 0 ? b.vendidos / b.limitTotal : 0;
        diff = pb - pa;
      }
      return loteSortAsc ? -diff : diff;
    });
    return sorted;
  }, [evento.lotes, loteSortKey, loteSortAsc]);

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
        {/* ══ RESUMO GERAL — KPIs ══ */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={10} className="text-[#FFD300]" />
            <p className="text-[8px] text-[#FFD300] font-black uppercase tracking-widest">Visão Geral</p>
          </div>

          {/* Receita destaque */}
          <div className="p-4 bg-gradient-to-br from-[#FFD300]/10 to-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl mb-3 text-center">
            <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-wider mb-0.5">Receita Bruta</p>
            <p className="text-[#FFD300] font-black text-2xl leading-none">{fmt(faturamentoBrutoTotal)}</p>
            {taxaVantaTotal > 0 && (
              <p className="text-emerald-400 text-[10px] font-bold mt-1">Líquido: {fmt(liquidoTotal)}</p>
            )}
          </div>

          {/* Público total + breakdown */}
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl text-center mb-2">
            <p className="text-white font-black text-3xl leading-none">{publicoTotal}</p>
            <p className="text-zinc-500 text-[8px] font-bold uppercase mt-1.5 mb-3">Público total</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300] shrink-0" />
                <p className="text-zinc-300 text-[10px]">
                  <span className="text-[#FFD300] font-bold">{totalVendidos + cortesiasTotal}</span>
                  <span className="text-zinc-500"> por ingresso</span>
                  {cortesiasTotal > 0 && (
                    <span className="text-zinc-600">
                      {' '}
                      ({totalVendidos} pagos · {cortesiasTotal} cortesia)
                    </span>
                  )}
                </p>
              </div>
              {totalCheckedIn > 0 && (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <p className="text-zinc-300 text-[10px]">
                    <span className="text-emerald-400 font-bold">{totalCheckedIn}</span>
                    <span className="text-zinc-500"> por lista</span>
                    <span className="text-zinc-600">
                      {' '}
                      ({totalCheckedIn}/{totalLista} — {freqPct}%)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linha extra: ticket médio + check-in */}
          <div className="grid grid-cols-2 gap-2">
            {ticketMedioIngresso > 0 && (
              <div className="p-2 bg-zinc-900/40 border border-white/5 rounded-lg flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-[#FFD300] shrink-0" />
                <div>
                  <p className="text-[#FFD300] text-[10px] font-bold">{fmt(ticketMedioIngresso)}</p>
                  <p className="text-zinc-600 text-[7px]">Ticket médio</p>
                </div>
              </div>
            )}
            <div className="p-2 bg-zinc-900/40 border border-white/5 rounded-lg flex items-center gap-2">
              <div
                className={`w-1 h-6 rounded-full shrink-0 ${checkinGeralPct >= 70 ? 'bg-emerald-400' : checkinGeralPct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
              />
              <div>
                <p
                  className={`text-[10px] font-bold ${checkinGeralPct >= 70 ? 'text-emerald-400' : checkinGeralPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}
                >
                  {checkinGeralPct}%
                </p>
                <p className="text-zinc-600 text-[7px]">Check-in geral</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ SEÇÕES DETALHADAS (colapsáveis) ══ */}

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

        {/* ══ TIMELINE DE VENDAS ══ */}
        {!vendasLoading && vendasPorDia.length > 1 && (
          <Section icon={<BarChart3 size={10} className="text-zinc-400" />} title="Timeline de Vendas">
            <div className="space-y-1">
              {(() => {
                const maxV = Math.max(...vendasPorDia.map(d => d.vendas));
                return vendasPorDia.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[8px] font-mono w-12 shrink-0 text-right">
                      {new Date(d.dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="flex-1 h-4 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFD300] rounded-full transition-all"
                        style={{ width: `${(d.vendas / maxV) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-[9px] font-bold w-7 text-right shrink-0">{d.vendas}</span>
                    <span className="text-zinc-500 text-[8px] w-16 text-right shrink-0">{fmt(d.receita)}</span>
                  </div>
                ));
              })()}
            </div>
          </Section>
        )}

        {/* ══ HORÁRIO DE PICO ══ */}
        {picoVendas && (
          <Section icon={<Clock size={10} className="text-zinc-400" />} title="Horário de Pico">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FFD300]/10 to-transparent border border-[#FFD300]/20 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#FFD300]/10 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-[#FFD300]" />
              </div>
              <div>
                <p className="text-white font-black text-lg">{picoVendas.hora}</p>
                <p className="text-zinc-400 text-[9px]">{picoVendas.qtd} vendas nesse horário</p>
              </div>
            </div>
          </Section>
        )}

        {/* ══ TICKET MÉDIO POR CANAL ══ */}
        {ticketMedioPorCanal && ticketMedioPorCanal.length > 1 && (
          <Section icon={<DollarSign size={10} className="text-zinc-400" />} title="Ticket Médio por Canal">
            <div className="grid grid-cols-2 gap-2">
              {ticketMedioPorCanal.map((c, i) => (
                <div key={i} className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
                  <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-wider">{c.canal}</p>
                  <p className="text-[#FFD300] font-black text-base mt-1">{fmt(c.ticketMedio)}</p>
                  <p className="text-zinc-500 text-[8px]">
                    {c.total} vendas · {fmt(c.receita)}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ══ PUBLICO — DRILL-DOWN ══ */}
        <Section icon={<PieIcon size={10} className="text-zinc-400" />} title="Publico — De onde veio?">
          <PublicoDrilldown
            evento={{ ...evento, cortesiasEnviadas: cortesiasTotal }}
            lista={lista}
            cortesiasLog={cortesiasLogItems}
          />
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
          {cortesiasTotal > 0 && (
            <div className="mt-2.5 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <Gift size={10} className="text-purple-400" />
                <p className="text-purple-400 text-[9px] font-bold">{cortesiasTotal} cortesias enviadas</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-emerald-400 font-black text-sm">{cortesiasDetalhe.aceitas}</p>
                  <p className="text-zinc-500 text-[8px]">Aceitas</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-black text-sm">{cortesiasDetalhe.pendentes}</p>
                  <p className="text-zinc-500 text-[8px]">Pendentes</p>
                </div>
                <div className="text-center">
                  <p className="text-red-400 font-black text-sm">{cortesiasDetalhe.recusadas}</p>
                  <p className="text-zinc-500 text-[8px]">Recusadas</p>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ══ OCUPAÇÃO POR VARIAÇÃO ══ */}
        {ocupacaoPorVariacao.length > 0 && (
          <Section icon={<Activity size={10} className="text-zinc-400" />} title="Ocupação por Variação">
            <div className="space-y-2">
              {ocupacaoPorVariacao.map((v, i) => (
                <div key={i} className="p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-white text-[10px] font-bold truncate flex-1 min-w-0">{v.label}</p>
                    <p
                      className={`font-black text-sm shrink-0 ml-2 ${v.pct >= 80 ? 'text-red-400' : v.pct >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}
                    >
                      {v.pct}%
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${v.pct >= 80 ? 'bg-red-400' : v.pct >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, v.pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-zinc-500 text-[8px]">
                      {v.vendidos}/{v.limite}
                    </p>
                    <p className="text-zinc-500 text-[8px]">{fmt(v.receita)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ══ CHECK-IN GERAL ══ */}
        <Section icon={<Activity size={10} className="text-zinc-400" />} title="Check-in Geral">
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Presença confirmada</p>
              <p
                className={`font-black text-lg ${checkinGeralPct >= 70 ? 'text-emerald-400' : checkinGeralPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}
              >
                {checkinGeralPct}%
              </p>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${checkinGeralPct >= 70 ? 'bg-emerald-400' : checkinGeralPct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(100, checkinGeralPct)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-white font-black text-sm">{totalVendidos}</p>
                <p className="text-zinc-500 text-[8px]">Ingressos</p>
              </div>
              <div>
                <p className="text-white font-black text-sm">{totalCheckedIn}</p>
                <p className="text-zinc-500 text-[8px]">Lista (in)</p>
              </div>
              <div>
                <p className="text-white font-black text-sm">{cortesiasDetalhe.aceitas}</p>
                <p className="text-zinc-500 text-[8px]">Cortesias (in)</p>
              </div>
            </div>
            {totalEsperado > 0 && (
              <p className="text-zinc-600 text-[8px] text-center mt-2">
                {totalPresencas} de {totalEsperado} esperados compareceram
              </p>
            )}
          </div>
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
            {/* Filtros */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
              {[
                { key: 'total' as PromoterSort, label: 'Nomes' },
                { key: 'checkins' as PromoterSort, label: 'Entraram' },
                { key: 'conversao' as PromoterSort, label: 'Conversão' },
              ].map(opt => {
                const active = promoterSortKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handlePromoterSort(opt.key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                      active
                        ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/30'
                        : 'bg-zinc-800/60 text-zinc-500 border border-white/5'
                    }`}
                  >
                    {opt.label}
                    {active && <ArrowUpDown size={8} className={promoterSortAsc ? 'rotate-180' : ''} />}
                  </button>
                );
              })}
            </div>
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
                      <p className="text-zinc-400 text-[9px]">{convPct}% de conversão</p>
                    </div>
                    <p className="font-black text-sm shrink-0">
                      <span className="text-emerald-400">{p.checkins}</span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400">{p.total}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ══ RANKING LOTES ══ */}
        <Section icon={<Ticket size={10} className="text-zinc-400" />} title="Ranking de Lotes">
          {/* Filtros */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
            {[
              { key: 'vendidos' as LoteSort, label: 'Vendidos' },
              { key: 'faturamento' as LoteSort, label: 'Faturamento' },
              { key: 'ocupacao' as LoteSort, label: 'Ocupação' },
            ].map(opt => {
              const active = loteSortKey === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleLoteSort(opt.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                    active
                      ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/30'
                      : 'bg-zinc-800/60 text-zinc-500 border border-white/5'
                  }`}
                >
                  {opt.label}
                  {active && <ArrowUpDown size={8} className={loteSortAsc ? 'rotate-180' : ''} />}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            {lotesOrdenadosFiltrado.map((lote, i) => {
              const faturamentoLote = lote.variacoes.reduce((a, v) => a + v.vendidos * v.valor, 0);
              const ocupacaoLote = lote.limitTotal > 0 ? Math.round((lote.vendidos / lote.limitTotal) * 100) : 0;
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
                    <p className="text-zinc-400 text-[9px]">
                      {fmt(faturamentoLote)} · {ocupacaoLote}% ocupado
                    </p>
                  </div>
                  <p className="text-[#FFD300] font-black text-sm shrink-0">
                    {lote.vendidos} <span className="text-zinc-400 text-[9px] font-normal">vendidos</span>
                  </p>
                </div>
              );
            })}
            {lotesOrdenadosFiltrado.length === 0 && (
              <p className="text-zinc-700 text-[10px] italic text-center py-4">Nenhum dado de vendas.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
