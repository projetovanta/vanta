# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Busca (Search)

## Arquivos
- `modules/search/SearchView.tsx` (369L) — view principal
- `modules/search/components/SearchHeader.tsx` (142L) — barra + filtros ativos
- `modules/search/components/SearchResults.tsx` (53L) — resultados eventos
- `modules/search/components/PeopleResults.tsx` (36L) — resultados pessoas
- `modules/search/components/CityFilterModal.tsx` (63L) — filtro cidade
- `modules/search/components/VibeFilterModal.tsx` (160L) — filtro categoria/estilo
- `modules/search/components/TimeFilterModal.tsx` (323L) — filtro data/hora
- `modules/search/components/PriceFilterModal.tsx` (113L) — filtro preço máximo

## Props SearchView
```ts
onEventClick, onMemberClick, onComunidadeClick
```

## Funcionalidades
- Busca texto + filtros combinados (cidade, categoria, horário, preço, benefícios MV)
- Tabs: EVENTS | PEOPLE
- Busca por nome de evento/comunidade e por nome de pessoa
- Usa `authService`, `comunidadesService`, `useAuthStore`, `useExtrasStore`
