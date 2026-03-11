import React, { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { getChannelAttribution } from '../../services/insights/operationsMarketing';
import type { ChannelAttribution } from '../../services/insights/operationsTypes';
import BreakdownCard from '../dashboard/BreakdownCard';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  eventoId: string;
}

const CANAL_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  FLYER_QR: '#3b82f6',
  PROMOTER: '#22c55e',
  ORGANICO: '#FFD300',
  WHATSAPP: '#25D366',
  LINK_DIRETO: '#a855f7',
};

const ChannelAttributionCard: React.FC<Props> = ({ eventoId }) => {
  const [data, setData] = useState<ChannelAttribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getChannelAttribution(eventoId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!data?.canais.length) return null;

  const items = data.canais.map(c => ({
    label: c.label,
    value: c.vendas,
    color: CANAL_COLORS[c.canal] ?? '#FFD300',
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Share2 className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">De onde vêm as vendas</h3>
      </div>
      <BreakdownCard title="Canais de Venda" items={items} formatValue={v => `${v} vendas`} />
    </div>
  );
};

export default ChannelAttributionCard;
