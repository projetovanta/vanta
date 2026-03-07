# Criado: 2026-03-06 01:46 | Ultima edicao: 2026-03-06 01:46

# Sub-modulo: Promoter (Dashboard + Cotas)

## Pertence a: modulo_listas.md

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| features/admin/views/PromoterDashboardView.tsx | ? | Dashboard do promoter |
| features/admin/views/PromoterCotasView.tsx | ? | Ver/usar cotas |
| features/admin/views/listas/TabNomes.tsx | ? | Tab de nomes inseridos |
| features/admin/views/listas/TabEquipe.tsx | ? | Tab de equipe/cotas |
| features/admin/views/listas/index.tsx | ? | Hub de listas |
| features/admin/views/listas/listasUtils.ts | ? | Utilitarios |
| features/admin/views/eventManagement/TabEquipePromoter.tsx | ? | Tab equipe promoter |

## Fluxo do Promoter
```
Promoter recebe cargo (equipe_evento papel=promoter)
-> AdminGateway libera acesso ao PromoterDashboardView
-> Ve eventos onde tem cota
-> Seleciona evento -> PromoterCotasView
-> Ve suas cotas por regra (VIP: 10/20, CONSUMO: 5/15...)
-> Insere nomes (listasService.inserirConvidado)
-> Nome aparece na lista da portaria
```

### O que o promoter pode fazer:
1. Ver seus eventos (onde tem cota)
2. Ver cotas por regra (alocado vs usado)
3. Inserir nomes (um a um ou em lote)
4. Ver status dos nomes (inserido, checked_in)

### O que o promoter NAO pode fazer:
- Editar regras de lista
- Alterar cotas de outros promoters
- Ver financeiro
- Aprovar eventos

## Comissao
- cotas_promoter tem comissao_tipo (PERCENTUAL/FIXO) e comissao_valor
- pagamentos_promoter registra pagamentos feitos ao promoter
- Fluxo: gerente calcula comissao -> registra pagamento -> promoter recebe

## Checklist
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | PromoterDashboardView | OK | Arquivo existe |
| 2 | PromoterCotasView | OK | Arquivo existe |
| 3 | TabNomes | OK | Lista de nomes inseridos |
| 4 | TabEquipe | OK | Equipe/cotas |
| 5 | Inserir nomes | OK | listasService.inserirConvidado |
| 6 | Inserir em lote | OK | listasService.inserirLote |
| 7 | Comissao config | OK | comissao_tipo + comissao_valor |
| 8 | Pagamentos promoter | OK | Tabela pagamentos_promoter |
| 9 | Notificacao de cota | NAO EXISTE | Promoter nao e notificado |
| 10 | App mobile promoter | NAO EXISTE | Apenas via painel admin |
