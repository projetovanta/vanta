import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Copy, Check, X, Loader2, Clock, UserCheck, Store, Crown, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { clubeService } from '../services/clube';
import type { ConviteMaisVanta } from '../services/clube/clubeConvitesService';

type TipoConvite = 'MEMBRO' | 'PARCEIRO';

interface CidadeMV {
  id: string;
  nome: string;
}

export const ConvitesMaisVantaView: React.FC<{
  onBack: () => void;
  toastFn: (tipo: 'sucesso' | 'erro', msg: string) => void;
}> = ({ onBack, toastFn }) => {
  const currentAccount = useAuthStore(s => s.currentAccount);
  const [convites, setConvites] = useState<ConviteMaisVanta[]>([]);
  const [cidades, setCidades] = useState<CidadeMV[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<TipoConvite>('MEMBRO');
  const [tier, setTier] = useState('lista');
  const [cidadeId, setCidadeId] = useState('');
  const [parceiroNome, setParceiroNome] = useState('');

  const tiers = clubeService.getTiers();

  const fetchData = useCallback(async () => {
    try {
      const [conv, cid] = await Promise.all([
        clubeService.convites.listar(),
        import('../services/clube/clubeCidadesService').then(m => m.clubeCidadesService.listar()),
      ]);
      setConvites(conv);
      setCidades(cid.map(c => ({ id: c.id, nome: c.nome })));
    } catch {
      toastFn('erro', 'Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  }, [toastFn]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCriar = async () => {
    if (!currentAccount?.id) return;
    setCriando(true);
    try {
      await clubeService.convites.criar({
        tipo,
        tier: tipo === 'MEMBRO' ? tier : undefined,
        cidade_id: cidadeId || undefined,
        parceiro_nome: tipo === 'PARCEIRO' ? parceiroNome || undefined : undefined,
        criado_por: currentAccount.id,
      });
      toastFn('sucesso', 'Convite criado!');
      setShowForm(false);
      setParceiroNome('');
      void fetchData();
    } catch {
      toastFn('erro', 'Erro ao criar convite');
    } finally {
      setCriando(false);
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      await clubeService.convites.cancelar(id);
      toastFn('sucesso', 'Convite cancelado');
      void fetchData();
    } catch {
      toastFn('erro', 'Erro ao cancelar');
    }
  };

  const handleCopiar = (token: string, id: string) => {
    const link = clubeService.convites.getLinkConvite(token);
    navigator.clipboard.writeText(link).then(() => {
      setCopiadoId(id);
      toastFn('sucesso', 'Link copiado!');
      setTimeout(() => setCopiadoId(null), 2000);
    });
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'PENDENTE':
        return 'Aguardando';
      case 'ACEITO':
        return 'Aceito';
      case 'EXPIRADO':
        return 'Expirado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'PENDENTE':
        return 'text-yellow-500';
      case 'ACEITO':
        return 'text-green-500';
      case 'EXPIRADO':
        return 'text-zinc-400';
      case 'CANCELADO':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const isExpirado = (c: ConviteMaisVanta) => c.status === 'PENDENTE' && new Date(c.expira_em) < new Date();

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button onClick={onBack} className="p-1.5 text-zinc-400 active:text-white" aria-label="Voltar">
          <ArrowLeft size={16} />
        </button>
        <Send size={14} className="text-[#FFD300]" />
        <h1 className="text-white font-bold text-sm">Convites MAIS VANTA</h1>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto px-3 py-1.5 bg-[#FFD300] text-black font-black text-[9px] uppercase tracking-widest rounded-xl active:scale-95 transition-all"
        >
          Novo Convite
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="text-zinc-400 animate-spin" />
          </div>
        ) : convites.length === 0 ? (
          <div className="text-center py-20">
            <Send size={28} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-xs">Nenhum convite criado ainda</p>
          </div>
        ) : (
          convites.map(c => {
            const expirado = isExpirado(c);
            return (
              <div key={c.id} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      c.tipo === 'MEMBRO' ? 'bg-[#FFD300]/10' : 'bg-purple-500/10'
                    }`}
                  >
                    {c.tipo === 'MEMBRO' ? (
                      <Crown size={14} className="text-[#FFD300]" />
                    ) : (
                      <Store size={14} className="text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-xs truncate">
                      {c.tipo === 'MEMBRO'
                        ? `Membro ${c.tier ?? ''}`
                        : `Parceiro${c.parceiro_nome ? ` — ${c.parceiro_nome}` : ''}`}
                    </p>
                    <p className="text-zinc-400 text-[9px] truncate">
                      {c.cidade_nome ? `${c.cidade_nome} · ` : ''}
                      Criado por {c.criador_nome ?? 'Master'}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider ${expirado ? 'text-zinc-400' : statusColor(c.status)}`}
                  >
                    {expirado ? 'Expirado' : statusLabel(c.status)}
                  </span>
                </div>

                {/* Info de aceitação */}
                {c.status === 'ACEITO' && c.aceito_nome && (
                  <div className="flex items-center gap-1.5 mb-2 ml-11">
                    <UserCheck size={10} className="text-green-500" />
                    <span className="text-green-500 text-[9px]">Aceito por {c.aceito_nome}</span>
                  </div>
                )}

                {/* Expira em */}
                {c.status === 'PENDENTE' && !expirado && (
                  <div className="flex items-center gap-1.5 mb-2 ml-11">
                    <Clock size={10} className="text-zinc-400" />
                    <span className="text-zinc-400 text-[9px]">
                      Expira em {new Date(c.expira_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Ações */}
                {c.status === 'PENDENTE' && !expirado && (
                  <div className="flex gap-2 mt-3 ml-11">
                    <button
                      onClick={() => handleCopiar(c.token, c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-xl text-zinc-300 text-[9px] font-bold active:scale-95 transition-all"
                      aria-label="Copiar link do convite"
                    >
                      {copiadoId === c.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                      {copiadoId === c.id ? 'Copiado!' : 'Copiar Link'}
                    </button>
                    <button
                      onClick={() => handleCancelar(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-xl text-red-400 text-[9px] font-bold active:scale-95 transition-all"
                      aria-label="Cancelar convite"
                    >
                      <Trash2 size={10} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Convite */}
      {showForm && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-4" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-white font-bold text-base">Novo Convite</p>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400" aria-label="Fechar">
                  <X size={14} />
                </button>
              </div>

              {/* Tipo */}
              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Tipo</p>
              <div className="flex gap-2 mb-5">
                {(['MEMBRO', 'PARCEIRO'] as TipoConvite[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      tipo === t
                        ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                        : 'bg-zinc-900 border-white/5 text-zinc-400'
                    }`}
                  >
                    {t === 'MEMBRO' ? <Crown size={12} /> : <Store size={12} />}
                    {t === 'MEMBRO' ? 'Membro' : 'Parceiro'}
                  </button>
                ))}
              </div>

              {/* Tier (só membro) */}
              {tipo === 'MEMBRO' && (
                <div className="mb-5">
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Nível</p>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTier(t.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          tier === t.id
                            ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                            : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nome parceiro (só parceiro) */}
              {tipo === 'PARCEIRO' && (
                <div className="mb-5">
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Nome do Estabelecimento
                  </p>
                  <input
                    type="text"
                    value={parceiroNome}
                    onChange={e => setParceiroNome(e.target.value)}
                    placeholder="Ex: Bar do João"
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-600 outline-none focus:border-[#FFD300]/30"
                  />
                </div>
              )}

              {/* Cidade */}
              {cidades.length > 0 && (
                <div className="mb-5">
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Cidade (opcional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCidadeId('')}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        !cidadeId
                          ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                          : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}
                    >
                      Nenhuma
                    </button>
                    {cidades.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCidadeId(c.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          cidadeId === c.id
                            ? 'bg-[#FFD300]/15 border-[#FFD300]/30 text-[#FFD300]'
                            : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <p className="text-zinc-400 text-[10px] leading-relaxed mb-5">
                Um link único será gerado. Envie por WhatsApp ou email. O link expira em 7 dias e só pode ser usado uma
                vez.
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleCriar()}
                  disabled={criando}
                  className="flex-1 py-4 bg-[#FFD300] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {criando ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Criando...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Gerar Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
