import React, { useRef, useEffect, useState, useMemo } from 'react';
import { X, Bell, Check, UserCheck, UserX, Gift, Star, UserCog, Crown, Building2, Wallet } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { OptimizedImage } from '../OptimizedImage';
import { Notificacao, Membro } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { eventosAdminService } from '../../features/admin/services/eventosAdminService';
import { useAuthStore } from '../../stores/authStore';
import { useSocialStore } from '../../stores/socialStore';
import { useTicketsStore } from '../../stores/ticketsStore';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationAction: (notif: Notificacao) => void;
  onMemberClick?: (member: any) => void;
}

type NotificationFilter = 'TODAS' | 'SOCIAL' | 'EVENTOS' | 'INGRESSOS';

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onNotificationAction,
  onMemberClick,
}) => {
  const notifications = useAuthStore(s => s.notifications);
  const onMarkAllAsRead = useAuthStore(s => s.markAllNotificationsAsRead);
  const handleAcceptFriend = useSocialStore(s => s.handleAcceptFriend);
  const handleDeclineFriend = useSocialStore(s => s.handleDeclineFriend);
  const cortesiasPendentes = useTicketsStore(s => s.cortesiasPendentes);
  const aceitarCortesiaPendente = useTicketsStore(s => s.aceitarCortesiaPendente);
  const recusarCortesiaPendente = useTicketsStore(s => s.recusarCortesiaPendente);

  const onAcceptFriend = (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (notif?.tipo === 'FRIEND_REQUEST' || notif?.tipo === 'AMIGO') handleAcceptFriend(notif.link);
  };
  const onDeclineFriend = (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (notif?.tipo === 'FRIEND_REQUEST' || notif?.tipo === 'AMIGO') handleDeclineFriend(notif.link);
  };
  const onAcceptCortesia = (eventoId: string) => {
    const cp = cortesiasPendentes.find(c => c.eventoId === eventoId);
    if (cp) void aceitarCortesiaPendente(cp.id);
  };
  const onDeclineCortesia = (eventoId: string) => {
    const cp = cortesiasPendentes.find(c => c.eventoId === eventoId);
    if (cp) void recusarCortesiaPendente(cp.id);
  };
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('TODAS');
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [showDeclineSuccess, setShowDeclineSuccess] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Cache de profiles (foto + nome) carregados do Supabase
  const [profileCache, setProfileCache] = useState<Record<string, { nome: string; foto: string }>>({});
  // Cache de fotos de eventos
  const [eventPhotoCache, setEventPhotoCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && listRef.current) listRef.current.scrollTop = 0;
  }, [isOpen]);

  // Buscar profiles de IDs de notificações de amizade
  useEffect(() => {
    if (!isOpen) return;
    const friendTypes = new Set(['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'AMIGO', 'ANIVERSARIO']);
    const profileIds = notifications
      .filter(n => friendTypes.has(n.tipo) && n.link && !profileCache[n.link])
      .map(n => n.link);
    const uniqueIds = Array.from(new Set<string>(profileIds));
    if (uniqueIds.length === 0) return;

    supabase
      .from('profiles')
      .select('id, nome, avatar_url')
      .in('id', uniqueIds)
      .then(
        ({ data }) => {
          if (!data) return;
          setProfileCache(prev => {
            const next = { ...prev };
            data.forEach((p: { id: string; nome: string; avatar_url: string | null }) => {
              next[p.id] = { nome: p.nome || 'Usuário', foto: p.avatar_url || '' };
            });
            return next;
          });
        },
        () => {
          /* audit-ok */
        },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, notifications]);

  // Buscar fotos de eventos referenciados em notificações
  useEffect(() => {
    if (!isOpen) return;
    const eventTypes = new Set(['EVENTO', 'SISTEMA']);
    const eventIds = notifications
      .filter(n => eventTypes.has(n.tipo) && n.link && !eventPhotoCache[n.link])
      .map(n => n.link);
    const uniqueIds = Array.from(new Set<string>(eventIds));
    if (uniqueIds.length === 0) return;

    uniqueIds.forEach(id => {
      const ev = eventosAdminService.getEvento(id);
      if (ev?.foto) {
        setEventPhotoCache(prev => ({ ...prev, [id]: ev.foto }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, notifications]);

  const handleAccept = (id: string) => {
    setAcceptingIds(prev => new Set(prev).add(id));
    onAcceptFriend?.(id);
    setTimeout(() => {
      setAcceptingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRemovingIds(prev => new Set(prev).add(id));
      setTimeout(() => {
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 400);
    }, 300);
  };

  const handleDecline = (id: string) => {
    onDeclineFriend?.(id);
    setShowDeclineSuccess(true);
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 500);
  };

  const filteredNotifications = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const baseFilter = notifications.filter(n => {
      if (n.tipo === 'FRIEND_REQUEST' || n.tipo === 'CORTESIA_PENDENTE' || n.tipo === 'REVIEW') return true;
      if (!n.timestamp) return true;
      const notificationDate = new Date(n.timestamp);
      return notificationDate > sevenDaysAgo;
    });

    const SOCIAL_TYPES = new Set(['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'MENSAGEM_NOVA', 'AMIGO']);
    const EVENTO_TYPES = new Set([
      'EVENTO',
      'ANIVERSARIO',
      'REVIEW',
      'PEDIR_REVIEW',
      'EVENTO_APROVADO',
      'EVENTO_RECUSADO',
      'EVENTO_PENDENTE',
      'EVENTO_CANCELADO',
      'EVENTO_FINALIZADO',
      'ALERTA_LOTACAO',
      'EVENTO_PRIVADO_NOVA',
      'EVENTO_PRIVADO_APROVADO',
      'EVENTO_PRIVADO_RECUSADO',
      'COMEMORACAO_NOVA',
      'COMEMORACAO_APROVADA',
      'COMEMORACAO_RECUSADA',
      'COMEMORACAO_FAIXA_ATINGIDA',
    ]);
    const INGRESSO_TYPES = new Set([
      'SISTEMA',
      'CORTESIA_PENDENTE',
      'TRANSFERENCIA_PENDENTE',
      'COMPRA_CONFIRMADA',
      'INGRESSO',
      'COTA_RECEBIDA',
    ]);

    switch (activeFilter) {
      case 'SOCIAL':
        return baseFilter.filter(n => SOCIAL_TYPES.has(n.tipo));
      case 'EVENTOS':
        return baseFilter.filter(n => EVENTO_TYPES.has(n.tipo));
      case 'INGRESSOS':
        return baseFilter.filter(n => INGRESSO_TYPES.has(n.tipo));
      default:
        return baseFilter;
    }
  }, [activeFilter, notifications]);

  if (!isOpen) return null;

  const getIcon = (notif: Notificacao) => {
    // Notificações de amizade — foto do profile Supabase
    if (
      notif.tipo === 'FRIEND_REQUEST' ||
      notif.tipo === 'FRIEND_ACCEPTED' ||
      notif.tipo === 'AMIGO' ||
      notif.tipo === 'ANIVERSARIO'
    ) {
      const cached = profileCache[notif.link];
      if (cached?.foto) {
        return (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
            <OptimizedImage src={cached.foto} width={32} alt={cached.nome} className="w-full h-full object-cover" />
          </div>
        );
      }
      if (notif.tipo === 'ANIVERSARIO') return <Bell size="0.875rem" className="text-pink-400" />;
      return (
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 text-[0.625rem] font-bold">
          {(notif.titulo?.[0] || '?').toUpperCase()}
        </div>
      );
    }

    // Notificações SISTEMA com links especiais (deep link de campanhas)
    if (notif.tipo === 'SISTEMA') {
      if (notif.link === 'EDIT_PROFILE') return <UserCog size="0.875rem" className="text-blue-400" />;
      if (notif.link === 'CLUBE') return <Crown size="0.875rem" className="text-[#FFD300]" />;
      if (notif.link === 'WALLET') return <Wallet size="0.875rem" className="text-emerald-400" />;
      if (notif.link.startsWith('comunidade:')) return <Building2 size="0.875rem" className="text-purple-400" />;
      // SISTEMA com eventId no link → foto do evento
      const sysEventPhoto = eventPhotoCache[notif.link];
      if (sysEventPhoto) {
        return (
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10">
            <OptimizedImage src={sysEventPhoto} width={32} alt={notif.titulo} className="w-full h-full object-cover" />
          </div>
        );
      }
      return <Bell size="0.875rem" className="text-[#FFD300]" />;
    }

    // Notificações de evento — foto real do evento
    if (notif.tipo === 'EVENTO') {
      const eventPhoto = eventPhotoCache[notif.link];
      if (eventPhoto) {
        return (
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10">
            <OptimizedImage src={eventPhoto} width={32} alt={notif.titulo} className="w-full h-full object-cover" />
          </div>
        );
      }
      return <Bell size="0.875rem" className="text-[#FFD300]" />;
    }

    if (notif.tipo === 'MAIS_VANTA') {
      return <Crown size="0.875rem" className="text-[#FFD300]" />;
    }

    if (notif.tipo === 'CORTESIA_PENDENTE') {
      return <Gift size="0.875rem" className="text-emerald-400" />;
    }

    if (notif.tipo === 'REVIEW') {
      return <Star size="0.875rem" className="text-[#FFD300]" />;
    }

    return <Bell size="0.875rem" className="text-zinc-400" />;
  };

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full z-[120] animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/40" role="presentation" onClick={onClose} />
        <div className="absolute top-[4.5rem] right-4 left-4 w-auto max-w-xs ml-auto animate-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top-right">
          <div
            className="rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            style={{
              background: 'rgba(30,30,30,0.7)',
              WebkitBackdropFilter: 'blur(80px) saturate(1.8)',
              backdropFilter: 'blur(80px) saturate(1.8)',
              isolation: 'isolate',
            }}
          >
            <div className="p-5 rounded-[2.5rem] overflow-hidden">
              <div className="flex justify-between items-center mb-5">
                <h4 style={TYPOGRAPHY.uiLabel} className="text-[0.5rem] opacity-40">
                  Notificações
                </h4>
                <button
                  onClick={onClose}
                  className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity -mr-2"
                >
                  <X size="0.875rem" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 border-b border-white/10 mb-4 pb-3">
                {(
                  [
                    ['TODAS', 'Todas'],
                    ['SOCIAL', 'Social'],
                    ['EVENTOS', 'Eventos'],
                    ['INGRESSOS', 'Ingressos'],
                  ] as const
                ).map(([filter, label], idx) => (
                  <React.Fragment key={filter}>
                    {idx > 0 && <span className="text-[#FFD300]/40 text-[0.375rem] shrink-0">●</span>}
                    <button
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2 py-1.5 text-[0.5rem] font-black uppercase tracking-wider transition-all rounded-lg ${activeFilter === filter ? 'text-[#FFD300] bg-[#FFD300]/10' : 'text-zinc-400'}`}
                    >
                      {label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <div ref={listRef} className="space-y-2 max-h-[21.875rem] overflow-y-auto no-scrollbar pb-2">
                {filteredNotifications.map(notif => {
                  if (removingIds.has(notif.id)) return null;

                  const isFriendRequest = notif.tipo === 'FRIEND_REQUEST';
                  const isCortesiaPendente = notif.tipo === 'CORTESIA_PENDENTE';
                  const cachedProfile = profileCache[notif.link];
                  const isAccepting = acceptingIds.has(notif.id);

                  const handleContentClick = (e: React.MouseEvent) => {
                    if (cachedProfile && onMemberClick) {
                      e.stopPropagation();
                      onMemberClick({ id: notif.link, nome: cachedProfile.nome, foto: cachedProfile.foto } as Membro);
                      onClose();
                    } else if (!isFriendRequest) {
                      onNotificationAction(notif);
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={handleContentClick}
                      className={`flex flex-col p-2.5 bg-white/[0.02] rounded-2xl border border-white/5 transition-all cursor-pointer active:bg-[#FFD300]/10 ${isAccepting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 bg-zinc-800/80 rounded-xl shrink-0 flex items-center justify-center min-w-[2rem] min-h-[2rem]">
                          {getIcon(notif)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h5
                              style={TYPOGRAPHY.uiBody}
                              className={`text-[0.6875rem] font-bold truncate pr-2 ${isFriendRequest ? 'text-[#FFD300]' : ''}`}
                            >
                              {notif.titulo}
                            </h5>
                            {!notif.lida && (
                              <div className="w-1.5 h-1.5 bg-[#FFD300] rounded-full shadow-[0_0_8px_#FFD300] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[0.5625rem] leading-tight text-zinc-400 line-clamp-2 italic">
                            {notif.mensagem}
                          </p>
                        </div>
                      </div>
                      {isFriendRequest && (
                        <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-white/5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleAccept(notif.id);
                            }}
                            disabled={isAccepting}
                            className="flex-1 py-2 bg-[#FFD300] text-black text-[0.5625rem] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
                          >
                            {isAccepting ? (
                              <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                              <>
                                <UserCheck size="0.625rem" /> Aceitar
                              </>
                            )}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDecline(notif.id);
                            }}
                            className="flex-1 py-2 bg-zinc-800 text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider rounded-lg border border-white/5 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                          >
                            <UserX size="0.625rem" /> Recusar
                          </button>
                        </div>
                      )}
                      {isCortesiaPendente && (
                        <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-white/5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onAcceptCortesia?.(notif.link);
                              setRemovingIds(prev => new Set(prev).add(notif.id));
                            }}
                            className="flex-1 py-2 bg-emerald-500 text-black text-[0.5625rem] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform"
                          >
                            <Gift size="0.625rem" /> Aceitar
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onDeclineCortesia?.(notif.link);
                              setRemovingIds(prev => new Set(prev).add(notif.id));
                            }}
                            className="flex-1 py-2 bg-zinc-800 text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider rounded-lg border border-white/5 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                          >
                            <X size="0.625rem" /> Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => {
                onMarkAllAsRead?.();
                onClose();
              }}
              className="w-full py-4 bg-black/40 border-t border-white/5 flex items-center justify-center space-x-2 active:bg-white/5 transition-colors"
            >
              <Check size="0.625rem" className="text-zinc-400" />
              <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-zinc-400">Marcar lidas</span>
            </button>
          </div>
        </div>
      </div>
      {showDeclineSuccess && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-[85%] text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <UserX size="1.75rem" className="text-zinc-400" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl mb-3">
              Pedido Recusado
            </h2>
            <p className="text-zinc-400 text-[0.625rem] uppercase font-bold tracking-widest mb-8 leading-relaxed">
              A solicitação de amizade foi removida.
            </p>
            <button
              onClick={() => setShowDeclineSuccess(false)}
              className="w-full py-4 bg-zinc-800 text-white font-bold text-[0.625rem] uppercase rounded-xl active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
