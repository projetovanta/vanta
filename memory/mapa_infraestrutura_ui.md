# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Infraestrutura / UI

## Stack
- React 18 + Vite + TypeScript + Tailwind CSS
- Zustand (5 stores) → estado global
- Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- Capacitor (appId: com.maisvanta.app) → iOS/Android
- PWA (service worker, manifest)
- Leaflet (radar/mapa)

## Estrutura de Diretórios
```
/components/    → componentes compartilhados (27 arquivos, 5518L)
/modules/       → views de app (checkout, community, event-detail, profile, radar, search, wallet)
/features/admin/ → painel admin (194 arquivos, 46754L)
/features/tickets/ → ticket management
/services/      → services raiz (20 arquivos, 2979L)
/stores/        → Zustand stores (5 arquivos, 817L)
/hooks/         → custom hooks
/types/         → TypeScript types
/utils/         → utilidades
/data/          → dados estáticos
```

## Componentes Compartilhados Principais
| Componente | Linhas | Função |
|---|---|---|
| `AuthModal.tsx` | 531 | Login/cadastro |
| `ConviteSocioModal.tsx` | 634 | LEGACY — substituido por NegociacaoSocioView |
| `NegociacaoSocioView.tsx` | ~700 | Tela cheia chat negociacao socio/produtor |
| `NotificationPanel.tsx` | 432 | Painel de notificações |
| `DevQuickLogin.tsx` | 356 | Login rápido (dev) — filtra auth.users, RBAC roles |
| `AppModals.tsx` | 227 | Container de modais do app |
| `EventCard.tsx` | 135 | Card de evento |
| `ReviewModal.tsx` | — | Modal de review |
| `VantaPickerModal.tsx` | — | Picker modal customizado |

## Contêiner Master (App.tsx)
- Outer: `fixed inset-0 flex flex-col items-center overflow-hidden bg-[#050505]`
- Inner: `w-full flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]`
- App normal: `max-w-md`. Admin: sem max-w (desktop), `max-w-4xl` (mobile)

## Services Raiz
| Service | Linhas | Função |
|---|---|---|
| `supabaseVantaService.ts` | 396 | Fachada Supabase (eventos, membros, biometria) |
| `authService.ts` | 344 | Auth (login, signup, profile) |
| `messagesService.ts` | 343 | Chat inbox/mensagens |
| `offlineDB.ts` | 289 | IndexedDB para modo offline |
| `offlineEventService.ts` | 389 | Sync offline → online |
| `transferenciaService.ts` | 205 | Transferência de ingressos |
| `friendshipsService.ts` | 153 | Amizades |
| `photoService.ts` | 151 | Upload avatar/álbum |
| `achievementsService.ts` | 147 | Badges de frequência |
