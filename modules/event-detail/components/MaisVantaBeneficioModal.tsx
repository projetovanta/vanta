import React, { useState } from 'react';
import { X, Crown, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import type { BeneficioMV } from '../../../features/admin/services/clube/clubeLotesService';
import { maisVantaConfigService } from '../../../features/admin/services/maisVantaConfigService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  beneficio: BeneficioMV;
  beneficioLabel: string;
  descontoPercentual: number | null;
  eventoNome: string;
  venueName: string;
  venueInstagram?: string;
  onConfirmar: () => void;
}

export const MaisVantaBeneficioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  beneficioLabel,
  descontoPercentual,
  eventoNome,
  venueName,
  venueInstagram,
  onConfirmar,
}) => {
  const [aceiteTermos, setAceiteTermos] = useState(false);

  if (!isOpen) return null;

  const config = maisVantaConfigService.getConfig();

  const handleConfirmar = () => {
    if (!aceiteTermos) return;
    onConfirmar();
    setAceiteTermos(false);
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end" role="presentation" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full bg-[#111111] border-t border-[#FFD300]/20 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 active:text-white transition-colors"
        >
          <X size={16} />
        </button>
        <div className="w-10 h-1 bg-[#FFD300]/30 rounded-full mx-auto mb-5" />

        {/* Titulo */}
        <div className="flex items-center gap-2 mb-4">
          <Crown size={16} className="text-[#FFD300]" />
          <p className="text-white font-black text-sm uppercase tracking-wider">Resgatar Benefício</p>
        </div>

        {/* Info do beneficio — sem mencionar tier */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-4 space-y-2">
          <p className="text-white text-sm font-bold">{eventoNome}</p>
          <p className="text-zinc-300 text-xs">{beneficioLabel}</p>
          {descontoPercentual && (
            <span className="inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#FFD300]/15 text-[#FFD300]">
              {descontoPercentual}% de desconto
            </span>
          )}
        </div>

        {/* Contrapartida CONAR */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-wider">Contrapartida Obrigatória</p>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
            Ao resgatar, você se compromete a comparecer ao evento e publicar conteúdo (Story/Post/Reels):
          </p>
          <ul className="space-y-1.5 text-zinc-400 text-[10px]">
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Incluir{' '}
                {config.hashtagsObrigatorias.map((h, i) => (
                  <React.Fragment key={i}>
                    <strong className="text-white">{h}</strong>
                    {i < config.hashtagsObrigatorias.length - 1 ? ' ou ' : ''}
                  </React.Fragment>
                ))}{' '}
                (obrigatório — Art. 36 do CDC / CONAR)
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Marcar <strong className="text-white">{venueInstagram ? `@${venueInstagram}` : venueName}</strong>
                {config.mencoesObrigatorias.map((m, i) => (
                  <span key={i}>
                    {' '}
                    e <strong className="text-white">{m}</strong>
                  </span>
                ))}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Publicar <strong className="text-white">antes, durante ou até {config.prazoPostHoras}h após</strong> o
                encerramento do evento
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                <strong className="text-red-400">No-show ou não postou = infração</strong> (bloqueio progressivo)
              </span>
            </li>
          </ul>
        </div>

        {/* Link para termos */}
        <button
          onClick={() => window.open('/termos-mais-vanta', '_blank')}
          className="flex items-center gap-1.5 mb-4 text-zinc-400 text-[10px] active:text-[#FFD300] transition-colors"
        >
          <ExternalLink size={10} /> Ver termos completos do MAIS VANTA
        </button>

        {/* Aceite explicito */}
        <button onClick={() => setAceiteTermos(p => !p)} className="w-full flex items-center gap-3 p-3 mb-5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              aceiteTermos ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
            }`}
          >
            {aceiteTermos && <Check size={10} className="text-black" strokeWidth={3} />}
          </div>
          <span className="text-zinc-400 text-[10px] text-left">
            Li e aceito as condições de contrapartida, publicidade e os termos do MAIS VANTA
          </span>
        </button>

        {/* Confirmar */}
        <button
          onClick={handleConfirmar}
          disabled={!aceiteTermos}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
        >
          Confirmar Resgate
        </button>
      </div>
    </div>
  );
};
