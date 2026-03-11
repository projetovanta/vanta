import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, DollarSign, Users, Settings, X } from 'lucide-react';
import DashboardSkeleton from '../dashboard/DashboardSkeleton';

interface SmartTipData {
  id: string;
  categoria: string;
  prioridade: string;
  titulo: string;
  descricao: string;
  acao?: string;
  dado: string;
}

interface Props {
  comunidadeId: string;
  eventoId?: string;
  getTips: (comunidadeId: string, eventoId?: string) => Promise<SmartTipData[]>;
}

const DISMISSED_KEY = 'vanta-dismissed-tips';

const CATEGORY_CONFIG: Record<string, { icon: typeof Lightbulb; color: string }> = {
  PRICING: { icon: DollarSign, color: 'text-[#FFD300]' },
  MARKETING: { icon: TrendingUp, color: 'text-blue-400' },
  OPERACAO: { icon: Settings, color: 'text-purple-400' },
  PUBLICO: { icon: Users, color: 'text-emerald-400' },
  FINANCEIRO: { icon: DollarSign, color: 'text-orange-400' },
};

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: 'border-red-500/30 bg-red-500/5',
  MEDIUM: 'border-amber-500/20 bg-amber-500/5',
  LOW: 'border-white/5 bg-zinc-900/40',
};

const SmartTipsCard: React.FC<Props> = ({ comunidadeId, eventoId, getTips }) => {
  const [tips, setTips] = useState<SmartTipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    let cancelled = false;
    getTips(comunidadeId, eventoId).then(d => {
      if (!cancelled) {
        setTips(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [comunidadeId, eventoId, getTips]);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  if (loading) return <DashboardSkeleton cards={2} chart={false} />;

  const visible = tips.filter(t => !dismissed.has(t.id));
  if (!visible.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Dicas Inteligentes</h3>
        <span className="text-xs text-white/30 ml-auto">{visible.length} dicas</span>
      </div>

      {visible.map(tip => {
        const cat = CATEGORY_CONFIG[tip.categoria] ?? CATEGORY_CONFIG.OPERACAO;
        const Icon = cat.icon;
        const borderClass = PRIORITY_BORDER[tip.prioridade] ?? PRIORITY_BORDER.LOW;

        return (
          <div key={tip.id} className={`rounded-xl p-3 border ${borderClass} relative`}>
            {/* Dismiss */}
            <button
              onClick={() => dismiss(tip.id)}
              className="absolute top-2 right-2 text-white/20 hover:text-white/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-2 pr-5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cat.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{tip.titulo}</p>
                <p className="text-xs text-white/50 mt-0.5">{tip.descricao}</p>
                <p className="text-xs text-white/30 mt-1">{tip.dado}</p>
                {tip.acao && (
                  <span className="inline-block text-xs text-[#FFD300] mt-1.5 font-medium">{tip.acao} →</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartTipsCard;
