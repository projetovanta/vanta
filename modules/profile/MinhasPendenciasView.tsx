import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ClipboardList, UserPlus, PartyPopper } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { supabase } from '../../services/supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import { eventoPrivadoService, EventoPrivado } from '../../services/eventoPrivadoService';
import { TabSolicitacoesParceria, SolicitacaoParceria } from './components/TabSolicitacoesParceria';
import { TabAmizadesPendentes, AmizadePendente } from './components/TabAmizadesPendentes';
import { TabEventosPrivados } from './components/TabEventosPrivados';

// ── Types ───────────────────────────────────────────────────────────────────

type TabType = 'SOLICITACOES' | 'AMIZADES' | 'EVENTOS_PRIVADOS';

const TABS: { key: TabType; label: string; icon: React.FC<{ size?: string | number; className?: string }> }[] = [
  { key: 'SOLICITACOES', label: 'Solicitações', icon: ClipboardList },
  { key: 'AMIZADES', label: 'Amizades', icon: UserPlus },
  { key: 'EVENTOS_PRIVADOS', label: 'Eventos Privados', icon: PartyPopper },
];

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
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1 -ml-1 active:scale-90 transition-transform">
          <ArrowLeft size="1.25rem" className="text-zinc-400" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white">
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
          <TabSolicitacoesParceria items={solicitacoes} />
        ) : tab === 'AMIZADES' ? (
          <TabAmizadesPendentes items={amizades} />
        ) : (
          <TabEventosPrivados items={eventosPrivados} />
        )}
      </div>
    </div>
  );
};
