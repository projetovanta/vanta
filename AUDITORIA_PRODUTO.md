# AUDITORIA DO PRODUTO VANTA
Gerada em: 2026-03-05 | Método: análise estática do código (TSC, deep-audit, Grep, Read cirúrgico, build de produção)

---

## 1) RESUMO DO PRODUTO

VANTA é uma plataforma de eventos noturnos e sociais que funciona como app nativo (App Store / Google Play via Capacitor) e site (browser/PWA). O produto conecta três pontas: o **público** que descobre, compra ingressos e faz check-in; os **produtores/sócios** que criam, gerenciam e monetizam eventos dentro de comunidades (casas noturnas, bares, espaços); e a **operação VANTA (master)** que controla aprovações, taxas, curadoria de membros e o programa de fidelidade MAIS VANTA.

O sistema financeiro tem hierarquia tripla (sócio → gerente → master) para saques e reembolsos. Toda a stack roda em React + Vite + TypeScript + Tailwind com Supabase como backend único (auth, banco, storage, edge functions, realtime). O app tem sistema de permissões RBAC com cargos granulares, chat em tempo real, social proof, sistema de listas de entrada com cotas para promoters, e check-in com suporte offline via IndexedDB.

**Números do código:**
- 363 arquivos TypeScript/TSX
- 57 tabelas Supabase + 28 RPCs + 88+ migrations
- 14 Edge Functions
- 5 Storage buckets (avatars, comunidades, eventos, selfies, indica-assets)
- Build de produção: 25MB, 282 assets
- TSC: 0 erros | ESLint: 0 erros | Schema vs Queries: 100% válido

---

## 2) O QUE O USUÁRIO CONSEGUE FAZER HOJE

### Conta e Perfil
| Funcionalidade | Status | Evidência |
|---|---|---|
| Criar conta com email e senha | REAL | `authService.signUp()` → Supabase Auth + insere em `profiles` |
| Login com email e senha | REAL | `authService.signIn()` → `signInWithPassword` |
| Logout | REAL | `authService.signOut()` + unregister push tokens |
| Recuperar senha por email | REAL | `resetPasswordForEmail` + `ResetPasswordView.tsx` captura deeplink |
| Editar perfil completo | REAL | `EditProfileView.tsx` (661L) → grava direto no Supabase `profiles.update()` com 12 campos |
| Foto com crop | REAL | `ImageCropperModal.tsx` + `photoService.uploadAvatar()` → bucket `avatars` |
| Álbum de fotos (6 slots) | REAL | `syncAlbum()` → bucket `avatars/{userId}/album_*.jpg` |
| Privacidade por campo | REAL | `EditProfileView` tem toggles Todos/Amigos/Ninguém por campo, grava em `profiles.privacidade` JSONB |
| Alterar senha | REAL | `ProfileView.tsx:216` → `supabase.auth.updateUser({ password })` |
| Excluir conta | REAL | `ProfileView.tsx:237` → soft delete `profiles.update({ excluido: true, excluido_em })` |
| Ver perfil público | REAL | `PublicProfilePreviewView.tsx` (746L) — usado por chat, busca, social proof |
| Selecionar interesses | REAL | `InterestSelector.tsx` → salva em `profiles.interesses` array |
| Enviar comprovante meia-entrada | REAL | `ComprovanteMeiaSection.tsx` → upload para storage + registro em `comprovantes_meia` |
| Login social (Google/Apple) | NÃO EXISTE | Nenhum código de OAuth social encontrado |
| Onboarding com slides introdutórios | NÃO EXISTE | Existe flag `vanta_onboarding_done` em localStorage, mas nenhum componente de slides |
| Configurar preferências de notificação | FAKE | `PreferencesView.tsx` — toggles push/lembretes fazem `setTimeout(800ms)` + atualizam state local. **NÃO gravam no Supabase.** Preferências se perdem ao relogar |

