import React from 'react';
import { Calendar, MapPin, User, Music, ExternalLink, Globe } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';

interface EventInfoProps {
  evento: Evento;
  isNextDay: boolean;
  onComunidadeClick?: (id: string) => void;
}

export const EventInfo: React.FC<EventInfoProps> = ({ evento, isNextDay, onComunidadeClick }) => {
  const handleOpenMaps = () => {
    if (evento.endereco) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.endereco)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 text-zinc-300">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-[#FFD300] mt-1">
          <Calendar size="1.125rem" />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-zinc-400 mb-0.5">
                Início
              </p>
              <p className="text-sm font-medium text-white leading-tight">
                {evento.data}
                <br />
                <span className="text-zinc-300">{evento.horario}</span>
              </p>
            </div>
            {evento.horarioFim && (
              <div>
                <p style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-zinc-400 mb-0.5">
                  Término
                </p>
                <p className="text-sm font-medium text-white leading-tight">
                  {evento.data}
                  <br />
                  <span className="text-zinc-300">{evento.horarioFim}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {evento.comunidade && (
        <div className="flex items-center gap-3 text-zinc-300">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-[#FFD300]">
            <Globe size="1.125rem" />
          </div>
          <button
            className="flex-1 text-left group"
            onClick={() => evento.comunidade && onComunidadeClick?.(evento.comunidade.id)}
          >
            <p style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-zinc-400">
              Local
            </p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-white group-active:text-[#FFD300] transition-colors">
                {evento.comunidade.nome}
              </p>
              <ExternalLink size="0.625rem" className="text-zinc-400 group-active:text-[#FFD300]" />
            </div>
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 text-zinc-300">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-[#FFD300]">
          <MapPin size="1.125rem" />
        </div>
        <button onClick={handleOpenMaps} className="flex-1 text-left group">
          <p style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-zinc-400">
            Endereço
          </p>
          <p className="text-sm font-medium text-white group-active:text-[#FFD300] transition-colors">
            {evento.endereco || `${evento.local} — ${evento.cidade}`}
          </p>
        </button>
      </div>

      {evento.dressCode && (
        <div className="flex items-center gap-3 text-zinc-300">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-[#FFD300]">
            <User size="1.125rem" />
          </div>
          <div>
            <p style={TYPOGRAPHY.uiLabel} className="text-[0.5625rem] text-zinc-400">
              Dress Code
            </p>
            <p className="text-sm font-medium text-white">{evento.dressCode}</p>
          </div>
        </div>
      )}

      {evento.lineup && (
        <div className="mt-4">
          <h3 style={TYPOGRAPHY.sectionKicker} className="mb-3">
            Line-up
          </h3>
          <div className="space-y-2">
            {evento.lineup.map((artist, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <Music size="0.875rem" className="text-purple-400" />
                <span className="text-sm font-medium text-zinc-200">{artist}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
