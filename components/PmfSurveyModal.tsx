import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { submitPmfResponse } from '../services/analyticsService';
import { useModalBack } from '../hooks/useModalStack';

const OPTIONS = [
  { label: 'Muito decepcionado', value: 'MUITO_DECEPCIONADO', color: '#ef4444' },
  { label: 'Um pouco decepcionado', value: 'POUCO_DECEPCIONADO', color: '#f59e0b' },
  { label: 'Não faria diferença', value: 'INDIFERENTE', color: '#6b7280' },
] as const;

export const PmfSurveyModal: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  useModalBack(true, onClose, 'pmf-survey');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSelect = async (value: string) => {
    setSubmitting(true);
    setError(false);
    try {
      const ok = await submitPmfResponse(userId, value);
      if (!ok) {
        setError(true);
        setSubmitting(false);
        return;
      }
      onClose();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm relative">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-zinc-400 hover-real:text-white transition-colors"
        >
          <X size="1.125rem" />
        </button>
        <h2 className="text-white text-sm font-bold mb-1">Uma pergunta rápida</h2>
        <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
          Se o VANTA deixasse de existir amanhã, como você se sentiria?
        </p>
        {error && <p className="text-red-400 text-[0.625rem] mb-3">Erro ao enviar. Tente novamente.</p>}
        <div className="flex flex-col gap-3">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              disabled={submitting}
              onClick={() => handleSelect(opt.value)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border border-white/5 hover-real:border-white/20 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ color: opt.color }}
            >
              {submitting && <Loader2 size="0.75rem" className="animate-spin" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
