# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Reviews

## Arquivo
- `features/admin/services/reviewsService.ts` (92L)

## API
- `reviewsService.getByEvento(eventoId)` → reviews do evento
- `reviewsService.getByUser(userId)` → reviews do user
- `reviewsService.create(eventoId, userId, rating, texto)` → cria review
- `reviewsService.getMedia(eventoId)` → média + count

## Uso
- EventDetailView → exibe reviews do evento
- ComunidadePublicView → reviews da comunidade
- RelatorioService → reviewMedia no relatório
- ReviewModal (components/) → modal para escrever review
