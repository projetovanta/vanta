import React from 'react';

interface LeaderboardItem {
  id: string;
  name: string;
  foto?: string;
  value: number;
  subtitle?: string;
}

interface Props {
  title: string;
  items: LeaderboardItem[];
  formatValue?: (v: number) => string;
  maxItems?: number;
  onItemClick?: (id: string) => void;
}

const POSITION_COLORS: Record<number, string> = {
  1: '#FFD300',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export default function LeaderboardCard({
  title,
  items,
  formatValue = v => String(v),
  maxItems = 10,
  onItemClick,
}: Props) {
  const visible = items.slice(0, maxItems);

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-5 space-y-4">
      <h3 className="text-[0.5rem] uppercase tracking-widest text-zinc-400">{title}</h3>

      {visible.length === 0 && <p className="text-xs text-zinc-600">Nenhum item</p>}

      <ul className="space-y-2">
        {visible.map((item, idx) => {
          const pos = idx + 1;
          const posColor = POSITION_COLORS[pos] ?? '#a1a1aa';

          return (
            <li
              key={item.id}
              className={`flex items-center gap-2 ${onItemClick ? 'cursor-pointer' : ''}`}
              onClick={() => onItemClick?.(item.id)}
            >
              <span className="w-5 text-right text-xs font-bold shrink-0" style={{ color: posColor }}>
                #{pos}
              </span>

              {item.foto ? (
                <img src={item.foto} alt={item.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[0.5rem] text-zinc-400 uppercase shrink-0">
                  {item.name.charAt(0)}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{item.name}</p>
                {item.subtitle && <p className="text-[0.5rem] text-zinc-600 truncate">{item.subtitle}</p>}
              </div>

              <span className="text-xs font-bold shrink-0" style={{ color: '#FFD300' }}>
                {formatValue(item.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
