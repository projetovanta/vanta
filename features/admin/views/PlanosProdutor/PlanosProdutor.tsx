import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, Crown, Users, Bell, Calendar, DollarSign, Check, UserCheck } from 'lucide-react';
import type { PlanoProdutor, ProdutorPlano, TierMaisVanta } from '../../../../types';
import { clubeService } from '../../services/clubeService';
import { globalToast } from '../../../../components/Toast';

const TIER_LABELS: Record<TierMaisVanta, string> = {
  lista: 'Lista',
  presenca: 'Presença',
  social: 'Social',
  creator: 'Creator',
  black: 'Black',
};

const ALL_TIERS: TierMaisVanta[] = ['lista', 'presenca', 'social', 'creator', 'black'];

interface PlanoForm {
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteEventosMes: number;
  limiteResgatesEvento: number;
  tiersAcessiveis: TierMaisVanta[];
  limiteNotificacoesMes: number;
  precoEventoExtra: number;
  precoNotificacaoExtra: number;
  ativo: boolean;
  ordem: number;
}

const DEFAULT_FORM: PlanoForm = {
  nome: '',
  descricao: '',
  precoMensal: 0,
  limiteEventosMes: 5,
  limiteResgatesEvento: 20,
  tiersAcessiveis: ['lista', 'presenca'],
  limiteNotificacoesMes: 3,
  precoEventoExtra: 0,
  precoNotificacaoExtra: 0,
  ativo: true,
  ordem: 0,
};

