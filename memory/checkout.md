# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Checkout

## Arquivos
- `modules/checkout/CheckoutPage.tsx` (~1075L) — fluxo completo de compra
- `modules/checkout/SuccessScreen.tsx` (~160L) — tela pós-compra (confete + "Presença garantida!")
- `modules/checkout/WaitlistModal.tsx` (55L) — modal lista de espera

## Fluxo
1. User seleciona variação + quantidade
2. "Tem um código?" (ex-cupom) via `cuponsService`
3. Upload comprovante meia-entrada (se aplicável)
4. Botão "Garantir X ingressos" (dourado)
5. Ticket criado → SuccessScreen

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
