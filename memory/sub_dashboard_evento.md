# Criado: 2026-03-06 01:45 | Ultima edicao: 2026-03-06 01:45

# Sub-modulo: Dashboard do Evento (8 sub-views)

## Pertence a: modulo_evento.md

## Arquivos (8 arquivos, 2441L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| index.tsx | 889 | EventoDashboard — hub principal com tabs/sub-views |
| AnalyticsSubView.tsx | 196 | Graficos de vendas (Recharts) |
| CuponsSubView.tsx | 214 | CRUD de cupons de desconto |
| PedidosSubView.tsx | 407 | Lista de tickets vendidos + cancelar + CSV export |
| EditarLotesSubView.tsx | 250 | Editar lotes + variacoes inline |
| EditarListaSubView.tsx | 165 | Editar regras de lista |
| ComemoracaoConfigSubView.tsx | 250 | Config faixas comemoracao por evento |
| DuplicarModal.tsx | 172 | Copiar config para novo evento |
| eventoDashboardUtils.ts | 148 | Utilitarios: agruparPorDia, agruparPorOrigem, agruparPorVariacao, calcPicoVendas, contarPorCanal |

## index.tsx (EventoDashboard, 889L) — Hub principal
**Tabs/Secoes**:
- Resumo: dados do evento + metricas principais + contadores
- Analytics: AnalyticsSubView
- Lotes: EditarLotesSubView
- Cupons: CuponsSubView
- Pedidos: PedidosSubView
- Lista: EditarListaSubView
- Comemoracao: ComemoracaoConfigSubView
- Editar: navega para EditarEventoView
- Duplicar: DuplicarModal
- Participantes: ParticipantesView
- Relatorio: navegacao para relatorios

**Imports criticos**: eventosAdminService, listasService, cortesiasService, eventosAdminFinanceiro, permissoes

## Sub-views detalhadas

### AnalyticsSubView (196L)
**Dados**: vendas_log do evento
**Graficos (Recharts)**:
- Vendas por dia (line chart)
- Vendas acumuladas (area chart)
- Por variacao (bar chart com qtd, receita, %)
- Por origem (pie chart: antecipado/porta/cortesia/lista)
- Pico de vendas (hora com mais vendas)
**Funcoes utils**: agruparPorDia, agruparPorOrigem, agruparPorVariacao, agruparAcumulado, calcPicoVendas, contarPorCanal

### CuponsSubView (214L)
**CRUD completo**:
- Criar cupom: codigo, tipo (PERCENTUAL/FIXO), valor, limite_usos, validade
- Ativar/desativar cupom
- Remover cupom
**Service**: cuponsService

### PedidosSubView (407L)
**Funcionalidades**:
- Lista todos tickets vendidos do evento
- Filtros: status, tipo, busca por nome/email
- Export CSV
- Cancelar ingresso individual
- Ver detalhes do ticket
**Service**: eventosAdminService (getTicketsCaixaByEvento, cancelarIngresso)

### EditarLotesSubView (250L)
**Funcionalidades**:
- Editar lotes e variacoes inline (mesmo componente Step2Ingressos reutilizado)
- Ativar/desativar lote
- Ajustar precos e limites
- Atualizar cortesias
- Atualizar lotes MV
**Services**: eventosAdminService, cortesiasService, clubeService

### EditarListaSubView (165L)
**Funcionalidades**:
- Editar regras de lista (reutiliza Step3Listas)
- Atualizar via listasService.atualizarRegras

### DuplicarModal (172L)
**Funcionalidades**:
- Seleciona novo nome e data
- Copia: lotes, variacoes, listas, equipe do evento atual
- Cria novo evento com dados copiados

## Componentes extras

### PublicoDrilldown (features/admin/views/comunidades/PublicoDrilldown.tsx, 356L)
Drill-down interativo de publico por origem. Usado no ResumoEventoModal.
- Raiz: Publico por Origem (Ingressos App, Lista VIP, Lista Pagante, Cortesia)
- Nivel 2 Ingressos: por Lote -> por Variacao (area+genero)
- Nivel 2 Listas: por Promoter -> por Regra -> Pessoas (nome + check-in time)
- Breadcrumb navigation com goBack/goTo
- Usa VantaPieChart com onSliceClick e selectedName

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Hub com tabs | OK | index.tsx 889L |
| 2 | Analytics graficos | OK | 5 tipos de grafico Recharts |
| 3 | CRUD cupons | OK | CuponsSubView 214L |
| 4 | Lista pedidos + filtro | OK | PedidosSubView 407L |
| 5 | Export CSV | OK | Funcao de export |
| 6 | Cancelar ingresso | OK | cancelarIngresso |
| 7 | Editar lotes inline | OK | EditarLotesSubView 250L |
| 8 | Editar lista | OK | EditarListaSubView 165L |
| 9 | Duplicar evento | OK | DuplicarModal 172L |
| 10 | Utils analytics | OK | 6 funcoes de agrupamento |
| 11 | Reembolso do dashboard | OK | Via PedidosSubView |
| 12 | Participantes view | OK | Integrado no hub |
| 13 | Loading/skeleton states | NAO EXISTE | Sem skeleton no dashboard |
| 14 | Tempo real (realtime) | NAO EXISTE | Dashboard nao atualiza em tempo real |
| 15 | Drill-down publico | OK | PublicoDrilldown 356L — donut interativo por origem |
