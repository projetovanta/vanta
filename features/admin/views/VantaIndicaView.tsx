import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Plus, Edit2, X, Check, Loader2, Compass, ImagePlus, Eye, Search } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { ImageCropModal } from '../../../components/ImageCropModal';
import { UnsavedChangesModal } from '../../../components/UnsavedChangesModal';
import { TYPOGRAPHY } from '../../../constants';
import { VantaIndicaCard, TipoIndicaCard, TipoAcaoIndica } from '../../../types';
import { adminService } from '../services/adminService';
import { dataURLtoBlob } from '../../../utils';
import { useToast, ToastContainer } from '../../../components/Toast';

const TIPO_CONFIG: Record<TipoIndicaCard, { label: string; dot: string; bg: string; text: string; border: string }> = {
  DESTAQUE_EVENTO: {
    label: 'Destacar Evento',
    dot: '#FFD300',
    bg: 'bg-[#FFD300]/10',
    text: 'text-[#FFD300]',
    border: 'border-[#FFD300]/20',
  },
  PUBLICIDADE: {
    label: 'Publicidade',
    dot: '#71717A',
    bg: 'bg-zinc-900',
    text: 'text-zinc-400',
    border: 'border-white/10',
  },
  INFORMATIVO: {
    label: 'Informativo',
    dot: '#22d3ee',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
};

const ACAO_LABEL: Record<TipoAcaoIndica, string> = {
  link: 'URL externa',
  evento: 'ID do evento',
  cupom: 'Código do cupom',
  rota: 'Rota interna',
};

const Toggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 rounded-full relative transition-all duration-300 shrink-0 ${active ? 'bg-[#FFD300]' : 'bg-zinc-800 border border-white/10'}`}
  >
    <div
      className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${active ? 'left-6 bg-black' : 'left-1 bg-zinc-600'}`}
    />
  </button>
);

type LayoutPos = { x: number; y: number };

type EventoSearchResult = { id: string; nome: string; cidade: string; foto: string | null };

type ModalForm = {
  id?: string;
  tipo: TipoIndicaCard;
  eventoId: string;
  imagem: string;
  badge: string;
  titulo: string;
  subtitulo: string;
  alvoLocalidades: string;
  acaoLink: string;
  acaoTipo: TipoAcaoIndica;
  acaoValor: string;
  descontoPct: string;
  imgPosition: string;
  textAlign: string;
  _layoutBadge: LayoutPos;
  _layoutTitulo: LayoutPos;
  _layoutSubtitulo: LayoutPos;
  _scaleBadge: number;
  _scaleTitulo: number;
  _scaleSubtitulo: number;
};

const EMPTY: ModalForm = {
  tipo: 'PUBLICIDADE',
  eventoId: '',
  imagem: '',
  badge: '',
  titulo: '',
  subtitulo: '',
  alvoLocalidades: 'GLOBAL',
  acaoLink: '',
  acaoTipo: 'link',
  acaoValor: '',
  descontoPct: '',
  imgPosition: 'center',
  textAlign: 'end',
  _layoutBadge: { x: 0, y: 0 },
  _layoutTitulo: { x: 0, y: 0 },
  _layoutSubtitulo: { x: 0, y: 0 },
  _scaleBadge: 1,
  _scaleTitulo: 1,
  _scaleSubtitulo: 1,
};

