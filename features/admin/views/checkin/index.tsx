import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { AdminViewHeader } from '../../components/AdminViewHeader';
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
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <AdminViewHeader
        title={modoFixo === 'QR' ? 'Scanner QR' : modoFixo === 'LISTA' ? 'Check-in Lista' : 'Check-in'}
        kicker="Portaria"
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 max-w-3xl mx-auto w-full">
        {eventos.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <QrCode size="1.75rem" className="text-zinc-700" />
            </div>
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center">
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
