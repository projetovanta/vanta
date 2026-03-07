import React, { useEffect, useState, useMemo } from 'react';
import { Check, X, Star, Crown, Lock, UserPlus, Globe, Cake } from 'lucide-react';
import { Evento, Membro } from '../../types';
import { TYPOGRAPHY } from '../../constants';
import { getMinPrice } from '../../utils';
import { openCheckoutUrl } from '../../utils/platform';
import { EventHeader } from './components/EventHeader';
import { EventInfo } from './components/EventInfo';
import { EventFooter } from './components/EventFooter';
import { EventSocialProof } from './components/EventSocialProof';
import { PresencaConfirmationModal } from './components/PresencaConfirmationModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { useAuthStore } from '../../stores/authStore';
import { useSocialStore } from '../../stores/socialStore';
import { useChatStore } from '../../stores/chatStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useExtrasStore } from '../../stores/extrasStore';
import { eventosAdminService } from '../../features/admin/services/eventosAdminService';
import { reviewsService } from '../../features/admin/services/reviewsService';
import { clubeService } from '../../features/admin/services/clubeService';
import { MaisVantaReservaModal } from './components/MaisVantaReservaModal';
import ReviewModal from '../../components/ReviewModal';
import { ComemoracaoFormView } from '../community/ComemoracaoFormView';
import { trackEventOpen } from '../../services/analyticsService';

