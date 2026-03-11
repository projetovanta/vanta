import React, { useMemo, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Gift, Crown, Users, Eye, Lock, Percent } from 'lucide-react';
import type { GeneroIngresso, TierMaisVanta } from '../../../../types';
import { TIPOS_COMPROVANTE_MEIA } from '../../../../types';
import { clubeService } from '../../services/clubeService';
import { assinaturaService } from '../../services/assinaturaService';
import type { LoteForm, VariacaoForm, VarListaForm } from './types';
import { inputCls, inputSmCls, inputDateCls, labelCls, AREA_LABELS } from './constants';
import { uid, novaVar, buildLabel } from './utils';
import { VantaDropdown } from '../../../../components/VantaDropdown';
import { VantaDatePicker } from '../../../../components/VantaDatePicker';
import { VantaTimePicker } from '../../../../components/VantaTimePicker';

/** Benefício MV por tier — liga tier → lote real ou lista real do evento */
export interface BeneficioMVForm {
  tierId: string;
  ativo: boolean;
  tipo: 'ingresso' | 'lista'; // qual referência usar
  loteId: string; // ID do lote (se tipo=ingresso)
  listaVarId: string; // ID da varLista (se tipo=lista) — resolverá para lista_id no save
  descontoPercentual: string; // 0-100 (se tier=lista)
  creatorSublevelMinimo: string; // 'creator_200k' | 'creator_500k' | 'creator_1m' | ''
  vagasLimite: string; // limite de vagas (vazio = sem limite)
}

export interface MaisVantaEventoForm {
  enabled: boolean;
  beneficios: BeneficioMVForm[];
}

/** @deprecated manter para compat com imports legados */
export interface TierEventoMV {
  tierId: string;
  ativo: boolean;
  quantidade: string;
  acompanhantes: string;
  tipoAcesso: string;
}

/** @deprecated manter para compat com imports legados */
export interface LoteMaisVantaForm {
  enabled: boolean;
  tierMinimo: TierMaisVanta;
  quantidade: string;
  prazo: string;
  descricao: string;
  comAcompanhante: boolean;
  tiers?: TierEventoMV[];
}

interface Props {
  lotes: LoteForm[];
  setLotes: React.Dispatch<React.SetStateAction<LoteForm[]>>;
  cortesiaEnabled?: boolean;
  setCortesiaEnabled?: (v: boolean) => void;
  cortesiaLimites?: Record<string, string>;
  setCortesiaLimites?: (v: Record<string, string>) => void;
  varTipos: string[];
  maisVantaEvento?: MaisVantaEventoForm;
  setMaisVantaEvento?: (v: MaisVantaEventoForm) => void;
  /** Variações de lista do Step3 — para vincular benefício MV a lista */
  varsLista?: VarListaForm[];
  comunidadeId?: string;
  /** Se true, bloqueia edição de preço em variações com vendidos > 0 */
  isPublished?: boolean;
  /** @deprecated compat — usar maisVantaEvento */
  maisVanta?: LoteMaisVantaForm;
  /** @deprecated compat — usar setMaisVantaEvento */
  setMaisVanta?: (v: LoteMaisVantaForm) => void;
}

// Tiers dinâmicos com fallback legado — black excluído (contato direto via curadoria)
const TIER_LABELS_PRODUTOR: Record<string, string> = {
  lista: 'Público geral',
  presenca: 'Presença visual',
  social: 'Conexão social',
  creator: 'Criadores de conteúdo',
};
const TIER_DESC_PRODUTOR: Record<string, string> = {
  lista: 'Pessoas que recebem promoções e ofertas do evento',
  presenca: 'Pessoas que elevam o ambiente visualmente — modelos, estilo marcante',
  social: 'Pessoas bem relacionadas que trazem grupo e circulam nos lugares certos',
  creator: 'Influencers que vão gerar visibilidade pro evento',
};
const getTierOptions = (): { id: string; label: string; cor: string }[] => {
  const dynamic = clubeService.getTiers();
  if (dynamic.length > 0) {
    return dynamic
      .filter(t => t.id !== 'black')
      .map(t => ({ id: t.id, label: TIER_LABELS_PRODUTOR[t.id] ?? t.nome, cor: t.cor ?? '#666' }));
  }
  return [
    { id: 'lista', label: 'Lista exclusiva', cor: '#888' },
    { id: 'presenca', label: 'Presença & Ambiente', cor: '#C0C0C0' },
    { id: 'social', label: 'Social & Networking', cor: '#A0A0D0' },
    { id: 'creator', label: 'Criadores de conteúdo', cor: '#FFD700' },
  ];
};

