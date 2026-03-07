import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';

interface PresencaListProps {
  events: Evento[];
  isPast?: boolean;
}

export const PresencaList: React.FC<PresencaListProps> = ({ events, isPast }) => (
  <div className={isPast ? 'opacity-50' : ''}>
    <h2 style={TYPOGRAPHY.uiLabel} className="mb-4 text-[#FFD300]/80">
      Presença Confirmada (Lista VIP)
    </h2>
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
            {isPast ? (
              <Clock size={20} className="text-zinc-600" />
            ) : (
              <CheckCircle size={20} className="text-zinc-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-300 text-sm truncate">{event.titulo}</h3>
            <p className="text-zinc-500 text-xs truncate">
              {event.data} • {event.horario}
            </p>
            <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider">
              {isPast ? 'Evento concluído' : 'Apenas nome na lista'}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
