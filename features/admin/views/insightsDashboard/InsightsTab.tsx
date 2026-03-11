import React from 'react';
import VipScoreCard from '../../components/insights/VipScoreCard';
import ChurnRadarCard from '../../components/insights/ChurnRadarCard';
import TrendAlertCard from '../../components/insights/TrendAlertCard';
import NoShowCard from '../../components/insights/NoShowCard';
import LotacaoPrevisaoCard from '../../components/insights/LotacaoPrevisaoCard';

interface Props {
  comunidadeId: string;
  eventoId?: string;
}

const InsightsTab: React.FC<Props> = ({ comunidadeId, eventoId }) => (
  <div className="space-y-6">
    <TrendAlertCard comunidadeId={comunidadeId} />
    <VipScoreCard comunidadeId={comunidadeId} />
    <ChurnRadarCard comunidadeId={comunidadeId} />
    {eventoId && <NoShowCard eventoId={eventoId} />}
    {eventoId && <LotacaoPrevisaoCard eventoId={eventoId} />}
  </div>
);

export default InsightsTab;
