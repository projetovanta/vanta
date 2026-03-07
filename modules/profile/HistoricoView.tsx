import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Ticket,
  UserCheck,
  Calendar,
  Loader2,
  PartyPopper,
  Compass,
  Users,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Ingresso, Evento } from '../../types';
import { achievementsService, Achievement, Badge, NIVEL_CONFIG } from '../../services/achievementsService';

interface HistoricoViewProps {
  myTickets: Ingresso[];
  myPresencas: string[];
  allEvents: Evento[];
  userId: string;
  onBack: () => void;
  onEventClick: (evento: Evento) => void;
}

const BADGE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  PartyPopper,
  Compass,
  Users,
  MessageSquare,
};

interface HistoricoItem {
  eventoId: string;
  evento: Evento;
  tipo: 'INGRESSO' | 'PRESENCA';
  dataSort: string;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  myTickets,
  myPresencas,
  allEvents,
  userId,
  onBack,
  onEventClick,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([achievementsService.getAchievements(userId), achievementsService.getBadges(userId)]).then(
      ([ach, bdg]) => {
        setAchievements(ach);
        setBadges(bdg);
        setLoading(false);
      },
    );
  }, [userId]);

  const statusInativos = useMemo(() => new Set(['CANCELADO', 'TRANSFERIDO', 'REEMBOLSADO']), []);

  const historico = useMemo(() => {
    const eventMap = new Map<string, Evento>(allEvents.map(e => [e.id, e]));
    const items: HistoricoItem[] = [];
    const seen = new Set<string>();

    // Tickets usados ou expirados (evento encerrado)
    for (const t of myTickets) {
      if (statusInativos.has(t.status)) continue;
      if (t.status === 'DISPONIVEL') {
        // Se evento já passou, conta como histórico
        const ev = eventMap.get(t.eventoId);
        if (!ev) continue;
        const now = new Date();
        const fim = t.eventoDataFimISO ? new Date(t.eventoDataFimISO) : null;
        if (!fim || fim > now) continue;
      }
      if (seen.has(t.eventoId)) continue;
      seen.add(t.eventoId);
      const ev = eventMap.get(t.eventoId);
      if (ev) items.push({ eventoId: t.eventoId, evento: ev, tipo: 'INGRESSO', dataSort: ev.dataReal });
    }

    // Presenças sociais
    for (const pId of myPresencas) {
      if (seen.has(pId)) continue;
      seen.add(pId);
      const ev = eventMap.get(pId);
      if (ev) items.push({ eventoId: pId, evento: ev, tipo: 'PRESENCA', dataSort: ev.dataReal });
    }

    return items.sort((a, b) => b.dataSort.localeCompare(a.dataSort));
  }, [myTickets, myPresencas, allEvents, statusInativos]);

  const conquistados = badges.filter(b => b.conquistado);

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div
        className="shrink-0 bg-[#0a0a0a] border-b border-white/5 px-6 pb-4 flex items-center justify-between"
        style={{ paddingTop: '1rem' }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
          Meu Histórico
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="text-zinc-700 animate-spin" />
          </div>
        ) : (
          <>
            {/* Conquistas por Comunidade */}
            {achievements.length > 0 && (
              <div className="px-5 pt-5 pb-3">
                <p style={TYPOGRAPHY.sectionKicker} className="mb-3">
                  Conquistas
                </p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {achievements.map(ach => {
                    const cfg = NIVEL_CONFIG[ach.nivel];
                    return (
                      <div
                        key={ach.id}
                        className="shrink-0 w-28 bg-zinc-900/60 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
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
                          className="text-[9px] font-black uppercase tracking-wider text-center truncate w-full"
                          style={{ color: cfg.cor }}
                        >
                          {cfg.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 text-center truncate w-full">{ach.comunidadeNome}</p>
                        <p className="text-[9px] text-zinc-600">
                          {ach.totalEventos} evento{ach.totalEventos !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badges Globais */}
            {conquistados.length > 0 && (
              <div className="px-5 py-3 border-t border-white/5">
                <p style={TYPOGRAPHY.sectionKicker} className="mb-3">
                  Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  {badges.map(badge => {
                    const Icon = BADGE_ICONS[badge.icone] || Trophy;
                    return (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                          badge.conquistado
                            ? 'bg-zinc-900/80 border-[#FFD300]/20'
                            : 'bg-zinc-950 border-white/5 opacity-30'
                        }`}
                      >
                        <Icon size={14} className={badge.conquistado ? 'text-[#FFD300]' : 'text-zinc-700'} />
                        <span
                          className={`text-[10px] font-bold ${badge.conquistado ? 'text-zinc-300' : 'text-zinc-700'}`}
                        >
                          {badge.nome}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="px-5 pt-5 border-t border-white/5">
              <p style={TYPOGRAPHY.sectionKicker} className="mb-4">
                Eventos ({historico.length})
              </p>
              {historico.length === 0 ? (
                <div className="flex flex-col items-center py-14 gap-3">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center">
                    <Calendar size={20} className="text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 text-sm text-center">Nenhum evento no histórico ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historico.map(item => (
                    <button
                      key={item.eventoId}
                      onClick={() => onEventClick(item.evento)}
                      className="w-full flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                        {item.evento.imagem && (
                          <img loading="lazy" src={item.evento.imagem} className="w-full h-full object-cover" alt="" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.evento.titulo}</p>
                        <p className="text-zinc-500 text-[11px] mt-0.5 truncate">
                          {item.evento.data} · {item.evento.local}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {item.tipo === 'INGRESSO' ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD300]/10 rounded-lg">
                            <Ticket size={10} className="text-[#FFD300]" />
                            <span className="text-[8px] font-black uppercase text-[#FFD300]">Ingresso</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-lg">
                            <UserCheck size={10} className="text-purple-400" />
                            <span className="text-[8px] font-black uppercase text-purple-400">Presença</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
