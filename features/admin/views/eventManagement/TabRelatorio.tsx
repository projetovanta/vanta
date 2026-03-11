import React, { useState, useEffect } from 'react';
import { FileText, Star, Printer, Crown, ThumbsUp, ThumbsDown, Bell, Send } from 'lucide-react';
import { gerarRelatorio, RelatorioEvento } from '../../services/relatorioService';
import { VantaPieChart } from '../../components/VantaPieChart';
import { CORES_PIZZA } from './types';
import { fmtBRL, tsBR } from '../../../../utils';
import { supabase } from '../../../../services/supabaseClient';
import { clubeService } from '../../services/clube';
import { useAuthStore } from '../../../../stores/authStore';

export const TabRelatorio: React.FC<{ eventoAdminId: string }> = ({ eventoAdminId }) => {
  const currentUserId = useAuthStore(s => s.currentAccount?.id ?? '');
  const [rel, setRel] = useState<RelatorioEvento | null>(null);
  const [loading, setLoading] = useState(true);
  const [mvStats, setMvStats] = useState<{
    totalResgates: number;
    usados: number;
    postsEnviados: number;
    postsVerificados: number;
    postsObrigatorios: number;
    alcanceEstimado: number;
  } | null>(null);
  const [mvAvaliacao, setMvAvaliacao] = useState<'eficiente' | 'ineficiente' | null>(null);
  const [mvAvalSaving, setMvAvalSaving] = useState(false);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState<{ ok: boolean; reason?: string } | null>(null);

  const salvarMvAvaliacao = async (val: 'eficiente' | 'ineficiente') => {
    const novo = mvAvaliacao === val ? null : val;
    setMvAvalSaving(true);
    await supabase.from('eventos_admin').update({ mv_avaliacao: novo }).eq('id', eventoAdminId);
    setMvAvaliacao(novo);
    setMvAvalSaving(false);
  };

  const enviarSolicitacaoNotif = async () => {
    if (!notifMsg.trim()) return;
    setNotifSending(true);
    const result = await clubeService.solicitarNotificacaoMV(eventoAdminId, currentUserId, notifMsg.trim());
    setNotifResult(result);
    if (result.ok) {
      setNotifMsg('');
      setShowNotifForm(false);
    }
    setNotifSending(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    gerarRelatorio(eventoAdminId).then(r => {
      if (!cancelled) {
        setRel(r);
        setLoading(false);
      }
    });
    // Carregar avaliação MV existente
    supabase
      .from('eventos_admin')
      .select('mv_avaliacao')
      .eq('id', eventoAdminId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.mv_avaliacao) setMvAvaliacao(data.mv_avaliacao as 'eficiente' | 'ineficiente');
      });
    // Buscar métricas MAIS VANTA
    supabase
      .from('resgates_mv_evento')
      .select('id, user_id, status, post_verificado, post_url')
      .eq('evento_id', eventoAdminId)
      .limit(500)
      .then(({ data: resgates }) => {
        if (cancelled || !resgates || resgates.length === 0) return;
        const total = resgates.length;
        const usados = resgates.filter(r => r.status === 'USADO').length;
        const postsEnv = resgates.filter(r => r.post_url).length;
        const postsVerif = resgates.filter(r => r.post_verificado).length;
        // Para tiers creator/black, post é obrigatório
        const userIds = [...new Set(resgates.map(r => r.user_id))];
        supabase
          .from('membros_clube')
          .select('user_id, tier, instagram_seguidores')
          .in('user_id', userIds)
          .limit(500)
          .then(({ data: membros }) => {
            if (cancelled) return;
            const memMap = new Map((membros ?? []).map(m => [m.user_id, m]));
            let postsObrig = 0;
            let alcance = 0;
            for (const r of resgates) {
              const m = memMap.get(r.user_id);
              if (!m) continue;
              const tier = m.tier as string;
              if (tier === 'creator' || tier === 'black') postsObrig++;
              if (r.post_verificado && m.instagram_seguidores) {
                alcance += m.instagram_seguidores as number;
              }
            }
            if (!cancelled) {
              setMvStats({
                totalResgates: total,
                usados,
                postsEnviados: postsEnv,
                postsVerificados: postsVerif,
                postsObrigatorios: postsObrig,
                alcanceEstimado: alcance,
              });
            }
          });
      });
    return () => {
      cancelled = true;
    };
  }, [eventoAdminId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Gerando relatório...</p>
      </div>
    );
  }

  if (!rel) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <FileText size={28} className="text-zinc-800" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Evento não encontrado</p>
      </div>
    );
  }

  const fatiasVariacao = rel.vendasPorVariacao.map((v, i) => ({
    name: v.label || 'Sem label',
    value: v.receita,
    color: CORES_PIZZA[i % CORES_PIZZA.length],
  }));

  const origens = [
    {
      label: 'Antecipado',
      vendas: rel.vendasPorOrigem.antecipado,
      ci: rel.checkinsPorOrigem.antecipado,
      cor: '#FFD300',
      corTw: 'text-[#FFD300]',
    },
    {
      label: 'Porta',
      vendas: rel.vendasPorOrigem.porta,
      ci: rel.checkinsPorOrigem.porta,
      cor: '#10b981',
      corTw: 'text-emerald-400',
    },
    {
      label: 'Cortesia',
      vendas: rel.vendasPorOrigem.cortesia,
      ci: rel.checkinsPorOrigem.cortesia,
      cor: '#E91E8C',
      corTw: 'text-pink-400',
    },
  ];

  return (
    <div className="space-y-4 print:bg-white print:text-black" id="vanta-relatorio">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-[#FFD300] print:text-black" />
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest print:text-gray-600">
          Relatório Pós-Evento
        </p>
      </div>

      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <h2 className="text-white font-bold text-lg truncate print:text-black">{rel.eventoNome}</h2>
        <p className="text-zinc-400 text-[10px] mt-1 print:text-gray-500">
          {new Date(rel.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' · '}
          {rel.local}
        </p>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Receita Bruta', valor: fmtBRL(rel.receitaBruta), cor: 'text-[#FFD300]' },
          { label: 'Receita Líquida', valor: fmtBRL(rel.receitaLiquida), cor: 'text-emerald-400' },
          { label: 'Ingressos Vendidos', valor: String(rel.totalVendidos), cor: 'text-white print:text-black' },
          { label: 'Taxa Conversão', valor: `${rel.taxaConversao}%`, cor: 'text-blue-400' },
        ].map(k => (
          <div
            key={k.label}
            className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200"
          >
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              {k.label}
            </p>
            <p className={`font-black text-xl leading-none mt-2 ${k.cor}`}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Ticket Médio */}
      <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
          Ticket Médio
        </p>
        <p className="text-[#FFD300] font-black text-lg print:text-black">{fmtBRL(rel.ticketMedio)}</p>
      </div>

      {/* Vendas por Origem */}
      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest px-1 print:text-gray-600">
        Vendas por Origem
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {origens.map(o => (
          <div
            key={o.label}
            className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-1.5 print:bg-gray-50 print:border-gray-200"
          >
            <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider print:text-gray-500">{o.label}</p>
            <p className="text-white font-black text-lg leading-none print:text-black">{o.vendas}</p>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden print:bg-gray-300">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${o.vendas > 0 ? Math.round((o.ci / o.vendas) * 100) : 0}%`, backgroundColor: o.cor }}
              />
            </div>
            <p className={`text-[9px] font-black ${o.corTw}`}>{o.ci} check-ins</p>
          </div>
        ))}
      </div>

      {/* Gráfico de Pizza — Receita por Variação */}
      {fatiasVariacao.length > 0 && (
        <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
          <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest mb-4 print:text-gray-500">
            Distribuição de Receita
          </p>
          <VantaPieChart
            data={fatiasVariacao}
            height={140}
            formatValue={v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
        </div>
      )}

      {/* Check-ins */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-3 print:text-gray-500">
          Check-ins
        </p>
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-emerald-400 font-black text-4xl leading-none print:text-green-600">
              {rel.totalCheckins}
            </span>
            <span className="text-zinc-400 text-xl font-light print:text-gray-400">/{rel.totalVendidos}</span>
          </div>
          <span className="text-white font-black text-2xl leading-none print:text-black">{rel.taxaConversao}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-3 print:bg-gray-300">
          <div
            className="h-full rounded-full"
            style={{ width: `${rel.taxaConversao}%`, background: 'linear-gradient(to right, #059669, #10b981)' }}
          />
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
              Entraram · {rel.totalCheckins}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700 print:bg-gray-400" />
            <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
              Não foram · {rel.totalVendidos - rel.totalCheckins}
            </span>
          </div>
        </div>
      </div>

      {/* Cortesias */}
      {rel.cortesiasEnviadas > 0 && (
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between print:bg-gray-50 print:border-gray-200">
          <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest print:text-gray-500">
            Cortesias Enviadas
          </p>
          <p className="text-pink-400 font-black text-lg print:text-pink-600">{rel.cortesiasEnviadas}</p>
        </div>
      )}

      {/* Reembolsos */}
      {rel.totalReembolsos > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              Reembolsos Solicitados
            </p>
            <p className="font-black text-xl leading-none mt-2 text-orange-400 print:text-orange-600">
              {rel.totalReembolsos}
            </p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
            <p className="text-zinc-400 text-[8px] font-black uppercase tracking-widest print:text-gray-500">
              Aprovados
            </p>
            <p className="font-black text-xl leading-none mt-2 text-emerald-400 print:text-green-600">
              {rel.reembolsosAprovados}
            </p>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-3 print:text-gray-500">
          Avaliações
        </p>
        {rel.reviewCount > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(rel.reviewMedia) ? 'text-[#FFD300] fill-[#FFD300]' : 'text-zinc-700'}
                />
              ))}
            </div>
            <span className="text-white font-black text-lg print:text-black">{rel.reviewMedia}</span>
            <span className="text-zinc-400 text-[9px] font-black print:text-gray-500">
              ({rel.reviewCount} avaliações)
            </span>
          </div>
        ) : (
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest print:text-gray-400">
            Sem avaliações
          </p>
        )}
      </div>

      {/* Financeiro */}
      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2 print:bg-gray-50 print:border-gray-200">
        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2 print:text-gray-500">
          Resumo Financeiro
        </p>
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-[10px] print:text-gray-600">Receita Bruta</p>
          <p className="text-white text-[10px] font-black print:text-black">{fmtBRL(rel.receitaBruta)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-[10px] print:text-gray-600">
            Taxa VANTA ({(rel.feePercent * 100).toFixed(1)}%)
          </p>
          <p className="text-red-400 text-[10px] font-black print:text-red-600">- {fmtBRL(rel.valorTaxa)}</p>
        </div>
        <div className="h-px bg-white/5 my-1 print:bg-gray-200" />
        <div className="flex justify-between items-center">
          <p className="text-zinc-300 text-[10px] font-black uppercase tracking-widest print:text-gray-700">
            Receita Líquida
          </p>
          <p className="text-emerald-400 text-sm font-black print:text-green-600">{fmtBRL(rel.receitaLiquida)}</p>
        </div>
        <div className="mt-2">
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300]/70">
            Taxa Serviço: Cliente
          </span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
              rel.gatewayMode === 'REPASSAR'
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}
          >
            {rel.gatewayMode === 'REPASSAR' ? 'GW: Cliente' : 'GW: Organizador'}
          </span>
        </div>
      </div>

      {/* MAIS VANTA */}
      {mvStats && mvStats.totalResgates > 0 && (
        <div className="bg-zinc-900/60 border border-[#FFD300]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={14} className="text-[#FFD300]" />
            <h3 className="text-white text-xs font-black uppercase tracking-widest">MAIS VANTA</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-[#FFD300] text-lg font-black">{mvStats.totalResgates}</p>
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">Resgates</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-emerald-400 text-lg font-black">
                {mvStats.totalResgates > 0 ? Math.round((mvStats.usados / mvStats.totalResgates) * 100) : 0}%
              </p>
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">Comparecimento</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-white text-lg font-black">
                {mvStats.postsEnviados}/{mvStats.postsObrigatorios || '—'}
              </p>
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">Posts enviados</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-white text-lg font-black">
                {mvStats.postsVerificados}/{mvStats.postsObrigatorios || '—'}
              </p>
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">Posts verificados</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-[#FFD300] text-lg font-black">
                {mvStats.alcanceEstimado >= 1000
                  ? `${(mvStats.alcanceEstimado / 1000).toFixed(1)}K`
                  : mvStats.alcanceEstimado}
              </p>
              <p className="text-zinc-500 text-[8px] uppercase tracking-widest">Alcance estimado</p>
            </div>
          </div>

          {/* Avaliação eficiente/ineficiente */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => salvarMvAvaliacao('eficiente')}
              disabled={mvAvalSaving}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                mvAvaliacao === 'eficiente'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900/40 border-white/5 text-zinc-500'
              }`}
            >
              <ThumbsUp size={12} /> Eficiente
            </button>
            <button
              onClick={() => salvarMvAvaliacao('ineficiente')}
              disabled={mvAvalSaving}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                mvAvaliacao === 'ineficiente'
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-zinc-900/40 border-white/5 text-zinc-500'
              }`}
            >
              <ThumbsDown size={12} /> Ineficiente
            </button>
          </div>

          {/* Solicitar notificação MV (produtor) */}
          <div className="mt-4 pt-3 border-t border-white/5">
            {!showNotifForm ? (
              <button
                onClick={() => setShowNotifForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                <Bell size={12} />
                Solicitar notificação para membros
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                  Mensagem para membros MAIS VANTA
                </p>
                <textarea
                  value={notifMsg}
                  onChange={e => setNotifMsg(e.target.value)}
                  placeholder="Ex: Venha conferir o evento! Temos benefícios exclusivos..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={enviarSolicitacaoNotif}
                    disabled={notifSending || !notifMsg.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFD300]/10 border border-[#FFD300]/20 text-[#FFD300] text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={12} />
                    Enviar solicitação
                  </button>
                  <button
                    onClick={() => {
                      setShowNotifForm(false);
                      setNotifResult(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
                {notifResult && !notifResult.ok && <p className="text-red-400 text-xs">{notifResult.reason}</p>}
                {notifResult?.ok && (
                  <p className="text-emerald-400 text-xs">
                    Solicitação enviada! O Vanta vai analisar e decidir o envio.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exportar PDF */}
      <button
        onClick={() => window.print()}
        className="w-full py-4 bg-[#FFD300]/10 border border-[#FFD300]/20 rounded-2xl flex items-center justify-center gap-2 text-[#FFD300] text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all print:hidden"
      >
        <Printer size={14} />
        Exportar PDF
      </button>
    </div>
  );
};
