/**
 * GestaoComprovantesView — Master aprova/rejeita comprovantes de meia-entrada.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileCheck, ChevronDown, X, Search, Eye } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { comprovanteService } from '../services/comprovanteService';
import { TIPOS_COMPROVANTE_MEIA } from '../../../types';
import type { ComprovanteMeia } from '../../../types';

interface Props {
  onBack: () => void;
  masterId: string;
}

type Tab = 'PENDENTES' | 'APROVADOS' | 'OUTROS';

interface CompWithUser extends ComprovanteMeia {
  _userName?: string;
  _userEmail?: string;
}

const VALIDADE_OPTIONS = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '1 ano' },
  { value: 24, label: '2 anos' },
  { value: 60, label: '5 anos' },
  { value: 0, label: 'Ilimitado' },
];

export const GestaoComprovantesView: React.FC<Props> = ({ onBack, masterId }) => {
  const { toasts, dismiss, toast } = useToast();
  const [tab, setTab] = useState<Tab>('PENDENTES');
  const [comprovantes, setComprovantes] = useState<CompWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Modais
  const [aprovarModal, setAprovarModal] = useState<CompWithUser | null>(null);
  const [rejeitarModal, setRejeitarModal] = useState<CompWithUser | null>(null);
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  const [validadeSelecionada, setValidadeSelecionada] = useState(6);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const all = (await comprovanteService.getTodosComprovantes()) as CompWithUser[];
    setComprovantes(all);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    fetchData().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = comprovantes.filter(c => {
    if (tab === 'PENDENTES' && c.status !== 'PENDENTE') return false;
    if (tab === 'APROVADOS' && c.status !== 'APROVADO') return false;
    if (tab === 'OUTROS' && c.status !== 'REJEITADO' && c.status !== 'VENCIDO') return false;
    if (busca) {
      const q = busca.toLowerCase();
      return (
        c._userName?.toLowerCase().includes(q) ||
        c._userEmail?.toLowerCase().includes(q) ||
        c.tipo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tipoLabel = (tipo: string) => TIPOS_COMPROVANTE_MEIA.find(t => t.id === tipo)?.label ?? tipo;

  const handleAprovar = async () => {
    if (!aprovarModal) return;
    setActionLoading(true);
    try {
      await comprovanteService.aprovarComprovante(aprovarModal.id, validadeSelecionada, masterId);
      setAprovarModal(null);
      await fetchData();
      toast('sucesso', 'Comprovante aprovado');
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      toast('erro', 'Erro ao aprovar comprovante');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeitar = async () => {
    if (!rejeitarModal || !motivoRejeicao.trim()) return;
    setActionLoading(true);
    try {
      await comprovanteService.rejeitarComprovante(rejeitarModal.id, motivoRejeicao.trim());
      setRejeitarModal(null);
      setMotivoRejeicao('');
      await fetchData();
      toast('sucesso', 'Comprovante rejeitado');
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      toast('erro', 'Erro ao rejeitar comprovante');
    } finally {
      setActionLoading(false);
    }
  };

  const [fotoModalUrls, setFotoModalUrls] = useState<{ label: string; url: string }[]>([]);
  const [fotoModalIdx, setFotoModalIdx] = useState(0);

  const handleVerFoto = async (userId: string) => {
    const urls = await comprovanteService.getFotoUrls(userId);
    if (urls.length > 0) {
      setFotoModalUrls(urls);
      setFotoModalIdx(0);
      setFotoModal(urls[0].url); // compat: abre modal
    }
  };

  const pendentesCount = comprovantes.filter(c => c.status === 'PENDENTE').length;

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
      <AdminViewHeader
        title="Comprovantes"
        subtitle={`${pendentesCount} pendente${pendentesCount !== 1 ? 's' : ''}`}
        onBack={onBack}
        badge={pendentesCount > 0 ? pendentesCount : undefined}
        badgeColor="#f59e0b"
      />
      <div className="shrink-0 px-4 pb-3 border-b border-white/5">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'PENDENTES' as Tab, label: 'Pendentes', count: pendentesCount },
            {
              id: 'APROVADOS' as Tab,
              label: 'Aprovados',
              count: comprovantes.filter(c => c.status === 'APROVADO').length,
            },
            {
              id: 'OUTROS' as Tab,
              label: 'Rejeitados/Vencidos',
              count: comprovantes.filter(c => c.status === 'REJEITADO' || c.status === 'VENCIDO').length,
            },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.625rem] font-bold uppercase tracking-wider transition-all ${
                tab === t.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {t.label} {t.count > 0 && <span className="ml-1 text-[0.5625rem] opacity-60">({t.count})</span>}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative mt-2">
          <Search size="0.875rem" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, email ou tipo..."
            className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck size="2rem" className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs">
              Nenhum comprovante {tab === 'PENDENTES' ? 'pendente' : tab === 'APROVADOS' ? 'aprovado' : ''}
            </p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 text-sm font-bold">
                  {(c._userName ?? '?')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{c._userName ?? 'Usuário'}</p>
                  <p className="text-[0.625rem] text-zinc-400 truncate">{c._userEmail ?? ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[0.5625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                      {tipoLabel(c.tipo)}
                    </span>
                    {c.status === 'APROVADO' && c.validadeAte && (
                      <span className="text-[0.5625rem] text-zinc-400">
                        até {new Date(c.validadeAte).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {c.status === 'REJEITADO' && c.motivoRejeicao && (
                      <span className="text-[0.5625rem] text-red-400 truncate">{c.motivoRejeicao}</span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleVerFoto(c.userId)}
                    className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    title="Ver documento"
                  >
                    <Eye size="0.875rem" className="text-zinc-400" />
                  </button>
                  {c.status === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => {
                          setAprovarModal(c);
                          setValidadeSelecionada(
                            TIPOS_COMPROVANTE_MEIA.find(t => t.id === c.tipo)?.validadePadrao ?? 6,
                          );
                        }}
                        className="p-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        title="Aprovar"
                      >
                        <CheckCircle size="0.875rem" className="text-emerald-400" />
                      </button>
                      <button
                        onClick={() => setRejeitarModal(c)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Rejeitar"
                      >
                        <XCircle size="0.875rem" className="text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Aprovar */}
      {aprovarModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            role="presentation"
            onClick={() => setAprovarModal(null)}
          />
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Aprovar Comprovante</h3>
              <button onClick={() => setAprovarModal(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size="1rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">{aprovarModal._userName}</p>
                <p className="text-[0.625rem] text-zinc-400">{tipoLabel(aprovarModal.tipo)}</p>
              </div>
              <div>
                <label className="text-[0.625rem] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Validade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VALIDADE_OPTIONS.map(v => (
                    <button
                      key={v.value}
                      onClick={() => setValidadeSelecionada(v.value)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        validadeSelecionada === v.value
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAprovar}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 text-white transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {actionLoading ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejeitar */}
      {rejeitarModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            role="presentation"
            onClick={() => setRejeitarModal(null)}
          />
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Rejeitar Comprovante</h3>
              <button
                onClick={() => {
                  setRejeitarModal(null);
                  setMotivoRejeicao('');
                }}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size="1rem" className="text-zinc-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">{rejeitarModal._userName}</p>
                <p className="text-[0.625rem] text-zinc-400">{tipoLabel(rejeitarModal.tipo)}</p>
              </div>
              <div>
                <label className="text-[0.625rem] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Motivo da rejeição *
                </label>
                <textarea
                  value={motivoRejeicao}
                  onChange={e => setMotivoRejeicao(e.target.value)}
                  placeholder="Ex: Documento ilegível, vencido, sem foto..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-400 resize-none"
                />
              </div>
              <button
                onClick={handleRejeitar}
                disabled={actionLoading || !motivoRejeicao.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm bg-red-500 text-white transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {actionLoading ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal foto (múltiplas) */}
      {fotoModal && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90" role="presentation" onClick={() => setFotoModal(null)} />
          <div className="relative w-full max-w-[500px] animate-in zoom-in-95 duration-300">
            {/* Tabs das fotos */}
            {fotoModalUrls.length > 1 && (
              <div className="flex gap-1 mb-3 justify-center relative z-10">
                {fotoModalUrls.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => {
                      setFotoModalIdx(i);
                      setFotoModal(f.url);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-bold uppercase tracking-wider transition-all ${
                      fotoModalIdx === i ? 'bg-white/10 text-white' : 'text-zinc-400'
                    }`}
                  >
                    {f.label === 'frente'
                      ? 'Frente'
                      : f.label === 'verso'
                        ? 'Verso'
                        : f.label === 'extra'
                          ? 'Extra'
                          : f.label}
                  </button>
                ))}
              </div>
            )}
            <img
              src={fotoModalUrls[fotoModalIdx]?.url ?? fotoModal}
              alt="Comprovante"
              className="w-full rounded-2xl border border-white/10"
            />
            <button
              onClick={() => setFotoModal(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full z-10"
            >
              <X size="1rem" className="text-white" />
            </button>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
