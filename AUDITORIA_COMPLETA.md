# AUDITORIA COMPLETA DO CODEBASE — prevanta
> Data: 2026-02-28 | 6 agentes paralelos | ~150 arquivos auditados

---

## LEGENDA DE SEVERIDADE
- **CRITICO** — Bug que causa crash, perda de dados, ou vulnerabilidade de seguranca exploravel
- **ALTO** — Bug que causa comportamento errado visivel ao usuario ou calculo financeiro incorreto
- **MEDIO** — Inconsistencia logica, guard ausente, ou risco de estado dessincronizado
- **BAIXO** — Codigo morto, inconsistencia de documentacao, anti-padrao menor
- **SEGURANCA** — Vulnerabilidade de seguranca especifica (RLS, XSS, injection, etc.)

---

## 1. CRITICOS (14 problemas)

### 1.1 Checkout nao grava tickets no Supabase
**Arquivo**: `modules/checkout/CheckoutPage.tsx:302-337`
Compra e simulada. O ingresso so existe no localStorage do browser. Nao chama `registrarVendaEfetiva`, nao faz INSERT em `tickets_caixa`, nao atualiza `vendidos` nos lotes. Se o usuario limpar cache, ingresso desaparece.

### 1.2 Login do Checkout e simulado
**Arquivo**: `modules/checkout/CheckoutPage.tsx:300`
`await new Promise(r => setTimeout(r, 1000))` — sleep de 1s sem autenticar no Supabase. Qualquer email/senha funciona. Ticket gerado nao tem `owner_id`.

### 1.3 `isPast` nunca funciona no EventDetail
**Arquivo**: `modules/event-detail/EventDetailView.tsx:81`
`new Date(evento.data)` — `evento.data` e rotulo de exibicao ("Hoje", "Amanha", "25 Abr"), NAO ISO date. `new Date("Hoje")` = `Invalid Date`. Consequencias: avaliacoes/reviews NUNCA aparecem, guard `isPast` nao funciona, bloco MAIS VANTA aparece ate para eventos passados.

### 1.4 Spotlight de comunidade nunca filtra eventos
**Arquivo**: `modules/search/SearchView.tsx:144`
`e.comunidadeId` nao existe no tipo `Evento`. O campo correto e `e.comunidade?.id`. Comparacao sempre `false`, `eventosComun` sempre vazio.

### 1.5 Webhook Stripe sem validacao de assinatura
**Arquivo**: `supabase/functions/stripe-webhook/index.ts:42-46`
Header `stripe-signature` ignorado (TODO). Qualquer pessoa que conhega a URL pode enviar eventos falsos, ativando assinaturas fraudulentamente.

### 1.6 FCM API legacy depreciada
**Arquivo**: `supabase/functions/send-push/index.ts:11`
Usa `FCM_SERVER_KEY` com endpoint legacy `fcm.googleapis.com/fcm/send`, descontinuado pelo Google em junho 2024. Vai parar de funcionar.

### 1.7 Tabela `cortesias_config` inexistente na migration
**Arquivo**: `supabase/migrations/20260228180000_cortesias_limites_por_tipo.sql:3`
`ALTER TABLE cortesias_config ADD COLUMN ...` — mas `cortesias_config` NAO tem CREATE TABLE em nenhuma migration. Migration falha com `relation "cortesias_config" does not exist`.

### 1.8 `clube_config` com escrita publica
**Arquivo**: `supabase/migrations/20260228150000_clube_config.sql:34-35`
`FOR ALL USING (true) WITH CHECK (true)` — QUALQUER pessoa pode alterar configuracoes do clube (dias_castigo, prazo_post, limites por tier). Zero protecao.

### 1.9 `categorias_evento` com escrita publica
**Arquivo**: `supabase/migrations/20260226010000_categorias_evento.sql:35-36`
`master_write` usa `FOR ALL USING (true)` — qualquer pessoa (incluindo anonimos) pode INSERT/UPDATE/DELETE categorias.

