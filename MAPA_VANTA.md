# MAPA VANTA

Mapa completo do projeto VANTA gerado por leitura direta do codigo-fonte em 2026-03-10.

---

## 1. TELAS DO USUARIO FINAL

### 1.1 Home (Feed)
- **Arquivo**: `modules/home/HomeView.tsx`
- **O que o usuario ve**: Saudacao com nome do usuario, cidade selecionada, barra de busca rapida. Secoes em scroll vertical: Highlights (carrossel de destaques editoriais), AO VIVO agora, Amigos confirmados, Perto de voce, Esta semana, Novos na plataforma, Para voce (recomendados), Salvos, EventFeed (paginado infinite scroll).
- **Acoes disponiveis**: Clicar em evento (abre detalhe), buscar, abrir notificacoes, navegar para perfil/carteira, clicar em comunidade, comemore seu aniversario.
- **Navegacao**: Evento -> EventDetailView; Buscar -> SearchView; Perfil -> ProfileView; Comunidade -> ComunidadePublicView.
- **Dados**: `useExtrasStore.allEvents` (paginacao server-side `getEventosPaginated`), `useTicketsStore.myTickets`, `useAuthStore.selectedCity`.
- **Componentes filhos**: EventFeed, Highlights, ForYouSection, FriendsGoingSection, LiveNowSection, NearYouSection, ThisWeekSection, NewOnPlatformSection, SavedEventsSection, QuickActions, LazySection.
- **Status**: [x] Completo

### 1.2 Detalhe do Evento
- **Arquivo**: `modules/event-detail/EventDetailView.tsx`
- **O que o usuario ve**: Imagem do evento em header com botoes back/share/favoritar, info do evento (data, horario, local, formato, comunidade), prova social (confirmados + amigos), footer com preco e botao "Comprar" ou "Confirmar Presenca".
- **Acoes disponiveis**: Voltar, compartilhar evento, favoritar, comprar ingresso, confirmar presenca (evento gratuito), convidar amigos, ver membros confirmados, abrir perfil de membro, ver beneficio MAIS VANTA, avaliar evento (review), solicitar comemoracao.
- **Navegacao**: Comprar -> abre URL `/checkout/{eventoId}` (standalone); Membro -> PublicProfilePreviewView; Comunidade -> ComunidadePublicView.
- **Dados**: Evento recebido via props, `eventosAdminService` (detalhes adicionais), `reviewsService`, `clubeService` (beneficios MV), `useTicketsStore`, `useSocialStore.mutualFriends`.
- **Componentes filhos**: EventHeader, EventInfo, EventFooter, EventSocialProof, PresencaConfirmationModal, InviteFriendsModal, MaisVantaBeneficioModal, MaisVantaReservaModal, ReviewModal, ComemoracaoFormView.
- **Status**: [x] Completo

### 1.3 Checkout (Standalone)
- **Arquivo**: `modules/checkout/CheckoutPage.tsx`
- **Rota**: `/checkout/:slug`
- **O que o usuario ve**: Pagina standalone (sem tab bar) com imagem do evento, seletor de lotes e variacoes (area/genero/preco), stepper de quantidade, campo de cupom, campo de acompanhantes, resumo com total. Modal de login por email+senha no rodape.
- **Acoes disponiveis**: Selecionar variacoes, ajustar quantidades, aplicar cupom, preencher nomes de acompanhantes, entrar na waitlist (se esgotado), fazer login e confirmar compra. Opcao de selecionar mesa (quando evento tem mesas ativas).
- **Fluxo de compra (gratuito)**: Login -> RPC `processar_compra_checkout` (server-side) -> gera tickets -> tela de sucesso com QR codes.
- **Fluxo de compra (pago via Stripe)**: Ainda em implementacao -- Edge Function `create-ticket-checkout` cria sessao Stripe Checkout e retorna URL de redirect. Pos-pagamento: `CheckoutSuccessPage` faz polling do `pedidos_checkout` ate status=pago.
- **Navegacao**: Sucesso -> SuccessScreen (com share e botao "Voltar ao App").
- **Dados**: `supabase.eventos_admin`, `supabase.lotes`, `supabase.variacoes_ingresso`, `cuponsService`, `comprovanteService`.
- **Status**: [x] Completo para eventos gratuitos. [?] Incerto para pagos (Stripe) -- branch `feat/stripe-ingressos` com Edge Functions prontas, mas stripe-webhook nao trata `pedidos_checkout` (apenas assinaturas MV). Fluxo pago depende de config Stripe + webhook para confirmar.

### 1.4 Checkout Success (Stripe)
- **Arquivo**: `modules/checkout/CheckoutSuccessPage.tsx`
- **Rota**: (acessada via redirect Stripe com `?pedido_id=`)
- **O que o usuario ve**: Tela de polling com spinner, depois confirmacao com quantidade de ingressos e botao de compartilhar/voltar.
- **Fluxo**: Polling a cada 2s na tabela `pedidos_checkout` ate status=pago. Timeout 30s.
- **Status**: [x] Completo (frontend). [ ] Depende da Edge Function stripe-webhook processar `pedidos_checkout`.

### 1.5 Busca
- **Arquivo**: `modules/search/SearchView.tsx`
- **O que o usuario ve**: Header com barra de busca, tabs EVENTOS/PESSOAS, filtros (cidade, estilo/vibe, data/horario, preco, beneficios MV). Resultados em grid.
- **Acoes disponiveis**: Buscar texto, filtrar por cidade/categoria/data/preco/beneficio MV, trocar entre aba Eventos e Pessoas, clicar em evento ou perfil.
- **Navegacao**: Evento -> EventDetailView; Pessoa -> PublicProfilePreviewView; Comunidade -> ComunidadePublicView.
- **Dados**: `useExtrasStore.allEvents` (local) + `searchEventsServerSide` (server-side), `authService.searchPeopleByName`.
- **Componentes filhos**: SearchHeader, SearchResults, PeopleResults, CityFilterModal, VibeFilterModal, TimeFilterModal, PriceFilterModal.
- **Status**: [x] Completo

### 1.6 Carteira (Wallet)
- **Arquivo**: `modules/wallet/WalletView.tsx`
- **O que o usuario ve**: Tela com lock screen (biometria/PIN). Apos desbloqueio: carrossel de ingressos por evento com QR code, lista de presencas (futuras e passadas). Tabs: Ingressos / Presencas. Badge MAIS VANTA para membros do clube.
- **Acoes disponiveis**: Desbloquear carteira, ver QR code de ingresso (anti-screenshot), devolver cortesia, transferir ingresso, editar titular (nome + CPF), ver comprovante de meia-entrada.
- **Navegacao**: Interna (modais de QR, transferencia, devolucao).
- **Dados**: `useTicketsStore.myTickets`, `useTicketsStore.myPresencas`, `useExtrasStore.allEvents`, `clubeService` (tier do membro).
- **Componentes filhos**: EventTicketsCarousel, TicketList, PresencaList, TicketQRModal, WalletLockScreen.
- **Status**: [x] Completo

