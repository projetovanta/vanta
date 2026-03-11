import React, { useState, useEffect } from 'react';
import { TrendingUp, X, DollarSign } from 'lucide-react';
import { ListaEvento } from '../../../../types';
import { cortesiasService } from '../../services/cortesiasService';
import { eventosAdminService, VendaLog } from '../../services/eventosAdminService';
import type { CheckinsPorOrigem } from '../../services/eventosAdminService';
import { getContractedFees, getGatewayCostByEvento } from '../../services/eventosAdminFinanceiro';
import { fmtBRL } from '../../../../utils';
import { Periodo, PERIODOS, filtrarLog, CORES_PIZZA, MEDALHAS, FechamentoPessoa } from './types';
import { VantaPieChart } from '../../components/VantaPieChart';

export const TabResumoCaixa: React.FC<{ lista: ListaEvento; toastFn?: (t: 'sucesso' | 'erro', m: string) => void }> = ({
  lista,
  toastFn,
}) => {
  const [periodo, setPeriodo] = useState<Periodo>('TUDO');
  const [modoGrafico, setModoGrafico] = useState<'FINANCEIRO' | 'PUBLICO'>('FINANCEIRO');
  const [rankingFiltro, setRankingFiltro] = useState<'VOLUME' | 'EFICIENCIA'>('VOLUME');
  const [encerrado, setEncerrado] = useState(false);

  const eventoAdminId = cortesiasService.getEventoAdminId(lista.id);
  const eventoAdmin = eventoAdminId ? eventosAdminService.getEvento(eventoAdminId) : undefined;

  const [caixaAtivo, setCaixaAtivo] = useState(eventoAdmin?.caixaAtivo ?? false);
  const toggleCaixa = async () => {
    if (!eventoAdminId) return;
    const next = !caixaAtivo;
    await eventosAdminService.updateEvento(eventoAdminId, { caixaAtivo: next });
    setCaixaAtivo(next);
    toastFn?.('sucesso', next ? 'Caixa ativado' : 'Caixa desativado');
  };
  const cortesiasEnviadas = eventoAdmin?.cortesiasEnviadas ?? 0;

  // Log completo (sem filtro) e check-ins — carregados via async
  const [vendaLogAll, setVendaLogAll] = useState<VendaLog[]>([]);
  const [checkinsIngresso, setCheckinsIngresso] = useState(0);
  const [checkinsPorOrigem, setCheckinsPorOrigem] = useState<CheckinsPorOrigem>({
    antecipado: 0,
    porta: 0,
    cortesia: 0,
  });

  const [gwCost, setGwCost] = useState<{ totalCusto: number; totalVendas: number }>({ totalCusto: 0, totalVendas: 0 });

  useEffect(() => {
    if (!eventoAdminId) return;
    let cancelled = false;
    (async () => {
      const [logs, checkins, porOrigem, gw] = await Promise.all([
        eventosAdminService.getVendasLog(eventoAdminId),
        eventosAdminService.getCheckinsIngresso(eventoAdminId),
        eventosAdminService.getCheckinsPorOrigem(eventoAdminId),
        getGatewayCostByEvento(eventoAdminId),
      ]);
      if (!cancelled) {
        setVendaLogAll(logs);
        setCheckinsIngresso(checkins);
        setCheckinsPorOrigem(porOrigem);
        setGwCost(gw);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventoAdminId]);

  const logFiltrado = filtrarLog(vendaLogAll, periodo);
  const totalVendidos = logFiltrado.length;
  const receitaTotal = logFiltrado.reduce((s, v) => s + v.valor, 0);

  // Contadores realtime — acumulativos, sem filtro de período
  const totalVendidosAll = vendaLogAll.length;

  // Fatias FINANCEIRO — por variação
  const fatiasMapFin = logFiltrado.reduce(
    (acc, v) => {
      acc[v.variacaoLabel] = acc[v.variacaoLabel]
        ? {
            ...acc[v.variacaoLabel],
            receita: acc[v.variacaoLabel].receita + v.valor,
            qtd: acc[v.variacaoLabel].qtd + 1,
          }
        : { label: v.variacaoLabel, receita: v.valor, qtd: 1 };
      return acc;
    },
    {} as Record<string, { label: string; receita: number; qtd: number }>,
  );
  const fatiasFinanceiro = Object.values(fatiasMapFin).map((f, i) => ({
    name: f.label,
    value: f.receita,
    color: CORES_PIZZA[i % CORES_PIZZA.length],
    isReceita: true,
  }));

  // Fatias PUBLICO — 4 origens: Antecipado, Porta, Lista, Cortesia
  const listaCI = lista.convidados.filter(c => c.checkedIn).length;
  const fatiasPublico = [
    { name: 'Antecipado', value: checkinsPorOrigem.antecipado, color: '#FFD300', isReceita: false },
    { name: 'Porta', value: checkinsPorOrigem.porta, color: '#10b981', isReceita: false },
    { name: 'Lista', value: listaCI, color: '#3B82F6', isReceita: false },
    { name: 'Cortesia', value: checkinsPorOrigem.cortesia, color: '#E91E8C', isReceita: false },
  ].filter(f => f.value > 0);

  const fatias = modoGrafico === 'FINANCEIRO' ? fatiasFinanceiro : fatiasPublico;

  const total = lista.convidados.length;
  const entraram = lista.convidados.filter(c => c.checkedIn).length;
  const naoFoi = total - entraram;
  const pctFreq = total > 0 ? Math.round((entraram / total) * 100) : 0;

  // Fechamento — Relatório Final
  const receitaIngressosTotal = vendaLogAll.reduce((s, v) => s + v.valor, 0);
  const listasPagasReceita = lista.regras
    .filter(r => (r.valor ?? 0) > 0)
    .reduce((acc, r) => {
      const ci = lista.convidados.filter(c => c.regraId === r.id && c.checkedIn).length;
      return acc + ci * (r.valor ?? 0);
    }, 0);
  const porPessoa = lista.convidados.reduce(
    (acc, c) => {
      const key = c.inseridoPorNome;
      if (!acc[key]) acc[key] = { nome: key, nomes: 0, ci: 0, receita: 0 };
      acc[key].nomes++;
      if (c.checkedIn) {
        acc[key].ci++;
        const regra = lista.regras.find(r => r.id === c.regraId);
        acc[key].receita += regra?.valor ?? 0;
      }
      return acc;
    },
    {} as Record<string, FechamentoPessoa>,
  );
  const fechamentoPessoas: FechamentoPessoa[] = Object.values(porPessoa);

  // Auditoria de cortesias — dado de gestão, separado de resultados de presença
  const auditoriaCortesias = eventoAdminId
    ? cortesiasService.getLogs(eventoAdminId).reduce(
        (acc, log) => {
          acc[log.remetenteNome] = (acc[log.remetenteNome] ?? 0) + log.quantidade;
          return acc;
        },
        {} as Record<string, number>,
      )
    : {};
  const auditoriaCortesiasEntries = Object.entries(auditoriaCortesias);

  const porRegra = lista.regras.map(r => ({
    ...r,
    count: lista.convidados.filter(c => c.regraId === r.id).length,
    entraram: lista.convidados.filter(c => c.regraId === r.id && c.checkedIn).length,
  }));

  // Ranking de performance dos promoters
  type RankEntry = { nome: string; total: number; entraram: number };
  const rankMap = lista.convidados.reduce(
    (acc, c) => {
      if (!acc[c.inseridoPor]) acc[c.inseridoPor] = { nome: c.inseridoPorNome, total: 0, entraram: 0 };
      acc[c.inseridoPor].total++;
      if (c.checkedIn) acc[c.inseridoPor].entraram++;
      return acc;
    },
    {} as Record<string, RankEntry>,
  );
  const rankingData = (Object.entries(rankMap) as [string, RankEntry][])
    .map(([id, d]) => ({
      id,
      nome: d.nome,
      total: d.total,
      entraram: d.entraram,
      taxa: d.total > 0 ? Math.round((d.entraram / d.total) * 100) : 0,
    }))
    .sort(rankingFiltro === 'VOLUME' ? (a, b) => b.entraram - a.entraram : (a, b) => b.taxa - a.taxa);

  return (
    <div className="space-y-4">
      {/* ── Resumo Financeiro Detalhado ──────────────────────────── */}
      {eventoAdminId &&
        (() => {
          const fees = getContractedFees(eventoAdminId);
          const bruto = receitaIngressosTotal;
          const taxaVanta = Math.round((bruto * fees.feePercent + fees.feeFixed * totalVendidosAll) * 100) / 100;
          const custoGw = gwCost.totalCusto;
          const liquido = fees.gatewayMode === 'ABSORVER' ? Math.round((bruto - custoGw) * 100) / 100 : bruto;
          const receitaAntecipado = vendaLogAll.filter(v => v.origem === 'ANTECIPADO').reduce((s, v) => s + v.valor, 0);
          const receitaPorta = vendaLogAll.filter(v => v.origem === 'PORTA').reduce((s, v) => s + v.valor, 0);
          // Receita de listas pagas (check-in com regra de valor > 0)
          const receitaListaPaga = lista.regras
            .filter(r => (r.valor ?? 0) > 0)
            .reduce((rAcc, r) => {
              const ci = lista.convidados.filter(c => c.regraId === r.id && c.checkedIn).length;
              return rAcc + ci * (r.valor ?? 0);
            }, 0);
          return (
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size="0.875rem" className="text-[#FFD300]" />
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Resumo Financeiro</p>
              </div>
              {(
                [
                  ['Receita Bruta', fmtBRL(bruto), 'text-white'],
                  [
                    'Taxa VANTA (' + Math.round(fees.feePercent * 100) + '%)',
                    `- ${fmtBRL(taxaVanta)}`,
                    'text-amber-400',
                  ],
                  ['Custo Gateway', `- ${fmtBRL(custoGw)}`, 'text-red-400'],
                  ['Receita Líquida', fmtBRL(liquido), 'text-emerald-400'],
                ] as [string, string, string][]
              ).map(([label, val, cls]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[0.625rem] text-zinc-400 font-semibold">{label}</span>
                  <span className={`text-sm font-bold ${cls}`}>{val}</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2 mt-2">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Por Origem</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.5625rem] text-zinc-400">Antecipado</span>
                    <span className="text-[0.5625rem] text-[#FFD300] font-bold">{fmtBRL(receitaAntecipado)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.5625rem] text-zinc-400">Porta</span>
                    <span className="text-[0.5625rem] text-emerald-400 font-bold">{fmtBRL(receitaPorta)}</span>
                  </div>
                  {receitaListaPaga > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[0.5625rem] text-zinc-400">Lista</span>
                      <span className="text-[0.5625rem] text-blue-400 font-bold">{fmtBRL(receitaListaPaga)}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[0.5rem] text-zinc-700 italic">
                Gateway: {fees.gatewayMode === 'ABSORVER' ? 'Organizador absorve' : 'Cliente paga'}
              </p>
            </div>
          );
        })()}

      {/* Contadores por origem */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: 'Antecipado',
            valor: vendaLogAll.filter(v => v.origem === 'ANTECIPADO').length,
            ci: checkinsPorOrigem.antecipado,
            cor: '#FFD300',
            corTw: 'text-[#FFD300]',
          },
          {
            label: 'Porta',
            valor: vendaLogAll.filter(v => v.origem === 'PORTA').length,
            ci: checkinsPorOrigem.porta,
            cor: '#10b981',
            corTw: 'text-emerald-400',
          },
          { label: 'Lista', valor: total, ci: listaCI, cor: '#3B82F6', corTw: 'text-blue-400' },
          {
            label: 'Cortesia',
            valor: cortesiasEnviadas,
            ci: checkinsPorOrigem.cortesia,
            cor: '#E91E8C',
            corTw: 'text-pink-400',
          },
        ].map(o => (
          <div key={o.label} className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-1.5">
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">{o.label}</p>
            <p className="text-white font-black text-lg leading-none">{o.valor}</p>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${o.valor > 0 ? Math.round((o.ci / o.valor) * 100) : 0}%`, backgroundColor: o.cor }}
              />
            </div>
            <p className={`text-[0.5625rem] font-black ${o.corTw}`}>{o.ci} entraram</p>
          </div>
        ))}
      </div>

      {/* Toggle: Venda na Porta */}
      {eventoAdminId && (
        <button
          onClick={toggleCaixa}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${
            caixaAtivo ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-zinc-900/40 border-white/5'
          }`}
        >
          <div className="text-left">
            <p className={`text-sm font-bold leading-none ${caixaAtivo ? 'text-emerald-400' : 'text-white'}`}>
              Venda na Porta
            </p>
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mt-1">
              {caixaAtivo ? 'Operadores Caixa podem vender agora' : 'Permitir venda por operadores Caixa'}
            </p>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${caixaAtivo ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${caixaAtivo ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </div>
        </button>
      )}

      {/* Seletor de período */}
      <div className="flex gap-1.5">
        {PERIODOS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            className={`flex-1 py-2 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest transition-all ${
              periodo === p.id ? 'bg-[#FFD300] text-black' : 'bg-zinc-900/60 text-zinc-400 border border-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Bilheteria + Gráfico */}
      {eventoAdmin && (
        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl">
          <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mb-3">Bilheteria</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-3">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1">Antecipado</p>
              <p className="text-[#FFD300] font-black text-xl leading-none">
                {logFiltrado.filter(v => v.origem === 'ANTECIPADO').length}
              </p>
              <p className="text-zinc-400 text-[0.5625rem] mt-1">
                R${' '}
                {logFiltrado
                  .filter(v => v.origem === 'ANTECIPADO')
                  .reduce((s, v) => s + v.valor, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-3">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1">Porta</p>
              <p className="text-emerald-400 font-black text-xl leading-none">
                {logFiltrado.filter(v => v.origem === 'PORTA').length}
              </p>
              <p className="text-zinc-400 text-[0.5625rem] mt-1">
                R${' '}
                {logFiltrado
                  .filter(v => v.origem === 'PORTA')
                  .reduce((s, v) => s + v.valor, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-3">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1">Lista</p>
              <p className="text-blue-400 font-black text-xl leading-none">{total}</p>
              <p className="text-zinc-400 text-[0.5625rem] mt-1">{listaCI} check-ins</p>
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-3">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-1">Cortesia</p>
              <p className="text-pink-400 font-black text-xl leading-none">{cortesiasEnviadas}</p>
              <p className="text-zinc-400 text-[0.5625rem] mt-1">R$ 0,00</p>
            </div>
          </div>

          {/* Toggle modo gráfico */}
          <div className="flex gap-1.5 mt-4">
            {(['FINANCEIRO', 'PUBLICO'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModoGrafico(m)}
                className={`flex-1 py-2 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest transition-all ${
                  modoGrafico === m ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border border-white/5'
                }`}
              >
                {m === 'FINANCEIRO' ? '💰 Financeiro' : '🏟️ Público'}
              </button>
            ))}
          </div>

          {/* Gráfico de pizza */}
          {fatias.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mb-4">
                {modoGrafico === 'FINANCEIRO' ? 'Distribuição de receita' : 'Distribuição de público'}
              </p>
              <VantaPieChart
                data={fatias}
                height={140}
                formatValue={
                  modoGrafico === 'FINANCEIRO'
                    ? v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : v => String(v)
                }
              />
            </div>
          ) : (
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest mt-4 pt-4 border-t border-white/5">
              {modoGrafico === 'FINANCEIRO' ? 'Nenhuma venda registrada' : 'Nenhum público registrado'}
            </p>
          )}
        </div>
      )}

      {/* Frequência hero */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl">
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mb-3">Frequência</p>
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-emerald-400 font-black text-4xl leading-none">{entraram}</span>
            <span className="text-zinc-400 text-xl font-light">/{total}</span>
          </div>
          <span className="text-white font-black text-2xl leading-none">{pctFreq}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full"
            style={{ width: `${pctFreq}%`, background: 'linear-gradient(to right, #059669, #10b981)' }}
          />
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
              Foram · {entraram}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
              Não foram · {naoFoi}
            </span>
          </div>
        </div>
      </div>

      <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest px-1">Por categoria</p>
      {porRegra.map(r => {
        const cor = r.cor || '#71717a';
        const pctR = r.tetoGlobal > 0 ? Math.round((r.count / r.tetoGlobal) * 100) : 0;
        return (
          <div key={r.id} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                <p className="text-white text-sm font-bold truncate">{r.label}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-xl leading-none" style={{ color: cor }}>
                  {r.count}
                </span>
                <span className="text-zinc-400 text-sm font-light">/{r.tetoGlobal}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full" style={{ width: `${Math.min(pctR, 100)}%`, backgroundColor: cor }} />
            </div>
            <p className="text-zinc-400 text-[0.5625rem] font-black">{r.entraram} entraram</p>
          </div>
        );
      })}

      {/* Ranking de performance */}
      {rankingData.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest">Ranking de Promoters</p>
            <div className="flex gap-1">
              {(['VOLUME', 'EFICIENCIA'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setRankingFiltro(f)}
                  className={`px-2.5 py-1 rounded-lg text-[0.5rem] font-black uppercase tracking-widest transition-all ${
                    rankingFiltro === f ? 'bg-[#FFD300] text-black' : 'bg-zinc-900 text-zinc-400 border border-white/5'
                  }`}
                >
                  {f === 'VOLUME' ? 'Volume' : 'Eficiência'}
                </button>
              ))}
            </div>
          </div>
          {rankingData.map((p, i) => {
            const metricaValor = rankingFiltro === 'VOLUME' ? p.entraram : p.taxa;
            const metricaSufixo = rankingFiltro === 'VOLUME' ? ' entraram' : '%';
            const barPct =
              rankingFiltro === 'VOLUME'
                ? rankingData[0].entraram > 0
                  ? (p.entraram / rankingData[0].entraram) * 100
                  : 0
                : p.taxa;
            const medalha = MEDALHAS[i] ?? '';
            return (
              <div key={p.id} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base leading-none w-6 shrink-0">{medalha || `#${i + 1}`}</span>
                  <p className="text-white font-bold text-sm flex-1 min-w-0 truncate">{p.nome}</p>
                  <div className="text-right shrink-0">
                    <span className="text-[#FFD300] font-black text-lg leading-none">{metricaValor}</span>
                    <span className="text-zinc-400 text-[0.5625rem] font-black ml-0.5">{metricaSufixo}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD300] rounded-full transition-all"
                    style={{ width: `${Math.min(barPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-zinc-700 text-[0.5rem] font-black">{p.total} inseridos</span>
                  <span className="text-zinc-700 text-[0.5rem] font-black">
                    {p.entraram} entraram · {p.taxa}%
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {total === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <TrendingUp size="1.75rem" className="text-zinc-800" />
          <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
            Adicione convidados para ver o resumo
          </p>
        </div>
      )}

      {/* Encerrar Evento / Relatório Final */}
      {!encerrado ? (
        <button
          onClick={() => setEncerrado(true)}
          className="w-full py-4 border border-white/10 bg-zinc-900/40 rounded-2xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all"
        >
          Encerrar Evento
        </button>
      ) : (
        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">Relatório Final</p>
            <button
              onClick={() => setEncerrado(false)}
              className="text-zinc-700 active:text-zinc-400 transition-colors"
            >
              <X size="0.8125rem" />
            </button>
          </div>

          {/* Financeiro global */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-zinc-400 text-[0.625rem]">Ingressos vendidos</p>
              <p className="text-white text-[0.625rem] font-black">
                R$ {receitaIngressosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-zinc-400 text-[0.625rem]">Listas pagas (CI)</p>
              <p className="text-white text-[0.625rem] font-black">
                R$ {listasPagasReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between items-center">
              <p className="text-zinc-300 text-[0.625rem] font-black uppercase tracking-widest">Total</p>
              <p className="text-[#FFD300] text-sm font-black">
                R$ {(receitaIngressosTotal + listasPagasReceita).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Por pessoa */}
          {fechamentoPessoas.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-white/5">
              <p className="text-zinc-700 text-[0.5rem] font-black uppercase tracking-widest">Por pessoa</p>
              {fechamentoPessoas.map(p => (
                <div key={p.nome} className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-xl">
                  <p className="text-white font-bold text-sm leading-none truncate mb-1.5">{p.nome}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {p.nomes > 0 && (
                      <p className="text-zinc-400 text-[0.5625rem] font-black">
                        {p.nomes} nomes
                        {p.ci > 0 && <span className="text-emerald-400"> ({p.ci} CI)</span>}
                      </p>
                    )}
                    {p.receita > 0 && (
                      <p className="text-zinc-400 text-[0.5625rem] font-black">
                        R${' '}
                        <span className="text-[#FFD300]">
                          {p.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Auditoria de Cortesias — dado de gestão, separado dos resultados */}
          {auditoriaCortesiasEntries.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div>
                <p className="text-zinc-700 text-[0.5rem] font-black uppercase tracking-widest">
                  Cortesias Distribuídas
                </p>
                <p className="text-zinc-800 text-[0.5rem] mt-0.5">envio confirmado · presença não rastreada</p>
              </div>
              {auditoriaCortesiasEntries.map(([nome, qtd]) => (
                <div key={nome} className="flex items-center justify-between px-1">
                  <p className="text-zinc-400 text-[0.5625rem] truncate flex-1 min-w-0">{nome}</p>
                  <p className="text-zinc-400 text-[0.5625rem] font-black shrink-0 ml-3">
                    {qtd} enviada{qtd !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