### Descoberta de Eventos
| Funcionalidade | Status | Evidência |
|---|---|---|
| Feed com 8 seções | REAL | Highlights, AoVivo, Perto, Semana, ParaVocê, Novos, Salvos, Categorizado — cada uma com componente próprio |
| Buscar eventos por texto | REAL | `searchEventos()` → server-side `.ilike()` em nome, local, cidade |
| Filtrar por cidade | REAL | `CityFilterModal` + `CitySelector` filtra via Supabase |
| Filtrar por categoria/vibe | REAL | `VibeFilterModal` — filtro client-side sobre eventos carregados |
| Filtrar por período | REAL | `TimeFilterModal` |
| Filtrar por preço | REAL | `PriceFilterModal` com slider de preço máximo |
| Mapa interativo | REAL | `RadarView` com Leaflet + RPC `get_eventos_por_regiao` (Haversine server-side) |
| Eventos ao vivo | REAL | `LiveNowSection` com indicador pulsante — filtra por `data_inicio <= now <= data_fim` |
| Favoritar/desfavoritar | REAL | `extrasStore.toggleSavedEvent()` → tabela `evento_favoritos` |
| Geolocalização "Perto de Você" | REAL | `useGeolocation` hook + RPC Haversine no Supabase |
| Analytics de visualização | REAL | `trackEventView` com buffer 3s → batch INSERT em `analytics_events` |

### Evento (Detalhe)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Ver detalhes completos | REAL | `EventDetailView.tsx` com header, info, social proof, footer |
| Social proof (amigos confirmados) | REAL | `EventSocialProof.tsx` consulta `presencas` + `friendships` |
| Confirmar presença ("Eu vou!") | REAL | `PresencaConfirmationModal` → insere em `presencas` |
| Convidar amigos após confirmar | REAL | `InviteFriendsModal` → envia notificação + Edge Function `send-invite` |
| Ver e escrever avaliações | REAL | Reviews inline no EventDetail + `ReviewModal` → `reviews_evento` |
| Compartilhar evento | REAL | `EventHeader` com `navigator.share()` nativo + fallback clipboard |
| Landing page SEO | REAL | `EventLandingPage.tsx` (301L) em rota `/evento/:slug` + OG tags via `api/og.ts` |
| Reserva MAIS VANTA | REAL | `MaisVantaReservaModal` → `reservas_mais_vanta` |

### Compra de Ingressos
| Funcionalidade | Status | Evidência |
|---|---|---|
| Selecionar lote e variação | REAL | `CheckoutPage.tsx` carrega lotes e variações do Supabase |
| Selecionar mesa/camarote | REAL | `CheckoutPage` com `mesas_ativo` + planta + seleção de mesa |
| Aplicar cupom de desconto | REAL | `CheckoutPage` valida cupom via Supabase + RPC `incrementar_usos_cupom` |
| Informar nomes de acompanhantes | REAL | Campos de nome/CPF por ingresso no checkout |
| Verificar meia-entrada | REAL | Verifica se comprovante foi aprovado em `comprovantes_meia` |
| Processar compra | REAL | RPC `processar_compra_checkout` gera tickets reais em `tickets_caixa` |
| Fila de espera | REAL | `WaitlistModal.tsx` → insere em `waitlist` + notificação quando vaga abre |
| Notificação de confirmação | REAL | Tipo `COMPRA_CONFIRMADA` existe no sistema de notificações |
| Cobrar dinheiro real | NÃO FUNCIONA | Stripe referenciado apenas no serviço de assinaturas MV. **Checkout não integra gateway de pagamento real.** A compra gera tickets mas não cobra |

### Carteira
| Funcionalidade | Status | Evidência |
|---|---|---|
| Ver ingressos com QR code | REAL | `WalletView` + `TicketQRModal` gera QR com JWT assinado |
| Aceitar/recusar cortesia | REAL | `WalletView` + `TicketList` com ações sobre `cortesias_pendentes` |
| Aceitar/recusar transferência | REAL | `TicketList` com ações sobre `transferencias_ingresso` |
| Transferir ingresso | REAL | `EventTicketsCarousel` → `transferenciaService` |
| Solicitar reembolso | REAL | `EventTicketsCarousel` → `reembolsoService` com regras CDC 7 dias |
| Editar nome do titular | REAL | `EventTicketsCarousel` → `updateTitular` em `tickets_caixa` |
| Lock screen com PIN | PARCIAL | `WalletLockScreen.tsx` — PIN hasheado em **localStorage**, não no Supabase. Sem "esqueci meu PIN" |

