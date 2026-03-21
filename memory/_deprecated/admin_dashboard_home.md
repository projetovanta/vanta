# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Admin Dashboard Home

## Arquivo
- `features/admin/components/AdminDashboardHome.tsx` (749L)

## Props
- tenantTipo, tenantId, adminRole, currentUserId, addNotification, onNavigate, onBack

## KPIs (via dashboardAnalyticsService)
- Comunidades (ativas)
- Eventos (total)
- Membros novos (período)
- Membros curados (MAIS VANTA)
- Venda convites (total)
- Lucro VANTA (via transactions: valor_bruto - valor_liquido)

## Período selecionável
HOJE | SEMANA | MES | ANO — MetricaPar com {atual, anterior}

## Gráficos
- VantaPieChart: distribuição vendas
- Vendas acumuladas (LineChart)
- Pico de vendas por horário

## Master vs Comunidade
- Master (Visão Global): métricas de TODA plataforma
- Comunidade: métricas filtradas por tenantId

## Componentes usados
- `KpiCards` — cards com formatValue/prefix
- `VantaPieChart` — pie chart customizado
- `AdminSidebar` — importado para navegação
