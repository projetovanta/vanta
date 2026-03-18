import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';

interface VantaConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmação com identidade visual VANTA.
 * Substitui confirm() e alert() nativos do browser.
 */
export const VantaConfirmModal: React.FC<VantaConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}) => (
  <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/85">
    <div
      className="w-full bg-zinc-950 border border-white/10 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
    >
      <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />

      {variant === 'danger' && (
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size="1.25rem" className="text-red-400" />
        </div>
      )}

      <h3 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-2 text-center">
        {title}
      </h3>
      <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">{message}</p>

      <div className="space-y-2">
        <button
          onClick={onConfirm}
          className={`w-full py-4 font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all ${
            variant === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#FFD300] text-black'
          }`}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all border border-white/5"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  </div>
);

/**
 * Modal de alerta (só OK, sem cancelar). Substitui alert() nativo.
 */
export const VantaAlertModal: React.FC<{
  title: string;
  message: string;
  onClose: () => void;
}> = ({ title, message, onClose }) => (
  <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/85">
    <div
      className="w-full bg-zinc-950 border border-white/10 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
    >
      <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
      <h3 style={TYPOGRAPHY.screenTitle} className="text-lg text-white mb-2 text-center">
        {title}
      </h3>
      <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">{message}</p>
      <button
        onClick={onClose}
        className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
      >
        Entendi
      </button>
    </div>
  </div>
);
