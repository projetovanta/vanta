# Criado: 2026-03-06 01:26 | Ultima edicao: 2026-03-07

# Modulo: Evento (Admin)

## O que e
Evento = festa, balada, show. Criado por gerente/socio dentro de uma comunidade.
Sem evento nao existe ingresso, lote, lista, check-in, financeiro, analytics.
E o segundo bloco fundamental — depende de comunidade, alimenta todo o resto.

## Tabelas Supabase

### eventos_admin (tabela principal)
| Coluna | Tipo | Obrigatorio | Origem | Descricao |
|---|---|---|---|---|
| id | UUID PK | auto | schema.sql | gen_random_uuid() |
| comunidade_id | UUID FK comunidades | sim | schema.sql | Comunidade dona do evento |
| nome | TEXT | sim | schema.sql | Nome do evento |
| descricao | TEXT | sim | schema.sql | Descricao (default '') |
| data_inicio | TIMESTAMPTZ | sim | schema.sql | Data/hora inicio |
| data_fim | TIMESTAMPTZ | nao | schema.sql | Data/hora fim |
| local | TEXT | sim | schema.sql | Nome do local (default '') |
| endereco | TEXT | nao | schema.sql | Endereco completo |
| cidade | TEXT | nao | schema.sql | Cidade |
| foto | TEXT | nao | schema.sql | URL foto (bucket eventos) |
| coords | JSONB | nao | schema.sql | {lat, lng} |
| publicado | BOOLEAN | sim | schema.sql | Default false — so true apos aprovacao |
| caixa_ativo | BOOLEAN | sim | schema.sql | Default false — habilita caixa presencial |
| taxa_override | NUMERIC(5,4) | nao | schema.sql | @deprecated — alias compatibilidade |
| vanta_fee_percent | NUMERIC(5,4) | nao | schema.sql | Taxa VANTA % (NULL = herda comunidade) |
| vanta_fee_fixed | NUMERIC(10,2) | sim | schema.sql | Taxa fixa por ingresso (default 0) |
| taxa_processamento_percent | NUMERIC(5,4) | nao | migration | Gateway % (NULL = herda comunidade) |
| taxa_porta_percent | NUMERIC(5,4) | nao | migration | % porta (NULL = herda) |
| taxa_minima | NUMERIC(10,2) | nao | migration | Minimo por ingresso (NULL = herda) |
| taxa_fixa_evento | NUMERIC(10,2) | nao | migration | Custo fixo do evento (default 0) |
| quem_paga_servico | TEXT | nao | migration | PRODUTOR_ABSORVE / COMPRADOR_PAGA / PRODUTOR_ESCOLHE |
| cota_nomes_lista | INTEGER | nao | migration | Nomes gratis lista (NULL = herda) |
| taxa_nome_excedente | NUMERIC(10,2) | nao | migration | R$/nome excedente (NULL = herda) |
| cota_cortesias | INTEGER | nao | migration | Cortesias gratis (NULL = herda) |
| taxa_cortesia_excedente_pct | NUMERIC(5,4) | nao | migration | % cortesia excedente (NULL = herda) |
| prazo_pagamento_dias | INTEGER | nao | migration | Dias apos evento pra acerto |
| gateway_fee_mode | TEXT | sim | schema.sql | ABSORVER ou REPASSAR (default ABSORVER) |
| created_by | UUID FK profiles | nao | schema.sql | Quem criou |
| created_at | TIMESTAMPTZ | auto | schema.sql | now() |
| updated_at | TIMESTAMPTZ | auto | schema.sql | trigger set_updated_at() |
| tipo_fluxo | TEXT | nao | migration | FESTA_DA_CASA ou COM_SOCIO |
| status_evento | TEXT | nao | migration | RASCUNHO, PENDENTE, NEGOCIANDO, EM_REVISAO, ATIVO, EM_ANDAMENTO, FINALIZADO, CANCELADO |
| socio_convidado_id | UUID FK auth.users | nao | migration | DEPRECATED — usar socios_evento |
| split_produtor | INTEGER | nao | migration | DEPRECATED — usar socios_evento |
| split_socio | INTEGER | nao | migration | DEPRECATED — usar socios_evento |
| permissoes_produtor | TEXT[] | nao | migration | Permissoes do produtor no evento |
| motivo_rejeicao | TEXT | nao | migration | Motivo se rejeitado pelo master |
| rejeicao_campos | JSONB | nao | migration | Campos apontados na rejeicao {campo: comentario} |
| rodada_rejeicao | SMALLINT | nao | migration | Contador de rodadas rejeicao (0=nunca, max 3) |
| rodada_negociacao | SMALLINT | nao | migration | Contador de rodadas de negociacao socio |
| categoria | TEXT | nao | migration | Categoria do evento |
| subcategorias | TEXT[] | nao | migration | Array de subcategorias |
| estilos | TEXT[] | nao | migration | Array de estilos musicais |
| experiencias | TEXT[] | nao | migration | Array de experiencias oferecidas |
| edicao_pendente | JSONB | nao | migration | Dados da edicao aguardando aprovacao |
| edicao_status | TEXT | nao | migration | Status da edicao pendente |
| edicao_motivo | TEXT | nao | migration | Motivo da edicao |
| mesas_ativo | BOOLEAN | nao | migration | Default false — habilita mesas/camarotes |
| planta_mesas | TEXT | nao | migration | Layout da planta de mesas |
| cancelamento_solicitado_por | UUID FK profiles | nao | migration | Quem pediu cancelamento |
| cancelamento_motivo | TEXT | nao | migration | Motivo do cancelamento |
| cancelamento_etapa | TEXT | nao | migration | Etapa do fluxo de cancelamento |
| slug | TEXT UNIQUE | nao | migration | URL amigavel /evento/:slug |
| recorrencia | TEXT | nao | migration | UNICO (default), SEMANAL, QUINZENAL, MENSAL |
| recorrencia_ate | DATE | nao | migration | Data limite para gerar ocorrencias |
| evento_origem_id | UUID FK eventos_admin | nao | migration | Evento raiz da serie recorrente |

