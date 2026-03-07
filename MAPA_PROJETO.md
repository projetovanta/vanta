# MAPA DO PROJETO VANTA
Criado em: 2026-03-06 | Baseado em: codigo real (zero achismo)

---

## COMO LER ESTE MAPA
- Cada fluxo: ACAO -> REACAO -> QUEM RECEBE -> O QUE FAZ -> ate acabar
- Navegacao: exatamente qual tela, qual botao, qual menu
- Checklist: cada item com status OK | QUEBRADO | NAO EXISTE | INCOMPLETO
- Memorias especificas (graph_*.md) detalham codigo de cada item

---

## INDICE — Documentacao Modular

### Modulos Principais (10 arquivos)
| Modulo | Arquivo | Tabelas | Linhas |
|---|---|---|---|
| Comunidade | `memory/modulo_comunidade.md` | comunidades, community_follows | 188L |
| Evento | `memory/modulo_evento.md` | eventos_admin, equipe_evento, lotes, variacoes_ingresso | 321L |
| Compra & Ingresso | `memory/modulo_compra_ingresso.md` | tickets_caixa, transactions, vendas_log | 204L |
| Carteira | `memory/modulo_carteira.md` | cortesias_pendentes, transferencias_ingresso | 187L |
| Listas | `memory/modulo_listas.md` | listas_evento, regras_lista, cotas_promoter, convidados_lista | 187L |
| Financeiro | `memory/modulo_financeiro_completo.md` | solicitacoes_saque, reembolsos, reembolsos_contagem | 228L |
| Social | `memory/modulo_social.md` | friendships, messages | 172L |
| Perfil & Feed | `memory/modulo_perfil_feed.md` | profiles, saved_events | 140L |
| RBAC | `memory/modulo_rbac.md` | cargos, atribuicoes_rbac | 110L |
| MAIS VANTA (clube) | `memory/modulo_clube.md` | membros_clube, lotes_mais_vanta, reservas_mais_vanta, etc | 174L |

### Sub-Modulos (16 arquivos)
| Sub-Modulo | Arquivo | Pertence a | Linhas |
|---|---|---|---|
| Criar Evento (wizard) | `memory/sub_criar_evento.md` | modulo_evento | 129L |
| Dashboard Evento | `memory/sub_dashboard_evento.md` | modulo_evento | 110L |
| Transferencia & Cortesia | `memory/sub_transferencia_cortesia.md` | modulo_carteira | 97L |
| Promoter | `memory/sub_promoter.md` | modulo_listas | 58L |
| Saque & Reembolso | `memory/sub_saque_reembolso.md` | modulo_financeiro | 124L |
| Portaria & Caixa | `memory/sub_portaria_caixa.md` | modulo_evento | 88L |
| Aprovacao & Negociacao | `memory/sub_aprovacao_negociacao.md` | modulo_evento | 148L |
| Notificacoes | `memory/sub_notificacoes.md` | cross-modulo | 57L |
| Comunidade CRUD | `memory/sub_comunidade_crud.md` | modulo_comunidade | 118L |
| MAIS VANTA Admin | `memory/sub_clube_admin.md` | modulo_clube | 96L |
| Relatorios | `memory/sub_relatorios.md` | modulo_evento + financeiro + comunidade | 76L |
| Operacoes Offline | `memory/sub_offline.md` | sub_portaria_caixa | 68L |
| Busca & Filtros | `memory/sub_busca_filtros.md` | modulo_perfil_feed | 75L |
| Chat & Realtime | `memory/sub_chat_realtime.md` | modulo_social | 180L |
| Solicitacao Parceria | `memory/sub_solicitacao_parceria.md` | modulo_comunidade | — |
| Taxas VANTA | `memory/sub_taxas_modelo.md` | cross-modulo | 73L |

### Cross-Dominio
| Arquivo | Funcao |
|---|---|
| `memory/EDGES.md` | Propagacao: tabela/store/RPC → todos os consumers |
| `memory/MEMORY.md` | Indice geral + regras + estado atual |

---

## 1. CRIAR COMUNIDADE

**Quem faz**: Master admin
**Arquivo**: features/admin/views/criarComunidade/index.tsx (358L)
**Servico**: features/admin/services/comunidadesService.ts
**Tabela principal**: comunidades

