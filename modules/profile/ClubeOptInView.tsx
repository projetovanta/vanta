import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { Membro, ReservaMaisVanta, Evento } from '../../types';
import { clubeService } from '../../features/admin/services/clubeService';
import { maisVantaConfigService } from '../../features/admin/services/maisVantaConfigService';
import { tsBR, todayBR } from '../../utils';
import { DealsMembroSection } from './DealsMembroSection';

// ── Termos de uso LGPD (fallback se config.termosCustomizados for null) ────────
const TERMOS_PADRAO = `TERMOS DE USO — CLUBE MAIS VANTA

1. NATUREZA DO PROGRAMA
O Clube MAIS VANTA é um programa de permutas entre criadores de conteúdo e estabelecimentos parceiros. A participação é um benefício, NÃO um direito. A aprovação da solicitação está sujeita à análise interna e discricionária da equipe de curadoria, sem garantia de aceitação.

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
• Compartilhamento: seus dados poderão ser compartilhados com os estabelecimentos parceiros onde você realizar reservas, limitado ao necessário para execução do benefício.
• Direitos do titular: você pode, a qualquer momento, acessar, corrigir, anonimizar, bloquear, excluir ou solicitar a portabilidade dos seus dados pessoais.
• Revogação: o consentimento pode ser revogado a qualquer momento, o que poderá resultar no desligamento do programa.
• Armazenamento: seus dados são armazenados de forma segura em servidores protegidos, pelo tempo necessário ao cumprimento das finalidades descritas.

4. LIMITAÇÃO DE RESPONSABILIDADE
A plataforma não garante um número mínimo de eventos, reservas ou benefícios. A disponibilidade depende dos estabelecimentos parceiros.

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
  const [solicitacaoStatus, setSolicitacaoStatus] = useState<'NONE' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('NONE');
  const [minhasReservas, setMinhasReservas] = useState<ReservaMaisVanta[]>([]);
  const [postUrl, setPostUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'ATIVOS' | 'PASSADOS'>('ATIVOS');
  const [optInFase, setOptInFase] = useState<1 | 2>(conviteId ? 2 : 1);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);

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

  useEffect(() => {
    if (isConvite) {
      // Modo convite: verificar se convite é válido
      const sol = clubeService.getSolicitacoes().find(s => s.id === conviteId);
      if (sol?.status === 'CONVIDADO') {
        setSolicitacaoStatus('NONE'); // permite preencher
        // Buscar nome do master que convidou
        if (sol.convidadoPor) {
          import('../../services/supabaseClient').then(({ supabase: sb }) => {
            sb.from('profiles')
              .select('nome')
              .eq('id', sol.convidadoPor!)
              .single()
              .then(({ data }) => {
                if (data?.nome) setConviteNomeMaster(data.nome as string);
              });
          });
        }
      } else if (sol?.status === 'APROVADO') {
        setSolicitacaoStatus('APROVADO');
      } else {
        setSolicitacaoStatus('NONE');
      }
      setMinhasReservas(clubeService.getReservasUsuario(profile.id));
      return;
    }

    // Checar se já tem solicitação pendente
    const sols = clubeService.getSolicitacoesPendentes();
    const minha = sols.find(s => s.userId === profile.id);
    if (minha) setSolicitacaoStatus('PENDENTE');
    else if (membro) setSolicitacaoStatus('APROVADO');

    // Carregar minhas reservas
    setMinhasReservas(clubeService.getReservasUsuario(profile.id));
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
      const handle = instagramHandle.replace('@', '').trim();
      await clubeService.solicitarEntrada(profile.id, handle, igFollowers ?? undefined, {
        verificado: igVerified,
        verificadoEm: igVerified ? tsBR() : undefined,
        codigo: verificationCode,
      });
      setSolicitacaoStatus('PENDENTE');
      onSuccess?.('Solicitação enviada! Aguarde aprovação.');
    } catch (err) {
      console.error('[ClubeOptIn] Erro ao solicitar entrada:', err);
      onSuccess?.('Erro ao enviar solicitação. Tente novamente.');
    }
    setSubmitting(false);
  };

  const handleAceitarConvite = async () => {
    if (!conviteId || !instagramHandle.trim()) return;
    setSubmitting(true);
    try {
      const handle = instagramHandle.replace('@', '').trim();
      await clubeService.aceitarConviteMaisVanta(conviteId, handle, {
        verificado: igVerified,
        verificadoEm: igVerified ? tsBR() : undefined,
        codigo: verificationCode,
      });
      setSolicitacaoStatus('APROVADO');
      onSuccess?.('Parabéns! Você agora faz parte do MAIS VANTA!');
    } catch (err) {
      console.error('[ClubeOptIn] Erro ao aceitar convite:', err);
      onSuccess?.('Erro ao aceitar convite. Tente novamente.');
    }
    setSubmitting(false);
  };

  const handleEnviarPost = async (reservaId: string) => {
    if (!postUrl.trim()) return;
    try {
      await clubeService.confirmarPost(reservaId, postUrl.trim());
      setMinhasReservas(clubeService.getReservasUsuario(profile.id));
      setPostUrl('');
      onSuccess?.('Comprovação enviada!');
    } catch {
      onSuccess?.('Erro ao enviar comprovação');
    }
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

  // ── Membro ativo → tela de status com abas ──
  if (membro) {
    const listaExibida = activeTab === 'ATIVOS' ? reservasAtivas : reservasPassadas;

    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-32">
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>

          {/* Header — tier invisível ao membro */}
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#FFD30015', border: '2px solid #FFD30040' }}
            >
              <Crown size={28} className="text-[#FFD300]" />
            </div>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-1">
              Mais Vanta
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD300]">Membro MAIS VANTA</p>
          </div>

          {/* Dívida Social */}
          {temDivida && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-[10px] font-bold">
                Você tem posts pendentes. Envie a comprovação para desbloquear novas reservas.
              </span>
            </div>
          )}

          {/* Info */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-6 space-y-2">
            {membro.instagramHandle && (
              <div className="flex items-center gap-2">
                <Instagram size={12} className="text-zinc-400" />
                <span className="text-zinc-400 text-xs">@{membro.instagramHandle}</span>
                {membro.instagramSeguidores && (
                  <span className="text-zinc-400 text-[9px]">
                    · {membro.instagramSeguidores.toLocaleString('pt-BR')} seguidores
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Abas — Benefícios Ativos / Passados */}
          <div className="flex gap-0 bg-zinc-900/40 rounded-xl p-1 mb-5">
            <button
              onClick={() => setActiveTab('ATIVOS')}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ATIVOS' ? 'bg-[#FFD300] text-black' : 'text-zinc-400'}`}
            >
              Ativos{reservasAtivas.length > 0 ? ` (${reservasAtivas.length})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('PASSADOS')}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PASSADOS' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
            >
              Passados{reservasPassadas.length > 0 ? ` (${reservasPassadas.length})` : ''}
            </button>
          </div>

          {/* Lista de reservas da aba selecionada */}
          {listaExibida.length === 0 ? (
            <p className="text-zinc-400 text-xs text-center py-10">
              {activeTab === 'ATIVOS' ? 'Nenhum benefício ativo' : 'Nenhum benefício passado'}
            </p>
          ) : (
            <div className="space-y-3">
              {listaExibida.map(r => {
                const isPendingPost = r.status === 'PENDENTE_POST' || (r.status === 'RESERVADO' && !r.postVerificado);
                return (
                  <div key={r.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-bold truncate flex-1">{getEventoNome(r.eventoId)}</span>
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ml-2 ${
                          r.status === 'USADO'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : r.status === 'CANCELADO'
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
                            : r.postVerificado
                              ? 'Post verificado'
                              : r.postUrl
                                ? 'Aguardando verificação'
                                : 'Post pendente'}
                      </span>
                    </div>

                    {/* Enviar comprovação se pendente — somente na aba Ativos */}
                    {activeTab === 'ATIVOS' && isPendingPost && !r.postUrl && (
                      <div className="mt-3 space-y-2">
                        <p className="text-zinc-400 text-[10px]">Envie o link do seu post/story:</p>
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
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {r.postUrl && !r.postVerificado && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={10} className="text-amber-400" />
                        <span className="text-amber-400 text-[9px]">Comprovação enviada — aguardando verificação</span>
                      </div>
                    )}

                    {r.postVerificado && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Check size={10} className="text-emerald-400" />
                        <span className="text-emerald-400 text-[9px]">Post verificado pela equipe</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* MV4: Passaporte Regional — Cidades */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-purple-400" />
              <span className="text-white text-xs font-bold">Passaporte Regional</span>
            </div>
            {(() => {
              const cidades = clubeService.getCidadesDisponiveis();

              return (
                <div className="space-y-2">
                  {cidades.map(cidade => {
                    const status = clubeService.getPassportStatus(profile.id, cidade);

                    return (
                      <div
                        key={cidade}
                        className="flex items-center justify-between bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin size={12} className="text-zinc-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{cidade}</p>
                          </div>
                        </div>
                        {status === 'APROVADO' ? (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 shrink-0">
                            Ativo
                          </span>
                        ) : status === 'PENDENTE' ? (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 shrink-0">
                            Pendente
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await clubeService.solicitarPassport(profile.id, cidade);
                                onSuccess?.('Passaporte solicitado!');
                              } catch {
                                onSuccess?.('Erro ao solicitar');
                              }
                            }}
                            className="text-[8px] font-black uppercase px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20 active:scale-90 transition-all shrink-0"
                          >
                            Solicitar
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {cidades.length === 0 && (
                    <p className="text-zinc-400 text-[10px] text-center py-4">Nenhuma cidade disponível</p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Deals disponíveis */}
          <DealsMembroSection userId={profile.id} onSuccess={onSuccess} />

          {/* Convidar Amigo */}
          <div className="mt-6 bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={14} className="text-[#FFD300]" />
              <span className="text-white text-xs font-bold">Convidar amigo para o Clube</span>
            </div>
            <p className="text-zinc-400 text-[10px] mb-3">
              Convites são pré-aprovados com o seu nome. O convidado ainda precisa ser aceito pelo curador.
            </p>
            <p className="text-zinc-400 text-[9px] italic">Em breve: busca de amigos por nome</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Solicitação pendente ──
  if (solicitacaoStatus === 'PENDENTE') {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-32">
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock size={28} className="text-amber-400" />
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
        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-32">
          <button aria-label="Voltar"
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>

          {/* Hero */}
          <div className="text-center py-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-[#FFD300]" />
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
                    <Icon size={18} className="text-[#FFD300]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm">{v.titulo}</p>
                    <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5 line-clamp-2">{v.descricao}</p>
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
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Fase 2: Formulário + Termos LGPD
  return (
    <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4 px-6 pb-32">
        <button
          onClick={isConvite ? onBack : () => setOptInFase(1)}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform mb-6"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#FFD300]/10 mx-auto mb-3 flex items-center justify-center border-2 border-[#FFD300]/20">
            <Crown size={24} className="text-[#FFD300]" />
          </div>
          {isConvite ? (
            <>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-1">
                Você foi convidado!
              </h1>
              <p className="text-zinc-400 text-[11px] max-w-xs mx-auto">
                {conviteNomeMaster ? `${conviteNomeMaster} convidou você` : 'Você recebeu um convite'} para o MAIS
                VANTA. Preencha seus dados para aceitar.
              </p>
            </>
          ) : (
            <>
              <h1 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-1">
                Solicitar Entrada
              </h1>
              <p className="text-zinc-400 text-[11px] max-w-xs mx-auto">
                Preencha seus dados. A aprovação está sujeita à análise interna.
              </p>
            </>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {/* Etapa A — @ do Instagram */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
              Instagram
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
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
                  className="shrink-0 px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-30 flex items-center gap-1.5"
                >
                  {igStep === 'CHECKING' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Verificar
                </button>
              )}
            </div>
            {igError && <p className="text-red-400 text-[10px] mt-1.5">{igError}</p>}
          </div>

          {/* Badge: perfil encontrado + seguidores */}
          {igFollowers !== null && igStep !== 'INPUT' && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
              <BadgeCheck size={14} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-xs font-semibold">Perfil encontrado</span>
              <span className="text-emerald-400/60 text-[10px]">·</span>
              <span className="text-emerald-400 text-xs font-bold">{igFormatted} seguidores</span>
            </div>
          )}

          {/* Etapa B — Código na bio */}
          {(igStep === 'BIO_CHECK' || igStep === 'CHECKING') && igFollowers !== null && (
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={12} className="text-[#FFD300] shrink-0" />
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Verificar propriedade</p>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Cole o código abaixo na <span className="text-white font-semibold">bio do seu Instagram</span> e clique
                em verificar.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black/40 border border-[#FFD300]/20 rounded-lg px-4 py-3 font-mono text-[#FFD300] text-sm font-bold tracking-widest text-center">
                  {verificationCode}
                </div>
                <button aria-label="Copiar"
                  onClick={handleCopiarCodigo}
                  className="shrink-0 w-10 h-10 bg-zinc-800 rounded-lg border border-white/10 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Copy size={14} className="text-zinc-400" />
                </button>
              </div>
              <button
                onClick={handleVerificarBio}
                disabled={igStep === 'CHECKING'}
                className="w-full py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
              >
                {igStep === 'CHECKING' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Já colei, verificar
              </button>
              {bioAttempts >= 2 && (
                <button
                  onClick={handlePularVerificacao}
                  className="w-full py-2 text-zinc-400 text-[10px] underline active:opacity-60 transition-opacity"
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
                <BadgeCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-300 text-xs font-semibold">Instagram verificado</span>
              </div>
              <p className="text-emerald-400/60 text-[10px] pl-[22px]">Pode remover o código da bio agora.</p>
            </div>
          )}

          {/* Badge: não verificado (pulou) */}
          {igStep === 'SKIPPED' && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                <span className="text-amber-300 text-[11px]">
                  Verificação não concluída. Sua solicitação será analisada manualmente pelo admin.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Aviso importante */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300/80 text-[10px] leading-relaxed">
              A solicitação não garante aprovação. Todas as candidaturas passam por análise interna da equipe de
              curadoria.
            </p>
          </div>
        </div>

        {/* Termos de uso */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl mb-4">
          <button
            onClick={() => setMostrarTermos(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-zinc-400" />
              <span className="text-zinc-300 text-xs font-semibold">Termos de Uso e Privacidade (LGPD)</span>
            </div>
            <ChevronRight
              size={12}
              className={`text-zinc-400 transition-transform ${mostrarTermos ? 'rotate-90' : ''}`}
            />
          </button>
          {mostrarTermos && (
            <div className="px-4 pb-4 max-h-60 overflow-y-auto no-scrollbar">
              <pre className="text-zinc-400 text-[9px] leading-relaxed whitespace-pre-wrap font-sans">
                {maisVantaConfigService.getConfig().termosCustomizados || TERMOS_PADRAO}
              </pre>
            </div>
          )}
        </div>

        {/* Checkbox aceite */}
        <button
          onClick={() => setAceitouTermos(v => !v)}
          className="w-full flex items-start gap-3 mb-6 text-left active:opacity-80 transition-opacity"
        >
          {aceitouTermos ? (
            <CheckSquare size={18} className="text-[#FFD300] shrink-0 mt-0.5" />
          ) : (
            <Square size={18} className="text-zinc-400 shrink-0 mt-0.5" />
          )}
          <span className="text-zinc-400 text-[10px] leading-relaxed">
            Li e concordo com os <span className="text-white font-semibold">Termos de Uso</span>, a{' '}
            <span className="text-white font-semibold">Política de Privacidade (LGPD)</span> e as regras de
            contrapartida do programa MAIS VANTA.
          </span>
        </button>

        <button
          onClick={isConvite ? handleAceitarConvite : handleSolicitar}
          disabled={
            !instagramHandle.trim() || !aceitouTermos || submitting || (igStep !== 'VERIFIED' && igStep !== 'SKIPPED')
          }
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30"
        >
          {submitting ? 'Processando...' : isConvite ? 'Aceitar Convite' : 'Solicitar Entrada'}
        </button>

        <p className="text-zinc-700 text-[8px] text-center mt-3 leading-relaxed">
          Seus dados são protegidos pela Lei nº 13.709/2018 (LGPD). Você pode solicitar exclusão a qualquer momento via{' '}
          {maisVantaConfigService.getConfig().emailContato}.
        </p>
      </div>
    </div>
  );
};
