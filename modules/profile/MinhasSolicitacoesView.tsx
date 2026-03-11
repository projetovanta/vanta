import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Sparkles,
  MessageSquare,
  PartyPopper,
  Cake,
  ShoppingCart,
  Link2,
  Copy,
  Gift,
  Save,
  QrCode,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TYPOGRAPHY } from '../../constants';
import { eventoPrivadoService, EventoPrivado } from '../../services/eventoPrivadoService';
import { comemoracaoService, Comemoracao, ComemoracaoFaixa } from '../../services/comemoracaoService';

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  ENVIADA: { label: 'Enviada', color: '#A78BFA' },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA' },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24' },
  APROVADA: { label: 'Aprovada', color: '#34D399' },
  RECUSADA: { label: 'Recusada', color: '#F87171' },
  CONVERTIDA: { label: 'Evento criado', color: '#FFD300' },
};

const TIMELINE_STEPS = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
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

type TabType = 'PRIVADOS' | 'COMEMORACOES';

interface TimelineStep {
  key: string;
  label: string;
  color: string;
  timestamp: string | null;
  reached: boolean;
}

function buildTimeline(
  status: string,
  created_at: string,
  visualizado_em: string | null,
  em_analise_em: string | null,
  avaliado_em: string | null,
): TimelineStep[] {
  const steps = TIMELINE_STEPS.map(s => {
    const cfg = STATUS_CFG[s] ?? STATUS_CFG.ENVIADA;
    let timestamp: string | null = null;
    let reached = false;

    if (s === 'ENVIADA') {
      timestamp = created_at;
      reached = true;
    }
    if (s === 'VISUALIZADA' && visualizado_em) {
      timestamp = visualizado_em;
      reached = true;
    }
    if (s === 'EM_ANALISE' && em_analise_em) {
      timestamp = em_analise_em;
      reached = true;
    }
    if (s === 'APROVADA' && (status === 'APROVADA' || status === 'CONVERTIDA')) {
      timestamp = avaliado_em;
      reached = true;
    }

    return { key: s, label: cfg.label, color: cfg.color, timestamp, reached };
  });

  if (status === 'RECUSADA') {
    steps[steps.length - 1] = {
      key: 'RECUSADA',
      label: 'Recusada',
      color: '#F87171',
      timestamp: avaliado_em,
      reached: true,
    };
  }

  return steps;
}

interface Props {
  onBack: () => void;
}

