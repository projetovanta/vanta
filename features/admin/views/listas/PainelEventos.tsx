import React, { useMemo } from 'react';
import { ArrowLeft, BarChart2, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { ListaEvento } from '../../../../types';
import { listasService } from '../../services/listasService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { TODAY_STR, type RoleListaNova } from './listasUtils';

const EventoCard: React.FC<{ lista: ListaEvento; onSelect: (lista: ListaEvento) => void }> = ({ lista, onSelect }) => {
  const total = lista.convidados.length;
  const dentro = lista.convidados.filter(c => c.checkedIn).length;
  const pct = lista.tetoGlobalTotal > 0 ? Math.round((total / lista.tetoGlobalTotal) * 100) : 0;
  const isPassed = lista.eventoData < TODAY_STR;
  return (
    <button
      onClick={() => onSelect(lista)}
      className="w-full flex items-start gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl active:bg-[#FFD300]/5 active:border-[#FFD300]/20 transition-all text-left"
    >
      <div
        className={`w-12 shrink-0 rounded-xl border flex flex-col items-center py-2 ${isPassed ? 'border-white/5 bg-zinc-900/50' : 'border-[#FFD300]/20 bg-[#FFD300]/5'}`}
      >
        <span
          className={`text-[0.5625rem] font-black uppercase tracking-widest ${isPassed ? 'text-zinc-400' : 'text-[#FFD300]/60'}`}
        >
          {lista.eventoData.slice(5, 7)}/{lista.eventoData.slice(0, 4).slice(-2)}
        </span>
        <span className={`font-black text-xl leading-none mt-0.5 ${isPassed ? 'text-zinc-400' : 'text-white'}`}>
          {lista.eventoData.slice(8, 10)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm leading-tight line-clamp-2 ${isPassed ? 'text-zinc-400' : 'text-white'}`}>
          {lista.eventoNome}
        </p>
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest mt-1 truncate">
          {lista.eventoLocal}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD300] rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-zinc-400 text-[0.5rem] font-black shrink-0">
            {total}/{lista.tetoGlobalTotal}
          </span>
        </div>
        {dentro > 0 && (
          <p className="text-emerald-500/70 text-[0.5rem] font-black uppercase tracking-widest mt-1">{dentro} dentro</p>
        )}
      </div>

      <ChevronRight size="0.875rem" className="text-zinc-700 shrink-0 mt-1" />
    </button>
  );
};

export const PainelEventos: React.FC<{
  role: RoleListaNova;
  userId: string;
  onSelect: (lista: ListaEvento) => void;
  onBack: () => void;
  comunidadeId?: string;
}> = ({ role, userId, onSelect, onBack, comunidadeId }) => {
  const listas = useMemo(() => {
    let todas = listasService.getListas();
    if (comunidadeId) {
      const eventosComIds = new Set(eventosAdminService.getEventosByComunidade(comunidadeId).map(e => e.id));
      todas = todas.filter(l => eventosComIds.has(l.eventoId));
    }
    if (role === 'promoter') {
      return todas.filter(
        l => l.cotas.some(c => c.promoterId === userId) || l.convidados.some(c => c.inseridoPor === userId),
      );
    }
    return todas;
  }, [role, userId, comunidadeId]);

  const proximas = useMemo(
    () => listas.filter(l => l.eventoData >= TODAY_STR).sort((a, b) => a.eventoData.localeCompare(b.eventoData)),
    [listas],
  );
  const passadas = useMemo(
    () => listas.filter(l => l.eventoData < TODAY_STR).sort((a, b) => b.eventoData.localeCompare(a.eventoData)),
    [listas],
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A]">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Portal Admin
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Listas
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
          >
            <ArrowLeft size="1.125rem" className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 max-w-3xl mx-auto w-full">
        {proximas.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-3 px-1">
              Próximos Eventos
            </p>
            <div className="space-y-3">
              {proximas.map(l => (
                <EventoCard key={l.id} lista={l} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}

        {passadas.length > 0 && (
          <div>
            <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-[0.2em] mb-3 px-1">
              Eventos Passados
            </p>
            <div className="space-y-3">
              {passadas.map(l => (
                <EventoCard key={l.id} lista={l} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}

        {listas.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <BarChart2 size="2rem" className="text-zinc-800" />
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
              Nenhuma lista disponível
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
