# MAPA VANTA

> Gerado em 2026-03-09. Baseado na leitura direta do código.

---

## 1. TELAS DO USUÁRIO FINAL

### 1.1 HomeView (`modules/home/HomeView.tsx`)
- **O que vê**: Feed de eventos com seções — Highlights (destaques), Live Now (acontecendo agora), This Week, For You (recomendados), Near You (geo), Friends Going, New on Platform, Saved Events. Quick Actions (atalhos para perfil, busca, ingressos, favoritos). Seletor de cidade no header. Ícone de notificações.
- **Ações**:
  - Clicar num evento → EventDetailView
  - Clicar numa comunidade → ComunidadePublicView
  - Comemorar aniversário → ComemoracaoFormView
  - Abrir notificações → NotificationPanel
  - Trocar cidade → CitySelector
  - Ir para busca → SearchView
  - Ir para perfil → ProfileView
  - Scroll infinito (loadMoreEvents)
- **Status**: Completo

### 1.2 EventDetailView (`modules/event-detail/EventDetailView.tsx`)
- **O que vê**: Header com imagem do evento, nome, data/hora, local, descrição. Social proof (quem vai, amigos em comum). Footer com botão de compra/confirmar presença. Seção de reviews. Botão favoritar. Botão compartilhar. Botão convidar amigos. Reserva MAIS VANTA (se membro do clube).
- **Ações**:
  - Comprar ingresso → CheckoutPage
  - Confirmar presença (evento gratuito) → PresencaConfirmationModal
  - Favoritar/desfavoritar evento
  - Compartilhar evento (Web Share API)
  - Convidar amigos → InviteFriendsModal
  - Ver perfil de quem vai → PublicProfilePreviewView
  - Acessar comunidade organizadora → ComunidadePublicView
  - Abrir reserva MAIS VANTA → MaisVantaReservaModal
  - Enviar mensagem para amigo → ChatRoomView
  - Dar review → ReviewModal
- **Status**: Completo

### 1.3 CheckoutPage (`modules/checkout/CheckoutPage.tsx`)
- **O que vê**: Seletor de lote, variações de ingresso (área, gênero, preço), quantidade. Campo de cupom de desconto. Campo de acompanhantes. Resumo do pedido com preço total. Comprovante de meia-entrada (se aplicável). Fluxo dual: gratuito direto / pago via Stripe redirect.
- **Ações**:
  - Selecionar lote/variação/quantidade
  - Aplicar cupom de desconto
  - Preencher acompanhantes
  - Confirmar compra gratuita → SuccessScreen
  - Pagar via Stripe → redirect externo → CheckoutSuccessPage
  - Entrar na lista de espera → WaitlistModal
- **Status**: Completo (Stripe depende de config CNPJ)

### 1.4 CheckoutSuccessPage (`modules/checkout/CheckoutSuccessPage.tsx`)
- **O que vê**: Tela de sucesso após pagamento Stripe com polling de 2s por até 30s para confirmar processamento do webhook.
- **Ações**:
  - Voltar ao app
- **Status**: Completo (depende de Stripe ativo)

### 1.5 SuccessScreen (`modules/checkout/SuccessScreen.tsx`)
- **O que vê**: Confirmação de ingresso(s) com QR codes decorativos, nome do evento, botão compartilhar, botão voltar.
- **Ações**:
  - Compartilhar evento
  - Voltar ao app
- **Status**: Completo

### 1.6 WaitlistModal (`modules/checkout/WaitlistModal.tsx`)
- **O que vê**: Modal para entrar na lista de espera com campo de email.
- **Ações**:
  - Inserir email e entrar na fila
  - Fechar modal
- **Status**: Completo

### 1.7 EventLandingPage (`modules/landing/EventLandingPage.tsx`)
- **O que vê**: Landing page pública de evento (acessível sem login via URL `/event/:id`). Imagem, nome, data, local, descrição, botão CTA.
- **Ações**:
  - Abrir app / ir para checkout
- **Status**: Completo

### 1.8 SearchView (`modules/search/SearchView.tsx`)
- **O que vê**: Busca textual com tabs Eventos/Pessoas. Filtros: cidade, estilo/vibe, data/período, preço máximo, benefícios MAIS VANTA. Resultados de eventos (cards) e pessoas (avatares).
- **Ações**:
  - Buscar texto
  - Filtrar por cidade → CityFilterModal
  - Filtrar por estilo → VibeFilterModal
  - Filtrar por data → TimeFilterModal
  - Filtrar por preço → PriceFilterModal
  - Toggle benefícios MAIS VANTA
  - Clicar num evento → EventDetailView
  - Clicar numa pessoa → PublicProfilePreviewView
  - Clicar numa comunidade → ComunidadePublicView
- **Status**: Completo

### 1.9 RadarView (`modules/radar/RadarView.tsx`)
- **O que vê**: Mapa Leaflet com pins de eventos geolocalizados. Calendário premium para filtrar por data. Filtro por raio. Localização do usuário.
- **Ações**:
  - Navegar pelo mapa (zoom, pan)
  - Selecionar evento no mapa → EventDetailView
  - Filtrar por data → PremiumCalendar
  - Filtrar por raio
  - Centralizar na localização do usuário
- **Status**: Completo

