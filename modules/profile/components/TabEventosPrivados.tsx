import React from 'react';
import { Clock, CheckCircle, XCircle, Eye, Search, Sparkles, MessageSquare, PartyPopper } from 'lucide-react';
import { EventoPrivado } from '../../../services/eventoPrivadoService';

// ── Config ──────────────────────────────────────────────────────────────────

const EP_STATUS: Record<
  string,
  { label: string; color: string; icon: React.FC<{ size?: string | number; className?: string }> }
> = {
  ENVIADA: { label: 'Enviada', color: '#A78BFA', icon: Clock },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA', icon: Eye },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24', icon: Search },
  APROVADA: { label: 'Aprovada', color: '#34D399', icon: CheckCircle },
  RECUSADA: { label: 'Recusada', color: '#F87171', icon: XCircle },
  CONVERTIDA: { label: 'Evento criado', color: '#FFD300', icon: Sparkles },
};

const EP_TIMELINE_ORDER = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Component ───────────────────────────────────────────────────────────────

export function TabEventosPrivados({ items }: { items: EventoPrivado[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <PartyPopper size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhuma solicitação de evento privado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(sol => {
        const currentCfg = EP_STATUS[sol.status] ?? EP_STATUS.ENVIADA;
        const CurrentIcon = currentCfg.icon;

        // Build timeline
        const timeline = EP_TIMELINE_ORDER.map(s => {
          const cfg = EP_STATUS[s];
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
          if (s === 'APROVADA' && (sol.status === 'APROVADA' || sol.status === 'CONVERTIDA')) {
            timestamp = sol.avaliado_em;
            reached = true;
          }

          return { key: s, label: cfg.label, color: cfg.color, icon: cfg.icon, timestamp, reached };
        });

        if (sol.status === 'RECUSADA') {
          timeline[timeline.length - 1] = {
            key: 'RECUSADA',
            label: 'Recusada',
            color: '#F87171',
            icon: XCircle,
            timestamp: sol.avaliado_em,
            reached: true,
          };
        }

        return (
          <div key={sol.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{sol.empresa}</p>
                <p className="text-[0.625rem] text-zinc-500 truncate">
                  {sol.data_evento || sol.data_estimativa || 'Data a definir'} · {sol.faixa_capacidade}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0"
                style={{ backgroundColor: currentCfg.color + '20', color: currentCfg.color }}
              >
                <CurrentIcon size="0.625rem" />
                {currentCfg.label}
              </span>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-1">
              {timeline.map((step, i) => {
                const StepIcon = step.icon;
                return (
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
                        <StepIcon size="0.875rem" />
                      </div>
                      <span className="text-[0.5rem] text-zinc-400 text-center leading-tight w-14 truncate">
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
                );
              })}
            </div>

            {/* Mensagem do gerente */}
            {sol.mensagem_gerente && (
              <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                <MessageSquare size="0.75rem" className="text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-zinc-300 text-xs leading-relaxed">{sol.mensagem_gerente}</p>
              </div>
            )}

            {/* Motivo recusa */}
            {sol.status === 'RECUSADA' && sol.motivo_recusa && (
              <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <XCircle size="0.75rem" className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{sol.motivo_recusa}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
