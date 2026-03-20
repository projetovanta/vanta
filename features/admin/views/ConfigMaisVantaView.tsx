/**
 * ConfigMaisVantaView — Painel de configuração dinâmica MAIS VANTA (master only)
 * Seções: Branding, Regras, Benefícios, Textos Membro, Textos Venue, Termos
 */

import React, { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, Plus, X, Loader2, Check } from 'lucide-react';
import {
  maisVantaConfigService,
  type MaisVantaConfig,
  type VantagemTexto,
  type BeneficioConfig,
} from '../services/maisVantaConfigService';

// ── Componente de seção colapsável ─────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-white/5 transition-all"
      >
        <p className="text-white text-xs font-bold uppercase tracking-wider">{title}</p>
        {open ? (
          <ChevronUp size="0.875rem" className="text-zinc-400" />
        ) : (
          <ChevronDown size="0.875rem" className="text-zinc-400" />
        )}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">{children}</div>}
    </div>
  );
};

// ── Input de texto ─────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, textarea, placeholder }) => (
  <div>
    <label className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest block mb-1.5">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs resize-none min-h-[5rem] focus:border-[#FFD300]/40 focus:outline-none transition-all"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#FFD300]/40 focus:outline-none transition-all"
      />
    )}
  </div>
);

// ── Input numérico ─────────────────────────────────────────────────────────
const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
}> = ({ label, value, onChange, suffix, min = 1 }) => (
  <div>
    <label className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest block mb-1.5">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        onChange={e => onChange(Math.max(min, parseInt(e.target.value) || min))}
        className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs text-center focus:border-[#FFD300]/40 focus:outline-none transition-all"
      />
      {suffix && <span className="text-zinc-400 text-[0.5625rem] font-bold">{suffix}</span>}
    </div>
  </div>
);

// ── Chips editáveis (add/remove) ───────────────────────────────────────────
const ChipsField: React.FC<{
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}> = ({ label, values, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
      setInput('');
    }
  };
  return (
    <div>
      <label className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-lg text-[#FFD300] text-[0.625rem] font-bold"
          >
            {v}
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="opacity-60 hover-real:opacity-100"
            >
              <X size="0.625rem" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#FFD300]/40 focus:outline-none transition-all"
        />
        <button
          aria-label="Adicionar"
          onClick={add}
          disabled={!input.trim()}
          className="px-3 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.5625rem] font-black uppercase disabled:opacity-30"
        >
          <Plus size="0.75rem" />
        </button>
      </div>
    </div>
  );
};

// ── Lista de vantagens editável ────────────────────────────────────────────
const VantagensEditor: React.FC<{ values: VantagemTexto[]; onChange: (v: VantagemTexto[]) => void }> = ({
  values,
  onChange,
}) => {
  const add = () => onChange([...values, { titulo: '', descricao: '' }]);
  const update = (i: number, field: keyof VantagemTexto, val: string) => {
    const next = [...values];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={v.titulo}
              onChange={e => update(i, 'titulo', e.target.value)}
              placeholder="Título"
              className="flex-1 bg-transparent border-b border-white/10 px-1 py-1 text-white text-xs font-bold focus:border-[#FFD300]/40 focus:outline-none"
            />
            <div className="flex gap-0.5 shrink-0">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 text-zinc-400 hover-real:text-zinc-400 disabled:opacity-20"
              >
                <ChevronUp size="0.75rem" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === values.length - 1}
                className="p-1 text-zinc-400 hover-real:text-zinc-400 disabled:opacity-20"
              >
                <ChevronDown size="0.75rem" />
              </button>
              <button onClick={() => remove(i)} className="p-1 text-red-500/60 hover-real:text-red-400">
                <X size="0.75rem" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={v.descricao}
            onChange={e => update(i, 'descricao', e.target.value)}
            placeholder="Descrição"
            className="w-full bg-transparent border-b border-white/5 px-1 py-1 text-zinc-400 text-[0.625rem] focus:border-[#FFD300]/30 focus:outline-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:bg-white/5 transition-all"
      >
        <Plus size="0.75rem" /> Adicionar
      </button>
    </div>
  );
};

