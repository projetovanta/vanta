import React, { useState, useEffect } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';
import { useAuthStore } from '../stores/authStore';

/**
 * SessionExpiredModal — exibido quando a sessão expira involuntariamente.
 * Escuta o evento `vanta:session-expired` disparado pelo authService.
 * Mostra aviso e botão para re-login (abre AuthModal via navigateToTab).
 */
export const SessionExpiredModal: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [visible, setVisible] = useState(false);
  const currentAccountId = useAuthStore(s => s.currentAccount.id);

  useEffect(() => {
    const handler = () => {
      // Só mostra se o user estava logado (id não vazio = tinha sessão)
      if (currentAccountId) {
        setVisible(true);
      }
    };
    window.addEventListener('vanta:session-expired', handler);
    return () => window.removeEventListener('vanta:session-expired', handler);
  }, [currentAccountId]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90%] max-w-xs bg-[#111111] border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <AlertTriangle size={24} className="text-amber-400" />
        </div>
        <div className="text-center">
          <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic text-white mb-1">
            Sessão expirada
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Sua sessão expirou por inatividade. Faça login novamente para continuar.
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onLogin();
          }}
          className="w-full py-3 bg-[#FFD300] text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <LogIn size={14} strokeWidth={2.5} />
          Entrar novamente
        </button>
      </div>
    </div>
  );
};
