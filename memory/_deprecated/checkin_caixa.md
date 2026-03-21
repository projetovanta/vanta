# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Check-in / Caixa / QR

## Arquivos
- `features/admin/services/eventosAdminTickets.ts` (344L) — vendas e check-in
- `features/admin/services/jwtService.ts` (57L) — JWT para QR

## Fluxo Check-in
1. Portaria escaneia QR → `verifyTicketToken(token)` → ticketId
2. `validarEQueimarIngresso(ticketId, eventoId)` → marca USADO
3. Resultado: VALIDO | JA_UTILIZADO | EVENTO_INCORRETO | INVALIDO

## Fluxo Caixa (Venda Porta)
1. Seleciona variação → `registrarVendaEfetiva(input)` → cria ticket
2. Ticket status DISPONIVEL → QR gerado

## Tipos Importantes
- `TicketCaixa`: id, eventoId, variacaoId, valor, email, nomeTitular, cpf, status, etc
- `ValidacaoIngresso`: VALIDO | JA_UTILIZADO | EVENTO_INCORRETO | INVALIDO
- `OrigemIngresso`: ANTECIPADO | PORTA | LISTA | CORTESIA

## Checkins por Origem
`getCheckinsPorOrigem(eventoId)` → {antecipado, porta, cortesia}

## JWT QR
- `signTicketToken(ticketId)` → token JWT assinado
- `verifyTicketToken(token)` → {valid, ticketId}
