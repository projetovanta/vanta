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

## Build
- `vite.config.ts`: logLevel `error`
- `npm run build` → dist/
- `npx tsc --noEmit` → type check
