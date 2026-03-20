import React from 'react';

interface SectionFilterChipsProps {
  chips: string[];
  selected: string;
  onSelect: (chip: string) => void;
  /** Segundo nível de chips (cascata) */
  chips2?: string[];
  selected2?: string;
  onSelect2?: (chip: string) => void;
}

const ChipRow: React.FC<{ chips: string[]; selected: string; onSelect: (c: string) => void }> = ({
  chips,
  selected,
  onSelect,
}) => (
  <div className="overflow-x-auto no-scrollbar px-5 pb-2">
    <div className="flex gap-2 w-max">
      {chips.map(chip => {
        const isActive = chip === selected;
        return (
          <button
            key={chip}
            onClick={() => onSelect(chip)}
            className={`shrink-0 px-3 py-1.5 rounded-xl border text-[0.5625rem] font-bold uppercase tracking-wider active:scale-95 transition-all ${
              isActive
                ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                : 'bg-zinc-900/50 border-white/5 text-zinc-400'
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  </div>
);

export const SectionFilterChips: React.FC<SectionFilterChipsProps> = React.memo(
  ({ chips, selected, onSelect, chips2, selected2, onSelect2 }) => {
    const show1 = chips.length > 1;
    const show2 = chips2 && chips2.length > 1 && selected2 != null && onSelect2;

    if (!show1 && !show2) return null;

    return (
      <>
        {show1 && <ChipRow chips={chips} selected={selected} onSelect={onSelect} />}
        {show2 && <ChipRow chips={chips2} selected={selected2} onSelect={onSelect2} />}
      </>
    );
  },
);

SectionFilterChips.displayName = 'SectionFilterChips';