export const MinhasSolicitacoesView: React.FC<Props> = ({ onBack }) => {
  const [tab, setTab] = useState<TabType>('PRIVADOS');
  const [privados, setPrivados] = useState<EventoPrivado[]>([]);
  const [comemoracoes, setComemoracoes] = useState<Comemoracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [faixasMap, setFaixasMap] = useState<Record<string, ComemoracaoFaixa[]>>({});
  const [cortesiasMap, setCortesiasMap] = useState<
    Record<
      string,
      { id: string; nome_convidado: string | null; celular_convidado: string | null; resgatado: boolean }[]
    >
  >({});
  const [cortesiaEdits, setCortesiaEdits] = useState<Record<string, { nome: string; celular: string }>>({});
  const [savingCortesia, setSavingCortesia] = useState<string | null>(null);
  const [qrCortesia, setQrCortesia] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([eventoPrivadoService.minhasSolicitacoes(), comemoracaoService.minhasComemoracoes()]).then(
      async ([ep, com]) => {
        if (cancelled) return;
        setPrivados(ep);
        setComemoracoes(com);
        // Carregar faixas para comemoracoes aprovadas com evento
        const aprovadas = com.filter(c => c.status === 'APROVADA' && c.evento_id);
        const eventoIds = [...new Set(aprovadas.map(c => c.evento_id!))];
        const map: Record<string, ComemoracaoFaixa[]> = {};
        await Promise.all(
          eventoIds.map(async eid => {
            const cfg = await comemoracaoService.getConfig(eid);
            if (cfg?.faixas) map[eid] = cfg.faixas;
          }),
        );
        if (cancelled) return;
        setFaixasMap(map);
        // Carregar cortesias
        const cMap: Record<
          string,
          { id: string; nome_convidado: string | null; celular_convidado: string | null; resgatado: boolean }[]
        > = {};
        await Promise.all(
          aprovadas.map(async c => {
            const cortesias = await comemoracaoService.getCortesias(c.id);
            if (cortesias.length > 0) cMap[c.id] = cortesias;
          }),
        );
        if (cancelled) return;
        setCortesiasMap(cMap);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const copyRefLink = (refCode: string) => {
    const url = `${window.location.origin}?ref=${refCode}`;
    navigator.clipboard.writeText(url);
    setCopied(refCode);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveCortesia = async (cortesiaId: string, comId: string) => {
    const edit = cortesiaEdits[cortesiaId];
    if (!edit?.nome.trim()) return;
    setSavingCortesia(cortesiaId);
    try {
      await comemoracaoService.atribuirCortesia(cortesiaId, edit.nome.trim(), edit.celular.trim());
      // Atualizar local
      setCortesiasMap(prev => ({
        ...prev,
        [comId]: (prev[comId] ?? []).map(c =>
          c.id === cortesiaId ? { ...c, nome_convidado: edit.nome.trim(), celular_convidado: edit.celular.trim() } : c,
        ),
      }));
    } catch (err) {
      console.error('[Cortesia] erro:', err);
    } finally {
      setSavingCortesia(null);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'PRIVADOS', label: 'Eventos Privados', icon: <PartyPopper size="0.75rem" />, count: privados.length },
    { id: 'COMEMORACOES', label: 'Comemorações', icon: <Cake size="0.75rem" />, count: comemoracoes.length },
  ];

  const renderTimeline = (steps: TimelineStep[]) => (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border text-[0.625rem] ${
                step.reached ? 'border-transparent' : 'border-zinc-700 bg-zinc-900'
              }`}
              style={step.reached ? { backgroundColor: step.color + '30', color: step.color } : { color: '#52525b' }}
            >
              {step.key === 'ENVIADA' && <Clock size="0.625rem" />}
              {step.key === 'VISUALIZADA' && <Eye size="0.625rem" />}
              {step.key === 'EM_ANALISE' && <Search size="0.625rem" />}
              {step.key === 'APROVADA' && <CheckCircle size="0.625rem" />}
              {step.key === 'RECUSADA' && <XCircle size="0.625rem" />}
            </div>
            <span className="text-[0.4375rem] text-zinc-400 text-center leading-tight w-12 truncate">
              {step.reached && step.timestamp ? formatDate(step.timestamp) : step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-0.5 rounded-full -mt-4"
              style={{
                backgroundColor: step.reached && steps[i + 1].reached ? step.color + '60' : '#27272a',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPrivadoCard = (sol: EventoPrivado) => {
    const cfg = STATUS_CFG[sol.status] ?? STATUS_CFG.ENVIADA;
    const timeline = buildTimeline(sol.status, sol.created_at, sol.visualizado_em, sol.em_analise_em, sol.avaliado_em);

    return (
      <div key={sol.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{sol.empresa}</p>
            <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">
              {sol.data_evento || sol.data_estimativa || 'Data a definir'} · {sol.faixa_capacidade}
            </p>
          </div>
          <span
            className="shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-black uppercase tracking-wider"
            style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
        {renderTimeline(timeline)}
        {sol.mensagem_gerente && (
          <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
            <MessageSquare size="0.75rem" className="text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-zinc-300 text-xs leading-relaxed">{sol.mensagem_gerente}</p>
          </div>
        )}
        {sol.status === 'RECUSADA' && sol.motivo_recusa && (
          <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
            <XCircle size="0.75rem" className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs leading-relaxed">{sol.motivo_recusa}</p>
          </div>
        )}
      </div>
    );
  };

  const MOTIVO_LABEL: Record<string, string> = {
    ANIVERSARIO: 'Aniversário',
    DESPEDIDA: 'Despedida',
    OUTRO: 'Outro',
  };

  const renderComemoracaoCard = (sol: Comemoracao) => {
    const cfg = STATUS_CFG[sol.status] ?? STATUS_CFG.ENVIADA;
    const timeline = buildTimeline(sol.status, sol.created_at, sol.visualizado_em, sol.em_analise_em, sol.avaliado_em);

    return (
      <div key={sol.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">
              {MOTIVO_LABEL[sol.motivo] ?? sol.motivo}
              {sol.motivo_outro ? `: ${sol.motivo_outro}` : ''}
            </p>
            <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{formatSimpleDate(sol.data_comemoracao)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {sol.status === 'APROVADA' && (
              <div className="flex items-center gap-1">
                <ShoppingCart size="0.625rem" className="text-[#FFD300]" />
                <span className="text-[0.5625rem] font-black text-[#FFD300]">{sol.vendas_count}</span>
              </div>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[0.5rem] font-black uppercase tracking-wider"
              style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
        </div>
        {renderTimeline(timeline)}
        {sol.ref_code && (
          <div className="flex items-center gap-2 bg-[#FFD300]/5 border border-[#FFD300]/20 rounded-xl p-3">
            <Link2 size="0.875rem" className="text-[#FFD300] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[0.5625rem] text-zinc-400 uppercase tracking-wider font-bold">Link de vendas</p>
              <p className="text-xs text-[#FFD300] font-bold truncate">{sol.ref_code}</p>
            </div>
            <button
              onClick={() => copyRefLink(sol.ref_code!)}
              className="shrink-0 w-8 h-8 bg-[#FFD300]/10 rounded-lg flex items-center justify-center active:scale-90 transition-all"
            >
              {copied === sol.ref_code ? (
                <CheckCircle size="0.875rem" className="text-emerald-400" />
              ) : (
                <Copy size="0.875rem" className="text-[#FFD300]" />
              )}
            </button>
          </div>
        )}
        {/* Progresso de vendas + faixas */}
        {sol.status === 'APROVADA' &&
          sol.evento_id &&
          (() => {
            const faixas = faixasMap[sol.evento_id] ?? [];
            if (faixas.length === 0) return null;
            const sorted = [...faixas].sort((a, b) => a.min_vendas - b.min_vendas);
            const nextFaixa = sorted.find(f => f.min_vendas > sol.vendas_count);
            const maxFaixa = sorted[sorted.length - 1];
            const progTarget = nextFaixa?.min_vendas ?? maxFaixa.min_vendas;
            const progPct = Math.min(100, Math.round((sol.vendas_count / progTarget) * 100));
            return (
              <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.5625rem] text-purple-400 font-black uppercase tracking-widest">
                    Suas Vendas
                  </span>
                  <span className="text-sm text-white font-black">{sol.vendas_count}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-[#FFD300] rounded-full transition-all"
                    style={{ width: `${progPct}%` }}
                  />
                </div>
                {nextFaixa ? (
                  <p className="text-[0.625rem] text-zinc-400">
                    Faltam <span className="text-white font-bold">{nextFaixa.min_vendas - sol.vendas_count}</span>{' '}
                    vendas para ganhar{' '}
                    <span className="text-purple-300 font-bold">
                      {nextFaixa.cortesias} cortesia{nextFaixa.cortesias !== 1 ? 's' : ''}
                    </span>
                    {nextFaixa.beneficio_consumo ? ` + ${nextFaixa.beneficio_consumo}` : ''}
                  </p>
                ) : (
                  <p className="text-[0.625rem] text-emerald-400 font-bold">Todas as faixas desbloqueadas!</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {sorted.map(f => {
                    const unlocked = sol.vendas_count >= f.min_vendas;
                    return (
                      <span
                        key={f.id}
                        className={`text-[0.5rem] px-2 py-0.5 rounded-full font-bold ${
                          unlocked
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-white/5'
                        }`}
                      >
                        {f.min_vendas}+ vendas → {f.cortesias} cortesia{f.cortesias !== 1 ? 's' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        {/* Cortesias ganhas */}
        {cortesiasMap[sol.id]?.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Gift size="0.75rem" className="text-emerald-400" />
              <span className="text-[0.5625rem] text-emerald-400 font-black uppercase tracking-widest">
                Cortesias ({cortesiasMap[sol.id].length})
              </span>
            </div>
            {cortesiasMap[sol.id].map(c => (
              <div key={c.id} className="bg-zinc-900/50 rounded-lg p-2.5 space-y-1.5">
                {c.nome_convidado ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-xs font-bold">{c.nome_convidado}</p>
                      {c.celular_convidado && <p className="text-zinc-400 text-[0.625rem]">{c.celular_convidado}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.resgatado && (
                        <button
                          onClick={() => setQrCortesia({ id: c.id, nome: c.nome_convidado! })}
                          className="w-7 h-7 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                        >
                          <QrCode size="0.875rem" className="text-purple-400" />
                        </button>
                      )}
                      <span
                        className={`text-[0.5rem] px-2 py-0.5 rounded-full font-bold ${c.resgatado ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}
                      >
                        {c.resgatado ? 'Resgatada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[0.5625rem] text-zinc-400">Insira o nome do convidado</p>
                    <input
                      type="text"
                      value={cortesiaEdits[c.id]?.nome ?? ''}
                      onChange={e =>
                        setCortesiaEdits(prev => ({
                          ...prev,
                          [c.id]: { ...prev[c.id], nome: e.target.value, celular: prev[c.id]?.celular ?? '' },
                        }))
                      }
                      placeholder="Nome"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50"
                    />
                    <input
                      type="tel"
                      value={cortesiaEdits[c.id]?.celular ?? ''}
                      onChange={e =>
                        setCortesiaEdits(prev => ({
                          ...prev,
                          [c.id]: { nome: prev[c.id]?.nome ?? '', celular: e.target.value },
                        }))
                      }
                      placeholder="Celular (opcional)"
                      className="w-full bg-zinc-800/50 border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={() => handleSaveCortesia(c.id, sol.id)}
                      disabled={!cortesiaEdits[c.id]?.nome?.trim() || savingCortesia === c.id}
                      className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[0.625rem] font-bold text-emerald-400 uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {savingCortesia === c.id ? (
                        <Loader2 size="0.625rem" className="animate-spin" />
                      ) : (
                        <Save size="0.625rem" />
                      )}
                      Salvar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {sol.mensagem_gerente && (
          <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
            <MessageSquare size="0.75rem" className="text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-zinc-300 text-xs leading-relaxed">{sol.mensagem_gerente}</p>
          </div>
        )}
        {sol.status === 'RECUSADA' && sol.motivo_recusa && (
          <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
            <XCircle size="0.75rem" className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs leading-relaxed">{sol.motivo_recusa}</p>
          </div>
        )}
      </div>
    );
  };

  const items = tab === 'PRIVADOS' ? privados : comemoracoes;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-white/5">
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size="1.125rem" className="text-zinc-400" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white">
          Minhas Solicitações
        </h1>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[0.625rem] font-bold uppercase tracking-wider transition-all ${
              tab === t.id
                ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/30'
                : 'bg-zinc-900/50 text-zinc-400 border border-white/5'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[0.5rem] font-black ${
                  tab === t.id ? 'bg-[#FFD300]/20 text-[#FFD300]' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
              {tab === 'PRIVADOS' ? (
                <PartyPopper size="1.5rem" className="text-zinc-700" />
              ) : (
                <Cake size="1.5rem" className="text-zinc-700" />
              )}
            </div>
            <p className="text-zinc-400 text-sm">Nenhuma solicitação ainda</p>
          </div>
        ) : tab === 'PRIVADOS' ? (
          privados.map(renderPrivadoCard)
        ) : (
          comemoracoes.map(renderComemoracaoCard)
        )}
      </div>

      {/* Modal QR Code */}
      {qrCortesia && (
        <div
          className="absolute inset-0 z-[120] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setQrCortesia(null)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Voucher Cortesia</h3>
              <button onClick={() => setQrCortesia(null)} className="active:scale-90 transition-all">
                <X size="1.125rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="flex justify-center bg-white rounded-xl p-4">
              <QRCodeSVG value={`vanta://cortesia/${qrCortesia.id}`} size="11.25rem" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{qrCortesia.nome}</p>
              <p className="text-zinc-400 text-[0.625rem] mt-1">Apresente este QR na portaria</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
