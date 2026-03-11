import React from 'react';
import type { HorarioSemanal } from '../../../../types';
import { HorarioFuncionamentoEditor } from '../../../../components/HorarioFuncionamentoEditor';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const Step1Identidade: React.FC<{
  nome: string;
  setNome(v: string): void;
  bio: string;
  setBio(v: string): void;
  capacidade: string;
  setCapacidade(v: string): void;
  horarios: HorarioSemanal[];
  setHorarios(h: HorarioSemanal[]): void;
  taxaVantaStr: string;
  setTaxaVantaStr(v: string): void;
  cnpj: string;
  setCnpj(v: string): void;
  razaoSocial: string;
  setRazaoSocial(v: string): void;
  telefone: string;
  setTelefone(v: string): void;
  taxaProcStr: string;
  setTaxaProcStr(v: string): void;
  taxaPortaStr: string;
  setTaxaPortaStr(v: string): void;
  taxaMinimaStr: string;
  setTaxaMinimaStr(v: string): void;
  cotaNomesStr: string;
  setCotaNomesStr(v: string): void;
  taxaNomeExcStr: string;
  setTaxaNomeExcStr(v: string): void;
  cotaCortesiasStr: string;
  setCotaCortesiasStr(v: string): void;
  taxaCortExcStr: string;
  setTaxaCortExcStr(v: string): void;
}> = ({
  nome,
  setNome,
  bio,
  setBio,
  capacidade,
  setCapacidade,
  horarios,
  setHorarios,
  taxaVantaStr,
  setTaxaVantaStr,
  cnpj,
  setCnpj,
  razaoSocial,
  setRazaoSocial,
  telefone,
  setTelefone,
  taxaProcStr,
  setTaxaProcStr,
  taxaPortaStr,
  setTaxaPortaStr,
  taxaMinimaStr,
  setTaxaMinimaStr,
  cotaNomesStr,
  setCotaNomesStr,
  taxaNomeExcStr,
  setTaxaNomeExcStr,
  cotaCortesiasStr,
  setCotaCortesiasStr,
  taxaCortExcStr,
  setTaxaCortExcStr,
}) => (
  <div className="space-y-5">
    <div>
      <label className={labelCls}>Nome da Comunidade *</label>
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Ex: Mansão no Joá"
        className={inputCls}
      />
    </div>
    <div>
      <label className={labelCls}>Bio / Descrição *</label>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        placeholder="Descreva o local, atmosfera e proposta da comunidade..."
        rows={4}
        className={inputCls + ' resize-none leading-relaxed'}
      />
    </div>
    <div>
      <label className={labelCls}>Capacidade Máxima do Local *</label>
      <input
        value={capacidade}
        onChange={e => setCapacidade(e.target.value)}
        type="number"
        min="1"
        placeholder="Ex: 500"
        className={inputCls}
      />
      <p className="text-[0.5rem] text-zinc-700 mt-1.5 font-black uppercase tracking-widest leading-relaxed">
        Limite de pessoas na casa. Vai alertar ao criar lotes ou listas de convidados acima deste valor.
      </p>
    </div>

    {/* Dados Jurídicos */}
    <div className="pt-3 border-t border-white/5 space-y-5">
      <div>
        <label className={labelCls}>Razão Social</label>
        <input
          value={razaoSocial}
          onChange={e => setRazaoSocial(e.target.value)}
          placeholder="Ex: Mansão Eventos LTDA"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>CNPJ</label>
        <input
          value={cnpj}
          onChange={e => setCnpj(e.target.value)}
          placeholder="Ex: 00.000.000/0001-00"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Telefone / Contato</label>
        <input
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          placeholder="Ex: (21) 99999-9999"
          className={inputCls}
        />
      </div>
    </div>

    {/* Horário de Funcionamento */}
    <div className="pt-3 border-t border-white/5">
      <HorarioFuncionamentoEditor horarios={horarios} onChange={setHorarios} />
    </div>

    {/* Taxa Vanta — lucro da plataforma por ingresso vendido */}
    <div className="pt-3 border-t border-white/5 space-y-1.5">
      <label className={labelCls}>Taxa Vanta (%) — Seu lucro por ingresso *</label>
      <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed mb-2">
        Percentual que o VANTA recebe sobre cada ingresso vendido nesta comunidade. Esse valor é descontado do repasse
        ao dono da comunidade. Ex: 10% = R$10 a cada R$100 vendidos.
      </p>
      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={taxaVantaStr}
          onChange={e => setTaxaVantaStr(e.target.value)}
          placeholder="Ex: 10.0"
          className={inputCls + ' pr-10'}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
      </div>
      <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
        O custo do gateway de pagamento (ex: cartão, PIX) é cobrado separadamente e sempre pago pelo dono da comunidade.
      </p>
    </div>

    {/* Taxas Avançadas */}
    <div className="pt-3 border-t border-white/5 space-y-2">
      <label className={labelCls}>Taxas Avançadas (Padrão para eventos)</label>
      <p className="text-[0.5rem] text-zinc-700 font-black uppercase tracking-widest leading-relaxed mb-2">
        Valores padrão para novos eventos desta comunidade. O produtor pode propor alterações na criação do evento.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
            Taxa Processamento (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxaProcStr}
            onChange={e => setTaxaProcStr(e.target.value)}
            placeholder="2.5"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Taxa Porta (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxaPortaStr}
            onChange={e => setTaxaPortaStr(e.target.value)}
            placeholder="= Taxa App"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
            Taxa Mínima (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={taxaMinimaStr}
            onChange={e => setTaxaMinimaStr(e.target.value)}
            placeholder="2.00"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
            Cota Nomes Lista
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={cotaNomesStr}
            onChange={e => setCotaNomesStr(e.target.value)}
            placeholder="500"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
            R$/Nome Excedente
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={taxaNomeExcStr}
            onChange={e => setTaxaNomeExcStr(e.target.value)}
            placeholder="0.50"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">Cota Cortesias</label>
          <input
            type="number"
            min="0"
            step="1"
            value={cotaCortesiasStr}
            onChange={e => setCotaCortesiasStr(e.target.value)}
            placeholder="50"
            className={inputCls}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-[0.4375rem] text-zinc-400 font-black uppercase tracking-widest">
            % Cortesia Excedente (sobre valor face)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxaCortExcStr}
            onChange={e => setTaxaCortExcStr(e.target.value)}
            placeholder="5.0"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  </div>
);
