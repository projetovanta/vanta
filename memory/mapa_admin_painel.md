# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Painel Admin

## Fluxo de Acesso
1. App.tsx verifica `role !== guest && accessNodes.length > 0` → mostra aba admin
2. DashboardV2Gateway → RPC `get_admin_access` → panorama + seleção de contexto
3. Seleção de comunidade/evento → contexto ativo com sidebar
4. SubViews carregadas lazy dentro do contexto

## Arquivos Principais
| Arquivo | Função |
|---|---|
| `features/dashboard-v2/DashboardV2Gateway.tsx` | Admin principal — panorama + contexto (sem sessionStorage) |
| `features/dashboard-v2/DashboardV2Home.tsx` | Dashboard home — KPIs + pendências |
| `features/dashboard-v2/components/SidebarV2.tsx` | Sidebar com seções por role |
| `features/dashboard-v2/components/CommandPalette.tsx` | Busca rápida (⌘K) |
| `features/admin/components/AdminDashboardHome.tsx` | Home KPIs + gráficos (usado pelo V2) |
| `features/admin/components/KpiCards.tsx` | Cards de KPIs |
| `features/admin/permissoes.ts` | Guards de permissão (canAccess*, isSocio, etc) |

## Gate (DashboardV2Gateway)
- Usa RPC `get_admin_access(p_user_id)` — 1 query retorna role + comunidades + eventos
- `accessData === null` → spinner
- `comunidades.length === 0 && !isMaster` → "Sem atribuições"
- Services Fase 2 (cortesias, eventos, listas, clube, assinatura, config) carregam em background APÓS gate

## Sidebar — Seções Colapsáveis (chevron ▸/▾, estado localStorage)
**Master global (SIDEBAR_SECTIONS):**
- GERAL: Dashboard, Painel Master (master), Inteligência (#FFD300, master/gerente/socio), Pendências (vermelho), Convites
- GESTÃO: Comunidades, Eventos Pendentes, Categorias, Parcerias, Cargos
- FINANCEIRO: Financeiro, Comprovantes, Relatórios
- MAIS VANTA: Curadoria, Membros, Cidades, Parceiros, Deals, Assinaturas, Passaportes, Infrações, Monitoramento, Config MV
- MARKETING: Vanta Indica, Notificações
- SISTEMA: Analytics, Diagnóstico

**Comunidade (COMMUNITY_SIDEBAR_SECTIONS):**
- GERAL: Dashboard, Pendências, Eventos
- OPERAÇÃO DIA: Scanner QR, Check-in Lista, Caixa, Listas, Cotas
- FINANCEIRO: Financeiro, Relatórios
- MAIS VANTA: Config MV (master) / MAIS VANTA (sócio)
- ADMINISTRAÇÃO: Editar Comunidade, Audit Log

## SubViews
Definidas em `AdminSubView` type no AdminSidebar.tsx

## Memórias Relacionadas
- Guards e permissões: `permissoes_rbac.md`
- Services do admin: `services_admin.md`
- Dashboard home KPIs: `admin_dashboard_home.md`