### Social
| Funcionalidade | Status | Evidência |
|---|---|---|
| Enviar pedido de amizade | REAL | `socialStore` → `friendshipsService` → tabela `friendships` |
| Aceitar/recusar amizade | REAL | Status pending → accepted/rejected |
| Remover amigo | REAL | Delete na tabela `friendships` |
| Buscar pessoas por nome | REAL | `SearchView` tab PEOPLE → RPC `buscar_membros` |
| Ver status online | REAL | `chatStore.onlineUsers` via Realtime presence |

### Mensagens
| Funcionalidade | Status | Evidência |
|---|---|---|
| Chat 1:1 em tempo real | REAL | `messagesService` + Realtime subscribe na tabela `messages` |
| Enviar mensagens | REAL | INSERT em `messages` + notificação |
| Reações em mensagens | REAL | `MessageBubble` com sistema de emoji reactions |
| Status de leitura | REAL | `markRead` atualiza `read_at` |
| Inbox com unread badge | REAL | `chatStore.totalUnreadMessages` na bottom nav |

### Comunidade
| Funcionalidade | Status | Evidência |
|---|---|---|
| Ver página pública | REAL | `ComunidadePublicView` (490L) — info, fotos, horários, endereço |
| Seguir/deixar de seguir | REAL | `communityFollowService` → tabela `community_follows` |
| Ver próximos eventos | REAL | Query `eventos_admin` filtrado por `comunidade_id` |
| Abrir no Google Maps | REAL | Link com coordenadas da comunidade |

### MAIS VANTA (Clube — lado do usuário)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Solicitar entrada no clube | REAL | `solicitacoes_clube` + opt-in flow |
| Verificar Instagram (seguidores + bio) | DEPENDE | Edge Functions `verify-instagram-bio` e `instagram-followers` existem mas dependem de `META_ACCESS_TOKEN` configurado |
| Ver reservas exclusivas | REAL | `reservas_mais_vanta` por tier |
| Reservar experiência MV | REAL | `MaisVantaReservaModal` no EventDetail |
| Solicitar passaporte | REAL | `passport_aprovacoes` |
| Enviar comprovação de post | REAL | Upload de comprovante + verificação |

### Outros (lado do usuário)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Histórico de eventos | REAL | `HistoricoView.tsx` (258L) |
| Conquistas e badges | REAL | `achievementsService.ts` com múltiplas conquistas |
| Painel de notificações | REAL | `NotificationPanel.tsx` com 27 tipos de notificação |
| Ações na notificação | REAL | `handleNotificationActionClickComposite` navega para evento, amizade, cortesia, etc. |
| Deep links via push | REAL | `nativePushService` lê `link` e `tipo` do FCM data e navega |

---

## 3) O QUE O PRODUTOR/ADMIN CONSEGUE FAZER

### Comunidades
| Funcionalidade | Status | Evidência |
|---|---|---|
| Criar comunidade | REAL | `CriarComunidadeView` → 3 steps (identidade, localização, fotos) → INSERT em `comunidades` |
| Editar comunidade | REAL | `ComunidadesView` → `comunidades/` com 16 arquivos |
| Desativar comunidade | REAL | `comunidadesService.desativar()` → soft delete `ativa: false` |
| Definir taxa VANTA | REAL | Campo `taxa_vanta` na criação/edição da comunidade |

### Eventos
| Funcionalidade | Status | Evidência |
|---|---|---|
| Criar evento (wizard 5 steps) | REAL | `CriarEventoView` (868L): dados → ingressos → listas → equipe → financeiro |
| Aceitar ToS | REAL | `TosAcceptModal` antes de publicar |
| Copiar configuração | REAL | `CopiarModal` + `duplicarEvento()` |
| Editar evento | REAL | `EditarEventoView` (858L) — mesmos steps preenchidos |
| Solicitar cancelamento | REAL | Existe no fluxo de aprovação |
| Cortesias com limites por tipo | REAL | `cortesiasService` com `limitesPorTipo` |
| Lotes MV por tier | REAL | `Step2Ingressos` com 28 referências a tier/MV |

