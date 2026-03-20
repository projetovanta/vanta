import React from 'react';
import { Sparkles, Heart, Bell } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';

interface Props {
  onSignup: () => void;
}

export const GuestSignupBanner: React.FC<Props> = React.memo(({ onSignup }) => {
  return (
    <section className="px-5 py-4">
      <div
        className="w-full rounded-3xl border border-[#FFD300]/15 p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(255,211,0,0.06) 0%, rgba(255,211,0,0.02) 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ background: '#FFD300' }}
        />

        <h3 style={TYPOGRAPHY.sectionKicker} className="text-white text-base mb-1">
          Sua noite começa aqui
        </h3>
        <p className="text-zinc-400 text-xs leading-relaxed mb-4">Crie sua conta e descubra o melhor da noite.</p>

        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <Heart size="0.75rem" className="text-[#FFD300] shrink-0" />
            <span className="text-zinc-300 text-[0.6875rem]">Salve seus eventos favoritos</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles size="0.75rem" className="text-[#FFD300] shrink-0" />
            <span className="text-zinc-300 text-[0.6875rem]">Receba indicações personalizadas</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Bell size="0.75rem" className="text-[#FFD300] shrink-0" />
            <span className="text-zinc-300 text-[0.6875rem]">Saiba primeiro quando rolar algo novo</span>
          </div>
        </div>

        <button
          onClick={onSignup}
          className="w-full bg-[#FFD300] text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-[#FFD300]/10"
        >
          Criar minha conta
        </button>
      </div>
    </section>
  );
});
