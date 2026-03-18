import React, { lazy } from 'react';
import { TYPOGRAPHY } from '../constants';
import { Check, X, Sparkles } from 'lucide-react';
import { PushPermissionBanner } from './PushPermissionBanner';
import { useModalBack } from '../hooks/useModalStack';
import type { usePWA } from '../hooks/usePWA';

const LoginView = lazy(() => import('./LoginView').then(m => ({ default: m.LoginView })));
const ReviewModal = lazy(() => import('./ReviewModal'));
const OnboardingView = lazy(() => import('./OnboardingView').then(m => ({ default: m.OnboardingView })));

// ── Inline modals ──────────────────────────────────────────────────────────
const GUEST_MODAL_TEXTS: Record<string, string> = {
  curtir: 'Crie sua conta pra salvar eventos que você curte',
  comprar: 'Crie sua conta pra garantir seu ingresso',
  mensagem: 'Crie sua conta pra conversar com amigos',
  perfil: 'Crie sua conta pra ter seu perfil',
  notificacao: 'Crie sua conta pra receber avisos dos eventos',
  generico: 'Crie sua conta pra aproveitar tudo que a noite tem de melhor',
};

const GuestAreaModal = ({
  contexto,
  onLogin,
  onCadastrar,
  onCancel,
}: {
  contexto: string;
  onLogin: () => void;
  onCadastrar: () => void;
  onCancel: () => void;
}) => (
  <div className="absolute inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" role="presentation" onClick={onCancel} />
    <div className="relative w-full max-w-[85%] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.05)] animate-in zoom-in-95 duration-300">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 p-3 text-zinc-400 hover-real:text-white transition-colors"
      >
        <X size="1.125rem" />
      </button>
      <div className="w-20 h-20 bg-zinc-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
        <Sparkles size="1.75rem" className="text-[#FFD300]" />
      </div>
      <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3">
        Crie sua conta
      </h2>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 px-2">
        {GUEST_MODAL_TEXTS[contexto] ?? GUEST_MODAL_TEXTS.generico}
      </p>
      <div className="space-y-3">
        <button
          onClick={onLogin}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
        >
          Já tenho conta
        </button>
        <button
          onClick={onCadastrar}
          className="w-full py-3.5 border border-[#FFD300]/15 text-white font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
        >
          Criar Conta
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3.5 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-wide active:opacity-60 transition-all"
        >
          Agora não
        </button>
      </div>
    </div>
  </div>
);

const SuccessFeedbackModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="absolute inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" role="presentation" onClick={onClose} />
    <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-[#FFD300]/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,211,0,0.1)] animate-in zoom-in-95 duration-500">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-zinc-400 hover-real:text-white transition-colors"
      >
        <X size="1.125rem" />
      </button>
      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD300]/20 shadow-xl">
        <Check size="2rem" className="text-[#FFD300] drop-shadow-[0_0_10px_#FFD300]" />
      </div>
      <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-3">
        Sucesso!
      </h2>
      <p className="text-zinc-400 text-xs leading-relaxed mb-8 px-4">{message}</p>
      <button
        onClick={onClose}
        className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
      >
        Entendido
      </button>
    </div>
  </div>
);

// ── Agregador de modais ────────────────────────────────────────────────────
interface AppModalsProps {
  isGuest: boolean;
  userId: string;
  pwa: PWA;
  // modal states
  setShowAuthModal: (v: boolean) => void;
  showLoginView: boolean;
  setShowLoginView: (v: boolean) => void;
  guestModalContext: string | null;
  setGuestModalContext: (v: string | null) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (v: boolean) => void;
  successMessage: string;
  showProfileSuccess: boolean;
  setShowProfileSuccess: (v: boolean) => void;
  showOnboarding: boolean;
  reviewTarget: { eventoId: string; eventoNome: string } | null;
  setReviewTarget: (v: { eventoId: string; eventoNome: string } | null) => void;
  // handlers
  handleAuthSuccess: (m: import('../types').Membro) => void;
  handleLoginSuccess: (m: import('../types').Membro) => void;
  handleOnboardingComplete: () => void;
  onRegisterFcm: () => void;
}

type PWA = ReturnType<typeof usePWA>;