export const PlanosProdutor: React.FC = () => {
  const [planos, setPlanos] = useState<PlanoProdutor[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<ProdutorPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null); // planoId ou 'novo'
  const [form, setForm] = useState<PlanoForm>(DEFAULT_FORM);
  const [salvando, setSalvando] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([clubeService.listarPlanosProdutor(), clubeService.listarAtribuicoesPlano()]);
      setPlanos(p);
      setAtribuicoes(a);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleNovo = () => {
    setForm(DEFAULT_FORM);
    setEditando('novo');
  };

  const handleEditar = (plano: PlanoProdutor) => {
    setForm({
      nome: plano.nome,
      descricao: plano.descricao,
      precoMensal: plano.precoMensal,
      limiteEventosMes: plano.limiteEventosMes,
      limiteResgatesEvento: plano.limiteResgatesEvento,
      tiersAcessiveis: plano.tiersAcessiveis,
      limiteNotificacoesMes: plano.limiteNotificacoesMes,
      precoEventoExtra: plano.precoEventoExtra,
      precoNotificacaoExtra: plano.precoNotificacaoExtra,
      ativo: plano.ativo,
      ordem: plano.ordem,
    });
    setEditando(plano.id);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      if (editando === 'novo') {
        await clubeService.criarPlanoProdutor(form);
      } else if (editando) {
        await clubeService.atualizarPlanoProdutor(editando, form);
      }
      setEditando(null);
      await refresh();
    } catch {
      // silent
    }
    setSalvando(false);
  };

  const handleDeletar = async (id: string) => {
    const res = await clubeService.deletarPlanoProdutor(id);
    if (!res.ok) {
      globalToast('erro', res.reason ?? 'Erro ao deletar plano');
      return;
    }
    await refresh();
  };

  const toggleTier = (tier: TierMaisVanta) => {
    setForm(prev => ({
      ...prev,
      tiersAcessiveis: prev.tiersAcessiveis.includes(tier)
        ? prev.tiersAcessiveis.filter(t => t !== tier)
        : [...prev.tiersAcessiveis, tier],
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-zinc-400 text-xs">Carregando...</span>
      </div>
    );
  }

  // ── Modal de edição ──
  if (editando) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-sm">{editando === 'novo' ? 'Novo Plano' : 'Editar Plano'}</h2>
          <button onClick={() => setEditando(null)} className="p-2 text-zinc-400 active:text-white">
            <X size="1rem" />
          </button>
        </div>

        {/* Nome */}
        <div>
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
            Nome do plano
          </label>
          <input
            value={form.nome}
            onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
            placeholder='Ex: "Básico", "Pro", "Plano Bosque Bar"'
            className="w-full px-3 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFD300]/20"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
            Descrição
          </label>
          <textarea
            value={form.descricao}
            onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 resize-none focus:outline-none focus:border-[#FFD300]/20"
          />
        </div>

        {/* Preço mensal */}
        <div className="flex items-center gap-3">
          <DollarSign size="0.875rem" className="text-emerald-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              Preço mensal (R$)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.precoMensal}
              onChange={e => setForm(p => ({ ...p, precoMensal: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
        </div>

        {/* Limites */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
              <Calendar size="0.5625rem" /> Eventos/mês
            </label>
            <input
              type="number"
              min={1}
              value={form.limiteEventosMes}
              onChange={e => setForm(p => ({ ...p, limiteEventosMes: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
              <Users size="0.5625rem" /> Resgates/evento
            </label>
            <input
              type="number"
              min={1}
              value={form.limiteResgatesEvento}
              onChange={e => setForm(p => ({ ...p, limiteResgatesEvento: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
              <Bell size="0.5625rem" /> Notificações/mês
            </label>
            <input
              type="number"
              min={0}
              value={form.limiteNotificacoesMes}
              onChange={e => setForm(p => ({ ...p, limiteNotificacoesMes: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              Ordem
            </label>
            <input
              type="number"
              min={0}
              value={form.ordem}
              onChange={e => setForm(p => ({ ...p, ordem: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
        </div>

        {/* Preço extras */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              R$ evento extra
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.precoEventoExtra}
              onChange={e => setForm(p => ({ ...p, precoEventoExtra: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
          <div>
            <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-1 block">
              R$ notif. extra
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.precoNotificacaoExtra}
              onChange={e => setForm(p => ({ ...p, precoNotificacaoExtra: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD300]/20"
            />
          </div>
        </div>

        {/* Tiers acessíveis */}
        <div>
          <label className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
            Perfis acessíveis
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_TIERS.map(tier => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-[0.625rem] font-bold border transition-all active:scale-95 ${
                  form.tiersAcessiveis.includes(tier)
                    ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-500'
                }`}
              >
                {TIER_LABELS[tier]}
              </button>
            ))}
          </div>
        </div>

        {/* Ativo */}
        <button onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))} className="flex items-center gap-2 text-sm">
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center ${form.ativo ? 'bg-[#FFD300] border-[#FFD300]' : 'border-zinc-600'}`}
          >
            {form.ativo && <Check size="0.625rem" className="text-black" />}
          </div>
          <span className={form.ativo ? 'text-white' : 'text-zinc-500'}>Plano ativo</span>
        </button>

        {/* Salvar */}
        <button
          onClick={handleSalvar}
          disabled={salvando || !form.nome.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD300] text-black font-bold text-xs rounded-xl active:scale-95 transition-all disabled:opacity-40"
        >
          <Save size="0.875rem" /> {salvando ? 'Salvando...' : 'Salvar Plano'}
        </button>
      </div>
    );
  }

  // ── Lista de planos ──
  const ativosCount = (planoId: string) =>
    atribuicoes.filter(a => a.planoId === planoId && a.status === 'ativo').length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* Header + botão novo */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-400">Planos do Produtor</p>
          <p className="text-zinc-500 text-[0.625rem]">
            {planos.length} plano{planos.length !== 1 ? 's' : ''} ·{' '}
            {atribuicoes.filter(a => a.status === 'ativo').length} produtor
            {atribuicoes.filter(a => a.status === 'ativo').length !== 1 ? 'es' : ''} ativo
            {atribuicoes.filter(a => a.status === 'ativo').length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleNovo}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.625rem] font-bold active:scale-95 transition-all"
        >
          <Plus size="0.75rem" /> Novo Plano
        </button>
      </div>

      {planos.length === 0 ? (
        <div className="text-center py-16">
          <Crown size="2rem" className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm font-semibold">Nenhum plano criado</p>
          <p className="text-zinc-500 text-[0.625rem] mt-1">
            Crie planos para que produtores possam usar o MAIS VANTA nos eventos.
          </p>
        </div>
      ) : (
        planos.map(plano => (
          <div
            key={plano.id}
            className={`bg-zinc-900/60 border rounded-2xl p-4 space-y-3 ${plano.ativo ? 'border-white/5' : 'border-red-500/20 opacity-60'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Crown size="0.875rem" className="text-[#FFD300] shrink-0" />
                  <p className="text-white font-bold text-sm truncate">{plano.nome}</p>
                  {!plano.ativo && (
                    <span className="text-[0.5rem] font-black uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                      Inativo
                    </span>
                  )}
                  {plano.personalizadoPara && (
                    <span className="text-[0.5rem] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                      Personalizado
                    </span>
                  )}
                </div>
                {plano.descricao && (
                  <p className="text-zinc-400 text-[0.625rem] mt-0.5 line-clamp-2">{plano.descricao}</p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0 ml-2">
                <button
                  onClick={() => handleEditar(plano)}
                  className="p-2 bg-zinc-800 rounded-lg border border-white/5 active:scale-90 transition-all"
                >
                  <Edit2 size="0.75rem" className="text-zinc-400" />
                </button>
                <button
                  onClick={() => handleDeletar(plano.id)}
                  className="p-2 bg-zinc-800 rounded-lg border border-white/5 active:scale-90 transition-all"
                >
                  <Trash2 size="0.75rem" className="text-red-400" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                <DollarSign size="0.5625rem" /> R${plano.precoMensal}/mês
              </span>
              <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                <Calendar size="0.5625rem" /> {plano.limiteEventosMes} eventos/mês
              </span>
              <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                <Users size="0.5625rem" /> {plano.limiteResgatesEvento} resgates/evento
              </span>
              <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                <Bell size="0.5625rem" /> {plano.limiteNotificacoesMes} notif/mês
              </span>
              <span className="flex items-center gap-1 text-zinc-400 text-[0.5625rem] bg-zinc-800/60 border border-white/5 rounded-lg px-2 py-1">
                <UserCheck size="0.5625rem" /> {ativosCount(plano.id)} produtor{ativosCount(plano.id) !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Tiers */}
            <div className="flex flex-wrap gap-1.5">
              {plano.tiersAcessiveis.map(t => (
                <span
                  key={t}
                  className="text-[0.5rem] font-bold uppercase text-[#FFD300]/80 bg-[#FFD300]/5 border border-[#FFD300]/10 px-2 py-0.5 rounded-full"
                >
                  {TIER_LABELS[t] ?? t}
                </span>
              ))}
            </div>

            {/* Extras */}
            {(plano.precoEventoExtra > 0 || plano.precoNotificacaoExtra > 0) && (
              <p className="text-zinc-500 text-[0.5625rem]">
                Extras: {plano.precoEventoExtra > 0 ? `R$${plano.precoEventoExtra}/evento` : ''}
                {plano.precoEventoExtra > 0 && plano.precoNotificacaoExtra > 0 ? ' · ' : ''}
                {plano.precoNotificacaoExtra > 0 ? `R$${plano.precoNotificacaoExtra}/notif` : ''}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};
