import React from 'react';
import { Crown, ChevronRight, Save, User, ToggleLeft, ToggleRight } from 'lucide-react';
import type { MembroClubeVanta, TierMaisVanta, ClubeConfig, BeneficioId } from '../../../../../types';
import { clubeService } from '../../../services/clubeService';
import { TIER_LABELS, TIER_COLORS, getTierOptions, BENEFICIOS_DISPONIVEIS } from './tierUtils';
import type { PerfilEnriquecido } from './tierUtils';
import { ArrowLeft } from 'lucide-react';

interface Props {
  membros: MembroClubeVanta[];
  solicitacoesCount: number;
  perfis: Record<string, PerfilEnriquecido>;
  clubeConfig: ClubeConfig | null;
  configDraft: Partial<ClubeConfig>;
  setConfigDraft: React.Dispatch<React.SetStateAction<Partial<ClubeConfig>>>;
  salvandoConfig: boolean;
  setSalvandoConfig: (v: boolean) => void;
  setClubeConfig: (v: ClubeConfig) => void;
  comunidadeId?: string;
  toastFn: (tipo: 'sucesso' | 'erro' | string, msg: string) => void;
  editandoTier: TierMaisVanta | null;
  setEditandoTier: (v: TierMaisVanta | null) => void;
}

export const SubTabConfig: React.FC<Props> = ({
  membros,
  solicitacoesCount,
  perfis,
  clubeConfig,
  configDraft,
  setConfigDraft,
  salvandoConfig,
  setSalvandoConfig,
  setClubeConfig,
  comunidadeId,
  toastFn,
  editandoTier,
  setEditandoTier,
}) => {
  const cfg = clubeConfig;
  const d = configDraft;

  const getBeneficios = (tier: TierMaisVanta): BeneficioId[] => {
    const key = `beneficios${tier.charAt(0) + tier.slice(1).toLowerCase()}` as keyof ClubeConfig;
    return (d[key] as BeneficioId[] | undefined) ?? (cfg?.[key] as BeneficioId[] | undefined) ?? [];
  };
  const getLimite = (tier: TierMaisVanta) => {
    const key = `limite${tier.charAt(0) + tier.slice(1).toLowerCase()}` as keyof ClubeConfig;
    return (d[key] as number | undefined) ?? (cfg?.[key] as number | undefined) ?? 0;
  };
  const setDraft = (key: string, value: unknown) => setConfigDraft(p => ({ ...p, [key]: value }));
  const hasDraftChanges = Object.keys(d).length > 0;

  const handleSaveConfig = async () => {
    if (!comunidadeId || !hasDraftChanges) return;
    setSalvandoConfig(true);
    try {
      const saved = await clubeService.saveConfig(comunidadeId, d);
      setClubeConfig(saved);
      setConfigDraft({});
      toastFn('sucesso', 'Configuração salva');
    } catch {
      toastFn('erro', 'Erro ao salvar configuração');
    }
    setSalvandoConfig(false);
  };

  // ── Modal edição de Tier ──
  if (editandoTier) {
    const tier = editandoTier;
    const tierKey = tier.charAt(0) + tier.slice(1).toLowerCase();
    const benefKey = `beneficios${tierKey}` as keyof ClubeConfig;
    const limKey = `limite${tierKey}` as keyof ClubeConfig;
    const beneficiosAtivos: BeneficioId[] =
      (d[benefKey] as BeneficioId[] | undefined) ?? (cfg?.[benefKey] as BeneficioId[] | undefined) ?? [];
    const limite = (d[limKey] as number | undefined) ?? (cfg?.[limKey] as number | undefined) ?? 0;
    const membrosDoTier = membros.filter(m => m.tier === tier);

    const toggleBeneficio = (id: BeneficioId) => {
      const atual = [...beneficiosAtivos];
      const idx = atual.indexOf(id);
      if (idx >= 0) atual.splice(idx, 1);
      else atual.push(id);
      setConfigDraft(p => ({ ...p, [benefKey]: atual }));
    };

    const handleSaveTier = async () => {
      if (!comunidadeId) return;
      setSalvandoConfig(true);
      try {
        const partial: Partial<ClubeConfig> = {};
        (partial as Record<string, unknown>)[benefKey] = beneficiosAtivos;
        (partial as Record<string, unknown>)[limKey] = limite;
        const saved = await clubeService.saveConfig(comunidadeId, partial);
        setClubeConfig(saved);
        setConfigDraft(prev => {
          const next = { ...prev };
          delete (next as Record<string, unknown>)[benefKey];
          delete (next as Record<string, unknown>)[limKey];
          return next;
        });
        toastFn('sucesso', `Tier ${TIER_LABELS[tier]} atualizado`);
        setEditandoTier(null);
      } catch {
        toastFn('erro', 'Erro ao salvar');
      }
      setSalvandoConfig(false);
    };

    return (
      <div className="absolute inset-0 bg-[#0A0A0A] z-[160] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 pb-4 border-b border-white/5" style={{ paddingTop: '2rem' }}>
          <button
            onClick={() => setEditandoTier(null)}
            className="flex items-center gap-2 text-zinc-400 text-xs mb-3 active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{ borderColor: TIER_COLORS[tier] + '30', backgroundColor: TIER_COLORS[tier] + '10' }}
            >
              <Crown size={20} style={{ color: TIER_COLORS[tier] }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Tier {TIER_LABELS[tier]}</h2>
              <p className="text-zinc-400 text-[10px]">
                {membrosDoTier.length} membro{membrosDoTier.length !== 1 ? 's' : ''} ativo
                {membrosDoTier.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">
          {/* Benefícios — toggles selecionáveis */}
          <div>
            <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-3">Benefícios</p>
            <div className="space-y-2">
              {BENEFICIOS_DISPONIVEIS.map(b => {
                const ativo = beneficiosAtivos.includes(b.id);
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    onClick={() => toggleBeneficio(b.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                      ativo ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-zinc-900/60 border-white/5'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        ativo ? 'bg-[#FFD300]/20' : 'bg-zinc-800'
                      }`}
                    >
                      <Icon size={14} className={ativo ? 'text-[#FFD300]' : 'text-zinc-400'} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-xs font-bold ${ativo ? 'text-white' : 'text-zinc-400'}`}>{b.label}</p>
                      <p className="text-zinc-400 text-[9px]">{b.desc}</p>
                    </div>
                    <div className="shrink-0">
                      {ativo ? (
                        <ToggleRight size={24} className="text-[#FFD300]" />
                      ) : (
                        <ToggleLeft size={24} className="text-zinc-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Limite */}
          <div>
            <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-2">Limite de Membros</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={limite}
                onChange={e => setConfigDraft(p => ({ ...p, [limKey]: parseInt(e.target.value) || 0 }))}
                className="w-20 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm text-center focus:border-white/20 focus:outline-none"
              />
              <span className="text-zinc-400 text-xs">0 = ilimitado</span>
            </div>
            {limite > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-400 text-[9px]">
                    {membrosDoTier.length} / {limite}
                  </span>
                  {membrosDoTier.length >= limite && <span className="text-red-400 text-[9px] font-bold">Lotado</span>}
                </div>
                <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((membrosDoTier.length / limite) * 100, 100)}%`,
                      backgroundColor: membrosDoTier.length >= limite ? '#ef4444' : TIER_COLORS[tier],
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Membros deste tier (preview) */}
          {membrosDoTier.length > 0 && (
            <div>
              <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-2">
                Membros ({membrosDoTier.length})
              </p>
              <div className="space-y-1.5">
                {membrosDoTier.slice(0, 5).map(m => {
                  const p = perfis[m.userId];
                  return (
                    <div key={m.userId} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        {p?.selfieSignedUrl ? (
                          <img loading="lazy" src={p.selfieSignedUrl} alt="" className="w-full h-full object-cover" />
                        ) : p?.foto ? (
                          <img loading="lazy" src={p.foto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={12} className="text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-white text-xs truncate flex-1">{p?.nome || m.userId.slice(0, 8)}</span>
                      {m.instagramHandle && (
                        <span className="text-zinc-400 text-[9px] shrink-0">@{m.instagramHandle}</span>
                      )}
                    </div>
                  );
                })}
                {membrosDoTier.length > 5 && (
                  <p className="text-zinc-400 text-[9px] text-center py-1">+{membrosDoTier.length - 5} membros</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer — salvar */}
        <div className="shrink-0 px-6 py-4 border-t border-white/5">
          <button
            onClick={handleSaveTier}
            disabled={salvandoConfig}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD300] text-black font-bold text-xs rounded-xl active:scale-95 transition-all disabled:opacity-40"
          >
            <Save size={14} /> {salvandoConfig ? 'Salvando...' : `Salvar ${TIER_LABELS[tier]}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo KPIs */}
      <div className="bg-zinc-900/60 border border-[#FFD300]/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={14} className="text-[#FFD300]" />
          <p className="text-[#FFD300] font-bold text-xs">Resumo do Clube</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-wider">Total Membros</p>
            <p className="text-white font-bold text-lg">{membros.length}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-wider">Solicitações</p>
            <p className="text-white font-bold text-lg">{solicitacoesCount}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-wider">Com Dívida Social</p>
            <p className="text-amber-400 font-bold text-lg">
              {membros.filter(m => clubeService.temDividaSocial(m.userId)).length}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-wider">Bloqueados/Banidos</p>
            <p className="text-red-400 font-bold text-lg">
              {membros.filter(m => clubeService.estaBloqueado(m.userId)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tiers — lista limpa, clicável para editar */}
      <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">Tiers</p>
      {getTierOptions().map(tier => {
        const membrosDoTier = membros.filter(m => m.tier === tier);
        const limite = getLimite(tier);
        const beneficios = getBeneficios(tier);
        const benefLabels = beneficios.map(id => BENEFICIOS_DISPONIVEIS.find(b => b.id === id)?.label).filter(Boolean);
        return (
          <button
            key={tier}
            onClick={() => setEditandoTier(tier)}
            className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                style={{ borderColor: TIER_COLORS[tier] + '30', backgroundColor: TIER_COLORS[tier] + '10' }}
              >
                <Crown size={16} style={{ color: TIER_COLORS[tier] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{TIER_LABELS[tier]}</p>
                {benefLabels.length > 0 ? (
                  <p className="text-zinc-400 text-[10px] line-clamp-1">{benefLabels.join(' · ')}</p>
                ) : (
                  <p className="text-zinc-400 text-[10px]">Sem benefícios definidos</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-white text-xs font-bold">
                  {membrosDoTier.length}
                  {limite > 0 ? <span className="text-zinc-400">/{limite}</span> : ''}
                </p>
                {limite > 0 && membrosDoTier.length >= limite ? (
                  <p className="text-red-400 text-[8px] font-bold">Lotado</p>
                ) : (
                  <p className="text-zinc-400 text-[8px]">membros</p>
                )}
              </div>
              <ChevronRight size={14} className="text-zinc-400 shrink-0" />
            </div>
          </button>
        );
      })}

      {/* Regras gerais */}
      <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider mt-2">Regras Gerais</p>
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-bold">Prazo para postar</p>
            <p className="text-zinc-400 text-[9px]">Horas após o evento para publicar</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={168}
              value={d.prazoPostHoras ?? cfg?.prazoPostHoras ?? 12}
              onChange={e => setDraft('prazoPostHoras', parseInt(e.target.value) || 12)}
              className="w-14 bg-black/30 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-white/20 focus:outline-none"
            />
            <span className="text-zinc-400 text-[9px]">h</span>
          </div>
        </div>
        {/* Sistema de Infrações Progressivo */}
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-wider pt-2">Sistema de Infrações</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-bold">Limite de infrações</p>
            <p className="text-zinc-400 text-[9px]">Até bloquear (no-show + não postou)</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={10}
              value={d.infracoesLimite ?? cfg?.infracoesLimite ?? 3}
              onChange={e => setDraft('infracoesLimite', parseInt(e.target.value) || 3)}
              className="w-14 bg-black/30 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-bold">1º Bloqueio</p>
            <p className="text-zinc-400 text-[9px]">Dias bloqueado na 1ª vez</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={365}
              value={d.bloqueio1Dias ?? cfg?.bloqueio1Dias ?? 30}
              onChange={e => setDraft('bloqueio1Dias', parseInt(e.target.value) || 30)}
              className="w-14 bg-black/30 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-white/20 focus:outline-none"
            />
            <span className="text-zinc-400 text-[9px]">dias</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-xs font-bold">2º Bloqueio (reincidência)</p>
            <p className="text-zinc-400 text-[9px]">Dias + aviso de exclusão definitiva</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={365}
              value={d.bloqueio2Dias ?? cfg?.bloqueio2Dias ?? 60}
              onChange={e => setDraft('bloqueio2Dias', parseInt(e.target.value) || 60)}
              className="w-14 bg-black/30 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-white/20 focus:outline-none"
            />
            <span className="text-zinc-400 text-[9px]">dias</span>
          </div>
        </div>
      </div>

      {/* Botão salvar regras gerais */}
      {hasDraftChanges && (
        <button
          aria-label="Salvar"
          onClick={handleSaveConfig}
          disabled={salvandoConfig}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD300] text-black font-bold text-xs rounded-xl active:scale-95 transition-all disabled:opacity-40"
        >
          <Save size={14} /> {salvandoConfig ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      )}
    </div>
  );
};
