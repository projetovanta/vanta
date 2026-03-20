import React from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, Search } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SolicitacaoParceria {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  criado_em: string;
  motivo_rejeicao: string | null;
  cidade: string;
  categoria: string;
  comunidade_criada_id: string | null;
  analisado_em: string | null;
}

const STATUS_CFG: Record<
  string,
  { label: string; color: string; icon: React.FC<{ size?: string | number; className?: string }> }
> = {
  PENDENTE: { label: 'Pendente', color: '#FBBF24', icon: Clock },
  APROVADA: { label: 'Aprovada', color: '#34D399', icon: CheckCircle },
  REJEITADA: { label: 'Recusada', color: '#F87171', icon: XCircle },
  VISUALIZADA: { label: 'Visualizada', color: '#60A5FA', icon: Eye },
  EM_ANALISE: { label: 'Em análise', color: '#A78BFA', icon: Search },
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Component ───────────────────────────────────────────────────────────────

export function TabSolicitacoesParceria({ items }: { items: SolicitacaoParceria[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <ClipboardList size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhuma solicitação de parceria</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(s => {
        const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.PENDENTE;
        const StatusIcon = cfg.icon;
        return (
          <div key={s.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{s.nome}</p>
                <p className="text-[0.625rem] text-zinc-500 truncate">
                  {s.tipo === 'ESPACO_FIXO' ? 'Espaço Fixo' : 'Produtora'} &middot; {s.cidade} &middot; {s.categoria}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0"
                style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
              >
                <StatusIcon size="0.625rem" />
                {cfg.label}
              </span>
            </div>

            <p className="text-[0.625rem] text-zinc-600">
              Enviada em {formatDate(s.criado_em)}
              {s.analisado_em && ` · Analisada em ${formatDate(s.analisado_em)}`}
            </p>

            {s.motivo_rejeicao && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-[0.625rem] text-red-400">
                  <span className="font-bold">Motivo:</span> {s.motivo_rejeicao}
                </p>
              </div>
            )}

            {s.comunidade_criada_id && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <p className="text-[0.625rem] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle size="0.625rem" />
                  Comunidade criada
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
