/**
 * CategoriasAdminView — CRUD de Formatos, Estilos e Experiências (masteradm).
 * 3 abas independentes, cada uma opera na sua tabela Supabase.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Check, X, Loader2, Pencil } from 'lucide-react';
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

type TabType = 'formatos' | 'estilos' | 'experiencias' | 'outros';

const TAB_CONFIG: Record<
  TabType,
  { table: string; emoji: string; label: string; color: string; colorBg: string; colorBorder: string }
> = {
  formatos: {
    table: 'formatos',
    emoji: '🧱',
    label: 'Formatos',
    color: 'text-[#FFD300]',
    colorBg: 'bg-[#FFD300]',
    colorBorder: 'border-[#FFD300]',
  },
  estilos: {
    table: 'estilos',
    emoji: '🎵',
    label: 'Estilos',
    color: 'text-purple-400',
    colorBg: 'bg-purple-500',
    colorBorder: 'border-purple-500',
  },
  experiencias: {
    table: 'experiencias',
    emoji: '✨',
    label: 'Experiências',
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500',
    colorBorder: 'border-emerald-500',
  },
  outros: {
    table: 'interesses',
    emoji: '⚡',
    label: 'Outros',
    color: 'text-amber-400',
    colorBg: 'bg-amber-500',
    colorBorder: 'border-amber-500',
  },
};

export const CategoriasAdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [items, setItems] = useState<Record<TabType, Item[]>>({
    formatos: [],
    estilos: [],
    experiencias: [],
    outros: [],
  });
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<Item> | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabType>('formatos');
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
      outros: (o.data ?? []) as Item[],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cfg = TAB_CONFIG[tab];
  const currentItems = items[tab];

  const handleSave = async () => {
    if (!editItem?.label?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        label: editItem.label.trim(),
        ativo: editItem.ativo ?? true,
        ordem: editItem.ordem ?? currentItems.length,
      };
      if (editItem.id) {
        const { error } = await supabase.from(cfg.table).update(payload).eq('id', editItem.id);
        if (error) throw error;
        toast('sucesso', 'Atualizado com sucesso');
      } else {
        const { error } = await supabase.from(cfg.table).insert(payload);
        if (error) throw error;
        toast('sucesso', `${cfg.label.slice(0, -1)} criado`);
      }
      setEditItem(null);
      void load();
    } catch {
      toast('erro', 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handleDelete = async (item: Item) => {
    try {
      const { error } = await supabase.from(cfg.table).delete().eq('id', item.id);
      if (error) throw error;
      toast('sucesso', 'Removido com sucesso');
      void load();
    } catch {
      toast('erro', 'Erro ao remover');
    }
  };

  const handleToggle = async (item: Item) => {
    try {
      const { error } = await supabase.from(cfg.table).update({ ativo: !item.ativo }).eq('id', item.id);
      if (error) throw error;
      setItems(prev => ({ ...prev, [tab]: prev[tab].map(i => (i.id === item.id ? { ...i, ativo: !i.ativo } : i)) }));
      toast('sucesso', item.ativo ? 'Desativado' : 'Ativado');
    } catch {
      toast('erro', 'Erro ao alterar status');
    }
  };

  const renderRow = (item: Item) => (
    <div
      key={item.id}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        item.ativo ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-900/20 border-white/3 opacity-50'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          item.ativo ? `${cfg.colorBg}/10 border ${cfg.colorBorder}/20` : 'bg-zinc-800 border border-white/5'
        }`}
      >
        <span className="text-base">{cfg.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{item.label}</p>
        <p className="text-zinc-400 text-[0.5625rem] font-black uppercase tracking-widest">
          {item.ativo ? 'Ativo' : 'Desativado'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => handleToggle(item)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all active:scale-90 ${
            item.ativo
              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
              : 'bg-zinc-800 border-white/5 text-zinc-400'
          }`}
        >
          <Check size="0.75rem" />
        </button>
        <button
          onClick={() => setEditItem(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 bg-zinc-800 text-zinc-400 active:scale-90 transition-all"
        >
          <Pencil size="0.75rem" />
        </button>
        <button
          onClick={() => handleDelete(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-500/20 bg-red-950/30 text-red-400 active:scale-90 transition-all"
        >
          <Trash2 size="0.75rem" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <AdminViewHeader
        title="Categorias"
        kicker="Master"
        onBack={onBack}
        actions={[
          {
            icon: Plus,
            label: 'Nova categoria',
            onClick: () => setEditItem({ label: '', ativo: true, ordem: currentItems.length }),
          },
        ]}
      />

      {/* Tabs — 3 abas */}
      <div className="shrink-0 px-5 pt-4 pb-2 flex flex-wrap gap-2">
        {(Object.keys(TAB_CONFIG) as TabType[]).map(t => {
          const c = TAB_CONFIG[t];
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 rounded-2xl text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                isActive
                  ? `${c.colorBg} ${c.colorBorder} ${t === 'formatos' || t === 'outros' ? 'text-black' : 'text-white'} shadow-lg`
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400'
              }`}
            >
              {c.emoji} {c.label} ({items[t].length})
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-2 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size="1.5rem" className="text-zinc-700 animate-spin" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="text-3xl">{cfg.emoji}</span>
            <p className="text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest">
              Nenhum {cfg.label.toLowerCase().slice(0, -1)} cadastrado
            </p>
          </div>
        ) : (
          currentItems.map(item => renderRow(item))
        )}
      </div>

      {/* Modal Criar/Editar */}
      {editItem && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
          onClick={() => setEditItem(null)}
        >
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
            <div className="flex items-start justify-between">
              <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">
                {editItem.id ? 'Editar' : 'Novo'} {cfg.emoji} {cfg.label.slice(0, -1)}
              </p>
              <button onClick={() => setEditItem(null)} className="p-1.5 text-zinc-400 active:text-white">
                <X size="0.875rem" />
              </button>
            </div>

            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Nome</p>
              <input
                type="text"
                value={editItem.label ?? ''}
                onChange={e => setEditItem(p => ({ ...p!, label: e.target.value }))}
                placeholder={`Ex: ${tab === 'formatos' ? 'Boate, Iate, Rooftop...' : tab === 'estilos' ? 'Techno, Funk, Sertanejo...' : tab === 'experiencias' ? 'Open Bar, VIP Area, Sunset...' : 'Gastronomia, Fitness, Games...'}`}
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
              {editItem.id ? 'Salvar' : `Criar ${cfg.label.slice(0, -1)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
