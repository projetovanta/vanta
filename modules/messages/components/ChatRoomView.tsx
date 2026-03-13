import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Shield, MoreVertical, X, Search, ChevronUp, ChevronDown, Flag } from 'lucide-react';
import { Chat, Membro } from '../../../types';
import { PublicProfilePreviewView } from '../../profile/PublicProfilePreviewView';
import { MessageBubble } from './MessageBubble';
import { useAuthStore } from '../../../stores/authStore';
import { useSocialStore } from '../../../stores/socialStore';
import { useChatStore } from '../../../stores/chatStore';
import { useDebounce } from '../../../hooks/useDebounce';
import { ReportModal } from '../../../components/ReportModal';
import { globalToast } from '../../../components/Toast';

interface ChatRoomViewProps {
  chat: Chat;
  onBack: () => void;
}

export const ChatRoomView: React.FC<ChatRoomViewProps> = ({ chat, onBack }) => {
  const currentUserId = useAuthStore(s => s.currentAccount.id);
  const friendships = useSocialStore(s => s.friendships);
  const onRequestFriend = useSocialStore(s => s.requestFriendship);
  const onCancelRequest = useSocialStore(s => s.cancelFriendshipRequest);
  const onRemoveFriend = useSocialStore(s => s.removeFriend);
  const onlineUsers = useChatStore(s => s.onlineUsers);
  const sendMessage = useChatStore(s => s.sendMessage);
  const deleteMessage = useChatStore(s => s.deleteMessage);
  const toggleReaction = useChatStore(s => s.toggleReaction);
  const isOnline = onlineUsers.has(chat.participantId);
  const onSendMessage = (text: string) => sendMessage(chat.participantId, text);
  const onDeleteMessage = (msgId: string) => deleteMessage(msgId, chat.participantId);
  const onReactMessage = useCallback(
    (msgId: string, emoji: string) => toggleReaction(msgId, emoji, chat.participantId),
    [chat.participantId, toggleReaction],
  );
  const [inputText, setInputText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchIndex, setSearchIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);

  const participantNome = chat.participantNome ?? 'Usuário';
  const participantFoto =
    chat.participantFoto ?? `https://api.dicebear.com/7.x/personas/svg?seed=${chat.participantId}`;
  const participant: Membro = {
    id: chat.participantId,
    nome: participantNome,
    foto: participantFoto,
    email: '',
    role: 'vanta_member',
    genero: 'MASCULINO',
    cidade: '',
    estado: '',
    biografia: '',
    interesses: [],
    selos: [],
  };

  useEffect(() => {
    if (!window.visualViewport) return;
    const onResize = () => {
      const offset = Math.max(0, window.innerHeight - window.visualViewport!.height - window.visualViewport!.offsetTop);
      setKeyboardOffset(offset);
      if (offset > 0) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };
    window.visualViewport.addEventListener('resize', onResize);
    return () => window.visualViewport?.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Resultados da busca
  const searchResults = debouncedSearchQuery.trim()
    ? chat.messages.filter(m => !m.deletedAt && m.text.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    : [];

  // Scroll para resultado da busca
  useEffect(() => {
    if (searchResults.length === 0) return;
    const targetMsg = searchResults[searchIndex];
    if (!targetMsg) return;
    const el = messageRefs.current.get(targetMsg.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIndex]);

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const isFriend = friendships[chat.participantId] === 'FRIENDS';

  const handleSend = () => {
    if (!inputText.trim() || !isFriend) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleDelete = useCallback((messageId: string) => {
    setDeleteTarget(messageId);
  }, []);

  const confirmDelete = () => {
    if (deleteTarget && onDeleteMessage) {
      onDeleteMessage(deleteTarget);
    }
    setDeleteTarget(null);
  };

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      onReactMessage?.(messageId, emoji);
    },
    [onReactMessage],
  );

  const setMessageRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) messageRefs.current.set(id, el);
    else messageRefs.current.delete(id);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A] animate-in slide-in-from-right duration-300 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-4 pb-4 pt-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size="1.125rem" />
          </button>
          <div
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border border-[#FFD300]/30 overflow-hidden bg-black p-[1px]">
                <img
                  loading="lazy"
                  src={participantFoto}
                  alt={participantNome}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Online dot */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A0A0A] ${
                  isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{participantNome}</h3>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                <span className="text-[0.5625rem] font-black uppercase text-zinc-400 tracking-widest">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowSearch(s => !s);
              if (showSearch) {
                setSearchQuery('');
                setSearchIndex(0);
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showSearch ? 'text-[#FFD300]' : 'text-zinc-400'}`}
          >
            <Search size="1.125rem" />
          </button>
          <div className="relative">
            <button
              aria-label="Mais opções"
              onClick={() => setShowChatMenu(v => !v)}
              className="w-10 h-10 flex items-center justify-center text-zinc-400"
            >
              <MoreVertical size="1.25rem" />
            </button>
            {showChatMenu && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[10rem] animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowChatMenu(false);
                    setShowReport(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-red-400 text-[0.6875rem] font-semibold active:bg-zinc-800 transition-colors"
                >
                  <Flag size="0.875rem" />
                  Denunciar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="shrink-0 px-4 py-3 bg-zinc-900/80 border-b border-white/5 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSearchIndex(0);
            }}
            placeholder="Buscar na conversa..."
            className="flex-1 bg-zinc-800 border border-white/5 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFD300]/50"
          />
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[0.625rem] text-zinc-400 font-medium">
                {searchIndex + 1}/{searchResults.length}
              </span>
              <button
                onClick={() => setSearchIndex(i => Math.max(0, i - 1))}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 active:scale-90"
              >
                <ChevronUp size="1rem" />
              </button>
              <button
                onClick={() => setSearchIndex(i => Math.min(searchResults.length - 1, i + 1))}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 active:scale-90"
              >
                <ChevronDown size="1rem" />
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
              setSearchIndex(0);
            }}
            className="text-zinc-400 active:scale-90"
          >
            <X size="1.125rem" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 no-scrollbar">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full border border-white/5">
            <Shield size="0.625rem" className="text-[#FFD300]" />
            <span className="text-[0.5rem] font-black uppercase tracking-widest text-zinc-400">Conexão Segura</span>
          </div>
        </div>
        {chat.messages.map((msg, i) => {
          const isMe = msg.senderId !== chat.participantId;
          const prevMsg = i > 0 ? chat.messages[i - 1] : null;
          const prevTime = prevMsg
            ? new Date(prevMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
          const curTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const sameSender = prevMsg?.senderId === msg.senderId;
          const sameTime = prevTime === curTime && sameSender;
          return (
            <div key={msg.id} ref={el => setMessageRef(msg.id, el)}>
              <MessageBubble
                msg={msg}
                isMe={isMe}
                currentUserId={currentUserId}
                onReact={handleReact}
                onDelete={handleDelete}
                searchQuery={searchQuery || undefined}
                showTimestamp={!sameTime}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Locked bar */}
      {isFriend ? (
        <div
          className="shrink-0 px-4 pt-4 bg-[#0A0A0A] border-t border-white/5"
          style={{
            paddingBottom:
              keyboardOffset > 0 ? `${keyboardOffset + 16}px` : 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Mensagem..."
              className="flex-1 bg-zinc-900/80 border border-white/5 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#FFD300]/50 shadow-inner"
            />
            <button
              aria-label="Enviar"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-14 h-14 bg-[#FFD300] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#FFD300]/10 disabled:opacity-40"
            >
              <Send size="1.25rem" fill="currentColor" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="shrink-0 px-4 py-5 bg-[#0A0A0A] border-t border-white/5"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/8 rounded-2xl px-4 py-3">
            <Shield size="1rem" className="text-zinc-400 shrink-0" />
            <p className="text-zinc-400 text-xs leading-snug flex-1">
              Adicione <span className="text-zinc-300 font-semibold">{participantNome}</span> como amigo para enviar
              mensagens.
            </p>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {showProfileModal && (
        <div className="absolute inset-0 z-[300] bg-black animate-in slide-in-from-bottom duration-500">
          <button
            onClick={() => setShowProfileModal(false)}
            className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white z-[310] active:scale-90"
          >
            <X size="1.25rem" />
          </button>
          <PublicProfilePreviewView
            profile={participant}
            onBack={() => setShowProfileModal(false)}
            friendshipStatus={friendships[chat.participantId] || 'NONE'}
            onRequestFriend={onRequestFriend}
            onCancelRequest={onCancelRequest}
            onRemoveFriend={onRemoveFriend}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="absolute inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-base mb-2">Apagar mensagem?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Esta ação não pode ser desfeita. A mensagem será removida para todos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-zinc-800 border border-white/10 rounded-2xl text-zinc-300 text-sm font-bold active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 rounded-2xl text-white text-sm font-bold active:scale-95 transition-transform"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        tipo="CHAT"
        alvoUserId={chat.participantId}
        alvoNome={participantNome}
        showBlockOption
        onSuccess={msg => globalToast(msg.includes('Erro') ? 'erro' : 'sucesso', msg)}
      />

      {/* Fechar menu ao clicar fora */}
      {showChatMenu && <div className="absolute inset-0 z-40" onClick={() => setShowChatMenu(false)} />}
    </div>
  );
};
