import React, { useRef, useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import PricingSuggestionCard from '../../components/insights/PricingSuggestionCard';
import SplitPreviewCard from '../../components/insights/SplitPreviewCard';
import BreakEvenCard from '../../components/insights/BreakEvenCard';
import InsightsEmptyState from '../../components/insights/InsightsEmptyState';

interface Props {
  eventoId?: string;
}

const FinanceiroTab: React.FC<Props> = ({ eventoId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!eventoId) return;
    setEmpty(false);
    const timer = setTimeout(() => {
      if (ref.current && ref.current.childElementCount === 0) {
        setEmpty(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [eventoId]);

  if (!eventoId) {
    return (
      <InsightsEmptyState
        icon={DollarSign}
        message="Selecione um evento para ver sugestões de preço, splits e projeção de break-even."
      />
    );
  }

  return (
    <>
      <div ref={ref} className="space-y-6">
        <PricingSuggestionCard eventoId={eventoId} />
        <SplitPreviewCard eventoId={eventoId} />
        <BreakEvenCard eventoId={eventoId} />
      </div>
      {empty && (
        <InsightsEmptyState
          icon={DollarSign}
          message="Este evento ainda não tem vendas suficientes para gerar inteligência financeira."
        />
      )}
    </>
  );
};

export default FinanceiroTab;