### 1.10 WalletView (`modules/wallet/WalletView.tsx`)
- **O que vê**: Carteira de ingressos com tabs Próximos/Passados. Carrossel de ingressos por evento. QR code de cada ingresso. Lista de presenças confirmadas. Lock screen de segurança. Badge MAIS VANTA se membro.
- **Ações**:
  - Ver QR do ingresso → TicketQRModal
  - Transferir ingresso para outro usuário
  - Devolver cortesia
  - Atualizar nome do titular
  - Aceitar/recusar cortesia pendente
  - Aceitar/recusar transferência pendente
  - Lock/unlock da carteira (WalletLockScreen com PIN/Face ID)
- **Status**: Completo

### 1.11 MessagesView (`modules/messages/MessagesView.tsx`)
- **O que vê**: Lista de conversas com preview da última mensagem, contador de não lidas, status online, mood emoji. Busca por nome. Botão "Nova conversa".
- **Ações**:
  - Abrir conversa → ChatRoomView
  - Nova conversa → NewChatModal (lista de amigos)
  - Buscar conversas
- **Status**: Completo

### 1.12 ChatRoomView (`modules/messages/components/ChatRoomView.tsx`)
- **O que vê**: Chat real-time com bolhas de mensagem, timestamp, reações emoji, indicador de online, perfil do participante.
- **Ações**:
  - Enviar mensagem
  - Reagir com emoji
  - Deletar própria mensagem
  - Ver perfil do participante → PublicProfilePreviewView
  - Solicitar/cancelar amizade
  - Remover amigo
  - Voltar
- **Status**: Completo

### 1.13 ProfileView (`modules/profile/ProfileView.tsx`)
- **O que vê**: Foto, nome, cidade, bio, mood, interesses. Links para sub-views. Badge MAIS VANTA se membro. Botão admin (se tem acesso). Comprovante meia-entrada.
- **Ações**:
  - Editar perfil → EditProfileView
  - Ver carteira → WalletView
  - Ver histórico → HistoricoView
  - Ver preferências → PreferencesView
  - Preview público → PublicProfilePreviewView
  - MAIS VANTA → ClubeOptInView
  - Minhas solicitações → MinhasSolicitacoesView
  - Solicitar parceria → SolicitarParceriaView
  - Comprovante meia → ComprovanteMeiaSection
  - Mood picker → MoodPicker
  - Acessar painel admin
  - Logout
- **Status**: Completo

### 1.14 EditProfileView (`modules/profile/EditProfileView.tsx`)
- **O que vê**: Formulário completo — foto, álbum (4 fotos), nome, sobrenome, bio, data nascimento, cidade, UF, bairro, telefone, Instagram, interesses (multi-select).
- **Ações**:
  - Editar qualquer campo
  - Upload/crop de foto → ImageCropperModal
  - Selecionar interesses → InterestSelector
  - Salvar alterações
- **Status**: Completo

### 1.15 HistoricoView (`modules/profile/HistoricoView.tsx`)
- **O que vê**: Histórico de eventos frequentados com achievements/badges (frequência por comunidade). Tabs Presenças/Badges.
- **Ações**:
  - Ver evento passado → EventDetailView
  - Ver badges conquistados
- **Status**: Completo

### 1.16 PreferencesView (`modules/profile/PreferencesView.tsx`)
- **O que vê**: Configurações de privacidade e notificações (placeholders).
- **Ações**: Toggles de preferência
- **Status**: Incerto — parece ser placeholder com UI básica (87 linhas)

### 1.17 PublicProfilePreviewView (`modules/profile/PublicProfilePreviewView.tsx`)
- **O que vê**: Perfil público de outro usuário — foto, álbum, bio, cidade, interesses, achievements, mood, amigos em comum. Controles de amizade.
- **Ações**:
  - Solicitar amizade / cancelar / aceitar / recusar / remover
  - Abrir chat
  - Toggle PUBLIC/FRIENDS preview (quando é o próprio perfil)
- **Status**: Completo

### 1.18 ClubeOptInView (`modules/profile/ClubeOptInView.tsx`)
- **O que vê**: Tela de adesão ao MAIS VANTA — planos disponíveis, benefícios, deals ativos, status de membro, passaporte digital. Se já é membro, mostra dashboard com deals e resgates.
- **Ações**:
  - Aceitar convite do clube
  - Ver deals disponíveis → DealsMembroSection
  - Usar deal / resgatar benefício
  - Ver detalhes do plano
- **Status**: Completo

### 1.19 DealsMembroSection (`modules/profile/DealsMembroSection.tsx`)
- **O que vê**: Lista de deals/benefícios disponíveis para o membro do clube, filtrados por cidade. Status de cada resgate.
- **Ações**:
  - Resgatar deal
  - Ver detalhes do deal
  - Filtrar por cidade
- **Status**: Completo

### 1.20 ComprovanteMeiaSection (`modules/profile/ComprovanteMeiaSection.tsx`)
- **O que vê**: Upload e gestão de comprovante de meia-entrada (estudante). Status de aprovação.
- **Ações**:
  - Upload de documento
  - Acompanhar status (pendente/aprovado/rejeitado)
- **Status**: Completo

### 1.21 MinhasSolicitacoesView (`modules/profile/MinhasSolicitacoesView.tsx`)
- **O que vê**: Lista das solicitações do usuário — eventos privados e comemorações. Status de cada (ENVIADA, EM_ANALISE, APROVADA, RECUSADA).
- **Ações**:
  - Ver detalhes de cada solicitação
  - Filtrar por tipo (privados/comemorações)
