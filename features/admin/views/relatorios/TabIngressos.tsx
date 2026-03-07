import React, { useMemo } from 'react';
import { Ticket, TrendingUp } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import type { TicketCaixa } from '../../services/eventosAdminTypes';
import { fmtBRL } from '../../../../utils';

interface Props {
  evento: EventoAdmin;
  tickets: TicketCaixa[];
}

export const TabIngressos: React.FC<Props> = ({ evento, tickets }) => {
  const variacoes = evento.lotes.flatMap(l => l.variacoes);
  const totalVendidos = variacoes.reduce((s, v) => s + v.vendidos, 0);
  const totalLimite = variacoes.reduce((s, v) => s + v.limite, 0);
  const gmvTotal = variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
  const ticketMedio = totalVendidos > 0 ? gmvTotal / totalVendidos : 0;

  // ── Timeline por dia ────────────────────────────────────────────────────────
  const timeline = useMemo(() => {
    const ativos = tickets.filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO');
    if (ativos.length === 0) return [];

    const porDia = new Map<string, { count: number; gmv: number }>();
    for (const t of ativos) {
      const dia = t.emitidoEm.slice(0, 10); // YYYY-MM-DD
      const cur = porDia.get(dia) ?? { count: 0, gmv: 0 };
      cur.count++;
      cur.gmv += t.valor;
      porDia.set(dia, cur);
    }

    return [...porDia.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([dia, d]) => ({ dia, ...d }));
  }, [tickets]);

  const maxDia = useMemo(() => Math.max(...timeline.map(d => d.count), 1), [timeline]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-10">
      {/* KPIs ingressos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Vendidos</p>
          <p className="text-white font-black text-lg mt-1">{totalVendidos}</p>
          <p className="text-zinc-600 text-[9px]">/ {totalLimite}</p>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">GMV</p>
          <p className="text-[#FFD300] font-black text-lg mt-1">{fmtBRL(gmvTotal)}</p>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Ticket Médio</p>
          <p className="text-white font-black text-lg mt-1">{fmtBRL(ticketMedio)}</p>
        </div>
      </div>

      {/* Timeline de vendas */}
      {timeline.length > 0 && (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-[#FFD300]" />
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Timeline de Vendas</p>
          </div>

          <div className="space-y-1.5">
            {timeline.map(d => {
              const pct = (d.count / maxDia) * 100;
              const diaFmt = new Date(d.dia + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              });
              return (
                <div key={d.dia} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-500 text-[9px] font-bold shrink-0">{diaFmt}</p>
                    <p className="text-zinc-600 text-[9px] shrink-0 ml-2">
                      {d.count} · {fmtBRL(d.gmv)}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD300] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendas por lote */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Ticket size={13} className="text-[#FFD300]" />
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Vendas por Lote</p>
        </div>

        <div className="space-y-3">
          {evento.lotes.map(lote => {
            const loteVendidos = lote.variacoes.reduce((s, v) => s + v.vendidos, 0);
            const loteLimite = lote.variacoes.reduce((s, v) => s + v.limite, 0);
            const loteGmv = lote.variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
            const fillPct = loteLimite > 0 ? (loteVendidos / loteLimite) * 100 : 0;

            return (
              <div key={lote.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-[10px] font-bold truncate flex-1 min-w-0">{lote.nome}</p>
                  <p className="text-zinc-500 text-[9px] shrink-0 ml-2">
                    {loteVendidos}/{loteLimite} · {fmtBRL(loteGmv)}
                  </p>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD300] rounded-full transition-all"
                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                  />
                </div>

                {/* Variações dentro do lote */}
                <div className="pl-3 space-y-1">
                  {lote.variacoes.map(v => {
                    const genLabel = v.genero === 'MASCULINO' ? 'M' : v.genero === 'FEMININO' ? 'F' : 'U';
                    return (
                      <div key={v.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[7px] text-zinc-600 font-black uppercase tracking-wider px-1 py-0.5 bg-zinc-800 rounded shrink-0">
                            {genLabel}
                          </span>
                          <p className="text-zinc-500 text-[9px] truncate">
                            {v.area === 'OUTRO' ? v.areaCustom || 'Outro' : v.area}
                          </p>
                        </div>
                        <p className="text-zinc-600 text-[9px] shrink-0 ml-2">
                          {v.vendidos}/{v.limite} · {fmtBRL(v.valor)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket médio por variação */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Ticket Médio por Variação</p>
        <div className="space-y-1.5">
          {variacoes
            .filter(v => v.vendidos > 0)
            .sort((a, b) => b.valor - a.valor)
            .map(v => (
              <div
                key={v.id}
                className="flex items-center justify-between p-2.5 bg-zinc-900/30 border border-white/5 rounded-xl"
              >
                <p className="text-zinc-400 text-[10px] font-bold truncate flex-1 min-w-0">
                  {v.area === 'OUTRO' ? v.areaCustom || 'Outro' : v.area}
                </p>
                <p className="text-zinc-500 text-[10px] shrink-0 ml-2">{v.vendidos} vendidos</p>
                <p className="text-[#FFD300] text-xs font-bold shrink-0 ml-2">{fmtBRL(v.valor)}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Lista de compradores (lote + valor, sem nome) */}
      {tickets.length > 0 && (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">
            Compradores — {tickets.filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO').length} ingressos
          </p>
          <div className="space-y-1.5">
            {tickets
              .filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO')
              .slice(0, 100)
              .map(t => {
                const dataFmt = new Date(t.emitidoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-2.5 bg-zinc-900/30 border border-white/5 rounded-xl"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'USADO' ? 'bg-emerald-400' : 'bg-[#FFD300]'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-[11px] font-bold truncate">{t.variacaoLabel}</p>
                      <p className="text-zinc-600 text-[8px]">{dataFmt}</p>
                    </div>
                    <p className="text-[#FFD300] text-xs font-bold shrink-0">{fmtBRL(t.valor)}</p>
                  </div>
                );
              })}
            {tickets.filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO').length > 100 && (
              <p className="text-zinc-600 text-[9px] text-center py-2">
                + {tickets.filter(t => t.status === 'DISPONIVEL' || t.status === 'USADO').length - 100} ingressos...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
