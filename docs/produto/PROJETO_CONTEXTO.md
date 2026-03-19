# VANTA — Contexto do Projeto
> Gerado em: 2026-03-10 | Branch: feat/stripe-ingressos | Commit: 05eb384

## O que e

VANTA e uma plataforma social de eventos e comunidades, operando como app nativo (iOS + Android via Capacitor) e site (browser/PWA). O sistema permite criar comunidades, publicar eventos, vender ingressos (checkout com Stripe), gerenciar equipe com RBAC granular, check-in via QR, financeiro completo (saques, reembolsos, taxas), chat em tempo real, e um programa de fidelidade chamado "MAIS VANTA" com deals, parceiros, passaportes e assinaturas. O backend e 100% Supabase (Postgres + Auth + Storage + Edge Functions + Realtime + RLS). Deploy via Vercel com SSR/OG para SEO.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19.2 |
| Bundler | Vite 6.2 |
| Linguagem | TypeScript 5.8 (strict, noEmit) |
| CSS | Tailwind CSS 4.2 (via @tailwindcss/vite plugin) |
| State | Zustand 5.0 (5 stores) |
| Router | React Router DOM 7.13 |
| Backend | Supabase 2.97 (Auth, Postgres, Storage, Realtime, Edge Functions Deno) |
| Mobile | Capacitor 8.1 (iOS + Android) + Push Notifications |
| Pagamentos | Stripe (Edge Functions: create-checkout, create-ticket-checkout, stripe-webhook) |
| Monitoramento | Sentry 10.42 (@sentry/react + vite-plugin) |
| Analytics | Vercel Analytics + Speed Insights |
| Push | Firebase Cloud Messaging 12.9 (via Edge Function send-push) |
| Email | Resend API (via Edge Functions send-notification-email, send-reembolso-email) |
| Graficos | Recharts 3.7 |
| Mapas | Leaflet 1.9 + React-Leaflet 5.0 |
| QR Code | qrcode.react 4.2 (display) + html5-qrcode 2.3 (scanner) |
| PDF | jsPDF 4.2 |
| Excel | ExcelJS 4.4 |
| Crop | react-easy-crop 5.5 |
| SEO | react-helmet-async 3.0 |
| Virtual Scroll | @tanstack/react-virtual 3.13 |
| PWA | vite-plugin-pwa 1.2 + Workbox (generateSW) |
| Testes | Vitest 4.0 + Playwright 1.58 |
| Lint | ESLint 9.39 + Prettier 3.8 + Husky 9.1 + lint-staged |
| Dead Code | Knip 5.85 |
| Minificacao | Terser 5.46 (drop_console, drop_debugger) |

## Design System

| Elemento | Valor |
|---|---|
| Fonte display | Playfair Display SC, Bold 700 (titulos, cards) |
| Fonte UI | Inter (labels, body, inputs) |
| Cor primaria | `#FFD300` (dourado VANTA) |
| Background outer | `#050505` |
| Background inner | `#0A0A0A` |
| Texto primario | `rgba(255,255,255,0.92)` |
| Texto muted | `rgba(255,255,255,0.58)` |
| Texto faint | `rgba(255,255,255,0.38)` |
| Kicker style | Inter 600, gold, uppercase, tracking 0.28em, 10px |
| Input style | `bg-zinc-900/60 border-white/5 rounded-xl` |
| Layout | Mobile-first, max-w-md (app) / max-w-4xl (admin) |
| Safe areas | `env(safe-area-inset-top/bottom)` em App.tsx |
| Sourcemaps | hidden (Sentry only, nao expostos ao browser) |

## Arquitetura

### Rotas

| Rota | Componente | Tipo |
|---|---|---|
| `/checkout/:slug` | CheckoutPage | Standalone (sem tab bar) |
| `/evento/:slug` | EventLandingPage | Standalone |
| `/convite-mv/:token` | AceitarConviteMVPage | Standalone |
| `/parceiro` | ParceiroDashboardPage | Standalone |
| `*` | AppShell (tab bar) | Shell principal |