- **Status**: Completo

### 1.22 ComunidadePublicView (`modules/community/ComunidadePublicView.tsx`)
- **O que vê**: Página pública da comunidade — foto, nome, descrição, horários, reviews, eventos próximos, membros. Botão seguir. Formulários de evento privado e comemoração.
- **Ações**:
  - Seguir/desseguir comunidade
  - Ver eventos → EventDetailView
  - Ver membros → PublicProfilePreviewView
  - Solicitar evento privado → EventoPrivadoFormView
  - Solicitar comemoração → ComemoracaoFormView
  - Ver reviews
- **Status**: Completo

### 1.23 ComemoracaoFormView (`modules/community/ComemoracaoFormView.tsx`)
- **O que vê**: Formulário para solicitar comemoração (aniversário/despedida/outro) — nome, data, celular, Instagram, evento vinculado.
- **Ações**:
  - Preencher e enviar solicitação
- **Status**: Completo

### 1.24 EventoPrivadoFormView (`modules/community/EventoPrivadoFormView.tsx`)
- **O que vê**: Formulário para solicitar evento privado — dados pessoais, empresa, data, capacidade, horário, formatos, atrações, descrição.
- **Ações**:
  - Preencher e enviar solicitação
- **Status**: Completo

### 1.25 MinhasSolicitacoesPrivadoView (`modules/community/MinhasSolicitacoesPrivadoView.tsx`)
- **O que vê**: Lista das solicitações de eventos privados feitas pelo usuário.
- **Ações**:
  - Ver detalhes/status de cada solicitação
- **Status**: Completo

### 1.26 AceitarConviteMVPage (`modules/convite/AceitarConviteMVPage.tsx`)
- **O que vê**: Página standalone para aceitar convite do MAIS VANTA via link. Verifica token, mostra detalhes do convite.
- **Ações**:
  - Aceitar convite (se logado)
  - Ir para login (se não logado)
- **Status**: Completo

### 1.27 ParceiroDashboardPage (`modules/parceiro/ParceiroDashboardPage.tsx`)
- **O que vê**: Dashboard do parceiro MAIS VANTA — métricas (total resgates, resgates mês, membros únicos), deals ativos, histórico de resgates. Tabs Visão Geral / Deals / Resgates.
- **Ações**:
  - Ver métricas
  - Ver deals ativos
  - Ver resgates recebidos
  - Confirmar check-in de resgate
- **Status**: Completo

### 1.28 MyTicketsView (`features/tickets/views/MyTicketsView.tsx`)
- **O que vê**: Lista de ingressos do usuário com detalhes — evento, variação, código QR, status. Visualização diferente da WalletView (mais detalhada/lista).
- **Ações**:
  - Ver detalhes do ingresso
  - Voltar
- **Status**: Completo

### 1.29 LoginView (`components/LoginView.tsx`)
- **O que vê**: Tela de login — email e senha, esqueci senha, link para cadastro.
- **Ações**:
  - Login com email/senha
  - Esqueci senha → envia email de reset
  - Ir para cadastro → AuthModal
- **Status**: Completo

### 1.30 AuthModal (`components/AuthModal.tsx`)
- **O que vê**: Modal de cadastro em steps — dados pessoais, selfie com câmera, verificação, termos legais.
- **Ações**:
  - Preencher dados (nome, email, senha, data nascimento, cidade, telefone, Instagram)
  - Tirar selfie → SelfieCameraComponent (análise facial local)
  - Aceitar termos → LegalView
  - Concluir cadastro
- **Status**: Completo

### 1.31 OnboardingView (`components/OnboardingView.tsx`)
- **O que vê**: Tutorial de onboarding pós-cadastro — slides explicativos das funcionalidades do app.
- **Ações**:
  - Navegar pelos slides
  - Pular / concluir
- **Status**: Completo

### 1.32 LegalView (`components/LegalView.tsx`)
- **O que vê**: Termos de Uso e Política de Privacidade completos.
- **Ações**:
  - Ler termos
  - Aceitar termos
- **Status**: Completo

### 1.33 ResetPasswordView (`components/ResetPasswordView.tsx`)
- **O que vê**: Formulário para redefinir senha (quando usuário clica no link do email).
- **Ações**:
  - Inserir nova senha
  - Confirmar
- **Status**: Completo

### 1.34 NotFoundView (`components/NotFoundView.tsx`)
- **O que vê**: Página 404 — "Página não encontrada".
- **Ações**:
  - Link para voltar ao início
- **Status**: Completo

### 1.35 NotificationPanel (`components/Home/NotificationPanel.tsx`)
- **O que vê**: Painel lateral de notificações — lista de todas as notificações com ícones, timestamps, ações pendentes (cortesias, amizades).
- **Ações**:
  - Marcar todas como lidas
  - Clicar em notificação → ação contextual (ir para evento, aceitar amizade, etc.)
  - Aceitar/recusar cortesia
  - Aceitar/recusar amizade
- **Status**: Completo

---

## 2. CLUBE MAIS VANTA

### 2.1 O que o usuário vê na UI