### 1.10 `getRbac()` pode retornar `null!`
**Arquivo**: `features/admin/services/eventosAdminCore.ts:17-19`
`(globalThis as any).__rbacService` nunca e populado. Se `_registerRbac` nao foi chamado, retorna `null!` (non-null assertion em null), causando crash em runtime.

### 1.11 Promise sem await em `criarEvento` (RBAC)
**Arquivo**: `features/admin/services/eventosAdminCrud.ts:100`
`rbacService.atribuir(...)` retorna Promise mas nao tem `await`. Se falhar, atribuicao RBAC nao e criada mas evento ja foi criado.

### 1.12 Promise sem await em `aceitarConvite` (RBAC)
**Arquivo**: `features/admin/services/eventosAdminAprovacao.ts:100`
Mesma situacao: `rbacService.atribuir(...)` sem `await`. Socio aceita convite mas pode nao ter permissao RBAC.

### 1.13 Cron URL hardcoded
**Arquivo**: `supabase/functions/update-instagram-followers/cron.sql:17`
URL do Supabase hardcodada. Se mudar de instancia, cron falha silenciosamente.

### 1.14 SQL injection potencial em `buscarMembros`
**Arquivo**: `services/authService.ts:275`
`.or(\`nome.ilike.%${q}%,email.ilike.%${q}%\`)` — parametro `q` interpolado diretamente no filtro PostgREST. Caracteres especiais podem quebrar a query ou causar comportamento inesperado.

---

## 2. SEGURANCA (10 problemas)

### 2.1 RLS permissiva em 8+ tabelas do clube MAIS VANTA
**Arquivos**: Migrations `clube_mais_vanta.sql`, `mv2_assinaturas.sql`, `mv4_passport.sql`
Todas usam `FOR ALL USING (auth.uid() IS NOT NULL)`. Qualquer usuario autenticado pode: alterar tier de membros, cancelar reservas de outros, aprovar/rejeitar solicitacoes, alterar status de assinaturas.

### 2.2 `mesas` — qualquer autenticado pode criar/deletar mesas de qualquer evento
**Arquivo**: `supabase/migrations/20260227040000_mesas.sql:17-18`

### 2.3 `waitlist` — INSERT sem restricao
**Arquivo**: `supabase/migrations/20260227070000_waitlist.sql:18`
`WITH CHECK (true)` — qualquer pessoa pode inserir na waitlist. SELECT tambem publico (expoe emails).

### 2.4 `cupons` — qualquer autenticado pode criar/modificar cupons
**Arquivo**: `supabase/migrations/20260227080000_cupons.sql:20-23`

### 2.5 XSS no email de convite
**Arquivo**: `supabase/functions/send-invite/index.ts:110-116`
Variaveis `nome`, `mensagem`, `remetente` interpoladas no HTML sem sanitizacao/escape.

### 2.6 Push notification sem verificacao de permissao
**Arquivo**: `supabase/functions/send-push/index.ts:42-50`
Qualquer usuario autenticado pode enviar push para qualquer lista de userIds (spam).

### 2.7 Checkout sem verificacao de permissao por comunidade
**Arquivo**: `supabase/functions/create-checkout/index.ts:49`
Service role key ignora RLS. Qualquer autenticado cria checkout para qualquer comunidadeId.

### 2.8 Open redirect potencial no Checkout Stripe
**Arquivo**: `supabase/functions/create-checkout/index.ts:63`
`returnUrl` nao e validada. URL maliciosa passada diretamente ao Stripe como success/cancel URL.

### 2.9 RPC `incrementar_usos_cupom` sem limite
**Arquivo**: `supabase/migrations/20260227080000_cupons.sql:29-32`
Nao verifica `usos < limite_usos` antes de incrementar. Chamada direta permite uso alem do limite.

### 2.10 Token Meta exposto em URL
**Arquivo**: `supabase/functions/verify-instagram-post/index.ts:78`
`META_ACCESS_TOKEN` como query parameter na URL do oEmbed. Visivel em logs.

---

## 3. ALTOS (14 problemas)

