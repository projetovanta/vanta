import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  UserPlus,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Send,
  Inbox,
  Sparkles,
  MessageSquare,
  PartyPopper,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import { eventoPrivadoService, EventoPrivado } from '../../services/eventoPrivadoService';
import { OptimizedImage } from '../../components/OptimizedImage';

// ── Types ───────────────────────────────────────────────────────────────────

interface SolicitacaoParceria {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  criado_em: string;
  motivo_rejeicao: string | null;
  cidade: string;
  categoria: string;
  comunidade_criada_id: string | null;
  analisado_em: string | null;
}

interface AmizadePendente {
  id: string;
  otherId: string;
  otherNome: string;
  otherAvatar: string | null;
  createdAt: string;
  direcao: 'ENVIADO' | 'RECEBIDO';
}

type TabType = 'SOLICITACOES' | 'AMIZADES' | 'EVENTOS_PRIVADOS';

const STATUS_CFG: Record<
  string,
  { label: string; color: string; icon: React.FC<{ size?: string | number; className?: string }> }
> = {
  PENDENTE: { label: 'Pendente', color: '#FBBF24', icon: Clock },
  APROVADA: { label: 'Aprovada', color: '#34D399', icon: CheckCircle },
  REJEITADA: { label: 'Recusada', color: '#F87171', icon: XCircle },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA', icon: Eye },
  EM_ANALISE: { label: 'Em análise', color: '#A78BFA', icon: Search },
};