**Entrada no clube** — ClubeOptInView (`modules/profile/ClubeOptInView.tsx`):
- Planos disponíveis (BASICO, PRO, ENTERPRISE) com preços e benefícios
- Aceitar convite (via link ou código)
- Dashboard de membro se já associado

**Benefícios** — DealsMembroSection (`modules/profile/DealsMembroSection.tsx`):
- Deals/ofertas de parceiros (descontos, cortesias, experiências)
- Filtro por cidade
- Resgate com confirmação

**Reserva para eventos** — MaisVantaReservaModal (`modules/event-detail/components/MaisVantaReservaModal.tsx`):
- Modal para reservar entrada em evento com benefício de membro

**Na busca** — SearchView tem toggle "benefícios MAIS VANTA" para filtrar eventos com vantagens

**Convite** — AceitarConviteMVPage (`modules/convite/AceitarConviteMVPage.tsx`):
- Página standalone para aceitar convite via link

### 2.2 Como entra no clube
1. Recebe convite (link ou direto no app) de admin/curadoria
2. Acessa ClubeOptInView no perfil
3. Aceita convite → vira membro
4. Pagamento via Stripe Checkout (Edge Function `create-checkout`) — **depende de CNPJ/Stripe configurado**

### 2.3 Benefícios que aparecem
- Deals de parceiros (descontos, cortesias)
- Reserva prioritária em eventos
- Badge de membro na carteira e perfil
- Filtro exclusivo na busca
- Passaporte digital

### 2.4 Como usa cada benefício
- **Deals**: DealsMembroSection → seleciona deal → resgata → parceiro confirma check-in (ParceiroDashboardPage)
- **Reserva**: EventDetailView → MaisVantaReservaModal → reserva com obrigação social (post/story)
- **Badge**: aparece automaticamente na WalletView e ProfileView

### 2.5 Admin do clube (Painel)
- **MaisVantaHubView** — hub central com 7 sub-módulos
- **PlanosMaisVantaView** — CRUD de planos
- **AssinaturasMaisVantaView** — gestão de assinaturas
- **PassaportesMaisVantaView** — gestão de passaportes digitais
- **ConfigMaisVantaView** — configurações gerais
- **CidadesMaisVantaView** — cidades onde o clube opera
- **ParceirosMaisVantaView** — CRUD de parceiros
- **DealsMaisVantaView** — CRUD de deals/ofertas
- **ConvitesMaisVantaView** — envio e gestão de convites
- **AnalyticsMaisVantaView** — métricas do clube
- **MonitoramentoMaisVantaView** — membros globais, eventos, infrações, dívida social
- **MembrosGlobaisMaisVantaView** — todos os membros cross-comunidade
- **EventosGlobaisMaisVantaView** — eventos com reservas ativas
- **InfracoesGlobaisMaisVantaView** — infrações registradas
- **DividaSocialMaisVantaView** — saldo de obrigações sociais

### 2.6 Status geral
- **UI do membro**: Completo
- **UI do admin**: Completo
- **Pagamento Stripe**: Depende de config externa (CNPJ + secrets)
- **Verificação Instagram (post/story)**: Depende de META_ACCESS_TOKEN (Graph API)
- **ParceiroDashboardPage**: Completo

---

## 3. PAINEL ADMIN

### 3.1 GerenteDashboardView
- **Acesso**: master, gerente
- **Mostra**: Comunidades do usuário, próximos eventos, resumo financeiro, reviews, RBAC, criar evento
- **Permite**: Criar evento, gerenciar comunidades, ver financeiro, gerenciar equipe
- **Status**: Completo

### 3.2 SocioDashboardView
- **Acesso**: sócio de evento
- **Mostra**: Eventos onde é sócio, métricas de vendas, listas
- **Permite**: Ver vendas, gerenciar listas próprias
- **Status**: Completo

### 3.3 PromoterDashboardView
- **Acesso**: promoter
- **Mostra**: Eventos onde é promoter, cotas de nomes
- **Permite**: Adicionar nomes nas listas, ver cotas
- **Status**: Completo

### 3.4 PromoterCotasView
- **Acesso**: promoter
- **Mostra**: Cotas de nomes por lista, exportação
- **Permite**: Ver cotas, exportar dados
- **Status**: Completo

### 3.5 ComunidadesView (admin)
- **Acesso**: master, gerente
- **Mostra**: Lista de comunidades com detalhes
- **Permite**: Criar comunidade → CriarComunidadeView, ver detalhe → ComunidadeDetalheView
- **Status**: Completo

### 3.6 CriarComunidadeView
- **Acesso**: master
- **Mostra**: Wizard 3 steps — Identidade, Localização, Fotos
- **Permite**: Criar nova comunidade com nome, descrição, tipo, horários, CEP, fotos
- **Status**: Completo

### 3.7 ComunidadeDetalheView
- **Acesso**: master, gerente
- **Mostra**: Tabs — Próximos Eventos, Encerrados, Equipe, Caixa, Logs, Eventos Privados, Comemorações
- **Permite**: Editar comunidade (EditarModal), gerenciar equipe (EquipeTab), ver financeiro (CaixaTab), central de eventos
- **Status**: Completo

### 3.8 CriarEventoView
- **Acesso**: master, gerente
- **Mostra**: Wizard 5-6 steps — Tipo, Dados, Ingressos, Listas, Equipe, Financeiro
- **Permite**: Criar evento completo com lotes, variações, listas, equipe, split financeiro
- **Status**: Completo

