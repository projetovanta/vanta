import React, { useState, useRef, useEffect } from 'react';
import { Copy, Upload, Loader2, Search, ChevronDown } from 'lucide-react';
import { ImageCropModal } from '../../../../components/ImageCropModal';
import type { Comunidade } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { todayBR } from '../../../../utils';
import { inputCls, inputDateCls, labelCls } from './constants';
import { VantaDropdown } from '../../../../components/VantaDropdown';

// Horarios de 30 em 30 min (00:00 ate 23:30)
const ALL_HORA_OPTS = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const hStr = String(h).padStart(2, '0');
    opts.push({ value: `${hStr}:00`, label: `${hStr}:00` });
    opts.push({ value: `${hStr}:30`, label: `${hStr}:30` });
  }
  return opts;
})();

interface Props {
  foto: string;
  setFoto(v: string): void;
  nome: string;
  setNome(v: string): void;
  descricao: string;
  setDescricao(v: string): void;
  dataInicio: string;
  setDataInicio(v: string): void;
  horaInicio: string;
  setHoraInicio(v: string): void;
  horaFim: string;
  setHoraFim(v: string): void;
  formato: string;
  setFormato(v: string): void;
  estilos: string[];
  setEstilos(v: string[]): void;
  experiencias: string[];
  setExperiencias(v: string[]): void;
  recorrencia: string;
  setRecorrencia(v: string): void;
  recorrenciaAte: string;
  setRecorrenciaAte(v: string): void;
  comunidade: Comunidade;
  onCopiar: () => void;
  temEventosAnteriores: boolean;
}

