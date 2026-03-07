# Criado: 2026-03-06 01:26 | Ultima edicao: 2026-03-06 01:26
# Modulo: Comunidade

## O que e
Comunidade = casa noturna, bar, espaco de eventos. E a entidade organizadora.
Sem comunidade nao existe evento, equipe, financeiro, listas, MAIS VANTA.
E o bloco fundamental do app — tudo depende dela.

## Tabelas Supabase

### comunidades (tabela principal)
| Coluna | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| id | UUID PK | auto | gen_random_uuid() |
| nome | TEXT | sim | Nome da comunidade |
| descricao | TEXT | sim | Bio/descricao |
| cidade | TEXT | sim | Cidade |
| estado | TEXT | nao | Estado (UF) |
| endereco | TEXT | nao | Endereco completo |
| foto | TEXT | nao | URL foto perfil (bucket comunidades) |
| foto_capa | TEXT | nao | URL foto capa (bucket comunidades) |
| coords | JSONB | nao | {lat, lng} |
| capacidade_max | INTEGER | nao | Capacidade maxima de pessoas |
| ativa | BOOLEAN | sim | Default true, soft delete = false |
| cargos_customizados | JSONB | sim | Default [] — cargos RBAC customizados |
| vanta_fee_percent | NUMERIC(5,4) | nao | Taxa VANTA (ex: 0.04 = 4%) |
| vanta_fee_fixed | NUMERIC(10,2) | sim | Default 0 — taxa fixa por ingresso |
| gateway_fee_mode | TEXT | sim | ABSORVER ou REPASSAR |
| created_by | UUID FK profiles | nao | Quem criou |
| created_at | TIMESTAMPTZ | auto | now() |
| updated_at | TIMESTAMPTZ | auto | trigger set_updated_at() |
| dono_id | UUID FK profiles | nao | Dono da comunidade |
| horario_funcionamento | JSONB | nao | Array de HorarioSemanal |
| horario_overrides | JSONB | nao | Excecoes de horario |
| slug | TEXT UNIQUE | nao | URL amigavel |
| cep | TEXT | nao | CEP |
| cnpj | TEXT | nao | CNPJ da empresa |
| razao_social | TEXT | nao | Razao social |
| telefone | TEXT | nao | Telefone |
| vanta_fee_repasse_percent | NUMERIC(5,2) | nao | Default 0 — repasse |
| taxa_processamento_percent | NUMERIC(5,4) | nao | Gateway % (default 2.5%) |
| taxa_porta_percent | NUMERIC(5,4) | nao | % sobre vendas na porta |
| taxa_minima | NUMERIC(10,2) | nao | Minimo por ingresso app (default R$2) |
| cota_nomes_lista | INTEGER | nao | Nomes gratis na lista (default 500) |
| taxa_nome_excedente | NUMERIC(10,2) | nao | R$/nome excedente (default R$0.50) |
| cota_cortesias | INTEGER | nao | Cortesias gratis (default 50) |
| taxa_cortesia_excedente_pct | NUMERIC(5,4) | nao | % valor face cortesia excedente (default 5%) |
| tier_minimo_mais_vanta | TEXT | nao | Default BRONZE |
| tipo_comunidade | TEXT | nao | Default ESPACO_FIXO — ESPACO_FIXO ou PRODUTORA |
| evento_privado_ativo | BOOLEAN | nao | Default false — habilita botao Evento Privado |
| evento_privado_texto | TEXT | nao | Texto apresentacao espaco |
| evento_privado_fotos | JSONB | nao | Galeria fotos espaco (string[]) |
| evento_privado_formatos | JSONB | nao | Opcoes formato (string[]) |
| evento_privado_atracoes | JSONB | nao | Opcoes atracoes (string[]) |
| evento_privado_faixas_capacidade | JSONB | nao | Faixas capacidade (string[]) |

### community_follows (seguidores)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Quem segue |
| comunidade_id | UUID FK comunidades | Comunidade seguida |
| created_at | TIMESTAMPTZ | Quando seguiu |

## Servicos

### comunidadesService (features/admin/services/comunidadesService.ts)
- `refresh()` — carrega todas comunidades do Supabase em cache local
- `getAll()` — retorna cache
- `getAtivas()` — filtra ativa=true
- `get(id)` — busca por ID no cache
- `criar(data)` — INSERT comunidades + retorna ID
- `atualizar(id, updates)` — UPDATE comunidades
- `desativar(id)` — UPDATE ativa=false (soft delete)
- `uploadFoto(id, tipo, dataUrl)` — upload para bucket Storage comunidades

