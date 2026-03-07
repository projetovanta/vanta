import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface ToastData {
  id: number;
  tipo: ToastType;
  msg: string;
}

const ICON: Record<ToastType, React.ReactNode> = {
  sucesso: <Check size={14} strokeWidth={3} />,
  erro: <X size={14} strokeWidth={3} />,
  aviso: <AlertTriangle size={14} strokeWidth={2.5} />,
  info: <Info size={14} strokeWidth={2.5} />,
};

const STYLE: Record<ToastType, { bg: string; border: string; icon: string }> = {
  sucesso: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400' },
  erro: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
  aviso: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
};

/* ── Toast individual ─────────────────────────────────────────────── */
const ToastItem: React.FC<{ t: ToastData; onDismiss: (id: number) => void }> = ({ t, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(t.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);
  const s = STYLE[t.tipo];
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 ${s.bg} ${s.border} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
      onClick={() => {
        setVisible(false);
        setTimeout(() => onDismiss(t.id), 300);
      }}
    >
      <span className={s.icon}>{ICON[t.tipo]}</span>
      <span className="text-white text-xs font-medium leading-snug flex-1">{t.msg}</span>
    </div>
  );
};

/* ── Container global ─────────────────────────────────────────────── */
export const ToastContainer: React.FC<{ toasts: ToastData[]; onDismiss: (id: number) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-[600] flex flex-col items-center gap-2 pt-3 px-5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItem t={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

/* ── Hook ─────────────────────────────────────────────────────────── */
let _nextId = 1;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const ref = useRef({ toasts, dismiss });
  ref.current = { toasts, dismiss };

  const toast = useCallback((tipo: ToastType, msg: string) => {
    const id = _nextId++;
    setToasts(prev => [...prev.slice(-4), { id, tipo, msg }]);
  }, []);

  return {
    toasts,
    dismiss,
    toast,
    Toast: () => <ToastContainer toasts={ref.current.toasts} onDismiss={ref.current.dismiss} />,
  };
}
