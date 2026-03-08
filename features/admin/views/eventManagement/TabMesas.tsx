import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2, Loader2, X } from 'lucide-react';
import { Mesa } from '../../../../types';
import { mesasService } from '../../services/mesasService';

const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const STATUS_LABEL: Record<Mesa['status'], { label: string; cor: string }> = {
  DISPONIVEL: { label: 'Disponível', cor: 'text-emerald-400' },
  RESERVADA: { label: 'Reservada', cor: 'text-amber-400' },
  OCUPADA: { label: 'Ocupada', cor: 'text-red-400' },
};

interface Props {
  eventoId: string;
  mesasAtivo: boolean;
  plantaMesas?: string;
  onToggle: (ativo: boolean) => void;
}

export const TabMesas: React.FC<Props> = ({ eventoId, mesasAtivo, plantaMesas, onToggle }) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [planta, setPlanta] = useState(plantaMesas ?? '');
  const [uploading, setUploading] = useState(false);
  const [editMesa, setEditMesa] = useState<Mesa | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Form de edição
  const [formLabel, setFormLabel] = useState('');
  const [formCap, setFormCap] = useState('4');
  const [formValor, setFormValor] = useState('0');

  useEffect(() => {
    mesasService.getMesas(eventoId).then(m => {
      setMesas(m);
      setLoading(false);
    });
  }, [eventoId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await mesasService.uploadPlanta(eventoId, file);
    if (url) setPlanta(url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const label = `Mesa ${mesas.length + 1}`;
    const nova = await mesasService.addMesa(eventoId, { label, x, y, capacidade: 4, valor: 0 });
    if (nova) {
      setMesas(prev => [...prev, nova]);
      setEditMesa(nova);
      setFormLabel(nova.label);
      setFormCap('4');
      setFormValor('0');
    }
  };

  const handleSaveEdit = async () => {
    if (!editMesa) return;
    const fields = {
      label: formLabel.trim() || editMesa.label,
      capacidade: parseInt(formCap) || 4,
      valor: parseFloat(formValor) || 0,
    };
    await mesasService.updateMesa(editMesa.id, fields);
    setMesas(prev => prev.map(m => (m.id === editMesa.id ? { ...m, ...fields } : m)));
    setEditMesa(null);
  };

  const handleRemove = async (id: string) => {
    await mesasService.removeMesa(id);
    setMesas(prev => prev.filter(m => m.id !== id));
    if (editMesa?.id === id) setEditMesa(null);
  };

  const handleLiberar = async (id: string) => {
    await mesasService.liberarMesa(id);
    setMesas(prev =>
      prev.map(m => (m.id === id ? { ...m, status: 'DISPONIVEL' as const, reservadoPor: undefined } : m)),
    );
  };

  const inputCls =
    'w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700';

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
        <div>
          <p className="text-white font-bold text-sm">Mesas / Camarotes</p>
          <p className="text-zinc-400 text-[9px]">Habilitar seleção de mesa neste evento</p>
        </div>
        <button
          onClick={() => {
            onToggle(!mesasAtivo);
            mesasService.toggleMesasAtivo(eventoId, !mesasAtivo);
          }}
          className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5 ${mesasAtivo ? 'bg-[#FFD300]' : 'bg-zinc-700'}`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${mesasAtivo ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {mesasAtivo && (
        <>
          {/* Upload de planta */}
          <div className="space-y-2">
            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">Planta do Local</p>
            {planta ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/5">
                <img
                  loading="lazy"
                  src={planta}
                  alt="Planta"
                  className="w-full aspect-[16/9] object-contain bg-zinc-900"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 active:scale-90 transition-all"
                >
                  <Upload size={14} className="text-zinc-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-[16/9] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 active:border-[#FFD300]/30 transition-all"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-zinc-400" />
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Upload da planta</span>
                  </>
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          {/* Editor de pins */}
          {planta && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">Posicionar Mesas</p>
                <p className="text-[8px] text-zinc-700">Clique na imagem para adicionar</p>
              </div>
              <div
                ref={imgRef}
                className="relative rounded-2xl overflow-hidden border border-white/5 cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  src={planta}
                  alt="Planta"
                  className="w-full aspect-[16/9] object-contain bg-zinc-900 pointer-events-none"
                />
                {mesas.map(m => {
                  const isEdit = editMesa?.id === m.id;
                  const cor = m.status === 'DISPONIVEL' ? '#FFD300' : m.status === 'RESERVADA' ? '#f59e0b' : '#ef4444';
                  return (
                    <button
                      key={m.id}
                      onClick={e => {
                        e.stopPropagation();
                        setEditMesa(m);
                        setFormLabel(m.label);
                        setFormCap(String(m.capacidade));
                        setFormValor(String(m.valor));
                      }}
                      className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-black transition-all ${
                        isEdit ? 'scale-125 z-10' : 'active:scale-110'
                      }`}
                      style={{
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        backgroundColor: cor + '30',
                        borderColor: cor,
                        color: cor,
                      }}
                    >
                      {mesas.indexOf(m) + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal de edição inline */}
          {editMesa && (
            <div className="bg-zinc-900/60 border border-[#FFD300]/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[#FFD300] font-bold text-sm">Editar Mesa</p>
                <button onClick={() => setEditMesa(null)} className="text-zinc-400 active:text-zinc-400">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  placeholder="Nome (ex: Mesa VIP 1)"
                  className={inputCls}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Capacidade</label>
                    <input
                      value={formCap}
                      onChange={e => setFormCap(e.target.value)}
                      type="number"
                      min="1"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Valor (R$)</label>
                    <input
                      value={formValor}
                      onChange={e => setFormValor(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-[#FFD300] text-black font-bold text-[9px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => handleRemove(editMesa.id)}
                  className="py-3 px-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[9px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Lista de mesas */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-zinc-400 animate-spin" />
            </div>
          ) : mesas.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-1">
                Mesas ({mesas.length})
              </p>
              {mesas.map((m, i) => {
                const st = STATUS_LABEL[m.status];
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FFD300]/10 border border-[#FFD300]/20 flex items-center justify-center text-[#FFD300] text-[9px] font-black shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{m.label}</p>
                      <p className="text-zinc-400 text-[9px]">
                        {m.capacidade} pessoas · {fmtBrl(m.valor)}
                      </p>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-wider ${st.cor}`}>{st.label}</span>
                    {m.status === 'RESERVADA' && (
                      <button
                        onClick={() => handleLiberar(m.id)}
                        className="text-[8px] text-amber-400 font-bold uppercase active:opacity-60"
                      >
                        Liberar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : planta ? (
            <div className="text-center py-6">
              <Plus size={20} className="text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-400 text-[10px]">Clique na planta para adicionar mesas</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
