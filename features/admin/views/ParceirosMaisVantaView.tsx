/**
 * ParceirosMaisVantaView — CRUD de parceiros (venues externos) MAIS VANTA.
 * Master cadastra parceiros, define plano, associa a cidade.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Store, Plus, MapPin, Instagram, Phone, Mail, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { clubeParceirosService } from '../services/clube/clubeParceirosService';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { clubeCidadesService } from '../services/clube/clubeCidadesService';
import { useAuthStore } from '../../../stores/authStore';
import type { ParceiroMaisVanta, CidadeMaisVanta, TipoParceiro, PlanoParceiro } from '../../../types';

const TIPOS_PARCEIRO: { value: TipoParceiro; label: string }[] = [
  { value: 'RESTAURANTE', label: 'Restaurante' },
  { value: 'BAR', label: 'Bar' },
  { value: 'CLUB', label: 'Club/Balada' },
  { value: 'GYM', label: 'Academia' },
  { value: 'SALAO', label: 'Salão/Barbearia' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'LOJA', label: 'Loja' },
  { value: 'OUTRO', label: 'Outro' },
];

const PLANOS_PARCEIRO: { value: PlanoParceiro; label: string; cor: string; resgates: string }[] = [
  { value: 'STARTER', label: 'Starter', cor: '#C0C0C0', resgates: '5/mês' },
  { value: 'PRO', label: 'Pro', cor: '#FFD300', resgates: '20/mês' },
  { value: 'ELITE', label: 'Elite', cor: '#B9F2FF', resgates: 'Ilimitado' },
];

export const ParceirosMaisVantaView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { toasts, dismiss, toast } = useToast();
  const [parceiros, setParceiros] = useState<ParceiroMaisVanta[]>([]);
  const [cidades, setCidades] = useState<CidadeMaisVanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const currentUserId = useAuthStore(s => s.profile?.id ?? '');

  // Form state
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoParceiro>('RESTAURANTE');
  const [cidadeId, setCidadeId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [instagram, setInstagram] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [plano, setPlano] = useState<PlanoParceiro>('STARTER');

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([clubeParceirosService.listar(), clubeCidadesService.listarAtivas()]);
    setParceiros(p);
    setCidades(c);
    if (c.length > 0 && !cidadeId) setCidadeId(c[0].id);
    setLoading(false);
  }, [cidadeId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setNome('');
    setTipo('RESTAURANTE');
    setEndereco('');
    setInstagram('');
    setContatoNome('');
    setContatoTelefone('');
    setContatoEmail('');
    setPlano('STARTER');
    setEditId(null);
    if (cidades.length > 0) setCidadeId(cidades[0].id);
  };

  const handleSave = async () => {
    if (!nome.trim() || !cidadeId) return;
    if (editId) {
      await clubeParceirosService.atualizar(editId, {
        nome: nome.trim(),
        tipo,
        cidadeId,
        endereco: endereco.trim() || undefined,
        instagramHandle: instagram.trim() || undefined,
        contatoNome: contatoNome.trim() || undefined,
        contatoTelefone: contatoTelefone.trim() || undefined,
        contatoEmail: contatoEmail.trim() || undefined,
        plano,
      });
    } else {
      await clubeParceirosService.criar({
        nome: nome.trim(),
        tipo,
        cidadeId,
        endereco: endereco.trim() || undefined,
        instagramHandle: instagram.trim() || undefined,
        contatoNome: contatoNome.trim() || undefined,
        contatoTelefone: contatoTelefone.trim() || undefined,
        contatoEmail: contatoEmail.trim() || undefined,
        criadoPor: currentUserId,
      });
    }
    setShowForm(false);
    resetForm();
    load();
  };

  const startEdit = (p: ParceiroMaisVanta) => {
    setEditId(p.id);
    setNome(p.nome);
    setTipo(p.tipo);
    setCidadeId(p.cidadeId);
    setEndereco(p.endereco ?? '');
    setInstagram(p.instagramHandle ?? '');
    setContatoNome(p.contatoNome ?? '');
    setContatoTelefone(p.contatoTelefone ?? '');
    setContatoEmail(p.contatoEmail ?? '');
    setPlano(p.plano);
    setShowForm(true);
  };

  const toggleAtivo = async (p: ParceiroMaisVanta) => {
    await clubeParceirosService.atualizar(p.id, { ativo: !p.ativo });
    load();
  };

  const cidadeNome = (id: string) => cidades.find(c => c.id === id)?.nome ?? '—';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {onBack && <AdminViewHeader title="Parceiros" kicker="MAIS VANTA" onBack={onBack} />}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size="1.125rem" className="text-[#FFD300]" />
            <h2 className="text-white font-bold text-sm">Parceiros</h2>
            <span className="text-zinc-400 text-xs">({parceiros.length})</span>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            <Plus size="0.75rem" />
            Novo Parceiro
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-white text-xs font-bold">{editId ? 'Editar Parceiro' : 'Novo Parceiro'}</p>

            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome do parceiro"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
            />

            {/* Tipo */}
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_PARCEIRO.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTipo(t.value)}
                  className={`px-2.5 py-1 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider border transition-all ${
                    tipo === t.value
                      ? 'bg-[#FFD300] text-black border-transparent'
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Cidade */}
            <div className="flex flex-wrap gap-1.5">
              {cidades.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCidadeId(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
                    cidadeId === c.id
                      ? 'bg-[#FFD300] text-black border-transparent'
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}
                >
                  <MapPin size="0.625rem" />
                  {c.nome}
                </button>
              ))}
            </div>

            <input
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Endereço"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@instagram"
                className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
              <input
                value={contatoNome}
                onChange={e => setContatoNome(e.target.value)}
                placeholder="Nome do contato"
                className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                value={contatoTelefone}
                onChange={e => setContatoTelefone(e.target.value)}
                placeholder="Telefone"
                className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
              <input
                value={contatoEmail}
                onChange={e => setContatoEmail(e.target.value)}
                placeholder="Email"
                className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
            </div>

            {/* Plano (só no edit) */}
            {editId && (
              <div>
                <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider mb-1.5">Plano</p>
                <div className="flex gap-1.5">
                  {PLANOS_PARCEIRO.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlano(p.value)}
                      className={`flex-1 py-2 rounded-lg text-[0.625rem] font-black uppercase tracking-wider border transition-all ${
                        plano === p.value ? 'border-transparent text-black' : 'bg-zinc-800 text-zinc-400 border-white/5'
                      }`}
                      style={plano === p.value ? { backgroundColor: p.cor } : {}}
                    >
                      <span className="block">{p.label}</span>
                      <span className="block text-[0.5rem] opacity-70">{p.resgates}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                {editId ? 'Salvar' : 'Criar'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parceiros.length === 0 ? (
          <div className="text-center py-12">
            <Store size="2rem" className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs">Nenhum parceiro cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parceiros.map(p => {
              const planoInfo = PLANOS_PARCEIRO.find(pl => pl.value === p.plano);
              return (
                <div
                  key={p.id}
                  className={`bg-zinc-900/60 border rounded-xl p-3 ${
                    p.ativo ? 'border-white/5' : 'border-red-500/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                      <Store size="1.125rem" className="text-[#FFD300]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{p.nome}</p>
                      <div className="flex items-center gap-2 text-[0.625rem] text-zinc-400 mt-0.5">
                        <span>{TIPOS_PARCEIRO.find(t => t.value === p.tipo)?.label ?? p.tipo}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size="0.5625rem" />
                          {cidadeNome(p.cidadeId)}
                        </span>
                        {planoInfo && (
                          <span className="font-bold" style={{ color: planoInfo.cor }}>
                            {planoInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(p)}
                        className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all"
                      >
                        <Edit3 size="0.75rem" className="text-zinc-400" />
                      </button>
                      <button
                        onClick={() => toggleAtivo(p)}
                        className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all"
                      >
                        {p.ativo ? (
                          <ToggleRight size="0.875rem" className="text-green-400" />
                        ) : (
                          <ToggleLeft size="0.875rem" className="text-zinc-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-[0.625rem] text-zinc-400">
                    {p.instagramHandle && (
                      <span className="flex items-center gap-0.5">
                        <Instagram size="0.625rem" />
                        {p.instagramHandle}
                      </span>
                    )}
                    {p.contatoTelefone && (
                      <span className="flex items-center gap-0.5">
                        <Phone size="0.625rem" />
                        {p.contatoTelefone}
                      </span>
                    )}
                    {p.contatoEmail && (
                      <span className="flex items-center gap-0.5">
                        <Mail size="0.625rem" className="shrink-0" />
                        <span className="truncate">{p.contatoEmail}</span>
                      </span>
                    )}
                    <span className="ml-auto text-zinc-400">
                      {p.resgatesMesUsados}/{p.resgatesMesLimite === -1 ? '∞' : p.resgatesMesLimite} resgates
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
