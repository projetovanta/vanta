import React, { useMemo, useCallback } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { listasService } from '../services/listasService';
import { exportCSV, exportPDF } from '../../../utils/exportUtils';

export const PromoterCotasView: React.FC<{
  listaId: string;
  onBack: () => void;
  currentUserId: string;
}> = ({ listaId, onBack, currentUserId }) => {
  const lista = useMemo(() => listasService.getLista(listaId), [listaId]);

  const cotasPromoter = useMemo(
    () => lista?.cotas.filter(c => c.promoterId === currentUserId) ?? [],
    [lista, currentUserId],
  );

  const meusConvidados = useMemo(
    () => lista?.convidados.filter(c => c.inseridoPor === currentUserId) ?? [],
    [lista, currentUserId],
  );

  const handleExportCSV = useCallback(() => {
    if (!lista) return;
    const headers = ['Nome', 'Regra', 'Inserido Em', 'Check-in', 'Check-in Em'];
    const rows = meusConvidados.map(c => [
      c.nome,
      c.regraLabel,
      c.inseridoEm,
      c.checkedIn ? 'Sim' : 'Não',
      c.checkedInEm ?? '',
    ]);
    exportCSV(`cotas_${lista.eventoNome.replace(/\s+/g, '_')}`, headers, rows);
  }, [lista, meusConvidados]);

  const handleExportPDF = useCallback(() => {
    if (!lista) return;
    const headers = ['Nome', 'Regra', 'Check-in'];
    const rows = meusConvidados.map(c => [c.nome, c.regraLabel, c.checkedIn ? 'Sim' : 'Não']);
    const totalAlocado = cotasPromoter.reduce((s, c) => s + c.alocado, 0);
    const totalUsado = cotasPromoter.reduce((s, c) => s + c.usado, 0);
    const checkins = meusConvidados.filter(c => c.checkedIn).length;
    void exportPDF({
      titulo: `Cotas — ${lista.eventoNome}`,
      subtitulo: lista.eventoLocal,
      headers,
      rows,
      resumo: [
        { label: 'Alocado', valor: String(totalAlocado) },
        { label: 'Usado', valor: String(totalUsado) },
        { label: 'Check-ins', valor: String(checkins) },
        {
          label: 'Conversão',
          valor: meusConvidados.length > 0 ? `${Math.round((checkins / meusConvidados.length) * 100)}%` : '0%',
        },
      ],
    });
  }, [lista, meusConvidados, cotasPromoter]);

  if (!lista) {
    return (
      <div className="flex-1 bg-[#0A0A0A] flex flex-col items-center justify-center gap-3">
        <p className="text-zinc-400 text-sm">Lista não encontrada.</p>
        <button onClick={onBack} className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader
        title={lista.eventoNome}
        kicker="Minhas Cotas"
        subtitle={lista.eventoLocal}
        onBack={onBack}
        actions={[
          { icon: Download, label: 'CSV', onClick: handleExportCSV },
          { icon: FileText, label: 'PDF', onClick: handleExportPDF },
        ]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        {/* Tabela de cotas por regra */}
        <div>
          <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Cotas por Regra</p>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 py-2 border-b border-white/5">
              <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest">Regra</p>
              <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest text-right">Alocado</p>
              <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest text-right">Usado</p>
              <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest text-right">Saldo</p>
            </div>
            {cotasPromoter.length === 0 ? (
              <p className="text-zinc-700 text-[0.625rem] italic px-4 py-3">Sem cotas atribuídas</p>
            ) : (
              cotasPromoter.map(cota => {
                const regra = lista.regras.find(r => r.id === cota.regraId);
                const saldo = cota.alocado - cota.usado;
                return (
                  <div
                    key={cota.regraId}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 py-2.5 border-b border-white/[0.02] last:border-0"
                  >
                    <p className="text-zinc-300 text-xs truncate">{regra?.label ?? cota.regraId}</p>
                    <p className="text-zinc-400 text-xs text-right tabular-nums w-10">{cota.alocado}</p>
                    <p className="text-white text-xs font-bold text-right tabular-nums w-10">{cota.usado}</p>
                    <p
                      className={`text-xs font-bold text-right tabular-nums w-10 ${saldo > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}
                    >
                      {saldo}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lista de convidados */}
        <div>
          <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
            Convidados ({meusConvidados.length})
          </p>
          {meusConvidados.length === 0 ? (
            <p className="text-zinc-700 text-[0.625rem] italic">Nenhum convidado inserido ainda.</p>
          ) : (
            <div className="space-y-1.5">
              {meusConvidados.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-zinc-900/30 border border-white/[0.03] rounded-xl px-4 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{c.nome}</p>
                    <p className="text-zinc-400 text-[0.5625rem] truncate">{c.regraLabel}</p>
                  </div>
                  <span
                    className={`text-[0.4375rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                      c.checkedIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {c.checkedIn ? 'Entrou' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
