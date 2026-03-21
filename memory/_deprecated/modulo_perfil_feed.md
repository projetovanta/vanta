# Criado: 2026-03-06 01:41 | Ultima edicao: 2026-03-06 01:41

# Modulo: Perfil + Feed + Busca + Radar

## O que e
Perfil = tela do usuario (editar dados, foto, historico, conquistas, preferencias, clube).
Feed = home do app (secoes de eventos: ao vivo, perto, semana, salvos, pra voce, novos, destaques).
Busca = pesquisa de eventos + pessoas com filtros (cidade, estilo, horario, preco).
Radar = mapa de eventos por geolocalizacao.

## Stores consumidas
- `useAuthStore` — currentAccount, profile, selectedCity
- `useTicketsStore` — myTickets, myPresencas
- `useExtrasStore` — allEvents, savedEvents
- `useSocialStore` — friendships (perfil publico)

## Arquivos

### Home / Feed (modules/home/)
| Arquivo | Funcao |
|---|---|
| HomeView.tsx | Tela principal — 6 seções com queries independentes |
| AllEventsView.tsx | Overlay: listagem paginada (tabs futuros/passados) |
| CityView.tsx | Overlay: mini-Home filtrada por cidade |
| AllPartnersView.tsx | Overlay: lista paginada de parceiros |
| components/Highlights.tsx | Destaques (VANTA Indica) — carrossel curado, 6 handlers |
| components/EventCarousel.tsx | Carrossel horizontal com onViewAll + maxCards |
| components/ProximosEventosSection.tsx | Próximos eventos da cidade (RPC server-side) |
| components/MaisVendidosSection.tsx | Top 10 mais vendidos 24h |
| components/LocaisParceiroSection.tsx | Comunidades ativas na cidade |
| components/DescubraCidadesSection.tsx | Cidades com eventos (exceto atual) |
| components/IndicaPraVoceSection.tsx | Eventos por interesses do usuário (só logado) |
| components/LazySection.tsx | Renderização lazy (IntersectionObserver) |

### Busca (modules/search/, 1355L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| SearchView.tsx | 409 | Tela de busca com tabs EVENTS/PEOPLE |
| components/SearchHeader.tsx | 142 | Header com filtros |
| components/SearchResults.tsx | 104 | Resultados de eventos |
| components/PeopleResults.tsx | 41 | Resultados de pessoas |
| components/CityFilterModal.tsx | 63 | Filtro por cidade |
| components/VibeFilterModal.tsx | 160 | Filtro por estilo/categoria |
| components/TimeFilterModal.tsx | 323 | Filtro por horario |
| components/PriceFilterModal.tsx | 113 | Filtro por preco |

### Perfil (modules/profile/, 4263L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| ProfileView.tsx | ~750 | Tela principal do perfil |
| MinhasSolicitacoesView.tsx | ~390 | Minhas solicitacoes (Privados + Comemoracoes) |
| MinhasPendenciasView.tsx | ~490 | Minhas Pendencias (3 abas: Parcerias + Amizades + Eventos Privados) |
| EditProfileView.tsx | 666 | Editar perfil (nome, bio, foto, cidade, interesses) |
| PublicProfilePreviewView.tsx | 747 | Perfil publico (outro usuario) |
| HistoricoView.tsx | 259 | Historico de eventos + conquistas |
| PreferencesView.tsx | 83 | Preferencias do usuario |
| ClubeOptInView.tsx | 785 | Entrar no MAIS VANTA |
| ComprovanteMeiaSection.tsx | 494 | Upload comprovante meia-entrada |
| components/InterestSelector.tsx | 305 | Seletor de interesses |
| components/ImageCropperModal.tsx | 148 | Crop de foto |
| utils/imageUtils.ts | 44 | Compress + crop de imagem |

