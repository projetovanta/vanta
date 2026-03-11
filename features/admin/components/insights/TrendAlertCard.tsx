import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { getTrendAlerts } from '../../services/insights';
import type { TrendAlert } from '../../services/insights';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
}

const METRIC_LABELS: Record<string, string> = {
  VENDAS: 'Vendas',
  PUBLICO: 'Público',
  TICKET_MEDIO: 'Ticket Médio',
  CHECKIN_RATE: 'Taxa de Check-in',
};

const TrendAlertCard: React.FC<Props> = ({ comunidadeId }) => {
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTrendAlerts(comunidadeId).then(d => {
      if (!cancelled) {
        setAlerts(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!alerts.length) return null;

  const downAlerts = alerts.filter(a => a.direcao === 'DOWN');
  const upAlerts = alerts.filter(a => a.direcao === 'UP');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Tendências</h3>
      </div>

      {/* Alertas de queda */}
      {downAlerts.map(alert => (
        <div key={alert.metrica} className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm font-medium text-red-400">{METRIC_LABELS[alert.metrica] ?? alert.metrica}</span>
            <span className="text-xs text-red-400/70 ml-auto shrink-0">{alert.variacao.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-white/50 mt-1">{alert.sugestao}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
            <span>Antes: {alert.valorAnterior.toLocaleString('pt-BR')}</span>
            <span>Agora: {alert.valorAtual.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      ))}

      {/* Alertas positivos */}
      {upAlerts.map(alert => (
        <div key={alert.metrica} className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-emerald-400">
              {METRIC_LABELS[alert.metrica] ?? alert.metrica}
            </span>
            <span className="text-xs text-emerald-400/70 ml-auto shrink-0">+{alert.variacao.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
            <span>Antes: {alert.valorAnterior.toLocaleString('pt-BR')}</span>
            <span>Agora: {alert.valorAtual.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendAlertCard;
