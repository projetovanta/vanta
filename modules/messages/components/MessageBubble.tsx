import React, { useState, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Mensagem } from '../../../types';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageBubbleProps {
  msg: Mensagem;
  isMe: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  searchQuery?: string;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ msg, isMe, currentUserId, onReact, onDelete, searchQuery, showTimestamp = true }) => {
    const [showActions, setShowActions] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isDeleted = !!msg.deletedAt;
    const canDelete = isMe && !isDeleted && Date.now() - new Date(msg.timestamp).getTime() < 15 * 60 * 1000;

    const handleTouchStart = useCallback(() => {
      longPressTimer.current = setTimeout(() => setShowActions(true), 500);
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }, []);

    // Agrupar reactions: { emoji: count, hasMyReaction }
    const groupedReactions: Record<string, { count: number; hasMe: boolean }> = {};
    for (const r of msg.reactions) {
      if (!groupedReactions[r.emoji]) groupedReactions[r.emoji] = { count: 0, hasMe: false };
      groupedReactions[r.emoji].count++;
      if (r.userId === currentUserId) groupedReactions[r.emoji].hasMe = true;
    }

    // Highlight de busca
    const renderText = (text: string) => {
      if (!searchQuery?.trim()) return text;
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#FFD300]/30 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      );
    };

    // Read receipts (só para minhas msgs)
    const renderReceipt = () => {
      if (!isMe || isDeleted) return null;
      if (msg.isRead) {
        return <span className="text-[#FFD300] text-[0.5625rem] font-black ml-1">✓✓</span>;
      }
      return <span className="text-zinc-400 text-[0.5625rem] font-black ml-1">✓</span>;
    };

    return (
      <div
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 relative`}
      >
        <div
          className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onContextMenu={e => {
            e.preventDefault();
            setShowActions(true);
          }}
        >
          <div
            className={`px-3 py-1.5 text-sm rounded-2xl ${
              isDeleted
                ? 'bg-zinc-900/50 border border-white/5 text-zinc-400 italic'
                : isMe
                  ? 'bg-gradient-to-br from-[#FFD300] to-yellow-600 text-black font-medium rounded-tr-sm'
                  : 'bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-sm'
            }`}
          >
            {isDeleted ? 'Mensagem apagada' : renderText(msg.text)}
          </div>

          {/* Reactions bar */}
          {Object.keys(groupedReactions).length > 0 && !isDeleted && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {Object.entries(groupedReactions).map(([emoji, { count, hasMe }]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  className={`px-2 py-0.5 rounded-full text-[0.6875rem] border transition-all active:scale-90 ${
                    hasMe
                      ? 'bg-[#FFD300]/20 border-[#FFD300]/40 text-[#FFD300]'
                      : 'bg-zinc-900/60 border-white/10 text-zinc-400'
                  }`}
                >
                  {emoji}
                  {count > 1 ? count : ''}
                </button>
              ))}
            </div>
          )}

          {showTimestamp && (
            <div className="flex items-center mt-1">
              <span className="text-[0.5rem] text-zinc-700 uppercase font-black">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {renderReceipt()}
            </div>
          )}
        </div>

        {/* Actions overlay (long-press) */}
        {showActions && !isDeleted && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center"
            role="presentation"
            onClick={() => setShowActions(false)}
          >
            <div
              className={`absolute ${isMe ? 'right-0' : 'left-0'} bottom-full mb-2 bg-zinc-900 border border-white/10 rounded-2xl p-2 flex items-center gap-1 shadow-xl animate-in fade-in zoom-in-95 duration-200`}
              onClick={e => e.stopPropagation()}
            >
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(msg.id, emoji);
                    setShowActions(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-800 active:scale-90 transition-all text-lg"
                >
                  {emoji}
                </button>
              ))}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete(msg.id);
                    setShowActions(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-900/30 active:scale-90 transition-all text-red-400 ml-1 border-l border-white/10 pl-1"
                >
                  <Trash2 size="1rem" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
