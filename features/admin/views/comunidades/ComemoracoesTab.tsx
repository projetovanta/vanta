import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Clock,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Phone,
  Instagram,
  Cake,
  Calendar,
  Link2,
  Copy,
  ShoppingCart,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { comemoracaoService, Comemoracao } from '../../../../services/comemoracaoService';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ENVIADA: { label: 'Nova', color: '#A78BFA' },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA' },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24' },
  APROVADA: { label: 'Aprovada', color: '#34D399' },
  RECUSADA: { label: 'Recusada', color: '#F87171' },
};

const MOTIVO_LABEL: Record<string, string> = {
  ANIVERSARIO: 'Aniversário',
  DESPEDIDA: 'Despedida',
  OUTRO: 'Outro',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

function formatSimpleDate(date: string): string {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return date;
}

interface Props {
  comunidadeId: string;
}

export const ComemoracoesTab: React.FC<Props> = ({ comunidadeId }) => {
  const [lista, setLista] = useState<Comemoracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => {
    comemoracaoService.listarPorComunidade(comunidadeId).then(data => {
      setLista(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadeId]);

  const handleExpand = async (sol: Comemoracao) => {
    if (expandedId === sol.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sol.id);
    if (sol.status === 'ENVIADA') {
      await comemoracaoService.marcarVisualizada(sol.id);
      load();
    }
  };

  const handleEmAnalise = async (id: string) => {
    setActionId(id);
    await comemoracaoService.marcarEmAnalise(id);
    load();
    setActionId(null);
  };

  const handleAprovar = async (id: string) => {
    setActionId(id);
    await comemoracaoService.aprovar(id, mensagem || undefined);
    setMensagem('');
    load();
    setActionId(null);
  };

  const handleRecusar = async (id: string) => {
    if (!motivoRecusa.trim()) return;
    setActionId(id);
    await comemoracaoService.recusar(id, motivoRecusa, mensagem || undefined);
    setMotivoRecusa('');
    setMensagem('');
    load();
    setActionId(null);
  };

  const copyRefLink = (refCode: string) => {
    const url = `${window.location.origin}?ref=${refCode}`;
    navigator.clipboard.writeText(url);
    setCopied(refCode);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (lista.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
          <Cake size={24} className="text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-sm">Nenhuma solicitação de comemoração</p>
      </div>
    );
  }

  const pendentes = lista.filter(s => !['APROVADA', 'RECUSADA'].includes(s.status));
  const resolvidas = lista.filter(s => ['APROVADA', 'RECUSADA'].includes(s.status));

  const renderCard = (sol: Comemoracao) => {
    const isExpanded = expandedId === sol.id;
    const cfg = STATUS_CONFIG[sol.status] ?? STATUS_CONFIG.ENVIADA;
    const isProcessing = actionId === sol.id;
    const canAct = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE'].includes(sol.status);

    return (
      <div key={sol.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
        <button
          onClick={() => handleExpand(sol)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-zinc-800/30 transition-colors"
        >
          {sol.solicitante?.foto && (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-800 border border-white/10">
              <img src={sol.solicitante.foto} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{sol.nome_completo}</p>
            <p className="text-zinc-500 text-[10px] truncate">
              {MOTIVO_LABEL[sol.motivo] ?? sol.motivo} · {formatSimpleDate(sol.data_comemoracao)}
            </p>
          </div>
          {sol.status === 'APROVADA' && (
            <div className="flex items-center gap-1 shrink-0 mr-1">
              <ShoppingCart size={10} className="text-[#FFD300]" />
              <span className="text-[9px] font-black text-[#FFD300]">{sol.vendas_count}</span>
            </div>
          )}
          <span
            className="shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
            style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
          >
            {cfg.label}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-zinc-600 shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-zinc-600 shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Phone size={12} className="shrink-0" />
                <span className="truncate">{sol.celular}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Instagram size={12} className="shrink-0" />
                <span className="truncate">{sol.instagram}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Cake size={12} className="shrink-0" />
                <span className="truncate">
                  {MOTIVO_LABEL[sol.motivo]}
                  {sol.motivo_outro ? `: ${sol.motivo_outro}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Calendar size={12} className="shrink-0" />
                <span className="truncate">{formatSimpleDate(sol.data_comemoracao)}</span>
              </div>
            </div>

            {sol.data_aniversario && (
              <p className="text-[10px] text-zinc-500">Aniversário: {formatSimpleDate(sol.data_aniversario)}</p>
            )}

            {/* Link de vendas (se aprovado) */}
            {sol.ref_code && (
              <div className="flex items-center gap-2 bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-xl p-3">
                <Link2 size={14} className="text-[#FFD300] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Link de vendas</p>
                  <p className="text-xs text-[#FFD300] font-bold truncate">{sol.ref_code}</p>
                </div>
                <button
                  onClick={() => copyRefLink(sol.ref_code!)}
                  className="shrink-0 w-8 h-8 bg-[#FFD300]/10 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                >
                  {copied === sol.ref_code ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} className="text-[#FFD300]" />
                  )}
                </button>
              </div>
            )}

            <p className="text-[9px] text-zinc-600">Enviada em {formatDate(sol.created_at)}</p>

            {canAct && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    Mensagem (opcional)
                  </p>
                  <input
                    type="text"
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    placeholder="Ex: Parabéns! Vamos preparar tudo..."
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD300]/50"
                  />
                </div>

                <div className="flex gap-2">
                  {sol.status !== 'EM_ANALISE' && (
                    <button
                      onClick={() => handleEmAnalise(sol.id)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] font-bold text-yellow-400 uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Search size={12} className="inline mr-1" />
                      Em análise
                    </button>
                  )}
                  <button
                    onClick={() => handleAprovar(sol.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={12} className="inline mr-1" />
                    Aprovar
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={motivoRecusa}
                    onChange={e => setMotivoRecusa(e.target.value)}
                    placeholder="Motivo da recusa (obrigatório)"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50"
                  />
                  <button
                    onClick={() => handleRecusar(sol.id)}
                    disabled={isProcessing || !motivoRecusa.trim()}
                    className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                  >
                    <XCircle size={12} className="inline mr-1" />
                    Recusar
                  </button>
                </div>
              </div>
            )}

            {sol.mensagem_gerente && !canAct && (
              <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                <MessageSquare size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-zinc-300 text-xs">{sol.mensagem_gerente}</p>
              </div>
            )}

            {sol.status === 'RECUSADA' && sol.motivo_recusa && (
              <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs">{sol.motivo_recusa}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-3 flex items-center gap-2">
            <Clock size={12} className="text-[#FFD300]" />
            Pendentes ({pendentes.length})
          </p>
          <div className="space-y-3">{pendentes.map(renderCard)}</div>
        </div>
      )}

      {resolvidas.length > 0 && (
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-3 flex items-center gap-2">
            <CheckCircle size={12} className="text-zinc-600" />
            Resolvidas ({resolvidas.length})
          </p>
          <div className="space-y-3">{resolvidas.map(renderCard)}</div>
        </div>
      )}
    </div>
  );
};
