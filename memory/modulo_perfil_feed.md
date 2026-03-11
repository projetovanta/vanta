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

### Home / Feed (modules/home/, 1024L total)
| Arquivo | Linhas | Funcao |
|---|---|---|
| HomeView.tsx | 263 | Tela principal do feed |
| components/EventFeed.tsx | 184 | Feed de eventos com infinite scroll |
| components/Highlights.tsx | 221 | Destaques (Vanta Indica) |
| components/LiveNowSection.tsx | 52 | Eventos ao vivo agora |
| components/NearYouSection.tsx | 70 | Eventos perto de voce |
| components/ThisWeekSection.tsx | 33 | Eventos esta semana |
| components/ForYouSection.tsx | 69 | Eventos pra voce (personalizado) |
| components/NewOnPlatformSection.tsx | 37 | Novos na plataforma |
| components/SavedEventsSection.tsx | 35 | Eventos salvos |
| components/QuickActions.tsx | 60 | Acoes rapidas |

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
| EditProfileView.tsx | 666 | Editar perfil (nome, bio, foto, cidade, interesses) |
| PublicProfilePreviewView.tsx | 747 | Perfil publico (outro usuario) |
| HistoricoView.tsx | 259 | Historico de eventos + conquistas |
| PreferencesView.tsx | 83 | Preferencias do usuario |
| ClubeOptInView.tsx | 785 | Entrar no MAIS VANTA |
| ComprovanteMeiaSection.tsx | 494 | Upload comprovante meia-entrada |
| components/InterestSelector.tsx | 305 | Seletor de interesses |
| components/ImageCropperModal.tsx | 148 | Crop de foto |
| utils/imageUtils.ts | 44 | Compress + crop de imagem |

### Auth / Cadastro (components/auth/ + components/)
| Arquivo | Funcao |
|---|---|
| AuthModal.tsx | Cadastro Nivel 1: email, senha, nome, telefone (DDD+numero), data nascimento, termos. Ken Burns bg. ~350L |
| auth/FieldError.tsx | Componente de erro de campo |
| auth/authHelpers.ts | Validadores: isValidDate, isAdult, isValidEmail, isValidCPF, formatadores: fmtDataNasc, fmtTelefone, fmtCPF |
| CompletarPerfilCPF.tsx | Modal CPF (Nivel 2) — exibido no checkout se profile nao tem CPF. Valida CPF, salva no Supabase |

### Perfil Progressivo (3 niveis)
- **Nivel 1 (signup)**: email, senha, nome, telefone, data nascimento, termos — campos obrigatorios
- **Nivel 2 (primeira compra)**: CPF — coletado via CompletarPerfilCPF no checkout
- **Nivel 3 (sob demanda)**: genero, instagram, foto, cidade, estado — editaveis em EditProfileView
- Avatar padrao: NEUTRO (silhueta) ate usuario enviar foto ou definir genero
- Genero: MASCULINO, FEMININO, PREFIRO_NAO_DIZER (opcional, Nivel 3)
- Coluna `cpf` em profiles: text, unique (parcial), constraint 11 digitos

## Fluxos

### FEED HOME
**Quem**: Usuario logado
**Navegacao**: Bottom nav "Home" -> HomeView
**O que acontece**:
1. useExtrasStore.allEvents → eventos publicados da cidade selecionada
2. Secoes renderizadas: Highlights (Vanta Indica), LiveNow, NearYou, ThisWeek, ForYou, NewOnPlatform, Saved
3. Infinite scroll (getEventosPaginated server-side)
4. Cada secao limitada a 8 eventos + card "Ver Mais"

### BUSCA
**Quem**: Usuario
**Navegacao**: Bottom nav "Busca" ou HomeView -> QuickActions -> Busca
**O que acontece**:
1. Tabs: EVENTS (default) ou PEOPLE
2. Filtros: cidade, estilo/categoria (VibeFilterModal), horario, preco max, beneficios MV
3. Busca server-side via searchEventos()
4. PEOPLE: busca por nome em profiles

### RADAR (mapa)
**Quem**: Usuario com localizacao ativada
**Navegacao**: Busca -> Radar
**O que acontece**: RPC get_eventos_por_regiao retorna eventos com coords, renderiza no mapa

### VER PERFIL PROPRIO
**Quem**: Usuario logado
**Navegacao**: Bottom nav "Perfil" -> ProfileView
**O que acontece**: exibe foto, nome, bio, cidade, conquistas, badges, comunidades seguidas, MAIS VANTA status

### EDITAR PERFIL
**Quem**: Usuario logado
**Navegacao**: ProfileView -> EditProfileView
**O que acontece**: editar nome, bio, foto (crop), cidade, interesses
**Reacao**: UPDATE profiles

### VER PERFIL PUBLICO
**Quem**: Qualquer usuario
**Navegacao**: Busca -> clica pessoa / EventDetail -> clica participante / Chat -> clica usuario
**O que acontece**: PublicProfilePreviewView mostra dados publicos + status amizade + conquistas
**Se clicar no proprio perfil**: guardedOpenMemberProfile redireciona para tab PERFIL. Se chegar ao preview por outro caminho, isOwner=true mostra botao "Editar Perfil" em vez de "Adicionar Amigo"

### HISTORICO
**Quem**: Usuario logado
**Navegacao**: ProfileView -> Historico
**O que acontece**: lista eventos passados com presenca confirmada + conquistas desbloqueadas

### PREFERENCIAS
**Quem**: Usuario logado
**Navegacao**: ProfileView -> Preferencias
**O que acontece**: PreferencesView (83L) — configuracoes basicas

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
| 1 | Feed com secoes | OK | 8 secoes na HomeView |
| 2 | Infinite scroll | OK | getEventosPaginated server-side |
| 3 | Limite 8 por secao | OK | Card "Ver Mais" |
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
| 17 | Onboarding | OK | OnboardingView.tsx 119L (welcome flow pos-signup) |
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
| 28 | SubView SOLICITAR_PARCERIA | OK | ProfileSubView em types/auth.ts |
| 29 | SubView MINHAS_SOLICITACOES | OK | MinhasSolicitacoesView.tsx (Privados + Comemoracoes com timeline + progresso vendas) |
