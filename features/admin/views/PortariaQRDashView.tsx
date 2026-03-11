import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, UserCheck, Users, TrendingUp, ChevronDown, ArrowRight } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import { getCheckinsIngresso, getTicketsCaixaByEvento } from '../services/eventosAdminTickets';
import type { AccessNode } from '../../../types';

interface PortQRDashProps {
  onBack: () => void;
  currentUserId: string;
  isGerente: boolean;
  onOpenScanner: () => void;
  onOpenEquipe?: () => void;
}

interface EventoMetrica {
  eventoId: string;
  eventoNome: string;
  qrsValidados: number;
  totalIngressos: number;
  pendentes: number;
}

export const PortariaQRDashView: React.FC<PortQRDashProps> = ({
  onBack,
  currentUserId,
  isGerente,
  onOpenScanner,
  onOpenEquipe,
}) => {
  const accessNodes = useAuthStore(s => s.accessNodes);
  const [metricas, setMetricas] = useState<EventoMetrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEventoId, setFiltroEventoId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const qrNodes = useMemo(
    () =>
      accessNodes.filter(
        (n: AccessNode) =>
          n.portalRole === 'vanta_ger_portaria_antecipado' || n.portalRole === 'vanta_portaria_antecipado',
      ),
    [accessNodes],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results: EventoMetrica[] = [];

      for (const node of qrNodes) {
        if (node.tipo !== 'EVENTO') continue;
        try {
          const checkins = await getCheckinsIngresso(node.contextId);
          const tickets = await getTicketsCaixaByEvento(node.contextId);
          const totalIngressos = tickets.length;
          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            qrsValidados: checkins,
            totalIngressos,
            pendentes: Math.max(0, totalIngressos - checkins),
          });
        } catch {
          results.push({
            eventoId: node.contextId,
            eventoNome: node.contextNome,
            qrsValidados: 0,
            totalIngressos: 0,
            pendentes: 0,
          });
        }
      }

      if (!cancelled) {
        setMetricas(results);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [qrNodes]);

  const dados = useMemo(() => {
    const lista = filtroEventoId ? metricas.filter(m => m.eventoId === filtroEventoId) : metricas;
    const totalQRs = lista.reduce((a, m) => a + m.qrsValidados, 0);
    const totalIngressos = lista.reduce((a, m) => a + m.totalIngressos, 0);
    const totalPendentes = lista.reduce((a, m) => a + m.pendentes, 0);
    const pctValidado = totalIngressos > 0 ? Math.round((totalQRs / totalIngressos) * 100) : 0;
    const media = metricas.length > 0 ? metricas.reduce((a, m) => a + m.qrsValidados, 0) / metricas.length : 0;
    return { totalQRs, totalIngressos, totalPendentes, pctValidado, media };
  }, [metricas, filtroEventoId]);

  const eventoSelecionado = filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId) : null;
  const tendencia =
    eventoSelecionado && dados.media > 0 ? (eventoSelecionado.qrsValidados >= dados.media ? 'acima' : 'abaixo') : null;

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <button onClick={onBack} className="text-zinc-400 text-xs mb-2">
          &larr; Voltar
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic leading-none text-white">
          {isGerente ? 'Ger. Portaria QR' : 'Portaria QR'}
        </h1>
        <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-wider mt-1">
          {qrNodes.length} evento{qrNodes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {metricas.length > 1 && (
        <div className="shrink-0 px-6 pb-3 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          >
            <span>
              {filtroEventoId ? metricas.find(m => m.eventoId === filtroEventoId)?.eventoNome : 'Todos os eventos'}
            </span>
            <ChevronDown size="0.875rem" className="text-zinc-400" />
          </button>
          {showDropdown && (
            <div className="absolute left-6 right-6 top-full z-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
              <button
                onClick={() => {
                  setFiltroEventoId(null);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5"
              >
                Todos os eventos
              </button>
              {metricas.map(m => (
                <button
                  key={m.eventoId}
                  onClick={() => {
                    setFiltroEventoId(m.eventoId);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 border-b border-white/5 last:border-0"
                >
                  {m.eventoNome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck size="0.6875rem" className="text-cyan-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">QRs Validados</p>
                </div>
                <p className="text-lg font-bold text-cyan-400 leading-none">{dados.totalQRs}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <QrCode size="0.6875rem" className="text-orange-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Pendentes</p>
                </div>
                <p className="text-lg font-bold text-orange-400 leading-none">{dados.totalPendentes}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Users size="0.6875rem" className="text-blue-400 shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Total Ingressos</p>
                </div>
                <p className="text-lg font-bold text-white leading-none">{dados.totalIngressos}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size="0.6875rem" className="text-[#FFD300] shrink-0" />
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Validado</p>
                </div>
                <p className="text-lg font-bold text-[#FFD300] leading-none">{dados.pctValidado}%</p>
              </div>
            </div>

            {tendencia && (
              <div
                className={`mb-4 px-4 py-3 rounded-xl border ${
                  tendencia === 'acima'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size="0.875rem"
                    className={tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}
                  />
                  <p className={`text-xs font-bold ${tendencia === 'acima' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {tendencia === 'acima' ? 'Acima' : 'Abaixo'} da média
                  </p>
                  <p className="text-[0.625rem] text-zinc-400">
                    ({eventoSelecionado?.qrsValidados} vs média {dados.media.toFixed(0)})
                  </p>
                </div>
              </div>
            )}

            {metricas.length > 1 && !filtroEventoId && (
              <div className="mb-4">
                <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider mb-2">
                  Comparativo por Evento
                </p>
                <div className="space-y-2">
                  {metricas.map(m => {
                    const pct = dados.media > 0 ? (m.qrsValidados / dados.media) * 100 : 0;
                    return (
                      <div key={m.eventoId} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-white font-bold truncate flex-1 min-w-0">{m.eventoNome}</p>
                          <p className="text-xs text-cyan-400 font-bold shrink-0 ml-2">{m.qrsValidados} QRs</p>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 200)}%` }}
                          />
                        </div>
                        <p className="text-[0.5625rem] text-zinc-400 mt-1">{m.pendentes} pendentes</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-wider">Ações rápidas</p>
              <button
                onClick={onOpenScanner}
                className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <QrCode size="1rem" className="text-cyan-400 shrink-0" />
                  <p className="text-sm text-white font-bold">Abrir Scanner QR</p>
                </div>
                <ArrowRight size="0.875rem" className="text-zinc-400 shrink-0" />
              </button>
              {isGerente && onOpenEquipe && (
                <button
                  onClick={onOpenEquipe}
                  className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Users size="1rem" className="text-blue-400 shrink-0" />
                    <p className="text-sm text-white font-bold">Gerenciar Equipe</p>
                  </div>
                  <ArrowRight size="0.875rem" className="text-zinc-400 shrink-0" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
