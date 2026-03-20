import React, { useCallback } from 'react';
import { RotateCcw, Check, Download } from 'lucide-react';
import type { Reembolso, StatusReembolso } from '../../services/eventosAdminTypes';
import { fmtBRL } from '../../../../utils';
import { exportCSV } from '../../../../utils/exportUtils';

interface Props {
  reembolsos: Reembolso[];
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onSolicitarManual: () => void;
  currentUserRole?: 'SOCIO' | 'GERENTE' | 'MASTER' | string;
}

const STATUS_LABELS: Record<StatusReembolso, string> = {
  PENDENTE_APROVACAO: 'Pendente',
  AGUARDANDO_SOCIO: 'Aguardando sócio',
  AGUARDANDO_GERENTE: 'Aguardando gerente',
  AGUARDANDO_MASTER: 'Aguardando master',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

function podeAprovar(status: StatusReembolso, role?: string): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  if (r === 'MASTER' || r === 'VANTA_MASTERADM') return true; // master pode em qualquer nível
  if (status === 'AGUARDANDO_SOCIO' && r === 'SOCIO') return true;
  if (status === 'AGUARDANDO_GERENTE' && r === 'GERENTE') return true;
  // PENDENTE_APROVACAO = retrocompat (qualquer admin pode)
  if (status === 'PENDENTE_APROVACAO') return true;
  return false;
}

export const ReembolsosSection: React.FC<Props> = ({
  reembolsos,
  onAprovar,
  onRejeitar,
  onSolicitarManual,
  currentUserRole,
}) => {
  const handleExportCSV = useCallback(() => {
    const headers = ['Tipo', 'Valor', 'Status', 'Motivo', 'Solicitante', 'Data', 'Evento'];
    const rows = reembolsos.map(r => [
      r.tipo,
      fmtBRL(r.valor),
      r.status,
      r.motivo ?? '',
      r.solicitadoNome ?? r.solicitadoPor ?? '',
      new Date(r.solicitadoEm).toLocaleDateString('pt-BR'),
      r.eventoNome ?? '',
    ]);
    exportCSV('reembolsos', headers, rows);
  }, [reembolsos]);

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw size="0.8125rem" className="text-orange-400 shrink-0" />
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Reembolsos</p>
        </div>
        <div className="flex items-center gap-3">
          {reembolsos.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 text-[0.5rem] text-zinc-400 font-bold uppercase tracking-wider hover-real:text-white transition-colors"
            >
              <Download size="0.75rem" />
              CSV
            </button>
          )}
          {reembolsos.length > 0 && (
            <p className="text-orange-400 font-black text-sm">{fmtBRL(reembolsos.reduce((s, r) => s + r.valor, 0))}</p>
          )}
        </div>
      </div>
      {reembolsos.length === 0 ? (
        <div className="flex flex-col items-center py-5 gap-2 opacity-40">
          <Check size="1rem" className="text-zinc-700" />
          <p className="text-zinc-700 text-[0.5625rem] font-black uppercase tracking-widest">Nenhum reembolso</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reembolsos.map(r => {
            const data = new Date(r.solicitadoEm).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });
            const status = r.status ?? 'PENDENTE_APROVACAO';
            const statusColor =
              r.tipo === 'AUTOMATICO'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : status === 'APROVADO'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : status === 'REJEITADO'
                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            const showButtons = r.tipo === 'MANUAL' && podeAprovar(status, currentUserRole);
            return (
              <div
                key={r.id}
                className={`border rounded-xl p-3 ${showButtons ? 'bg-amber-500/5 border-amber-500/15' : 'bg-orange-500/5 border-orange-500/15'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-orange-300 text-xs font-bold truncate">
                      {r.tipo === 'AUTOMATICO' ? 'Reembolso Automático' : 'Reembolso Manual'}
                    </p>
                    <p className="text-zinc-400 text-[0.5625rem] mt-0.5 truncate">{data}</p>
                    <p className="text-zinc-400 text-[0.5625rem] mt-0.5 line-clamp-2">Motivo: {r.motivo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-orange-400 font-black text-sm">{fmtBRL(r.valor)}</p>
                    <span
                      className={`text-[0.4375rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border block mt-1 ${statusColor}`}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                </div>
                {showButtons && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-amber-500/10">
                    <button
                      onClick={() => onAprovar(r.id)}
                      className="flex-1 py-2 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg text-[0.5rem] font-black uppercase tracking-wider active:scale-95 transition-all"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => onRejeitar(r.id)}
                      className="flex-1 py-2 bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg text-[0.5rem] font-black uppercase tracking-wider active:scale-95 transition-all"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {reembolsos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
          <div className="text-center">
            <p className="text-emerald-400 text-xs font-bold">
              {reembolsos.filter(r => r.tipo === 'AUTOMATICO').length}
            </p>
            <p className="text-zinc-700 text-[0.4375rem] font-black uppercase tracking-wider">Automáticos (CDC)</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 text-xs font-bold">{reembolsos.filter(r => r.tipo === 'MANUAL').length}</p>
            <p className="text-zinc-700 text-[0.4375rem] font-black uppercase tracking-wider">Manuais</p>
          </div>
        </div>
      )}
      <button
        onClick={onSolicitarManual}
        className="w-full py-3 rounded-xl font-black text-[0.625rem] uppercase tracking-widest text-orange-400 border border-orange-500/30 bg-orange-500/5 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw size="0.75rem" /> Solicitar Reembolso Manual
      </button>
    </div>
  );
};
