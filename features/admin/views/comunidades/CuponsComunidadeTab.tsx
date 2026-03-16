/**
 * CuponsComunidadeTab — Cupons que valem pra TODOS os eventos da comunidade.
 * Reutiliza lógica do CuponsSubView mas com comunidadeId.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Loader2, Check, Link2, ToggleRight, ToggleLeft, Trash2 } from 'lucide-react';
import { cuponsService } from '../../services/cuponsService';
import type { Cupom } from '../../../../types';
import { useToast, ToastContainer } from '../../../../components/Toast';
import { VantaDatePicker } from '../../../../components/VantaDatePicker';

export const CuponsComunidadeTab: React.FC<{
  comunidadeId: string;
  currentUserId: string;
}> = ({ comunidadeId, currentUserId }) => {
  const { toasts, dismiss, toast } = useToast();
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
    const data = await cuponsService.getCuponsByComunidade(comunidadeId);
    setCupons(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadCupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadeId]);

  const handleCriar = async () => {
    if (!codigo.trim() || !valor.trim()) return;
    setSaving(true);
    try {
      await cuponsService.criarCupom({
        codigo: codigo.trim().toUpperCase(),
        tipo,
        valor: Number(valor),
        limiteUsos: limiteUsos ? Number(limiteUsos) : undefined,
        comunidadeId,
        validoAte: validoAte || undefined,
        ativo: true,
        criadoPor: currentUserId,
      });
      toast('sucesso', 'Cupom criado');
    } catch {
      toast('erro', 'Erro ao criar cupom');
    }
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
    toast('sucesso', c.ativo ? 'Cupom desativado' : 'Cupom ativado');
    void loadCupons();
  };

  const handleRemover = async (c: Cupom) => {
    await cuponsService.removeCupom(c.id);
    toast('sucesso', 'Cupom removido');
    void loadCupons();
  };

  const copyCode = (c: Cupom) => {
    navigator.clipboard.writeText(c.codigo);
    setCopied(c.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-bold">Cupons da Comunidade</p>
          <p className="text-zinc-500 text-xs">Valem pra todos os eventos desta comunidade</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-xl text-[#FFD300] text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
        >
          <Plus size="0.75rem" /> Novo Cupom
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
        </div>
      ) : cupons.length === 0 ? (
        <div className="text-center py-12">
          <Tag size="1.5rem" className="text-zinc-800 mx-auto mb-3" />
          <p className="text-zinc-400 text-xs">Nenhum cupom de comunidade criado</p>
          <p className="text-zinc-600 text-[0.5625rem] mt-1">Cupons de comunidade valem pra todos os eventos</p>
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
                  onClick={() => copyCode(c)}
                  className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70"
                >
                  {copied === c.id ? (
                    <Check size="0.8125rem" className="text-emerald-400" />
                  ) : (
                    <Link2 size="0.8125rem" />
                  )}
                </button>
                <button
                  onClick={() => handleToggle(c)}
                  className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70"
                >
                  {c.ativo ? (
                    <ToggleRight size="1.125rem" className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size="1.125rem" />
                  )}
                </button>
                <button
                  onClick={() => handleRemover(c)}
                  className="min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center text-zinc-400 active:opacity-70"
                >
                  <Trash2 size="0.8125rem" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 text-[0.5625rem]">
              <span>{c.tipo === 'PERCENTUAL' ? `${c.valor}% off` : fmtBrl(c.valor)}</span>
              {c.limiteUsos != null && (
                <span>
                  {c.usos}/{c.limiteUsos} usos
                </span>
              )}
              {c.validoAte && <span>até {new Date(c.validoAte).toLocaleDateString('pt-BR')}</span>}
            </div>
          </div>
        ))
      )}

      {/* Form novo cupom */}
      {showForm && (
        <div
          className="absolute inset-0 z-50 bg-black/85 flex items-end justify-center"
          onClick={() => setShowForm(false)}
        >
          <div className="w-full max-w-md bg-zinc-900 rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-white font-bold text-sm text-center">Novo Cupom de Comunidade</p>
            <p className="text-zinc-500 text-xs text-center">Vale pra todos os eventos desta comunidade</p>

            <input
              placeholder="Código (ex: VANTA20)"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setTipo('PERCENTUAL')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${tipo === 'PERCENTUAL' ? 'bg-[#FFD300]/20 text-[#FFD300] border border-[#FFD300]/30' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}
              >
                % Desconto
              </button>
              <button
                onClick={() => setTipo('FIXO')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${tipo === 'FIXO' ? 'bg-[#FFD300]/20 text-[#FFD300] border border-[#FFD300]/30' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}
              >
                R$ Fixo
              </button>
            </div>

            <input
              placeholder={tipo === 'PERCENTUAL' ? 'Valor (ex: 20)' : 'Valor em R$ (ex: 50)'}
              value={valor}
              onChange={e => setValor(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            />

            <input
              placeholder="Limite de usos (vazio = ilimitado)"
              value={limiteUsos}
              onChange={e => setLimiteUsos(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            />

            <VantaDatePicker label="Válido até (opcional)" value={validoAte} onChange={setValidoAte} />

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriar}
                disabled={saving || !codigo.trim() || !valor.trim()}
                className="flex-1 py-3 bg-[#FFD300] text-black rounded-xl text-xs font-bold disabled:opacity-40"
              >
                {saving ? 'Criando...' : 'Criar Cupom'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
