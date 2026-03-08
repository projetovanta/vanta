import React from 'react';
import type { SolicitacaoSaque } from '../../services/eventosAdminService';
import { fmtBRL } from '../../../../utils';

interface Props {
  historico: SolicitacaoSaque[];
}

export const HistoricoSaques: React.FC<Props> = ({ historico }) => {
  return (
    <div>
      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-3">Histórico de Saques</p>
      {historico.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2 opacity-40">
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Nenhum saque realizado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...historico].reverse().map(s => {
            const statusColor =
              s.status === 'CONCLUIDO'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : s.status === 'ESTORNADO' || s.status === 'RECUSADO'
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : s.status === 'GERENTE_AUTORIZADO'
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            const data = new Date(s.solicitadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            return (
              <div key={s.id} className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{s.eventoNome}</p>
                  <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5">
                    {s.pixTipo} · {data}
                  </p>
                </div>
                <p className="text-white font-black text-sm shrink-0">{fmtBRL(s.valor)}</p>
                <span
                  className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${statusColor}`}
                >
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
