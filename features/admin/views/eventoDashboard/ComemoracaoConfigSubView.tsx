import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Plus, X, Cake, Check, Trash2 } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { comemoracaoService, ComemoracaoConfig, ComemoracaoFaixa } from '../../../../services/comemoracaoService';
import { eventosAdminService } from '../../services/eventosAdminService';
import { VantaDatePicker } from '../../../../components/VantaDatePicker';
import { VantaTimePicker } from '../../../../components/VantaTimePicker';

interface FaixaForm {
  min_vendas: string;
  cortesias: string;
  beneficio_consumo: string;
}

interface Props {
  eventoId: string;
  onBack: () => void;
}

export const ComemoracaoConfigSubView: React.FC<Props> = ({ eventoId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [habilitado, setHabilitado] = useState(false);
  const [limiteStr, setLimiteStr] = useState('');
  const [deadlineHora, setDeadlineHora] = useState('');
  const [faixas, setFaixas] = useState<FaixaForm[]>([]);
  const [datasBloqueadas, setDatasBloqueadas] = useState<string[]>([]);
  const [novaDataBloq, setNovaDataBloq] = useState('');

  const evento = eventosAdminService.getEvento(eventoId);
  const comunidadeId = evento?.comunidadeId ?? '';

  useEffect(() => {
    comemoracaoService.getConfig(eventoId).then(cfg => {
      if (cfg) {
        setHabilitado(cfg.habilitado);
        setLimiteStr(cfg.limite_comemoracoes != null ? String(cfg.limite_comemoracoes) : '');
        setDeadlineHora(cfg.deadline_hora ?? '');
        setFaixas(
          cfg.faixas.map(f => ({
            min_vendas: String(f.min_vendas),
            cortesias: String(f.cortesias),
            beneficio_consumo: f.beneficio_consumo ?? '',
          })),
        );
        setDatasBloqueadas(cfg.datas_bloqueadas ?? []);
      }
      setLoading(false);
    });
  }, [eventoId]);

  const addFaixa = () => {
    setFaixas([...faixas, { min_vendas: '', cortesias: '', beneficio_consumo: '' }]);
  };

  const removeFaixa = (idx: number) => {
    setFaixas(faixas.filter((_, i) => i !== idx));
  };

  const updateFaixa = (idx: number, field: keyof FaixaForm, value: string) => {
    setFaixas(faixas.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  const handleSave = async () => {
    if (!comunidadeId) return;
    setSaving(true);
    try {
      const limiteNum = limiteStr ? parseInt(limiteStr) : null;
      const faixasClean = faixas
        .filter(f => f.min_vendas && f.cortesias)
        .map(f => ({
          min_vendas: parseInt(f.min_vendas),
          cortesias: parseInt(f.cortesias),
          beneficio_consumo: f.beneficio_consumo.trim() || null,
        }));

      await comemoracaoService.salvarConfig(
        eventoId,
        comunidadeId,
        {
          habilitado,
          limite_comemoracoes: isNaN(limiteNum as number) ? null : limiteNum,
          deadline_hora: deadlineHora || null,
          datas_bloqueadas: datasBloqueadas,
        },
        faixasClean,
      );
      onBack();
    } catch (err) {
      console.error('[ComemoracaoConfig] erro:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
        <div className="flex items-center justify-center flex-1">
          <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#050505] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-white/5">
        <button
          aria-label="Voltar"
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size="1.125rem" className="text-zinc-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 style={TYPOGRAPHY.screenTitle} className="text-base text-white truncate">
            Comemoração
          </h1>
          <p className="text-zinc-400 text-[0.625rem] truncate">{evento?.nome ?? 'Evento'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake size="0.875rem" className="text-purple-400" />
            <p className="text-white text-sm font-bold">Aceitar comemoracões</p>
          </div>
          <button
            onClick={() => setHabilitado(!habilitado)}
            className={`w-12 h-6 rounded-full transition-all relative ${habilitado ? 'bg-[#FFD300]' : 'bg-zinc-700'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${habilitado ? 'left-[1.625rem]' : 'left-1'}`}
            />
          </button>
        </div>

        {habilitado && (
          <>
            {/* Limite */}
            <div className="space-y-1">
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Limite de comemoracões (vazio = sem limite)
              </label>
              <input
                type="number"
                min="1"
                value={limiteStr}
                onChange={e => setLimiteStr(e.target.value)}
                placeholder="Ex: 5"
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Horário limite para vendas contarem (vazio = até início do evento)
              </label>
              <VantaTimePicker
                value={deadlineHora}
                onChange={setDeadlineHora}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30"
              />
            </div>

            {/* Datas bloqueadas */}
            <div className="space-y-2">
              <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                Datas bloqueadas (não aceitar comemoração)
              </label>
              <div className="flex gap-2">
                <VantaDatePicker
                  value={novaDataBloq}
                  onChange={setNovaDataBloq}
                  className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30"
                />
                <button
                  onClick={() => {
                    if (novaDataBloq && !datasBloqueadas.includes(novaDataBloq)) {
                      setDatasBloqueadas([...datasBloqueadas, novaDataBloq].sort());
                      setNovaDataBloq('');
                    }
                  }}
                  className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 active:scale-95 transition-all"
                >
                  <Plus size="0.875rem" />
                </button>
              </div>
              {datasBloqueadas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {datasBloqueadas.map(d => (
                    <span
                      key={d}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[0.625rem] text-red-400 font-medium"
                    >
                      {d.split('-').reverse().join('/')}
                      <button
                        onClick={() => setDatasBloqueadas(datasBloqueadas.filter(x => x !== d))}
                        className="active:scale-90"
                      >
                        <X size="0.625rem" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Faixas de benefícios */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                  Faixas de Benefícios
                </label>
                <button
                  onClick={addFaixa}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[0.5625rem] font-bold text-purple-400 uppercase tracking-wider active:scale-95 transition-all"
                >
                  <Plus size="0.625rem" />
                  Faixa
                </button>
              </div>

              <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
                Defina quantas vendas o aniversariante precisa para ganhar cortesias e benefícios de consumo.
              </p>

              {faixas.length === 0 && (
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-zinc-400 text-xs">Nenhuma faixa configurada</p>
                  <p className="text-zinc-700 text-[0.625rem] mt-1">Adicione faixas para premiar aniversariantes</p>
                </div>
              )}

              {faixas.map((faixa, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.5625rem] text-purple-400 font-black uppercase tracking-widest">
                      Faixa {idx + 1}
                    </span>
                    <button
                      onClick={() => removeFaixa(idx)}
                      className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Trash2 size="0.625rem" className="text-red-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                        Mín. Vendas
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={faixa.min_vendas}
                        onChange={e => updateFaixa(idx, 'min_vendas', e.target.value)}
                        placeholder="10"
                        className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                        Cortesias
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={faixa.cortesias}
                        onChange={e => updateFaixa(idx, 'cortesias', e.target.value)}
                        placeholder="2"
                        className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
                      Benefício Consumo (opcional)
                    </label>
                    <input
                      type="text"
                      value={faixa.beneficio_consumo}
                      onChange={e => updateFaixa(idx, 'beneficio_consumo', e.target.value)}
                      placeholder="Ex: Balde 5 cervejas, Garrafa Fireball..."
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-5 pt-3 border-t border-white/5"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[0.625rem] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size="0.8125rem" className="animate-spin" /> : <Check size="0.8125rem" />}
          Salvar
        </button>
      </div>
    </div>
  );
};
