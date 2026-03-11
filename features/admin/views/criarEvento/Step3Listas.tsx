import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check, ArrowDownToLine } from 'lucide-react';
import type { VarListaForm, GeneroLista, LoteForm } from './types';
import { inputSmCls, COR_PALETTE } from './constants';
import { novaVarLista, buildLabel } from './utils';
import { VantaDropdown } from '../../../../components/VantaDropdown';

interface Props {
  listasEnabled: boolean;
  setListasEnabled: (v: boolean) => void;
  varsLista: VarListaForm[];
  setVarsLista: React.Dispatch<React.SetStateAction<VarListaForm[]>>;
  horaInicio?: string;
  horaFim?: string;
  lotes?: LoteForm[];
}

const AREA_FIXA = ['PISTA', 'CAMAROTE', 'AREA_VIP', 'BACKSTAGE'];

const AREA_LABELS: Record<string, string> = {
  PISTA: 'Pista',
  CAMAROTE: 'Camarote',
  AREA_VIP: 'Area VIP',
  BACKSTAGE: 'Backstage',
};

// ── Pill helpers (card contraido) ────────────────────────────────────────────

const tipoPillCls = (tipo: string) => {
  if (tipo === 'VIP') return 'bg-[#FFD300]/15 text-[#FFD300] border-[#FFD300]/30';
  if (tipo === 'ENTRADA') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (tipo === 'CONSUMO') return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  return 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30';
};

const generoPillCls = (g: GeneroLista) => {
  if (g === 'MASCULINO') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (g === 'FEMININO') return 'bg-pink-400/15 text-pink-400 border-pink-400/30';
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
};

const genLabel = (g: GeneroLista) => (g === 'MASCULINO' ? 'Masc' : g === 'FEMININO' ? 'Fem' : 'Uni');

// ── Opcoes dos dropdowns ─────────────────────────────────────────────────────

const TIPO_OPTS = [
  { value: 'VIP', label: 'VIP', color: '#FFD300' },
  { value: 'ENTRADA', label: 'Entrada', color: '#60A5FA' },
  { value: 'CONSUMO', label: 'Consumo', color: '#A78BFA' },
  { value: 'OUTRO', label: 'Outro' },
];

const GENERO_OPTS = [
  { value: 'UNISEX', label: 'Unissex', color: '#34D399' },
  { value: 'FEMININO', label: 'Feminino', color: '#F472B6' },
  { value: 'MASCULINO', label: 'Masculino', color: '#60A5FA' },
];

const AREA_OPTS = [
  { value: 'PISTA', label: 'Pista' },
  { value: 'CAMAROTE', label: 'Camarote', color: '#FFD300' },
  { value: 'AREA_VIP', label: 'Area VIP', color: '#A78BFA' },
  { value: 'BACKSTAGE', label: 'Backstage', color: '#F97316' },
  { value: 'CUSTOM', label: 'Outro...' },
];

const VALIDADE_OPTS = [
  { value: 'NOITE_TODA', label: 'Noite toda' },
  { value: 'HORARIO', label: 'Ate um horario' },
];

/** Gera slots de 30 em 30 min entre horaInicio e horaFim (suporta virada de meia-noite) */
const buildHoraOpts = (inicio?: string, fim?: string) => {
  const parseMin = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + (mm || 0);
  };
  let startMin = inicio ? parseMin(inicio) : 18 * 60;
  let endMin = fim ? parseMin(fim) : 6 * 60;
  // Virada de meia-noite: se fim < inicio, soma 24h
  if (endMin <= startMin) endMin += 24 * 60;

  const opts: { value: string; label: string }[] = [];
  for (let m = startMin; m <= endMin; m += 30) {
    const normalized = m % (24 * 60);
    const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
    const mm = String(normalized % 60).padStart(2, '0');
    const val = `${hh}:${mm}`;
    opts.push({ value: val, label: val });
  }
  return opts;
};

// ── Card expandivel ──────────────────────────────────────────────────────────

