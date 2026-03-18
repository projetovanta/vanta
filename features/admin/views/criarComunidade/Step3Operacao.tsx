import React from 'react';
import type { HorarioSemanal } from '../../../../types';
import { HorarioFuncionamentoEditor } from '../../../../components/HorarioFuncionamentoEditor';
import { validarDigitoCnpj, formatarCnpj } from '../../../../utils/cnpjValidator';
import SectionTitle from '../../../../components/form/SectionTitle';
import { Clock, Building2, Globe } from 'lucide-react';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const Step3Operacao: React.FC<{
  horarios: HorarioSemanal[];
  setHorarios(h: HorarioSemanal[]): void;
  cnpj: string;
  setCnpj(v: string): void;
  razaoSocial: string;
  setRazaoSocial(v: string): void;
  telefone: string;
  setTelefone(v: string): void;
  instagram: string;
  setInstagram(v: string): void;
  whatsapp: string;
  setWhatsapp(v: string): void;
  tiktok: string;
  setTiktok(v: string): void;
  site: string;
  setSite(v: string): void;
}> = ({
  horarios,
  setHorarios,
  cnpj,
  setCnpj,
  razaoSocial,
  setRazaoSocial,
  telefone,
  setTelefone,
  instagram,
  setInstagram,
  whatsapp,
  setWhatsapp,
  tiktok,
  setTiktok,
  site,
  setSite,
}) => (
  <div className="space-y-6">
    {/* Horário de Funcionamento */}
    <div>
      <SectionTitle title="Horários" icon={Clock} subtitle="Defina o horário de funcionamento" />
      <HorarioFuncionamentoEditor horarios={horarios} onChange={setHorarios} />
    </div>

    {/* Dados Jurídicos */}
    <div>
      <SectionTitle title="Dados Jurídicos" icon={Building2} subtitle="CNPJ e contato do estabelecimento" />
      <div className="space-y-4">
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
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 14);
              setCnpj(raw.length === 14 ? formatarCnpj(raw) : e.target.value);
            }}
            placeholder="Ex: 00.000.000/0001-00"
            className={inputCls}
          />
          {cnpj && cnpj.replace(/\D/g, '').length === 14 && !validarDigitoCnpj(cnpj) && (
            <p className="text-red-400 text-[0.625rem] mt-1">CNPJ inválido — verifique os dígitos</p>
          )}
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
    </div>

    {/* Redes Sociais */}
    <div>
      <SectionTitle title="Redes Sociais" icon={Globe} subtitle="Links e perfis da comunidade" />
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Instagram</label>
          <input
            value={instagram}
            onChange={e => setInstagram(e.target.value)}
            placeholder="@nomedacomunidade"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>WhatsApp</label>
          <input
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="Ex: (21) 99999-9999"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>TikTok</label>
          <input
            value={tiktok}
            onChange={e => setTiktok(e.target.value)}
            placeholder="@nomedacomunidade"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Site</label>
          <input
            value={site}
            onChange={e => setSite(e.target.value)}
            placeholder="https://www.exemplo.com.br"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  </div>
);
