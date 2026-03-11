import React from 'react';

interface Props {
  value: number;
  label: string;
  size?: number;
  color?: string;
  thickness?: number;
}

export default function ProgressRing({ value, label, size = 64, color = '#FFD300', thickness = 4 }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#27272a" strokeWidth={thickness} />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {Math.round(clamped)}%
        </span>
      </div>
      <p className="text-[0.5rem] uppercase tracking-widest text-zinc-400 text-center">{label}</p>
    </div>
  );
}