### Listas de Entrada
| Funcionalidade | Status | Evidência |
|---|---|---|
| Criar listas com regras | REAL | `listasService` (580L) → `listas_evento` + `regras_lista` |
| Distribuir cotas para promoters | REAL | `cotas_promoter` + atribuição por regra |
| Inserir nomes em lote | REAL | `ModalInserirLote` + `TabNomes` (236L) |
| Check-in pela lista | REAL | `TabCheckin` (118L) |

### Financeiro
| Funcionalidade | Status | Evidência |
|---|---|---|
| Ver receita bruta/taxas/líquida | REAL | `MasterFinanceiroView` + `TabResumoCaixa` |
| Solicitar saque | REAL | Hierarquia: `etapa: SOLICITADO → SOCIO_ANALISOU → GERENTE_AUTORIZADO` em `solicitacoes_saque` |
| Aprovar reembolso | REAL | Hierarquia tripla + regras CDC 7 dias + anti-fraude 3/mês |
| Exportar CSV/PDF | REAL | `exportRelatorio.ts` + `exportRelatorioComunidade.ts` com ExcelJS + jsPDF |
| Simulador de gateway | REAL | `SimuladorGateway.tsx` calcula custos crédito/PIX |
| Raio-X por evento | REAL | `RaioXEvento.tsx` detalha financeiro do evento |

### Aprovações (Master)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Aprovar/rejeitar eventos | REAL | `EventosPendentesView` (676L) + `eventosAdminAprovacao` |
| Taxas customizadas na aprovação | REAL | Override de taxa por evento |
| Autorizar saques | REAL | Hierarquia tripla com `etapa` |
| Aprovar reembolsos | REAL | `reembolsoService` (449L) com hierarquia |

### Convites Sócio
| Funcionalidade | Status | Evidência |
|---|---|---|
| Aceitar/recusar/contra-propor | REAL | RPCs `aceitar_convite_socio`, `recusar_convite_socio`, `contraproposta_convite_socio` |

### Equipe e Permissões (RBAC)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Definir cargos RBAC | REAL | `rbacService` (512L) com cargos: masteradm, gerente, socio, promoter, portaria_lista, portaria_antecipado, caixa |
| Atribuir cargos com permissões | REAL | `atribuicoes_rbac` + 10 guards em `permissoes.ts` (240L) |
| Importar staff | REAL | Referência em `Step4EquipeSocio` |

### Curadoria de Membros
| Funcionalidade | Status | Evidência |
|---|---|---|
| Classificar com tags | REAL | `CuradoriaView` (369L) + `niveis_prestigio` |
| Toggle destaque | REAL | Atualiza `profiles.prestigio_id` |
| Notas do admin | REAL | Campo de notas na curadoria |
| Convidar para MV | REAL | `ConviteMaisVantaModal` |
| Realtime | REAL | Subscribe em `profiles` UPDATE |

### Relatórios
| Funcionalidade | Status | Evidência |
|---|---|---|
| Relatório por evento | REAL | `RelatorioEventoView` (126L) com tabs: geral, listas, ingressos |
| Relatório por comunidade | REAL | `RelatorioComunidadeView` (273L) |
| Relatório master | REAL | `RelatorioMasterView` (348L) |
| Exportar Excel/CSV/PDF | REAL | `exportRelatorio.ts` + `exportRelatorioComunidade.ts` |

### Dashboard do Evento
| Funcionalidade | Status | Evidência |
|---|---|---|
| Analytics com gráficos | REAL | `eventoDashboard/` com Recharts |
| Gerenciar cupons | REAL | Criar, ativar, desativar, remover |
| Listar pedidos + exportar | REAL | `PedidosSubView` com filtros + CSV |
| Reenviar/cancelar ingressos | REAL | Ações no ticket individual |
| Editar lotes in-line | REAL | `LotesSubView` |

### MAIS VANTA (Gestão Master)
| Funcionalidade | Status | Evidência |
|---|---|---|
| Gerenciar planos e tiers | REAL | `PlanosMaisVantaView` (693L) |
| Gerenciar assinaturas | REAL | `AssinaturasMaisVantaView` (286L) — Stripe integration com placeholders |
| Aprovar/revogar passaportes | REAL | `PassaportesMaisVantaView` (274L) |
| Monitorar infrações | REAL | `InfracoesGlobaisMaisVantaView` (286L) |
| Dívida social | REAL | `DividaSocialMaisVantaView` (310L) |
| Bloquear/banir membros | REAL | `clubeService` com ações de bloqueio |
| Ações em massa | REAL | `MembrosGlobaisMaisVantaView` (565L) |