interface EventDetailViewProps {
  evento: Evento;
  onBack: () => void;
  onBuy: (evento: Evento, variacaoId?: string) => void;
  onConfirmarPresenca: (evento: Evento) => boolean | void;
  onMemberClick: (membro: Membro) => void;
  onComunidadeClick?: (id: string) => void;
  onSuccess?: (message: string) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  evento,
  onBack,
  onBuy,
  onConfirmarPresenca,
  onMemberClick,
  onComunidadeClick,
  onSuccess,
}) => {
  const profile = useAuthStore(s => s.profile);
  const mutualFriends = useSocialStore(s => s.mutualFriends);
  const sendMessage = useChatStore(s => s.sendMessage);
  const hasTicket = useTicketsStore(s => s.myTickets.some(t => t.eventoId === evento.id));
  const hasPresenca = useTicketsStore(s => s.myPresencas.includes(evento.id));
  const isFavorited = useExtrasStore(s => s.savedEvents.includes(evento.id));
  const toggleFavorito = useExtrasStore(s => s.toggleFavorito);
  const onToggleFavorite = () => toggleFavorito(evento.id);
  const [showPresencaModal, setShowPresencaModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVariacaoSheet, setShowVariacaoSheet] = useState(false);
  const [selectedVariacaoId, setSelectedVariacaoId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMaisVantaModal, setShowMaisVantaModal] = useState(false);
  const [showComemoracao, setShowComemoracao] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ media: number; count: number }>({ media: 0, count: 0 });

  const eventoAdmin = useMemo(() => eventosAdminService.getEvento(evento.id), [evento.id]);
  const variacoesDisponiveis = useMemo(() => {
    if (!eventoAdmin) return [];
    const loteAtivo = eventoAdmin.lotes.find(l => l.ativo) ?? eventoAdmin.lotes[eventoAdmin.lotes.length - 1];
    return loteAtivo?.variacoes ?? [];
  }, [eventoAdmin]);

  const minPrice = getMinPrice(evento);

  // MAIS VANTA — tier invisível ao membro
  const temLotesMV = useMemo(() => clubeService.temBeneficio(evento.id), [evento.id]);
  const loteMV = useMemo(
    () => (profile?.id ? clubeService.getLoteParaTier(evento.id, profile.id) : null),
    [evento.id, profile?.id],
  );
  const isMembro = useMemo(() => (profile?.id ? clubeService.isMembro(profile.id) : false), [profile?.id]);
  const temDivida = useMemo(() => (profile?.id ? clubeService.temDividaSocial(profile.id) : false), [profile?.id]);
  const estaBloqueado = useMemo(() => (profile?.id ? clubeService.estaBloqueado(profile.id) : false), [profile?.id]);
  const vagasRestantes = loteMV ? loteMV.quantidade - loteMV.reservados : 0;
  const eventoComunidadeId = evento.comunidade?.id;
  const eventoCidade = evento.cidade;
  const passportStatus = useMemo(() => {
    if (!profile?.id || !eventoCidade) return 'APROVADO' as const; // sem cidade = liberar
    return clubeService.getPassportStatus(profile.id, eventoCidade);
  }, [profile?.id, eventoCidade]);
  const passportOk = passportStatus === 'APROVADO';

  const handleReservarMV = async (_comAcompanhante: boolean) => {
    if (!loteMV || !profile?.id) return;
    const result = await clubeService.reservar(loteMV.id, evento.id, profile.id);
    if (result) {
      onSuccess?.('Reserva confirmada! Lembre-se da contrapartida.');
      setShowMaisVantaModal(false);
    } else {
      onSuccess?.('Não foi possível reservar. Verifique os requisitos.');
    }
  };

  // Analytics: track event open
  const currentUserId = useAuthStore(s => s.currentAccount.id);
  useEffect(() => {
    trackEventOpen(currentUserId, evento.id);
  }, [currentUserId, evento.id]);

  // Carrega reviews do evento
  const isPast = new Date(evento.dataReal + 'T23:59:59-03:00') < new Date();
  useEffect(() => {
    if (isPast) {
      reviewsService.getMediaEvento(evento.id).then(setReviewStats);
    }
  }, [evento.id, isPast]);

  const isNextDay =
    evento.horarioFim && parseInt(evento.horarioFim.replace(':', '')) < parseInt(evento.horario.replace(':', ''));

  const handlePresencaClick = () => {
    if (onConfirmarPresenca(evento) === false) return; // bloqueado pelo gatekeeper (guest)
    setShowPresencaModal(true);
  };

  const handleBuyClick = () => {
    if (evento.urlIngressos) {
      window.open(evento.urlIngressos, '_blank', 'noopener');
      return;
    }
    openCheckoutUrl(evento.id);
  };

  const handleConfirmarCompra = () => {
    if (!selectedVariacaoId) return;
    onBuy(evento, selectedVariacaoId);
    setShowVariacaoSheet(false);
    setSelectedVariacaoId(null);
  };

  const fecharSheet = () => {
    setShowVariacaoSheet(false);
    setSelectedVariacaoId(null);
  };

  const handleSendInvites = (friendIds: string[]) => {
    const message = `${profile.nome} confirmou presença em ${evento.titulo}! Que tal ir junto? https://maisvanta.com/event/${evento.id}`;
    friendIds.forEach(id => sendMessage(id, message));
    onSuccess?.(
      `${friendIds.length} convite${friendIds.length !== 1 ? 's' : ''} enviado${friendIds.length !== 1 ? 's' : ''} com sucesso!`,
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0a] animate-in slide-in-from-right duration-300 z-50 overflow-hidden">
      {/* Status bar guard — protege conteúdo de ficar atrás do notch/Dynamic Island */}
      <div
        className="absolute top-0 inset-x-0 z-30 pointer-events-none"
        style={{
          height: '1rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        }}
      />
      {/* Scroll container */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero — foto 4:5 sticky atrás */}
        <EventHeader
          evento={evento}
          onBack={onBack}
          onShareSuccess={onSuccess}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
        />

        {/* Content card — sobe por cima da foto */}
        <div className="relative z-10 -mt-8 bg-[#0a0a0a] rounded-t-[2rem] px-6 pt-6 pb-32 space-y-8">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-2" />
          <EventSocialProof
            eventoId={evento.id}
            totalConfirmados={evento.membrosConfirmados}
            onMemberClick={onMemberClick}
          />
          <EventInfo evento={evento} isNextDay={!!isNextDay} onComunidadeClick={onComunidadeClick} />
          <div>
            <h3 style={TYPOGRAPHY.sectionKicker} className="mb-3">
              Sobre o Evento
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light break-words">{evento.descricao}</p>
          </div>

          {/* Comemorar aqui */}
          {!isPast && eventoComunidadeId && (
            <button
              onClick={() => setShowComemoracao(true)}
              className="w-full py-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
            >
              <Cake size={16} className="text-purple-400" />
              <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">Comemorar aqui</span>
            </button>
          )}

          {/* MAIS VANTA — Benefício Influência (tier invisível) */}
          {temLotesMV && !isPast && (
            <div className="bg-gradient-to-b from-[#FFD300]/5 to-transparent border border-[#FFD300]/15 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-[#FFD300]" />
                <h3 className="text-[#FFD300] font-black text-xs uppercase tracking-widest">MAIS VANTA</h3>
              </div>
              {loteMV?.descricao && <p className="text-zinc-300 text-sm line-clamp-3">{loteMV.descricao}</p>}
              {loteMV && vagasRestantes > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-zinc-500 text-[10px]">
                    {vagasRestantes} vaga{vagasRestantes !== 1 ? 's' : ''}
                  </span>
                  {loteMV.acompanhantes > 0 && (
                    <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                      <UserPlus size={9} /> +{loteMV.acompanhantes} acompanhante{loteMV.acompanhantes !== 1 ? 's' : ''}
                    </span>
                  )}
                  {loteMV.tipoAcesso && loteMV.tipoAcesso !== 'Pista' && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#FFD300]/15 text-[#FFD300]">
                      {loteMV.tipoAcesso}
                    </span>
                  )}
                </div>
              )}

              {!isMembro ? (
                <p className="text-zinc-500 text-[10px] italic">
                  Você não faz parte do Clube MAIS VANTA. Solicite entrada pelo seu perfil.
                </p>
              ) : estaBloqueado ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <Lock size={12} className="text-red-400 shrink-0" />
                  <span className="text-red-400 text-[10px] font-bold">Você está temporariamente bloqueado</span>
                </div>
              ) : temDivida ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <Lock size={12} className="text-red-400 shrink-0" />
                  <span className="text-red-400 text-[10px] font-bold">
                    Poste o conteúdo pendente antes de fazer novas reservas
                  </span>
                </div>
              ) : !loteMV || vagasRestantes <= 0 ? (
                <div className="flex items-center gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <Lock size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-zinc-500 text-[10px]">Este evento não oferece benefício para o seu perfil</span>
                </div>
              ) : !passportOk ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <Globe size={12} className="text-purple-400 shrink-0" />
                    <span className="text-purple-400 text-[10px] font-bold">
                      {passportStatus === 'PENDENTE'
                        ? 'Seu passaporte para esta cidade está em análise'
                        : 'Você precisa de acesso nesta cidade'}
                    </span>
                  </div>
                  {passportStatus !== 'PENDENTE' && profile?.id && eventoCidade && (
                    <button
                      onClick={async () => {
                        try {
                          await clubeService.solicitarPassport(profile.id, eventoCidade);
                          onSuccess?.('Solicitação de passaporte enviada!');
                        } catch {
                          onSuccess?.('Erro ao solicitar passaporte');
                        }
                      }}
                      className="w-full py-2.5 border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                    >
                      Solicitar Acesso Nesta Cidade
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowMaisVantaModal(true)}
                  className="w-full py-3 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
                >
                  Reservar Experiência
                </button>
              )}
            </div>
          )}

          {/* Avaliações — só para eventos passados */}
          {isPast && (
            <div>
              <h3 style={TYPOGRAPHY.sectionKicker} className="mb-3">
                Avaliações
              </h3>
              {reviewStats.count > 0 ? (
                <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        size={16}
                        fill={n <= Math.round(reviewStats.media) ? '#FFD300' : 'transparent'}
                        stroke={n <= Math.round(reviewStats.media) ? '#FFD300' : '#52525b'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-white text-sm font-bold">{reviewStats.media.toFixed(1)}</span>
                  <span className="text-zinc-500 text-xs">
                    ({reviewStats.count} {reviewStats.count === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              ) : (
                <p className="text-zinc-600 text-xs">Nenhuma avaliação ainda.</p>
              )}
              {hasTicket && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="mt-3 w-full py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-white text-xs font-bold active:bg-white/5 transition-all"
                >
                  Avaliar Evento
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <EventFooter
        evento={evento}
        minPrice={minPrice}
        hasTicket={hasTicket}
        hasPresenca={hasPresenca}
        onBuy={handleBuyClick}
        onConfirmarPresenca={handlePresencaClick}
      />

      <PresencaConfirmationModal
        isOpen={showPresencaModal}
        onClose={() => setShowPresencaModal(false)}
        evento={evento}
        userName={profile.nome}
        onInviteFriends={() => {
          setShowPresencaModal(false);
          setShowInviteModal(true);
        }}
      />

      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        friends={mutualFriends}
        evento={evento}
        onSendInvite={handleSendInvites}
      />

      {showVariacaoSheet && (
        <div className="absolute inset-0 z-[60] flex items-end" role="presentation" onClick={fecharSheet}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[#111111] border-t border-white/10 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={fecharSheet}
              className="absolute top-5 right-5 p-1.5 text-zinc-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
            <p style={TYPOGRAPHY.sectionKicker} className="mb-4">
              Escolha seu ingresso
            </p>
            <div className="space-y-2 mb-5">
              {variacoesDisponiveis.map(v => {
                const areaLabel = v.area === 'OUTRO' ? v.areaCustom || 'Outro' : v.area;
                const generoLabel = v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex';
                const isSelected = selectedVariacaoId === v.id;
                const esgotada = v.vendidos >= v.limite;
                return (
                  <button
                    key={v.id}
                    onClick={() => !esgotada && setSelectedVariacaoId(v.id)}
                    disabled={esgotada}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      esgotada
                        ? 'bg-zinc-900/30 border-white/5 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'bg-[#FFD300]/10 border-[#FFD300]/40 active:scale-[0.98]'
                          : 'bg-zinc-900/50 border-white/5 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected && !esgotada ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
                        }`}
                      >
                        {isSelected && !esgotada && <Check size={10} className="text-black" strokeWidth={3} />}
                      </div>
                      <p className={`text-sm font-bold ${isSelected && !esgotada ? 'text-white' : 'text-zinc-300'}`}>
                        {areaLabel} · {generoLabel}
                      </p>
                      {esgotada && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          Esgotado
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-black text-base ${isSelected && !esgotada ? 'text-[#FFD300]' : 'text-zinc-400'}`}
                    >
                      R$ {v.valor.toLocaleString('pt-BR')}
                    </p>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleConfirmarCompra}
              disabled={!selectedVariacaoId}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
            >
              Confirmar compra
            </button>
          </div>
        </div>
      )}

      {loteMV && (
        <MaisVantaReservaModal
          isOpen={showMaisVantaModal}
          onClose={() => setShowMaisVantaModal(false)}
          lote={loteMV}
          eventoNome={evento.titulo}
          venueName={evento.comunidade?.nome ?? evento.local}
          onConfirmar={handleReservarMV}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          eventoId={evento.id}
          eventoNome={evento.titulo}
          userId={profile.id}
          onClose={() => {
            setShowReviewModal(false);
            reviewsService.getMediaEvento(evento.id).then(setReviewStats);
          }}
        />
      )}

      {showComemoracao && eventoComunidadeId && (
        <div className="absolute inset-0 z-[110]">
          <ComemoracaoFormView
            comunidadeId={eventoComunidadeId}
            comunidadeNome={evento.comunidade?.nome ?? evento.local}
            eventoId={evento.id}
            eventoNome={evento.titulo}
            onBack={() => setShowComemoracao(false)}
          />
        </div>
      )}
    </div>
  );
};
