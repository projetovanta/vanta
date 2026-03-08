import React from 'react';
import { PieChart, ChevronRight } from 'lucide-react';
import type { EventoAdmin } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { VantaPieChart } from '../../components/VantaPieChart';
import { fmtBRL } from '../../../../utils';

interface PieSlice {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface ComunidadeLucro {
  id: string;
  nome: string;
  lucro: number;
  eventos: EventoAdmin[];
}

interface Props {
  pieSlices: PieSlice[];
  lucroPorComunidade: ComunidadeLucro[];
  selectedComId: string | null;
  selectedEventoId: string | null;
  onSelectCom: (id: string | null) => void;
  onSelectEvento: (id: string | null) => void;
}

export const LucroPorComunidade: React.FC<Props> = ({
  pieSlices,
  lucroPorComunidade,
  selectedComId,
  selectedEventoId,
  onSelectCom,
  onSelectEvento,
}) => {
  if (pieSlices.length === 0) return null;

  const selectedCom = lucroPorComunidade.find(c => c.id === selectedComId);

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <PieChart size={13} className="text-[#FFD300]" />
        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Lucro por Comunidade</p>
      </div>

      <VantaPieChart
        data={pieSlices}
        formatValue={fmtBRL}
        selectedName={selectedComId ? (pieSlices.find(s => s.id === selectedComId)?.name ?? null) : null}
        onSliceClick={name => {
          const sl = pieSlices.find(s => s.name === name);
          if (!sl) return;
          onSelectCom(sl.id === selectedComId ? null : sl.id);
          onSelectEvento(null);
        }}
      />

      {/* Eventos da comunidade selecionada */}
      {selectedCom && selectedComId !== '__outros__' && (
        <div className="pt-3 border-t border-white/5 space-y-2">
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Eventos — {selectedCom.nome}</p>
          {selectedCom.eventos.map(ev => {
            const fees = eventosAdminService.getContractedFees(ev.id);
            if (fees.feePercent === 0 && fees.feeFixed === 0) return null;
            const gmv = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos * v.valor, 0);
            const ingressos = ev.lotes.flatMap(l => l.variacoes).reduce((s, v) => s + v.vendidos, 0);
            const taxaV = gmv * fees.feePercent + fees.feeFixed * ingressos;
            return (
              <button
                key={ev.id}
                onClick={() => onSelectEvento(ev.id === selectedEventoId ? null : ev.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  ev.id === selectedEventoId
                    ? 'bg-[#FFD300]/5 border border-[#FFD300]/20'
                    : 'bg-zinc-900/30 border border-white/5 active:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-[11px] font-bold truncate">{ev.nome}</p>
                  <p className="text-zinc-700 text-[8px]">
                    {ingressos} ingressos · GMV {fmtBRL(gmv)}
                  </p>
                </div>
                <p className="text-[#FFD300] text-xs font-bold shrink-0">{fmtBRL(taxaV)}</p>
                <ChevronRight
                  size={12}
                  className={`text-zinc-700 shrink-0 transition-transform ${ev.id === selectedEventoId ? 'rotate-90' : ''}`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
