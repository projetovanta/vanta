import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { AdminViewHeader } from '../../components/AdminViewHeader';
import { eventosAdminService } from '../../services/eventosAdminService';
import EventoCaixaView from './EventoCaixaView';

export const CaixaView: React.FC<{
  onBack: () => void;
  eventoId?: string;
  comunidadeId?: string;
}> = ({ onBack, eventoId, comunidadeId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(eventoId ?? null);

  const eventosComCaixa = eventosAdminService.getEventos().filter(e => {
    if (!e.caixaAtivo) return false;
    if (comunidadeId && e.comunidadeId !== comunidadeId) return false;
    return true;
  });

  if (selectedId) {
    const evento = eventosAdminService.getEvento(selectedId);
    const backFn = eventoId ? onBack : () => setSelectedId(null);

    return (
      <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
        <AdminViewHeader title={evento?.nome ?? 'Evento'} kicker="Venda na Porta" onBack={backFn} />
        {evento ? (
          <EventoCaixaView evento={evento} onBack={backFn} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-400 text-sm">Evento não encontrado.</p>
          </div>
        )}
      </div>
    );
  }

  // Picker de eventos com caixa ativo
  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader title="Venda na Porta" kicker="Operador" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3 max-w-3xl mx-auto w-full">
        {eventosComCaixa.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <ShoppingCart size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
              Nenhum evento com caixa ativo
            </p>
            <p className="text-zinc-800 text-[0.5625rem] text-center leading-relaxed max-w-[13.75rem]">
              O criador do evento precisa ativar
              <br />
              "Venda na Porta" no painel do evento.
            </p>
          </div>
        ) : (
          eventosComCaixa.map(ev => {
            const lotesAtivos = ev.lotes.filter(l => l.ativo).length;
            const dataLabel = new Date(ev.dataInicio)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              .toUpperCase();
            return (
              <button
                key={ev.id}
                onClick={() => setSelectedId(ev.id)}
                className="w-full flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-[#FFD300]/20 active:bg-[#FFD300]/5 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                  {ev.foto && <img loading="lazy" src={ev.foto} alt={ev.nome} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate mb-1">{ev.nome}</p>
                  <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
                    {dataLabel} · {lotesAtivos} lote{lotesAtivos !== 1 ? 's' : ''} ativo{lotesAtivos !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
