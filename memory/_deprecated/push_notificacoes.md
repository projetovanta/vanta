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
- Segmentos: TODOS | TAG | COMUNIDADE | EVENTO | CIDADE
- `campanhasService.enviar(payload)` → dispara por canal selecionado

## Push Templates + Agendamento (push_agendados)
- Tabelas: `push_templates`, `push_agendados` (migration `20260311234000`)
- Service: `features/admin/services/pushTemplatesService.ts`
  - `pushTemplatesService`: listar, criar, atualizar, deletar
  - `pushAgendadosService`: listar, agendar, cancelar
- UI: `NotificacoesAdminView.tsx` — 3 tabs (ENVIAR, TEMPLATES, AGENDADOS)
  - ENVIAR: formulário + opção agendar (datetime-local) + salvar como template
  - TEMPLATES: lista com usar/deletar
  - AGENDADOS: lista com status (PENDENTE/ENVIADO/CANCELADO/ERRO) + cancelar
- Edge Function: `process-scheduled-push` (deployed, verify_jwt: false)
  - Chamada a cada minuto via pg_cron (job ID 12)
  - Busca push_agendados com status=PENDENTE e agendar_para <= now()
  - Resolve destinatários por segmento → dispara IN_APP/PUSH/EMAIL
  - Atualiza status para ENVIADO ou ERRO com resultado detalhado
- pg_cron: `process-scheduled-push` — `* * * * *` (ativo)
