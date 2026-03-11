import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, X, Camera, Loader2, Users } from 'lucide-react';
import { authService } from '../../../../services/authService';
import { ImageCropModal } from '../../../../components/ImageCropModal';
import { Membro } from '../../../../types';

const inputCls =
  'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';
const labelCls = 'text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block';

export const Step3Fotos: React.FC<{
  fotoPerfil: string;
  setFotoPerfil(v: string): void;
  fotoCapa: string;
  setFotoCapa(v: string): void;
  produtores: Membro[];
  setProdutores(v: Membro[]): void;
}> = ({ fotoPerfil, setFotoPerfil, fotoCapa, setFotoCapa, produtores, setProdutores }) => {
  const perfilRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [resultados, setResultados] = useState<Membro[]>([]);
  const [searching, setSearching] = useState(false);
  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'perfil' | 'capa' | null>(null);

  // Ref para acessar produtores atuais sem causar re-run do useEffect
  const produtoresRef = useRef(produtores);
  produtoresRef.current = produtores;

  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      setSearching(true);
      try {
        const todos = await authService.buscarMembros(query, 8);
        if (cancelled) return;
        const ids = new Set(produtoresRef.current.map(p => p.id));
        setResultados(todos.filter(m => !ids.has(m.id)));
      } catch (err) {
        console.error('[Step3] busca falhou:', err);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const pickImg = (ref: React.RefObject<HTMLInputElement>, target: 'perfil' | 'capa') => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      if (src) {
        setCropSrc(src);
        setCropTarget(target);
      }
    };
    reader.readAsDataURL(file);
    // Reset input para permitir re-selecionar o mesmo arquivo
    if (ref.current) ref.current.value = '';
  };

  const handleCropConfirm = (dataUrl: string) => {
    if (cropTarget === 'perfil') setFotoPerfil(dataUrl);
    if (cropTarget === 'capa') setFotoCapa(dataUrl);
    setCropSrc(null);
    setCropTarget(null);
  };

  const addProdutor = (m: Membro) => {
    setProdutores([...produtores, m]);
    setQuery('');
    setShowResults(false);
  };

  const removeProdutor = (id: string) => setProdutores(produtores.filter(p => p.id !== id));

  return (
    <div className="space-y-6">
      {/* Fotos */}
      <div>
        <label className={labelCls}>Imagens</label>
        <div className="flex gap-3 items-end">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <input
              ref={perfilRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => pickImg(perfilRef, 'perfil')}
            />
            <button
              onClick={() => perfilRef.current?.click()}
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all bg-zinc-900"
            >
              {fotoPerfil ? (
                <img loading="lazy" src={fotoPerfil} alt="perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size="1.125rem" className="text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                <Upload size="0.875rem" className="text-white" />
              </div>
            </button>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Perfil *</p>
            <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest">Mín. 400×400</p>
          </div>

          {/* Foto de capa */}
          <div className="flex-1 flex flex-col gap-1.5">
            <input
              ref={capaRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => pickImg(capaRef, 'capa')}
            />
            <button
              onClick={() => capaRef.current?.click()}
              className="w-full h-20 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 relative group active:scale-95 transition-all bg-zinc-900"
            >
              {fotoCapa ? (
                <img loading="lazy" src={fotoCapa} alt="capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Camera size="1.125rem" className="text-zinc-400" />
                  <p className="text-zinc-700 text-[0.5rem] font-black uppercase tracking-widest">Capa</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 flex items-center justify-center">
                <Upload size="0.875rem" className="text-white" />
              </div>
            </button>
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Capa *</p>
            <p className="text-[0.4375rem] text-zinc-700 font-black uppercase tracking-widest">Mín. 1200×400</p>
          </div>
        </div>
      </div>

      {/* Editor de crop — abre sobre todo o conteúdo */}
      {cropSrc && cropTarget && (
        <ImageCropModal
          src={cropSrc}
          aspect={cropTarget === 'perfil' ? 1 : 3}
          minWidth={cropTarget === 'perfil' ? 400 : 1200}
          minHeight={cropTarget === 'perfil' ? 400 : 400}
          label={cropTarget === 'perfil' ? 'Foto de Perfil' : 'Foto de Capa'}
          onConfirm={handleCropConfirm}
          onClose={() => {
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}

      {/* Produtor responsável */}
      <div>
        <label className={labelCls}>Produtor Responsável * (ao menos 1)</label>
        <p className="text-[0.5rem] text-zinc-700 mb-3 font-black uppercase tracking-widest">
          Busque pelo email ou nome do membro na base VANTA.
        </p>

        {/* Busca */}
        <div className="relative mb-3">
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2.5 focus-within:border-[#FFD300]/30">
            {searching ? (
              <Loader2 size="0.875rem" className="text-zinc-400 shrink-0 animate-spin" />
            ) : (
              <Search size="0.875rem" className="text-zinc-400 shrink-0" />
            )}
            <input
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Buscar por email ou nome..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-700"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowResults(false);
                  setResultados([]);
                }}
                className="text-zinc-400 active:text-zinc-400"
              >
                <X size="0.8125rem" />
              </button>
            )}
          </div>
          {showResults && query.length >= 2 && !searching && resultados.length === 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl px-4 py-3">
              <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest text-center">
                Nenhum membro encontrado
              </p>
            </div>
          )}
          {showResults && resultados.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-xl mt-1 overflow-hidden shadow-2xl">
              {resultados.map(m => (
                <button
                  key={m.id}
                  onClick={() => addProdutor(m)}
                  className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-all text-left"
                >
                  <img
                    loading="lazy"
                    src={m.foto}
                    alt={m.nome}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm leading-none truncate">{m.nome}</p>
                    <p className="text-zinc-400 text-[0.625rem] mt-0.5 truncate">{m.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de produtores */}
        {produtores.length === 0 ? (
          <div className="flex items-center gap-3 p-4 border border-dashed border-white/10 rounded-2xl">
            <Users size="1.125rem" className="text-zinc-700 shrink-0" />
            <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhum produtor adicionado
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {produtores.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 bg-zinc-900/40 border border-white/5 rounded-2xl"
              >
                <img loading="lazy" src={p.foto} alt={p.nome} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none truncate">{p.nome}</p>
                  <p className="text-[#FFD300]/60 text-[0.5rem] font-black uppercase tracking-widest mt-0.5">
                    Produtor
                  </p>
                </div>
                <button
                  onClick={() => removeProdutor(p.id)}
                  className="text-zinc-700 active:text-red-400 transition-colors p-1.5 shrink-0"
                >
                  <X size="0.8125rem" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