### 3.9 EditarEventoView
- **Acesso**: master, gerente, quem criou
- **Mostra**: Mesmo wizard de criação, preenchido com dados existentes
- **Permite**: Editar todos os campos do evento
- **Status**: Completo

### 3.10 EventoDashboard (via GerenteDashboardView → MeusEventosView)
- **Acesso**: master, gerente, sócio (limitado)
- **Mostra**: Tabs — Equipe/Promoter, Cargos/Permissões, Cortesias, Lotação, Mesas, Relatório, Logs. SerieChips para eventos recorrentes. DuplicarModal.
- **Permite**: Gerenciar tudo do evento
- **Status**: Completo

### 3.11 MeusEventosView
- **Acesso**: qualquer cargo com evento
- **Mostra**: Lista dos eventos do usuário
- **Permite**: Abrir dashboard do evento
- **Status**: Completo

### 3.12 EventosPendentesView
- **Acesso**: master
- **Mostra**: Eventos pendentes de aprovação (propostas de afiliado/sócio)
- **Permite**: Aprovar, rejeitar, negociar proposta
- **Status**: Completo

### 3.13 CuradoriaView
- **Acesso**: master, gerente
- **Mostra**: Tabs — Novos Membros, Membros. Detalhe do membro com perfil, logs, convites.
- **Permite**: Aprovar/rejeitar membros, enviar convites, convidar para MAIS VANTA
- **Status**: Completo

### 3.14 TabClube (curadoria)
- **Acesso**: master
- **Mostra**: Sub-tabs — Membros, Solicitações, Eventos, Passaportes, Posts, Notificações, Config
- **Permite**: Gestão completa do clube por comunidade
- **Status**: Completo

### 3.15 CheckInView / EventCheckInView
- **Acesso**: portaria (cargo portaria_qr)
- **Mostra**: Lista de eventos para check-in, scanner QR, feedback visual
- **Permite**: Escanear QR de ingresso, validar e queimar ingresso
- **Status**: Completo

### 3.16 PortariaScannerView
- **Acesso**: portaria
- **Mostra**: Scanner QR com câmera
- **Permite**: Scan de QR code de ingresso, validação JWT
- **Status**: Completo

### 3.17 PortariaQRDashView
- **Acesso**: portaria_qr
- **Mostra**: Dashboard da portaria QR — eventos do dia, contadores
- **Permite**: Abrir scanner, ver estatísticas
- **Status**: Completo

### 3.18 PortariaListaDashView
- **Acesso**: portaria_lista
- **Mostra**: Dashboard da portaria por lista — eventos, listas de nomes
- **Permite**: Check-in por nome na lista
- **Status**: Completo

### 3.19 CaixaView / CaixaDashboardView / EventoCaixaView
- **Acesso**: caixa
- **Mostra**: Dashboard de vendas no caixa — eventos do dia, venda de ingressos presencial, modo offline
- **Permite**: Vender ingresso na hora (caixa físico), funciona offline com sync
- **Status**: Completo

### 3.20 ListasView (features/admin/views/listas/)
- **Acesso**: master, gerente, promoter (limitado)
- **Mostra**: Tabs — Nomes, Equipe, Lotação. Inserção em lote (ModalInserirLote).
- **Permite**: Adicionar/remover nomes, gerenciar promoters, ver ocupação
- **Status**: Completo

### 3.21 RelatoriosView (features/admin/views/relatorios/)
- **Acesso**: master, gerente
- **Mostra**: Tabs — Geral, Ingressos, Listas. Métricas de venda, ocupação, receita.
- **Permite**: Visualizar relatórios, exportar dados
- **Status**: Completo

### 3.22 Financeiro (features/admin/views/financeiro/)
- **Acesso**: master
- **Mostra**: Saldo, histórico de saques, reembolsos, fechamento financeiro
- **Permite**: Solicitar saque (ModalSaque), processar reembolso manual (ModalReembolsoManual), fazer fechamento (ModalFechamento), ver histórico
- **Status**: Completo

### 3.23 MasterFinanceiroView
- **Acesso**: masteradm (super admin)
- **Mostra**: Tabs — Lucro por Comunidade, Raio-X do Evento, Simulador Gateway
- **Permite**: Visão cross-comunidade de receita e custos
- **Status**: Completo (2L no arquivo raiz — re-exporta)

### 3.24 NegociacaoSocioView
- **Acesso**: master, sócio
- **Mostra**: Chat turn-based de negociação entre dono e sócio — propostas e contrapropostas com deadline 48h
- **Permite**: Enviar proposta, aceitar, recusar, contra-propor
- **Status**: Completo

### 3.25 ConvitesSocioView
- **Acesso**: master, gerente
- **Mostra**: Lista de convites para sócios de eventos
- **Permite**: Enviar convite, ver status
- **Status**: Completo

### 3.26 VantaIndicaView
- **Acesso**: master
- **Mostra**: Gestão de destaques/indicações no feed — eventos em destaque, banners
- **Permite**: Criar/editar/remover destaques, upload de imagens
- **Status**: Completo

### 3.27 NotificacoesAdminView
- **Acesso**: master, gerente
- **Mostra**: Central de envio de notificações — push, in-app, email
- **Permite**: Enviar notificação segmentada para membros
- **Status**: Completo