### Tabs (dentro do AppShell)

| Tab | View | Lazy |
|---|---|---|
| INICIO | HomeView | Nao |
| RADAR | RadarView | Sim |
| BUSCAR | SearchView | Sim |
| PERFIL | ProfileView (+ sub-views: WALLET, MY_TICKETS) | Sim |
| MENSAGENS | MessagesView + ChatRoomView | Sim |
| ADMIN_HUB | AdminGateway -> AdminDashboardView | Sim |

### Lazy loading
18 lazy imports no App.tsx

### Admin — 40 sub-views (AdminSubView type)
DASHBOARD, CURADORIA, COMUNIDADES, INDICA, NOTIFICACOES, LISTAS, PORTARIA_QR, PORTARIA_LISTA, CARGOS, FINANCEIRO_MASTER, FINANCEIRO, PORTARIA_SCANNER, MEUS_EVENTOS, CAIXA, PENDENTES, AUDIT_LOG, CATEGORIAS, CONVITES_SOCIO, PROMOTER_COTAS, MAIS_VANTA_HUB, MONITORAMENTO_MV, DIAGNOSTICO, ASSINATURAS_MV, PASSAPORTES_MV, DIVIDA_SOCIAL_MV, MEMBROS_GLOBAIS_MV, EVENTOS_GLOBAIS_MV, INFRACOES_GLOBAIS_MV, GESTAO_COMPROVANTES, RELATORIO_MASTER, PRODUCT_ANALYTICS, MAIS_VANTA, SOLICITACOES_PARCERIA, PENDENCIAS_HUB, CIDADES_MV, PARCEIROS_MV, DEALS_MV, CURADORIA_MV, CONVITES_MV, ANALYTICS_MV

### RBAC — 8 cargos
`vanta_gerente`, `vanta_socio`, `vanta_promoter`, `vanta_ger_portaria_lista`, `vanta_portaria_lista`, `vanta_ger_portaria_antecipado`, `vanta_portaria_antecipado`, `vanta_caixa` (+ `vanta_masteradm` implicit + `vanta_guest`)

### Services
- `services/` — 29 arquivos (authService, cache, circuitBreaker, rateLimiter, realtimeManager, supabaseClient, logger, push, notificacoes, etc.)
- `features/admin/services/` — 30 arquivos (rbac, financeiro, eventos CRUD/tickets/aprovacao, clube/16 sub-services, listas, reembolso, relatorio, etc.)
- Total: ~59 service files

### Edge Functions (16)
| Funcao | Proposito |
|---|---|
| create-checkout | Cria sessao Stripe (MAIS VANTA assinatura) |
| create-ticket-checkout | Cria sessao Stripe (ingresso pago) |
| stripe-webhook | Recebe webhooks Stripe |
| send-push | Envia push FCM |
| send-notification-email | Email via Resend |
| send-reembolso-email | Email reembolso via Resend |
| send-invite | Convite por email |
| instagram-followers | Consulta seguidores IG |
| update-instagram-followers | Atualiza seguidores IG |
| verify-instagram-bio | Verifica bio IG |
| verify-instagram-post | Verifica post IG |
| notif-checkin-confirmacao | Notif pos check-in |
| notif-evento-finalizou | Notif evento encerrado |
| notif-evento-iniciou | Notif evento iniciou |
| notif-infraccao-registrada | Notif infracao |
| notif-pedir-review | Notif pedir review |

### Stores (Zustand 5)

| Store | Keys principais | init/cleanup |
|---|---|---|
| `useAuthStore` | currentAccount, profile, authLoading, selectedCity, notifications, unreadNotifications | login/logout |
| `useTicketsStore` | myTickets, myPresencas, cortesiasPendentes, transferenciasPendentes | init(userId) com cleanup |
| `useChatStore` | chats, onlineUsers, activeChatParticipantId, totalUnreadMessages | init(userId) com cleanup |
| `useSocialStore` | friendships, mutualFriends | init(userId) com cleanup |
| `useExtrasStore` | allEvents, savedEvents, hasMoreEvents, eventsLoading | initEvents, initClubeData, initFavoritos |

