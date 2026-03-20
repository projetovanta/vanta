import React from 'react';
import { UserCheck, Send, Inbox } from 'lucide-react';
import { OptimizedImage } from '../../../components/OptimizedImage';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AmizadePendente {
  id: string;
  otherId: string;
  otherNome: string;
  otherAvatar: string | null;
  createdAt: string;
  direcao: 'ENVIADO' | 'RECEBIDO';
}

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

export function TabAmizadesPendentes({ items }: { items: AmizadePendente[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <UserCheck size="2rem" className="text-zinc-700" />
        <p className="text-zinc-600 text-xs">Nenhum pedido de amizade pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(a => (
        <div key={a.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
            {a.otherAvatar ? (
              <OptimizedImage src={a.otherAvatar} alt={a.otherNome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm font-bold">
                {a.otherNome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{a.otherNome}</p>
            <p className="text-[0.625rem] text-zinc-500">{formatDate(a.createdAt)}</p>
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase shrink-0 ${
              a.direcao === 'ENVIADO' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {a.direcao === 'ENVIADO' ? (
              <>
                <Send size="0.5rem" /> Enviado
              </>
            ) : (
              <>
                <Inbox size="0.5rem" /> Recebido
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
