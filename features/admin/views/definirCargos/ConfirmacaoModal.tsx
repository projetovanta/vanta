import React from 'react';
import { Membro } from '../../../../types';
import { TYPOGRAPHY } from '../../../../constants';
import { CargoCustomState, DestinoOption } from './types';

interface ConfirmacaoModalProps {
  selectedMembro: Membro;
  selectedDestino: DestinoOption;
  usarCargoCustom: boolean;
  cargoCustom: CargoCustomState;
  labelCargo: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmacaoModal: React.FC<ConfirmacaoModalProps> = ({
  selectedMembro,
  selectedDestino,
  usarCargoCustom,
  cargoCustom,
  labelCargo,
  onConfirmar,
  onCancelar,
}) => (
  <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/85">
    <div
      className="w-full bg-zinc-950 border border-white/10 rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
    >
      <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
      <h3 style={TYPOGRAPHY.screenTitle} className="text-lg text-white italic mb-2 text-center">
        Confirmar cargo
      </h3>
      <p className="text-zinc-400 text-sm text-center leading-relaxed mb-4">
        Adicionar <span className="text-white font-bold">{selectedMembro.nome}</span> a{' '}
        <span
          className={`text-[0.625rem] font-black uppercase tracking-wider px-2 py-0.5 rounded ${selectedDestino.tipo === 'COMUNIDADE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}
        >
          {selectedDestino.tipo === 'COMUNIDADE' ? 'Local' : 'Evento'}
        </span>{' '}
        <span className="text-white font-bold">{selectedDestino.nome}</span> como{' '}
        <span className="text-[#FFD300] font-bold">{labelCargo}</span>?
      </p>

      {/* Resumo de cotas (somente cargo customizado com INSERIR_LISTA) */}
      {usarCargoCustom && cargoCustom.listas.ativo && cargoCustom.listas.cotas.length > 0 && (
        <div className="mb-5 bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-2">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Cotas de lista</p>
          {cargoCustom.listas.cotas
            .filter(c => c.limite > 0)
            .map((cota, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-zinc-300 text-xs truncate min-w-0">{cota.variacaoLabel}</p>
                <span className="ml-3 shrink-0 text-[#FFD300] text-xs font-bold">{cota.limite} vagas</span>
              </div>
            ))}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onConfirmar}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all"
        >
          Confirmar
        </button>
        <button
          onClick={onCancelar}
          className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all border border-white/5"
        >
          Agora não
        </button>
      </div>
    </div>
  </div>
);
