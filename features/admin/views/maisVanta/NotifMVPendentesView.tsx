/**
 * NotifMVPendentesView — Admin vê e resolve solicitações de notificação do produtor (V3 S5.6)
 */
import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, RefreshCw, Bell } from 'lucide-react';
import { clubeService } from '../../services/clube';
import type { SolicitacaoNotifMV } from '../../services/clube/clubeNotifProdutorService';
import { supabase } from '../../../../services/supabaseClient';
import { useAuthStore } from '../../../../stores/authStore';
import { TYPOGRAPHY } from '../../../../constants';

export const NotifMVPendentesView: React.FC = () => {
  const [pendentes, setPendentes] = useState<SolicitacaoNotifMV[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [eventosNomes, setEventosNomes] = useState<Record<string, string>>({});
  const adminId = useAuthStore(s => s.currentAccount?.id ?? '');
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    const data = await clubeService.listarNotifPendentes();
    if (!mounted.current) return;
    setPendentes(data);

    // Buscar nomes dos produtores e eventos
    const prodIds = [...new Set(data.map(d => d.produtorId))];
    const evtIds = [...new Set(data.map(d => d.eventoId))];

    if (prodIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, nome').in('id', prodIds);
      if (profs && mounted.current) {
        const map: Record<string, string> = {};
        for (const p of profs) map[p.id] = p.nome ?? '';
        setNomes(map);
      }
    }
    if (evtIds.length > 0) {
      const { data: evts } = await supabase.from('eventos_admin').select('id, nome').in('id', evtIds);
      if (evts && mounted.current) {
        const map: Record<string, string> = {};
        for (const e of evts) map[e.id] = ((e as Record<string, unknown>).nome as string) ?? '';
        setEventosNomes(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, []);

  const aprovar = async (sol: SolicitacaoNotifMV) => {
    setActionId(sol.id);
    // Contar membros ativos para a notificação
    const { count } = await supabase
      .from('membros_clube')
      .select('id', { count: 'exact', head: true })
      .eq('ativo', true);
    await clubeService.aprovarSolicitacaoNotif(sol.id, adminId, count ?? 0);
    // Disparar notificação via send-push para todos os membros ativos
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.access_token) {
      const { data: membros } = await supabase.from('membros_clube').select('user_id').eq('ativo', true);
      if (membros && membros.length > 0) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        await fetch(`${supabaseUrl}/functions/v1/send-push`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: membros.map(m => (m as Record<string, unknown>).user_id),
            title: 'MAIS VANTA',
            body: sol.mensagem,
          }),
        }).catch(() => {});
      }
    }
    setActionId(null);
    load();
  };

  const rejeitar = async (solId: string) => {
    setActionId(solId);
    await clubeService.rejeitarSolicitacaoNotif(solId, adminId);
    setActionId(null);
    load();
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p style={TYPOGRAPHY.sectionKicker}>Solicitações de notificação</p>
        <button
          onClick={load}
          className="p-2 rounded-lg bg-zinc-900 border border-white/5 active:scale-90 transition-all"
        >
          <RefreshCw size="0.875rem" className="text-zinc-400" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size="1.25rem" className="text-zinc-500 animate-spin" />
        </div>
      ) : pendentes.length === 0 ? (
        <div className="text-center py-12">
          <Bell size="2rem" className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Nenhuma solicitação pendente</p>
        </div>
      ) : (
        pendentes.map(sol => (
          <div key={sol.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{eventosNomes[sol.eventoId] ?? 'Evento'}</p>
                <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest mt-0.5">
                  Por {nomes[sol.produtorId] ?? 'Produtor'}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[0.5rem] font-black uppercase tracking-widest shrink-0">
                Pendente
              </span>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed bg-zinc-800/50 rounded-lg p-3 border border-white/5">
              {sol.mensagem || '(sem mensagem)'}
            </p>

            <p className="text-zinc-500 text-[0.625rem]">
              {new Date(sol.criadoEm).toLocaleDateString('pt-BR')} às{' '}
              {new Date(sol.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>

            <div className="flex gap-2">
              <button
                disabled={actionId === sol.id}
                onClick={() => aprovar(sol)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.625rem] font-black uppercase tracking-wider hover-real:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <CheckCircle size="0.75rem" />
                Aprovar e enviar
              </button>
              <button
                disabled={actionId === sol.id}
                onClick={() => rejeitar(sol.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[0.625rem] font-black uppercase tracking-wider hover-real:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <XCircle size="0.75rem" />
                Rejeitar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
