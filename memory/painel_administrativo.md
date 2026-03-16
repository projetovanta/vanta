# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-16
# Memória — Painel Administrativo

## Arquivos Principais
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/AdminGateway.tsx` | ~317 | Gate de entrada — RPC get_admin_access |
| `features/admin/AdminDashboardView.tsx` | ~910 | Container — sidebar + subviews (admin principal) |
| `features/admin/components/AdminDashboardHome.tsx` | ~802 | Home com KPIs + gráficos |
| `features/admin/components/AdminSidebar.tsx` | ~590 | Navegação lateral por role |
| `features/admin/components/KpiCards.tsx` | 144 | Cards de métricas |

## Protótipos visuais (referência, NÃO substituem admin)
| Rota | Pasta | Descrição |
|---|---|---|
| /admin-v2 | features/admin-v2/ | Sidebar 5 ícones + command palette (mock) |
| /admin-v3 | features/admin-v3/ | 16 itens em 4 seções + views plugadas |

## Fluxo AdminGateway
1. `supabase.rpc('get_admin_access', { p_user_id })` → retorna {role, comunidades, eventos}
2. `accessData === null` → spinner
3. `comunidades.length === 0 && !isMaster` → "Sem atribuições"
4. Lista comunidades → user seleciona → `setConfirmado(destino)`
5. Master tem botão "Visão Global" extra
6. Após confirmação → `AdminDashboardView` com `adminRole` resolvido via dados RPC

## Services carregados em background (Fase 2)
Após gate resolver: rbacService, comunidadesService, cortesiasService, eventosAdminService, listasService, clubeService, assinaturaService, maisVantaConfigService

## AdminDashboardView
- Recebe: onClose, adminNome, adminRole, currentUserId, addNotification, initialTenantId, initialTenantTipo
- Sidebar controla navegação entre subviews
- SubViews renderizadas condicionalmente
- AdminSubView inclui CONDICOES_COMERCIAIS (aceite de condições pro sócio)

## AdminDashboardHome
- KPIs: comunidades, eventos, membros, vendas, lucro VANTA
- Gráficos: VantaPieChart, vendas acumuladas, pico vendas
- Período selecionável: HOJE, SEMANA, MES, ANO
- Master: métricas globais. Comunidade: métricas filtradas

## Dashboard V2 (rota /dashboard-v2) — criado 16/mar
- Rota standalone `/dashboard-v2` — NÃO substitui o painel atual
- Gateway: `features/dashboard-v2/DashboardV2Gateway.tsx` — resolve RBAC via `get_admin_access`
- Home: `features/dashboard-v2/DashboardV2Home.tsx` — layout reorganizado
- Gráfico: `features/dashboard-v2/VendasTimelineChart.tsx` — vendas ao longo do tempo (linha dourada)
- Service: `getVendasTimeline(periodo, comunidadeId?)` em `dashboardAnalyticsService`
- Abas de role no topo (master vê): troca aba e vê como cada cargo vê (ferramenta de dev)
- Ordem: Pendências → Hero financeiro (dourado) → Gráfico vendas → KPIs → Pizza → Resumo financeiro → MV → Ações

## AdminViewHeader (componente padronizado — 16/mar)
- Arquivo: `features/admin/components/AdminViewHeader.tsx`
- Props: title, subtitle, kicker, onBack, actions[], badge, badgeColor
- Padrão: voltar ← esquerda, título centro, ações direita, backdrop-blur, touch 44px+
- 44 views migradas — TODAS usam AdminViewHeader
- Exceção: GerenteDashboardView (layout hero com foto)

## Panorama "Caixa de Entrada" (Dashboard V2 — 16/mar)
- Tela inicial do /dashboard-v2 quando NÃO tem contexto ativo
- Mostra: pendências consolidadas + cards por negócio + operação do dia
- Toque num card → entra no contexto (sidebar + home por cargo)
- "← Panorama" no header pra voltar
- Componente: `features/dashboard-v2/homes/PanoramaHome.tsx`

## Decisão Dan (sessão 16/mar): NÃO simplificar o painel
- Sidebar completa com todas as seções por role (AdminSidebar)
- Dashboard home impactante — empresário vê tudo de cara
- V2/V3 ficam como referência visual, NÃO substituem
- Painel master continua igual
