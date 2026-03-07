# Criado: 2026-03-06 01:00 | Ultima edicao: 2026-03-06 01:00
# graph_admin_evento.md — Admin Evento

## Nos
| ID | Nome | Arquivo principal | Linhas |
|---|---|---|---|
| AE01 | Criar evento (wizard 5 steps) | features/admin/views/CriarEventoView.tsx | 868 |
| AE02 | Editar evento | features/admin/views/EditarEventoView.tsx | 858 |
| AE03 | Dashboard do evento | features/admin/views/eventoDashboard/ | 2441 |
| AE04 | Aprovar/rejeitar evento | features/admin/views/EventosPendentesView.tsx | 676 |
| AE05 | Copiar evento | features/admin/views/criarEvento/CopiarModal.tsx | 178 |
| AE06 | Duplicar evento | features/admin/views/eventoDashboard/DuplicarModal.tsx | 172 |
| AE07 | Gerenciar lotes | features/admin/views/eventoDashboard/EditarLotesSubView.tsx | 250 |
| AE08 | Gerenciar cupons | features/admin/views/eventoDashboard/CuponsSubView.tsx | 214 |
| AE09 | Gerenciar pedidos | features/admin/views/eventoDashboard/PedidosSubView.tsx | 407 |
| AE10 | Analytics do evento | features/admin/views/eventoDashboard/AnalyticsSubView.tsx | 196 |
| AE11 | Editar lista do evento | features/admin/views/eventoDashboard/EditarListaSubView.tsx | 165 |

## Navegacao
| De | Para | Gatilho |
|---|---|---|
| Painel -> Comunidade -> Central Eventos | AE01 Criar | Botao "Criar Evento" |
| AE01 Criar -> TipoEventoScreen | AE01 | Escolhe FESTA_DA_CASA ou COM_SOCIO |
| AE01 Step 5 -> ToS | AE01 | TosAcceptModal obrigatorio antes de publicar |
| Painel -> Comunidade -> Evento existente | AE03 Dashboard | Clica no evento |
| AE03 Dashboard | AE02 Editar | Botao editar no dashboard |
| AE03 Dashboard | AE07 Lotes | Sub-view lotes |
| AE03 Dashboard | AE08 Cupons | Sub-view cupons |
| AE03 Dashboard | AE09 Pedidos | Sub-view pedidos |
| AE03 Dashboard | AE10 Analytics | Sub-view analytics |
| AE03 Dashboard | AE11 Lista | Sub-view editar lista |
| AE03 Dashboard | AE06 Duplicar | Botao duplicar |
| AE01 -> CopiarModal | AE05 Copiar | Botao "Copiar de evento anterior" |
| Painel Master -> Eventos Pendentes | AE04 Aprovar | Sidebar "Eventos Pendentes" |

## Servicos
| Servico | Arquivo | Usado por |
|---|---|---|
| eventosAdminService | features/admin/services/eventosAdminService.ts | AE01-AE11 |
| listasService | features/admin/services/listasService.ts | AE01, AE02, AE11 |
| cortesiasService | features/admin/services/cortesiasService.ts | AE01, AE02, AE07 |
| clubeService | features/admin/services/clubeService.ts | AE01, AE02, AE07 |
| cuponsService | features/admin/services/cuponsService.ts | AE08 |
| adminService | features/admin/services/adminService.ts | AE01 (vanta indica) |

## Tabelas Supabase
| Tabela | Operacao | Usado por |
|---|---|---|
| eventos_admin | INSERT/UPDATE/SELECT | AE01-AE11 |
| lotes | INSERT/UPDATE/SELECT | AE01, AE02, AE07 |
| variacoes_ingresso | INSERT/UPDATE/SELECT | AE01, AE02, AE07 |
| listas_evento | INSERT/UPDATE/SELECT | AE01, AE02, AE11 |
| regras_lista | INSERT/UPDATE | AE01, AE11 |
| cotas_promoter | INSERT | AE01 |
| cortesias_config | INSERT | AE01, AE07 |
| lotes_mais_vanta | INSERT/UPDATE | AE01, AE07 |
| cupons | INSERT/UPDATE/DELETE | AE08 |
| tickets_caixa | SELECT | AE09 |
| vendas_log | SELECT | AE10 |
| equipe_evento | INSERT/UPDATE | AE01, AE02 |
| vanta_indica | INSERT | AE01 (auto-card) |

## Fluxos end-to-end (cadeia completa)

