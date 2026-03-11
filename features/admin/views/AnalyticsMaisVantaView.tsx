import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  ShoppingCart,
  Store,
  Crown,
  Loader2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

interface MembrosStats {
  total: number;
  ativos: number;
  novosMes: number;
  porTier: Record<string, number>;
}

interface ResgatesStats {
  total: number;
  mes: number;
  topDeals: { titulo: string; resgates: number }[];
}

interface ParceirosStats {
  total: number;
  ranking: { nome: string; resgates: number }[];
  inativos: number;
}

interface ReceitaStats {
  assinaturasAtivas: number;
  valorTotal: number;
}

interface EngajamentoStats {
  nuncaResgatou: number;
  mediaResgatesMembro: number;
}

export const AnalyticsMaisVantaView: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<MembrosStats | null>(null);
  const [resgates, setResgates] = useState<ResgatesStats | null>(null);
  const [parceiros, setParceiros] = useState<ParceirosStats | null>(null);
  const [receita, setReceita] = useState<ReceitaStats | null>(null);
  const [engajamento, setEngajamento] = useState<EngajamentoStats | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();

      // Membros
      const { data: membrosData } = await supabase.from('membros_clube').select('id, tier, ativo, aprovado_em');

      const allMembros = membrosData ?? [];
      const ativos = allMembros.filter(m => (m as Record<string, unknown>).ativo);
      const novosMes = allMembros.filter(m => {
        const r = m as Record<string, unknown>;
        return r.ativo && r.aprovado_em && (r.aprovado_em as string) >= inicioMes;
      });
      const porTier: Record<string, number> = {};
      ativos.forEach(m => {
        const t = (m as Record<string, unknown>).tier as string;
        porTier[t] = (porTier[t] ?? 0) + 1;
      });
      setMembros({ total: allMembros.length, ativos: ativos.length, novosMes: novosMes.length, porTier });

      // Resgates
      const { data: resgatesData } = await supabase
        .from('resgates_mais_vanta')
        .select('id, aplicado_em, deal:deals_mais_vanta!resgates_mais_vanta_deal_id_fkey(titulo)')
        .in('status', ['CHECK_IN', 'PENDENTE_POST', 'CONCLUIDO']);

      const allResgates = resgatesData ?? [];
      const resgatesMes = allResgates.filter(r => ((r as Record<string, unknown>).aplicado_em as string) >= inicioMes);
      const dealCount: Record<string, number> = {};
      allResgates.forEach(r => {
        const titulo =
          (((r as Record<string, unknown>).deal as Record<string, unknown>)?.titulo as string) ?? 'Sem título';
        dealCount[titulo] = (dealCount[titulo] ?? 0) + 1;
      });
      const topDeals = Object.entries(dealCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([titulo, resgates]) => ({ titulo, resgates }));
      setResgates({ total: allResgates.length, mes: resgatesMes.length, topDeals });

      // Parceiros
      const { data: parcData } = await supabase
        .from('parceiros_mais_vanta')
        .select('id, nome, ativo, resgates_mes_usados');

      const allParc = parcData ?? [];
      const inativos = allParc.filter(p => !(p as Record<string, unknown>).ativo).length;
      const ranking = allParc
        .filter(p => (p as Record<string, unknown>).ativo)
        .sort(
          (a, b) =>
            ((b as Record<string, unknown>).resgates_mes_usados as number) -
            ((a as Record<string, unknown>).resgates_mes_usados as number),
        )
        .slice(0, 5)
        .map(p => ({
          nome: (p as Record<string, unknown>).nome as string,
          resgates: (p as Record<string, unknown>).resgates_mes_usados as number,
        }));
      setParceiros({ total: allParc.length, ranking, inativos });

      // Receita
      const { data: assData } = await supabase
        .from('assinaturas_mais_vanta')
        .select('id, status, valor_mensal')
        .eq('status', 'ATIVA');

      const ativas = assData ?? [];
      const valorTotal = ativas.reduce((sum, a) => sum + Number((a as Record<string, unknown>).valor_mensal ?? 0), 0);
      setReceita({ assinaturasAtivas: ativas.length, valorTotal });

      // Engajamento
      const memberIds = ativos.map(m => (m as Record<string, unknown>).id as string);
      const membrosComResgate = new Set(allResgates.map(r => (r as Record<string, unknown>).id as string));
      const nuncaResgatou = memberIds.filter(id => !membrosComResgate.has(id)).length;
      const mediaResgatesMembro = ativos.length > 0 ? allResgates.length / ativos.length : 0;
      setEngajamento({ nuncaResgatou, mediaResgatesMembro });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const KpiCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
  }> = ({ icon, label, value, sub }) => (
    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-white font-bold text-xl">{value}</p>
      {sub && <p className="text-zinc-400 text-[0.5625rem] mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button onClick={onBack} className="p-1.5 text-zinc-400 active:text-white" aria-label="Voltar">
          <ArrowLeft size="1rem" />
        </button>
        <BarChart3 size="0.875rem" className="text-[#FFD300]" />
        <h1 className="text-white font-bold text-sm">Analytics MAIS VANTA</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Membros */}
            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Users size="0.625rem" /> Membros
              </p>
              <div className="grid grid-cols-3 gap-2">
                <KpiCard
                  icon={<Users size="0.75rem" className="text-[#FFD300]" />}
                  label="Total"
                  value={membros?.ativos ?? 0}
                  sub={`de ${membros?.total ?? 0} registrados`}
                />
                <KpiCard
                  icon={<TrendingUp size="0.75rem" className="text-green-500" />}
                  label="Novos (mês)"
                  value={membros?.novosMes ?? 0}
                />
                <KpiCard
                  icon={<Crown size="0.75rem" className="text-[#FFD300]" />}
                  label="Por nível"
                  value=""
                  sub={
                    Object.entries(membros?.porTier ?? {})
                      .map(([t, n]) => `${t}: ${n}`)
                      .join(', ') || 'Nenhum'
                  }
                />
              </div>
            </div>

            {/* Resgates */}
            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShoppingCart size="0.625rem" /> Resgates
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <KpiCard
                  icon={<ShoppingCart size="0.75rem" className="text-green-500" />}
                  label="Total"
                  value={resgates?.total ?? 0}
                />
                <KpiCard
                  icon={<TrendingUp size="0.75rem" className="text-[#FFD300]" />}
                  label="Este mês"
                  value={resgates?.mes ?? 0}
                />
              </div>
              {(resgates?.topDeals?.length ?? 0) > 0 && (
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3">
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">Top Deals</p>
                  {resgates?.topDeals.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-white text-[0.625rem] truncate flex-1 mr-2">{d.titulo}</span>
                      <span className="text-[#FFD300] text-[0.625rem] font-bold shrink-0">{d.resgates}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parceiros */}
            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Store size="0.625rem" /> Parceiros
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <KpiCard
                  icon={<Store size="0.75rem" className="text-purple-400" />}
                  label="Total"
                  value={parceiros?.total ?? 0}
                  sub={`${parceiros?.inativos ?? 0} inativos`}
                />
                <KpiCard
                  icon={<AlertCircle size="0.75rem" className="text-red-400" />}
                  label="Inativos"
                  value={parceiros?.inativos ?? 0}
                />
              </div>
              {(parceiros?.ranking?.length ?? 0) > 0 && (
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-3">
                  <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2">
                    Ranking (resgates/mês)
                  </p>
                  {parceiros?.ranking.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-white text-[0.625rem] truncate flex-1 mr-2">
                        <span className="text-zinc-400 mr-1">#{i + 1}</span> {p.nome}
                      </span>
                      <span className="text-purple-400 text-[0.625rem] font-bold shrink-0">{p.resgates}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Receita */}
            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <DollarSign size="0.625rem" /> Receita
              </p>
              <div className="grid grid-cols-2 gap-2">
                <KpiCard
                  icon={<DollarSign size="0.75rem" className="text-green-500" />}
                  label="Assinaturas ativas"
                  value={receita?.assinaturasAtivas ?? 0}
                />
                <KpiCard
                  icon={<TrendingUp size="0.75rem" className="text-[#FFD300]" />}
                  label="Receita mensal"
                  value={`R$ ${(receita?.valorTotal ?? 0).toFixed(2)}`}
                />
              </div>
            </div>

            {/* Engajamento */}
            <div>
              <p className="text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp size="0.625rem" /> Engajamento
              </p>
              <div className="grid grid-cols-2 gap-2">
                <KpiCard
                  icon={<AlertCircle size="0.75rem" className="text-yellow-500" />}
                  label="Nunca resgatou"
                  value={engajamento?.nuncaResgatou ?? 0}
                  sub="membros inativos"
                />
                <KpiCard
                  icon={<ShoppingCart size="0.75rem" className="text-green-500" />}
                  label="Média/membro"
                  value={(engajamento?.mediaResgatesMembro ?? 0).toFixed(1)}
                  sub="resgates por membro"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