### 3.1 Calculos financeiros ignoram `feeFixed`
**Arquivo**: `features/admin/views/FinanceiroView.tsx:121, 151-160`
`receitaVanta` e `saldoConsolidado` aplicam `feePercent` mas ignoram `feeFixed` por ingresso. Segundo CLAUDE.md: `lucroVanta = valor * feePercent + feeFixed`. Calculo financeiro incorreto.

### 3.2 Taxa fixa no saque aplicada sobre total do evento
**Arquivo**: `features/admin/services/eventosAdminFinanceiro.ts:140`
`feeFixed * totalIngressos` calcula sobre TODAS as vendas do evento, nao proporcional ao valor sacado. Saque parcial paga taxa como se fosse total.

### 3.3 `confirmarSaque` nao e async
**Arquivo**: `features/admin/views/FinanceiroView.tsx:226-249`
`solicitarSaque` e async mas nao e awaited. Se falhar no Supabase, usuario ve sucesso falso.

### 3.4 Encerramento de evento so muda state local
**Arquivo**: `features/admin/views/FinanceiroView.tsx:590`
`setEventoEncerrado(true)` — apenas state local. Nao persiste no Supabase. Reload perde o estado.

### 3.5 `distribuirCota` async nao awaited
**Arquivo**: `features/admin/views/ListasView.tsx:500-508`
`ok` recebe uma Promise (truthy), nunca `false`. Guard de saldo insuficiente NUNCA funciona.

### 3.6 `registrarCortesia` nao persiste no Supabase
**Arquivo**: `features/admin/services/eventosAdminTickets.ts:113-117`
Apenas incrementa contador local. Apos `refresh()`, valor volta a 0. Dado perdido.

### 3.7 Permissoes vazias atribuidas ao socio aceito via convite
**Arquivo**: `features/admin/services/eventosAdminAprovacao.ts:104`
`permissoes: []` — socio aceito via convite nao recebe `VER_FINANCEIRO`, `GERIR_LISTAS`, `GERIR_EQUIPE` (diferente do criador do evento).

### 3.8 `useUserData()` duplicado no EventDetailView
**Arquivo**: `modules/event-detail/EventDetailView.tsx:36`
Cria segunda instancia de todo o hook (auth listeners, subscriptions). Duplica subscriptions Supabase, cria estados dessincronizados.

### 3.9 `activeChatParticipantId.current` como dep de useEffect
**Arquivo**: `hooks/useUserData.ts:331-352`
Ref `.current` NAO e reativo. Chat Realtime pode apontar para participante antigo.

### 3.10 `useMemo` sem `EVENTOS` nas deps (SearchView)
**Arquivo**: `modules/search/SearchView.tsx:50, 121`
Lista de cidades e resultados de busca nao atualizam quando novos eventos carregam do Supabase.

### 3.11 `handleAprovar` sem try/catch (EventosPendentes)
**Arquivo**: `features/admin/views/EventosPendentesView.tsx:96-103`
Se `aprovarEvento` falhar, botao trava em "Aprovando..." permanentemente.

### 3.12 `comunidadeId` NAO passado para Step2Ingressos
**Arquivo**: `features/admin/views/CriarEventoView.tsx:514-521`, `EditarEventoView.tsx:483-489`
Guard de assinatura MAIS VANTA (`assinaturaAtiva`) sempre avalia `true` porque `comunidadeId` e `undefined`.

### 3.13 `listaId` fallback pega primeira lista do sistema
**Arquivo**: `features/admin/views/EventoDashboard.tsx:535-543`
Se nenhuma lista associada ao evento, retorna `listas[0]?.id` — pode abrir dados de OUTRO evento.

### 3.14 `Number(r.valor) ?? 0` retorna `NaN` para null
**Arquivo**: `modules/checkout/CheckoutPage.tsx:237`
`Number(null)` = `NaN`. `NaN ?? 0` = `NaN` (porque NaN nao e null/undefined). Mesa com valor null exibe NaN no preco.

---

## 4. MEDIOS (35 problemas)

