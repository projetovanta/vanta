import React, { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { Evento } from '../../../types';
import { EventCard } from '../../../components/EventCard';
import { supabase } from '../../../services/supabaseClient';
import { useAuthStore } from '../../../stores/authStore';
import { useSocialStore } from '../../../stores/socialStore';

export const FriendsGoingSection: React.FC<{
  eventos: Evento[];
  onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}> = React.memo(({ eventos, onEventClick, onComunidadeClick }) => {
  const currentAccount = useAuthStore(s => s.currentAccount);
  const friendships = useSocialStore(s => s.friendships);
  const [friendEventIds, setFriendEventIds] = useState<Set<string>>(new Set());
  const [friendCountByEvent, setFriendCountByEvent] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  const friendIds = useMemo(() => {
    return Object.entries(friendships)
      .filter(([, status]) => status === 'FRIENDS')
      .map(([id]) => id);
  }, [friendships]);

  useEffect(() => {
    if (loaded || !currentAccount?.id || friendIds.length === 0) return;
    setLoaded(true);

    (async () => {
      try {
        // Buscar eventos futuros que amigos têm ingresso
        const eventoIds = eventos.map(e => e.id);
        if (eventoIds.length === 0) return;

        const { data: tickets } = await supabase
          .from('tickets_caixa')
          .select('evento_id, owner_id')
          .in('evento_id', eventoIds)
          .in('owner_id', friendIds)
          .in('status', ['DISPONIVEL', 'USADO']);

        if (!tickets || tickets.length === 0) return;

        const ids = new Set<string>();
        const counts: Record<string, number> = {};
        for (const t of tickets) {
          const eid = t.evento_id as string;
          ids.add(eid);
          counts[eid] = (counts[eid] || 0) + 1;
        }
        // Deduplica por evento+owner
        const uniquePairs = new Set(tickets.map(t => `${t.evento_id}:${t.owner_id}`));
        const dedupCounts: Record<string, number> = {};
        for (const pair of uniquePairs) {
          const eid = pair.split(':')[0];
          dedupCounts[eid] = (dedupCounts[eid] || 0) + 1;
        }

        setFriendEventIds(ids);
        setFriendCountByEvent(dedupCounts);
      } catch {
        /* silencioso */
      }
    })();
  }, [currentAccount?.id, friendIds, eventos, loaded]);

  const friendEvents = useMemo(() => {
    return eventos
      .filter(e => friendEventIds.has(e.id))
      .sort((a, b) => (friendCountByEvent[b.id] || 0) - (friendCountByEvent[a.id] || 0))
      .slice(0, 10);
  }, [eventos, friendEventIds, friendCountByEvent]);

  if (friendEvents.length === 0) return null;

  return (
    <div className="py-4 w-full">
      <div className="flex items-center gap-2 px-5 mb-3">
        <Users size="0.875rem" className="text-[#FFD300]" />
        <h3 style={TYPOGRAPHY.sectionKicker} className="text-sm">
          Amigos vão
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
        {friendEvents.map(evento => (
          <div key={evento.id} className="shrink-0 w-[42vw] max-w-[11.25rem] snap-start relative">
            <EventCard evento={evento} onClick={onEventClick} onComunidadeClick={onComunidadeClick} />
            {(friendCountByEvent[evento.id] || 0) > 0 && (
              <div className="absolute top-2 left-2 z-40 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                <Users size="0.4375rem" className="text-[#FFD300]" />
                <span className="text-[0.4375rem] font-black text-white tracking-wider">
                  {friendCountByEvent[evento.id]} amigo{(friendCountByEvent[evento.id] || 0) > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

FriendsGoingSection.displayName = 'FriendsGoingSection';
