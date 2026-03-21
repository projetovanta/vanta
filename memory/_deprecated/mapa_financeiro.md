# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Financeiro

## Arquivos Principais
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/services/eventosAdminFinanceiro.ts` | 675 | Saques, reembolsos, chargebacks, taxas |
| `features/admin/services/eventosAdminTypes.ts` | 115 | Tipos: SolicitacaoSaque, Reembolso, Chargeback, ContractedFees |
| `features/admin/services/reembolsoService.ts` | 445 | CRUD reembolsos + lógica elegibilidade |
| `features/admin/services/relatorioService.ts` | 124 | Geração de relatório por evento |
| `features/admin/services/dashboardAnalyticsService.ts` | 173 | Métricas dashboard master (vendas, lucro VANTA) |

## Taxas (modelo completo — ver sub_taxas_modelo.md)
- `ContractedFees`: 13 campos com 3-level inheritance (defaults → comunidade → evento)
- Campos: taxaServico, taxaFixa, gatewayFeeMode, taxaProcessamento, taxaPorta, taxaMinima, taxaFixaEvento, quemPagaServico, cotaNomesLista, taxaNomeExcedente, cotaCortesias, taxaCortesiaExcedentePct, prazoPagamentoDias
- `getContractedFees(eventoId)` — pick() com fallback 3 niveis
- `setContractedFees(eventoId, fees)` — update + cache sync
- `gatewayMode`: ABSORVER (organizador paga) ou REPASSAR (cliente paga)
- `calcGatewayCost()`: custo gateway por método (crédito vs PIX)

## Saques
- `solicitarSaque()` → cria solicitação (PENDENTE)
- `confirmarSaque()` → muda para CONCLUIDO
- `estornarSaque()` → muda para ESTORNADO
- Todos com timestamp + operadorId

## Reembolsos
- Automático: `isReembolsoAutomaticoElegivel()` → `processarReembolsoAutomatico()`
- Manual: `aprovarReembolsoManual()`
- Regras detalhadas em `regras_reembolso.md`

## Chargebacks
- `registrarChargeback()` → status ABERTO → DEDUZIDO/REVERTIDO

## Relatórios
- `gerarRelatorio(eventoId)` → RelatorioEvento com todas métricas
