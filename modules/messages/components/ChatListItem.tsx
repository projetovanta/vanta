import React from 'react';
import { Chat } from '../../../types';
import { formatRelativeTime } from '../../../src/utils/formatDate';
import { OptimizedImage } from '../../../components/OptimizedImage';

interface ChatListItemProps {
  chat: Chat;
  onClick: () => void;
  index: number;
  isOnline?: boolean;
  moodEmoji?: string | null;
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({ chat, onClick, index, isOnline, moodEmoji }) => {
  const nome = chat.participantNome ?? 'Usuário';
  const foto = chat.participantFoto ?? `https://api.dicebear.com/7.x/personas/svg?seed=${chat.participantId}`;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-900/30 border border-white/5 active:bg-zinc-900 transition-all group animate-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full p-[1.5px] bg-zinc-800">
          <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black flex items-center justify-center shadow-lg">
            <OptimizedImage src={foto} alt={nome} width={56} className="w-full h-full object-cover" />
          </div>
        </div>
        {/* Online/offline dot */}
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${
            isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
          }`}
        />
        {chat.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
            <span className="text-[0.625rem] font-black text-white">{chat.unreadCount}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-[0.875rem] font-bold text-white truncate">
            {nome}
            {moodEmoji ? <span className="ml-1 text-[0.75rem]">{moodEmoji}</span> : null}
          </h3>
          <span className="text-[0.625rem] text-zinc-400 font-medium">{formatRelativeTime(chat.lastMessageTime)}</span>
        </div>
        <p
          className={`text-[0.75rem] truncate italic ${chat.unreadCount > 0 ? 'text-zinc-200 font-bold' : 'text-zinc-400 font-light'}`}
        >
          {chat.lastMessage || 'Nenhuma mensagem trocada.'}
        </p>
      </div>
    </button>
  );
});
