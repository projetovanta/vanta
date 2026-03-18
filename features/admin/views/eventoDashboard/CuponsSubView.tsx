import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, ToggleLeft, ToggleRight, Trash2, Loader2, Tag, Link2, Check } from 'lucide-react';
import type { Cupom } from '../../../../types';
import { cuponsService } from '../../services/cuponsService';
import { VantaDatePicker } from '../../../../components/VantaDatePicker';

export const CuponsSubView: React.FC<{
  eventoId: string;
  currentUserId: string;
  onBack: () => void;
}> = ({ eventoId, currentUserId, onBack }) => {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState<'PERCENTUAL' | 'FIXO'>('PERCENTUAL');
  const [valor, setValor] = useState('');
  const [limiteUsos, setLimiteUsos] = useState('');
  const [validoAte, setValidoAte] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadCupons = async () => {
    setLoading(true);
    const data = await cuponsService.getCupons(eventoId);
    setCupons(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadCupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  const handleCriar = async () => {
    if (!codigo.trim() || !valor.trim()) return;
    setSaving(true);
    await cuponsService.criarCupom({
      codigo: codigo.trim().toUpperCase(),
      tipo,
      valor: Number(valor),
      limiteUsos: limiteUsos ? Number(limiteUsos) : undefined,
      eventoId,
      validoAte: validoAte || undefined,
      ativo: true,
      criadoPor: currentUserId,
    });
    setSaving(false);
    setShowForm(false);
    setCodigo('');
    setValor('');
    setLimiteUsos('');
    setValidoAte('');
    void loadCupons();
  };

  const handleToggle = async (c: Cupom) => {
    await cuponsService.toggleCupom(c.id, !c.ativo);
    void loadCupons();
  };

  const handleRemover = async (c: Cupom) => {
    await cuponsService.removeCupom(c.id);
    void loadCupons();
  };

  const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const copyLink = (c: Cupom) => {
    const url = `${window.location.origin}/evento/${eventoId}?cupom=${encodeURIComponent(c.codigo)}`;
    navigator.clipboard.writeText(url);
    setCopied(c.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size="1rem" className="text-zinc-400" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            <Plus size="0.75rem" /> Novo Cupom
          </button>
        </div>
        <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1">Gestão</p>
        <h1 className="font-serif text-xl text-white">Cupons</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : cupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag size="1.5rem" className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-400 text-xs">Nenhum cupom criado</p>
          </div>
        ) : (
          cupons.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition-all ${c.ativo ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-900/20 border-white/3 opacity-50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-bold tracking-wider">{c.codigo}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(c)}
                    className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity"
                    title="Copiar link com cupom"
                  >
                    {copied === c.id ? (
                      <Check size="0.8125rem" className="text-emerald-400" />
                    ) : (
                      <Link2 size="0.8125rem" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggle(c)}
                    className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity"
                  >
                    {c.ativo ? (
                      <ToggleRight size="1.125rem" className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size="1.125rem" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemover(c)}
                    className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity"
                  >
                    <Trash2 size="0.8125rem" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[0.5625rem] text-zinc-400 font-bold uppercase tracking-widest">
                <span className="text-[#FFD300]">{c.tipo === 'PERCENTUAL' ? `${c.valor}%` : fmtBrl(c.valor)}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>
                  {c.usos}
                  {c.limiteUsos ? `/${c.limiteUsos}` : ''} usos
                </span>
                {c.validoAte && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>Até {new Date(c.validoAte).toLocaleDateString('pt-BR')}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full bg-[#111] border-t border-white/10 rounded-t-3xl p-6 space-y-4"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-base">Novo Cupom</p>
              <button
                onClick={() => setShowForm(false)}
                className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70 transition-opacity -mr-2"
              >
                <X size="0.875rem" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Código (ex: VANTA10)"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700 uppercase tracking-wider"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTipo('PERCENTUAL')}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${tipo === 'PERCENTUAL' ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]' : 'bg-zinc-900/40 border-white/5 text-zinc-400'}`}
              >
                Percentual (%)
              </button>
              <button
                onClick={() => setTipo('FIXO')}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${tipo === 'FIXO' ? 'bg-[#FFD300]/10 border-[#FFD300]/30 text-[#FFD300]' : 'bg-zinc-900/40 border-white/5 text-zinc-400'}`}
              >
                Fixo (R$)
              </button>
            </div>
            <input
              type="number"
              placeholder={tipo === 'PERCENTUAL' ? 'Desconto (ex: 10)' : 'Valor (ex: 25.00)'}
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Limite de usos"
                value={limiteUsos}
                onChange={e => setLimiteUsos(e.target.value)}
                className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700"
              />
              <VantaDatePicker
                placeholder="Validade"
                value={validoAte}
                onChange={setValidoAte}
                className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30"
              />
            </div>
            <button
              onClick={handleCriar}
              disabled={saving || !codigo.trim() || !valor.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-[0.625rem] uppercase tracking-[0.2em] text-white active:scale-95 transition-all disabled:opacity-30"
            >
              {saving ? 'Criando...' : 'Criar Cupom'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
