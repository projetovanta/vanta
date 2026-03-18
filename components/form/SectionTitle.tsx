import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ title, subtitle, icon: Icon, action, className }: SectionTitleProps) {
  return (
    <div className={`border-b border-white/5 pb-3 mb-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={20} className="text-zinc-400 shrink-0" />}
          <h3
            className="text-white text-lg leading-tight truncate"
            style={{
              fontFamily: "'Playfair Display SC', serif",
              fontWeight: 700,
              fontStyle: 'italic',
            }}
          >
            {title}
          </h3>
        </div>

        {action && <div className="shrink-0 ml-3">{action}</div>}
      </div>

      {subtitle && (
        <p className="text-zinc-400 text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
