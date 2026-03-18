import React from 'react';

interface SkeletonProps {
  className?: string;
  /** Rounded variant */
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Shimmer placeholder para loading states.
 *
 * Uso:
 *   <Skeleton className="w-full h-40 rounded-lg" />
 *   <Skeleton className="w-24 h-4" />
 *   <Skeleton className="w-10 h-10" rounded="full" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded }) => {
  const roundedClass = rounded ? `rounded-${rounded}` : '';
  return <div className={`animate-pulse bg-zinc-800/60 ${roundedClass} ${className}`} aria-hidden="true" />;
};

/** Skeleton de card de evento (usado em Home feed, search results) */
export const EventCardSkeleton: React.FC = () => (
  <div className="flex gap-3 p-3">
    <Skeleton className="w-20 h-20 shrink-0 rounded-lg" />
    <div className="flex-1 min-w-0 space-y-2 py-1">
      <Skeleton className="w-3/4 h-4 rounded" />
      <Skeleton className="w-1/2 h-3 rounded" />
      <Skeleton className="w-1/3 h-3 rounded" />
    </div>
  </div>
);

/** Skeleton de card horizontal (ticker, wallet) */
export const TicketCardSkeleton: React.FC = () => (
  <div className="flex gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
    <Skeleton className="w-14 h-14 shrink-0 rounded-lg" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="w-2/3 h-4 rounded" />
      <Skeleton className="w-1/2 h-3 rounded" />
    </div>
  </div>
);

/** Skeleton de perfil (avatar + nome + bio) */
export const ProfileSkeleton: React.FC = () => (
  <div className="flex flex-col items-center gap-3 py-8">
    <Skeleton className="w-20 h-20 rounded-full" />
    <Skeleton className="w-32 h-4 rounded" />
    <Skeleton className="w-48 h-3 rounded" />
  </div>
);

/** Skeleton de pessoa na busca */
export const PersonCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-10 h-10 shrink-0 rounded-full" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <Skeleton className="w-1/2 h-3.5 rounded" />
      <Skeleton className="w-1/3 h-3 rounded" />
    </div>
  </div>
);

/** Skeleton de chat item */
export const ChatItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 px-5 py-3">
    <Skeleton className="w-12 h-12 shrink-0 rounded-full" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="w-2/5 h-3.5 rounded" />
      <Skeleton className="w-3/4 h-3 rounded" />
    </div>
    <Skeleton className="w-8 h-3 rounded shrink-0" />
  </div>
);

/** Skeleton de highlight card (VANTA Indica) */
export const HighlightCardSkeleton: React.FC = () => (
  <div className="w-[17.5rem] h-[13.75rem] shrink-0 rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5">
    <Skeleton className="w-full h-full" />
  </div>
);
