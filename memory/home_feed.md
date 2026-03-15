# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 18:34
# Memória — Home / Feed

## Arquivos
- `components/Home/CitySelector.tsx` (72L) — dropdown seleção cidade
- `components/Home/NotificationPanel.tsx` (432L) — painel notificações slide

## Comportamento
- Feed de eventos filtrado por cidade selecionada (authStore.selectedCity)
- Eventos carregados via `useExtrasStore.allEvents`
- CitySelector usa Playfair Display SC Bold, tap target `min-h-[44px]`
- NotificationPanel: slide lateral com notificações, aceite de amizade, cortesias
- Scroll container: `paddingBottom: calc(44px + env(safe-area-inset-bottom, 0px))` (h-11 tab bar + safe-area dinâmico)
- Cada seção usa px-5 individual (documentado com comentário) — carrossel com edge-bleed, NÃO usar px global
- Saudação: `text-sm text-zinc-500`
- Empty state: ícone `w-12 h-12`, texto `max-w-[240px]`
- MaisVantaBanner: `rounded-2xl px-4 py-3.5 border-[#FFD300]/20 bg-gradient-to-r from-[#FFD300]/10`
- Carousel dots: ativo `w-6 h-2 bg-[#FFD300]`, inativo `w-2 h-2 bg-zinc-600`
- Tab bar: h-11 (44px) com bg-[#050505], safe-area-inset-bottom fica transparente (mostra #0A0A0A do container pai)
- Tab bar ícones/labels inativos: `text-zinc-400` (mais visíveis)
- Botão escudo admin: `border-2 border-[#FFD300]`

## Stores
- `useAuthStore` → selectedCity, notifications
- `useExtrasStore` → allEvents, savedEvents
