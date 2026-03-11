import React, { useState } from 'react';
import { waitlistService } from '../../services/waitlistService';
import { useModalBack } from '../../hooks/useModalStack';

interface Props {
  eventoId: string;
  variacaoId: string;
  onClose: () => void;
  onSuccess: (variacaoId: string) => void;
}

export const WaitlistModal: React.FC<Props> = ({ eventoId, variacaoId, onClose, onSuccess }) => {
  useModalBack(true, onClose, 'waitlist');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEntrar = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const ok = await waitlistService.entrar(eventoId, variacaoId, email.trim());
    setLoading(false);
    if (ok) {
      onSuccess(variacaoId);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
        <div>
          <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">Lista de Espera</p>
          <p className="text-white font-bold text-lg mt-0.5">Entrar na fila</p>
          <p className="text-zinc-400 text-xs mt-1">Você será notificado quando uma vaga abrir.</p>
        </div>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/30 placeholder-zinc-700"
        />
        <button
          onClick={handleEntrar}
          disabled={loading || !email.trim()}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-black active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Entrar na fila'}
        </button>
      </div>
    </div>
  );
};
