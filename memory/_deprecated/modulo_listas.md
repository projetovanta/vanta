# Criado: 2026-03-06 01:36 | Ultima edicao: 2026-03-06 01:36

# Modulo: Listas de Entrada & Promoter

## O que e
Listas = entrada por nome em vez de ingresso comprado.
Gerente cria regras de lista no evento → distribui cotas por promoter → promoter insere nomes → portaria faz check-in por nome.
Fluxo paralelo ao checkout — entrada por lista, nao por compra.

## Tabelas Supabase

### listas_evento (lista pai por evento)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento |
| teto_global_total | INTEGER | Cap maximo de convidados (default 0) |
| created_at | TIMESTAMPTZ | auto |

### regras_lista (tipos de entrada)
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | schema.sql | auto |
| lista_id | UUID FK listas_evento | schema.sql | Lista pai |
| label | TEXT | schema.sql | Nome da regra (VIP, CONSUMO, ENTRADA...) |
| teto_global | INTEGER | schema.sql | Teto da regra (default 0) |
| saldo_banco | INTEGER | schema.sql | Saldo no banco de nomes (default 0) |
| cor | TEXT | schema.sql | Cor visual da regra |
| valor | NUMERIC(10,2) | schema.sql | Valor cobrado na entrada (null = gratis) |
| genero | TEXT | migration | M, F ou U (default U) |
| tipo | TEXT | migration | VIP (gratis) ou PAGO (default PAGO) |
| hora_corte | TEXT | schema.sql | Hora limite (ex: '21:00', '02:00' = noite toda) |
| abobora_regra_id | UUID FK regras_lista | migration | Efeito abobora: regra destino apos hora_corte |
| created_at | TIMESTAMPTZ | schema.sql | auto |

### cotas_promoter (quota por promoter por regra)
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | schema.sql | auto |
| lista_id | UUID FK listas_evento | schema.sql | Lista pai |
| regra_id | UUID FK regras_lista | schema.sql | Regra |
| promoter_id | UUID FK profiles | schema.sql | Promoter |
| alocado | INTEGER | schema.sql | Quantidade alocada (default 0) |
| usado | INTEGER | schema.sql | Quantidade usada (default 0) |
| comissao_tipo | TEXT | migration | PERCENTUAL ou FIXO |
| comissao_valor | NUMERIC | migration | Valor da comissao (default 0) |
| created_at | TIMESTAMPTZ | schema.sql | auto |
| UNIQUE | (lista_id, regra_id, promoter_id) | | |

### convidados_lista (nomes inseridos)
| Coluna | Tipo | Origem | Descricao |
|---|---|---|---|
| id | UUID PK | schema.sql | auto |
| lista_id | UUID FK listas_evento | schema.sql | Lista pai |
| regra_id | UUID FK regras_lista | schema.sql | Regra aplicada |
| nome | TEXT | schema.sql | Nome do convidado |
| telefone | TEXT | schema.sql | Telefone (opcional) |
| inserido_por | UUID FK profiles | schema.sql | Quem inseriu (promoter) |
| checked_in | BOOLEAN | schema.sql | Se ja entrou (default false) |
| checked_in_em | TIMESTAMPTZ | schema.sql | Quando fez check-in |
| inserido_por_nome | TEXT | migration | Nome do promoter que inseriu (persistido) |
| checked_in_por_nome | TEXT | migration | Nome do porteiro |
| created_at | TIMESTAMPTZ | schema.sql | auto |
| INDEX GIN | nome gin_trgm_ops | schema.sql | Busca fuzzy por nome (pg_trgm) |

### pagamentos_promoter (comissoes)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| cota_id | UUID FK cotas_promoter | Cota origem |
| promoter_id | UUID FK auth.users | Promoter |
| evento_id | UUID FK eventos_admin | Evento |
| valor | NUMERIC | Valor pago |
| data | TIMESTAMPTZ | Data do pagamento |
| registrado_por | UUID FK auth.users | Quem registrou |
| observacao | TEXT | Nota |
| criado_em | TIMESTAMPTZ | auto |

## Servicos

### listasService (features/admin/services/listasService.ts, ~620L)
**CRUD:**
- `criarLista(data)` — INSERT listas_evento + regras_lista
- `atualizarRegras(listaId, regras)` — UPDATE regras_lista
- `distribuirCota(listaId, regraId, promoterId, qtd)` — INSERT/UPDATE cotas_promoter

**Nomes:**
- `inserirConvidado(listaId, regraId, nome, tel, promoterId)` — INSERT convidados_lista (inclui inserido_por_nome) + UPDATE cotas_promoter.usado
- `inserirForce(...)` — insere mesmo sem cota (admin override)
- `inserirLote(listaId, regraId, nomes[], promoterId)` — INSERT multiplos de uma vez

**Check-in:**
- `checkIn(listaId, convidadoId, porteiroNome)` — UPDATE checked_in=true, checked_in_em, checked_in_por_nome
- `checkInGlobal(convidadoId, porteiroNome)` — check-in sem saber lista (busca automatica)

**Resumo promoter:**
- `gerarResumoPromoter(eventoId, promoterId)` — retorna {nomesInseridos, checkIns, taxaComparecimento} do cache local. Para D+1 ou dashboard.

**Cache:** cache local sincrono + refresh async do Supabase (padrao do projeto)
- `refresh()` busca nomes de profiles para IDs unicos (promoters) e popula PROMOTERS_CACHE
- `buildListas(rows, nomesLookup)` aceita Map de nomes para resolver inserido_por_nome e promoterNome

