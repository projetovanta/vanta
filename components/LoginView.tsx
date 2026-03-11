/**
 * LoginView — tela de login real via Supabase Auth.
 *
 * Fundo: foto ambiente com efeito Ken Burns (zoom in/out suave e contínuo).
 * Fonte VANTA: Playfair Display (serif).
 * Em DEV, o seletor de conta mock continua disponível.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Loader, Check, X, Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { Membro } from '../types';
import { TYPOGRAPHY } from '../constants';

const BG_IMAGE = 'https://i.imgur.com/E1DUrFy.jpeg';

interface LoginViewProps {
  onSuccess: (membro: Membro) => void;
  onRegister: () => void;
  onClose?: () => void;
}

const inputCls =
  'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/50 placeholder-white/30 transition-colors backdrop-blur-sm';

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onRegister, onClose }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetErro, setResetErro] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  // ── Rate limiting client-side ──
  const [failCount, setFailCount] = useState(() => {
    const stored = sessionStorage.getItem('vanta_login_fails');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lockUntil, setLockUntil] = useState(() => {
    const stored = sessionStorage.getItem('vanta_login_lock');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lockCountdown, setLockCountdown] = useState(0);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLocked = lockUntil > Date.now();

  useEffect(() => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    if (lockUntil > Date.now()) {
      const tick = () => {
        const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockCountdown(0);
          if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        } else {
          setLockCountdown(remaining);
        }
      };
      tick();
      lockTimerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [lockUntil]);

  const applyLockout = (fails: number) => {
    let lockSec = 0;
    if (fails >= 10)
      lockSec = 300; // 5min
    else if (fails >= 5) lockSec = 30; // 30s
    if (lockSec > 0) {
      const until = Date.now() + lockSec * 1000;
      setLockUntil(until);
      sessionStorage.setItem('vanta_login_lock', String(until));
    }
  };

  const handleLogin = async () => {
    if (isLocked) return;
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      const result = await authService.signIn(email.trim().toLowerCase(), senha);
      if (result.ok && result.membro) {
        // Reset rate limit on success
        setFailCount(0);
        sessionStorage.removeItem('vanta_login_fails');
        sessionStorage.removeItem('vanta_login_lock');
        onSuccess(result.membro);
      } else {
        const newFails = failCount + 1;
        setFailCount(newFails);
        sessionStorage.setItem('vanta_login_fails', String(newFails));
        applyLockout(newFails);
        const remaining = newFails >= 8 ? ` (${10 - newFails} tentativas restantes)` : '';
        setErro((result.erro ?? 'Credenciais inválidas.') + remaining);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSend = async () => {
    if (!resetEmail.trim()) {
      setResetErro('Informe seu e-mail.');
      return;
    }
    setResetErro('');
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}?reset=1`,
      });
      if (error) setResetErro(error.message);
      else setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col relative overflow-hidden bg-black"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ── Fundo com Ken Burns ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          animation: 'kenBurns 22s ease-in-out infinite alternate',
        }}
      />
      {/* Camada escura uniforme */}
      <div className="absolute inset-0 bg-black/75" />
      {/* Gradiente extra escurecendo a base onde ficam os campos */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />

      {/* ── Conteúdo ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Botão fechar — canto superior direito */}
        {onClose && (
          <button
            onClick={() => setConfirmClose(true)}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 active:text-white active:bg-black/60 transition-all backdrop-blur-sm"
          >
            <X size="1rem" />
          </button>
        )}

        {/* Logo — centro absoluto da tela */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-white text-5xl mb-2 tracking-[0.12em] italic font-bold">VANTA</h1>
            <p className="text-[#FFD300] text-xs font-black uppercase tracking-[0.35em]">lifestyle é acesso</p>
          </div>
        </div>

        {/* Spacer para empurrar o form pro fundo */}
        <div className="flex-1" />

        {/* Card de login — padding lateral menor para botões não ficarem full-width */}
        <div className="shrink-0 px-8 pb-8 pt-6 space-y-4">
          {!resetMode ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleLogin();
              }}
              className="contents"
            >
              <div>
                <p className="text-[0.6875rem] text-white/70 font-black uppercase tracking-widest mb-1.5">E-mail</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls}
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[0.6875rem] text-white/70 font-black uppercase tracking-widest">Senha</p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setResetEmail(email);
                    }}
                    className="text-[0.625rem] text-[#FFD300]/80 font-bold uppercase tracking-wider active:text-[#FFD300] transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    className={`${inputCls} pr-12`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 active:text-white transition-colors"
                  >
                    {showSenha ? <EyeOff size="1rem" /> : <Eye size="1rem" />}
                  </button>
                </div>
              </div>

              {erro && (
                <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest animate-pulse text-center">
                  {erro}
                </p>
              )}

              {isLocked && lockCountdown > 0 && (
                <div className="flex items-center gap-2 justify-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <Lock size="0.75rem" className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">
                    Bloqueado por {lockCountdown}s
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center gap-3 mt-1 px-4">
                <button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full py-3 bg-[#FFD300] text-black font-bold text-[0.6875rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size="0.8125rem" className="animate-spin" /> Entrando…
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onRegister}
                  className="w-full py-2.5 border border-white/25 rounded-xl text-white font-bold text-[0.6875rem] uppercase tracking-[0.18em] active:scale-95 transition-all text-center"
                >
                  Não tenho conta — Cadastrar
                </button>
              </div>
            </form>
          ) : (
            /* ── Modo recuperação de senha ── */
            <>
              <div className="text-center pt-2 pb-1">
                <p className="text-white font-bold text-base mb-1">Recuperar senha</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              {!resetSent ? (
                <>
                  <div>
                    <p className="text-[0.6875rem] text-white/70 font-black uppercase tracking-widest mb-1.5">E-mail</p>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResetSend()}
                      placeholder="seu@email.com"
                      className={inputCls}
                      autoCapitalize="none"
                      autoFocus
                    />
                  </div>

                  {resetErro && (
                    <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest animate-pulse text-center">
                      {resetErro}
                    </p>
                  )}

                  <button
                    onClick={handleResetSend}
                    disabled={resetLoading}
                    className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader size="0.875rem" className="animate-spin" /> Enviando…
                      </>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Check size="1.5rem" className="text-emerald-400" />
                  </div>
                  <p className="text-white font-bold text-sm text-center">Link enviado!</p>
                  <p className="text-white/50 text-xs text-center leading-relaxed">
                    Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSent(false);
                  setResetErro('');
                }}
                className="w-full py-3.5 border border-white/25 rounded-xl text-white font-bold text-[0.6875rem] uppercase tracking-[0.18em] active:scale-95 transition-all text-center"
              >
                Voltar ao login
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Modal confirmação de saída ───────────────────────────────── */}
      {confirmClose && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-[#111] border border-white/10 rounded-3xl p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <p className="text-white font-bold text-base mb-2" style={TYPOGRAPHY.screenTitle}>
              Tem certeza?
            </p>
            <p className="text-white/50 text-xs leading-relaxed mb-6">
              Você não está cadastrado na VANTA ainda. Ao sair perderá o acesso ao painel.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setConfirmClose(false);
                  onClose?.();
                }}
                className="w-full py-3 bg-white/10 border border-white/15 rounded-xl text-white/80 font-bold text-[0.6875rem] uppercase tracking-[0.18em] active:scale-95 transition-all"
              >
                Sim, sair mesmo assim
              </button>
              <button
                onClick={() => setConfirmClose(false)}
                className="w-full py-3 bg-[#FFD300] text-black font-bold text-[0.6875rem] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
              >
                Continuar e me cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyframes Ken Burns ───────────────────────────────────────── */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.00) translate(0%, 0%); }
          100% { transform: scale(1.07) translate(-1.5%, -1%); }
        }
      `}</style>
    </div>
  );
};