### Navegacao (como chega)
1. Usuario logado com cargo masteradm
2. Bottom nav -> icone Admin (engrenagem) -> AdminGateway
3. AdminGateway verifica RBAC -> AdminDashboardView
4. Sidebar esquerda -> clica "Comunidades"
5. ComunidadesView carrega -> lista de comunidades existentes
6. Botao "+ Nova Comunidade" no topo
7. Abre CriarComunidadeView

### Acao (o que o admin faz)
**Step 1 — Identidade** (Step1Identidade.tsx, ~210L):
- Nome da comunidade (obrigatorio, texto)
- Bio/descricao (obrigatorio, textarea)
- Capacidade maxima (obrigatorio, numero > 0)
- Taxa VANTA (obrigatorio, 0-100%, define quanto a VANTA cobra por ingresso vendido)
- Taxas avancadas (master only): processamento %, porta %, minima R$, cota nomes, R$/nome exc, cota cortesias, % cortesia exc
- Horarios de funcionamento (7 dias da semana, cada um com toggle ativo/inativo + hora abre/fecha)
- CNPJ (opcional, texto)
- Razao social (opcional, texto)
- Telefone (opcional, texto)
- Validacao: nome, bio, capacidade e taxa obrigatorios. Taxa entre 0-100%.

**Step 2 — Localizacao** (Step2Localizacao.tsx, 170L):
- CEP (busca automatica via cepService -> preenche rua, bairro, cidade, estado)
- Rua (obrigatorio)
- Numero (obrigatorio)
- Complemento (opcional)
- Bairro (obrigatorio)
- Cidade (obrigatorio)
- Estado (obrigatorio)
- Coordenadas GPS (calculadas automaticamente do endereco)
- Validacao: rua, numero, bairro, cidade, estado obrigatorios.

**Step 3 — Visual + Equipe** (Step3Fotos.tsx, 273L):
- Foto de perfil (obrigatorio, upload com crop via ImageCropModal)
- Foto de capa (obrigatorio, upload com crop)
- Adicionar produtores (obrigatorio, minimo 1)
  - Busca membros por nome via authService.buscarMembros() -> RPC buscar_membros
  - Seleciona da lista -> adiciona como produtor
- Validacao: foto perfil, foto capa e pelo menos 1 produtor obrigatorios.
- Botao "Confirmar e Criar" -> handleCriar()

### Reacao (o que acontece no sistema)
1. `comunidadesService.criar()`:
   - INSERT tabela `comunidades` com 14 campos
   - Gera slug automatico (generateSlug(nome))
   - dono_id = adminId do criador
   - Retorna novoId

2. Upload de fotos:
   - `comunidadesService.uploadFoto(novoId, 'perfil', fotoPerfil)` -> bucket Storage `comunidades`
   - `comunidadesService.uploadFoto(novoId, 'capa', fotoCapa)` -> bucket Storage `comunidades`
   - `comunidadesService.atualizar(novoId, { foto: fotoUrl, fotoCapa: capaUrl })`

3. Taxa VANTA + taxas avancadas:
   - `comunidadesService.atualizar(novoId, { vanta_fee_percent, taxa_processamento_percent, taxa_porta_percent, taxa_minima, cota_nomes_lista, taxa_nome_excedente, cota_cortesias, taxa_cortesia_excedente_pct })`

4. Atribuicao RBAC (por cada produtor):
   - `rbacService.atribuir({ userId, tenant: { tipo: 'COMUNIDADE', id: novoId }, cargo: 'GERENTE', permissoes: CARGO_PERMISSOES.GERENTE })`
   - INSERT em `atribuicoes_rbac`
   - Produtor ganha todas as permissoes de GERENTE

5. Tela de sucesso:
   - Mostra "Comunidade criada com sucesso. Ja aparece no painel e esta pronta para receber eventos."
   - Botao "Voltar ao Painel"

### Quem recebe e o que faz

**Produtores atribuidos (cargo GERENTE)**:
- Navegacao: Login -> Bottom nav Admin -> AdminGateway -> verifica RBAC -> AdminDashboardView
- AdminDashboardView filtra comunidades por atribuicoes_rbac do usuario
- Veem a comunidade na lista de ComunidadesView
- Clicam -> ComunidadeDetalheView (170L) com tabs:
  - EVENTOS: ProximosEventosTab + EventosEncerradosTab + botao Criar Evento
  - EQUIPE: EquipeTab (173L) -> ver/adicionar/remover membros da equipe
  - LOGS: LogsTab (118L) -> historico de acoes na comunidade
  - CAIXA: CaixaTab (121L) -> resumo financeiro por evento
  - RELATORIO: RelatorioComunidadeView
