# Stripe — Configuração para Pagamento de Ingressos

## Visão Geral

O VANTA usa Stripe Checkout (hosted) para pagamentos de ingressos pagos.
- Fluxo gratuito: RPC direto (sem Stripe)
- Fluxo pago: Edge Function → Stripe Checkout → Webhook → RPC

## Secrets Necessários

### Supabase Edge Functions

Configurar via Dashboard Supabase > Edge Functions > Secrets:

| Secret | Onde obter | Usado por |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys | `create-ticket-checkout` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks > Signing secret | `stripe-webhook` |

### Frontend (Vercel)

| Variável | Valor | Descrição |
|---|---|---|
| `VITE_STRIPE_PAYMENTS_ENABLED` | `true` ou `false` | Feature flag — ativa fluxo pago no checkout |

## Configuração Stripe Dashboard

### 1. Webhook Endpoint

- URL: `https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
- Eventos a escutar:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `invoice.paid` (para MAIS VANTA)
  - `customer.subscription.deleted` (para MAIS VANTA)

### 2. API Keys

- **Test mode**: usar `sk_test_...` e `whsec_...` do test mode para desenvolvimento
- **Live mode**: usar `sk_live_...` e `whsec_...` do live mode para produção (requer CNPJ ativo)

## Deploy das Edge Functions

```bash
# Primeira vez ou após alterações
npx supabase functions deploy create-ticket-checkout --project-ref <REF>
npx supabase functions deploy stripe-webhook --project-ref <REF>
```

## Ativar Pagamentos

1. Configurar secrets no Supabase
2. Criar webhook endpoint no Stripe Dashboard
3. Testar com cartão de teste (`4242 4242 4242 4242`)
4. Setar `VITE_STRIPE_PAYMENTS_ENABLED=true` no Vercel
5. Redesploy frontend

## Testar Localmente

```bash
# Terminal 1: Supabase functions serve
npx supabase functions serve --env-file .env.local

# Terminal 2: Stripe CLI forward webhooks
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

Cartões de teste: https://docs.stripe.com/testing#cards
