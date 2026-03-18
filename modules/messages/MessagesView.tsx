import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, MessageSquare, Archive } from 'lucide-react';
import { Membro } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { ChatListItem } from './components/ChatListItem';
import { NewChatModal } from './components/NewChatModal';
import { ArchiveModal } from './components/ArchiveModal';
import { useChatStore } from '../../stores/chatStore';
import { useSocialStore } from '../../stores/socialStore';
import { useDebounce } from '../../hooks/useDebounce';
import { EmptyState } from '../../components/EmptyState';
import { moodService, MoodData } from '../../services/moodService';
import { Skeleton } from '../../components/Skeleton';
import { useBloqueados } from '../../hooks/useBloqueados';
import { globalToast } from '../../components/Toast';

type MessagesTab = 'CONVERSAS' | 'ARQUIVADAS';

interface MessagesViewProps {
  onOpenChat: (member: Membro) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ onOpenChat }) => {
  const chats = useChatStore(s => s.chats);
  const onlineUsers = useChatStore(s => s.onlineUsers);
  const chatSettings = useChatStore(s => s.chatSettings);
  const archiveChat = useChatStore(s => s.archiveChat);
  const unarchiveChat = useChatStore(s => s.unarchiveChat);
  const muteChat = useChatStore(s => s.muteChat);
  const unmuteChat = useChatStore(s => s.unmuteChat);
  const mutualFriends = useSocialStore(s => s.mutualFriends);
  const bloqueados = useBloqueados();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MessagesTab>('CONVERSAS');
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; nome: string } | null>(null);
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
      if (bloqueados.has(chat.participantId)) return false;
      const isArchived = chatSettings.get(chat.participantId)?.archived ?? false;
      if (activeTab === 'CONVERSAS' && isArchived) return false;
      if (activeTab === 'ARQUIVADAS' && !isArchived) return false;
      const nome = chat.participantNome ?? '';
      const searchStr = (nome + chat.lastMessage).toLowerCase();
      return searchStr.includes(debouncedQuery.toLowerCase());
    });
  }, [chats, debouncedQuery, bloqueados, chatSettings, activeTab]);

  const archivedCount = useMemo(
    () => chats.filter(c => chatSettings.get(c.participantId)?.archived).length,
    [chats, chatSettings],
  );

  const handleStartNewChat = (member: Membro) => {
    setIsNewChatModalOpen(false);
    onOpenChat(member);
  };

  const chatToMembro = (chat: (typeof chats)[0]): Membro => ({
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
  });

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
      <div className="shrink-0 relative z-20 bg-[#0A0A0A] border-b border-white/5 pt-6 px-6 pb-4">
        <div className="flex justify-between items-center mb-4">
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
            <Plus size="0.875rem" className="text-[#FFD300] group-hover:rotate-90 transition-transform" />
            <span className="text-[0.625rem] font-black uppercase tracking-widest text-zinc-300">Nova</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('CONVERSAS')}
            className={`px-4 py-2 rounded-full text-[0.5625rem] font-black uppercase tracking-widest transition-all ${
              activeTab === 'CONVERSAS'
                ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/30'
                : 'bg-zinc-900/50 text-zinc-500 border border-white/5'
            }`}
          >
            Conversas
          </button>
          <button
            onClick={() => setActiveTab('ARQUIVADAS')}
            className={`px-4 py-2 rounded-full text-[0.5625rem] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              activeTab === 'ARQUIVADAS'
                ? 'bg-[#FFD300]/10 text-[#FFD300] border border-[#FFD300]/30'
                : 'bg-zinc-900/50 text-zinc-500 border border-white/5'
            }`}
          >
            <Archive size="0.75rem" />
            Arquivadas{archivedCount > 0 ? ` (${archivedCount})` : ''}
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size="1.125rem" className="text-zinc-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl leading-5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#FFD300]/50 transition-all text-sm shadow-inner"
            placeholder="Buscar conversas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-4 space-y-2">
        {filteredChats.length === 0 && isFirstLoad && activeTab === 'CONVERSAS' ? (
          <>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat, idx) => {
            const settings = chatSettings.get(chat.participantId);
            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isOnline={onlineUsers?.has(chat.participantId)}
                moodEmoji={moods[chat.participantId]?.emoji}
                isArchived={settings?.archived}
                isMuted={settings?.muted}
                onClick={() => onOpenChat(chatToMembro(chat))}
                onArchive={() => setArchiveTarget({ id: chat.participantId, nome: chat.participantNome ?? 'Usuário' })}
                onUnarchive={async () => {
                  await unarchiveChat(chat.participantId);
                  globalToast('sucesso', 'Conversa restaurada');
                }}
                onMute={async () => {
                  await muteChat(chat.participantId);
                  globalToast('sucesso', 'Conversa silenciada');
                }}
                onUnmute={async () => {
                  await unmuteChat(chat.participantId);
                  globalToast('sucesso', 'Notificações ativadas');
                }}
                index={idx}
              />
            );
          })
        ) : (
          <EmptyState
            icon={activeTab === 'ARQUIVADAS' ? Archive : MessageSquare}
            title={
              activeTab === 'ARQUIVADAS'
                ? 'Nenhuma conversa arquivada'
                : query
                  ? 'Nenhuma conversa encontrada'
                  : 'Sua caixa está vazia'
            }
            subtitle={activeTab === 'ARQUIVADAS' ? undefined : query ? 'Tente outro nome.' : 'Comece uma conexão!'}
          />
        )}
      </div>

      {/* Archive confirmation modal */}
      <ArchiveModal
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        participantNome={archiveTarget?.nome ?? ''}
        onConfirm={async keepArchived => {
          if (archiveTarget) {
            await archiveChat(archiveTarget.id, keepArchived);
            globalToast('sucesso', 'Conversa arquivada');
          }
          setArchiveTarget(null);
        }}
      />
    </div>
  );
};
