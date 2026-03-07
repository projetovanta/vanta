import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Users, Zap, RefreshCw } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { clubeService } from '../services/clubeService';
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

  const eventos = useMemo(() => eventosAdminService.getEventos(), [tick]);
  const comunidades = useMemo(() => comunidadesService.getAll(), []);

  const getLotesEvento = (eventoId: string) => clubeService.getLotesEvento(eventoId);
  const getReservasEvento = (eventoId: string) => clubeService.getReservasEvento?.(eventoId) ?? [];

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
  const selectedReservas = selectedEventId ? getReservasEvento(selectedEventId) : [];

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
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <button
                onClick={() => setSelectedEventId(null)}
                className="text-[#FFD300] text-sm mb-1 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic truncate">
                {selectedEvento.nome}
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-40"
            >
              <RefreshCw size={16} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 text-xs text-zinc-400">
            <p>
              <span className="text-zinc-500 font-bold">Data:</span> {fmtDate(selectedEvento.dataInicio)} •{' '}
              {fmtHora(selectedEvento.dataInicio)}
            </p>
            <p>
              <span className="text-zinc-500 font-bold">Local:</span> {selectedEvento.local}
            </p>
            <p>
              <span className="text-zinc-500 font-bold">Comunidade:</span> {getComunidadeNome(selectedEventId)}
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
                        <p className="text-zinc-500 text-[10px]">{lote.tipoAcesso}</p>
                      </div>
                      <p className="text-[#FFD300] font-bold text-sm">
                        {lote.reservados}/{lote.quantidade}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFD300]" style={{ width: `${ocupacao}%` }} />
                    </div>
                    <p className="text-zinc-600 text-[9px] mt-1">
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
                <p className="text-zinc-600 text-[10px] py-4 text-center">Nenhuma reserva ainda</p>
              )}
              {selectedReservas.map(res => (
                <div key={res.id} className="bg-zinc-900/40 border border-white/5 rounded-lg p-3 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{res.userId.slice(0, 12)}</p>
                      <p className={`text-[9px] ${res.status === 'USADO' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {res.status}
                      </p>
                    </div>
                    <p className="text-zinc-600">
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
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1">
              Visão Global
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              Eventos MAIS VANTA
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all disabled:opacity-40"
            >
              <RefreshCw size={16} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-black text-2xl leading-none">{totais.ativos}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Ativos</p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 text-center">
            <p className="text-amber-400 font-black text-2xl leading-none">{totais.inativos}</p>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mt-1">Inativos</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filtros.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border transition-all ${
                filtro === f.id
                  ? 'bg-[#FFD300] text-black border-transparent'
                  : 'bg-zinc-900/60 text-zinc-500 border-white/5 active:bg-zinc-800'
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
              <Calendar size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nenhum evento encontrado</p>
          </div>
        )}

        {filtrados.map(e => {
          const eventLotes = getLotesEvento(e.id);
          const eventReservas = getReservasEvento(e.id);
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
                  <p className="text-zinc-500 text-[10px] mt-0.5">
                    {getComunidadeNome(e.id)} • {fmtDate(e.dataInicio)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 text-[10px]">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Users size={12} /> {totalReservado}/{totalVagas}
                </span>
                <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFD300]" style={{ width: `${ocupacao}%` }} />
                </div>
                <span className="text-[#FFD300] font-bold">{ocupacao.toFixed(0)}%</span>
              </div>

              {eventLotes.length > 0 && (
                <p className="text-[9px] text-zinc-600 mt-2">
                  {eventLotes.length} tier{eventLotes.length > 1 ? 's' : ''} • <Zap size={10} className="inline" />{' '}
                  {eventReservas.filter(r => r.postVerificado).length} posts verificados
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
