import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Crown,
  Layers,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
  Users,
  Calendar,
  Star,
  DollarSign,
} from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { assinaturaService } from '../services/assinaturaService';
import { VantaDropdown } from '../../../components/VantaDropdown';
import { clubeService } from '../services/clubeService';
import { maisVantaConfigService } from '../services/maisVantaConfigService';
import type { PlanoMaisVantaDef, TierMaisVantaDef, BeneficioId } from '../../../types';

type Aba = 'planos' | 'tiers';

// Labels dinâmicos a partir do config
const getBeneficiosLabel = (): Record<string, string> => {
  const map: Record<string, string> = {};
  maisVantaConfigService.getConfig().beneficiosDisponiveis.forEach(b => {
    map[b.id] = b.label;
  });
  return map;
};

// ── Modal de Plano ──────────────────────────────────────────────────────────
const PlanoModal: React.FC<{
  plano?: PlanoMaisVantaDef;
  onSave: (data: Omit<PlanoMaisVantaDef, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  onClose: () => void;
  tiers: TierMaisVantaDef[];
}> = ({ plano, onSave, onClose, tiers }) => {
  const [nome, setNome] = useState(plano?.nome ?? '');
  const [descricao, setDescricao] = useState(plano?.descricao ?? '');
  const [precoMensal, setPrecoMensal] = useState(plano?.precoMensal ?? 199);
  const [limiteEventosMV, setLimiteEventosMV] = useState(plano?.limiteEventosMV ?? 5);
  const [limiteMembros, setLimiteMembros] = useState(plano?.limiteMembros ?? 50);
  const [limiteVagasEvento, setLimiteVagasEvento] = useState(plano?.limiteVagasEvento ?? 10);
  const [tierMinimo, setTierMinimo] = useState(plano?.tierMinimo ?? 'BRONZE');
  const [acompanhante, setAcompanhante] = useState(plano?.acompanhante ?? false);
  const [prazoPostHoras, setPrazoPostHoras] = useState(plano?.prazoPostHoras ?? 12);
  const [precoAvulso, setPrecoAvulso] = useState(plano?.precoAvulso ?? 79);
  const [destaque, setDestaque] = useState(plano?.destaque ?? false);
  const [ativo, setAtivo] = useState(plano?.ativo ?? true);
  const [ordem, setOrdem] = useState(plano?.ordem ?? 0);

  const handleSubmit = () => {
    if (!nome.trim()) return;
    onSave({
      nome: nome.trim(),
      descricao: descricao.trim(),
      precoMensal,
      limiteEventosMV,
      limiteMembros,
      limiteVagasEvento,
      tierMinimo,
      acompanhante,
      prazoPostHoras,
      precoAvulso,
      destaque,
      ativo,
      ordem,
    });
  };

  const inputCls =
    'w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#FFD300]/50 focus:outline-none';
  const labelCls = 'text-[11px] text-zinc-500 uppercase tracking-wider mb-1';

  return (
    <div className="absolute inset-0 z-[200] bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pb-3 border-b border-zinc-800/50"
        style={{ paddingTop: '0.75rem' }}
      >
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <h2 style={TYPOGRAPHY.cardTitle} className="text-white text-sm">
          {plano ? 'Editar Plano' : 'Novo Plano'}
        </h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className={labelCls}>Nome *</p>
          <input className={inputCls} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pro" />
        </div>
        <div>
          <p className={labelCls}>Descrição</p>
          <input
            className={inputCls}
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Mais eventos e membros"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>Preço Mensal (R$)</p>
            <input
              type="number"
              className={inputCls}
              value={precoMensal}
              onChange={e => setPrecoMensal(Number(e.target.value))}
            />
          </div>
          <div>
            <p className={labelCls}>Preço Avulso (R$)</p>
            <input
              type="number"
              className={inputCls}
              value={precoAvulso}
              onChange={e => setPrecoAvulso(Number(e.target.value))}
            />
            <p className="text-[10px] text-zinc-600 mt-0.5">0 = gratuito</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className={labelCls}>Eventos MV</p>
            <input
              type="number"
              className={inputCls}
              value={limiteEventosMV}
              onChange={e => setLimiteEventosMV(Number(e.target.value))}
            />
            <p className="text-[10px] text-zinc-600 mt-0.5">-1 = ilimitado</p>
          </div>
          <div>
            <p className={labelCls}>Membros</p>
            <input
              type="number"
              className={inputCls}
              value={limiteMembros}
              onChange={e => setLimiteMembros(Number(e.target.value))}
            />
            <p className="text-[10px] text-zinc-600 mt-0.5">-1 = ilimitado</p>
          </div>
          <div>
            <p className={labelCls}>Vagas/Evento</p>
            <input
              type="number"
              className={inputCls}
              value={limiteVagasEvento}
              onChange={e => setLimiteVagasEvento(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>Tier Mínimo</p>
            <VantaDropdown
              value={tierMinimo}
              onChange={setTierMinimo}
              options={tiers.map(t => ({ value: t.id, label: t.nome }))}
            />
          </div>
          <div>
            <p className={labelCls}>Ordem</p>
            <input
              type="number"
              aria-label="Ordem"
              className={inputCls}
              value={ordem}
              onChange={e => setOrdem(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <p className={labelCls}>Prazo Post (horas)</p>
          <input
            type="number"
            className={inputCls}
            value={prazoPostHoras}
            onChange={e => setPrazoPostHoras(Number(e.target.value))}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <button
            onClick={() => setAcompanhante(!acompanhante)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-[#141414] border border-zinc-800/50"
          >
            {acompanhante ? (
              <ToggleRight size={20} className="text-[#FFD300]" />
            ) : (
              <ToggleLeft size={20} className="text-zinc-600" />
            )}
            <span className="text-sm text-zinc-300">Permite Acompanhante (+1)</span>
          </button>
          <button
            onClick={() => setDestaque(!destaque)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-[#141414] border border-zinc-800/50"
          >
            {destaque ? (
              <ToggleRight size={20} className="text-[#FFD300]" />
            ) : (
              <ToggleLeft size={20} className="text-zinc-600" />
            )}
            <span className="text-sm text-zinc-300">Plano Destaque (borda dourada)</span>
          </button>
          <button
            onClick={() => setAtivo(!ativo)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-[#141414] border border-zinc-800/50"
          >
            {ativo ? (
              <ToggleRight size={20} className="text-emerald-400" />
            ) : (
              <ToggleLeft size={20} className="text-zinc-600" />
            )}
            <span className="text-sm text-zinc-300">Ativo (visível para assinatura)</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t border-zinc-800/50">
        <button
          onClick={handleSubmit}
          disabled={!nome.trim()}
          className="w-full py-3 rounded-xl bg-[#FFD300] text-black font-bold text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {plano ? 'Salvar Alterações' : 'Criar Plano'}
        </button>
      </div>
    </div>
  );
};

// ── Modal de Tier ───────────────────────────────────────────────────────────
const getTodosBeneficios = (): BeneficioId[] =>
  maisVantaConfigService.getConfig().beneficiosDisponiveis.map(b => b.id as BeneficioId);

const TierModal: React.FC<{
  tier?: TierMaisVantaDef;
  onSave: (data: Omit<TierMaisVantaDef, 'criadoEm'>) => void;
  onClose: () => void;
}> = ({ tier, onSave, onClose }) => {
  const [id, setId] = useState(tier?.id ?? '');
  const [nome, setNome] = useState(tier?.nome ?? '');
  const [cor, setCor] = useState(tier?.cor ?? '#CD7F32');
  const [ordem, setOrdem] = useState(tier?.ordem ?? 1);
  const [beneficios, setBeneficios] = useState<BeneficioId[]>(tier?.beneficios ?? []);
  const [limiteMensal, setLimiteMensal] = useState(tier?.limiteMensal ?? 5);
  const [ativo, setAtivo] = useState(tier?.ativo ?? true);

  const toggleBeneficio = (b: BeneficioId) => {
    setBeneficios(prev => (prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]));
  };

  const handleSubmit = () => {
    if (!id.trim() || !nome.trim()) return;
    onSave({ id: id.trim().toUpperCase(), nome: nome.trim(), cor, ordem, beneficios, limiteMensal, ativo });
  };

  const inputCls =
    'w-full bg-[#1A1A1A] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#FFD300]/50 focus:outline-none';
  const labelCls = 'text-[11px] text-zinc-500 uppercase tracking-wider mb-1';

  return (
    <div className="absolute inset-0 z-[200] bg-[#0A0A0A] flex flex-col">
      <div
        className="shrink-0 flex items-center gap-3 px-4 pb-3 border-b border-zinc-800/50"
        style={{ paddingTop: '0.75rem' }}
      >
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <h2 style={TYPOGRAPHY.cardTitle} className="text-white text-sm">
          {tier ? 'Editar Tier' : 'Novo Tier'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>ID (ex: PLATINA) *</p>
            <input
              className={inputCls}
              value={id}
              onChange={e => setId(e.target.value)}
              disabled={!!tier}
              placeholder="PLATINA"
            />
          </div>
          <div>
            <p className={labelCls}>Nome *</p>
            <input className={inputCls} value={nome} onChange={e => setNome(e.target.value)} placeholder="Platina" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className={labelCls}>Cor</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cor}
                onChange={e => setCor(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <input
                aria-label="Cor do plano"
                className={inputCls}
                value={cor}
                onChange={e => setCor(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className={labelCls}>Ordem</p>
            <input
              type="number"
              aria-label="Ordem"
              className={inputCls}
              value={ordem}
              onChange={e => setOrdem(Number(e.target.value))}
            />
          </div>
          <div>
            <p className={labelCls}>Limite/Mês</p>
            <input
              type="number"
              className={inputCls}
              value={limiteMensal}
              onChange={e => setLimiteMensal(Number(e.target.value))}
            />
            <p className="text-[10px] text-zinc-600 mt-0.5">-1 = ilimitado</p>
          </div>
        </div>

        <div>
          <p className={labelCls}>Benefícios</p>
          <div className="space-y-2 mt-1">
            {getTodosBeneficios().map(b => (
              <button
                key={b}
                onClick={() => toggleBeneficio(b)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-colors ${beneficios.includes(b) ? 'bg-[#FFD300]/10 border-[#FFD300]/30' : 'bg-[#141414] border-zinc-800/50'}`}
              >
                <div
                  className={`w-4 h-4 rounded border ${beneficios.includes(b) ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
                />
                <span className="text-sm text-zinc-300">{getBeneficiosLabel()[b] ?? b}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setAtivo(!ativo)}
          className="flex items-center gap-3 w-full p-3 rounded-xl bg-[#141414] border border-zinc-800/50"
        >
          {ativo ? (
            <ToggleRight size={20} className="text-emerald-400" />
          ) : (
            <ToggleLeft size={20} className="text-zinc-600" />
          )}
          <span className="text-sm text-zinc-300">Ativo</span>
        </button>
      </div>

      <div className="shrink-0 p-4 border-t border-zinc-800/50">
        <button
          onClick={handleSubmit}
          disabled={!id.trim() || !nome.trim()}
          className="w-full py-3 rounded-xl bg-[#FFD300] text-black font-bold text-sm uppercase tracking-wider disabled:opacity-40"
        >
          {tier ? 'Salvar Alterações' : 'Criar Tier'}
        </button>
      </div>
    </div>
  );
};

// ── View Principal ──────────────────────────────────────────────────────────
export const PlanosMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [aba, setAba] = useState<Aba>('planos');
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState<
    { tipo: 'plano'; plano?: PlanoMaisVantaDef } | { tipo: 'tier'; tier?: TierMaisVantaDef } | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmarDesativar, setConfirmarDesativar] = useState<string | null>(null);

   
  const planos = useMemo(() => assinaturaService.getTodosPlanos(), []);
   
  const tiers = useMemo(() => clubeService.getTodosTiers(), []);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  // ── Handlers Plano ─────────────────────────────────────────────────────
  const handleSavePlano = async (data: Omit<PlanoMaisVantaDef, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    setLoading(true);
    try {
      if (modal?.tipo === 'plano' && modal.plano) {
        await assinaturaService.editarPlano(modal.plano.id, data);
        flash('Plano atualizado');
      } else {
        await assinaturaService.criarPlano(data);
        flash('Plano criado');
      }
      setModal(null);
      setTick(t => t + 1);
    } catch (e) {
      flash(`Erro: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDesativarPlano = async (planoId: string) => {
    setLoading(true);
    const result = await assinaturaService.desativarPlano(planoId);
    if (!result.ok) {
      flash(result.reason ?? 'Erro');
    } else {
      flash('Plano desativado');
    }
    setTick(t => t + 1);
    setLoading(false);
  };

  // ── Handlers Tier ──────────────────────────────────────────────────────
  const handleSaveTier = async (data: Omit<TierMaisVantaDef, 'criadoEm'>) => {
    setLoading(true);
    try {
      if (modal?.tipo === 'tier' && modal.tier) {
        await clubeService.editarTier(modal.tier.id, data);
        flash('Tier atualizado');
      } else {
        await clubeService.criarTier(data);
        flash('Tier criado');
      }
      setModal(null);
      setTick(t => t + 1);
    } catch (e) {
      flash(`Erro: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} className="text-zinc-400" />
        </button>
        <Crown size={18} className="text-[#FFD300]" />
        <h2 style={TYPOGRAPHY.cardTitle} className="text-white text-sm">
          Planos & Tiers
        </h2>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-zinc-800/50">
        <button
          onClick={() => setAba('planos')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors ${aba === 'planos' ? 'text-[#FFD300] border-b-2 border-[#FFD300]' : 'text-zinc-500'}`}
        >
          <DollarSign size={14} className="inline mr-1" />
          Planos
        </button>
        <button
          onClick={() => setAba('tiers')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors ${aba === 'tiers' ? 'text-[#FFD300] border-b-2 border-[#FFD300]' : 'text-zinc-500'}`}
        >
          <Layers size={14} className="inline mr-1" />
          Tiers
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className="shrink-0 mx-4 mt-2 px-3 py-2 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] text-xs text-center">
          {msg}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {aba === 'planos' ? (
          <>
            {/* Botão criar */}
            <button
              onClick={() => setModal({ tipo: 'plano' })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:border-[#FFD300]/40 hover:text-[#FFD300] transition-colors text-sm"
            >
              <Plus size={16} /> Criar Plano
            </button>

            {planos.map(p => {
              const assinantes = assinaturaService.getAssinantesPlano(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-colors ${p.destaque ? 'border-[#FFD300]/30 bg-[#FFD300]/5' : 'border-zinc-800/50 bg-[#141414]'} ${!p.ativo ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-sm truncate">{p.nome}</h3>
                        {p.destaque && <Star size={12} className="text-[#FFD300] shrink-0" />}
                        {!p.ativo && (
                          <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Inativo
                          </span>
                        )}
                      </div>
                      {p.descricao && <p className="text-zinc-500 text-xs mt-0.5 truncate">{p.descricao}</p>}
                    </div>
                    <p className="text-[#FFD300] font-bold text-lg shrink-0">
                      R$ {p.precoMensal}
                      <span className="text-zinc-600 text-[10px]">/mês</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Calendar size={10} />
                      {p.limiteEventosMV === -1 ? '∞' : p.limiteEventosMV} eventos
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Users size={10} />
                      {p.limiteMembros === -1 ? '∞' : p.limiteMembros} membros
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full">
                      {p.limiteVagasEvento} vagas/evento
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full">
                      Avulso: R$ {p.precoAvulso}
                    </span>
                    {p.acompanhante && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        +1 OK
                      </span>
                    )}
                    {assinantes > 0 && (
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                        {assinantes} assinante{assinantes > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setModal({ tipo: 'plano', plano: p })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-xs hover:bg-white/10"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    {p.ativo ? (
                      <button
                        onClick={() => setConfirmarDesativar(p.id)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 disabled:opacity-40"
                      >
                        <ToggleLeft size={12} /> Desativar
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await assinaturaService.editarPlano(p.id, { ativo: true });
                            flash('Plano reativado');
                            setTick(t => t + 1);
                          } catch (e) {
                            flash(`Erro: ${(e as Error).message}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 disabled:opacity-40"
                      >
                        <ToggleRight size={12} /> Reativar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {planos.length === 0 && <p className="text-center text-zinc-600 text-sm py-8">Nenhum plano cadastrado</p>}
          </>
        ) : (
          <>
            {/* Botão criar tier */}
            <button
              onClick={() => setModal({ tipo: 'tier' })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:border-[#FFD300]/40 hover:text-[#FFD300] transition-colors text-sm"
            >
              <Plus size={16} /> Criar Tier
            </button>

            {tiers.map((t, idx) => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border border-zinc-800/50 bg-[#141414] ${!t.ativo ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: t.cor }} />
                    <h3 className="text-white font-bold text-sm truncate">{t.nome}</h3>
                    <span className="text-[10px] text-zinc-600">#{t.ordem}</span>
                    {!t.ativo && (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={async () => {
                          const prev = tiers[idx - 1];
                          await clubeService.editarTier(t.id, { ordem: prev.ordem });
                          await clubeService.editarTier(prev.id, { ordem: t.ordem });
                          setTick(x => x + 1);
                        }}
                        className="p-1 rounded hover:bg-white/5"
                      >
                        <ChevronUp size={14} className="text-zinc-500" />
                      </button>
                    )}
                    {idx < tiers.length - 1 && (
                      <button
                        onClick={async () => {
                          const next = tiers[idx + 1];
                          await clubeService.editarTier(t.id, { ordem: next.ordem });
                          await clubeService.editarTier(next.id, { ordem: t.ordem });
                          setTick(x => x + 1);
                        }}
                        className="p-1 rounded hover:bg-white/5"
                      >
                        <ChevronDown size={14} className="text-zinc-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Benefícios */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.beneficios.map(b => (
                    <span key={b} className="text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                      {getBeneficiosLabel()[b] ?? b}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-zinc-500">
                    Limite/mês: {t.limiteMensal === -1 ? '∞' : t.limiteMensal}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setModal({ tipo: 'tier', tier: t })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-xs hover:bg-white/10"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  {t.ativo ? (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await clubeService.editarTier(t.id, { ativo: false });
                          flash('Tier desativado');
                          setTick(x => x + 1);
                        } catch (e) {
                          flash(`Erro: ${(e as Error).message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 disabled:opacity-40"
                    >
                      <ToggleLeft size={12} /> Desativar
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await clubeService.editarTier(t.id, { ativo: true });
                          flash('Tier reativado');
                          setTick(x => x + 1);
                        } catch (e) {
                          flash(`Erro: ${(e as Error).message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      <ToggleRight size={12} /> Reativar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {tiers.length === 0 && <p className="text-center text-zinc-600 text-sm py-8">Nenhum tier cadastrado</p>}
          </>
        )}
      </div>

      {/* Modais */}
      {modal?.tipo === 'plano' && (
        <PlanoModal
          plano={modal.plano}
          tiers={tiers.filter(t => t.ativo)}
          onSave={handleSavePlano}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'tier' && <TierModal tier={modal.tier} onSave={handleSaveTier} onClose={() => setModal(null)} />}

      {/* Modal confirmação desativar */}
      {confirmarDesativar && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => !loading && setConfirmarDesativar(null)}
        >
          <div
            className="w-full max-w-xs bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm text-center">Desativar plano?</p>
            <p className="text-zinc-500 text-[10px] text-center leading-relaxed">
              O plano será desativado e não poderá ser adquirido por novas comunidades. Assinaturas existentes não são
              afetadas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmarDesativar(null)}
                disabled={loading}
                className="flex-1 py-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                Voltar
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  await handleDesativarPlano(confirmarDesativar);
                  setConfirmarDesativar(null);
                }}
                className="flex-1 py-3 bg-red-500 rounded-xl text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40"
              >
                {loading ? 'Aguarde...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
