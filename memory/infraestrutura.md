# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 16:47
# Memória — Infraestrutura

## 🔴 LEMBRETE: APP + SITE (nunca esquecer)
O VANTA roda como app nativo (Capacitor → App Store/Google Play) E como site (browser).
React Router v6 funciona nos dois. Ver `memory/plataformas.md` para regra completa.

## Stack
- React 18 + Vite + TypeScript + Tailwind CSS
- React Router v6 (BrowserRouter + react-helmet-async para SEO)
- Zustand 5 stores (auth, tickets, chat, social, extras)
- Supabase: PostgreSQL + Auth + Storage + Realtime + Edge Functions + RPC
- Capacitor: appId `com.maisvanta.app` (iOS/Android)
- PWA: service worker, manifest
- Leaflet: mapa interativo (radar)

## Supabase
- URL: `daldttuibmxwkpbqtebm.supabase.co`
- Client: `services/supabaseClient.ts` (anon key + RLS)
- supabaseAdmin: REMOVIDO (service_role key fora do bundle)
- Migrations: `supabase/migrations/`
- Push: `npx supabase db push --db-url postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.daldttuibmxwkpbqtebm.supabase.co:5432/postgres`

## Scripts
| Script | Quando usar |
|---|---|
| `npm run explore -- <path>` | Antes de codificar |
| `npm run deps -- <file>` | Antes de mudar interface/props |
| `npm run props -- <Comp>` | Antes de alterar props |
| `npm run store-map -- <store>` | Antes de mudar store |
| `npm run diff-check` | Durante edits |
| `npm run preflight` | Antes de entregar |
| `npm run lines -- top20` | Análise complexidade |
| `npm run knip` | Código morto |
| `npm run deep-audit` | Auditoria profunda |

## Observabilidade (Sentry + Logger)
- **Sentry**: init síncrono em `index.tsx` (`import './instrument'`). `instrument.ts` configura DSN, tracesSampleRate 0.1, environment via `import.meta.env.MODE`, enabled apenas em PROD
- **Logger**: `services/logger.ts` — wrapper Sentry. `logger.error(msg, err)` → `Sentry.captureException()` + console.error. `logger.warn(msg, data)` → `Sentry.addBreadcrumb()` + console.warn
- **Ativo em**: authService, authStore, CheckoutPage, transferenciaService, reembolsoService, eventosAdminFinanceiro
- **Edge functions**: entry/result logging em stripe-webhook e send-push (console.log/warn)
- **Edge Functions novas**: weekly-report (cron domingo 10h BRT), send-buyer-notification (push segmentado). stripe-webhook atualizado com handler para ingressos + notifica comprador (in-app + push + email)
- **Cron jobs**: weekly-report-domingo-10h, expirar-pedidos-checkout-30min (cada 5min, PENDENTE→EXPIRADO após 30min)
- **Sourcemaps**: `hidden` (não expostos ao browser, disponíveis para Sentry)

## Hardening Patterns
- **`.maybeSingle()`**: padrão para SELECTs por chave (52 queries convertidas). Evita PGRST116 em 0 rows
- **Cancelled flag**: `let cancelled = false` em useEffects async (7 locais). Cleanup: `return () => { cancelled = true; }`
- **Double-click guard**: `useRef(false)` + try/finally em ações financeiras (confirmarSaque, estornarSaque, aprovarReembolso, rejeitarReembolso — financeiro/index.tsx e masterFinanceiro/index.tsx)
- **Single-flight refresh**: eventosAdminCore.refresh() com guard `isRefreshing` para evitar race conditions

## DevLogging (DEV-only)
Sistema de debug logging ativo APENAS em `import.meta.env.DEV`. Em produção: ZERO logs, ZERO impacto (funções noop).

### Arquivos
| Arquivo | Função |
|---|---|
| `services/devLogger.ts` | Core singleton — 9 categorias (NAV, MODAL, CLICK, FORM, API, STORE, ERRO, RT, LIFECYCLE), console formatado, export texto |
| `services/supabaseProxy.ts` | Proxy transparente no supabase client — intercepta `.from()` e `.rpc()`, loga resultado/tempo/erros |
| `services/storeLogger.ts` | Observer de mudanças nas 5 stores Zustand via `subscribe()` nativo (zero alteração nos stores) |
| `services/devLogInit.ts` | Inicializador central — intercepta console.error/warn, window.onerror, unhandledrejection, CSP violations, store observers |
| `hooks/useDevNavLogger.ts` | Hook que observa mudanças de rota (useLocation) e tab ativa |
| `components/DevLogPanel.tsx` | Painel flutuante com filtros por categoria, auto-scroll, export clipboard |

### Integração
- `services/supabaseClient.ts` — wrapa client com `wrapSupabaseWithLogging()`
- `services/realtimeManager.ts` — loga subscribe/unsubscribe/erros de channels
- `hooks/useModalStack.ts` — loga abrir/fechar de todos os modais (~33)
- `App.tsx` — `useDevNavLogger(nav.activeTab)`, `useEffect(() => initDevLogging(), [])`, `<DevLogPanel />` (lazy, DEV-only)

### Fixes associados
- `components/DevQuickLogin.tsx` — `storageKey: 'vanta-dev-admin'` nos 2 createClient admin (evita conflito de sessão)
- `index.html` — CSP `connect-src` adicionou `https://firebaseinstallations.googleapis.com` (Firebase)

## Build
- `vite.config.ts`: logLevel `error`
- `npm run build` → dist/
- `npx tsc --noEmit` → type check
