import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Check,
  X,
  Clock,
  Image,
  Banknote,
  AlertTriangle,
  Percent,
  Shield,
  ChevronRight,
  MessageSquare,
  Repeat,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { EventoAdmin } from '../../../types';
import { eventosAdminService } from '../services/eventosAdminService';
import { supabase } from '../../../services/supabaseClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import { VantaSlider } from '../../../components/VantaSlider';

// ── Utils ─────────────────────────────────────────────────────────────────────
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

// ── Modal de Recusa ──────────────────────────────────────────────────────────
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

// ── Permissões disponíveis ────────────────────────────────────────────────────
const PERMISSOES_DISPONIVEIS = [
  'VER_FINANCEIRO',
  'GERIR_EQUIPE',
  'GERIR_LISTAS',
  'INSERIR_LISTA',
  'CRIAR_REGRA_LISTA',
  'VER_LISTA',
] as const;

// ── Modal de Contra-Proposta ─────────────────────────────────────────────────
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
}> = ({ splitSocioAtual, splitProdutorAtual, permissoesAtuais, onConfirmar, onCancelar }) => {
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
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-2 space-y-5">
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

// ── Bloco de Seção ────────────────────────────────────────────────────────────
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

// ── Detalhe do Convite ───────────────────────────────────────────────────────
const ConviteDetalheView: React.FC<{
  evento: EventoAdmin;
  socioId: string;
  onBack: () => void;
  onAceito: () => void;
  onRecusado: () => void;
}> = ({ evento, socioId, onBack, onAceito, onRecusado }) => {
  const [showRecusa, setShowRecusa] = useState(false);
  const [showContraProposta, setShowContraProposta] = useState(false);
  const [aceitando, setAceitando] = useState(false);
  const [enviandoProposta, setEnviandoProposta] = useState(false);

  const handleAceitar = async () => {
    setAceitando(true);
    const { error } = await supabase.rpc('aceitar_convite_socio', { p_evento_id: evento.id });
    if (!error) onAceito();
    else setAceitando(false);
  };

  const handleRecusar = async (motivo: string) => {
    const { error } = await supabase.rpc('recusar_convite_socio', {
      p_evento_id: evento.id,
      p_motivo: motivo || 'Sócio recusou o convite',
    });
    setShowRecusa(false);
    if (!error) onRecusado();
  };

  const handleContraProposta = async (proposta: {
    splitSocio: number;
    splitProdutor: number;
    permissoesProdutor?: string[];
    mensagem?: string;
  }) => {
    setEnviandoProposta(true);
    const { error } = await supabase.rpc('contraproposta_convite_socio', {
      p_evento_id: evento.id,
      p_split_socio: proposta.splitSocio,
      p_split_produtor: proposta.splitProdutor,
      p_permissoes_produtor: proposta.permissoesProdutor ?? [],
      p_mensagem: proposta.mensagem ?? '',
    });
    setEnviandoProposta(false);
    setShowContraProposta(false);
    if (!error) onRecusado();
  };

  const podeContrapor = (evento.rodadaNegociacao ?? 1) < 3;

  const todasVariacoes = evento.lotes.flatMap(l => l.variacoes);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Header com foto */}
      <div className="relative shrink-0 h-48">
        {evento.foto ? (
          <img loading="lazy" src={evento.foto} alt={evento.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Image size={32} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="absolute top-8 left-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2.5 py-1 rounded-full inline-block">
              Convite Pendente
            </span>
            {(evento.rodadaNegociacao ?? 1) > 1 && (
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/15 border border-cyan-400/20 px-2.5 py-1 rounded-full inline-block">
                Rodada {evento.rodadaNegociacao}/3
              </span>
            )}
          </div>
          <p className="text-white font-bold text-xl leading-tight truncate">{evento.nome}</p>
          <p className="text-zinc-400 text-[10px] mt-1 truncate">
            {evento.comunidade.nome} · {evento.cidade}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {/* Info do Evento */}
        <SectionBlock icon={<Mail size={14} className="text-amber-400" />} title="Informacoes do Evento">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Data / Hora</p>
              <p className="text-white text-xs font-bold leading-tight">{formatDateTime(evento.dataInicio)}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Local</p>
              <p className="text-white text-xs font-bold truncate">{evento.local}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Produtor</p>
              <p className="text-white text-xs font-bold truncate">{evento.criadorNome ?? '—'}</p>
            </div>
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Formato</p>
              <p className="text-white text-xs font-bold truncate">{evento.formato || evento.categoria || '—'}</p>
            </div>
          </div>
          {evento.descricao && (
            <div>
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Descricao</p>
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">{evento.descricao}</p>
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
                Sua Parte (Socio)
              </p>
              <p className="text-emerald-400 text-2xl font-black">{evento.splitSocio ?? 70}%</p>
            </div>
            <div className="bg-zinc-900/80 border border-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Produtor</p>
              <p className="text-zinc-400 text-2xl font-black">{evento.splitProdutor ?? 30}%</p>
            </div>
          </div>
          {todasVariacoes.length > 0 &&
            (() => {
              const faturEstimado = todasVariacoes.reduce((s, v) => s + v.valor * v.limite, 0);
              const suaParte = faturEstimado * ((evento.splitSocio ?? 70) / 100);
              return (
                <div className="bg-zinc-950/50 rounded-xl px-3 py-2.5">
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">
                    Estimativa (lotacao max.)
                  </p>
                  <p className="text-zinc-300 text-[10px] leading-relaxed">
                    Faturamento bruto:{' '}
                    <span className="text-white font-bold">
                      R$ {faturEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>{' '}
                    · Sua parte:{' '}
                    <span className="text-emerald-400 font-bold">
                      R$ {suaParte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              );
            })()}
        </SectionBlock>

        {/* Mensagem de negociação */}
        {evento.mensagemNegociacao && (
          <SectionBlock
            icon={<MessageSquare size={14} className="text-cyan-400" />}
            title="Última Mensagem"
            borderColor="rgba(6,182,212,0.15)"
          >
            <p className="text-zinc-300 text-xs leading-relaxed italic">"{evento.mensagemNegociacao}"</p>
          </SectionBlock>
        )}

        {/* Permissoes oferecidas ao Produtor */}
        {evento.permissoesProdutor && evento.permissoesProdutor.length > 0 && (
          <SectionBlock
            icon={<Shield size={14} className="text-purple-400" />}
            title="Permissoes do Produtor"
            borderColor="rgba(168,139,250,0.15)"
          >
            <div className="space-y-1.5">
              {evento.permissoesProdutor.map(p => (
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
                O produtor tera acesso a esses modulos no evento. Voce pode ajustar depois.
              </p>
            </div>
          </SectionBlock>
        )}

        {/* Ingressos */}
        {evento.lotes.length > 0 && (
          <SectionBlock icon={<Banknote size={14} className="text-blue-400" />} title="Ingressos Configurados">
            {evento.lotes.map(lote => (
              <div key={lote.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-300 text-xs font-bold truncate">{lote.nome}</p>
                  <span className="text-zinc-400 text-[9px]">{lote.limitTotal} ingressos</span>
                </div>
                <div className="bg-zinc-950/50 rounded-xl overflow-hidden">
                  {lote.variacoes.map(v => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between px-3 py-2 border-b border-white/[0.02] last:border-0"
                    >
                      <p className="text-zinc-300 text-xs truncate flex-1">
                        {v.area === 'OUTRO' ? v.areaCustom : v.area} ·{' '}
                        {v.genero === 'MASCULINO' ? 'Masc.' : v.genero === 'FEMININO' ? 'Fem.' : 'Unisex'}
                      </p>
                      <p className="text-white text-xs font-bold tabular-nums shrink-0">
                        R$ {v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </SectionBlock>
        )}
      </div>

      {/* Footer: Acao */}
      <div className="shrink-0 px-5 pt-3 border-t border-white/5 flex gap-2" style={{ paddingBottom: '1.5rem' }}>
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

      {/* Modal de Recusa */}
      {showRecusa && <ModalRecusa onConfirmar={handleRecusar} onCancelar={() => setShowRecusa(false)} />}

      {/* Modal de Contra-Proposta */}
      {showContraProposta && (
        <ModalContraProposta
          splitSocioAtual={evento.splitSocio ?? 70}
          splitProdutorAtual={evento.splitProdutor ?? 30}
          permissoesAtuais={evento.permissoesProdutor ?? []}
          onConfirmar={handleContraProposta}
          onCancelar={() => setShowContraProposta(false)}
        />
      )}
    </div>
  );
};

// ── ConvitesSocioView ────────────────────────────────────────────────────────
export const ConvitesSocioView: React.FC<{
  onBack: () => void;
  socioId: string;
}> = ({ onBack, socioId }) => {
  const [convites, setConvites] = useState<EventoAdmin[]>(() => eventosAdminService.getConvitesPendentes(socioId));
  const [selecionado, setSelecionado] = useState<EventoAdmin | null>(null);
  const { toasts, dismiss, toast } = useToast();

  const refreshConvites = () => {
    setConvites(eventosAdminService.getConvitesPendentes(socioId));
    setSelecionado(null);
  };

  // Polling leve
  useEffect(() => {
    const timer = setInterval(() => {
      setConvites(eventosAdminService.getConvitesPendentes(socioId));
    }, 3000);
    return () => clearInterval(timer);
  }, [socioId]);

  if (selecionado) {
    return (
      <ConviteDetalheView
        evento={selecionado}
        socioId={socioId}
        onBack={() => setSelecionado(null)}
        onAceito={() => {
          refreshConvites();
          toast('sucesso', 'Convite aceito! Evento enviado para aprovação.');
        }}
        onRecusado={() => {
          refreshConvites();
          toast('sucesso', 'Ação concluída.');
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Portal Socio
            </p>
            <div className="flex items-center gap-3">
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
                Convites
              </h1>
              {convites.length > 0 && (
                <span className="bg-amber-500 text-black text-[9px] font-black px-2.5 py-1 rounded-full">
                  {convites.length}
                </span>
              )}
            </div>
          </div>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
        {convites.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Mail size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest text-center">
              Nenhum convite pendente.
            </p>
          </div>
        )}

        {convites.map(ev => {
          const splitLabel = `${ev.splitSocio ?? 70}% socio · ${ev.splitProdutor ?? 30}% produtor`;
          return (
            <button
              key={ev.id}
              onClick={() => setSelecionado(ev)}
              className="w-full flex gap-4 p-0 bg-zinc-900/40 border border-amber-500/10 rounded-2xl overflow-hidden text-left active:bg-amber-500/5 transition-all"
            >
              {ev.foto ? (
                <div className="w-24 shrink-0 overflow-hidden">
                  <img loading="lazy" src={ev.foto} alt={ev.nome} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 shrink-0 bg-zinc-800 flex items-center justify-center aspect-square">
                  <Mail size={24} className="text-amber-500/40" />
                </div>
              )}
              <div className="flex-1 min-w-0 py-4 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[7px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    Convite
                  </span>
                </div>
                <p className="text-white font-bold text-sm leading-tight truncate mb-0.5">{ev.nome}</p>
                <p className="text-zinc-400 text-[10px] truncate mb-1">
                  {ev.criadorNome ?? 'Produtor'} · {ev.comunidade.nome}
                </p>
                <p className="text-zinc-700 text-[9px]">{formatDateTime(ev.dataInicio)}</p>
                <p className="text-emerald-400/80 text-[9px] font-bold mt-1 truncate">{splitLabel}</p>
              </div>
              <div className="flex items-center pr-3 shrink-0">
                <ChevronRight size={14} className="text-zinc-700" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
