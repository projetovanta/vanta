import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProfilePreviewControls } from '../../components/Profile/ProfilePreviewControls';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Instagram,
  Lock,
  Eye,
  Image as ImageIcon,
  Cake,
  Clock,
  Mail,
  Calendar,
  Sparkles,
  Phone,
  MapPin,
  User,
  UserMinus,
  Trophy,
  PartyPopper,
  Compass,
  Users,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { Membro, PrivacidadeOpcao } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { achievementsService, Achievement, Badge, NIVEL_CONFIG } from '../../services/achievementsService';
import { useSocialStore } from '../../stores/socialStore';
import { moodService, MoodData } from '../../services/moodService';

export const PublicProfilePreviewView: React.FC<{
  profile: Membro;
  onBack: () => void;
  isOwner?: boolean;
  onOpenChat?: (m: Membro) => void;
  profilePreviewStatus?: 'PUBLIC' | 'FRIENDS';
  setProfilePreviewStatus?: (status: 'PUBLIC' | 'FRIENDS') => void;
  /** Quando passado externamente, usa esse friendshipStatus em vez de ler da store */
  friendshipStatusOverride?: string;
  onRequestFriendOverride?: (id: string) => void;
}> = ({
  profile,
  onBack,
  isOwner = false,
  onOpenChat,
  profilePreviewStatus,
  setProfilePreviewStatus,
  friendshipStatusOverride,
  onRequestFriendOverride,
}) => {
  const friendships = useSocialStore(s => s.friendships);
  const friendshipStatus = friendshipStatusOverride ?? (friendships[profile.id] || 'NONE');
  const storeRequestFriendship = useSocialStore(s => s.requestFriendship);
  const onRequestFriend = onRequestFriendOverride ?? storeRequestFriendship;
  const onCancelRequest = useSocialStore(s => s.cancelFriendshipRequest);
  const onRemoveFriend = useSocialStore(s => s.removeFriend);
  const onAcceptFriend = useSocialStore(s => s.handleAcceptFriend);
  const onDeclineFriend = useSocialStore(s => s.handleDeclineFriend);
  const BADGE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
    PartyPopper,
    Compass,
    Users,
    MessageSquare,
  };

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (!profile.id) return;
    let cancelled = false;
    Promise.all([achievementsService.getAchievements(profile.id), achievementsService.getBadges(profile.id)]).then(
      ([ach, bdg]) => {
        if (cancelled) return;
        setAchievements(ach);
        setBadges(bdg);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const currentViewFriendshipStatus = isOwner
    ? profilePreviewStatus === 'FRIENDS'
      ? 'FRIENDS'
      : 'NONE'
    : friendshipStatus;
  const isFriend = currentViewFriendshipStatus === 'FRIENDS';
  const isPendingSent = currentViewFriendshipStatus === 'PENDING_SENT';
  const isPendingReceived = currentViewFriendshipStatus === 'PENDING_RECEIVED';
  const isNone = currentViewFriendshipStatus === 'NONE';

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [showAcceptSuccessModal, setShowAcceptSuccessModal] = useState(false);
  const [showDeclineSuccessModal, setShowDeclineSuccessModal] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mood, setMood] = useState<MoodData | null>(null);

  // Carregar mood do perfil
  useEffect(() => {
    if (!profile.id) return;
    let cancelled = false;
    moodService.getMany([profile.id]).then(moods => {
      if (!cancelled) setMood(moods[profile.id] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.id]);
  const privacy = profile.privacidade;

  const openLightbox = useCallback((photos: string[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  }, []);
  const closeLightbox = useCallback(() => setLightboxPhotos([]), []);

  const isVisible = (config: PrivacidadeOpcao | undefined) => {
    const eff = config || 'TODOS';
    if (eff === 'TODOS') return true;
    if (eff === 'NINGUEM') return false;
    if (eff === 'AMIGOS') return isFriend;
    if (eff === 'AMIGOS_EM_COMUM') return isFriend; // fallback: trata como AMIGOS até implementar grafo de amigos em comum
    return false;
  };

  const PrivateOverlay = () => (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center z-10 border border-white/5 animate-in fade-in duration-500">
      <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 border border-white/10 shadow-2xl">
        <Lock size="1.125rem" className="text-[#FFD300]" />
      </div>
      <p className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-zinc-400">Conteúdo Restrito</p>
      <p className="text-[0.5rem] font-medium text-zinc-400 mt-1">Disponível apenas para amigos</p>
    </div>
  );

  const Section = ({
    title,
    icon: Icon,
    visible,
    children,
    value,
  }: {
    title: string;
    icon: any;
    visible: boolean;
    children?: React.ReactNode;
    value?: string;
  }) => {
    if (!visible) return null;

    return (
      <div className="relative group">
        <div className="space-y-4">
          <div className="flex items-center gap-2 opacity-40">
            <Icon size="0.75rem" className="text-[#FFD300]" />
            <h3 className="text-[0.625rem] font-black uppercase tracking-widest">{title}</h3>
          </div>
          {children || <p className="text-zinc-300 text-sm font-medium">{value || 'Não informado'}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-[#050505] animate-in slide-in-from-bottom-10 duration-500 flex flex-col overflow-hidden">
      {/* Header de Controle de Visualização (Protocolo VANTA) */}
      {isOwner && setProfilePreviewStatus && profilePreviewStatus && (
        <div
          className="shrink-0 z-[200] bg-black/95 backdrop-blur-xl border-b border-white/5 p-4 space-y-4 shadow-2xl"
          style={{ paddingTop: '1rem' }}
        >
          <div className="flex items-center justify-between">
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size="1.125rem" />
            </button>
            <div className="flex items-center gap-2 bg-[#FFD300]/10 px-4 py-1.5 rounded-full border border-[#FFD300]/20">
              <Eye size="0.75rem" className="text-[#FFD300]" />
              <span className="text-[0.5625rem] font-black text-[#FFD300] uppercase tracking-widest">
                Modo Visualização
              </span>
            </div>
            <div className="w-10" />
          </div>
          <ProfilePreviewControls
            profilePreviewStatus={profilePreviewStatus}
            setProfilePreviewStatus={setProfilePreviewStatus}
          />
        </div>
      )}

      {(!isOwner || (isOwner && !setProfilePreviewStatus)) && (
        <div className="shrink-0 p-6 flex items-center" style={{ paddingTop: '1.5rem' }}>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size="1.125rem" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-6 flex flex-col items-center pb-40">
          <div className="relative mb-8">
            <button
              type="button"
              onClick={() => profile.foto && openLightbox([profile.foto], 0)}
              className="w-36 h-36 rounded-full p-[2px] bg-zinc-800 shadow-2xl active:scale-95 transition-transform"
            >
              <div className="w-full h-full rounded-full border-4 border-[#050505] overflow-hidden bg-black">
                <img
                  alt=""
                  loading="lazy"
                  src={profile.foto}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>
          </div>

          <h2 style={TYPOGRAPHY.screenTitle} className="text-3xl mb-1 italic text-center">
            {profile.nome}
          </h2>
          <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-[0.3em] mb-3 opacity-60 text-center">
            Membro Confirmado
          </p>

          {/* Mood badge */}
          {mood && isVisible(privacy?.verMood) && (
            <div className="mb-5 px-3 py-1.5 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 text-center">
              <span className="text-sm">{mood.emoji}</span>
              {mood.text && <span className="text-zinc-300 text-[0.625rem] ml-1">{mood.text}</span>}
            </div>
          )}

          {/* Banner de Solicitação Recebida (Protocolo VANTA) */}
          {!isOwner && isPendingReceived && (
            <div className="w-full max-w-[20rem] mb-8 p-6 bg-zinc-900/50 border border-[#FFD300]/20 rounded-3xl animate-in slide-in-from-top-4 duration-500">
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-center text-[#FFD300] mb-4">
                {profile.nome} enviou uma solicitação
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onAcceptFriend?.(profile.id);
                    setShowAcceptSuccessModal(true);
                  }}
                  className="flex-1 py-3 bg-[#FFD300] text-black text-[0.5625rem] font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => {
                    onDeclineFriend?.(profile.id);
                    setShowDeclineSuccessModal(true);
                  }}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider rounded-xl border border-white/5 active:scale-95 transition-all"
                >
                  Recusar
                </button>
              </div>
            </div>
          )}

          {isOwner && !setProfilePreviewStatus ? (
            <div className="flex flex-col items-center w-full max-w-[20rem] mb-12 gap-3">
              <button
                onClick={onBack}
                className="w-full py-4 rounded-xl font-bold text-[0.625rem] uppercase bg-zinc-900 border border-white/10 text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Pencil size="0.875rem" /> Editar Perfil
              </button>
            </div>
          ) : !isOwner || (isOwner && (profilePreviewStatus === 'PUBLIC' || profilePreviewStatus === 'FRIENDS')) ? (
            <div className="flex flex-col items-center w-full max-w-[20rem] mb-12 gap-3">
              <div className="flex gap-3 w-full">
                {isFriend ? (
                  <>
                    <button
                      onClick={() => !isOwner && setShowUnfriendModal(true)}
                      className="flex-1 py-4 rounded-xl font-bold text-[0.625rem] uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                      <UserCheck size="0.875rem" /> Amigos
                    </button>
                    <button
                      onClick={() => !isOwner && onOpenChat?.(profile)}
                      className={`flex-1 py-4 bg-zinc-900 border border-white/5 text-white rounded-xl font-bold text-[0.625rem] uppercase transition-all ${isOwner ? 'opacity-50 cursor-default' : 'active:scale-95'}`}
                    >
                      Mensagem
                    </button>
                  </>
                ) : isPendingSent ? (
                  <button
                    onClick={() => !isOwner && setShowCancelModal(true)}
                    className="w-full py-4 rounded-xl font-bold text-[0.625rem] uppercase bg-zinc-900 border border-[#FFD300]/30 text-[#FFD300] flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Clock size="0.875rem" /> {isOwner ? 'Adicionar Amigo' : 'Solicitado'}
                  </button>
                ) : isPendingReceived ? null : isNone ? (
                  <button
                    onClick={() => onRequestFriend(profile.id)}
                    className="w-full py-4 rounded-xl font-bold text-[0.625rem] uppercase bg-[#FFD300] text-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <UserPlus size="0.875rem" /> Adicionar Amigo
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="w-full space-y-10">
            {/* Bio Section */}
            {isVisible(privacy?.verBio) && (
              <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size="2.5rem" className="text-[#FFD300]" />
                </div>
                <Section title="Sobre" icon={Eye} visible={true}>
                  <p className="text-zinc-300 text-sm leading-relaxed italic">
                    {profile.biografia || 'Nenhuma biografia disponível.'}
                  </p>
                </Section>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-8 px-2 pb-20">
              <Section title="E-mail" icon={Mail} visible={isVisible(privacy?.verEmail)} value={profile.email} />
              <Section
                title="Instagram"
                icon={Instagram}
                visible={isVisible(privacy?.verInstagram)}
                value={profile.instagram}
              />
              <Section
                title="Aniversário"
                icon={Cake}
                visible={isVisible(privacy?.verAniversario)}
                value={
                  profile.dataNascimento
                    ? new Date(profile.dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
                    : undefined
                }
              />
              <Section
                title="Telefone"
                icon={Phone}
                visible={isVisible(privacy?.verTelefone)}
                value={profile.telefone?.numero ? `(${profile.telefone.ddd}) ${profile.telefone.numero}` : undefined}
              />
              <Section
                title="Localização"
                icon={MapPin}
                visible={isVisible(privacy?.verCidade)}
                value={
                  profile.cidade && profile.estado
                    ? `${profile.cidade}, ${profile.estado}`
                    : profile.estado || undefined
                }
              />
              <Section
                title="Gênero"
                icon={User}
                visible={isVisible(privacy?.verGenero)}
                value={
                  profile.genero === 'MASCULINO' ? 'Masculino' : profile.genero === 'FEMININO' ? 'Feminino' : undefined
                }
              />

              <Section title="Interesses" icon={Sparkles} visible={isVisible(privacy?.verInteresses)}>
                <div className="flex flex-wrap gap-2">
                  {profile.interesses.map(id => (
                    <span
                      key={id}
                      className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-full text-[0.5625rem] font-bold uppercase tracking-wider text-zinc-400"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Eventos Confirmados" icon={Calendar} visible={isVisible(privacy?.verEventos)}>
                <div className="py-4 text-zinc-400 text-[0.625rem] uppercase font-bold tracking-widest italic">
                  Nenhum evento público confirmado
                </div>
              </Section>

              <Section title="Álbum de Fotos" icon={ImageIcon} visible={isVisible(privacy?.verAlbum)}>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }, (_, i) => {
                    const foto = profile.fotos?.[i];
                    const albumPhotos = (profile.fotos ?? []).filter(Boolean);
                    return foto ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(albumPhotos, albumPhotos.indexOf(foto))}
                        className="aspect-square rounded-xl overflow-hidden border border-white/5 active:scale-95 transition-transform"
                      >
                        <img loading="lazy" src={foto} alt="Foto do perfil" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div
                        key={i}
                        className="aspect-square bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center opacity-20"
                      >
                        <ImageIcon size="0.875rem" />
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Conquistas & Badges */}
              {isVisible(privacy?.verConquistas) && (achievements.length > 0 || badges.some(b => b.conquistado)) && (
                <Section title="Conquistas" icon={Trophy} visible={true}>
                  <div className="space-y-4">
                    {achievements.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {achievements.map(ach => {
                          const cfg = NIVEL_CONFIG[ach.nivel];
                          return (
                            <div
                              key={ach.id}
                              className="shrink-0 w-24 bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                            >
                              <div
                                className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0"
                                style={{ borderColor: cfg.cor }}
                              >
                                {ach.comunidadeFoto ? (
                                  <img
                                    loading="lazy"
                                    src={ach.comunidadeFoto}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-800" />
                                )}
                              </div>
                              <p
                                className="text-[0.5rem] font-black uppercase tracking-wider text-center truncate w-full"
                                style={{ color: cfg.cor }}
                              >
                                {cfg.label}
                              </p>
                              <p className="text-[0.5625rem] text-zinc-400 text-center truncate w-full">
                                {ach.comunidadeNome}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {badges.some(b => b.conquistado) && (
                      <div className="flex flex-wrap gap-2">
                        {badges
                          .filter(b => b.conquistado)
                          .map(badge => {
                            const Icon = BADGE_ICONS[badge.icone] || Trophy;
                            return (
                              <div
                                key={badge.id}
                                className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-[#FFD300]/20 rounded-xl"
                              >
                                <Icon size="0.75rem" className="text-[#FFD300]" />
                                <span className="text-[0.5625rem] font-bold text-zinc-300">{badge.nome}</span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cancelar Solicitação */}
      {showCancelModal && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            role="presentation"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.08)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
              <UserMinus size="1.75rem" className="text-[#FFD300]" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Cancelar pedido?
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
              Deseja desfazer a solicitação de amizade enviada para {profile.nome}?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onCancelRequest(profile.id);
                  setShowCancelModal(false);
                }}
                className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Sim, desfazer
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-4 text-zinc-400 font-bold text-[0.625rem] uppercase active:opacity-60 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desfazer Amizade */}
      {showUnfriendModal && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            role="presentation"
            onClick={() => setShowUnfriendModal(false)}
          />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-red-500/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.06)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-xl">
              <UserMinus size="1.75rem" className="text-red-400" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Remover amigo?
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
              Você deixará de ser amigo de {profile.nome}.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onRemoveFriend(profile.id);
                  setShowUnfriendModal(false);
                }}
                className="w-full py-4 bg-red-500 text-white font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Sim, remover
              </button>
              <button
                onClick={() => setShowUnfriendModal(false)}
                className="w-full py-4 text-zinc-400 font-bold text-[0.625rem] uppercase active:opacity-60 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aceite de Amizade */}
      {showAcceptSuccessModal && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowAcceptSuccessModal(false)}
          />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-emerald-500/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.06)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-xl">
              <UserCheck size="1.75rem" className="text-emerald-400" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Conexão Confirmada!
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
              Agora você e {profile.nome} são amigos mútuos.
            </p>
            <button
              onClick={() => setShowAcceptSuccessModal(false)}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Recusa de Pedido */}
      {showDeclineSuccessModal && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowDeclineSuccessModal(false)}
          />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.08)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
              <UserMinus size="1.75rem" className="text-zinc-400" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Pedido Recusado
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">
              A solicitação de {profile.nome} foi removida.
            </p>
            <button
              onClick={() => setShowDeclineSuccessModal(false)}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox ── */}
      {lightboxPhotos.length > 0 && (
        <PhotoLightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </div>
  );
};

// ── PhotoLightbox with pinch-to-zoom ────────────────────────────────────
const PhotoLightbox: React.FC<{
  photos: string[];
  index: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}> = ({ photos, index, onClose, onChangeIndex }) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const translateStart = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (dir: -1 | 1) => {
      const next = index + dir;
      if (next >= 0 && next < photos.length) {
        onChangeIndex(next);
        resetZoom();
      }
    },
    [index, photos.length, onChangeIndex, resetZoom],
  );

  // Pinch-to-zoom handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance.current = Math.hypot(dx, dy);
        lastCenter.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      } else if (e.touches.length === 1 && scale > 1) {
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        translateStart.current = { ...translate };
      }
    },
    [scale, translate],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastDistance.current > 0) {
          const newScale = Math.min(5, Math.max(1, scale * (dist / lastDistance.current)));
          setScale(newScale);
          if (newScale <= 1) setTranslate({ x: 0, y: 0 });
        }
        lastDistance.current = dist;
      } else if (e.touches.length === 1 && dragStart.current && scale > 1) {
        const dx = e.touches[0].clientX - dragStart.current.x;
        const dy = e.touches[0].clientY - dragStart.current.y;
        setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy });
      }
    },
    [scale],
  );

  const onTouchEnd = useCallback(() => {
    lastDistance.current = 0;
    dragStart.current = null;
    if (scale <= 1) resetZoom();
  }, [scale, resetZoom]);

  // Double-tap to zoom
  const lastTap = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (scale > 1) resetZoom();
      else setScale(2.5);
    }
    lastTap.current = now;
  }, [scale, resetZoom]);

  return (
    <div className="absolute inset-0 z-[400] bg-black flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <X size="1.125rem" className="text-white" />
        </button>
        {photos.length > 1 && (
          <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
            {index + 1} / {photos.length}
          </p>
        )}
        <div className="w-10" />
      </div>

      {/* Image */}
      <div
        ref={imgRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        <img
          alt=""
          src={photos[index]}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
          style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {photos.length > 1 && scale <= 1 && (
        <div className="shrink-0 flex items-center justify-center gap-8 pb-8 pt-4">
          <button
            onClick={() => goTo(-1)}
            disabled={index === 0}
            className="w-12 h-12 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-20"
          >
            <ChevronLeft size="1.25rem" className="text-white" />
          </button>
          <button
            onClick={() => goTo(1)}
            disabled={index === photos.length - 1}
            className="w-12 h-12 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-20"
          >
            <ChevronRight size="1.25rem" className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
