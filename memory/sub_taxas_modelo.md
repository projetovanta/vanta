# Criado: 2026-03-07 | Ultima edicao: 2026-03-07
# Sub-Modulo: Taxas VANTA

## Modelo de Taxas
Todos os campos sao negociaveis por evento. Master tem autonomia total.
Pode zerar tudo (evento gratis pra VANTA) ou definir valores altos.

## Campos

| Campo | Tipo | Default | Onde define | Descricao |
|---|---|---|---|---|
| taxa_servico_percent | NUMERIC(5,4) | Master define | Comunidade (default) + Evento (override) | % sobre ingressos vendidos no app |
| taxa_processamento_percent | NUMERIC(5,4) | 0.025 (2,5%) | Comunidade + Evento | % processamento gateway, sempre produtor |
| taxa_porta_percent | NUMERIC(5,4) | = servico | Comunidade + Evento | % sobre vendas na porta (caixa + lista paga) |
| taxa_minima | NUMERIC(10,2) | 2.00 | Comunidade + Evento | Valor minimo por ingresso no app |
| taxa_fixa_evento | NUMERIC(10,2) | 0 | Evento | Custo fixo do evento (opcional, independe de receita) |
| quem_paga_servico | TEXT | PRODUTOR_ESCOLHE | Evento | PRODUTOR_ABSORVE, COMPRADOR_PAGA, PRODUTOR_ESCOLHE |
| cota_nomes_lista | INTEGER | 500 | Comunidade + Evento | Nomes gratis na lista |
| taxa_nome_excedente | NUMERIC(10,2) | 0.50 | Comunidade + Evento | R$ por nome acima da cota |
| cota_cortesias | INTEGER | 50 | Comunidade + Evento | Cortesias gratis |
| taxa_cortesia_excedente_pct | NUMERIC(5,4) | 0.05 (5%) | Comunidade + Evento | % do valor face por cortesia excedente |
| prazo_pagamento_dias | INTEGER | null (negociado) | Evento | Dias apos evento pra acerto |

## Heranca
Comunidade = template de defaults (master define)
Evento herda da comunidade automaticamente
Produtor pode modificar na criacao do evento
Master ve diferencas vs default na aprovacao
Master aprova, rejeita ou contrapropoe

## Fluxo
1. Master define defaults na comunidade
2. Produtor cria evento -> ve taxas herdadas -> pode modificar
3. Evento vai pra aprovacao (status PENDENTE)
4. Master ve: valores do produtor vs defaults da comunidade (highlight diferencas)
5. Master aprova, rejeita ou contrapropoe
6. Se contraproposta: produtor aceita ou faz nova contraproposta (max 3 rodadas)

## Regras de cobranca
- Ingressos app: taxa_servico + taxa_processamento (min taxa_minima)
- Porta (caixa + lista pagante): taxa_porta
- Lista gratis: R$0 ate cota_nomes_lista, depois taxa_nome_excedente
- Cortesia: R$0 ate cota_cortesias, depois taxa_cortesia_excedente_pct sobre valor face
- taxa_fixa_evento: cobrada independente de receita (se > 0)
- Eventos 100% gratis: master pode zerar tudo

## Quem paga servico (app)
- PRODUTOR_ABSORVE: comprador paga valor do ingresso, produtor absorve taxa
- COMPRADOR_PAGA: taxa adicionada ao valor do ingresso
- PRODUTOR_ESCOLHE: produtor define na criacao do evento

## Campos existentes (compatibilidade mantida)
- comunidades: vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode (originais) + 7 novos campos de taxas avancadas
- eventos_admin: vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode, taxa_override (originais) + 10 novos campos

## Implementacao
- Migration: `20260307100000_taxas_modelo_completo.sql` (7 cols comunidades + 10 cols eventos_admin)
- Tipos TS: `Comunidade` (tipos/eventos.ts L42-51), `EventoAdmin` (L301-314), `ContractedFees` (eventosAdminTypes.ts)
- Service comunidade: mapper + atualizar (comunidadesService.ts L37-44, L190-198)
- Service evento: mapper (eventosAdminCore.ts L151-162), CRUD (eventosAdminCrud.ts L60-70, L259-270)
- getContractedFees: 3-level inheritance com pick() (eventosAdminFinanceiro.ts)
- setContractedFees: update + cache sync (eventosAdminFinanceiro.ts)
- aprovarEvento: 11 campos de taxas (eventosAdminAprovacao.ts)

## Fluxo de aceite formal (condições comerciais)
- Migration: `20260316100000_condicoes_comerciais.sql` (tabela condicoes_comerciais + campos comunidades)
- Tipos TS: `CondicaoComercial`, `CondicaoStatus` (tipos/eventos.ts)
- Service: condicoesService.ts (definir/aceitar/recusar/histórico/resumoGlobal)
- Edge Function: `expirar-condicoes` (cron 1x/dia, expira pendentes > 7 dias, pausa comunidade)
- RLS: master tudo, sócio/gerente lê e aceita/recusa (via atribuicoes_rbac + dono_id)
- Master define → sócio tem 7 dias → aceita ou recusa → se ignora, comunidade pausada

## Telas
| Tela | Arquivo | Status |
|---|---|---|
| Criar comunidade (defaults) | criarComunidade/Step1Identidade.tsx | OK |
| Editar comunidade (defaults) | comunidades/EditarModal.tsx | OK |
| Aprovacao evento (acordo financeiro) | EventosPendentesView.tsx | OK |
| Resumo evento (calculo) | comunidades/ResumoEventoModal.tsx (ResumoEventoView) | OK |
| Condições comerciais (master) | comunidades/ComercialTab.tsx | OK |
| Condições comerciais (sócio) | CondicoesProducerView.tsx | OK |
| Resumo condições (financeiro master) | masterFinanceiro/index.tsx (CondicoesResumoCard) | OK |
| Financeiro (fallback) | financeiro/index.tsx | OK |
