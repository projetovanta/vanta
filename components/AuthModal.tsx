import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { Membro } from '../types';
import { authService } from '../services/authService';
import { LegalView, useLegalView } from './LegalView';
import { useModalBack } from '../hooks/useModalStack';
import { inputCls, isValidDate, isAdult, isValidEmail, fmtDataNasc } from './auth/authHelpers';
import { FieldError } from './auth/FieldError';

const BG_IMAGE = 'https://i.imgur.com/E1DUrFy.jpeg';

// ── AuthModal — Cadastro Nível 1 (Perfil Progressivo) ─────────────────────

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (membro: Membro) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  useModalBack(isOpen, onClose, 'auth-modal');
  const { legalPage, openTermos, openPrivacidade, closeLegal } = useLegalView();

  // ── Fields ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [nome, setNome] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [consentimento, setConsentimento] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ── Rate limiting (threshold 10) ────────────────────────────────────────
  const [signupFails, setSignupFails] = useState(() => {
    const v = sessionStorage.getItem('vanta_signup_fails');
    return v ? parseInt(v, 10) : 0;
  });
  const [signupLockUntil, setSignupLockUntil] = useState(() => {
    const v = sessionStorage.getItem('vanta_signup_lock');
    return v ? parseInt(v, 10) : 0;
  });
  const [signupLockCountdown, setSignupLockCountdown] = useState(0);
  const signupLockTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSignupLocked = signupLockUntil > Date.now();

  useEffect(() => {
    if (signupLockTimer.current) clearInterval(signupLockTimer.current);
    if (signupLockUntil > Date.now()) {
      const tick = () => {
        const rem = Math.ceil((signupLockUntil - Date.now()) / 1000);
        if (rem <= 0) {
          setSignupLockCountdown(0);
          if (signupLockTimer.current) clearInterval(signupLockTimer.current);
        } else setSignupLockCountdown(rem);
      };
      tick();
      signupLockTimer.current = setInterval(tick, 1000);
    }
    return () => {
      if (signupLockTimer.current) clearInterval(signupLockTimer.current);
    };
  }, [signupLockUntil]);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!isValidEmail(email)) e.email = 'E-mail inválido';
    if (senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    if (!nome.trim() || nome.trim().length < 3) e.nome = 'Nome completo (mínimo 3 caracteres)';
    if (!isValidDate(dataNasc)) e.dataNasc = 'Data inválida. Use DD/MM/AAAA';
    else if (!isAdult(dataNasc)) e.dataNasc = 'Você precisa ter 16 anos ou mais';
    if (!consentimento) e.consentimento = 'Aceite os termos para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSignupLocked || loading) return;
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    const iso = (() => {
      const [d, m, y] = dataNasc.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    })();

    const result = await authService.signUp({
      email: email.toLowerCase().trim(),
      senha,
      nome: nome.trim(),
      dataNascimento: iso,
    });

    if (!result.ok || !result.membro) {
      const newFails = signupFails + 1;
      setSignupFails(newFails);
      sessionStorage.setItem('vanta_signup_fails', String(newFails));
      if (newFails >= 10) {
        const until = Date.now() + 300_000;
        setSignupLockUntil(until);
        sessionStorage.setItem('vanta_signup_lock', String(until));
      }
      setGlobalError(result.erro ?? 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess(result.membro);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[350] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400">
      {/* ── Fundo Ken Burns ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          animation: 'kenBurns 22s ease-in-out infinite alternate',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

      {/* ── Header ── */}
      <div className="relative shrink-0 px-6 pb-4 flex items-start justify-between" style={{ paddingTop: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]" />
            <p className="text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Criar conta</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl italic text-white">
            Cadastro
          </h1>
        </div>
        <button
          aria-label="Voltar"
          onClick={onClose}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
        >
          <ArrowLeft size="1.125rem" className="text-zinc-400" />
        </button>
      </div>

      {/* ── Form (scroll) ── */}
      <div className="relative flex-1 min-h-0 px-6 pt-4 pb-4 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          {/* Email */}
          <div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">E-mail</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`${inputCls} ${errors.email ? 'border-red-500/40' : ''}`}
              autoCapitalize="none"
              autoComplete="username"
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Senha */}
          <div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Senha</p>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`${inputCls} pr-12 ${errors.senha ? 'border-red-500/40' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowSenha(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showSenha ? <EyeOff size="1rem" /> : <Eye size="1rem" />}
              </button>
            </div>
            <FieldError msg={errors.senha} />
          </div>

          {/* Nome */}
          <div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Nome Completo</p>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className={`${inputCls} ${errors.nome ? 'border-red-500/40' : ''}`}
              autoComplete="name"
            />
            <FieldError msg={errors.nome} />
          </div>

          {/* Data de Nascimento */}
          <div>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">
              Data de Nascimento
            </p>
            <input
              value={dataNasc}
              onChange={e => setDataNasc(fmtDataNasc(e.target.value))}
              placeholder="DD/MM/AAAA"
              className={`${inputCls} ${errors.dataNasc ? 'border-red-500/40' : ''}`}
              inputMode="numeric"
              maxLength={10}
            />
            <FieldError msg={errors.dataNasc} />
          </div>

          {/* Consentimento */}
          <div>
            <button
              type="button"
              onClick={() => setConsentimento(p => !p)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                consentimento
                  ? 'bg-[#FFD300]/5 border-[#FFD300]/30'
                  : errors.consentimento
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-black/40 border-white/5 active:border-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  consentimento ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'
                }`}
              >
                {consentimento && <Check size="0.75rem" className="text-black" />}
              </div>
              <p className="text-zinc-400 text-[0.6875rem] leading-relaxed">
                Li e aceito os{' '}
                <span
                  className="text-[#FFD300] underline"
                  onClick={e => {
                    e.stopPropagation();
                    openTermos();
                  }}
                >
                  Termos de Uso
                </span>{' '}
                e a{' '}
                <span
                  className="text-[#FFD300] underline"
                  onClick={e => {
                    e.stopPropagation();
                    openPrivacidade();
                  }}
                >
                  Política de Privacidade
                </span>{' '}
                da VANTA.
              </p>
            </button>
            <FieldError msg={errors.consentimento} />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="relative shrink-0 px-6 pt-3 border-t border-white/5"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {isSignupLocked && signupLockCountdown > 0 && (
          <div className="flex items-center gap-2 justify-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
            <Lock size="0.75rem" className="text-red-400 shrink-0" />
            <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">
              Bloqueado por {signupLockCountdown}s
            </p>
          </div>
        )}

        {globalError && <p className="text-red-400 text-[0.6875rem] text-center mb-3">{globalError}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || isSignupLocked}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Criando conta…</span>
          ) : (
            <>
              <Check size="0.875rem" /> Criar Conta
            </>
          )}
        </button>
      </div>

      {/* Overlay Legal */}
      {legalPage && <LegalView page={legalPage} onBack={closeLegal} />}

      {/* Keyframes Ken Burns */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.00) translate(0%, 0%); }
          100% { transform: scale(1.07) translate(-1.5%, -1%); }
        }
      `}</style>
    </div>
  );
};