### 1.7 Mensagens
- **Arquivo**: `modules/messages/MessagesView.tsx`
- **O que o usuario ve**: Lista de conversas com busca, status online, mood emoji, ultima mensagem, contagem de nao lidas.
- **Acoes disponiveis**: Buscar conversas, iniciar novo chat (com amigos mutuos), abrir chat existente.
- **Navegacao**: Chat -> ChatRoomView.
- **Dados**: `useChatStore.chats`, `useSocialStore.mutualFriends`, `moodService`.
- **Componentes filhos**: ChatListItem, NewChatModal.
- **Status**: [x] Completo

### 1.8 Chat Room
- **Arquivo**: `modules/messages/components/ChatRoomView.tsx`
- **O que o usuario ve**: Conversa 1:1 com bolhas de mensagem, reacoes, busca interna, header com foto e nome do participante. Opcao de ver perfil publico.
- **Acoes disponiveis**: Enviar mensagem, reagir com emoji, deletar propria mensagem, ver perfil do participante, buscar no chat.
- **Dados**: `useChatStore` (mensagens em tempo real via Supabase Realtime), `useSocialStore`.
- **Status**: [x] Completo

### 1.9 Perfil
- **Arquivo**: `modules/profile/ProfileView.tsx`
- **O que o usuario ve**: Foto + nome + bio + selos + interesses + mood. Menu com opcoes: Editar Perfil, Minha Carteira, Meus Ingressos, Historico, MAIS VANTA, Previews publico/amigos, Preferencias, Solicitar Parceria, Minhas Solicitacoes, Minhas Pendencias, Logout. Badge de admin (se tem cargo).
- **Acoes disponiveis**: Editar perfil, ver carteira, ver ingressos, ver historico de frequencia, entrar no MAIS VANTA, pre-visualizar perfil publico, configurar preferencias, solicitar parceria, ver solicitacoes, ver pendencias (parcerias + amizades), logout.
- **Subviews**: EditProfileView, PreferencesView, PublicProfilePreviewView, HistoricoView, ClubeOptInView, ComprovanteMeiaSection, SolicitarParceriaView, MinhasSolicitacoesView, MinhasPendenciasView, DealsMembroSection.
- **Dados**: `useAuthStore.profile`, `useTicketsStore`, `useExtrasStore`, `clubeService`, `comprovanteService`, `moodService`.
- **Status**: [x] Completo

### 1.10 Editar Perfil
- **Arquivo**: `modules/profile/EditProfileView.tsx`
- **O que o usuario ve**: Form com foto (camera/upload + crop), nome, bio, genero, nascimento, telefone, cidade, estado, instagram, interesses.
- **Acoes**: Alterar foto, editar todos os campos, salvar.
- **Dados**: `useAuthStore.profile`, `photoService`.
- **Status**: [x] Completo

### 1.11 Historico
- **Arquivo**: `modules/profile/HistoricoView.tsx`
- **O que o usuario ve**: Medalhas de frequencia por comunidade (ESTREANTE, FREQUENTADOR, HABITUE, LENDA), lista de conquistas, eventos passados.
- **Dados**: `achievementsService`.
- **Status**: [x] Completo

### 1.12 MAIS VANTA (Opt-In do Membro)
- **Arquivo**: `modules/profile/ClubeOptInView.tsx`
- **O que o usuario ve**: Tela de adesao ao clube MAIS VANTA. Se nao e membro: termos de uso LGPD completos, campo Instagram, botao de solicitar entrada. Se pendente: status da solicitacao. Se aprovado: painel do membro com tier, reservas ativas, deals disponiveis, tela de resgate, historico.
- **Acoes**: Solicitar entrada, aceitar termos, preencher Instagram, ver deals, resgatar beneficios.
- **Dados**: `clubeService.getMembratura`, `clubeService.getSolicitacao`, `maisVantaConfigService`.
- **Status**: [x] Completo

### 1.13 Deals do Membro
- **Arquivo**: `modules/profile/DealsMembroSection.tsx`
- **O que o usuario ve**: Lista de deals (ofertas de parceiros) disponiveis para seu tier, com botao de resgatar.
- **Dados**: `clubeDealsService`, `clubeResgatesService`, `clubeCidadesService`.
- **Status**: [x] Completo

### 1.14 Comprovante Meia-Entrada
- **Arquivo**: `modules/profile/ComprovanteMeiaSection.tsx`
- **O que o usuario ve**: Upload de comprovante de meia-entrada (estudante, ID jovem, etc.), status de aprovacao.
- **Dados**: `comprovanteService`.
- **Status**: [x] Completo

### 1.15 Radar (Mapa)
- **Arquivo**: `modules/radar/RadarView.tsx`
- **O que o usuario ve**: Mapa Leaflet com pins de eventos, calendario premium para filtrar por data, controles de zoom, localizacao do usuario.
- **Acoes**: Navegar no mapa, filtrar por data, clicar em pin para abrir evento, pedir permissao de localizacao.
- **Dados**: Eventos filtrados por coordenadas, `useRadarLogic` hook, `usePermission` (geolocalizacao).
- **Status**: [x] Completo

### 1.16 Comunidade Publica
- **Arquivo**: `modules/community/ComunidadePublicView.tsx`
- **O que o usuario ve**: Pagina da comunidade com foto, descricao, horarios de funcionamento, proximos eventos, reviews, seguidores. Botoes: seguir, solicitar evento privado, solicitar comemoracao.
- **Acoes**: Seguir/deixar de seguir comunidade, ver eventos, ver reviews, solicitar evento privado, solicitar comemoracao.
- **Dados**: `vantaService`, `communityFollowService`, `reviewsService`, `supabase.eventos_admin`.
- **Status**: [x] Completo

### 1.17 Solicitar Evento Privado
- **Arquivo**: `modules/community/EventoPrivadoFormView.tsx`
- **O que o usuario ve**: Formulario para solicitar evento privado numa comunidade: nome, empresa, email, telefone, Instagram, data, capacidade, horario, formatos, atracoes, descricao.
- **Dados**: `eventoPrivadoService`.
- **Status**: [x] Completo

### 1.18 Solicitar Comemoracao
- **Arquivo**: `modules/community/ComemoracaoFormView.tsx`
- **O que o usuario ve**: Formulario para celebrar aniversario: motivo, nome, data, celular, Instagram, evento desejado.
- **Dados**: `comemoracaoService`.
- **Status**: [x] Completo

