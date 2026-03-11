import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, X } from 'lucide-react';

const TAGS_POR_CATEGORIA: Record<string, { label: string; tags: { id: string; label: string }[] }> = {
  influencia: {
    label: 'Influencia',
    tags: [
      { id: 'influ_nano', label: '1k-10k' },
      { id: 'influ_micro', label: '10k-50k' },
      { id: 'influ_mid', label: '50k-200k' },
      { id: 'influ_macro', label: '200k+' },
      { id: 'engajamento_alto', label: 'Engaj. alto' },
      { id: 'engajamento_morto', label: 'Engaj. morto' },
    ],
  },
  perfil: {
    label: 'Perfil',
    tags: [
      { id: 'modelo', label: 'Modelo' },
      { id: 'atriz', label: 'Atriz' },
      { id: 'dj', label: 'DJ' },
      { id: 'chef', label: 'Chef' },
      { id: 'moda', label: 'Moda' },
      { id: 'fitness', label: 'Fitness' },
      { id: 'midiatica', label: 'Midiática' },
      { id: 'celebridade_local', label: 'Celeb. local' },
      { id: 'celebridade_nacional', label: 'Celeb. nacional' },
    ],
  },
  rede: {
    label: 'Rede',
    tags: [
      { id: 'indicada_black', label: 'Ind. Black' },
      { id: 'indicada_creator', label: 'Ind. Creator' },
      { id: 'indicada_presenca', label: 'Ind. Presença' },
      { id: 'indicada_convidado', label: 'Ind. Convidado' },
      { id: 'organica', label: 'Orgânica' },
      { id: 'rede_forte', label: 'Rede forte' },
    ],
  },
  comportamento: {
    label: 'Comportamento',
    tags: [
      { id: 'posta_bem', label: 'Posta bem' },
      { id: 'nao_posta', label: 'Não posta' },
      { id: 'cumpre_obrigacao', label: 'Cumpre obrig.' },
      { id: 'deveu_post', label: 'Deveu post' },
      { id: 'frequente', label: 'Frequente' },
      { id: 'sumiu', label: 'Sumiu' },
    ],
  },
  risco: {
    label: 'Risco',
    tags: [
      { id: 'risco_comportamento', label: 'Risco comport.' },
      { id: 'risco_imagem', label: 'Risco imagem' },
      { id: 'observacao', label: 'Observação' },
    ],
  },
  fit: {
    label: 'Fit',
    tags: [
      { id: 'fit_alto', label: 'Fit alto' },
      { id: 'fit_medio', label: 'Fit médio' },
      { id: 'sem_fit', label: 'Sem fit' },
    ],
  },
};

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export const TagsPredefinidas: React.FC<Props> = ({ selected, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter(t => t !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="px-1 space-y-1">
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-zinc-500 text-[0.5625rem] font-bold uppercase tracking-wider"
      >
        <Tag size="0.5625rem" /> Tags internas
        {expanded ? <ChevronUp size="0.5625rem" /> : <ChevronDown size="0.5625rem" />}
        {selected.length > 0 && (
          <span className="ml-1 bg-[#FFD300] text-black px-1.5 rounded-full text-[0.4375rem]">{selected.length}</span>
        )}
      </button>

      {/* Tags selecionadas — sempre visíveis */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(tagId => {
            const allTags = Object.values(TAGS_POR_CATEGORIA).flatMap(c => c.tags);
            const def = allTags.find(t => t.id === tagId);
            return (
              <button
                key={tagId}
                onClick={() => toggle(tagId)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.5625rem] font-bold bg-[#FFD300]/15 border border-[#FFD300]/30 text-[#FFD300] active:scale-90 transition-all"
              >
                {def?.label ?? tagId} <X size="0.5rem" />
              </button>
            );
          })}
        </div>
      )}

      {/* Painel expandido com categorias */}
      {expanded && (
        <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-2 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {Object.entries(TAGS_POR_CATEGORIA).map(([catId, cat]) => (
            <div key={catId}>
              <p className="text-zinc-500 text-[0.5rem] font-black uppercase tracking-widest mb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-1">
                {cat.tags.map(tag => {
                  const isSelected = selected.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggle(tag.id)}
                      className={`px-2 py-0.5 rounded-full text-[0.5625rem] font-bold border transition-all active:scale-90 ${
                        isSelected
                          ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                          : 'bg-zinc-800/60 border-white/5 text-zinc-400'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
