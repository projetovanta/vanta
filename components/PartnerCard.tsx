import React from 'react';
import { Parceiro } from '../types';

interface PartnerCardProps {
  parceiro: Parceiro;
  onClick: (id: string) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = React.memo(({ parceiro, onClick }) => (
  <button
    onClick={() => onClick(parceiro.id)}
    className="shrink-0 snap-start w-[9.5rem] flex flex-col overflow-hidden rounded-2xl bg-[#111] border border-white/5 active:scale-95 transition-transform"
  >
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={parceiro.foto || '/icon-192.png'}
        alt={parceiro.nome}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="px-2.5 py-2 flex flex-col gap-0.5 min-w-0">
      <span className="text-xs font-semibold text-white truncate">{parceiro.nome}</span>
      {parceiro.tipo_comunidade && (
        <span className="text-[0.6rem] text-zinc-500 truncate">{parceiro.tipo_comunidade}</span>
      )}
    </div>
  </button>
));

PartnerCard.displayName = 'PartnerCard';
