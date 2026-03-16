/**
 * DealsMaisVantaView — CRUD de deals MAIS VANTA + gestão de resgates.
 * Master cria deals; visualiza candidatos e seleciona membros.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, Plus, MapPin, Users, Eye, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { clubeDealsService } from '../services/clube/clubeDealsService';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { clubeResgatesService } from '../services/clube/clubeResgatesService';
import { clubeParceirosService } from '../services/clube/clubeParceirosService';
import { clubeCidadesService } from '../services/clube/clubeCidadesService';
import { useAuthStore } from '../../../stores/authStore';
import type { DealMaisVanta, ResgateMaisVanta, ParceiroMaisVanta, CidadeMaisVanta, TipoDeal } from '../../../types';

type Tab = 'DEALS' | 'RESGATES';

export const DealsMaisVantaView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('DEALS');
  const [deals, setDeals] = useState<DealMaisVanta[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroMaisVanta[]>([]);
  const [cidades, setCidades] = useState<CidadeMaisVanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [resgates, setResgates] = useState<ResgateMaisVanta[]>([]);
  const [loadingResgates, setLoadingResgates] = useState(false);
  const currentUserId = useAuthStore(s => s.profile?.id ?? '');

  // Form
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoDeal>('BARTER');
  const [obrigacao, setObrigacao] = useState('');
  const [descontoPerc, setDescontoPerc] = useState('');
  const [vagas, setVagas] = useState('5');
  const [parceiroId, setParceiroId] = useState('');
  const [cidadeId, setCidadeId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [d, p, c] = await Promise.all([
      clubeDealsService.listar(),
      clubeParceirosService.listar(),
      clubeCidadesService.listarAtivas(),
    ]);
    setDeals(d);
    setParceiros(p.filter(x => x.ativo));
    setCidades(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadResgates = async (dealId: string) => {
    setLoadingResgates(true);
    setSelectedDealId(dealId);
    const r = await clubeResgatesService.listarPorDeal(dealId);
    setResgates(r);
    setLoadingResgates(false);
  };

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setTipo('BARTER');
    setObrigacao('');
    setDescontoPerc('');
    setVagas('5');
    setParceiroId('');
    setCidadeId('');
  };

  const handleCriar = async () => {
    if (!titulo.trim() || !parceiroId || !cidadeId) return;
    await clubeDealsService.criar({
      parceiroId,
      cidadeId,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      tipo,
      obrigacaoBarter: tipo === 'BARTER' ? obrigacao.trim() || undefined : undefined,
      descontoPercentual: tipo === 'DESCONTO' && descontoPerc ? Number(descontoPerc) : undefined,
      vagas: Number(vagas) || 5,
    });
    setShowForm(false);
    resetForm();
    load();
  };

  const handleSelecionar = async (resgateId: string) => {
    await clubeResgatesService.selecionar(resgateId, currentUserId);
    if (selectedDealId) loadResgates(selectedDealId);
  };

  const handleRecusar = async (resgateId: string) => {
    await clubeResgatesService.recusar(resgateId);
    if (selectedDealId) loadResgates(selectedDealId);
  };

  const handleVerificarPost = async (resgateId: string) => {
    await clubeResgatesService.verificarPost(resgateId);
    if (selectedDealId) loadResgates(selectedDealId);
  };

  const handleNoShow = async (resgateId: string) => {
    await clubeResgatesService.noShow(resgateId);
    if (selectedDealId) loadResgates(selectedDealId);
  };

  const handleConcluir = async (resgateId: string) => {
    await clubeResgatesService.concluir(resgateId);
    if (selectedDealId) loadResgates(selectedDealId);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      ATIVO: { bg: 'bg-green-500/20', text: 'text-green-400' },
      RASCUNHO: { bg: 'bg-zinc-700/50', text: 'text-zinc-400' },
      PAUSADO: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      ENCERRADO: { bg: 'bg-red-500/20', text: 'text-red-400' },
      EXPIRADO: { bg: 'bg-zinc-700/50', text: 'text-zinc-400' },
      APLICADO: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      SELECIONADO: { bg: 'bg-[#FFD300]/20', text: 'text-[#FFD300]' },
      RECUSADO: { bg: 'bg-red-500/20', text: 'text-red-400' },
      CHECK_IN: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      PENDENTE_POST: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      CONCLUIDO: { bg: 'bg-green-500/20', text: 'text-green-400' },
      NO_SHOW: { bg: 'bg-red-500/20', text: 'text-red-400' },
      CANCELADO: { bg: 'bg-zinc-700/50', text: 'text-zinc-400' },
    };
    const s = map[status] ?? { bg: 'bg-zinc-700/50', text: 'text-zinc-400' };
    return (
      <span className={`${s.bg} ${s.text} px-2 py-0.5 rounded text-[0.5625rem] font-bold uppercase`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // ── Resgates detail overlay ──
  if (selectedDealId) {
    const deal = deals.find(d => d.id === selectedDealId);
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDealId(null)}
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all rotate-180"
          >
            <ArrowRight size="0.875rem" className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{deal?.titulo ?? 'Deal'}</p>
            <p className="text-zinc-400 text-[0.625rem]">
              {deal?.parceiroNome} · {deal?.cidadeNome}
            </p>
          </div>
          {deal && statusBadge(deal.status)}
        </div>

        {/* Stats */}
        {deal && (
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-white text-lg font-bold">
                {deal.vagasPreenchidas}/{deal.vagas}
              </p>
              <p className="text-zinc-400 text-[0.5625rem] uppercase">Vagas</p>
            </div>
            <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-white text-lg font-bold">{resgates.length}</p>
              <p className="text-zinc-400 text-[0.5625rem] uppercase">Candidatos</p>
            </div>
            <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-[#FFD300] text-lg font-bold">{deal.tipo}</p>
              <p className="text-zinc-400 text-[0.5625rem] uppercase">Tipo</p>
            </div>
          </div>
        )}

        {/* Resgates */}
        {loadingResgates ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resgates.length === 0 ? (
          <div className="text-center py-8">
            <Users size="1.5rem" className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs">Nenhum candidato ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resgates.map(r => (
              <div key={r.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                    <Users size="0.875rem" className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.userName ?? 'Membro'}</p>
                    {r.userInstagram && <p className="text-zinc-400 text-[0.625rem]">@{r.userInstagram}</p>}
                  </div>
                  {statusBadge(r.status)}
                </div>

                {/* Ações conforme status */}
                <div className="flex gap-1.5 mt-2">
                  {r.status === 'APLICADO' && (
                    <>
                      <button
                        onClick={() => handleSelecionar(r.id)}
                        className="flex-1 py-1.5 bg-[#FFD300] text-black rounded-lg text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size="0.625rem" /> Selecionar
                      </button>
                      <button
                        onClick={() => handleRecusar(r.id)}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
                      >
                        <XCircle size="0.625rem" />
                      </button>
                    </>
                  )}
                  {r.status === 'SELECIONADO' && (
                    <button
                      onClick={() => handleNoShow(r.id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1"
                    >
                      <XCircle size="0.625rem" /> No-Show
                    </button>
                  )}
                  {r.status === 'PENDENTE_POST' && (
                    <button
                      onClick={() => handleVerificarPost(r.id)}
                      className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size="0.625rem" /> Verificar Post
                    </button>
                  )}
                  {r.status === 'CHECK_IN' && deal?.tipo === 'DESCONTO' && (
                    <button
                      onClick={() => handleConcluir(r.id)}
                      className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size="0.625rem" /> Concluir
                    </button>
                  )}
                  {r.postUrl && (
                    <a
                      href={r.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Eye size="0.625rem" /> Post
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {onBack && <AdminViewHeader title="Benefícios" kicker="MAIS VANTA" onBack={onBack} />}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(['DEALS', 'RESGATES'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[0.5625rem] font-black uppercase tracking-wider border transition-all ${
                tab === t ? 'bg-[#FFD300] text-black border-transparent' : 'bg-zinc-900/60 text-zinc-400 border-white/5'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1" />
          {tab === 'DEALS' && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              <Plus size="0.75rem" /> Novo Deal
            </button>
          )}
        </div>

        {/* Form criar deal */}
        {showForm && (
          <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-white text-xs font-bold">Novo Deal</p>

            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título (ex: VIP + Open Bar)"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
            />

            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição do deal"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50 min-h-[3.75rem] resize-none"
            />

            {/* Parceiro */}
            <div>
              <p className="text-zinc-400 text-[0.625rem] font-bold uppercase tracking-wider mb-1">Parceiro</p>
              <div className="flex flex-wrap gap-1.5">
                {parceiros.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setParceiroId(p.id);
                      setCidadeId(p.cidadeId);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[0.5625rem] font-bold border transition-all ${
                      parceiroId === p.id
                        ? 'bg-[#FFD300] text-black border-transparent'
                        : 'bg-zinc-800 text-zinc-400 border-white/5'
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="flex gap-2">
              {(['BARTER', 'DESCONTO'] as TipoDeal[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`flex-1 py-2 rounded-lg text-[0.625rem] font-black uppercase tracking-wider border transition-all ${
                    tipo === t
                      ? 'bg-[#FFD300] text-black border-transparent'
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tipo === 'BARTER' && (
              <input
                value={obrigacao}
                onChange={e => setObrigacao(e.target.value)}
                placeholder="Obrigação (ex: 1 story + 1 post)"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
            )}
            {tipo === 'DESCONTO' && (
              <input
                value={descontoPerc}
                onChange={e => setDescontoPerc(e.target.value)}
                placeholder="Desconto % (ex: 30)"
                type="number"
                min="1"
                max="100"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
              />
            )}

            <input
              value={vagas}
              onChange={e => setVagas(e.target.value)}
              placeholder="Vagas"
              type="number"
              min="1"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
            />

            <div className="flex gap-2">
              <button
                onClick={handleCriar}
                className="flex-1 py-2 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Criar Deal
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

        {/* Lista deals */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <Ticket size="2rem" className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs">Nenhum deal cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map(d => (
              <button
                key={d.id}
                onClick={() => loadResgates(d.id)}
                className="w-full text-left bg-zinc-900/60 border border-white/5 rounded-xl p-3 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                    <Ticket size="1.125rem" className="text-[#FFD300]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{d.titulo}</p>
                    <div className="flex items-center gap-2 text-[0.625rem] text-zinc-400 mt-0.5">
                      <span>{d.parceiroNome}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size="0.5625rem" />
                        {d.cidadeNome}
                      </span>
                      <span className={d.tipo === 'BARTER' ? 'text-purple-400' : 'text-green-400'}>{d.tipo}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {statusBadge(d.status)}
                    <div className="flex items-center gap-1 text-[0.625rem] text-zinc-400">
                      <Users size="0.625rem" />
                      {d.vagasPreenchidas}/{d.vagas}
                    </div>
                  </div>
                </div>
                {d.obrigacaoBarter && (
                  <p className="text-zinc-400 text-[0.625rem] mt-1.5 truncate">
                    <Clock size="0.5625rem" className="inline mr-1" />
                    {d.obrigacaoBarter}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