### Services
| # | Arquivo:Linha | Problema |
|---|---|---|
| 4.1 | eventosAdminCore.ts:48-50 | Estado mutavel `EVENTOS_ADMIN` exportado com `let`, sem protecao contra concorrencia |
| 4.2 | eventosAdminCore.ts:100 | Campo `nome` no select da equipe nunca existe no resultado |
| 4.3 | eventosAdminCrud.ts:438 | `getNomeById` usa coluna legada `full_name` em vez de `nome` |
| 4.4 | eventosAdminAprovacao.ts:83 | Fluxo COM_SOCIO pode nao mostrar convite ao socio (PENDENTE vs NEGOCIANDO) |
| 4.5 | eventosAdminFinanceiro.ts:23-38 | `getContractedFees` nao consulta taxa da comunidade (hierarquia incompleta) |
| 4.6 | eventosAdminFinanceiro.ts:226 | `confirmarSaque`/`estornarSaque` logam 'masteradm' hardcoded |
| 4.7 | eventosAdminTickets.ts:172, 267 | Audit loga 'portaria'/'sistema' hardcoded (nao rastreia quem executou) |
| 4.8 | eventosAdminTickets.ts:245-249 | `reenviarIngresso` e stub que nao faz nada |
| 4.9 | rbacService.ts:55, 396 | `ATRIBUICOES` e `ADMIN_ASSIGNMENTS` sem protecao contra mutacao concorrente |
| 4.10 | rbacService.ts:277 | Timestamp com offset errado (horario UTC rotulado como -03:00) |
| 4.11 | listasService.ts:152-155, 210, 245 | Cache mutado antes de confirmar Supabase (3 funcoes) |
| 4.12 | listasService.ts:250-262 | 3 chamadas Supabase sequenciais sem transacao/rollback |
| 4.13 | cortesiasService.ts:38-41 | `refresh()` limpa cache antes de verificar sucesso da query |
| 4.14 | authService.ts:17-18 | Avatares hardcoded duplicados (signup vs login podem divergir) |
| 4.15 | authService.ts:72-76 | Role mapping `vanta_guest` -> `vanta_member` impede qualquer guest com email |

### Views Admin
| # | Arquivo:Linha | Problema |
|---|---|---|
| 4.16 | CuradoriaView.tsx:312 | `adminId` pode propagar string vazia para aprovar/rejeitar membros |
| 4.17 | TabClube.tsx:986 | Modal `absolute inset-0` pode nao cobrir tela inteira (parent posicionado) |
| 4.18 | FinanceiroView.tsx:66 | Assume primeiro evento como relevante para saque |
| 4.19 | MasterFinanceiroView.tsx:64, 82-100 | `allEventos` nao memoizado + useMemo com dep instavel (inutil) |
| 4.20 | MasterFinanceiroView.tsx:138-157 | `confirmar`/`estornar` sem refresh — risco double-click |
| 4.21 | ListasView.tsx:389-392 | `checkIn` retorno async ignorado |
| 4.22 | CheckInView.tsx:824-827 | Lista todos eventos incluindo muito antigos |
| 4.23 | CaixaView.tsx:30 | `EventoCaixaView` nao verifica `caixaAtivo` |
| 4.24 | EventosPendentesView.tsx:401-407 | Polling sem svcVersion — re-renders desnecessarios |

### Views Publicas
| # | Arquivo:Linha | Problema |
|---|---|---|
| 4.25 | useUserData.ts:370 | `mutualFriends` sempre `[]` — InviteFriendsModal nunca mostra amigos |
| 4.26 | useNavigation.ts:16-17 | `window.scrollTo`/`scrollY` ineficazes (scroll em container interno) |
| 4.27 | WalletView.tsx:44 | `mvPostUrl` compartilhado entre multiplas reservas MAIS VANTA |
| 4.28 | ClubeOptInView.tsx:65 | `postUrl` compartilhado entre multiplas reservas |