### Auth / Cadastro (components/)
| Arquivo | Funcao |
|---|---|
| components/AuthModal.tsx | Cadastro Nivel 1: email/senha OU login social (Apple/Google) + nome, data nascimento, termos. Ken Burns bg |
| components/LoginView.tsx | Tela de login: botões Apple + Google + email/senha + recuperar senha |
| components/CompletarPerfilSocial.tsx | Tela pós-login social: data nascimento + aceitar termos |
| components/OnboardingView.tsx | Onboarding: vitrine → cadastro → cidade → interesses → boas-vindas |
| components/auth/FieldError.tsx | Componente de erro de campo |
| components/auth/authHelpers.ts | Validadores e formatadores (CPF, data, email, telefone) |
| components/CompletarPerfilCPF.tsx | Modal CPF (Nivel 2) — exibido no checkout se profile nao tem CPF |

### Perfil Progressivo (3 niveis)
- **Nivel 1 (signup)**: email/senha OU login social (Apple/Google). Social: 1 tap + completar data nascimento + termos
- **Nivel 2 (primeira compra)**: CPF (CompletarPerfilCPF) + Telefone (modal inline no checkout)
- **Nivel 3 (sob demanda)**: genero, instagram, foto, cidade, estado — editaveis em EditProfileView
- Avatar padrao: NEUTRO (silhueta) ate usuario enviar foto ou definir genero
- Genero: MASCULINO, FEMININO, PREFIRO_NAO_DIZER (opcional, Nivel 3)
- Coluna `cpf` em profiles: text, unique (parcial), constraint 11 digitos

## Fluxos

### FEED HOME
**Quem**: Usuario logado ou guest
**Navegacao**: Bottom nav "Home" -> HomeView
**O que acontece**:
1. Cada seção faz query independente ao Supabase (RPCs server-side)
2. Seções: Highlights → Próximos Eventos → Mais Vendidos 24h → Locais Parceiros → Descubra Cidades → VANTA Indica pra Você
3. "Ver todos" no final do carrossel → abre overlay (AllEventsView, AllPartnersView)
4. Card de cidade → abre CityView (mini-Home por cidade)
5. Seção some quando 0 resultados

### BUSCA
**Quem**: Usuario
**Navegacao**: Bottom nav "Busca"
**O que acontece**:
1. Tabs: EVENTS (default) ou PEOPLE
2. Filtros: cidade, estilo/categoria (VibeFilterModal), horario, preco max, beneficios MV
3. Busca server-side via searchEventos()
4. PEOPLE: busca por nome em profiles

### RADAR (mapa)
**Quem**: Usuario com localizacao ativada
**Navegacao**: Busca -> Radar
**O que acontece**: RPC get_eventos_por_regiao retorna eventos com coords, renderiza no mapa

### VER PERFIL PROPRIO (redesign)
**Quem**: Usuario logado
**Navegacao**: Bottom nav "Perfil" -> ProfileView
**Tela principal**: foto+nome+badge MV → [Editar][Config] no header → Card "Minha Experiencia" + Card "MAIS VANTA" (separados) → Lista acoes (perfil publico, pendencias, meia-entrada, bloqueados) → Configuracoes (dados, preferencias, PIN, senha, ajuda) → Parceria → Sair
**Sub-views**: MAIN, EDIT_PROFILE, PREFERENCES, MINHA_EXPERIENCIA (absorveu WALLET+HISTORICO), CLUBE, MEIA_ENTRADA, PENDENCIAS, BLOQUEADOS, SOLICITAR_PARCERIA
**Removidos da tela**: botoes "Meu Historico" e "Minhas Solicitacoes" (absorvidos)

### EDITAR PERFIL
**Quem**: Usuario logado
**Navegacao**: ProfileView → botao [Editar] no header OU lista Configuracoes → "Dados Pessoais"
**O que acontece**: editar nome, bio, foto (crop), cidade, interesses
**Reacao**: UPDATE profiles

### VER PERFIL PUBLICO
**Quem**: Qualquer usuario
**Navegacao**: Busca -> clica pessoa / EventDetail -> clica participante / Chat -> clica usuario
**O que acontece**: PublicProfilePreviewView mostra dados publicos + status amizade + Crown MV ao lado do nome (se membro)