### communityFollowService (services/communityFollowService.ts)
- `isFollowing(userId, comunidadeId)` — SELECT count community_follows
- `follow(userId, comunidadeId)` — INSERT community_follows
- `unfollow(userId, comunidadeId)` — DELETE community_follows
- `getFollowers(comunidadeId)` — SELECT user_ids (limit 5000)
- `getFollowCount(comunidadeId)` — SELECT count
- `getMyFollows(userId)` — SELECT comunidade_ids do usuario

## Storage
- Bucket: `comunidades`
- Paths: `{comunidadeId}/perfil.jpg`, `{comunidadeId}/capa.jpg`

## Fluxos

### CRIAR COMUNIDADE
**Quem**: Master admin
**Navegacao**: Bottom nav Admin -> AdminGateway -> AdminDashboardView -> sidebar "Comunidades" -> ComunidadesView -> botao "+ Nova Comunidade" -> CriarComunidadeView
**Arquivos**: features/admin/views/criarComunidade/ (4 arquivos, 942L total)

**O que acontece**:
Step 1 (Step1Identidade ~195L): nome, bio, capacidade, taxa VANTA %, taxas avancadas (processamento, porta, minima, cota nomes, nome excedente, cota cortesias, cortesia excedente), horarios, CNPJ/razao/tel
Step 2 (Step2Localizacao 170L): CEP auto -> endereco + coords GPS
Step 3 (Step3Fotos 273L): foto perfil (crop), foto capa (crop), produtores (min 1, busca por nome)

**Reacao no sistema**:
1. INSERT comunidades (14 campos + slug auto)
2. Upload fotos -> bucket comunidades -> UPDATE URLs
3. UPDATE vanta_fee_percent + taxas avancadas (7 campos opcionais)
4. Para cada produtor: INSERT atribuicoes_rbac (cargo GERENTE, permissoes completas)

**Quem recebe**:
- Produtores (GERENTE): veem no AdminDashboardView -> ComunidadesView -> ComunidadeDetalheView (tabs: EVENTOS, EQUIPE, LOGS, CAIXA, RELATORIO)
- Usuarios: veem em ComunidadePublicView (via EventDetailView -> clica comunidade)
- Master: ve em ComunidadesView (todas as comunidades)

**O que desbloqueia**: criar eventos, listas, equipe RBAC, financeiro, relatorios, MAIS VANTA

### EDITAR COMUNIDADE
**Quem**: Master admin ou gerente com permissao
**Navegacao**: ComunidadesView -> clica comunidade -> ComunidadeDetalheView -> botao editar -> EditarModal
**Arquivo**: features/admin/views/comunidades/EditarModal.tsx (521L)

**O que pode editar**: nome, bio, foto, capa, endereco, horarios, capacidade, taxa VANTA, repasse, gateway fee mode, taxas avancadas (processamento, porta, minima, cota nomes, nome excedente, cota cortesias, cortesia excedente), cargos custom, CNPJ, razao, telefone, dono
**Reacao**: UPDATE comunidades
**Quem ve a mudanca**: todos que acessam a comunidade (painel, pagina publica, eventos)

### DESATIVAR COMUNIDADE
**Quem**: Master admin
**Navegacao**: ComunidadeDetalheView -> opcao desativar
**Reacao**: UPDATE comunidades SET ativa=false
**Consequencia**: comunidade some de ComunidadesView (getAtivas filtra), eventos ficam orfaos, pagina publica some

### SEGUIR COMUNIDADE (usuario)
**Quem**: Usuario logado
**Navegacao**: EventDetailView -> clica nome/logo comunidade -> ComunidadePublicView -> botao "Seguir"
**Reacao**: INSERT community_follows (user_id, comunidade_id)
**Consequencia**: usuario ve comunidade nos "seguindo", contador de seguidores incrementa, amigos do usuario podem ver que ele segue

### DEIXAR DE SEGUIR (usuario)
**Quem**: Usuario logado
**Navegacao**: ComunidadePublicView -> botao "Seguindo" (toggle)
**Reacao**: DELETE community_follows
**Consequencia**: inverso do seguir

## Onde este modulo aparece (propagacao)

