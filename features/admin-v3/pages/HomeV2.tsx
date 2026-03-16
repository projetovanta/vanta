import React from 'react';
import {
  Banknote,
  Users,
  Calendar,
  Star,
  ArrowUpRight,
  Bell,
  Crown,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Clock,
  XCircle,
} from 'lucide-react';
import { MOCK_KPIS, MOCK_PENDENCIAS, MOCK_VENDAS_SEMANA, MOCK_ACOES_RAPIDAS } from '../mock/mockData';

const ICON_MAP: Record<string, typeof Banknote> = { Calendar, Bell, Star, Banknote };
const fmtBrl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

interface Props {
  onNavigate: (view: string) => void;
}

export const HomeV2: React.FC<Props> = ({ onNavigate }) => {
  // Mock de alertas (condicional — só aparece quando tem)
  const alertas = [
    {
      tipo: 'vermelho' as const,
      msg: 'Um cliente contestou uma cobrança',
      sub: 'Evento Neon Party · R$ 120',
      acao: 'Ver detalhes',
    },
    {
      tipo: 'amarelo' as const,
      msg: 'Saque esperando aprovação há 2 dias',
      sub: 'Casa Noturna X · R$ 2.400',
      acao: 'Resolver',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
      {/* Saudação */}
      <div>
        <p className="text-zinc-400 text-sm">Bom dia,</p>
        <h1 className="text-2xl font-serif italic text-white">Daniel</h1>
      </div>

      {/* ── ALERTAS — só aparece se tem algo urgente ── */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <button
              key={i}
              className={`w-full flex items-start gap-3 p-4 rounded-xl text-left active:scale-[0.99] transition-all ${
                a.tipo === 'vermelho'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <AlertTriangle
                size="1rem"
                className={`shrink-0 mt-0.5 ${a.tipo === 'vermelho' ? 'text-red-400' : 'text-amber-400'}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.tipo === 'vermelho' ? 'text-red-300' : 'text-amber-300'}`}>
                  {a.msg}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{a.sub}</p>
              </div>
              <span
                className={`text-xs font-bold shrink-0 ${a.tipo === 'vermelho' ? 'text-red-400' : 'text-amber-400'}`}
              >
                {a.acao}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── SEUS NÚMEROS — headline que responde "como tá?" em 3 segundos ── */}
      <div>
        <p className="text-[0.625rem] text-zinc-500 uppercase tracking-widest font-bold mb-3">Seus números de hoje</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Quanto você ganhou */}
          <button
            onClick={() => onNavigate('FINANCEIRO')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Banknote size="1rem" className="text-emerald-400" />
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp size="0.625rem" />
                  <span className="text-[0.5rem] font-bold">+12%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-white">{fmtBrl(MOCK_KPIS.receitaHoje)}</p>
              <p className="text-[0.625rem] text-zinc-500 mt-1">Sua receita hoje</p>
            </div>
          </button>

          {/* Quantas vendas */}
          <button
            onClick={() => onNavigate('EVENTOS')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Calendar size="1rem" className="text-purple-400" />
                <div className="flex items-center gap-1 text-purple-400">
                  <TrendingUp size="0.625rem" />
                  <span className="text-[0.5rem] font-bold">+8%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-white">{MOCK_KPIS.vendasHoje}</p>
              <p className="text-[0.625rem] text-zinc-500 mt-1">Ingressos vendidos</p>
            </div>
          </button>

          {/* Membros esperando aprovação */}
          <button
            onClick={() => onNavigate('MAIS_VANTA')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
            style={{ background: 'rgba(255,211,0,0.03)', border: '1px solid rgba(255,211,0,0.1)' }}
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Crown size="1rem" className="text-[#FFD300]" />
                <span className="px-2 py-0.5 bg-[#FFD300] text-black text-[0.5rem] font-black rounded-full">
                  {MOCK_KPIS.membrosPendentes} novos
                </span>
              </div>
              <p className="text-xl font-bold text-[#FFD300]">{MOCK_KPIS.membrosPendentes}</p>
              <p className="text-[0.625rem] text-zinc-500 mt-1">Querem ser membros</p>
            </div>
          </button>

          {/* Pessoas no evento */}
          <button
            onClick={() => onNavigate('PORTARIA')}
            className="relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.98] transition-all group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Users size="1rem" className="text-cyan-400" />
                <ArrowUpRight size="0.75rem" className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </div>
              <p className="text-xl font-bold text-white">{MOCK_KPIS.checkinsHoje}</p>
              <p className="text-[0.625rem] text-zinc-500 mt-1">Pessoas nos eventos</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── COMO ESTÃO AS VENDAS — gráfico simples ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-zinc-300">Como foram as vendas essa semana</p>
          <p className="text-sm font-bold text-emerald-400">{fmtBrl(MOCK_KPIS.receitaSemana)}</p>
        </div>
        <div className="flex items-end gap-2 h-24">
          {MOCK_VENDAS_SEMANA.map(d => {
            const max = Math.max(...MOCK_VENDAS_SEMANA.map(v => v.valor));
            const pct = (d.valor / max) * 100;
            return (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md transition-all duration-200 hover:shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                  style={{
                    height: `${pct}%`,
                    minHeight: 4,
                    background: 'linear-gradient(to top, rgba(52,211,153,0.4), rgba(52,211,153,0.1))',
                  }}
                />
                <span className="text-[0.5rem] text-zinc-600 font-medium">{d.dia}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DE ONDE VEM SEU DINHEIRO — pizza visual ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por comunidade */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-sm font-medium text-zinc-300 mb-4">De onde vem seu dinheiro</p>
          <div className="flex items-center gap-4">
            {/* Mini donut CSS */}
            <div
              className="w-24 h-24 shrink-0 rounded-full relative"
              style={{
                background: `conic-gradient(#34D399 0% 45%, #A78BFA 45% 75%, #FFD300 75% 90%, #F472B6 90% 100%)`,
              }}
            >
              <div className="absolute inset-3 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                <span className="text-xs font-bold text-white">8</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { nome: 'Club Noite', pct: 45, cor: '#34D399' },
                { nome: 'Bar Rooftop', pct: 30, cor: '#A78BFA' },
                { nome: 'Espaço Hall', pct: 15, cor: '#FFD300' },
                { nome: 'Outros', pct: 10, cor: '#F472B6' },
              ].map(c => (
                <div key={c.nome} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                  <span className="text-xs text-zinc-400 flex-1 truncate">{c.nome}</span>
                  <span className="text-xs font-bold text-zinc-300">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Como as pessoas compram */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-sm font-medium text-zinc-300 mb-4">Como as pessoas compram</p>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 shrink-0 rounded-full relative"
              style={{ background: `conic-gradient(#34D399 0% 62%, #A78BFA 62% 85%, #FFD300 85% 100%)` }}
            >
              <div className="absolute inset-3 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                <span className="text-[0.5rem] font-bold text-zinc-400">{MOCK_KPIS.vendasHoje}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { nome: 'Pelo app', pct: 62, cor: '#34D399' },
                { nome: 'Na portaria', pct: 23, cor: '#A78BFA' },
                { nome: 'Lista / Cortesia', pct: 15, cor: '#FFD300' },
              ].map(c => (
                <div key={c.nome} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                  <span className="text-xs text-zinc-400 flex-1 truncate">{c.nome}</span>
                  <span className="text-xs font-bold text-zinc-300">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SAÚDE DO NEGÓCIO — semáforos em linguagem simples ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-sm font-medium text-zinc-300 mb-4">Saúde do negócio</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Devoluções', value: '2,1%', ok: true, desc: 'Tá tranquilo — poucos pedidos de devolução' },
            { label: 'Contestações', value: '0,3%', ok: true, desc: 'Ótimo — quase ninguém contesta' },
            { label: 'Valor médio', value: 'R$ 47', ok: false, desc: 'Caiu 8% em relação ao mês passado' },
            {
              label: 'Comunidades ativas',
              value: String(MOCK_KPIS.comunidades),
              ok: true,
              desc: 'Todas com eventos recentes',
            },
          ].map(s => (
            <div key={s.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/2">
              {s.ok ? (
                <CheckCircle size="0.875rem" className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <TrendingDown size="0.875rem" className="text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[0.625rem] text-zinc-500">{s.label}</p>
                </div>
                <p className="text-[0.5rem] text-zinc-600 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── O QUE PRECISA DA SUA ATENÇÃO — pendências em linguagem humana ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-zinc-300">Precisa da sua atenção</p>
          <button onClick={() => onNavigate('PENDENCIAS')} className="text-[0.625rem] text-[#FFD300] font-bold">
            Ver tudo
          </button>
        </div>
        <div className="space-y-1.5">
          {MOCK_PENDENCIAS.map((p, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left hover:bg-white/3 transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  p.tipo === 'curadoria' ? 'bg-[#FFD300]' : p.tipo === 'evento' ? 'bg-purple-400' : 'bg-emerald-400'
                }`}
              />
              <p className="text-sm text-zinc-300 flex-1 truncate">{p.label}</p>
              <p className="text-[0.5rem] text-zinc-600 shrink-0">{p.tempo}</p>
              <ChevronRight size="0.75rem" className="text-zinc-700 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── ATALHOS — o que você faz sempre ── */}
      <div>
        <p className="text-[0.625rem] text-zinc-500 uppercase tracking-widest font-bold mb-3">Atalhos</p>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_ACOES_RAPIDAS.map(a => {
            const Icon = ICON_MAP[a.icon] ?? Calendar;
            return (
              <button
                key={a.route}
                onClick={() => onNavigate(a.route)}
                className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 hover:border-[#FFD300]/20 rounded-xl px-4 py-3 active:scale-[0.97] transition-all"
              >
                <Icon size="1rem" className="text-[#FFD300] shrink-0" />
                <span className="text-xs text-zinc-300 font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PRÓXIMOS 30 DIAS — projeção simples ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-sm font-medium text-zinc-300 mb-3">Próximos 30 dias</p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{fmtBrl(67000)}</p>
            <p className="text-[0.625rem] text-zinc-500 mt-1">Receita estimada</p>
          </div>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFD300]/60 to-[#FFD300] rounded-full"
              style={{ width: '42%' }}
            />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-zinc-400">12</p>
            <p className="text-[0.625rem] text-zinc-600">eventos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