/** Hook for drag-to-position on touch/mouse */
const useDragElement = (
  initial: LayoutPos,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onChange: (pos: LayoutPos) => void,
) => {
  const posRef = useRef(initial);
  const startRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });

  useEffect(() => {
    posRef.current = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.x, initial.y]);

  const getClientXY = (e: React.TouchEvent | React.MouseEvent): [number, number] => {
    if ('touches' in e) return [e.touches[0].clientX, e.touches[0].clientY];
    return [e.clientX, e.clientY];
  };

  const onStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const [cx, cy] = getClientXY(e);
    startRef.current = { px: cx, py: cy, ox: posRef.current.x, oy: posRef.current.y };
    const onMove = (ev: TouchEvent | MouseEvent) => {
      const [mx, my] = 'touches' in ev ? [ev.touches[0].clientX, ev.touches[0].clientY] : [ev.clientX, ev.clientY];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = ((mx - startRef.current.px) / rect.width) * 100;
      const dy = ((my - startRef.current.py) / rect.height) * 100;
      const nx = Math.max(-50, Math.min(90, startRef.current.ox + dx));
      const ny = Math.max(-50, Math.min(90, startRef.current.oy + dy));
      posRef.current = { x: nx, y: ny };
      onChange({ x: nx, y: ny });
    };
    const onEnd = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('mouseup', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchend', onEnd);
    document.addEventListener('mouseup', onEnd);
  };

  return { onTouchStart: onStart, onMouseDown: onStart };
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';

