import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Eye, Zap, Users, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../../services/supabaseClient';
import { VantaPieChart, type PieSlice } from '../components/VantaPieChart';
import { TYPOGRAPHY } from '../../../constants';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeeklyData {
  week: string;
  opens: number;
  users: number;
  perUser: number;
}
interface DiscoveryRow {
  evento_nome: string;
  views: number;
  opens: number;
  converted: number;
  rate: number;
}
interface FunnelStep {
  label: string;
  value: number;
  rate: string;
}
interface MonthlyEventsData {
  month: string;
  avg: number;
}

const TOOLTIP_STYLE = { background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 };

// ── Helpers ───────────────────────────────────────────────────────────────────
function weekLabel(d: string) {
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
}

function badge(val: number, thresholds: [number, string, string][]) {
  for (const [t, label, color] of thresholds) {
    if (val < t) return { label, color };
  }
  return { label: thresholds[thresholds.length - 1][1], color: thresholds[thresholds.length - 1][2] };
}

// ── Main View ─────────────────────────────────────────────────────────────────
export const ProductAnalyticsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [weeklyUsage, setWeeklyUsage] = useState<WeeklyData[]>([]);
  const [discoveryRows, setDiscoveryRows] = useState<DiscoveryRow[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [monthlyEvents, setMonthlyEvents] = useState<MonthlyEventsData[]>([]);
  const [pmfSlices, setPmfSlices] = useState<PieSlice[]>([]);
  const [pmfTotal, setPmfTotal] = useState(0);
  const [pmfMuito, setPmfMuito] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [wau, setWau] = useState(0);
  const [browseOnlyPct, setBrowseOnlyPct] = useState(0);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadFrequency(), loadDiscovery(), loadFunnel(), loadMonthlyEvents(), loadPmf()]);
    setLoading(false);
  }

  // ── Bloco 1: Frequência de Uso ──────────────────────────────────────────
  async function loadFrequency() {
    const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const [analytics, profiles] = await Promise.all([
      supabase
        .from('analytics_events')
        .select('user_id, created_at')
        .eq('event_type', 'APP_OPEN')
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(2000),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const total = profiles.count ?? 1;
    setTotalUsers(profiles.count ?? 0);
    const rows = analytics.data ?? [];

    // Agrupar por semana ISO
    const byWeek = new Map<string, Set<string>>();
    const countByWeek = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!byWeek.has(key)) byWeek.set(key, new Set());
      byWeek.get(key)!.add(r.user_id);
      countByWeek.set(key, (countByWeek.get(key) ?? 0) + 1);
    }

    const weeks: WeeklyData[] = [];
    for (const [week, users] of byWeek) {
      const opens = countByWeek.get(week) ?? 0;
      weeks.push({ week, opens, users: users.size, perUser: +(opens / Math.max(total, 1)).toFixed(2) });
    }
    weeks.sort((a, b) => a.week.localeCompare(b.week));
    setWeeklyUsage(weeks.slice(-12));

    // WAU = users da última semana
    const lastWeek = weeks[weeks.length - 1];
    setWau(lastWeek?.users ?? 0);

    // Browse-only: % de APP_OPEN sem ticket/presença na mesma semana
    if (lastWeek) {
      const weekEnd = new Date(lastWeek.week);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const tickets = await supabase // audit-ok: presencas são locais, só tickets no DB
        .from('tickets_caixa')
        .select('owner_id')
        .gte('criado_em', lastWeek.week)
        .lt('criado_em', weekEnd.toISOString().slice(0, 10));
      const activeUserIds = new Set((tickets.data ?? []).map(t => t.owner_id));
      const browseOnly = [...(lastWeek ? (byWeek.get(lastWeek.week) ?? []) : [])].filter(
        uid => !activeUserIds.has(uid),
      );
      const lastUsers = byWeek.get(lastWeek.week)?.size ?? 1;
      setBrowseOnlyPct(+((browseOnly.length / Math.max(lastUsers, 1)) * 100).toFixed(1));
    }
  }

  // ── Bloco 2: Discovery Rate ─────────────────────────────────────────────
  async function loadDiscovery() {
    const [views, opens, tickets, eventos] = await Promise.all([
      // audit-ok: presencas são locais
      supabase
        .from('analytics_events')
        .select('event_id, user_id')
        .eq('event_type', 'EVENT_VIEW')
        .not('event_id', 'is', null)
        .limit(2000),
      supabase
        .from('analytics_events')
        .select('event_id, user_id')
        .eq('event_type', 'EVENT_OPEN')
        .not('event_id', 'is', null)
        .limit(2000),
      supabase.from('tickets_caixa').select('evento_id, owner_id').limit(2000),
      supabase.from('eventos_admin').select('id, nome').limit(1000),
    ]);

    const nomeMap = new Map((eventos.data ?? []).map(e => [e.id, e.nome]));

    // Contagem por evento
    const viewsByEvento = new Map<string, Set<string>>();
    for (const r of views.data ?? []) {
      if (!viewsByEvento.has(r.event_id)) viewsByEvento.set(r.event_id, new Set());
      viewsByEvento.get(r.event_id)!.add(r.user_id);
    }
    const opensByEvento = new Map<string, Set<string>>();
    for (const r of opens.data ?? []) {
      if (!opensByEvento.has(r.event_id)) opensByEvento.set(r.event_id, new Set());
      opensByEvento.get(r.event_id)!.add(r.user_id);
    }

    // Users que participaram (tickets)
    const participantsByEvento = new Map<string, Set<string>>();
    for (const r of tickets.data ?? []) {
      if (!participantsByEvento.has(r.evento_id)) participantsByEvento.set(r.evento_id, new Set());
      participantsByEvento.get(r.evento_id)!.add(r.owner_id);
    }

    const rows: DiscoveryRow[] = [];
    for (const [eid, viewUsers] of viewsByEvento) {
      const participants = participantsByEvento.get(eid) ?? new Set();
      const discoveredAndAttended = [...participants].filter(uid => viewUsers.has(uid)).length;
      const rate = participants.size > 0 ? +((discoveredAndAttended / participants.size) * 100).toFixed(1) : 0;
      rows.push({
        evento_nome: nomeMap.get(eid) ?? eid.slice(0, 8),
        views: viewUsers.size,
        opens: opensByEvento.get(eid)?.size ?? 0,
        converted: discoveredAndAttended,
        rate,
      });
    }
    rows.sort((a, b) => b.views - a.views);
    setDiscoveryRows(rows.slice(0, 10));
  }

  // ── Bloco 3: Funil Discovery → Attendance ───────────────────────────────
  async function loadFunnel() {
    const [viewsRes, opensRes, ticketsRes, checkinsRes] = await Promise.all([
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'EVENT_VIEW'),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'EVENT_OPEN'),
      supabase.from('tickets_caixa').select('id', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('action', 'TICKET_QUEIMADO'),
    ]);

    const views = viewsRes.count ?? 0;
    const opens = opensRes.count ?? 0;
    const purchases = ticketsRes.count ?? 0;
    const checkins = checkinsRes.count ?? 0;

    const rate = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '—');

    setFunnel([
      { label: 'Impressões', value: views, rate: '100%' },
      { label: 'Aberturas', value: opens, rate: rate(opens, views) },
      { label: 'RSVP/Compra', value: purchases, rate: rate(purchases, opens) },
      { label: 'Check-in', value: checkins, rate: rate(checkins, purchases) },
    ]);
  }

  // ── Bloco 4: Events per User per Month ──────────────────────────────────
  async function loadMonthlyEvents() {
    const { data } = await supabase
      .from('tickets_caixa')
      .select('owner_id, evento_id, criado_em')
      .eq('status', 'USADO')
      .limit(2000);

    const byMonth = new Map<string, Map<string, Set<string>>>();
    for (const r of data ?? []) {
      const month = (r.criado_em as string).slice(0, 7);
      if (!byMonth.has(month)) byMonth.set(month, new Map());
      const userMap = byMonth.get(month)!;
      if (!userMap.has(r.owner_id)) userMap.set(r.owner_id, new Set());
      userMap.get(r.owner_id)!.add(r.evento_id);
    }

    const months: MonthlyEventsData[] = [];
    for (const [month, userMap] of byMonth) {
      const totalEvents = [...userMap.values()].reduce((s, set) => s + set.size, 0);
      const avg = +(totalEvents / Math.max(userMap.size, 1)).toFixed(2);
      months.push({ month, avg });
    }
    months.sort((a, b) => a.month.localeCompare(b.month));
    setMonthlyEvents(months.slice(-12));
  }

  // ── Bloco 5: PMF ───────────────────────────────────────────────────────
  async function loadPmf() {
    const { data } = await supabase.from('pmf_responses').select('response');
    const counts = new Map<string, number>();
    for (const r of data ?? []) {
      counts.set(r.response, (counts.get(r.response) ?? 0) + 1);
    }
    const total = data?.length ?? 0;
    setPmfTotal(total);
    setPmfMuito(counts.get('MUITO_DECEPCIONADO') ?? 0);

    const COLORS: Record<string, string> = {
      MUITO_DECEPCIONADO: '#ef4444',
      POUCO_DECEPCIONADO: '#f59e0b',
      INDIFERENTE: '#6b7280',
    };
    const LABELS: Record<string, string> = {
      MUITO_DECEPCIONADO: 'Muito decepcionado',
      POUCO_DECEPCIONADO: 'Um pouco',
      INDIFERENTE: 'Indiferente',
    };
    setPmfSlices(
      [...counts.entries()].map(([key, val]) => ({
        name: LABELS[key] ?? key,
        value: val,
        color: COLORS[key] ?? '#444',
      })),
    );
  }

  // ── Derived metrics ─────────────────────────────────────────────────────
  const latestPerUser = weeklyUsage[weeklyUsage.length - 1]?.perUser ?? 0;
  const freqBadge = badge(latestPerUser, [
    [0.5, 'Baixo', '#ef4444'],
    [1, 'Médio', '#f59e0b'],
    [2, 'Bom', '#22c55e'],
    [Infinity, 'Forte', '#8b5cf6'],
  ]);

  const latestMonthly = monthlyEvents[monthlyEvents.length - 1]?.avg ?? 0;
  const monthBadge = badge(latestMonthly, [
    [0.2, 'Irrelevante', '#ef4444'],
    [0.4, 'Começando', '#f59e0b'],
    [0.6, 'Forte', '#22c55e'],
    [Infinity, 'Muito forte', '#8b5cf6'],
  ]);

  const pmfPct = pmfTotal > 0 ? +((pmfMuito / pmfTotal) * 100).toFixed(1) : 0;
  const pmfBadge = useMemo(
    () =>
      badge(pmfPct, [
        [20, 'Fraco', '#ef4444'],
        [40, 'Médio', '#f59e0b'],
        [Infinity, 'PMF!', '#22c55e'],
      ]),
    [pmfPct],
  );

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
        <Header title="Product Analytics" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#FFD300]/30 border-t-[#FFD300] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]">
      <Header title="Product Analytics" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* ── Bloco 1: Frequência ─────────────────────────────────── */}
        <Card icon={TrendingUp} title="Frequência de Uso" badge={freqBadge}>
          <div className="flex items-end gap-4 flex-wrap mb-4">
            <Metric label="Aberturas/user/semana" value={latestPerUser.toFixed(2)} />
            <Metric label="WAU" value={wau.toLocaleString('pt-BR')} />
            <Metric label="Total users" value={totalUsers.toLocaleString('pt-BR')} />
            <Metric label="Browse-only" value={`${browseOnlyPct}%`} />
          </div>
          {weeklyUsage.length > 1 && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={weeklyUsage}>
                  <XAxis
                    dataKey="week"
                    tickFormatter={weekLabel}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={weekLabel} />
                  <Line type="monotone" dataKey="perUser" stroke="#FFD300" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ── Bloco 2: Discovery Rate ─────────────────────────────── */}
        <Card icon={Eye} title="Discovery Rate">
          {discoveryRows.length === 0 ? (
            <p className="text-zinc-400 text-xs">Sem dados de discovery ainda</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2 text-[0.625rem] font-bold text-zinc-400 uppercase">
                <span className="col-span-2">Evento</span>
                <span className="text-right">Views</span>
                <span className="text-right">Opens</span>
                <span className="text-right">Conv.</span>
              </div>
              {discoveryRows.map((r, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 text-xs text-zinc-300">
                  <span className="col-span-2 truncate">{r.evento_nome}</span>
                  <span className="text-right">{r.views}</span>
                  <span className="text-right">{r.opens}</span>
                  <span className="text-right text-[#FFD300]">{r.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Bloco 3: Funil ──────────────────────────────────────── */}
        <Card icon={Zap} title="Discovery → Attendance">
          {funnel.length > 0 && (
            <div className="space-y-3">
              {funnel.map((step, i) => {
                const maxVal = funnel[0]?.value || 1;
                const pct = Math.max((step.value / maxVal) * 100, 2);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300">{step.label}</span>
                      <span className="text-[0.625rem] text-zinc-400">
                        {step.value.toLocaleString('pt-BR')} ({step.rate})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFD300] to-[#f59e0b] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Bloco 4: Events per User per Month ──────────────────── */}
        <Card icon={Users} title="Eventos/User/Mês" badge={monthBadge}>
          <div className="flex items-end gap-4 flex-wrap mb-4">
            <Metric label="Média atual" value={latestMonthly.toFixed(2)} />
          </div>
          {monthlyEvents.length > 1 && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={monthlyEvents}>
                  <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="avg" fill="#FFD300" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ── Bloco 5: PMF ────────────────────────────────────────── */}
        <Card icon={Award} title="Product-Market Fit" badge={pmfBadge}>
          <div className="flex items-end gap-4 flex-wrap mb-4">
            <Metric label="% Muito decepcionado" value={`${pmfPct}%`} />
            <Metric label="Respostas" value={pmfTotal.toLocaleString('pt-BR')} />
          </div>
          {pmfSlices.length > 0 ? (
            <VantaPieChart data={pmfSlices} height={140} />
          ) : (
            <p className="text-zinc-400 text-xs">Sem respostas PMF ainda</p>
          )}
        </Card>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
      <button aria-label="Voltar" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
        <ArrowLeft size="1.125rem" className="text-zinc-400" />
      </button>
      <h1 style={{ ...TYPOGRAPHY.screenTitle, fontSize: '0.875rem' }}>{title}</h1>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  badge: b,
  children,
}: {
  icon: React.FC<{ size?: number; className?: string }>;
  title: string;
  badge?: { label: string; color: string };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size="1rem" className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-300">{title}</span>
        </div>
        {b && (
          <span
            className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full"
            style={{ color: b.color, backgroundColor: `${b.color}20` }}
          >
            {b.label}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.625rem] text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
