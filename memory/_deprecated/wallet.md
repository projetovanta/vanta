# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 21:08
# Memória — Carteira (Wallet)

## Arquivos
- `modules/wallet/WalletView.tsx` (439L) — view principal
- `modules/wallet/components/TicketList.tsx` (314L) — lista ingressos
- `modules/wallet/components/EventTicketsCarousel.tsx` (726L) — carrossel QR por evento
- `modules/wallet/components/TicketQRModal.tsx` (211L) — modal QR individual
- `modules/wallet/components/PresencaList.tsx` (40L) — lista presenças
- `modules/wallet/components/WalletLockScreen.tsx` (~300L) — tela bloqueio PIN

## Props WalletView
```ts
onGoToHome, isSubView, onDevolverCortesia, onTransferirIngresso, onSuccess
```

## Funcionalidades
- Tabs: ingressos futuros | passados | presenças
- QR code por ingresso (JWT assinado via `jwtService`)
- Transferir ingresso para outro user
- Devolver cortesia
- Lock screen com PIN (hash SHA-256 salvo em `profiles.wallet_pin_hash` no Supabase, migração automática de localStorage)
- Comprovante meia-entrada
- Stores: `useAuthStore`, `useTicketsStore`, `useExtrasStore`