- Podem: criar eventos, editar comunidade (EditarModal 521L), gerenciar equipe, ver financeiro

**Usuarios do app (publico)**:
- Navegacao: EventDetailView -> clica no nome/logo da comunidade -> ComunidadePublicView
- Ou: SearchView tab EVENTS -> resultado mostra comunidade -> clica
- ComunidadePublicView (490L) mostra:
  - Info: nome, bio, cidade, endereco, horarios, foto, capa
  - Botao seguir/deixar de seguir -> communityFollowService -> tabela community_follows
  - Lista de proximos eventos da comunidade (query eventos_admin por comunidade_id)
  - Seguidores + amigos que seguem (friendships cruzado com community_follows)
  - Botao "Abrir no Google Maps" (link com coords)
- Follow gera: numero de seguidores visivel na pagina

**Master admin**:
- Ve TODAS as comunidades em ComunidadesView (sem filtro RBAC, masteradm ve tudo)
- Pode editar qualquer comunidade via EditarModal (521L):
  - Campos editaveis: nome, bio, foto, capa, endereco, horarios, capacidade
  - Taxa VANTA (vanta_fee_percent)
  - Repasse (vanta_fee_repasse_percent)
  - Gateway fee mode (ABSORVER ou REPASSAR)
  - Cargos customizados
  - CNPJ, razao social, telefone
- Pode desativar: comunidadesService.desativar() -> ativa: false (soft delete)
- Pode atribuir dono (donoId)

### O que essa comunidade desbloqueia (consequencias futuras)
- **Criar eventos**: CriarEventoView exige selecionar comunidade (ver fluxo 2)
- **Listas de entrada**: vinculadas ao evento da comunidade (ver fluxo 8)
- **Equipe RBAC**: cargos atribuidos por comunidade/evento
- **Financeiro**: receita, saques, reembolsos por comunidade (ver fluxo 12)
- **Relatorios**: RelatorioComunidadeView (ver fluxo 16)
- **MAIS VANTA**: assinaturas por comunidade, passaportes por cidade (ver fluxo 14)

### Checklist de status
| Item | Status | Detalhe |
|---|---|---|
| Wizard 3 steps | OK | Funciona completo |
| Upload fotos | OK | Bucket comunidades no Storage |
| RBAC automatico | OK | Produtores viram GERENTE |
| Busca de membros | OK | RPC buscar_membros |
| CEP automatico | OK | cepService busca endereco |
| Coords GPS | OK | Calculadas do endereco |
| Slug automatico | OK | generateSlug(nome) |
| Desativar comunidade | OK | soft delete ativa:false |
| Taxa VANTA | OK | vanta_fee_percent |
| Pagina publica | OK | ComunidadePublicView 490L |
| Seguir/deixar seguir | OK | communityFollowService + community_follows |
| Notificacao ao criar | NAO EXISTE | Nenhuma notificacao e enviada quando comunidade e criada |
| Validacao CNPJ | NAO EXISTE | Campo aceita qualquer texto, sem validacao de formato |

---

## 2. CRIAR EVENTO

**Quem faz**: Gerente ou socio da comunidade
**Arquivo**: features/admin/views/CriarEventoView.tsx (868L)
**Servico**: features/admin/services/eventosAdminService.ts
**Tabela principal**: eventos_admin

### Navegacao (como chega)
1. Usuario logado com cargo gerente/socio na comunidade
2. Bottom nav -> Admin -> AdminDashboardView
3. Sidebar -> "Comunidades" -> ComunidadesView
4. Clica na comunidade -> ComunidadeDetalheView
5. Tab EVENTOS -> CentralEventosView (83L)
6. Botao "Criar Evento"
7. Abre TipoEventoScreen -> escolhe tipo
8. CriarEventoView com wizard 5 steps
- Alternativa: CopiarModal (178L) -> copia config de evento anterior antes de preencher

### Acao (o que o admin faz)

**Escolha de tipo** (TipoEventoScreen.tsx, 75L):
- FESTA_DA_CASA: evento proprio, gerente organiza tudo
- COM_SOCIO: evento com produtor externo, split financeiro

