import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Lock, Upload } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { Membro } from '../types';
import { DEFAULT_AVATARS } from '../data/avatars';
import { uploadBiometria } from '../services/supabaseVantaService';
import { authService } from '../services/authService';

// ── Dados BR (importados de data/brData.ts) ─────────────────────────────────
import { ESTADOS_CIDADES, ESTADOS, DDDS } from '../data/brData';
import { VantaPickerModal } from './VantaPickerModal';
import { LegalView, useLegalView } from './LegalView';

// ── Módulos extraídos ────────────────────────────────────────────────────────
import { inputCls, isValidDate, isAdult, isValidEmail, fmtDataNasc, fmtTelefone } from './auth/authHelpers';
import { StepIndicator, FieldError } from './auth/StepIndicator';
import { SelfieCameraComponent } from './auth/SelfieCameraComponent';

// ── AuthModal ─────────────────────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (membro: Membro) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { legalPage, openTermos, openPrivacidade, closeLegal } = useLegalView();

  // Step 1
  const [nome, setNome] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [genero, setGenero] = useState<'MASCULINO' | 'FEMININO' | ''>('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  // Step 2
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [ddd, setDdd] = useState('11');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);

  // Step 3
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [consentimento, setConsentimento] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Rate limiting cadastro (threshold 10) ──
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

  const cidades = estado ? (ESTADOS_CIDADES[estado] ?? []) : [];

  // Reset cidade when estado changes
  const handleEstado = (v: string) => {
    setEstado(v);
    setCidade('');
  };

  // ── Validation ───────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!nome.trim() || nome.trim().length < 3) e.nome = 'Nome completo obrigatório (mínimo 3 caracteres)';
    if (!isValidDate(dataNasc)) e.dataNasc = 'Data inválida. Use DD/MM/AAAA';
    else if (!isAdult(dataNasc)) e.dataNasc = 'Você precisa ter 16 anos ou mais';
    if (!genero) e.genero = 'Selecione o gênero';
    if (!estado) e.estado = 'Selecione o estado';
    if (!cidade) e.cidade = 'Selecione a cidade';
    if (!consentimento) e.consentimento = 'Aceite os termos para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (instagram.trim() && (/\s/.test(instagram) || instagram.includes('@')))
      e.instagram = 'Informe sem @ e sem espaços';

    if (!isValidEmail(email)) e.email = 'E-mail inválido';

    const digTel = telefone.replace(/\D/g, '');
    if (!ddd) e.ddd = 'Selecione o DDD';
    if (digTel.length < 8 || digTel.length > 9) e.telefone = 'Número inválido (8 ou 9 dígitos)';
    if (senha.length < 6) e.senha = 'Senha deve ter no mínimo 6 caracteres';
    if (confirma !== senha) e.confirma = 'As senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    if (!selfieUrl) {
      setErrors({ selfie: 'Capture sua selfie para continuar' });
      return false;
    }
    return true;
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else onClose();
    setErrors({});
  };

  const handleFinish = async () => {
    if (isSignupLocked || !validateStep3() || isUploading) return;

    const iso = (() => {
      const [d, m, y] = dataNasc.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    })();

    setIsUploading(true);
    let selfiePublicUrl: string | undefined;

    try {
      // 1. Cria conta no Supabase Auth + profile
      const result = await authService.signUp({
        email: email.toLowerCase().trim(),
        senha,
        nome: nome.trim(),
        instagram: instagram.trim(),
        dataNascimento: iso,
        genero: genero as 'MASCULINO' | 'FEMININO',
        estado,
        cidade,
        telefoneDdd: ddd,
        telefoneNumero: telefone.replace(/\D/g, ''),
      });

      if (!result.ok || !result.membro) {
        const newFails = signupFails + 1;
        setSignupFails(newFails);
        sessionStorage.setItem('vanta_signup_fails', String(newFails));
        if (newFails >= 10) {
          const until = Date.now() + 300_000; // 5min
          setSignupLockUntil(until);
          sessionStorage.setItem('vanta_signup_lock', String(until));
        }
        setErrors({ selfie: result.erro ?? 'Erro ao criar conta. Tente novamente.' });
        setIsUploading(false);
        return;
      }

      const userId = result.membro.id;

      // 2. Tenta upload da selfie biométrica (não-bloqueante)
      try {
        const { publicUrl } = await uploadBiometria(selfieUrl, userId);
        if (publicUrl) selfiePublicUrl = publicUrl;
      } catch {
        // Silencioso — base64 local como fallback
      }

      const novaMembro: Membro = {
        ...result.membro,
        biometriaFoto: selfiePublicUrl ?? selfieUrl,
        biometriaCaptured: true,
        foto: DEFAULT_AVATARS[genero as 'MASCULINO' | 'FEMININO'] ?? DEFAULT_AVATARS.MASCULINO,
      };

      onSuccess(novaMembro);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro inesperado.';
      setErrors({ selfie: msg });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const stepLabels = ['Identidade', 'Contato & Login', 'Biometria Facial'];

  return (
    <div className="absolute inset-0 z-[350] flex flex-col bg-[#0A0A0A] animate-in slide-in-from-bottom duration-400 overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 px-6 pb-4 border-b border-white/5 flex items-start justify-between"
        style={{ paddingTop: '1.5rem' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]" />
            <p className="text-[#FFD300]/60 text-[9px] font-black uppercase tracking-[0.25em]">Cadastro VANTA</p>
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl italic text-white">
            {stepLabels[step - 1]}
          </h1>
        </div>
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-h-0 px-6 pt-6 pb-4 flex flex-col ${step === 3 ? '' : 'overflow-y-auto no-scrollbar'}`}
      >
        <StepIndicator step={step} />

        {/* ── Step 1: Identidade ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Nome Completo</p>
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className={`${inputCls} ${errors.nome ? 'border-red-500/40' : ''}`}
                autoComplete="name"
              />
              <FieldError msg={errors.nome} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Data de Nascimento</p>
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

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Gênero</p>
              <div className="flex gap-2">
                {(['MASCULINO', 'FEMININO'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGenero(g)}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                      genero === g
                        ? 'bg-[#FFD300]/10 border-[#FFD300]/40 text-[#FFD300]'
                        : 'bg-zinc-900/60 border-white/5 text-zinc-500 active:border-white/20'
                    }`}
                  >
                    {g === 'MASCULINO' ? 'Masculino' : 'Feminino'}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.genero} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Estado</p>
              <VantaPickerModal
                items={ESTADOS.map(uf => ({ value: uf, label: uf }))}
                value={estado}
                onChange={handleEstado}
                label="Selecione o estado"
                placeholder="Selecione o estado…"
                searchable
                error={!!errors.estado}
              />
              <FieldError msg={errors.estado} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Cidade</p>
              <VantaPickerModal
                items={cidades.map(c => ({ value: c, label: c }))}
                value={cidade}
                onChange={setCidade}
                label="Selecione a cidade"
                placeholder={estado ? 'Selecione a cidade…' : 'Selecione o estado primeiro'}
                searchable
                disabled={!estado}
                error={!!errors.cidade}
              />
              <FieldError msg={errors.cidade} />
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
                      : 'bg-zinc-900/60 border-white/5 active:border-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    consentimento ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'
                  }`}
                >
                  {consentimento && <Check size={12} className="text-black" />}
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
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
                  da VANTA, incluindo o uso da minha foto biométrica para verificação de identidade.
                </p>
              </button>
              <FieldError msg={errors.consentimento} />
            </div>
          </div>
        )}

        {/* ── Step 2: Contato & Login ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Instagram</p>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-zinc-600 text-sm select-none">@</span>
                <input
                  value={instagram}
                  onChange={e => setInstagram(e.target.value.replace('@', '').replace(/\s/g, ''))}
                  placeholder="seuinstagram"
                  className={`${inputCls} pl-8 ${errors.instagram ? 'border-red-500/40' : ''}`}
                  autoCapitalize="none"
                />
              </div>
              <FieldError msg={errors.instagram} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">E-mail</p>
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

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Telefone</p>
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <VantaPickerModal
                    items={DDDS.map(d => ({ value: d, label: `(${d})` }))}
                    value={ddd}
                    onChange={setDdd}
                    label="DDD"
                    placeholder="DDD"
                    searchable
                    error={!!errors.ddd}
                  />
                </div>
                <input
                  value={telefone}
                  onChange={e => setTelefone(fmtTelefone(e.target.value))}
                  placeholder="99999-9999"
                  className={`${inputCls} flex-1 min-w-0 ${errors.telefone ? 'border-red-500/40' : ''}`}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="off"
                />
              </div>
              <FieldError msg={errors.ddd || errors.telefone} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Senha</p>
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
                  onClick={() => setShowSenha(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 active:text-zinc-400"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={errors.senha} />
            </div>

            <div>
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Confirmar Senha</p>
              <div className="relative">
                <input
                  type={showConfirma ? 'text' : 'password'}
                  value={confirma}
                  onChange={e => setConfirma(e.target.value)}
                  placeholder="Repita a senha"
                  className={`${inputCls} pr-12 ${errors.confirma ? 'border-red-500/40' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  onClick={() => setShowConfirma(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 active:text-zinc-400"
                >
                  {showConfirma ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={errors.confirma} />
            </div>
          </div>
        )}

        {/* ── Step 3: Biometria Facial ── */}
        {step === 3 && (
          <div className="flex flex-col flex-1 min-h-0">
            <SelfieCameraComponent onCapture={url => setSelfieUrl(url)} />
            <FieldError msg={errors.selfie} />
          </div>
        )}
      </div>

      {/* Footer — action button */}
      <div
        className="shrink-0 px-6 pt-3 border-t border-white/5"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all"
          >
            Próximo
          </button>
        ) : (
          <>
            {isSignupLocked && signupLockCountdown > 0 && (
              <div className="flex items-center gap-2 justify-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
                <Lock size={12} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">
                  Bloqueado por {signupLockCountdown}s
                </p>
              </div>
            )}
            <button
              onClick={handleFinish}
              disabled={!selfieUrl || isUploading || isSignupLocked}
              className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Upload size={14} className="animate-pulse" /> Enviando biometria…
                </>
              ) : (
                <>
                  <Check size={14} /> Finalizar Cadastro
                </>
              )}
            </button>
          </>
        )}

        {step > 1 && (
          <p className="text-zinc-700 text-[9px] text-center mt-4 leading-relaxed">
            Ao continuar você confirma os Termos de Uso e Política de Privacidade da VANTA.
          </p>
        )}
      </div>

      {/* Overlay Legal */}
      {legalPage && <LegalView page={legalPage} onBack={closeLegal} />}
    </div>
  );
};
