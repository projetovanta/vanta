/**
 * PushPermissionModal — Modal fullscreen pedindo permissão de notificações.
 * Aparece após login quando Notification.permission === 'default' (idle).
 * O clique do usuário no botão é o "gesto" que o browser exige para requestPermission().
 *
 * Safari iOS: Push API só funciona em PWA standalone (adicionado à tela inicial).
 * Se não está standalone e é iOS, mostra dica "Adicione à tela inicial".
 */
import React, { useState } from 'react';
import { Bell, BellRing, X, Share, PlusSquare } from 'lucide-react';
import type { NotifPermission } from '../hooks/usePWA';

interface Props {
  permission: NotifPermission;
  isInstalled: boolean;
  onRequestPermission: () => Promise<NotifPermission>;
  onRegisterFcm: () => Promise<void>;
}

const isIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const DISMISSED_KEY = 'vanta_push_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const wasDismissedRecently = (): boolean => {
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < DISMISS_DURATION_MS;
};

export const PushPermissionBanner: React.FC<Props> = ({
  permission,
  isInstalled,
  onRequestPermission,
  onRegisterFcm,
}) => {
  const [dismissed, setDismissed] = useState(() => wasDismissedRecently());
  const [loading, setLoading] = useState(false);

  if (permission !== 'idle' || dismissed) return null;

  const iosNonStandalone = isIOS() && !isInstalled;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setDismissed(true);
  };

  const handleAllow = async () => {
    setLoading(true);
    const result = await onRequestPermission();
    if (result === 'granted') {
      await onRegisterFcm();
    }
    setLoading(false);
    dismiss();
  };

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[85%] max-w-sm bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Ilustração topo */}
        <div className="relative h-44 bg-gradient-to-b from-[#FFD300]/10 to-transparent flex items-center justify-center overflow-hidden">
          {/* Círculos decorativos */}
          <div className="absolute w-32 h-32 rounded-full bg-[#FFD300]/5 -top-4 -right-4" />
          <div className="absolute w-20 h-20 rounded-full bg-[#FFD300]/5 bottom-2 -left-3" />
          {/* Ícone principal */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-[#FFD300]/15 border border-[#FFD300]/25 flex items-center justify-center">
              <BellRing size={36} className="text-[#FFD300]" />
            </div>
            {/* Dot de notificação */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD300] rounded-full flex items-center justify-center">
              <span className="text-black text-[9px] font-black">1</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-7 pb-7 -mt-2">
          {iosNonStandalone ? (
            <>
              <h2 className="text-white text-lg font-bold text-center leading-tight">Adicione à tela inicial</h2>
              <p className="text-zinc-400 text-xs text-center mt-2.5 leading-relaxed">
                Para receber notificações, adicione o VANTA à sua tela inicial.
              </p>
              <div className="mt-5 bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Share size={14} className="text-zinc-400" />
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-snug">
                    Toque no botão <span className="text-white font-bold">Compartilhar</span> do Safari
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <PlusSquare size={14} className="text-zinc-400" />
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-snug">
                    Selecione <span className="text-white font-bold">Adicionar à Tela de Início</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="w-full mt-5 py-4 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
              >
                Entendi
              </button>
            </>
          ) : (
            <>
              <h2 className="text-white text-lg font-bold text-center leading-tight">Não perca nada</h2>
              <p className="text-zinc-400 text-xs text-center mt-2.5 leading-relaxed max-w-[240px] mx-auto">
                Ative as notificações para saber em primeira mão sobre eventos, ingressos e novidades.
              </p>

              {/* Benefícios */}
              <div className="mt-5 space-y-2.5">
                {[
                  { emoji: '🎫', text: 'Ingressos e transferências' },
                  { emoji: '🎉', text: 'Novos eventos na sua cidade' },
                  { emoji: '👥', text: 'Solicitações de amizade' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 px-1">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-zinc-400 text-[11px]">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Botões */}
              <button
                onClick={handleAllow}
                disabled={loading}
                className="w-full mt-6 py-4 rounded-xl bg-[#FFD300] text-black text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Bell size={14} className="animate-pulse" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Ativar notificações
                  </>
                )}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="w-full mt-2 py-3 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.15em] active:text-zinc-400 transition-all"
              >
                Agora não
              </button>
            </>
          )}
        </div>

        {/* Botão fechar */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-all"
        >
          <X size={14} className="text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