**Step 1 — Dados do Evento** (Step1Evento.tsx, 378L):
- Nome (obrigatorio)
- Descricao (obrigatorio)
- Foto do evento (upload com crop via ImageCropModal)
- Data inicio + hora inicio (obrigatorio, formato date + time)
- Data fim + hora fim (obrigatorio)
- Formato (dropdown: seleciona de tabela `formatos` no Supabase)
- Estilos (multi-select: seleciona de tabela `estilos` no Supabase)
- Experiencias (multi-select: seleciona de tabela `experiencias` no Supabase)

**Step 2 — Ingressos** (Step2Ingressos.tsx, 650L):
- N lotes (adicionar/remover lotes dinamicamente)
- Cada lote tem:
  - Data de validade (quando o lote expira)
  - Hora de validade
  - % virada (quando X% vendido, vira pro proximo lote)
  - M variacoes (adicionar/remover):
    - Area: Pista, VIP, Camarote, Backstage, Open Bar, Outro (dropdown)
    - Area custom (texto livre se "Outro")
    - Genero: UNISEX, MASCULINO, FEMININO (dropdown)
    - Valor R$ (obrigatorio, numero)
    - Limite de ingressos (obrigatorio, numero)
    - Requer comprovante (toggle, ex: meia-entrada)
    - Tipo comprovante (se toggle ativo)
- Lotes MAIS VANTA (opcional, se clube ativo):
  - Por tier: quantidade de vagas, acompanhantes, tipo de acesso, prazo
  - Busca tiers ativos de tiers_mais_vanta via assinaturaService
- CapacidadeModal (57L): alerta se total de ingressos > capacidade da comunidade

**Step 3 — Listas de entrada** (Step3Listas.tsx, 252L):
- Toggle habilitar listas (sim/nao)
- Se sim: N regras de lista (adicionar/remover):
  - Tipo: VIP, CONSUMO, ENTRADA, OUTRO (dropdown)
  - Genero: MASCULINO, FEMININO, UNISEX
  - Validade: NOITE_TODA ou HORARIO (com hora corte)
  - Cor (visual no check-in)
  - Limite (teto global de nomes)
  - Valor consumacao R$ (opcional)

**Step 4 — Equipe** (Step4EquipeCasa.tsx 479L ou Step4EquipeSocio.tsx 457L):
- Se FESTA_DA_CASA:
  - Designar gerente do evento (busca por nome)
  - Permissoes do gerente: VER_FINANCEIRO, GERIR_LISTAS, EMITIR_CORTESIAS
  - Adicionar equipe: busca membros -> define papel (CargoModal):
    - Papeis: PORTARIA_ANTECIPADO, PORTARIA_LISTA, CAIXA, PROMOTER, CUSTOM
  - Liberar lista: toggle por membro + distribuir cotas (quantidade por regra)
- Se COM_SOCIO:
  - Convidar socio (busca por nome)
  - Definir split: % produtor / % socio
  - Permissoes do produtor: VER_FINANCEIRO, GERIR_LISTAS, EMITIR_CORTESIAS
  - Adicionar equipe (igual FESTA_DA_CASA)

**Step 5 — Financeiro** (Step5Financeiro.tsx, 135L):
- Resumo das taxas (taxa VANTA da comunidade)
- Aceitar ToS (TosAcceptModal) — OBRIGATORIO antes de publicar
- Cortesias: toggle habilitar + limites por tipo de variacao

**Publicar** -> handlePublicar()

### Reacao (o que acontece no sistema)

1. `eventosAdminService.criarEvento()`:
   - INSERT `eventos_admin` com: nome, descricao, foto, datas (ISO -03:00), local, endereco, cidade, coords, comunidade, equipe, publicado:false
   - Status: PENDENTE (festa da casa) ou NEGOCIANDO (com socio)
   - criador_id, criador_nome registrados

2. Lotes e variacoes:
   - INSERT `lotes` (N lotes: nome, limit_total, data_validade, virar_pct, ativo)
   - INSERT `variacoes_ingresso` (M por lote: area, genero, valor, limite, vendidos:0)

3. Cortesias (se habilitadas):
   - `cortesiasService.initCortesia(eventoId, config)`
   - INSERT `cortesias_config` (limite total, variacoes, limites por tipo)

4. MAIS VANTA (se ativo):
   - `clubeService.upsertLotesMaisVanta(eventoId, tiersConfig)`
   - INSERT `lotes_mais_vanta` (por tier: tier_id, quantidade, prazo, acompanhantes, tipo_acesso)

