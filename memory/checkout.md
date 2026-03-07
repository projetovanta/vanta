# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Checkout

## Arquivos
- `modules/checkout/CheckoutPage.tsx` (786L) — fluxo completo de compra
- `modules/checkout/SuccessScreen.tsx` (102L) — tela pós-compra
- `modules/checkout/WaitlistModal.tsx` (55L) — modal lista de espera

## Fluxo
1. User seleciona variação + quantidade
2. Aplica cupom (opcional) via `cuponsService`
3. Upload comprovante meia-entrada (se aplicável) via `comprovanteService`
4. Pagamento (simulado — falta integração Stripe/PIX)
5. Ticket criado → SuccessScreen
6. Se `?ref=CODIGO` na URL: RPC incrementa vendas_count na comemoração + gera cortesias automáticas

## Status atual
- Gateway de pagamento: SIMULADO (pendente integração Stripe)
- `IVantaService.CheckoutInput/Result` define contrato
- Cupons funcionam via `cuponsService`
- Waitlist para eventos esgotados

## Pendências
- STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET → Supabase Secrets
- Integração PIX real
