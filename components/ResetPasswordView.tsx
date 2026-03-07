import React, { useState } from 'react';
import { TYPOGRAPHY } from '../constants';
import { supabase } from '../services/supabaseClient';
import { Lock, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const ResetPasswordView: React.FC<Props> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputCls =
    'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(onComplete, 2000);
      }
    } catch {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-8 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-[#FFD300]/20">
          <Check size={32} className="text-[#FFD300]" />
        </div>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-3">
          Senha redefinida!
        </h1>
        <p className="text-zinc-500 text-sm">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <Lock size={24} className="text-[#FFD300]" />
          </div>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl text-white mb-2">
            Nova Senha
          </h1>
          <p className="text-zinc-500 text-xs text-center">Defina sua nova senha para acessar o VANTA.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nova senha"
              className={inputCls}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <input
            type={showPass ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirmar nova senha"
            className={inputCls}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-4 bg-[#FFD300] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-40"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};