### Event Management + Checkout
| # | Arquivo:Linha | Problema |
|---|---|---|
| 4.29 | ProdutorDashboardView.tsx:293-298 | Feedback de erro usa `alert()` bloqueante em vez de Toast |
| 4.30 | EventoDashboard.tsx:199-257 | `AnalyticsSubView` sem verificacao de autorizacao |
| 4.31 | EventoDashboard.tsx:203-208 | Analytics so contabiliza vendas do Caixa, ignora checkout web |
| 4.32 | ConvitesSocioView.tsx:224-229 | Convite reaparece apos contra-proposta (sem indicador visual) |
| 4.33 | ConvitesSocioView.tsx:224-228 | `enviandoProposta` nunca resetado em caso de erro (botoes travados) |

### Edge Functions + SQL
| # | Arquivo:Linha | Problema |
|---|---|---|
| 4.34 | Edge Functions (todas) | `Access-Control-Allow-Origin: '*'` em todas |
| 4.35 | schema.sql vs migrations | schema.sql faz DROP CASCADE — se re-executado, perde colunas das migrations |

### Guards de Permissao Ausentes (views sem verificacao interna de role)
| # | View | Esperado |
|---|---|---|
| 4.G1 | CuradoriaView.tsx | masteradm |
| 4.G2 | FinanceiroView.tsx | produtor/socio |
| 4.G3 | MasterFinanceiroView.tsx | masteradm |
| 4.G4 | CheckInView.tsx | portaria |
| 4.G5 | EventosPendentesView.tsx | masteradm |

---

## 5. BAIXOS (40+ problemas)

### Codigo Morto / Imports Nao Utilizados
| Arquivo | Problema |
|---|---|
| App.tsx:10 | `AdminDashboardView` importado, nunca usado |
| App.tsx:101 | `isReady`/`setIsReady` — state morto |
| useNavigation.ts:7 | `viewState`/`setViewState` — state morto |
| HomeView.tsx:9 | `onSelectCity` prop morta |
| ProfileView.tsx:2 | `Ticket` import morto |
| ClubeOptInView.tsx:2,4 | `XCircle`, `PassportAprovacao` imports mortos |
| AdminDashboardView.tsx | `GuestlistView` importado, nunca usado |

### Views Orfas (existem mas nunca importadas)
| Arquivo | Status |
|---|---|
| `features/admin/views/MembrosView.tsx` | Substituido pela aba em CuradoriaView |
| `features/admin/views/PromoterCaptureView.tsx` | Nunca importado |
| `features/admin/views/MinhasComunidadesView.tsx` | Nunca importado |

### Tipos Nunca Importados (types.ts)
`TipoSelo`, `Selo`, `NotificacaoAdmin`, `Lote`, `PrestigioLogEntry`, `PermissaoListaConfig`, `AdminScope`, `AdminPermission`, `ContextoTenant`, `TipoTenant`, `AtribuicaoRBAC`

### SubViews Inacessiveis (sem item no sidebar)
| SubView | Tem renderContent | Tem sidebar | Acessivel? |
|---|---|---|---|
| `PORTARIA_SCANNER` | Sim | NAO | Inacessivel |
| `SUPABASE_TEST` | Sim | NAO | Inacessivel |

### Arquivos Deletados Referenciados em Indices
| Arquivo | Referenciado em |
|---|---|
| `MasterDashboardView.tsx` | `.vanta_index.md` |
| `BalancoView.tsx` | `.vanta_index.md`, `VANTA_OPERATIONAL_MAP.md` |
| `MarketingView.tsx` | `.vanta_index.md` |

### Tabelas Sem Migration de Criacao (24 tabelas)
`profiles`, `eventos_admin`, `lotes`, `variacoes_ingresso`, `equipe_evento`, `comunidades`, `niveis_prestigio`, `vanta_indica`, `tickets_caixa`, `vendas_log`, `solicitacoes_saque`, `listas_evento`, `regras_lista`, `cotas_promoter`, `convidados_lista`, `cortesias_config`, `cortesias_log`, `atribuicoes_rbac`, `notifications`, `messages`, `audit_logs`, `soberania_acesso`, `reembolsos`, `chargebacks`

### Migration Vazia
`20260225111721_new-migration.sql` — 0 bytes.

