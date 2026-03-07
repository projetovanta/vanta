import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Comunidade, TipoCargo, CargoUnificado } from '../../../../types';
import { rbacService, CARGO_LABELS, CARGO_PERMISSOES } from '../../services/rbacService';
import { AdicionarMembroModal } from './AdicionarMembroModal';
import { CARGO_LABEL, addLog } from './types';

type EquipeItem = {
  userId: string;
  label: string;
  atribuicaoId: string;
};

export const EquipeTab: React.FC<{
  comunidade: Comunidade;
  adminNome: string;
  adminId?: string;
  onUpdate: () => void;
  toast?: (tipo: 'sucesso' | 'erro', msg: string) => void;
}> = ({ comunidade, adminNome, adminId, onUpdate, toast: toastFn }) => {
  const [adicionando, setAdicionando] = useState(false);
  const [membroNames, setMembroNames] = useState<Record<string, { nome: string; foto: string }>>({});

  // Fonte única: atribuições RBAC da comunidade
  const atribuicoes = rbacService.getAtribuicoesTenant('COMUNIDADE', comunidade.id);

  const equipeUnificada = useMemo(() => {
    return atribuicoes.map(a => ({
      userId: a.userId,
      label: CARGO_LABELS[a.cargo] ?? CARGO_LABEL[a.cargo as TipoCargo] ?? a.cargo,
      atribuicaoId: a.id,
    }));
  }, [atribuicoes.length, comunidade.id]);

  // Lookup de profiles (legado + V2 userIds)
  const allUserIds = useMemo(() => [...new Set(equipeUnificada.map(e => e.userId))], [equipeUnificada]);

  useEffect(() => {
    if (allUserIds.length === 0) return;
    import('../../../../services/supabaseClient')
      .then(({ supabase }) => {
        supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .in('id', allUserIds)
          .then(
            ({ data }) => {
              const map: Record<string, { nome: string; foto: string }> = {};
              (data ?? []).forEach((r: any) => {
                map[r.id] = { nome: r.nome ?? r.id, foto: r.avatar_url ?? '' };
              });
              setMembroNames(map);
            },
            () => {
              /* audit-ok */
            },
          );
      })
      .catch(() => {
        /* audit-ok */
      });
  }, [allUserIds.join(',')]);

  const handleRemover = async (item: EquipeItem) => {
    try {
      const nome = membroNames[item.userId]?.nome || item.userId;
      await rbacService.revogar(item.atribuicaoId);
      addLog(comunidade.id, adminNome, `removeu ${nome} da equipe fixa (${item.label})`);
      onUpdate();
      toastFn?.('sucesso', 'Membro removido da equipe');
    } catch {
      toastFn?.('erro', 'Erro ao remover membro');
    }
  };

  const handleAdd = async (membroId: string, tipo: TipoCargo) => {
    const nome = membroNames[membroId]?.nome || membroId;
    try {
      await rbacService.atribuir({
        userId: membroId,
        tenant: { tipo: 'COMUNIDADE', id: comunidade.id, nome: comunidade.nome, foto: comunidade.foto },
        cargo: tipo as CargoUnificado,
        permissoes: CARGO_PERMISSOES[tipo as CargoUnificado] ?? [],
        atribuidoPor: adminId || '',
        ativo: true,
      });
      addLog(comunidade.id, adminNome, `adicionou ${nome} como ${CARGO_LABEL[tipo]} na equipe fixa`);
      setAdicionando(false);
      onUpdate();
      toastFn?.('sucesso', `${nome} adicionado à equipe`);
    } catch (err) {
      console.error('[EquipeTab] erro ao adicionar:', err);
      toastFn?.('erro', 'Erro ao adicionar membro à equipe');
    }
  };

  return (
    <div>
      {/* Botão adicionar */}
      <button
        onClick={() => setAdicionando(true)}
        className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl mb-4 active:scale-[0.98] transition-all"
      >
        <div className="text-left">
          <p className="text-zinc-300 text-sm font-bold">Adicionar membro</p>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">
            Equipe fixa da comunidade
          </p>
        </div>
        <div className="w-9 h-9 bg-[#FFD300]/10 rounded-full flex items-center justify-center shrink-0">
          <Plus size={16} className="text-[#FFD300]" />
        </div>
      </button>

      {/* Lista de membros */}
      {equipeUnificada.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <Users size={28} className="text-zinc-800" />
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
            Equipe não definida
          </p>
          <p className="text-zinc-800 text-[9px] italic text-center max-w-[200px]">
            Membros da equipe fixa têm acesso automático aos eventos desta comunidade.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {equipeUnificada.map(item => {
            const resolved = membroNames[item.userId];
            return (
              <div
                key={`${item.userId}_${item.label}`}
                className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  {resolved?.foto ? (
                    <img
                      loading="lazy"
                      src={resolved.foto}
                      alt={resolved.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <Users size={14} className="text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{resolved?.nome || '—'}</p>
                  <p className="text-[#FFD300]/60 text-[8px] font-black uppercase tracking-widest truncate">
                    {item.label}
                  </p>
                </div>
                <button
                  onClick={() => handleRemover(item)}
                  className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all shrink-0"
                >
                  <Trash2 size={12} className="text-zinc-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {adicionando && (
        <AdicionarMembroModal comunidade={comunidade} onAdd={handleAdd} onClose={() => setAdicionando(false)} />
      )}
    </div>
  );
};
