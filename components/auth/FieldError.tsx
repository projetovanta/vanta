import React from 'react';

export const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse mt-1.5 px-1">{msg}</p>
  ) : null;
