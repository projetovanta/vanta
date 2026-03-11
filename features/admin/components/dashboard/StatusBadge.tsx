import React from 'react';
import type { TemporalMode } from '../../services/analytics/types';

interface Props {
  mode: TemporalMode;
  size?: 'sm' | 'md';
}

const MODE_CONFIG: Record<TemporalMode, { color: string; bg: string; label: string; pulse: boolean }> = {
  PRE_EVENTO: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Pré-evento', pulse: false },
  OPERACAO: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Ao Vivo', pulse: true },
  POS_EVENTO: { color: '#71717a', bg: 'rgba(113,113,122,0.15)', label: 'Finalizado', pulse: false },
};

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'text-[0.5rem] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
};

export default function StatusBadge({ mode, size = 'sm' }: Props) {
  const config = MODE_CONFIG[mode];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase ${SIZE_CLASSES[size]}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: config.color }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
        </span>
      )}
      {config.label}
    </span>
  );
}