### 3.28 CategoriasAdminView
- **Acesso**: masteradm
- **Mostra**: CRUD de categorias/estilos de evento
- **Permite**: Criar, editar, deletar categorias
- **Status**: Completo

### 3.29 ParticipantesView
- **Acesso**: master, gerente
- **Mostra**: Lista de participantes de um evento
- **Permite**: Visualizar quem comprou, status de check-in
- **Status**: Completo

### 3.30 GestaoComprovantesView
- **Acesso**: master, gerente
- **Mostra**: Comprovantes de meia-entrada pendentes de validação
- **Permite**: Aprovar/rejeitar comprovantes
- **Status**: Completo

### 3.31 ProductAnalyticsView
- **Acesso**: masteradm
- **Mostra**: Métricas de produto — usuários, eventos, retenção, gráficos
- **Permite**: Visualizar analytics
- **Status**: Completo

### 3.32 AuditLogView
- **Acesso**: masteradm
- **Mostra**: Log de auditoria — todas as ações do sistema
- **Permite**: Filtrar e visualizar logs
- **Status**: Completo

### 3.33 DatabaseHealthView / SupabaseDiagnosticView / DiagnosticoView
- **Acesso**: masteradm
- **Mostra**: Saúde do banco, diagnóstico Supabase, estatísticas de tabelas
- **Permite**: Visualizar saúde do sistema
- **Status**: Completo

### 3.34 PendenciasHubView
- **Acesso**: master, gerente
- **Mostra**: Hub de pendências — itens que precisam de ação (aprovações, reembolsos, etc.)
- **Permite**: Navegar para cada pendência
- **Status**: Completo

### 3.35 SolicitacoesParceriaView
- **Acesso**: master
- **Mostra**: Solicitações de parceria recebidas
- **Permite**: Aprovar/rejeitar parceria
- **Status**: Completo

### 3.36 SolicitarParceriaView
- **Acesso**: qualquer usuário logado (via perfil)
- **Mostra**: Formulário para solicitar parceria com comunidade
- **Permite**: Enviar solicitação de parceria
- **Status**: Completo

### 3.37 MaisVantaHubView
- **Acesso**: master
- **Mostra**: Hub central do MAIS VANTA com acesso a 7 sub-módulos
- **Permite**: Navegar entre módulos do clube
- **Status**: Completo

---

## 4. FLUXOS COMPLETOS

### 4.1 Descobrir evento → Comprar ingresso → Usar na entrada

1. **HomeView** — usuário vê feed de eventos (seções: highlights, esta semana, perto, amigos)
2. **SearchView** — alternativamente, busca por nome/filtros (cidade, estilo, data, preço)
3. **RadarView** — ou encontra no mapa geolocalizado
4. **EventDetailView** — abre detalhes: foto, info, social proof, reviews
5. **CheckoutPage** — clica "Comprar":
   - Seleciona lote → variação (área, gênero) → quantidade
   - Aplica cupom (opcional)
   - Se gratuito → RPC direto no Supabase → SuccessScreen
   - Se pago → Edge Function `create-ticket-checkout` → Stripe Checkout → redirect
6. **CheckoutSuccessPage** — (pago) polling 2s/30s até webhook confirmar
7. **SuccessScreen** — exibe QR codes, botão compartilhar
8. **WalletView** — ingresso aparece na carteira com QR
9. **TicketQRModal** — no dia, abre QR do ingresso
10. **PortariaScannerView** (admin) — porteiro escaneia QR → valida JWT → check-in confirmado
11. **notif-checkin-confirmacao** (Edge Function) — notificação push/in-app ao usuário

### 4.2 Cadastro → Onboarding → Primeiro uso

1. **LoginView** — tela inicial, clica "Cadastrar"
2. **AuthModal** — wizard multi-step:
   - Step 1: Nome, email, senha
   - Step 2: Data nascimento, cidade, UF, telefone
   - Step 3: Instagram (opcional)
   - Step 4: Selfie com câmera (SelfieCameraComponent analisa localmente)
   - Step 5: Aceitar termos (LegalView)
   - Concluir → cria conta no Supabase Auth + profile
3. **OnboardingView** — slides explicativos do app
4. **HomeView** — feed personalizado pela cidade selecionada
5. **TosAcceptModal** — se termos atualizaram, pede re-aceite

### 4.3 Produtor → Criar evento → Vender → Check-in → Financeiro

1. **ProfileView** → botão Admin → **AdminGateway**
2. **GerenteDashboardView** — dashboard com comunidades
3. **CriarEventoView** — wizard 5 steps:
   - Step 1: Tipo (CASA ou SOCIO), dados básicos (nome, data, local, imagem, categoria)
   - Step 2: Ingressos (lotes, variações por área/gênero/preço, limites, MAIS VANTA)
   - Step 3: Listas (regras, cotas de promoter, variações)
   - Step 4: Equipe (cargos, permissões, staff)
   - Step 5: Financeiro (split sócio, taxas)
4. Evento publicado → aparece no feed (HomeView, SearchView, RadarView)
5. Vendas:
   - Online: CheckoutPage → Stripe ou gratuito
   - Presencial: CaixaView → EventoCaixaView (funciona offline)
6. No dia do evento:
   - **CheckInView** → **PortariaScannerView** (QR) ou **PortariaListaDashView** (nomes)
   - Caixa ativo para vendas na porta
