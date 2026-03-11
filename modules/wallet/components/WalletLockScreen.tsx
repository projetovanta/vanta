import React, { useState, useEffect, useCallback } from 'react';
import { Lock, AlertTriangle, XCircle, ArrowRight, LogOut, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { supabase } from '../../../services/supabaseClient';

// ── PIN hashing ─────────────────────────────────────────────────────────
const SALT = 'vnt_2024_';
const LOCAL_STORAGE_KEY = 'vanta_wallet_pin';

const hashPin = async (pin: string): Promise<string> => {
  const data = new TextEncoder().encode(SALT + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// ── Supabase PIN storage ────────────────────────────────────────────────
const getSupabasePin = async (userId: string): Promise<string | null> => {
  const { data } = await supabase.from('profiles').select('wallet_pin_hash').eq('id', userId).maybeSingle();
  return data?.wallet_pin_hash ?? null;
};

const saveSupabasePin = async (userId: string, hash: string): Promise<void> => {
  const { error } = await supabase.from('profiles').update({ wallet_pin_hash: hash }).eq('id', userId);
  if (error) console.error('[WalletLockScreen] savePin:', error);
};

// ── Types ───────────────────────────────────────────────────────────────
type Screen = 'setup' | 'confirm' | 'unlock';

interface WalletLockScreenProps {
  onUnlock: () => void;
  onExit: () => void;
  userId: string;
}

// ── Keypad (reused across screens) ──────────────────────────────────────
const Keypad: React.FC<{
  pin: string;
  setPin: (fn: (p: string) => string) => void;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}> = ({ pin, setPin, onComplete, disabled }) => {
  const handleNumberClick = useCallback(
    (num: string) => {
      if (disabled || pin.length >= 4) return;
      const next = pin + num;
      setPin(() => next);
      if (next.length === 4) onComplete(next);
    },
    [pin, setPin, onComplete, disabled],
  );

  return (
    <>
      {/* PIN Dots */}
      <div className="flex gap-5 mb-16">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
              i < pin.length
                ? 'bg-[#FFD300] border-[#FFD300] shadow-[0_0_15px_rgba(255,211,0,0.5)] scale-110'
                : 'border-zinc-800 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Keypad grid */}
      <div
        className={`grid grid-cols-3 gap-6 w-full max-w-[70%] transition-opacity duration-500 ${disabled ? 'opacity-20 pointer-events-none scale-95' : ''}`}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((val, i) => (
          <button
            key={i}
            onClick={() => {
              if (val === 'DEL') setPin(prev => prev.slice(0, -1));
              else if (val !== '') handleNumberClick(val);
            }}
            disabled={val === '' || disabled}
            className={`aspect-square w-full max-w-16 rounded-full flex items-center justify-center text-xl font-bold transition-all active:scale-90 mx-auto ${
              val === 'DEL'
                ? 'text-zinc-400 active:text-white'
                : 'bg-zinc-900/50 border border-white/5 text-white active:bg-[#FFD300] active:text-black shadow-lg'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </>
  );
};

// ── Main Component ──────────────────────────────────────────────────────
export const WalletLockScreen: React.FC<WalletLockScreenProps> = ({ onUnlock, onExit, userId }) => {
  const [screen, setScreen] = useState<Screen>('unlock');
  const [loading, setLoading] = useState(true);
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pinMismatch, setPinMismatch] = useState(false);

  // ── Fetch PIN do Supabase + migração automática localStorage → Supabase ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supaHash = await getSupabasePin(userId);
      if (cancelled) return;

      if (supaHash) {
        // PIN já existe no Supabase
        setStoredHash(supaHash);
        setScreen('unlock');
      } else {
        // Checar localStorage (migração)
        const localHash = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
        if (localHash) {
          await saveSupabasePin(userId, localHash);
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${userId}`);
          if (cancelled) return;
          setStoredHash(localHash);
          setScreen('unlock');
        } else {
          setScreen('setup');
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const getLockoutDuration = (failCount: number) => {
    if (failCount >= 12) return 60 * 60 * 1000;
    if (failCount >= 9) return 30 * 60 * 1000;
    if (failCount >= 6) return 15 * 60 * 1000;
    if (failCount >= 3) return 5 * 60 * 1000;
    return 0;
  };

  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setLockUntil(null);
        setPin('');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  // ── Setup: escolhe PIN pela primeira vez ──
  const handleSetupComplete = useCallback((inputPin: string) => {
    setSetupPin(inputPin);
    setPin('');
    setScreen('confirm');
  }, []);

  // ── Confirm: digita o mesmo PIN novamente ──
  const handleConfirmComplete = useCallback(
    async (inputPin: string) => {
      if (inputPin === setupPin) {
        const hash = await hashPin(inputPin);
        await saveSupabasePin(userId, hash);
        setStoredHash(hash);
        onUnlock();
      } else {
        setPinMismatch(true);
        setPin('');
        setTimeout(() => {
          setPinMismatch(false);
          setSetupPin('');
          setScreen('setup');
        }, 1500);
      }
    },
    [setupPin, userId, onUnlock],
  );

  // ── Unlock: valida PIN contra o hash salvo ──
  const handleUnlockComplete = useCallback(
    async (inputPin: string) => {
      const hash = await hashPin(inputPin);
      if (hash === storedHash) {
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');

        const duration = getLockoutDuration(newAttempts);
        if (duration > 0 && newAttempts % 3 === 0) {
          setLockUntil(Date.now() + duration);
          setShowErrorModal(false);
        } else {
          setShowErrorModal(true);
        }
      }
    },
    [storedHash, onUnlock, attempts],
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingAttempts = 3 - (attempts % 3);
  const nextLockDurationMinutes = getLockoutDuration(attempts + (3 - (attempts % 3))) / (60 * 1000);

  // ── Header config per screen ──
  const headerConfig = {
    setup: {
      Icon: KeyRound,
      iconClass: 'bg-[#FFD300]/10 border-[#FFD300]/30',
      iconColor: 'text-[#FFD300]',
      title: 'Criar PIN',
      subtitle: 'Escolha um PIN de 4 dígitos para proteger sua carteira',
    },
    confirm: {
      Icon: ShieldCheck,
      iconClass: pinMismatch ? 'bg-red-500/10 border-red-500/50' : 'bg-[#FFD300]/10 border-[#FFD300]/30',
      iconColor: pinMismatch ? 'text-red-500' : 'text-[#FFD300]',
      title: pinMismatch ? 'PINs diferentes' : 'Confirme o PIN',
      subtitle: pinMismatch ? 'Os PINs não coincidem. Tente novamente.' : 'Digite o mesmo PIN novamente',
    },
    unlock: {
      Icon: lockUntil ? XCircle : Lock,
      iconClass: lockUntil
        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        : 'bg-[#FFD300]/10 border-[#FFD300]/30',
      iconColor: lockUntil ? 'text-red-500 animate-pulse' : 'text-[#FFD300]',
      title: lockUntil ? 'Bloqueio de Segurança' : 'Carteira Protegida',
      subtitle: lockUntil ? `Aguarde ${formatTime(timeLeft)} para tentar novamente` : 'Confirme seu PIN de segurança',
    },
  };

  const { Icon, iconClass, iconColor, title, subtitle } = headerConfig[screen];

  const onComplete =
    screen === 'setup' ? handleSetupComplete : screen === 'confirm' ? handleConfirmComplete : handleUnlockComplete;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
        <Loader2 size="2rem" className="text-[#FFD300] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 relative min-h-[60vh]">
      {/* Header */}
      <div className="mb-12 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border transition-all duration-500 ${iconClass}`}
        >
          <Icon size="2rem" className={iconColor} />
        </div>
        <h2 style={TYPOGRAPHY.screenTitle} className="text-2xl text-white mb-2 italic">
          {title}
        </h2>
        <p className="text-zinc-400 text-[0.5625rem] uppercase tracking-[0.3em] font-black">{subtitle}</p>
      </div>

      {/* Keypad */}
      <Keypad pin={pin} setPin={setPin} onComplete={onComplete} disabled={!!lockUntil || pinMismatch} />

      {/* Voltar */}
      {!lockUntil && !showErrorModal && !pinMismatch && (
        <button
          onClick={onExit}
          className="mt-12 text-zinc-400 hover:text-zinc-400 text-[0.625rem] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
        >
          <LogOut size="0.75rem" />
          Voltar ao Perfil
        </button>
      )}

      {/* ERROR MODAL: Senha Incorreta (only on unlock screen) */}
      {showErrorModal && screen === 'unlock' && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <div className="relative w-full max-w-[85%] bg-[#0A0A0A] border border-red-500/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle size="1.75rem" className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </div>

            <h2 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3 italic">
              PIN Incorreto
            </h2>

            <p className="text-zinc-400 text-[0.6875rem] leading-relaxed mb-8 px-2 font-medium">
              Você tem mais <span className="text-white font-black">{remainingAttempts}</span>{' '}
              {remainingAttempts === 1 ? 'tentativa' : 'tentativas'} antes de bloquear por{' '}
              <span className="text-white font-black">{nextLockDurationMinutes} minutos</span>.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_20px_rgba(255,211,0,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size="0.875rem" />
              </button>

              <button
                onClick={onExit}
                className="w-full py-4 bg-transparent text-zinc-400 font-bold text-[0.625rem] uppercase tracking-[0.2em] border border-white/5 rounded-xl active:bg-white/5 transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
