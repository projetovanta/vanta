# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Painel Administrativo

## Arquivos Principais
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/AdminGateway.tsx` | ~296 | Gate de entrada — RPC get_admin_access |
| `features/admin/AdminDashboardView.tsx` | 654 | Container — sidebar + subviews |
| `features/admin/components/AdminDashboardHome.tsx` | 749 | Home com KPIs + gráficos |
| `features/admin/components/AdminSidebar.tsx` | 423 | Navegação lateral por role |
| `features/admin/components/KpiCards.tsx` | 144 | Cards de métricas |

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

## AdminDashboardHome
- KPIs: comunidades, eventos, membros, vendas, lucro VANTA
- Gráficos: VantaPieChart, vendas acumuladas, pico vendas
- Período selecionável: HOJE, SEMANA, MES, ANO
- Master: métricas globais. Comunidade: métricas filtradas
