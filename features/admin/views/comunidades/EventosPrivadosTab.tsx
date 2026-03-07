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
  Mail,
  Instagram,
  Building2,
  Users,
  Calendar,
  Sun,
  Moon,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { eventoPrivadoService, EventoPrivado } from '../../../../services/eventoPrivadoService';
import { eventosAdminService } from '../../services/eventosAdminService';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ENVIADA: { label: 'Nova', color: '#A78BFA' },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA' },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24' },
  APROVADA: { label: 'Aprovada', color: '#34D399' },
  RECUSADA: { label: 'Recusada', color: '#F87171' },
  CONVERTIDA: { label: 'Evento criado', color: '#FFD300' },
};

const HORARIO_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  DIURNO: { label: 'Diurno', icon: <Sun size={12} /> },
  NOTURNO: { label: 'Noturno', icon: <Moon size={12} /> },
  DIA_INTEIRO: { label: 'Dia inteiro', icon: <Sparkles size={12} /> },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

interface Props {
  comunidadeId: string;
}

export const EventosPrivadosTab: React.FC<Props> = ({ comunidadeId }) => {
  const [solicitacoes, setSolicitacoes] = useState<EventoPrivado[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [convertId, setConvertId] = useState<string | null>(null);
  const [convertEventoId, setConvertEventoId] = useState('');

  const load = () => {
    eventoPrivadoService.listarPorComunidade(comunidadeId).then(data => {
      setSolicitacoes(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadeId]);

  const handleExpand = async (sol: EventoPrivado) => {
    if (expandedId === sol.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sol.id);
    // Auto-marcar como visualizada
    if (sol.status === 'ENVIADA') {
      await eventoPrivadoService.marcarVisualizada(sol.id);
      load();
    }
  };

  const handleEmAnalise = async (id: string) => {
    setActionId(id);
    await eventoPrivadoService.marcarEmAnalise(id);
    load();
    setActionId(null);
  };

  const handleAprovar = async (id: string) => {
    setActionId(id);
    await eventoPrivadoService.aprovar(id, mensagem || undefined);
    setMensagem('');
    load();
    setActionId(null);
  };

  const handleRecusar = async (id: string) => {
    if (!motivoRecusa.trim()) return;
    setActionId(id);
    await eventoPrivadoService.recusar(id, motivoRecusa, mensagem || undefined);
    setMotivoRecusa('');
    setMensagem('');
    load();
    setActionId(null);
  };

  const handleConverter = async (id: string) => {
    if (!convertEventoId) return;
    setActionId(id);
    await eventoPrivadoService.converter(id, convertEventoId);
    setConvertId(null);
    setConvertEventoId('');
    load();
    setActionId(null);
  };

  const eventosComunidade = eventosAdminService.getEventosByComunidade(comunidadeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
          <Calendar size={24} className="text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-sm">Nenhuma solicitação de evento privado</p>
      </div>
    );
  }

  const pendentes = solicitacoes.filter(s => !['APROVADA', 'RECUSADA', 'CONVERTIDA'].includes(s.status));
  const resolvidas = solicitacoes.filter(s => ['APROVADA', 'RECUSADA', 'CONVERTIDA'].includes(s.status));

  const renderCard = (sol: EventoPrivado) => {
    const isExpanded = expandedId === sol.id;
    const cfg = STATUS_CONFIG[sol.status] ?? STATUS_CONFIG.ENVIADA;
    const hor = HORARIO_LABEL[sol.horario];
    const isProcessing = actionId === sol.id;
    const canAct = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE'].includes(sol.status);

    return (
      <div key={sol.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
        {/* Header clicável */}
        <button
          onClick={() => handleExpand(sol)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-zinc-800/30 transition-colors"
        >
          {/* Avatar solicitante */}
          {sol.solicitante?.foto && (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-800 border border-white/10">
              <img src={sol.solicitante.foto} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{sol.nome_completo}</p>
            <p className="text-zinc-500 text-[10px] truncate">
              {sol.empresa} · {sol.data_evento || sol.data_estimativa || 'Data a definir'}
            </p>
          </div>
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

        {/* Detalhes expandidos */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
            {/* Info de contato */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Phone size={12} className="shrink-0" />
                <span className="truncate">{sol.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{sol.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Instagram size={12} className="shrink-0" />
                <span className="truncate">{sol.instagram}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Building2 size={12} className="shrink-0" />
                <span className="truncate">{sol.empresa}</span>
              </div>
            </div>

            {/* Detalhes do evento */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-zinc-800 rounded-lg text-[10px] text-zinc-300 flex items-center gap-1">
                <Users size={10} /> {sol.faixa_capacidade}
              </span>
              {hor && (
                <span className="px-2 py-1 bg-zinc-800 rounded-lg text-[10px] text-zinc-300 flex items-center gap-1">
                  {hor.icon} {hor.label}
                </span>
              )}
              {sol.formatos?.map((f: string) => (
                <span key={f} className="px-2 py-1 bg-zinc-800 rounded-lg text-[10px] text-zinc-300">
                  {f}
                </span>
              ))}
              {sol.atracoes?.map((a: string) => (
                <span key={a} className="px-2 py-1 bg-[#FFD300]/10 rounded-lg text-[10px] text-[#FFD300]">
                  {a}
                </span>
              ))}
            </div>

            {/* Descrição */}
            <div className="bg-zinc-800/50 rounded-xl p-3">
              <p className="text-zinc-300 text-xs leading-relaxed">{sol.descricao}</p>
            </div>

            <p className="text-[9px] text-zinc-600">Enviada em {formatDate(sol.created_at)}</p>

            {/* Ações */}
            {canAct && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                {/* Mensagem opcional */}
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    Mensagem (opcional)
                  </p>
                  <input
                    type="text"
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    placeholder="Ex: Vamos alinhar detalhes por WhatsApp..."
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

                {/* Recusar */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={motivoRecusa}
                    onChange={e => setMotivoRecusa(e.target.value)}
                    placeholder="Motivo da recusa (obrigatório para recusar)"
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

            {/* Mensagem do gerente (se já respondeu) */}
            {sol.mensagem_gerente && !canAct && (
              <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                <MessageSquare size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-zinc-300 text-xs">{sol.mensagem_gerente}</p>
              </div>
            )}

            {/* Converter em evento real */}
            {sol.status === 'APROVADA' && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                {convertId === sol.id ? (
                  <>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      Selecione o evento criado para vincular
                    </p>
                    <div className="space-y-2">
                      {eventosComunidade.length === 0 ? (
                        <p className="text-zinc-600 text-xs">Nenhum evento nesta comunidade. Crie o evento primeiro.</p>
                      ) : (
                        <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                          {eventosComunidade.map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => setConvertEventoId(ev.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${convertEventoId === ev.id ? 'bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300]' : 'bg-zinc-800/50 border border-white/5 text-zinc-300'}`}
                            >
                              {ev.nome}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setConvertId(null);
                            setConvertEventoId('');
                          }}
                          className="flex-1 py-2 bg-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-wider active:scale-95 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleConverter(sol.id)}
                          disabled={!convertEventoId || actionId === sol.id}
                          className="flex-1 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[10px] font-bold text-[#FFD300] uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Zap size={12} className="inline mr-1" />
                          Vincular
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setConvertId(sol.id)}
                    className="w-full py-2.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[10px] font-bold text-[#FFD300] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap size={12} />
                    Converter em Evento
                  </button>
                )}
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
