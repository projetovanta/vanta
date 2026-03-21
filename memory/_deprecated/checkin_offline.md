# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Check-in Offline

## Arquivos
- `services/offlineDB.ts` (289L) — IndexedDB cache
- `services/offlineEventService.ts` (389L) — sync offline → online
- Check-in offline funciona via offlineEventService direto (wrappers removidos)

## Fluxo
1. Antes do evento: `offlineEventService` baixa tickets + convidados + lotes para IndexedDB
2. No evento sem internet: check-in local (valida contra cache)
3. Operações ficam na sync queue (IndexedDB)
4. Internet volta: `offlineEventService.sync()` envia tudo pro Supabase

## Tipos Cache
- `CachedTicket`: id, eventoId, nomeTitular, email, variacaoLabel, status
- `CachedConvidado`: id, listaId, nome, telefone, checkedIn, regraLabel
- `CachedLoteVariacao`: id, eventoId, loteId, area, genero, valor, limite, vendidosLocal
- `SyncQueueItem`: type (CHECKIN_TICKET|CHECKIN_LISTA|VENDA_CAIXA|CORTESIA), payload, retries

## API offlineDB
- `cacheTickets(eventoId, tickets)` / `getCachedTickets(eventoId)`
- `cacheConvidados(eventoId, convidados)` / `getCachedConvidados(eventoId)`
- `cacheLotesVariacoes(eventoId, lotes)` / `getCachedLotesVariacoes(eventoId)`
