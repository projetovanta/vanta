/**
 * ConviteSocioModal — Modal global para aceitar/recusar/contra-proposta de convite sócio.
 * Abre direto da Home (via notificação CONVITE_SOCIO), sem precisar do painel admin.
 * Busca evento direto do Supabase (não depende do cache EVENTOS_ADMIN).
 */
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  Image,
  Percent,
  Shield,
  MessageSquare,
  Repeat,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import type { Notificacao } from '../types';
import { useModalBack } from '../hooks/useModalStack';
import { VantaSlider } from './VantaSlider';

// ── Types ────────────────────────────────────────────────────────────────────
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
  splitSocio: number;
  splitProdutor: number;
  permissoesProdutor: string[];
  rodadaNegociacao: number;
  mensagemNegociacao?: string;
  statusEvento: string;
}

interface Props {
  eventoId: string;
  userId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

/** Shape dos RPCs de convite sócio */
interface ConviteRpcResult {
  ok?: boolean;
  error?: string;
  criador_id?: string;
  nome?: string;
  definitivo?: boolean;
  rodada?: number;
  nova_rodada?: number;
  [key: string]: unknown;
}

// ── Permissoes disponíveis ──────────────────────────────────────────────────
const PERMISSOES_DISPONIVEIS = [
  'VER_FINANCEIRO',
  'GERIR_EQUIPE',
  'GERIR_LISTAS',
  'INSERIR_LISTA',
  'CRIAR_REGRA_LISTA',
  'VER_LISTA',
] as const;

// ── Formato de data ─────────────────────────────────────────────────────────
const formatDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
};

// ── Sub-modais ──────────────────────────────────────────────────────────────

