import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  message: string;
}

const InsightsEmptyState: React.FC<Props> = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-zinc-600" />
    </div>
    <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">{message}</p>
  </div>
);

export default InsightsEmptyState;