7. Pós-evento:
   - **RelatoriosView** — métricas de venda/ocupação
   - **Financeiro** — saldo disponível, solicitar saque, processar reembolsos
   - **notif-pedir-review** (cron) — pede review aos participantes

### 4.4 Usuário → Entrar no MAIS VANTA → Usar benefício

1. Recebe convite (link ou notificação) OU acessa **ProfileView** → MAIS VANTA
2. **AceitarConviteMVPage** (via link) ou **ClubeOptInView** (via perfil)
3. Aceita convite → Stripe Checkout para pagamento (se plano pago)
4. Vira membro → badge aparece no perfil e carteira
5. **DealsMembroSection** — vê deals disponíveis na sua cidade
6. Resgata deal → status muda para "aplicado"
7. Vai ao parceiro → parceiro confirma no **ParceiroDashboardPage** → check-in
8. Em eventos: **EventDetailView** → **MaisVantaReservaModal** → reserva com obrigação social
9. Pós-evento: deve postar menção no Instagram
10. **notif-evento-finalizou** (cron) — alerta para postar
11. **notif-infraccao-registrada** (cron, T+24h) — se não postou, registra infração

---

## 5. EDGE FUNCTIONS

### 5.1 create-checkout
- **O que faz**: Cria sessão Stripe Checkout para assinatura MAIS VANTA
- **Dispara**: Chamada HTTP POST pelo frontend (ClubeOptInView)
- **Dependências**: Stripe (STRIPE_SECRET_KEY)
- **Status**: Depende de config externa (CNPJ + Stripe secrets)

### 5.2 create-ticket-checkout
- **O que faz**: Cria sessão Stripe Checkout para compra de ingressos — valida preços server-side, cria pedido pendente
- **Dispara**: Chamada HTTP POST pelo frontend (CheckoutPage)
- **Dependências**: Stripe (STRIPE_SECRET_KEY)
- **Status**: Depende de config externa (CNPJ + Stripe secrets)

### 5.3 stripe-webhook
- **O que faz**: Recebe webhooks do Stripe — atualiza status de assinaturas MAIS VANTA e pagamentos de ingressos. Verifica assinatura HMAC-SHA256.
- **Dispara**: Webhook do Stripe (checkout.session.completed, session.expired, etc.)
- **Dependências**: Stripe (STRIPE_WEBHOOK_SECRET)
- **Status**: Depende de config externa

### 5.4 send-push
- **O que faz**: Envia push notifications via Firebase Cloud Messaging (HTTP v1 API)
- **Dispara**: Chamada interna pelo backend ou por admin
- **Dependências**: Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
- **Status**: Pronta (secrets configurados)

### 5.5 send-invite
- **O que faz**: Envia email de convite VANTA via Resend
- **Dispara**: Ação do admin (convite de membro/sócio)
- **Dependências**: Resend (RESEND_API_KEY)
- **Status**: Pronta

### 5.6 send-notification-email
- **O que faz**: Envia email de notificação genérica via Resend
- **Dispara**: Chamada interna (notificações do sistema)
- **Dependências**: Resend (RESEND_API_KEY)
- **Status**: Pronta

### 5.7 send-reembolso-email
- **O que faz**: Envia email de notificação de reembolso (aprovado/rejeitado) via Resend
- **Dispara**: Ação do master ao processar reembolso
- **Dependências**: Resend (RESEND_API_KEY)
- **Status**: Pronta

### 5.8 instagram-followers
- **O que faz**: Retorna contagem de seguidores de perfil público do Instagram (scraping server-side)
- **Dispara**: Chamada do painel admin (curadoria)
- **Dependências**: Instagram (scraping, sem API key)
- **Status**: Pronta (pode ser instável por depender de scraping)

### 5.9 verify-instagram-bio
- **O que faz**: Verifica se código VANTA está na bio do Instagram
- **Dispara**: Verificação de identidade no cadastro/curadoria
- **Dependências**: Instagram (scraping)
- **Status**: Pronta (instável — scraping)

### 5.10 verify-instagram-post
- **O que faz**: Verifica se post/story contém menções obrigatórias (obrigação social MAIS VANTA)
- **Dispara**: Automático pós-evento ou manual
- **Dependências**: Instagram Graph API (META_ACCESS_TOKEN) — fallback placeholder
- **Status**: Depende de config externa (META_ACCESS_TOKEN)

### 5.11 update-instagram-followers
- **O que faz**: Atualiza seguidores de todos os membros do clube em batch
- **Dispara**: Cron ou chamada manual
- **Dependências**: Instagram Graph API ou fallback scraping
- **Status**: Depende de config externa (META_ACCESS_TOKEN para API, scraping como fallback)

### 5.12 notif-checkin-confirmacao
- **O que faz**: Envia notificação ao usuário após check-in QR confirmado
- **Dispara**: Chamada síncrona após validarEQueimarIngresso()
- **Dependências**: FCM (send-push)
- **Status**: Pronta

### 5.13 notif-evento-iniciou
- **O que faz**: Detecta eventos que começaram e envia notificação (cron cada 5 min)
- **Dispara**: Cron job
- **Dependências**: FCM
- **Status**: Pronta

