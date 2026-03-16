import React, { useState, useEffect, useMemo } from 'react';
import { fmtTelefone } from '@/components/auth/authHelpers';
import {
  ArrowLeft,
  Crown,
  Instagram,
  Send,
  UserPlus,
  Check,
  Clock,
  AlertTriangle,
  Globe,
  MapPin,
  Sparkles,
  Shield,
  ChevronRight,
  CheckSquare,
  Square,
  Loader2,
  Copy,
  BadgeCheck,
  ShieldAlert,
  Share2,
  Ban,
  OctagonAlert,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Membro, Evento } from '../../types';
import type { ResgateMV } from '../../features/admin/services/clube/clubeReservasService';
import { clubeService } from '../../features/admin/services/clubeService';
import { maisVantaConfigService } from '../../features/admin/services/maisVantaConfigService';
import { tsBR, todayBR } from '../../utils';
import { supabase } from '../../services/supabaseClient';

// ── Termos de uso LGPD (fallback se config.termosCustomizados for null) ────────
const TERMOS_PADRAO = `TERMOS DE USO — CLUBE MAIS VANTA

1. NATUREZA DO PROGRAMA
O Clube MAIS VANTA é um programa de permutas entre criadores de conteúdo e lugares parceiros. A participação é um benefício, NÃO um direito. A aprovação da solicitação está sujeita à análise interna e discricionária da equipe de curadoria, sem garantia de aceitação.

2. OBRIGAÇÕES DO MEMBRO
Ao ser aprovado, o membro se compromete a:
• Publicar conteúdo com as hashtags obrigatórias conforme regulamentação do CONAR;
• Incluir menções ao estabelecimento conforme prazo definido no programa;
• Manter o conteúdo publicado pelo período mínimo de 24 horas.
O descumprimento gerará débito de crédito social, bloqueando novas reservas até a regularização.

3. PROTEÇÃO DE DADOS (LGPD — Lei nº 13.709/2018)
Em conformidade com a Lei Geral de Proteção de Dados Pessoais:
• Finalidade: seus dados pessoais (nome, e-mail, Instagram, número de seguidores) serão utilizados exclusivamente para gestão do programa, curadoria e comunicação relacionada.
• Base legal: consentimento explícito do titular (Art. 7º, I).
• Compartilhamento: seus dados poderão ser compartilhados com os lugares parceiros onde você realizar reservas, limitado ao necessário para execução do benefício.
• Direitos do titular: você pode, a qualquer momento, acessar, corrigir, anonimizar, bloquear, excluir ou solicitar a portabilidade dos seus dados pessoais.
• Revogação: o consentimento pode ser revogado a qualquer momento, o que poderá resultar no desligamento do programa.
• Armazenamento: seus dados são armazenados de forma segura em servidores protegidos, pelo tempo necessário ao cumprimento das finalidades descritas.

4. LIMITAÇÃO DE RESPONSABILIDADE
A plataforma não garante um número mínimo de eventos, reservas ou benefícios. A disponibilidade depende dos lugares parceiros.

5. ALTERAÇÕES
Estes termos podem ser atualizados a qualquer momento. O uso continuado após alterações constitui aceite dos novos termos.`;

interface Props {
  profile: Membro;
  onBack: () => void;
  onSuccess?: (msg: string) => void;
  allEvents?: Evento[];
  conviteId?: string;
}

