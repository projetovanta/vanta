import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TYPOGRAPHY } from '../constants';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
      <h1
        style={{ ...TYPOGRAPHY.screenTitle, fontSize: '5rem', lineHeight: 1, color: '#FFD300' }}
        className="mb-4 italic"
      >
        404
      </h1>
      <p className="text-zinc-400 text-sm font-medium mb-2">Página não encontrada</p>
      <p className="text-zinc-600 text-xs max-w-xs mb-8">O link pode estar quebrado ou a página foi removida.</p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="px-8 py-3 bg-[#FFD300] text-black text-xs font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
      >
        Voltar ao início
      </button>
    </div>
  );
};
