import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SplitForm, SocioConviteForm } from './types';
import { labelCls } from './constants';

interface Props {
  split: SplitForm;
  setSplit: React.Dispatch<React.SetStateAction<SplitForm>>;
  socio: SocioConviteForm | null;
}

export const Step5Financeiro: React.FC<Props> = ({ split, setSplit, socio }) => {
  const pSocio = parseInt(split.percentSocio) || 0;
  const pProdutor = parseInt(split.percentProdutor) || 0;
  const soma = pSocio + pProdutor;
  const somaValida = soma === 100;

  const handleSlider = (val: number) => {
    setSplit({ percentSocio: String(val), percentProdutor: String(100 - val) });
  };

  const handleSocioChange = (v: string) => {
    const n = parseInt(v) || 0;
    const clamped = Math.max(0, Math.min(100, n));
    setSplit({ percentSocio: String(clamped), percentProdutor: String(100 - clamped) });
  };

  const handleProdutorChange = (v: string) => {
    const n = parseInt(v) || 0;
    const clamped = Math.max(0, Math.min(100, n));
    setSplit({ percentProdutor: String(clamped), percentSocio: String(100 - clamped) });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-1">Split Financeiro</p>
        <p className="text-zinc-400 text-[10px] leading-relaxed">
          Defina a divisão da receita líquida entre sócio e produtor. A taxa VANTA é aplicada antes do split.
        </p>
      </div>

      {/* Sócio info */}
      {socio && (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
          <img
            loading="lazy"
            src={socio.foto}
            alt={socio.nome}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-none truncate">{socio.nome}</p>
            <p className="text-zinc-400 text-[10px] mt-0.5">Sócio convidado</p>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>Sócio (%)</label>
            <div className="relative">
              <input
                value={split.percentSocio}
                onChange={e => handleSocioChange(e.target.value)}
                type="number"
                min="0"
                max="100"
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-[#FFD300]/30 text-center"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
            </div>
          </div>
          <div className="flex-1">
            <label className={labelCls}>Produtor (%)</label>
            <div className="relative">
              <input
                value={split.percentProdutor}
                onChange={e => handleProdutorChange(e.target.value)}
                type="number"
                min="0"
                max="100"
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-[#FFD300]/30 text-center"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={pSocio}
            onChange={e => handleSlider(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#FFD300]"
          />
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
            <span className="text-zinc-400">0% Sócio</span>
            <span className="text-zinc-400">100% Sócio</span>
          </div>
        </div>

        {/* Preview */}
        <div
          className={`p-4 rounded-2xl border text-center ${somaValida ? 'bg-zinc-900/40 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}
        >
          {somaValida ? (
            <p className="text-white font-bold text-sm">
              <span className="text-[#FFD300]">{pSocio}% Sócio</span>
              <span className="text-zinc-400 mx-2">·</span>
              <span className="text-emerald-400">{pProdutor}% Produtor</span>
            </p>
          ) : (
            <p className="text-red-400 font-bold text-sm">Soma deve ser 100% (atual: {soma}%)</p>
          )}
        </div>
      </div>

      {/* Aviso */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-zinc-400 text-[10px] leading-relaxed">
          Este split será enviado como <span className="text-white font-bold">proposta</span> ao sócio junto com as
          demais condições do evento. O sócio poderá aceitar ou sugerir alterações.
        </p>
      </div>
    </div>
  );
};
