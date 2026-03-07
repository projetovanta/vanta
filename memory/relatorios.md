# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Relatórios

## Arquivo
- `features/admin/services/relatorioService.ts` (124L)

## API
`gerarRelatorio(eventoId)` → `RelatorioEvento | null`

## RelatorioEvento
- eventoId, eventoNome, dataInicio, dataFim, local
- totalVendidos, receitaBruta, receitaLiquida, ticketMedio
- vendasPorOrigem: {antecipado, porta, cortesia}
- vendasPorVariacao: [{label, qtd, receita}]
- totalCheckins, checkinsPorOrigem
- taxaConversao (checkins/vendidos)
- cortesiasEnviadas
- feePercent, gatewayMode, valorTaxa
- reviewMedia, reviewCount
- reembolsosAprovados, totalReembolsos

## Dependências
Usa: eventosAdminService, eventosAdminFinanceiro, listasService, reviewsService, reembolsoService
