import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Zap, RefreshCw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { clubeService } from '../services/clubeService';
import { getResgatesEvento, type ResgateMV } from '../services/clube/clubeReservasService';
import { eventosAdminService } from '../services/eventosAdminService';
import { comunidadesService } from '../services/comunidadesService';

type Filtro = 'ATIVOS' | 'INATIVOS' | 'TODOS';

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  } catch {
    return '—';
  }
};

const fmtHora = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
};

const isEventoFuturo = (dataInicio: string): boolean => {
  try {
    return new Date(dataInicio) > new Date();
  } catch {
    return false;
  }
};

export const EventosGlobaisMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [filtro, setFiltro] = useState<Filtro>('ATIVOS');
  const [tick, setTick] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const eventos = useMemo(() => eventosAdminService.getEventos(), []);
  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  const getLotesEvento = (eventoId: string) => clubeService.getLotesEvento(eventoId);
  const [reservasCache, setReservasCache] = useState<Record<string, ResgateMV[]>>({});

  const getComunidadeNome = (eventoId: string) => {
    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) return '—';
    return comunidades.find(c => c.id === evento.comunidadeId)?.nome ?? '—';
  };

  const eventosComMV = eventos.filter(e => getLotesEvento(e.id).length > 0);

  const filtrados = (() => {
    switch (filtro) {
      case 'ATIVOS':
        return eventosComMV.filter(e => isEventoFuturo(e.dataInicio));
      case 'INATIVOS':
        return eventosComMV.filter(e => !isEventoFuturo(e.dataInicio));
      default:
        return eventosComMV;
    }
  })();

  const selectedEvento = selectedEventId ? eventos.find(e => e.id === selectedEventId) : null;
  const selectedLotes = selectedEventId ? getLotesEvento(selectedEventId) : [];
  const selectedReservas = selectedEventId ? (reservasCache[selectedEventId] ?? []) : [];

  // Carregar resgates quando selecionar evento
  useEffect(() => {
    if (!selectedEventId || reservasCache[selectedEventId]) return;
    let cancelled = false;
    getResgatesEvento(selectedEventId).then(data => {
      if (!cancelled) setReservasCache(prev => ({ ...prev, [selectedEventId]: data }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const totais = useMemo(() => {
    const ativos = eventosComMV.filter(e => isEventoFuturo(e.dataInicio)).length;
    return { ativos, inativos: eventosComMV.length - ativos };
  }, [eventosComMV]);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([clubeService.refresh(), eventosAdminService.refresh()]);
    setTick(t => t + 1);
    setLoading(false);
  };

  const filtros: { id: Filtro; label: string; count: number }[] = [
    { id: 'ATIVOS', label: 'Ativos', count: totais.ativos },
    { id: 'INATIVOS', label: 'Inativos', count: totais.inativos },
    { id: 'TODOS', label: 'Todos', count: eventosComMV.length },
  ];

  if (selectedEvento && selectedEventId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminViewHeader
          title={selectedEvento.nome}
          kicker="Evento MAIS VANTA"
          onBack={() => setSelectedEventId(null)}
          actions={[{ icon: RefreshCw, label: 'Atualizar', onClick: handleRefresh }]}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          <div className="space-y-2 text-xs text-zinc-400">
            <p>
              <span className="text-zinc-400 font-bold">Data:</span> {fmtDate(selectedEvento.dataInicio)} •{' '}
              {fmtHora(selectedEvento.dataInicio)}
            </p>
            <p>
              <span className="text-zinc-400 font-bold">Local:</span> {selectedEvento.local}
            </p>
            <p>
              <span className="text-zinc-400 font-bold">Comunidade:</span> {getComunidadeNome(selectedEventId)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          <div>
            <p className="text-white font-bold text-sm mb-3">Lotes por Tier</p>
            <div className="space-y-2">
              {selectedLotes.map(lote => {
                const ocupacao = lote.quantidade > 0 ? (lote.reservados / lote.quantidade) * 100 : 0;
                return (
                  <div key={lote.id} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-bold text-sm">{lote.tierId || lote.tierMinimo}</p>
                        <p className="text-zinc-400 text-[0.625rem]">{lote.tipoAcesso}</p>
                      </div>
                      <p className="text-[#FFD300] font-bold text-sm">
                        {lote.reservados}/{lote.quantidade}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFD300]" style={{ width: `${ocupacao}%` }} />
                    </div>
                    <p className="text-zinc-400 text-[0.5625rem] mt-1">
                      Acompanhantes: {lote.acompanhantes} | {ocupacao.toFixed(0)}% ocupado
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-white font-bold text-sm mb-3">Reservas ({selectedReservas.length})</p>
            <div className="space-y-2">
              {selectedReservas.length === 0 && (
                <p className="text-zinc-400 text-[0.625rem] py-4 text-center">Nenhuma reserva ainda</p>
              )}
              {selectedReservas.map(res => (
                <div key={res.id} className="bg-zinc-900/40 border border-white/5 rounded-lg p-3 text-[0.625rem]">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{res.userId.slice(0, 12)}</p>
                      <p
                        className={`text-[0.5625rem] ${res.status === 'USADO' ? 'text-emerald-400' : 'text-zinc-400'}`}
                      >
                        {res.status}
                      </p>
                    </div>
                    <p className="text-zinc-400">
                      {new Date(res.reservadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Eventos MAIS VANTA"
        kicker="Visão Global"
        onBack={onBack}
        actions={[{ icon: RefreshCw, label: 'Atualizar', onClick: handleRefresh }]}
      />
      <div className="px-5 pt-3 pb-2 shrink-0 border-b border-white/5">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-black text-2xl leading-none">{totais.ativos}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-1">Ativos</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-2xl leading-none">{totais.inativos}</p>
            <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest mt-1">Inativos</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filtros.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                filtro === f.id
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 text-zinc-400 border-white/5 active:bg-zinc-800'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Calendar size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhum evento encontrado
            </p>
          </div>
        )}

        {filtrados.map(e => {
          const eventLotes = getLotesEvento(e.id);
          const eventReservas = reservasCache[e.id] ?? [];
          const totalReservado = eventReservas.length;
          const totalVagas = eventLotes.reduce((s, l) => s + l.quantidade, 0);
          const ocupacao = totalVagas > 0 ? (totalReservado / totalVagas) * 100 : 0;

          return (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className="w-full text-left bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-[#FFD300]/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{e.nome}</p>
                  <p className="text-zinc-400 text-[0.625rem] mt-0.5">
                    {getComunidadeNome(e.id)} • {fmtDate(e.dataInicio)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 text-[0.625rem]">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Users size="0.75rem" /> {totalReservado}/{totalVagas}
                </span>
                <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFD300]" style={{ width: `${ocupacao}%` }} />
                </div>
                <span className="text-[#FFD300] font-bold">{ocupacao.toFixed(0)}%</span>
              </div>

              {eventLotes.length > 0 && (
                <p className="text-[0.5625rem] text-zinc-400 mt-2">
                  {eventLotes.length} tier{eventLotes.length > 1 ? 's' : ''} •{' '}
                  <Zap size="0.625rem" className="inline" /> {eventReservas.filter(r => r.postVerificado).length} posts
                  verificados
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
