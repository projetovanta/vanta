import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { fmtBRL } from '../../../../utils';

interface Props {
  evento: EventoAdmin;
}

export const RaioXEvento: React.FC<Props> = ({ evento }) => {
  const fees = eventosAdminService.getContractedFees(evento.id);

  return (
    <div className="bg-zinc-900/40 border border-[#FFD300]/15 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 size={13} className="text-[#FFD300]" />
        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Raio-X — {evento.nome}</p>
      </div>

      {/* Performance por Lote */}
      <div className="space-y-2">
        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Performance por Lote</p>
        {evento.lotes.map(lote => {
          const loteGmv = lote.variacoes.reduce((s, v) => s + v.vendidos * v.valor, 0);
          const loteVendidos = lote.variacoes.reduce((s, v) => s + v.vendidos, 0);
          const loteLimite = lote.variacoes.reduce((s, v) => s + v.limite, 0);
          const fillPct = loteLimite > 0 ? (loteVendidos / loteLimite) * 100 : 0;
          return (
            <div key={lote.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-[9px] font-bold truncate flex-1 min-w-0">{lote.nome}</p>
                <p className="text-zinc-400 text-[9px] shrink-0 ml-2">
                  {loteVendidos}/{loteLimite} · {fmtBRL(loteGmv)}
                </p>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD300] rounded-full transition-all"
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Divisão por Tipo (Gênero/Área) */}
      <div className="space-y-2 pt-3 border-t border-white/5">
        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Lucro por Tipo</p>
        <div className="grid grid-cols-2 gap-2">
          {(() => {
            const tipoMap = new Map<string, { vendidos: number; gmv: number }>();
            for (const lote of evento.lotes) {
              for (const v of lote.variacoes) {
                const area = v.area === 'OUTRO' ? v.areaCustom || 'Outro' : v.area;
                const gen = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
                const key = `${area} · ${gen}`;
                const cur = tipoMap.get(key) ?? { vendidos: 0, gmv: 0 };
                cur.vendidos += v.vendidos;
                cur.gmv += v.vendidos * v.valor;
                tipoMap.set(key, cur);
              }
            }
            return [...tipoMap.entries()]
              .filter(([, d]) => d.vendidos > 0)
              .sort((a, b) => b[1].gmv - a[1].gmv)
              .map(([tipo, d]) => {
                const taxaV = d.gmv * fees.feePercent + fees.feeFixed * d.vendidos;
                return (
                  <div key={tipo} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 space-y-1">
                    <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest truncate">{tipo}</p>
                    <p className="text-zinc-300 text-xs font-bold">{fmtBRL(taxaV)}</p>
                    <p className="text-zinc-700 text-[7px]">{d.vendidos} ingressos</p>
                  </div>
                );
              });
          })()}
        </div>
      </div>
    </div>
  );
};