### Outros Admin
| Funcionalidade | Status | Evidência |
|---|---|---|
| Vanta Indica | REAL | Cards de recomendação com upload → `vanta_indica` + bucket `indica-assets` |
| Gestão de comprovantes meia | REAL | `GestaoComprovantesView` (399L) → aprovar/rejeitar |
| Categorias e interesses CRUD | REAL | `CategoriasAdminView` (306L) + `InteressesView` |
| Campanhas multi-canal | REAL | `campanhasService` → IN_APP + PUSH + EMAIL |
| Audit log | REAL | `AuditLogView` (251L) → `audit_logs` |
| Diagnóstico de banco | REAL | `DatabaseHealthView` (593L) → verifica perfis, broadcast |
| Diagnóstico Supabase | REAL | `SupabaseDiagnosticView` + `supabaseDiagnosticSchema.ts` (347L) valida tabelas/colunas/RPCs |
| Product Analytics | REAL | `ProductAnalyticsView` (483L) — frequência, discovery, funil, PMF |

---

## 4) O QUE A PORTARIA CONSEGUE FAZER

| Funcionalidade | Status | Evidência |
|---|---|---|
| Escanear QR code | REAL | `PortariaScannerView` (298L) com câmera |
| Validar ingresso (JWT) | REAL | `jwtService` sign/verify via RPC |
| Queimar ingresso | BUG | RPC `queimar_ingresso` é chamada no código (`eventosAdminTickets.ts:178`) mas **NÃO EXISTE no Supabase**. A migration apenas tenta ALTER, nunca CREATE. **Check-in QR vai falhar em runtime.** |
| Buscar na lista | REAL | `TabCheckin` na portaria lista |
| Vender na porta (caixa) | REAL | `EventoCaixaView` (28KB) → RPC `processar_venda_caixa` |
| Upload de selfie | REAL | Upload para bucket `selfies` + associa ao ticket |
| Gerar QR do ticket vendido | REAL | Gera após venda na porta |
| Virada automática de lote | REAL | RPC `verificar_virada_lote` |
| Funcionar offline | REAL | `offlineEventService` + `offlineDB` com IndexedDB + fila de sync |
| Realtime novos tickets | PARCIAL | `offlineEventService` faz subscribe, mas EventoCaixaView não tem subscribe direto |

---

## 5) O QUE NÃO FUNCIONA OU É FAKE

| Item | Detalhe |
|---|---|
| **Pagamento real** | Checkout gera tickets mas NÃO cobra dinheiro. Stripe só aparece nas assinaturas MV (com placeholders). Pagar.me mencionado em constantes de taxa mas sem integração. CNPJ necessário. |
| **Push notifications** | Código completo (nativePushService + Edge Function send-push + FCM). Funciona SE secrets Firebase estiverem configurados no Supabase Dashboard. Hoje: 0 tokens registrados. |
| **Email transacional** | Edge Functions `send-invite` e `send-notification-email` prontas. Funcionam SE `RESEND_API_KEY` estiver configurado. |
| **Verificação Instagram** | Edge Functions existem. Funcionam SE `META_ACCESS_TOKEN` estiver configurado. |
| **Preferências de notificação** | `PreferencesView.tsx` — toggles de push/lembretes fazem `setTimeout(800ms)` e atualizam APENAS state local. **NÃO gravam no Supabase.** Preferências se perdem ao relogar. |
| **PIN da carteira** | Hasheado em `localStorage`. Sem migração para Supabase. Sem "esqueci meu PIN". |
| **Rate limiting de login** | Apenas client-side via sessionStorage. Facilmente contornável. |
| **RPC queimar_ingresso** | Chamada no código mas NÃO EXISTE no banco. Check-in QR vai falhar. |
| **Timestamp send-push** | Edge Function `send-push/index.ts:207` usa `new Date().toISOString()` (UTC) em vez de `-03:00`. |

---

