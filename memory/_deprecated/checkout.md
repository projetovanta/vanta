# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Checkout

## Arquivos
- `modules/checkout/CheckoutPage.tsx` (~1075L) — fluxo completo de compra
- `modules/checkout/SuccessScreen.tsx` (~160L) — tela pós-compra (confete + "Presença garantida!")
- `modules/checkout/WaitlistModal.tsx` (55L) — modal lista de espera

## Fluxo (2 caminhos)

### Fluxo PAGO (Stripe):
1. User seleciona variação + quantidade
2. "Tem um código?" (ex-cupom) via `cuponsService`
3. Botão "Garantir X ingressos" (dourado)
4. Front chama Edge Function `create-ticket-checkout`
5. Edge Function cria pedido pendente + Stripe Checkout Session
6. Front redireciona pro Stripe (`window.location.href = url`)
7. User paga no Stripe (cartão/Apple Pay/Google Pay/PIX)
8. Stripe envia webhook → `stripe-webhook` processa → cria tickets via RPC
9. Stripe redireciona → `/checkout/sucesso?pedido_id=X`

### Fluxo GRATUITO (RPC direto):
1. User seleciona ingresso gratuito (ou cupom 100%)
2. Total = R$ 0 → usa RPC `processar_compra_checkout` direto
3. Ticket criado → SuccessScreen imediato

## Regras
- Pagamento SEMPRE no site (nunca in-app — Apple cobra 30%)
- Stripe modo teste até Dan criar conta real (chaves pk_test_/sk_test_)
- Edge Functions necessárias: create-ticket-checkout, stripe-webhook
- Secrets Supabase: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

## SuccessScreen (redesign)
- Confete animado (40 peças, 4s)
- Sparkles dourado + "Presença garantida!" em Playfair
- Cards com QR code de cada ingresso
- Botão "Ver meu ingresso" (dourado)
- SEM menção ao MV, SEM social proof

## Copy (redesign)
- "Tem um código?" (não "cupom")
- "Garantir" (não "Confirmar" ou "Processar")
- "Garantindo..." durante loading

## Status atual
- Gateway de pagamento: SIMULADO (pendente integração Stripe)
- `IVantaService.CheckoutInput/Result` define contrato
- Cupons funcionam via `cuponsService`
- Waitlist para eventos esgotados

## Pendências
- STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET → Supabase Secrets
- Integração PIX real
