# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-15
# Memória — Radar (Mapa)

## Arquivos
- `modules/radar/RadarView.tsx` (~340L) — view principal com mapa Leaflet
- `modules/radar/components/MapController.tsx` (~98L) — controle de zoom/pan
- `modules/radar/components/PremiumCalendar.tsx` (~118L) — calendário filtro data
- `modules/radar/hooks/useRadarLogic.ts` (~260L) — lógica: geolocalização, filtros, raio, parceiros
- `modules/radar/utils/mapIcons.ts` (~50L) — ícones: evento, user, parceiro

## Funcionalidades
- Mapa Leaflet com markers por evento + parceiros MV
- Geolocalização do user
- Filtro por raio de distância
- Filtro por data (PremiumCalendar)
- Ícones customizados: evento (foto+dourado), parceiro (âmbar), user (dourado pulsante)
- Zoom para evento mais próximo
- **Pins de parceiros MV**: busca parceiros_mais_vanta ativos com coords JSONB
  - Todos veem os pins âmbar no mapa
  - Só membros MV veem que tem benefício (fase futura: tooltip diferente)
  - Migration: `20260315100000_parceiros_coords.sql`