### 1.19 Minhas Solicitacoes (Privado)
- **Arquivo**: `modules/community/MinhasSolicitacoesPrivadoView.tsx`
- **O que o usuario ve**: Lista das solicitacoes de eventos privados feitas pelo usuario, com status (ENVIADA, EM_ANALISE, APROVADA, RECUSADA).
- **Status**: [x] Completo

### 1.20 Minhas Solicitacoes (Geral)
- **Arquivo**: `modules/profile/MinhasSolicitacoesView.tsx`
- **O que o usuario ve**: Lista unificada de solicitacoes (eventos privados + comemoracoes) com status.
- **Dados**: `eventoPrivadoService`, `comemoracaoService`.
- **Status**: [x] Completo

### 1.21 Minhas Pendencias
- **Arquivo**: `modules/profile/MinhasPendenciasView.tsx`
- **O que o usuario ve**: 2 abas — Solicitacoes (parcerias enviadas com status/timeline) e Amizades (pedidos pendentes enviados/recebidos com foto/nome).
- **Dados**: queries diretas em `solicitacoes_parceria` e `friendships` + `profiles`.
- **Status**: [x] Completo

### 1.22 Landing Page do Evento
- **Arquivo**: `modules/landing/EventLandingPage.tsx`
- **Rota**: `/evento/:slug`
- **O que o usuario ve**: Pagina publica (sem login) com info do evento, imagem, data, local, preco. Botao "Comprar Ingresso" redireciona para checkout.
- **Dados**: `supabase.eventos_admin`.
- **Status**: [x] Completo

### 1.22 Aceitar Convite MAIS VANTA
- **Arquivo**: `modules/convite/AceitarConviteMVPage.tsx`
- **Rota**: `/convite-mv/:token`
- **O que o usuario ve**: Pagina standalone para aceitar convite ao MAIS VANTA via link com token. Mostra info do convite, permite login e aceitar.
- **Dados**: `supabase.convites_mais_vanta`, `useAuthStore`.
- **Status**: [x] Completo

### 1.23 Dashboard do Parceiro
- **Arquivo**: `modules/parceiro/ParceiroDashboardPage.tsx`
- **Rota**: `/parceiro`
- **O que o usuario ve**: Dashboard para parceiros MAIS VANTA. Metricas (total resgates, resgates no mes, membros unicos), lista de deals ativos, resgates recentes com status.
- **Dados**: `parceiroService`, `clubeResgatesService`.
- **Status**: [x] Completo

### 1.24 My Tickets View
- **Arquivo**: `features/tickets/views/MyTicketsView.tsx`
- **O que o usuario ve**: Carteira digital com cards por ingresso: nome do evento, data, local, variacao, status (DISPONIVEL/USADO/CANCELADO), QR code. Modal para editar titular (nome + CPF).
- **Dados**: `vantaService.getMyTickets`, `useTicketsStore`.
- **Status**: [x] Completo

### 1.25 Perfil Publico
- **Arquivo**: `modules/profile/PublicProfilePreviewView.tsx`
- **O que o usuario ve**: Preview do perfil de outro usuario: foto, nome, bio, selos, interesses, conquistas, mood. Botoes: adicionar amigo, enviar mensagem, bloquear.
- **Acoes**: Enviar solicitacao de amizade, aceitar/recusar, remover amigo, abrir chat.
- **Dados**: `useSocialStore.friendships`, `achievementsService`, `moodService`.
- **Status**: [x] Completo

### 1.26 Login
- **Arquivo**: `components/LoginView.tsx`
- **O que o usuario ve**: Tela de login com email + senha, opcao de "Esqueci minha senha", link para cadastro.
- **Dados**: `authService.signIn`.
- **Status**: [x] Completo

### 1.27 Cadastro (AuthModal)
- **Arquivo**: `components/AuthModal.tsx`
- **O que o usuario ve**: Wizard multi-step: nome, email, senha, genero, nascimento, cidade, telefone, Instagram, interesses, selfie com camera (analise facial automatica), termos de uso.
- **Dados**: `authService.signUp`, `supabaseVantaService.uploadBiometria`.
- **Componentes filhos**: `components/auth/SelfieCameraComponent.tsx` (analise facial client-side), `StepIndicator`, `authHelpers`.
- **Status**: [x] Completo

### 1.28 Onboarding
- **Arquivo**: `components/OnboardingView.tsx`
- **O que o usuario ve**: Tutorial pos-cadastro com slides explicando o app.
- **Status**: [x] Completo

### 1.29 Reset Password
- **Arquivo**: `components/ResetPasswordView.tsx`
- **O que o usuario ve**: Tela para redefinir senha (acessada via link de email).
- **Status**: [x] Completo

---

## 2. CLUBE MAIS VANTA

### 2.1 Entrada no Clube
- **Tela do usuario**: `modules/profile/ClubeOptInView.tsx` (subview do perfil)
- **Fluxo**: Usuario acessa Perfil -> MAIS VANTA -> ve termos LGPD -> preenche Instagram -> Solicitar Entrada -> status PENDENTE -> curadoria admin analisa -> APROVADO ou REJEITADO.
- **Convite**: Link `/convite-mv/:token` (`modules/convite/AceitarConviteMVPage.tsx`) -- aceita convite direto e pula curadoria.
- **Tabelas**: `membros_clube`, `solicitacoes_clube`, `convites_mais_vanta`.
- **Status**: [x] Completo

### 2.2 Tiers
- **Definicao**: `features/admin/views/curadoria/tabClube/tierUtils.ts` (TIER_LABELS, TIER_COLORS)
- **Configuracao admin**: `features/admin/services/clubeService.ts`, `features/admin/services/clube/clubeCache.ts` (TIER_ORDER)
- **Funcionamento**: Tiers sao definidos na tabela `tiers_mais_vanta`. Cada membro tem um tier atribuido pela curadoria. Tier define: acesso a lotes exclusivos, descontos, convites, limites de reserva.
- **Status**: [x] Completo

### 2.3 Beneficios na Compra
- **Desconto silencioso**: No checkout (`CheckoutPage.tsx`), `descontoMVValor` e calculado e aplicado automaticamente se o comprador e membro do clube.
- **Lote exclusivo MV**: `features/admin/services/clube/clubeLotesService.ts` -- funcoes `getLoteMaisVanta`, `getLoteParaTier`, `getBeneficiosEvento`.
- **Modal de beneficio**: `modules/event-detail/components/MaisVantaBeneficioModal.tsx` -- mostra ao membro qual beneficio ele tem naquele evento.
- **Modal de reserva**: `modules/event-detail/components/MaisVantaReservaModal.tsx` -- permite reservar vaga com beneficio MV.
- **Config por evento**: No criar evento (`Step2Ingressos.tsx`), produtor configura `MaisVantaEventoForm` com beneficios por tier (ingresso ou lista + desconto).
- **Status**: [x] Completo