export const AppModals: React.FC<AppModalsProps> = ({
  isGuest,
  userId,
  pwa,
  setShowAuthModal,
  showLoginView,
  setShowLoginView,
  guestModalContext,
  setGuestModalContext,
  showSuccessModal,
  setShowSuccessModal,
  successMessage,
  showProfileSuccess,
  setShowProfileSuccess,
  showOnboarding,
  reviewTarget,
  setReviewTarget,
  handleAuthSuccess,
  handleLoginSuccess,
  handleOnboardingComplete,
  onRegisterFcm,
}) => {
  useModalBack(showLoginView, () => setShowLoginView(false), 'login-view');
  useModalBack(!!guestModalContext, () => setGuestModalContext(null), 'guest-modal');
  useModalBack(showSuccessModal, () => setShowSuccessModal(false), 'success-modal');
  useModalBack(showProfileSuccess, () => setShowProfileSuccess(false), 'profile-success-modal');
  useModalBack(showOnboarding, handleOnboardingComplete, 'onboarding');
  useModalBack(!!reviewTarget, () => setReviewTarget(null), 'review-modal');

  return (
    <>
      {showLoginView && (
        <div className="absolute inset-0 z-[340] flex flex-col bg-[#0A0A0A] animate-in slide-in-from-bottom duration-300">
          <LoginView
            onSuccess={handleLoginSuccess}
            onRegister={() => {
              setShowLoginView(false);
              setShowAuthModal(true);
            }}
            onClose={() => setShowLoginView(false)}
          />
        </div>
      )}
      {guestModalContext && (
        <GuestAreaModal
          contexto={guestModalContext}
          onLogin={() => {
            setGuestModalContext(null);
            setShowLoginView(true);
          }}
          onCadastrar={() => {
            setGuestModalContext(null);
            setShowAuthModal(true);
          }}
          onCancel={() => setGuestModalContext(null)}
        />
      )}
      {showSuccessModal && <SuccessFeedbackModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}
      {showProfileSuccess && (
        <SuccessFeedbackModal message="Perfil atualizado com sucesso!" onClose={() => setShowProfileSuccess(false)} />
      )}
      {showOnboarding && <OnboardingView onComplete={handleOnboardingComplete} />}
      {reviewTarget && (
        <ReviewModal
          eventoId={reviewTarget.eventoId}
          eventoNome={reviewTarget.eventoNome}
          userId={userId}
          onClose={() => setReviewTarget(null)}
        />
      )}
      {/* PWA update banner */}
      {pwa.updateAvailable && (
        <div className="absolute bottom-20 left-3 right-3 z-[500] bg-zinc-900 border border-[#FFD300]/30 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-[#FFD300]/10 flex items-center justify-center shrink-0">
            <Check size="0.875rem" className="text-[#FFD300]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold leading-none">Nova versão disponível</p>
            <p className="text-zinc-400 text-[0.625rem] mt-0.5">Atualize para a versão mais recente.</p>
          </div>
          <button
            onClick={pwa.applyUpdate}
            className="shrink-0 px-3 py-1.5 bg-[#FFD300] text-black text-[0.625rem] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all"
          >
            Atualizar
          </button>
        </div>
      )}
      {/* PWA install banner */}
      {pwa.canInstall && !pwa.isInstalled && (
        <div className="absolute bottom-20 left-3 right-3 z-[499] bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <img loading="lazy" src="/icon-192.png" alt="VANTA" className="w-8 h-8 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold leading-none">Adicionar à tela inicial</p>
            <p className="text-zinc-400 text-[0.625rem] mt-0.5">Acesse o VANTA como app nativo.</p>
          </div>
          <button
            onClick={pwa.installApp}
            className="shrink-0 px-3 py-1.5 bg-zinc-800 border border-white/10 text-white text-[0.625rem] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all"
          >
            Instalar
          </button>
        </div>
      )}
      {/* Push permission banner */}
      {!isGuest && (
        <PushPermissionBanner
          permission={pwa.notifPermission}
          isInstalled={pwa.isInstalled}
          onRequestPermission={pwa.requestNotifPermission}
          onRegisterFcm={onRegisterFcm}
        />
      )}
    </>
  );
};
