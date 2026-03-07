# M8 — Infraestrutura + Edge Functions

## PUSH NOTIFICATIONS

### F8.1 — PUSH WEB (FCM)
- COMO: pushService.ts → firebase-messaging-sw.js → FCM HTTP v1
- TABELAS: push_subscriptions (UPSERT token)
- TRIGGER: PushPermissionBanner (modal) → usePWA → registerFcmPush
- EDGE FUNC: send-push (envia para tokens)
- FALTA: 0 tokens registrados na web (possiveis causas: VAPID key, SW registration)
- STATUS: PARCIAL — infra pronta mas 0 tokens web

### F8.2 — PUSH NATIVO (Capacitor)
- COMO: nativePushService.ts → @capacitor/push-notifications
- TABELAS: push_subscriptions (mesma tabela, token nativo)
- PRE-REQ: APNs key no Firebase Console (iOS)
- STATUS: OK (infra pronta, ativa quando app publicado)

### F8.3 — NOTIFICACOES IN-APP
- COMO: notificationsService.add() → tabela notifications
- TABELAS: notifications (INSERT)
- LEITURA: NotificationPanel.tsx (bell icon no header)
- ROUTING: useAppHandlers.handleNotificationActionClickComposite()
- 27 TIPOS: ver fluxo_notificacoes.md
- STATUS: OK

## EMAIL

### F8.4 — EMAIL VIA RESEND
- COMO: Edge Functions send-invite, send-notification-email, send-reembolso-email
- SECRETS: RESEND_API_KEY
- EDGE FUNCS:
  - send-invite: convite por email (campanhas)
  - send-notification-email: notificacao generica
  - send-reembolso-email: confirmacao reembolso
- STATUS: OK

## EDGE FUNCTIONS (15 total)

### F8.5 — create-checkout
- O QUE: cria sessao Stripe para assinatura MAIS VANTA
- TABELAS: assinaturas_mais_vanta (UPSERT)
- FALTA: planos hardcoded, CORS *, ninguem chama
- STATUS: INCOMPLETO

### F8.6 — stripe-webhook
- O QUE: recebe eventos Stripe (pagamento confirmado, cancelado, falhou)
- TABELAS: assinaturas_mais_vanta (UPDATE status)
- FALTA: Stripe nao configurado (CNPJ)
- STATUS: PENDENTE (aguarda Stripe)

### F8.7 — verify-instagram-bio
- O QUE: verifica codigo VANTA-XXXX na bio do Instagram
- TABELAS: solicitacoes_clube (UPDATE instagram_verificado)
- STATUS: OK (deployed)

### F8.8 — verify-instagram-post
- O QUE: verifica se membro postou apos evento
- TABELAS: reservas_mais_vanta (UPDATE post_verificado)
- STATUS: OK (deployed)

### F8.9 — instagram-followers / update-instagram-followers
- O QUE: busca contagem de seguidores Instagram
- TABELAS: profiles (UPDATE instagram_seguidores)
- STATUS: OK (deployed)

### F8.10 — notif-pedir-review
- O QUE: cron diario 17:00 UTC — pede review para quem fez check-in
- TABELAS: notificacoes_posevento (INSERT dedup), notifications (INSERT)
- pg_cron: jobid 8, schedule 0 17 * * *
- STATUS: OK (deployed)

### F8.11 — notif-infraccao-registrada
- O QUE: cron — registra infracoes por nao postar
- TABELAS: infracoes_mais_vanta (INSERT), membros_clube (UPDATE), reservas_mais_vanta (UPDATE)
- STATUS: OK (deployed)

### F8.12 — notif-evento-finalizou
- O QUE: cron cada 10min — detecta eventos encerrados, notifica membros MV
- TABELAS: reservas_mais_vanta (UPDATE post_deadline_em)
- STATUS: OK (deployed)

### F8.13 — notif-checkin-confirmacao
- O QUE: push apos check-in confirmando presenca
- STATUS: OK (deployed)

### F8.14 — notif-evento-iniciou
- O QUE: push quando evento comeca
- STATUS: OK (deployed)

### F8.15 — send-push
- O QUE: envia push FCM para tokens
- CORS: maisvanta.com only
- STATUS: OK (deployed)

### F8.16 — send-invite
- O QUE: envia email convite via Resend
- STATUS: OK (deployed)

### F8.17 — send-notification-email
- O QUE: envia email notificacao generica via Resend
- STATUS: OK (deployed)

### F8.18 — send-reembolso-email
- O QUE: envia email confirmacao reembolso
- STATUS: OK (deployed)

## INFRA APP

### F8.19 — CACHE
- COMO: cache.ts — stale-while-revalidate in-memory
- TTLs: eventos 60s, tickets 30s, inbox 30s, friendships 60s
- STATUS: OK

### F8.20 — RESILIENCIA
- CircuitBreaker: circuitBreaker.ts
- RateLimiter: rateLimiter.ts
- RealtimeManager: realtimeManager.ts (max 5 channels)
- ModuleErrorBoundary: por modulo
- STATUS: OK

### F8.21 — PWA
- usePWA.ts: install prompt, standalone detection, push permission
- PushPermissionBanner: modal fullscreen
- firebase-messaging-sw.js: service worker
- STATUS: OK

### F8.22 — SEO (OG TAGS)
- COMO: api/og.ts (Vercel serverless)
- ROTA: /api/og?id=eventoId → HTML com OG meta tags
- EventLandingPage: renderiza evento completo
- STATUS: OK

### F8.23 — ANALYTICS
- COMO: analyticsService.ts → analytics_events (INSERT)
- EVENTOS: page_view, event_view, ticket_purchase, etc.
- PMF Survey: PmfSurveyModal → pmf_responses (INSERT)
- STATUS: OK

### F8.24 — OFFLINE DB
- COMO: offlineDB.ts (IndexedDB via idb)
- DADOS: tickets offline, sync queue
- STATUS: OK
