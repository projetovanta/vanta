import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Users, Plus, Check, Link2, Copy, DollarSign, Trophy, Loader2, Clock } from 'lucide-react';
import { TYPOGRAPHY } from '../../../../constants';
import { ListaEvento } from '../../../../types';
import { listasService, PROMOTERS_CACHE } from '../../services/listasService';
import { fmtBRL, tsBR } from '../../../../utils';
import { supabase } from '../../../../services/supabaseClient';
import { inputCls } from './types';
import { VantaDropdown } from '../../../../components/VantaDropdown';

export const TabEquipePromoter: React.FC<{
  lista: ListaEvento;
  onRefresh: () => void;
  toastFn?: (t: 'sucesso' | 'erro', m: string) => void;
  eventoSlug?: string;
  eventoId?: string;
  currentUserId?: string;
}> = ({ lista, onRefresh, toastFn, eventoSlug, eventoId, currentUserId }) => {
  const [distModal, setDistModal] = useState(false);
  const [selPromoter, setSelPromoter] = useState('');
  const [selRegra, setSelRegra] = useState('');
  const [qtd, setQtd] = useState('');
  const [erro, setErro] = useState('');
  const [pagModal, setPagModal] = useState<string | null>(null);
  const [pagValor, setPagValor] = useState('');
  const [pagObs, setPagObs] = useState('');
  const [pagLoading, setPagLoading] = useState(false);
  const [pagHistorico, setPagHistorico] = useState<
    { id: string; valor: number; observacao?: string; criado_em: string }[]
  >([]);
  const [pagHistLoading, setPagHistLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch histórico de pagamentos ao abrir modal
  useEffect(() => {
    if (!pagModal || !eventoId) {
      setPagHistorico([]);
      return;
    }
    let cancelled = false;
    setPagHistLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('pagamentos_promoter')
          .select('id, valor, observacao, criado_em')
          .eq('evento_id', eventoId)
          .eq('promoter_id', pagModal)
          .order('criado_em', { ascending: false });
        if (!cancelled) setPagHistorico((data ?? []) as typeof pagHistorico);
      } catch {
        /* silencioso */
      }
      if (!cancelled) setPagHistLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pagModal, eventoId]);

  const promoterIds = useMemo(() => [...new Set(lista.cotas.map(c => c.promoterId))], [lista.cotas]);

  // Ranking de promoters por nomes inseridos na lista
  const ranking = useMemo(() => {
    return promoterIds
      .map(pid => {
        const promoter = PROMOTERS_CACHE.find(p => p.id === pid);
        const cotas = lista.cotas.filter(c => c.promoterId === pid);
        const nomesNaLista = lista.convidados.filter(c => c.promoterId === pid).length;
        const checkinsPromoter = lista.convidados.filter(c => c.promoterId === pid && c.checkedIn).length;
        const totalUsado = cotas.reduce((a, c) => a + c.usado, 0);
        const totalAlocado = cotas.reduce((a, c) => a + c.alocado, 0);
        return {
          pid,
          nome: promoter?.nome ?? pid,
          foto: promoter?.foto ?? '',
          nomesNaLista,
          checkins: checkinsPromoter,
          totalUsado,
          totalAlocado,
          conversao: nomesNaLista > 0 ? Math.round((checkinsPromoter / nomesNaLista) * 100) : 0,
        };
      })
      .sort((a, b) => b.nomesNaLista - a.nomesNaLista);
  }, [promoterIds, lista]);

  const copyTrackingLink = useCallback(
    (promoterId: string) => {
      if (!eventoSlug) {
        toastFn?.('erro', 'Defina um slug para o evento primeiro');
        return;
      }
      const url = `${window.location.origin}/evento/${eventoSlug}?ref=${promoterId}`;
      navigator.clipboard.writeText(url).catch(() => {});
      setCopiedId(promoterId);
      setTimeout(() => setCopiedId(null), 2000);
      toastFn?.('sucesso', 'Link copiado!');
    },
    [eventoSlug, toastFn],
  );

  const handlePagamento = async () => {
    if (!pagModal || !eventoId || !currentUserId) return;
    const val = parseFloat(pagValor);
    if (!val || val <= 0) {
      setErro('Valor inválido');
      return;
    }
    setPagLoading(true);
    try {
      const cota = lista.cotas.find(c => c.promoterId === pagModal);
      const { error } = await supabase.from('pagamentos_promoter').insert({
        cota_id: cota?.regraId ?? pagModal,
        promoter_id: pagModal,
        evento_id: eventoId,
        valor: val,
        registrado_por: currentUserId,
        observacao: pagObs || null,
      });
      if (error) throw error;
      toastFn?.('sucesso', `Pagamento de ${fmtBRL(val)} registrado`);
      setPagHistorico(prev => [
        { id: `tmp_${Date.now()}`, valor: val, observacao: pagObs || undefined, criado_em: tsBR() },
        ...prev,
      ]);
      setPagValor('');
      setPagObs('');
    } catch (err) {
      console.error('[Promoter] pagamento erro:', err);
      toastFn?.('erro', 'Erro ao registrar pagamento');
    } finally {
      setPagLoading(false);
    }
  };

  const handleDistribuir = () => {
    setErro('');
    const q = parseInt(qtd);
    if (!selPromoter || !selRegra || !q || q <= 0) {
      setErro('Preencha todos os campos.');
      return;
    }
    const promoter = PROMOTERS_CACHE.find(p => p.id === selPromoter);
    const ok = listasService.distribuirCota(lista.id, selRegra, selPromoter, promoter?.nome ?? selPromoter, q);
    if (!ok) {
      setErro('Saldo no banco insuficiente.');
      return;
    }
    onRefresh();
    setDistModal(false);
    setSelPromoter('');
    setSelRegra('');
    setQtd('');
    setErro('');
    toastFn?.('sucesso', `${q} vagas distribuídas`);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setDistModal(true)}
        className="w-full flex items-center justify-between p-5 bg-[#FFD300] rounded-2xl active:scale-[0.97] transition-all"
      >
        <div>
          <p className="text-black font-black text-sm uppercase tracking-wider leading-none">Distribuir Cota</p>
          <p className="text-black/50 text-[0.625rem] font-bold mt-1">Alocar vagas aos promoters</p>
        </div>
        <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
          <Plus size="1.125rem" className="text-black" />
        </div>
      </button>

      {/* ── Ranking de Promoters ──────────────────────────────────── */}
      {ranking.length > 0 && (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size="0.875rem" className="text-[#FFD300]" />
            <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">Ranking Promoters</p>
          </div>
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div key={r.pid} className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[0.5625rem] font-black ${i === 0 ? 'bg-[#FFD300] text-black' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{r.nome}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[0.5625rem]">
                  <span className="text-zinc-400">{r.nomesNaLista} nomes</span>
                  <span className="text-emerald-400">{r.checkins} check-ins</span>
                  <span className="text-zinc-400">{r.conversao}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {promoterIds.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Users size="1.75rem" className="text-zinc-800" />
          <p className="text-zinc-700 text-[0.625rem] font-black uppercase tracking-widest">
            Nenhum promoter com cota ainda
          </p>
        </div>
      )}

      {promoterIds.map(pid => {
        const promoter = PROMOTERS_CACHE.find(p => p.id === pid);
        const cotas = lista.cotas.filter(c => c.promoterId === pid);
        const totalSaldo = cotas.reduce((a, c) => a + (c.alocado - c.usado), 0);
        return (
          <div key={pid} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                {promoter?.foto && (
                  <img loading="lazy" src={promoter.foto} alt={promoter.nome} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none truncate">{promoter?.nome ?? pid}</p>
                <p className="text-[#FFD300]/70 text-[0.625rem] mt-0.5 font-black">{totalSaldo} vagas disponíveis</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-black text-xl leading-none">{cotas.reduce((a, c) => a + c.usado, 0)}</p>
                <p className="text-zinc-400 text-[0.5rem] font-black uppercase tracking-widest">usadas</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {cotas.map(c => {
                const regra = lista.regras.find(r => r.id === c.regraId);
                const cor = regra?.cor || '#71717a';
                const saldo = c.alocado - c.usado;
                const pctC = c.alocado > 0 ? Math.round((c.usado / c.alocado) * 100) : 0;
                return (
                  <div key={c.regraId} className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cor }} />
                        <p className="text-zinc-300 text-[0.625rem] font-bold">{regra?.label}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[0.5625rem] font-black uppercase tracking-widest">
                        <span className="text-zinc-400">Usado: {c.usado}</span>
                        <span className={saldo > 0 ? 'text-[#FFD300]' : 'text-zinc-700'}>Saldo: {saldo}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pctC}%`, backgroundColor: cor }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Ações por promoter: link tracking + pagamento */}
            <div className="px-3 pb-3 flex items-center gap-2">
              <button
                onClick={() => copyTrackingLink(pid)}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-[0.5625rem] text-zinc-400 hover:text-[#FFD300] transition-colors active:scale-95"
              >
                {copiedId === pid ? (
                  <Check size="0.6875rem" className="text-emerald-400" />
                ) : (
                  <Link2 size="0.6875rem" />
                )}
                {copiedId === pid ? 'Copiado!' : 'Link de tracking'}
              </button>
              <button
                onClick={() => setPagModal(pid)}
                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-[0.5625rem] text-zinc-400 hover:text-emerald-400 transition-colors active:scale-95"
              >
                <DollarSign size="0.6875rem" /> Pagamento
              </button>
            </div>
          </div>
        );
      })}

      {distModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setDistModal(false);
            setErro('');
          }}
        >
          <div
            className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-3 pb-4 border-b border-white/5">
              <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
                Distribuir Cota
              </h2>
            </div>
            <div
              className="p-6 space-y-3"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            >
              <VantaDropdown
                value={selPromoter}
                onChange={setSelPromoter}
                placeholder="Selecione o promoter..."
                options={PROMOTERS_CACHE.map(p => ({ value: p.id, label: p.nome }))}
              />
              <VantaDropdown
                value={selRegra}
                onChange={setSelRegra}
                placeholder="Selecione a categoria..."
                options={lista.regras.map(r => ({ value: r.id, label: `${r.label} (banco: ${r.saldoBanco})` }))}
              />
              <input
                value={qtd}
                onChange={e => setQtd(e.target.value)}
                type="number"
                min="1"
                placeholder="Quantidade de vagas"
                className={inputCls}
              />
              {erro && <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setDistModal(false);
                    setErro('');
                  }}
                  className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDistribuir}
                  className="flex-1 py-3.5 bg-[#FFD300] text-black rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check size="0.75rem" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal de Pagamento ──────────────────────────────────── */}
      {pagModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setPagModal(null);
            setPagValor('');
            setPagObs('');
            setErro('');
          }}
        >
          <div
            className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-[2.5rem] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="px-6 pt-3 pb-4 border-b border-white/5">
              <h2 style={TYPOGRAPHY.screenTitle} className="text-base italic">
                Registrar Pagamento
              </h2>
              <p className="text-zinc-400 text-[0.625rem] mt-1">
                {PROMOTERS_CACHE.find(p => p.id === pagModal)?.nome ?? pagModal}
              </p>
            </div>
            <div
              className="p-6 space-y-3"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            >
              <input
                value={pagValor}
                onChange={e => setPagValor(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Valor (R$)"
                className={inputCls}
              />
              <input
                value={pagObs}
                onChange={e => setPagObs(e.target.value)}
                placeholder="Observação (opcional)"
                className={inputCls}
              />
              {erro && <p className="text-red-400 text-[0.625rem] font-black uppercase tracking-widest">{erro}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setPagModal(null);
                    setPagValor('');
                    setPagObs('');
                    setErro('');
                  }}
                  className="flex-1 py-3.5 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 text-[0.625rem] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePagamento}
                  disabled={pagLoading}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl text-[0.625rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  {pagLoading ? <Loader2 size="0.75rem" className="animate-spin" /> : <DollarSign size="0.75rem" />}{' '}
                  Confirmar
                </button>
              </div>
              {/* Histórico de pagamentos */}
              {pagHistLoading ? (
                <div className="flex justify-center py-3">
                  <Loader2 size="0.875rem" className="text-zinc-400 animate-spin" />
                </div>
              ) : pagHistorico.length > 0 ? (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">
                    Pagamentos anteriores
                  </p>
                  {pagHistorico.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-[0.625rem]">
                      <Clock size="0.625rem" className="text-zinc-700 shrink-0" />
                      <span className="text-emerald-400 font-bold shrink-0">{fmtBRL(p.valor)}</span>
                      <span className="text-zinc-400 truncate flex-1">{p.observacao || '—'}</span>
                      <span className="text-zinc-700 shrink-0">
                        {new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))}
                  <p className="text-[0.5625rem] text-zinc-400 font-bold">
                    Total: {fmtBRL(pagHistorico.reduce((s, p) => s + Number(p.valor), 0))}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
