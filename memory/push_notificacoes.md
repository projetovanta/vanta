# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Push / Notificações

## Arquivos
- `services/pushService.ts` (78L) — registro token FCM
- `services/firebaseConfig.ts` (46L) — config Firebase (lazy load)
- `features/admin/services/notificationsService.ts` (124L) — notificações in-app
- `features/admin/services/campanhasService.ts` (282L) — campanhas multi-canal

## Push FCM
- `pushService.registerToken(userId)` → `getToken()` → salva em `push_subscriptions`
- Status: 0 tokens registrados (getToken falha silenciosamente)
- Pendências: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

## Notificações In-App
- `notificationsService.create(userId, titulo, mensagem, link?)` → tabela `notifications`
- Lidas via `notificationsService.markRead(id)`
- Exibidas no `NotificationPanel`

## Campanhas
- Canais: IN_APP, PUSH, EMAIL
- Segmentos: TODOS | TAG
- `campanhasService.enviar(payload)` → dispara por canal selecionado
