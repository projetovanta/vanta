import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  UserPlus,
  UserCheck,
  Calendar,
  ChevronRight,
  X,
  Search,
  Loader2,
  Star,
  PartyPopper,
  Cake,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Evento, Membro, HorarioSemanal, HorarioOverride } from '../../types';
import { vantaService } from '../../services/vantaService';
import { supabase } from '../../services/supabaseClient';
import { communityFollowService } from '../../services/communityFollowService';
import { profileToMembro } from '../../services/authService';
import { reviewsService } from '../../features/admin/services/reviewsService';
import { useAuthStore } from '../../stores/authStore';
import { HorarioPublicDisplay } from '../../components/HorarioPublicDisplay';
import { RestrictedModal } from '../../components/RestrictedModal';
import { EventoPrivadoFormView } from './EventoPrivadoFormView';
import { ComemoracaoFormView } from './ComemoracaoFormView';

interface ComunidadePublicData {
  id: string;
  nome: string;
  foto: string;
  foto_capa: string | null;
  descricao: string;
  cidade: string;
  estado: string | null;
  endereco: string;
  coords: { lat: number; lng: number } | null;
  horario_funcionamento: HorarioSemanal[] | null;
  horario_overrides: HorarioOverride[] | null;
  evento_privado_ativo: boolean;
}

interface ComunidadePublicViewProps {
  comunidadeId: string;
  onBack: () => void;
  onEventClick: (evento: Evento) => void;
  onMemberClick?: (membro: Membro) => void;
  onRequestLogin?: () => void;
  onRequestCadastro?: () => void;
}

