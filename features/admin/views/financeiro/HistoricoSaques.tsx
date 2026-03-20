import React, { useState, useCallback } from 'react';
import type { SolicitacaoSaque } from '../../services/eventosAdminService';
import { fmtBRL } from '../../../../utils';
import { FileText, Download } from 'lucide-react';
import { exportCSV } from '../../../../utils/exportUtils';

interface Props {
  historico: SolicitacaoSaque[];
}

export const HistoricoSaques: React.FC<Props> = ({ historico }) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Evento',
      'Valor',
      'Líquido',
      'Taxa',
      'PIX Tipo',
      'PIX Chave',
      'Status',
      'Etapa',
      'Data',
      'Comprovante',
    ];
    const rows = historico.map(s => [
      s.eventoNome,
      fmtBRL(s.valor),
      fmtBRL(s.valorLiquido),
      fmtBRL(s.valorTaxa),
      s.pixTipo,
      s.pixChave,
      s.status,
      s.etapa ?? '',
      new Date(s.solicitadoEm).toLocaleDateString('pt-BR'),
      s.comprovanteUrl ? 'Sim' : 'Não',
    ]);
    exportCSV('historico_saques', headers, rows);
  }, [historico]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Histórico de Saques</p>
        {historico.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-[0.5rem] text-zinc-400 font-bold uppercase tracking-wider hover-real:text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
        )}
      </div>
      {historico.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2 opacity-40">
          <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">Nenhum saque realizado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...historico].reverse().map(s => {
            const statusColor =
              s.status === 'CONCLUIDO'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : s.status === 'ESTORNADO' || s.status === 'RECUSADO'
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : s.etapa === 'GERENTE_AUTORIZADO'
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            const data = new Date(s.solicitadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            return (
              <div key={s.id} className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{s.eventoNome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
                      {s.pixTipo} · {data}
                    </p>
                    {s.comprovanteUrl && (
                      <button
                        onClick={() => setViewUrl(s.comprovanteUrl!)}
                        className="flex items-center gap-1 text-[0.5rem] text-emerald-400 font-bold uppercase tracking-wider"
                      >
                        <FileText className="w-3 h-3" />
                        Comprovante
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-white font-black text-sm shrink-0">{fmtBRL(s.valor)}</p>
                <span
                  className={`text-[0.5rem] font-black uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${statusColor}`}
                >
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal visualizar comprovante */}
      {viewUrl && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setViewUrl(null)}
        >
          <div className="w-full max-w-full p-4" onClick={e => e.stopPropagation()}>
            {viewUrl.includes('.pdf') ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-white text-sm font-bold">Comprovante em PDF</p>
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[2.75rem] px-6 flex items-center justify-center bg-[#FFD300] text-black rounded-xl text-xs font-bold"
                >
                  Abrir PDF
                </a>
              </div>
            ) : (
              <img src={viewUrl} alt="Comprovante" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
            )}
            <button
              onClick={() => setViewUrl(null)}
              className="mt-4 w-full min-h-[2.75rem] bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