### RPCs de Evento Recorrente (migration evento_recorrente_v2)
| RPC | Parametros | Funcao |
|---|---|---|
| `gerar_ocorrencias_recorrente` | p_evento_id | Gera ocorrencias futuras copiando lotes/variacoes/equipe |
| `cancelar_serie_recorrente` | p_evento_origem_id | Cancela datas futuras nao publicadas |
| `get_ocorrencias_serie` | p_evento_origem_id | Lista todas ocorrencias da serie com vendidos |

### UI: SerieChips (features/admin/views/eventoDashboard/SerieChips.tsx)
- Chips horizontais com datas da serie
- Navegacao entre ocorrencias via `onSelectOcorrencia`
- Modal para cancelar datas futuras nao publicadas
- Integrado no EventoDashboard entre Hero e KPIs

### socios_evento (NOVO — multi-socio)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin ON DELETE CASCADE | Evento |
| socio_id | UUID FK profiles | Socio convidado |
| split_percentual | INTEGER (0-100) | % do socio neste evento |
| permissoes | TEXT[] | Permissoes do socio |
| status | TEXT | PENDENTE, NEGOCIANDO, ACEITO, RECUSADO, CANCELADO, EXPIRADO |
| rodada_negociacao | INTEGER | Contador (max 3) |
| mensagem_negociacao | TEXT | Ultima mensagem |
| motivo_rejeicao | TEXT | Motivo se recusou |
| ultimo_turno | TEXT | 'produtor' ou 'socio' — quem fez a ultima proposta |
| prazo_resposta | TIMESTAMPTZ | Data limite pra responder (48h) |
| historico_propostas | JSONB | Array: [{rodada, de, acao, percentual, mensagem, created_at}] |
| UNIQUE | (evento_id, socio_id) | 1 registro por socio/evento |

**Regra**: Um evento pode ter N socios. Split do produtor = 100 - SUM(split_percentual). Aceitar = evento PUBLICADO automaticamente. Negociacao turn-based (max 3 rodadas, 48h por turno). Ver `sub_negociacao_socio.md` para design completo.

