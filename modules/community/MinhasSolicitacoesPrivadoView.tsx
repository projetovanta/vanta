import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Clock, Eye, Search, CheckCircle, XCircle, Sparkles, MessageSquare } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { eventoPrivadoService, EventoPrivado } from '../../services/eventoPrivadoService';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ENVIADA: { label: 'Enviada', color: '#A78BFA', icon: <Clock size={14} /> },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA', icon: <Eye size={14} /> },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24', icon: <Search size={14} /> },
  APROVADA: { label: 'Aprovada', color: '#34D399', icon: <CheckCircle size={14} /> },
  RECUSADA: { label: 'Recusada', color: '#F87171', icon: <XCircle size={14} /> },
  CONVERTIDA: { label: 'Evento criado', color: '#FFD300', icon: <Sparkles size={14} /> },
};

const TIMELINE_ORDER = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

function getTimelineForStatus(sol: EventoPrivado) {
  const steps = TIMELINE_ORDER.map(s => {
    const cfg = STATUS_CONFIG[s];
    let timestamp: string | null = null;
    let reached = false;

    if (s === 'ENVIADA') {
      timestamp = sol.created_at;
      reached = true;
    }
    if (s === 'VISUALIZADA' && sol.visualizado_em) {
      timestamp = sol.visualizado_em;
      reached = true;
    }
    if (s === 'EM_ANALISE' && sol.em_analise_em) {
      timestamp = sol.em_analise_em;
      reached = true;
    }
    if (s === 'APROVADA' && sol.status === 'APROVADA') {
      timestamp = sol.avaliado_em;
      reached = true;
    }
    if (s === 'APROVADA' && sol.status === 'CONVERTIDA') {
      timestamp = sol.avaliado_em;
      reached = true;
    }

    return { key: s, label: cfg.label, color: cfg.color, icon: cfg.icon, timestamp, reached };
  });

  // Se recusada, trocar último step
  if (sol.status === 'RECUSADA') {
    steps[steps.length - 1] = {
      key: 'RECUSADA',
      label: 'Recusada',
      color: '#F87171',
      icon: <XCircle size={14} />,
      timestamp: sol.avaliado_em,
      reached: true,
    };
  }

  return steps;
}

interface Props {
  onBack: () => void;
}

export const MinhasSolicitacoesPrivadoView: React.FC<Props> = ({ onBack }) => {
  const [solicitacoes, setSolicitacoes] = useState<EventoPrivado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    eventoPrivadoService.minhasSolicitacoes().then(data => {
      if (cancelled) return;
      setSolicitacoes(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white">
          Minhas Solicitações
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-zinc-600 animate-spin" />
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
              <Clock size={24} className="text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-sm">Nenhuma solicitação ainda</p>
          </div>
        ) : (
          solicitacoes.map(sol => {
            const timeline = getTimelineForStatus(sol);
            const currentCfg = STATUS_CONFIG[sol.status] ?? STATUS_CONFIG.ENVIADA;

            return (
              <div key={sol.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                {/* Header do card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{sol.empresa}</p>
                    <p className="text-zinc-500 text-[10px] mt-0.5">
                      {sol.data_evento || sol.data_estimativa || 'Data a definir'} · {sol.faixa_capacidade}
                    </p>
                  </div>
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: currentCfg.color + '20', color: currentCfg.color }}
                  >
                    {currentCfg.label}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-1">
                  {timeline.map((step, i) => (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                            step.reached ? 'border-transparent' : 'border-zinc-700 bg-zinc-900'
                          }`}
                          style={
                            step.reached
                              ? { backgroundColor: step.color + '30', color: step.color }
                              : { color: '#52525b' }
                          }
                        >
                          {step.icon}
                        </div>
                        <span className="text-[8px] text-zinc-500 text-center leading-tight w-14 truncate">
                          {step.reached && step.timestamp ? formatDate(step.timestamp) : step.label}
                        </span>
                      </div>
                      {i < timeline.length - 1 && (
                        <div
                          className="flex-1 h-0.5 rounded-full -mt-4"
                          style={{
                            backgroundColor: step.reached && timeline[i + 1].reached ? step.color + '60' : '#27272a',
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Mensagem do gerente */}
                {sol.mensagem_gerente && (
                  <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                    <MessageSquare size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-300 text-xs leading-relaxed">{sol.mensagem_gerente}</p>
                  </div>
                )}

                {/* Motivo recusa */}
                {sol.status === 'RECUSADA' && sol.motivo_recusa && (
                  <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-300 text-xs leading-relaxed">{sol.motivo_recusa}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
