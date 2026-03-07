import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserMinus, Loader2, Users, ShieldCheck, Scan, QrCode } from 'lucide-react';
import { CargoUnificado, AtribuicaoRBAC } from '../../../../types';
import { rbacService, CARGO_LABELS } from '../../services/rbacService';
import { supabase } from '../../../../services/supabaseClient';

type ProfileInfo = { id: string; nome: string; foto: string };

const CARGO_CONFIG: { cargo: CargoUnificado; label: string; icon: React.FC<{ size?: number; className?: string }> }[] =
  [
    { cargo: 'PROMOTER', label: 'Promoters', icon: Users },
    { cargo: 'PORTARIA_LISTA', label: 'Portaria (Lista)', icon: ShieldCheck },
    { cargo: 'PORTARIA_ANTECIPADO', label: 'Portaria (Antecipado)', icon: Scan },
    { cargo: 'CAIXA', label: 'Caixa', icon: QrCode },
  ];

/** Carrega nome/foto de uma lista de userIds */
const loadProfiles = async (userIds: string[]): Promise<Map<string, ProfileInfo>> => {
  const map = new Map<string, ProfileInfo>();
  if (userIds.length === 0) return map;
  const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
  if (data) {
    for (const r of data) {
      map.set(r.id as string, {
        id: r.id as string,
        nome: (r.full_name as string) ?? 'Sem nome',
        foto: (r.avatar_url as string) ?? '',
      });
    }
  }
  return map;
};

const StaffCard: React.FC<{
  profile: ProfileInfo;
  action: 'recrutar' | 'remover';
  loading: boolean;
  onAction: () => void;
}> = ({ profile, action, loading, onAction }) => (
  <div className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
      {profile.foto ? (
        <img loading="lazy" src={profile.foto} alt={profile.nome} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
          {profile.nome.charAt(0)}
        </div>
      )}
    </div>
    <p className="flex-1 min-w-0 text-white text-sm font-semibold truncate">{profile.nome}</p>
    <button
      onClick={onAction}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 active:scale-95 transition-all ${
        action === 'recrutar'
          ? 'bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300]'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
      }`}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : action === 'recrutar' ? (
        <UserPlus size={11} />
      ) : (
        <UserMinus size={11} />
      )}
      {action === 'recrutar' ? 'Recrutar' : 'Remover'}
    </button>
  </div>
);

export const StaffRecrutamento: React.FC<{
  eventoAdminId: string;
  comunidadeId: string;
  currentUserId: string;
  toastFn?: (t: 'sucesso' | 'erro', m: string) => void;
}> = ({ eventoAdminId, comunidadeId, currentUserId, toastFn }) => {
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Dados derivados do rbacService
  const allElegiveis: Partial<Record<CargoUnificado, AtribuicaoRBAC[]>> = {};
  const allRecrutados: Partial<Record<CargoUnificado, AtribuicaoRBAC[]>> = {};
  for (const { cargo } of CARGO_CONFIG) {
    allElegiveis[cargo] = rbacService.getElegiveis(comunidadeId, eventoAdminId, cargo);
    allRecrutados[cargo] = rbacService.getRecrutados(eventoAdminId, cargo);
  }

  // Coletar todos os userIds para lookup de perfil
  const allUserIds = new Set<string>();
  for (const { cargo } of CARGO_CONFIG) {
    (allElegiveis[cargo] ?? []).forEach(a => allUserIds.add(a.userId));
    (allRecrutados[cargo] ?? []).forEach(a => allUserIds.add(a.userId));
  }

  useEffect(() => {
    setLoading(true);
    loadProfiles([...allUserIds]).then(map => {
      setProfiles(map);
      setLoading(false);
    });
  }, [tick, eventoAdminId, comunidadeId]);

  const handleRecrutar = useCallback(
    async (userId: string, cargo: CargoUnificado) => {
      const key = `rec_${userId}_${cargo}`;
      setActionLoading(key);
      try {
        await rbacService.recrutar({
          userId,
          cargo,
          eventoId: eventoAdminId,
          eventoNome: '',
          atribuidoPor: currentUserId,
        });
        toastFn?.('sucesso', `Staff recrutado com sucesso`);
        setTick(t => t + 1);
      } catch {
        toastFn?.('erro', 'Erro ao recrutar staff');
      }
      setActionLoading(null);
    },
    [eventoAdminId, comunidadeId, currentUserId],
  );

  const handleDesrecrutar = useCallback(
    async (userId: string, cargo: CargoUnificado) => {
      const key = `des_${userId}_${cargo}`;
      setActionLoading(key);
      try {
        await rbacService.desrecrutar(userId, eventoAdminId, cargo);
        toastFn?.('sucesso', 'Staff removido do evento');
        setTick(t => t + 1);
      } catch {
        toastFn?.('erro', 'Erro ao remover staff');
      }
      setActionLoading(null);
    },
    [eventoAdminId],
  );

  const getProfile = (userId: string): ProfileInfo =>
    profiles.get(userId) ?? { id: userId, nome: userId.slice(0, 8), foto: '' };

  const hasAny = CARGO_CONFIG.some(
    c => (allElegiveis[c.cargo]?.length ?? 0) > 0 || (allRecrutados[c.cargo]?.length ?? 0) > 0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2">
        <Loader2 size={16} className="animate-spin text-zinc-600" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Carregando staff...</p>
      </div>
    );
  }

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <Scan size={24} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center">
          Nenhum staff elegível na comunidade
        </p>
        <p className="text-zinc-800 text-[9px] text-center max-w-[250px]">
          Adicione promoters, check-in ou QR code à comunidade para recrutar para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {CARGO_CONFIG.map(({ cargo, label, icon: Icon }) => {
        const elegiveis = allElegiveis[cargo] ?? [];
        const recrutados = allRecrutados[cargo] ?? [];
        if (elegiveis.length === 0 && recrutados.length === 0) return null;

        return (
          <div key={cargo}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={13} className="text-zinc-500" />
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{label}</p>
            </div>

            {/* Recrutados */}
            {recrutados.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest ml-1">
                  Recrutados ({recrutados.length})
                </p>
                {recrutados.map(a => (
                  <StaffCard
                    key={a.id}
                    profile={getProfile(a.userId)}
                    action="remover"
                    loading={actionLoading === `des_${a.userId}_${cargo}`}
                    onAction={() => handleDesrecrutar(a.userId, cargo)}
                  />
                ))}
              </div>
            )}

            {/* Elegíveis */}
            {elegiveis.length > 0 && (
              <div className="space-y-2">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest ml-1">
                  Elegíveis ({elegiveis.length})
                </p>
                {elegiveis.map(a => (
                  <StaffCard
                    key={a.id}
                    profile={getProfile(a.userId)}
                    action="recrutar"
                    loading={actionLoading === `rec_${a.userId}_${cargo}`}
                    onAction={() => handleRecrutar(a.userId, cargo)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
