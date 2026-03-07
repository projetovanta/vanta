# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Radar (Mapa)

## Arquivos
- `modules/radar/RadarView.tsx` (310L) — view principal com mapa Leaflet
- `modules/radar/components/MapController.tsx` (98L) — controle de zoom/pan
- `modules/radar/components/PremiumCalendar.tsx` (100L) — calendário filtro data
- `modules/radar/hooks/useRadarLogic.ts` (208L) — lógica: geolocalização, filtros, raio
- `modules/radar/utils/mapIcons.ts` (38L) — ícones de marcador

## Props RadarView
```ts
onEventSelect, onNavigateToTab
```

## Funcionalidades
- Mapa Leaflet com markers por evento
- Geolocalização do user
- Filtro por raio de distância
- Filtro por data (PremiumCalendar)
- Ícones customizados por evento (foto)
- Zoom para evento mais próximo
- Usa `vantaService` para buscar eventos