### 5.14 notif-evento-finalizou
- **O que faz**: Detecta eventos que terminaram, alerta membros para postar, agenda deadline T+24h
- **Dispara**: Cron job (cada 10 min)
- **Dependências**: FCM
- **Status**: Pronta

### 5.15 notif-infraccao-registrada
- **O que faz**: Registra infrações para posts vencidos (T+24h expirado sem verificação)
- **Dispara**: Cron job diário (03:00 UTC)
- **Dependências**: Nenhuma externa
- **Status**: Pronta

### 5.16 notif-pedir-review
- **O que faz**: Pede review aos participantes de eventos que terminaram nas últimas 24h
- **Dispara**: Cron diário (17:00 UTC / 14h BRT)
- **Dependências**: FCM
- **Status**: Pronta

---

## 6. SERVIÇOS

| Serviço | O que faz |
|---|---|
| `achievementsService.ts` | Calcula badges e níveis de frequência (ESTREANTE → LENDA) por comunidade |
| `analyticsService.ts` | Tracking de abertura do app, visualização e abertura de evento |
| `authService.ts` | Login, cadastro, recuperação de senha, refresh de sessão, mapeamento profile→Membro |
| `cache.ts` | Cache in-memory stale-while-revalidate com invalidação por key/prefix |
| `cepService.ts` | Busca de CEP (API ViaCEP), formatação e geocodificação de endereço |
| `circuitBreaker.ts` | Circuit breaker para chamadas externas (CLOSED→OPEN→HALF_OPEN) |
| `comemoracaoService.ts` | CRUD de solicitações de comemoração (aniversário/despedida) |
| `communityFollowService.ts` | Seguir/desseguir comunidades |
| `eventoPrivadoService.ts` | CRUD de solicitações de evento privado |
| `favoritosService.ts` | Salvar/remover eventos favoritos |
| `firebaseConfig.ts` | Inicialização lazy do Firebase App e Messaging |
| `friendshipsService.ts` | CRUD de amizades (solicitar, aceitar, recusar, remover) com realtime |
| `logger.ts` | Wrapper do Sentry (error→captureException, warn→breadcrumb) |
| `messagesService.ts` | Chat: inbox, mensagens, envio, leitura, deleção, reações, realtime |
| `moodService.ts` | CRUD de mood/status do usuário (emoji + texto com expiração) |
| `nativePushService.ts` | Push notifications nativo via Capacitor (registro de token FCM) |
| `notifyService.ts` | Cria notificação in-app e dispara push via Edge Function |
| `offlineDB.ts` | IndexedDB para cache offline de tickets, convidados, lotes (portaria/caixa) |
| `offlineEventService.ts` | Sync offline de dados de evento para operação sem internet |
| `photoService.ts` | Upload/delete de avatar e álbum de fotos no Supabase Storage |
| `pushService.ts` | Registro de token FCM no browser (Web Push) |
| `rateLimiter.ts` | Rate limiter in-memory por chave (token bucket) |
| `realtimeManager.ts` | Gerenciamento de channels Supabase Realtime (max 5, auto-cleanup) |
| `reminderService.ts` | Lembretes locais de eventos (push local via Capacitor) |
| `supabaseClient.ts` | Instância tipada do Supabase client (createClient<Database>) |
| `supabaseVantaService.ts` | Service principal: busca de eventos, perfis, tickets, presenças, upload biometria |
| `transferenciaService.ts` | Transferência de ingresso entre usuários |
| `vantaService.ts` | Facade que re-exporta SupabaseVantaService |
| `waitlistService.ts` | Entrada/gestão de lista de espera de ingressos |

---

## 7. O QUE PARECE INCOMPLETO

### 7.1 Depende de configuração externa
- **Pagamento Stripe (ingressos)**: Edge Functions prontas, frontend pronto, mas VITE_STRIPE_PAYMENTS_ENABLED=false. Depende de CNPJ + secrets Stripe. Branch `feat/stripe-ingressos` com 6 commits não mergeados.
- **Pagamento Stripe (MAIS VANTA)**: create-checkout + stripe-webhook prontos, mas sem Stripe secrets configurados.
- **Verificação Instagram (Graph API)**: verify-instagram-post e update-instagram-followers dependem de META_ACCESS_TOKEN.
- **Instagram scraping**: instagram-followers e verify-instagram-bio funcionam via scraping, mas podem ser instáveis.

### 7.2 UI com funcionalidade limitada
- **PreferencesView** (`modules/profile/PreferencesView.tsx`, 87L): Parece ser placeholder básico — configurações de privacidade e notificações com UI mínima.
- **CaixaView.tsx** (2L) e **MasterFinanceiroView.tsx** (2L): Apenas re-exports.
- **ComunidadesView.tsx** (raiz, 3L) e **CriarComunidadeView.tsx** (raiz, 3L): Apenas re-exports.

### 7.3 Funcionalidades mencionadas mas não verificadas em profundidade
- **Modo offline** (portaria/caixa): offlineDB + offlineEventService existem e são usados por EventoCaixaView e EventCheckInView. Parece completo mas a robustez do sync depende de testes reais.
- **Evento recorrente**: Mencionado na memória (3 RPCs, SerieChips), UI existe. Incerto se totalmente testado.

### 7.4 Nada parece abandonado
Todos os módulos e services encontrados são referenciados e importados por componentes ativos. Não foram encontrados arquivos órfãos significativos nos diretórios principais.