### equipe_evento
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento |
| membro_id | UUID FK profiles | Membro da equipe |
| papel | TEXT | portaria, caixa, promoter, gerente, socio |
| liberar_lista | BOOLEAN | Se pode gerenciar lista (default false) |
| created_at | TIMESTAMPTZ | auto |
| UNIQUE | (evento_id, membro_id, papel) | |

### lotes
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento |
| nome | TEXT | Nome do lote (1o Lote, 2o Lote...) |
| data_validade | TIMESTAMPTZ | Data de virada automatica |
| ativo | BOOLEAN | Default true |
| ordem | INTEGER | Ordem de exibicao (default 0) |
| created_at | TIMESTAMPTZ | auto |

### variacoes_ingresso
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| lote_id | UUID FK lotes | Lote pai |
| area | TEXT | PISTA, VIP, CAMAROTE (default PISTA) |
| area_custom | TEXT | Nome custom da area |
| genero | TEXT | UNISEX, MASCULINO, FEMININO (default UNISEX) |
| valor | NUMERIC(10,2) | Preco (default 0) |
| limite | INTEGER | Quantidade disponivel (default 100) |
| vendidos | INTEGER | Contador de vendidos (default 0, CHECK >= 0) |
| created_at | TIMESTAMPTZ | auto |

## Servicos

### eventosAdminService (features/admin/services/eventosAdminService.ts)
**Core:**
- `refresh()` — carrega todos eventos do Supabase em cache
- `getEventos()` — retorna cache
- `getEvento(id)` — busca por ID
- `getEventosByComunidade(id)` — filtro por comunidade
- `getNomeById(id)` — retorna so o nome

**CRUD:**
- `criarEvento(data)` — INSERT eventos_admin + lotes + variacoes + equipe + listas
- `updateEvento(id, data)` — UPDATE eventos_admin
- `submeterEdicao(id, data)` — salva edicao_pendente (JSONB) para aprovacao
- `aprovarEdicao(id)` — aplica edicao_pendente, limpa status
- `rejeitarEdicao(id, motivo)` — rejeita edicao, define motivo
- `solicitarCancelamento(id, motivo)` — inicia fluxo de cancelamento
- `notificarEscalacao(id)` — escala para master

**Aprovacao:**
- `getEventosPendentes()` — SELECT status_evento = PENDENTE
- `aprovarEvento(id)` — UPDATE publicado=true, status=APROVADO
- `rejeitarEvento(id, motivo)` — UPDATE status=REJEITADO, motivo_rejeicao
- `getConvitesPendentes()` — convites socio pendentes
- `aceitarConvite(id)` — socio aceita
- `recusarConvite(id)` — socio recusa
- `reenviarConvite(id)` — reenvia convite
- `contraPropostaConvite(id, dados)` — contraproposta de split

**Financeiro:**
- `getContractedFees(id)` — taxas contratadas
- `setContractedFees(id, fees)` — define taxas
- `getSaldoFinanceiro(id)` — saldo do evento
- `solicitarSaque(id)` — pedido de saque
- `confirmarSaque(id)` — master confirma
- `estornarSaque(id)` — estorna saque
- `processarReembolsoAutomatico(id)` — reembolso auto
- `aprovarReembolsoManual(id)` — reembolso manual
- `registrarChargeback(id)` — chargeback
- E mais 10 metodos financeiros

**Tickets/Vendas:**
- `registrarVenda(data)` — registra venda
- `registrarVendaEfetiva(data)` — venda efetiva
- `getVendasLog(id)` — log de vendas
- `registrarCortesia(data)` — cortesia
- `getCheckinsIngresso(id)` — check-ins
- `validarEQueimarIngresso(data)` — valida + queima QR
- `addTicketToCaixa(data)` — venda presencial
- `editarTitular(data)` — mudar titular
- `cancelarIngresso(id)` — cancela ingresso
- `reenviarIngresso(id)` — reenvia por email

## Storage
- Bucket: `eventos`
- Path: `{eventoId}/capa.jpg` (foto principal)

## Fluxos

### CRIAR EVENTO
**Quem**: Gerente ou socio com permissao
**Navegacao**: Bottom nav Admin -> AdminGateway -> AdminDashboardView -> Comunidade -> Central Eventos -> Botao "Criar Evento" -> TipoEventoScreen -> CriarEventoView (5 steps)

