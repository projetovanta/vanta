# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-19
# Memória — Home / Feed

## Arquivos
- `modules/home/HomeView.tsx` — view principal com seções (cada seção = query independente)
- `components/Home/CitySelector.tsx` — dropdown seleção cidade
- `components/Home/NotificationPanel.tsx` — painel notificações slide

## Seções da Home (ordem atual)
1. **Saudação** — logado: "Boa noite, [Nome]" / guest: "Boa noite" + "Bem-vindo ao VANTA"
2. **Seus Benefícios** — só membros MAIS VANTA (botão → CLUBE)
3. **Highlights** (VANTA Indica) — carrossel curado, handlers completos (6 tipos)
4. **ProximosEventosSection** — próximos eventos da cidade (RPC `eventos_por_cidade_paginado`, 9 cards + "Ver todos" → AllEventsView)
5. **MaisVendidosSection** — top 10 mais vendidos 24h (RPC `top_vendidos_24h`, some se 0 vendas)
6. **LocaisParceiroSection** — comunidades ativas na cidade (RPC `parceiros_por_cidade`, 9 + "Ver todos" → AllPartnersView)
7. **DescubraCidadesSection** — cidades com eventos exceto a atual (RPC `cidades_com_eventos`, click → CityView)
8. **IndicaPraVoceSection** — eventos que combinam com interesses do usuário (só logado + com interesses)

## Componentes de card
- `EventCarousel` — carrossel horizontal com `onViewAll` + `maxCards` (default 9) + ViewAllCard automático
- `ViewAllCard` — card "Ver todos →" (mesmo tamanho dos EventCards, fundo gradient dourado)
- `PartnerCard` — card de comunidade (aspect 1/1 quadrado, foto + nome + tipo)
- `CityCard` — card de cidade (aspect 4/5, foto destaque + overlay + nome + contagem)

## Views overlay (abertas pela Home)
- `AllEventsView` — listagem paginada (infinite scroll, tabs futuros/passados), z-[160]
- `AllPartnersView` — lista paginada de parceiros, z-[160]
- `CityView` — mini-Home filtrada por cidade (hero + próximos + parceiros + passados), z-[170]

## Navegação (useNavigation)
- `openAllEvents(cidade)` / `closeAllEvents()` → AllEventsView
- `openCityView(cidade)` / `closeCityView()` → CityView
- `openAllPartners(cidade)` / `closeAllPartners()` → AllPartnersView

## RPCs Supabase (migration 20260319100000)
- `top_vendidos_24h(p_cidade, p_limit)` → ranking vendas 24h
- `cidades_com_eventos(p_excluir)` → cidades com eventos futuros
- `parceiros_por_cidade(p_cidade, p_limit, p_offset)` → comunidades ativas
- `eventos_por_cidade_paginado(p_cidade, p_futuros, p_limit, p_offset)` → paginação server-side

## Removidos da Home
- ThisWeekSection, ComingSoonSection, FriendsGoingSection, ForYouSection → movidos pra `_deprecated/`
- LiveNowSection, NearYouSection → removidos em sessões anteriores
- SavedEventsSection, NewOnPlatformSection, MaisVantaBanner → removidos no redesign
- Infinite scroll global removido da Home (cada seção busca seus próprios dados)

## Comportamento
- Cada seção faz sua própria query ao Supabase (não depende de allEvents em memória)
- Filtrado por cidade (authStore.selectedCity) — seções só renderizam se `selectedCity` existe
- Guest detectado por `role === 'vanta_guest'`
- Cada seção usa px-5 individual — carrossel com edge-bleed
- Pull-to-refresh com touch events (refreshEvents)
- LazySection pra seções below-the-fold
- Seção some quando não tem dados (0 resultados)

## Stores
- `useAuthStore` → selectedCity, currentAccount (nome, role, id, interesses)
- `useExtrasStore` → refreshEvents (pull-to-refresh)
