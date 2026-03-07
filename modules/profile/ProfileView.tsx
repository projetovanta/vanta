import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Wallet,
  Eye,
  Building2,
  Sparkles,
  Clock,
  Crown,
  X,
  FileCheck,
  KeyRound,
  Lock,
  Trash2,
  AlertTriangle,
  Loader2,
  ScrollText,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { ProfileSubView, Membro, Evento } from '../../types';
import { EditProfileView } from './EditProfileView';
import { PreferencesView } from './PreferencesView';
import { PublicProfilePreviewView } from './PublicProfilePreviewView';
import { HistoricoView } from './HistoricoView';
import { ClubeOptInView } from './ClubeOptInView';
import { clubeService } from '../../features/admin/services/clubeService';
import { comprovanteService } from '../../features/admin/services/comprovanteService';
import { ComprovanteMeiaSection } from './ComprovanteMeiaSection';
import { SolicitarParceriaView } from '../../features/admin/views/SolicitarParceriaView';
import { MinhasSolicitacoesView } from './MinhasSolicitacoesView';
import { useAuthStore } from '../../stores/authStore';
import { useTicketsStore } from '../../stores/ticketsStore';
import { useExtrasStore } from '../../stores/extrasStore';
import { moodService } from '../../services/moodService';
import { MoodPicker } from '../../components/MoodPicker';

// ── PIN helpers (same keys as WalletLockScreen) ─────────────────────────
const PIN_STORAGE_KEY = 'vanta_wallet_pin';
const hasWalletPin = (userId: string) => !!localStorage.getItem(`${PIN_STORAGE_KEY}_${userId}`);
const removeWalletPin = (userId: string) => localStorage.removeItem(`${PIN_STORAGE_KEY}_${userId}`);

