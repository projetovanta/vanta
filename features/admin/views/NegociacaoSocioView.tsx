import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Calendar,
  MapPin,
  RefreshCw,
  Send,
  Check,
  X,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import type { Notificacao } from '../../../types';

/* ── Tipos ──────────────────────────────────────────────────────────────────── */

interface Proposta {
  rodada: number;
  de: 'produtor' | 'socio' | 'sistema';
  acao: 'proposta' | 'contraproposta' | 'aceitar' | 'recusar' | 'cancelar' | 'expirar';
  percentual?: number;
  mensagem?: string;
  created_at: string;
}

interface ConviteData {
  id: string;
  nome: string;
  foto: string;
  descricao: string;
  dataInicio: string;
  local: string;
  cidade: string;
  comunidadeNome: string;
  criadorNome: string;
  criadorId: string;
  splitSocio: number;
  splitProdutor: number;
  rodada: number;
  ultimoTurno: 'produtor' | 'socio';
  prazoResposta: string | null;
  historico: Proposta[];
  status: string;
  statusEvento: string;
  socioId: string;
}

interface Props {
  eventoId: string;
  userId: string;
  /** 'socio' se o user é sócio convidado, 'produtor' se é o criador do evento */
  papel: 'socio' | 'produtor';
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const fmtData = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const fmtPrazo = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const timestamp = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';

/* ── Componente Principal ──────────────────────────────────────────────────── */

export const NegociacaoSocioView: React.FC<Props> = ({ eventoId, userId, papel, onClose, onSuccess }) => {
  const [convite, setConvite] = useState<ConviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [showContrapor, setShowContrapor] = useState(false);
  const [showConfirmAceitar, setShowConfirmAceitar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [showReiniciar, setShowReiniciar] = useState(false);
  const [reiniciarPercentual, setReiniciarPercentual] = useState('');
  const [reiniciarMensagem, setReiniciarMensagem] = useState('');
  const [novoPercentual, setNovoPercentual] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── Fetch dados ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErro(null);

      if (papel === 'socio') {
        const { data, error } = await supabase.rpc('get_convite_socio', {
          p_evento_id: eventoId,
        });
        if (error || !data) {
          setErro('Erro ao carregar negociação.');
          setLoading(false);
          return;
        }
        const ev = data as Record<string, unknown>;
        if (ev.error) {
          setErro(ev.error === 'not_authorized' ? 'Você não tem acesso a este convite.' : 'Não encontrado.');
          setLoading(false);
          return;
        }
        mapConvite(ev);
      } else {
        // Produtor: buscar direto da tabela + evento
        const { data: socioRow, error: e1 } = await supabase
          .from('socios_evento')
          .select('*')
          .eq('evento_id', eventoId)
          .limit(1)
          .single();
        if (e1 || !socioRow) {
          setErro('Nenhum sócio encontrado neste evento.');
          setLoading(false);
          return;
        }
        const { data: evento, error: e2 } = await supabase
          .from('eventos_admin')
          .select(
            'id, nome, foto, descricao, data_inicio, local, cidade, comunidade_id, created_by, status_evento, comunidades(nome)',
          )
          .eq('id', eventoId)
          .single();
        if (e2 || !evento) {
          setErro('Evento não encontrado.');
          setLoading(false);
          return;
        }
        const { data: socioProfile } = await supabase
          .from('profiles')
          .select('full_name, nome')
          .eq('id', socioRow.socio_id)
          .single();

        const com = evento.comunidades as unknown as { nome: string } | null;
        setConvite({
          id: evento.id as string,
          nome: (evento.nome as string) ?? '',
          foto: (evento.foto as string) ?? '',
          descricao: (evento.descricao as string) ?? '',
          dataInicio: (evento.data_inicio as string) ?? '',
          local: (evento.local as string) ?? '',
          cidade: (evento.cidade as string) ?? '',
          comunidadeNome: com?.nome ?? '',
          criadorNome: 'Você',
          criadorId: evento.created_by as string,
          splitSocio: (socioRow.split_percentual as number) ?? 0,
          splitProdutor: 100 - ((socioRow.split_percentual as number) ?? 0),
          rodada: (socioRow.rodada_negociacao as number) ?? 1,
          ultimoTurno: ((socioRow.ultimo_turno as string) ?? 'produtor') as 'produtor' | 'socio',
          prazoResposta: (socioRow.prazo_resposta as string) ?? null,
          historico: (socioRow.historico_propostas ?? []) as unknown as Proposta[],
          status: (socioRow.status as string) ?? 'PENDENTE',
          statusEvento: (evento.status_evento as string) ?? '',
          socioId: socioRow.socio_id as string,
        });
        // Guardar nome do sócio pra exibir nos balões
        if (socioProfile) {
          setSocioNome(socioProfile.full_name ?? socioProfile.nome ?? 'Sócio');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [eventoId, userId, papel]);

  const [socioNome, setSocioNome] = useState('Sócio');

  const mapConvite = (ev: Record<string, unknown>) => {
    setConvite({
      id: ev.id as string,
      nome: (ev.nome as string) ?? '',
      foto: (ev.foto as string) ?? '',
      descricao: (ev.descricao as string) ?? '',
      dataInicio: (ev.data_inicio as string) ?? '',
      local: (ev.local as string) ?? '',
      cidade: (ev.cidade as string) ?? '',
      comunidadeNome: (ev.comunidade_nome as string) ?? '',
      criadorNome: (ev.criador_nome as string) ?? 'Produtor',
      criadorId: '', // será preenchido pelo RPC nas ações
      splitSocio: (ev.split_socio as number) ?? 0,
      splitProdutor: (ev.split_produtor as number) ?? 0,
      rodada: (ev.rodada_negociacao as number) ?? 1,
      ultimoTurno: ((ev.ultimo_turno as string) ?? 'produtor') as 'produtor' | 'socio',
      prazoResposta: (ev.prazo_resposta as string) ?? null,
      historico: (ev.historico_propostas ?? []) as Proposta[],
      status: (ev.status as string) ?? 'PENDENTE',
      statusEvento: (ev.status_evento as string) ?? '',
      socioId: (ev.socio_convidado_id as string) ?? '',
    });
    setLoading(false);
  };

  // Scroll to bottom on historico change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convite?.historico.length]);

  /* ── Derivados ───────────────────────────────────────────────────────────── */
  const encerrada = useMemo(() => {
    if (!convite) return true;
    return ['ACEITO', 'RECUSADO', 'CANCELADO', 'EXPIRADO'].includes(convite.status);
  }, [convite]);

  const minhaVez = useMemo(() => {
    if (!convite || encerrada) return false;
    if (papel === 'socio') return convite.ultimoTurno === 'produtor' || convite.status === 'PENDENTE';
    return convite.ultimoTurno === 'socio';
  }, [convite, papel, encerrada]);

  const podeContrapor = useMemo(() => {
    if (!convite) return false;
    return convite.rodada < 3 && minhaVez;
  }, [convite, minhaVez]);

  /* ── Notificar outro lado ────────────────────────────────────────────────── */
  const notificar = async (targetId: string, tipo: Notificacao['tipo'], titulo: string, mensagem: string) => {
    try {
      const { notificationsService } = await import('../services/notificationsService');
      void notificationsService.add(
        { tipo, titulo, mensagem, link: `/admin/evento/${eventoId}`, lida: false, timestamp: timestamp() },
        targetId,
      );
    } catch {
      /* silencioso */
    }
  };

  const enviarPush = async (targetId: string, titulo: string, body: string) => {
    try {
      await supabase.functions.invoke('send-push', {
        body: {
          userIds: [targetId],
          title: titulo,
          body,
          data: { link: `/admin/evento/${eventoId}`, tipo: 'CONVITE_SOCIO' },
        },
      });
    } catch {
      /* silencioso */
    }
  };

  /* ── Ações ───────────────────────────────────────────────────────────────── */
  const handleAceitar = async () => {
    if (!convite) return;
    setEnviando(true);
    setShowConfirmAceitar(false);

    if (papel === 'socio') {
      const { data, error } = await supabase.rpc('aceitar_convite_socio', { p_evento_id: eventoId });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      // Atribuir RBAC sócio
      try {
        const { rbacService, CARGO_PERMISSOES } = await import('../services/rbacService');
        await rbacService.atribuir({
          userId,
          tenant: { tipo: 'EVENTO', id: eventoId, nome: convite.nome, foto: convite.foto },
          cargo: 'SOCIO',
          permissoes: CARGO_PERMISSOES.SOCIO,
          atribuidoPor: userId,
          ativo: true,
        });
      } catch {
        /* */
      }
      if (res.criador_id) {
        await notificar(
          res.criador_id as string,
          'CONVITE_SOCIO',
          'Proposta aceita!',
          `O sócio aceitou a proposta para "${res.nome}". O evento foi publicado!`,
        );
        void enviarPush(res.criador_id as string, 'Proposta aceita!', `O sócio aceitou! "${res.nome}" foi publicado.`);
      }
      onSuccess('Proposta aceita! O evento foi publicado.');
    } else {
      const { data, error } = await supabase.rpc('aceitar_proposta_produtor', {
        p_evento_id: eventoId,
        p_socio_id: convite.socioId,
      });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      await notificar(
        convite.socioId,
        'CONVITE_SOCIO',
        'Proposta aceita pelo produtor!',
        `O produtor aceitou sua proposta para "${convite.nome}". O evento foi publicado!`,
      );
      void enviarPush(convite.socioId, 'Proposta aceita!', `O produtor aceitou! "${convite.nome}" foi publicado.`);
      onSuccess('Proposta aceita! O evento foi publicado.');
    }
  };

  const handleContrapor = async () => {
    if (!convite) return;
    const pct = parseInt(novoPercentual, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    if (novaMensagem.length > 500) return;
    setEnviando(true);

    if (papel === 'socio') {
      const { data, error } = await supabase.rpc('contraproposta_convite_socio', {
        p_evento_id: eventoId,
        p_split_socio: pct,
        p_split_produtor: 100 - pct,
        p_permissoes_produtor: null,
        p_mensagem: novaMensagem || null,
      });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      if (res.criador_id) {
        await notificar(
          res.criador_id as string,
          'CONVITE_SOCIO',
          'Contraproposta recebida',
          `O sócio enviou uma contraproposta para "${res.nome}" (rodada ${res.rodada}/3).`,
        );
        void enviarPush(
          res.criador_id as string,
          'Contraproposta recebida',
          `Nova proposta para "${res.nome}". Confira e responda.`,
        );
      }
      onSuccess('Contraproposta enviada!');
    } else {
      const { data, error } = await supabase.rpc('contraproposta_produtor', {
        p_evento_id: eventoId,
        p_socio_id: convite.socioId,
        p_split_socio: pct,
        p_mensagem: novaMensagem || null,
      });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      await notificar(
        convite.socioId,
        'CONVITE_SOCIO',
        'Contraproposta do produtor',
        `O produtor enviou uma contraproposta para "${convite.nome}" (rodada ${res?.rodada}/3).`,
      );
      void enviarPush(
        convite.socioId,
        'Contraproposta recebida',
        `Nova proposta para "${convite.nome}". Confira e responda.`,
      );
      onSuccess('Contraproposta enviada!');
    }
  };

  const handleRecusar = async () => {
    if (!convite) return;
    setEnviando(true);
    setShowRecusar(false);

    if (papel === 'socio') {
      const { data, error } = await supabase.rpc('recusar_convite_socio', {
        p_evento_id: eventoId,
        p_motivo: motivoRecusa || null,
      });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      if (res.criador_id) {
        await notificar(
          res.criador_id as string,
          'CONVITE_SOCIO',
          'Proposta recusada',
          `O sócio recusou a proposta para "${res.nome}".${motivoRecusa ? ` Motivo: ${motivoRecusa}` : ''}`,
        );
        void enviarPush(
          res.criador_id as string,
          'Proposta recusada',
          `O sócio recusou a proposta para "${res.nome}".`,
        );
      }
      onSuccess('Proposta recusada.');
    } else {
      const { data, error } = await supabase.rpc('cancelar_convite_produtor', {
        p_evento_id: eventoId,
        p_socio_id: convite.socioId,
        p_motivo: motivoRecusa || null,
      });
      const res = data as Record<string, unknown> | null;
      if (error || !res?.ok) {
        setEnviando(false);
        return;
      }
      await notificar(
        convite.socioId,
        'CONVITE_SOCIO',
        'Convite cancelado pelo produtor',
        `O produtor cancelou o convite para "${convite.nome}".${motivoRecusa ? ` Motivo: ${motivoRecusa}` : ''}`,
      );
      void enviarPush(convite.socioId, 'Convite cancelado', `O produtor cancelou o convite para "${convite.nome}".`);
      onSuccess('Convite cancelado.');
    }
  };

  const handleReiniciar = async () => {
    if (!convite) return;
    const pct = parseInt(reiniciarPercentual, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    setEnviando(true);
    const { data, error } = await supabase.rpc('reiniciar_negociacao', {
      p_evento_id: eventoId,
      p_socio_id: convite.socioId,
      p_split_socio: pct,
      p_mensagem: reiniciarMensagem || null,
    });
    const res = data as Record<string, unknown> | null;
    if (error || !res?.ok) {
      setEnviando(false);
      return;
    }
    await notificar(
      convite.socioId,
      'CONVITE_SOCIO',
      'Nova proposta recebida',
      `O produtor enviou uma nova proposta para "${convite.nome}".`,
    );
    void enviarPush(convite.socioId, 'Nova proposta', `O produtor quer negociar novamente "${convite.nome}". Confira!`);
    onSuccess('Nova proposta enviada!');
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={32} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  if (erro || !convite) {
    return (
      <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 px-8">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-zinc-400 text-sm text-center">{erro ?? 'Erro ao carregar.'}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-zinc-900 border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  const statusLabel =
    {
      PENDENTE: 'Convite Pendente',
      NEGOCIANDO: 'Em Negociação',
      ACEITO: 'Acordo Fechado',
      RECUSADO: 'Recusado',
      CANCELADO: 'Cancelado',
      EXPIRADO: 'Prazo Expirado',
    }[convite.status] ?? convite.status;

  const statusColor =
    {
      PENDENTE: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      NEGOCIANDO: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      ACEITO: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      RECUSADO: 'text-red-400 bg-red-400/10 border-red-400/20',
      CANCELADO: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
      EXPIRADO: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    }[convite.status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700';

  const nomeProdutor = papel === 'produtor' ? 'Você' : convite.criadorNome;
  const nomeSocio = papel === 'socio' ? 'Você' : socioNome;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            aria-label="Voltar"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-all"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{convite.nome}</p>
            <p className="text-zinc-400 text-[10px] truncate">Rodada {convite.rodada}/3</p>
          </div>
          <span
            className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* ── Resumo evento ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-zinc-900/30 border-b border-white/5">
        <div className="flex items-center gap-3">
          {convite.foto ? (
            <img src={convite.foto} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-zinc-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Clock size={10} className="text-amber-400/60 shrink-0" />
              <span className="truncate">{fmtData(convite.dataInicio)}</span>
            </div>
            {convite.local && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                <MapPin size={10} className="text-zinc-400 shrink-0" />
                <span className="truncate">{convite.local}</span>
              </div>
            )}
          </div>
        </div>
        {convite.prazoResposta && !encerrada && (
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-orange-400/80">
            <Clock size={10} />
            <span>Responder até {fmtPrazo(convite.prazoResposta)}</span>
          </div>
        )}
      </div>

      {/* ── Chat / Histórico ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {convite.historico.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-xs">Nenhuma proposta ainda</p>
          </div>
        )}

        {convite.historico.map((p, i) => {
          const isProdutor = p.de === 'produtor';
          const isSistema = p.de === 'sistema';
          const isMe = p.de === papel;

          if (isSistema) {
            return (
              <div key={i} className="flex justify-center">
                <span className="text-[9px] text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-full">
                  {p.acao === 'expirar' ? 'Prazo expirado — negociação encerrada' : p.acao}
                </span>
              </div>
            );
          }

          const acaoLabel =
            {
              proposta: 'Proposta inicial',
              contraproposta: 'Contraproposta',
              aceitar: 'Aceitou',
              recusar: 'Recusou',
              cancelar: 'Cancelou',
            }[p.acao] ?? p.acao;

          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMe
                    ? 'bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-br-md'
                    : 'bg-zinc-900/80 border border-white/5 rounded-bl-md'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-[#FFD300]/70' : 'text-zinc-400'}`}
                  >
                    {isProdutor ? nomeProdutor : nomeSocio}
                  </span>
                  <span className="text-[8px] text-zinc-400">{acaoLabel}</span>
                </div>

                {p.percentual !== undefined && (
                  <div className={`text-2xl font-black mb-1 ${isMe ? 'text-[#FFD300]' : 'text-white'}`}>
                    {p.percentual}%<span className="text-xs font-normal text-zinc-400 ml-1">pro sócio</span>
                  </div>
                )}

                {p.mensagem && <p className="text-zinc-300 text-xs leading-relaxed mt-1 italic">"{p.mensagem}"</p>}

                <p className="text-[8px] text-zinc-400 mt-2 text-right">{fmtData(p.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* ── Ações ───────────────────────────────────────────────────────────── */}
      {!encerrada && minhaVez && !showContrapor && !showRecusar && !showConfirmAceitar && (
        <div
          className="shrink-0 px-4 pt-3 border-t border-white/5"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setShowRecusar(true)}
              disabled={enviando}
              className="py-3.5 px-4 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <X size={14} /> {papel === 'produtor' ? 'Cancelar' : 'Recusar'}
            </button>
            {podeContrapor && (
              <button
                onClick={() => {
                  setShowContrapor(true);
                  setNovoPercentual(String(convite.splitSocio));
                  setNovaMensagem('');
                }}
                disabled={enviando}
                className="flex-1 py-3.5 bg-zinc-900 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                <MessageSquare size={14} /> Contrapor
              </button>
            )}
            <button
              onClick={() => setShowConfirmAceitar(true)}
              disabled={enviando}
              className="flex-1 py-3.5 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Check size={14} /> Aceitar {convite.splitSocio}%
            </button>
          </div>
        </div>
      )}

      {/* Aguardando outro lado */}
      {!encerrada && !minhaVez && (
        <div
          className="shrink-0 px-4 py-4 border-t border-white/5 text-center"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <p className="text-zinc-400 text-xs">
            <Clock size={12} className="inline mr-1 -mt-0.5" />
            Aguardando resposta {papel === 'socio' ? 'do produtor' : 'do sócio'}...
          </p>
        </div>
      )}

      {/* Encerrada */}
      {encerrada && (
        <div
          className="shrink-0 px-4 py-4 border-t border-white/5 space-y-3"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className={`text-center py-3 rounded-xl border ${statusColor}`}>
            <p className="text-xs font-bold">{statusLabel}</p>
            {convite.status === 'ACEITO' && (
              <p className="text-[10px] mt-1 opacity-70">
                Percentual final: {convite.splitSocio}% sócio / {convite.splitProdutor}% produtor
              </p>
            )}
          </div>
          {papel === 'produtor' && convite.status !== 'ACEITO' && !showReiniciar && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReiniciar(true);
                  setReiniciarPercentual(String(convite.splitSocio));
                  setReiniciarMensagem('');
                }}
                className="flex-1 py-3 bg-zinc-900 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <RefreshCw size={14} /> Reiniciar negociação
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Painel Reiniciar Negociação ──────────────────────────────────────── */}
      {showReiniciar && (
        <div
          className="shrink-0 px-4 pt-3 border-t border-cyan-500/20 bg-cyan-500/5"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-3">Nova proposta</p>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-cyan-400/70 font-bold uppercase tracking-widest block mb-1">
                Percentual pro sócio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reiniciarPercentual}
                  onChange={e => setReiniciarPercentual(e.target.value)}
                  className="w-24 bg-zinc-900 border border-white/10 text-white text-lg font-bold px-3 py-2 rounded-xl text-center focus:outline-none focus:border-cyan-500/40"
                />
                <span className="text-zinc-400 text-sm font-bold">%</span>
                <span className="text-zinc-400 text-xs ml-2">
                  Produtor: {100 - (parseInt(reiniciarPercentual, 10) || 0)}%
                </span>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-cyan-400/70 font-bold uppercase tracking-widest block mb-1">
                Mensagem <span className="text-zinc-400">({reiniciarMensagem.length}/500)</span>
              </label>
              <textarea
                value={reiniciarMensagem}
                onChange={e => setReiniciarMensagem(e.target.value.slice(0, 500))}
                placeholder="Explique por que quer negociar novamente..."
                rows={2}
                className="w-full bg-zinc-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl resize-none focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReiniciar(false)}
                className="py-3 px-4 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleReiniciar}
                disabled={enviando || !reiniciarPercentual}
                className="flex-1 py-3 bg-cyan-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar nova proposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Painel Contrapor ────────────────────────────────────────────────── */}
      {showContrapor && (
        <div
          className="shrink-0 px-4 pt-3 border-t border-cyan-500/20 bg-cyan-500/5"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                Novo percentual pro sócio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={novoPercentual}
                  onChange={e => setNovoPercentual(e.target.value)}
                  className="w-24 bg-zinc-900 border border-white/10 text-white text-lg font-bold px-3 py-2 rounded-xl text-center focus:outline-none focus:border-cyan-500/40"
                />
                <span className="text-zinc-400 text-sm font-bold">%</span>
                <span className="text-zinc-400 text-xs ml-2">
                  Produtor: {100 - (parseInt(novoPercentual, 10) || 0)}%
                </span>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                Mensagem <span className="text-zinc-400">({novaMensagem.length}/500)</span>
              </label>
              <textarea
                value={novaMensagem}
                onChange={e => setNovaMensagem(e.target.value.slice(0, 500))}
                placeholder="Explique sua proposta..."
                rows={2}
                className="w-full bg-zinc-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl resize-none focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowContrapor(false)}
                className="py-3 px-4 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleContrapor}
                disabled={enviando || !novoPercentual}
                className="flex-1 py-3 bg-cyan-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar contraproposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Aceitar ──────────────────────────────────────────── */}
      {showConfirmAceitar && (
        <div className="absolute inset-0 z-60 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <p className="text-white font-bold text-sm text-center">Confirmar acordo</p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-[9px] text-emerald-400/60 font-black uppercase tracking-widest mb-1">
                Percentual do sócio
              </p>
              <p className="text-emerald-400 text-3xl font-black">{convite.splitSocio}%</p>
              <p className="text-zinc-400 text-[10px] mt-1">Produtor: {convite.splitProdutor}%</p>
            </div>
            <p className="text-zinc-400 text-xs text-center">
              O evento será publicado automaticamente após a confirmação.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmAceitar(false)}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleAceitar}
                disabled={enviando}
                className="flex-1 py-3 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Recusar ───────────────────────────────────────────────────── */}
      {showRecusar && (
        <div className="absolute inset-0 z-60 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <p className="text-white font-bold text-sm text-center">
              {papel === 'produtor' ? 'Cancelar convite' : 'Recusar proposta'}
            </p>
            <p className="text-zinc-400 text-xs text-center">
              {papel === 'produtor'
                ? 'O convite será cancelado e o evento voltará para rascunho.'
                : 'O produtor poderá enviar uma nova proposta ou convidar outro sócio.'}
            </p>
            <textarea
              value={motivoRecusa}
              onChange={e => setMotivoRecusa(e.target.value.slice(0, 500))}
              placeholder="Motivo (opcional)..."
              rows={2}
              className="w-full bg-zinc-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl resize-none focus:outline-none focus:border-red-500/40"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRecusar(false);
                  setMotivoRecusa('');
                }}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-[0.98] transition-all"
              >
                Voltar
              </button>
              <button
                aria-label="Carregando"
                onClick={handleRecusar}
                disabled={enviando}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                {papel === 'produtor' ? 'Cancelar convite' : 'Recusar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
