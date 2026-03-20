import React, { useState, useMemo } from 'react';
import { ArrowLeft, Users, ChevronRight, ChevronDown, List, TrendingUp, UserCheck, Ticket } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { listasService } from '../services/listasService';
import type { ListaEvento } from '../../../types';

interface ListaMetrica {
  listaId: string;
  eventoNome: string;
  alocado: number;
  usado: number;
  convidados: number;
  checkins: number;
}

export const PromoterDashboardView: React.FC<{
  onBack: () => void;
  currentUserId: string;
  onNavigateCotas?: (listaId: string) => void;
  onNavigateGuestlist?: () => void;
}> = ({ onBack, currentUserId, onNavigateCotas, onNavigateGuestlist }) => {
  const listas = useMemo(() => listasService.getListasByPromoter(currentUserId), [currentUserId]);
  const [filtroListaId, setFiltroListaId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Métricas por lista/evento
  const metricas = useMemo(() => {
    const results: ListaMetrica[] = [];
    for (const lista of listas) {
      let alocado = 0;
      let usado = 0;
      for (const cota of lista.cotas) {
        if (cota.promoterId === currentUserId) {
          alocado += cota.alocado;
          usado += cota.usado;
        }
      }
      const meusConvidados = lista.convidados.filter(c => c.inseridoPor === currentUserId);
      results.push({
        listaId: lista.id,
        eventoNome: lista.eventoNome ?? 'Evento',
        alocado,
        usado,
        convidados: meusConvidados.length,
        checkins: meusConvidados.filter(c => c.checkedIn).length,
      });
    }
    return results;
  }, [listas, currentUserId]);

  // KPIs agregados ou filtrados
  const kpis = useMemo(() => {
    const lista = filtroListaId ? metricas.filter(m => m.listaId === filtroListaId) : metricas;
    const totalAlocado = lista.reduce((a, m) => a + m.alocado, 0);
    const totalUsado = lista.reduce((a, m) => a + m.usado, 0);
    const totalConvidados = lista.reduce((a, m) => a + m.convidados, 0);
    const totalCheckin = lista.reduce((a, m) => a + m.checkins, 0);
    const convPct = totalConvidados > 0 ? Math.round((totalCheckin / totalConvidados) * 100) : 0;
    const usoPct = totalAlocado > 0 ? Math.round((totalUsado / totalAlocado) * 100) : 0;
    const mediaUsado = metricas.length > 0 ? metricas.reduce((a, m) => a + m.usado, 0) / metricas.length : 0;
    return { totalAlocado, totalUsado, totalConvidados, totalCheckin, convPct, usoPct, mediaUsado };
  }, [metricas, filtroListaId]);

  const eventoSelecionado = filtroListaId ? metricas.find(m => m.listaId === filtroListaId) : null;
  const tendencia =
    eventoSelecionado && kpis.mediaUsado > 0 ? (eventoSelecionado.usado >= kpis.mediaUsado ? 'acima' : 'abaixo') : null;

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Meu Painel"
        kicker="Promoter"
        subtitle={`${listas.length} evento${listas.length !== 1 ? 's' : ''}`}
        onBack={onBack}
      />

      {metricas.length > 1 && (
        <div className="shrink-0 px-6 py-3 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          >
            <span>
              {filtroListaId ? metricas.find(m => m.listaId === filtroListaId)?.eventoNome : 'Todos os eventos'}
            </span>
            <ChevronDown size="0.875rem" className="text-zinc-400" />
          </button>
          {showDropdown && (
            <div className="absolute left-6 right-6 top-full z-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
              <button
                onClick={() => {
                  setFiltroListaId(null);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover-real:bg-zinc-800 border-b border-white/5"
              >
                Todos os eventos
              </button>
              {metricas.map(m => (
                <button
                  key={m.listaId}
                  onClick={() => {
                    setFiltroListaId(m.listaId);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white hover-real:bg-zinc-800 border-b border-white/5 last:border-0"
                >
                  {m.eventoNome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Ticket size="0.6875rem" className="text-[#FFD300] shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Alocado</p>
            </div>
            <p className="text-lg font-bold text-[#FFD300] leading-none">{kpis.totalAlocado}</p>
            <p className="text-[0.5625rem] text-zinc-400">{kpis.usoPct}% utilizado</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Users size="0.6875rem" className="text-emerald-400 shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Usado</p>
            </div>
            <p className="text-lg font-bold text-emerald-400 leading-none">{kpis.totalUsado}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <UserCheck size="0.6875rem" className="text-cyan-400 shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Check-in</p>
            </div>
            <p className="text-lg font-bold text-cyan-400 leading-none">{kpis.convPct}%</p>
            <p className="text-[0.5625rem] text-zinc-400">
              {kpis.totalCheckin}/{kpis.totalConvidados}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp size="0.6875rem" className="text-blue-400 shrink-0" />
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Média/evento</p>
            </div>
            <p className="text-lg font-bold text-white leading-none">{kpis.mediaUsado.toFixed(0)}</p>
          </div>
        </div>

        {tendencia && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl border ${
              tendencia === 'acima' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-orange-500/5 border-orange-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size="0.875rem" className={tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'} />
              <p className={`text-xs font-bold ${tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {tendencia === 'acima' ? 'Acima' : 'Abaixo'} da média
              </p>
              <p className="text-[0.625rem] text-zinc-400">
                ({eventoSelecionado?.usado} nomes vs média {kpis.mediaUsado.toFixed(0)})
              </p>
            </div>
          </div>
        )}

        {metricas.length > 1 && !filtroListaId && (
          <div className="mb-4">
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider mb-2">
              Comparativo por Evento
            </p>
            <div className="space-y-2">
              {metricas.map(m => {
                const pct = kpis.mediaUsado > 0 ? (m.usado / kpis.mediaUsado) * 100 : 0;
                return (
                  <div key={m.listaId} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white font-bold truncate flex-1 min-w-0">{m.eventoNome}</p>
                      <p className="text-xs text-emerald-400 font-bold shrink-0 ml-2">
                        {m.usado}/{m.alocado}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 200)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[0.5625rem] text-zinc-400">
                        {m.convidados} convidados · {m.checkins} check-ins
                      </p>
                      <p className="text-[0.5625rem] text-zinc-400">
                        {m.alocado > 0 ? Math.round((m.usado / m.alocado) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Ações rápidas</p>
          {onNavigateGuestlist && (
            <button
              onClick={onNavigateGuestlist}
              className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <List size="1rem" className="text-[#FFD300] shrink-0" />
                <p className="text-sm text-white font-bold">Inserir Nomes</p>
              </div>
              <ChevronRight size="0.875rem" className="text-zinc-400 shrink-0" />
            </button>
          )}
          {(filtroListaId ? [listas.find(l => l.id === filtroListaId)!] : listas).filter(Boolean).map(lista => (
            <button
              key={lista.id}
              onClick={() => onNavigateCotas?.(lista.id)}
              disabled={!onNavigateCotas}
              className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users size="1rem" className="text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-bold truncate">Ver Cotas</p>
                  <p className="text-[0.625rem] text-zinc-400 truncate">{lista.eventoNome}</p>
                </div>
              </div>
              <ChevronRight size="0.875rem" className="text-zinc-400 shrink-0" />
            </button>
          ))}
        </div>

        {listas.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Users size="1.5rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
              Nenhuma cota atribuída ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
