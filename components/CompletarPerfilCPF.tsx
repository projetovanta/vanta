import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { inputCls } from '../constants';
import { fmtCPF, isValidCPF } from './auth/authHelpers';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { useModalBack } from '../hooks/useModalStack';
import { FieldError } from './auth/FieldError';

interface CompletarPerfilCPFProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cpf: string) => void;
}

export const CompletarPerfilCPF: React.FC<CompletarPerfilCPFProps> = ({ isOpen, onClose, onSuccess }) => {
  useModalBack(isOpen, onClose, 'cpf-modal');

  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;

    const digits = cpf.replace(/\D/g, '');
    if (!isValidCPF(digits)) {
      setError('CPF inválido');
      return;
    }

    setLoading(true);
    setError('');

    const userId = useAuthStore.getState().currentAccount.id;
    const { error: dbErr } = await supabase.from('profiles').update({ cpf: digits }).eq('id', userId);

    if (dbErr) {
      if (dbErr.code === '23505') {
        setError('Este CPF já está cadastrado');
      } else {
        setError('Erro ao salvar CPF. Tente novamente.');
      }
      setLoading(false);
      return;
    }

    useAuthStore.getState().updateProfile({ cpf: digits });
    setLoading(false);
    onSuccess(digits);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[90%] max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD300]" />
          <p className="text-[#FFD300]/60 text-[9px] font-black uppercase tracking-[0.25em]">Dados para compra</p>
        </div>
        <h2 className="text-white text-lg font-bold mb-1">Informe seu CPF</h2>
        <p className="text-zinc-400 text-xs mb-5">
          Precisamos do CPF para emitir seu ingresso. Esse dado é salvo com segurança e não será compartilhado.
        </p>

        <div className="mb-4">
          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">CPF</p>
          <input
            value={cpf}
            onChange={e => setCpf(fmtCPF(e.target.value))}
            placeholder="000.000.000-00"
            className={`${inputCls} ${error ? 'border-red-500/40' : ''}`}
            inputMode="numeric"
            maxLength={14}
            autoFocus
          />
          <FieldError msg={error} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-xl active:scale-95 transition-all"
          >
            Voltar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-[#FFD300] text-black text-xs font-bold uppercase tracking-widest rounded-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Salvando…</span>
            ) : (
              <>
                <Check size={14} /> Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
