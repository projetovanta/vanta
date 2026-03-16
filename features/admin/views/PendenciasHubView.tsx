import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Star,
  FileEdit,
  Banknote,
  Handshake,
  PartyPopper,
  Megaphone,
  Calendar,
} from 'lucide-react';
import { getPendencias, type PendenciaItem, type PendenciaTipo } from '../services/pendenciasService';
import type { ContaVantaLegacy } from '../../../types';
import type { AdminSubView } from '../components/AdminSidebar';
import { AdminViewHeader } from '../components/AdminViewHeader';

const TIPO_CONFIG: Record<PendenciaTipo, { icon: React.ElementType; color: string }> = {
  CURADORIA: { icon: Star, color: '#a78bfa' },
  EVENTO_PENDENTE: { icon: ClipboardList, color: '#f59e0b' },
  EDICAO_PENDENTE: { icon: FileEdit, color: '#60a5fa' },
  REEMBOLSO_MANUAL: { icon: Banknote, color: '#ef4444' },
  SAQUE_PENDENTE: { icon: Banknote, color: '#10b981' },
  PARCERIA_PENDENTE: { icon: Handshake, color: '#22d3ee' },
  COMEMORACAO_PENDENTE: { icon: PartyPopper, color: '#f97316' },
  PROPOSTA_VANTA: { icon: Megaphone, color: '#8b5cf6' },
  EVENTO_PRIVADO: { icon: Calendar, color: '#ec4899' },
};

interface Props {
  userId: string;
  role: ContaVantaLegacy;
  comunidadeIds: string[];
  eventoIds: string[];
  onBack: () => void;
  onNavigate: (view: AdminSubView) => void;
}

export const PendenciasHubView: React.FC<Props> = ({ userId, role, comunidadeIds, eventoIds, onBack, onNavigate }) => {
  const [items, setItems] = useState<PendenciaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPendencias(userId, role, comunidadeIds, eventoIds).then(result => {
      if (!cancelled) {
        setItems(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, role, comunidadeIds, eventoIds]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
      <AdminViewHeader
        title="Pendências"
        onBack={onBack}
        badge={loading ? undefined : items.length}
        badgeColor="#ef4444"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size="1.5rem" className="animate-spin text-zinc-400" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <CheckCircle2 size="3rem" className="mb-3 text-green-500/60" />
            <p className="text-sm">Nenhuma pendência no momento</p>
          </div>
        )}

        {!loading &&
          items.map(item => {
            const cfg = TIPO_CONFIG[item.tipo] ?? { icon: AlertCircle, color: '#71717a' };
            const Icon = cfg.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.destino as AdminSubView)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors text-left"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cfg.color + '20' }}
                >
                  <Icon size="1.25rem" style={{ color: cfg.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{item.titulo}</p>
                  <p className="text-zinc-400 text-xs truncate">{item.descricao}</p>
                </div>
                <div className="shrink-0 text-zinc-400">
                  <ArrowLeft size="1rem" className="rotate-180" />
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
