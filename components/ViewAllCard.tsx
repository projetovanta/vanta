import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ViewAllCardProps {
  onClick: () => void;
  label?: string;
}

export const ViewAllCard: React.FC<ViewAllCardProps> = React.memo(({ onClick, label = 'Ver todos' }) => (
  <button
    onClick={onClick}
    className="shrink-0 snap-start w-[9.5rem] aspect-[4/5] rounded-2xl border border-[#FFD300]/15 bg-gradient-to-br from-[#FFD300]/5 to-transparent flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
  >
    <div className="w-10 h-10 rounded-full bg-[#FFD300]/10 flex items-center justify-center">
      <ArrowRight size="1.125rem" className="text-[#FFD300]" />
    </div>
    <span className="text-xs font-bold text-[#FFD300] uppercase tracking-widest">{label}</span>
  </button>
));

ViewAllCard.displayName = 'ViewAllCard';
