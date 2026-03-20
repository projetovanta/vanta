/**
 * CategoriasAdminView — Configurações da Plataforma (masteradm).
 * Página única com 4 seções colapsáveis + etiquetas de onde cada config é usada.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Check, X, Loader2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { TYPOGRAPHY } from '../../../constants';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { supabase } from '../../../services/supabaseClient';
import { useToast, ToastContainer } from '../../../components/Toast';

interface Item {
  id: string;
  label: string;
  ativo: boolean;
  ordem: number;
}

type SectionKey = 'formatos' | 'estilos' | 'experiencias' | 'interesses';

interface SectionConfig {
  key: SectionKey;
  table: string;
  emoji: string;
  title: string;
  singular: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  tags: { label: string; color: string }[];
  placeholder: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'formatos',
    table: 'formatos',
    emoji: '🧱',
    title: 'Formatos de Evento',
    singular: 'formato',
    color: 'text-[#FFD300]',
    colorBg: 'bg-[#FFD300]',
    colorBorder: 'border-[#FFD300]',
    tags: [
      { label: 'Criação de Evento', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
      { label: 'Filtros da Home', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
      { label: 'Feed', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
      { label: 'Comunidades', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    ],
    placeholder: 'Ex: Boate, Iate, Rooftop...',
  },
  {
    key: 'estilos',
    table: 'estilos',
    emoji: '🎵',
    title: 'Estilos Musicais',
    singular: 'estilo',
    color: 'text-purple-400',
    colorBg: 'bg-purple-500',
    colorBorder: 'border-purple-500',
    tags: [
      { label: 'Criação de Evento', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
      { label: 'Chips de Filtro', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
      { label: 'Badges nos Cards', color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
      { label: 'Busca', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
    ],
    placeholder: 'Ex: Techno, Funk, Sertanejo...',
  },
  {
    key: 'experiencias',
    table: 'experiencias',
    emoji: '✨',
    title: 'Experiências',
    singular: 'experiência',
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500',
    colorBorder: 'border-emerald-500',
    tags: [
      { label: 'Criação de Evento', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
      { label: 'Busca', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
    ],
    placeholder: 'Ex: Open Bar, VIP Area, Sunset...',
  },
  {
    key: 'interesses',
    table: 'interesses',
    emoji: '💡',
    title: 'Interesses do Perfil',
    singular: 'interesse',
    color: 'text-amber-400',
    colorBg: 'bg-amber-500',
    colorBorder: 'border-amber-500',
    tags: [
      { label: 'Onboarding', color: 'bg-[#FFD300]/15 text-[#FFD300] border-[#FFD300]/20' },
      { label: 'Indica pra Você', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
      { label: 'MAIS VANTA', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
    ],
    placeholder: 'Ex: Gastronomia, Esportes, Games...',
  },
];

export const CategoriasAdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<Record<SectionKey, Item[]>>({
    formatos: [],
    estilos: [],
    experiencias: [],
    interesses: [],
  });
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<Item> | null>(null);
  const [editSection, setEditSection] = useState<SectionConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    formatos: false,
    estilos: false,
    experiencias: true,
    interesses: false,
  });
  const { toasts, dismiss, toast } = useToast();

  const load = useCallback(async () => {
    const [f, e, x, o] = await Promise.all([
      supabase.from('formatos').select('*').order('ordem', { ascending: true }),
      supabase.from('estilos').select('*').order('ordem', { ascending: true }),
      supabase.from('experiencias').select('*').order('ordem', { ascending: true }),
      supabase.from('interesses').select('id,label,ativo,ordem').order('ordem', { ascending: true }),
    ]);
    setItems({
      formatos: (f.data ?? []) as Item[],
      estilos: (e.data ?? []) as Item[],
      experiencias: (x.data ?? []) as Item[],
      interesses: (o.data ?? []) as Item[],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!editItem?.label?.trim() || !editSection) return;
    setSaving(true);
    try {
      const sectionItems = items[editSection.key];
      const payload = {
        label: editItem.label.trim(),
        ativo: editItem.ativo ?? true,
        ordem: editItem.ordem ?? sectionItems.length,
      };
      if (editItem.id) {
        const { error } = await supabase
          .from(editSection.table as 'formatos')
          .update(payload)
          .eq('id', editItem.id);
        if (error) throw error;
        toast('sucesso', 'Atualizado com sucesso');
      } else {
        const { error } = await supabase.from(editSection.table as 'formatos').insert(payload);
        if (error) throw error;
        toast('sucesso', `${editSection.singular} criado`);
      }
      setEditItem(null);
      setEditSection(null);
      void load();
    } catch {
      toast('erro', 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handleDelete = async (section: SectionConfig, item: Item) => {
    try {
      const { error } = await supabase
        .from(section.table as 'formatos')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      toast('sucesso', 'Removido com sucesso');
      void load();
    } catch {
      toast('erro', 'Erro ao remover');
    }
  };

  const handleToggle = async (section: SectionConfig, item: Item) => {
    try {
      const { error } = await supabase
        .from(section.table as 'formatos')
        .update({ ativo: !item.ativo })
        .eq('id', item.id);
      if (error) throw error;
      setItems(prev => ({
        ...prev,
        [section.key]: prev[section.key].map(i => (i.id === item.id ? { ...i, ativo: !i.ativo } : i)),
      }));
      toast('sucesso', item.ativo ? 'Desativado' : 'Ativado');
    } catch {
      toast('erro', 'Erro ao alterar status');
    }
  };

  const toggleCollapse = (key: SectionKey) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRow = (section: SectionConfig, item: Item) => (
    <div
      key={item.id}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        item.ativo ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-900/20 border-white/3 opacity-50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{item.label}</p>
        <p className="text-zinc-500 text-[0.5rem] font-bold uppercase tracking-widest">
          {item.ativo ? 'Ativo' : 'Desativado'}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => handleToggle(section, item)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all active:scale-90 ${
            item.ativo
              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
              : 'bg-zinc-800 border-white/5 text-zinc-400'
          }`}
        >
          <Check size="0.625rem" />
        </button>
        <button
          onClick={() => {
            setEditSection(section);
            setEditItem(item);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 bg-zinc-800 text-zinc-400 active:scale-90 transition-all"
        >
          <Pencil size="0.625rem" />
        </button>
        <button
          onClick={() => handleDelete(section, item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-500/20 bg-red-950/30 text-red-400 active:scale-90 transition-all"
        >
          <Trash2 size="0.625rem" />
        </button>
      </div>
    </div>
  );

  const renderSection = (section: SectionConfig) => {
    const sectionItems = items[section.key];
    const activeCount = sectionItems.filter(i => i.ativo).length;
    const isCollapsed = collapsed[section.key];

    return (
      <div key={section.key} className="border border-white/5 rounded-2xl overflow-hidden">
        {/* Header da seção */}
        <button
          onClick={() => toggleCollapse(section.key)}
          className="w-full flex items-center gap-3 p-4 active:bg-white/3 transition-colors"
        >
          <span className="text-xl">{section.emoji}</span>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">{section.title}</h3>
              <span className={`text-[0.5rem] font-black uppercase tracking-widest ${section.color}`}>
                {activeCount} ativos
              </span>
              {sectionItems.length - activeCount > 0 && (
                <span className="text-[0.5rem] font-bold text-zinc-600">
                  +{sectionItems.length - activeCount} inativos
                </span>
              )}
            </div>
            {/* Etiquetas de uso */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {section.tags.map(tag => (
                <span
                  key={tag.label}
                  className={`px-2 py-0.5 rounded-md text-[0.4375rem] font-bold uppercase tracking-wider border ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={e => {
                e.stopPropagation();
                setEditSection(section);
                setEditItem({ label: '', ativo: true, ordem: sectionItems.length });
                if (isCollapsed) toggleCollapse(section.key);
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${section.colorBorder}/20 ${section.colorBg}/10 ${section.color} active:scale-90 transition-all`}
            >
              <Plus size="0.75rem" />
            </button>
            {isCollapsed ? (
              <ChevronDown size="0.875rem" className="text-zinc-500" />
            ) : (
              <ChevronUp size="0.875rem" className="text-zinc-500" />
            )}
          </div>
        </button>

        {/* Lista de itens */}
        {!isCollapsed && (
          <div className="px-4 pb-4 space-y-1.5">
            {sectionItems.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <span className="text-2xl opacity-30">{section.emoji}</span>
                <p className="text-zinc-600 text-[0.5625rem] font-bold uppercase tracking-widest">
                  Nenhum {section.singular} cadastrado
                </p>
              </div>
            ) : (
              sectionItems.map(item => renderRow(section, item))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <AdminViewHeader title="Configurações da Plataforma" kicker="Master" onBack={onBack} />

      {/* Seções */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size="1.5rem" className="text-zinc-700 animate-spin" />
          </div>
        ) : (
          SECTIONS.map(section => renderSection(section))
        )}
      </div>

      {/* Modal Criar/Editar */}
      {editItem && editSection && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setEditItem(null);
            setEditSection(null);
          }}
        >
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">
                  {editItem.id ? 'Editar' : 'Novo'} {editSection.emoji} {editSection.singular}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {editSection.tags.map(tag => (
                    <span
                      key={tag.label}
                      className={`px-1.5 py-0.5 rounded text-[0.375rem] font-bold uppercase tracking-wider border ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditItem(null);
                  setEditSection(null);
                }}
                className="p-1.5 text-zinc-400 active:text-white"
              >
                <X size="0.875rem" />
              </button>
            </div>

            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Nome</p>
              <input
                type="text"
                value={editItem.label ?? ''}
                onChange={e => setEditItem(p => ({ ...p!, label: e.target.value }))}
                placeholder={editSection.placeholder}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
                autoFocus
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!editItem.label?.trim() || saving}
              className="w-full py-4 bg-[#FFD300] text-black font-black text-[0.625rem] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30"
            >
              {saving ? <Loader2 size="0.875rem" className="animate-spin" /> : <Check size="0.875rem" />}
              {editItem.id ? 'Salvar' : `Criar ${editSection.singular}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
