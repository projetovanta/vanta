import React, { useMemo } from 'react';
import { Crown, ChevronRight } from 'lucide-react';
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
    <button
      onClick={onNavigateToClube}
      className="mx-5 mb-2 bg-gradient-to-r from-[#FFD300]/10 to-[#FFD300]/5 border border-[#FFD300]/20 rounded-2xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-[#FFD300]/15 border border-[#FFD300]/30 flex items-center justify-center shrink-0">
        <Crown size="1.125rem" className="text-[#FFD300]" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[0.625rem] font-black uppercase tracking-widest text-[#FFD300]">MAIS VANTA</p>
        <p className="text-zinc-400 text-[0.6875rem] truncate">
          {membro
            ? 'Acesse seus benefícios exclusivos.'
            : solicitacaoPendente
              ? 'Sua solicitação está em análise.'
              : 'Benefícios exclusivos em eventos e parceiros.'}
        </p>
      </div>
      <ChevronRight size="1rem" className="text-[#FFD300]/60 shrink-0" />
    </button>
  );
});