export const ClubeOptInView: React.FC<Props> = ({ profile, onBack, onSuccess, allEvents = [], conviteId }) => {
  const [instagramHandle, setInstagramHandle] = useState(profile.instagram ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [solicitacaoStatus, setSolicitacaoStatus] = useState<'NONE' | 'PENDENTE' | 'APROVADO'>('NONE');
  const [minhasReservas, setMinhasReservas] = useState<ResgateMV[]>([]);
  const [postUrl, setPostUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'ATIVOS' | 'PASSADOS'>('ATIVOS');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [optInFase, setOptInFase] = useState<1 | 2>(conviteId ? 2 : 1);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarTermosModal, setMostrarTermosModal] = useState(false);
  const [profissao, setProfissao] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');
  const [indicadoPor, setIndicadoPor] = useState('');
  const [cidade, setCidade] = useState(profile.cidade ?? '');
  const [comoConheceuAberto, setComoConheceuAberto] = useState(false);
  const [genero, setGenero] = useState(profile.genero ?? '');
  const [frequencia, setFrequencia] = useState('');
  const [telDdd, setTelDdd] = useState(profile.telefone?.ddd ?? '');
  const [telNumero, setTelNumero] = useState(profile.telefone?.numero ?? '');
  const [interessesSel, setInteressesSel] = useState<string[]>(profile.interesses ?? []);

  // ── Instagram verificação ──────────────────────────────────────────────────
  type IgStep = 'INPUT' | 'CHECKING' | 'BIO_CHECK' | 'VERIFIED' | 'SKIPPED';
  const [igStep, setIgStep] = useState<IgStep>('INPUT');
  const [igFollowers, setIgFollowers] = useState<number | null>(null);
  const [igFormatted, setIgFormatted] = useState('');
  const [igVerified, setIgVerified] = useState(false);
  const [verificationCode] = useState(() => 'VANTA-' + Math.random().toString(36).substring(2, 6).toUpperCase());
  const [bioAttempts, setBioAttempts] = useState(0);
  const [igError, setIgError] = useState('');

  // ── Modo convite (master convidou) ──────────────────────────────────────────
  const isConvite = !!conviteId;
  const [conviteNomeMaster, setConviteNomeMaster] = useState('');

  const membro = useMemo(() => clubeService.getMembroClubeByUserId(profile.id), [profile.id]);
  const temDivida = useMemo(() => clubeService.temDividaSocial(profile.id), [profile.id]);
  const estaBloqueado = useMemo(() => clubeService.estaBloqueado(profile.id), [profile.id]);
  const bloqueioAte = useMemo(() => clubeService.getBloqueioAte(profile.id), [profile.id]);
  const isBanido = useMemo(() => clubeService.isBanidoPermanente(profile.id), [profile.id]);
  const [infracoes, setInfracoes] = useState<{ id: string; tipo: string; eventoNome: string; criadoEm: string }[]>([]);
  const [infracoesCount, setInfracoesCount] = useState(0);

  useEffect(() => {
    if (isConvite) {
      // Modo convite: verificar se convite é válido
      const sol = clubeService.getSolicitacoes().find(s => s.id === conviteId);
      if (sol?.status === 'APROVADO') {
        setSolicitacaoStatus('APROVADO');
      } else {
        setSolicitacaoStatus('NONE');
      }
      clubeService.getResgatesUsuarioAsync(profile.id).then(setMinhasReservas);
      return;
    }

    // Checar se já tem solicitação pendente
    const sols = clubeService.getSolicitacoesPendentes();
    const minha = sols.find(s => s.userId === profile.id);
    if (minha) setSolicitacaoStatus('PENDENTE');
    else if (membro) setSolicitacaoStatus('APROVADO');

    // Carregar minhas reservas + infrações
    clubeService.getResgatesUsuarioAsync(profile.id).then(setMinhasReservas);
    clubeService.getInfracoes(profile.id).then(list => {
      setInfracoes(
        list.map(i => ({ id: i.id, tipo: i.tipo, eventoNome: i.eventoNome ?? 'Evento', criadoEm: i.criadoEm })),
      );
    });
    clubeService.getInfracoesCount(profile.id).then(setInfracoesCount);
  }, [profile.id, membro, isConvite, conviteId]);

  const handleVerificarPerfil = async () => {
    const handle = instagramHandle.replace('@', '').trim();
    if (!handle) return;
    setIgStep('CHECKING');
    setIgError('');
    try {
      const result = await clubeService.verificarPerfilInstagram(handle);
      if (result.followers !== null) {
        setIgFollowers(result.followers);
        setIgFormatted(result.formatted);
        setIgStep('BIO_CHECK');
      } else {
        setIgError('Perfil não encontrado. Verifique o @.');
        setIgStep('INPUT');
      }
    } catch {
      setIgError('Erro ao verificar perfil. Tente novamente.');
      setIgStep('INPUT');
    }
  };

  const handleVerificarBio = async () => {
    const handle = instagramHandle.replace('@', '').trim();
    setIgStep('CHECKING');
    setIgError('');
    try {
      const result = await clubeService.verificarBioInstagram(handle, verificationCode);
      if (result.verified) {
        setIgVerified(true);
        setIgStep('VERIFIED');
      } else if (result.reason === 'UNAVAILABLE') {
        setBioAttempts(prev => prev + 1);
        setIgError('Não foi possível acessar a bio. A conta é privada?');
        setIgStep('BIO_CHECK');
      } else {
        setBioAttempts(prev => prev + 1);
        setIgError('Código não encontrado na bio. Verifique e tente novamente.');
        setIgStep('BIO_CHECK');
      }
    } catch {
      setBioAttempts(prev => prev + 1);
      setIgError('Erro ao verificar bio. Tente novamente.');
      setIgStep('BIO_CHECK');
    }
  };

  const handlePularVerificacao = () => {
    setIgVerified(false);
    setIgStep('SKIPPED');
    setIgError('');
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(verificationCode).catch(() => {});
    onSuccess?.('Código copiado!');
  };

  const handleSolicitar = async () => {
    if (!instagramHandle.trim()) return;
    setSubmitting(true);
    try {
      // Salvar dados de perfil (gênero, telefone, interesses) que foram preenchidos aqui
      const profileUpdates: Record<string, unknown> = {};
      if (genero) profileUpdates.genero = genero;
      if (telDdd && telNumero) {
        profileUpdates.telefone_ddd = telDdd;
        profileUpdates.telefone_numero = telNumero;
      }
      if (interessesSel.length > 0) profileUpdates.interesses = interessesSel;
      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('profiles').update(profileUpdates).eq('id', profile.id);
      }

      const handle = instagramHandle.replace('@', '').trim();
      await clubeService.solicitarEntrada(profile.id, handle, igFollowers ?? undefined, {
        verificado: igVerified,
        verificadoEm: igVerified ? tsBR() : undefined,
        codigo: verificationCode,
        comoConheceu: comoConheceu || undefined,
        profissao: profissao.trim() || undefined,
        indicadoPor: indicadoPor.trim() || undefined,
        cidade: cidade.trim() || undefined,
        conviteCodigo: conviteId || undefined,
        frequencia: frequencia || undefined,
      });
      setSolicitacaoStatus('PENDENTE');
      onSuccess?.('Solicitação enviada! Aguarde aprovação.');
    } catch (err) {
      console.error('[ClubeOptIn] Erro ao solicitar entrada:', err);
      onSuccess?.('Erro ao enviar solicitação. Tente novamente.');
    }
    setSubmitting(false);
  };

  /** @removed V3: convites agora são links de indicação membro→membro */

  const handleEnviarPost = async (reservaId: string) => {
    if (!postUrl.trim()) return;
    try {
      await clubeService.enviarPostUrl(reservaId, postUrl.trim());
      clubeService.getResgatesUsuarioAsync(profile.id).then(setMinhasReservas);
      setPostUrl('');
      onSuccess?.('Comprovação enviada!');
    } catch {
      onSuccess?.('Erro ao enviar comprovação');
    }
  };

  // ── Cancelar reserva (sem infração se faltam >12h pro evento) ──
  const podeCancelar = (r: ResgateMV) => {
    if (r.status !== 'RESGATADO') return false;
    const ev = allEvents.find(e => e.id === r.eventoId);
    if (!ev) return true; // sem evento = pode cancelar por segurança
    const inicio = ev.dataReal?.split('T')[0] ?? ev.data?.split('T')[0] ?? '';
    if (!inicio) return true;
    const evTs = new Date(inicio + 'T' + (ev.horario ?? '23:59') + ':00-03:00').getTime();
    return evTs - Date.now() > 12 * 3600000; // mais de 12h antes
  };

  const handleCancelarReserva = async () => {
    if (!cancelTarget) return;
    try {
      await clubeService.cancelarResgate(cancelTarget);
      clubeService.getResgatesUsuarioAsync(profile.id).then(setMinhasReservas);
      onSuccess?.('Reserva cancelada com sucesso');
    } catch {
      onSuccess?.('Erro ao cancelar reserva');
    }
    setCancelTarget(null);
  };

  // ── Separar reservas em Ativos/Passados ──
  const today = todayBR();
  const reservasAtivas = useMemo(
    () =>
      minhasReservas.filter(r => {
        if (r.status === 'USADO' || r.status === 'CANCELADO') return false;
        if (r.postVerificado) return false;
        const ev = allEvents.find(e => e.id === r.eventoId);
        if (ev) {
          const dataEvento = ev.dataReal?.split('T')[0] ?? ev.data?.split('T')[0] ?? '';
          if (dataEvento && dataEvento < today) return false;
        }
        return true;
      }),
    [minhasReservas, allEvents, today],
  );

  const reservasPassadas = useMemo(
    () => minhasReservas.filter(r => !reservasAtivas.includes(r)),
    [minhasReservas, reservasAtivas],
  );

  const getEventoNome = (eventoId: string) => allEvents.find(e => e.id === eventoId)?.titulo ?? 'Evento';

  // ── Membro ativo → tela de status com seções ──
  if (membro) {
    const listaExibida = activeTab === 'ATIVOS' ? reservasAtivas : reservasPassadas;
    const bloqueioLabel = bloqueioAte
      ? `Bloqueado até ${bloqueioAte.split('T')[0]?.split('-').reverse().join('/')}`
      : 'Bloqueado permanentemente';

    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex flex-col px-6" style={{ margin: 'auto 0', paddingTop: '1rem', paddingBottom: '1rem' }}>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
            >
              <ArrowLeft size="1.125rem" className="text-white" />
            </button>

            {/* Header — tier invisível ao membro */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#FFD30015', border: '2px solid #FFD30040' }}
              >
                <Crown size="1.75rem" className="text-[#FFD300]" />
              </div>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-1">
                Mais Vanta
              </h1>
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-[#FFD300]">Membro MAIS VANTA</p>
              <p className="text-zinc-400 text-xs mt-2 max-w-[16rem] mx-auto">
                Acesso a benefícios exclusivos em eventos e parceiros da sua cidade.
              </p>
            </div>

            {/* ══ SEÇÃO: Alertas & Avisos ══ */}
            {(estaBloqueado || temDivida) && (
              <div className="space-y-2 mb-5">
                {/* Banido permanente */}
                {isBanido && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <Ban size="0.875rem" className="text-red-400 shrink-0" />
                    <span className="text-red-400 text-[0.625rem] font-bold">
                      Sua conta foi suspensa permanentemente. Entre em contato com o suporte.
                    </span>
                  </div>
                )}

                {/* Bloqueio temporário */}
                {estaBloqueado && !isBanido && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <OctagonAlert size="0.875rem" className="text-red-400 shrink-0" />
                    <span className="text-red-400 text-[0.625rem] font-bold">
                      {bloqueioLabel}. Você não pode resgatar novos benefícios neste período.
                    </span>
                  </div>
                )}

                {/* Dívida Social */}
                {temDivida && !estaBloqueado && (
                  <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <AlertTriangle size="0.875rem" className="text-amber-400 shrink-0" />
                    <span className="text-amber-400 text-[0.625rem] font-bold">
                      Você tem posts pendentes. Envie a comprovação para desbloquear novas reservas.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ══ SEÇÃO: Resumo do Membro ══ */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-5">
              <div className="space-y-2.5">
                {membro.instagramHandle && (
                  <div className="flex items-center gap-2">
                    <Instagram size="0.75rem" className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-300 text-xs">@{membro.instagramHandle}</span>
                    {membro.instagramSeguidores && (
                      <span className="text-zinc-500 text-[0.5625rem]">
                        · {membro.instagramSeguidores.toLocaleString('pt-BR')} seguidores
                      </span>
                    )}
                  </div>
                )}
                {membro.cidadePrincipal && (
                  <div className="flex items-center gap-2">
                    <MapPin size="0.75rem" className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-300 text-xs">{membro.cidadePrincipal}</span>
                  </div>
                )}
                {/* Métricas rápidas */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">{minhasReservas.length}</p>
                    <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-wider">Resgates</p>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">
                      {minhasReservas.filter(r => r.postVerificado).length}
                    </p>
                    <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-wider">Posts</p>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="text-center">
                    <p className={`text-sm font-bold ${infracoesCount > 0 ? 'text-red-400' : 'text-white'}`}>
                      {infracoesCount}
                    </p>
                    <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-wider">Infrações</p>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">{membro?.convitesDisponiveis ?? 0}</p>
                    <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-wider">Convites</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ══ SEÇÃO: Benefícios — Ativos / Passados ══ */}
            <div className="mb-5">
              <div className="flex gap-0 bg-zinc-900/40 rounded-xl p-1 mb-4">
                <button
                  onClick={() => setActiveTab('ATIVOS')}
                  className={`flex-1 py-2.5 rounded-lg text-[0.625rem] font-black uppercase tracking-widest transition-all ${activeTab === 'ATIVOS' ? 'bg-[#FFD300] text-black' : 'text-zinc-400'}`}
                >
                  Ativos{reservasAtivas.length > 0 ? ` (${reservasAtivas.length})` : ''}
                </button>
                <button
                  onClick={() => setActiveTab('PASSADOS')}
                  className={`flex-1 py-2.5 rounded-lg text-[0.625rem] font-black uppercase tracking-widest transition-all ${activeTab === 'PASSADOS' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
                >
                  Passados{reservasPassadas.length > 0 ? ` (${reservasPassadas.length})` : ''}
                </button>
              </div>

              {listaExibida.length === 0 ? (
                <p className="text-zinc-400 text-xs text-center py-8">
                  {activeTab === 'ATIVOS'
                    ? 'Confira os próximos eventos — seus benefícios aparecem automaticamente.'
                    : 'Nenhum benefício passado'}
                </p>
              ) : (
                <div className="space-y-3">
                  {listaExibida.map(r => {
                    const isPendingPost =
                      r.status === 'PENDENTE_POST' || (r.status === 'RESGATADO' && !r.postVerificado);
                    return (
                      <div key={r.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-bold truncate flex-1">
                            {getEventoNome(r.eventoId)}
                          </span>
                          <span
                            className={`text-[0.5rem] font-black uppercase px-2 py-0.5 rounded shrink-0 ml-2 ${
                              r.status === 'USADO'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : r.status === 'CANCELADO'
                                  ? 'bg-red-500/15 text-red-400'
                                  : r.status === 'NO_SHOW'
                                    ? 'bg-red-500/15 text-red-400'
                                    : r.postVerificado
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {r.status === 'USADO'
                              ? 'Utilizado'
                              : r.status === 'CANCELADO'
                                ? 'Cancelado'
                                : r.status === 'NO_SHOW'
                                  ? 'Não compareceu'
                                  : r.postVerificado
                                    ? 'Post verificado'
                                    : r.postUrl
                                      ? 'Aguardando verificação'
                                      : 'Post pendente'}
                          </span>
                        </div>

                        {activeTab === 'ATIVOS' && r.status === 'RESGATADO' && podeCancelar(r) && (
                          <button
                            onClick={() => setCancelTarget(r.id)}
                            className="mt-2 w-full py-2 bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-transform"
                          >
                            Cancelar reserva
                          </button>
                        )}

                        {activeTab === 'ATIVOS' && r.status === 'RESGATADO' && !podeCancelar(r) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <Clock size="0.625rem" className="text-amber-400" />
                            <span className="text-amber-400 text-[0.5625rem]">
                              Faltam menos de 12h — cancelamento indisponível
                            </span>
                          </div>
                        )}

                        {activeTab === 'ATIVOS' && isPendingPost && !r.postUrl && (
                          <div className="mt-3 space-y-2">
                            <p className="text-zinc-400 text-[0.625rem]">Envie o link do seu post/story:</p>
                            <div className="flex gap-2">
                              <input
                                value={postUrl}
                                onChange={e => setPostUrl(e.target.value)}
                                placeholder="https://instagram.com/p/..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white px-3 py-2"
                              />
                              <button
                                onClick={() => handleEnviarPost(r.id)}
                                className="px-3 py-2 bg-[#FFD300] text-black rounded-lg active:scale-90 transition-transform"
                              >
                                <Send size="0.75rem" />
                              </button>
                            </div>
                          </div>
                        )}

                        {r.postUrl && !r.postVerificado && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock size="0.625rem" className="text-amber-400" />
                            <span className="text-amber-400 text-[0.5625rem]">
                              Comprovação enviada — aguardando verificação
                            </span>
                          </div>
                        )}

                        {r.postVerificado && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Check size="0.625rem" className="text-emerald-400" />
                            <span className="text-emerald-400 text-[0.5625rem]">Post verificado pela equipe</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ══ SEÇÃO: Infrações ══ */}
            {infracoes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size="0.875rem" className="text-red-400" />
                  <span className="text-white text-xs font-bold">Infrações</span>
                  <span className="text-zinc-500 text-[0.5625rem]">({infracoes.length})</span>
                </div>
                <div className="space-y-2">
                  {infracoes.slice(0, 5).map(inf => (
                    <div
                      key={inf.id}
                      className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AlertTriangle size="0.625rem" className="text-red-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-[0.6875rem] font-semibold truncate">{inf.eventoNome}</p>
                          <p className="text-red-400/70 text-[0.5625rem]">
                            {inf.tipo === 'NO_SHOW' ? 'Não compareceu' : 'Não postou'}
                          </p>
                        </div>
                      </div>
                      <span className="text-zinc-500 text-[0.5625rem] shrink-0">
                        {inf.criadoEm?.split('T')[0]?.split('-').reverse().join('/')}
                      </span>
                    </div>
                  ))}
                  {infracoes.length > 5 && (
                    <p className="text-zinc-500 text-[0.5625rem] text-center">
                      + {infracoes.length - 5} infração{infracoes.length - 5 !== 1 ? 'ões' : ''} anterior
                      {infracoes.length - 5 !== 1 ? 'es' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ══ SEÇÃO: Passaporte Regional ══ */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe size="0.875rem" className="text-purple-400" />
                <span className="text-white text-xs font-bold">Passaporte Regional</span>
              </div>
              {(() => {
                const cidades = clubeService.getCidadesDisponiveis();

                return (
                  <div className="space-y-2">
                    {cidades.map(c => {
                      const status = clubeService.getPassportStatus(profile.id, c);

                      return (
                        <div
                          key={c}
                          className="flex items-center justify-between bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <MapPin size="0.75rem" className="text-zinc-400 shrink-0" />
                            <p className="text-white text-xs font-semibold truncate">{c}</p>
                          </div>
                          {status === 'APROVADO' ? (
                            <span className="text-[0.5rem] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 shrink-0">
                              Ativo
                            </span>
                          ) : status === 'PENDENTE' ? (
                            <span className="text-[0.5rem] font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 shrink-0">
                              Pendente
                            </span>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await clubeService.solicitarPassport(profile.id, c);
                                  onSuccess?.('Passaporte solicitado!');
                                } catch {
                                  onSuccess?.('Erro ao solicitar');
                                }
                              }}
                              className="text-[0.5rem] font-black uppercase px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20 active:scale-90 transition-all shrink-0"
                            >
                              Solicitar
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {cidades.length === 0 && (
                      <p className="text-zinc-400 text-[0.625rem] text-center py-4">Nenhuma cidade disponível</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ══ SEÇÃO: Convites de Indicação ══ */}
            <div className="mt-5 bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size="0.875rem" className="text-[#FFD300]" />
                <span className="text-white text-xs font-bold">Convidar amigos</span>
              </div>
              <p className="text-zinc-400 text-[0.625rem] mb-3">
                Compartilhe seu link exclusivo. Seu amigo preenche a solicitação e passa pela curadoria normalmente.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-300 text-[0.625rem]">
                  {membro?.convitesDisponiveis ?? 0} convite{(membro?.convitesDisponiveis ?? 0) !== 1 ? 's' : ''}{' '}
                  disponíve{(membro?.convitesDisponiveis ?? 0) !== 1 ? 'is' : 'l'}
                </span>
                <span className="text-zinc-600 text-[0.5625rem]">·</span>
                <span className="text-zinc-500 text-[0.5625rem]">
                  {membro?.convitesUsados ?? 0} usado{(membro?.convitesUsados ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>
              {(membro?.convitesDisponiveis ?? 0) > 0 ? (
                <button
                  onClick={async () => {
                    try {
                      const convite = await clubeService.gerarConviteIndicacao(profile.id);
                      const link = clubeService.getLinkConviteIndicacao(convite.codigo);
                      if (navigator.share) {
                        await navigator.share({
                          title: 'Convite MAIS VANTA',
                          text: 'Você foi convidado para o MAIS VANTA!',
                          url: link,
                        });
                      } else {
                        await navigator.clipboard.writeText(link);
                        onSuccess?.('Link copiado!');
                      }
                    } catch {
                      onSuccess?.('Erro ao gerar convite');
                    }
                  }}
                  className="w-full py-3 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size="0.75rem" /> Gerar e compartilhar convite
                </button>
              ) : (
                <p className="text-zinc-500 text-[0.5625rem] text-center py-2">
                  Sem convites disponíveis. Compareça a eventos para ganhar mais!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal confirmar cancelamento */}
        {cancelTarget && (
          <div className="absolute inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm">
              <h3 className="text-white font-bold text-base mb-2">Cancelar reserva?</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Sua vaga será liberada para outro membro. Você poderá reservar novamente se ainda houver
                disponibilidade.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 py-3 bg-zinc-800 border border-white/10 rounded-2xl text-zinc-300 text-sm font-bold active:scale-95 transition-transform"
                >
                  Manter
                </button>
                <button
                  onClick={handleCancelarReserva}
                  className="flex-1 py-3 bg-red-600 rounded-2xl text-white text-sm font-bold active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Solicitação pendente ──
  if (solicitacaoStatus === 'PENDENTE') {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-6">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
          >
            <ArrowLeft size="1.125rem" className="text-white" />
          </button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock size="1.75rem" className="text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Solicitação Enviada</h2>
            <p className="text-zinc-400 text-sm max-w-xs">
              Sua solicitação está sendo analisada pelo curador. Você será notificado quando houver uma decisão.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário de entrada com landing de vantagens ──
  // Fase 1: Vantagens
  if (optInFase === 1) {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-6">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
          >
            <ArrowLeft size="1.125rem" className="text-white" />
          </button>

          {/* Hero */}
          <div className="text-center py-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles size="1.75rem" className="text-[#FFD300]" />
            </div>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-2">
              {maisVantaConfigService.getConfig().nomePrograma}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
              {maisVantaConfigService.getConfig().descricaoPrograma}
            </p>
          </div>

          {/* Vantagens */}
          <div className="space-y-3 mb-6">
            {maisVantaConfigService.getConfig().vantagensMembro.map((v, i) => {
              const Icon = Crown;
              return (
                <div key={i} className="flex items-start gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/15 flex items-center justify-center shrink-0">
                    <Icon size="1.125rem" className="text-[#FFD300]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm">{v.titulo}</p>
                    <p className="text-zinc-400 text-[0.6875rem] leading-relaxed mt-0.5 line-clamp-2">{v.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={() => setOptInFase(2)}
            className="w-full py-3.5 rounded-xl bg-[#FFD300] text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            Quero Participar
            <ChevronRight size="1rem" />
          </button>
        </div>
      </div>
    );
  }

  // Fase 2: Formulário + Termos LGPD
  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-6">
        <button
          onClick={isConvite ? onBack : () => setOptInFase(1)}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
        >
          <ArrowLeft size="1.125rem" className="text-white" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#FFD300]/10 mx-auto mb-3 flex items-center justify-center border-2 border-[#FFD300]/20">
            <Crown size="1.5rem" className="text-[#FFD300]" />
          </div>
          {isConvite ? (
            <>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-1">
                Você foi convidado!
              </h1>
              <p className="text-zinc-400 text-[0.6875rem] max-w-xs mx-auto">
                {conviteNomeMaster ? `${conviteNomeMaster} convidou você` : 'Você recebeu um convite'} para o MAIS
                VANTA. Preencha seus dados para aceitar.
              </p>
            </>
          ) : (
            <>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-1">
                Solicitar Entrada
              </h1>
              <p className="text-zinc-400 text-[0.6875rem] max-w-xs mx-auto">
                Preencha seus dados. A aprovação está sujeita à análise interna.
              </p>
            </>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {/* Etapa A — @ do Instagram */}
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Instagram
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Instagram size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={instagramHandle}
                  onChange={e => {
                    setInstagramHandle(e.target.value);
                    if (igStep !== 'INPUT') {
                      setIgStep('INPUT');
                      setIgFollowers(null);
                      setIgVerified(false);
                      setBioAttempts(0);
                      setIgError('');
                    }
                  }}
                  placeholder="seu_usuario"
                  disabled={igStep === 'VERIFIED' || igStep === 'SKIPPED'}
                  className="w-full pl-9 pr-3 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm disabled:opacity-40"
                />
              </div>
              {(igStep === 'INPUT' || igStep === 'CHECKING') && (
                <button
                  onClick={handleVerificarPerfil}
                  disabled={!instagramHandle.trim() || igStep === 'CHECKING'}
                  className="shrink-0 px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-30 flex items-center gap-1.5"
                >
                  {igStep === 'CHECKING' ? (
                    <Loader2 size="0.75rem" className="animate-spin" />
                  ) : (
                    <Check size="0.75rem" />
                  )}
                  Verificar
                </button>
              )}
            </div>
            {igError && <p className="text-red-400 text-[0.625rem] mt-1.5">{igError}</p>}
          </div>

          {/* Badge: perfil encontrado + seguidores */}
          {igFollowers !== null && igStep !== 'INPUT' && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
              <BadgeCheck size="0.875rem" className="text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-xs font-semibold">Perfil encontrado</span>
              <span className="text-emerald-400/60 text-[0.625rem]">·</span>
              <span className="text-emerald-400 text-xs font-bold">{igFormatted} seguidores</span>
            </div>
          )}

          {/* Etapa B — Código na bio */}
          {(igStep === 'BIO_CHECK' || igStep === 'CHECKING') && igFollowers !== null && (
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield size="0.75rem" className="text-[#FFD300] shrink-0" />
                <p className="text-[0.5625rem] text-zinc-400 font-black uppercase tracking-widest">
                  Verificar propriedade
                </p>
              </div>
              <p className="text-zinc-400 text-[0.6875rem] leading-relaxed">
                Cole o código abaixo na <span className="text-white font-semibold">bio do seu Instagram</span> e clique
                em verificar.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black/40 border border-[#FFD300]/20 rounded-lg px-4 py-3 font-mono text-[#FFD300] text-sm font-bold tracking-widest text-center">
                  {verificationCode}
                </div>
                <button
                  aria-label="Copiar"
                  onClick={handleCopiarCodigo}
                  className="shrink-0 w-10 h-10 bg-zinc-800 rounded-lg border border-white/10 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Copy size="0.875rem" className="text-zinc-400" />
                </button>
              </div>
              <button
                onClick={handleVerificarBio}
                disabled={igStep === 'CHECKING'}
                className="w-full py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-[0.625rem] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
              >
                {igStep === 'CHECKING' ? <Loader2 size="0.75rem" className="animate-spin" /> : <Check size="0.75rem" />}
                Já colei, verificar
              </button>
              {bioAttempts >= 2 && (
                <button
                  onClick={handlePularVerificacao}
                  className="w-full py-2 text-zinc-400 text-[0.625rem] underline active:opacity-60 transition-opacity"
                >
                  Não consigo verificar — continuar sem verificação
                </button>
              )}
            </div>
          )}

          {/* Badge: Instagram verificado */}
          {igStep === 'VERIFIED' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <BadgeCheck size="0.875rem" className="text-emerald-400 shrink-0" />
                <span className="text-emerald-300 text-xs font-semibold">Instagram verificado</span>
              </div>
              <p className="text-emerald-400/60 text-[0.625rem] pl-[1.375rem]">Pode remover o código da bio agora.</p>
            </div>
          )}

          {/* Badge: não verificado (pulou) */}
          {igStep === 'SKIPPED' && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert size="0.875rem" className="text-amber-400 shrink-0" />
                <span className="text-amber-300 text-[0.6875rem]">
                  Verificação não concluída. Sua solicitação será analisada manualmente pelo admin.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profissão / O que faz */}
        <div className="mb-4">
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            O que voce faz?
          </label>
          <input
            value={profissao}
            onChange={e => setProfissao(e.target.value)}
            placeholder="Ex: Modelo, DJ, Fotógrafo..."
            className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
          />
        </div>

        {/* Como conheceu o VANTA */}
        <div className="mb-4">
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Como conheceu o VANTA?
          </label>
          <div className="relative">
            <button
              onClick={() => setComoConheceuAberto(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm transition-colors"
            >
              <span className={comoConheceu ? 'text-white' : 'text-zinc-500'}>
                {comoConheceu || 'Selecione uma opção'}
              </span>
              <ChevronRight
                size="0.75rem"
                className={`text-zinc-400 transition-transform ${comoConheceuAberto ? 'rotate-90' : ''}`}
              />
            </button>
            {comoConheceuAberto && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                {['Redes sociais', 'Amigo', 'Evento', 'Outro'].map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => {
                      setComoConheceu(opcao);
                      setComoConheceuAberto(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm active:bg-white/10 transition-colors ${
                      comoConheceu === opcao ? 'text-[#FFD300] bg-[#FFD300]/5' : 'text-zinc-300'
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cidade */}
        <div className="mb-4">
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Sua cidade *
          </label>
          <input
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            placeholder="Ex: Rio de Janeiro, São Paulo..."
            className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
          />
        </div>

        {/* Gênero */}
        {!profile.genero && (
          <div className="mb-4">
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Gênero *
            </label>
            <div className="flex gap-2">
              {['MASCULINO', 'FEMININO', 'PREFIRO_NAO_DIZER'].map(g => (
                <button
                  key={g}
                  onClick={() => setGenero(g)}
                  className={`flex-1 py-2.5 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider transition-all ${
                    genero === g
                      ? 'bg-[#FFD300]/15 border border-[#FFD300]/40 text-white'
                      : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400'
                  }`}
                >
                  {g === 'MASCULINO' ? 'Masculino' : g === 'FEMININO' ? 'Feminino' : 'Outro'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Telefone (se não tem) */}
        {!profile.telefone?.ddd && (
          <div className="mb-4">
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Telefone *
            </label>
            <div className="flex gap-2">
              <input
                value={telDdd}
                onChange={e => setTelDdd(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="DDD"
                className="w-20 px-3 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm text-center placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
                inputMode="numeric"
              />
              <input
                value={fmtTelefone(telNumero)}
                onChange={e => setTelNumero(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="99999-9999"
                className="flex-1 min-w-0 px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
                inputMode="numeric"
              />
            </div>
          </div>
        )}

        {/* Frequência que sai */}
        <div className="mb-4">
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Com que frequência você sai?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'raramente', label: '1-2x por mês' },
              { key: 'frequentemente', label: '3-4x por mês' },
              { key: 'toda_semana', label: 'Toda semana' },
              { key: 'quase_toda_noite', label: 'Quase toda noite' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFrequencia(frequencia === opt.key ? '' : opt.key)}
                className={`py-2.5 rounded-xl text-[0.625rem] font-bold uppercase tracking-wider transition-all ${
                  frequencia === opt.key
                    ? 'bg-[#FFD300]/15 border border-[#FFD300]/40 text-white'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interesses (se não tem no perfil) */}
        {(profile.interesses ?? []).length === 0 && (
          <div className="mb-4">
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              O que você curte?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Eletrônica',
                'Funk',
                'Sertanejo',
                'Pagode',
                'Rock',
                'Hip Hop',
                'Pop',
                'Reggae',
                'MPB',
                'Forró',
                'Jazz',
                'Open Bar',
                'Rooftop',
                'Pool Party',
                'Festival',
                'After Party',
              ].map(item => (
                <button
                  key={item}
                  onClick={() => setInteressesSel(s => (s.includes(item) ? s.filter(x => x !== item) : [...s, item]))}
                  className={`px-3 py-1.5 rounded-full text-[0.5625rem] font-bold transition-all ${
                    interessesSel.includes(item)
                      ? 'bg-[#FFD300]/15 border border-[#FFD300]/40 text-white'
                      : 'bg-zinc-900/60 border border-white/5 text-zinc-400'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quem te indicou */}
        <div className="mb-4">
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Quem te indicou? (opcional)
          </label>
          <input
            value={indicadoPor}
            onChange={e => setIndicadoPor(e.target.value)}
            placeholder="Nome ou @ de quem te indicou"
            className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
          />
        </div>

        {/* Aviso importante */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size="0.875rem" className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300/80 text-[0.625rem] leading-relaxed">
              A solicitação não garante aprovação. Todas as candidaturas passam por análise interna da equipe de
              curadoria.
            </p>
          </div>
        </div>

        {/* Termos de uso */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl mb-4">
          <button
            onClick={() => setMostrarTermosModal(true)}
            className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-2">
              <Shield size="0.75rem" className="text-zinc-400" />
              <span className="text-zinc-300 text-xs font-semibold">Termos de Uso e Privacidade (LGPD)</span>
            </div>
            <ChevronRight size="0.75rem" className="text-zinc-400" />
          </button>
        </div>

        {/* Checkbox aceite */}
        <button
          onClick={() => setAceitouTermos(v => !v)}
          className="w-full flex items-start gap-3 mb-6 text-left active:opacity-80 transition-opacity"
        >
          {aceitouTermos ? (
            <CheckSquare size="1.125rem" className="text-[#FFD300] shrink-0 mt-0.5" />
          ) : (
            <Square size="1.125rem" className="text-zinc-400 shrink-0 mt-0.5" />
          )}
          <span className="text-zinc-400 text-[0.625rem] leading-relaxed">
            Li e concordo com os <span className="text-white font-semibold">Termos de Uso</span>, a{' '}
            <span className="text-white font-semibold">Política de Privacidade (LGPD)</span> e as regras de
            contrapartida do programa MAIS VANTA.
          </span>
        </button>

        <button
          onClick={handleSolicitar}
          disabled={
            !instagramHandle.trim() ||
            !cidade.trim() ||
            !aceitouTermos ||
            submitting ||
            (igStep !== 'VERIFIED' && igStep !== 'SKIPPED')
          }
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30"
        >
          {submitting ? 'Processando...' : isConvite ? 'Aceitar Convite' : 'Solicitar Entrada'}
        </button>

        <p className="text-zinc-700 text-[0.5rem] text-center mt-3 leading-relaxed">
          Seus dados são protegidos pela Lei nº 13.709/2018 (LGPD). Você pode solicitar exclusão a qualquer momento via{' '}
          {maisVantaConfigService.getConfig().emailContato}.
        </p>
      </div>

      {/* Modal Termos MAIS VANTA */}
      {mostrarTermosModal && (
        <div
          className="absolute inset-0 z-[80] flex items-end"
          role="presentation"
          onClick={() => setMostrarTermosModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-h-[85%] bg-[#111111] border-t border-white/10 rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Shield size="0.875rem" className="text-[#FFD300]" />
                <span className="text-white text-sm font-bold">Termos de Uso — MAIS VANTA</span>
              </div>
              <button onClick={() => setMostrarTermosModal(false)} className="p-1.5 text-zinc-400 active:text-white">
                <ArrowLeft size="1rem" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
              <pre className="text-zinc-400 text-[0.5625rem] leading-relaxed whitespace-pre-wrap font-sans">
                {maisVantaConfigService.getConfig().termosCustomizados || TERMOS_PADRAO}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
