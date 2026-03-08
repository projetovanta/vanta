import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface Props {
  eventoNome: string;
  reembolsoMotivo: string;
  setReembolsoMotivo: (v: string) => void;
  onClose: () => void;
  onSolicitar: () => void;
  loading: boolean;
}

export const ModalReembolsoManual: React.FC<Props> = ({
  eventoNome,
  reembolsoMotivo,
  setReembolsoMotivo,
  onClose,
  onSolicitar,
  loading,
}) => (
  <div
    className="absolute inset-0 z-50 flex items-end bg-black/85 backdrop-blur-md"
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
        <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">Solicitar Reembolso Manual</p>
        <p className="text-white font-bold text-base mt-0.5 truncate">{eventoNome}</p>
        <p className="text-zinc-400 text-[9px] mt-2">
          Use esta opção para solicitar reembolso fora da janela legal (7 dias + 48h).
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Motivo do Reembolso</p>
        <textarea
          value={reembolsoMotivo}
          onChange={e => setReembolsoMotivo(e.target.value)}
          placeholder="Descreva o motivo da solicitação..."
          className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/30 placeholder-zinc-700 resize-none"
          rows={4}
          autoFocus
        />
        {!reembolsoMotivo.trim() && (
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest">Descreva o motivo</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
        >
          <X size={16} className="text-zinc-400" />
        </button>
        <button
          onClick={onSolicitar}
          disabled={!reembolsoMotivo.trim() || loading}
          className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', color: '#fff' }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Check size={14} /> Solicitar
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
