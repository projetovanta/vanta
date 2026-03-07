# Criado: 2026-03-06 01:52 | Ultima edicao: 2026-03-06 01:52

# Sub-modulo: Busca + Filtros + Radar

## Pertence a: modulo_perfil_feed.md

## Arquivos (8 arquivos, 1355L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| SearchView.tsx | 409 | Tela principal de busca |
| components/SearchHeader.tsx | 142 | Header com filtros ativos |
| components/SearchResults.tsx | 104 | Resultados de eventos |
| components/PeopleResults.tsx | 41 | Resultados de pessoas |
| components/CityFilterModal.tsx | 63 | Filtro por cidade |
| components/VibeFilterModal.tsx | 160 | Filtro por estilo/categoria |
| components/TimeFilterModal.tsx | 323 | Filtro por horario/data |
| components/PriceFilterModal.tsx | 113 | Filtro por preco maximo |

## SearchView (409L) — Tela principal

### Tabs
- **EVENTS** (default): busca eventos por nome/descricao
- **PEOPLE**: busca usuarios por nome

### Filtros (todos opcionais, combinaveis)
| Filtro | Modal | Descricao |
|---|---|---|
| Cidade | CityFilterModal (63L) | Multi-select de cidades |
| Estilo/Categoria | VibeFilterModal (160L) | Categorias + estilos musicais (carrega do Supabase) |
| Horario | TimeFilterModal (323L) | Hoje, Amanha, Esta Semana, Este Mes, Data especifica |
| Preco | PriceFilterModal (113L) | Slider preco maximo |
| Beneficios MV | Toggle no header | Apenas eventos com lotes MAIS VANTA |

### Busca server-side
- Eventos: searchEventos() com filtros combinados
- Pessoas: query em profiles por nome (debounced)

## Radar (mapa)
**Arquivo**: modules/search/RadarView.tsx (dentro de SearchView como sub-view)
**Fluxo**:
```
SearchView -> tab Radar -> RadarView
-> usePermission(location) -> pede permissao GPS
-> supabase.rpc('get_eventos_por_regiao', {lat, lng, raio_km})
-> Renderiza eventos no mapa com pins
-> Clica pin -> EventDetailView
```

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Busca eventos | OK | searchEventos server-side |
| 2 | Busca pessoas | OK | query profiles |
| 3 | Filtro cidade | OK | CityFilterModal 63L |
| 4 | Filtro estilo | OK | VibeFilterModal 160L (dados do Supabase) |
| 5 | Filtro horario | OK | TimeFilterModal 323L |
| 6 | Filtro preco | OK | PriceFilterModal 113L |
| 7 | Filtro beneficios MV | OK | Toggle no header |
| 8 | Debounce busca | OK | useDebounce hook |
| 9 | Radar mapa | OK | RPC get_eventos_por_regiao |
| 10 | Permissao GPS | OK | usePermission |
| 11 | Busca por comunidade | NAO EXISTE | Sem tab dedicada |
| 12 | Historico de buscas | NAO EXISTE | Sem recentes |
| 13 | Sugestoes autocomplete | NAO EXISTE | Sem autocomplete |
