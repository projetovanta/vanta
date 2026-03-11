import React from 'react';

interface Props {
  label?: string;
  color?: string;
}

export function LivePulse({ label = 'Ao Vivo', color = '#22c55e' }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {label && <span className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-400">{label}</span>}
    </div>
  );
}