const VantaSelect: React.FC<{
  value: string;
  options: { value: string; label: string; dot?: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={inputCls + ' flex items-center justify-between gap-2 text-left'}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.dot && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selected.dot }} />
          )}
          {selected?.label || 'Selecionar'}
        </span>
        <svg
          className={`w-3 h-3 text-zinc-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors border-b border-white/5 last:border-0 ${o.value === value ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 active:bg-zinc-800'}`}
            >
              {o.dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.dot }} />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CidadeSelector: React.FC<{
  value: string;
  cidades: string[];
  onChange: (v: string) => void;
}> = ({ value, cidades, onChange }) => {
  const [query, setQuery] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const isGlobal = value === 'GLOBAL';
  const selecionadas = isGlobal
    ? []
    : value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
  const filtradas =
    query.length >= 1
      ? cidades.filter(c => c.toLowerCase().includes(query.toLowerCase()) && !selecionadas.includes(c))
      : cidades.filter(c => !selecionadas.includes(c)).slice(0, 8);

  const addCidade = (c: string) => {
    const nova = [...selecionadas, c];
    onChange(nova.join(', '));
    setQuery('');
    setShowDrop(false);
  };
  const removeCidade = (c: string) => {
    const nova = selecionadas.filter(s => s !== c);
    onChange(nova.length === 0 ? 'GLOBAL' : nova.join(', '));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onChange(isGlobal ? '' : 'GLOBAL')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] border ${
          isGlobal
            ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]'
            : 'bg-zinc-900/60 border-white/5 text-zinc-400'
        }`}
      >
        <span>GLOBAL</span>
        <span className="text-[9px] font-black uppercase tracking-widest">
          {isGlobal ? 'Ativo' : 'Clique para ativar'}
        </span>
      </button>
      {!isGlobal && (
        <>
          {selecionadas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selecionadas.map(c => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD300]/10 border border-[#FFD300]/30 text-[#FFD300] text-xs font-bold"
                >
                  {c}
                  <button type="button" onClick={() => removeCidade(c)} className="active:scale-90">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowDrop(true);
              }}
              onFocus={() => setShowDrop(true)}
              placeholder="Buscar cidade..."
              className={inputCls + ' pl-10'}
            />
            {showDrop && filtradas.length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden max-h-40 overflow-y-auto no-scrollbar shadow-xl">
                {filtradas.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => addCidade(c)}
                    className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-800 active:bg-zinc-800 transition-colors border-b border-white/5 last:border-0"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {showDrop && filtradas.length === 0 && query.length >= 1 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-zinc-400 text-xs text-center">Nenhuma cidade encontrada</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CardModal: React.FC<{
  initial: ModalForm;
  initialEventName?: string;
  onSave: (f: ModalForm) => void;
  onClose: () => void;
  isSaving: boolean;
}> = ({ initial, initialEventName, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState<ModalForm>(initial);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [badgePos, setBadgePos] = useState<LayoutPos>(initial._layoutBadge ?? { x: 0, y: 0 });
  const [tituloPos, setTituloPos] = useState<LayoutPos>(initial._layoutTitulo ?? { x: 0, y: 0 });
  const [subtituloPos, setSubtituloPos] = useState<LayoutPos>(initial._layoutSubtitulo ?? { x: 0, y: 0 });
  const [badgeScale, setBadgeScale] = useState(initial._scaleBadge ?? 1);
  const [tituloScale, setTituloScale] = useState(initial._scaleTitulo ?? 1);
  const [subtituloScale, setSubtituloScale] = useState(initial._scaleSubtitulo ?? 1);
  const [showGuides, setShowGuides] = useState(false);
  const [eventQuery, setEventQuery] = useState('');
  const [eventResults, setEventResults] = useState<EventoSearchResult[]>([]);
  const [searchingEvents, setSearchingEvents] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState(initialEventName || '');
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof ModalForm, v: string) => setForm(p => ({ ...p, [k]: v }));
  const isDestaque = form.tipo === 'DESTAQUE_EVENTO';
  const canSave = isDestaque
    ? !!form.eventoId && (!!form.imagem.trim() || !!form.subtitulo.trim())
    : form.imagem.trim() || form.titulo.trim() || form.badge.trim() || form.subtitulo.trim();

  // Busca de eventos com debounce — ao focar mostra ativos, ao digitar filtra
  const searchEventos = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      async () => {
        setSearchingEvents(true);
        let query = supabase
          .from('eventos_admin')
          .select('id, nome, cidade, foto')
          .eq('publicado', true)
          .order('data_inicio', { ascending: false })
          .limit(15);
        if (q.length >= 2) query = query.ilike('nome', `%${q}%`);
        const { data } = await query;
        setEventResults((data as EventoSearchResult[]) || []);
        setShowEventDropdown(true);
        setSearchingEvents(false);
      },
      q.length === 0 ? 0 : 300,
    );
  }, []);

  const handleEventFocus = () => {
    if (eventResults.length === 0 && !form.eventoId) searchEventos('');
  };

  const selectEvento = (ev: EventoSearchResult) => {
    setForm(p => ({
      ...p,
      eventoId: ev.id,
      badge: 'VANTA INDICA',
      titulo: ev.nome,
      alvoLocalidades: ev.cidade || 'GLOBAL',
      acaoTipo: 'evento',
      acaoValor: ev.id,
      acaoLink: '',
    }));
    setSelectedEventName(ev.nome);
    setEventQuery('');
    setShowEventDropdown(false);
    setEventResults([]);
  };

  // Ao mudar tipo, limpar campos auto-preenchidos se saiu de DESTAQUE_EVENTO
  const handleTipoChange = (newTipo: string) => {
    const wasDest = form.tipo === 'DESTAQUE_EVENTO';
    setForm(p => {
      const next = { ...p, tipo: newTipo as TipoIndicaCard };
      if (wasDest && newTipo !== 'DESTAQUE_EVENTO') {
        next.eventoId = '';
        next.badge = '';
        next.titulo = '';
        next.alvoLocalidades = 'GLOBAL';
        next.acaoTipo = 'link';
        next.acaoValor = '';
        next.acaoLink = '';
        setSelectedEventName('');
      }
      return next;
    });
  };

  // Carregar cidades dos eventos ao montar
  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('eventos_admin')
        .select('cidade')
        .eq('publicado', true)
        .not('cidade', 'is', null);
      if (data) {
        const unicas = [...new Set(data.map((r: { cidade: string }) => r.cidade).filter(Boolean))].sort();
        setCidadesDisponiveis(unicas);
      }
    })();
  }, []);

  const badgeDrag = useDragElement(badgePos, previewRef, setBadgePos);
  const tituloDrag = useDragElement(tituloPos, previewRef, setTituloPos);
  const subtituloDrag = useDragElement(subtituloPos, previewRef, setSubtituloPos);

  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const safeClose = () => {
    if (cropSrc) return;
    if (hasChanges) setShowExitConfirm(true);
    else onClose();
  };

  // Ao selecionar arquivo: GIF vai direto pro upload, outros abrem crop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';

    // GIF → upload direto (preserva animação)
    if (file.type === 'image/gif') {
      void handleGifUpload(file);
      return;
    }

    // Outros → abre crop
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) setCropSrc(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload direto de GIF (sem crop — preserva animação)
  const handleGifUpload = async (file: File) => {
    setUploadingImg(true);
    try {
      const path = `indica/${Date.now()}.gif`;
      const { error } = await supabase.storage
        .from('indica-assets')
        .upload(path, file, { upsert: true, contentType: 'image/gif' });
      if (!error) {
        const { data } = supabase.storage.from('indica-assets').getPublicUrl(path);
        if (data?.publicUrl) {
          set('imagem', data.publicUrl);
          setUploadingImg(false);
          return;
        }
      }
    } catch {
      /* silencioso */
    }
    // fallback: converte pra base64 (perde otimização mas funciona)
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) set('imagem', ev.target.result as string);
    };
    reader.readAsDataURL(file);
    setUploadingImg(false);
  };

  // Após crop: faz upload para Supabase
  const handleCropConfirm = async (dataUrl: string) => {
    setCropSrc(null);
    setUploadingImg(true);
    try {
      const blob = dataURLtoBlob(dataUrl);
      const path = `indica/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('indica-assets')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (!error) {
        const { data } = supabase.storage.from('indica-assets').getPublicUrl(path);
        if (data?.publicUrl) {
          set('imagem', data.publicUrl);
          setUploadingImg(false);
          return;
        }
      }
    } catch {
      /* silencioso */
    }
    // fallback base64
    set('imagem', dataUrl);
    setUploadingImg(false);
  };

  return (
    <div className="absolute inset-0 z-[50] bg-[#0A0A0A] flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Vanta Indica
            </p>
            <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
              {initial.id ? 'Editar Card' : 'Novo Card'}
            </h1>
          </div>
          <button
            aria-label="Voltar"
            onClick={safeClose}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-10 space-y-4 max-w-3xl mx-auto w-full"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
      >
        {/* 1. Tipo */}
        <Field label="Tipo do Card">
          <VantaSelect
            value={form.tipo}
            onChange={handleTipoChange}
            options={(Object.keys(TIPO_CONFIG) as TipoIndicaCard[]).map(t => ({
              value: t,
              label: TIPO_CONFIG[t].label,
              dot: TIPO_CONFIG[t].dot,
            }))}
          />
        </Field>

        {/* 2. Busca de Evento (só DESTAQUE_EVENTO) */}
        {isDestaque && (
          <Field label="Evento">
            <div className="relative">
              {form.eventoId && selectedEventName ? (
                <div className="flex items-center gap-2 bg-zinc-900/60 border border-[#FFD300]/20 rounded-xl px-4 py-3">
                  <Check size={14} className="text-[#FFD300] shrink-0" />
                  <span className="text-white text-sm truncate flex-1">{selectedEventName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        eventoId: '',
                        badge: '',
                        titulo: '',
                        alvoLocalidades: 'GLOBAL',
                        acaoTipo: 'link',
                        acaoValor: '',
                      }));
                      setSelectedEventName('');
                    }}
                    className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 active:scale-90"
                  >
                    <X size={10} className="text-zinc-400" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={eventQuery}
                      onChange={e => {
                        setEventQuery(e.target.value);
                        searchEventos(e.target.value);
                      }}
                      onFocus={handleEventFocus}
                      placeholder="Buscar evento pelo nome..."
                      className={inputCls + ' pl-10'}
                    />
                    {searchingEvents && (
                      <Loader2
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin"
                      />
                    )}
                  </div>
                  {showEventDropdown && eventResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar shadow-xl">
                      {eventResults.map(ev => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => selectEvento(ev)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 active:bg-zinc-800 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                            {ev.foto ? (
                              <img loading="lazy" src={ev.foto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-800" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{ev.nome}</p>
                            <p className="text-zinc-400 text-[10px]">{ev.cidade || 'Sem cidade'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showEventDropdown && eventResults.length === 0 && !searchingEvents && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3">
                      <p className="text-zinc-400 text-xs text-center">Nenhum evento encontrado</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Field>
        )}

        {/* 3. Badge */}
        <Field label="Badge">
          <input
            value={form.badge}
            onChange={e => !isDestaque && set('badge', e.target.value)}
            readOnly={isDestaque}
            placeholder={isDestaque ? 'Auto: VANTA INDICA' : 'CURADORIA'}
            className={inputCls + (isDestaque ? ' text-zinc-400 cursor-not-allowed' : '')}
          />
        </Field>

        {/* 4. Título */}
        <Field label="Título">
          <input
            value={form.titulo}
            onChange={e => !isDestaque && set('titulo', e.target.value)}
            readOnly={isDestaque}
            placeholder={isDestaque ? 'Auto: nome do evento' : 'O Segredo do Casarão'}
            className={inputCls + (isDestaque ? ' text-zinc-400 cursor-not-allowed' : '')}
          />
        </Field>

        {/* 5. Subtítulo (sempre manual) */}
        <Field label="Subtítulo">
          <input
            value={form.subtitulo}
            onChange={e => set('subtitulo', e.target.value)}
            placeholder="A festa privada mais comentada..."
            className={inputCls}
          />
        </Field>

        {/* 6. Foto */}
        <Field label="Imagem do Card · 3:2 · Mín. 900×600 · GIF aceito">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImg}
              className="flex-1 h-16 bg-zinc-900/60 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-1 active:border-[#FFD300]/30 transition-all disabled:opacity-40"
            >
              {uploadingImg ? (
                <Loader2 size={18} className="text-zinc-400 animate-spin" />
              ) : (
                <ImagePlus size={18} className="text-zinc-400" />
              )}
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                {uploadingImg ? 'Enviando…' : 'Foto / Câmera'}
              </span>
            </button>
            {form.imagem && (
              <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/10">
                <img loading="lazy" src={form.imagem} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('imagem', '')}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center active:scale-90"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </Field>

        {/* 7. Localidade */}
        <Field label="Localidade">
          {isDestaque ? (
            <div className={inputCls + ' text-zinc-400 cursor-not-allowed'}>
              {form.alvoLocalidades || 'Auto: cidade do evento'}
            </div>
          ) : (
            <CidadeSelector
              value={form.alvoLocalidades}
              cidades={cidadesDisponiveis}
              onChange={v => set('alvoLocalidades', v)}
            />
          )}
        </Field>

        {/* 8-9. Ação + Link/Rota (só PUBLICIDADE/INFORMATIVO) */}
        {!isDestaque && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ação ao clicar">
                <VantaSelect
                  value={form.acaoTipo}
                  onChange={v => set('acaoTipo', v)}
                  options={(['link', 'rota', 'cupom'] as TipoAcaoIndica[]).map(t => ({
                    value: t,
                    label: ACAO_LABEL[t],
                  }))}
                />
              </Field>
              <Field label={ACAO_LABEL[form.acaoTipo]}>
                <input
                  value={form.acaoValor}
                  onChange={e => set('acaoValor', e.target.value)}
                  placeholder={
                    form.acaoTipo === 'cupom' ? 'VANTA20' : form.acaoTipo === 'rota' ? '/rota-interna' : 'https://...'
                  }
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Link / Rota">
              <input
                value={form.acaoLink}
                onChange={e => set('acaoLink', e.target.value)}
                placeholder="https://... ou /rota-interna"
                className={inputCls}
              />
            </Field>
          </>
        )}

        {/* 10. Desconto % (só se ação = cupom) */}
        {!isDestaque && form.acaoTipo === 'cupom' && (
          <Field label="Desconto (%)">
            <input
              type="number"
              value={form.descontoPct}
              onChange={e => set('descontoPct', e.target.value)}
              placeholder="20"
              className={inputCls}
            />
          </Field>
        )}

        {/* ── Preview Live — Drag to position ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={12} className="text-[#FFD300]" />
              <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                Preview — arraste os textos para posicionar
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuides(g => !g)}
              className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-colors ${showGuides ? 'bg-[#FFD300]/20 border-[#FFD300]/40 text-[#FFD300]' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}
            >
              Guias
            </button>
          </div>

          {/* Card preview — réplica exata do Highlights.tsx da home */}
          <div
            ref={previewRef}
            className="relative w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-lg select-none touch-none"
            style={{ aspectRatio: '5 / 3' }}
          >
            {form.imagem ? (
              <img
                src={form.imagem}
                className="absolute inset-0 w-full h-full object-cover"
                alt="preview"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />

            {/* Guias de alinhamento */}
            {showGuides && (
              <>
                {/* Centro vertical */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#FFD300]/30 pointer-events-none z-20" />
                {/* Centro horizontal */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-[#FFD300]/30 pointer-events-none z-20" />
                {/* Terços verticais */}
                <div className="absolute left-[33.33%] top-0 bottom-0 w-px bg-white/10 pointer-events-none z-20" />
                <div className="absolute left-[66.66%] top-0 bottom-0 w-px bg-white/10 pointer-events-none z-20" />
                {/* Terços horizontais */}
                <div className="absolute top-[33.33%] left-0 right-0 h-px bg-white/10 pointer-events-none z-20" />
                <div className="absolute top-[66.66%] left-0 right-0 h-px bg-white/10 pointer-events-none z-20" />
                {/* Margens seguras (5%) */}
                <div className="absolute inset-[5%] border border-dashed border-white/10 rounded-xl pointer-events-none z-20" />
                {/* Label central */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <div className="w-2 h-2 rounded-full bg-[#FFD300]/50" />
                </div>
              </>
            )}

            {form.badge.trim() && (
              <div
                {...badgeDrag}
                style={{
                  position: 'absolute',
                  left: `${badgePos.x}%`,
                  top: `${badgePos.y}%`,
                  cursor: 'grab',
                  transform: `scale(${badgeScale})`,
                  transformOrigin: 'top left',
                }}
                className="active:cursor-grabbing z-10"
              >
                <span className="bg-[#FFD300] text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(255,211,0,0.4)] whitespace-nowrap">
                  {form.badge}
                </span>
              </div>
            )}

            {form.titulo.trim() && (
              <div
                {...tituloDrag}
                style={{
                  position: 'absolute',
                  left: `${tituloPos.x}%`,
                  top: `${tituloPos.y}%`,
                  cursor: 'grab',
                  transform: `scale(${tituloScale})`,
                  transformOrigin: 'top left',
                }}
                className="active:cursor-grabbing z-10 max-w-[90%]"
              >
                <h2
                  style={TYPOGRAPHY.screenTitle}
                  className="text-xl italic drop-shadow-lg text-white whitespace-nowrap"
                >
                  {form.titulo}
                </h2>
              </div>
            )}

            {form.subtitulo.trim() && (
              <div
                {...subtituloDrag}
                style={{
                  position: 'absolute',
                  left: `${subtituloPos.x}%`,
                  top: `${subtituloPos.y}%`,
                  cursor: 'grab',
                  transform: `scale(${subtituloScale})`,
                  transformOrigin: 'top left',
                }}
                className="active:cursor-grabbing z-10 max-w-[90%]"
              >
                <p className="text-[10px] text-[#FFD300] font-semibold italic leading-relaxed drop-shadow-md whitespace-nowrap">
                  {form.subtitulo}
                </p>
              </div>
            )}
          </div>

          {/* Sliders de tamanho */}
          <div className="space-y-2 pt-1">
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Tamanho dos elementos</p>
            {form.badge.trim() && (
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-zinc-400 w-16 shrink-0">Selo</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={badgeScale}
                  onChange={e => setBadgeScale(Number(e.target.value))}
                  className="flex-1 accent-[#FFD300] h-1"
                />
                <span className="text-[9px] text-zinc-500 w-8 text-right">{Math.round(badgeScale * 100)}%</span>
              </div>
            )}
            {form.titulo.trim() && (
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-zinc-400 w-16 shrink-0">Título</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={tituloScale}
                  onChange={e => setTituloScale(Number(e.target.value))}
                  className="flex-1 accent-[#FFD300] h-1"
                />
                <span className="text-[9px] text-zinc-500 w-8 text-right">{Math.round(tituloScale * 100)}%</span>
              </div>
            )}
            {form.subtitulo.trim() && (
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-zinc-400 w-16 shrink-0">Subtítulo</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={subtituloScale}
                  onChange={e => setSubtituloScale(Number(e.target.value))}
                  className="flex-1 accent-[#FFD300] h-1"
                />
                <span className="text-[9px] text-zinc-500 w-8 text-right">{Math.round(subtituloScale * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            canSave &&
            onSave({
              ...form,
              _layoutBadge: badgePos,
              _layoutTitulo: tituloPos,
              _layoutSubtitulo: subtituloPos,
              _scaleBadge: badgeScale,
              _scaleTitulo: tituloScale,
              _scaleSubtitulo: subtituloScale,
            })
          }
          disabled={!canSave || isSaving || uploadingImg}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {isSaving ? 'Salvando...' : 'Salvar Card'}
        </button>
      </div>

      {/* Editor de crop — sobrepõe o modal */}
      {cropSrc && (
        <div className="absolute inset-0 z-[60]">
          <ImageCropModal
            src={cropSrc}
            aspect={3 / 2}
            minWidth={900}
            minHeight={600}
            label="Imagem do Card"
            onConfirm={handleCropConfirm}
            onClose={() => setCropSrc(null)}
          />
        </div>
      )}

      {showExitConfirm && (
        <div role="presentation" onClick={e => e.stopPropagation()}>
          <UnsavedChangesModal onStay={() => setShowExitConfirm(false)} onLeave={onClose} />
        </div>
      )}
    </div>
  );
};

export const VantaIndicaView: React.FC<{ onBack: () => void; userId?: string }> = ({ onBack, userId }) => {
  const [cards, setCards] = useState<VantaIndicaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; data: ModalForm; eventName?: string }>({
    open: false,
    data: EMPTY,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, dismiss, toast } = useToast();

  const refresh = async () => {
    await adminService.refreshIndicaCards(true);
    setCards(adminService.getIndicaCards());
  };

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await adminService.toggleAtivoCard(id);
      setCards(adminService.getIndicaCards());
      const card = adminService.getIndicaCards().find(c => c.id === id);
      toast('sucesso', card?.ativo ? 'Card ativado' : 'Card desativado');
    } catch {
      toast('erro', 'Erro ao alterar status');
    }
  };

  const handleEdit = (card: VantaIndicaCard) => {
    setModal({
      open: true,
      data: {
        id: card.id,
        tipo: card.tipo,
        eventoId: card.tipo === 'DESTAQUE_EVENTO' ? card.acao?.valor || '' : '',
        imagem: card.imagem || '',
        badge: card.badge,
        titulo: card.titulo,
        subtitulo: card.subtitulo,
        alvoLocalidades: card.alvoLocalidades.join(', '),
        acaoLink: card.acaoLink,
        acaoTipo: card.acao?.tipo || 'link',
        acaoValor: card.acao?.valor || '',
        descontoPct: String(card.acao?.descontoPct || ''),
        imgPosition: card.imgPosition || 'center',
        textAlign: card.textAlign || 'end',
        _layoutBadge: card.layoutConfig?.badge ?? { x: 0, y: 0 },
        _layoutTitulo: card.layoutConfig?.titulo ?? { x: 0, y: 0 },
        _layoutSubtitulo: card.layoutConfig?.subtitulo ?? { x: 0, y: 0 },
        _scaleBadge: card.layoutConfig?.badgeScale ?? 1,
        _scaleTitulo: card.layoutConfig?.tituloScale ?? 1,
        _scaleSubtitulo: card.layoutConfig?.subtituloScale ?? 1,
      },
      eventName: card.tipo === 'DESTAQUE_EVENTO' ? card.titulo : '',
    });
  };

  const handleSave = async (form: ModalForm) => {
    setIsSaving(true);
    const isDest = form.tipo === 'DESTAQUE_EVENTO';
    const payload = {
      tipo: form.tipo,
      imagem: form.imagem || undefined,
      badge: form.badge.toUpperCase(),
      titulo: form.titulo,
      subtitulo: form.subtitulo,
      alvoLocalidades: form.alvoLocalidades
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      acaoLink: isDest ? '' : form.acaoLink.trim(),
      ativo: true,
      acao: isDest
        ? { tipo: 'evento' as TipoAcaoIndica, valor: form.eventoId }
        : form.acaoValor
          ? {
              tipo: form.acaoTipo,
              valor: form.acaoValor,
              descontoPct: form.acaoTipo === 'cupom' && form.descontoPct ? Number(form.descontoPct) : undefined,
            }
          : undefined,
      imgPosition: form.imgPosition,
      textAlign: form.textAlign,
      layoutConfig: {
        badge: form._layoutBadge,
        titulo: form._layoutTitulo,
        subtitulo: form._layoutSubtitulo,
        badgeScale: form._scaleBadge,
        tituloScale: form._scaleTitulo,
        subtituloScale: form._scaleSubtitulo,
      },
      criadoPor: userId || 'sistema',
    };
    try {
      if (form.id) {
        await adminService.updateCard(form.id, payload);
      } else {
        await adminService.addCard(payload);
      }
      await refresh();
      setModal({ open: false, data: EMPTY });
      toast('sucesso', form.id ? 'Card atualizado' : 'Card criado');
    } catch {
      toast('erro', 'Erro ao salvar card');
    }
    setIsSaving(false);
  };

  const ativos = cards.filter(c => c.ativo);
  const inativos = cards.filter(c => !c.ativo);

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-5 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <p style={TYPOGRAPHY.sectionKicker} className="mb-1.5">
              Portal Admin
            </p>
            <div className="flex items-center gap-3">
              <h1 style={TYPOGRAPHY.screenTitle} className="text-xl italic">
                VANTA Indica
              </h1>
              <span className="text-[9px] font-black text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full">
                {ativos.length} ativo{ativos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setModal({ open: true, data: EMPTY })}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl active:scale-95 transition-all"
            >
              <Plus size={14} className="text-[#FFD300]" />
              <span className="text-[#FFD300] text-[10px] font-black uppercase tracking-wider">Novo</span>
            </button>
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
            >
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 size={24} className="text-zinc-700 animate-spin" />
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Carregando cards...</p>
          </div>
        )}
        {!loading && cards.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Compass size={28} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Nenhum card criado ainda.</p>
          </div>
        )}

        {cards.map(card => {
          const cfg = TIPO_CONFIG[card.tipo];
          return (
            <div
              key={card.id}
              className={`relative overflow-hidden rounded-2xl border transition-all ${card.ativo ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-900/15 border-white/3 opacity-50'}`}
            >
              <div className="flex gap-0">
                {/* Imagem lateral */}
                <div className="w-20 h-20 shrink-0 bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {card.imagem ? (
                    <img src={card.imagem} alt={card.titulo} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                      {card.badge.slice(0, 3)}
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Toggle active={card.ativo} onChange={() => handleToggle(card.id)} />
                      <button
                        onClick={() => handleEdit(card)}
                        className="w-7 h-7 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                      >
                        <Edit2 size={11} className="text-zinc-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white font-bold text-sm leading-tight truncate">{card.titulo}</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{card.subtitulo}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest">{card.badge}</p>
                    <span className="text-zinc-800">·</span>
                    <p className="text-zinc-700 text-[8px]">{card.alvoLocalidades[0] || 'GLOBAL'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {inativos.length > 0 && ativos.length > 0 && (
          <p className="text-zinc-800 text-[9px] font-black uppercase tracking-widest text-center pt-2">
            {inativos.length} inativo{inativos.length !== 1 ? 's' : ''} oculto{inativos.length !== 1 ? 's' : ''} na home
          </p>
        )}
      </div>

      {modal.open && (
        <CardModal
          initial={modal.data}
          initialEventName={modal.eventName}
          onSave={handleSave}
          onClose={() => setModal({ open: false, data: EMPTY })}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
