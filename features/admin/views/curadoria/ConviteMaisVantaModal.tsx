import React, { useState } from 'react';
import { Crown, Loader2, Check, X } from 'lucide-react';
import { Membro, TierMaisVanta } from '../../../../types';
import { clubeService } from '../../services/clubeService';

export const ConviteMaisVantaModal: React.FC<{
  membro: Membro;
  adminId: string;
  onClose: () => void;
  onSuccess: () => void;
  toastFn: (tipo: 'sucesso' | 'erro', msg: string) => void;
}> = ({ membro, adminId, onClose, onSuccess, toastFn }) => {
  const tiers = clubeService.getTiers();
  const [tier, setTier] = useState<TierMaisVanta>((tiers[0]?.id as TierMaisVanta) ?? ('BRONZE' as TierMaisVanta));
  const [sending, setSending] = useState(false);

  const handleConfirm = async () => {
    setSending(true);
    try {
      await clubeService.convidarParaMaisVanta(adminId, membro.id, tier);
      toastFn('sucesso', 'Convite enviado!');
      onSuccess();
      onClose();
    } catch {
      toastFn('erro', 'Erro ao enviar convite');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="px-6 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl flex items-center justify-center shrink-0">
              <Crown size={16} className="text-[#FFD300]" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-none truncate">Convidar MAIS VANTA</p>
              <p className="text-zinc-600 text-[10px] mt-0.5 truncate">{membro.nome}</p>
            </div>
            <button onClick={onClose} className="ml-auto p-1.5 text-zinc-600 active:text-white shrink-0">
              <X size={14} />
            </button>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-zinc-900/60 border border-white/5 rounded-2xl">
            <img
              loading="lazy"
              src={membro.foto}
              alt={membro.nome}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{membro.nome}</p>
              <p className="text-zinc-500 text-[10px] truncate">{membro.email}</p>
              {membro.instagram && (
                <p className="text-zinc-600 text-[10px] truncate">@{membro.instagram.replace('@', '')}</p>
              )}
            </div>
          </div>

          {/* Seleção de tier */}
          <div className="mb-5">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-2">Tier</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map(t => {
                const isActive = tier === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id as TierMaisVanta)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                      isActive
                        ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                        : 'bg-zinc-900 border-white/5 text-zinc-500'
                    }`}
                  >
                    {t.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <p className="text-zinc-600 text-[10px] leading-relaxed mb-5">
            O membro receberá uma notificação e poderá aceitar o convite diretamente, sem passar pela fila de curadoria.
          </p>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleConfirm()}
              disabled={sending}
              className="flex-1 py-4 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Check size={14} /> Convidar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
