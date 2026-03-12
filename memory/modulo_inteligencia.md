# Criado: 2026-03-11 | Ultima edicao: 2026-03-11
# Modulo: Inteligencia VANTA (Motor de Valor)

## Pertence a: painel admin (sidebar "Inteligencia", Lightbulb #FFD300)
## Roles: vanta_masteradm, vanta_gerente, vanta_socio

## Arquitetura: 4 Modulos Desacoplados

### Modulo A — Insights Engine
Service: `features/admin/services/insights/insightsEngine.ts`
Types: `insightsTypes.ts`
- getClientScores(comunidadeId) — VIP Score (gasto×0.4 + freq×0.35 + recencia×0.25)
- getNoShowAnalysis(eventoId) — taxa no-show, custo fantasma, breakdown lote/promoter
- getLotacaoPrevisao(eventoId) — curva horaria prevista (media ponderada historico)
- getChurnRadar(comunidadeId) — clientes em risco (compraram 3+ mas nao nos ultimos 2)
- getTrendAlerts(comunidadeId) — alertas de queda >15% (vendas, publico, receita)

### Modulo B — Financial Intelligence
Service: `features/admin/services/insights/financialIntelligence.ts`
Types: `financialTypes.ts`
- getPricingSuggestion(eventoId) — velocidade vendas vs curva ideal
- calculateSplits(eventoId) — waterfall receita bruta → taxas → splits → liquido
- getBreakEvenProjection(eventoId) — custos vs receita, "faltam X ingressos"

### Modulo C — Operations & Marketing
Service: `features/admin/services/insights/operationsMarketing.ts`
Types: `operationsTypes.ts`
- getChannelAttribution(eventoId) — % por canal (utm_source)
- getEventBuyers(eventoId) — lista compradores unicos
- getClientLoyalty(userId, comunidadeId) — pontos + tier
- getLoyaltyLeaderboard(comunidadeId) — top clientes fieis
- getLoyaltyDistribution(comunidadeId) — distribuicao tiers
- getPurchaseTimeRanking(comunidadeId, periodo) — heatmap dia/hora

### Modulo D — Value Communication
Service: `features/admin/services/insights/valueCommunication.ts`
Types: `valueTypes.ts`
Rules: `smartTipsRules.ts` (~10 regras)
- generateWeeklyReport(comunidadeId) — agregacao semanal A+B
- getVantaValueMetrics(comunidadeId, periodo) — insights gerados, tempo economizado
- getSmartTips(comunidadeId, eventoId?) — dicas baseadas em padroes
- getPlatformBenchmarks() — medias anonimas da plataforma
- getBenchmarkComparison(comunidadeId) — comparacao vs media

## Tabelas (5 migrations)
| Tabela | Migration | Uso |
|---|---|---|
| splits_config | 20260311233000 | Config splits por beneficiario (SOCIO/PROMOTER/ARTISTA/OUTROS) |
| eventos_admin.custos_fixos | 20260311233100 | Coluna NUMERIC(10,2) para break-even |
| relatorios_semanais | 20260311233200 | Historico JSON semanal por comunidade |
| tickets_caixa.utm_source | 20260311233300 | Atribuicao de canal (default ORGANICO) |
| fidelidade_cliente | 20260311233400 | Pontos + tier por user/comunidade |

## Edge Functions
| Funcao | Trigger | Descricao |
|---|---|---|
| weekly-report | pg_cron domingo 10h BRT | Gera relatorio → notif in-app + push |
| send-buyer-notification | Admin manual | Push segmentado para compradores de evento |

## UI — 16 Cards de Insights
Path: `features/admin/components/insights/`
| Componente | Modulo | Dados |
|---|---|---|
| VipScoreCard | A | Top clientes com score |
| NoShowCard | A | % no-show + custo fantasma |
| LotacaoPrevisaoCard | A | Curva horaria prevista |
| ChurnRadarCard | A | Clientes em risco |
| TrendAlertCard | A | Alertas de tendencia |
| PricingSuggestionCard | B | Curva real vs ideal |
| SplitPreviewCard | B | Waterfall splits |
| BreakEvenCard | B | Progresso break-even |
| ChannelAttributionCard | C | Pie chart por canal |
| BuyerCommunicationCard | C | Lista compradores + envio push |
| LoyaltyProgramCard | C | Tiers + leaderboard |
| PurchaseTimeCard | C | Heatmap dia/hora |
| WeeklyReportCard | D | Resumo semanal |
| VantaValuePanel | D | KPIs dourados valor VANTA |
| SmartTipsCard | D | Dicas inteligentes |
| BenchmarkCard | D | Comparacao vs mercado |

## UI — 17 Componentes de Dashboard Reutilizaveis
Path: `features/admin/components/dashboard/`
BarChartCard, BreakdownCard, ComparisonCard, DashboardSkeleton, DrillBreadcrumb,
ExportButton, FunnelChart, HeatmapCard, LeaderboardCard, LivePulse, MetricGrid,
PeriodSelector, ProgressRing, SparklineCard, StatusBadge, TimeSeriesChart, index.ts

## Views
Path: `features/admin/views/insightsDashboard/`
| Arquivo | Descricao |
|---|---|
| index.tsx | Orquestrador — seletor evento + 4 tabs |
| InsightsTab.tsx | Cards A1-A5 |
| FinanceiroTab.tsx | Cards B1-B3 (requer eventoId) |
| OperacoesTab.tsx | Cards C1-C4 |
| ValorTab.tsx | Cards D1-D4 |

## Analytics Services (dashboards por role)
Path: `features/admin/services/analytics/`
| Service | Role | Descricao |
|---|---|---|
| eventAnalyticsService | todos | Metricas por evento |
| communityAnalyticsService | gerente/socio | Metricas por comunidade |
| masterAnalyticsService | masteradm | Metricas globais |
| maisVantaAnalyticsService | masteradm | Metricas MAIS VANTA |
| promoterAnalyticsService | promoter | Metricas promoter |
| staffAnalyticsService | equipe | Metricas equipe |

## Views de Dashboard por Role
Path: `features/admin/views/`
| View | Role |
|---|---|
| masterDashboard/ | masteradm (Overview, Comunidades, Financeiro, Operacoes, Projecao) |
| comunidadeDashboard/ | gerente/socio (Overview, Eventos, Financeiro, Audiencia, Equipe) |
| maisVantaDashboard/ | masteradm (Overview, Tiers, Parceiros, Resgates, Retencao, Financeiro) |
| roleDashboards/ | Caixa, Portaria, Promoter, Socio, GerenteEnhanced |
| eventoDashboard/ | todos (VendasTab, PublicoTab, PromotersTab, OperacoesTab, FinanceiroTab + PreEvento/Operacao/PosEvento) |

## Checklist
| # | Item | Status |
|---|---|---|
| 1 | Services 4 modulos | OK |
| 2 | 16 cards UI | OK |
| 3 | InsightsDashboardView 4 tabs | OK |
| 4 | Sidebar "Inteligencia" | OK |
| 5 | 5 migrations aplicadas | OK |
| 6 | 2 Edge Functions deployed | OK |
| 7 | pg_cron weekly-report | OK |
| 8 | 17 dashboard components | OK |
| 9 | 6 analytics services | OK |
| 10 | Views por role | OK |