const VarCard: React.FC<{
  v: VarListaForm;
  expanded: boolean;
  outrasVars: VarListaForm[];
  horaOpts: { value: string; label: string }[];
  onExpand: () => void;
  onSave: () => void;
  onChange: (field: keyof VarListaForm, value: any) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}> = ({ v, expanded, outrasVars, horaOpts, onExpand, onSave, onChange, onDuplicate, onRemove }) => {
  const isCustomArea = !AREA_FIXA.includes(v.area);

  // ── Contraido ──
  if (!expanded) {
    const valorLabel = v.tipo === 'VIP' ? 'Gratis' : v.valor ? `R$${v.valor}` : '';
    const areaLabel = AREA_LABELS[v.area] || v.area || 'Pista';
    const horaLabel = v.validadeTipo === 'HORARIO' && v.validadeHora ? `ate ${v.validadeHora}` : '';

    return (
      <div
        className="flex items-center gap-2.5 p-3 bg-zinc-900/40 border border-white/5 rounded-xl transition-all"
        style={{ borderLeftColor: v.cor, borderLeftWidth: '3px' }}
      >
        <button className="flex-1 min-w-0 text-left" onClick={onExpand}>
          <p className="text-white text-xs font-bold truncate">{buildLabel(v)}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[0.4375rem] font-black border ${tipoPillCls(v.tipo)}`}>
              {v.tipo}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[0.4375rem] font-black border ${generoPillCls(v.genero)}`}>
              {genLabel(v.genero)}
            </span>
            <span className="text-zinc-400 text-[0.4375rem] font-bold">{areaLabel}</span>
            {horaLabel && <span className="text-zinc-400 text-[0.4375rem] font-bold">{horaLabel}</span>}
            {valorLabel && <span className="text-zinc-400 text-[0.4375rem] font-bold">{valorLabel}</span>}
            {v.limite && <span className="text-zinc-400 text-[0.4375rem]">{v.limite} nomes</span>}
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            aria-label="Copiar"
            onClick={onDuplicate}
            className="p-1.5 text-zinc-400 active:text-blue-400 transition-colors"
          >
            <Copy size="0.6875rem" />
          </button>
          <button
            aria-label="Excluir"
            onClick={onRemove}
            className="p-1.5 text-zinc-700 active:text-red-400 transition-colors"
          >
            <Trash2 size="0.6875rem" />
          </button>
        </div>
      </div>
    );
  }

  // ── Expandido — dropdowns ──
  return (
    <div
      className="p-3.5 bg-zinc-900/60 border border-[#FFD300]/20 rounded-xl space-y-3 transition-all"
      style={{ borderLeftColor: v.cor, borderLeftWidth: '3px' }}
    >
      {/* Linha 1: Tipo + Genero */}
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-zinc-400 text-[0.4375rem] font-bold uppercase tracking-wider mb-1">Tipo</p>
          <VantaDropdown
            value={v.tipo}
            onChange={val => onChange('tipo', val)}
            options={TIPO_OPTS}
            placeholder="Tipo"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <p className="text-zinc-400 text-[0.4375rem] font-bold uppercase tracking-wider mb-1">Genero</p>
          <VantaDropdown
            value={v.genero}
            onChange={val => onChange('genero', val)}
            options={GENERO_OPTS}
            placeholder="Genero"
            className="w-full"
          />
        </div>
      </div>

      {/* Linha 2: Area + Validade */}
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-zinc-400 text-[0.4375rem] font-bold uppercase tracking-wider mb-1">Area</p>
          <VantaDropdown
            value={isCustomArea ? 'CUSTOM' : v.area}
            onChange={val => onChange('area', val === 'CUSTOM' ? '' : val)}
            options={AREA_OPTS}
            placeholder="Area"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <p className="text-zinc-400 text-[0.4375rem] font-bold uppercase tracking-wider mb-1">Validade</p>
          <VantaDropdown
            value={v.validadeTipo}
            onChange={val => onChange('validadeTipo', val)}
            options={VALIDADE_OPTS}
            placeholder="Validade"
            className="w-full"
          />
        </div>
      </div>

      {/* Campos condicionais inline */}
      <div className="flex gap-2 items-end flex-wrap">
        {isCustomArea && (
          <div className="flex-1">
            <p className="text-zinc-400 text-[0.4375rem] font-bold mb-0.5">Area personalizada</p>
            <input
              value={v.area}
              onChange={e => onChange('area', e.target.value)}
              placeholder="Nome da area"
              maxLength={40}
              className={inputSmCls + ' w-full'}
            />
          </div>
        )}
        {v.tipo !== 'VIP' && (
          <div className="shrink-0">
            <p className="text-zinc-400 text-[0.4375rem] font-bold mb-0.5">Valor</p>
            <div className="flex items-center gap-1">
              <span className="text-[#FFD300] text-[0.625rem] font-bold">R$</span>
              <input
                value={v.valor}
                onChange={e => onChange('valor', e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className={inputSmCls + ' w-16'}
              />
            </div>
          </div>
        )}
        {v.validadeTipo === 'HORARIO' && (
          <div className="shrink-0">
            <p className="text-zinc-400 text-[0.4375rem] font-bold mb-0.5">Ate</p>
            <VantaDropdown
              value={v.validadeHora}
              onChange={val => onChange('validadeHora', val)}
              options={horaOpts}
              placeholder="Horario"
              className="w-full"
            />
          </div>
        )}
        <div className="shrink-0">
          <p className="text-zinc-400 text-[0.4375rem] font-bold mb-0.5">Limite</p>
          <div className="flex items-center gap-1">
            <input
              value={v.limite}
              onChange={e => onChange('limite', e.target.value)}
              type="number"
              min="1"
              placeholder="0"
              className={inputSmCls + ' w-14 text-center'}
            />
            <span className="text-zinc-400 text-[0.4375rem]">nomes</span>
          </div>
        </div>
      </div>

      {/* Abobora */}
      {v.validadeTipo === 'HORARIO' && (
        <div className="pt-1 border-t border-white/5">
          <button
            onClick={() => onChange('ababoraAtivo', !v.ababoraAtivo)}
            className="w-full flex items-center justify-between py-1.5"
          >
            <p className="text-zinc-400 text-[0.5rem] font-bold">Virar paga apos {v.validadeHora || '__:__'}</p>
            <div
              className={`w-7 h-4 rounded-full border relative transition-all shrink-0 ${v.ababoraAtivo ? 'bg-[#FFD300]/30 border-[#FFD300]/50' : 'bg-zinc-800 border-white/10'}`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${v.ababoraAtivo ? 'left-3.5 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
              />
            </div>
          </button>
          {v.ababoraAtivo &&
            (outrasVars.length === 0 ? (
              <p className="text-zinc-700 text-[0.5rem] italic">Adicione mais variacoes para selecionar o destino.</p>
            ) : (
              <VantaDropdown
                value={v.ababoraAlvoId}
                onChange={val => onChange('ababoraAlvoId', val)}
                placeholder="Variacao destino..."
                options={outrasVars.map(o => ({ value: o.id, label: buildLabel(o) }))}
                className="w-full"
              />
            ))}
        </div>
      )}

      {/* Salvar + acoes */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 py-2 bg-[#FFD300] text-black text-[0.5625rem] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Check size="0.6875rem" /> Salvar
        </button>
        <button
          aria-label="Copiar"
          onClick={onDuplicate}
          className="p-2 text-zinc-400 active:text-blue-400 transition-colors"
        >
          <Copy size="0.75rem" />
        </button>
        <button
          aria-label="Excluir"
          onClick={onRemove}
          className="p-2 text-zinc-700 active:text-red-400 transition-colors"
        >
          <Trash2 size="0.75rem" />
        </button>
      </div>
    </div>
  );
};

// ── Step3Listas ───────────────────────────────────────────────────────────────

/** Mapeia area de ingresso pra area de lista */
const mapArea = (a: string): string => {
  if (a === 'VIP') return 'AREA_VIP';
  if (a === 'OUTRO') return 'PISTA';
  return a; // PISTA, CAMAROTE, BACKSTAGE
};

/** Gera templates de variacoes a partir dos ingressos (lotes) */
const gerarTemplates = (lotes: LoteForm[]): VarListaForm[] => {
  // Extrair combinacoes unicas genero+area dos ingressos
  const combos = new Map<string, { genero: GeneroLista; area: string; valor: string }>();
  for (const lote of lotes) {
    for (const v of lote.variacoes) {
      const key = `${v.genero}_${v.area}`;
      if (!combos.has(key)) {
        combos.set(key, { genero: v.genero as GeneroLista, area: mapArea(v.area), valor: v.valor });
      }
    }
  }

  if (combos.size === 0) return [novaVarLista(0)];

  const vars: VarListaForm[] = [];
  let idx = 0;
  for (const combo of combos.values()) {
    const vipId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const entradaId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

    // VIP (gratis, noite toda) — com abobora apontando pra entrada
    vars.push({
      id: vipId,
      tipo: 'VIP',
      cor: COR_PALETTE[idx % COR_PALETTE.length],
      genero: combo.genero,
      area: combo.area,
      validadeTipo: 'NOITE_TODA',
      validadeHora: '',
      ababoraAtivo: false,
      ababoraAlvoId: entradaId,
      limite: '',
      valor: '',
    });

    // Entrada (mesmo valor do ingresso)
    vars.push({
      id: entradaId,
      tipo: 'ENTRADA',
      cor: COR_PALETTE[(idx + 1) % COR_PALETTE.length],
      genero: combo.genero,
      area: combo.area,
      validadeTipo: 'NOITE_TODA',
      validadeHora: '',
      ababoraAtivo: false,
      ababoraAlvoId: '',
      limite: '',
      valor: combo.valor,
    });

    idx += 2;
  }
  return vars;
};

export const Step3Listas: React.FC<Props> = ({
  listasEnabled,
  setListasEnabled,
  varsLista,
  setVarsLista,
  horaInicio,
  horaFim,
  lotes,
}) => {
  const horaOpts = React.useMemo(() => buildHoraOpts(horaInicio, horaFim), [horaInicio, horaFim]);
  const temLotes = lotes && lotes.some(l => l.variacoes.length > 0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateVar = (id: string, field: keyof VarListaForm, value: any) =>
    setVarsLista(prev => prev.map(v => (v.id !== id ? v : { ...v, [field]: value })));
  const removeVar = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    setVarsLista(prev => prev.filter(v => v.id !== id));
  };
  const duplicateVar = (id: string) => {
    setVarsLista(prev => {
      const src = prev.find(v => v.id === id);
      if (!src) return prev;
      const dup = {
        ...src,
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        cor: COR_PALETTE[prev.length % COR_PALETTE.length],
      };
      const idx = prev.findIndex(v => v.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  };
  const addVar = () => {
    const last = varsLista[varsLista.length - 1];
    if (last) {
      duplicateVar(last.id);
    } else {
      setVarsLista(prev => [...prev, novaVarLista(prev.length)]);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-white text-[0.5rem] font-black uppercase tracking-widest mb-1">Lista de Convidados</p>
        <p className="text-zinc-400 text-[0.625rem] leading-relaxed">
          Opcional. A lista nao gera venda — apenas permite que o convidado entre ao dar o nome na portaria.
        </p>
      </div>

      <button
        onClick={() => setListasEnabled(!listasEnabled)}
        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${listasEnabled ? 'bg-[#FFD300]/5 border-[#FFD300]/25' : 'bg-zinc-900/40 border-white/5'}`}
      >
        <div className="text-left">
          <p className={`font-bold text-sm leading-none ${listasEnabled ? 'text-[#FFD300]' : 'text-white'}`}>
            Ativar Listas
          </p>
          <p className="text-zinc-400 text-[0.625rem] mt-1">Gerencie o acesso por convite e cotas</p>
        </div>
        <div
          className={`w-12 h-6 rounded-full border relative transition-all shrink-0 ${listasEnabled ? 'bg-[#FFD300]/20 border-[#FFD300]/40' : 'bg-zinc-800 border-white/10'}`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${listasEnabled ? 'left-6 bg-[#FFD300]' : 'left-0.5 bg-zinc-600'}`}
          />
        </div>
      </button>

      {!listasEnabled && (
        <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest text-center py-6 leading-loose">
          Ative para definir regras de acesso.
          <br />
          As cotas dos promoters dependem das variacoes criadas aqui.
        </p>
      )}

      {listasEnabled && (
        <div className="space-y-2">
          {varsLista.map(v => (
            <VarCard
              key={v.id}
              v={v}
              expanded={expandedId === v.id}
              outrasVars={varsLista.filter(o => o.id !== v.id)}
              horaOpts={horaOpts}
              onExpand={() => setExpandedId(v.id)}
              onSave={() => setExpandedId(null)}
              onChange={(field, value) => updateVar(v.id, field, value)}
              onDuplicate={() => duplicateVar(v.id)}
              onRemove={() => removeVar(v.id)}
            />
          ))}

          <div className="flex gap-2">
            <button
              onClick={addVar}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest active:border-[#FFD300]/20 active:text-[#FFD300]/50 transition-all"
            >
              <Plus size="0.6875rem" /> Adicionar
            </button>
            {temLotes && (
              <button
                onClick={() => {
                  const templates = gerarTemplates(lotes!);
                  setVarsLista(templates);
                  setExpandedId(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-dashed border-[#FFD300]/20 rounded-xl text-[#FFD300]/60 text-[0.5625rem] font-black uppercase tracking-widest active:border-[#FFD300]/40 active:text-[#FFD300] transition-all"
              >
                <ArrowDownToLine size="0.6875rem" /> Importar dos Ingressos
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
