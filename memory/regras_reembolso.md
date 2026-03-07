# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Regras de Reembolso

## Arquivos
- `features/admin/services/eventosAdminFinanceiro.ts` (335-500L) — lógica reembolso
- `features/admin/services/reembolsoService.ts` (445L) — CRUD + validação

## Reembolso Automático (CDC Art. 49)
- Janela: até 7 dias após compra E no mínimo 48h antes do evento
- `isReembolsoAutomaticoElegivel(ticket)` → verifica janela
- `processarReembolsoAutomatico(ticketId, solicitadoPor)` → executa sem aprovação humana
- Ticket deve estar DISPONIVEL

## Reembolso Manual
- Fora da janela automática → admin aprova/rejeita
- `aprovarReembolsoManual(ticketId, aprovadorId, motivo)` → com timestamp + quem aprovou
- Status: APROVADO | PENDENTE_APROVACAO | REJEITADO

## Tabela: reembolsos
- id, ticketId, eventoId, tipo (AUTOMATICO|MANUAL), status, motivo, valor
- solicitadoPor, solicitadoEmail, solicitadoNome, aprovadoPor
- solicitadoEm, processadoEm, eventoNome, produtorNome

## Contrato B2B (pendente)
- Documento jurídico: organizador arca com taxa VANTA em caso de cancelamento
- Status: PENDENTE (precisa documento jurídico)

## Chargebacks
- `registrarChargeback(ticketId, motivo, gatewayRef)` → ABERTO
- Depois: DEDUZIDO ou REVERTIDO
- Tabela: chargebacks (id, ticketId, eventoId, valor, motivo, status, gatewayRef, criadoEm)