### 2.4 Passaporte Regional
- **Admin**: `features/admin/views/PassaportesMaisVantaView.tsx` -- lista e gerencia passaportes.
- **Curadoria**: `features/admin/views/curadoria/tabClube/SubTabPassaportes.tsx` -- aprovar/rejeitar solicitacoes.
- **Servico**: `clubeService` + `clubeCache.rowToPassport`.
- **Funcionamento**: Membro solicita passaporte para outra cidade. Admin aprova. Passaporte permite acessar beneficios em comunidades daquela cidade.
- **Status**: [x] Completo (UI e backend prontos)

### 2.5 Curadoria (Admin)
- **Tela principal**: `features/admin/views/curadoria/tabClube/index.tsx`
- **SubTabs**: Solicitacoes (aprovar/rejeitar com tags), Membros (listar, mudar tier, ver perfil enriquecido), Eventos (config MV por evento), Posts (verificar divulgacao), Passaportes, Config, Notificacoes.
- **Componentes**: SubTabSolicitacoes, SubTabMembros, SubTabEventos, SubTabPosts, SubTabPassaportes, SubTabConfig, SubTabNotificacoes, PerfilMembroOverlay, TagsPredefinidas.
- **Quem acessa**: vanta_masteradm (sidebar CURADORIA_MV).
- **Status**: [x] Completo

### 2.6 Configuracao (Admin)
- **Hub**: `features/admin/views/MaisVantaHubView.tsx` -- agrupa: Planos, Assinaturas, Passaportes, Config, Cidades, Parceiros, Deals.
- **Config geral**: `features/admin/views/ConfigMaisVantaView.tsx` -- nome do programa, email, prazo post, mencoes obrigatorias, hashtags, limites de infracao, bloqueios, termos customizados, beneficios disponiveis.
- **Planos/Assinaturas**: `PlanosMaisVantaView.tsx`, `AssinaturasMaisVantaView.tsx` -- BASICO (R$199), PRO (R$499), ENTERPRISE (R$999). Via Stripe Checkout.
- **Servico**: `maisVantaConfigService.ts`.
- **Status**: [x] Completo

### 2.7 Deals e Parceiros
- **Parceiros admin**: `features/admin/views/ParceirosMaisVantaView.tsx` -- cadastro e gestao de parceiros.
- **Deals admin**: `features/admin/views/DealsMaisVantaView.tsx` -- criar/editar deals (ofertas) para membros.
- **Dashboard parceiro**: `modules/parceiro/ParceiroDashboardPage.tsx` -- metricas e resgates.
- **Servicos**: `clubeParceirosService`, `clubeDealsService`.
- **Cidades**: `CidadesMaisVantaView.tsx`, `clubeCidadesService`.
- **Status**: [x] Completo

### 2.8 Convites MV
- **Admin**: `features/admin/views/ConvitesMaisVantaView.tsx` -- criar convites tipo MEMBRO ou PARCEIRO com tier, cidade, expiracao.
- **Aceitar**: `modules/convite/AceitarConviteMVPage.tsx` (rota `/convite-mv/:token`).
- **Servico**: `clubeConvitesService`.
- **Status**: [x] Completo

### 2.9 Resgates
- **Membro**: Via `DealsMembroSection.tsx` no perfil -- lista deals do tier, botao resgatar.
- **Parceiro**: Ve resgates no `ParceiroDashboardPage.tsx`.
- **Servico**: `clubeResgatesService`.
- **Status**: [x] Completo

### 2.10 Infracoes e Divida Social
- **Infracoes**: `InfracoesGlobaisMaisVantaView.tsx` -- lista global de infracoes.
- **Divida social**: `DividaSocialMaisVantaView.tsx` -- membros com debito de divulgacao.
- **Monitoramento**: `MonitoramentoMaisVantaView.tsx` -- hub com membros globais, eventos, infracoes, divida social.
- **Edge Functions**: `notif-evento-finalizou` (avisa para postar), `notif-infraccao-registrada` (registra infracao T+24h).
- **Servico**: `clubeInfracoesService` -- `estaBloqueado`, `isBanidoPermanente`, `temDividaSocial`, `temCastigoNoShow`.
- **Status**: [x] Completo

### 2.11 Analytics MV
- **Tela**: `AnalyticsMaisVantaView.tsx` -- metricas do programa (membros, resgates, crescimento).
- **Dados**: Queries diretas no Supabase.
- **Status**: [x] Completo

---

## 3. PAINEL ADMIN

### 3.1 Arquitetura
- **Gateway**: `features/admin/AdminGateway.tsx` -- resolve role/comunidade, renderiza `AdminDashboardView`.
- **Dashboard**: `features/admin/AdminDashboardView.tsx` -- renderContent() mapeia subView -> componente lazy-loaded.
- **Sidebar Global**: `SIDEBAR_SECTIONS` -- secoes GERAL, GESTAO, FINANCEIRO, MAIS VANTA, MARKETING, SISTEMA.
- **Sidebar Comunidade**: `COMMUNITY_SIDEBAR_SECTIONS` -- secoes GERAL, OPERACAO DIA, FINANCEIRO, MAIS VANTA, ADMINISTRACAO.

### 3.2 Views por SubView Key