export const ComunidadePublicView: React.FC<ComunidadePublicViewProps> = ({
  comunidadeId,
  onBack,
  onEventClick,
  onMemberClick,
  onRequestLogin,
  onRequestCadastro,
}) => {
  const currentAccount = useAuthStore(s => s.currentAccount);
  const userId = currentAccount.role !== 'vanta_guest' ? currentAccount.id || undefined : undefined;
  const [showRestricted, setShowRestricted] = useState(false);
  const [comunidade, setComunidade] = useState<ComunidadePublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [previewFollowers, setPreviewFollowers] = useState<Membro[]>([]);
  const [isFollowerListOpen, setIsFollowerListOpen] = useState(false);
  const [allFollowers, setAllFollowers] = useState<Membro[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [followerSearch, setFollowerSearch] = useState('');
  const [ratingData, setRatingData] = useState<{ media: number; count: number }>({ media: 0, count: 0 });
  const [showEventoPrivado, setShowEventoPrivado] = useState(false);
  const [showComemoracao, setShowComemoracao] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('comunidades')
      .select(
        'id, nome, foto, foto_capa, descricao, cidade, estado, endereco, coords, horario_funcionamento, horario_overrides, evento_privado_ativo',
      )
      .eq('id', comunidadeId)
      .single()
      .then(
        ({ data }) => {
          if (data) setComunidade(data as unknown as ComunidadePublicData);
          setLoading(false);
        },
        () => {
          /* audit-ok */
        },
      );

    vantaService.getEventos().then(all => {
      setProximosEventos(all.filter(e => e.comunidade?.id === comunidadeId));
    });

    // Carrega estado de follow + preview de seguidores (3 primeiros)
    void communityFollowService.getFollowCount(comunidadeId).then(setFollowCount);
    if (userId) {
      void communityFollowService.isFollowing(userId, comunidadeId).then(setIsFollowing);
    }
    void reviewsService.getMediaComunidade(comunidadeId).then(setRatingData);
    // Preview: pegar 3 primeiros seguidores com profile
    (async () => {
      const ids = await communityFollowService.getFollowers(comunidadeId);
      if (ids.length === 0) return;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url, instagram, cidade')
        .in('id', ids.slice(0, 3));
      if (profiles) setPreviewFollowers(profiles.map((r: any) => profileToMembro(r)));
    })();
  }, [comunidadeId, userId]);

  // Carregar todos os seguidores ao abrir a lista
  useEffect(() => {
    if (!isFollowerListOpen || allFollowers.length > 0) return;
    setLoadingFollowers(true);
    (async () => {
      try {
        const ids = await communityFollowService.getFollowers(comunidadeId);
        if (ids.length === 0) {
          setLoadingFollowers(false);
          return;
        }
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url, instagram, cidade')
          .in('id', ids.slice(0, 50));
        setAllFollowers((profiles ?? []).map((r: any) => profileToMembro(r)));
      } catch {
        /* silencioso */
      }
      setLoadingFollowers(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollowerListOpen, comunidadeId]);

  const filteredFollowers = useMemo(() => {
    if (!followerSearch) return allFollowers;
    const q = followerSearch.toLowerCase();
    return allFollowers.filter(m => m.nome.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [allFollowers, followerSearch]);

  const handleToggleFollow = async () => {
    if (!userId) {
      setShowRestricted(true);
      return;
    }
    if (toggling) return;
    setToggling(true);
    if (isFollowing) {
      await communityFollowService.unfollow(userId, comunidadeId);
      setIsFollowing(false);
      setFollowCount(prev => Math.max(0, prev - 1));
    } else {
      await communityFollowService.follow(userId, comunidadeId);
      setIsFollowing(true);
      setFollowCount(prev => prev + 1);
    }
    setToggling(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full bg-[#050505]">
        <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!comunidade) return null;

  return (
    <div className="relative flex flex-col h-full bg-[#050505]">
      {/* Header fixo com safe-area — botão voltar sempre visível */}
      <div
        className="absolute top-0 inset-x-0 z-20 flex items-end px-4 pb-2"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
        }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Cover banner 3:1 */}
        <div className="relative w-full aspect-[3/1] bg-zinc-900 shrink-0">
          {comunidade.foto_capa ? (
            <img loading="lazy" src={comunidade.foto_capa} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950" />
          )}
          {/* Gradient superior — contraste pro botão back */}
          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/50 to-transparent" />
          {/* Gradient inferior — transição suave, preserva ~60% central da foto */}
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#050505] to-transparent" />
        </div>

        {/* Avatar + Info — estilo Twitter/Facebook */}
        <div className="relative px-5 pb-3">
          {/* Avatar sobrepondo o banner */}
          <div className="w-20 h-20 rounded-full border-4 border-[#050505] ring-1 ring-white/10 overflow-hidden bg-zinc-800 shadow-xl -mt-10 relative z-10">
            {comunidade.foto ? (
              <img loading="lazy" src={comunidade.foto} className="w-full h-full object-cover" alt={comunidade.nome} />
            ) : (
              <div className="w-full h-full bg-zinc-700" />
            )}
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-1 truncate tracking-wide">
                {comunidade.nome}
              </h1>
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-[#FFD300] shrink-0" />
                <div className="min-w-0">
                  {comunidade.endereco && <p className="text-zinc-300 text-[11px] truncate">{comunidade.endereco}</p>}
                  <p className="text-zinc-500 text-[10px] truncate">
                    {comunidade.cidade}
                    {comunidade.estado ? `, ${comunidade.estado}` : ''}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleFollow}
              disabled={toggling}
              className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all active:scale-95 ${
                isFollowing
                  ? 'bg-[#FFD300] border-[#FFD300] text-black'
                  : 'bg-transparent border-zinc-400 text-zinc-300'
              } disabled:opacity-50`}
            >
              {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              <span className="text-[11px] font-black uppercase tracking-wider">
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </span>
            </button>
          </div>

          {/* Como Chegar — logo após endereço, antes da bio */}
          {comunidade.coords && (
            <button
              onClick={() => {
                const { lat, lng } = comunidade.coords!;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                window.open(url, '_blank');
              }}
              className="mt-3 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full active:scale-95 transition-all"
            >
              <Navigation size={13} className="text-[#FFD300]" />
              <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Como Chegar</span>
            </button>
          )}

          {/* Evento Privado */}
          {comunidade.evento_privado_ativo && (
            <button
              onClick={() => {
                if (!userId) {
                  setShowRestricted(true);
                  return;
                }
                setShowEventoPrivado(true);
              }}
              className="mt-3 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full active:scale-95 transition-all"
            >
              <PartyPopper size={13} className="text-[#FFD300]" />
              <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Evento Privado</span>
            </button>
          )}

          {/* Comemorar aqui */}
          <button
            onClick={() => {
              if (!userId) {
                setShowRestricted(true);
                return;
              }
              setShowComemoracao(true);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full active:scale-95 transition-all"
          >
            <Cake size={13} className="text-[#FFD300]" />
            <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Comemorar aqui</span>
          </button>

          {comunidade.descricao && (
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <p className="text-zinc-400 text-sm leading-relaxed">{comunidade.descricao}</p>
            </div>
          )}
        </div>

        {/* Horário de Funcionamento */}
        {comunidade.horario_funcionamento && comunidade.horario_funcionamento.length > 0 && (
          <HorarioPublicDisplay
            horarios={comunidade.horario_funcionamento}
            overrides={comunidade.horario_overrides ?? []}
          />
        )}

        {/* Social Proof */}
        <div className="px-5 py-3 border-t border-white/5">
          {followCount > 0 && (
            <button
              onClick={() => setIsFollowerListOpen(true)}
              className="w-full flex items-center gap-3 py-2 active:opacity-70 transition-opacity group"
            >
              <div className="flex -space-x-2 overflow-hidden">
                {previewFollowers.map((member, i) => (
                  <div
                    key={member.id}
                    className={`relative inline-block h-6 w-6 rounded-full ring-2 ring-[#050505] z-${30 - i * 10}`}
                  >
                    <img
                      loading="lazy"
                      className="h-full w-full rounded-full object-cover"
                      src={member.foto}
                      alt={member.nome}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
                {followCount > 3 && (
                  <div className="relative inline-block h-6 w-6 rounded-full ring-2 ring-[#050505] bg-zinc-800 flex items-center justify-center z-0">
                    <span className="text-[8px] font-bold text-zinc-400">+{followCount - 3}</span>
                  </div>
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] text-zinc-500">
                  <span className="text-zinc-200 font-semibold">
                    {previewFollowers[0]?.nome.split(' ')[0] || 'Alguém'}
                  </span>{' '}
                  e outr{followCount - 1 === 1 ? 'a' : 'as'}{' '}
                  <span className="text-zinc-200 font-semibold">
                    {Math.max(0, followCount - 1)} pessoa{followCount - 1 !== 1 ? 's' : ''}
                  </span>{' '}
                  seguem esta comunidade
                </p>
              </div>
              <ChevronRight
                size={14}
                className="ml-auto text-zinc-500 group-active:text-[#FFD300] transition-colors shrink-0"
              />
            </button>
          )}
        </div>

        {/* Rating */}
        {ratingData.count > 0 && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={14}
                  fill={n <= Math.round(ratingData.media) ? '#FFD300' : 'transparent'}
                  stroke={n <= Math.round(ratingData.media) ? '#FFD300' : '#52525b'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-zinc-200 text-sm font-bold">{ratingData.media}</span>
            <span className="text-zinc-600 text-[10px]">
              ({ratingData.count} avaliação{ratingData.count !== 1 ? 'ões' : ''})
            </span>
          </div>
        )}

        {/* Próximos Eventos */}
        <div className="px-5 pt-5 border-t border-white/5">
          <p style={TYPOGRAPHY.sectionKicker} className="mb-4">
            Próximos Eventos
          </p>
          {proximosEventos.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-3 min-h-[110px] border border-zinc-800 rounded-xl justify-center">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center">
                <Calendar size={18} className="text-zinc-700" />
              </div>
              <p className="text-zinc-600 text-[11px] text-center">Próximos eventos em breve</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximosEventos.map(evento => (
                <button
                  key={evento.id}
                  onClick={() => onEventClick(evento)}
                  className="w-full flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                    <img
                      loading="lazy"
                      src={evento.imagem}
                      className="w-full h-full object-cover"
                      alt={evento.titulo}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{evento.titulo}</p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      {evento.data} · {evento.horario}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {evento.ocultarValor ? (
                      <p className="text-zinc-500 text-[10px]">Sob consulta</p>
                    ) : evento.lotes[0] ? (
                      <p className="text-[#FFD300] font-bold text-sm">
                        R$ {evento.lotes[0].preco.toFixed(2).replace('.', ',')}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista completa de seguidores */}
      {isFollowerListOpen && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-[#0A0A0A] animate-in slide-in-from-bottom-10 duration-300 shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/5 flex flex-col gap-4 bg-[#0A0A0A]/95 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
                  Seguidores
                </h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {followCount} pessoa{followCount !== 1 ? 's' : ''} seguem esta comunidade
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFollowerListOpen(false);
                  setFollowerSearch('');
                }}
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={followerSearch}
                onChange={e => setFollowerSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD300]/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 no-scrollbar">
            {loadingFollowers ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="text-zinc-700 animate-spin" />
              </div>
            ) : filteredFollowers.length > 0 ? (
              filteredFollowers.map(member => (
                <button
                  key={member.id}
                  onClick={() => onMemberClick?.(member)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-900/40 active:bg-zinc-900 transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black shrink-0">
                    <img
                      loading="lazy"
                      src={member.foto}
                      alt={member.nome}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-zinc-200 truncate">{member.nome}</h4>
                    <p className="text-[10px] text-zinc-500 truncate">{member.biografia || 'Membro da comunidade'}</p>
                  </div>
                  <UserCheck size={16} className="text-zinc-700 shrink-0" />
                </button>
              ))
            ) : (
              <div className="py-12 text-center opacity-50">
                <p className="text-xs text-zinc-500">Nenhum seguidor encontrado.</p>
              </div>
            )}
            {!followerSearch && filteredFollowers.length > 0 && (
              <div className="py-8 text-center">
                <p className="text-[10px] text-zinc-600 italic">
                  Exibindo {filteredFollowers.length} de {followCount}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Formulário Evento Privado */}
      {showEventoPrivado && comunidade && (
        <div className="absolute inset-0 z-[110]">
          <EventoPrivadoFormView
            comunidadeId={comunidadeId}
            comunidadeNome={comunidade.nome}
            onBack={() => setShowEventoPrivado(false)}
          />
        </div>
      )}

      {showComemoracao && comunidade && (
        <div className="absolute inset-0 z-[110]">
          <ComemoracaoFormView
            comunidadeId={comunidadeId}
            comunidadeNome={comunidade.nome}
            onBack={() => setShowComemoracao(false)}
          />
        </div>
      )}

      <RestrictedModal
        isOpen={showRestricted}
        onClose={() => setShowRestricted(false)}
        onLogin={() => {
          setShowRestricted(false);
          onRequestLogin?.();
        }}
        onCadastro={() => {
          setShowRestricted(false);
          onRequestCadastro?.();
        }}
        mensagem="Seguir comunidades é exclusivo para membros. Entre ou crie sua conta para continuar."
      />
    </div>
  );
};
