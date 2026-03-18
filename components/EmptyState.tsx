import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** CTA button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Compact variant for inline sections (smaller padding) */
  compact?: boolean;
}

/**
 * Empty state reutilizável — ícone dourado + título + subtexto opcional + CTA.
 * Segue o padrão visual da Home (fundo dourado sutil, border dourada).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, subtitle, action, compact }) => {
  const ActionIcon = action?.icon;
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-10' : 'px-8 py-20'}`}>
      <div
        className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-[#FFD300]/5 border border-[#FFD300]/10 flex items-center justify-center mb-4`}
      >
        <Icon size={compact ? '1.25rem' : '1.5rem'} className="text-[#FFD300]" />
      </div>
      <p className={`text-white font-bold ${compact ? 'text-sm' : 'text-base'} mb-1`}>{title}</p>
      {subtitle && (
        <p className={`text-zinc-500 ${compact ? 'text-xs' : 'text-sm'} max-w-[16rem] mx-auto leading-relaxed`}>
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 flex items-center gap-2 bg-[#FFD300] text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,211,0,0.2)]"
        >
          {ActionIcon && <ActionIcon size="0.875rem" />}
          {action.label}
        </button>
      )}
    </div>
  );
};
