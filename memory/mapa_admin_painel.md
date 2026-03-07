# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Painel Admin

## Fluxo de Acesso
1. App.tsx verifica `role !== guest && accessNodes.length > 0` → mostra aba admin
2. AdminGateway.tsx → RPC `get_admin_access` retorna comunidades/eventos do user
3. Seleção de comunidade → AdminDashboardView
4. AdminDashboardView → AdminDashboardHome (KPIs) + AdminSidebar (navegação) + SubViews

## Arquivos Principais
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/AdminGateway.tsx` | ~296 | Gate de entrada — RPC + seleção comunidade |
| `features/admin/AdminDashboardView.tsx` | 654 | Container principal — sidebar + subviews |
| `features/admin/components/AdminDashboardHome.tsx` | 749 | Dashboard home — KPIs + gráficos |
| `features/admin/components/AdminSidebar.tsx` | 423 | Sidebar com seções por role |
| `features/admin/components/KpiCards.tsx` | 144 | Cards de KPIs |
| `features/admin/permissoes.ts` | 240 | Guards de permissão (canAccess*, isSocio, etc) |

## Gate (AdminGateway)
- Usa RPC `get_admin_access(p_user_id)` — 1 query retorna role + comunidades + eventos
- `accessData === null` → spinner
- `comunidades.length === 0 && !isMaster` → "Sem atribuições"
- Services Fase 2 (cortesias, eventos, listas, clube, assinatura, config) carregam em background APÓS gate

## Sidebar — Seções por Role
- Master: Dashboard, Curadoria, Comunidades, Indica, Notificações, etc
- Gerente/Sócio: seções de comunidade (Pedidos, Cupons, Equipe, Participantes, etc)

## SubViews
Definidas em `AdminSubView` type no AdminSidebar.tsx

## Memórias Relacionadas
- Guards e permissões: `permissoes_rbac.md`
- Services do admin: `services_admin.md`
- Dashboard home KPIs: `admin_dashboard_home.md`
