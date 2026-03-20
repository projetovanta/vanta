import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { fmtBRL } from '../../../utils';
import { EmptyState } from '../../../components/EmptyState';

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  evento_nome: string;
  created_at: string;
}

interface Props {
  eventoIds?: string[];
  comunidadeId?: string;
}

type FiltroTipo = 'TODOS' | 'VENDAS' | 'SAQUES' | 'REEMBOLSOS';

export const ExtratoFinanceiro: React.FC<Props> = ({ eventoIds, comunidadeId }) => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroTipo>('TODOS');

  const eventoIdsKey = useMemo(() => eventoIds?.join(','), [eventoIds]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      const results: Transacao[] = [];

      // Vendas
      let vendaQuery = supabase
        .from('vendas_log')
        .select('id, valor, evento_id, ts')
        .order('ts', { ascending: false })
        .limit(100);

      if (eventoIds?.length) vendaQuery = vendaQuery.in('evento_id', eventoIds);

      const { data: vendas } = await vendaQuery;
      if (vendas) {
        for (const v of vendas) {
          results.push({
            id: v.id,
            tipo: 'VENDA',
            valor: v.valor ?? 0,
            evento_nome: v.evento_id ?? '',
            created_at: v.ts ?? '',
          });
        }
      }

      // Saques
      let saqueQuery = supabase
        .from('solicitacoes_saque')
        .select('id, valor, evento_id, criado_em, status')
        .order('criado_em', { ascending: false })
        .limit(50);

      if (eventoIds?.length) saqueQuery = saqueQuery.in('evento_id', eventoIds);

      const { data: saques } = await saqueQuery;
      if (saques) {
        for (const s of saques) {
          results.push({
            id: s.id,
            tipo: `SAQUE_${s.status}`,
            valor: -(s.valor ?? 0),
            evento_nome: s.evento_id ?? '',
            created_at: s.criado_em ?? '',
          });
        }
      }

      // Reembolsos
      let reembolsoQuery = supabase
        .from('reembolsos')
        .select('id, valor, evento_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventoIds?.length) reembolsoQuery = reembolsoQuery.in('evento_id', eventoIds);

      const { data: reembolsos } = await reembolsoQuery;
      if (reembolsos) {
        for (const r of reembolsos) {
          results.push({
            id: r.id,
            tipo: `REEMBOLSO_${r.status}`,
            valor: -(r.valor ?? 0),
            evento_nome: r.evento_id ?? '',
            created_at: r.created_at ?? '',
          });
        }
      }

      // Ordena por data desc
      results.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));

      if (!cancelled) {
        setTransacoes(results);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventoIds, eventoIdsKey, comunidadeId]);

  const filtered =
    filtro === 'TODOS'
      ? transacoes
      : transacoes.filter(t =>
          filtro === 'VENDAS'
            ? t.tipo === 'VENDA'
            : filtro === 'SAQUES'
              ? t.tipo.startsWith('SAQUE')
              : t.tipo.startsWith('REEMBOLSO'),
        );

  const FILTROS: { id: FiltroTipo; label: string }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'VENDAS', label: 'Vendas' },
    { id: 'SAQUES', label: 'Saques' },
    { id: 'REEMBOLSOS', label: 'Reembolsos' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size="1.25rem" className="text-zinc-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.5625rem] font-black uppercase tracking-widest text-zinc-500">
          <Filter size="0.625rem" className="inline mr-1" />
          Extrato ({filtered.length})
        </p>
        <div className="flex gap-1">
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-2.5 py-1 rounded-full text-[0.5rem] font-bold uppercase tracking-wider transition-all ${
                filtro === f.id ? 'bg-[#FFD300] text-black' : 'bg-zinc-900/60 text-zinc-400 border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Filter} title="Nenhuma transação" subtitle="Não há registros para este filtro." compact />
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto no-scrollbar">
          {filtered.map(t => {
            const isPositive = t.valor >= 0;
            const dt = t.created_at ? new Date(t.created_at) : null;
            const dataStr = dt
              ? `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
              : '';
            const tipoLabel = t.tipo === 'VENDA' ? 'Venda' : t.tipo.startsWith('SAQUE') ? 'Saque' : 'Reembolso';

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2.5 px-3 bg-zinc-900/30 rounded-xl border border-white/5"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
                >
                  {isPositive ? (
                    <ArrowDownRight size="0.75rem" className="text-emerald-400" />
                  ) : (
                    <ArrowUpRight size="0.75rem" className="text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{tipoLabel}</p>
                  <p className="text-zinc-600 text-[0.5rem] truncate">{dataStr}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}
                  {fmtBRL(t.valor)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