**Steps do wizard** (CriarEventoView.tsx, 868L):
- Step 1 DADOS: nome, descricao, foto (upload+crop), data inicio/fim, categoria, subcategorias, estilos, experiencias
- Step 2 INGRESSOS: N lotes, cada um com M variacoes (area, genero, valor, limite). Virada automatica por % ou data. Lotes MAIS VANTA opcionais por tier
- Step 3 LISTAS: regras de lista de entrada (tipo VIP/CONSUMO/ENTRADA, teto, cor, valor, hora corte). Distribuir cotas por membro
- Step 4 EQUIPE: FESTA_DA_CASA = gerente + equipe. COM_SOCIO = convite socio + split % + permissoes
- Step 5 FINANCEIRO: aceitar ToS (TosAcceptModal obrigatorio)

**Reacao no sistema (7 inserts + 1 trigger)**:
1. INSERT eventos_admin (status PENDENTE ou NEGOCIANDO)
2. INSERT lotes + variacoes_ingresso
3. cortesiasService.initCortesia (se habilitado)
4. clubeService.upsertLotesMaisVanta (se MV ativo)
5. adminService.addCard -> INSERT vanta_indica (card inativo auto)
6. listasService.criarLista -> INSERT listas_evento + regras_lista
7. listasService.distribuirCota -> INSERT cotas_promoter
8. trigger `vincular_comemoracao_evento`: vincula comemoracoes pendentes da mesma comunidade+data

**Quem recebe**:
- Master: ve evento em EventosPendentesView (sidebar "Eventos Pendentes")
- Socio (se COM_SOCIO): recebe convite para aceitar/recusar/contrapropor
- Promoters: cotas de lista prontas para inserir nomes
- Card Vanta Indica: criado inativo, master pode ativar

**O que desbloqueia**: aprovacao, lotes, listas, equipe, caixa, financeiro, analytics, landing page

### APROVAR EVENTO (master)
**Quem**: Master admin
**Navegacao**: Painel Master -> Sidebar "Eventos Pendentes" -> EventosPendentesView
**O que acontece**:
- Master ve eventos com status PENDENTE
- Pode definir taxa customizada (override vanta_fee)
- Aprovar: UPDATE publicado=true, status=APROVADO
- Rejeitar: UPDATE status=REJEITADO, motivo_rejeicao

**Consequencias da aprovacao**:
- Evento aparece no feed (HomeView, SearchView, RadarView)
- Evento aparece na pagina publica da comunidade
- Usuarios podem comprar ingressos
- Landing page /evento/:slug fica ativa (SEO)

### EDITAR EVENTO
**Quem**: Gerente ou socio com permissao
**Navegacao**: Dashboard evento -> Botao editar -> EditarEventoView (858L)
**O que acontece**: mesmos 5 steps preenchidos, salva com updateEvento ou submeterEdicao (se precisa aprovacao)
**Consequencia**: mudancas refletem no feed, detalhe, landing

### EDITAR LOTES
**Quem**: Gerente
**Navegacao**: Dashboard evento -> Sub-view Lotes -> EditarLotesSubView (250L)
**O que acontece**: editar inline lotes e variacoes, ativar/desativar, ajustar precos/limites
**Consequencia**: precos novos valem imediatamente no checkout

### GERENCIAR CUPONS
**Quem**: Gerente
**Navegacao**: Dashboard evento -> Sub-view Cupons -> CuponsSubView (214L)
**O que acontece**: CRUD de cupons de desconto (codigo, %, valor fixo, limite uso, validade)
**Consequencia**: cupons ativos aplicaveis no checkout

### GERENCIAR PEDIDOS
**Quem**: Gerente
**Navegacao**: Dashboard evento -> Sub-view Pedidos -> PedidosSubView (407L)
**O que acontece**: lista tickets vendidos, filtrar por status/tipo, exportar CSV, cancelar ingresso
**Consequencia**: cancelamento gera reembolso (se elegivel)