| SubView | Arquivo | Cargo | O que faz |
|---|---|---|---|
| DASHBOARD | AdminDashboardHome.tsx | master, gerente, socio | Home com KPIs, graficos, resumo financeiro, eventos recentes |
| PENDENCIAS_HUB | PendenciasHubView.tsx | master, gerente, socio | Hub de itens pendentes (curadoria, reembolsos, saques, parcerias, comemoracoes) |
| COMUNIDADES | comunidades/ComunidadesView.tsx | master, gerente, socio | Listar comunidades, abrir detalhe, criar nova |
| PENDENTES | EventosPendentesView.tsx | master | Eventos aguardando aprovacao para publicacao |
| CATEGORIAS | CategoriasAdminView.tsx | master | CRUD de categorias de eventos |
| SOLICITACOES_PARCERIA | SolicitacoesParceriaView.tsx | master | Analisar solicitacoes de parceria (espacos/produtoras) |
| CARGOS | definirCargos/index.tsx | master | Definir cargos customizados com permissoes granulares |
| FINANCEIRO_MASTER | masterFinanceiro/index.tsx | master | Visao financeira global: lucro por comunidade, raio-x evento, simulador gateway |
| GESTAO_COMPROVANTES | GestaoComprovantesView.tsx | master | Aprovar/rejeitar comprovantes de meia-entrada |
| RELATORIO_MASTER | relatorios/RelatorioMasterView.tsx | master | Relatorios consolidados cross-comunidade |
| CURADORIA_MV | curadoria/tabClube/index.tsx | master | Curadoria MAIS VANTA (solicitacoes, membros, eventos, posts, passaportes) |
| MEMBROS_GLOBAIS_MV | MembrosGlobaisMaisVantaView.tsx | master, gerente | Lista global de membros do clube |
| INFRACOES_GLOBAIS_MV | InfracoesGlobaisMaisVantaView.tsx | master | Infracoes de membros |
| CONVITES_MV | ConvitesMaisVantaView.tsx | master, gerente | Criar e gerenciar convites MV |
| ANALYTICS_MV | AnalyticsMaisVantaView.tsx | master | Analytics do programa MAIS VANTA |
| MONITORAMENTO_MV | MonitoramentoMaisVantaView.tsx | master | Hub de monitoramento (membros, eventos, infracoes, divida) |
| MAIS_VANTA_HUB | MaisVantaHubView.tsx | master | Config central MV (planos, assinaturas, passaportes, config, cidades, parceiros, deals) |
| INDICA | VantaIndicaView.tsx | master | Gerenciar destaques editoriais (Highlights do home feed) |
| NOTIFICACOES | NotificacoesAdminView.tsx | master | Enviar notificacoes em massa (campanhas in-app + push + email) |
| PRODUCT_ANALYTICS | ProductAnalyticsView.tsx | master | Analytics de produto (usuarios ativos, retencao, funil) |
| DIAGNOSTICO | DiagnosticoView.tsx | master | Health check do banco + diagnostico Supabase |
| MEUS_EVENTOS | MeusEventosView.tsx | master, gerente, socio | Listar eventos do contexto da comunidade |
| PORTARIA_QR | PortariaQRDashView.tsx | master, ger_portaria_antecipado, portaria_antecipado | Dashboard de portaria QR com contadores |
| PORTARIA_LISTA | PortariaListaDashView.tsx | master, ger_portaria_lista, portaria_lista | Dashboard de portaria lista com contadores |
| CAIXA | caixa/index.tsx | master, caixa | Vender ingressos na porta (caixa do evento) |
| LISTAS | listas/index.tsx | master, socio, gerente, promoter | Gerenciar listas de convidados |
| PROMOTER_COTAS | PromoterCotasView.tsx | promoter | Ver cotas pessoais do promoter |
| FINANCEIRO | financeiro/index.tsx | master, socio, gerente | Financeiro do evento: vendas, saques, reembolsos, fechamento |
| CONVITES_SOCIO | ConvitesSocioView.tsx | socio | Gerenciar convites de socio |
| AUDIT_LOG | AuditLogView.tsx | master | Log de auditoria de acoes |
| CRIAR_COMUNIDADE | criarComunidade/index.tsx | master | Wizard 3 steps: identidade, localizacao, fotos |
| CRIAR_EVENTO | CriarEventoView.tsx | master, gerente, socio | Wizard 5 steps: dados, ingressos/lotes, listas, equipe, financeiro |
| EDITAR_EVENTO | EditarEventoView.tsx | master, gerente, socio | Mesmos steps do criar, pre-populados |
| EVENTO_DASHBOARD | eventoDashboard/index.tsx | master, gerente, socio | Dashboard do evento: KPIs, vendas, duplicar, analytics, cupons, pedidos, editar lotes/listas, comemoracao, serie recorrente |
| CHECKIN | checkin/index.tsx | master, portaria | Selecionar evento e abrir check-in (QR ou lista) |
| SCANNER | PortariaScannerView.tsx | master, portaria | Scanner QR com camera para validar ingressos |
| NEGOCIACAO_SOCIO | NegociacaoSocioView.tsx | socio | Chat turn-based de negociacao socio (9 RPCs, 48h expiracao) |
| GERENTE_DASHBOARD | GerenteDashboardView.tsx | gerente | Dashboard do gerente com criar evento integrado |
| SOCIO_DASHBOARD | SocioDashboardView.tsx | socio | Dashboard do socio com metricas dos seus eventos |
| PROMOTER_DASHBOARD | PromoterDashboardView.tsx | promoter | Dashboard do promoter com eventos e nomes inseridos |
| CAIXA_DASHBOARD | CaixaDashboardView.tsx | master, caixa | Dashboard do caixa com eventos para operar |
| SOLICITAR_PARCERIA | SolicitarParceriaView.tsx | qualquer usuario | Formulario de solicitacao de parceria |

### 3.3 Comunidade Detalhe (Admin)
- **Arquivo**: `features/admin/views/comunidades/ComunidadeDetalheView.tsx`
- **Tabs**: Eventos (Central: criar, proximos, encerrados), Equipe (membros + cargos), Logs, Caixa (resumo financeiro), Relatorio, Eventos Privados, Comemoracoes.
- **Status**: [x] Completo

### 3.4 Evento Dashboard (Admin)
- **Arquivo**: `features/admin/views/eventoDashboard/index.tsx`
- **Funcionalidades**: KPIs do evento, grafico vendas por dia, vendas acumuladas, pico de vendas, vendas por variacao/origem/canal. SubViews: Editar, Gerenciamento (lotacao, equipe, lista, cortesias, cargos, resumo caixa, relatorio, mesas, logs), Analytics, Cupons, Pedidos, Editar Lotes, Editar Listas, Config Comemoracao. Serie recorrente (SerieChips). Duplicar evento.
- **Status**: [x] Completo

### 3.5 Gerenciamento do Evento
- **Arquivo**: `features/admin/views/eventManagement/EventDetailManagement.tsx`
- **Tabs**: LOTACAO, EQUIPE (promoter/socio), LISTA, LOGS, RESUMO (caixa), CORTESIAS, CARGOS_PERM, RELATORIO, MESAS.
- **Status**: [x] Completo

---

## 4. FLUXOS COMPLETOS

### 4.1 Descobrir evento -> comprar ingresso -> usar na entrada

