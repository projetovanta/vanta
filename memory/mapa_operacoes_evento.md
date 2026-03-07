# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Operações do Dia (Evento)

## Fluxo
Painel Admin → Seleciona evento → SubViews operacionais

## Arquivos Principais
| Arquivo | Função |
|---|---|
| `features/admin/services/eventosAdminTickets.ts` (344L) | Vendas, checkins, QR, cancelar/reenviar ingresso |
| `features/admin/services/eventosAdminFinanceiro.ts` (675L) | Saques, reembolsos, chargebacks, taxas |
| `features/admin/services/listasService.ts` (~620L) | Listas de convidados, promoters, PROMOTERS_CACHE |
| `features/admin/services/cortesiasService.ts` (398L) | Cortesias, envio, aceite |
| `features/admin/services/mesasService.ts` (113L) | Reserva de mesas |
| `services/offlineDB.ts` (289L) | Cache IndexedDB para modo offline |
| `services/offlineEventService.ts` (389L) | Sincronização offline → online |

## Operações
- **Venda porta**: `registrarVendaEfetiva()` → insere ticket no Supabase
- **Check-in**: `validarEQueimarIngresso()` → marca ticket como USADO
- **Cortesias**: `cortesiasService` → enviar, aceitar, recusar
- **Listas**: `listasService` → CRUD convidados, regras, check-in lista
- **Offline**: IndexedDB cache → sync queue → `offlineEventService.sync()`

## Memórias Relacionadas
- Check-in/Caixa: `checkin_caixa.md`
- Check-in Offline: `checkin_offline.md`