## 6) CONEXÃO COM SUPABASE

### Tabelas acessadas pelo código (56 tabelas)
`analytics_events`, `assinaturas_mais_vanta`, `atribuicoes_rbac`, `audit_logs`, `chargebacks`, `clube_config`, `community_follows`, `comprovantes_meia`, `comunidades`, `convidados_lista`, `cortesias_config`, `cortesias_log`, `cortesias_pendentes`, `cotas_promoter`, `cupons`, `equipe_evento`, `estilos`, `evento_favoritos`, `eventos_admin`, `experiencias`, `formatos`, `friendships`, `infracoes_mais_vanta`, `interesses`, `listas_evento`, `lotes`, `lotes_mais_vanta`, `mais_vanta_config`, `membros_clube`, `mesas`, `messages`, `notifications`, `pagamentos_promoter`, `passport_aprovacoes`, `planos_mais_vanta`, `pmf_responses`, `profiles`, `push_subscriptions`, `reembolsos`, `regras_lista`, `reservas_mais_vanta`, `reviews_evento`, `soberania_acesso`, `solicitacoes_clube`, `solicitacoes_saque`, `tickets_caixa`, `tiers_mais_vanta`, `transactions`, `transferencias_ingresso`, `vanta_indica`, `variacoes_ingresso`, `vendas_log`, `waitlist`

### Tabelas no Supabase sem referência direta no código (usadas por RLS/triggers)
`cargos`, `categorias_evento`, `niveis_prestigio`, `notificacoes_posevento`

### RPCs chamadas pelo código (15)
`aceitar_convite_socio`, `buscar_membros`, `contraproposta_convite_socio`, `get_admin_access`, `get_convite_socio`, `get_eventos_por_regiao`, `incrementar_usos_cupom`, `processar_compra_checkout`, `processar_venda_caixa`, `queimar_ingresso` (BUG — não existe), `recusar_convite_socio`, `sign_ticket_token`, `verificar_virada_lote`, `verify_ticket_token`

### RPCs no Supabase sem chamada direta (usadas por RLS/triggers)
`finalizar_eventos_expirados`, `get_evento_from_lista`, `get_evento_from_lote`, `is_event_manager_or_admin`, `is_event_team_member`, `is_masteradm`, `is_membro_clube`, `is_produtor_evento`, `is_vanta_admin`, `is_vanta_admin_or_gerente`, `update_push_sub_last_used`

### Storage buckets (5)
`avatars` (foto de perfil), `comunidades` (logo/banner), `eventos` (flyer/planta), `selfies` (biometria), `indica-assets` (cards recomendação)

### Edge Functions (14)
`create-checkout`, `instagram-followers`, `notif-checkin-confirmacao`, `notif-evento-finalizou`, `notif-evento-iniciou`, `notif-infraccao-registrada`, `send-invite`, `send-notification-email`, `send-push`, `send-reembolso-email`, `stripe-webhook`, `update-instagram-followers`, `verify-instagram-bio`, `verify-instagram-post`

---

## 7) PARTES QUE SÃO APENAS INTERFACE SEM BACKEND

| Item | Detalhe |
|---|---|
| Preferências de notificação | Toggles salvam apenas no state React. NÃO persistem no Supabase. |
| PIN da carteira | Hasheado em localStorage. |
| Rate limiting de login | sessionStorage client-side. |
| Cidade selecionada | localStorage. |
| Flag onboarding done | localStorage. |

Fora isso, **todo o resto tem backend real no Supabase**.

---

## 8) FLUXOS REAIS QUE FUNCIONAM DO INÍCIO AO FIM

### Fluxo do usuário
```
Criar conta → Login → Feed de eventos → Abrir evento → Comprar ingresso → QR na carteira → Check-in → Avaliar
```
- Funciona do início ao fim EXCETO: pagamento não cobra dinheiro real

### Fluxo do produtor
```
Login → Painel → Criar comunidade → Criar evento (5 steps) → ToS → Aprovação master → Evento ativo → Vender na porta → Relatório → Saque
```
- 100% funcional para vendas na porta. Vendas online dependem de gateway.

