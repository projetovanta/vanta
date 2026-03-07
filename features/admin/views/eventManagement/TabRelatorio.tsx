import React, { useState, useEffect } from 'react';
import { FileText, Star, Printer } from 'lucide-react';
import { gerarRelatorio, RelatorioEvento } from '../../services/relatorioService';
import { VantaPieChart } from '../../components/VantaPieChart';
import { CORES_PIZZA } from './types';
import { fmtBRL } from '../../../../utils';

export const TabRelatorio: React.FC<{ eventoAdminId: string }> = ({ eventoAdminId }) => {
  const [rel, setRel] = useState<RelatorioEvento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    gerarRelatorio(eventoAdminId).then(r => {
      if (!cancelled) {
        setRel(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoAdminId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Gerando relatório...</p>
      </div>
    );
  }

  if (!rel) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <FileText size={28} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Evento não encontrado</p>
      </div>
    );
  }

  const fatiasVariacao = rel.vendasPorVariacao.map((v, i) => ({
    name: v.label || 'Sem label',
    value: v.receita,
    color: CORES_PIZZA[i % CORES_PIZZA.length],
  }));

  const origens = [
    {
      label: 'Antecipado',
      vendas: rel.vendasPorOrigem.antecipado,
      ci: rel.checkinsPorOrigem.antecipado,
      cor: '#FFD300',
      corTw: 'text-[#FFD300]',
    },
    {
      label: 'Porta',
      vendas: rel.vendasPorOrigem.porta,
      ci: rel.checkinsPorOrigem.porta,
      cor: '#10b981',
      corTw: 'text-emerald-400',
    },
    {
      label: 'Cortesia',
      vendas: rel.vendasPorOrigem.cortesia,
      ci: rel.checkinsPorOrigem.cortesia,
      cor: '#E91E8C',
      corTw: 'text-pink-400',
    },
  ];

  return (
    <div className="space-y-4 print:bg-white print:text-black" id="vanta-relatorio">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-[#FFD300] print:text-black" />
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest print:text-gray-600">
          Relatório Pós-Evento
        </p>
      </div>

      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <h2 className="text-white font-bold text-lg truncate print:text-black">{rel.eventoNome}</h2>
        <p className="text-zinc-500 text-[10px] mt-1 print:text-gray-500">
          {new Date(rel.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' · '}
          {rel.local}
        </p>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Receita Bruta', valor: fmtBRL(rel.receitaBruta), cor: 'text-[#FFD300]' },
          { label: 'Receita Líquida', valor: fmtBRL(rel.receitaLiquida), cor: 'text-emerald-400' },
          { label: 'Ingressos Vendidos', valor: String(rel.totalVendidos), cor: 'text-white print:text-black' },
          { label: 'Taxa Conversão', valor: `${rel.taxaConversao}%`, cor: 'text-blue-400' },
        ].map(k => (
          <div
            key={k.label}
            className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200"
          >
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              {k.label}
            </p>
            <p className={`font-black text-xl leading-none mt-2 ${k.cor}`}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Ticket Médio */}
      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
          Ticket Médio
        </p>
        <p className="text-[#FFD300] font-black text-lg print:text-black">{fmtBRL(rel.ticketMedio)}</p>
      </div>

      {/* Vendas por Origem */}
      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest px-1 print:text-gray-600">
        Vendas por Origem
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {origens.map(o => (
          <div
            key={o.label}
            className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-1.5 print:bg-gray-50 print:border-gray-200"
          >
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider print:text-gray-500">{o.label}</p>
            <p className="text-white font-black text-lg leading-none print:text-black">{o.vendas}</p>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden print:bg-gray-300">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${o.vendas > 0 ? Math.round((o.ci / o.vendas) * 100) : 0}%`, backgroundColor: o.cor }}
              />
            </div>
            <p className={`text-[9px] font-black ${o.corTw}`}>{o.ci} check-ins</p>
          </div>
        ))}
      </div>

      {/* Gráfico de Pizza — Receita por Variação */}
      {fatiasVariacao.length > 0 && (
        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-4 print:text-gray-500">
            Distribuição de Receita
          </p>
          <VantaPieChart
            data={fatiasVariacao}
            height={140}
            formatValue={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
        </div>
      )}

      {/* Check-ins */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 print:text-gray-500">
          Check-ins
        </p>
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-emerald-400 font-black text-4xl leading-none print:text-green-600">
              {rel.totalCheckins}
            </span>
            <span className="text-zinc-600 text-xl font-light print:text-gray-400">/{rel.totalVendidos}</span>
          </div>
          <span className="text-white font-black text-2xl leading-none print:text-black">{rel.taxaConversao}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-3 print:bg-gray-300">
          <div
            className="h-full rounded-full"
            style={{ width: `${rel.taxaConversao}%`, background: 'linear-gradient(to right, #059669, #10b981)' }}
          />
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
              Entraram · {rel.totalCheckins}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700 print:bg-gray-400" />
            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
              Não foram · {rel.totalVendidos - rel.totalCheckins}
            </span>
          </div>
        </div>
      </div>

      {/* Cortesias */}
      {rel.cortesiasEnviadas > 0 && (
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between print:bg-gray-50 print:border-gray-200">
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
            Cortesias Enviadas
          </p>
          <p className="text-pink-400 font-black text-lg print:text-pink-600">{rel.cortesiasEnviadas}</p>
        </div>
      )}

      {/* Reembolsos */}
      {rel.totalReembolsos > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              Reembolsos Solicitados
            </p>
            <p className="font-black text-xl leading-none mt-2 text-orange-400 print:text-orange-600">
              {rel.totalReembolsos}
            </p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              Aprovados
            </p>
            <p className="font-black text-xl leading-none mt-2 text-emerald-400 print:text-green-600">
              {rel.reembolsosAprovados}
            </p>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 print:text-gray-500">
          Avaliações
        </p>
        {rel.reviewCount > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(rel.reviewMedia) ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'}
                />
              ))}
            </div>
            <span className="text-white font-black text-lg print:text-black">{rel.reviewMedia}</span>
            <span className="text-zinc-600 text-[9px] font-black print:text-gray-500">
              ({rel.reviewCount} avaliações)
            </span>
          </div>
        ) : (
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest print:text-gray-400">
            Sem avaliações
          </p>
        )}
      </div>

      {/* Financeiro */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2 print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-2 print:text-gray-500">
          Resumo Financeiro
        </p>
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-[10px] print:text-gray-600">Receita Bruta</p>
          <p className="text-white text-[10px] font-black print:text-black">{fmtBRL(rel.receitaBruta)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-[10px] print:text-gray-600">
            Taxa VANTA ({(rel.feePercent * 100).toFixed(1)}%)
          </p>
          <p className="text-red-400 text-[10px] font-black print:text-red-600">- {fmtBRL(rel.valorTaxa)}</p>
        </div>
        <div className="h-px bg-white/5 my-1 print:bg-gray-200" />
        <div className="flex justify-between items-center">
          <p className="text-zinc-300 text-[10px] font-black uppercase tracking-widest print:text-gray-700">
            Receita Líquida
          </p>
          <p className="text-emerald-400 text-sm font-black print:text-green-600">{fmtBRL(rel.receitaLiquida)}</p>
        </div>
        <div className="mt-2">
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300]/70">
            Taxa Serviço: Cliente
          </span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
              rel.gatewayMode === 'REPASSAR'
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}
          >
            {rel.gatewayMode === 'REPASSAR' ? 'GW: Cliente' : 'GW: Organizador'}
          </span>
        </div>
      </div>

      {/* Exportar PDF */}
      <button
        onClick={() => window.print()}
        className="w-full py-4 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-2xl flex items-center justify-center gap-2 text-[#FFD300] text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all print:hidden"
      >
        <Printer size={14} />
        Exportar PDF
      </button>
    </div>
  );
};
