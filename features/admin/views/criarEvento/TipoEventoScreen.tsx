import React, { useState } from 'react';
import { Users, Building2, Ticket, ListChecks, ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import type { TipoFluxoEvento } from './types';

interface Props {
  onSelect: (tipo: TipoFluxoEvento, vendaVanta: boolean) => void;
}

export const TipoEventoScreen: React.FC<Props> = ({ onSelect }) => {
  const [vendaVanta, setVendaVanta] = useState<boolean | null>(null);

  // Tela 1: COM VENDA / SEM VENDA
  if (vendaVanta === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center mb-4">
          <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Novo Evento</p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl italic">
            Tipo de Venda
          </h1>
          <p className="text-zinc-400 text-xs mt-2 leading-relaxed">Como os ingressos deste evento serão vendidos?</p>
        </div>

        <button
          onClick={() => setVendaVanta(true)}
          className="w-full p-5 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-[#FFD300]/30 active:bg-[#FFD300]/5 transition-all text-left space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
              <Ticket size="1.25rem" className="text-[#FFD300]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-none">Com Venda no VANTA</p>
              <p className="text-zinc-400 text-[0.625rem] mt-1 leading-relaxed">
                Ingressos vendidos pela plataforma. Checkout, lotes, variações e financeiro integrados.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 ml-14">
            {['Checkout integrado', 'Lotes e variações', 'Financeiro'].map(t => (
              <span
                key={t}
                className="text-[0.4375rem] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </button>

        <button
          onClick={() => setVendaVanta(false)}
          className="w-full p-5 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-[#FFD300]/30 active:bg-[#FFD300]/5 transition-all text-left space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
              <ListChecks size="1.25rem" className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-none">Sem Venda no VANTA</p>
              <p className="text-zinc-400 text-[0.625rem] mt-1 leading-relaxed">
                Venda de ingressos em outra plataforma. Evento no feed, listas e check-in pelo VANTA.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 ml-14">
            {['Feed e visibilidade', 'Listas e check-in', 'Venda externa'].map(t => (
              <span
                key={t}
                className="text-[0.4375rem] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </button>
      </div>
    );
  }

  // Tela 2: COM SÓCIO / FESTA DA CASA
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div className="text-center mb-4">
        <button
          onClick={() => setVendaVanta(null)}
          className="flex items-center gap-1 text-zinc-400 text-xs mb-4 mx-auto active:text-white transition-colors"
        >
          <ArrowLeft size="0.875rem" />
          <span>Voltar</span>
        </button>
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
          {vendaVanta ? 'Com Venda no VANTA' : 'Sem Venda no VANTA'}
        </p>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-2xl italic">
          Tipo de Produção
        </h1>
        <p className="text-zinc-400 text-xs mt-2 leading-relaxed">Como este evento será produzido?</p>
      </div>

      <button
        onClick={() => onSelect('COM_SOCIO', vendaVanta)}
        className="w-full p-5 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-[#FFD300]/30 active:bg-[#FFD300]/5 transition-all text-left space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
            <Users size="1.25rem" className="text-[#FFD300]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-none">Com Sócio</p>
            <p className="text-zinc-400 text-[0.625rem] mt-1 leading-relaxed">
              Convide um sócio para co-produzir o evento. Inclui negociação de permissões e split financeiro.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 ml-14">
          {[vendaVanta ? '5 etapas' : '4 etapas', 'Split financeiro', 'Convite ao sócio'].map(t => (
            <span
              key={t}
              className="text-[0.4375rem] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </button>

      <button
        onClick={() => onSelect('FESTA_DA_CASA', vendaVanta)}
        className="w-full p-5 bg-zinc-900/40 border border-white/5 rounded-2xl active:border-[#FFD300]/30 active:bg-[#FFD300]/5 transition-all text-left space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
            <Building2 size="1.25rem" className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-none">Festa da Casa</p>
            <p className="text-zinc-400 text-[0.625rem] mt-1 leading-relaxed">
              Evento 100% da casa. Sem sócio, sem split. {vendaVanta ? 'Gerente opcional.' : 'Simples e direto.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 ml-14">
          {[
            vendaVanta ? '4 etapas' : '2-3 etapas',
            'Ativo direto',
            vendaVanta ? 'Gerente opcional' : 'Lista + check-in',
          ].map(t => (
            <span
              key={t}
              className="text-[0.4375rem] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
};
