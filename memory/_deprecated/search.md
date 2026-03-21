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

## 4 Tabs + controle de acesso
| Tab | Visitante | Membro (sem MV) | Membro MV |
|-----|-----------|-----------------|-----------|
| **Eventos** | Aberto | Aberto | Aberto |
| **Pessoas** | Lock + CTA cadastro | Aberto | Aberto |
| **Lugares** | Lock + CTA cadastro | Lock MV + CTA saiba mais | Aberto |
| **Pra Você** | Lock + CTA cadastro | Lock MV + CTA saiba mais | Aberto |

- Guards no useEffect impedem queries de rodar pra visitante/não-MV
- Lock screens com ícone cadeado + mensagem + botão CTA
- `PlacesResults` — resultados de comunidades (tab Lugares)

## Funcionalidades
- Busca texto + filtros combinados
- Grid 3 colunas fixo nas tabs
- Comunidade spotlight quando busca bate com nome de comunidade
