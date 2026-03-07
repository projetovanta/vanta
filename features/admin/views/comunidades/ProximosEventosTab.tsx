import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { eventosAdminService } from '../../services/eventosAdminService';

export const ProximosEventosTab: React.FC<{ comunidadeId: string }> = ({ comunidadeId }) => {
  const now = new Date();
  const eventos = eventosAdminService.getEventosByComunidade(comunidadeId).filter(e => new Date(e.dataFim) >= now);

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <Calendar size={32} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
          Nenhum evento futuro
        </p>
        <p className="text-zinc-800 text-[9px] italic text-center">Crie eventos na aba Criar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {eventos.map(e => {
        const dataLabel = new Date(e.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        return (
          <div
            key={e.id}
            className="relative rounded-2xl overflow-hidden bg-zinc-900/40 border border-white/5 min-h-[88px]"
          >
            {e.foto && (
              <>
                <img loading="lazy" src={e.foto} alt={e.nome} className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                  }}
                />
              </>
            )}
            <div className="relative flex items-center justify-between px-5 py-5">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-[#FFD300] text-[8px] font-black uppercase tracking-[0.15em] mb-1">{dataLabel}</p>
                <p className="text-white font-bold text-sm leading-tight truncate">{e.nome}</p>
                <p className="text-zinc-400 text-[10px] mt-0.5">
                  {e.lotes.length} lote{e.lotes.length !== 1 ? 's' : ''} · {e.equipe.length} na equipe
                </p>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <ChevronRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
