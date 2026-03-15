# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Busca (Search)

## Arquivos
- `modules/search/SearchView.tsx` (~430L) — view principal
- `modules/search/components/SearchHeader.tsx` (~162L) — barra + tabs + filtros
- `modules/search/components/SearchResults.tsx` (~110L) — resultados eventos
- `modules/search/components/PeopleResults.tsx` (~41L) — resultados pessoas
- `modules/search/components/BeneficiosMVTab.tsx` (~548L) — tab "Pra Você" (membros MV)
- `modules/search/components/CityFilterModal.tsx` — filtro cidade
- `modules/search/components/VibeFilterModal.tsx` — filtro categoria/estilo
- `modules/search/components/TimeFilterModal.tsx` — filtro data/hora
- `modules/search/components/PriceFilterModal.tsx` — filtro preço máximo

## 3 Tabs (redesign)
- **Eventos** — busca texto + filtros (cidade, estilo, período, preço)
- **Pessoas** — busca por nome
- **Pra Você** (ex-Benefícios) — visível pra TODOS. Membros MV: veem benefícios. Não-membros: tela lock com CTA "Saiba mais" (FOMO)

## Funcionalidades
- Busca texto + filtros combinados
- Grid 3 colunas fixo nas tabs
- Comunidade spotlight quando busca bate com nome de comunidade
