import React from 'react';
import ChannelAttributionCard from '../../components/insights/ChannelAttributionCard';
import BuyerCommunicationCard from '../../components/insights/BuyerCommunicationCard';
import LoyaltyProgramCard from '../../components/insights/LoyaltyProgramCard';
import PurchaseTimeCard from '../../components/insights/PurchaseTimeCard';

interface Props {
  comunidadeId: string;
  eventoId?: string;
}

const OperacoesTab: React.FC<Props> = ({ comunidadeId, eventoId }) => (
  <div className="space-y-6">
    <LoyaltyProgramCard comunidadeId={comunidadeId} />
    <PurchaseTimeCard comunidadeId={comunidadeId} />
    {eventoId && <ChannelAttributionCard eventoId={eventoId} />}
    {eventoId && <BuyerCommunicationCard eventoId={eventoId} />}
  </div>
);

export default OperacoesTab;
