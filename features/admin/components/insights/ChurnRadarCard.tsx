import React, { useEffect, useState } from 'react';
import { Radar } from 'lucide-react';
import { getChurnRadar } from '../../services/insights';
import type { ChurnRadarResult } from '../../services/insights';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface Props {
  comunidadeId: string;
}

const ChurnRadarCard: React.FC<Props> = ({ comunidadeId }) => {
  const [data, setData] = useState<ChurnRadarResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getChurnRadar(comunidadeId).then(d => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId]);

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;
  if (!data || data.totalEmRisco === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Radar de Cancelamento</h3>
        </div>
        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
          {data.totalEmRisco} em risco
        </span>
      </div>

      <div className="bg-zinc-900/40 rounded-xl border border-white/5 divide-y divide-white/5">
        {data.clientesEmRisco.slice(0, 10).map(c => {
          const diasAusente = Math.floor((Date.now() - new Date(c.ultimaData).getTime()) / 86_400_000);

          return (
            <div key={c.userId} className="flex items-center gap-3 p-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 overflow-hidden">
                {c.foto ? (
                  <img src={c.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                    {c.nome.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{c.nome}</p>
                <p className="text-xs text-white/40">
                  {c.eventosAnteriores} eventos · R${' '}
                  {c.gastoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>

              {/* Dias ausente */}
              <div className="text-right shrink-0">
                <p className="text-xs text-orange-400">{diasAusente}d ausente</p>
                <p className="text-xs text-white/30 truncate max-w-[100px]">Último: {c.ultimoEvento}</p>
              </div>
            </div>
          );
        })}
      </div>

      {data.totalEmRisco > 10 && (
        <p className="text-xs text-white/30 text-center">+{data.totalEmRisco - 10} clientes em risco</p>
      )}
    </div>
  );
};

export default ChurnRadarCard;
