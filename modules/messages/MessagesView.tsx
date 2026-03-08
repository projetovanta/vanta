import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Membro } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { ChatListItem } from './components/ChatListItem';
import { NewChatModal } from './components/NewChatModal';
import { useChatStore } from '../../stores/chatStore';
import { useSocialStore } from '../../stores/socialStore';
import { useDebounce } from '../../hooks/useDebounce';
import { moodService, MoodData } from '../../services/moodService';
import { Skeleton } from '../../components/Skeleton';

interface MessagesViewProps {
  onOpenChat: (member: Membro) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ onOpenChat }) => {
  const chats = useChatStore(s => s.chats);
  const onlineUsers = useChatStore(s => s.onlineUsers);
  const mutualFriends = useSocialStore(s => s.mutualFriends);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const chatsLoaded = useRef(false);
  const [moods, setMoods] = useState<Record<string, MoodData>>({});

  useEffect(() => {
    const ids = chats.map(c => c.participantId);
    if (ids.length === 0) return;
    moodService.getMany(ids).then(setMoods);
  }, [chats]);

  if (chats.length > 0) chatsLoaded.current = true;
  const isFirstLoad = !chatsLoaded.current;

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const nome = chat.participantNome ?? '';
      const searchStr = (nome + chat.lastMessage).toLowerCase();
      return searchStr.includes(debouncedQuery.toLowerCase());
    });
  }, [chats, debouncedQuery]);

  const handleStartNewChat = (member: Membro) => {
    setIsNewChatModalOpen(false);
    onOpenChat(member);
  };

  if (isNewChatModalOpen) {
    return (
      <NewChatModal
        isOpen
        onClose={() => setIsNewChatModalOpen(false)}
        friends={mutualFriends}
        onSelectFriend={handleStartNewChat}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A] animate-in fade-in duration-500">
      <div className="shrink-0 relative z-20 bg-[#0A0A0A] border-b border-white/5 pt-6 px-6 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1
            style={TYPOGRAPHY.screenTitle}
            className="text-3xl text-[#FFD300] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
          >
            Mensagens
          </h1>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-full flex items-center gap-2 active:scale-95 transition-all group"
          >
            <Plus size={14} className="text-[#FFD300] group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Nova</span>
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl leading-5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#FFD300]/50 transition-all text-sm shadow-inner"
            placeholder="Buscar conversas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-28 space-y-2">
        {filteredChats.length === 0 && isFirstLoad ? (
          <>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat, idx) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isOnline={onlineUsers?.has(chat.participantId)}
              moodEmoji={moods[chat.participantId]?.emoji}
              onClick={() => {
                const member: Membro = {
                  id: chat.participantId,
                  nome: chat.participantNome ?? 'Usuário',
                  foto: chat.participantFoto ?? `https://api.dicebear.com/7.x/personas/svg?seed=${chat.participantId}`,
                  email: '',
                  role: 'vanta_member',
                  genero: 'MASCULINO',
                  cidade: '',
                  estado: '',
                  biografia: '',
                  interesses: [],
                  selos: [],
                };
                onOpenChat(member);
              }}
              index={idx}
            />
          ))
        ) : (
          <div className="py-32 text-center animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 opacity-40">
              <MessageSquare size={24} className="text-zinc-400" />
            </div>
            <p className="text-zinc-400 italic text-sm">
              {query ? 'Nenhuma conversa encontrada.' : 'Sua caixa está vazia. Comece uma conexão!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
