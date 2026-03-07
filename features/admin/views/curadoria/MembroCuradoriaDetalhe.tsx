import React, { useState, useEffect } from 'react';
import { ArrowLeft, ScanFace, UserCheck, Loader2, Tag, X, Plus } from 'lucide-react';
import { Membro } from '../../../../types';
import { supabase } from '../../../../services/supabaseClient';
import { formatFollowers, formatDate } from './types';

export const MembroCuradoriaDetalhe: React.FC<{
  membro: Membro;
  onClose: () => void;
  onConcluir: (selectedTags: string[]) => Promise<void>;
}> = ({ membro, onClose, onConcluir }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [concluding, setConcluding] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  useEffect(() => {
    const path = `${membro.id}/biometria.jpg`;
    const { data } = supabase.storage.from('selfies').getPublicUrl(path);
    if (data?.publicUrl) {
      setSelfieUrl(data.publicUrl);
    } else if (membro.biometriaFoto) {
      setSelfieUrl(membro.biometriaFoto);
    }
  }, [membro.id, membro.biometriaFoto]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleConcluir = async () => {
    setConcluding(true);
    await onConcluir(selectedTags);
  };

  const cidade =
    membro.cidade && membro.estado ? `${membro.cidade}, ${membro.estado}` : membro.cidade || membro.estado || '—';

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={18} className="text-zinc-400" />
          </button>
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Curadoria · Novo Membro</p>
        </div>
      </div>

      {/* Selfie biométrica */}
      <div className="relative w-full shrink-0 aspect-[3/4] max-h-[45vh] overflow-hidden bg-zinc-900">
        {selfieUrl ? (
          <img loading="lazy" src={selfieUrl} alt={membro.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ScanFace size={36} className="text-zinc-700" />
            <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">Carregando selfie…</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
          <ScanFace size={10} className="text-[#FFD300]" />
          <span className="text-[#FFD300] text-[8px] font-black uppercase tracking-widest">Selfie · Privada</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A]" />
        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-white font-bold text-xl leading-tight truncate">{membro.nome}</p>
          <p className="text-zinc-400 text-[11px] mt-0.5 truncate">{membro.email}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        {/* Grid de dados */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Gênero</p>
            <p className="text-white text-sm font-bold">{membro.genero === 'MASCULINO' ? 'Masculino' : 'Feminino'}</p>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Cidade / Estado</p>
            <p className="text-white text-sm font-bold truncate">{cidade}</p>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Instagram</p>
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {membro.instagram ? `@${membro.instagram.replace(/^@/, '')}` : '—'}
              </p>
              {membro.seguidoresInstagram != null && (
                <span className="shrink-0 text-[9px] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-1.5 py-0.5 rounded-full">
                  {formatFollowers(membro.seguidoresInstagram)}
                </span>
              )}
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Cadastro</p>
            <p className="text-white text-sm font-bold truncate">{formatDate(membro.cadastradoEm)}</p>
          </div>
        </div>

        {/* Classificação — Tags livres */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={12} className="text-[#FFD300] shrink-0" />
            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Classificar Membro</p>
            {selectedTags.length > 0 && (
              <span className="ml-auto text-[8px] font-black text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-2 py-0.5 rounded-full">
                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tags selecionadas */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wide text-[#FFD300] bg-[#FFD300]/10 border border-[#FFD300]/20 px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="active:scale-90 transition-all">
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input de tag */}
          <div className="flex items-center gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma tag e Enter..."
              className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="w-10 h-10 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-40 shrink-0"
            >
              <Plus size={14} className="text-[#FFD300]" />
            </button>
          </div>
        </div>
      </div>

      {/* Botão Concluir */}
      <div className="shrink-0 px-5 pt-3 border-t border-white/5 pb-[env(safe-area-inset-bottom,2rem)]">
        <button
          onClick={() => void handleConcluir()}
          disabled={concluding || selectedTags.length === 0}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {concluding ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Classificando...
            </>
          ) : (
            <>
              <UserCheck size={16} /> Concluir Curadoria
            </>
          )}
        </button>
        {selectedTags.length === 0 && (
          <p className="text-zinc-700 text-[9px] text-center mt-2 italic">Adicione ao menos uma tag para concluir</p>
        )}
      </div>
    </div>
  );
};