### ANALYTICS DO EVENTO
**Quem**: Gerente
**Navegacao**: Dashboard evento -> Sub-view Analytics -> AnalyticsSubView (196L)
**O que acontece**: graficos Recharts — vendas/dia, por variacao, por origem
**Fonte**: vendas_log + tickets_caixa

### DUPLICAR EVENTO
**Quem**: Gerente
**Navegacao**: Dashboard evento -> Botao duplicar -> DuplicarModal (172L)
**O que acontece**: copia config (lotes, variacoes, listas, equipe) para novo evento
**Consequencia**: novo evento criado com dados preenchidos, segue wizard

### COPIAR DE EVENTO ANTERIOR
**Quem**: Gerente (durante criacao)
**Navegacao**: CriarEventoView -> CopiarModal (178L) -> seleciona evento anterior
**O que acontece**: preenche wizard com dados do evento selecionado
**Consequencia**: admin ajusta e segue wizard normal

### NEGOCIACAO SOCIO (COM_SOCIO)
**Quem**: Socio convidado OU produtor (ambos usam NegociacaoSocioView)
**Navegacao**: Notificacao CONVITE_SOCIO -> NegociacaoSocioView (tela cheia) OU dentro do evento no admin
**O que acontece**:
- Tela cheia estilo chat com baloes alternados (produtor esquerda, socio direita)
- Cada lado pode: Aceitar (com confirmacao) | Contrapor (novo % + mensagem 500 chars) | Recusar
- Aceitar = evento PUBLICADO automaticamente
- Max 3 rodadas, 48h por turno. Expirou = cancelado
- Pos-falha: produtor pode reiniciar negociacao (mesmo socio) ou convidar outro
- Push FCM + in-app em cada turno
**Consequencia**: acordo = publicado. Falha = RASCUNHO, produtor decide proximo passo
**View**: `features/admin/views/NegociacaoSocioView.tsx`

### CANCELAMENTO DE EVENTO
**Quem**: Gerente ou master
**Navegacao**: Dashboard evento -> Opcao cancelar
**O que acontece**: solicitarCancelamento -> cancelamento_etapa inicia fluxo
**Consequencia**: ingressos vendidos devem ser reembolsados, evento some do feed

## Onde este modulo aparece (propagacao)

### Telas que CONSOMEM dados do evento
| Tela | Arquivo | O que usa |
|---|---|---|
| Feed Home | modules/home/HomeView.tsx | Lista de eventos publicados |
| EventCard | components/EventCard.tsx | nome, foto, data, local, comunidade |
| EventDetail | modules/event-detail/EventDetailView.tsx | Evento completo + lotes + variacoes |
| EventInfo | modules/event-detail/components/EventInfo.tsx | Info do evento |
| Busca | modules/search/SearchView.tsx | Resultados de busca |
| Radar | modules/search/RadarView.tsx | Eventos por geolocalizacao |
| Landing SEO | modules/landing/EventLandingPage.tsx | Evento + comunidade + lotes |
| Checkout | modules/checkout/ | Lotes + variacoes para compra |
| Carteira | modules/wallet/WalletView.tsx | Ingressos do evento |
| QR Check-in | features/admin/views/checkin/ | Evento + tickets |
| Caixa | features/admin/views/caixa/ | Evento + venda presencial |
| Listas | features/admin/views/eventoDashboard/EditarListaSubView.tsx | Listas do evento |
| Financeiro | features/admin/views/financeiro/ | Receita por evento |
| Financeiro Master | features/admin/views/masterFinanceiro/ | Consolidado |
| Relatorio Evento | features/admin/views/relatorios/RelatorioEventoView.tsx | Dados do evento |
| Relatorio Master | features/admin/views/relatorios/RelatorioMasterView.tsx | Consolidado |
| Dashboard Admin | features/admin/views/eventoDashboard/ | 8 sub-views |
| Aprovacao | features/admin/views/EventosPendentesView.tsx | Eventos pendentes |
| Criar Evento | features/admin/views/CriarEventoView.tsx | Copiar de anterior |
| Vanta Indica | features/admin/views/VantaIndicaView.tsx | Card do evento |
| Perfil/Historico | modules/profile/HistoricoView.tsx | Eventos passados |
| Conquistas | services/achievementsService.ts | Badge por evento |
| Campanhas | features/admin/services/campanhasService.ts | Segmentar por evento |
| Stripe Webhook | supabase/functions/stripe-webhook/ | Associar venda |
| Create Checkout | supabase/functions/create-checkout/ | Lotes + taxas |
| Notificacoes | supabase/functions/notif-*/ | Contexto do evento |