5. Vanta Indica:
   - `adminService.addCard()` -> INSERT `vanta_indica`
   - Card criado INATIVO automaticamente (tipo: DESTAQUE_EVENTO)
   - Badge: EVENTO, titulo: nome do evento, imagem: foto do evento
   - Alvo localidades: cidade da comunidade

6. Listas (se habilitadas):
   - `listasService.criarLista()` -> INSERT `listas_evento` + INSERT `regras_lista` (por regra)
   - `listasService.distribuirCota()` -> INSERT `cotas_promoter` (por membro com lista liberada)

### Quem recebe e o que faz

**Master admin**:
- Navegacao: Painel Admin -> sidebar "Eventos Pendentes" -> EventosPendentesView (676L)
- Ve evento com status PENDENTE na lista
- Pode ver detalhes completos do evento
- Pode definir todas as taxas do evento (11 campos: taxa VANTA %, fixa, processamento, porta, minima, fixa evento, quem paga, cota nomes, nome exc, cota cortesias, cortesia exc, prazo pgto)
- Pode APROVAR:
  - `eventos_admin.update({ publicado: true, status: 'ATIVO', ...taxasNegociadas })`
  - Evento aparece no feed de TODOS os usuarios (HomeView, SearchView, RadarView)
  - Evento aparece na pagina publica da comunidade
  - Landing page /evento/:slug fica ativa (EventLandingPage.tsx, 302L)
  - Membros MV veem lotes exclusivos no EventDetailView
- Pode REJEITAR:
  - `eventos_admin.update({ status: 'REJEITADO' })`
  - Evento NAO aparece em lugar nenhum

**Socio convidado (se COM_SOCIO)**:
- Navegacao: Painel Admin -> notificacao de convite
- Recebe convite acessivel via RPCs Supabase:
  - `get_convite_socio` -> ve detalhes do convite (split, permissoes)
  - `aceitar_convite_socio` -> evento avanca para status PENDENTE (vai pro master)
  - `recusar_convite_socio` -> evento cancelado
  - `contraproposta_convite_socio` -> novo split proposto, gerente decide
- Apos aceitar: socio tem acesso ao evento no seu painel com as permissoes definidas

**Promoters da equipe (se listas habilitadas)**:
- Navegacao: Painel Admin -> sidebar "Listas" -> ListasDashboard
- Veem seus eventos com cotas atribuidas
- Podem inserir nomes na lista (TabNomes, 236L) ate o limite da cota
- Podem inserir em lote (ModalInserirLote)
- Cada nome inserido: INSERT `convidados_lista` (nome, regra_id, inserido_por)

**Card Vanta Indica**:
- Criado INATIVO automaticamente
- Master pode ativar em VantaIndicaView (features/admin/views/VantaIndicaView.tsx)
- Quando ativado: card aparece no Highlights do HomeView (modulos/home/components/Highlights.tsx)
- Usuarios veem como destaque no feed -> clicam -> EventDetailView

### Checklist de status
| Item | Status | Detalhe |
|---|---|---|
| Wizard 5 steps | OK | Funciona completo |
| Tipo FESTA_DA_CASA | OK | TipoEventoScreen + fluxo gerente |
| Tipo COM_SOCIO | OK | Convite socio + split + RPCs |
| Lotes + variacoes | OK | INSERT lotes + variacoes_ingresso |
| Virada automatica lote | OK | RPC verificar_virada_lote |
| Lotes MAIS VANTA | OK | Por tier com prazo e acompanhantes |
| Listas de entrada | OK | Regras + cotas + distribuicao |
| Cortesias | OK | cortesiasService.initCortesia |
| Vanta Indica auto | OK | Card inativo criado automaticamente |
| Aprovacao master | OK | EventosPendentesView 676L |
| ToS obrigatorio | OK | TosAcceptModal antes de publicar |
| Foto upload+crop | OK | ImageCropModal |
| Copiar evento anterior | OK | CopiarModal 178L |
| Notif push ao aprovar | OK | EVENTO_APROVADO push+in-app+email |
| Notif push ao rejeitar | OK | EVENTO_RECUSADO push+in-app+email |
| Pagamento real | NAO EXISTE | Checkout gera tickets mas NAO cobra dinheiro |
| Rascunho/salvar parcial | NAO EXISTE | Se fechar o wizard perde tudo |

---