1. **Descoberta**: Usuario abre o app -> HomeView com feed de eventos filtrado por cidade. Pode buscar via SearchView ou navegar no RadarView (mapa).
2. **Detalhe**: Clica no EventCard -> EventDetailView com info completa, social proof, reviews.
3. **Compra**: Clica "Comprar" -> abre URL standalone `/checkout/{eventoId}` (CheckoutPage).
4. **Selecao**: Seleciona lote ativo, variacoes (area/genero), quantidade. Aplica cupom se tiver.
5. **Login**: Modal bottom-sheet pede email+senha (autentica via Supabase Auth).
6. **Processamento (gratuito)**: RPC `processar_compra_checkout` gera tickets server-side. Tabelas: `tickets_caixa`, `vendas_log`, `transactions`.
7. **Processamento (pago)**: Edge Function `create-ticket-checkout` -> Stripe Checkout -> redirect -> `CheckoutSuccessPage` polling `pedidos_checkout`.
8. **Sucesso**: SuccessScreen com QR codes. BroadcastChannel notifica o app para atualizar carteira. Notificacao in-app + push + email.
9. **Carteira**: Ingressos aparecem em WalletView (via `useTicketsStore`). Usuario pode editar titular (nome + CPF).
10. **Entrada**: Na portaria, equipe usa PortariaScannerView (camera QR) -> `jwtService.verifyTicketToken` -> `validarEQueimarIngresso` -> FeedbackOverlay (verde/amarelo/vermelho). Offline: `offlineDB` + sync queue.
- **Tabelas/RPCs**: `eventos_admin`, `lotes`, `variacoes_ingresso`, `tickets_caixa`, `vendas_log`, `transactions`, `pedidos_checkout`, `processar_compra_checkout`, `validar_e_queimar_ingresso`.
- **Services**: `vantaService`, `eventosAdminService`, `cuponsService`, `comprovanteService`, `jwtService`, `offlineEventService`.
- **Status**: [x] Completo (gratuito). [?] Pago via Stripe em finalizacao (branch feat/stripe-ingressos).

### 4.2 Cadastro -> onboarding -> primeiro uso

1. **Tela inicial**: Usuario guest ve HomeView com eventos publicos. Header mostra "Visitante".
2. **Cadastro**: Clica em acao protegida -> AuthModal wizard: nome, email, senha, genero, nascimento, cidade, telefone, Instagram, interesses, selfie (analise facial client-side via `selfieAnalysis.ts`), aceitar termos de uso.
3. **Criacao**: `authService.signUp` -> Supabase Auth + insert em `profiles`.
4. **Onboarding**: OnboardingView com slides explicativos.
5. **Primeiro uso**: Feed personalizado por cidade, botao de busca, notificacoes. Push permission banner.
- **Tabelas**: `profiles`, `auth.users`.
- **Services**: `authService`, `supabaseVantaService`.
- **Status**: [x] Completo

### 4.3 Produtor -> criar evento -> vender -> check-in -> financeiro

1. **Acesso admin**: Produtor com cargo (vanta_masteradm, vanta_gerente, vanta_socio) acessa painel via Perfil -> icone admin.
2. **Criar evento**: AdminGateway -> CriarEventoView wizard 5 steps:
   - Step1: dados basicos (nome, descricao, data, local, categoria, foto, formato, recorrencia)
   - Step2: ingressos (lotes com variacoes area/genero/preco/limite), config MV (beneficios por tier)
   - Step3: listas de convidados (regras com horarios, capacidade, cortesia)
   - Step4: equipe (socio ou casa, com cargos e permissoes)
   - Step5: financeiro (taxa VANTA, gateway, quem paga servico)
3. **Aprovacao**: Se evento novo, entra em PENDENTES -> master aprova via EventosPendentesView.
4. **Publicacao**: Evento publicado aparece no feed.
5. **Venda**: Usuarios compram via CheckoutPage. Equipe vende na porta via CaixaView.
6. **Listas**: Promoters inserem nomes via ListasView. Portaria faz check-in por lista.
7. **Check-in**: Portaria antecipado (QR) via PortariaScannerView. Portaria lista via EventCheckInView + TabLista. Offline: cache local + sync.
8. **Financeiro**: FinanceiroView com resumo de vendas, saques (ModalSaque -> SolicitarSaque RPC), reembolsos (ModalReembolsoManual), historico de saques, fechamento.
9. **Relatorio**: RelatorioEventoView / RelatorioMasterView com export Excel.
- **Tabelas/RPCs**: `eventos_admin`, `lotes`, `variacoes_ingresso`, `tickets_caixa`, `vendas_log`, `transactions`, `listas_evento`, `regras_lista`, `convidados_lista`, `cotas_promoter`, `equipe_evento`, `solicitacoes_saque`, `reembolsos`.
- **Status**: [x] Completo

### 4.4 Usuario -> entrar no clube MAIS VANTA -> usar beneficio

1. **Solicitacao**: Perfil -> MAIS VANTA -> ClubeOptInView -> preenche Instagram -> aceita termos LGPD -> envia solicitacao.
2. **Curadoria**: Admin ve em curadoria/SubTabSolicitacoes -> analisa Instagram (seguidores via Edge Function `instagram-followers`), atribui tier e tags -> aprova ou rejeita.
3. **Aprovacao**: Membro recebe notificacao. Status muda para APROVADO.
4. **Beneficio em evento**: Ao acessar EventDetailView, MaisVantaBeneficioModal mostra o beneficio do tier (desconto ou lote exclusivo).
5. **Reserva**: MaisVantaReservaModal permite reservar vaga com beneficio.
6. **Pos-evento**: Membro deve postar divulgacao (mentions + hashtags). Edge Function `notif-evento-finalizou` cobra post em T+0. Se nao postar em T+24h, `notif-infraccao-registrada` registra infracao.
7. **Deals**: Membro ve deals de parceiros em DealsMembroSection -> resgata beneficio.
8. **Passaporte**: Solicita passaporte para outra cidade -> admin aprova -> acessa beneficios da nova cidade.
- **Tabelas**: `membros_clube`, `solicitacoes_clube`, `tiers_mais_vanta`, `reservas_mais_vanta`, `lotes_mais_vanta`, `infracoes_mais_vanta`, `convites_mais_vanta`, `passaportes_regionais`, `deals_mais_vanta`, `resgates_mais_vanta`, `parceiros_mais_vanta`, `cidades_mais_vanta`.
- **Status**: [x] Completo

---

## 5. EDGE FUNCTIONS