## Numeros do Codigo

| Metrica | Valor |
|---|---|
| Arquivos .ts/.tsx | 429 |
| Linhas de codigo | ~103.985 |
| Dependencies | 25 |
| DevDependencies | 31 |
| Supabase queries (`.from`) | 256 ocorrencias em 77 arquivos |
| RPCs (`.rpc(`) | 38 ocorrencias em 17 arquivos |
| Auth calls (`.auth.`) | 49 ocorrencias em 28 arquivos |
| Storage calls | 28 ocorrencias em 9 arquivos |
| Edge Functions | 16 |
| Lazy imports (App.tsx) | 18 |
| Admin sub-views | 40 |
| Admin view files | 62 (+ 145 .tsx em views/) |
| Migrations Supabase | 149 |
| Types (supabase.ts) | 4.442 linhas (gerado) |
| Type files manuais | 7 (auth, clube, eventos, financeiro, index, rbac, social) |
| Hooks customizados | 6 |
| Componentes compartilhados | 33 |
| Testes | 23 arquivos (unit, integration, e2e, load) |
| Commits no branch | 81 |

## Estado Atual (Marco 2026)

| Check | Resultado |
|---|---|
| TSC (`npx tsc --noEmit`) | 0 erros |
| ESLint (quiet, max-warnings=0) | 0 warnings |
| npm audit (production) | 0 vulnerabilities |
| `@ts-ignore` / `@ts-expect-error` | 0 |
| `: any` | 44 ocorrencias |
| TODO / FIXME / HACK | 56 ocorrencias |

### O que funciona

- **Auth completo**: registro com selfie, login email/senha, reset password, guest mode, onboarding
- **Comunidades**: CRUD, follow, evento privado, categorias, solicitacao de parceria
- **Eventos**: criar, editar, publicar, lotes, variacoes, cupons, mesas, recorrencia (semanal/quinzenal/mensal)
- **Checkout gratuito**: fluxo completo — seleciona variacao, login inline, RPC atomica, ticket gerado
- **Carteira**: ingressos, cortesias, transferencias entre usuarios
- **Check-in**: QR scanner + lista manual + portaria antecipado + caixa (venda na porta)
- **Chat**: realtime 1-to-1 com Supabase Realtime, reactions, delete, online status
- **Social**: friendships (request/accept/decline/remove), mutual friends
- **Financeiro**: dashboard financeiro por evento, solicitacao de saque, reembolso com auditoria
- **RBAC**: 8 cargos, guards por sub-view, sovereignty guard, permissoes granulares
- **Admin**: 40+ sub-views, sidebar colapsavel, pendencias hub, audit log, diagnostico
- **MAIS VANTA**: assinaturas, niveis/tiers, passaportes, cidades, parceiros, deals, resgates, convites, infracoes, divida social, analytics
- **Notificacoes**: 43 tipos, 3 canais (in-app, push FCM, email Resend)
- **PWA**: manifest.json, service worker (Workbox generateSW), runtime caching (Supabase API + Storage + Imgur)
- **SEO/OG**: `api/og.ts` para bots sociais, robots.ts, sitemap.xml.ts
- **Seguranca**: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, RLS auditado
- **Observabilidade**: Sentry init sincrono, logger wrapper, sourcemaps hidden
- **Negociacao socio**: turn-based chat, 9 RPCs, cron 48h, push FCM
- **Proposta VANTA**: master envia proposta afiliado, dono aceita/recusa (ate 3 rodadas)
- **Relatorios**: export Excel (ExcelJS) + PDF (jsPDF)
- **Mapas**: Leaflet para localizacao de eventos
- **Reviews**: modal de review pos-evento
- **Deep links**: Apple App Site Association + Android Asset Links configurados

### Fluxos parciais ou pendentes

