import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { clubeService } from '../../../features/admin/services/clubeService';
import { useAuthStore } from '../../../stores/authStore';

interface Props {
  onNavigateToClube: () => void;
}

export const MaisVantaBanner: React.FC<Props> = React.memo(({ onNavigateToClube }) => {
  const userId = useAuthStore(s => s.currentAccount?.id);

  const membro = useMemo(() => (userId ? clubeService.getMembroClubeByUserId(userId) : null), [userId]);

  const solicitacaoPendente = useMemo(() => {
    if (membro) return false;
    const sols = clubeService.getSolicitacoesPendentes();
    return sols.some(s => s.userId === userId);
  }, [userId, membro]);

  return (
    <button onClick={onNavigateToClube} className="w-full px-5 pb-3 active:scale-[0.98] transition-all">
      <div className="relative overflow-hidden rounded-2xl border border-[#FFD300]/30 bg-gradient-to-br from-[#1a1500] via-[#0f0f0f] to-[#0a0800] shadow-[0_0_30px_rgba(255,211,0,0.08)]">
        {/* Brilho decorativo */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FFD300]/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#FFD300]/3 rounded-full blur-xl" />

        <div className="relative px-5 py-5 flex items-center gap-4">
          {/* Ícone */}
          <div className="w-12 h-12 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,211,0,0.15)]">
            <Sparkles size="1.25rem" className="text-[#FFD300]" />
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0 text-left">
            <h3 style={TYPOGRAPHY.cardTitle} className="text-[0.9375rem] text-[#FFD300] mb-0.5 italic">
              Mais Vanta
            </h3>
            <p className="text-zinc-400 text-xs leading-snug">
              {membro
                ? 'Acesse seus benefícios exclusivos.'
                : solicitacaoPendente
                  ? 'Sua solicitação está em análise.'
                  : 'Benefícios exclusivos em eventos e parceiros.'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
});
