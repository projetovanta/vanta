import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { cortesiasService } from '../../services/cortesiasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { waitlistService } from '../../../../services/waitlistService';

export const TabLotacao: React.FC<{ lista: ListaEvento }> = ({ lista }) => {
  const total = lista.convidados.length;
  const pct = lista.tetoGlobalTotal > 0 ? Math.round((total / lista.tetoGlobalTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl">
        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-4">Lotação Global</p>
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-5xl leading-none">{total}</span>
            <span className="text-zinc-600 text-xl font-light">/{lista.tetoGlobalTotal}</span>
          </div>
          <div className="text-right pb-1">
            <p className="text-[#FFD300] font-black text-3xl leading-none">{pct}%</p>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">preenchido</p>
          </div>
        </div>
        <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#FFD300] rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          {lista.tetoGlobalTotal - total} vagas restantes
        </p>
      </div>

      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest px-1">Por categoria</p>
      {lista.regras.map(r => {
        const usado = listasService.totalPorRegra(lista, r.id);
        const alocado = lista.cotas.filter(c => c.regraId === r.id).reduce((a, c) => a + c.alocado, 0);
        const pctR = r.tetoGlobal > 0 ? Math.round((usado / r.tetoGlobal) * 100) : 0;
        const cor = r.cor || '#71717a';
        return (
          <div key={r.id} className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                <p className="text-white text-sm font-bold truncate">{r.label}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-2xl leading-none" style={{ color: cor }}>
                  {usado}
                </span>
                <span className="text-zinc-600 font-light text-base">/{r.tetoGlobal}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(pctR, 100)}%`, backgroundColor: cor }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-zinc-600">Banco: {r.saldoBanco}</span>
              <span className="text-zinc-600">Alocado: {alocado}</span>
            </div>
          </div>
        );
      })}

      {/* Waitlist por variação de ingresso */}
      <WaitlistSection listaId={lista.id} />
    </div>
  );
};

/** Seção de waitlist — mostra contagem de interessados por variação */
const WaitlistSection: React.FC<{ listaId: string }> = ({ listaId }) => {
  const [contagem, setContagem] = useState<Record<string, number>>({});
  const [varLabels, setVarLabels] = useState<Record<string, string>>({});

  const eventoAdminId = cortesiasService.getEventoAdminId(listaId);

  useEffect(() => {
    if (!eventoAdminId) return;
    let cancelled = false;
    (async () => {
      const counts = await waitlistService.getContagem(eventoAdminId);
      if (cancelled) return;
      setContagem(counts);

      // Buscar labels das variações
      const evento = eventosAdminService.getEvento(eventoAdminId);
      if (evento) {
        const labels: Record<string, string> = {};
        for (const lote of evento.lotes) {
          for (const v of lote.variacoes) {
            const area = v.area === 'OUTRO' ? (v.areaCustom ?? 'Outro') : v.area;
            const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
            labels[v.id] = `${area} · ${gen}`;
          }
        }
        if (!cancelled) setVarLabels(labels);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventoAdminId]);

  const entries = Object.entries(contagem).filter(([, c]) => (c as number) > 0) as [string, number][];
  if (entries.length === 0) return null;

  return (
    <>
      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest px-1 flex items-center gap-1.5">
        <Bell size={10} className="text-amber-400" /> Lista de Espera
      </p>
      {entries.map(([varId, count]) => (
        <div
          key={varId}
          className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between"
        >
          <p className="text-zinc-300 text-sm font-bold truncate flex-1 min-w-0">
            {varLabels[varId] ?? varId.slice(0, 8)}
          </p>
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[9px] font-black shrink-0">
            {count} na fila
          </span>
        </div>
      ))}
    </>
  );
};
