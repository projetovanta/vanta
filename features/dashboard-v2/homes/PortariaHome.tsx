/**
 * PortariaHome — "Valide entradas. Rápido e seguro."
 * Scanner QR ou check-in lista direto na home. Zero distração.
 */

import React from 'react';
import { QrCode, ListChecks, Users, Search } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import type { ContaVantaLegacy } from '../../../types';

interface Props {
  adminNome: string;
  adminRole: ContaVantaLegacy;
  onNavigate: (v: string) => void;
}

export const PortariaHome: React.FC<Props> = ({ adminNome, adminRole, onNavigate }) => {
  const isQR = adminRole === 'vanta_ger_portaria_antecipado' || adminRole === 'vanta_portaria_antecipado';
  const isLista = adminRole === 'vanta_ger_portaria_lista' || adminRole === 'vanta_portaria_lista';

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-5 gap-6">
        {/* Saudação compacta */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
            <p className="text-[#22d3ee]/60 text-[0.5625rem] font-black uppercase tracking-[0.25em]">Portaria</p>
          </div>
          <p className="text-zinc-500 text-[0.625rem] font-black uppercase tracking-widest">Valide entradas</p>
        </div>
        {/* Botão principal — abre scanner ou lista */}
        <button
          onClick={() => onNavigate(isQR ? 'PORTARIA_QR' : 'PORTARIA_LISTA')}
          className="w-full max-w-xs aspect-square bg-[#22d3ee]/10 border-2 border-[#22d3ee]/30 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95 transition-all"
        >
          {isQR ? (
            <>
              <QrCode size="3rem" className="text-[#22d3ee]" />
              <div className="text-center">
                <p className="text-white font-black text-lg">SCAN QR</p>
                <p className="text-zinc-400 text-xs mt-1">Toque pra abrir a câmera</p>
              </div>
            </>
          ) : (
            <>
              <ListChecks size="3rem" className="text-[#22d3ee]" />
              <div className="text-center">
                <p className="text-white font-black text-lg">CHECK-IN LISTA</p>
                <p className="text-zinc-400 text-xs mt-1">Toque pra abrir a lista</p>
              </div>
            </>
          )}
        </button>

        {/* Ação secundária */}
        {isQR && (
          <button
            onClick={() => onNavigate('PORTARIA_LISTA')}
            className="flex items-center gap-2 text-zinc-400 active:text-white transition-colors py-3 px-6"
          >
            <Search size="1rem" />
            <span className="text-xs font-bold">Buscar por nome</span>
          </button>
        )}
        {isLista && (
          <button
            onClick={() => onNavigate('PORTARIA_QR')}
            className="flex items-center gap-2 text-zinc-400 active:text-white transition-colors py-3 px-6"
          >
            <QrCode size="1rem" />
            <span className="text-xs font-bold">Escanear QR</span>
          </button>
        )}
      </div>
    </div>
  );
};
