import React from 'react';
import {
  Banknote,
  Users,
  Calendar,
  Star,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  CheckCircle,
  ArrowUpRight,
  Bell,
  Crown,
} from 'lucide-react';
import { MOCK_KPIS, MOCK_PENDENCIAS, MOCK_VENDAS_SEMANA, MOCK_ACOES_RAPIDAS } from '../mock/mockData';

const ICON_MAP: Record<string, typeof Banknote> = {
  Calendar,
  Bell,
  Star,
  Banknote,
};

const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

interface Props {
  onNavigate: (view: string) => void;
}

export const HomeV2: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-zinc-400 text-sm">Bom dia,</p>
        <h1 className="text-2xl font-serif italic text-white">Daniel</h1>
      </div>

      {/* KPI Cards — 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('FINANCEIRO_MASTER')}
          className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <Banknote size="1.125rem" className="text-emerald-400" />
            <ArrowUpRight size="0.75rem" className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </div>
          <p className="text-xl font-bold text-white">{fmtBrl(MOCK_KPIS.receitaHoje)}</p>
          <p className="text-[0.625rem] text-zinc-500 uppercase tracking-wider font-bold">Receita hoje</p>
        </button>

        <button
          onClick={() => onNavigate('MEMBROS_GLOBAIS_MV')}
          className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <Users size="1.125rem" className="text-[#FFD300]" />
            <ArrowUpRight size="0.75rem" className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
          </div>
          <p className="text-xl font-bold text-white">{MOCK_KPIS.membrosAtivos}</p>
          <p className="text-[0.625rem] text-zinc-500 uppercase tracking-wider font-bold">Membros MV</p>
        </button>

        <button
          onClick={() => onNavigate('CURADORIA_MV')}
          className="bg-[#FFD300]/5 border border-[#FFD300]/15 rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <Star size="1.125rem" className="text-[#FFD300]" />
            <span className="px-2 py-0.5 bg-[#FFD300] text-black text-[0.5rem] font-black rounded-full">
              {MOCK_KPIS.membrosPendentes}
            </span>
          </div>
          <p className="text-xl font-bold text-[#FFD300]">{MOCK_KPIS.membrosPendentes}</p>
          <p className="text-[0.625rem] text-zinc-500 uppercase tracking-wider font-bold">Curadoria pendente</p>
        </button>

        <button
          onClick={() => onNavigate('PENDENTES')}
          className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <Calendar size="1.125rem" className="text-purple-400" />
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[0.5rem] font-black rounded-full">
              {MOCK_KPIS.eventosPendentes}
            </span>
          </div>
          <p className="text-xl font-bold text-white">{MOCK_KPIS.eventosPendentes}</p>
          <p className="text-[0.625rem] text-zinc-500 uppercase tracking-wider font-bold">Eventos pendentes</p>
        </button>
      </div>

      {/* Gráfico vendas semana (barras simples) */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Vendas esta semana</h3>
          <span className="text-[#FFD300] text-sm font-bold">{fmtBrl(MOCK_KPIS.receitaSemana)}</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {MOCK_VENDAS_SEMANA.map(d => {
            const max = Math.max(...MOCK_VENDAS_SEMANA.map(v => v.valor));
            const pct = (d.valor / max) * 100;
            return (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#FFD300]/20 rounded-t-lg transition-all hover:bg-[#FFD300]/40"
                  style={{ height: `${pct}%`, minHeight: 4 }}
                />
                <span className="text-[0.5rem] text-zinc-500 font-bold">{d.dia}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <h3 className="text-[0.625rem] text-zinc-400 uppercase tracking-widest font-bold mb-3">Ações rápidas</h3>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_ACOES_RAPIDAS.map(a => {
            const Icon = ICON_MAP[a.icon] ?? Calendar;
            return (
              <button
                key={a.route}
                onClick={() => onNavigate(a.route)}
                className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 rounded-xl px-4 py-3 active:scale-[0.97] transition-all"
              >
                <Icon size="1rem" className="text-[#FFD300] shrink-0" />
                <span className="text-xs text-zinc-300 font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pendências recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.625rem] text-zinc-400 uppercase tracking-widest font-bold">Pendências</h3>
          <button onClick={() => onNavigate('PENDENCIAS_HUB')} className="text-[0.625rem] text-[#FFD300] font-bold">
            Ver todas
          </button>
        </div>
        <div className="space-y-2">
          {MOCK_PENDENCIAS.slice(0, 4).map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-3">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  p.tipo === 'curadoria' ? 'bg-[#FFD300]' : p.tipo === 'evento' ? 'bg-purple-400' : 'bg-emerald-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">{p.label}</p>
                <p className="text-[0.5rem] text-zinc-600">{p.tempo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{MOCK_KPIS.vendasHoje}</p>
          <p className="text-[0.5rem] text-zinc-500 uppercase tracking-wider font-bold">Vendas hoje</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{MOCK_KPIS.checkinsHoje}</p>
          <p className="text-[0.5rem] text-zinc-500 uppercase tracking-wider font-bold">Check-ins</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{MOCK_KPIS.comunidades}</p>
          <p className="text-[0.5rem] text-zinc-500 uppercase tracking-wider font-bold">Comunidades</p>
        </div>
      </div>
    </div>
  );
};
