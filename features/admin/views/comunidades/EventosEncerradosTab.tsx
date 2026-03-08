import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { EventoAdmin } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { listasService } from '../../services/listasService';
import { ResumoEventoView } from './ResumoEventoModal';

export const EventosEncerradosTab: React.FC<{ comunidadeId: string }> = ({ comunidadeId }) => {
  const [selectedEvento, setSelectedEvento] = useState<EventoAdmin | null>(null);

  const now = new Date();
  const eventos = eventosAdminService.getEventosByComunidade(comunidadeId).filter(e => new Date(e.dataFim) < now);
  const listas = listasService.getListas();

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <BarChart2 size={32} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
          Nenhum evento encerrado
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {eventos.map(e => {
          const dataLabel = new Date(e.dataInicio).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          });
          const totalVendidos = e.lotes.reduce((a, l) => a + l.vendidos, 0);
          const lista = listas.find(l => l.eventoNome === e.nome);
          const totalCheckedIn = lista ? lista.convidados.filter(c => c.checkedIn).length : 0;
          const totalLista = lista ? lista.convidados.length : 0;

          return (
            <button
              key={e.id}
              onClick={() => setSelectedEvento(e)}
              className="w-full p-4 bg-zinc-900/40 border border-white/5 rounded-2xl text-left active:bg-zinc-900/70 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-0.5">
                    {dataLabel} · Encerrado
                  </p>
                  <p className="text-zinc-300 font-bold text-sm leading-tight truncate">{e.nome}</p>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD300]/60 border border-[#FFD300]/20 px-2.5 py-1 rounded-full shrink-0 bg-[#FFD300]/5">
                  Ver mais
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-zinc-300 font-black text-lg leading-none">{totalVendidos}</p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider mt-1">Ingressos</p>
                </div>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-zinc-300 font-black text-lg leading-none">{totalLista}</p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider mt-1">Na Lista</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                  <p className="text-emerald-400 font-black text-lg leading-none">{totalCheckedIn}</p>
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider mt-1">Entraram</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedEvento && (
        <ResumoEventoView
          evento={selectedEvento}
          lista={listas.find(l => l.eventoNome === selectedEvento.nome)}
          onClose={() => setSelectedEvento(null)}
        />
      )}
    </>
  );
};
