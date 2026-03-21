# Criado: 2026-03-06 01:52 | Ultima edicao: 2026-03-06 01:52

# Sub-modulo: Operacoes Offline

## Pertence a: sub_portaria_caixa.md (cross-modulo)

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| services/offlineEventService.ts | 389 | Orquestrador offline (cache + sync) |
| services/offlineDB.ts | 289 | IndexedDB wrapper (CRUD + sync queue) |

## offlineDB.ts (289L) — IndexedDB

### Stores IndexedDB
| Store | Key | Dados |
|---|---|---|
| tickets | id | CachedTicket: id, eventoId, nomeTitular, email, variacaoLabel, status, usadoEm |
| convidados | id | CachedConvidado: id, listaId, eventoId, regraId, nome, telefone, checkedIn, checkedInEm, checkedInPorNome, regraLabel, regraCor |
| lotesVariacoes | id | CachedLoteVariacao: id, eventoId, loteId, loteNome, area, areaCustom, genero, valor, limite, vendidosLocal |
| syncQueue | auto-increment | SyncQueueItem: type, eventoId, payload, timestamp, retries |

### Sync Types
- CHECKIN_TICKET — check-in de ingresso QR
- CHECKIN_LISTA — check-in de convidado lista
- VENDA_CAIXA — venda presencial
- CORTESIA — emissao de cortesia

### Metodos
- `cacheTickets(eventoId, tickets)` — salva tickets no IndexedDB
- `getCachedTickets(eventoId)` — busca tickets do cache
- `cacheConvidados(eventoId, convidados)` — salva convidados
- `getCachedConvidados(eventoId)` — busca convidados
- `cacheLotesVariacoes(eventoId, lotes)` — salva lotes/variacoes
- `getCachedLotesVariacoes(eventoId)` — busca lotes

## offlineEventService.ts (389L) — Orquestrador

### Fluxo offline
```
1. ANTES do evento: portaria/caixa abre tela do evento com internet
   -> offlineEventService carrega e cacheia:
      - Tickets do evento (IndexedDB)
      - Convidados da lista (IndexedDB)
      - Lotes/variacoes (IndexedDB)

2. DURANTE o evento: internet cai
   -> useConnectivity detecta offline
   -> Operacoes (check-in, venda) vao para syncQueue
   -> UI mostra indicador offline

3. INTERNET VOLTA:
   -> offlineEventService processa syncQueue
   -> Para cada item: envia para Supabase
   -> Se erro: incrementa retries, tenta de novo
   -> Sucesso: remove da queue
```

### Hook: useConnectivity
Monitora status de conexao (online/offline) e expoe para componentes.

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | IndexedDB wrapper | OK | offlineDB.ts 289L |
| 2 | Cache tickets | OK | cacheTickets/getCachedTickets |
| 3 | Cache convidados | OK | cacheConvidados/getCachedConvidados |
| 4 | Cache lotes | OK | cacheLotesVariacoes |
| 5 | Sync queue | OK | 4 tipos de sync |
| 6 | Orquestrador | OK | offlineEventService 389L |
| 7 | useConnectivity hook | OK | Detecta online/offline |
| 8 | Retry com backoff | OK | retries no SyncQueueItem |
| 9 | Conflito de dados | NAO EXISTE | Sem resolucao de conflito (last-write-wins implicito) |
| 10 | Indicador visual offline | OK | Componentes mostram status |