### 1. CRIAR EVENTO
```
Gerente/socio abre Painel -> Comunidade -> Central Eventos -> Criar

Escolhe tipo: FESTA_DA_CASA ou COM_SOCIO

Step 1 DADOS: nome, descricao, foto (upload+crop), datas inicio/fim,
  formato, estilos, experiencias

Step 2 INGRESSOS: N lotes, cada um com M variacoes
  (area: Pista/VIP/Camarote/etc, genero, valor, limite)
  Virada automatica por % vendido ou data
  Lotes MAIS VANTA por tier (opcional)

Step 3 LISTAS: regras de lista de entrada
  (tipo VIP/CONSUMO/ENTRADA, teto, cor, valor, hora corte)
  Distribuir cotas por membro da equipe

Step 4 EQUIPE:
  FESTA_DA_CASA: gerente + permissoes + equipe (portaria, caixa, etc)
  COM_SOCIO: convite socio + split % produtor/socio + permissoes

Step 5 FINANCEIRO: aceitar ToS (obrigatorio)

AO FINALIZAR:
1. eventosAdminService.criarEvento -> INSERT eventos_admin
   Status: PENDENTE (casa) ou NEGOCIANDO (socio)
   publicado: false
2. INSERT lotes + variacoes_ingresso
3. cortesiasService.initCortesia (se habilitado)
4. clubeService.upsertLotesMaisVanta (se MV ativo, por tier)
5. adminService.addCard -> INSERT vanta_indica (card inativo auto)
6. listasService.criarLista -> INSERT listas_evento + regras_lista
7. listasService.distribuirCota -> INSERT cotas_promoter (por membro)

CONSEQUENCIAS:
-> Master ve evento em EventosPendentesView (status PENDENTE)
-> Se COM_SOCIO: socio recebe convite (aceitar/recusar/contrapropor)
-> Card Vanta Indica criado (inativo, master pode ativar)
-> Listas prontas pra promoters inserirem nomes
-> Evento NAO aparece no feed ate ser aprovado + publicado
```

### 2. APROVAR EVENTO (master)
```
Master abre EventosPendentesView -> ve eventos com status PENDENTE
-> Pode definir taxa customizada (override vanta_fee)
-> Aprovar: eventos_admin.update(publicado:true, status:'APROVADO')
-> Rejeitar: eventos_admin.update(status:'REJEITADO')

Se APROVADO:
-> Evento aparece no feed (HomeView, SearchView, RadarView)
-> Evento aparece na pagina publica da comunidade
-> Usuarios podem comprar ingressos
-> Landing page /evento/:slug fica ativa
```

### 3. EDITAR EVENTO
```
Gerente abre Dashboard do evento -> Editar
-> EditarEventoView (mesmos 5 steps, preenchidos)
-> Salva: eventos_admin.update + lotes.update + listas.update
-> Mudancas refletem imediatamente no feed e detalhe
```

### 4. DASHBOARD DO EVENTO
```
Gerente abre evento -> Dashboard com sub-views:
- Analytics: graficos vendas/dia, por variacao, por origem (Recharts)
- Lotes: editar inline, ativar/desativar, ajustar precos/limites
- Cupons: criar/ativar/desativar/remover cupons de desconto
- Pedidos: listar tickets vendidos, filtrar, exportar CSV, cancelar
- Lista: editar regras, ver status das cotas
- Duplicar: copiar config pra novo evento
```

### 5. COPIAR EVENTO
```
Ao criar novo evento -> CopiarModal -> seleciona evento anterior
-> Preenche automaticamente: lotes, variacoes, listas, equipe
-> Admin ajusta o que quiser -> segue wizard normal
```

## Checklist de Status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Wizard 5 steps | OK | CriarEventoView 868L completo |
| 2 | Tipo FESTA_DA_CASA | OK | TipoEventoScreen + fluxo gerente |
| 3 | Tipo COM_SOCIO | OK | Convite socio + split + RPCs aceitar/recusar/contrapropor |
| 4 | Lotes + variacoes | OK | INSERT lotes + variacoes_ingresso |
| 5 | Lotes MAIS VANTA | OK | Por tier, com prazo e acompanhantes |
| 6 | Listas de entrada | OK | Regras + cotas + distribuicao |
| 7 | Cortesias | OK | cortesiasService.initCortesia |
| 8 | Vanta Indica auto | OK | Card criado inativo automaticamente |
| 9 | Aprovacao master | OK | EventosPendentesView 676L |
| 10 | Editar evento | OK | EditarEventoView 858L |
| 11 | Dashboard analytics | OK | Recharts + vendas_log |
| 12 | Cupons | OK | CuponsSubView CRUD completo |
| 13 | Pedidos + export | OK | PedidosSubView com CSV |
| 14 | Duplicar | OK | DuplicarModal |
| 15 | ToS obrigatorio | OK | TosAcceptModal antes de publicar |
| 16 | Pagamento real | NAO EXISTE | Checkout gera tickets mas NAO cobra dinheiro |
