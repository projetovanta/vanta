import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Comunidade } from '../../../../types';
import { auditService, formatAuditLog } from '../../services/auditService';
import { eventosAdminService } from '../../services/eventosAdminService';

export const LogsTab: React.FC<{ comunidade: Comunidade }> = ({ comunidade }) => {
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!auditService.isReady) {
      setLoading(true);
      auditService.refresh().finally(() => {
        setLoading(false);
        setTick(t => t + 1);
      });
    }
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await auditService.refresh();
    setTick(t => t + 1);
    setLoading(false);
  };

  // Pegar logs da comunidade + logs de eventos dessa comunidade
  const logsComm = auditService.getByEntity('COMUNIDADE', comunidade.id);
  const eventosIds = new Set(eventosAdminService.getEventosByComunidade(comunidade.id).map(e => e.id));
  const logsEventos = auditService.getLogs().filter(l => l.entityType === 'EVENTO' && eventosIds.has(l.entityId));

  const allLogs = [...logsComm, ...logsEventos].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <RefreshCw size="1.25rem" className="text-zinc-400 animate-spin" />
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">Carregando logs...</p>
      </div>
    );
  }

  if (allLogs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <Clock size="1.75rem" className="text-zinc-800" />
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
          Nenhuma atividade registrada
        </p>
        <p className="text-zinc-800 text-[0.5625rem] italic text-center max-w-[13.75rem]">
          Edições, mudanças na equipe e novos eventos serão registrados aqui.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
        >
          <RefreshCw size="0.75rem" /> Atualizar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0 pt-1">
      <div className="flex justify-end mb-3">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 border border-white/5 rounded-lg text-zinc-400 text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-40"
        >
          <RefreshCw size="0.6875rem" className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {allLogs.slice(0, 50).map((log, i) => {
        const date = new Date(log.timestamp);
        const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const isLast = i === Math.min(allLogs.length, 50) - 1;
        const humanized = formatAuditLog(log);
        const actorName = log.oldValue?.actor as string | undefined;

        return (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#FFD300] mt-1.5" />
              {!isLast && <div className="w-px flex-1 bg-zinc-800/80 mt-1 mb-1" />}
            </div>

            <div className={`${isLast ? 'pb-2' : 'pb-4'} min-w-0`}>
              <p className="text-sm leading-tight mb-0.5">
                {actorName ? (
                  <>
                    <span className="text-[#FFD300] font-bold">{actorName}</span>{' '}
                    <span className="text-zinc-400">{humanized.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : (
                  <span className="text-zinc-400">{humanized}</span>
                )}
              </p>
              <p className="text-zinc-400 text-[0.5625rem]">
                {dateLabel} · {timeLabel}
              </p>
            </div>
          </div>
        );
      })}

      {allLogs.length > 50 && (
        <p className="text-zinc-700 text-[0.5625rem] text-center pt-3">Mostrando 50 de {allLogs.length} logs</p>
      )}
    </div>
  );
};
