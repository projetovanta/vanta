# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Home / Feed

## Arquivos
- `modules/home/HomeView.tsx` (~230L) — view principal com seções
- `components/Home/CitySelector.tsx` (72L) — dropdown seleção cidade
- `components/Home/NotificationPanel.tsx` (432L) — painel notificações slide

## Seções da Home (ordem)
1. **Saudação** — logado: "Boa noite, [Nome]" / guest: "Boa noite" + "Descubra o que tá rolando"
2. **Highlights** (VANTA Indica) — carrossel horizontal de destaques editoriais
3. **LiveNowSection** — eventos acontecendo agora
4. **FriendsGoingSection** — amigos que vão (só aparece se logado + tem amigos)
5. **NearYouSection** — eventos perto (por cidade)
6. **ThisWeekSection** — eventos nos próximos 7 dias
7. **ForYouSection** — recomendações baseadas em histórico
8. **EventFeed** — feed principal com infinite scroll

## Removidos da Home (redesign 2026-03-15)
- SavedEventsSection — vai pro Perfil/Minha Experiência
- NewOnPlatformSection — removido do redesign
- MaisVantaBanner — vira card dentro do Highlights/Indica (fase futura)

## Comportamento
- Feed filtrado por cidade (authStore.selectedCity)
- Guest detectado por `role === 'vanta_guest'` — firstName fica undefined
- Cada seção usa px-5 individual — carrossel com edge-bleed, NÃO usar px global
- Pull-to-refresh com touch events
- Infinite scroll via `loadMoreEvents()`
- LazySection pra seções below-the-fold

## Stores
- `useAuthStore` → selectedCity, currentAccount.nome, currentAccount.role
- `useExtrasStore` → allEvents, refreshEvents, loadMoreEvents, hasMoreEvents
- `useTicketsStore` → myTickets, myPresencas
