# ERRONAVEGACAOFLUXO.md — Auditoria Completa VANTA

> Gerado em: 2026-03-09 | Branch: main | Commit: `da7276c`
> **Nenhum arquivo do projeto foi modificado.** Apenas este arquivo foi criado.

---

## FASE 1 — ARQUITETURA & ESTRUTURA

### Rotas (React Router v6)
| Rota | Componente | Lazy |
|---|---|---|
| `/` | `App` (HomeView) | N/A |
| `/evento/:id` | `EventDetailView` | Sim |
| `/checkout/:eventoId` | `CheckoutPage` | Sim |
| `/convite-mv/:token` | `AceitarConviteMVPage` | Sim |
| `/parceiro/:parceiro_id` | `ParceiroDashboardPage` | Sim |
| `/e/:slug` | `EventLandingPage` | Sim |

### Tabs (TabBar)
INICIO, RADAR, BUSCAR, MENSAGENS, PERFIL (5 tabs)

### Views Lazy-loaded
- **App.tsx**: 16 lazy imports (EventDetail, Radar, Search, Profile, Messages, ChatRoom, Admin, Wallet, etc.)
- **AdminDashboardView.tsx**: ~45 lazy imports (todas as sub-views admin)
- **AppModals.tsx**: 3 lazy imports (Login, Review, Onboarding)
- **Total**: ~65 lazy-loaded views

### Stores Zustand (5)
| Store | Keys principais |
|---|---|
| `useAuthStore` | currentAccount, profile, authLoading, selectedCity, notifications, accessNodes |
| `useTicketsStore` | myTickets, myPresencas, cortesiasPendentes, transferenciasPendentes |
| `useChatStore` | chats, onlineUsers, totalUnreadMessages |
| `useSocialStore` | friendships, mutualFriends |
| `useExtrasStore` | allEvents, savedEvents |

