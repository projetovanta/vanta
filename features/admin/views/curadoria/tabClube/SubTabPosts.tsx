import React from 'react';
import { Check, ExternalLink, Zap } from 'lucide-react';
import type { ReservaMaisVanta } from '../../../../../types';
import type { PerfilEnriquecido } from './tierUtils';
import { formatDate } from '../types';

interface Props {
  pendentePosts: ReservaMaisVanta[];
  perfis: Record<string, PerfilEnriquecido>;
  onVerificarPost: (reservaId: string) => void;
  onVerificarAuto: (reservaId: string, postUrl: string) => void;
}

export const SubTabPosts: React.FC<Props> = ({ pendentePosts, perfis, onVerificarPost, onVerificarAuto }) => (
  <div className="space-y-3">
    {pendentePosts.length === 0 ? (
      <p className="text-zinc-400 text-xs text-center py-10">Nenhum post pendente de verificação</p>
    ) : (
      pendentePosts.map(r => (
        <div key={r.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{perfis[r.userId]?.nome || r.userId.slice(0, 8)}</p>
              <p className="text-zinc-400 text-[9px] mt-1">Reservado em {formatDate(r.reservadoEm)}</p>
            </div>
            <span
              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                r.postUrl ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {r.postUrl ? 'Post enviado' : 'Aguardando post'}
            </span>
          </div>
          {r.postUrl && (
            <div className="mt-3 flex items-center gap-2">
              <a
                href={r.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#FFD300] text-[10px] font-bold"
              >
                <ExternalLink size={10} /> Ver
              </a>
              <button
                onClick={() => onVerificarAuto(r.id, r.postUrl!)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-[9px] font-black uppercase active:scale-90 transition-all"
                title="Verificar via Meta API"
              >
                <Zap size={10} /> Auto
              </button>
              <button
                onClick={() => onVerificarPost(r.id)}
                className="ml-auto flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[9px] font-black uppercase active:scale-90 transition-all"
              >
                <Check size={10} /> Manual
              </button>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);
