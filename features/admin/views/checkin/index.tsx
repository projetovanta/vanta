import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { eventosAdminService } from '../../services/eventosAdminService';
import { EventCheckInView } from './EventCheckInView';
import { EventoCheckInCard } from './EventoCheckInCard';

export const CheckInView: React.FC<{ onBack: () => void; comunidadeId?: string; modoFixo?: 'LISTA' | 'QR' }> = ({
  onBack,
  comunidadeId,
  modoFixo,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [svcVersion, setSvcVersion] = useState(() => eventosAdminService.getVersion());

  useEffect(() => {
    const id = setInterval(() => setSvcVersion(eventosAdminService.getVersion()), 2_000);
    return () => clearInterval(id);
  }, []);

  const eventos = useMemo(() => {
    const all = eventosAdminService.getEventos();
    return comunidadeId ? all.filter(e => e.comunidadeId === comunidadeId) : all;
     
  }, [comunidadeId]);

  const eventoSelecionado = selectedId ? eventos.find(e => e.id === selectedId) : null;

  if (selectedId && eventoSelecionado) {
    return (
      <EventCheckInView
        eventoId={selectedId}
        eventoNome={eventoSelecionado.nome}
        onBack={() => setSelectedId(null)}
        modoFixo={modoFixo}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 flex justify-between items-start shrink-0">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Portaria
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            {modoFixo === 'QR' ? 'Scanner QR' : modoFixo === 'LISTA' ? 'Check-in Lista' : 'Check-in'}
          </h1>
        </div>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all mt-1 shrink-0"
        >
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 max-w-3xl mx-auto w-full">
        {eventos.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <QrCode size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
              Nenhum evento disponível
            </p>
          </div>
        )}

        {eventos.map(ev => (
          <EventoCheckInCard key={ev.id} ev={ev} svcVersion={svcVersion} onSelect={setSelectedId} modoFixo={modoFixo} />
        ))}
      </div>
    </div>
  );
};
