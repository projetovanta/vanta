import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Wallet, ArrowDownCircle, Percent, Receipt, Users } from 'lucide-react';
import type { ResumoFinanceiro } from '../services/eventosAdminFinanceiro';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  resumo: ResumoFinanceiro;
  titulo?: string;
  loading?: boolean;
}

const Row: React.FC<{ label: string; value: string; icon: React.ElementType; accent?: boolean; muted?: boolean }> = ({
  label,
  value,
  icon: Icon,
  accent,
  muted,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={13} className={accent ? 'text-[#FFD300]' : muted ? 'text-zinc-700' : 'text-zinc-400'} />
      <p className={`text-[11px] font-semibold truncate ${muted ? 'text-zinc-400' : 'text-zinc-400'}`}>{label}</p>
    </div>
    <p
      className={`text-[12px] font-black tabular-nums shrink-0 ${accent ? 'text-[#FFD300]' : muted ? 'text-zinc-400' : 'text-white'}`}
    >
      {value}
    </p>
  </div>
);

export const ResumoFinanceiroCard: React.FC<Props> = ({ resumo: r, titulo = 'Resumo Financeiro', loading }) => {
  if (loading) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-3 w-32 bg-zinc-800 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-zinc-800/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
      <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.2em] mb-3">{titulo}</p>

      <div className="divide-y divide-white/5">
        <Row
          label="Receita Bruta (ingressos)"
          value={fmtBRL(r.receitaBruta - r.receitaListas)}
          icon={DollarSign}
          accent
        />
        {r.receitaListas > 0 && <Row label="Receita Listas Pagas" value={fmtBRL(r.receitaListas)} icon={Receipt} />}
        <Row label="Receita Total" value={fmtBRL(r.receitaBruta)} icon={DollarSign} accent />
        {r.custoGateway > 0 && (
          <Row label="Custo Gateway (absorvido)" value={`-${fmtBRL(r.custoGateway)}`} icon={CreditCard} muted />
        )}
        <Row label="Receita Liquida" value={fmtBRL(r.receitaLiquida)} icon={TrendingUp} />
        <Row label="Taxa VANTA (do comprador)" value={fmtBRL(r.taxaVanta)} icon={Percent} muted />

        {r.splitSocio > 0 && (
          <>
            <Row label="Split Produtor" value={fmtBRL(r.splitProdutor)} icon={Users} />
            <Row label="Split Socio" value={fmtBRL(r.splitSocio)} icon={Users} />
          </>
        )}

        <div className="pt-1" />
        <Row label={`${r.totalVendidos} vendidos · Ticket medio`} value={fmtBRL(r.ticketMedio)} icon={Receipt} />
        {r.saquesProcessados > 0 && (
          <Row label="Saques concluidos" value={`-${fmtBRL(r.saquesProcessados)}`} icon={ArrowDownCircle} muted />
        )}
        {r.saquesPendentes > 0 && (
          <Row label="Saques pendentes" value={`-${fmtBRL(r.saquesPendentes)}`} icon={ArrowDownCircle} muted />
        )}
        <Row label="Saldo disponivel" value={fmtBRL(r.saldoDisponivel)} icon={Wallet} accent />
      </div>
    </div>
  );
};
