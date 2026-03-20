# VANTA -- Livro de Fluxos do Usuario

> Todos os caminhos de navegacao do app VANTA, documentados da perspectiva do usuario.
> Desde a primeira abertura ate o ultimo botao de cada tela.
> Gerado em: 2026-03-20

---

## Sumario

### Parte 1 -- Primeiro Acesso e Home

- [1. Abrir o App pela Primeira Vez (Guest)](#1-fluxo-abrir-o-app-pela-primeira-vez-guest)
- [2. Home Completa (Todas as Secoes)](#2-fluxo-home-completa-todas-as-secoes)
  - [2.1 Saudacao](#21-saudacao)
  - [2.2 Banner "Seus Beneficios" (MAIS VANTA)](#22-banner-seus-beneficios-so-membros-mais-vanta)
  - [2.3 Vanta Indica (Highlights)](#23-vanta-indica-highlights)
  - [2.4 Proximos Eventos](#24-proximos-eventos)
  - [2.5 VANTA Indica pra Voce (Recomendacoes)](#25-vanta-indica-pra-voce-recomendacoes-personalizadas)
  - [2.6 Mais Vendidos 24h](#26-mais-vendidos-24h)
  - [2.7 Locais Parceiros](#27-locais-parceiros)
  - [2.8 Descubra Cidades](#28-descubra-cidades)
  - [2.9 Beneficios MAIS VANTA](#29-beneficios-mais-vanta)
  - [Pull-to-Refresh](#pull-to-refresh-toda-a-home)
- [3. Selecionar Cidade (CitySelector)](#3-fluxo-selecionar-cidade-cityselector)
- [4. Ver Notificacoes (NotificationPanel)](#4-fluxo-ver-notificacoes-notificationpanel)
- [5. Ver Todos os Eventos (AllEventsView)](#5-fluxo-ver-todos-os-eventos-alleventsview)
- [6. Ver Cidade Especifica (CityView)](#6-fluxo-ver-cidade-especifica-cityview)
- [7. Ver Todos os Parceiros (AllPartnersView)](#7-fluxo-ver-todos-os-parceiros-allpartnersview)
- [8. Ver Todos os Beneficios MV (AllBeneficiosView)](#8-fluxo-ver-todos-os-beneficios-mv-allbeneficiosview)
- [9. Filtros na Home (HomeFilterOverlay)](#9-fluxo-filtros-na-home-homefilteroverlay)
- [Mapa de Navegacao Resumido](#mapa-de-navegacao-resumido)
- [Comportamento de Empilhamento de Views](#comportamento-de-empilhamento-de-views)

### Parte 2 -- Eventos e Compra de Ingressos

- [1. Ver Detalhe do Evento](#1-ver-detalhe-do-evento)
  - [EventHeader (hero)](#eventheader-hero)
  - [Corpo (scroll vertical)](#corpo-scroll-vertical)
  - [EventFooter (fixo no bottom)](#eventfooter-fixo-no-bottom)
- [2. Comprar Ingresso (Checkout Completo)](#2-comprar-ingresso)
  - [Etapa 1 -- Detalhe do evento](#etapa-1----detalhe-do-evento)
  - [Etapa 2 -- CheckoutPage (Step: select)](#etapa-2----checkoutpage-step-select)
  - [Etapa 3 -- Login (Step: login)](#etapa-3----login-step-login)
  - [Etapa 4a -- Fluxo Gratuito](#etapa-4a----fluxo-gratuito-total--0)
  - [Etapa 4b -- Fluxo Pago](#etapa-4b----fluxo-pago-total--0)
  - [Etapa 5a -- SuccessScreen (gratuito)](#etapa-5a----successscreen-fluxo-gratuito)
  - [Etapa 5b -- CheckoutSuccessPage (pago/Stripe)](#etapa-5b----checkoutsuccesspage-fluxo-pagostripe)
- [3. Checkout com CPF / Telefone](#3-checkout-com-cpf--telefone)
- [4. Lista de Espera](#4-lista-de-espera)
- [5. Evento Esgotado](#5-evento-esgotado)
- [6. Evento ao Vivo / Badges de Urgencia](#6-evento-ao-vivo--badges-de-urgencia)
- [7. Favoritar Evento](#7-favoritar-evento)
- [8. Confirmar Presenca](#8-confirmar-presenca)
- [9. Convidar Amigos](#9-convidar-amigos)
- [10. Beneficios MAIS VANTA no Evento](#10-beneficios-mais-vanta-no-evento)
- [11. Avaliar Evento](#11-avaliar-evento)
- [12. Denunciar Evento](#12-denunciar-evento)
- [13. Landing Page do Evento](#13-landing-page-do-evento)
- [14. Deep Link de Evento](#14-deep-link-de-evento)
- [Mapa de Arquivos Completo](#mapa-de-arquivos-completo)

### Parte 3 -- Autenticacao, Busca, Radar e Comunidade

**Autenticacao:**
- [1.1 Criar Conta (AuthModal)](#11-criar-conta-authmodal)
- [1.2 Login (LoginView)](#12-login-loginview)
- [1.3 Onboarding Pos-Cadastro (OnboardingView)](#13-onboarding-pos-cadastro-onboardingview)
- [1.4 Completar Perfil Social (CompletarPerfilSocial)](#14-completar-perfil-social-completarperfilsocial)
- [1.5 Resetar Senha (ResetPasswordView)](#15-resetar-senha-resetpasswordview)
- [1.6 Sessao Expirada (SessionExpiredModal)](#16-sessao-expirada-sessionexpiredmodal)
- [1.7 Guest Tentando Acessar Area Restrita (GuestAreaModal)](#17-guest-tentando-acessar-area-restrita-guestareamodal)
- [1.8 PMF Survey (PmfSurveyModal)](#18-pmf-survey-pmfsurveymodal)
- [1.9 Aceitar Termos Atualizados (TosAcceptModal)](#19-aceitar-termos-atualizados-tosacceptmodal)

**Busca:**
- [2.1 Tab Buscar (SearchView)](#21-tab-buscar-searchview)
- [2.2 Buscar Eventos (SearchResults)](#22-buscar-eventos-searchresults)
- [2.3 Buscar Pessoas (PeopleResults)](#23-buscar-pessoas-peopleresults)
- [2.4 Buscar Lugares (PlacesResults)](#24-buscar-lugares-placesresults)
- [2.5 Filtro de Preco (PriceFilterModal)](#25-filtro-de-preco-pricefiltermodal)
- [2.6 Filtro de Vibe/Estilo (VibeFilterModal)](#26-filtro-de-vibeestilo-vibefiltermodal)
- [2.7 Filtro de Horario (TimeFilterModal)](#27-filtro-de-horario-timefiltermodal)
- [2.8 Filtro de Cidade (CityFilterModal)](#28-filtro-de-cidade-cityfiltermodal)
- [2.9 Tab Beneficios MV (BeneficiosMVTab)](#29-tab-beneficios-mv-beneficiosmvtab)

**Radar (Mapa):**
- [3.1 Tab Radar (RadarView)](#31-tab-radar-radarview)
- [3.2 Pedir Permissao GPS -- Fluxo Completo](#32-pedir-permissao-gps----fluxo-completo)
- [3.3 Calendario Premium (PremiumCalendar)](#33-calendario-premium-premiumcalendar)
- [3.4 Clicar num Pin](#34-clicar-num-pin)

**Comunidade:**
- [4.1 Pagina Publica da Comunidade (ComunidadePublicView)](#41-pagina-publica-da-comunidade-comunidadepublicview)
- [4.2 Seguir Comunidade -- Fluxo](#42-seguir-comunidade----fluxo)
- [4.3 Evento Privado (EventoPrivadoFormView)](#43-evento-privado-eventoprivadoformview)
- [4.4 Comemoracao / Aniversario (ComemoracaoFormView)](#44-comemoracao--aniversario-comemoracaoformview)

**Fluxos Especiais:**
- [5.1 Aceitar Convite MAIS VANTA (AceitarConviteMVPage)](#51-aceitar-convite-mais-vanta-aceitarconvitemvpage)
- [5.2 Painel do Parceiro (ParceiroDashboardPage)](#52-painel-do-parceiro-parceirodashboardpage)
- [5.3 PWA Install Prompt](#53-pwa-install-prompt)
- [5.4 PWA Update Banner](#54-pwa-update-banner)
- [5.5 Push Notification Permission](#55-push-notification-permission)
- [5.6 Erro Global (ErrorBoundary)](#56-erro-global-errorboundary)
- [5.7 Pagina 404 (NotFoundView)](#57-pagina-404-notfoundview)
- [5.8 Offline](#58-offline)
- [Resumo de Todos os Modais (AppModals)](#resumo-de-todos-os-modais-gerenciados-pelo-appmodals)

### Parte 4 -- Perfil, Social, Carteira e Mensagens

**Perfil:**
- [1. Ver Meu Perfil (ProfileView)](#1-ver-meu-perfil-profileview)
- [2. Editar Perfil (EditProfileView)](#2-editar-perfil-editprofileview)
- [3. Preferencias (PreferencesView)](#3-preferencias-preferencesview)
- [4. Historico (HistoricoView)](#4-historico-historicoview)
- [5. Comprovante Meia-Entrada (ComprovanteMeiaSection)](#5-comprovante-meia-entrada-comprovantemeiaesection)
- [6. Minhas Pendencias (MinhasPendenciasView)](#6-minhas-pendencias-minhaspendenciasview)
- [7. Minhas Solicitacoes (MinhasSolicitacoesView)](#7-minhas-solicitacoes-minhassolicotacoesview)
- [8. Preview Publico (PublicProfilePreviewView)](#8-preview-publico-publicprofilepreviewview)
- [9. Mood/Status (MoodPicker)](#9-moodstatus-moodpicker)
- [10. Solicitar Parceria (SolicitarParceriaView)](#10-solicitar-parceria-solicitarparceriaview)
- [11. MAIS VANTA Opt-in (ClubeOptInView)](#11-mais-vanta-opt-in-clubeoptinview)
- [12. Bloqueados (BloqueadosView)](#12-bloqueados-bloqueadosview)
- [13. Alterar Senha (modal no ProfileView)](#13-alterar-senha-modal-no-profileview)
- [14. Deletar Conta (modal no ProfileView)](#14-deletar-conta-modal-no-profileview)
- [15. Exportar Dados / LGPD](#15-exportar-dados-lgpd)

**Social:**
- [16. Ver Perfil de Outro Usuario](#16-ver-perfil-de-outro-usuario)
- [17. Enviar Pedido de Amizade](#17-enviar-pedido-de-amizade)
- [18. Aceitar/Recusar Amizade](#18-aceitarrecusar-amizade)
- [19. Bloquear/Denunciar Usuario](#19-bloqueardenunciar-usuario)

**Carteira:**
- [20. Meus Ingressos (WalletView)](#20-meus-ingressos-walletview)
- [21. QR Code do Ingresso (TicketQRModal)](#21-qr-code-do-ingresso-ticketqrmodal)
- [22. Tela de Bloqueio (WalletLockScreen)](#22-tela-de-bloqueio-walletlockscreen)
- [23. Transferir Ingresso](#23-transferir-ingresso)
- [24. Aceitar Cortesia](#24-aceitar-cortesia)
- [25. Lista de Presencas (PresencaList)](#25-lista-de-presencas-presencalist)

**Mensagens:**
- [26. Lista de Conversas (MessagesView)](#26-lista-de-conversas-messagesview)
- [27. Abrir Conversa (ChatRoomView)](#27-abrir-conversa-chatroomview)
- [28. Nova Conversa (NewChatModal)](#28-nova-conversa-newchatmodal)
- [29. Arquivar/Silenciar Chat (ArchiveModal)](#29-arquivarsilenciar-chat-archivemodal--swipe)
- [30. Denunciar no Chat (ReportModal)](#30-denunciar-no-chat-reportmodal)

- [Resumo de Navegacao entre Modulos](#resumo-de-navegacao-entre-modulos)

### Apendices

- [Apendice A -- Mapa de Navegacao Completo](#apendice-a----mapa-de-navegacao-completo)
- [Apendice B -- Tabela de Z-Index](#apendice-b----tabela-de-z-index)
- [Apendice C -- Fluxos por Persona](#apendice-c----fluxos-por-persona)
  - [Guest (nao logado)](#guest-nao-logado)
  - [Membro (logado, sem MAIS VANTA)](#membro-logado-sem-mais-vanta)
  - [Membro MAIS VANTA (logado + assinante MV)](#membro-mais-vanta-logado--assinante-mv)
  - [Admin (logado + role admin/gerente/master)](#admin-logado--role-admingerentemaster)

---

## Prefacio -- Como Ler Este Livro

Cada fluxo neste livro segue a mesma estrutura:

1. **Ponto de partida** -- Qual tela o usuario esta e qual acao dispara o fluxo
2. **Caminho completo** -- A sequencia de telas, tela a tela, com os componentes envolvidos
3. **O que o usuario ve** -- Elementos visuais, dados exibidos, layout
4. **Acoes possiveis** -- Botoes, gestos, interacoes disponiveis em cada tela
5. **Onde termina** -- Tela final ou acao que conclui o fluxo
6. **Estados especiais** -- Loading, erro, vazio, guest vs logado, membro MAIS VANTA
7. **Arquivos envolvidos** -- Componentes, services e stores do codigo-fonte

**Convencoes:**
- `->` indica navegacao entre telas
- Nomes entre crases (`ComponentName`) sao componentes React do codigo
- "MAIS VANTA" (ou MV) refere-se ao programa de fidelidade premium
- "Guest" e o usuario nao-logado que navega livremente pelo app
- Todas as cores douradas no app usam `#FFD700` ou `#FFD300`

---

## Parte 1 -- Primeiro Acesso e Home

## Arquivos-chave investigados

| Componente | Caminho |
|---|---|
| App.tsx | `/Users/vanta/prevanta/App.tsx` |
| Layout (Header + TabBar) | `/Users/vanta/prevanta/components/Layout.tsx` |
| HomeView | `/Users/vanta/prevanta/modules/home/HomeView.tsx` |
| ProximosEventosSection | `/Users/vanta/prevanta/modules/home/components/ProximosEventosSection.tsx` |
| IndicaPraVoceSection | `/Users/vanta/prevanta/modules/home/components/IndicaPraVoceSection.tsx` |
| MaisVendidosSection | `/Users/vanta/prevanta/modules/home/components/MaisVendidosSection.tsx` |
| BeneficiosMVSection | `/Users/vanta/prevanta/modules/home/components/BeneficiosMVSection.tsx` |
| DescubraCidadesSection | `/Users/vanta/prevanta/modules/home/components/DescubraCidadesSection.tsx` |
| LocaisParceiroSection | `/Users/vanta/prevanta/modules/home/components/LocaisParceiroSection.tsx` |
| Highlights | `/Users/vanta/prevanta/modules/home/components/Highlights.tsx` |
| HomeFilterOverlay | `/Users/vanta/prevanta/modules/home/components/HomeFilterOverlay.tsx` |
| EventCarousel | `/Users/vanta/prevanta/modules/home/components/EventCarousel.tsx` |
| AllEventsView | `/Users/vanta/prevanta/modules/home/AllEventsView.tsx` |
| CityView | `/Users/vanta/prevanta/modules/home/CityView.tsx` |
| AllPartnersView | `/Users/vanta/prevanta/modules/home/AllPartnersView.tsx` |
| AllBeneficiosView | `/Users/vanta/prevanta/modules/home/AllBeneficiosView.tsx` |
| CitySelector | `/Users/vanta/prevanta/components/Home/CitySelector.tsx` |
| NotificationPanel | `/Users/vanta/prevanta/components/Home/NotificationPanel.tsx` |

---

## 1. FLUXO: Abrir o App pela Primeira Vez (Guest)

**Ponto de partida:** Primeiro acesso ao app (sem conta).

**Caminho completo:**
1. App.tsx detecta `authLoading = true` -> exibe tela de loading (icone VANTA girando + texto "Carregando")
2. Apos 8 segundos sem resposta, forca liberacao como guest
3. O usuario entra como `vanta_guest` -> Tab `INICIO` e ativada automaticamente

**O que o usuario ve:**
- **Header:** Foto de perfil padrao (borda dourada), seletor de cidade ("Estou em: [cidade]" ou "Todas as cidades"), icone de sino (notificacoes). Se nao tiver cidade selecionada, a primeira cidade com eventos e auto-selecionada.
- **Saudacao:** "Bom dia" / "Boa tarde" / "Boa noite" (sem nome, pois e guest)
- **Feed completo da Home** (descrito no fluxo 2 abaixo)
- **TabBar inferior:** 5 abas -- Inicio, Radar, Buscar, Mensagens, Perfil

**Acoes possiveis:**
- Navegar livremente pela Home, Radar e Buscar
- Tocar em qualquer evento -> abre detalhe do evento
- **Acoes bloqueadas para guest:** Tocar em Mensagens, Perfil ou Notificacoes abre um modal pedindo login/cadastro. O modal exibe contexto especifico (ex: "Para ver mensagens, faca login")
- Tocar no botao Admin (escudo dourado) -> bloqueado para guest

**Onde termina:** O guest fica na Home ate decidir criar conta ou fazer login via modal de autenticacao.

**Estados especiais:**
- **Loading:** Icone VANTA girando com texto "Carregando"
- **Stuck loading (>8s):** Forca liberacao como guest
- **Sem cidade selecionada:** Empty state com icone de pin, texto "Selecione uma cidade", e botao "Explorar" que leva para a aba Buscar

---

## 2. FLUXO: Home Completa (Todas as Secoes)

**Ponto de partida:** Tab "Inicio" selecionada na TabBar.

**Caminho completo:** O conteudo e um scroll vertical continuo. As secoes sao carregadas progressivamente via `LazySection` (intersection observer). A ordem de cima para baixo e:

### 2.1 Saudacao
**O que o usuario ve:** Texto compacto em 1 linha: "[Saudacao dinamica], [Primeiro nome]". Se for membro MAIS VANTA, aparece um icone de coroa dourada ao lado.
**Acoes:** Nenhuma (texto informativo).

### 2.2 Banner "Seus Beneficios" (so membros MAIS VANTA)
**O que o usuario ve:** Card com gradiente dourado sutil, icone de coroa, texto "Seus beneficios" + "Exclusivos pra voce" + seta "Ver".
**Acoes:** Tocar -> navega para a sub-view CLUBE no Perfil.
**Visibilidade:** So aparece para membros MAIS VANTA logados. Guest e membros comuns nao veem.

### 2.3 Vanta Indica (Highlights)
**O que o usuario ve:** Carrossel fullwidth com cards visuais tipo banner (aspect ratio 5:3, bordas arredondadas). Cada card tem: imagem de fundo, badge categorizado (EVENTO, PARCEIRO, MAIS_VANTA, PUBLICIDADE, EXPERIENCIA, INFORMATIVO -- cada tipo com cor diferente), titulo em tipografia display, subtitulo em dourado italico. Indicadores de paginacao (bolinhas) na parte inferior. O carrossel muda automaticamente a cada 5 segundos.
**Acoes:**
- Swipe horizontal ou arrastar para navegar entre slides
- Tocar nos indicadores de paginacao para pular para um slide
- Tocar num card executa a acao configurada: abrir evento, abrir comunidade, comemorar aniversario, navegar para tab, abrir link externo, ou aplicar cupom
- A acao "comemorar" abre um modal intermediario com informacoes sobre cortesias de aniversario e botao "Quero comemorar" que leva a pagina da comunidade

**Estados especiais:** Se nao existirem cards ativos para a cidade do usuario, a secao nao aparece.

### 2.4 Proximos Eventos
**O que o usuario ve:**
- Titulo "Proximos Eventos" com icone de calendario dourado
- Botao de engrenagem (filtros) no canto direito do titulo -- dourado quando filtros estao ativos, cinza quando nao
- Se filtros ativos: faixa de chips dourados mostrando ate 3 filtros ativos (cada um com X para remover), e "+N filtros" se houver mais de 3
- Carrossel horizontal principal com ate 9 EventCards
- Sub-carrosseis agrupados por formato (ex: "Balada", "Festival") e por estilo musical (ex: "Eletronica", "Funk") -- cada um com titulo em caps e carrossel proprio. Sub-carrosseis so aparecem quando NAO ha filtros personalizados ativos.
- Card "Ver todos" no final do carrossel principal, que abre AllEventsView

**Acoes:**
- Scroll horizontal nos carrosseis
- Tocar num EventCard -> abre detalhe do evento
- Tocar no logo da comunidade dentro do EventCard -> abre pagina publica da comunidade
- Tocar na engrenagem -> abre HomeFilterOverlay
- Tocar no X de um chip de filtro -> remove aquele filtro
- Tocar "Ver todos" -> abre AllEventsView da cidade

**Estados especiais:**
- **Loading:** Skeleton pulsante
- **Nenhum evento na cidade:** Secao inteira some
- **Filtros ativos sem resultados:** Mensagem "Nenhum evento encontrado com seus filtros" + botoes "Editar filtros" e "Ver todos" (reset)

### 2.5 VANTA Indica pra Voce (Recomendacoes Personalizadas)
**O que o usuario ve:**
- Titulo "VANTA Indica pra Voce" com icone de estrelinhas (Sparkles) dourado
- Chips de filtro: "Todos", "Eventos", "Parceiros" (so se ambos existirem)
- Carrossel de EventCards com ate 9 eventos recomendados com base nos interesses do usuario
- Carrossel de DealCards (ofertas de parceiros) agrupados por tipo de parceiro (Restaurante, Bar, Club, etc.). Cada DealCard mostra: foto, titulo, nome do parceiro, tipo, e percentual de desconto se aplicavel

**Acoes:**
- Scroll horizontal nos carrosseis
- Selecionar chip para filtrar entre Eventos e Parceiros
- Tocar num EventCard -> abre detalhe do evento
- Tocar "Ver todos" -> navega para aba Buscar

**Estados especiais:**
- **Guest:** Secao NAO aparece (requer login + interesses cadastrados)
- **Sem interesses cadastrados:** Secao NAO aparece
- **Loading:** Skeleton pulsante
- **Sem resultados:** Secao some

**Logica de recomendacao:** Primeiro tenta usar `behaviorService.getRecomendados` (baseado em historico de comportamento). Se nao retornar resultados, faz fallback filtrando eventos por tags que correspondem aos interesses do usuario.

### 2.6 Mais Vendidos 24h
**O que o usuario ve:**
- Titulo "Mais Vendidos 24h" com icone de seta subindo (TrendingUp) dourado
- Chips de filtro combinando formatos e estilos musicais
- Carrossel principal com ate 10 EventCards dos eventos mais vendidos nas ultimas 24h
- Sub-carrosseis por formato e estilo (similar ao Proximos Eventos)

**Acoes:**
- Selecionar chip para filtrar por formato ou estilo
- Scroll horizontal nos carrosseis
- Tocar num EventCard -> abre detalhe do evento

**Estados especiais:**
- **Loading:** Skeleton pulsante
- **Sem dados (nenhum evento vendido em 24h):** Secao some

### 2.7 Locais Parceiros
**O que o usuario ve:**
- Titulo "Locais Parceiros" com icone de pin (MapPin) dourado
- Chips de filtro por tipo de comunidade (ex: "Bar", "Restaurante", "Club")
- Carrossel horizontal de PartnerCards (ate 9) mostrando foto, nome e tipo do parceiro
- Card "Ver todos" no final (so aparece se tiver 9+ parceiros)

**Acoes:**
- Selecionar chip para filtrar por tipo
- Scroll horizontal
- Tocar num PartnerCard -> abre pagina publica da comunidade
- Tocar "Ver todos" -> abre AllPartnersView

**Estados especiais:**
- **Loading:** 2 skeletons pulsantes quadrados
- **Sem parceiros na cidade:** Secao some

### 2.8 Descubra Cidades
**O que o usuario ve:**
- Titulo "Descubra Cidades" com icone de globo dourado
- Chips de filtro por estado (UF) -- so aparecem se houver cidades em mais de 1 estado
- Carrossel horizontal de CityCards mostrando foto de destaque da cidade, nome da cidade, e quantidade de eventos

**Acoes:**
- Selecionar chip para filtrar por estado
- Scroll horizontal
- Tocar num CityCard -> abre CityView da cidade selecionada

**Estados especiais:**
- **Loading:** 2 skeletons pulsantes retangulares
- **Sem cidades:** Secao some

### 2.9 Beneficios MAIS VANTA
**O que o usuario ve:**
- Titulo "Beneficios MAIS VANTA" com icone de coroa dourada
- Chips de filtro por tipo de beneficio: "Todos", "Ingresso", "Lista", "Desconto"
- Carrossel principal com ate 9 EventCards de eventos que oferecem beneficios para membros MV
- Sub-carrosseis por formato e estilo musical
- Card "Ver todos" no final

**Acoes:**
- Selecionar chip para filtrar por tipo de beneficio
- Scroll horizontal nos carrosseis
- Tocar num EventCard -> abre detalhe do evento
- Tocar "Ver todos" -> abre AllBeneficiosView

**Estados especiais:**
- **Nao e membro MAIS VANTA:** Secao NAO aparece
- **Guest:** Secao NAO aparece
- **Loading:** Skeleton pulsante
- **Sem beneficios disponiveis:** Secao some

### Pull-to-Refresh (toda a Home)
**Acao:** Puxar a tela para baixo quando ja esta no topo. Um indicador de spinner dourado aparece. Ao atingir 60px de arrasto, dispara o refresh dos eventos. O spinner gira por 1.5 segundo.

---

## 3. FLUXO: Selecionar Cidade (CitySelector)

**Ponto de partida:** Header da Home -> tocar em "Estou em: [cidade]" (centro do header). A seta chevron gira 180 graus quando aberto.

**Caminho completo:**
1. Toca no seletor de cidade no header
2. Overlay abre com backdrop blur escuro
3. Lista de cidades com eventos aparece (carregada via RPC do Supabase)

**O que o usuario ve:**
- Overlay glassmorphism arredondado (2rem) posicionado abaixo do header
- Titulo "Selecionar Localidade" em caps
- Botao X no canto superior direito para fechar
- Lista vertical de cidades, cada uma com icone de pin e nome em uppercase
- Cidade selecionada atualmente destacada em dourado com icone de check
- Botao "Fechar" na parte inferior

**Acoes possiveis:**
- Tocar numa cidade -> seleciona, fecha o overlay, e toda a Home recarrega com dados daquela cidade
- Tocar no X ou no "Fechar" -> fecha sem alterar
- Tocar fora do overlay (no backdrop) -> fecha sem alterar

**Como afeta o feed:** A cidade selecionada e armazenada no authStore (`selectedCity`). TODAS as secoes da Home (Proximos Eventos, Indica pra Voce, Mais Vendidos, Locais Parceiros, Descubra Cidades, Beneficios MV) recebem a cidade como prop e recarregam seus dados quando ela muda. Os filtros locais sao resetados.

**Estados especiais:**
- **Auto-selecao:** Se nenhuma cidade esta selecionada e a lista carrega, a primeira cidade e auto-selecionada
- **Sem cidades com eventos:** Lista fica vazia

---

## 4. FLUXO: Ver Notificacoes (NotificationPanel)

**Ponto de partida:** Header da Home -> tocar no icone de sino. Badge vermelho com contador aparece quando ha notificacoes nao lidas (mostra "99+" se mais de 99).

**Caminho completo:**
1. Toca no sino no header
2. **Se guest:** Modal de login aparece (bloqueado para guest)
3. **Se logado:** NotificationPanel abre como overlay

**O que o usuario ve:**
- Overlay glassmorphism arredondado (2.5rem) posicionado abaixo do header, alinhado a direita
- Titulo "Notificacoes" + botao X
- **Filtros por categoria** (tabs horizontais separadas por bolinhas douradas):
  - **Todas** -- todas as notificacoes
  - **Social** -- solicitacoes de amizade, amizade aceita, mensagens novas
  - **Eventos** -- eventos novos, aprovados, cancelados, reviews, comemoracoes, alertas de lotacao
  - **Ingressos** -- compras confirmadas, cortesias pendentes, transferencias, cotas recebidas
- Lista scrollavel de notificacoes (max 350px), cada uma com:
  - Icone/avatar adequado ao tipo (foto do perfil para amizade, foto do evento, icone de coroa para MAIS VANTA, icone de presente para cortesia, icone de estrela para review)
  - Titulo em bold (dourado para solicitacoes de amizade)
  - Mensagem em italico cinza (ate 2 linhas)
  - Bolinha dourada brilhante se nao lida
- **Notificacoes acionaveis inline:**
  - **Solicitacao de amizade:** Botoes "Aceitar" (dourado) e "Recusar" (cinza) abaixo da mensagem
  - **Cortesia pendente:** Botoes "Aceitar" (verde) e "Recusar" (cinza)
- Botao "Marcar lidas" na parte inferior

**Acoes possiveis:**
- Selecionar filtro de categoria
- Tocar em notificacao social -> abre perfil publico do membro
- Tocar em notificacao de evento -> abre detalhe do evento
- Tocar em notificacao de sistema -> navega para destino configurado (editar perfil, clube, carteira, comunidade, evento)
- Aceitar/Recusar amizade inline (com animacao de loading e fade-out)
- Aceitar/Recusar cortesia inline
- Marcar todas como lidas e fechar

**Onde termina:** Ao tocar em notificacao acionavel, o painel fecha e navega para o destino. Ao clicar X ou backdrop, fecha sem acao.

**Estados especiais:**
- **Recusar amizade:** Modal de confirmacao "Pedido Recusado" com botao "Entendido"
- **Filtro de tempo:** Notificacoes com mais de 7 dias sao ocultas automaticamente (exceto solicitacoes de amizade, cortesias e reviews que sempre aparecem)
- **Guest:** Bloqueado -- mostra modal de login

---

## 5. FLUXO: Ver Todos os Eventos (AllEventsView)

**Ponto de partida:** Card "Ver todos" no final do carrossel de Proximos Eventos, ou via CityView.

**Caminho completo:**
1. Toca em "Ver todos" no carrossel de Proximos Eventos
2. Overlay desliza da direita (z-index 160) cobrindo toda a tela

**O que o usuario ve:**
- Header com seta de voltar, titulo "Eventos em [cidade]"
- **Duas tabs:** "Proximos" (ativa por padrao) e "Passados" -- em uppercase com underline dourado na tab ativa
- Grid de 2 colunas com EventCards
- Infinite scroll (carrega 20 por vez automaticamente ao se aproximar do fim)

**Acoes possiveis:**
- Trocar entre tabs Proximos/Passados (recarrega a lista)
- Scroll vertical para ver mais (infinite scroll automatico)
- Tocar num EventCard -> abre detalhe do evento (empilha sobre o AllEventsView)
- Tocar no logo da comunidade -> abre pagina publica da comunidade
- Tocar na seta de voltar -> fecha o overlay e volta para a Home

**Onde termina:** Ao abrir um evento, a tela de detalhe empilha. Ao voltar, retorna para o AllEventsView. Ao fechar o AllEventsView, retorna a Home.

**Estados especiais:**
- **Loading:** Skeleton pulsante abaixo dos cards ja carregados
- **Sem eventos (tab Proximos):** Texto "Nenhum evento proximo" centralizado
- **Sem eventos (tab Passados):** Texto "Nenhum evento passado" centralizado

---

## 6. FLUXO: Ver Cidade Especifica (CityView)

**Ponto de partida:** Tocar num CityCard na secao "Descubra Cidades" da Home.

**Caminho completo:**
1. Toca num CityCard
2. Overlay desliza da direita (z-index 170, acima do AllEventsView) cobrindo toda a tela

**O que o usuario ve:**
- **Hero:** Foto grande da cidade (176px) com gradiente escuro, botao voltar circular sobre a foto, nome da cidade em tipografia display na parte inferior
- **Proximos Eventos:** Carrossel horizontal + card "Ver todos" (abre AllEventsView da cidade)
- **Locais Parceiros:** Carrossel horizontal de PartnerCards + card "Ver todos" (abre AllPartnersView da cidade)
- **Eventos Passados:** Carrossel horizontal + card "Ver todos" (abre AllEventsView da cidade, tab passados)

**Acoes possiveis:**
- Scroll vertical entre as secoes
- Tocar num EventCard -> abre detalhe do evento
- Tocar num PartnerCard -> abre pagina publica da comunidade
- Tocar "Ver todos" em Proximos/Passados -> abre AllEventsView
- Tocar "Ver todos" em Parceiros -> abre AllPartnersView
- Tocar na seta de voltar -> fecha e volta para a Home

**Estados especiais:**
- **Loading:** Skeleton pulsante
- **Cidade sem conteudo:** Texto "Nenhum conteudo para esta cidade ainda." centralizado (quando nao ha proximos, passados, nem parceiros)

---

## 7. FLUXO: Ver Todos os Parceiros (AllPartnersView)

**Ponto de partida:** Card "Ver todos" no carrossel de Locais Parceiros (Home ou CityView).

**Caminho completo:**
1. Toca em "Ver todos" nos Locais Parceiros
2. Overlay desliza da direita (z-index 160)

**O que o usuario ve:**
- Header com seta de voltar, titulo "Parceiros em [cidade]"
- Lista vertical de parceiros, cada um com:
  - Foto quadrada (48px, bordas arredondadas)
  - Nome do parceiro em bold
  - Tipo de comunidade (ex: "Bar", "Restaurante")
  - Endereco truncado (se disponivel)
- Infinite scroll (20 por vez)

**Acoes possiveis:**
- Scroll vertical (infinite scroll automatico)
- Tocar num parceiro -> abre pagina publica da comunidade
- Tocar na seta de voltar -> fecha o overlay

**Estados especiais:**
- **Loading:** Spinner dourado centralizado
- **Sem parceiros:** Texto "Nenhum parceiro nesta cidade" centralizado

---

## 8. FLUXO: Ver Todos os Beneficios MV (AllBeneficiosView)

**Ponto de partida:** Card "Ver todos" no carrossel de Beneficios MAIS VANTA na Home.

**Caminho completo:**
1. Toca em "Ver todos" nos Beneficios MAIS VANTA
2. Overlay desliza da direita (z-index 160)

**O que o usuario ve:**
- Header com seta de voltar, icone de coroa dourada, titulo "Beneficios em [cidade]"
- Grid de 2 colunas com EventCards de eventos que oferecem beneficios MV
- Infinite scroll (20 por vez)

**Acoes possiveis:**
- Scroll vertical (infinite scroll automatico)
- Tocar num EventCard -> abre detalhe do evento
- Tocar no logo da comunidade -> abre pagina publica
- Tocar na seta de voltar -> fecha o overlay

**Pre-requisito:** Requer ser membro MAIS VANTA com tier ativo. Se nao tiver tier, a tela de loading fica indefinida (pois `loadEvents` retorna sem carregar dados).

**Estados especiais:**
- **Loading:** Skeleton pulsante
- **Sem beneficios:** Texto "Nenhum beneficio disponivel nesta cidade" centralizado

---

## 9. FLUXO: Filtros na Home (HomeFilterOverlay)

**Ponto de partida:** Botao de engrenagem no titulo da secao "Proximos Eventos".

**Nota tecnica:** HomeFilterOverlay usa `<ModalPortal>` para renderizar no `#vanta-app` via React Portal. Isso garante que o overlay aparece centralizado na tela mesmo quando a Home esta scrollada.

**Caminho completo:**
1. Toca na engrenagem (Settings) ao lado de "Proximos Eventos"
2. Overlay centralizado abre com backdrop blur

**O que o usuario ve:**
- Modal glassmorphism centralizado (max 320px) com bordas arredondadas (2rem)
- **Header:** Titulo "Filtros" + contador de selecionados (dourado) + botao X
- **Duas tabs:**
  - "Tipo de Evento" (FORMATO) -- ex: Balada, Festival, Show, etc.
  - "Estilo Musical" (ESTILO) -- ex: Eletronica, Funk, Rock, Sertanejo, etc.
  - Cada tab mostra contador de itens selecionados
- **Grid de opcoes:** Tags em formato pill com toggle on/off. Ativo = fundo dourado + check. Inativo = fundo escuro
- **Footer:** Botao "Resetar" (limpar tudo) a esquerda + botao "Salvar (N)" a direita

**Como os filtros funcionam:**
- Formato e estilo sao dimensoes independentes. Se selecionar formato + estilo, aplica-se logica AND entre dimensoes e OR dentro de cada dimensao
- Os filtros sao **volateis** (nao persistem entre trocas de cidade; resetam automaticamente quando a cidade muda)
- Quando filtros estao ativos: o carrossel principal mostra so eventos filtrados; os sub-carrosseis por formato/estilo sao ocultados
- Chips dourados aparecem abaixo do titulo mostrando filtros ativos com X para remover individualmente
- Se filtros nao retornam resultados: mensagem com opcoes "Editar filtros" e "Ver todos" (reset)

**Acoes possiveis:**
- Trocar entre tabs Formato/Estilo
- Selecionar/desselecionar opcoes (toggle)
- Resetar todos os filtros
- Salvar e fechar
- Fechar sem salvar (backdrop ou X)

**Dados carregados:** Os formatos e estilos disponiveis sao carregados diretamente do Supabase, filtrados por cidade e apenas eventos ativos, publicados e futuros.

---

## Mapa de Navegacao Resumido

```
HOME (Tab INICIO)
  |
  |-- Header
  |     |-- [Foto perfil] -> Tab PERFIL (guest: modal login)
  |     |-- [Seletor cidade] -> CitySelector overlay
  |     |-- [Sino] -> NotificationPanel (guest: modal login)
  |     |-- [Escudo admin] -> Tab ADMIN_HUB (so com acesso)
  |
  |-- Saudacao (texto)
  |-- Banner Beneficios MV -> Perfil > CLUBE (so membros MV)
  |
  |-- Vanta Indica (Highlights)
  |     |-- [Tocar card] -> Evento / Comunidade / Comemorar / Tab / Link externo
  |
  |-- Proximos Eventos
  |     |-- [Engrenagem] -> HomeFilterOverlay
  |     |-- [EventCard] -> EventDetailView
  |     |-- [Logo comunidade] -> ComunidadePublicView
  |     |-- [Ver todos] -> AllEventsView
  |
  |-- VANTA Indica pra Voce (so logado + interesses)
  |     |-- [EventCard] -> EventDetailView
  |     |-- [DealCard] -> (visual, sem acao de navegacao)
  |     |-- [Ver todos] -> Tab BUSCAR
  |
  |-- Mais Vendidos 24h
  |     |-- [EventCard] -> EventDetailView
  |
  |-- Locais Parceiros
  |     |-- [PartnerCard] -> ComunidadePublicView
  |     |-- [Ver todos] -> AllPartnersView
  |
  |-- Descubra Cidades
  |     |-- [CityCard] -> CityView
  |           |-- [EventCard] -> EventDetailView
  |           |-- [Ver todos eventos] -> AllEventsView
  |           |-- [PartnerCard] -> ComunidadePublicView
  |           |-- [Ver todos parceiros] -> AllPartnersView
  |
  |-- Beneficios MAIS VANTA (so membros MV)
        |-- [EventCard] -> EventDetailView
        |-- [Ver todos] -> AllBeneficiosView

TabBar: Inicio | Radar | Buscar | Mensagens (guest: bloq) | Perfil (guest: bloq)
```

---

## Comportamento de Empilhamento de Views

As views de detalhe empilham sobre a Home usando z-index crescente:

| Camada | z-index | View |
|---|---|---|
| Base | -- | HomeView (dentro da tab INICIO) |
| Overlay 1 | 100 | CitySelector |
| Overlay 2 | 120 | NotificationPanel |
| Overlay 3 | 160 | AllEventsView / AllPartnersView / AllBeneficiosView |
| Overlay 4 | 170 | CityView |
| Overlay 5 | 180 | ComunidadePublicView |
| Overlay 6 | 200 | HomeFilterOverlay (via ModalPortal) / Perfil publico de membro |

HomeFilterOverlay usa `<ModalPortal>` para renderizar no `#vanta-app` em vez de dentro do scroll da Home.

Todas as views overlay deslizam da direita com animacao (`slide-in-from-right`). O botao voltar em cada view fecha apenas aquela camada e retorna a camada anterior.

---

## Parte 2 -- Eventos e Compra de Ingressos

## Indice de Fluxos

1. [Ver Detalhe do Evento](#1-ver-detalhe-do-evento)
2. [Comprar Ingresso (Checkout Completo)](#2-comprar-ingresso)
3. [Checkout com CPF / Telefone](#3-checkout-com-cpf--telefone)
4. [Lista de Espera](#4-lista-de-espera)
5. [Evento Esgotado](#5-evento-esgotado)
6. [Evento ao Vivo / Comecando em Breve](#6-evento-ao-vivo--badges-de-urgencia)
7. [Favoritar Evento](#7-favoritar-evento)
8. [Confirmar Presenca](#8-confirmar-presenca)
9. [Convidar Amigos](#9-convidar-amigos)
10. [Ver Beneficios MAIS VANTA no Evento](#10-beneficios-mais-vanta-no-evento)
11. [Avaliar Evento](#11-avaliar-evento)
12. [Denunciar Evento](#12-denunciar-evento)
13. [Landing Page do Evento](#13-landing-page-do-evento)
14. [Deep Link de Evento](#14-deep-link-de-evento)

---

## 1. Ver Detalhe do Evento

**Ponto de partida:** Qualquer tela que exiba um card de evento (Home, Explorar, Radar, Busca, Comunidade, perfil de membro). O usuario toca no `EventCard`.

**Caminho:** Card do evento --> `openEventDetail(evento)` --> Navegacao para `/app/evento/:slug` --> `EventDetailView` renderiza como overlay full-screen.

**O que o usuario ve (de cima para baixo):**

### EventHeader (hero)
- Imagem do evento em aspecto 4:5 (ate 70vh), com gradiente escuro cobrindo do topo ao fundo.
- **Barra superior** com 3-4 botoes circulares com fundo de vidro (backdrop-blur):
  - **Voltar** (seta esquerda) -- volta a tela anterior.
  - **Favoritar** (coracao) -- dourado `#FFD300` quando favoritado, branco vazio quando nao.
  - **Compartilhar** (icone share) -- aciona `navigator.share()` ou copia link `maisvanta.com/event/:id`.
  - **Denunciar** (bandeira) -- abre `ReportModal`.
- **Sobre a imagem, na parte inferior:** badge com formato/categoria do evento (dourado), titulo em fonte Playfair Display (ate 2 linhas com `line-clamp-2`).

### Corpo (scroll vertical)
O conteudo principal sobe sobre a imagem com borda arredondada (`rounded-t-[2rem]`, `-mt-8`):

1. **EventSocialProof** -- mostra quem vai:
   - Avatares empilhados (ate 3, com `+N` se houver mais).
   - Amigos destacados em dourado: "Joao e +2 amigos e mais 45 pessoas vao".
   - Se ninguem confirmou, componente nao renderiza.
   - Ao tocar, abre **lista completa de confirmados** (fullscreen overlay com busca, amigos primeiro).

2. **Badges de urgencia** (condicionais):
   - `>80% vendido`: badge vermelho "Ultimos ingressos" com icone AlertTriangle.
   - Lote com data de validade: badge ambar com countdown "Lote encerra em Xh Ymin".

3. **Classificacao etaria** (se nao for LIVRE): badge ambar ex: "+18".

4. **EventInfo** -- informacoes estruturadas:
   - **Data/Horario** -- inicio e termino, com icone de calendario dourado.
   - **Comunidade** -- nome clicavel (abre detalhe da comunidade) com icone ExternalLink.
   - **Endereco** -- clicavel, abre Google Maps.
   - **Dress Code** (se definido).
   - **Line-up** (se definido) -- lista de artistas com icone de nota musical.

5. **Descricao** -- texto "Sobre o Evento".

6. **Botao "Comemorar aqui"** (se evento futuro e tem comunidade) -- abre `ComemoracaoFormView`.

7. **Secao MAIS VANTA** (se evento tem beneficios MV e nao passou):
   - Varios estados possiveis (ver Fluxo 10).

8. **Avaliacoes** (so para eventos passados):
   - Estrelas com media e contagem.
   - Botao "Avaliar Evento" (se usuario tem ingresso).

### EventFooter (fixo no bottom)
- **Lado esquerdo:** preco minimo ("A partir de R$ XX,XX" ou "Entrada VIP" ou "Sob Consulta"), badge "Ultimas vagas" se >80% vendido.
- **Lado direito:** botoes variando conforme estado:
  - **Usuario JA tem ingresso:** botao "Eu vou!" (ou "Confirmado" se ja confirmou) + botao verde "Garantido".
  - **Evento GRATUITO:** botao dourado "Eu vou!" (ou "Confirmado").
  - **Evento PAGO:** botao "Eu vou!" (outline) + botao dourado "Garantir Ingresso" (ou "Comprar Fora" se `urlIngressos`).
  - Se membro MAIS VANTA com beneficio elegivel: badge expansivel "Voce tem beneficio" com chevron.

**Estados especiais:**
- **Loading:** spinner central (Loader2 animado).
- **Guest:** ao clicar "Eu vou!", `onConfirmarPresenca` retorna `false` (gatekeeper bloqueia, redireciona para login).
- **Evento passado:** secao de avaliacoes aparece; botoes de acao de compra podem desaparecer.

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (656 linhas)
- `/Users/vanta/prevanta/modules/event-detail/components/EventHeader.tsx`
- `/Users/vanta/prevanta/modules/event-detail/components/EventInfo.tsx`
- `/Users/vanta/prevanta/modules/event-detail/components/EventFooter.tsx`
- `/Users/vanta/prevanta/modules/event-detail/components/EventSocialProof.tsx`

---

## 2. Comprar Ingresso

**Ponto de partida:** Botao "Garantir Ingresso" no `EventFooter` do detalhe do evento.

**Caminho completo:**

### Etapa 1 -- Detalhe do evento
Usuario toca "Garantir Ingresso". Dois caminhos possiveis:
- Se `evento.urlIngressos` existe: abre URL externa em nova aba. **FIM.**
- Se nao: chama `openCheckoutUrl(evento.id)` que navega para `/checkout/:eventoId` (abre em nova aba/janela).

### Etapa 2 -- CheckoutPage (Step: `select`)
**Tela fullscreen** com fundo `#0A0A0A`:

1. **Hero** -- imagem do evento (aspect 21:9, opacidade 60%), com botao X para fechar.
2. **Info** -- formato, titulo, data/horario/local.
3. **Selecao de ingressos** -- para cada variacao:
   - Label: "Area . Genero" (ex: "Pista . Fem.").
   - Preco em destaque (dourado se selecionado, cinza se nao).
   - **Stepper** (+/-) para quantidade (0 a 10, limitado pelo estoque).
   - **Badge "Meia"** se requer comprovante (bloqueado se usuario nao tem comprovante).
   - **Badge "Esgotado"** + botao "Fila" para lista de espera.
   - **Badge "Faltam N ingressos!"** se <= 20% restante.
   - **Badge "Early Bird"** se lote atual e o primeiro.
   - **Badge "Ultimo lote"** se lote atual e o ultimo.
   - Se desconto MV aplicavel: preco riscado + preco com desconto.

4. **Acompanhantes** -- se >= 2 ingressos selecionados, campos para nome de cada ingresso.

5. **Mesas** (se habilitado) -- planta interativa com pinos clicaveis, popup com info da mesa.

6. **Cupom** -- expandivel "Tem um codigo?", campo + botao "Aplicar", badge verde quando aplicado. Auto-aplica se `?cupom=XXX` na URL.

7. **Footer** -- Total com descontos discriminados + botao "Continuar (N)" gradiente roxo-rosa.

8. **Aviso de cancelamento** -- se `?cancelado=true`, banner ambar "Pagamento cancelado. Nenhum valor foi cobrado."

### Etapa 3 -- Login (Step: `login`)
**Bottom sheet** animado:
- Titulo "Entrar com sua conta VANTA".
- Resumo da sacola (N ingressos, R$ total).
- Campos email e senha.
- Botao dourado "Garantir N ingresso(s)".
- Mensagem de erro em vermelho se credenciais invalidas.

### Etapa 4a -- Fluxo Gratuito (total = 0)
Se o total apos descontos e zero:
- RPC `processar_compra_checkout` e chamada diretamente (sem Stripe).
- Gera tickets com QR codes.
- Navega para Step: `success` --> `SuccessScreen`.

### Etapa 4b -- Fluxo Pago (total > 0)
- Edge Function `create-ticket-checkout` e invocada.
- Retorna URL do Stripe Checkout.
- `window.location.href` redireciona para Stripe.
- Apos pagamento, Stripe redireciona para `/checkout/sucesso?pedido_id=XXX`.

### Etapa 5a -- SuccessScreen (fluxo gratuito)
- Confete animado (40 pecas caindo).
- Icone Sparkles dourado, "Presenca garantida!".
- Lista de ingressos com QR Code visual + codigo.
- Botao "Compartilhar".
- Botao "Ver meu ingresso" (fecha janela).

### Etapa 5b -- CheckoutSuccessPage (fluxo pago, via Stripe)
- **Polling** -- spinner + "Confirmando pagamento..." (poll a cada 2s, max 15 tentativas = 30s).
- **Confirmado** -- icone check verde, "Ingresso Confirmado!" (ou "N Ingressos Confirmados!"), nome do evento, "Seus ingressos ja aparecem na Carteira do App", botoes "Compartilhar" e "Voltar ao App".
- **Erro** -- icone triangulo ambar, "Erro no pagamento", "Nenhum valor foi cobrado", botao "Voltar ao App".
- **Timeout** -- "Processamento demorado", mensagem tranquilizadora.
- Ao confirmar, envia `BroadcastChannel('vanta_tickets')` com `VANTA_TICKET_PURCHASED` para o app principal atualizar a carteira.

**Arquivos:**
- `/Users/vanta/prevanta/modules/checkout/CheckoutPage.tsx` (1108 linhas)
- `/Users/vanta/prevanta/modules/checkout/SuccessScreen.tsx`
- `/Users/vanta/prevanta/modules/checkout/CheckoutSuccessPage.tsx`

---

## 3. Checkout com CPF / Telefone

**Ponto de partida:** Apos login no CheckoutPage, se o perfil do usuario nao tem CPF ou telefone cadastrado.

**Caminho:**

### CPF faltando
1. Usuario faz login no checkout.
2. Sistema consulta `profiles` e detecta `cpf` nulo.
3. `CompletarPerfilCPF` abre como modal central.
4. **O que o usuario ve:**
   - Titulo "Informe seu CPF", subtitulo "Dados para compra".
   - Explicacao de seguranca.
   - Campo CPF com mascara `000.000.000-00`, input numerico.
   - Botoes "Voltar" e "Confirmar".
5. **Validacao:** formato CPF (algoritmo real via `isValidCPF`). Erro se invalido ou duplicado (codigo 23505).
6. **Sucesso:** salva CPF no `profiles`, atualiza `authStore`, fecha modal, continua `processarCompra`.

### Telefone faltando (apos CPF ok)
1. Se `telefone_ddd` ou `telefone_numero` estao vazios.
2. Modal simples com campos DDD (2 digitos) e numero (8-9 digitos).
3. Botoes "Cancelar" e "Confirmar".
4. Salva no `profiles`, fecha modal, continua `processarCompra`.

**Arquivos:**
- `/Users/vanta/prevanta/components/CompletarPerfilCPF.tsx`
- `/Users/vanta/prevanta/modules/checkout/CheckoutPage.tsx` (linhas 1027-1105)

---

## 4. Lista de Espera

**Ponto de partida:** CheckoutPage, variacao esgotada -- botao "Fila" com icone sino.

**Caminho:**
1. Usuario toca botao "Fila" ao lado de uma variacao esgotada.
2. `WaitlistModal` abre como bottom sheet.

**O que o usuario ve:**
- Titulo "Lista de Espera" / "Entrar na fila".
- Mensagem "Voce sera notificado quando uma vaga abrir."
- Campo de email.
- Botao gradiente ambar-laranja "Entrar na fila" (ou "Registrando...").

**Acoes:**
- Preencher email e tocar "Entrar na fila".
- `waitlistService.entrar()` e chamado.
- **Sucesso:** modal fecha, badge muda de "Esgotado" para "Na fila" (icone sino com texto ambar).
- **Fechar:** tocar fora do modal ou backdrop.

**Arquivos:**
- `/Users/vanta/prevanta/modules/checkout/WaitlistModal.tsx`

---

## 5. Evento Esgotado

**O que o usuario ve no EventCard (Home/Explorar):**
- Se `percentVendido >= 100`: card mostra badge "Esgotado".
- Se `percentVendido >= 80 e < 100`: badge "Ultimas vagas".

**O que o usuario ve no EventDetailView:**
- Badge vermelho "Ultimos ingressos" se >80% vendido (acima do EventInfo).

**O que o usuario ve no CheckoutPage:**
- Variacao esgotada: card esmaecido (opacity 40%), texto vermelho "Esgotado", stepper desaparece, botao "Fila" aparece.
- Se TODAS as variacoes esgotaram: usuario nao consegue selecionar nada, botao "Continuar" fica desabilitado (opacity 30%).

**Arquivos:**
- `/Users/vanta/prevanta/components/EventCard.tsx` (linhas 102-103)
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 289-298)
- `/Users/vanta/prevanta/modules/checkout/CheckoutPage.tsx` (linhas 652-728)

---

## 6. Evento ao Vivo / Badges de Urgencia

O sistema calcula status baseado em datas. No `EventDetailView`:

**Badges condicionais (entre SocialProof e EventInfo):**
- **"Ultimos ingressos"** -- badge vermelho com AlertTriangle, aparece se `percentVendido > 80`.
- **Countdown de lote** -- badge ambar "Lote encerra em Xh Ymin", atualiza a cada 60s.

No `EventFooter`:
- **"Ultimas vagas"** -- texto vermelho pequeno abaixo do preco, se `capacityPct >= 80` e usuario nao tem ingresso.

Na `EventLandingPage`:
- Status calculado: `ao_vivo` (inicio <= agora < fim), `futuro`, `encerrado`.
- Se `encerrado`: secao de ingressos mostra "Evento encerrado" em vez dos cards de compra.

No `CheckoutPage`:
- **"Early Bird"** -- badge verde se lote ativo e o primeiro.
- **"Ultimo lote"** -- badge vermelho se lote ativo e o ultimo.

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 192-224, 289-306)
- `/Users/vanta/prevanta/modules/landing/EventLandingPage.tsx` (linhas 141-149)
- `/Users/vanta/prevanta/modules/checkout/CheckoutPage.tsx` (linhas 636-649)

---

## 7. Favoritar Evento

**Ponto de partida:** Botao de coracao no `EventHeader` do detalhe do evento.

**Caminho:**
1. Usuario toca icone de coracao (canto superior direito da foto).
2. `toggleFavorito(evento.id)` do `extrasStore` e chamado.
3. Store atualiza `savedEvents` (adiciona ou remove ID).
4. Servico `favoritosService` persiste no Supabase (tabela de favoritos).

**O que o usuario ve:**
- **Nao favoritado:** coracao vazio, cor branca.
- **Favoritado:** coracao preenchido, cor dourada `#FFD300`.
- Toggle instantaneo (otimista, sem loading).

**Onde os favoritos aparecem depois:**
- A lista `savedEvents` fica no `extrasStore`. Atualmente nao ha uma tela dedicada "Eventos Salvos" visivel no codigo investigado -- os IDs sao armazenados mas a secao de exibicao foi deprecada (`_deprecated/SavedEventsSection.tsx`).

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/components/EventHeader.tsx` (linhas 66-77)
- `/Users/vanta/prevanta/stores/extrasStore.ts` (linhas 81-89)

---

## 8. Confirmar Presenca

**Ponto de partida:** Botao "Eu vou!" no `EventFooter`.

**Caminho:**
1. Usuario toca "Eu vou!".
2. `handlePresencaClick` verifica se usuario e guest (gatekeeper). Se guest, bloqueia.
3. `onConfirmarPresenca(evento)` e chamado (registra presenca no store/banco).
4. `PresencaConfirmationModal` abre.

**O que o usuario ve:**
- Modal centralizado com bordas arredondadas e brilho dourado.
- Icone check dourado grande (com glow).
- Titulo "Eu vou!".
- Texto "Voce confirmou presenca no evento **[titulo]**. Que tal chamar seus amigos para irem tambem?"
- 3 botoes:
  1. **"Copiar Link"** -- copia texto com link do evento para clipboard. Muda para "Copiado" por 1.5s.
  2. **"Convidar Amigos VANTA"** -- fecha este modal e abre `InviteFriendsModal`.
  3. **"Sair"** -- fecha modal.
- Botao X no canto superior direito.

**Apos confirmacao:**
- Botao no footer muda de "Eu vou!" para "Confirmado" (desabilitado, fundo cinza).
- `membrosConfirmados` do evento incrementa.
- O usuario aparece na lista de confirmados (SocialProof).

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/components/PresencaConfirmationModal.tsx`
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 226-229, 506-515)

---

## 9. Convidar Amigos

**Ponto de partida:** Botao "Convidar Amigos VANTA" no `PresencaConfirmationModal`.

**Caminho:**
1. Modal de presenca fecha.
2. `InviteFriendsModal` abre (fullscreen overlay, slide-in-from-bottom).

**O que o usuario ve:**
- Header: "Convidar Amigos" + "Selecione quem vai com voce" + botao X.
- Campo de busca com icone de lupa.
- Lista de amigos mutuos (`mutualFriends` do `socialStore`):
  - Avatar, nome, @handle.
  - Circulo de selecao (dourado quando selecionado).
- **Estado vazio:** "Nenhum amigo encontrado."
- Footer fixo: botao dourado "Enviar Convites (N)" (desabilitado se ninguem selecionado).

**Acao de envio:**
- `onSendInvite(friendIds)` envia mensagem via chat para cada amigo selecionado.
- Mensagem: "[Nome] confirmou presenca em [Titulo]! Que tal ir junto? [link]".
- Toast de sucesso: "N convite(s) enviado(s) com sucesso!".

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/components/InviteFriendsModal.tsx`
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 251-257, 517-523)

---

## 10. Beneficios MAIS VANTA no Evento

**Ponto de partida:** Secao MAIS VANTA no corpo do `EventDetailView` (aparece se o evento tem beneficios configurados e nao e passado).

**Estados possiveis (mutuamente exclusivos):**

| Estado | O que aparece |
|--------|---------------|
| **Nao e membro** | Texto "Membros ganham beneficios exclusivos neste evento" + botao dourado "Quero meus beneficios" (navega para pagina do clube). |
| **Membro bloqueado** | Badge vermelho "Voce esta temporariamente bloqueado". |
| **Membro com divida social** | Badge vermelho "Poste o conteudo pendente antes de fazer novas reservas". |
| **Sem beneficio para o tier** | Badge cinza "Este evento nao oferece beneficio para o seu perfil". |
| **Passaporte pendente** | Badge roxo "Seu passaporte para esta cidade esta em analise". |
| **Precisa de passaporte** | Badge roxo "Voce precisa de acesso nesta cidade" + botao "Solicitar Acesso Nesta Cidade". |
| **Vagas esgotadas** | Badge ambar "Vagas esgotadas para este perfil" + botao "Comprar ingresso normal". |
| **Elegivel** | Info do beneficio (label, desconto%, vagas restantes) + botao dourado "Resgatar Beneficio". |

**Fluxo de resgate (botao "Resgatar Beneficio"):**
1. Abre `MaisVantaBeneficioModal` (bottom sheet).
2. **O que o usuario ve:**
   - Titulo "Resgatar Beneficio" com icone coroa dourada.
   - Card com nome do evento, label do beneficio, desconto se aplicavel.
   - **Contrapartida obrigatoria** (box ambar):
     - Hashtags obrigatorias (#MaisVanta etc).
     - Mencoes obrigatorias (@venue, @maisvanta).
     - Prazo para postagem.
     - Aviso: "No-show ou nao postou = infracao (bloqueio progressivo)".
   - Link "Ver termos completos do MAIS VANTA" (abre sub-modal de termos).
   - Checkbox de aceite obrigatorio.
   - Botao "Confirmar Resgate" (desabilitado ate aceitar).
3. **Apos confirmar:** `clubeService.resgatarBeneficio()`, toast de sucesso ou erro, modal fecha.

**Desconto no footer:**
- Se membro com beneficio elegivel (tipo nao-desconto) e vagas disponiveis: badge "Voce tem beneficio" no footer, clicavel, expande detalhes.
- Se tier `lista` com desconto: desconto aplicado diretamente no preco do checkout (sem badge visual no detalhe).

**Arquivos:**
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 337-453)
- `/Users/vanta/prevanta/modules/event-detail/components/MaisVantaBeneficioModal.tsx` (195 linhas)
- `/Users/vanta/prevanta/modules/event-detail/components/EventFooter.tsx` (linhas 103-118)

---

## 11. Avaliar Evento

**Ponto de partida:** Botao "Avaliar Evento" na secao de avaliacoes do `EventDetailView` (so para eventos passados, so se usuario tem ingresso).

**Caminho:**
1. Usuario toca "Avaliar Evento".
2. `ReviewModal` abre como bottom sheet.

**O que o usuario ve:**
- Header "Avaliar Evento" com nome do evento.
- 5 estrelas interativas (touch/hover) com labels: Pessimo, Ruim, Regular, Bom, Excelente.
- Campo de comentario opcional (textarea, max 500 caracteres).
- Botao "Enviar Avaliacao" (desabilitado se 0 estrelas).

**Comportamento:**
- Carrega review existente do usuario (se ja avaliou antes, preenche nota e comentario).
- Ao enviar: `reviewsService.submit()`, tela muda para "Avaliacao enviada! Obrigado pelo feedback", fecha apos 1.2s.
- Ao fechar, atualiza media de avaliacoes na tela de detalhe.

**Arquivos:**
- `/Users/vanta/prevanta/components/ReviewModal.tsx`
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 456-491, 622-632)

---

## 12. Denunciar Evento

**Ponto de partida:** Icone de bandeira no `EventHeader` (canto superior direito).

**Caminho:**
1. Usuario toca icone de bandeira.
2. `ReportModal` abre como modal centralizado (renderizado via portal no `app-root`).

**O que o usuario ve:**
- Header "Denunciar evento" com icone bandeira vermelha + botao X.
- Nome do evento em destaque.
- **5 motivos** selecionaveis (radio visual):
  - Conteudo ofensivo ou inadequado
  - Spam ou propaganda
  - Perfil falso ou golpe
  - Assedio ou ameaca
  - Outro motivo
- Se "Outro" selecionado: textarea "Descreva o motivo..." (max 500).
- Para tipo EVENTO, opcao "Bloquear usuario" **nao aparece** (so aparece para tipo USUARIO/CHAT).
- Botoes "Cancelar" e "Denunciar" (vermelho, desabilitado ate selecionar motivo).

**Apos envio:**
- `criarDenuncia()` com tipo `EVENTO`, `alvoEventoId`.
- Toast de sucesso/erro via `globalToast`.
- Modal fecha e reseta estado.

**Arquivos:**
- `/Users/vanta/prevanta/components/ReportModal.tsx` (186 linhas)
- `/Users/vanta/prevanta/modules/event-detail/EventDetailView.tsx` (linhas 646-653)

---

## 13. Landing Page do Evento

**Ponto de partida:** URL publica `/evento/:slug` (acessada de fora do app -- compartilhamento, redes sociais, Google).

**Rota:** `<Route path="/evento/:slug" element={<EventLandingPage />} />`

**O que o usuario ve:**

1. **Hero** -- foto do evento (16:9, max 25rem), com gradiente de overlay escuro.
   - Logo/foto da comunidade + nome.
   - Titulo do evento em fonte grande.
   - Data/hora e local.
   - Metatags OpenGraph configuradas (`og:title`, `og:description`, `og:image`, `og:url`).

2. **Descricao** -- texto "Sobre o evento".

3. **Ingressos** -- para cada lote/variacao:
   - Label, preco (dourado), restantes.
   - Botao "Comprar" (redireciona para `/checkout/:eventoId?ref=XXX&variacao=YYY`).
   - Se esgotado: botao cinza "Esgotado" (desabilitado).
   - Se evento encerrado: texto "Evento encerrado" (sem cards de compra).

4. **Local** -- nome, endereco, cidade.

5. **Footer** -- "Powered by VANTA".

**Estados especiais:**
- **Loading:** spinner dourado centralizado.
- **Nao encontrado:** icone Ticket cinza + "Evento nao encontrado" + link "Voltar ao inicio".
- **Ref do promoter:** se `?ref=XXX` na URL, salva em `localStorage('vanta_promoter_ref')` para tracking de vendas.

**Arquivos:**
- `/Users/vanta/prevanta/modules/landing/EventLandingPage.tsx` (318 linhas)

---

## 14. Deep Link de Evento

**Ponto de partida:** Link compartilhado (ex: `https://maisvanta.com/event/abc123` ou `https://maisvanta.com/evento/abc123`) aberto em dispositivo com o app instalado.

**Como funciona:**

1. **Capacitor listener:** `CapApp.addListener('appUrlOpen', ...)` captura a URL no app nativo.
2. **Parse:** `parseDeepLink(url)` identifica o tipo:
   - `/event/:slug` ou `/evento/:id` --> `{ type: 'EVENT', id: 'abc123' }`
   - `/checkout/:eventoId` --> `{ type: 'CHECKOUT', id: '...' }`
   - `/checkout/sucesso` --> `{ type: 'WALLET' }`
   - `/convite-socio/:eventoId/:socioId` --> `{ type: 'CONVITE_SOCIO', ... }`
3. **Navegacao:** callback `onDeepLink` no App.tsx recebe o resultado e navega para a tela correspondente.

**Na web (sem Capacitor):**
- O listener nao e registrado (`isNativePlatform()` retorna false).
- URLs sao resolvidas diretamente pelo React Router:
  - `/evento/:slug` --> `EventLandingPage`
  - `/checkout/:slug` --> `CheckoutPage`
  - `/checkout/sucesso` --> `CheckoutSuccessPage`

**URLs de compartilhamento geradas pelo app:**
- EventHeader share: `https://maisvanta.com/event/${evento.id}`
- PresencaConfirmationModal: `https://maisvanta.com/event/${evento.id}`
- SuccessScreen share: `https://maisvanta.com/event/${eventoId}`
- CheckoutSuccessPage share: `https://maisvanta.com/e/${eventoId}`

**Arquivos:**
- `/Users/vanta/prevanta/services/deepLinkService.ts`
- `/Users/vanta/prevanta/hooks/useNavigation.ts` (linhas 91-108)

---

## Mapa de Arquivos Completo

| Arquivo | Linhas | Funcao |
|---------|--------|--------|
| `modules/event-detail/EventDetailView.tsx` | 656 | Orquestrador principal do detalhe |
| `modules/event-detail/components/EventHeader.tsx` | 111 | Hero com imagem, botoes de acao |
| `modules/event-detail/components/EventInfo.tsx` | 122 | Data, local, dress code, lineup |
| `modules/event-detail/components/EventFooter.tsx` | 125 | Preco + botoes de compra/presenca |
| `modules/event-detail/components/EventSocialProof.tsx` | 337 | Quem vai, lista de confirmados |
| `modules/event-detail/components/PresencaConfirmationModal.tsx` | 85 | Modal "Eu vou!" |
| `modules/event-detail/components/InviteFriendsModal.tsx` | 127 | Selecao e envio de convites |
| `modules/event-detail/components/MaisVantaBeneficioModal.tsx` | 195 | Resgate de beneficio MV |
| `modules/checkout/CheckoutPage.tsx` | 1108 | Checkout completo (selecao, login, compra) |
| `modules/checkout/SuccessScreen.tsx` | 160 | Tela de sucesso (fluxo gratuito) |
| `modules/checkout/CheckoutSuccessPage.tsx` | 196 | Tela de sucesso (fluxo pago/Stripe) |
| `modules/checkout/WaitlistModal.tsx` | 62 | Lista de espera |
| `modules/landing/EventLandingPage.tsx` | 318 | Landing publica SEO |
| `components/CompletarPerfilCPF.tsx` | 106 | Modal de CPF progressivo |
| `components/ReviewModal.tsx` | 130 | Avaliacao com estrelas |
| `components/ReportModal.tsx` | 186 | Denuncia com motivos |
| `components/EventCard.tsx` | ~110 | Card de evento (home/explorar) |
| `services/deepLinkService.ts` | 69 | Parse e listener de deep links |
| `hooks/useNavigation.ts` | ~230 | Navegacao interna do app |
| `stores/extrasStore.ts` | ~140 | Favoritos, presencas |

---

## Parte 3 -- Autenticacao, Busca, Radar e Comunidade

## 1. AUTENTICACAO

---

### 1.1 Criar Conta (AuthModal)

**Ponto de partida:** Botao "Criar Conta" na tela de login, ou botao "Criar Conta" no GuestAreaModal, ou link direto via AceitarConviteMVPage.

**Caminho completo:**
1. Usuario abre o AuthModal (fullscreen, animacao slide-in-from-bottom)
2. Ve fundo com foto + efeito Ken Burns + glow dourado
3. Titulo "Criar Conta" + subtitulo "A noite da sua cidade num so lugar"

**O que o usuario ve:**
- Botao "Entrar com Apple" (branco)
- Botao "Entrar com Google" (zinc-800)
- Separador "ou crie com e-mail"
- Campo Nome (validacao: sem numeros, sem caracteres especiais)
- Campo E-mail (validacao: formato email)
- Campo Senha (com toggle mostrar/ocultar, min 6 caracteres)
- Campo Data de Nascimento (formato DD/MM/AAAA, inputMode numeric, min 16 anos)
- Checkbox LGPD: "Li e aceito os Termos de Uso e a Politica de Privacidade"
  - Links "Termos de Uso" e "Politica de Privacidade" abrem LegalView (overlay in-app)
- Botao "Cadastrar" no rodape

**Acoes possiveis:**
- Preencher formulario e clicar "Cadastrar"
- Login social (Apple/Google) via `authService.signInWithSocial()`
- Ler Termos de Uso / Politica de Privacidade
- Voltar (botao ArrowLeft no header)

**Onde termina:** `onSuccess(membro)` -- leva ao OnboardingView (se perfil novo) ou direto a Home.

**Estados especiais:**
- Rate limiting: apos 10 falhas, bloqueio de 5 minutos com countdown visivel
- Erros de validacao por campo (FieldError component)
- Erro global ("Erro ao criar conta")

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/AuthModal.tsx`
- `/Users/vanta/prevanta/components/auth/authHelpers.ts`
- `/Users/vanta/prevanta/components/auth/FieldError.tsx`
- `/Users/vanta/prevanta/components/LegalView.tsx`
- `/Users/vanta/prevanta/services/authService.ts`

---

### 1.2 Login (LoginView)

**Ponto de partida:** Abertura do app (se nao logado), botao "Ja tenho conta" no GuestAreaModal, ou botao "Entrar novamente" no SessionExpiredModal.

**Caminho completo:**
1. Tela fullscreen com foto de fundo + Ken Burns
2. Logo "VANTA" central + subtitulo "lifestyle e acesso"
3. Card de login na parte inferior (glass morphism)

**O que o usuario ve:**
- Botao "Entrar com Apple" (branco)
- Botao "Entrar com Google" (zinc-800)
- Separador "ou"
- Campo E-mail
- Campo Senha (com toggle mostrar/ocultar)
- Link "Esqueci minha senha" (abre modo recuperacao inline)
- Botao "Entrar"
- Botao "Criar Conta"
- Botao X (fechar, com confirmacao "Tem certeza?")

**Acoes possiveis:**
- Login com email/senha
- Login social (Apple/Google)
- Recuperar senha (modo inline)
- Criar conta (navega para AuthModal)
- Fechar (com modal de confirmacao se onClose esta disponivel)

**Modo Recuperacao de Senha (inline):**
1. Titulo "Recuperar senha"
2. Campo e-mail
3. Botao "Enviar link de recuperacao"
4. Apos envio: tela de sucesso com check verde + "Link enviado!"
5. Botao "Voltar ao login"

**Onde termina:** `onSuccess(membro)` -- leva ao fluxo principal.

**Estados especiais:**
- Rate limiting client-side:
  - 5+ falhas: bloqueio de 30 segundos
  - 10+ falhas: bloqueio de 5 minutos
  - Indicador visual com cadeado + countdown "Bloqueado por Xs"
- Reset do contador em login bem-sucedido

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/LoginView.tsx`
- `/Users/vanta/prevanta/services/authService.ts`

---

### 1.3 Onboarding Pos-Cadastro (OnboardingView)

**Ponto de partida:** Apos criar conta com sucesso (exibido via AppModals quando `showOnboarding = true`).

**Caminho completo (3 steps com indicador de progresso):**

**Step 1 -- Cidade:**
1. Titulo: "Onde voce curte a noite?"
2. Subtitulo: "Pra mostrar o que ta rolando perto de voce"
3. Campo de busca com cidades (API IBGE + fallback brData)
4. Autocomplete com ate 15 resultados (digitar 2+ caracteres)
5. Ao selecionar: card de confirmacao com icone MapPin
6. Botao "Continuar" (habilitado so com cidade selecionada)
7. Salva no Supabase: `profiles.estado` e `profiles.cidade`

**Step 2 -- Interesses:**
1. Titulo: "O que te move?"
2. Subtitulo: "Quanto mais a gente sabe, melhor fica"
3. Lista de 19 generos musicais como chips selecionaveis (Funk, Sertanejo, Eletronica, Pop, Rock, Pagode, Forro, Hip Hop/Rap, Reggaeton, MPB, Jazz, R&B, Trap, Techno, House, Indie, Axe, Brega Funk, Outro)
4. Botao "Pular" no canto superior direito
5. Contador de selecionados
6. Botao "Continuar"
7. Salva no Supabase: `profiles.interesses`

**Step 3 -- Boas-vindas:**
1. Glow dourado pulsante
2. Titulo: "Pronto, {firstName}."
3. Subtitulo: "Sua noite comeca aqui."
4. Botao "Explorar" -- finaliza onboarding

**Onde termina:** `onComplete()` -- leva a Home.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/OnboardingView.tsx`
- `/Users/vanta/prevanta/data/brData.ts`

---

### 1.4 Completar Perfil Social (CompletarPerfilSocial)

**Ponto de partida:** Login social (Apple/Google) quando `profile.data_nascimento` e NULL.

**Caminho completo:**
1. Titulo: "Bem-vindo, {firstName}!"
2. Subtitulo: "So precisamos de mais uma informacao pra completar seu perfil."
3. Campo "Data de nascimento" (DD/MM/AAAA, inputMode numeric)
4. Checkbox LGPD: "Li e aceito os Termos de Uso e a Politica de Privacidade"
5. Botao "Continuar"

**Validacoes:**
- Data valida (formato DD/MM/AAAA)
- Idade minima: 16 anos
- Termos aceitos obrigatoriamente

**Acoes ao submeter:**
- Atualiza `profiles.data_nascimento` no Supabase
- Registra consentimento LGPD via `legalService.registrarConsentimento()` (termos_uso + politica_privacidade)

**Onde termina:** `onComplete()` -- segue para OnboardingView ou Home.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/CompletarPerfilSocial.tsx`
- `/Users/vanta/prevanta/components/auth/authHelpers.ts`
- `/Users/vanta/prevanta/features/admin/services/legalService.ts`

---

### 1.5 Resetar Senha (ResetPasswordView)

**Ponto de partida:** Usuario clica no link enviado por email (rota `?reset=1`). O app detecta o token de recuperacao no Supabase Auth e exibe esta tela.

**Caminho completo:**
1. Icone de cadeado dourado
2. Titulo: "Nova Senha"
3. Subtitulo: "Defina sua nova senha para acessar o VANTA."
4. Campo "Nova senha" (com toggle mostrar/ocultar)
5. Campo "Confirmar nova senha"
6. Botao "Redefinir Senha"

**Validacoes:**
- Minimo 6 caracteres
- Senhas devem coincidir

**Onde termina:** Tela de sucesso (check dourado + "Senha redefinida!"), redireciona automaticamente apos 2 segundos via `onComplete()`.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/ResetPasswordView.tsx`

---

### 1.6 Sessao Expirada (SessionExpiredModal)

**Ponto de partida:** Evento `vanta:session-expired` disparado pelo `authService` quando a sessao expira involuntariamente. So aparece se o usuario estava logado (currentAccountId nao-vazio).

**O que o usuario ve:**
- Overlay escuro com backdrop-blur
- Icone de alerta (triangulo amarelo)
- Titulo: "Sessao expirada"
- Texto: "Sua sessao expirou por inatividade. Faca login novamente para continuar."
- Botao "Entrar novamente" (dourado)

**Acoes possiveis:**
- Clicar "Entrar novamente" -- fecha o modal e abre LoginView via `onLogin()`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/SessionExpiredModal.tsx`
- `/Users/vanta/prevanta/services/authService.ts` (dispara o evento)

---

### 1.7 Guest Tentando Acessar Area Restrita (GuestAreaModal)

**Ponto de partida:** Usuario guest tenta executar acao restrita (curtir, comprar, enviar mensagem, ver perfil, ativar notificacao).

**O que o usuario ve:**
- Overlay escuro com backdrop-blur
- Icone Sparkles dourado
- Titulo: "Crie sua conta"
- Texto contextual (varia conforme a acao tentada):
  - `curtir`: "Crie sua conta pra salvar eventos que voce curte"
  - `comprar`: "Crie sua conta pra garantir seu ingresso"
  - `mensagem`: "Crie sua conta pra conversar com amigos"
  - `perfil`: "Crie sua conta pra ter seu perfil"
  - `notificacao`: "Crie sua conta pra receber avisos dos eventos"
  - `generico`: "Crie sua conta pra aproveitar tudo que a noite tem de melhor"
- Botao "Ja tenho conta" (dourado) -- abre LoginView
- Botao "Criar Conta" (borda) -- abre AuthModal
- Botao "Agora nao" (texto) -- fecha

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/AppModals.tsx` (GuestAreaModal definido inline)

---

### 1.8 PMF Survey (PmfSurveyModal)

**Ponto de partida:** Exibido automaticamente apos certas condicoes de uso (configuracao no analytics).

**O que o usuario ve:**
- Titulo: "Uma pergunta rapida"
- Pergunta: "Se o VANTA deixasse de existir amanha, como voce se sentiria?"
- 3 opcoes:
  - "Muito decepcionado" (vermelho)
  - "Um pouco decepcionado" (amarelo)
  - "Nao faria diferenca" (cinza)
- Botao X para fechar

**Acoes possiveis:**
- Selecionar uma opcao -- envia via `submitPmfResponse(userId, value)` e fecha
- Fechar sem responder (botao X)

**Onde termina:** Modal fecha apos envio ou ao clicar X.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/PmfSurveyModal.tsx`
- `/Users/vanta/prevanta/services/analyticsService.ts`

---

### 1.9 Aceitar Termos Atualizados (TosAcceptModal)

**Ponto de partida:** Ao tentar criar evento, se `tos_version` do usuario nao corresponde a versao atual (atualmente "1.0").

**O que o usuario ve:**
- Icone Shield dourado
- Titulo: "Termos de Servico"
- Subtitulo: "Aceite obrigatorio para criar eventos"
- Conteudo scrollavel com 6 clausulas (responsabilidade, taxa VANTA, reembolso CDC, proibicoes, suspensao, transparencia financeira)
- Versao dos termos
- Checkbox: "Li e aceito os Termos de Servico da VANTA"
- Botao "Voltar" (cinza)
- Botao "Aceitar e Continuar" (dourado, habilitado so com checkbox)

**Acoes ao aceitar:**
- Grava `tos_accepted_at`, `tos_version` e `tos_ip` na tabela `profiles`
- Chama `onAccepted()`

**Funcao auxiliar exportada:** `checkTosAccepted(userId)` -- verifica se o usuario ja aceitou a versao atual.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/TosAcceptModal.tsx`

---

## 2. BUSCA

---

### 2.1 Tab Buscar (SearchView)

**Ponto de partida:** Tab "Buscar" na barra de navegacao inferior.

**Caminho completo:**
1. Header com titulo "Explorar" em Playfair Display dourado
2. Grid de 4 abas: Eventos | Pessoas | Lugares | Pra Voce
3. Campo de busca universal (placeholder muda por aba)
4. Chips de filtro (variam por aba)
5. Area de conteudo scrollavel

**Sub-tabs e seus filtros:**

| Aba | Placeholder | Filtros disponiveis |
|-----|-------------|---------------------|
| Eventos | "O que busca hoje?" | Cidade, Estilo, Periodo, Preco |
| Pessoas | "Nome ou e-mail..." | Nenhum chip |
| Lugares | "Bar, casa noturna, restaurante..." | Nenhum chip |
| Pra Voce | "Buscar beneficios pra voce..." | Cidade, Periodo |

**Funcionalidades globais:**
- Historico de buscas recentes (localStorage, max 10 itens)
- Botao "Limpar" historico
- Busca server-side (debounce 300ms, min 2 caracteres)
- Scroll infinito na aba Eventos (10 itens por pagina)

**Spotlight de comunidade:** Quando o usuario busca na aba Eventos e o nome coincide com uma comunidade, aparece um card destacado da comunidade com seus proximos eventos.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/SearchView.tsx`
- `/Users/vanta/prevanta/modules/search/components/SearchHeader.tsx`

---

### 2.2 Buscar Eventos (SearchResults)

**O que o usuario ve:**
- Titulo: "Proximos em {cidade}" (view padrao) ou "{N} Resultados" (busca ativa)
- Lista virtualizada (@tanstack/react-virtual) de cards de evento
- Cada card mostra: imagem 64x64, formato/categoria, titulo, local com icone MapPin, seta para a direita
- EmptyState com icone Search: "Sem resultados -- Tente outro filtro ou palavra-chave"

**Filtros aplicados (client-side):**
- Cidade (multi-selecao)
- Categoria/formato/estilos/experiencias
- Periodo (Hoje, Amanha, Essa Semana, Esse Fim de Semana, Esse Mes, range personalizado)
- Preco maximo (filtro pelo menor preco do evento)
- Texto (fallback client-side quando server-side nao retornou)
- Bloqueados (usuarios bloqueados sao filtrados)
- Eventos expirados sao removidos

**Acoes possiveis:**
- Clicar num card -- `onEventClick(evento)`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/SearchResults.tsx`

---

### 2.3 Buscar Pessoas (PeopleResults)

**O que o usuario ve:**
- Titulo: "{N} Pessoas encontradas"
- Lista de cards com: avatar (fallback padrao), nome, @handle (email antes do @)
- EmptyState: "Ninguem encontrado."

**Busca:** Via `authService.buscarMembros()` (Supabase), max 20 resultados, filtra bloqueados.

**Acoes possiveis:**
- Clicar num card -- `onMemberClick(membro)`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/PeopleResults.tsx`

---

### 2.4 Buscar Lugares (PlacesResults)

**O que o usuario ve:**
- Lista de cards com: foto (ou icone MapPin), nome, cidade, tipo de comunidade
- EmptyState: "Nenhum lugar encontrado -- Tente outro nome ou cidade."

**Busca:** Query `comunidades` no Supabase com `ilike` no nome, max 20 resultados.

**Acoes possiveis:**
- Clicar num card -- `onPlaceClick(id)` -- abre ComunidadePublicView

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/PlacesResults.tsx`

---

### 2.5 Filtro de Preco (PriceFilterModal)

**Ponto de partida:** Chip "Preco" nos filtros de eventos.

**O que o usuario ve:**
- Modal glassmorphism flutuante
- Titulo: "Investimento" / "Filtrar por valor"
- Valor maximo atual em display grande (font-serif)
- Slider VantaSlider (0--5000, step 50)
- 4 botoes de atalho rapido:
  - Ate R$ 100
  - Ate R$ 250
  - Ate R$ 500
  - Acima de R$ 500
- Botao "Limpar Filtro"

**Acoes possiveis:**
- Arrastar slider
- Selecionar atalho rapido
- Aplicar filtro
- Limpar filtro
- Fechar (tap fora ou botao X)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/PriceFilterModal.tsx`
- `/Users/vanta/prevanta/components/VantaSlider.tsx`

---

### 2.6 Filtro de Vibe/Estilo (VibeFilterModal)

**Ponto de partida:** Chip "Estilo" nos filtros de eventos.

**O que o usuario ve:**
- Modal glassmorphism flutuante
- 3 sub-abas internas: Formato, Estilo, Experiencia (com emojis)
- Lista de opcoes carregadas do Supabase (tabelas `formatos`, `estilos`, `experiencias`)
- Cada opcao e um botao com check quando selecionado
- Contador total de selecionados
- Botao "Limpar Filtro"

**Acoes possiveis:**
- Alternar entre sub-abas
- Selecionar/desselecionar opcoes
- Limpar todos os filtros
- Fechar

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/VibeFilterModal.tsx`

---

### 2.7 Filtro de Horario (TimeFilterModal)

**Ponto de partida:** Chip "Periodo" nos filtros de eventos.

**O que o usuario ve:**
- Modal glassmorphism com titulo "Quando?"
- 6 presets rapidos: Qualquer Data, Hoje, Amanha, Essa Semana, Esse Fim de Semana, Esse Mes
- Mini-calendario interativo com:
  - Navegacao por mes (setas esquerda/direita)
  - Nome do mes em portugues
  - Grade 7 colunas (D S T Q Q S S)
  - Selecao de range (2 cliques: inicio e fim)
  - Dias passados desabilitados
  - Indicador visual de range selecionado

**Acoes possiveis:**
- Selecionar um preset
- Selecionar range customizado no calendario
- Limpar filtro
- Fechar

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/TimeFilterModal.tsx`

---

### 2.8 Filtro de Cidade (CityFilterModal)

**Ponto de partida:** Chip "Cidades" nos filtros.

**O que o usuario ve:**
- Modal glassmorphism com titulo "Localizacao" / "Filtrar por cidade"
- Lista scrollavel de todas as cidades (extraidas dos eventos disponiveis)
- Cada cidade e um botao com check quando selecionada (multi-selecao)
- Botao "Limpar Filtro" no rodape

**Acoes possiveis:**
- Selecionar/desselecionar cidades
- Limpar filtro
- Fechar

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/CityFilterModal.tsx`

---

### 2.9 Tab Beneficios MV (BeneficiosMVTab)

**Ponto de partida:** Aba "Pra Voce" na SearchView. Visivel SOMENTE para membros ativos do MAIS VANTA.

**O que o usuario ve:**
- Filtro por tipo: Todos | Eventos | Parceiros
- Filtro por categoria de parceiro (Restaurante, Bar, Club, Academia, Salao, Hotel, Loja, Outro)
- Lista de beneficios unificada:
  - Eventos com beneficio MV (verificado pelo tier do membro vs tier minimo do beneficio)
  - Deals de parceiros ativos
- Cada deal mostra: titulo, subtitulo, descricao, cidade, data, vagas restantes, foto
- Opcao de resgatar deal (gera QR code)
- Tela de QR Code para apresentar no parceiro

**Acoes possiveis:**
- Filtrar por tipo e categoria
- Resgatar um deal
- Ver QR code do resgate
- Clicar em evento com beneficio

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/search/components/BeneficiosMVTab.tsx`
- `/Users/vanta/prevanta/features/admin/services/clubeService.ts`
- `/Users/vanta/prevanta/features/admin/services/clube/clubeDealsService.ts`
- `/Users/vanta/prevanta/features/admin/services/clube/clubeResgatesService.ts`

---

## 3. RADAR (MAPA)

---

### 3.1 Tab Radar (RadarView)

**Ponto de partida:** Tab "Radar" na barra de navegacao inferior.

**Caminho completo:**
1. Mapa fullscreen (Leaflet, tile dark do CartoDB)
2. Header flutuante no topo com titulo "Radar" + dot de status
3. Barra de filtros de data
4. Chips de filtro de raio (quando GPS disponivel)
5. Pins no mapa (eventos, usuario, parceiros MV)
6. Card do evento ativo (bottom card)

**O que o usuario ve:**

**Header:**
- Titulo "Radar" em Playfair Display dourado com drop-shadow
- Dot pulsante dourado (se ha eventos) ou cinza (sem eventos)
- Label da data atual ("Hoje", "Amanha", ou data formatada)

**Barra de filtros de data (pill bar):**
- Botao "Hoje" (dourado quando ativo)
- Botao "Ao Vivo" com icone Radio (vermelho quando ativo, mostra so eventos acontecendo agora)
- Botao "Amanha"
- Botao Calendario (abre PremiumCalendar)
- Botao "Voltar para Hoje" (aparece quando data diferente de hoje)

**Filtro de raio (se GPS ativo):**
- Chips: Todos | 5 km | 10 km | 25 km | 50 km
- Circulo visual dourado desenhado no mapa ao selecionar raio

**Se GPS nao ativo:**
- Botao "Ativar localizacao" (dourado, com icone LocateFixed)
- Ao clicar: solicita permissao silenciosamente via `geo.request()`
- Se negado: toast "Permita o acesso a localizacao nas configuracoes do navegador."

**Pins no mapa:**
- Pin do usuario: foto circular com borda dourada (zIndex 2000)
- Pins de evento: foto circular, estados visuais para ativo/ao-vivo/mais-proximo
- Pins de parceiros MV: foto circular com estilo diferenciado

**Botoes laterais (direita, centro vertical):**
- Centralizar (Crosshair, dourado se GPS ativo)
- Zoom in (+)
- Zoom out (-)

**Estados especiais:**
- Loading: spinner dourado central
- Sem eventos na data: banner "Nenhum evento para {data}" + link "Ver proximo"
- Fallback sem GPS: mapa centralizado em SP (-23.55, -46.63)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/radar/RadarView.tsx`
- `/Users/vanta/prevanta/modules/radar/hooks/useRadarLogic.ts`
- `/Users/vanta/prevanta/modules/radar/components/MapController.tsx`
- `/Users/vanta/prevanta/modules/radar/utils/mapIcons.ts`
- `/Users/vanta/prevanta/hooks/usePermission.ts`

---

### 3.2 Pedir Permissao GPS -- Fluxo Completo

**Ponto de partida:** Montagem do RadarView (automatico) ou clique em "Ativar localizacao".

**Caminho completo:**
1. `useRadarLogic` chama `geo.request()` na montagem (silencioso, sem modal)
2. Usa `enableHighAccuracy: true, timeout: 10000, maximumAge: 60000`
3. Se permissao concedida: `setUserLocation()`, mapa centraliza no usuario
4. Se permissao negada: mapa usa fallback (SP), mostra botao "Ativar localizacao"
5. Se usuario clica "Ativar localizacao":
   - Chama `geo.request()` novamente
   - Se concedido: atualiza localizacao
   - Se negado: toast de aviso

**Importante:** Nao usa modal intermediario. A API do browser pede a permissao diretamente.

---

### 3.3 Calendario Premium (PremiumCalendar)

**Ponto de partida:** Botao do calendario na barra de filtros do Radar.

**O que o usuario ve:**
- Modal fullscreen com backdrop blur e borda dourada
- Titulo: "Escolha a Data"
- Navegacao por mes (setas + nome do mes)
- Grade de dias (dom-sab)
- Dia atual: borda dourada com glow
- Dias passados: desabilitados (cinza)
- Dias com eventos: dot dourado embaixo do numero
- Botao X para fechar

**Acoes possiveis:**
- Navegar entre meses
- Selecionar um dia futuro (fecha o calendario e filtra o mapa)
- Fechar sem selecionar

**Onde termina:** `onSelectDate(date)` -- atualiza filtro de data no Radar.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/radar/components/PremiumCalendar.tsx`

---

### 3.4 Clicar num Pin

**Ponto de partida:** Tap em qualquer pin de evento no mapa.

**O que acontece:**
1. Mapa voa (flyTo) para o pin com zoom 16, animacao de 1 segundo
2. Pin recebe estado "ativo" (visual destacado, zIndex 1000)
3. Card do evento aparece na parte inferior (slide-in-from-bottom)

**Card do evento ativo mostra:**
- Foto 64x64 do evento
- Formato/categoria em dourado
- Titulo (truncado)
- Data + horario + distancia (se GPS ativo, ex: "1.2km" ou "800m")
- Link "Ver detalhes" com seta dourada
- Botao "Ir" (abre Google Maps com direcoes)

**Acoes possiveis:**
- Clicar no card inteiro: `onEventSelect(evento)` -- abre pagina do evento
- Clicar "Ir": abre Google Maps directions em nova aba
- Clicar em outro pin: troca o card ativo
- Clicar no mesmo pin: deseleciona (fecha card)

---

## 4. COMUNIDADE

---

### 4.1 Pagina Publica da Comunidade (ComunidadePublicView)

**Ponto de partida:** Clicar em "Lugares" na busca, clicar na comunidade de um evento, ou link direto.

**Caminho completo:**
1. Banner de capa (aspect ratio 3:1) com gradientes de transicao
2. Avatar da comunidade sobrepondo o banner (-mt-10)
3. Informacoes + acoes
4. Conteudo scrollavel

**O que o usuario ve:**

**Header fixo:**
- Botao Voltar (ArrowLeft, fundo blur)
- Botao Denunciar (Flag, fundo blur)

**Informacoes principais:**
- Nome da comunidade (Playfair Display, truncado)
- Endereco + cidade/estado com icone MapPin
- Redes sociais (Instagram, WhatsApp, TikTok, Site) -- cada um abre link externo
- Botao Seguir/Seguindo (toggle)

**Acoes disponveis (botoes em cards):**
- "Como Chegar" -- abre Google Maps directions (so se coords disponiveis)
- "Evento Privado" -- abre formulario (so se `evento_privado_ativo = true`)
- "Comemorar aqui" -- abre formulario de comemoracao
- Descricao da comunidade (se disponivel)

**Horario de funcionamento:** Component `HorarioPublicDisplay` com horarios semanais e overrides.

**Social Proof:**
- Avatares dos 3 primeiros seguidores
- Texto: "{Nome} e outras {N} pessoas seguem esta comunidade"
- Clicar abre lista completa de seguidores (ate 50, com busca)

**Nota de avaliacao:** Se houver reviews, mostra estrelas + media.

**Proximos Eventos:** Lista de eventos futuros da comunidade (cards clicaveis).

**Badge MAIS VANTA:** Se a comunidade participa do MV e o usuario e membro, mostra badge com link para o clube.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/community/ComunidadePublicView.tsx`
- `/Users/vanta/prevanta/services/communityFollowService.ts`
- `/Users/vanta/prevanta/components/HorarioPublicDisplay.tsx`
- `/Users/vanta/prevanta/components/RestrictedModal.tsx`
- `/Users/vanta/prevanta/components/ReportModal.tsx`

---

### 4.2 Seguir Comunidade -- Fluxo

**Ponto de partida:** Botao "Seguir" na ComunidadePublicView.

**Se usuario logado:**
1. Botao muda para estado "loading" (disabled)
2. Chama `communityFollowService.follow(userId, comunidadeId)`
3. Botao atualiza para "Seguindo" (fundo dourado)
4. Contador de seguidores incrementa

**Se usuario guest:**
1. Abre `RestrictedModal` (pede login/cadastro)
2. Opcoes: login ou criar conta

**Para deixar de seguir:**
1. Clicar "Seguindo"
2. Chama `communityFollowService.unfollow()`
3. Botao volta para "Seguir" (borda cinza)
4. Contador decrementa

---

### 4.3 Evento Privado (EventoPrivadoFormView)

**Ponto de partida:** Botao "Evento Privado" na ComunidadePublicView (requer login).

**Caminho completo:**
1. Header com titulo "Evento Privado" + nome da comunidade + icone PartyPopper
2. Texto de apresentacao da comunidade (se configurado)
3. Galeria de fotos horizontais (scroll)
4. Formulario completo

**Campos do formulario:**
- Nome completo * (pre-preenchido com profile)
- Empresa/Cliente *
- E-mail * (pre-preenchido)
- Telefone *
- Instagram *
- Data do evento (VantaDatePicker)
- Data estimativa (alternativa a data exata)
- Faixa de capacidade * (VantaDropdown, opcoes da config da comunidade)
- Horario * (Diurno | Noturno | Dia inteiro)
- Formatos (multi-selecao de chips, opcoes da config)
- Atracoes (multi-selecao de chips, opcoes da config)
- Descricao *

**Validacao de submit:** Todos os campos com * sao obrigatorios.

**Apos envio:**
- Tela de sucesso com check verde: "Solicitacao enviada!"
- Texto: "A equipe do {comunidade} recebeu sua solicitacao e entrara em contato em breve."
- Botao "Voltar"

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/community/EventoPrivadoFormView.tsx`
- `/Users/vanta/prevanta/services/eventoPrivadoService.ts`
- `/Users/vanta/prevanta/components/VantaDropdown.tsx`
- `/Users/vanta/prevanta/components/VantaDatePicker.tsx`

---

### 4.4 Comemoracao / Aniversario (ComemoracaoFormView)

**Ponto de partida:** Botao "Comemorar aqui" na ComunidadePublicView (requer login).

**Caminho completo:**
1. Header com titulo "Comemorar aqui" + nome da comunidade/evento + icone Cake
2. Texto intro: "Quer comemorar seu aniversario ou despedida com a gente?..."
3. Formulario

**Campos do formulario:**
- Motivo da comemoracao * (VantaDropdown: Aniversario | Despedida | Outro)
- Motivo outro * (se "Outro" selecionado)
- Nome completo * (pre-preenchido)
- Data de aniversario * (se motivo = Aniversario)
- Data da comemoracao * (VantaDatePicker)
- WhatsApp *
- Instagram *

**Apos envio:**
- Tela de sucesso com icone Cake dourado: "Solicitacao enviada!"
- Texto: "A equipe do {comunidade} vai avaliar sua solicitacao. Voce recebera uma notificacao com a resposta."
- Botao "Voltar"

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/community/ComemoracaoFormView.tsx`
- `/Users/vanta/prevanta/services/comemoracaoService.ts`
- `/Users/vanta/prevanta/components/VantaDropdown.tsx`
- `/Users/vanta/prevanta/components/VantaDatePicker.tsx`

---

## 5. FLUXOS ESPECIAIS

---

### 5.1 Aceitar Convite MAIS VANTA (AceitarConviteMVPage)

**Ponto de partida:** Rota `/convite-mv/:token` (link compartilhado).

**Caminho completo (state machine):**

**Estado 'loading':**
- Spinner dourado + "Carregando convite..."
- Busca convite por token em `convites_mais_vanta`

**Estado 'error' (convite invalido):**
- Icone XCircle vermelho
- Titulo: "Ops!"
- Mensagens possiveis:
  - "Link invalido"
  - "Convite nao encontrado"
  - "Este convite ja foi aceito"
  - "Este convite nao esta mais disponivel"
  - "Este convite expirou"
- Botao "Voltar ao App"

**Estado 'needLogin' (usuario nao logado):**
- Icone LogIn dourado
- Titulo: "Convite MAIS VANTA"
- Texto: "Faca login ou crie sua conta para aceitar o convite."
- Botao "Entrar / Criar Conta" -- abre AuthModal (lazy loaded)

**Estado 'show' (convite valido, usuario logado):**
- Icone Crown dourado (membro) ou Store roxo (parceiro)
- Titulo: "Convite MAIS VANTA" ou "Convite de Parceiro"
- Descricao contextual
- Botao "Aceitar Convite"

**Estado 'accepting':**
- Spinner + "Aceitando convite..."
- Chama RPC `aceitar_convite_mv` no Supabase

**Estado 'success':**
- Check verde
- Titulo: "Bem-vindo!"
- Texto contextual (membro: "Explore seus beneficios exclusivos" / parceiro: "Gerencie seus beneficios")
- Botao "Ir para o App" -- navega para `/`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/convite/AceitarConviteMVPage.tsx`

---

### 5.2 Painel do Parceiro (ParceiroDashboardPage)

**Ponto de partida:** Rota `/parceiro/:id` ou acesso direto pelo menu.

**O que o usuario ve:**
- Header com icone Store, nome do parceiro, botao Voltar
- Metricas: total resgates, deals ativos, etc.
- 3 abas: DEALS | RESGATES | QR_SCAN

**Aba DEALS:**
- Lista de deals do parceiro com status (Ativo/Rascunho/Pausado/Encerrado/Expirado)
- Botao "Sugerir Deal" abre formulario inline:
  - Titulo, Tipo (BARTER/DESCONTO), Vagas, Obrigacao/Desconto

**Aba RESGATES:**
- Lista de resgates realizados com detalhes

**Aba QR_SCAN:**
- Scanner de QR Code (html5-qrcode)
- Pede permissao de camera
- Ao ler QR valido: faz check-in via `clubeResgatesService.checkin(token)`
- Resultado: sucesso (nome + deal) ou erro

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/parceiro/ParceiroDashboardPage.tsx`
- `/Users/vanta/prevanta/modules/parceiro/parceiroService.ts`
- `/Users/vanta/prevanta/features/admin/services/clube/clubeResgatesService.ts`

---

### 5.3 PWA Install Prompt

**Ponto de partida:** Quando `pwa.canInstall = true` e `pwa.isInstalled = false` (detectado pelo hook usePWA).

**O que o usuario ve:**
- Banner fixo acima da barra de navegacao (bottom-20)
- Icone app (icon-192.png)
- Titulo: "Adicionar a tela inicial"
- Subtitulo: "Acesse o VANTA como app nativo."
- Botao "Instalar" -- chama `pwa.installApp()`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/AppModals.tsx` (linhas 219-233)
- `/Users/vanta/prevanta/hooks/usePWA.ts`

---

### 5.4 PWA Update Banner

**O que o usuario ve:**
- Banner fixo acima da barra de navegacao (bottom-20)
- Icone check dourado
- Titulo: "Nova versao disponivel"
- Subtitulo: "Atualize para a versao mais recente."
- Botao "Atualizar" -- chama `pwa.applyUpdate()`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/AppModals.tsx` (linhas 201-217)

---

### 5.5 Push Notification Permission

**Ponto de partida:** Apos login quando `Notification.permission === 'default'` e usuario nao dispensou nos ultimos 7 dias.

**O que o usuario ve:**
- Modal fullscreen com backdrop-blur
- Ilustracao decorativa (circulos dourados)
- Icone BellRing dourado com badge "1"
- Texto pedindo permissao
- Botao para permitir
- Botao para fechar (dismissar por 7 dias)

**iOS em browser (nao PWA standalone):** Mostra dica "Adicione a tela inicial" em vez do botao de permissao (Safari iOS so suporta Push em PWA standalone).

**Fluxo ao permitir:**
1. Chama `onRequestPermission()` -- browser pede permissao nativa
2. Se "granted": chama `onRegisterFcm()` para registrar token FCM
3. Dismissar banner

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/PushPermissionBanner.tsx`
- `/Users/vanta/prevanta/hooks/usePWA.ts`

---

### 5.6 Erro Global (ErrorBoundary)

**Ponto de partida:** Qualquer erro nao-tratado de renderizacao React.

**O que o usuario ve:**
- Tela escura fullscreen
- Letra "V" grande centralizada
- Titulo: "Algo deu errado" (Playfair Display)
- Subtitulo: "Ocorreu um erro inesperado. Tente recarregar a pagina."
- Botao "Recarregar" (dourado) -- `window.location.reload()`
- Em DEV: mensagem de erro tecnica visivel (pre formatado, vermelho)

**Acoes silenciosas:** Erro e capturado pelo Sentry (`Sentry.captureException()`) com componentStack.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/ErrorBoundary.tsx`

---

### 5.7 Pagina 404 (NotFoundView)

**Ponto de partida:** Qualquer rota nao reconhecida pelo React Router.

**O que o usuario ve:**
- Numero "404" gigante em dourado italico (5rem, Playfair Display)
- Titulo: "Pagina nao encontrada"
- Subtitulo: "O link pode estar quebrado ou a pagina foi removida."
- Botao "Voltar ao inicio" -- `navigate('/', { replace: true })`

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/NotFoundView.tsx`

---

### 5.8 Offline

**Comportamento:** O VANTA e uma PWA com Service Worker. Quando offline:
- Dados ja cacheados pelo Service Worker continuam acessiveis
- Requisicoes ao Supabase falham silenciosamente (optional chaining protege o UI)
- Nao ha tela dedicada de "Voce esta offline" -- o comportamento depende do Service Worker e do cache disponivel
- Acoes que exigem rede (comprar, seguir, etc.) falham com toast/erro generico

---

## Resumo de Todos os Modais Gerenciados pelo AppModals

O componente `AppModals` (`/Users/vanta/prevanta/components/AppModals.tsx`) centraliza a renderizacao condicional de:

| Modal | Condicao | Z-Index |
|-------|----------|---------|
| LoginView | `showLoginView` | 340 |
| GuestAreaModal | `guestModalContext !== null` | 300 |
| SuccessFeedbackModal | `showSuccessModal` | 300 |
| ProfileSuccess | `showProfileSuccess` | 300 |
| OnboardingView | `showOnboarding` | 400 |
| ReviewModal | `reviewTarget !== null` | (lazy) |
| PWA Update Banner | `pwa.updateAvailable` | 500 |
| PWA Install Banner | `pwa.canInstall && !pwa.isInstalled` | 499 |
| PushPermissionBanner | `!isGuest` (com logica interna) | 200 |

Todos usam `useModalBack()` para suporte ao botao voltar do browser/gestura Android.

---

## Parte 4 -- Perfil, Social, Carteira e Mensagens

## PERFIL

### 1. Ver Meu Perfil (ProfileView)

**Ponto de partida:** Tab "Perfil" na barra de navegacao inferior do app.

**Caminho:** Tab Perfil -> `ProfileView` (subView = `MAIN`)

**O que o usuario ve:**
- Foto de perfil circular com borda de status (dourada se membro MAIS VANTA, roxa se admin, cinza padrao)
- Badge Crown na foto se membro MAIS VANTA
- Nome completo
- Texto "Membro desde [mes/ano]"
- Botao de mood (emoji + texto curto, ou "+ Definir mood")
- Selos (badges personalizados) se houver
- Bio truncada (line-clamp-2)
- Botoes "Editar" e engrenagem (Preferencias) no canto superior direito
- 2 cards de acao em grid: "Minha Experiencia" (quantidade de acessos) e "Mais Vanta" / "Seja Mais Vanta"
- Botao "Painel Admin" (condicional -- so aparece se o usuario tem role admin ou acessos)
- Lista de acoes: Perfil Publico, Minhas Pendencias, Meia-Entrada, Bloqueados
- Secao "Configuracoes": Dados Pessoais, Preferencias, PIN da Carteira, Alterar Senha, Ajuda e Suporte
- CTA "Quero ser parceiro VANTA" (so aparece se nao e gerente/master)
- Botao "Sair da conta"
- Botao "Baixar meus dados" (LGPD)
- Botao "Excluir minha conta"

**Acoes possiveis:**
- Tocar em "Editar" -> subView `EDIT_PROFILE`
- Tocar engrenagem -> subView `PREFERENCES`
- Tocar no mood -> abre `MoodPicker`
- Tocar "Minha Experiencia" -> subView `MINHA_EXPERIENCIA` (WalletView)
- Tocar "Mais Vanta" -> subView `CLUBE`
- Tocar "Painel Admin" -> `onAdminClick()` (navega para painel admin)
- Tocar "Perfil Publico" -> subView `PREVIEW_PUBLIC`
- Tocar "Minhas Pendencias" -> subView `PENDENCIAS`
- Tocar "Meia-Entrada" -> subView `MEIA_ENTRADA`
- Tocar "Bloqueados" -> subView `BLOQUEADOS`
- Tocar "Dados Pessoais" -> subView `EDIT_PROFILE`
- Tocar "PIN da Carteira" -> abre modal inline de redefinicao de PIN
- Tocar "Alterar Senha" -> abre modal inline de troca de senha
- Tocar "Ajuda e Suporte" -> abre email para suporte@maisvanta.com
- Tocar "Quero ser parceiro VANTA" -> subView `SOLICITAR_PARCERIA`
- Tocar "Sair da conta" -> `onLogout()`
- Tocar "Baixar meus dados" -> exporta JSON via `lgpdExportService`
- Tocar "Excluir minha conta" -> abre modal de exclusao

**Onde termina:** Permanece em ProfileView (subViews sao renderizadas no lugar)

**Estados especiais:**
- Se membro MAIS VANTA: borda dourada na foto, badge Crown, card mostra "Membro Ativo"
- Se admin: borda roxa, botao de painel admin visivel
- Se nenhum: borda cinza padrao
- Mood nao definido: mostra texto placeholder "+ Definir mood"
- Sem bio: nao exibe secao de bio

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ProfileView.tsx`
- `/Users/vanta/prevanta/types/auth.ts` (ProfileSubView)
- `/Users/vanta/prevanta/stores/authStore.ts`
- `/Users/vanta/prevanta/stores/ticketsStore.ts`
- `/Users/vanta/prevanta/stores/extrasStore.ts`

---

### 2. Editar Perfil (EditProfileView)

**Ponto de partida:** ProfileView -> botao "Editar" ou "Dados Pessoais"

**Caminho:** ProfileView -> subView `EDIT_PROFILE` -> `EditProfileView`

**O que o usuario ve:**
- Header com seta voltar e titulo "Editar Perfil"
- Foto de perfil com overlay de camera (clicavel para trocar)
- Botao "Remover foto" (se foto customizada, volta para avatar default por genero)
- Campo "Nome Completo" (obrigatorio, min 3 caracteres)
- Secao "Sobre Mim": biografia (textarea, max 200 chars com contador), genero (toggle Masc/Fem/N.I), data de nascimento (VantaDatePicker), interesses (InterestSelector com chips)
- Secao "Contato & Localizacao": e-mail (obrigatorio), Instagram (@usuario), telefone (DDD + numero, obrigatorio), estado e cidade (VantaPickerModal com busca)
- Secao "Album de Fotos": grid 3x3 com ate 6 fotos, cada slot pode adicionar/trocar/remover
- Controles de privacidade (PrivacyToggle) em cada campo: TODOS / AMIGOS / SO EU
- Botao "Confirmar Alteracoes"

**Acoes possiveis:**
- Trocar foto de perfil (abre galeria -> ImageCropperModal para recorte)
- Remover foto (volta para avatar generico)
- Editar todos os campos de texto
- Alternar privacidade de cada campo (ciclo: Todos -> Amigos -> So eu)
- Adicionar/trocar/remover fotos do album (ate 6)
- Salvar alteracoes (valida campos, comprime imagens, faz upload para Supabase Storage, atualiza profiles no banco)
- Voltar: se houver alteracoes nao salvas, modal "Sair sem salvar?" aparece

**Onde termina:** Volta para ProfileView (subView MAIN) apos salvar ou confirmar saida sem salvar

**Estados especiais:**
- Validacao client-side: nome min 3 chars, email valido, idade min 16 anos, telefone 8-9 digitos, estado e cidade obrigatorios
- Upload de foto: comprime para 600px (avatar) ou 800px (album), qualidade 78%
- Toast de erro se upload falhar
- Toast "Perfil salvo" em caso de sucesso
- Modal "Sair sem salvar?" se ha alteracoes pendentes

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/EditProfileView.tsx`
- `/Users/vanta/prevanta/modules/profile/components/ImageCropperModal.tsx`
- `/Users/vanta/prevanta/modules/profile/components/InterestSelector.tsx`
- `/Users/vanta/prevanta/modules/profile/utils/imageUtils.ts`
- `/Users/vanta/prevanta/services/photoService.ts`
- `/Users/vanta/prevanta/data/brData.ts`
- `/Users/vanta/prevanta/data/avatars.ts`
- `/Users/vanta/prevanta/components/VantaPickerModal.tsx`
- `/Users/vanta/prevanta/components/VantaDatePicker.tsx`

---

### 3. Preferencias (PreferencesView)

**Ponto de partida:** ProfileView -> engrenagem ou "Preferencias"

**Caminho:** ProfileView -> subView `PREFERENCES` -> `PreferencesView`

**O que o usuario ve:**
- Header com seta voltar e titulo "Preferencias"
- Secao "Notificacoes" com toggles:
  - Push (alertas no dispositivo) -- default ON
  - Lembretes (avisos 1h antes) -- default ON
- Botao "Salvar"

**Acoes possiveis:**
- Alternar push notifications on/off
- Alternar lembretes on/off
- Salvar (com loading spinner)
- Voltar

**Onde termina:** Volta para ProfileView

**Estados especiais:**
- Loading state ao salvar (800ms simulado + callback onSave)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/PreferencesView.tsx`

---

### 4. Historico (HistoricoView)

**Ponto de partida:** ProfileView -> card "Minha Experiencia" -> aba historica (via WalletView PAST) ou diretamente via subView `HISTORICO`

**Caminho:** ProfileView -> subView `HISTORICO` -> `HistoricoView`

**O que o usuario ve:**
- Header com seta voltar e titulo "Meu Historico"
- Secao "Conquistas" (scroll horizontal): cards por comunidade mostrando nivel (cor + label), foto da comunidade, quantidade de eventos
- Secao "Badges" (grid flexivel): badges globais conquistados (ex: PartyPopper, Compass, Users, MessageSquare) com destaque em dourado, nao conquistados em opaco
- Secao "Eventos (N)": timeline de todos os eventos passados (ingressos usados/expirados + presencas sociais), cada card mostrando imagem, titulo, data, local, e badge "Ingresso" (dourado) ou "Presenca" (roxo)

**Acoes possiveis:**
- Clicar em evento -> `onEventClick(evento)` (navega para detalhe do evento)
- Voltar

**Onde termina:** Volta para ProfileView, ou navega para EventDetailView ao clicar em evento

**Estados especiais:**
- Loading: skeleton cards enquanto carrega
- Vazio: EmptyState "Nenhum evento ainda" com icone Calendar
- Tickets com status CANCELADO/TRANSFERIDO/REEMBOLSADO sao filtrados
- Tickets DISPONIVEL so aparecem se o evento ja passou

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/HistoricoView.tsx`
- `/Users/vanta/prevanta/services/achievementsService.ts`

---

### 5. Comprovante Meia-Entrada (ComprovanteMeiaSection)

**Ponto de partida:** ProfileView -> "Meia-Entrada"

**Caminho:** ProfileView -> subView `MEIA_ENTRADA` -> `ComprovanteMeiaSection`

**O que o usuario ve:**
- Header com seta voltar, titulo "Meia-Entrada", badge "Privado"
- Se ja tem comprovante: card de status (PENDENTE/APROVADO/REJEITADO/VENCIDO) com icone colorido, tipo de comprovante, data de envio, dias restantes (se aprovado)
- Botao "Ver comprovante" (abre lightbox com fotos frente/verso/extra)
- Se nao tem, ou rejeitado/vencido: area de upload
  - Dropdown de tipo (Carteirinha de Estudante, RG Idoso, etc.)
  - Upload de ate 3 arquivos (frente/verso/extra) via camera, galeria ou arquivo
  - Preview de cada arquivo com botao de remover
  - Botao "Enviar Comprovante"

**Acoes possiveis:**
- Selecionar tipo de comprovante
- Escolher fonte de cada arquivo (camera, galeria, arquivo)
- Remover arquivo antes de enviar
- Enviar comprovante
- Ver comprovante existente (lightbox com tabs frente/verso/extra)
- Voltar

**Onde termina:** Volta para ProfileView. Toast "Comprovante enviado!" apos sucesso.

**Estados especiais:**
- Status PENDENTE: card amarelo, "Aguardando aprovacao"
- Status APROVADO: card verde com dias restantes
- Status REJEITADO: card vermelho, area de re-upload disponivel
- Status VENCIDO: card vermelho, area de re-upload disponivel
- Alerta amarelo se vencendo em menos de 30 dias
- Poll a cada 2s para checar atualizacoes do service

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ComprovanteMeiaSection.tsx`
- `/Users/vanta/prevanta/features/admin/services/comprovanteService.ts`

---

### 6. Minhas Pendencias (MinhasPendenciasView)

**Ponto de partida:** ProfileView -> "Minhas Pendencias"

**Caminho:** ProfileView -> subView `PENDENCIAS` -> `MinhasPendenciasView`

**O que o usuario ve:**
- Header com seta voltar e titulo "Minhas Pendencias"
- 3 tabs (scroll horizontal): Solicitacoes (parceria), Amizades, Eventos Privados
- Cada tab mostra contagem de itens

**Tab Solicitacoes (TabSolicitacoesParceria):**
- Lista de solicitacoes de parceria enviadas com status, data, cidade, categoria
- Status: ENVIADA, VISUALIZADA, EM_ANALISE, APROVADA, RECUSADA, CONVERTIDA

**Tab Amizades (TabAmizadesPendentes):**
- Lista de pedidos de amizade pendentes
- Cada item mostra: foto, nome, data, direcao (Enviado em azul / Recebido em amarelo)
- Vazio: "Nenhum pedido de amizade pendente"

**Tab Eventos Privados (TabEventosPrivados):**
- Solicitacoes de eventos privados

**Acoes possiveis:**
- Alternar entre tabs
- Visualizar detalhes de cada pendencia
- Voltar

**Onde termina:** Volta para ProfileView

**Estados especiais:**
- Loading: spinner centralizado
- Vazio por tab: mensagem e icone especificos

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/MinhasPendenciasView.tsx`
- `/Users/vanta/prevanta/modules/profile/components/TabSolicitacoesParceria.tsx`
- `/Users/vanta/prevanta/modules/profile/components/TabAmizadesPendentes.tsx`
- `/Users/vanta/prevanta/modules/profile/components/TabEventosPrivados.tsx`

---

### 7. Minhas Solicitacoes (MinhasSolicitacoesView)

**Ponto de partida:** ProfileView -> subView `MINHAS_SOLICITACOES`

**Caminho:** ProfileView -> `MinhasSolicitacoesView`

**O que o usuario ve:**
- Header com seta voltar e titulo implícito
- 2 tabs: "Eventos Privados" e "Comemoracoes"
- Tab Eventos Privados: lista de solicitacoes com timeline visual de progresso (ENVIADA -> VISUALIZADA -> EM_ANALISE -> APROVADA/RECUSADA), timestamps de cada etapa
- Tab Comemoracoes: lista de comemoracoes com faixas, cortesias atribuiveis (nome + celular), QR code por cortesia, link de referencia copiavel

**Acoes possiveis:**
- Alternar entre tabs
- Copiar link de referencia
- Atribuir cortesia a convidado (nome + celular)
- Ver QR code de cortesia
- Voltar

**Onde termina:** Volta para ProfileView

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/MinhasSolicitacoesView.tsx`
- `/Users/vanta/prevanta/services/eventoPrivadoService.ts`
- `/Users/vanta/prevanta/services/comemoracaoService.ts`

---

### 8. Preview Publico (PublicProfilePreviewView)

**Ponto de partida:** ProfileView -> "Perfil Publico", ou clicar no perfil de outro usuario em qualquer parte do app

**Caminho:** ProfileView -> subView `PREVIEW_PUBLIC` ou `PREVIEW_FRIENDS` -> `PublicProfilePreviewView`

**O que o usuario ve (modo dono -- preview do proprio perfil):**
- Barra superior "Modo Visualizacao" com toggle Publico/Amigos (ProfilePreviewControls)
- Foto de perfil grande (136px) clicavel (abre lightbox)
- Nome + badge Crown se membro MAIS VANTA
- "Membro Confirmado"
- Mood badge (se definido e visivel pela config de privacidade)
- Botao "Editar Perfil"
- Secoes de dados conforme privacidade: Bio, E-mail, Instagram, Aniversario, Telefone, Localizacao, Genero, Interesses, Conquistas, Badges, Album de Fotos
- Secoes restritas mostram overlay "Conteudo Restrito -- Disponivel apenas para amigos"

**O que o usuario ve (modo visitante -- perfil de outra pessoa):**
- Seta voltar + botao de denuncia (Flag)
- Mesmas secoes de dados, filtradas pela config de privacidade
- Botoes de acao social:
  - Se amigo: "Amigos" (verde) + "Mensagem"
  - Se solicitacao enviada: "Solicitado" (pendente)
  - Se solicitacao recebida: banner "X enviou uma solicitacao" com Aceitar/Recusar
  - Se nenhuma relacao: "Adicionar Amigo" (dourado)

**Acoes possiveis:**
- Dono: alternar entre visao Publico e Amigos
- Visitante: adicionar amigo, cancelar solicitacao, aceitar/recusar, remover amizade, enviar mensagem, denunciar
- Abrir lightbox da foto de perfil
- Abrir lightbox do album
- Voltar

**Onde termina:** Volta para a tela anterior (ProfileView, ChatRoomView, etc.)

**Estados especiais:**
- Privacidade respeitada: cada campo verifica config (TODOS/AMIGOS/NINGUEM)
- Modal de confirmacao ao remover amizade
- Modal de sucesso ao aceitar/recusar amizade
- ReportModal para denuncia com opcao de bloquear

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/PublicProfilePreviewView.tsx`
- `/Users/vanta/prevanta/components/Profile/ProfilePreviewControls.tsx`
- `/Users/vanta/prevanta/components/ReportModal.tsx`
- `/Users/vanta/prevanta/stores/socialStore.ts`
- `/Users/vanta/prevanta/services/moodService.ts`
- `/Users/vanta/prevanta/services/achievementsService.ts`

---

### 9. Mood/Status (MoodPicker)

**Ponto de partida:** ProfileView -> tocar no badge de mood

**Caminho:** ProfileView -> `MoodPicker` (bottom sheet modal)

**O que o usuario ve:**
- Bottom sheet modal com titulo "Seu mood"
- Texto: "Como voce esta hoje? Seus amigos vao ver."
- Grid 6 colunas de emojis pre-definidos (MOOD_EMOJIS do moodService)
- Emoji selecionado fica destacado com ring dourado
- Campo de texto opcional para descricao curta
- Botoes: "Limpar" (remove mood) e "Salvar"

**Acoes possiveis:**
- Selecionar um emoji
- Digitar texto complementar
- Salvar mood (persiste via moodService no Supabase)
- Limpar mood (remove)
- Fechar (tap fora ou X)

**Onde termina:** Fecha o modal, volta para ProfileView. Emoji aparece no badge de mood.

**Estados especiais:**
- Se ja tem mood definido, carrega emoji e texto atuais
- Mood visivel para outros conforme config de privacidade (verMood)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/MoodPicker.tsx`
- `/Users/vanta/prevanta/services/moodService.ts`

---

### 10. Solicitar Parceria (SolicitarParceriaView)

**Ponto de partida:** ProfileView -> "Quero ser parceiro VANTA"

**Caminho:** ProfileView -> subView `SOLICITAR_PARCERIA` -> `SolicitarParceriaView`

**O que o usuario ve:**
- Formulario multi-step com categorias de estabelecimento (Boate, Bar, Casa de Shows, etc.)
- Campos: tempo de mercado, capacidade, intencoes (vitrine, venda ingressos, listas, equipe, clube), faixa etaria, estilos musicais, frequencia, media de publico
- Upload de fotos/documentos

**Acoes possiveis:**
- Preencher formulario
- Navegar entre steps
- Enviar solicitacao
- Voltar

**Onde termina:** Toast "Solicitacao enviada com sucesso!" e volta para ProfileView

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/features/admin/views/SolicitarParceriaView.tsx`
- `/Users/vanta/prevanta/features/admin/services/parceriaService.ts`

---

### 11. MAIS VANTA Opt-in (ClubeOptInView)

**Ponto de partida:** ProfileView -> card "Mais Vanta" / "Seja Mais Vanta"

**Caminho:** ProfileView -> subView `CLUBE` -> `ClubeOptInView`

**O que o usuario ve:**
- Se nao e membro (fase 1): formulario de solicitacao com Instagram handle, verificacao de Instagram (input -> checking -> bio_check -> verified), profissao, como conheceu, indicado por, cidade, genero, frequencia, telefone, interesses
- Fase 2 (apos aceitar convite ou avancar): termos de uso LGPD completos, checkbox de aceite, botao "Solicitar Ingresso"
- Se ja e membro: dashboard com reservas, status de posts, tab Ativos/Passados

**Acoes possiveis:**
- Preencher formulario de adesao
- Verificar Instagram
- Aceitar termos
- Enviar solicitacao
- Se membro: ver reservas, enviar link de post de comprovacao, cancelar reserva
- Voltar

**Onde termina:** Volta para ProfileView. Toast de sucesso apos envio.

**Estados especiais:**
- Fluxo de verificacao de Instagram com codigo na bio
- Termos LGPD com scroll obrigatorio
- Convite via ID (auto-avanca para fase 2)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ClubeOptInView.tsx`
- `/Users/vanta/prevanta/features/admin/services/clubeService.ts`
- `/Users/vanta/prevanta/features/admin/services/maisVantaConfigService.ts`

---

### 12. Bloqueados (BloqueadosView)

**Ponto de partida:** ProfileView -> "Bloqueados"

**Caminho:** ProfileView -> subView `BLOQUEADOS` -> `BloqueadosView`

**O que o usuario ve:**
- Header com seta voltar e titulo "Bloqueados"
- Lista de usuarios bloqueados (foto, nome, botao "Desbloquear")
- Se nenhum: icone Ban + "Nenhum usuario bloqueado"

**Acoes possiveis:**
- Tocar "Desbloquear" -> mostra confirmacao inline (Confirmar / Cancelar)
- Confirmar desbloqueio -> remove da lista, toast "Usuario desbloqueado"
- Voltar

**Onde termina:** Volta para ProfileView

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/BloqueadosView.tsx`
- `/Users/vanta/prevanta/services/reportBlockService.ts`

---

### 13. Alterar Senha (modal no ProfileView)

**Ponto de partida:** ProfileView -> "Alterar Senha"

**Caminho:** ProfileView -> modal bottom sheet inline

**O que o usuario ve:**
- Bottom sheet com icone Lock e titulo "Alterar Senha"
- 3 campos: Senha atual, Nova senha (min 6 chars), Confirmar nova senha
- Mensagem de erro inline se houver
- Botao "Salvar Nova Senha"

**Acoes possiveis:**
- Preencher os 3 campos
- Salvar (verifica senha atual via re-autenticacao Supabase, atualiza via supabase.auth.updateUser)
- Fechar modal (X ou tap fora)

**Onde termina:** Modal fecha. Toast "Senha alterada com sucesso!" ou erro.

**Estados especiais:**
- Erro "Senha atual incorreta" se re-autenticacao falhar
- Erro "As senhas nao coincidem" se nova != confirmacao
- Erro "A senha deve ter pelo menos 6 caracteres"
- Loading spinner no botao durante processo

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ProfileView.tsx` (linhas 650-713)

---

### 14. Deletar Conta (modal no ProfileView)

**Ponto de partida:** ProfileView -> "Excluir minha conta"

**Caminho:** ProfileView -> modal centralizado

**O que o usuario ve:**
- Modal com icone AlertTriangle vermelho
- Titulo "Excluir Conta"
- Aviso: "Esta acao e permanente e irreversivel. Todos os seus dados, ingressos, historico e beneficios serao perdidos."
- Campo de texto: digitar "EXCLUIR" para confirmar
- Botao "Excluir Permanentemente" (so ativo quando texto = "EXCLUIR")
- Botao "Cancelar"

**Acoes possiveis:**
- Digitar "EXCLUIR" (auto-uppercase)
- Confirmar exclusao -> RPC `anonimizar_conta` no Supabase, depois `signOut`
- Cancelar

**Onde termina:** Se excluido: logout completo, volta para tela de login. Se cancelado: modal fecha.

**Estados especiais:**
- Botao desativado ate digitar "EXCLUIR"
- Spinner durante processamento
- Anonimizacao Apple-compliant (dados pessoais removidos, registros fiscais mantidos)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ProfileView.tsx` (linhas 715-767)

---

### 15. Exportar Dados (LGPD)

**Ponto de partida:** ProfileView -> "Baixar meus dados"

**Caminho:** ProfileView -> funcao inline `handleExportData`

**O que o usuario ve:**
- Botao muda para "Exportando..." com spinner
- Apos conclusao: arquivo JSON e baixado automaticamente
- Toast "Dados exportados com sucesso!" ou erro

**Acoes possiveis:**
- Clicar no botao (dispara export)

**Onde termina:** Permanece em ProfileView. Arquivo JSON baixado no dispositivo.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/ProfileView.tsx` (linhas 278-291)
- `/Users/vanta/prevanta/services/lgpdExportService.ts`

---

## SOCIAL

### 16. Ver Perfil de Outro Usuario

**Ponto de partida:** Qualquer lugar do app onde aparece um usuario (lista de membros, chat, overlay de membro em evento)

**Caminho:** Tap na foto/nome -> `PublicProfilePreviewView` com `isOwner=false`

**O que o usuario ve:** (ver item 8 acima, modo visitante)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/PublicProfilePreviewView.tsx`

---

### 17. Enviar Pedido de Amizade

**Ponto de partida:** PublicProfilePreviewView de outro usuario

**Caminho:** PublicProfilePreviewView -> botao "Adicionar Amigo"

**O que o usuario ve:**
1. Botao dourado "Adicionar Amigo" com icone UserPlus
2. Apos clicar: botao muda para "Solicitado" (amarelo, com icone Clock)
3. O pedido aparece na aba "Amizades" do MinhasPendenciasView como "Enviado"

**Acoes possiveis:**
- Enviar solicitacao (`socialStore.requestFriendship`)
- Cancelar solicitacao pendente (botao "Solicitado" -> modal de confirmacao -> cancela)

**Onde termina:** Permanece na PublicProfilePreviewView com status atualizado

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/PublicProfilePreviewView.tsx`
- `/Users/vanta/prevanta/stores/socialStore.ts`

---

### 18. Aceitar/Recusar Amizade

**Ponto de partida:** PublicProfilePreviewView (quando outro usuario enviou solicitacao) ou MinhasPendenciasView

**Caminho A (via perfil):** PublicProfilePreviewView -> banner "X enviou uma solicitacao" -> Aceitar ou Recusar

**Caminho B (via pendencias):** ProfileView -> Minhas Pendencias -> tab Amizades -> visualizar pedidos recebidos

**O que o usuario ve:**
- Banner amarelo com nome do solicitante
- Dois botoes: "Aceitar" (dourado) e "Recusar" (cinza)
- Modal de sucesso apos acao

**Acoes possiveis:**
- Aceitar -> `socialStore.handleAcceptFriend` -> modal "Amizade aceita!"
- Recusar -> `socialStore.handleDeclineFriend` -> modal "Solicitacao recusada"

**Onde termina:** Permanece na tela atual. Status atualizado para FRIENDS (se aceito) ou removido.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/profile/PublicProfilePreviewView.tsx`
- `/Users/vanta/prevanta/modules/profile/components/TabAmizadesPendentes.tsx`
- `/Users/vanta/prevanta/stores/socialStore.ts`

---

### 19. Bloquear/Denunciar Usuario

**Ponto de partida:** PublicProfilePreviewView (botao Flag) ou ChatRoomView (menu MoreVertical -> Denunciar)

**Caminho:** Tap no botao de denuncia -> `ReportModal`

**O que o usuario ve:**
- Modal "Denunciar usuario/conversa"
- 5 motivos: Conteudo ofensivo, Spam, Perfil falso, Assedio, Outro
- Campo de descricao (obrigatorio se "Outro")
- Checkbox "Bloquear tambem" (se tipo USUARIO ou CHAT)
- Botao "Enviar Denuncia"

**Acoes possiveis:**
- Selecionar motivo
- Descrever (se Outro)
- Marcar "Bloquear tambem"
- Enviar (`criarDenuncia` + opcionalmente `bloquearUsuario`)
- Cancelar

**Onde termina:** Modal fecha. Toast "Denuncia enviada" ou "Denuncia enviada e usuario bloqueado".

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/ReportModal.tsx`
- `/Users/vanta/prevanta/services/reportBlockService.ts`

---

## CARTEIRA

### 20. Meus Ingressos (WalletView)

**Ponto de partida:** ProfileView -> card "Minha Experiencia" ou tab Carteira (se disponivel)

**Caminho:** ProfileView -> subView `MINHA_EXPERIENCIA` -> `WalletView`

**O que o usuario ve:**
1. **Tela de bloqueio (WalletLockScreen)** -- sempre primeiro
2. Apos desbloquear: titulo "Minha Experiencia" em dourado, badge "Conexao Segura"
3. Se membro MAIS VANTA: card "Seus beneficios" 
4. Abas "Proximos" / "Passados"
5. **Aba Proximos:**
   - Cortesias Pendentes (cards verdes com Aceitar/Recusar)
   - Transferencias Pendentes (cards roxos com Aceitar/Recusar)
   - Reservas MAIS VANTA (cards dourados com status de post)
   - Ingressos agrupados por evento (1 card por evento, mostra quantidade, badge cortesia/ativo)
   - Presencas Confirmadas (Lista VIP)
6. **Aba Passados:**
   - Ingressos usados/expirados (com overlay)
   - Presencas passadas
   - Historico de transferencias

**Acoes possiveis:**
- Desbloquear com PIN
- Alternar Proximos/Passados
- Aceitar/recusar cortesia
- Aceitar/recusar transferencia recebida
- Clicar em evento agrupado -> abre `EventTicketsCarousel`
- Enviar link de post (MAIS VANTA)

**Onde termina:** Permanece em WalletView ou navega para EventTicketsCarousel

**Estados especiais:**
- Skeleton loading no primeiro carregamento
- EmptyState "A noite te espera" (proximos) ou "Nenhum historico" (passados)
- Ingressos USADO/CANCELADO/TRANSFERIDO/EXPIRADO/REEMBOLSADO vao para aba Passados
- Ingressos DISPONIVEL de evento passado tambem vao para Passados

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/WalletView.tsx`
- `/Users/vanta/prevanta/modules/wallet/components/WalletLockScreen.tsx`
- `/Users/vanta/prevanta/modules/wallet/components/EventTicketsCarousel.tsx`
- `/Users/vanta/prevanta/modules/wallet/components/TicketList.tsx`
- `/Users/vanta/prevanta/modules/wallet/components/PresencaList.tsx`
- `/Users/vanta/prevanta/stores/ticketsStore.ts`

---

### 21. QR Code do Ingresso (TicketQRModal)

**Ponto de partida:** WalletView -> EventTicketsCarousel -> tocar no ingresso

**Caminho:** EventTicketsCarousel -> `TicketQRModal`

**O que o usuario ve:**
- Modal fullscreen com fundo escuro blur
- Header gradiente (roxo/rosa para regular, amarelo/ouro para cortesia)
- Titulo do evento, data, variacao, badge "Meia-entrada" se aplicavel
- QR Code real gerado via JWT dinamico (15 segundos por token)
- Relogio em tempo real (HH:MM:SS)
- Barra de progresso de renovacao do token (15s countdown)
- Texto "Renova em Xs - Anti-fraude ativo"
- Nome do titular (se preenchido)
- Se meia-entrada: botao "Abrir Comprovante" (lightbox com frente/verso/extra)

**Acoes possiveis:**
- Apresentar QR para check-in (portaria escaneia)
- Abrir comprovante de meia-entrada
- Fechar modal (X ou tap fora)

**Onde termina:** Fecha modal, volta para EventTicketsCarousel

**Estados especiais:**
- Token JWT rotativo a cada 15 segundos (anti-screenshot, anti-fraude)
- Barra de progresso visual sincronizada com countdown
- Spinner enquanto gera primeiro token
- Back button do dispositivo fecha o modal (useModalBack hook)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/components/TicketQRModal.tsx`
- `/Users/vanta/prevanta/features/admin/services/jwtService.ts`
- `/Users/vanta/prevanta/features/admin/services/comprovanteService.ts`

---

### 22. Tela de Bloqueio (WalletLockScreen)

**Ponto de partida:** Automatico ao abrir WalletView

**Caminho:** WalletView -> `WalletLockScreen` (renderizado antes de mostrar conteudo)

**O que o usuario ve:**
- **Setup (primeiro acesso):** titulo "Criar PIN", teclado numerico, 4 dots de progresso
- **Confirm:** titulo "Confirme o PIN", mesmo teclado
- **Unlock (acessos seguintes):** titulo "Digite seu PIN", 4 dots, teclado

**Acoes possiveis:**
- Digitar PIN de 4 digitos no teclado visual
- DEL para apagar
- Se setup: digita -> confirma -> hash SHA-256 salvo no Supabase (com sal "vnt_2024_")
- Se unlock: digita -> compara hash -> desbloqueia ou erro

**Onde termina:** Desbloqueia e mostra WalletView, ou mostra erro

**Estados especiais:**
- Migracao automatica: se PIN existe no localStorage mas nao no Supabase, migra automaticamente
- Lockout progressivo por tentativas erradas:
  - 3 erros: bloqueio 5 minutos
  - 6 erros: 15 minutos
  - 9 erros: 30 minutos
  - 12+ erros: 1 hora
- Timer visual de countdown durante lockout
- PIN mismatch no setup: mensagem de erro, volta para tela de criacao
- Loading spinner enquanto busca PIN do Supabase

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/components/WalletLockScreen.tsx`

---

### 23. Transferir Ingresso

**Ponto de partida:** WalletView -> EventTicketsCarousel -> botao "Transferir" em um ingresso

**Caminho:** EventTicketsCarousel -> `TransferirModal` (bottom sheet)

**O que o usuario ve:**
- Bottom sheet "Transferir Ingresso" com nome do evento e variacao
- Campo "Para quem?" com busca de membros por nome
- Lista de resultados (foto, nome, email)
- Ao selecionar: confirma destinatario
- Botoes Confirmar/Cancelar

**Acoes possiveis:**
- Buscar membro (debounce 300ms, min 2 chars, ate 4 resultados)
- Selecionar destinatario
- Confirmar transferencia (`onTransferirIngresso`)
- Cancelar

**Onde termina:** Bottom sheet fecha. Ingresso muda de status.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/components/TicketList.tsx` (TransferirModal)
- `/Users/vanta/prevanta/services/transferenciaService.ts`
- `/Users/vanta/prevanta/services/authService.ts` (buscarMembros)

---

### 24. Aceitar Cortesia

**Ponto de partida:** WalletView (aba Proximos) -> secao "Cortesias Pendentes"

**Caminho:** WalletView -> card de cortesia pendente -> Aceitar ou Recusar

**O que o usuario ve:**
- Card verde com icone Gift
- Nome do evento, remetente, variacao, quantidade, data
- Dois botoes: "Aceitar" (verde) e "Recusar" (cinza)

**Acoes possiveis:**
- Aceitar -> `ticketsStore.aceitarCortesiaPendente(id)` -> ingresso aparece na lista
- Recusar -> `ticketsStore.recusarCortesiaPendente(id)` -> card removido

**Onde termina:** Card removido da lista de pendentes. Se aceito, ingresso aparece nos proximos.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/WalletView.tsx`
- `/Users/vanta/prevanta/stores/ticketsStore.ts`

---

### 25. Lista de Presencas (PresencaList)

**Ponto de partida:** WalletView -> secao "Presenca Confirmada (Lista VIP)"

**Caminho:** Renderizado inline dentro de WalletView

**O que o usuario ve:**
- Titulo "Presenca Confirmada (Lista VIP)"
- Cards por evento: icone CheckCircle (futuro) ou Clock (passado), titulo, data/horario
- Texto: "Apenas nome na lista" (futuro) ou "Evento concluido" (passado)

**Acoes possiveis:**
- Visualizar (sem acoes interativas nos cards)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/wallet/components/PresencaList.tsx`

---

## MENSAGENS

### 26. Lista de Conversas (MessagesView)

**Ponto de partida:** Tab "Mensagens" na barra de navegacao inferior

**Caminho:** Tab Mensagens -> `MessagesView`

**O que o usuario ve:**
- Titulo "Mensagens" em dourado
- Botao "Nova" (para iniciar conversa)
- 2 tabs: "Conversas" e "Arquivadas (N)"
- Campo de busca "Buscar conversas..."
- Lista de conversas (ChatListItem), cada uma mostrando:
  - Foto do participante com dot online (verde) ou offline (cinza)
  - Emoji de mood do participante (se disponivel)
  - Nome, ultima mensagem (truncada), horario relativo
  - Quantidade de mensagens nao lidas (badge)
  - Swipe para esquerda revela acoes: Silenciar/Ativar e Arquivar/Restaurar

**Acoes possiveis:**
- Tocar em conversa -> `onOpenChat(member)` (abre ChatRoomView)
- Tocar "Nova" -> abre NewChatModal
- Alternar Conversas/Arquivadas
- Buscar por nome ou conteudo
- Swipe left em conversa -> Silenciar ou Arquivar
- Arquivar -> `ArchiveModal` de confirmacao (checkbox "manter arquivada")
- Desarquivar (na tab Arquivadas) -> toast "Conversa restaurada"
- Silenciar/ativar notificacoes -> toast

**Onde termina:** Permanece em MessagesView ou navega para ChatRoomView/NewChatModal

**Estados especiais:**
- Skeleton loading no primeiro carregamento (3 skeletons)
- EmptyState: "Sua caixa esta vazia" (sem conversas) ou "Nenhuma conversa encontrada" (busca vazia) ou "Nenhuma conversa arquivada"
- Usuarios bloqueados sao filtrados automaticamente da lista
- Busca com debounce 300ms

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/messages/MessagesView.tsx`
- `/Users/vanta/prevanta/modules/messages/components/ChatListItem.tsx`
- `/Users/vanta/prevanta/modules/messages/components/NewChatModal.tsx`
- `/Users/vanta/prevanta/modules/messages/components/ArchiveModal.tsx`
- `/Users/vanta/prevanta/stores/chatStore.ts`
- `/Users/vanta/prevanta/stores/socialStore.ts`

---

### 27. Abrir Conversa (ChatRoomView)

**Ponto de partida:** MessagesView -> tocar em conversa, ou PublicProfilePreviewView -> botao "Mensagem"

**Caminho:** MessagesView -> `ChatRoomView`

**O que o usuario ve:**
- Header: seta voltar, foto do participante (clicavel -> abre perfil), nome, status online/offline (dot + texto), botoes busca e menu
- Badge "Conexao Segura" no inicio do chat
- Lista de mensagens (MessageBubble) com:
  - Bolha colorida (minhas = lado direito, outros = lado esquerdo)
  - Timestamp (agrupado por horario)
  - Read receipts: check simples (entregue) ou check duplo dourado (lido)
  - Reactions agrupadas abaixo da bolha
  - Mensagens deletadas: texto "[Mensagem apagada]"
  - Highlight amarelo se busca ativa
- Input de mensagem + botao Enviar (dourado)
- Se NAO e amigo: barra "Adicione X como amigo para enviar mensagens" (input desativado)

**Acoes possiveis:**
- Enviar mensagem (Enter ou botao)
- Long press em mensagem -> menu de acoes: reactions (6 emojis) + deletar (se minha, < 15 min)
- Reagir a mensagem (toggle -- clicar de novo remove)
- Deletar mensagem (modal "Apagar mensagem?")
- Buscar na conversa (icone lupa): field com navegacao por resultados (setas cima/baixo, "N/M")
- Tocar na foto/nome -> abre PublicProfilePreviewView em modal
- Menu "..." -> "Denunciar" -> ReportModal (tipo CHAT, com opcao de bloquear)

**Onde termina:** Permanece em ChatRoomView. Volta para MessagesView via seta.

**Estados especiais:**
- Scroll automatico para ultima mensagem ao abrir e ao receber nova
- Teclado mobile: offset dinamico para manter input visivel (visualViewport API)
- Se nao e amigo: input desabilitado, mensagem de aviso
- Long press (500ms) ativa menu de acoes
- Busca com debounce 300ms, scroll para resultado selecionado

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/messages/components/ChatRoomView.tsx`
- `/Users/vanta/prevanta/modules/messages/components/MessageBubble.tsx`
- `/Users/vanta/prevanta/modules/profile/PublicProfilePreviewView.tsx`
- `/Users/vanta/prevanta/components/ReportModal.tsx`
- `/Users/vanta/prevanta/stores/chatStore.ts`

---

### 28. Nova Conversa (NewChatModal)

**Ponto de partida:** MessagesView -> botao "Nova"

**Caminho:** MessagesView -> `NewChatModal`

**O que o usuario ve:**
- Tela fullscreen com titulo "Nova Mensagem"
- Badge "Apenas amizades" (so pode conversar com amigos)
- Campo de busca "Buscar amigos..."
- Lista de amigos mutuos (foto, nome, email), cada um com icone UserPlus

**Acoes possiveis:**
- Buscar amigo por nome (debounce 300ms)
- Tocar em amigo -> `onSelectFriend` -> abre ChatRoomView com essa pessoa
- Fechar (X) -> volta para MessagesView

**Onde termina:** Navega para ChatRoomView com o amigo selecionado, ou volta para MessagesView

**Estados especiais:**
- Lista filtrada por busca
- Animacao staggered nos items (50ms delay entre cada)
- Back button do dispositivo fecha o modal (useModalBack hook)

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/messages/components/NewChatModal.tsx`
- `/Users/vanta/prevanta/stores/socialStore.ts` (mutualFriends)

---

### 29. Arquivar/Silenciar Chat (ArchiveModal + swipe)

**Ponto de partida:** MessagesView -> swipe left em conversa -> botao "Arquivar"

**Caminho:** MessagesView -> swipe -> `ArchiveModal`

**O que o usuario ve:**
- Modal "Arquivar conversa"
- Texto: "A conversa com X sera movida para Arquivadas."
- Info: "Conversas arquivadas ficam silenciadas -- sem notificacoes de novas mensagens."
- Checkbox: "Manter arquivada mesmo com novas mensagens"
- Botoes: "Cancelar" e "Arquivar"

**Acoes possiveis:**
- Confirmar arquivo (com ou sem "manter arquivada")
- Cancelar

**Fluxo de silenciar:** Swipe left -> botao "Silenciar" / "Ativar" (acao direta, sem modal)

**Onde termina:** Conversa movida para tab "Arquivadas". Toast de confirmacao.

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/modules/messages/components/ArchiveModal.tsx`
- `/Users/vanta/prevanta/modules/messages/components/ChatListItem.tsx`
- `/Users/vanta/prevanta/stores/chatStore.ts` (archiveChat, unarchiveChat, muteChat, unmuteChat)

---

### 30. Denunciar no Chat (ReportModal)

**Ponto de partida:** ChatRoomView -> menu "..." -> "Denunciar"

**Caminho:** ChatRoomView -> `ReportModal` (tipo CHAT)

**O que o usuario ve:** (ver item 19 -- mesmo ReportModal, com tipo "conversa" e opcao de bloquear)

**Acoes possiveis:**
- Selecionar motivo
- Descrever (se Outro)
- Bloquear tambem
- Enviar

**Onde termina:** Modal fecha. Toast de confirmacao. Se bloqueou, conversa desaparece da lista (filtrada por bloqueados).

**Arquivos envolvidos:**
- `/Users/vanta/prevanta/components/ReportModal.tsx`
- `/Users/vanta/prevanta/services/reportBlockService.ts`

---

## Resumo de Navegacao entre Modulos

```
ProfileView (MAIN)
  |-- EditProfileView (EDIT_PROFILE)
  |-- PreferencesView (PREFERENCES)
  |-- HistoricoView (HISTORICO)
  |-- WalletView (MINHA_EXPERIENCIA)
  |     |-- WalletLockScreen (PIN)
  |     |-- EventTicketsCarousel
  |     |     |-- TicketQRModal (QR Code)
  |     |     |-- TransferirModal
  |     |     |-- ReembolsoModal
  |     |-- PresencaList
  |     |-- TicketList
  |-- PublicProfilePreviewView (PREVIEW_PUBLIC / PREVIEW_FRIENDS)
  |     |-- ReportModal
  |-- MinhasPendenciasView (PENDENCIAS)
  |     |-- TabSolicitacoesParceria
  |     |-- TabAmizadesPendentes
  |     |-- TabEventosPrivados
  |-- MinhasSolicitacoesView (MINHAS_SOLICITACOES)
  |-- ComprovanteMeiaSection (MEIA_ENTRADA)
  |-- ClubeOptInView (CLUBE)
  |-- SolicitarParceriaView (SOLICITAR_PARCERIA)
  |-- BloqueadosView (BLOQUEADOS)
  |-- MoodPicker (modal)
  |-- Alterar Senha (modal)
  |-- Excluir Conta (modal)
  |-- Redefinir PIN (modal)

MessagesView
  |-- NewChatModal
  |-- ChatRoomView
  |     |-- PublicProfilePreviewView (modal overlay)
  |     |-- ReportModal
  |     |-- Delete confirmation modal
  |-- ArchiveModal
```

---

## Apendice A -- Mapa de Navegacao Completo

```
VANTA App
|
+-- [TabBar] -----------------------------------------------+
|   |                                                        |
|   +-- INICIO (HomeView)                                    |
|   |   +-- Saudacao + Banner MV                             |
|   |   +-- Highlights (carrossel)                           |
|   |   +-- Proximos Eventos --> "Ver todos" -> AllEventsView|
|   |   +-- Indica pra Voce --> cards de evento              |
|   |   +-- Mais Vendidos --> cards de evento                 |
|   |   +-- Beneficios MV --> "Ver todos" -> AllBeneficiosView|
|   |   +-- Descubra Cidades --> CityView                    |
|   |   +-- Locais Parceiros --> "Ver todos" -> AllPartnersView|
|   |   +-- [Header]                                         |
|   |       +-- Avatar -> Perfil                             |
|   |       +-- CitySelector (dropdown)                      |
|   |       +-- Sino -> NotificationPanel                    |
|   |       +-- Filtros -> HomeFilterOverlay                  |
|   |                                                        |
|   +-- RADAR (RadarView)                                    |
|   |   +-- Mapa (Leaflet) com pins de eventos               |
|   |   +-- Filtros de categoria                             |
|   |   +-- PremiumCalendar (MV only)                        |
|   |   +-- Pin -> EventCard -> EventDetailView              |
|   |                                                        |
|   +-- BUSCAR (SearchView)                                  |
|   |   +-- Campo de busca                                   |
|   |   +-- Sub-tabs: Eventos | Pessoas | Lugares | MV       |
|   |   +-- Filtros: Preco, Vibe, Horario, Cidade            |
|   |   +-- Resultado -> EventDetailView / PublicProfile     |
|   |                                                        |
|   +-- MENSAGENS (MessagesView)                             |
|   |   +-- Lista de conversas                               |
|   |   +-- Conversa -> ChatView                             |
|   |   +-- (Guest bloqueado)                                |
|   |                                                        |
|   +-- PERFIL (ProfileView)                                 |
|       +-- SubViews: EDIT, PREFERENCES, CLUBE, PENDENCIAS   |
|       +-- MEIA_ENTRADA, BLOQUEADOS, PREVIEW_PUBLIC         |
|       +-- SOLICITAR_PARCERIA, MINHA_EXPERIENCIA            |
|       +-- (Guest -> AuthModal)                             |
|                                                            |
+-- [Overlays / Modais] ------------------------------------+
|   +-- EventDetailView (fullscreen overlay)                 |
|   +-- CheckoutPage -> SuccessScreen                        |
|   +-- AuthModal / LoginView                                |
|   +-- OnboardingView                                       |
|   +-- ComunidadePublicView                                 |
|   +-- WaitlistModal, ReviewModal, ReportModal              |
|   +-- InviteFriendsModal, PresencaConfirmationModal        |
|   +-- MaisVantaBeneficioModal                              |
|   +-- GuestAreaModal, SessionExpiredModal                  |
|   +-- PmfSurveyModal, TosAcceptModal                      |
|   +-- WalletLockScreen, TicketQRModal                      |
|   +-- TransferenciaFlow                                    |
|                                                            |
+-- [Rotas Publicas] --------------------------------------+
    +-- /e/:slug -> EventLandingPage                         |
    +-- /convite/:code -> AceitarConviteMVPage               |
    +-- /termos -> LegalView                                 |
    +-- /privacidade -> LegalView                            |
+-----------------------------------------------------------+
```

---

## Apendice B -- Tabela de Z-Index

| Camada | z-index | Componentes |
|--------|---------|-------------|
| Conteudo base | 0 | HomeView, RadarView, SearchView, ProfileView |
| Cards e secoes | 1-9 | EventCard, section headers |
| Header fixo | 10 | Layout Header |
| TabBar fixa | 10 | Layout TabBar |
| Notification Panel | 20 | NotificationPanel (slide-in) |
| CitySelector dropdown | 20 | CitySelector (dropdown overlay) |
| HomeFilterOverlay | 30 | HomeFilterOverlay (fullscreen overlay) |
| Event Detail | 40 | EventDetailView (fullscreen overlay) |
| Checkout | 50 | CheckoutPage (fullscreen) |
| Modais de acao | 50 | WaitlistModal, ReviewModal, ReportModal, InviteFriendsModal |
| Auth modais | 60 | AuthModal, LoginView, GuestAreaModal |
| Session/TOS modais | 70 | SessionExpiredModal, TosAcceptModal, PmfSurveyModal |
| Wallet Lock | 80 | WalletLockScreen (PIN entry) |
| Toast notifications | 90 | Toast/Sonner |
| Loading overlay | 100 | LoadingFallback (icone VANTA girando) |

**Regra geral:** Modais usam `absolute inset-0` (nunca `fixed`). Excecao: rotas standalone (`/e/:slug`) podem usar `fixed`.

---

## Apendice C -- Fluxos por Persona

### Guest (nao logado)

**Acessa livremente:**
- Home (secoes publicas: Proximos Eventos, Locais Parceiros, Descubra Cidades + Banner "Crie sua conta" com CTA)
- Selecionar cidade
- Ver todos os eventos (AllEventsView)
- Ver cidade especifica (CityView)
- Ver todos os parceiros (AllPartnersView)
- Ver detalhe de evento (EventDetailView)
- Radar (mapa com pins)
- Buscar eventos e lugares
- Landing page de evento (/e/:slug)

**Bloqueado (abre GuestAreaModal):**
- Notificacoes
- Favoritar evento
- Comprar ingresso / Checkout
- Confirmar presenca
- Convidar amigos
- Avaliar evento
- Denunciar evento
- Mensagens (tab inteira)
- Perfil (tab inteira)
- Buscar pessoas
- Lista de espera
- Seguir comunidade
- Qualquer interacao social

---

### Membro (logado, sem MAIS VANTA)

**Tudo do Guest, mais:**
- Notificacoes (NotificationPanel)
- Favoritar evento
- Comprar ingresso (checkout completo)
- Confirmar presenca
- Convidar amigos
- Avaliar eventos passados
- Denunciar evento
- Mensagens (lista + chat)
- Perfil completo (editar, preferencias, historico)
- Buscar pessoas
- Enviar/aceitar amizade
- Bloquear/denunciar usuario
- Carteira (ingressos, QR code, transferencia)
- Lista de espera
- Seguir comunidade
- Mood/Status
- Solicitar parceria
- Meia-entrada (enviar comprovante)
- Minhas Pendencias
- Exportar dados (LGPD)
- Deletar conta

**Nao acessa:**
- Beneficios MAIS VANTA (ve CTA para assinar)
- PremiumCalendar no Radar
- Preco especial Inter/MV em eventos

---

### Membro MAIS VANTA (logado + assinante MV)

**Tudo do Membro, mais:**
- Banner "Seus Beneficios" na Home
- Secao Beneficios MV na Home e no Detalhe do Evento
- AllBeneficiosView (todos os beneficios)
- Preco especial em eventos (badge "Preco MV")
- PremiumCalendar no Radar (calendario premium)
- Badge Crown no perfil e na foto
- Borda dourada na foto de perfil
- Card "Membro Ativo" no perfil
- Acesso a beneficios exclusivos de parceiros
- Selo de membro MAIS VANTA visivel para outros usuarios

---

### Admin (logado + role admin/gerente/master)

**Tudo do Membro (ou MV se assinante), mais:**
- Botao "Painel Admin" no Perfil
- Icone de escudo dourado no Header (acesso rapido ao admin)
- Borda roxa na foto de perfil
- Painel administrativo completo (fora do escopo deste livro -- documentado separadamente)

> **Nota:** Este livro documenta APENAS os fluxos do usuario final. O painel admin tem documentacao propria.
