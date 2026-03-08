import React, { useState } from 'react';
import { X, Crown, AlertTriangle, Check, UserPlus } from 'lucide-react';
import { LoteMaisVanta } from '../../../types';
import { maisVantaConfigService } from '../../../features/admin/services/maisVantaConfigService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lote: LoteMaisVanta;
  eventoNome: string;
  venueName: string;
  venueInstagram?: string;
  onConfirmar: (comAcompanhante: boolean) => void;
}

export const MaisVantaReservaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lote,
  eventoNome,
  venueName,
  venueInstagram,
  onConfirmar,
}) => {
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [comAcompanhante, setComAcompanhante] = useState(false);
  const [qtdAcomp, setQtdAcomp] = useState(1);

  if (!isOpen) return null;

  const vagasRestantes = lote.quantidade - lote.reservados;
  const maxAcomp = lote.acompanhantes || (lote.comAcompanhante ? 1 : 0);

  const handleConfirmar = () => {
    if (!aceiteTermos) return;
    onConfirmar(comAcompanhante);
    setAceiteTermos(false);
    setComAcompanhante(false);
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

        {/* Título */}
        <div className="flex items-center gap-2 mb-4">
          <Crown size={16} className="text-[#FFD300]" />
          <p className="text-white font-black text-sm uppercase tracking-wider">Reservar Experiência</p>
        </div>

        {/* Info do lote — sem mencionar tier */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-4 space-y-2">
          <p className="text-white text-sm font-bold">{eventoNome}</p>
          {lote.descricao && <p className="text-zinc-400 text-xs">{lote.descricao}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-zinc-400 text-[10px]">
              {vagasRestantes} vaga{vagasRestantes !== 1 ? 's' : ''} restante{vagasRestantes !== 1 ? 's' : ''}
            </span>
            {lote.tipoAcesso && lote.tipoAcesso !== 'Pista' && (
              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#FFD300]/15 text-[#FFD300]">
                {lote.tipoAcesso}
              </span>
            )}
            {maxAcomp > 0 && (
              <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
                <UserPlus size={9} /> +{maxAcomp} acompanhante{maxAcomp !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Acompanhante(s) */}
        {maxAcomp > 0 && (
          <div className="mb-4 space-y-2">
            <button
              onClick={() => setComAcompanhante(p => !p)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                comAcompanhante ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-zinc-900/50 border-white/5'
              }`}
            >
              <UserPlus size={14} className={comAcompanhante ? 'text-[#FFD300]' : 'text-zinc-400'} />
              <span className={`text-xs font-bold ${comAcompanhante ? 'text-white' : 'text-zinc-400'}`}>
                Levar acompanhante{maxAcomp > 1 ? 's' : ''}
              </span>
              <div
                className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  comAcompanhante ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
                }`}
              >
                {comAcompanhante && <Check size={10} className="text-black" strokeWidth={3} />}
              </div>
            </button>
            {comAcompanhante && maxAcomp > 1 && (
              <div className="flex items-center gap-3 px-3">
                <span className="text-zinc-400 text-[10px]">Quantidade:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxAcomp }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setQtdAcomp(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                        qtdAcomp === n
                          ? 'bg-[#FFD300] border-[#FFD300] text-black'
                          : 'bg-zinc-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contrapartida CONAR */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-wider">Contrapartida Obrigatória</p>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
            Ao reservar, você se compromete a publicar conteúdo sobre o evento (Story/Post/Reels) com as seguintes
            obrigações:
          </p>
          <ul className="space-y-1.5 text-zinc-400 text-[10px]">
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Incluir{' '}
                {maisVantaConfigService.getConfig().hashtagsObrigatorias.map((h, i) => (
                  <>
                    <strong key={i} className="text-white">
                      {h}
                    </strong>
                    {i < maisVantaConfigService.getConfig().hashtagsObrigatorias.length - 1 ? ' ou ' : ''}
                  </>
                ))}{' '}
                (obrigatório — Art. 36 do CDC / CONAR)
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Marcar <strong className="text-white">{venueInstagram ? `@${venueInstagram}` : venueName}</strong>
                {maisVantaConfigService.getConfig().mencoesObrigatorias.map((m, i) => (
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
                Publicar{' '}
                <strong className="text-white">
                  antes, durante ou até {maisVantaConfigService.getConfig().prazoPostHoras}h após
                </strong>{' '}
                o encerramento do evento
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#FFD300] shrink-0">•</span>
              <span>
                Posts sem hashtag de publicidade <strong className="text-red-400">não serão validados</strong>
              </span>
            </li>
          </ul>
        </div>

        {/* Aceite */}
        <button onClick={() => setAceiteTermos(p => !p)} className="w-full flex items-center gap-3 p-3 mb-5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              aceiteTermos ? 'border-[#FFD300] bg-[#FFD300]' : 'border-zinc-600'
            }`}
          >
            {aceiteTermos && <Check size={10} className="text-black" strokeWidth={3} />}
          </div>
          <span className="text-zinc-400 text-[10px] text-left">
            Li e aceito as condições de contrapartida e publicidade
          </span>
        </button>

        {/* Confirmar */}
        <button
          onClick={handleConfirmar}
          disabled={!aceiteTermos}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
        >
          Confirmar Reserva
        </button>
      </div>
    </div>
  );
};