const ModalRecusa: React.FC<{
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
}> = ({ onConfirmar, onCancelar }) => {
  const [motivo, setMotivo] = useState('');
  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-4 pb-2">
          <p className="text-white font-bold text-base mb-1">Recusar convite</p>
          <p className="text-zinc-400 text-sm mb-4">Opcionalmente, informe o motivo para o produtor.</p>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)..."
            rows={3}
            autoFocus
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/30 placeholder-zinc-700 resize-none"
          />
        </div>
        <div className="px-6 pt-2 flex gap-3" style={{ paddingBottom: '1.5rem' }}>
          <button
            onClick={onCancelar}
            className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(motivo.trim())}
            className="flex-1 py-4 bg-red-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Confirmar Recusa
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalContraProposta: React.FC<{
  splitSocioAtual: number;
  splitProdutorAtual: number;
  permissoesAtuais: string[];
  onConfirmar: (proposta: {
    splitSocio: number;
    splitProdutor: number;
    permissoesProdutor?: string[];
    mensagem?: string;
  }) => void;
  onCancelar: () => void;
}> = ({ splitSocioAtual, splitProdutorAtual: _, permissoesAtuais, onConfirmar, onCancelar }) => {
  const [splitSocio, setSplitSocio] = useState(splitSocioAtual);
  const [permissoes, setPermissoes] = useState<string[]>(permissoesAtuais);
  const [mensagem, setMensagem] = useState('');

  const splitProdutor = 100 - splitSocio;

  const togglePerm = (p: string) => {
    setPermissoes(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-2 space-y-5">
          <div>
            <p className="text-white font-bold text-base mb-1">Contra-proposta</p>
            <p className="text-zinc-400 text-sm">Ajuste o split e permissões. O produtor será notificado.</p>
          </div>

          {/* Split */}
          <div>
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Split da Receita</p>
            <VantaSlider min={10} max={90} value={splitSocio} onChange={setSplitSocio} className="w-full" />
            <div className="flex justify-between mt-1">
              <span className="text-emerald-400 text-xs font-bold">Sócio: {splitSocio}%</span>
              <span className="text-zinc-400 text-xs font-bold">Produtor: {splitProdutor}%</span>
            </div>
          </div>

          {/* Permissões */}
          <div>
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Permissões do Produtor</p>
            <div className="space-y-1.5">
              {PERMISSOES_DISPONIVEIS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePerm(p)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                    permissoes.includes(p) ? 'bg-purple-500/10 border-purple-500/20' : 'bg-zinc-900/50 border-white/5'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      permissoes.includes(p) ? 'border-purple-400 bg-purple-400' : 'border-zinc-600'
                    }`}
                  >
                    {permissoes.includes(p) && <Check size={8} className="text-black" strokeWidth={3} />}
                  </div>
                  <span className="text-zinc-300 text-xs">{p.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Mensagem (opcional)</p>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder="Justifique sua contra-proposta..."
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/30 placeholder-zinc-700 resize-none"
            />
          </div>
        </div>

        <div className="px-6 pt-3 flex gap-3 shrink-0" style={{ paddingBottom: '1.5rem' }}>
          <button
            onClick={onCancelar}
            className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onConfirmar({
                splitSocio,
                splitProdutor,
                permissoesProdutor: permissoes,
                mensagem: mensagem.trim() || undefined,
              })
            }
            className="flex-1 py-4 bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Enviar Proposta
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Bloco de Seção ──────────────────────────────────────────────────────────
const SectionBlock: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  borderColor?: string;
}> = ({ icon, title, children, borderColor }) => (
  <div
    className="bg-zinc-900/50 border rounded-2xl p-4 space-y-3"
    style={{ borderColor: borderColor ?? 'rgba(255,255,255,0.05)' }}
  >
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

// ── Modal Principal ─────────────────────────────────────────────────────────
export const ConviteSocioModal: React.FC<Props> = ({ eventoId, userId, onClose, onSuccess }) => {
  useModalBack(true, onClose, 'convite-socio');
  const [convite, setConvite] = useState<ConviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showRecusa, setShowRecusa] = useState(false);
  const [showContraProposta, setShowContraProposta] = useState(false);
  const [aceitando, setAceitando] = useState(false);
  const [enviandoProposta, setEnviandoProposta] = useState(false);

  // Busca evento via RPC SECURITY DEFINER (bypassa RLS)
  useEffect(() => {
    const fetchConvite = async () => {
      setLoading(true);
      setErro(null);

      const { data, error: rpcErr } = await supabase.rpc('get_convite_socio', {
        p_evento_id: eventoId,
      });

      if (rpcErr) {
        setErro('Erro ao carregar convite.');
        setLoading(false);
        return;
      }

      const ev = data as ConviteRpcResult | null;
      if (!ev || ev.error) {
        const errMsg =
          ev?.error === 'not_authorized' ? 'Você não é o sócio convidado deste evento.' : 'Evento não encontrado.';
        setErro(errMsg);
        setLoading(false);
        return;
      }

      if (ev.status_evento !== 'NEGOCIANDO') {
        setErro('Este convite não está mais em negociação.');
        setLoading(false);
        return;
      }

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
        splitSocio: (ev.split_socio as number) ?? 70,
        splitProdutor: (ev.split_produtor as number) ?? 30,
        permissoesProdutor: (ev.permissoes_produtor as string[]) ?? [],
        rodadaNegociacao: (ev.rodada_negociacao as number) ?? 1,
        mensagemNegociacao: (ev.mensagem_negociacao as string) ?? undefined,
        statusEvento: (ev.status_evento as string) ?? '',
      });
      setLoading(false);
    };

    fetchConvite();
  }, [eventoId, userId]);

  // ── Helper: notificar produtor via app ───────────────────────────────────────
  const notificarProdutor = async (criadorId: string, tipo: Notificacao['tipo'], titulo: string, mensagem: string) => {
    try {
      const { notificationsService } = await import('../features/admin/services/notificationsService');
      void notificationsService.add(
        {
          tipo,
          titulo,
          mensagem,
          link: `/admin/evento/${eventoId}`,
          lida: false,
          timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00',
        },
        criadorId,
      );
    } catch {
      /* silencioso */
    }
  };

  // ── Helper: atribuir RBAC sócio ────────────────────────────────────────────
  const atribuirRbacSocio = async () => {
    try {
      const { rbacService, CARGO_PERMISSOES } = await import('../features/admin/services/rbacService');
      await rbacService.atribuir({
        userId,
        tenant: { tipo: 'EVENTO', id: eventoId, nome: convite?.nome ?? '', foto: convite?.foto },
        cargo: 'SOCIO',
        permissoes: CARGO_PERMISSOES.SOCIO,
        atribuidoPor: userId,
        ativo: true,
      });
    } catch {
      /* silencioso */
    }
  };

  // ── Handlers (RPCs SECURITY DEFINER) ──────────────────────────────────────
  const handleAceitar = async () => {
    setAceitando(true);
    const { data, error } = await supabase.rpc('aceitar_convite_socio', { p_evento_id: eventoId });
    const res = data as ConviteRpcResult | null;
    if (error || !res?.ok) {
      setAceitando(false);
      return;
    }
    await atribuirRbacSocio();
    if (res.criador_id) {
      await notificarProdutor(
        res.criador_id,
        'SISTEMA',
        'Convite aceito!',
        `O sócio aceitou o convite para "${res.nome}". O evento está na fila de aprovação.`,
      );
    }
    onSuccess('Convite aceito! O evento foi enviado para aprovação.');
  };

  const handleRecusar = async (motivo: string) => {
    const { data, error } = await supabase.rpc('recusar_convite_socio', {
      p_evento_id: eventoId,
      p_motivo: motivo || null,
    });
    setShowRecusa(false);
    const res = data as ConviteRpcResult | null;
    if (error || !res?.ok) return;
    if (res.criador_id) {
      const definitivo = !!res.definitivo;
      const rodada = res.rodada ?? 0;
      const msg = definitivo
        ? `O sócio recusou definitivamente o convite para "${res.nome}" (3 tentativas esgotadas).${motivo ? ` Motivo: ${motivo}` : ''}`
        : `O sócio recusou o convite para "${res.nome}" (rodada ${rodada}/3). Ajuste a proposta e reenvie.${motivo ? ` Motivo: ${motivo}` : ''}`;
      await notificarProdutor(
        res.criador_id,
        'SISTEMA',
        definitivo ? 'Convite recusado definitivamente' : 'Convite recusado — ajuste a proposta',
        msg,
      );
    }
    const definitivo = !!res?.definitivo;
    onSuccess(
      definitivo ? 'Convite recusado definitivamente.' : 'Convite recusado. O produtor pode enviar nova proposta.',
    );
  };

  const handleContraProposta = async (proposta: {
    splitSocio: number;
    splitProdutor: number;
    permissoesProdutor?: string[];
    mensagem?: string;
  }) => {
    setEnviandoProposta(true);
    const { data, error } = await supabase.rpc('contraproposta_convite_socio', {
      p_evento_id: eventoId,
      p_split_socio: proposta.splitSocio,
      p_split_produtor: proposta.splitProdutor,
      p_permissoes_produtor: proposta.permissoesProdutor ?? null,
      p_mensagem: proposta.mensagem ?? null,
    });
    setEnviandoProposta(false);
    setShowContraProposta(false);
    const res = data as ConviteRpcResult | null;
    if (error || !res?.ok) return;
    if (res.criador_id) {
      const novaRodada = res.nova_rodada ?? 0;
      await notificarProdutor(
        res.criador_id,
        'CONVITE_SOCIO',
        'Contra-proposta recebida',
        `O sócio enviou uma contra-proposta para "${res.nome}" (rodada ${novaRodada}/3).${proposta.mensagem ? ` "${proposta.mensagem}"` : ''}`,
      );
    }
    onSuccess('Contra-proposta enviada ao produtor!');
  };

  // ── Loading / Erro ──────────────────────────────────────────────────────────
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
        <p className="text-zinc-400 text-sm text-center">{erro ?? 'Erro ao carregar convite.'}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-zinc-900 border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
        >
          Fechar
        </button>
      </div>
    );
  }

  const podeContrapor = convite.rodadaNegociacao < 3;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header com foto */}
      <div className="relative shrink-0 h-48">
        {convite.foto ? (
          <img loading="lazy" src={convite.foto} alt={convite.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Image size={32} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
        <button
          aria-label="Voltar"
          onClick={onClose}
          className="absolute left-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          style={{ top: '1.25rem' }}
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2.5 py-1 rounded-full inline-block">
              Convite Pendente
            </span>
            {convite.rodadaNegociacao > 1 && (
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/15 border border-cyan-400/20 px-2.5 py-1 rounded-full inline-block">
                Rodada {convite.rodadaNegociacao}/3
              </span>
            )}
          </div>
          <p className="text-white font-bold text-xl leading-tight truncate">{convite.nome}</p>
          <p className="text-zinc-400 text-[10px] mt-1 truncate">
            {convite.comunidadeNome} · {convite.cidade}
          </p>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {/* Info do Evento */}
        <SectionBlock icon={<Clock size={14} className="text-amber-400" />} title="Informações do Evento">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Data / Hora</p>
              <p className="text-white text-xs font-bold leading-tight">{formatDateTime(convite.dataInicio)}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Local</p>
              <p className="text-white text-xs font-bold truncate">{convite.local}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Produtor</p>
              <p className="text-white text-xs font-bold truncate">{convite.criadorNome}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Comunidade</p>
              <p className="text-white text-xs font-bold truncate">{convite.comunidadeNome}</p>
            </div>
          </div>
          {convite.descricao && (
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Descrição</p>
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">{convite.descricao}</p>
            </div>
          )}
        </SectionBlock>

        {/* Proposta Financeira */}
        <SectionBlock
          icon={<Percent size={14} className="text-emerald-400" />}
          title="Proposta Financeira"
          borderColor="rgba(16,185,129,0.15)"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 text-center">
              <p className="text-[8px] text-emerald-400/60 font-black uppercase tracking-widest mb-1">
                Sua Parte (Sócio)
              </p>
              <p className="text-emerald-400 text-2xl font-black">{convite.splitSocio}%</p>
            </div>
            <div className="bg-zinc-900/80 border border-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Produtor</p>
              <p className="text-zinc-400 text-2xl font-black">{convite.splitProdutor}%</p>
            </div>
          </div>
        </SectionBlock>

        {/* Mensagem de negociação */}
        {convite.mensagemNegociacao && (
          <SectionBlock
            icon={<MessageSquare size={14} className="text-cyan-400" />}
            title="Última Mensagem"
            borderColor="rgba(6,182,212,0.15)"
          >
            <p className="text-zinc-300 text-xs leading-relaxed italic">"{convite.mensagemNegociacao}"</p>
          </SectionBlock>
        )}

        {/* Permissoes oferecidas ao Produtor */}
        {convite.permissoesProdutor.length > 0 && (
          <SectionBlock
            icon={<Shield size={14} className="text-purple-400" />}
            title="Permissões do Produtor"
            borderColor="rgba(168,139,250,0.15)"
          >
            <div className="space-y-1.5">
              {convite.permissoesProdutor.map(p => (
                <div
                  key={p}
                  className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/10 rounded-xl px-3 py-2"
                >
                  <Check size={12} className="text-purple-400 shrink-0" />
                  <p className="text-zinc-300 text-xs">{p.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 bg-zinc-950/50 rounded-xl px-3 py-2">
              <AlertTriangle size={11} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-zinc-400 text-[9px] leading-relaxed">
                O produtor terá acesso a esses módulos no evento. Você pode ajustar na contra-proposta.
              </p>
            </div>
          </SectionBlock>
        )}
      </div>

      {/* Footer: Ações */}
      <div
        className="shrink-0 px-5 pt-3 border-t border-white/5 flex gap-2"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => setShowRecusa(true)}
          disabled={aceitando || enviandoProposta}
          className="py-4 px-3 bg-zinc-900 border border-red-500/20 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <X size={14} /> Recusar
        </button>
        {podeContrapor && (
          <button
            onClick={() => setShowContraProposta(true)}
            disabled={aceitando || enviandoProposta}
            className="flex-1 py-4 bg-zinc-900 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <Repeat size={14} /> Contra-proposta
          </button>
        )}
        <button
          onClick={handleAceitar}
          disabled={aceitando || enviandoProposta}
          className="flex-1 py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {aceitando ? <Clock size={14} className="animate-spin" /> : <Check size={14} />}
          {aceitando ? 'Aceitando...' : 'Aceitar'}
        </button>
      </div>

      {/* Sub-modais */}
      {showRecusa && <ModalRecusa onConfirmar={handleRecusar} onCancelar={() => setShowRecusa(false)} />}
      {showContraProposta && (
        <ModalContraProposta
          splitSocioAtual={convite.splitSocio}
          splitProdutorAtual={convite.splitProdutor}
          permissoesAtuais={convite.permissoesProdutor}
          onConfirmar={handleContraProposta}
          onCancelar={() => setShowContraProposta(false)}
        />
      )}
    </div>
  );
};