### PREFERENCIAS
**Quem**: Usuario logado
**Navegacao**: ProfileView → botao [Config] no header OU lista Configuracoes → "Preferencias"
**O que acontece**: PreferencesView — configuracoes basicas

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| App.tsx | Bottom nav renderiza Home/Search/Profile |
| EventCard | Componente compartilhado (feed + busca + radar) |
| EventDetailView | Clica no EventCard |
| Bottom nav | Badges (tickets, mensagens, notificacoes) |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Feed com secoes | OK | 6 seções com queries independentes (RPCs) |
| 2 | Paginação server-side | OK | Cada seção busca via RPC, AllEventsView com infinite scroll |
| 3 | Ver todos + overlays | OK | ViewAllCard no carrossel → AllEventsView/AllPartnersView/CityView |
| 4 | Highlights (Vanta Indica) | OK | Highlights 221L |
| 5 | Busca eventos | OK | SearchView 409L |
| 6 | Busca pessoas | OK | PeopleResults 41L |
| 7 | Filtros (cidade, estilo, horario, preco) | OK | 4 modais de filtro |
| 8 | Radar mapa | OK | RadarView + RPC get_eventos_por_regiao |
| 9 | Editar perfil | OK | EditProfileView 666L |
| 10 | Foto crop | OK | ImageCropperModal 148L |
| 11 | Perfil publico | OK | PublicProfilePreviewView 747L |
| 12 | Historico + conquistas | OK | HistoricoView 259L + achievementsService |
| 13 | Comprovante meia | OK | ComprovanteMeiaSection 494L |
| 14 | Interesses | OK | InterestSelector 305L |
| 15 | Clube opt-in | OK | ClubeOptInView 785L |
| 16 | PreferencesView | OK | 83L (basico) |
| 17 | Onboarding | OK | OnboardingView.tsx ~290L (slides + cidade + interesses + transição. Salva no banco) |
| 18 | Selfie de verificacao | REMOVIDO | Removido do signup (Perfil Progressivo). Portaria exibe selfie para conferencia visual |
| 19 | Favoritos | OK | evento_favoritos + favoritosService |
| 20 | Product Analytics | OK | analytics_events + analyticsService (batch tracking) |
| 21 | PMF Survey | OK | pmf_responses + PmfSurveyModal |
| 22 | Album de fotos perfil | OK | profile-albums bucket + photoService |
| 23 | Niveis de prestigio | OK | niveis_prestigio (4 niveis) + achievementsService |
| 24 | Notificacoes push config | NAO EXISTE | Sem toggle de push por tipo no app |
| 25 | Dark/light mode | NAO EXISTE | Apenas dark |
| 26 | Idioma | NAO EXISTE | Apenas pt-BR |
| 27 | CTA Parceiro VANTA | OK | Card no perfil (nao-gerente/master) -> SolicitarParceriaView |
| 28 | Exclusao de conta | OK | RPC anonimizar_conta() — anonimiza dados pessoais, mantém fiscais |
| 28b | Exportar meus dados (LGPD) | OK | RPC exportar_dados_usuario() + lgpdExportService + botão "Baixar meus dados" no ProfileView |
| 29 | Denunciar perfil | OK | ReportModal no PublicProfilePreviewView (tipo USUARIO + bloquear) |
| 28 | SubView SOLICITAR_PARCERIA | OK | ProfileSubView em types/auth.ts |
| 30 | Login social (Google/Apple) | OK (Google ATIVO, Apple aguarda conta Developer) | authService.signInWithSocial + botões LoginView/AuthModal + CompletarPerfilSocial + trigger handle_new_user. Google Cloud configurado no Supabase |
| 29 | SubView MINHAS_SOLICITACOES | OK | MinhasSolicitacoesView.tsx (Privados + Comemoracoes com timeline + progresso vendas) |
