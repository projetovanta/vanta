import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Ban, UserCheck } from 'lucide-react';
import { TYPOGRAPHY } from '../../constants';
import { desbloquearUsuario, listarBloqueadosComDetalhes, type BloqueadoInfo } from '../../services/reportBlockService';
import { globalToast } from '../../components/Toast';

interface Props {
  onBack: () => void;
}

export const BloqueadosView: React.FC<Props> = ({ onBack }) => {
  const [bloqueados, setBloqueados] = useState<BloqueadoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [desbloqueando, setDesbloqueando] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);

  useEffect(() => {
    listarBloqueadosComDetalhes().then(d => {
      setBloqueados(d);
      setLoading(false);
    });
  }, []);

  const handleDesbloquear = async (id: string) => {
    setDesbloqueando(id);
    const result = await desbloquearUsuario(id);
    if (result.success) {
      setBloqueados(prev => prev.filter(b => b.id !== id));
      globalToast('sucesso', 'Usuário desbloqueado');
    } else {
      globalToast('erro', result.error ?? 'Erro ao desbloquear');
    }
    setDesbloqueando(null);
    setConfirmar(null);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 active:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft size="1.125rem" className="text-white" />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-xl">
          Bloqueados
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size="1.5rem" className="animate-spin text-zinc-500" />
          </div>
        ) : bloqueados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ban size="2rem" className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">Nenhum usuário bloqueado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bloqueados.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-white/5 rounded-xl">
                {b.foto ? (
                  <img
                    src={b.foto}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                    <Ban size="0.875rem" className="text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{b.nome}</p>
                </div>
                {confirmar === b.id ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDesbloquear(b.id)}
                      disabled={desbloqueando === b.id}
                      className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[0.5rem] font-black uppercase active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1"
                    >
                      {desbloqueando === b.id ? (
                        <Loader2 size="0.625rem" className="animate-spin" />
                      ) : (
                        <UserCheck size="0.625rem" />
                      )}
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmar(null)}
                      className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-zinc-400 text-[0.5rem] font-black uppercase active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmar(b.id)}
                    className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-zinc-400 text-[0.5rem] font-black uppercase active:scale-95 transition-all hover-real:bg-zinc-700"
                  >
                    Desbloquear
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
