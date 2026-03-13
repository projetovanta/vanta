import React, { useRef, useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import ChannelAttributionCard from '../../components/insights/ChannelAttributionCard';
import BuyerCommunicationCard from '../../components/insights/BuyerCommunicationCard';
import LoyaltyProgramCard from '../../components/insights/LoyaltyProgramCard';
import PurchaseTimeCard from '../../components/insights/PurchaseTimeCard';
import InsightsEmptyState from '../../components/insights/InsightsEmptyState';

interface Props {
  comunidadeId: string;
  eventoId?: string;
}

const OperacoesTab: React.FC<Props> = ({ comunidadeId, eventoId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    setEmpty(false);
    const timer = setTimeout(() => {
      if (ref.current && ref.current.childElementCount === 0) {
        setEmpty(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [comunidadeId, eventoId]);

  return (
    <>
      <div ref={ref} className="space-y-6">
        <LoyaltyProgramCard comunidadeId={comunidadeId} />
        <PurchaseTimeCard comunidadeId={comunidadeId} />
        {eventoId && <ChannelAttributionCard eventoId={eventoId} />}
        {eventoId && <BuyerCommunicationCard eventoId={eventoId} />}
      </div>
      {empty && (
        <InsightsEmptyState
          icon={Users}
          message="Com vendas reais, você verá fidelidade de clientes, canais de aquisição e horários de compra."
        />
      )}
    </>
  );
};

export default OperacoesTab;
