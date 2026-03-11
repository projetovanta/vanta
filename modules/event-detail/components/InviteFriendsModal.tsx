import React, { useState, useMemo } from 'react';
import { X, Search, Send, Check } from 'lucide-react';
import { Membro, Evento } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { useModalBack } from '../../../hooks/useModalStack';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Membro[];
  evento: Evento;
  onSendInvite: (friendIds: string[]) => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  evento,
  onSendInvite,
}) => {
  useModalBack(isOpen, onClose, 'invite-friends');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredFriends = useMemo(
    () => friends.filter(f => f.nome.toLowerCase().includes(debouncedQuery.toLowerCase())),
    [friends, debouncedQuery],
  );

  const toggleFriend = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[50] bg-[#0A0A0A] flex flex-col animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
      <div className="px-6 pt-6 pb-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div>
          <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl">
            Convidar Amigos
          </h2>
          <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-widest mt-1">
            Selecione quem vai com você
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-zinc-900/50 rounded-full flex items-center justify-center active:scale-90"
        >
          <X size="1.25rem" className="text-zinc-400" />
        </button>
      </div>

      <div className="px-6 py-6">
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

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 no-scrollbar">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(f => (
            <button
              key={f.id}
              onClick={() => toggleFriend(f.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                selectedIds.has(f.id) ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-zinc-900/20 border-white/5'
              }`}
            >
              <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black shrink-0">
                <img loading="lazy" src={f.foto} alt={f.nome} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="text-sm font-bold text-zinc-200 truncate">{f.nome}</h4>
                <p className="text-[0.625rem] text-zinc-400 truncate">@{f.email.split('@')[0]}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  selectedIds.has(f.id)
                    ? 'bg-[#FFD300] border-[#FFD300] text-black'
                    : 'border-zinc-700 text-transparent'
                }`}
              >
                <Check size="0.875rem" strokeWidth={3} />
              </div>
            </button>
          ))
        ) : (
          <div className="py-20 text-center opacity-40">
            <p className="text-sm text-zinc-400 italic">Nenhum amigo encontrado.</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent">
        <button
          disabled={selectedIds.size === 0}
          onClick={() => {
            onSendInvite(Array.from(selectedIds));
            onClose();
          }}
          className="w-full py-4 bg-[#FFD300] disabled:bg-zinc-800 disabled:text-zinc-400 text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Send size="1rem" />
          Enviar Convites ({selectedIds.size})
        </button>
      </div>
    </div>
  );
};
