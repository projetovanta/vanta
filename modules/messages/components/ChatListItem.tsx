import React, { useRef, useState } from 'react';
import { Archive, ArchiveRestore, BellOff, Bell } from 'lucide-react';
import { Chat } from '../../../types';
import { formatRelativeTime } from '../../../src/utils/formatDate';
import { OptimizedImage } from '../../../components/OptimizedImage';

interface ChatListItemProps {
  chat: Chat;
  onClick: () => void;
  index: number;
  isOnline?: boolean;
  moodEmoji?: string | null;
  isArchived?: boolean;
  isMuted?: boolean;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onMute?: () => void;
  onUnmute?: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({ chat, onClick, index, isOnline, moodEmoji, isArchived, isMuted, onArchive, onUnarchive, onMute, onUnmute }) => {
    const nome = chat.participantNome ?? 'Usuário';
    const foto = chat.participantFoto ?? `https://api.dicebear.com/7.x/personas/svg?seed=${chat.participantId}`;

    // Swipe state
    const touchStartX = useRef(0);
    const [swipeX, setSwipeX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const THRESHOLD = 60;
    const ACTION_WIDTH = 140;

    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      setSwiping(true);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!swiping) return;
      const diff = touchStartX.current - e.touches[0].clientX;
      if (diff > 0) setSwipeX(Math.min(diff, ACTION_WIDTH));
      else setSwipeX(0);
    };
    const handleTouchEnd = () => {
      setSwiping(false);
      if (swipeX >= THRESHOLD) setSwipeX(ACTION_WIDTH);
      else setSwipeX(0);
    };

    const closeSwipe = () => setSwipeX(0);

    return (
      <div
        className="relative overflow-hidden rounded-3xl animate-in slide-in-from-bottom-2 duration-500"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Action buttons (behind) */}
        <div className="absolute right-0 inset-y-0 flex items-stretch">
          <button
            onClick={() => {
              closeSwipe();
              if (isMuted) onUnmute?.();
              else onMute?.();
            }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-zinc-700 text-zinc-200"
          >
            {isMuted ? <Bell size="1rem" /> : <BellOff size="1rem" />}
            <span className="text-[0.5rem] font-bold uppercase tracking-wider">{isMuted ? 'Ativar' : 'Silenciar'}</span>
          </button>
          <button
            onClick={() => {
              closeSwipe();
              if (isArchived) onUnarchive?.();
              else onArchive?.();
            }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-[#FFD300] text-black"
          >
            {isArchived ? <ArchiveRestore size="1rem" /> : <Archive size="1rem" />}
            <span className="text-[0.5rem] font-bold uppercase tracking-wider">
              {isArchived ? 'Restaurar' : 'Arquivar'}
            </span>
          </button>
        </div>

        {/* Main content (slides) */}
        <div
          className="relative bg-[#0A0A0A] transition-transform duration-200 ease-out"
          style={{ transform: `translateX(-${swipeX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => {
              if (swipeX > 0) {
                closeSwipe();
                return;
              }
              onClick();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-900/30 border border-white/5 active:bg-zinc-900 transition-colors group"
          >
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full p-[1.5px] bg-zinc-800">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black flex items-center justify-center shadow-lg">
                  <OptimizedImage src={foto} alt={nome} width={56} className="w-full h-full object-cover" />
                </div>
              </div>
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
                  {isMuted && <BellOff size="0.625rem" className="inline ml-1 text-zinc-600" />}
                </h3>
                <span className="text-[0.625rem] text-zinc-400 font-medium shrink-0 ml-2">
                  {formatRelativeTime(chat.lastMessageTime)}
                </span>
              </div>
              <p
                className={`text-[0.75rem] truncate italic ${chat.unreadCount > 0 ? 'text-zinc-200 font-bold' : 'text-zinc-400 font-normal'}`}
              >
                {chat.lastMessage || 'Nenhuma mensagem trocada.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  },
);