### Telas que CONSOMEM dados da comunidade
| Tela | Arquivo | O que usa | Como |
|---|---|---|---|
| Feed Home | modules/home/HomeView.tsx | comunidade do evento | Exibe nome/foto da comunidade no EventCard |
| EventCard | components/EventCard.tsx | comunidade_id | Mostra logo da comunidade no card |
| EventDetail | modules/event-detail/EventDetailView.tsx | comunidade completa | Link pra ComunidadePublicView |
| EventInfo | modules/event-detail/components/EventInfo.tsx | comunidade_id | Mostra info da comunidade |
| Busca | modules/search/SearchView.tsx | comunidades | Resultados incluem comunidades |
| Landing SEO | modules/landing/EventLandingPage.tsx | comunidades!inner(nome,foto) | JOIN pra mostrar dados da comunidade |
| Pagina publica | modules/community/ComunidadePublicView.tsx | comunidade completa | Tela dedicada |
| Criar Evento | features/admin/views/CriarEventoView.tsx | comunidade selecionada | Herda local, endereco, cidade, coords, taxa |
| Editar Evento | features/admin/views/EditarEventoView.tsx | comunidade do evento | Idem |
| Dashboard Evento | features/admin/views/eventoDashboard/ | comunidade_id | Contexto do evento |
| Aprovacao | features/admin/views/EventosPendentesView.tsx | comunidade | Mostra qual comunidade |
| Financeiro | features/admin/views/financeiro/ | comunidade_id | Receita por comunidade |
| Financeiro Master | features/admin/views/masterFinanceiro/ | comunidade_id | Consolidado |
| Relatorio Comunidade | features/admin/views/relatorios/RelatorioComunidadeView.tsx | comunidade_id | Relatoria dedicada |
| Relatorio Master | features/admin/views/relatorios/RelatorioMasterView.tsx | comunidade_id | Consolidado |
| Assinaturas MV | features/admin/views/AssinaturasMaisVantaView.tsx | comunidade_id | Assinatura por comunidade |
| Passaportes MV | features/admin/views/PassaportesMaisVantaView.tsx | comunidade_id | Passaporte por cidade |
| Campanhas | features/admin/services/campanhasService.ts | comunidade_id | Segmentar por comunidade |
| RBAC | features/admin/services/rbacService.ts | tenant COMUNIDADE | Permissoes por comunidade |
| Admin Gateway | features/admin/AdminGateway.tsx | comunidades do user | Filtra acesso |
| Admin Home | features/admin/components/AdminDashboardHome.tsx | comunidades | Lista no dashboard |
| Checkout | supabase/functions/create-checkout/ | comunidade_id | Taxa da comunidade |
| Stripe Webhook | supabase/functions/stripe-webhook/ | comunidade_id | Associar receita |
| Caixa (portaria) | features/admin/views/caixa/ | comunidade_id | Venda presencial |
| Check-in | features/admin/views/checkin/ | comunidade_id | Contexto do evento |
| Convite Socio | components/ConviteSocioModal.tsx | comunidade | Dados do convite |
| Perfil | modules/profile/ProfileView.tsx | comunidades seguidas | Mostra no perfil |
| Historico | modules/profile/HistoricoView.tsx | comunidade_id | Eventos passados |
| Conquistas | services/achievementsService.ts | comunidade_id | Badge por comunidade |

### Se mexer na tabela comunidades, verificar:
- **27 telas/servicos** listados acima
- Qualquer mudanca de coluna afeta: comunidadesService.ts + rowToComunidade()
- Mudanca de taxa afeta: financeiro inteiro + checkout + stripe-webhook
- Mudanca de coords afeta: RadarView (RPC get_eventos_por_regiao)
- Mudanca de ativa afeta: filtro em getAtivas() -> some de todo lugar

## Checklist de status
| Item | Status | Detalhe |
|---|---|---|
| Criar comunidade wizard | OK | 3 steps, 942L |
| Editar comunidade | OK | EditarModal ~820L (inclui config Evento Privado) |
| Desativar (soft delete) | OK | ativa=false |
| Upload fotos | OK | Bucket comunidades |
| RBAC automatico | OK | Produtores viram GERENTE |
| CEP automatico | OK | cepService |
| Slug automatico | OK | generateSlug(nome) |
| Pagina publica | OK | ComunidadePublicView 490L |
| Seguir/desseguir | OK | communityFollowService |
| Horarios funcionamento | OK | HorarioFuncionamentoEditor |
| Taxa VANTA | OK | vanta_fee_percent |
| Gateway fee mode | OK | ABSORVER/REPASSAR |
| RLS | OK | Migration 20260305900000 |
| Notificacao ao criar | NAO EXISTE | Nenhum push/email quando comunidade e criada |
| Validacao CNPJ | NAO EXISTE | Aceita qualquer texto |
| Notificacao ao desativar | NAO EXISTE | Membros/seguidores nao sao avisados |
| Historico de edicoes | NAO EXISTE | Sem audit log de mudancas na comunidade |
| Limite de comunidades | NAO EXISTE | Admin pode criar infinitas |
| Solicitacao de Parceria | OK | Ver `sub_solicitacao_parceria.md` — wizard + painel master |
| tipo_comunidade | OK | ESPACO_FIXO (local travado) ou PRODUTORA (local editavel por evento) |
| Evento Privado | OK | Ver `sub_evento_privado.md` — solicitacao + timeline + painel gerente |
| Comemoracao | OK | Ver `sub_comemoracao.md` — aniversario/despedida + faixas beneficios |
