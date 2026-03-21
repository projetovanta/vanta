# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Gráficos / KPIs

## Arquivos
- `features/admin/components/KpiCards.tsx` (144L) — cards KPI com formatValue/prefix
- `features/admin/components/VantaPieChart.tsx` — gráfico pizza customizado
- `features/admin/services/dashboardAnalyticsService.ts` (173L) — dados KPI

## KpiCards
- Recebe array de cards com: label, valor, delta (%), ícone, cor
- `formatValue(v)` → formata número (K, M)
- `prefix` → "R$" para valores monetários

## VantaPieChart
- Props: data (PieSlice[]), onSliceClick?, selectedName?, height?
- PieSlice: {name, value, color}
- Recharts-based donut chart

## PublicoDrilldown (features/admin/views/comunidades/PublicoDrilldown.tsx, 356L)
- Drill-down interativo de publico por origem
- buildPublicoTree(evento, lista) → arvore de niveis
- Niveis: Origem → Lote/Promoter → Variacao/Regra → Pessoas
- Breadcrumb navigation, usa VantaPieChart

## DashboardAnalyticsService
- `getMetrics(periodo, tenantId?)` → DashboardMetrics
- MetricaPar: {atual, anterior} para cálculo de delta
- Períodos: HOJE | SEMANA | MES | ANO