export const Step1Evento: React.FC<Props> = p => {
  const fotoRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [dbFormatos, setDbFormatos] = useState<string[]>([]);
  const [dbEstilos, setDbEstilos] = useState<string[]>([]);
  const [dbExperiencias, setDbExperiencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFormato, setSearchFormato] = useState('');
  const [searchEstilo, setSearchEstilo] = useState('');
  const [searchExperiencia, setSearchExperiencia] = useState('');
  const [openSection, setOpenSection] = useState<'formato' | 'estilo' | 'experiencia' | null>(null);

  useEffect(() => {
    (async () => {
      const [f, e, x] = await Promise.all([
        supabase.from('formatos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('estilos').select('label').eq('ativo', true).order('ordem', { ascending: true }),
        supabase.from('experiencias').select('label').eq('ativo', true).order('ordem', { ascending: true }),
      ]);
      setDbFormatos((f.data ?? []).map((d: { label: string }) => d.label));
      setDbEstilos((e.data ?? []).map((d: { label: string }) => d.label));
      setDbExperiencias((x.data ?? []).map((d: { label: string }) => d.label));
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setCropSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (fotoRef.current) fotoRef.current.value = '';
  };

  const hoje = todayBR();

  const filterItems = (items: string[], search: string) =>
    search ? items.filter(i => i.toLowerCase().includes(search.toLowerCase())) : items;

  const toggleMulti = (arr: string[], item: string, max: number): string[] | null => {
    if (arr.includes(item)) return arr.filter(x => x !== item);
    if (arr.length >= max) return null;
    return [...arr, item];
  };

  return (
    <div className="space-y-5">
      {p.temEventosAnteriores && (
        <button
          onClick={p.onCopiar}
          className="w-full flex items-center gap-3 p-4 bg-zinc-900/40 border border-dashed border-white/10 rounded-2xl active:border-[#FFD300]/30 active:bg-[#FFD300]/5 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
            <Copy size={14} className="text-zinc-500" />
          </div>
          <div className="text-left">
            <p className="text-zinc-400 font-bold text-sm leading-none">Importar dados de evento anterior</p>
            <p className="text-zinc-700 text-[9px] mt-0.5 font-black uppercase tracking-widest">
              Ingressos, listas, equipe
            </p>
          </div>
        </button>
      )}

      <div>
        <label className={labelCls}>Foto do evento *</label>
        <p className="text-[8px] text-zinc-700 mb-3 font-black uppercase tracking-widest">
          1080 × 1350 px · proporção 4:5 · JPG ou PNG
        </p>
        <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
        <button
          onClick={() => fotoRef.current?.click()}
          className="w-full aspect-[4/5] max-h-[360px] mx-auto rounded-2xl overflow-hidden border border-dashed border-white/10 bg-zinc-900/30 relative active:scale-[0.99] transition-all"
        >
          {p.foto ? (
            <img loading="lazy" src={p.foto} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                <Upload size={22} className="text-zinc-600" />
              </div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                Toque para escolher a foto
              </p>
            </div>
          )}
          {p.foto && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <Upload size={10} className="text-white/60" />
              <p className="text-white text-[8px] font-black uppercase tracking-widest">Trocar foto</p>
            </div>
          )}
        </button>
      </div>

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspect={4 / 5}
          minWidth={1080}
          minHeight={1350}
          label="Foto do Evento"
          onConfirm={dataUrl => {
            p.setFoto(dataUrl);
            setCropSrc(null);
          }}
          onClose={() => setCropSrc(null)}
        />
      )}

      <div>
        <label className={labelCls}>Nome do evento *</label>
        <input
          value={p.nome}
          onChange={e => p.setNome(e.target.value)}
          placeholder="Ex: O Segredo do Casarão"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Descrição *</label>
        <textarea
          value={p.descricao}
          onChange={e => p.setDescricao(e.target.value)}
          placeholder="Descreva a experiência do evento..."
          rows={3}
          className={inputCls + ' resize-none leading-relaxed'}
        />
      </div>

      {/* ── FORMATO (acordeao) ── */}
      <div
        className={`border rounded-xl transition-all overflow-hidden ${openSection === 'formato' ? 'border-[#FFD300]/20 bg-zinc-900/30' : 'border-white/5 bg-zinc-900/20'}`}
      >
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'formato' ? null : 'formato')}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px]">🧱</span>
            <span className="text-white text-xs font-bold">Formato</span>
            {p.formato && openSection !== 'formato' && (
              <span className="px-2 py-0.5 bg-[#FFD300]/15 border border-[#FFD300]/30 rounded-lg text-[#FFD300] text-[9px] font-bold truncate">
                {p.formato}
              </span>
            )}
            {!p.formato && openSection !== 'formato' && (
              <span className="text-zinc-600 text-[9px]">Nenhum selecionado</span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-500 shrink-0 transition-transform ${openSection === 'formato' ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection === 'formato' && (
          <div className="px-4 pb-3 space-y-2">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">
              O que é / Onde acontece · selecione 1
            </p>
            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="text-zinc-600 animate-spin" />
                <span className="text-zinc-600 text-xs">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={searchFormato}
                    onChange={e => setSearchFormato(e.target.value)}
                    placeholder="Buscar formato..."
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {filterItems(dbFormatos, searchFormato).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => p.setFormato(p.formato === fmt ? '' : fmt)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                        p.formato === fmt
                          ? 'bg-[#FFD300]/15 border-[#FFD300]/40 text-[#FFD300]'
                          : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── ESTILO (acordeao) ── */}
      <div
        className={`border rounded-xl transition-all overflow-hidden ${openSection === 'estilo' ? 'border-purple-500/20 bg-zinc-900/30' : 'border-white/5 bg-zinc-900/20'}`}
      >
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'estilo' ? null : 'estilo')}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px]">🎵</span>
            <span className="text-white text-xs font-bold shrink-0">Estilo</span>
            {p.estilos.length > 0 && openSection !== 'estilo' && (
              <div className="flex gap-1 flex-wrap min-w-0">
                {p.estilos.map(e => (
                  <span
                    key={e}
                    className="px-1.5 py-0.5 bg-purple-500/15 border border-purple-500/30 rounded text-purple-400 text-[8px] font-bold truncate"
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
            {p.estilos.length === 0 && openSection !== 'estilo' && (
              <span className="text-zinc-600 text-[9px]">Nenhum selecionado</span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-500 shrink-0 transition-transform ${openSection === 'estilo' ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection === 'estilo' && (
          <div className="px-4 pb-3 space-y-2">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Som / Vibe · min. 1, max. 5</p>
            <p
              className={`text-[8px] font-black uppercase tracking-widest ${p.estilos.length < 1 ? 'text-amber-500' : p.estilos.length >= 5 ? 'text-blue-400' : 'text-emerald-500'}`}
            >
              {p.estilos.length}/5 selecionados
            </p>
            {!loading && (
              <>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={searchEstilo}
                    onChange={e => setSearchEstilo(e.target.value)}
                    placeholder="Buscar estilo..."
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {filterItems(dbEstilos, searchEstilo).map(est => {
                    const selected = p.estilos.includes(est);
                    const limitReached = p.estilos.length >= 5 && !selected;
                    return (
                      <button
                        key={est}
                        type="button"
                        disabled={limitReached}
                        onClick={() => {
                          const r = toggleMulti(p.estilos, est, 5);
                          if (r) p.setEstilos(r);
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                          selected
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                            : limitReached
                              ? 'bg-zinc-900/30 border-white/3 text-zinc-700 opacity-40 cursor-not-allowed'
                              : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                        }`}
                      >
                        {est}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── EXPERIENCIA (acordeao) ── */}
      <div
        className={`border rounded-xl transition-all overflow-hidden ${openSection === 'experiencia' ? 'border-emerald-500/20 bg-zinc-900/30' : 'border-white/5 bg-zinc-900/20'}`}
      >
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'experiencia' ? null : 'experiencia')}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px]">✨</span>
            <span className="text-white text-xs font-bold shrink-0">Experiencia</span>
            {p.experiencias.length > 0 && openSection !== 'experiencia' && (
              <div className="flex gap-1 flex-wrap min-w-0">
                {p.experiencias.map(e => (
                  <span
                    key={e}
                    className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-emerald-400 text-[8px] font-bold truncate"
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
            {p.experiencias.length === 0 && openSection !== 'experiencia' && (
              <span className="text-zinc-600 text-[9px]">Nenhum selecionado</span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-500 shrink-0 transition-transform ${openSection === 'experiencia' ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection === 'experiencia' && (
          <div className="px-4 pb-3 space-y-2">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">
              Modelo / Diferencial · min. 1, max. 5
            </p>
            <p
              className={`text-[8px] font-black uppercase tracking-widest ${p.experiencias.length < 1 ? 'text-amber-500' : p.experiencias.length >= 5 ? 'text-blue-400' : 'text-emerald-500'}`}
            >
              {p.experiencias.length}/5 selecionadas
            </p>
            {!loading && (
              <>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={searchExperiencia}
                    onChange={e => setSearchExperiencia(e.target.value)}
                    placeholder="Buscar experiencia..."
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {filterItems(dbExperiencias, searchExperiencia).map(exp => {
                    const selected = p.experiencias.includes(exp);
                    const limitReached = p.experiencias.length >= 5 && !selected;
                    return (
                      <button
                        key={exp}
                        type="button"
                        disabled={limitReached}
                        onClick={() => {
                          const r = toggleMulti(p.experiencias, exp, 5);
                          if (r) p.setExperiencias(r);
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                          selected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : limitReached
                              ? 'bg-zinc-900/30 border-white/3 text-zinc-700 opacity-40 cursor-not-allowed'
                              : 'bg-zinc-900/50 border-white/5 text-zinc-400'
                        }`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className={labelCls}>Data do Evento *</label>
        <input
          value={p.dataInicio}
          onChange={e => p.setDataInicio(e.target.value)}
          type="date"
          min={hoje}
          className={inputDateCls}
          style={{ colorScheme: 'dark' }}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Inicio *</label>
            <VantaDropdown
              value={p.horaInicio}
              onChange={val => p.setHoraInicio(val)}
              options={ALL_HORA_OPTS}
              placeholder="Horario"
              className="w-full"
            />
          </div>
          <div>
            <label className={labelCls}>Encerramento *</label>
            <VantaDropdown
              value={p.horaFim}
              onChange={val => p.setHoraFim(val)}
              options={ALL_HORA_OPTS}
              placeholder="Horario"
              className="w-full"
            />
          </div>
        </div>
        {p.dataInicio && p.horaInicio && p.horaFim && p.horaFim <= p.horaInicio && (
          <p className="text-zinc-500 text-[9px] italic">
            Encerramento no dia seguinte (
            {(() => {
              const d = new Date(p.dataInicio + 'T00:00:00');
              d.setDate(d.getDate() + 1);
              return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            })()}
            )
          </p>
        )}

        {/* Recorrencia */}
        <div className="space-y-2 pt-2">
          <label className={labelCls}>Recorrencia</label>
          <VantaDropdown
            value={p.recorrencia}
            onChange={val => p.setRecorrencia(val)}
            options={[
              { value: 'UNICO', label: 'Evento unico' },
              { value: 'SEMANAL', label: 'Semanal' },
              { value: 'QUINZENAL', label: 'Quinzenal' },
              { value: 'MENSAL', label: 'Mensal' },
            ]}
            placeholder="Frequencia"
            className="w-full"
          />
          {p.recorrencia !== 'UNICO' && (
            <div>
              <label className={labelCls}>Repetir ate</label>
              <input
                value={p.recorrenciaAte}
                onChange={e => p.setRecorrenciaAte(e.target.value)}
                type="date"
                min={p.dataInicio || hoje}
                className={inputDateCls}
                style={{ colorScheme: 'dark' }}
              />
              {!p.recorrenciaAte && (
                <p className="text-amber-500/70 text-[9px] mt-1">Escolha ate quando o evento se repete</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls}>Local · vinculado à comunidade</label>
          <input
            value={p.comunidade.nome}
            readOnly
            aria-label="Local vinculado à comunidade"
            className={inputCls + ' opacity-40 cursor-not-allowed'}
          />
        </div>
        <div>
          <label className={labelCls}>Endereço</label>
          <input
            value={`${p.comunidade.endereco}, ${p.comunidade.cidade}`}
            readOnly
            className={inputCls + ' opacity-40 cursor-not-allowed'}
          />
        </div>
        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">
          Somente o VANTA masteradm pode alterar local e endereço.
        </p>
      </div>
    </div>
  );
};
