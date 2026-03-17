/**
 * BottomSheet — Componente reutilizável de bottom sheet.
 * Inclui: backdrop, animação, pill handle, safe-area-inset-bottom.
 * Usar SEMPRE que precisar de bottom sheet no app.
 */

import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/85 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full bg-zinc-900 rounded-t-3xl p-6 space-y-4 animate-slide-up"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pill handle */}
        <div className="flex justify-center -mt-2 mb-2">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        {children}
      </div>
    </div>
  );
};
