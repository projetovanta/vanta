import React, { useState, useEffect } from 'react';
import {
  Zap,
  Music,
  Utensils,
  Mic2,
  Lock,
  Globe,
  Check,
  Heart,
  Star,
  Flame,
  Camera,
  Coffee,
  Gamepad2,
  Palette,
  Dumbbell,
  Plane,
  BookOpen,
  Loader2,
  Wine,
  Beer,
  Martini,
  PartyPopper,
  Theater,
  Clapperboard,
  Film,
  Headphones,
  Guitar,
  Drum,
  Piano,
  Radio,
  Tv,
  Monitor,
  Bike,
  Car,
  Ship,
  Mountain,
  TreePine,
  Waves,
  Sun,
  Moon,
  Shirt,
  Gem,
  Crown,
  Trophy,
  Medal,
  Target,
  Swords,
  Baby,
  Dog,
  Cat,
  Leaf,
  Flower2,
  Apple,
  Pizza,
  IceCream2,
  Umbrella,
  Tent,
  Rocket,
  Wand2,
  Brush,
  Scissors,
  Wrench,
  Sparkles,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

const ICONE_MAP: Record<string, LucideIcon> = {
  Zap,
  Music,
  Utensils,
  Mic2,
  Lock,
  Globe,
  Heart,
  Star,
  Flame,
  Camera,
  Coffee,
  Gamepad2,
  Palette,
  Dumbbell,
  Plane,
  BookOpen,
  Wine,
  Beer,
  Martini,
  PartyPopper,
  Theater,
  Clapperboard,
  Film,
  Headphones,
  Guitar,
  Drum,
  Piano,
  Radio,
  Tv,
  Monitor,
  Bike,
  Car,
  Ship,
  Mountain,
  TreePine,
  Waves,
  Sun,
  Moon,
  Shirt,
  Gem,
  Crown,
  Trophy,
  Medal,
  Target,
  Swords,
  Baby,
  Dog,
  Cat,
  Leaf,
  Flower2,
  Apple,
  Pizza,
  IceCream2,
  Umbrella,
  Tent,
  Rocket,
  Wand2,
  Brush,
  Scissors,
  Wrench,
  Sparkles,
};

interface InteresseDB {
  id: string;
  label: string;
  icone: string;
  ativo: boolean;
  ordem: number;
}

interface CategoriaDB {
  id: string;
  label: string;
  ativo: boolean;
  ordem: number;
}

interface Section {
  key: string;
  title: string;
  emoji: string;
  color: string;
  items: { label: string; icone?: string }[];
}

export const InterestSelector: React.FC<{ selected: string[]; onToggle: (id: string) => void }> = ({
  selected,
  onToggle,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      supabase.from('formatos').select('id,label,ativo,ordem').eq('ativo', true).order('ordem', { ascending: true }),
      supabase.from('estilos').select('id,label,ativo,ordem').eq('ativo', true).order('ordem', { ascending: true }),
      supabase
        .from('experiencias')
        .select('id,label,ativo,ordem')
        .eq('ativo', true)
        .order('ordem', { ascending: true }),
      supabase.from('interesses').select('*').eq('ativo', true).order('ordem', { ascending: true }),
    ])
      .then(([f, e, x, i]) => {
        const result: Section[] = [];
        const formatos = (f.data ?? []) as CategoriaDB[];
        const estilos = (e.data ?? []) as CategoriaDB[];
        const experiencias = (x.data ?? []) as CategoriaDB[];
        const interesses = (i.data ?? []) as InteresseDB[];

        if (formatos.length > 0) {
          result.push({
            key: 'formatos',
            title: 'Formatos',
            emoji: '🧱',
            color: '#FFD300',
            items: formatos.map(it => ({ label: it.label })),
          });
        }
        if (estilos.length > 0) {
          result.push({
            key: 'estilos',
            title: 'Estilos',
            emoji: '🎵',
            color: '#a78bfa',
            items: estilos.map(it => ({ label: it.label })),
          });
        }
        if (experiencias.length > 0) {
          result.push({
            key: 'experiencias',
            title: 'Experiências',
            emoji: '✨',
            color: '#10b981',
            items: experiencias.map(it => ({ label: it.label })),
          });
        }
        if (interesses.length > 0) {
          result.push({
            key: 'interesses',
            title: 'Outros',
            emoji: '⚡',
            color: '#f59e0b',
            items: interesses.map(it => ({ label: it.label, icone: it.icone })),
          });
        }

        setSections(result);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="text-zinc-700 animate-spin" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center py-6">
        Nenhum interesse disponível
      </p>
    );
  }

  const toggleSection = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-2">
      {sections.map(section => {
        const isOpen = !!expanded[section.key];
        const selectedCount = section.items.filter(it => selected.includes(it.label)).length;
        return (
          <div key={section.key} className="border border-white/5 rounded-xl overflow-hidden bg-zinc-900/30">
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5 transition-colors"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                <span>{section.emoji}</span>
                <span>{section.title}</span>
                {selectedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#FFD300]/15 text-[#FFD300] text-[8px] font-black rounded-md">
                    {selectedCount}
                  </span>
                )}
              </p>
              <ChevronDown
                size={14}
                className={`text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {section.items.map(item => {
                  const isSelected = selected.includes(item.label);
                  const Icon = item.icone ? (ICONE_MAP[item.icone] ?? Zap) : null;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onToggle(item.label)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-[#FFD300] bg-[#FFD300]/10 text-white'
                          : 'border-white/5 bg-zinc-900/50 text-zinc-500'
                      }`}
                    >
                      {Icon && <Icon size={12} className={isSelected ? 'text-[#FFD300]' : 'text-zinc-600'} />}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-zinc-500'}`}
                      >
                        {item.label}
                      </span>
                      {isSelected && <Check size={10} className="text-[#FFD300]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