interface ProfileViewProps {
  subView: ProfileSubView;
  setSubView: (view: ProfileSubView) => void;
  onUpdateProfile: (data: Partial<Membro>) => void;
  onAdminClick?: () => void;
  showAdminGuide?: boolean;
  onClearAdminGuide?: () => void;
  onLogout?: () => void;
  onEventClick?: (evento: Evento) => void;
  onSuccess?: (msg: string) => void;
  clubeConviteId?: string | null;
  onClearConviteId?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  subView,
  setSubView,
  onUpdateProfile,
  onAdminClick,
  showAdminGuide,
  onClearAdminGuide,
  onLogout,
  onEventClick,
  onSuccess,
  clubeConviteId,
  onClearConviteId,
}) => {
  const profile = useAuthStore(s => s.profile);
  const role = useAuthStore(s => s.currentAccount.role);
  const accessNodes = useAuthStore(s => s.accessNodes);
  const myTickets = useTicketsStore(s => s.myTickets);
  const myPresencas = useTicketsStore(s => s.myPresencas);
  const allEvents = useExtrasStore(s => s.allEvents);
  const membroClubeInfo = useMemo(() => {
    const m = clubeService.getMembroClubeByUserId(profile.id);
    return m ? { isMembro: true } : { isMembro: false };
  }, [profile.id]);

  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [moodEmoji, setMoodEmoji] = useState<string | null>(null);
  const [moodText, setMoodText] = useState<string | null>(null);

  // Carregar mood atual
  useEffect(() => {
    (async () => {
      const moods = await moodService.getMany([profile.id]);
      const myMood = moods[profile.id];
      if (myMood) {
        setMoodEmoji(myMood.emoji);
        setMoodText(myMood.text);
      }
    })();
  }, [profile.id]);

  const [showPinReset, setShowPinReset] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const comprovante = useMemo(() => comprovanteService.getComprovante(profile.id), [profile.id]);
  const meiaValue = !comprovante
    ? 'Não cadastrado'
    : comprovante.status === 'APROVADO'
      ? 'Aprovado'
      : comprovante.status === 'PENDENTE'
        ? 'Aguardando aprovação'
        : comprovante.status === 'REJEITADO'
          ? 'Não aprovado'
          : 'Vencido';

  // ── Stats ──
  const statusInativos = new Set(['USADO', 'CANCELADO', 'TRANSFERIDO', 'EXPIRADO', 'REEMBOLSADO']);
  const ticketsAtivos = myTickets.filter(t => !statusInativos.has(t.status));
  const totalAccess = ticketsAtivos.length + myPresencas.length;
  /* totalEventos e comunidadesVisitadas movidos para HistoricoView */
  const membroDesde = profile.cadastradoEm
    ? new Date(profile.cadastradoEm).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : null;

  // ── Borda da foto por status ──
  const photoBorderClass = membroClubeInfo.isMembro
    ? 'bg-gradient-to-br from-[#FFD300] to-[#B8860B]' // dourada MAIS VANTA
    : role === 'vanta_masteradm' || role === 'vanta_gerente' || role === 'vanta_socio'
      ? 'bg-gradient-to-br from-purple-500 to-purple-700' // roxa admin
      : 'bg-zinc-800'; // cinza padrão

  // ── Subviews ──
  if (subView === 'EDIT_PROFILE')
    return <EditProfileView profile={profile} onBack={() => setSubView('MAIN')} onSave={onUpdateProfile} />;
  if (subView === 'PREFERENCES') return <PreferencesView onBack={() => setSubView('MAIN')} onSave={onUpdateProfile} />;
  if (subView === 'HISTORICO')
    return (
      <HistoricoView
        myTickets={myTickets}
        myPresencas={myPresencas}
        allEvents={allEvents}
        userId={profile.id}
        onBack={() => setSubView('MAIN')}
        onEventClick={onEventClick ?? (() => {})}
      />
    );
  if (subView === 'CLUBE')
    return (
      <ClubeOptInView
        profile={profile}
        onBack={() => {
          setSubView('MAIN');
          onClearConviteId?.();
        }}
        onSuccess={onSuccess}
        allEvents={allEvents}
        conviteId={clubeConviteId ?? undefined}
      />
    );
  if (subView === 'MEIA_ENTRADA')
    return <ComprovanteMeiaSection userId={profile.id} onSuccess={onSuccess} onBack={() => setSubView('MAIN')} />;
  if (subView === 'SOLICITAR_PARCERIA')
    return (
      <SolicitarParceriaView
        onBack={() => setSubView('MAIN')}
        onSucesso={() => {
          onSuccess?.('Solicitação enviada com sucesso!');
          setSubView('MAIN');
        }}
      />
    );
  if (subView === 'MINHAS_SOLICITACOES') return <MinhasSolicitacoesView onBack={() => setSubView('MAIN')} />;
  if (subView === 'PREVIEW_PUBLIC' || subView === 'PREVIEW_FRIENDS') {
    return (
      <PublicProfilePreviewView
        profile={profile}
        onBack={() => setSubView('MAIN')}
        friendshipStatus="NONE"
        onRequestFriend={() => {}}
        onCancelRequest={() => {}}
        onRemoveFriend={() => {}}
        isOwner={true}
        profilePreviewStatus={subView === 'PREVIEW_PUBLIC' ? 'PUBLIC' : 'FRIENDS'}
        setProfilePreviewStatus={status => setSubView(status === 'PUBLIC' ? 'PREVIEW_PUBLIC' : 'PREVIEW_FRIENDS')}
      />
    );
  }

  // ── Menu items ──
  const menuItems = [
    { icon: User, label: 'Dados Pessoais', value: 'Editar perfil', onClick: () => setSubView('EDIT_PROFILE') },
    { icon: FileCheck, label: 'Meia-Entrada', value: meiaValue, onClick: () => setSubView('MEIA_ENTRADA') },
    { icon: Settings, label: 'Preferências', value: 'Notificações, Idioma', onClick: () => setSubView('PREFERENCES') },
    {
      icon: KeyRound,
      label: 'PIN da Carteira',
      value: hasWalletPin(profile.id) ? 'Redefinir PIN' : 'Criar PIN',
      onClick: () => setShowPinReset(true),
    },
    { icon: Lock, label: 'Alterar Senha', value: 'Senha da conta', onClick: () => setShowChangePassword(true) },
    {
      icon: HelpCircle,
      label: 'Ajuda e Suporte',
      value: 'Fale conosco',
      onClick: () => window.open('mailto:suporte@maisvanta.com?subject=Ajuda%20VANTA', '_blank'),
    },
  ];

  // ── Alterar senha handler ──
  const handleChangePassword = async () => {
    if (passwordForm.next.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const { supabase } = await import('../../services/supabaseClient');
      // Verifica senha atual re-autenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordForm.current,
      });
      if (signInError) {
        setPasswordError('Senha atual incorreta.');
        setPasswordLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
      if (error) {
        setPasswordError(error.message);
      } else {
        onSuccess?.('Senha alterada com sucesso!');
        setShowChangePassword(false);
        setPasswordForm({ current: '', next: '', confirm: '' });
      }
    } catch {
      setPasswordError('Erro ao alterar senha.');
    }
    setPasswordLoading(false);
  };

  // ── Excluir conta handler ──
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { supabase } = await import('../../services/supabaseClient');
      // Marca perfil como excluído (soft delete)
      const agora = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
      await supabase.from('profiles').update({ excluido: true, excluido_em: agora }).eq('id', profile.id);
      await supabase.auth.signOut();
      onLogout?.();
    } catch {
      onSuccess?.('Erro ao excluir conta. Tente novamente.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0a0a0a] pb-32 animate-in fade-in duration-500">
      {/* lint-layout-ok — page scrolls via parent */}
      <div className="relative pt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-80 pointer-events-none" />
        <div className="px-6 pb-8 text-center relative z-10">
          {/* Foto com borda de status */}
          <div className="relative inline-block mb-4">
            <div className={`w-32 h-32 rounded-full p-[3px] ${photoBorderClass} shadow-2xl`}>
              <div className="w-full h-full rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={profile.foto}
                  alt={profile.nome}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {/* Badge MAIS VANTA na foto */}
            {membroClubeInfo.isMembro && (
              <div className="absolute -bottom-1 right-1 bg-[#FFD300] rounded-full p-1.5 border-2 border-[#0a0a0a]">
                <Crown size={12} className="text-black" />
              </div>
            )}
          </div>

          {/* Nome */}
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl mb-1 text-white">
            {profile.nome}
          </h1>

          {/* Membro desde (ou fallback) */}
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">
            {membroDesde ? `Membro desde ${membroDesde}` : 'Membro Confirmado'}
          </p>

          {/* Mood badge */}
          <button
            onClick={() => setShowMoodPicker(true)}
            className={`mb-2 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 ${
              moodEmoji
                ? 'bg-[#FFD300]/10 border border-[#FFD300]/20'
                : 'bg-zinc-900/60 border border-dashed border-white/10'
            }`}
          >
            {moodEmoji ? (
              <span>
                {moodEmoji} <span className="text-zinc-300 text-[10px]">{moodText || ''}</span>
              </span>
            ) : (
              <span className="text-zinc-600 text-[10px]">+ Definir mood</span>
            )}
          </button>

          {/* Selos */}
          {profile.selos && profile.selos.length > 0 && (
            <div className="flex justify-center gap-1.5 mb-3">
              {profile.selos.map(selo => (
                <span
                  key={selo.id}
                  className="text-[8px] font-black uppercase tracking-wider bg-[#FFD300]/15 text-[#FFD300] border border-[#FFD300]/20 rounded-full px-2.5 py-0.5"
                >
                  {selo.label}
                </span>
              ))}
            </div>
          )}

          {/* Bio truncada */}
          {profile.biografia && (
            <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-2 max-w-xs mx-auto">
              {profile.biografia}
            </p>
          )}

          {/* Botão "Ver perfil público" */}
          <button
            onClick={() => setSubView('PREVIEW_PUBLIC')}
            className="absolute top-6 right-5 px-3 py-1.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-full flex items-center gap-1.5 active:scale-95 transition-all z-10"
          >
            <Eye size={11} className="text-[#FFD300]" />
            <span className="text-[8px] font-black uppercase tracking-wider text-[#FFD300]">Perfil público</span>
          </button>

          {/* Action cards */}
          <div className="px-4 space-y-3 mb-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSubView('WALLET')}
                className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col items-start gap-3 shadow-xl active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet size={18} className="text-[#FFD300]" />
                </div>
                <div className="text-left min-w-0 w-full">
                  <span className="block text-sm font-bold text-white leading-none mb-1 truncate">Minha Carteira</span>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest opacity-80">
                    {totalAccess === 0 ? 'Nenhum item' : `${totalAccess} Acessos`}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setSubView('CLUBE')}
                className="relative rounded-2xl active:scale-[0.97] transition-all group"
                style={{ padding: membroClubeInfo.isMembro ? 0 : '1.5px' }}
              >
                {!membroClubeInfo.isMembro && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div
                      className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]"
                      style={{
                        background: 'conic-gradient(from 0deg, #FFD300, #B8860B, #FFD300, transparent, #FFD300)',
                      }}
                    />
                  </div>
                )}
                {!membroClubeInfo.isMembro && (
                  <div
                    className="absolute inset-0 rounded-2xl animate-pulse"
                    style={{ boxShadow: '0 0 20px rgba(255,211,0,0.15), 0 0 40px rgba(255,211,0,0.05)' }}
                  />
                )}
                <div
                  className={`relative rounded-2xl p-4 flex flex-col items-start gap-3 shadow-xl ${membroClubeInfo.isMembro ? 'bg-zinc-900/80 backdrop-blur-sm border border-[#FFD300]/20' : 'bg-[#0A0A0A]'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border ${membroClubeInfo.isMembro ? 'bg-[#FFD300]/10 border-[#FFD300]/20' : 'bg-[#FFD300]/15 border-[#FFD300]/30'}`}
                  >
                    <Crown size={18} className="text-[#FFD300]" />
                  </div>
                  <div className="text-left min-w-0 w-full">
                    <span
                      className={`block text-sm font-bold leading-none mb-1 truncate ${membroClubeInfo.isMembro ? 'text-white' : 'text-[#FFD300]'}`}
                    >
                      {membroClubeInfo.isMembro ? 'Mais Vanta' : 'Seja Mais Vanta'}
                    </span>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest opacity-80"
                      style={{ color: membroClubeInfo.isMembro ? '#FFD300' : '#a89150' }}
                    >
                      {membroClubeInfo.isMembro ? 'Membro Ativo' : 'Acesso exclusivo'}
                    </span>
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setSubView('HISTORICO')}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 hover:text-white transition-all active:scale-95 shadow-inner"
            >
              <Clock size={12} className="text-[#FFD300]" />
              Meu Histórico
            </button>
            <button
              onClick={() => setSubView('MINHAS_SOLICITACOES')}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 hover:text-white transition-all active:scale-95 shadow-inner"
            >
              <ScrollText size={12} className="text-purple-400" />
              Minhas Solicitações
            </button>
            {onAdminClick && (
              <div className="relative">
                <button
                  onClick={() => {
                    onAdminClick();
                    onClearAdminGuide?.();
                  }}
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 active:text-white transition-all active:scale-95 shadow-inner"
                >
                  <Building2 size={12} className="text-purple-400" />
                  {role === 'vanta_masteradm'
                    ? 'Painel Admin VANTA'
                    : role === 'vanta_gerente'
                      ? 'Portal do Gerente'
                      : role === 'vanta_socio'
                        ? 'Portal do Sócio'
                        : role === 'vanta_ger_portaria_lista' ||
                            role === 'vanta_portaria_lista' ||
                            role === 'vanta_ger_portaria_antecipado' ||
                            role === 'vanta_portaria_antecipado'
                          ? 'Painel Portaria'
                          : role === 'vanta_caixa'
                            ? 'Painel Caixa'
                            : accessNodes.length > 1
                              ? `Painel Admin · ${accessNodes.length} acessos`
                              : accessNodes[0]
                                ? `Portal · ${accessNodes[0].cargoLabel}`
                                : 'Painel Administrativo'}
                </button>
                {showAdminGuide && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 items-center justify-center">
                      <Sparkles size={8} className="text-white" />
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu de configurações */}
      <div className="px-6">
        <h2 style={TYPOGRAPHY.uiLabel} className="mb-3 pl-2 opacity-60">
          Configurações
        </h2>
        <div className="bg-zinc-900/40 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full px-4 py-3.5 flex items-center justify-between active:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon size={16} className="text-[#FFD300] shrink-0" />
                <span className="text-sm text-white/90 truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.value && <span className="text-[10px] text-zinc-600 max-w-[120px] truncate">{item.value}</span>}
                <ChevronRight size={14} className="text-zinc-700" />
              </div>
            </button>
          ))}
        </div>

        {/* CTA Parceria — só pra quem não é gerente/master */}
        {role !== 'vanta_masteradm' && role !== 'vanta_gerente' && (
          <button
            onClick={() => setSubView('SOLICITAR_PARCERIA')}
            className="w-full mt-4 p-4 bg-gradient-to-r from-[#FFD300]/10 to-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD300]/15 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#FFD300]" />
              </div>
              <div className="min-w-0">
                <p className="text-[#FFD300] text-xs font-bold">Quero ser parceiro VANTA</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">É dono de um espaço ou produtora?</p>
              </div>
              <ChevronRight size={14} className="text-[#FFD300]/50 shrink-0" />
            </div>
          </button>
        )}

        {/* Sair */}
        <button
          onClick={onLogout}
          className="w-full mt-6 py-3 flex items-center justify-center text-[#FFD300] text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 rounded-xl transition-all active:scale-[0.98]"
        >
          <LogOut size={14} className="mr-2" />
          Sair da conta
        </button>

        {/* Excluir conta */}
        <button
          onClick={() => setShowDeleteAccount(true)}
          className="w-full py-3 flex items-center justify-center text-red-500/40 text-[9px] font-bold uppercase tracking-[0.2em] transition-all active:text-red-400"
        >
          <Trash2 size={12} className="mr-2" />
          Excluir minha conta
        </button>
      </div>

      {/* ── Modal: Redefinir PIN ── */}
      {showPinReset && (
        <div
          className="absolute inset-0 z-[60] flex items-end"
          role="presentation"
          onClick={() => setShowPinReset(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[#111111] border-t border-white/10 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPinReset(false)}
              className="absolute top-5 right-5 p-1.5 text-zinc-600 active:text-white"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl flex items-center justify-center">
                <KeyRound size={18} className="text-[#FFD300]" />
              </div>
              <p className="text-white font-bold text-sm">PIN da Carteira</p>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              {hasWalletPin(profile.id)
                ? 'Ao redefinir, seu PIN atual será removido e você criará um novo na próxima vez que abrir a Carteira.'
                : 'Você ainda não criou um PIN. Abra a Carteira para criar seu PIN de segurança.'}
            </p>
            {hasWalletPin(profile.id) && (
              <button
                onClick={() => {
                  removeWalletPin(profile.id);
                  onSuccess?.('PIN removido. Crie um novo ao abrir a Carteira.');
                  setShowPinReset(false);
                }}
                className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all"
              >
                Redefinir PIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Alterar Senha ── */}
      {showChangePassword && (
        <div
          className="absolute inset-0 z-[60] flex items-end"
          role="presentation"
          onClick={() => setShowChangePassword(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[#111111] border-t border-white/10 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowChangePassword(false);
                setPasswordError('');
              }}
              className="absolute top-5 right-5 p-1.5 text-zinc-600 active:text-white"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl flex items-center justify-center">
                <Lock size={18} className="text-[#FFD300]" />
              </div>
              <p className="text-white font-bold text-sm">Alterar Senha</p>
            </div>
            <div className="space-y-4 mb-6">
              <input
                type="password"
                placeholder="Senha atual"
                value={passwordForm.current}
                onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD300]/30"
              />
              <input
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={passwordForm.next}
                onChange={e => setPasswordForm(p => ({ ...p, next: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD300]/30"
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#FFD300]/30"
              />
              {passwordError && <p className="text-red-400 text-[11px] font-medium">{passwordError}</p>}
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading || !passwordForm.current || !passwordForm.next}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : 'Salvar Nova Senha'}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Excluir Conta ── */}
      {showDeleteAccount && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center p-6"
          onClick={() => setShowDeleteAccount(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <div
            className="relative w-full max-w-sm bg-[#0A0A0A] border border-red-500/20 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              Excluir Conta
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-2">
              Esta ação é <strong className="text-red-400">permanente e irreversível</strong>. Todos os seus dados,
              ingressos, histórico e benefícios serão perdidos.
            </p>
            <p className="text-zinc-500 text-[11px] mb-6">
              Digite <strong className="text-white">EXCLUIR</strong> para confirmar.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="Digite EXCLUIR"
              className="w-full bg-zinc-900 border border-red-500/20 rounded-xl px-4 py-3 text-white text-sm text-center placeholder:text-zinc-700 focus:outline-none focus:border-red-500/40 mb-6"
            />
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'EXCLUIR' || isDeleting}
                className="w-full py-4 bg-red-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Excluir Permanentemente'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirmText('');
                }}
                className="w-full py-4 bg-transparent text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] border border-white/5 rounded-xl active:bg-white/5 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood Picker */}
      {showMoodPicker && (
        <MoodPicker
          currentEmoji={moodEmoji}
          currentText={moodText}
          onSave={async (emoji, text) => {
            const ok = await moodService.set(profile.id, emoji, text);
            if (ok) {
              setMoodEmoji(emoji);
              setMoodText(text ?? null);
            }
          }}
          onClear={async () => {
            const ok = await moodService.clear(profile.id);
            if (ok) {
              setMoodEmoji(null);
              setMoodText(null);
            }
          }}
          onClose={() => setShowMoodPicker(false)}
        />
      )}
    </div>
  );
};