const formatAlcance = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const Step2Ingressos: React.FC<Props> = ({
  lotes,
  setLotes,
  cortesiaEnabled,
  setCortesiaEnabled,
  cortesiaLimites,
  setCortesiaLimites,
  varTipos,
  maisVantaEvento,
  setMaisVantaEvento,
  varsLista,
  comunidadeId,
  isPublished,
}) => {
  const assinaturaAtiva = useMemo(
    () => (comunidadeId ? assinaturaService.isAtiva(comunidadeId) : true),
    [comunidadeId],
  );
  const tierOptions = useMemo(() => getTierOptions(), []);
  const eventosMVUsados = comunidadeId ? assinaturaService.getEventosMVUsados(comunidadeId) : 0;
  const limiteEventosMV = comunidadeId ? assinaturaService.getLimiteEventosMV(comunidadeId) : 0;
  const cotaDisponivel = comunidadeId ? assinaturaService.cotaDisponivel(comunidadeId) : true;

  // Inicializar benefícios se não existem
  const beneficios = useMemo(() => {
    if (maisVantaEvento?.beneficios && maisVantaEvento.beneficios.length > 0) return maisVantaEvento.beneficios;
    return tierOptions.map(t => ({
      tierId: t.id,
      ativo: false,
      tipo: 'ingresso' as const,
      loteId: '',
      listaVarId: '',
      descontoPercentual: '0',
      creatorSublevelMinimo: '',
      vagasLimite: '',
    }));
  }, [maisVantaEvento?.beneficios, tierOptions]);

  // Opções de lotes para dropdown
  const loteOptions = useMemo(() => {
    return lotes.map((l, i) => ({ value: l.id, label: `Lote ${i + 1}` }));
  }, [lotes]);

  // Opções de listas para dropdown
  const listaOptions = useMemo(() => {
    if (!varsLista?.length) return [];
    return varsLista.map(v => ({ value: v.id, label: buildLabel(v) }));
  }, [varsLista]);

  const temLotesOuListas = loteOptions.length > 0 || listaOptions.length > 0;

  const alcanceEstimado = useMemo(() => {
    if (!maisVantaEvento?.enabled) return null;
    let totalMembros = 0,
      totalAlcance = 0;
    for (const b of beneficios) {
      if (!b.ativo) continue;
      const membros = clubeService.getAllMembros().filter(m => m.ativo && m.tier === b.tierId);
      totalMembros += membros.length;
      totalAlcance += membros.reduce((s, m) => s + (m.instagramSeguidores ?? 0), 0);
    }
    return totalMembros > 0 ? { membros: totalMembros, alcance: totalAlcance } : null;
  }, [maisVantaEvento?.enabled, beneficios]);
  // Sanitizar cortesiaLimites: remover tipos que não existem mais nos lotes
  useEffect(() => {
    if (!cortesiaEnabled || !setCortesiaLimites || varTipos.length === 0) return;
    const keysAtuais = Object.keys(cortesiaLimites ?? {});
    const orfaos = keysAtuais.filter(k => !varTipos.includes(k));
    if (orfaos.length > 0) {
      const limpo = { ...(cortesiaLimites ?? {}) };
      for (const k of orfaos) delete limpo[k];
      setCortesiaLimites(limpo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varTipos.join(',')]);

  const updateLote = (id: string, field: keyof LoteForm, value: any) =>
    setLotes(prev => prev.map(l => (l.id !== id ? l : { ...l, [field]: value })));
  const updateVarBool = (loteId: string, varId: string, field: keyof VariacaoForm, value: boolean) =>
    setLotes(prev =>
      prev.map(l =>
        l.id !== loteId
          ? l
          : {
              ...l,
              variacoes: l.variacoes.map(v => (v.id !== varId ? v : { ...v, [field]: value })),
            },
      ),
    );
  const updateVar = (loteId: string, varId: string, field: keyof VariacaoForm, value: string) =>
    setLotes(prev =>
      prev.map(l =>
        l.id !== loteId
          ? l
          : {
              ...l,
              variacoes: l.variacoes.map(v => (v.id !== varId ? v : { ...v, [field]: value })),
            },
      ),
    );
  const addVar = (loteId: string) =>
    setLotes(prev => prev.map(l => (l.id !== loteId ? l : { ...l, variacoes: [...l.variacoes, novaVar()] })));
  const removeVar = (loteId: string, varId: string) =>
    setLotes(prev =>
      prev.map(l => (l.id !== loteId ? l : { ...l, variacoes: l.variacoes.filter(v => v.id !== varId) })),
    );
  const removeLote = (id: string) => setLotes(prev => prev.filter(l => l.id !== id));
  const addLote = () => {
    const ultimo = lotes[lotes.length - 1];
    const novasVars: VariacaoForm[] = ultimo.variacoes.map(v => ({
      ...novaVar(),
      area: v.area,
      areaCustom: v.areaCustom,
      genero: v.genero,
    }));
    setLotes(prev => [
      ...prev.map((l, i) => (i === prev.length - 1 ? { ...l, aberto: false } : l)),
      { id: uid(), dataValidade: '', horaValidade: '', virarPct: '', variacoes: novasVars, aberto: true },
    ]);
  };

  return (
    <div className="space-y-4">
      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">
        Ao menos um lote obrigatório. Quando esgotar, o próximo ativa automaticamente.
      </p>
      {lotes.map((lote, idx) => (
        <div key={lote.id} className="border border-white/5 bg-zinc-900/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <p className="text-white font-bold text-sm flex-1">Lote {idx + 1}</p>
            {lotes.length > 1 && (
              <button
                onClick={() => removeLote(lote.id)}
                className="text-zinc-700 active:text-red-400 transition-colors p-1"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button onClick={() => updateLote(lote.id, 'aberto', !lote.aberto)} className="text-zinc-400 p-1">
              {lote.aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {lote.aberto && (
            <div className="p-4 space-y-4">
              <div>
                <label className={labelCls}>Válido até (opcional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <VantaDatePicker
                    value={lote.dataValidade}
                    onChange={v => updateLote(lote.id, 'dataValidade', v)}
                    className={inputDateCls}
                  />
                  <VantaTimePicker
                    value={lote.horaValidade}
                    onChange={v => updateLote(lote.id, 'horaValidade', v)}
                    className={inputDateCls}
                  />
                </div>
                <p className="text-[8px] text-zinc-700 mt-1 font-black uppercase tracking-widest">
                  Ex: virada de lote às 14h do dia X
                </p>
              </div>

              {lotes.length > 1 && (
                <div>
                  <label className={labelCls}>Virar quando % vendido (opcional)</label>
                  <div className="relative w-32">
                    <input
                      value={lote.virarPct}
                      onChange={e => updateLote(lote.id, 'virarPct', e.target.value)}
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ex: 80"
                      className={inputSmCls + ' w-full pr-7'}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[11px] font-bold">
                      %
                    </span>
                  </div>
                  <p className="text-[8px] text-zinc-700 mt-1 font-black uppercase tracking-widest">
                    Ao atingir esse %, ativa o próximo lote
                  </p>
                </div>
              )}

              <div>
                <label className={labelCls}>Variações *</label>
                <div className="space-y-3">
                  {lote.variacoes.map(v => (
                    <div key={v.id} className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <VantaDropdown
                          value={v.area}
                          onChange={val => updateVar(lote.id, v.id, 'area', val)}
                          options={AREA_LABELS.map(a => ({ value: a.id, label: a.label }))}
                          className="flex-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          {(['MASCULINO', 'FEMININO', 'UNISEX'] as GeneroIngresso[]).map(g => (
                            <button
                              key={g}
                              onClick={() => updateVar(lote.id, v.id, 'genero', g)}
                              className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${
                                v.genero === g
                                  ? 'bg-[#FFD300] border-[#FFD300] text-black'
                                  : 'bg-zinc-800 border-white/5 text-zinc-400'
                              }`}
                            >
                              {g === 'MASCULINO' ? 'M' : g === 'FEMININO' ? 'F' : 'U'}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => lote.variacoes.length > 1 && removeVar(lote.id, v.id)}
                          disabled={lote.variacoes.length === 1}
                          className="text-zinc-700 active:text-red-400 transition-colors p-1 shrink-0 disabled:opacity-30"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {v.area === 'OUTRO' && (
                        <input
                          value={v.areaCustom}
                          onChange={e => updateVar(lote.id, v.id, 'areaCustom', e.target.value)}
                          placeholder="Nome da área..."
                          className={inputSmCls + ' w-full'}
                        />
                      )}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[11px] font-bold">
                            R$
                          </span>
                          <input
                            value={v.valor}
                            onChange={e => updateVar(lote.id, v.id, 'valor', e.target.value)}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            disabled={!!(isPublished && v.vendidos && v.vendidos > 0)}
                            title={
                              isPublished && v.vendidos && v.vendidos > 0
                                ? 'Preço travado — lote com vendas'
                                : undefined
                            }
                            className={
                              inputSmCls +
                              ' w-full pl-8' +
                              (isPublished && v.vendidos && v.vendidos > 0 ? ' opacity-50 cursor-not-allowed' : '')
                            }
                          />
                        </div>
                        <div className="relative w-24">
                          <input
                            value={v.limite}
                            onChange={e => updateVar(lote.id, v.id, 'limite', e.target.value)}
                            type="number"
                            min="1"
                            placeholder="Limite"
                            className={inputSmCls + ' w-full'}
                          />
                        </div>
                      </div>
                      {/* Meia-entrada */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateVarBool(lote.id, v.id, 'requerComprovante', !v.requerComprovante)}
                          className={`w-8 h-5 rounded-full border relative transition-all shrink-0 ${
                            v.requerComprovante ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-zinc-800 border-white/10'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                              v.requerComprovante ? 'left-3.5 bg-cyan-400' : 'left-0.5 bg-zinc-600'
                            }`}
                          />
                        </button>
                        <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
                          Meia-entrada
                        </span>
                      </div>
                      {v.requerComprovante && (
                        <VantaDropdown
                          value={v.tipoComprovante}
                          onChange={val => updateVar(lote.id, v.id, 'tipoComprovante', val)}
                          placeholder="Qualquer comprovante"
                          options={TIPOS_COMPROVANTE_MEIA.map(t => ({ value: t.id, label: t.label }))}
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addVar(lote.id)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-white/10 rounded-xl text-zinc-400 text-[9px] font-black uppercase tracking-widest active:border-[#FFD300]/20 active:text-[#FFD300]/50 transition-all"
                >
                  <Plus size={11} /> Adicionar variação
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={addLote}
        className="w-full flex items-center justify-center gap-2 py-3.5 border border-[#FFD300]/20 bg-[#FFD300]/5 rounded-2xl text-[#FFD300] text-[9px] font-black uppercase tracking-widest active:scale-[0.98] transition-all"
      >
        <Plus size={13} /> Adicionar Lote {lotes.length + 1}
      </button>

      {/* ── MAIS VANTA (Clube de Influência) ── */}
      {maisVantaEvento && setMaisVantaEvento && !assinaturaAtiva && comunidadeId && (
        <div className="border-t border-white/5 pt-5 mt-2">
          <div className="flex items-center gap-3 p-5 rounded-2xl border border-white/5 bg-zinc-900/40">
            <Lock size={16} className="text-zinc-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white">MAIS VANTA</p>
              <p className="text-zinc-400 text-[10px] mt-1">
                Ative a assinatura MAIS VANTA para disponibilizar benefícios de influência nesta comunidade.
              </p>
            </div>
          </div>
        </div>
      )}
      {maisVantaEvento && setMaisVantaEvento && (assinaturaAtiva || !comunidadeId) && (
        <div className="border-t border-white/5 pt-5 mt-2">
          <button
            onClick={() => setMaisVantaEvento({ ...maisVantaEvento, enabled: !maisVantaEvento.enabled })}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${maisVantaEvento.enabled ? 'bg-[#FFD300]/5 border-[#FFD300]/25' : 'bg-zinc-900/40 border-white/5'}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Crown
                size={16}
                className={maisVantaEvento.enabled ? 'text-[#FFD300] shrink-0' : 'text-zinc-400 shrink-0'}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm leading-none ${maisVantaEvento.enabled ? 'text-[#FFD300]' : 'text-white'}`}
                >
                  MAIS VANTA
                </p>
                <p className="text-zinc-400 text-[10px] mt-1">Vincule benefícios exclusivos a ingressos ou listas</p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full border relative transition-all shrink-0 ml-3 ${maisVantaEvento.enabled ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${maisVantaEvento.enabled ? 'left-6 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
              />
            </div>
          </button>

          {/* Contador de cota MV */}
          {maisVantaEvento.enabled && comunidadeId && assinaturaAtiva && limiteEventosMV !== -1 && (
            <div className="mt-3 px-1">
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${cotaDisponivel ? 'bg-[#FFD300]/5 border-[#FFD300]/15' : 'bg-red-500/5 border-red-500/15'}`}
              >
                <span className="text-zinc-400 text-[10px]">Eventos MV usados</span>
                <span className={`text-xs font-bold ${cotaDisponivel ? 'text-[#FFD300]' : 'text-red-400'}`}>
                  {eventosMVUsados} de {limiteEventosMV}
                </span>
              </div>
              {!cotaDisponivel && (
                <p className="text-red-400 text-[10px] mt-1.5">
                  Cota esgotada. Compre avulso (R$ {assinaturaService.getPrecoAvulso(comunidadeId)}) ou faça upgrade do
                  plano.
                </p>
              )}
            </div>
          )}

          {maisVantaEvento.enabled && (
            <div className="space-y-3 px-1 mt-4">
              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                Benefícios por nível de membro
              </p>

              {!temLotesOuListas && (
                <p className="text-zinc-500 text-[10px] py-3">
                  Crie ingressos (acima) ou listas (próximo passo) para vincular benefícios.
                </p>
              )}

              {temLotesOuListas && (
                <div className="space-y-2">
                  {beneficios.map((b, i) => {
                    const tierOpt = tierOptions.find(t => t.id === b.tierId);
                    const cor = tierOpt?.cor ?? '#666';
                    const nome = tierOpt?.label ?? b.tierId;
                    const isDesconto = b.tierId === 'lista';

                    const updateBeneficio = (field: keyof BeneficioMVForm, value: string | boolean) => {
                      const next = [...beneficios];
                      next[i] = { ...next[i], [field]: value };
                      // Ao trocar tipo, limpar referência
                      if (field === 'tipo') {
                        next[i].loteId = '';
                        next[i].listaVarId = '';
                      }
                      setMaisVantaEvento({ ...maisVantaEvento, beneficios: next });
                    };

                    return (
                      <div
                        key={b.tierId}
                        className={`rounded-xl border transition-all ${b.ativo ? 'bg-zinc-900/60 border-white/10' : 'bg-zinc-900/30 border-white/5 opacity-50'}`}
                      >
                        {/* Header: toggle + nome perfil + descrição */}
                        <button
                          onClick={() => updateBeneficio('ativo', !b.ativo)}
                          className="w-full flex items-center gap-3 px-4 py-3"
                        >
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-white text-xs font-bold">{nome}</span>
                            {TIER_DESC_PRODUTOR[b.tierId] && (
                              <p className="text-zinc-500 text-[9px] mt-0.5 line-clamp-1">
                                {TIER_DESC_PRODUTOR[b.tierId]}
                              </p>
                            )}
                          </div>
                          <div
                            className={`w-10 h-5 rounded-full border relative transition-all shrink-0 ${b.ativo ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${b.ativo ? 'left-5 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
                            />
                          </div>
                        </button>

                        {/* Campos expandidos */}
                        {b.ativo && (
                          <div className="px-4 pb-3 space-y-2">
                            {/* Tipo: ingresso ou lista */}
                            <div>
                              <label className="text-zinc-400 text-[8px] font-black uppercase">Tipo de benefício</label>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => updateBeneficio('tipo', 'ingresso')}
                                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${b.tipo === 'ingresso' ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]' : 'bg-zinc-800/50 border-white/5 text-zinc-400'}`}
                                >
                                  Ingresso
                                </button>
                                {listaOptions.length > 0 && (
                                  <button
                                    onClick={() => updateBeneficio('tipo', 'lista')}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${b.tipo === 'lista' ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]' : 'bg-zinc-800/50 border-white/5 text-zinc-400'}`}
                                  >
                                    Lista
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Vincular a lote ou lista */}
                            <div>
                              <label className="text-zinc-400 text-[8px] font-black uppercase">
                                {b.tipo === 'ingresso' ? 'Vincular a lote' : 'Vincular a lista'}
                              </label>
                              <VantaDropdown
                                value={b.tipo === 'ingresso' ? b.loteId : b.listaVarId}
                                onChange={val => updateBeneficio(b.tipo === 'ingresso' ? 'loteId' : 'listaVarId', val)}
                                options={b.tipo === 'ingresso' ? loteOptions : listaOptions}
                                placeholder="Selecione..."
                                className="w-full mt-1"
                              />
                            </div>

                            {/* Desconto (somente tier lista) */}
                            {isDesconto && (
                              <div>
                                <label className="text-zinc-400 text-[8px] font-black uppercase flex items-center gap-1">
                                  <Percent size={10} /> Desconto
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={b.descontoPercentual}
                                    onChange={e => updateBeneficio('descontoPercentual', e.target.value)}
                                    className={inputSmCls + ' w-20 text-center'}
                                  />
                                  <span className="text-zinc-400 text-[10px]">%</span>
                                </div>
                              </div>
                            )}

                            {/* Sub-nível creator */}
                            {b.tierId === 'creator' && (
                              <div>
                                <label className="text-zinc-400 text-[8px] font-black uppercase">
                                  A partir de qual faixa
                                </label>
                                <div className="flex gap-1.5 mt-1">
                                  {[
                                    { value: 'creator_200k', label: '200K+' },
                                    { value: 'creator_500k', label: '500K+' },
                                    { value: 'creator_1m', label: '1M+' },
                                  ].map(opt => (
                                    <button
                                      key={opt.value}
                                      onClick={() =>
                                        updateBeneficio(
                                          'creatorSublevelMinimo',
                                          b.creatorSublevelMinimo === opt.value ? '' : opt.value,
                                        )
                                      }
                                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                        b.creatorSublevelMinimo === opt.value
                                          ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
                                          : 'bg-zinc-800/50 border-white/5 text-zinc-400'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Limite de vagas */}
                            <div>
                              <label className="text-zinc-400 text-[8px] font-black uppercase">Limite de vagas</label>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={b.vagasLimite}
                                  onChange={e => updateBeneficio('vagasLimite', e.target.value)}
                                  placeholder="Sem limite"
                                  className={inputSmCls + ' w-24 text-center'}
                                />
                                <span className="text-zinc-500 text-[9px]">
                                  {b.vagasLimite ? 'vagas' : 'sem limite'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* VANTA BLACK — read-only */}
                  <div className="rounded-xl border bg-zinc-900/30 border-white/5 opacity-60 px-4 py-3 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0 bg-black border border-white/20" />
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-xs font-bold">Perfil premium</span>
                      <p className="text-zinc-500 text-[9px]">Contato direto — configurar via curadoria</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alcance estimado */}
              {alcanceEstimado && alcanceEstimado.membros > 0 && (
                <div className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-xl p-3 space-y-1.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#FFD300]/70">Alcance estimado</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-[#FFD300]" />
                      <span className="text-white text-sm font-bold">{alcanceEstimado.membros}</span>
                      <span className="text-zinc-400 text-[9px]">elegíveis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye size={12} className="text-[#FFD300]" />
                      <span className="text-white text-sm font-bold">{formatAlcance(alcanceEstimado.alcance)}</span>
                      <span className="text-zinc-400 text-[9px]">seguidores</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Cortesias (só aparece se props de cortesia foram passadas) ── */}
      {setCortesiaEnabled != null && (
        <div className="border-t border-white/5 pt-5 mt-2">
          <button
            onClick={() => setCortesiaEnabled!(!cortesiaEnabled)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${cortesiaEnabled ? 'bg-[#FFD300]/5 border-[#FFD300]/25' : 'bg-zinc-900/40 border-white/5'}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Gift size={16} className={cortesiaEnabled ? 'text-[#FFD300] shrink-0' : 'text-zinc-400 shrink-0'} />
              <div className="text-left">
                <p className={`font-bold text-sm leading-none ${cortesiaEnabled ? 'text-[#FFD300]' : 'text-white'}`}>
                  Cortesias
                </p>
                <p className="text-zinc-400 text-[10px] mt-1">Ingressos gratuitos para equipe e convidados especiais</p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full border relative transition-all shrink-0 ml-3 ${cortesiaEnabled ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${cortesiaEnabled ? 'left-6 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
              />
            </div>
          </button>

          {cortesiaEnabled && (
            <div className="space-y-3 px-1 mt-4">
              {varTipos.length > 0 ? (
                <>
                  <label className={labelCls}>Selecione os tipos e defina o limite de cada *</label>
                  <div className="space-y-2">
                    {varTipos.map(t => {
                      const ativo = t in (cortesiaLimites ?? {});
                      return (
                        <div
                          key={t}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            ativo ? 'bg-[#FFD300]/5 border-[#FFD300]/25' : 'bg-zinc-900/40 border-white/5'
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (ativo) {
                                const next = { ...(cortesiaLimites ?? {}) };
                                delete next[t];
                                setCortesiaLimites!(next);
                              } else {
                                setCortesiaLimites!({ ...(cortesiaLimites ?? {}), [t]: '' });
                              }
                            }}
                            className="shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                ativo ? 'bg-[#FFD300] border-[#FFD300]' : 'bg-zinc-800 border-white/10'
                              }`}
                            >
                              {ativo && <Gift size={10} className="text-black" />}
                            </div>
                          </button>
                          <p
                            className={`flex-1 min-w-0 text-xs font-bold truncate ${ativo ? 'text-white' : 'text-zinc-400'}`}
                          >
                            {t}
                          </p>
                          {ativo && (
                            <input
                              value={(cortesiaLimites ?? {})[t] ?? ''}
                              onChange={e => setCortesiaLimites!({ ...(cortesiaLimites ?? {}), [t]: e.target.value })}
                              type="number"
                              min="1"
                              placeholder="Qtd"
                              className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-[#FFD300]/30 focus:outline-none shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {Object.keys(cortesiaLimites ?? {}).length > 0 && (
                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">
                      Total:{' '}
                      {(Object.values(cortesiaLimites ?? {}) as string[]).reduce((s, v) => s + (parseInt(v) || 0), 0)}{' '}
                      cortesias
                    </p>
                  )}
                </>
              ) : (
                <p className="text-zinc-400 text-[10px] py-3">
                  Crie pelo menos um lote com variações para definir os tipos de cortesia.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
