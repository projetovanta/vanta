# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Módulo Financeiro

## Arquivos
- `features/admin/services/eventosAdminFinanceiro.ts` (675L) — lógica principal
- `features/admin/services/eventosAdminTypes.ts` (115L) — tipos
- `features/admin/services/reembolsoService.ts` (445L) — reembolsos
- `features/admin/services/relatorioService.ts` (124L) — relatórios

## Taxas (eventosAdminTypes.ts)
- `VANTA_FEE` — taxa padrão plataforma
- `GATEWAY_CREDITO_PERCENT` / `GATEWAY_CREDITO_FIXO` — custo cartão
- `GATEWAY_PIX_PERCENT` — custo PIX
- `ContractedFees` → override por evento/comunidade (feePercent, feeFixed, gatewayMode)
- `gatewayMode`: ABSORVER (organizador) | REPASSAR (cliente)

## Saques
- `solicitarSaque()` → cria SolicitacaoSaque (PENDENTE)
- `confirmarSaque()` → CONCLUIDO + timestamp + operadorId
- `estornarSaque()` → ESTORNADO + timestamp + operadorId
- Tabela: `solicitacoes_saque`

## Reembolsos
- Automático: até X dias antes do evento → `processarReembolsoAutomatico()`
- Manual: admin aprova/rejeita → `aprovarReembolsoManual()`
- Tabela: `reembolsos`
- Regras detalhadas: `regras_reembolso.md`

## Chargebacks
- `registrarChargeback()` → ABERTO → DEDUZIDO/REVERTIDO
- Tabela: `chargebacks`

## Lucro VANTA (Dashboard Master)
Calculado via `transactions`: soma(valor_bruto - valor_liquido)