### Se mexer na tabela eventos_admin, verificar:
- **26+ telas/servicos** listados acima
- Mudanca de coluna afeta: eventosAdminService + rowToEvento()
- Mudanca de lotes/variacoes afeta: checkout, caixa, carteira, financeiro
- Mudanca de publicado afeta: feed inteiro (HomeView, SearchView, RadarView)
- Mudanca de status_evento afeta: EventosPendentesView + fluxo aprovacao
- Mudanca de coords afeta: RadarView (RPC get_eventos_por_regiao)

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Wizard 5 steps | OK | CriarEventoView 868L |
| 2 | Tipo FESTA_DA_CASA | OK | TipoEventoScreen + fluxo gerente |
| 3 | Tipo COM_SOCIO | OK | Convite + split + aceitar/recusar/contrapropor |
| 4 | Lotes + variacoes | OK | INSERT lotes + variacoes_ingresso |
| 5 | Lotes MAIS VANTA | OK | Por tier, com prazo e acompanhantes |
| 6 | Listas de entrada | OK | Regras + cotas + distribuicao |
| 7 | Cortesias | OK | cortesiasService.initCortesia |
| 8 | Vanta Indica auto | OK | Card criado inativo |
| 9 | Aprovacao master | OK | EventosPendentesView 676L |
| 10 | Editar evento | OK | EditarEventoView 858L |
| 11 | Dashboard analytics | OK | Recharts + vendas_log |
| 12 | Cupons | OK | CuponsSubView CRUD |
| 13 | Pedidos + export CSV | OK | PedidosSubView 407L |
| 14 | Duplicar | OK | DuplicarModal 172L |
| 15 | Copiar de anterior | OK | CopiarModal 178L |
| 16 | ToS obrigatorio | OK | TosAcceptModal |
| 17 | Negociacao socio | OK | NegociacaoSocioView tela cheia chat + 9 RPCs + cron + push FCM. Ver sub_negociacao_socio.md |
| 18 | Cancelamento evento | OK | solicitarCancelamento + etapas |
| 19 | Edicao pendente | OK | submeterEdicao + aprovar/rejeitar |
| 20 | Slug landing page | OK | /evento/:slug |
| 21 | Mesas/camarotes | OK | mesas_ativo + planta_mesas |
| 22 | Categorias/subcategorias | OK | categorias_evento (158 rows), categoria + subcategorias[] |
| 23 | Estilos/experiencias | OK | estilos (30), experiencias (30), formatos (30) — tabelas lookup |
| 23b | Audit logs | OK | audit_logs + auditService (18 consumers) |
| 23c | Vanta Indica | OK | vanta_indica (6 cards no banco) |
| 23d | Mesas | OK | mesas tabela + mesasService |
| 24 | Reviews | OK | reviews_evento tabela + reviewsService.ts 97L (submit, getByEvento, getMedia, getExisting) |
| 25 | Pagamento real (checkout) | NAO EXISTE | Checkout gera tickets mas NAO cobra dinheiro real |
| 26 | Notificacao ao aprovar | OK | notify() tipo EVENTO_APROVADO em eventosAdminAprovacao |
| 27 | Notificacao ao rejeitar | OK | notify() tipo EVENTO_RECUSADO em eventosAdminAprovacao |
| 28 | Email ao socio convidado | OK | Edge Function send-invite chamada em CriarEventoView |
| 29 | Privacidade entre eventos | OK | `has_evento_access()` RLS — master/gerente comunidade/criador/RBAC evento/socio/equipe. Sem permissao = invisivel |
| 30 | Auto-RBAC socio aceitar | OK | `aceitar_convite_socio` cria RBAC SOCIO no evento + comunidade automaticamente |