// ── Lista de benefícios editável ───────────────────────────────────────────
const BeneficiosEditor: React.FC<{ values: BeneficioConfig[]; onChange: (v: BeneficioConfig[]) => void }> = ({
  values,
  onChange,
}) => {
  const add = () => onChange([...values, { id: '', label: '', descricao: '' }]);
  const update = (i: number, field: keyof BeneficioConfig, val: string) => {
    const next = [...values];
    next[i] = {
      ...next[i],
      [field]:
        field === 'id'
          ? val
              .toUpperCase()
              .replace(/\s+/g, '_')
              .replace(/[^A-Z0-9_]/g, '')
          : val,
    };
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {values.map((b, i) => (
        <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={b.id}
              onChange={e => update(i, 'id', e.target.value)}
              placeholder="ID (ex: CAMAROTE_VIP)"
              className="w-32 bg-zinc-800/60 border border-white/10 rounded-lg px-2 py-1 text-[#FFD300] text-[0.5625rem] font-mono font-bold focus:border-[#FFD300]/40 focus:outline-none"
            />
            <input
              type="text"
              value={b.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder="Nome exibido"
              className="flex-1 bg-transparent border-b border-white/10 px-1 py-1 text-white text-xs font-bold focus:border-[#FFD300]/40 focus:outline-none"
            />
            <button onClick={() => remove(i)} className="p-1 text-red-500/60 hover-real:text-red-400 shrink-0">
              <X size="0.75rem" />
            </button>
          </div>
          <input
            type="text"
            value={b.descricao}
            onChange={e => update(i, 'descricao', e.target.value)}
            placeholder="Descrição"
            className="w-full bg-transparent border-b border-white/5 px-1 py-1 text-zinc-400 text-[0.625rem] focus:border-[#FFD300]/30 focus:outline-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:bg-white/5 transition-all"
      >
        <Plus size="0.75rem" /> Novo benefício
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ConfigMaisVantaView
// ══════════════════════════════════════════════════════════════════════════════

export const ConfigMaisVantaView: React.FC = () => {
  const [config, setConfig] = useState<MaisVantaConfig>(maisVantaConfigService.getConfig());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    maisVantaConfigService.refresh().then(() => {
      setConfig(maisVantaConfigService.getConfig());
    });
  }, []);

  const update = <K extends keyof MaisVantaConfig>(key: K, value: MaisVantaConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await maisVantaConfigService.updateConfig(config);
    setSaving(false);
    if (ok) {
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 pb-6">
        <Section title="Branding" defaultOpen>
          <Field label="Nome do Programa" value={config.nomePrograma} onChange={v => update('nomePrograma', v)} />
          <Field
            label="Descrição"
            value={config.descricaoPrograma}
            onChange={v => update('descricaoPrograma', v)}
            textarea
          />
          <Field label="E-mail de Contato" value={config.emailContato} onChange={v => update('emailContato', v)} />
        </Section>

        <Section title="Regras">
          <div className="grid grid-cols-2 gap-4">
            <NumField
              label="Prazo de post"
              value={config.prazoPostHoras}
              onChange={v => update('prazoPostHoras', v)}
              suffix="horas"
            />
            <NumField
              label="Infrações p/ bloqueio"
              value={config.infracoesLimite}
              onChange={v => update('infracoesLimite', v)}
            />
            <NumField
              label="1º Bloqueio"
              value={config.bloqueio1Dias}
              onChange={v => update('bloqueio1Dias', v)}
              suffix="dias"
            />
            <NumField
              label="2º Bloqueio"
              value={config.bloqueio2Dias}
              onChange={v => update('bloqueio2Dias', v)}
              suffix="dias"
            />
          </div>
          <ChipsField
            label="Menções obrigatórias"
            values={config.mencoesObrigatorias}
            onChange={v => update('mencoesObrigatorias', v)}
            placeholder="@handle"
          />
          <ChipsField
            label="Hashtags obrigatórias"
            values={config.hashtagsObrigatorias}
            onChange={v => update('hashtagsObrigatorias', v)}
            placeholder="#hashtag"
          />
        </Section>

        <Section title="Benefícios disponíveis">
          <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mb-2">
            Benefícios que podem ser atribuídos a cada tier. Ao criar um novo, ele aparece como opção na edição de
            tiers.
          </p>
          <BeneficiosEditor values={config.beneficiosDisponiveis} onChange={v => update('beneficiosDisponiveis', v)} />
        </Section>

        <Section title="Textos — Membro">
          <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mb-2">
            Vantagens exibidas na tela de solicitação de entrada do membro.
          </p>
          <VantagensEditor values={config.vantagensMembro} onChange={v => update('vantagensMembro', v)} />
        </Section>

        <Section title="Textos — Venue">
          <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mb-2">
            Vantagens exibidas na landing page para sócios/produtores.
          </p>
          <VantagensEditor values={config.vantagensVenue} onChange={v => update('vantagensVenue', v)} />
        </Section>

        <Section title="Termos de Uso">
          <p className="text-zinc-400 text-[0.5625rem] leading-relaxed mb-2">
            Termos customizados. Deixe vazio para usar os termos padrão.
          </p>
          <Field
            label=""
            value={config.termosCustomizados ?? ''}
            onChange={v => update('termosCustomizados', v || (null as any))}
            textarea
            placeholder="Termos customizados (vazio = padrão)"
          />
        </Section>
      </div>

      {/* Footer fixo com botão Salvar */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`w-full py-3 rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 ${
            saved ? 'bg-emerald-500 text-white' : 'bg-[#FFD300] text-black'
          }`}
        >
          {saving ? (
            <>
              <Loader2 size="0.875rem" className="animate-spin" /> Salvando...
            </>
          ) : saved ? (
            <>
              <Check size="0.875rem" /> Salvo!
            </>
          ) : (
            <>
              <Save size="0.875rem" /> Salvar configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
};
