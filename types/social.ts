// Tipo unificado para status de amizade entre membros
export type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';

export interface Mensagem {
  id: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO 8601
  isRead: boolean;
  readAt?: string;
  deletedAt?: string;
  reactions: Array<{ emoji: string; userId: string }>;
}

export interface Chat {
  id: string; // ID do participante (para garantir canal único por pessoa)
  participantId: string;
  participantNome?: string;
  participantFoto?: string; // cache local
  lastMessage: string;
  lastMessageTime: string; // ISO 8601
  unreadCount: number;
  messages: Mensagem[];
}

// Tipo de Online User
interface OnlineUser {
  id: string;
  nome: string;
  foto: string;
}