## Arquivos
| Arquivo | Linhas | Funcao |
|---|---|---|
| features/admin/services/listasService.ts | 580 | Service completo |
| features/admin/views/eventoDashboard/EditarListaSubView.tsx | 165 | Editar regras da lista |
| features/admin/views/criarEvento/Step3Listas.tsx | (parte do wizard) | Step 3 do criar evento |

## Fluxos

### CRIAR LISTA (durante criacao do evento)
**Quem**: Gerente (Step 3 do CriarEventoView)
**Navegacao**: CriarEventoView -> Step 3 Listas
**O que acontece**:
1. Define regras: label (VIP, CONSUMO, ENTRADA), teto, cor, valor, genero
2. Define teto_global_total
3. Ao finalizar evento: listasService.criarLista → INSERT listas_evento + regras_lista
4. listasService.distribuirCota → INSERT cotas_promoter por membro da equipe

**Consequencia**: promoters recebem cotas e podem inserir nomes

### DISTRIBUIR COTAS
**Quem**: Gerente
**Navegacao**: EditarListaSubView ou Step 3
**O que acontece**: para cada promoter, define quantos nomes pode inserir por regra
**Consequencia**: promoter ve sua cota no dashboard de listas

### INSERIR NOMES (promoter)
**Quem**: Promoter com cota alocada
**Navegacao**: Dashboard do promoter -> Lista do evento -> Inserir nome
**O que acontece**:
1. Promoter digita nome + telefone (opcional)
2. listasService.inserirConvidado → INSERT convidados_lista
3. UPDATE cotas_promoter SET usado = usado + 1
4. Se cota esgotada, nao pode inserir mais (a menos que admin use inserirForce)

**Consequencia**: nome aparece na lista da portaria

### CHECK-IN POR LISTA (portaria)
**Quem**: Portaria
**Navegacao**: Tela de check-in -> busca por nome -> confirma
**O que acontece**:
1. Portaria busca nome (index GIN trgm para busca fuzzy)
2. listasService.checkIn → UPDATE checked_in=true, checked_in_em=tsBR(), checked_in_por_nome
3. Se regra tem valor: portaria cobra na entrada
**Fix 16/mar**: Tab CHECKIN agora aparece pro porteiro (antes role mismatch impedia). Timestamps corrigidos pra tsBR() (4 pontos).

**Consequencia**: convidado marcado como presente, cota contabilizada

### EDITAR REGRAS (apos criacao)
**Quem**: Gerente
**Navegacao**: Dashboard evento -> EditarListaSubView
**O que acontece**: listasService.atualizarRegras → UPDATE regras_lista (label, teto, cor, valor, genero)
**Consequencia**: regras atualizadas refletem imediatamente

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| CriarEventoView Step 3 | Criar regras + cotas |
| EditarEventoView | Editar regras |
| EditarListaSubView | Dashboard do evento |
| Dashboard promoter | Ver cotas, inserir nomes |
| Check-in portaria | Busca por nome, check-in |
| RelatorioEventoView | Dados de lista (check-ins) |
| RelatorioMasterView | Consolidado |
| AnalyticsSubView | Origem LISTA nas vendas |

### Se mexer nas tabelas de lista, verificar:
- listasService.ts (580L) — service principal
- Step3Listas — wizard de criacao
- EditarListaSubView — edicao pos-criacao
- Portaria — busca GIN trgm depende do index
- Relatorios — check-in_por_nome, genero da regra

## Dados reais importados
| Evento | Lista ID | Convidados | Check-ins | Promoters | Regras |
|---|---|---|---|---|---|
| SAMBINHA DO BOSQUE 01/03 | 2ce5b4d1-... | 2148 | 700 | 20 | 18 (14 + 4 split fem/masc) |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Criar lista + regras | OK | criarLista INSERT completo |
| 2 | Distribuir cotas | OK | distribuirCota por promoter por regra |
| 3 | Inserir nomes (promoter) | OK | inserirConvidado + update usado |
| 4 | Inserir force (admin) | OK | inserirForce sem checar cota |
| 5 | Inserir lote (multiplos) | OK | inserirLote |
| 6 | Check-in por nome | OK | checkIn + checkInGlobal |
| 7 | Busca fuzzy GIN trgm | OK | Index no schema.sql |
| 8 | Editar regras pos-criacao | OK | atualizarRegras |
| 9 | Genero na regra | OK | Migration campo genero |
| 10 | Porteiro nome registrado | OK | checked_in_por_nome |
| 11 | Comissao promoter | OK | comissao_tipo + comissao_valor na cota |
| 12 | Pagamentos promoter | OK | Tabela pagamentos_promoter criada |
| 13 | Teto global | OK | teto_global_total |
| 14 | RLS | OK | Todas tabelas com RLS ativo |
| 15 | Notificacao ao promoter quando recebe cota | OK | notify 3 canais (in-app + push + email) em listasService.alocarCota |
| 16 | Dashboard visual do promoter (cotas/nomes) | OK | PromoterDashboardView.tsx + PromoterCotasView.tsx + features/admin/views/listas/ (TabNomes, TabEquipe, index) |
| 17 | Remover convidado da lista | OK | removerConvidado(convidadoId, userId) — só quem adicionou (inserido_por) pode remover, devolve cota |
| 18 | Historico de check-ins da lista | NAO EXISTE | Sem tela dedicada |
| 19 | inserido_por_nome persistido | OK | Coluna TEXT em convidados_lista, populado no INSERT e migration backfill |
| 20 | PROMOTERS_CACHE populado | OK | refresh() busca profiles e popula cache de nomes |
