import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
  iconEmoji?: string;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
  borderColor?: string;
  children: React.ReactNode;
  className?: string;
}

export default function AccordionSection({
  title,
  icon: Icon,
  iconEmoji,
  defaultOpen = false,
  badge,
  badgeColor = 'text-zinc-400',
  borderColor = 'border-[#FFD300]/20',
  children,
  className,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, open]);

  // Recalcular ao abrir (conteúdo pode ter mudado enquanto fechado)
  useEffect(() => {
    if (open && contentRef.current) {
      const timer = setTimeout(() => {
        setContentHeight(contentRef.current?.scrollHeight ?? 0);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div
      className={`
        rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out
        ${open ? `${borderColor} bg-zinc-900/50` : 'border-white/5 bg-zinc-900/30'}
        ${className ?? ''}
      `}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={16} className="text-zinc-300 shrink-0" />}
          {iconEmoji && !Icon && <span className="text-[0.625rem] shrink-0">{iconEmoji}</span>}
          <span className="text-white text-xs font-bold truncate">{title}</span>
          {badge && (
            <span className={`text-[0.625rem] font-black uppercase tracking-widest shrink-0 ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`
            text-zinc-400 shrink-0 ml-2
            transition-transform duration-300 ease-out
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Content */}
      <div
        style={{
          maxHeight: open ? `${contentHeight}px` : '0px',
          opacity: open ? 1 : 0,
        }}
        className="transition-all duration-300 ease-out overflow-hidden"
      >
        <div ref={contentRef} className="px-4 pb-3">
          {children}
        </div>
      </div>
    </div>
  );
}
