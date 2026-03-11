import React, { useEffect, useState } from 'react';
import { Sparkles, Clock, Zap, BarChart3, Ticket } from 'lucide-react';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface VantaValueData {
  insightsGerados: number;
  tempoEconomizadoHoras: number;
  operacoesAutomatizadas: number;
  eventosGerenciados: number;
  ticketsProcessados: number;
}

interface Props {
  comunidadeId: string;
  periodo: string;
  getMetrics: (id: string, periodo: string) => Promise<VantaValueData | null>;
}

const VantaValuePanel: React.FC<Props> = ({ comunidadeId, periodo, getMetrics }) => {
  const [data, setData] = useState<VantaValueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMetrics(comunidadeId, periodo).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, periodo, getMetrics]);

  if (loading) return <DashboardSkeleton cards={4} chart={false} />;
  if (!data) return null;

  const cards = [
    {
      icon: BarChart3,
      label: 'Insights gerados',
      value: String(data.insightsGerados),
      sublabel: 'alertas e dicas pra você',
    },
    {
      icon: Clock,
      label: 'Tempo economizado',
      value: `${data.tempoEconomizadoHoras}h`,
      sublabel: 'de trabalho manual',
    },
    {
      icon: Zap,
      label: 'Operações automáticas',
      value: data.operacoesAutomatizadas.toLocaleString('pt-BR'),
      sublabel: 'check-ins, splits, cálculos',
    },
    {
      icon: Ticket,
      label: 'Ingressos processados',
      value: data.ticketsProcessados.toLocaleString('pt-BR'),
      sublabel: `em ${data.eventosGerenciados} eventos`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-[#FFD300]" />
        <h3 className="text-sm font-semibold text-[#FFD300]">Valor VANTA</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-gradient-to-br from-[#FFD300]/10 to-transparent rounded-xl p-3 border border-[#FFD300]/20"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <card.icon className="w-3.5 h-3.5 text-[#FFD300]" />
              <span className="text-xs text-[#FFD300]/70">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{card.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VantaValuePanel;
