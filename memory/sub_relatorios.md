# Criado: 2026-03-06 01:51 | Ultima edicao: 2026-03-06 01:51

# Sub-modulo: Relatorios & Analytics

## Pertence a: modulo_evento.md + modulo_financeiro_completo.md + modulo_comunidade.md

## Arquivos (9 arquivos, 1772L)
| Arquivo | Linhas | Funcao |
|---|---|---|
| RelatorioEventoView.tsx | 126 | Relatorio por evento (3 tabs) |
| RelatorioComunidadeView.tsx | 273 | Relatorio por comunidade |
| RelatorioMasterView.tsx | 348 | Relatorio master consolidado |
| TabGeral.tsx | 255 | Tab geral (graficos pie, metricas) |
| TabIngressos.tsx | 212 | Tab ingressos (vendas, variacoes) |
| TabListas.tsx | 304 | Tab listas (check-ins, regras, cotas) |
| exportRelatorio.ts | 174 | Export Excel relatorio evento |
| exportRelatorioComunidade.ts | 76 | Export Excel relatorio comunidade |
| index.tsx | 4 | Re-exports |

## RelatorioEventoView — 3 tabs
```
Gerente -> Dashboard evento -> Relatorio
Tab GERAL (TabGeral 255L):
  - Metricas: total vendido, receita, check-ins, % lotacao
  - Graficos pie: por genero, por faixa etaria, por cidade
  - VantaPieChart componente reutilizavel

Tab INGRESSOS (TabIngressos 212L):
  - Vendas por variacao (area, genero, valor)
  - Vendas por lote
  - Cancelamentos

Tab LISTAS (TabListas 304L):
  - Check-ins por regra
  - Cotas por promoter (alocado vs usado)
  - Nomes por regra
```

## RelatorioComunidadeView (273L)
```
Gerente -> Comunidade -> Tab RELATORIO
- Eventos da comunidade (total, receita, check-ins)
- Ranking de eventos por receita
- Export Excel
```

## RelatorioMasterView (348L)
```
Master -> Sidebar "Relatorios"
- Consolidado de todas comunidades
- Receita total, por comunidade, por periodo
- Ranking comunidades
- Export Excel/CSV
```

## Export
- exportRelatorio.ts → Excel (xlsx) com dados do evento
- exportRelatorioComunidade.ts → Excel com dados da comunidade
- Usa utils/exportUtils para geracao do arquivo

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Relatorio evento 3 tabs | OK | 126L + 3 tabs |
| 2 | Tab geral (graficos) | OK | TabGeral 255L + VantaPieChart |
| 3 | Tab ingressos | OK | TabIngressos 212L |
| 4 | Tab listas | OK | TabListas 304L |
| 5 | Relatorio comunidade | OK | 273L |
| 6 | Relatorio master | OK | 348L |
| 7 | Export Excel evento | OK | exportRelatorio.ts 174L |
| 8 | Export Excel comunidade | OK | 76L |
| 9 | Graficos pie | OK | VantaPieChart |
| 10 | PDF export | NAO EXISTE | Apenas Excel |
| 11 | Relatorio em tempo real | NAO EXISTE | Dados carregados on-demand |
| 12 | Agendar relatorio | NAO EXISTE | Sem envio automatico |