### Services (~72+)
- **services/**: authService, supabaseVantaService, messagesService, transferenciaService, etc.
- **features/admin/services/**: adminService, eventosAdminCrud, eventosAdminCore, eventosAdminTickets, eventosAdminFinanceiro, rbacService, cortesiasService, listasService, cuponsService, etc.
- **features/admin/services/clube/**: clubeMembrosService, clubeDealsService, clubeParceirosService, etc.

---

## FASE 2 — FLUXOS DE NAVEGAÇÃO

### Fluxo Auth
1. App.tsx monta → `useAuthStore.init()` (singleton)
2. `onAuthStateChange` dispara → fetch profile com timeout 4s (Promise.race)
3. Fallback 1: getSession após 2s se não resolveu
4. Fallback 2: timeout absoluto 6s → guest
5. Guard App.tsx: 8s → força guest se authLoading travou

### Fluxo Admin Gateway
1. Clica Shield → AdminGateway abre (z-150)
2. RPC `get_admin_access` retorna comunidades + cargo
3. Seleciona comunidade → resolve role (masteradm NUNCA rebaixado)
4. Confirma → AdminDashboardView com tenantId

### Fluxo Compra
1. EventDetail → "Comprar" → CheckoutPage (rota /checkout/:id)
2. Seleciona lotes/variações → RPC `processar_compra_checkout`
3. Stripe checkout (quando configurado) ou PIX
4. Webhook confirma → ticket gerado

### Problemas encontrados
- **Nenhum fluxo quebrado detectado** nos paths principais

---

## FASE 3 — SUPABASE: QUERIES, RPCs & REALTIME

### RPCs utilizadas (37 chamadas em código)
| RPC | Arquivo | Error handling |
|---|---|---|
| `get_admin_access` | AdminGateway.tsx:64 | ✅ |
| `buscar_membros` | authService.ts:276 | ✅ |
| `get_eventos_por_regiao` | supabaseVantaService.ts:296 | ✅ |
| `aceitar_convite_mv` | AceitarConviteMVPage.tsx:88, clubeConvitesService.ts:87 | ✅ |
| `processar_compra_checkout` | CheckoutPage.tsx:376 | ✅ |
| `processar_venda_caixa` | eventosAdminTickets.ts:32 | ✅ |
| `verificar_virada_lote` | eventosAdminTickets.ts:74 | ⚠️ sem check de error |
| `queimar_ingresso` | eventosAdminTickets.ts:187 | ✅ |
| `sign_ticket_token` | jwtService.ts:8 | ✅ |
| `verify_ticket_token` | jwtService.ts:18 | ✅ |
| `inserir_notificacao` | notificationsService.ts:87 | ✅ |
| `aceitar_cortesia_rpc` | cortesiasService.ts:300 | ✅ |
| `gerar_ocorrencias_recorrente` | CriarEventoView.tsx:452 | ✅ |
| `get_convite_socio` | ConviteSocioModal.tsx:285, NegociacaoSocioView.tsx:118 | ✅ |
| `aceitar_convite_socio` | ConviteSocioModal.tsx:373, ConvitesSocioView.tsx:246 | ✅ |
| `recusar_convite_socio` | ConviteSocioModal.tsx:392, ConvitesSocioView.tsx:252 | ✅ |
| `contraproposta_convite_socio` | ConviteSocioModal.tsx:425, ConvitesSocioView.tsx:267 | ✅ |
| `aceitar_proposta_produtor` | NegociacaoSocioView.tsx:311 | ✅ |
| `contraproposta_produtor` | NegociacaoSocioView.tsx:366 | ✅ |
| `cancelar_convite_produtor` | NegociacaoSocioView.tsx:422 | ✅ |
| `reiniciar_negociacao` | NegociacaoSocioView.tsx:448 | ✅ |
| `get_ocorrencias_serie` | SerieChips.tsx:46, 72 | ✅ |
| `cancelar_serie_recorrente` | SerieChips.tsx:65 | ✅ |
| `incrementar_usos_cupom` | cuponsService.ts:54 | ⚠️ fire-and-forget (sem check) |

### `.single()` que deveriam ser `.maybeSingle()` (potencial erro se 0 rows)
| Arquivo | Linha | Contexto |
|---|---|---|
| services/eventoPrivadoService.ts | 79, 216 | Busca por ID — pode não existir |
| services/transferenciaService.ts | 149 | Busca transferência |
| services/comemoracaoService.ts | 100, 195, 326, 386, 403 | 5 ocorrências — CRUD comemoração |
| services/messagesService.ts | 82 | Busca conversa |
| features/admin/services/reembolsoService.ts | 125, 178 | 2 ocorrências |
| features/admin/services/eventosAdminCrud.ts | 91, 138, 342 | 3 ocorrências |
| features/admin/services/eventosAdminFinanceiro.ts | 235 | Busca saldo |
| features/admin/services/mesasService.ts | 53 | Busca mesa |
| features/admin/services/listasService.ts | 406, 491, 722, 819, 870, 897 | 6 ocorrências |
| features/admin/services/comunidadesService.ts | 134 | Busca comunidade |
| features/admin/services/parceriaService.ts | 129, 223, 264 | 3 ocorrências |
| features/admin/services/comprovanteService.ts | 176 | Busca comprovante |
| features/admin/services/rbacService.ts | 357 | Busca atribuição |
| features/admin/services/auditService.ts | 142 | Busca log |
| features/admin/services/cortesiasService.ts | 333 | Busca cortesia |
| features/admin/services/clube/* | vários | ~12 ocorrências em services do clube |

**Total: ~53 `.single()` — muitos são inserts (ok), mas ~20+ são reads que deveriam ser `.maybeSingle()`**

### `select('*')` — queries que buscam todas as colunas
- **30+ ocorrências** em 20+ arquivos
- Impacto: performance em tabelas grandes (profiles, tickets_caixa, eventos_admin)
- Mais críticos: authService.ts (profiles), notificationsService.ts, adminService.ts

### Queries: 160 chamadas `supabase.from()` + 6 `.rpc()` + 23 `.auth.*` + 8 `.storage`

### 38 queries SEM tratamento de erro
| Local | Quantidade | Arquivos |
|---|---|---|
| Frontend services | 15 | achievementsService, analyticsService, comemoracaoService, communityFollowService, favoritosService, transferenciaService, waitlistService, chatStore, useAppHandlers |
| Edge Functions | 23 | notif-checkin-confirmacao, notif-evento-finalizou, notif-evento-iniciou, notif-infraccao-registrada (8), notif-pedir-review (7), stripe-webhook |

### ~~Tabela fantasma~~ (FALSO POSITIVO)
- **`selfies`** — é um **bucket de Storage**, não tabela. Existe no Supabase (`storage.buckets`). Código correto.
- ⚠️ Bucket `selfies` está como `public: true` mas contém biometria — deveria ser `public: false`

### Tabelas definidas mas sem `.from()` no código (40 tabelas)
Podem ser acessadas via RPCs ou estar sem uso real:
audit_logs, cargos, categorias_evento, chargebacks, cidades_mais_vanta, comprovantes_meia, convites_mais_vanta, cortesias_config, cortesias_log, cortesias_pendentes, cotas_promoter, cupons, deals_mais_vanta, equipe_evento, estilos, experiencias, formatos, interesses, lotes, lotes_mais_vanta, mais_vanta_config, mesas, niveis_prestigio, pagamentos_promoter, parceiros_mais_vanta, passport_aprovacoes, planos_mais_vanta, reembolsos, regras_lista, resgates_mais_vanta, soberania_acesso, socios_evento, solicitacoes_clube, solicitacoes_parceria, solicitacoes_saque, tiers_mais_vanta, transactions, vanta_indica, variacoes_ingresso, vendas_log

### Realtime
- **19 subscriptions** via `realtimeManager.subscribe()` (friendships, messages, authStore, socialStore)
- `realtimeManager` gerencia com max 5 channels
- Cleanup adequado em authStore (unsubscribe on logout)
- `usePWA.ts`: wb.addEventListener('waiting'/controlling') **SEM cleanup** (service worker — aceitável)

---

## FASE 4 — APIs & FETCH EXTERNAS

### Edge Functions
| Função | Propósito | JWT |
|---|---|---|
| `send-push` | Push FCM | --no-verify-jwt |
| `send-invite` | Email convite | verify-jwt |
| `create-checkout` | Stripe checkout | verify-jwt |
| `stripe-webhook` | Webhook Stripe | --no-verify-jwt |
| `update-instagram-followers` | Instagram API | verify-jwt |
| `notif-*` (5 funções) | Notificações automáticas | verify-jwt |

### Secrets necessárias (Supabase)
- `RESEND_API_KEY` — emails via Resend
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — push FCM
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — pagamentos (pendente CNPJ)
- `INSTAGRAM_ACCESS_TOKEN` — seguidores (pendente config)

---

## FASE 5 — COMPILAÇÃO & TIPOS

### TSC
- ✅ `npx tsc --noEmit` — **0 erros**

### ESLint
- ✅ **0 warnings** (max-warnings=0 enforced)

### Build
- ✅ Build completo sem erros

### TypeScript Quality
- 0 `@ts-ignore` / `@ts-expect-error`
- 0 `any` explícito (apenas em tipos gerados)
- `types/supabase.ts` — 4020 linhas (gerado automaticamente)

---

## FASE 6 — IMPORTS & EXPORTS

### Dependências circulares
- Nenhuma detectada via grep (vite não reporta warnings de circular)

### Imports não utilizados
- ✅ ESLint `no-unused-vars` enforced — 0 violations

---

## FASE 7 — STATE MANAGEMENT

### Stores — Análise de consistência
- **authStore**: singleton init (previne double-init StrictMode), 3-layer timeout protection
- **ticketsStore**: refresh direto do Supabase, sem cache layer
- **chatStore**: realtime subscriptions gerenciadas via realtimeManager
- **socialStore**: cache de friendships (60s stale-while-revalidate)
- **extrasStore**: allEvents com paginação server-side

### Problemas
- **Nenhum state leak detectado** — cleanup adequado em todos os stores

---

## FASE 8 — SEGURANÇA

### .env.vercel NÃO está no .gitignore
- ⚠️ **CRÍTICO**: arquivo `.env.vercel` existe (2108 bytes) e NÃO está no `.gitignore`
- Pode conter secrets se commitado acidentalmente

### npm audit
- **18 vulnerabilidades** (4 low, 3 moderate, 11 high)
- Todas em `devDependencies` (axe-cli → selenium-webdriver)
- **Nenhuma em dependencies de produção**

### Content Security Policy
- `https://*.ingest.us.sentry.io` no connect-src ✅
- Security headers em vercel.json: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ✅

### RLS
- Auditado em sessão anterior: todas as policies revisadas
- `has_evento_access()` — guard principal
- `is_masteradm()`, `is_vanta_admin()` — admin guards
- 24 RPCs com `SET search_path = public` ✅
- `aceitar_cortesia_rpc` + `inserir_notificacao` — SECURITY DEFINER ✅

### Hardening patterns
- `.maybeSingle()` padrão (52 queries já convertidas, ~20+ restantes com `.single()`)
- cancelled flag em useEffects async (7 locais)
- double-click guard (useRef) em ações financeiras (5 handlers)
- CircuitBreaker + RateLimiter ✅

---

## FASE 9 — ASSETS & PERFORMANCE

### Imagens >100KB tracked no git
| Arquivo | Tamanho |
|---|---|
| `public/icon-1024.png` | 962KB |
| `public/icon-512.png` | 340KB |
| `icons/icon-512.webp` | 391KB |
| `icons/icon-256.webp` | 105KB |

### Build Output
| Chunk | Tamanho |
|---|---|
| `exceljs.min-*.js` | 910KB ⚠️ |
| `index-BLHxx627.js` (main) | 534KB ⚠️ |
| `jspdf.es.min-*.js` | 377KB |
| `index-cid3sVp3.js` (admin) | 365KB |
| `vendor-recharts-*.js` | 357KB |
| `index-*.css` | 137KB |
| **Total dist/** | **26MB** |

### Lazy loading
- ✅ **65+ componentes lazy-loaded** (App.tsx + AdminDashboardView)
- ✅ Vite code splitting ativo
- ⚠️ exceljs (910KB) — carregado apenas em relatórios (lazy)
- ⚠️ jspdf (377KB) — carregado apenas em exportação PDF (lazy)
- ⚠️ recharts (357KB) — usado em analytics/gráficos

### addEventListener cleanup
- 20 addEventListener encontrados, 18 removeEventListener correspondentes
- ⚠️ `hooks/usePWA.ts:63-64` — `wb.addEventListener('waiting'/'controlling')` sem removeEventListener (service worker lifecycle — baixo risco)

---

## FASE 10 — DEPENDÊNCIAS

### Contagem
- **dependencies**: 25
- **devDependencies**: 31
- **Total**: 56

### Vulnerabilidades npm audit
- 18 total (todas em devDependencies)
- 11 high — `selenium-webdriver` via `axe-cli`
- 3 moderate
- 4 low
- **0 vulnerabilidades em produção**

### Libs pesadas
| Pacote | Propósito | Chunk size |
|---|---|---|
| exceljs | Exportar relatórios Excel | 910KB |
| jspdf | Exportar PDF | 377KB |
| recharts | Gráficos analytics | 357KB |
| html5-qrcode | Scanner QR portaria | ~50KB |
| qrcode.react | Render QR ingresso | ~20KB |

---

## FASE 11 — GIT & REPO

### .gitignore — Análise
- ✅ node_modules, dist, .env, .env.local, .env.*.local
- ✅ .vercel/, ios/, android/, supabase/.temp/
- ✅ audit-reports/, test-results/, playwright-report/
- ⚠️ **FALTA**: `.env.vercel` (arquivo existe, não está no .gitignore)
- ⚠️ **FALTA**: `.lighthouseci/` (diretório existe, não está no .gitignore)

### Arquivos grandes no git
| Arquivo | Tamanho |
|---|---|
| `public/icon-1024.png` | 962KB |
| `supabase/migrations/20260303_seed_bosque.sql` | 865KB (seed data) |
| `package-lock.json` | 844KB |
| `icons/icon-512.webp` | 391KB |
| `public/icon-512.png` | 340KB |
| `types/supabase.ts` | 131KB (gerado) |
| `icons/icon-256.webp` | 105KB |

### Tamanho do repo
- `.git/`: **38MB**
- `dist/`: 26MB (não commitado)

### TODO/FIXME/HACK
- ✅ **0 ocorrências** em código fonte (.ts/.tsx)

---

## RESUMO EXECUTIVO

### 🔴 CRÍTICO (ação necessária)
1. **`.env.vercel` fora do .gitignore** — risco de commit acidental de secrets
2. **`.lighthouseci/` fora do .gitignore** — diretório não-rastreado sem proteção
3. ~~Tabela `selfies` fantasma~~ — FALSO POSITIVO: é bucket de Storage (existe). Porém bucket está `public:true` e deveria ser `private` (biometria)

### 🟡 ATENÇÃO (melhorias recomendadas)
1. **38 queries sem tratamento de erro** (15 frontend + 23 edge functions) — erros silenciosos
2. **~20+ `.single()` que deveriam ser `.maybeSingle()`** — podem causar erro 406 se row não existe
3. **30+ `select('*')` em queries** — performance em tabelas grandes
4. **40 tabelas definidas sem `.from()` no código** — possível dead schema
5. **exceljs (910KB) + jspdf (377KB)** — considerar dynamic import mais granular
6. **Main chunk 534KB** — próximo do limite recomendado (500KB)
7. **`verificar_virada_lote` e `incrementar_usos_cupom`** — RPCs sem error handling
8. **icon-1024.png (962KB)** — considerar compressão/webp

### ✅ SAUDÁVEL
- TSC: 0 erros
- ESLint: 0 warnings
- Build: sucesso
- 0 TODO/FIXME/HACK
- 0 any/@ts-ignore
- 0 vulnerabilidades em produção
- 65+ componentes lazy-loaded
- RLS auditado e completo
- Security headers configurados
- Singleton auth init (anti double-init)
- 3-layer timeout protection (auth loading)
- Cleanup adequado em 18/20 event listeners
- Realtime gerenciado via RealtimeManager (max 5 channels)
- Hardening patterns aplicados (maybeSingle, cancelled flag, double-click guard)

---

## VERIFICAÇÃO FINAL

```bash
$ git diff
# (nenhuma saída — ZERO arquivos do projeto modificados)
# Apenas ERRONAVEGACAOFLUXO.md foi criado (novo arquivo)
```
