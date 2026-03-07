import React from 'react';
import { Plus, X } from 'lucide-react';
import { CotaVariacaoConfig } from '../../../../types';
import { CargoCustomState, inputCls, labelCls } from './types';
import { VantaDropdown } from '../../../../components/VantaDropdown';
import { QlCheckbox } from './QlCheckbox';

interface PainelCustomProps {
  estado: CargoCustomState;
  setEstado: React.Dispatch<React.SetStateAction<CargoCustomState>>;
  variacoesDisponiveis: string[];
}

export const PainelCargoCustom: React.FC<PainelCustomProps> = ({ estado, setEstado, variacoesDisponiveis }) => {
  const addCota = () => {
    const primeiraDisponivel = variacoesDisponiveis[0] ?? '';
    setEstado(prev => ({
      ...prev,
      listas: {
        ...prev.listas,
        cotas: [...prev.listas.cotas, { variacaoLabel: primeiraDisponivel, limite: 0 }],
      },
    }));
  };

  const removeCota = (idx: number) => {
    setEstado(prev => ({
      ...prev,
      listas: {
        ...prev.listas,
        cotas: prev.listas.cotas.filter((_, i) => i !== idx),
      },
    }));
  };

  const updateCota = (idx: number, field: keyof CotaVariacaoConfig, value: string | number) => {
    setEstado(prev => {
      const novas = [...prev.listas.cotas];
      novas[idx] = { ...novas[idx], [field]: value };
      return { ...prev, listas: { ...prev.listas, cotas: novas } };
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-5 mt-3">
      {/* Nome */}
      <div>
        <label className={labelCls}>Nome do cargo</label>
        <input
          className={inputCls}
          placeholder="Ex: Promoter VIP, Segurança Premium…"
          value={estado.nome}
          onChange={e => setEstado(prev => ({ ...prev, nome: e.target.value }))}
        />
      </div>

      {/* Módulo Listas */}
      <div className="space-y-3">
        <p className={labelCls}>Módulo Listas</p>
        <QlCheckbox
          checked={estado.listas.ativo}
          onChange={() =>
            setEstado(prev => ({
              ...prev,
              listas: { ativo: !prev.listas.ativo, cotas: prev.listas.cotas },
            }))
          }
          label="Inserir nomes na lista"
          sublabel="Promoter insere convidados nas cotas pré-alocadas"
        />

        {/* Seção dinâmica de variações */}
        {estado.listas.ativo && (
          <div className="ml-7 space-y-2">
            <p className={labelCls}>Cotas por variação</p>

            {estado.listas.cotas.length === 0 && (
              <p className="text-zinc-700 text-[9px] italic">
                Nenhuma variação adicionada. Adicione ao menos uma com limite &gt; 0.
              </p>
            )}

            {estado.listas.cotas.map((cota, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <VantaDropdown
                  value={cota.variacaoLabel}
                  onChange={val => updateCota(idx, 'variacaoLabel', val)}
                  options={variacoesDisponiveis.map(v => ({ value: v, label: v }))}
                  className="flex-1 min-w-0"
                />
                <input
                  type="number"
                  min={0}
                  value={cota.limite === 0 ? '' : cota.limite}
                  placeholder="0"
                  onChange={e => updateCota(idx, 'limite', parseInt(e.target.value, 10) || 0)}
                  className="w-20 text-center bg-zinc-900/80 border border-white/5 rounded-xl px-2 py-2.5 text-white text-xs outline-none focus:border-[#FFD300]/30"
                />
                <button
                  type="button"
                  onClick={() => removeCota(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 border border-white/5 active:scale-90 transition-all shrink-0"
                >
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCota}
              className="flex items-center gap-1.5 text-[#FFD300]/70 text-[10px] font-black uppercase tracking-widest mt-1 active:opacity-60 transition-all"
            >
              <Plus size={11} />
              Adicionar outra variação
            </button>
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="border-t border-white/5" />

      {/* Módulo Portaria */}
      <div>
        <p className={labelCls}>Módulo Portaria</p>
        <QlCheckbox
          checked={estado.portaria}
          onChange={() => setEstado(prev => ({ ...prev, portaria: !prev.portaria }))}
          label="Fazer check-in / scanner"
          sublabel="Valida entradas na portaria"
        />
      </div>

      {/* Módulo Financeiro */}
      <div>
        <p className={labelCls}>Módulo Financeiro</p>
        <QlCheckbox
          checked={estado.financeiro}
          onChange={() => setEstado(prev => ({ ...prev, financeiro: !prev.financeiro }))}
          label="Ver relatórios financeiros"
          sublabel="Acesso somente leitura ao financeiro"
        />
      </div>

      {/* Módulo Caixa */}
      <div>
        <p className={labelCls}>Módulo Caixa</p>
        <QlCheckbox
          checked={estado.caixa}
          onChange={() => setEstado(prev => ({ ...prev, caixa: !prev.caixa }))}
          label="Vender ingresso na porta"
          sublabel="Opera o caixa de venda presencial"
        />
      </div>
    </div>
  );
};