- **Stripe para ingressos pagos**: Edge Functions `create-ticket-checkout` e `stripe-webhook` existem, mas o webhook SO processa assinaturas MAIS VANTA — NAO tem handler para `pedidos_checkout` (ingressos). Tabela `pedidos_checkout` existe (migration aplicada). Polling do CheckoutSuccessPage vai dar timeout. A rota `/checkout-success` NAO esta registrada no App.tsx. Branch `feat/stripe-ingressos` em andamento.
- **Painel do parceiro**: rota `/parceiro` existe com lazy ParceiroDashboardPage, mas cargo `vanta_parceiro_mv` pendente
- **Gerente por cidade**: pendente
- **Meta Graph API**: integracao pendente
- **Dashboard analytics MV**: pendente
- **Notificacoes MV v2**: pendente
- **QR VIP dourado por deal**: pendente

### Bloqueios conhecidos

- **Stripe webhook incompleto** para pagamento de ingressos — unico bloqueio real para monetizacao via venda de ingressos pagos
- **CheckoutSuccessPage sem rota** no App.tsx — precisa registrar antes de testar fluxo pago end-to-end

## Documentacao

### .md na raiz do projeto
| Arquivo | Proposito |
|---|---|
| CLAUDE.md | Regras de operacao para o Claude Code |
| README.md | Readme do projeto |
| MAPA_PROJETO.md | Fluxos detalhados acao-reacao |
| MAPA_VANTA.md | Mapa geral do VANTA |
| VANTA_OPERATIONAL_MAP.md | Mapa operacional completo |
| VANTA_PRODUTO_COMPLETO.md | Descricao completa do produto |
| VANTA_HUMAN_GUIDE.md | Guia humano do VANTA |
| VANTA_MASTER_MANUAL.md | Manual master |
| MAIS_VANTA_SISTEMA_COMPLETO.md | Sistema MAIS VANTA completo |
| MAIS_VANTA_TERMOS_DE_USO.md | Termos de uso MAIS VANTA |
| PROTOCOL.md | Protocolo de operacao |
| SETUP_SUPABASE_CLOUD.md | Setup Supabase Cloud |
| STORE_CHECKLIST.md | Checklist de stores |
| AUDITORIA_COMPLETA.md | Auditoria completa |
| AUDITORIA_PRODUTO.md | Auditoria de produto |
| ERRONAVEGACAOFLUXO.md | Erros de navegacao/fluxo |
| PROMPT_CLAUDECODE_FASE1.md | Prompt estruturado fase 1 |

### Memoria modular (memory/)
10 modulos + 19 sub-modulos + EDGES.md + MEMORY.md + sessao_atual.md + regras_usuario.md

## Como o Dan trabalha

- Comunica em portugues, direto e casual
- Usa Claude Code no terminal do VS Code como ferramenta principal de dev
- Prefere codigo completo (nao snippets parciais)
- Prefere commits atomicos com mensagens descritivas
- Testa em dispositivo real (iPhone + Android)
- Gosta de prompts estruturados por fases pra colar no Claude Code
- Mantem sistema de "memoria viva" — 10 modulos + 19 sub-modulos documentando estado real do codigo
- Opera com regras rigorosas: zero mocks, zero suposicoes, zero remocoes sem autorizacao
- Tem scripts custom para explorar, auditar e validar o codebase (preflight, deep-audit, explore, deps, props, etc.)

## Como ajudar o Dan

- **Codigo/prompts pro Claude Code:** montar prompts detalhados por fase com regras claras, protecoes, e verificacao
- **Revisao:** quando ele cola output do Claude Code, revisar decisoes e apontar riscos
- **Arquitetura:** ajudar com decisoes de design, priorizacao, e trade-offs
- **Launch:** planejamento de lancamento, estrategia, checklist
- **Guiar:** dizer quando trocar de conversa, modelo, ou ferramenta
- **Stripe:** prioridade imediata — completar o webhook handler de ingressos pagos + rota CheckoutSuccessPage
- **Producao:** o app esta em fase final de producao — cada decisao deve considerar usuarios reais
