import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronRight, UserCheck, Heart, Search, Loader2 } from 'lucide-react';
import { Membro } from '../../../types';
import { TYPOGRAPHY } from '../../../constants';
import { supabase } from '../../../services/supabaseClient';
import { profileToMembro } from '../../../services/authService';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuthStore } from '../../../stores/authStore';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { useSocialStore } from '../../../stores/socialStore';

interface EventSocialProofProps {
  eventoId: string;
  totalConfirmados: number;
  onMemberClick: (membro: Membro) => void;
}

export const EventSocialProof: React.FC<EventSocialProofProps> = ({ eventoId, totalConfirmados, onMemberClick }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [confirmedMembers, setConfirmedMembers] = useState<Membro[]>([]);
  const [friendMembers, setFriendMembers] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const currentAccount = useAuthStore(s => s.currentAccount);
  const friendships = useSocialStore(s => s.friendships);

  // IDs dos amigos aceitos
  const friendIds = useMemo(() => {
    return Object.entries(friendships)
      .filter(([, status]) => status === 'FRIENDS')
      .map(([id]) => id);
  }, [friendships]);

  // Carregar preview (amigos que vão) no mount — leve, sem abrir lista
  useEffect(() => {
    if (previewLoaded || !currentAccount?.id || friendIds.length === 0) return;
    setPreviewLoaded(true);
    let cancelled = false;
    (async () => {
      try {
        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('owner_id')
          .eq('evento_id', eventoId)
          .in('status', ['DISPONIVEL', 'USADO'])
          .in('owner_id', friendIds);
        if (cancelled) return;
        const ids = [
          ...new Set((tickets ?? []).map((t: Record<string, unknown>) => t.owner_id as string).filter(Boolean)),
        ];
        if (ids.length === 0) return;
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .in('id', ids.slice(0, 10));
        if (!cancelled) setFriendMembers((profiles ?? []).map((r: Record<string, unknown>) => profileToMembro(r)));
      } catch {
        /* silencioso */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventoId, currentAccount?.id, friendIds, previewLoaded]);

  // Carregar lista completa ao abrir modal
  useEffect(() => {
    if (!isListOpen || confirmedMembers.length > 0) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('owner_id')
          .eq('evento_id', eventoId)
          .in('status', ['DISPONIVEL', 'USADO'])
          .not('owner_id', 'is', null);
        if (cancelled) return;
        const ownerIds = [
          ...new Set((tickets ?? []).map((t: Record<string, unknown>) => t.owner_id as string).filter(Boolean)),
        ];
        if (ownerIds.length === 0) {
          setLoading(false);
          return;
        }
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .in('id', ownerIds.slice(0, 50));
        if (cancelled) return;
        const all = (profiles ?? []).map((r: Record<string, unknown>) => profileToMembro(r));
        // Amigos primeiro
        const friendSet = new Set(friendIds);
        const friends = all.filter(m => friendSet.has(m.id));
        const others = all.filter(m => !friendSet.has(m.id));
        setConfirmedMembers([...friends, ...others]);
      } catch {
        /* silencioso */
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListOpen, eventoId, friendIds]);

  const filteredMembers = useMemo(() => {
    if (!debouncedSearchQuery) return confirmedMembers;
    const q = debouncedSearchQuery.toLowerCase();
    return confirmedMembers.filter(m => m.nome.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [confirmedMembers, debouncedSearchQuery]);

  // Preview: amigos primeiro, depois outros até 3
  const previewMembers = useMemo(() => {
    if (friendMembers.length >= 3) return friendMembers.slice(0, 3);
    return friendMembers;
  }, [friendMembers]);

  const hasFriends = friendMembers.length > 0;
  const friendNames = friendMembers.slice(0, 2).map(m => m.nome.split(' ')[0]);
  const remainingCount = totalConfirmados > (hasFriends ? friendMembers.length : 1);
  const firstMemberName = previewMembers[0]?.nome.split(' ')[0] || 'Alguém';

  if (totalConfirmados === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsListOpen(true)}
        className="w-full flex items-center gap-3 py-2 active:opacity-70 transition-opacity group"
      >
        <div className="flex -space-x-2 overflow-hidden">
          {(hasFriends ? previewMembers : previewMembers.length > 0 ? previewMembers : []).map((member, i) => (
            <div
              key={member.id}
              className={`relative inline-block h-6 w-6 rounded-full ${hasFriends ? 'ring-2 ring-[#FFD300]/40' : 'ring-2 ring-[#0a0a0a]'} z-${30 - i * 10}`}
            >
              <OptimizedImage
                src={member.foto}
                width={24}
                className="h-full w-full rounded-full object-cover"
                alt={member.nome}
              />
            </div>
          ))}
          {totalConfirmados > 3 && (
            <div className="relative inline-block h-6 w-6 rounded-full ring-2 ring-[#0a0a0a] bg-zinc-800 flex items-center justify-center z-0">
              <span className="text-[0.5rem] font-bold text-zinc-400">+{totalConfirmados - 3}</span>
            </div>
          )}
        </div>
        <div className="text-left">
          {hasFriends ? (
            <p className="text-[0.625rem] text-zinc-400">
              {friendNames.length === 1 ? (
                <>
                  <span className="text-[#FFD300] font-bold">{friendNames[0]}</span>
                  {friendMembers.length > 1 && (
                    <>
                      {' '}
                      e{' '}
                      <span className="text-[#FFD300] font-bold">
                        +{friendMembers.length - 1} amigo{friendMembers.length > 2 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {remainingCount && (
                    <>
                      {' '}
                      e mais <span className="text-zinc-200 font-bold">
                        {totalConfirmados - friendMembers.length}
                      </span>{' '}
                      pessoas
                    </>
                  )}{' '}
                  vão
                </>
              ) : (
                <>
                  <span className="text-[#FFD300] font-bold">{friendNames.join(' e ')}</span>
                  {friendMembers.length > 2 && (
                    <>
                      {' '}
                      e <span className="text-[#FFD300] font-bold">+{friendMembers.length - 2}</span>
                    </>
                  )}
                  {remainingCount && (
                    <>
                      {' '}
                      e mais <span className="text-zinc-200 font-bold">
                        {totalConfirmados - friendMembers.length}
                      </span>{' '}
                      pessoas
                    </>
                  )}{' '}
                  vão
                </>
              )}
            </p>
          ) : (
            <p className="text-[0.625rem] text-zinc-400">
              <span className="text-zinc-200 font-bold">{firstMemberName}</span> e outras{' '}
              <span className="text-zinc-200 font-bold">{totalConfirmados - 1} pessoas</span> confirmaram presença
            </p>
          )}
        </div>
        <ChevronRight size="0.875rem" className="ml-auto text-zinc-400 group-active:text-[#FFD300] transition-colors" />
      </button>

      {isListOpen && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-[#0A0A0A] animate-in slide-in-from-bottom-10 duration-300 shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/5 flex flex-col gap-4 bg-[#0A0A0A]/95 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
                  Confirmados
                </h2>
                <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-widest mt-1">
                  {totalConfirmados} pessoas confirmaram presença nesse evento.
                </p>
              </div>
              <button
                onClick={() => setIsListOpen(false)}
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
              >
                <X size="1.25rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="relative">
              <Search size="0.875rem" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 no-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size="1.25rem" className="text-zinc-700 animate-spin" />
              </div>
            ) : filteredMembers.length > 0 ? (
              (() => {
                const friendSet = new Set(friendIds);
                const friends = filteredMembers.filter(m => friendSet.has(m.id));
                const others = filteredMembers.filter(m => !friendSet.has(m.id));
                return (
                  <>
                    {friends.length > 0 && (
                      <>
                        <p className="text-[0.5625rem] font-black uppercase tracking-widest text-[#FFD300]/60 px-1 pt-2 pb-1">
                          Seus amigos ({friends.length})
                        </p>
                        {friends.map(member => (
                          <button
                            key={member.id}
                            onClick={() => onMemberClick(member)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-900/40 active:bg-zinc-900 transition-colors border border-transparent hover:border-[#FFD300]/10"
                          >
                            <div className="w-12 h-12 rounded-full border-2 border-[#FFD300]/30 overflow-hidden bg-black shrink-0">
                              <OptimizedImage
                                src={member.foto}
                                width={48}
                                alt={member.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-bold text-zinc-200 truncate">{member.nome}</h4>
                              <p className="text-[0.625rem] text-[#FFD300]/50 truncate">Amigo</p>
                            </div>
                            <Heart size="0.875rem" className="text-[#FFD300]/40" />
                          </button>
                        ))}
                      </>
                    )}
                    {others.length > 0 && (
                      <>
                        {friends.length > 0 && (
                          <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 px-1 pt-4 pb-1">
                            Outros confirmados ({others.length})
                          </p>
                        )}
                        {others.map(member => (
                          <button
                            key={member.id}
                            onClick={() => onMemberClick(member)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-900/40 active:bg-zinc-900 transition-colors border border-transparent hover:border-white/5"
                          >
                            <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black shrink-0">
                              <OptimizedImage
                                src={member.foto}
                                width={48}
                                alt={member.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-bold text-zinc-200 truncate">{member.nome}</h4>
                              <p className="text-[0.625rem] text-zinc-400 truncate">
                                {member.biografia || 'Membro da comunidade'}
                              </p>
                            </div>
                            <UserCheck size="1rem" className="text-zinc-700" />
                          </button>
                        ))}
                      </>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="py-12 text-center opacity-50">
                <p className="text-xs text-zinc-400">Nenhum membro encontrado.</p>
              </div>
            )}
            {!searchQuery && filteredMembers.length > 0 && (
              <div className="py-8 text-center">
                <p className="text-[0.625rem] text-zinc-400 italic">
                  Exibindo {filteredMembers.length} visíveis de {totalConfirmados}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