### Inconsistencias Menores
| Arquivo:Linha | Problema |
|---|---|
| CaixaView.tsx:62-66 | Token QR renova a cada 14s, doc diz 30s |
| Step1Evento.tsx:154 | Label diz "min. 1" subcategorias, CLAUDE.md diz "min 3" |
| Step3Listas.tsx:131,141,149 | Typo `ababoraAtivo` em todo o codebase (consistente internamente) |
| CheckoutPage.tsx:330 | `cuponsService.usarCupom` fire-and-forget sem await |
| ProfileView.tsx:48,51 | Itens "Pagamento" e "Ajuda e Suporte" parecem clicaveis mas nao fazem nada |

---

## 6. INCONSISTENCIAS MEMORIA vs CODIGO (9 problemas)

| # | Problema |
|---|---|
| 6.1 | Memoria lista `PRESTIGIO` como subView separado — na realidade e aba interna da CuradoriaView |
| 6.2 | Memoria lista `MEMBROS` como subView separado — na realidade e aba interna da CuradoriaView |
| 6.3 | Memoria lista `COMUNIDADES` no sidebar global — na realidade so existe no community sidebar |
| 6.4 | Memoria lista `PORTARIA` como subView — valores reais sao `PORTARIA_QR` e `PORTARIA_LISTA` |
| 6.5 | Memoria lista `PORTARIA_SCANNER` no community sidebar — nao aparece no sidebar real |
| 6.6 | Memoria lista `BALANCO` como "FUNDIR" — arquivo ja foi deletado |
| 6.7 | Memoria lista `SUPABASE_TEST` no sidebar global — nao aparece no sidebar real |
| 6.8 | Memoria nao menciona `INTERESSES`, `CATEGORIAS`, `SUPABASE_DIAGNOSTIC`, `CONVITES_SOCIO` |
| 6.9 | Memoria nao atualiza tabela do sidebar para incluir `ASSINATURAS_MV` e `PASSAPORTES_MV` |

---

## 7. ACESSIBILIDADE (transversal)

Todos os 9 arquivos de views publicas auditados possuem **ZERO** atributos de acessibilidade:
- Modais sem `role="dialog"`, `aria-modal`, `aria-labelledby`
- Tabs customizadas sem `role="tablist"`/`role="tab"`/`aria-selected`
- Botoes com apenas icones sem `aria-label`
- Checkbox customizado (ClubeOptInView) sem `role="checkbox"`/`aria-checked`
- Inputs com labels visuais mas sem `htmlFor`/`id`

---

## RESUMO NUMERICO

| Severidade | Quantidade |
|---|---|
| CRITICO | 14 |
| SEGURANCA | 10 |
| ALTO | 14 |
| MEDIO | 35+ |
| BAIXO | 40+ |
| Inconsistencias Memoria | 9 |
| Acessibilidade | Transversal (todas as views) |
| **TOTAL** | **120+** |

---

## PRIORIDADE SUGERIDA DE CORRECAO

### Onda 1 — Seguranca e Dados (URGENTE)
1. RLS policies permissivas (clube, mesas, waitlist, cupons, categorias, config)
2. Webhook Stripe sem validacao de assinatura
3. SQL injection em `buscarMembros`
4. XSS no email de convite
5. Push notification sem verificacao de permissao

### Onda 2 — Funcionalidade Core Quebrada
6. Checkout nao grava no Supabase (login simulado)
7. `isPast` nunca funciona (reviews nunca aparecem)
8. Spotlight de comunidade nunca filtra
9. `comunidadeId` nao passado para Step2Ingressos
10. Calculos financeiros sem `feeFixed`

### Onda 3 — Promises e Estado
11. Promises sem await (RBAC, confirmarSaque, distribuirCota)
12. `registrarCortesia` nao persiste
13. Permissoes vazias no socio via convite
14. Cache mutado antes de confirmar Supabase
15. `useUserData()` duplicado no EventDetail

### Onda 4 — Limpeza e Consistencia
16. Codigo morto, views orfas, imports nao usados
17. Inconsistencias memoria vs codigo
18. Tabelas sem migration (documentar)
19. Arquivos deletados em indices
20. Acessibilidade (planejamento futuro)