| Nome | O que faz | Disparo | Dep. Externa | Status |
|---|---|---|---|---|
| `create-checkout` | Cria sessao Stripe Checkout para assinatura MAIS VANTA (BASICO/PRO/ENTERPRISE) | POST manual (admin assina comunidade) | Stripe | [x] Pronta (depende de STRIPE_SECRET_KEY) |
| `create-ticket-checkout` | Cria sessao Stripe Checkout para compra de ingressos. Valida precos server-side, cria pedido pendente | POST (checkout page para evento pago) | Stripe | [x] Pronta (depende de STRIPE_SECRET_KEY) |
| `stripe-webhook` | Recebe webhooks Stripe. Processa: checkout.session.completed (upsert assinatura MV), invoice.paid, customer.subscription.deleted | Webhook Stripe | Stripe | [?] Incerto -- processa apenas assinaturas MV, nao processa `pedidos_checkout` (ticket purchases). Precisa de handler adicional. |
| `send-push` | Envia push notification via Firebase Cloud Messaging (HTTP v1 API) | POST (chamado por notifyService ou admin) | Firebase/FCM | [ ] Depende de FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY |
| `send-notification-email` | Envia email de notificacao generica via Resend API | POST (chamado por notifyService) | Resend | [ ] Depende de RESEND_API_KEY |
| `send-reembolso-email` | Envia email de notificacao de reembolso (aprovado/rejeitado) | POST (chamado ao processar reembolso) | Resend | [ ] Depende de RESEND_API_KEY |
| `send-invite` | Envia email de convite VANTA via Resend | POST (admin envia convite) | Resend | [ ] Depende de RESEND_API_KEY |
| `instagram-followers` | Retorna contagem de seguidores de perfil publico Instagram (scraping server-side) | POST (curadoria ao analisar membro) | Instagram (scraping) | [x] Pronta |
| `verify-instagram-bio` | Verifica se codigo VANTA esta na bio do Instagram | POST (verificacao de identidade) | Instagram (scraping) | [x] Pronta |
| `verify-instagram-post` | Verifica se post/story contem mencoes obrigatorias | POST (pos-evento, verificar divulgacao) | Meta Graph API (opcional) | [ ] Depende de META_ACCESS_TOKEN |
| `update-instagram-followers` | Atualiza seguidores de todos os membros do clube (batch) | Cron ou POST manual | Meta Graph API (opcional) | [ ] Depende de META_ACCESS_TOKEN |
| `notif-checkin-confirmacao` | Notifica membro apos check-in QR | POST (chamado apos queimar ingresso) | FCM | [ ] Depende de config Firebase |
| `notif-pedir-review` | Cron diario: envia pedido de review para quem fez check-in (eventos das ultimas 24h) | Cron (17:00 UTC) | FCM | [ ] Depende de config Firebase |
| `notif-evento-iniciou` | Cron a cada 5 min: detecta eventos que comecaram e envia notificacao | Cron (5 min) | FCM | [ ] Depende de config Firebase |
| `notif-evento-finalizou` | Cron a cada 10 min: detecta eventos finalizados, cobra post de membros MV | Cron (10 min) | FCM | [ ] Depende de config Firebase |
| `notif-infraccao-registrada` | Cron diario 00:00 BRT: registra infracoes para posts vencidos (T+24h) | Cron (03:00 UTC) | FCM | [ ] Depende de config Firebase |

---

## 6. SERVICOS

### 6.1 Services (`services/`)

| Service | O que faz |
|---|---|
| `achievementsService` | Calcula nivel de frequencia (ESTREANTE/FREQUENTADOR/HABITUE/LENDA) e badges por comunidade |
| `analyticsService` | Registra eventos de analytics: app open, event view, event open. Verifica elegibilidade PMF |
| `authService` | Login, cadastro, logout, busca de perfil, busca de pessoas, enriquecimento Instagram |
| `cache` | Cache in-memory stale-while-revalidate (eventos 60s, tickets 30s, inbox 30s, friendships 60s) |
| `cepService` | Busca endereco por CEP (ViaCEP) + geocodificacao |
| `circuitBreaker` | Circuit breaker para proteger chamadas a servicos externos |
| `comemoracaoService` | CRUD de solicitacoes de comemoracao (aniversarios) -- criar, listar, aprovar, recusar, config faixas |
| `communityFollowService` | Seguir/deixar de seguir comunidades |
| `eventoPrivadoService` | CRUD de solicitacoes de eventos privados |
| `favoritosService` | Salvar/remover eventos favoritos |
| `firebaseConfig` | Inicializacao lazy do Firebase (app + messaging) |
| `friendshipsService` | Amizades: enviar/aceitar/recusar/remover, listar amigos mutuos, realtime |
| `logger` | Wrapper Sentry (error -> captureException, warn -> breadcrumb) |
| `messagesService` | Chat 1:1: enviar, listar inbox, ler mensagens, reagir, deletar, realtime |
| `moodService` | Definir/consultar mood (emoji + texto com expiracao) |
| `nativePushService` | Push notifications nativas (Capacitor) -- registrar token, setup listeners |
| `notifyService` | Servico unificado de notificacao: in-app + push + email (3 canais) |
| `offlineDB` | IndexedDB para cache offline (tickets, convidados, lotes, sync queue) |
| `offlineEventService` | Operacoes offline: cache de dados do evento, sync de acoes pendentes |
| `photoService` | Upload/delete de avatar e album (Supabase Storage) |
| `pushService` | Web push via Firebase Messaging (token, permission) |
| `rateLimiter` | Rate limiter para proteger endpoints |
| `realtimeManager` | Gerencia canais Supabase Realtime (max 5 channels) |
| `reminderService` | Lembretes de eventos (notificacoes locais) |
| `supabaseClient` | Cliente Supabase tipado (`createClient<Database>`) |
| `supabaseVantaService` | Servico core: getEventosPaginated, searchEventos, getMyTickets, upload biometria |
| `transferenciaService` | Transferencia de ingressos entre usuarios |
| `vantaService` | Facade sobre supabaseVantaService |
| `waitlistService` | Waitlist: entrar na fila quando variacao esgotada |

### 6.2 Admin Services (`features/admin/services/`)

| Service | O que faz |
|---|---|
| `adminService` | CRUD de destaques (Vanta Indica), categorias, dados de admin |
| `assinaturaService` | Gestao de assinaturas MAIS VANTA (planos, status, Stripe) |
| `auditService` | Log de auditoria: registrar e consultar acoes com actor, entity, old/new values |
| `campanhasService` | Campanhas de notificacao em massa (in-app + push + email) por segmento |
| `clubeService` | Servico central MAIS VANTA: membros, solicitacoes, tiers, aprovacao |
| `clube/clubeCache` | Cache de dados MV: tiers, membros, lotes, reservas, passaportes |
| `clube/clubeCidadesService` | CRUD cidades MAIS VANTA |
| `clube/clubeConfigService` | Config do clube |
| `clube/clubeConvitesService` | Convites MV: criar, listar, aceitar, cancelar |
| `clube/clubeDealsService` | Deals: criar, editar, listar ofertas de parceiros |
| `clube/clubeInfracoesService` | Infracoes: verificar bloqueio, banimento, divida social, castigo no-show |
| `clube/clubeInstagramService` | Verificacao Instagram de membros |
| `clube/clubeLotesService` | Lotes exclusivos MV: beneficios por evento/tier |
| `clube/clubeParceirosService` | CRUD parceiros MAIS VANTA |
| `clube/clubeResgatesService` | Resgates de deals por membros |
| `comprovanteService` | Gestao de comprovantes (meia-entrada): upload, aprovar, rejeitar |
| `comunidadesService` | CRUD de comunidades: criar, editar, listar, membros |
| `cortesiasService` | Cortesias: enviar, listar pendentes, aceitar, recusar |
| `cuponsService` | CRUD cupons de desconto: criar, validar, usar |
| `dashboardAnalyticsService` | Analytics do dashboard admin (KPIs, deltas) |
| `eventosAdminService` | Servico core de eventos: CRUD, publicar, aprovar, duplicar, recorrencia, equipe, pedidos |
| `eventosAdminFinanceiro` | Financeiro por evento: saldo, taxas, gateway, fechamento |
| `eventosAdminTickets` | Gestao de tickets: listar, cancelar, reenviar, estatisticas |
| `eventosAdminTypes` | Tipos compartilhados (VendaLog, TicketCaixa, etc.) |
| `IVantaService` | Interface do servico core (RegistrarVenda, ValidarIngresso, SolicitarSaque, Checkout) |
| `jwtService` | Assinar e verificar tokens JWT de ingressos (anti-fraude) |
| `listasService` | Gestao de listas: criar regras, inserir nomes, check-in lista, abobora (migracao regra) |
| `maisVantaConfigService` | Configuracao global do programa MAIS VANTA |
| `mesasService` | CRUD de mesas e reservas por evento |
| `notificationsService` | CRUD notificacoes: inserir, marcar lida, listar |
| `parceriaService` | Solicitacoes de parceria (espaco fixo ou produtora) |
| `pendenciasService` | Contagem de pendencias por tipo para o hub |
| `rbacService` | RBAC: cargos, atribuicoes, permissoes, verificacao de acesso |
| `reembolsoService` | Reembolsos: solicitar, aprovar, rejeitar, listar |
| `relatorioService` | Gerar relatorio completo de evento (vendas, check-in, reviews) |
| `reviewsService` | Reviews: criar, listar, media por evento/comunidade |

