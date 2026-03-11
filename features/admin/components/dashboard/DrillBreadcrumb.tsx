import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface Props {
  items: BreadcrumbItem[];
}

export function DrillBreadcrumb({ items }: Props) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} className="shrink-0 text-zinc-700" />}
              {isLast ? (
                <span className="shrink-0 text-[0.625rem] font-bold uppercase tracking-widest text-white">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="shrink-0 text-[0.625rem] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
