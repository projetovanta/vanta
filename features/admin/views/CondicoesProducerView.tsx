/**
 * CondicoesProducerView — Tela do sócio/gerente para ver e aceitar condições comerciais.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Clock, AlertCircle, Banknote, Shield, ListChecks, Star } from 'lucide-react';
import { condicoesService } from '../services/condicoesService';
import { AdminViewHeader } from '../components/AdminViewHeader';
import type { CondicaoComercial } from '../../../types/eventos';
import { useAuthStore } from '../../../stores/authStore';

const pct = (v: number | null) => (v != null ? `${(v * 100).toFixed(1)}%` : '—');
const moeda = (v: number | null) => (v != null ? `R$ ${v.toFixed(2)}` : '—');
const num = (v: number | null) => (v != null ? String(v) : '—');

interface Props {
  onBack: () => void;
  comunidadeId: string;
  comunidadeNome?: string;
}

export const CondicoesProducerView: React.FC<Props> = ({ onBack, comunidadeId, comunidadeNome }) => {
  const currentUserId = useAuthStore(s => s.currentAccount.id);
  const [pendente, setPendente] = useState<CondicaoComercial | null>(null);
  const [historico, setHistorico] = useState<CondicaoComercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showRecusa, setShowRecusa] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [p, h] = await Promise.all([
      condicoesService.getCondicaoPendente(comunidadeId),
      condicoesService.getHistorico(comunidadeId),
    ]);
    setPendente(p);
    setHistorico(h);
    setLoading(false);
  }, [comunidadeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAceitar = async () => {
    if (!pendente) return;
    setActing(true);
    try {
      await condicoesService.aceitarCondicoes(pendente.id, currentUserId);
      setFeedback('Condições aceitas com sucesso!');
      await load();
    } catch (err) {
      setFeedback(`Erro: ${err instanceof Error ? err.message : 'desconhecido'}`);
    } finally {
      setActing(false);
    }
  };

  const handleRecusar = async () => {
    if (!pendente || !motivoRecusa.trim()) return;
    setActing(true);
    try {
      await condicoesService.recusarCondicoes(pendente.id, currentUserId, motivoRecusa.trim());
      setFeedback('Condições recusadas.');
      setShowRecusa(false);
      setMotivoRecusa('');
      await load();
    } catch (err) {
      setFeedback(`Erro: ${err instanceof Error ? err.message : 'desconhecido'}`);
    } finally {
      setActing(false);
    }
  };

  // Dias restantes
  const diasRestantes = pendente
    ? Math.max(0, Math.ceil((new Date(pendente.expiraEm).getTime() - Date.now()) / 86400000))
    : 0;

  const CondCard: React.FC<{ label: string; value: string; icon: typeof Banknote }> = ({
    label,
    value,
    icon: Icon,
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-white/5">
      <Icon size="0.875rem" className="text-zinc-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[0.5rem] text-zinc-500 font-bold uppercase truncate">{label}</p>
        <p className="text-white text-sm font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader title={comunidadeNome || 'Comunidade'} kicker="Condições Comerciais" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Feedback */}
            {feedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {feedback}
              </div>
            )}

            {/* Card de condição pendente */}
            {pendente && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <Clock size="1.25rem" className="text-amber-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">Novas condições definidas</p>
                    <p className="text-amber-400/70 text-xs">
                      {diasRestantes > 0
                        ? `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''}`
                        : 'Prazo expirado'}
                    </p>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-2 gap-2">
                  <CondCard label="Taxa Serviço" value={pct(pendente.taxaServicoPercent)} icon={Banknote} />
                  <CondCard label="Taxa Processamento" value={pct(pendente.taxaProcessamentoPercent)} icon={Shield} />
                  <CondCard label="Mínimo/ingresso" value={moeda(pendente.taxaMinima)} icon={Banknote} />
                  <CondCard label="Taxa Porta" value={pct(pendente.taxaPortaPercent)} icon={Shield} />
                  <CondCard label="Nomes grátis lista" value={num(pendente.cotaNomesLista)} icon={ListChecks} />
                  <CondCard label="Cortesias grátis" value={num(pendente.cotaCortesias)} icon={Star} />
                  <CondCard label="R$/nome excedente" value={moeda(pendente.taxaNomeExcedente)} icon={ListChecks} />
                  <CondCard
                    label="Prazo pagamento"
                    value={pendente.prazoPagamentoDias ? `${pendente.prazoPagamentoDias} dias` : '—'}
                    icon={Clock}
                  />
                </div>

                {pendente.observacoes && (
                  <p className="text-zinc-400 text-xs italic">&ldquo;{pendente.observacoes}&rdquo;</p>
                )}

                {/* Botões aceitar/recusar */}
                {!showRecusa ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAceitar}
                      disabled={acting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Check size="0.875rem" />
                      {acting ? 'Processando...' : 'Aceitar'}
                    </button>
                    <button
                      onClick={() => setShowRecusa(true)}
                      disabled={acting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 border border-white/10 text-zinc-300 font-bold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <X size="0.875rem" />
                      Recusar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={motivoRecusa}
                      onChange={e => setMotivoRecusa(e.target.value)}
                      placeholder="Por que está recusando? (obrigatório)"
                      rows={3}
                      className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm outline-none placeholder:text-zinc-600 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleRecusar}
                        disabled={acting || !motivoRecusa.trim()}
                        className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        Confirmar Recusa
                      </button>
                      <button
                        onClick={() => {
                          setShowRecusa(false);
                          setMotivoRecusa('');
                        }}
                        className="px-4 py-3 bg-zinc-800 text-zinc-400 text-sm rounded-xl"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[0.5625rem] text-zinc-600 text-center">
                  Se não aceitar em 7 dias, suas atividades serão pausadas automaticamente.
                </p>
              </div>
            )}

            {/* Sem pendência */}
            {!pendente && historico.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <Check size="1.25rem" className="text-emerald-400" />
                <div>
                  <p className="text-white text-sm font-bold">Condições vigentes</p>
                  <p className="text-emerald-400/70 text-xs">
                    Aceitas em{' '}
                    {historico[0]?.aceitoEm ? new Date(historico[0].aceitoEm).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
              </div>
            )}

            {!pendente && historico.length === 0 && (
              <div className="p-8 text-center">
                <AlertCircle size="2rem" className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Nenhuma condição comercial definida ainda.</p>
              </div>
            )}

            {/* Histórico */}
            {historico.length > 0 && (
              <div className="space-y-2">
                <p className="text-[0.625rem] font-black uppercase tracking-wider text-zinc-500">Histórico</p>
                {historico.map(h => {
                  const statusColor =
                    h.status === 'ACEITO'
                      ? 'text-emerald-400'
                      : h.status === 'PENDENTE'
                        ? 'text-amber-400'
                        : 'text-red-400';
                  return (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-zinc-900/20 border border-white/5 flex items-center gap-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          h.status === 'ACEITO'
                            ? 'bg-emerald-400'
                            : h.status === 'PENDENTE'
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${statusColor}`}>{h.status}</p>
                        <p className="text-[0.5rem] text-zinc-500">
                          Serviço: {pct(h.taxaServicoPercent)} · Mínimo: {moeda(h.taxaMinima)}
                        </p>
                      </div>
                      <span className="text-[0.5rem] text-zinc-600 shrink-0">
                        {new Date(h.definidoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