const TABS: { key: TabType; label: string; icon: React.FC<{ size?: string | number; className?: string }> }[] = [
  { key: 'SOLICITACOES', label: 'Solicitações', icon: ClipboardList },
  { key: 'AMIZADES', label: 'Amizades', icon: UserPlus },
  { key: 'EVENTOS_PRIVADOS', label: 'Eventos Privados', icon: PartyPopper },
];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export const MinhasPendenciasView: React.FC<Props> = ({ onBack }) => {
  const [tab, setTab] = useState<TabType>('SOLICITACOES');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoParceria[]>([]);
  const [amizades, setAmizades] = useState<AmizadePendente[]>([]);
  const [eventosPrivados, setEventosPrivados] = useState<EventoPrivado[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = useAuthStore(s => s.currentAccount?.id);

  // ── Load data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const [parceriasRes, enviadosRes, recebidosRes, epData] = await Promise.all([
        supabase
          .from('solicitacoes_parceria')
          .select(
            'id, nome, tipo, status, criado_em, motivo_rejeicao, cidade, categoria, comunidade_criada_id, analisado_em',
          )
          .eq('user_id', userId)
          .order('criado_em', { ascending: false }),

        supabase
          .from('friendships')
          .select('id, addressee_id, created_at')
          .eq('requester_id', userId)
          .eq('status', 'PENDING'),

        supabase
          .from('friendships')
          .select('id, requester_id, created_at')
          .eq('addressee_id', userId)
          .eq('status', 'PENDING'),

        eventoPrivadoService.minhasSolicitacoes(),
      ]);

      if (cancelled) return;

      // Solicitacoes
      setSolicitacoes((parceriasRes.data ?? []) as SolicitacaoParceria[]);

      // Eventos privados
      setEventosPrivados(epData);

      // Amizades — buscar profiles dos outros
      const enviados = (enviadosRes.data ?? []) as { id: string; addressee_id: string; created_at: string }[];
      const recebidos = (recebidosRes.data ?? []) as { id: string; requester_id: string; created_at: string }[];

      const otherIds = [...enviados.map(e => e.addressee_id), ...recebidos.map(r => r.requester_id)];

      let profilesMap: Record<string, { nome: string; avatar_url: string | null }> = {};
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, nome, avatar_url').in('id', otherIds);
        if (!cancelled && profiles) {
          for (const p of profiles) {
            profilesMap[p.id] = { nome: p.nome ?? 'Sem nome', avatar_url: p.avatar_url };
          }
        }
      }

      if (cancelled) return;

      const amizadesList: AmizadePendente[] = [
        ...enviados.map(e => ({
          id: e.id,
          otherId: e.addressee_id,
          otherNome: profilesMap[e.addressee_id]?.nome ?? 'Sem nome',
          otherAvatar: profilesMap[e.addressee_id]?.avatar_url ?? null,
          createdAt: e.created_at,
          direcao: 'ENVIADO' as const,
        })),
        ...recebidos.map(r => ({
          id: r.id,
          otherId: r.requester_id,
          otherNome: profilesMap[r.requester_id]?.nome ?? 'Sem nome',
          otherAvatar: profilesMap[r.requester_id]?.avatar_url ?? null,
          createdAt: r.created_at,
          direcao: 'RECEBIDO' as const,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setAmizades(amizadesList);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
        <button onClick={onBack} className="p-1 -ml-1 active:scale-90 transition-transform">
          <ArrowLeft size="1.25rem" className="text-zinc-400" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white">
          Minhas Pendências
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
        {TABS.map(t => {
          const active = tab === t.key;
          const Icon = t.icon;
          const count =
            t.key === 'SOLICITACOES'
              ? solicitacoes.length
              : t.key === 'AMIZADES'
                ? amizades.length
                : eventosPrivados.length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                active
                  ? 'bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/30'
                  : 'bg-zinc-900/60 text-zinc-500 border border-white/5'
              }`}
            >
              <Icon size="0.75rem" />
              {t.label}
              {!loading && count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[0.5rem] font-black ${
                    active ? 'bg-[#FFD300]/20 text-[#FFD300]' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.5rem" className="animate-spin text-zinc-500" />
          </div>
        ) : tab === 'SOLICITACOES' ? (
          <TabSolicitacoes items={solicitacoes} />
        ) : tab === 'AMIZADES' ? (
          <TabAmizades items={amizades} />
        ) : (
          <TabEventosPrivados items={eventosPrivados} />
        )}
      </div>
    </div>
  );
};

// ── Tab: Solicitaes ─────────────────────────────────────────────────────

function TabSolicitacoes({ items }: { items: SolicitacaoParceria[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <ClipboardList size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhuma solicitação de parceria</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(s => {
        const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.PENDENTE;
        const StatusIcon = cfg.icon;
        return (
          <div key={s.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{s.nome}</p>
                <p className="text-[0.625rem] text-zinc-500 truncate">
                  {s.tipo === 'ESPACO_FIXO' ? 'Espaço Fixo' : 'Produtora'} &middot; {s.cidade} &middot; {s.categoria}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0"
                style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
              >
                <StatusIcon size="0.625rem" />
                {cfg.label}
              </span>
            </div>

            <p className="text-[0.625rem] text-zinc-600">
              Enviada em {formatDate(s.criado_em)}
              {s.analisado_em && ` &middot; Analisada em ${formatDate(s.analisado_em)}`}
            </p>

            {s.motivo_rejeicao && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-[0.625rem] text-red-400">
                  <span className="font-bold">Motivo:</span> {s.motivo_rejeicao}
                </p>
              </div>
            )}

            {s.comunidade_criada_id && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <p className="text-[0.625rem] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle size="0.625rem" />
                  Comunidade criada
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Amizades ───────────────────────────────────────────────────────

function TabAmizades({ items }: { items: AmizadePendente[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <UserCheck size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhum pedido de amizade pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(a => (
        <div key={a.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {a.otherAvatar ? (
              <OptimizedImage src={a.otherAvatar} alt={a.otherNome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm font-bold">
                {a.otherNome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{a.otherNome}</p>
            <p className="text-[0.625rem] text-zinc-500">{formatDate(a.createdAt)}</p>
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0 ${
              a.direcao === 'ENVIADO' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {a.direcao === 'ENVIADO' ? (
              <>
                <Send size="0.5rem" /> Enviado
              </>
            ) : (
              <>
                <Inbox size="0.5rem" /> Recebido
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Eventos Privados ─────────────────────────────────────────────────

const EP_STATUS: Record<
  string,
  { label: string; color: string; icon: React.FC<{ size?: string | number; className?: string }> }
> = {
  ENVIADA: { label: 'Enviada', color: '#A78BFA', icon: Clock },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA', icon: Eye },
  EM_ANALISE: { label: 'Em análise', color: '#FBBF24', icon: Search },
  APROVADA: { label: 'Aprovada', color: '#34D399', icon: CheckCircle },
  RECUSADA: { label: 'Recusada', color: '#F87171', icon: XCircle },
  CONVERTIDA: { label: 'Evento criado', color: '#FFD300', icon: Sparkles },
};

const EP_TIMELINE_ORDER = ['ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA'];

function TabEventosPrivados({ items }: { items: EventoPrivado[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <PartyPopper size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhuma solicitação de evento privado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(sol => {
        const currentCfg = EP_STATUS[sol.status] ?? EP_STATUS.ENVIADA;
        const CurrentIcon = currentCfg.icon;

        // Build timeline
        const timeline = EP_TIMELINE_ORDER.map(s => {
          const cfg = EP_STATUS[s];
          let timestamp: string | null = null;
          let reached = false;

          if (s === 'ENVIADA') {
            timestamp = sol.created_at;
            reached = true;
          }
          if (s === 'VISUALIZADA' && sol.visualizado_em) {
            timestamp = sol.visualizado_em;
            reached = true;
          }
          if (s === 'EM_ANALISE' && sol.em_analise_em) {
            timestamp = sol.em_analise_em;
            reached = true;
          }
          if (s === 'APROVADA' && (sol.status === 'APROVADA' || sol.status === 'CONVERTIDA')) {
            timestamp = sol.avaliado_em;
            reached = true;
          }

          return { key: s, label: cfg.label, color: cfg.color, icon: cfg.icon, timestamp, reached };
        });

        if (sol.status === 'RECUSADA') {
          timeline[timeline.length - 1] = {
            key: 'RECUSADA',
            label: 'Recusada',
            color: '#F87171',
            icon: XCircle,
            timestamp: sol.avaliado_em,
            reached: true,
          };
        }

        return (
          <div key={sol.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{sol.empresa}</p>
                <p className="text-[0.625rem] text-zinc-500 truncate">
                  {sol.data_evento || sol.data_estimativa || 'Data a definir'} · {sol.faixa_capacidade}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0"
                style={{ backgroundColor: currentCfg.color + '20', color: currentCfg.color }}
              >
                <CurrentIcon size="0.625rem" />
                {currentCfg.label}
              </span>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-1">
              {timeline.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                          step.reached ? 'border-transparent' : 'border-zinc-700 bg-zinc-900'
                        }`}
                        style={
                          step.reached
                            ? { backgroundColor: step.color + '30', color: step.color }
                            : { color: '#52525b' }
                        }
                      >
                        <StepIcon size="0.875rem" />
                      </div>
                      <span className="text-[0.5rem] text-zinc-400 text-center leading-tight w-14 truncate">
                        {step.reached && step.timestamp ? formatDate(step.timestamp) : step.label}
                      </span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div
                        className="flex-1 h-0.5 rounded-full -mt-4"
                        style={{
                          backgroundColor: step.reached && timeline[i + 1].reached ? step.color + '60' : '#27272a',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mensagem do gerente */}
            {sol.mensagem_gerente && (
              <div className="flex items-start gap-2 bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                <MessageSquare size="0.75rem" className="text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-zinc-300 text-xs leading-relaxed">{sol.mensagem_gerente}</p>
              </div>
            )}

            {/* Motivo recusa */}
            {sol.status === 'RECUSADA' && sol.motivo_recusa && (
              <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <XCircle size="0.75rem" className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{sol.motivo_recusa}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
