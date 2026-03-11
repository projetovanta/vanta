import React, { useEffect, useState } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { getEventBuyers } from '../../services/insights/operationsMarketing';
import type { BuyerContact } from '../../services/insights/operationsTypes';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const BuyerCommunicationCard: React.FC<Props> = ({ eventoId }) => {
  const [buyers, setBuyers] = useState<BuyerContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getEventBuyers(eventoId).then(d => {
      if (!cancelled) {
        setBuyers(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  if (loading) return <DashboardSkeleton cards={1} chart={false} />;
  if (!buyers.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <MessageCircle className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Comunicação com Compradores</h3>
      </div>
      <div className="rounded-xl bg-zinc-900/40 border border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300">
            <span className="text-white font-semibold">{buyers.length}</span> compradores únicos
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
          {buyers.slice(0, 30).map(b => (
            <div key={b.userId} className="flex items-center gap-2 py-1">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 shrink-0">
                {b.nome?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="text-xs text-zinc-300 truncate">{b.nome}</span>
            </div>
          ))}
          {buyers.length > 30 && <p className="text-xs text-zinc-500 pt-1">+{buyers.length - 30} compradores</p>}
        </div>
      </div>
    </div>
  );
};

export default BuyerCommunicationCard;
