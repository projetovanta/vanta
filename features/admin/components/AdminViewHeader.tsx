/**
 * AdminViewHeader — Header padronizado pra TODAS as subviews do admin.
 *
 * PADRÃO ÚNICO:
 * - Botão voltar SEMPRE à esquerda (← seta)
 * - Título + subtítulo ao centro/esquerda
 * - Ações (botões) à direita
 * - backdrop-blur + border-b + shrink-0
 * - Touch target 44px+ nos botões
 * - Sem safe-area (Gateway já cuida)
 */

import React from 'react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

interface ActionButton {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  onBack: () => void;
  actions?: ActionButton[];
  badge?: number;
  badgeColor?: string;
  /** Kicker acima do título (ex: "Master Admin", "Gerente") */
  kicker?: string;
}

export const AdminViewHeader: React.FC<Props> = ({
  title,
  subtitle,
  subtitleColor,
  onBack,
  actions,
  badge,
  badgeColor = '#f59e0b',
  kicker,
}) => (
  <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-5 pt-5 pb-4 shrink-0">
    <div className="flex items-start gap-3">
      {/* Voltar — SEMPRE à esquerda, 44px touch target */}
      <button
        aria-label="Voltar"
        onClick={onBack}
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900/60 border border-white/5 active:scale-90 transition-all shrink-0 -ml-1"
      >
        <ArrowLeft size="1.125rem" className="text-zinc-400" />
      </button>

      {/* Título + subtítulo */}
      <div className="flex-1 min-w-0 pt-0.5">
        {kicker && (
          <p style={TYPOGRAPHY.sectionKicker} className="mb-0.5 truncate">
            {kicker}
          </p>
        )}
        <div className="flex items-center gap-2">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic leading-tight truncate">
            {title}
          </h1>
          {badge != null && badge > 0 && (
            <span
              className="shrink-0 min-w-[1.25rem] h-5 rounded-full text-[0.5rem] font-black flex items-center justify-center px-1.5 leading-none text-black"
              style={{ backgroundColor: badgeColor }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className={`text-[0.625rem] font-black uppercase tracking-widest mt-0.5 truncate ${subtitleColor ?? 'text-zinc-500'}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Ações à direita */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                aria-label={action.label}
                onClick={action.onClick}
                title={action.label}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/60 border border-white/5 active:scale-90 transition-all"
              >
                <Icon size="0.875rem" className="text-zinc-400" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
