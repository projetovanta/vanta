import React, { useMemo } from 'react';
import { Clock, Ticket, XCircle, RefreshCw, UserCheck, Shield, Users, List } from 'lucide-react';
import { auditService, formatAuditLog } from '../../services/auditService';

const ACTION_ICON: Record<string, React.FC<{ size?: number; className?: string }>> = {
  TICKET_VENDIDO: Ticket,
  TICKET_QUEIMADO: UserCheck,
  TICKET_REENVIADO: RefreshCw,
  TICKET_CANCELADO: XCircle,
  SAQUE_SOLICITADO: Ticket,
  SAQUE_CONFIRMADO: Ticket,
  SAQUE_ESTORNADO: XCircle,
  CARGO_ATRIBUIDO: Shield,
  CARGO_REMOVIDO: Shield,
  COTA_DISTRIBUIDA: Users,
  LISTA_INSERIDA: List,
  REEMBOLSO_AUTOMATICO: RefreshCw,
  REEMBOLSO_MANUAL: RefreshCw,
  CHARGEBACK_REGISTRADO: XCircle,
};

const ACTION_COLOR: Record<string, string> = {
  TICKET_VENDIDO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  TICKET_QUEIMADO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  TICKET_REENVIADO: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  TICKET_CANCELADO: 'text-red-400 bg-red-500/10 border-red-500/20',
  CARGO_ATRIBUIDO: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  CARGO_REMOVIDO: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  REEMBOLSO_AUTOMATICO: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  REEMBOLSO_MANUAL: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  CHARGEBACK_REGISTRADO: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const DEFAULT_COLOR = 'text-zinc-400 bg-zinc-800/50 border-white/5';

export const TabLogs: React.FC<{ listaId: string; eventoAdminId?: string }> = ({ listaId, eventoAdminId }) => {
  const logs = useMemo(() => {
    // Logs do auditService (Supabase real) filtrados por evento
    const auditLogs = eventoAdminId
      ? auditService.getLogs().filter(l => l.entityId === eventoAdminId || l.newValue?.evento_id === eventoAdminId)
      : [];

    // Converter audit logs para formato unificado
    const fromAudit = auditLogs.map(l => ({
      id: l.id,
      acao: formatAuditLog(l),
      ts: l.timestamp,
      action: l.action,
      source: 'audit' as const,
    }));

    // Ordenar por timestamp (mais recente primeiro)
    return fromAudit.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [listaId, eventoAdminId]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <Clock size={28} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, i) => {
        const Icon = ACTION_ICON[log.action] ?? Clock;
        const colorCls = ACTION_COLOR[log.action] ?? DEFAULT_COLOR;
        return (
          <div key={log.id} className="flex gap-3 relative">
            {i < logs.length - 1 && <div className="absolute left-[14px] top-8 bottom-0 w-px bg-zinc-800/60" />}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 border ${colorCls}`}>
              <Icon size={12} />
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-zinc-200 text-[11px] leading-snug">{log.acao}</p>
              <p className="text-zinc-700 text-[9px] mt-1 font-black">
                {new Date(log.ts).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
