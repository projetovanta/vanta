import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { Membro } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { DEFAULT_AVATARS } from '../../../data/avatars';
export const PeopleResults: React.FC<{ results: Membro[]; onMemberClick?: (m: Membro) => void }> = ({
  results,
  onMemberClick,
}) => (
  <div className="space-y-4">
    <h2 style={TYPOGRAPHY.uiLabel} className="mb-2">
      {results.length} Pessoas encontradas
    </h2>
    {results.length > 0 ? (
      results.map(m => (
        <div
          key={m.id}
          onClick={() => onMemberClick?.(m)}
          className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:bg-zinc-900 transition-all cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full overflow-hidden bg-black">
            <img
              loading="lazy"
              src={m.foto || DEFAULT_AVATARS.MASCULINO}
              alt={m.nome || 'Usuário'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{m.nome}</h3>
            <p className="text-[10px] text-zinc-400 truncate">@{m.email.split('@')[0]}</p>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </div>
      ))
    ) : (
      <div className="py-12 text-center text-zinc-400">Ninguém encontrado.</div>
    )}
  </div>
);
