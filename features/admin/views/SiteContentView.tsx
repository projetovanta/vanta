/**
 * SiteContentView — CMS de textos. Master edita qualquer texto do app.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { siteContentService, type SiteContentItem } from '../services/siteContentService';

export const SiteContentView: React.FC<{
  onBack: () => void;
  currentUserId: string;
}> = ({ onBack, currentUserId }) => {
  const { toasts, dismiss, toast } = useToast();
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('');

  // Novo item
  const [showNew, setShowNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCat, setNewCat] = useState('geral');

  useEffect(() => {
    let cancelled = false;
    siteContentService.getAll().then(data => {
      if (cancelled) return;
      setItems(data);
      const vals: Record<string, string> = {};
      data.forEach(i => {
        vals[i.key] = i.value;
      });
      setValues(vals);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const categorias = useMemo(() => [...new Set(items.map(i => i.categoria ?? 'geral'))].sort(), [items]);

  const filtrados = useMemo(() => {
    let list = items;
    if (catFiltro) list = list.filter(i => i.categoria === catFiltro);
    if (busca)
      list = list.filter(
        i =>
          (i.label ?? i.key).toLowerCase().includes(busca.toLowerCase()) ||
          i.value.toLowerCase().includes(busca.toLowerCase()),
      );
    return list;
  }, [items, catFiltro, busca]);

  const hasChanges = items.some(i => values[i.key] !== i.value);

  const handleSave = async () => {
    setSaving(true);
    let ok = true;
    for (const item of items) {
      if (values[item.key] !== item.value) {
        const success = await siteContentService.update(item.key, values[item.key], currentUserId);
        if (!success) ok = false;
      }
    }
    if (ok) {
      toast('sucesso', 'Textos salvos');
      siteContentService.invalidateCache();
      const data = await siteContentService.getAll();
      setItems(data);
    } else {
      toast('erro', 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const ok = await siteContentService.create(newKey.trim(), newValue, newLabel || newKey, newCat, currentUserId);
    if (ok) {
      toast('sucesso', 'Texto criado');
      setShowNew(false);
      setNewKey('');
      setNewValue('');
      setNewLabel('');
      setNewCat('geral');
      siteContentService.invalidateCache();
      const data = await siteContentService.getAll();
      setItems(data);
      const vals: Record<string, string> = {};
      data.forEach(i => {
        vals[i.key] = i.value;
      });
      setValues(vals);
    } else {
      toast('erro', 'Erro ao criar texto');
    }
  };

  const handleDelete = async (key: string) => {
    const ok = await siteContentService.remove(key);
    if (ok) {
      toast('sucesso', 'Texto removido');
      siteContentService.invalidateCache();
      const data = await siteContentService.getAll();
      setItems(data);
      const vals: Record<string, string> = {};
      data.forEach(i => {
        vals[i.key] = i.value;
      });
      setValues(vals);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Textos do App"
        kicker="CMS de conteúdo"
        onBack={onBack}
        actions={[
          { icon: Plus, label: 'Novo', onClick: () => setShowNew(true) },
          {
            icon: saving ? Loader2 : Save,
            label: saving ? 'Salvando...' : 'Salvar',
            onClick: handleSave,
            disabled: saving || !hasChanges,
            color: hasChanges ? '#FFD300' : undefined,
          },
        ]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 max-w-3xl mx-auto w-full">
        {/* Busca + filtro */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size="0.75rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Buscar texto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-zinc-800/60 border border-white/5 rounded-xl pl-8 pr-3 py-2.5 text-white text-xs"
            />
          </div>
          <select
            value={catFiltro}
            onChange={e => setCatFiltro(e.target.value)}
            className="bg-zinc-800 border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs"
          >
            <option value="">Todas</option>
            {categorias.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : (
          filtrados.map(item => (
            <div key={item.key} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">{item.label || item.key}</p>
                  <p className="text-zinc-600 text-[0.5rem] font-mono">{item.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-700 text-[0.5rem] uppercase">{item.categoria}</span>
                  <button
                    onClick={() => handleDelete(item.key)}
                    className="text-zinc-700 active:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size="0.625rem" />
                  </button>
                </div>
              </div>
              <textarea
                value={values[item.key] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [item.key]: e.target.value }))}
                rows={2}
                className="w-full bg-zinc-800/60 border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs resize-none"
              />
            </div>
          ))
        )}
      </div>

      {/* Modal novo texto */}
      {showNew && (
        <div
          className="absolute inset-0 z-50 bg-black/85 flex items-end justify-center"
          onClick={() => setShowNew(false)}
        >
          <div className="w-full max-w-md bg-zinc-900 rounded-t-3xl p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <p className="text-white font-bold text-sm text-center">Novo Texto</p>
            <input
              placeholder="Chave (ex: home_titulo)"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
            />
            <input
              placeholder="Nome (ex: Título da Home)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
            />
            <input
              placeholder="Categoria (ex: home)"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs"
            />
            <textarea
              placeholder="Conteúdo"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newKey.trim() || !newValue.trim()}
                className="flex-1 py-3 bg-[#FFD300] text-black rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
