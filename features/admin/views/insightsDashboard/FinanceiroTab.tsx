import React from 'react';
import PricingSuggestionCard from '../../components/insights/PricingSuggestionCard';
import SplitPreviewCard from '../../components/insights/SplitPreviewCard';
import BreakEvenCard from '../../components/insights/BreakEvenCard';

interface Props {
  eventoId?: string;
}

const FinanceiroTab: React.FC<Props> = ({ eventoId }) => {
  if (!eventoId) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">Selecione um evento para ver inteligência financeira.</p>
    );
  }

  return (
    <div className="space-y-6">
      <PricingSuggestionCard eventoId={eventoId} />
      <SplitPreviewCard eventoId={eventoId} />
      <BreakEvenCard eventoId={eventoId} />
    </div>
  );
};

export default FinanceiroTab;
