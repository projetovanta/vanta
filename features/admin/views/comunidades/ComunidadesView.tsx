import React, { useState } from 'react';
import { ArrowLeft, MapPin, Users, Calendar, Plus, Building2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { Comunidade, ContaVanta } from '../../../../types';
import { getAcessoComunidades } from '../../permissoes';
import { rbacService } from '../../services/rbacService';
import { CriarComunidadeView } from '../CriarComunidadeView';
import { ComunidadeDetalheView } from './ComunidadeDetalheView';

export const ComunidadesView: React.FC<{
  onBack: () => void;
  memberId?: string;
  adminRole?: ContaVanta;
  adminNome?: string;
  focusComunidadeId?: string;
}> = ({ onBack, memberId, adminRole = 'vanta_masteradm', adminNome = 'Admin', focusComunidadeId }) => {
  const comunidades = getAcessoComunidades(memberId ?? '', adminRole as ContaVanta);

  // Auto-selecionar comunidade quando focusComunidadeId é fornecido
  const [selected, setSelected] = useState<Comunidade | null>(() => {
    if (focusComunidadeId) {
      return comunidades.find(c => c.id === focusComunidadeId) ?? null;
    }
    return null;
  });
  const [criando, setCriando] = useState(false);

  if (criando) {
    return <CriarComunidadeView onBack={() => setCriando(false)} adminNome={adminNome} adminId={memberId} />;
  }

  if (selected) {
    return (
      <ComunidadeDetalheView
        comunidade={selected}
        adminRole={adminRole}
        adminNome={adminNome}
        adminId={memberId ?? ''}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 flex justify-between items-start shrink-0">
        <div>
          <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
            Portal Admin
          </p>
          <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
            Comunidades
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {adminRole === 'vanta_masteradm' && (
            <button
              onClick={() => setCriando(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FFD300] rounded-xl active:scale-95 transition-all"
            >
              <Plus size={14} className="text-black" />
              <span className="text-black font-black text-[10px] uppercase tracking-wider">Nova</span>
            </button>
          )}
          <button
            onClick={onBack}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 max-w-3xl mx-auto w-full">
        {comunidades.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Building2 size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest text-center">
              Nenhuma comunidade vinculada
            </p>
          </div>
        )}

        {comunidades.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`w-full text-left relative rounded-3xl overflow-hidden active:scale-[0.98] transition-all aspect-[16/9] max-h-[280px] ${!c.ativa ? 'opacity-40' : ''}`}
          >
            {(c.fotoCapa || c.foto) && (
              <img loading="lazy" src={c.fotoCapa || c.foto} alt={c.nome} className="w-full h-full object-cover" />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 100%)',
              }}
            />
            {!c.ativa && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
                <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Inativa</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-1 mb-1">
                <MapPin size={8} className="text-[#FFD300]/60" />
                <p className="text-[#FFD300]/60 text-[9px] font-black uppercase tracking-[0.2em]">{c.cidade}</p>
              </div>
              <h2 className="text-white font-black text-2xl italic leading-none mb-3 truncate">{c.nome}</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Calendar size={9} className="text-white/60" />
                  <p className="text-white text-[10px] font-bold">
                    {c.eventoIds.length} evento{c.eventoIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Users size={9} className="text-white/60" />
                  {(() => {
                    const n = rbacService.getAtribuicoesTenant('COMUNIDADE', c.id).length;
                    return (
                      <p className="text-white text-[10px] font-bold">
                        {n} membro{n !== 1 ? 's' : ''}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