---

## 7. STORES ZUSTAND

### 7.1 useAuthStore (`stores/authStore.ts`)
- **Estado**: `currentAccount` (Membro), `profile` (Membro), `authLoading`, `selectedCity`, `notifications` (Notificacao[]), `unreadNotifications`, `accessNodes`.
- **Acoes**: `loginWithMembro`, `logout`, `updateProfile`, `registerUser`, `setSelectedCity`, `setNotifications`, `addNotification`, `markAllNotificationsAsRead`, `handleNotificationAction`, `init`.

### 7.2 useTicketsStore (`stores/ticketsStore.ts`)
- **Estado**: `myTickets` (Ingresso[]), `myPresencas` (string[]), `cortesiasPendentes`, `transferenciasPendentes`.
- **Acoes**: `setMyTickets`, `setMyPresencas`, `devolverCortesia`, `transferirIngresso`, `updateTicketTitular`, `aceitarCortesiaPendente`, `recusarCortesiaPendente`, `aceitarTransferencia`, `recusarTransferencia`, `init`.

### 7.3 useChatStore (`stores/chatStore.ts`)
- **Estado**: `chats` (Chat[]), `onlineUsers` (Set<string>), `activeChatParticipantId`, `totalUnreadMessages`.
- **Acoes**: `ensureChatExists`, `sendMessage`, `markChatAsRead`, `deleteMessage`, `toggleReaction`, `init`.

### 7.4 useSocialStore (`stores/socialStore.ts`)
- **Estado**: `friendships` (Record<string, FriendshipStatus>), `mutualFriends` (Membro[]).
- **Acoes**: `requestFriendship`, `cancelFriendshipRequest`, `handleAcceptFriend`, `handleDeclineFriend`, `removeFriend`, `init`.

### 7.5 useExtrasStore (`stores/extrasStore.ts`)
- **Estado**: `allEvents` (Evento[]), `savedEvents` (string[]), `hasMoreEvents`, `eventsLoading`.
- **Acoes**: `refreshEvents`, `loadMoreEvents`, `searchEventsServerSide`, `toggleFavorito`, `confirmarPresenca`, `addExternalTicket`, `initEvents`, `initClubeData`, `initFavoritos`.

---

## 8. O QUE PARECE INCOMPLETO

### 8.1 Stripe Webhook para Ingressos Pagos
- **Problema**: A Edge Function `stripe-webhook` processa apenas eventos de assinatura MAIS VANTA (`assinaturas_mais_vanta`). Nao tem handler para `checkout.session.completed` de ingressos pagos (tabela `pedidos_checkout`). A Edge Function `create-ticket-checkout` cria pedidos e redireciona para Stripe, mas o webhook nao confirma o pagamento.
- **Impacto**: Compra de ingressos pagos via Stripe fica incompleta -- `CheckoutSuccessPage` faz polling mas o status nunca muda para "pago" sem o webhook.
- **Localizacao**: `supabase/functions/stripe-webhook/index.ts` (falta case para pedidos de ingresso), `supabase/functions/create-ticket-checkout/index.ts` (cria pedido), `modules/checkout/CheckoutSuccessPage.tsx` (polling).
- **Branch**: `feat/stripe-ingressos` (work in progress).

### 8.2 Edge Functions Dependentes de Config Externa
- **send-push**, **notif-checkin-confirmacao**, **notif-pedir-review**, **notif-evento-iniciou**, **notif-evento-finalizou**, **notif-infraccao-registrada**: Todas dependem de secrets Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Se nao configurados, push nao funciona.
- **send-notification-email**, **send-reembolso-email**, **send-invite**: Dependem de RESEND_API_KEY.
- **verify-instagram-post**, **update-instagram-followers**: Dependem de META_ACCESS_TOKEN (Graph API). Sem token, retornam placeholder.

### 8.3 CaixaView e MasterFinanceiroView (Re-exports)
- `features/admin/views/CaixaView.tsx` -- 2 linhas, re-exporta de `caixa/index.tsx`.
- `features/admin/views/MasterFinanceiroView.tsx` -- 2 linhas, re-exporta de `masterFinanceiro/index.tsx`.
- `features/admin/views/ComunidadesView.tsx` -- 3 linhas, re-export.
- `features/admin/views/CriarComunidadeView.tsx` -- 3 linhas, re-export.
- **Observacao**: Estes sao barrel files intencionais, nao stubs vazios.

### 8.4 SubTabNotificacoes (MV Curadoria)
- **Arquivo**: `features/admin/views/curadoria/tabClube/SubTabNotificacoes.tsx` -- 42 linhas.
- **Status**: [?] Incerto -- conteudo minimo, pode ser placeholder ou funcionalidade basica.

### 8.5 Observacoes Gerais
- **Selfie facial no cadastro**: Analise client-side (`selfieAnalysis.ts`) -- nao ha validacao server-side.
- **Biometria upload**: `supabaseVantaService.uploadBiometria` envia para Storage, mas nao ha validacao automatica (apenas armazenamento).
- **Instagram scraping**: Edge functions de Instagram usam scraping do HTML publico -- fragil e pode quebrar com mudancas do Instagram.
- **Offline**: Sistema offline (IndexedDB + sync queue) implementado para check-in e caixa, depende de reconexao para sincronizar.
