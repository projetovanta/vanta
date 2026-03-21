# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-16
# Memória — Painel Administrativo

## Arquivos Principais
| Arquivo | Função |
|---|---|
| `features/dashboard-v2/DashboardV2Gateway.tsx` | Admin principal — panorama + contexto por comunidade/evento |
| `features/dashboard-v2/DashboardV2Home.tsx` | Home com KPIs + gráficos |
| `features/dashboard-v2/components/SidebarV2.tsx` | Navegação lateral por role |
| `features/dashboard-v2/components/CommandPalette.tsx` | Busca rápida (⌘K) |
| `features/admin/components/AdminDashboardHome.tsx` | Home KPIs (usado pelo V2) |
| `features/admin/components/KpiCards.tsx` | Cards de métricas |

## Admin antigo — REMOVIDO (sessão 3, 18/mar)
- AdminGateway.tsx, AdminDashboardView.tsx, CaixaDash, PortariaListaDash, PortariaQRDash, SocioDash deletados
- Dashboard V2 é o único admin ativo (importado como AdminGateway no App.tsx por naming)
- Componentes SidebarV2 e CommandPalette movidos pra features/dashboard-v2/components/

## Melhorias sessão 5 (4 blocos)
- CommandPalette: busca dados reais (eventos, comunidades, membros) no Supabase com debounce 300ms
- AdminViewHeader: prop `breadcrumbs` opcional — aplicado em Financeiro, MasterFinanceiro, Cargos, Eventos
- Deep links admin: hash URL `#admin/VIEW` — navegação direta via URL
- Cargos: CARGO_DESCRICOES + Sócio e Promoter nos pré-definidos (8 cargos)
- PeriodSelector + filtro real por dataInicio nos 2 financeiros
- VendasTimelineChart nos 2 financeiros
- AuditLogView: `initialFilter` + botão Histórico nos financeiros
- VANTA Indica: emoji picker (24), paleta cores (8), badgeColor, templates DB
- Session timeout: 30min inativo = signOut (useSessionTimeout)
- Componentes novos: EmptyState, BatchActionBar, FilterBar
- Notificações batch: `enviarAgora` no pushAgendadosService

## Regras de navegação admin
- Admin SEMPRE abre na Dashboard — sem persistir última view no sessionStorage
- DashboardV2Gateway: conteúdo max-w-[500px] com `relative` — absolute inset-0 das subviews fica contido
- VANTA Indica: 7 templates prontos, handlers de rota completos, preview 100% fiel à Home

## Fluxo DashboardV2Gateway
1. `supabase.rpc('get_admin_access', { p_user_id })` → retorna {role, comunidades, eventos}
2. Panorama (null context): KPIs globais, pendências, atalhos
3. Seleção de comunidade/evento → `setActiveContext({tenantId, tenantTipo, cargo})`
4. Sidebar + subviews renderizadas dentro do contexto
5. Deep links admin consumidos via `adminDeepLink` (sessão 3)

## Services carregados em background
Após gate resolver: rbacService, comunidadesService, cortesiasService, eventosAdminService, listasService, clubeService, assinaturaService, maisVantaConfigService

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

## Views novas (sessão 17/mar — Sprint 1 autonomia master)
| View | Arquivo | Função |
|---|---|---|
| SiteContentView | `views/SiteContentView.tsx` | CMS de textos — editar qualquer texto do app |
| LegalEditorView | `views/LegalEditorView.tsx` | Editor de Termos/Privacidade com versionamento |
| GestaoUsuariosView | `views/GestaoUsuariosView.tsx` | Buscar e ver qualquer usuário do app |
| ConfigPlataformaView | `views/ConfigPlataformaView.tsx` | Taxas dinâmicas da plataforma |
| PendenciasAppView | `views/PendenciasAppView.tsx` | Checklist de config pendentes (email, CNPJ, etc.) |
| CuponsComunidadeTab | `views/comunidades/CuponsComunidadeTab.tsx` | Cupons que valem pra todos os eventos da comunidade |

## Services novos (sessão 17/mar)
| Service | Função |
|---|---|
| `platformConfigService.ts` | Config dinâmica key/value (taxas VANTA) |
| `siteContentService.ts` | CMS textos key/value |
| `legalService.ts` | Documentos legais + consentimentos LGPD |

## Decisão Dan (sessão 17/mar): Dashboard V2 é o admin principal
- Dashboard V2 (features/dashboard-v2/) agora é o painel admin oficial
- Homes por cargo: Panorama, Gerente, Sócio, Caixa, Portaria, Promoter
- 49 subviews idênticas ao admin anterior — todas funcionais
- admin-v2 e admin-v3 deletados (protótipos mock)
