import React, { useState, useMemo } from 'react';
import { X, Search, UserPlus, ShieldCheck } from 'lucide-react';
import { Membro } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { useModalBack } from '../../../hooks/useModalStack';

export const NewChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  friends: Membro[];
  onSelectFriend: (m: Membro) => void;
}> = ({ isOpen, onClose, friends, onSelectFriend }) => {
  useModalBack(isOpen, onClose, 'new-chat');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const filteredFriends = useMemo(
    () => friends.filter(f => f.nome.toLowerCase().includes(debouncedQuery.toLowerCase())),
    [friends, debouncedQuery],
  );
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[200] bg-[#0A0A0A] flex flex-col animate-in slide-in-from-bottom-full duration-500">
      <div
        className="px-6 pb-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/95 backdrop-blur-xl"
        style={{ paddingTop: '1.5rem' }}
      >
        <div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl">
            Nova Mensagem
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <ShieldCheck size="0.75rem" className="text-[#FFD300]" />
            <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-widest">Apenas amizades</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-zinc-900/50 rounded-full flex items-center justify-center active:scale-90"
        >
          <X size="1.25rem" className="text-zinc-400" />
        </button>
      </div>
      <div className="px-6 py-6 bg-[#0A0A0A]">
        <div className="relative">
          <Search size="1.125rem" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 text-white focus:outline-none focus:border-[#FFD300]/30 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-3 no-scrollbar">
        {filteredFriends.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => onSelectFriend(f)}
            className="w-full flex items-center gap-5 p-4 rounded-3xl bg-zinc-900/20 border border-white/5 active:bg-zinc-800 transition-all animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-black shrink-0">
              <img loading="lazy" src={f.foto} alt={f.nome} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-base font-bold text-zinc-200 truncate">{f.nome}</h4>
              <p className="text-[0.6875rem] text-zinc-400 truncate">@{f.email.split('@')[0]}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-400 border border-white/5">
              <UserPlus size="1rem" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