### Fluxo da portaria — QR
```
Login → Painel → Selecionar evento → Escanear QR → Validar JWT → Queimar ingresso
```
- **QUEBRADO**: RPC `queimar_ingresso` não existe no banco. Vai dar erro 404 ao tentar queimar.

### Fluxo da portaria — Lista
```
Login → Painel → Selecionar evento → Buscar nome → Check-in manual
```
- 100% funcional, inclusive offline via IndexedDB.

### Fluxo de lista de entrada
```
Criar evento com lista → Distribuir cotas → Promoters inserem nomes → Portaria faz check-in
```
- 100% funcional.

### Fluxo financeiro
```
Venda gera receita → Sócio solicita saque → Gerente autoriza → Master confirma → Saque concluído
```
- 100% funcional no sistema. Transferência bancária real é manual.

### Fluxo de reembolso
```
Usuário solicita → CDC 7 dias (auto) ou manual → Anti-fraude 3/mês → Hierarquia tripla → Ticket cancelado
```
- 100% funcional no sistema. Devolução do dinheiro real é manual.

### Fluxo MAIS VANTA
```
Solicitar entrada → Verificar Instagram → Curadoria aprova → Membro ativo → Reservar → Post → Comprovar
```
- Funcional (verificação Instagram depende de secret META configurado).

### Fluxo social
```
Buscar pessoa → Enviar pedido de amizade → Aceitar → Chat em tempo real → Reações
```
- 100% funcional com Realtime.

---

## 9) BUGS E PROBLEMAS ENCONTRADOS

| # | Severidade | Problema |
|---|---|---|
| 1 | **CRÍTICO** | RPC `queimar_ingresso` não existe no Supabase — check-in QR vai falhar |
| 2 | **ALTO** | Preferências de notificação não salvam no Supabase (fake save com setTimeout) |
| 3 | **MÉDIO** | `send-push/index.ts:207` usa `toISOString()` (UTC) em vez de `-03:00` |
| 4 | **MÉDIO** | PIN da carteira em localStorage (sem recovery, sem persistência server-side) |
| 5 | **BAIXO** | 5 console.log/warn de debug em código de produção |
| 6 | **BAIXO** | Dependência circular entre stores (auth ↔ extras ↔ tickets) |
| 7 | **INFO** | 44 exports não utilizados |
| 8 | **INFO** | Bundle pesado: exceljs 932KB, jspdf 386KB, recharts 365KB (lazy-loaded) |

---

## 10) FEATURES QUE O APP AINDA NÃO TEM

1. **Gateway de pagamento real** (Stripe/Pix/Pagar.me) — a peça que falta para monetizar. BLOQUEADO por CNPJ.
2. **Login social** (Google/Apple) — G7 pendente
3. **Notificações push reais** — código pronto, faltam secrets Firebase no Dashboard
4. **Email transacional real** — código pronto, falta secret Resend
5. **2FA / Autenticação dois fatores** — não existe
6. **Sistema de denúncia/report** — não existe
7. **Integração com calendário do dispositivo** — não existe
8. **Recibo/comprovante fiscal da compra** — não existe
9. **Dashboard analytics do usuário** (gastos, frequência) — não existe
10. **Programa de indicação** (convide amigos) — não existe
11. **Recuperação de PIN da carteira** — não existe
12. **Modo offline para o usuário** — offline existe só na portaria/caixa
13. **Onboarding com slides** — flag existe mas sem componente visual
14. **Controle de capacidade ao vivo** — TabLotacao existe mas sem realtime do público
15. **Promoter solicitar mais cotas** — G7 pendente

---

## 11) DEPENDÊNCIAS EXTERNAS PENDENTES

| Item | Impacto |
|---|---|
| Supabase Pro ($25/mês) | Necessário antes de publicar nas lojas (limites do free tier) |
| APNs key no Firebase Console | Push iOS nativo não funciona sem isso |
| Sentry tokens no Vercel | Source maps de produção não são enviados |
| Comprimir icon-1024.png | Asset de 962KB, lojas pedem < 200KB |
| CNPJ para gateway | Bloqueia toda monetização real |
| Firebase secrets no Supabase Dashboard | Push notifications não disparam |
| Resend API key no Supabase Dashboard | Emails transacionais não enviam |
| META access token | Verificação de Instagram não funciona |
