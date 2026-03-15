# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Event Detail

## Arquivos
- `modules/event-detail/EventDetailView.tsx` (415L) — view principal
- `modules/event-detail/components/EventHeader.tsx` (100L) — header com imagem + share + favorito
- `modules/event-detail/components/EventInfo.tsx` (122L) — info evento (data, local, descrição)
- `modules/event-detail/components/EventFooter.tsx` (64L) — botão comprar (dourado com sombra) + confirmar presença
- `modules/event-detail/components/EventSocialProof.tsx` (175L) — confirmados, amigos indo

## Props EventDetailView
```ts
evento: Evento, onBack, onBuy, onConfirmarPresenca, onMemberClick, onComunidadeClick, onSuccess
```

## Stores
- `useAuthStore`, `useSocialStore`, `useChatStore`, `useTicketsStore`, `useExtrasStore`
- Usa `eventosAdminService`, `reviewsService`, `clubeService`

## Funcionalidades
- Exibe variações de ingresso com preço
- Botão comprar → `onBuy(evento, variacaoId)`
- Confirmar presença (eventos gratuitos)
- Share nativo / copiar link
- Favoritar evento
- Social proof: amigos confirmados
- Reserva MAIS VANTA (modal)
- Review após evento
