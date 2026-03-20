# VANTA — Livro Tecnico Definitivo

> Documentacao completa do projeto VANTA (prevanta). 598 arquivos TS/TSX, 223 migrations SQL, 168 testes.
> Gerado em: 2026-03-20

---

## Sumario

### Prefacio
- [Prefacio](#prefacio)

### Capitulo 1 — Fundacao (Raiz + Config + Infra)
- [1.1 App.tsx — entry point principal](#1-apptsx-entry-point-principal)
- [1.2 index.tsx — bootstrap](#2-indextsx-bootstrap)
- [1.3 index.html](#3-indexhtml)
- [1.4 constants.ts](#4-constantsts)
- [1.5 types.ts — proxy de tipos](#5-typests-proxy-de-tipos)
- [1.6 utils.ts](#6-utilsts)
- [1.7 app.css](#7-appcss)
- [1.8 instrument.ts — Sentry](#8-instrumentts-sentry)
- [1.9 vite.config.ts](#9-viteconfigts)
- [1.10 vitest.config.ts](#10-vitestconfigts)
- [1.11 tsconfig.json](#11-tsconfigjson)
- [1.12 capacitor.config.ts](#12-capacitorconfigts)
- [1.13 knip.config.ts](#13-knipconfigts)
- [1.14 vercel.json](#14-verceljson)
- [1.15 package.json](#15-packagejson)
- [1.16 metadata.json](#16-metadatajson)
- [Pasta types/](#pasta-types)
  - [types/index.ts](#typesindexts-7-linhas)
  - [types/auth.ts](#typesauthts-201-linhas)
  - [types/eventos.ts](#typeseventosts-463-linhas)
  - [types/financeiro.ts](#typesfinanceirots-46-linhas)
  - [types/rbac.ts](#typesrbacts-122-linhas)
  - [types/social.ts](#typessocialts-31-linhas)
  - [types/clube.ts](#typesclubets-354-linhas)
  - [types/supabase.ts — auto-gerado](#typessupabasetsmd-6144-linhas-auto-gerado)
- [Pasta data/](#pasta-data)
  - [data/avatars.ts](#dataavatarsts-8-linhas)
  - [data/brData.ts](#databrdatats-104-linhas)
- [Pasta api/ — Vercel Serverless Functions](#pasta-api-vercel-serverless-functions)
  - [api/og.ts](#apiogts-90-linhas)
  - [api/robots.ts](#apirobotsrs-20-linhas)
  - [api/sitemap.xml.ts](#apisitemapxmlts-71-linhas)
- [Pasta ios/](#pasta-ios)
  - [ios/App/App/Info.plist](#iosappappinfoplist-57-linhas)
  - [ios/App/App/capacitor.config.json](#iosappappcapacitorconfigjson-34-linhas)
  - [ios/App/App/config.xml](#iosappappconfigxml-5-linhas)
- [Pasta audit-reports/](#pasta-audit-reports)

### Capitulo 2 — Componentes Compartilhados (62 componentes)
- [2.1 AppModals](#1-appmodals)
- [2.2 AuthModal](#2-authmodal)
- [2.3 BatchActionBar](#3-batchactionbar)
- [2.4 BottomSheet](#4-bottomsheet)
- [2.5 CelebrationScreen](#5-celebrationscreen)
- [2.6 CityCard](#6-citycard)
- [2.7 CompletarPerfilCPF](#7-completarperfilcpf)
- [2.8 CompletarPerfilSocial](#8-completarperfilsocial)
- [2.9 DevLogPanel](#9-devlogpanel)
- [2.10 DevQuickLogin](#10-devquicklogin)
- [2.11 EmptyState](#11-emptystate)
- [2.12 ErrorBoundary](#12-errorboundary)
- [2.13 EventCard](#13-eventcard)
- [2.14 HorarioFuncionamentoEditor](#14-horariofuncionamentoeditor)
- [2.15 HorarioOverridesEditor](#15-horariooverrideseditor)
- [2.16 HorarioPublicDisplay](#16-horariopublicdisplay)
- [2.17 ImageCropModal](#17-imagecropmodal)
- [2.18 Layout (TabBar + Header)](#18-layout)
- [2.19 LegalView](#19-legalview)
- [2.20 LoginView](#20-loginview)
- [2.21 ModuleErrorBoundary](#21-moduleerrorboundary)
- [2.22 MoodPicker](#22-moodpicker)
- [2.23 NotFoundView](#23-notfoundview)
- [2.24 OnboardingView](#24-onboardingview)
- [2.25 OptimizedImage](#25-optimizedimage)
- [2.26 PartnerCard](#26-partnercard)
- [2.27 PmfSurveyModal](#27-pmfsurveymodal)
- [2.28 ProtectedRoute](#28-protectedroute)
- [2.29 PushPermissionBanner](#29-pushpermissionbanner)
- [2.30 ReportModal](#30-reportmodal)
- [2.31 ResetPasswordView](#31-resetpasswordview)
- [2.32 RestrictedModal](#32-restrictedmodal)
- [2.33 ReviewModal](#33-reviewmodal)
- [2.34 SectionFilterChips](#34-sectionfilterchips)
- [2.35 SessionExpiredModal](#35-sessionexpiredmodal)
- [2.36 Skeleton](#36-skeleton)
- [2.37 Toast](#37-toast)
- [2.38 TosAcceptModal](#38-tosacceptmodal)
- [2.39 UnsavedChangesModal](#39-unsavedchangesmodal)
- [2.40 VantaColorPicker](#40-vantacolorpicker)
- [2.41 VantaConfirmModal](#41-vantaconfirmmodal)
- [2.42 VantaDatePicker](#42-vantadatepicker)
- [2.43 VantaDropdown](#43-vantadropdown)
- [2.44 VantaPickerModal](#44-vantapickermodal)
- [2.45 VantaSlider](#45-vantaslider)
- [2.46 VantaTimePicker](#46-vantatimepicker)
- [2.47 ViewAllCard](#47-viewallcard)
- [2.48 auth/FieldError](#48-authfielderror)
- [2.49 auth/authHelpers](#49-authauthhelpers)
- [2.50 form/AccordionSection](#50-formaccordionsection)
- [2.51 form/InputField](#51-forminputfield)
- [2.52 form/SectionTitle](#52-formsectiontitle)
- [2.53 form/TextAreaField](#53-formtextareafield)
- [2.54 form/UploadArea](#54-formuploadarea)
- [2.55 form/index](#55-formindex)
- [2.56 wizard/DraftBanner](#56-wizarddraftbanner)
- [2.57 wizard/FormWizard](#57-wizardformwizard)
- [2.58 wizard/StepIndicator](#58-wizardstepindicator)
- [2.59 wizard/index](#59-wizardindex)
- [2.60 Home/CitySelector](#60-homecityselector)
- [2.61 Home/NotificationPanel](#61-homenotificationpanel)
- [2.62 Profile/ProfilePreviewControls](#62-profileprofilepreviewcontrols)
- [Resumo Estatistico Cap. 2](#resumo-estatistico)

### Capitulo 3 — Modulos do Usuario (75 arquivos)
- [3.1 CHECKOUT](#1-checkout-modulescheckout)
  - [CheckoutPage.tsx](#11-checkoutpagetsx)
  - [CheckoutSuccessPage.tsx](#12-checkoutsuccesspagetsx)
  - [SuccessScreen.tsx](#13-successscreentsx)
  - [WaitlistModal.tsx](#14-waitlistmodaltsx)
- [3.2 COMMUNITY](#2-community-modulescommunity)
  - [ComemoracaoFormView.tsx](#21-comemoracaoformviewtsx)
  - [EventoPrivadoFormView.tsx](#22-eventoprivadoformviewtsx)
  - [ComunidadePublicView.tsx](#23-comunidadepublicviewtsx)
- [3.3 CONVITE](#3-convite-modulesconvite)
  - [AceitarConviteMVPage.tsx](#31-aceitarconvitemvpagetsx)
- [3.4 EVENT-DETAIL](#4-event-detail-modulesevent-detail)
  - [EventDetailView.tsx](#41-eventdetailviewtsx)
  - [EventFooter.tsx](#42-eventfootertsx)
  - [EventHeader.tsx](#43-eventheadertsx)
  - [EventInfo.tsx](#44-eventinfotsx)
  - [EventSocialProof.tsx](#45-eventsocialprooftsx)
  - [InviteFriendsModal.tsx](#46-invitefriendsmodaltsx)
  - [MaisVantaBeneficioModal.tsx](#47-maisvantabeneficiomodaltsx)
  - [PresencaConfirmationModal.tsx](#48-presencaconfirmationmodaltsx)
- [3.5 HOME](#5-home-moduleshome)
  - [HomeView.tsx](#51-homeviewtsx)
  - [AllBeneficiosView.tsx](#52-allbeneficiosviewtsx)
  - [AllEventsView.tsx](#53-alleventsviewtsx)
  - [AllPartnersView.tsx](#54-allpartnersviewtsx)
  - [CityView.tsx](#55-cityviewtsx)
  - [components/Highlights.tsx](#56-componentshighlightstsx)
  - [components/HomeFilterOverlay.tsx](#57-componentshomefilteroverlaytsx)
  - [components/EventCarousel.tsx](#58-componentseventcarouseltsx)
  - [components/ProximosEventosSection.tsx](#59-componentsprximoseventossectiontsx)
  - [components/MaisVendidosSection.tsx](#510-componentsmaisvendidossectiontsx)
  - [components/IndicaPraVoceSection.tsx](#511-componentsindicapravocesectiontsx)
  - [components/BeneficiosMVSection.tsx](#512-componentsbeneficiosmvsectiontsx)
  - [components/LocaisParceiroSection.tsx](#513-componentslocaisparceirosectiontsx)
  - [components/DescubraCidadesSection.tsx](#514-componentsdescubracidadessectiontsx)
  - [components/LazySection.tsx](#515-componentslazysectiontsx)
  - [utils/filterSubCarousels.ts](#516-utilsfiltersubcarouselsts)
- [3.6 LANDING](#6-landing-moduleslanding)
  - [EventLandingPage.tsx](#61-eventlandingpagetsx)
- [3.7 MESSAGES](#7-messages-modulesmessages)
  - [MessagesView.tsx](#71-messagesviewtsx)
  - [components/ChatRoomView.tsx](#72-componentschatroomviewtsx)
  - [components/ChatListItem.tsx](#73-componentschatlistitemtsx)
  - [components/MessageBubble.tsx](#74-componentsmessagebubbletsx)
  - [components/ArchiveModal.tsx](#75-componentsarchivemodaltsx)
  - [components/NewChatModal.tsx](#76-componentsnewchatmodaltsx)
- [3.8 PARCEIRO](#8-parceiro-modulesparceiro)
  - [ParceiroDashboardPage.tsx](#81-parceirodashboardpagetsx)
  - [parceiroService.ts](#82-parceiroservicets)
- [3.9 PROFILE](#9-profile-modulesprofile)
  - [ProfileView.tsx](#91-profileviewtsx)
  - [PublicProfilePreviewView.tsx](#92-publicprofilepreviewviewtsx)
  - [EditProfileView.tsx](#93-editprofileviewtsx)
  - [HistoricoView.tsx](#94-historicoviewtsx)
  - [MinhasPendenciasView.tsx](#95-minhaspendenciasviewtsx)
  - [MinhasSolicitacoesView.tsx](#96-minhassolicitacoesviewtsx)
  - [ClubeOptInView.tsx](#97-clubeoptinviewtsx)
  - [ComprovanteMeiaSection.tsx](#98-comprovantemeiaasectiontsx)
  - [BloqueadosView.tsx](#99-bloqueadosviewtsx)
  - [PreferencesView.tsx](#910-preferencesviewtsx)
  - [components/ImageCropperModal.tsx](#911-componentsimagecroppermodaltsx)
  - [components/InterestSelector.tsx](#912-componentsinterestselectortsx)
  - [components/TabAmizadesPendentes.tsx](#913-componentstabamizadespendentestsx)
  - [components/TabEventosPrivados.tsx](#914-componentstabeventosprivadostsx)
  - [components/TabSolicitacoesParceria.tsx](#915-componentstabsolicitacoesparceriatsx)
  - [utils/imageUtils.ts](#916-utilsimageutilsts)
- [3.10 RADAR](#10-radar-modulesradar)
  - [RadarView.tsx](#101-radarviewtsx)
  - [hooks/useRadarLogic.ts](#102-hooksuseradarlogicts)
  - [components/MapController.tsx](#103-componentsmapcontrollertsx)
  - [components/PremiumCalendar.tsx](#104-componentspremiumcalendartsx)
  - [utils/mapIcons.ts](#105-utilsmapIconsts)
- [3.11 SEARCH](#11-search-modulessearch)
  - [SearchView.tsx](#111-searchviewtsx)
  - [components/SearchHeader.tsx](#112-componentssearchheadertsx)
  - [components/SearchResults.tsx](#113-componentssearchresultstsx)
  - [components/BeneficiosMVTab.tsx](#114-componentsbeneficiosmvtabtsx)
  - [components/CityFilterModal.tsx](#115-componentscityfiltermodaltsx)
  - [components/VibeFilterModal.tsx](#116-componentsvibefiltermodaltsx)
  - [components/TimeFilterModal.tsx](#117-componentstimefiltermodaltsx)
  - [components/PriceFilterModal.tsx](#118-componentspricefiltermodaltsx)
  - [components/PeopleResults.tsx](#119-componentspeopleresultstsx)
  - [components/PlacesResults.tsx](#1110-componentsplacesresultstsx)
- [3.12 WALLET](#12-wallet-moduleswallet)
  - [WalletView.tsx](#121-walletviewtsx)
  - [components/EventTicketsCarousel.tsx](#122-componentseventticketscarouseltsx)
  - [components/TicketList.tsx](#123-componentsticketlisttsx)
  - [components/TicketQRModal.tsx](#124-componentsticketqrmodaltsx)
  - [components/PresencaList.tsx](#125-componentspresencalisttsx)
  - [components/WalletLockScreen.tsx](#126-componentswalletlockscreentsx)
- [Resumo Geral Cap. 3](#resumo-geral)

### Capitulo 4 — Painel Admin — Views (170 arquivos)
- [4.1 Views Raiz (~49 arquivos)](#1-views-raiz-49-arquivos-19400-linhas)
  - [AnalyticsMaisVantaView.tsx](#analyticsmaisvantaviewtsx)
  - [AssinaturasMaisVantaView.tsx](#assinaturasmisvantaviewtsx)
  - [AuditLogView.tsx](#auditlogviewtsx)
  - [CaixaView.tsx](#caixaviewtsx)
  - [CategoriasAdminView.tsx](#categoriasadminviewtsx)
  - [CidadesMaisVantaView.tsx](#cidadesmaisvantaviewtsx)
  - [ComunidadesView.tsx](#comunidadesviewtsx)
  - [CondicoesProducerView.tsx](#condicoesproducerviewtsx)
  - [ConfigMaisVantaView.tsx](#configmaisvantaviewtsx)
  - [ConfigPlataformaView.tsx](#configplataformaviewtsx)
  - [ConvitesMaisVantaView.tsx](#convitesmaisvantaviewtsx)
  - [CriarComunidadeView.tsx](#criarcomunidadeviewtsx)
  - [CriarEventoView.tsx](#criareventoviewtsx)
  - [DatabaseHealthView.tsx](#databasehealthviewtsx)
  - [DealsMaisVantaView.tsx](#dealsmaisvantaviewtsx)
  - [DiagnosticoView.tsx](#diagnosticoviewtsx)
  - [DividaSocialMaisVantaView.tsx](#dividasocialmaisvantaviewtsx)
  - [EditarEventoView.tsx](#editareventoviewtsx)
  - [EventosGlobaisMaisVantaView.tsx](#eventosglobaismaisvantaviewtsx)
  - [EventosPendentesView.tsx](#eventospendentesviewtsx)
  - [FaqView.tsx](#faqviewtsx)
  - [GerenteDashboardView.tsx](#gerentedashboardviewtsx)
  - [GestaoComprovantesView.tsx](#gestaocomprovantesviewtsx)
  - [GestaoUsuariosView.tsx](#gestaousuariosviewtsx)
  - [InfracoesGlobaisMaisVantaView.tsx](#infracoesglomaisvantaviewtsx)
  - [LegalEditorView.tsx](#legaleditorviewtsx)
  - [LinksUteisView.tsx](#linksuteisviewtsx)
  - [MaisVantaHubView.tsx](#maisvantahubviewtsx)
  - [MasterFinanceiroView.tsx](#masterfinanceiroviewtsx)
  - [MembrosGlobaisMaisVantaView.tsx](#membrosglobaismaisvantaviewtsx)
  - [MeusEventosView.tsx](#meuseventosviewtsx)
  - [MonitoramentoMaisVantaView.tsx](#monitoramentomaisvantaviewtsx)
  - [NotificacoesAdminView.tsx](#notificacoesadminviewtsx)
  - [ParceirosMaisVantaView.tsx](#parceirosmaisvantaviewtsx)
  - [ParticipantesView.tsx](#participantesviewtsx)
  - [PassaportesMaisVantaView.tsx](#passaportesmaisvantaviewtsx)
  - [PendenciasAppView.tsx](#pendenciasappviewtsx)
  - [PendenciasHubView.tsx](#pendenciashubviewtsx)
  - [PlanosMaisVantaView.tsx](#planosmaisvantaviewtsx)
  - [PortariaScannerView.tsx](#portariascannerviewtsx)
  - [ProductAnalyticsView.tsx](#productanalyticsviewtsx)
  - [PromoterCotasView.tsx](#promotercotasviewtsx)
  - [PromoterDashboardView.tsx](#promoterdashboardviewtsx)
  - [SiteContentView.tsx](#sitecontentviewtsx)
  - [SolicitacoesParceriaView.tsx](#solicitacoesparceriaviewtsx)
  - [SolicitarParceriaView.tsx](#solicitarparceriaviewtsx)
  - [SupabaseDiagnosticView.tsx](#supabasediagnosticviewtsx)
  - [supabaseDiagnosticSchema.ts](#supabasediagnosticschemats)
  - [VantaIndicaView.tsx](#vantaindicaviewtsx)
- [4.2 Subpastas](#2-subpastas)
  - [caixa/ (2 arq, 824L)](#caixa-2-arquivos-824l)
  - [cargosPlataforma/ (1 arq, 423L)](#cargosplataforma-1-arquivo-423l)
  - [cargosUnificado/ (1 arq, 73L)](#cargosunificado-1-arquivo-73l)
  - [checkin/ (6 arq, 967L)](#checkin-6-arquivos-967l)
  - [comunidadeDashboard/ (6 arq, 770L)](#comunidadedashboard-6-arquivos-770l)
  - [comunidades/ (19 arq, 4.684L)](#comunidades-19-arquivos-4684l)
  - [criarComunidade/ (5 arq, 1.389L)](#criarcomunidade-5-arquivos-1389l)
  - [criarEvento/ (11 arq, 3.470L)](#criarevento-11-arquivos-3470l)
  - [curadoria/ (12 arq, 2.225L)](#curadoria-12-arquivos-2225l)
  - [definirCargos/ (7 arq, 1.193L)](#definircargos-7-arquivos-1193l)
  - [eventManagement/ (12 arq, 4.072L)](#eventmanagement-12-arquivos-4072l)
  - [eventoDashboard/ (13 arq, 3.823L)](#eventodashboard-13-arquivos-3823l)
  - [financeiro/ (6 arq, 1.470L)](#financeiro-6-arquivos-1470l)
  - [insightsDashboard/ (5 arq, 374L)](#insightsdashboard-5-arquivos-374l)
  - [listas/ (8 arq, 962L)](#listas-8-arquivos-962l)
  - [maisVanta/ (2 arq, 483L)](#maisvanta-2-arquivos-483l)
  - [maisVantaDashboard/ (7 arq, 716L)](#maisvantadashboard-7-arquivos-716l)
  - [masterDashboard/ (6 arq, 1.017L)](#masterdashboard-6-arquivos-1017l)
  - [masterFinanceiro/ (4 arq, 1.131L)](#masterfinanceiro-4-arquivos-1131l)
  - [PlanosProdutor/ (1 arq, 433L)](#planosprodutor-1-arquivo-433l)
  - [relatorios/ (8 arq, 1.525L)](#relatorios-8-arquivos-1525l)
- [4.3 Observacoes Gerais](#3-observacoes-gerais)

### Capitulo 5 — Painel Admin — Componentes + Services (117 arquivos)
- [5.1 permissoes.ts](#1-permissoests)
- [5.2 Components (raiz)](#2-components-raiz)
  - [AdminDashboardHome.tsx](#21-admindashboardhometsx)
  - [AdminSidebar.tsx](#22-adminsidebartsx)
  - [AdminViewHeader.tsx](#23-adminviewheadertsx)
  - [ExtratoFinanceiro.tsx](#24-extratofinanceirotsx)
  - [KpiCards.tsx](#25-kpicardstsx)
  - [OnboardingChecklist.tsx](#26-onboardingchecklisttsx)
  - [OnboardingWelcome.tsx](#27-onboardingwelcometsx)
  - [ResumoFinanceiroCard.tsx](#28-resumofinanceirocardtsx)
  - [VantaPieChart.tsx](#29-vantapicharttsx)
- [5.3 Components/dashboard/ (16 arquivos)](#3-componentsdashboard)
  - [BarChartCard, BreakdownCard, ComparisonCard, DashboardSkeleton, DrillBreadcrumb, ExportButton, FunnelChart, HeatmapCard, LeaderboardCard, LivePulse, MetricGrid, PeriodSelector, ProgressRing, SparklineCard, TimeSeriesChart](#31-indexts)
- [5.4 Components/insights/ (18 arquivos)](#4-componentsinsights)
  - [BenchmarkCard, BreakEvenCard, BuyerCommunicationCard, ChannelAttributionCard, ChurnRadarCard, InsightsEmptyState, LotacaoPrevisaoCard, LoyaltyProgramCard, NoShowCard, NoShowTrendCard, PricingSuggestionCard, PurchaseTimeCard, SmartTipsCard, SplitPreviewCard, TrendAlertCard, VantaValuePanel, VipScoreCard, WeeklyReportCard](#41-benchmarkcardtsx)
- [5.5 Services (raiz) — 37 arquivos](#5-services-raiz)
  - [IVantaService.ts](#51-ivantaservicets)
  - [adminService.ts](#52-adminservicets)
  - [assinaturaService.ts](#53-assinaturaservicets)
  - [auditService.ts](#54-auditservicets)
  - [campanhasService.ts](#55-campanhasservicets)
  - [cargosPlataformaService.ts](#56-cargosplataformaservicets)
  - [clubeService.ts](#57-clubeservicets)
  - [comprovanteService.ts](#58-comprovanteservicets)
  - [comunidadesService.ts](#59-comunidadesservicets)
  - [condicoesService.ts](#510-condicoesservicets)
  - [cortesiasService.ts](#511-cortesiasservicets)
  - [cuponsService.ts](#512-cuponsservicets)
  - [dashboardAnalyticsService.ts](#513-dashboardanalyticsservicets)
  - [eventosAdminAprovacao.ts](#514-eventosadminaprovacaots)
  - [eventosAdminCore.ts](#515-eventosadmincoreets)
  - [eventosAdminCrud.ts](#516-eventosadmincrudts)
  - [eventosAdminFinanceiro.ts](#517-eventosadminfinanceirots)
  - [eventosAdminService.ts](#518-eventosadminservicets)
  - [eventosAdminTickets.ts](#519-eventosadminticketsts)
  - [eventosAdminTypes.ts](#520-eventosadmintypests)
  - [fidelidadeService.ts](#521-fidelidadeservicets)
  - [indicaTemplatesService.ts](#522-indicatemplatesservicets)
  - [jwtService.ts](#523-jwtservicets)
  - [legalService.ts](#524-legalservicets)
  - [listasService.ts](#525-listasservicets)
  - [maisVantaConfigService.ts](#526-maisvantaconfigservicets)
  - [mesasService.ts](#527-mesasservicets)
  - [notificationsService.ts](#528-notificationsservicets)
  - [parceriaService.ts](#529-parceriaservicets)
  - [pendenciasService.ts](#530-pendenciasservicets)
  - [platformConfigService.ts](#531-platformconfigservicets)
  - [pushTemplatesService.ts](#532-pushtemplatesservicets)
  - [rbacService.ts](#533-rbacservicets)
  - [reembolsoService.ts](#534-reembolsoservicets)
  - [relatorioService.ts](#535-relatorioservicets)
  - [reviewsService.ts](#536-reviewsservicets)
  - [siteContentService.ts](#537-sitecontentservicets)
- [5.6 Services/analytics/ (6 arquivos)](#6-servicesanalytics)
  - [communityAnalyticsService, eventAnalyticsService, masterAnalyticsService, maisVantaAnalyticsService](#61-indexts)
- [5.7 Services/clube/ (20 arquivos)](#7-servicesclube)
  - [clubeCache, clubeCidadesService, clubeConfigService, clubeConviteEspecialService, clubeConvitesIndicacaoService, clubeConvitesService, clubeDealsService, clubeInfracoesService, clubeInstagramService, clubeLotesService, clubeMembrosService, clubeNotifProdutorService, clubeParceirosService, clubePassportService, clubePlanosService, clubeReservasService, clubeResgatesService, clubeSolicitacoesService, clubeTiersService](#71-indexts)
- [5.8 Services/insights/ (10 arquivos)](#8-servicesinsights)
  - [insightsEngine, financialIntelligence, operationsMarketing, smartTipsRules, valueCommunication](#81-indexts)
- [Resumo Quantitativo Cap. 5](#resumo-quantitativo)

### Capitulo 6 — Services, Stores, Hooks e Utils
- [Services](#services)
  - [analyticsService.ts](#1-analyticsservicets)
  - [authService.ts](#2-authservicets)
  - [behaviorService.ts](#3-behaviorservicets)
  - [circuitBreaker.ts](#4-circuitbreakerts)
  - [deepLinkService.ts](#5-deeplinkservicets)
  - [lgpdExportService.ts](#6-lgpdexportservicets)
  - [pushService.ts](#7-pushservicets)
  - [rateLimiter.ts](#8-ratelimiterts)
  - [supabaseClient.ts](#9-supabaseclientts)
  - [vantaService.ts](#10-vantaservicets)
- [Stores](#stores)
  - [authStore.ts](#1-authstorets)
  - [chatStore.ts](#2-chatstorets)
  - [extrasStore.ts](#3-extrasstorets)
- [Hooks](#hooks)
  - [useAppHandlers.ts](#1-useapphandlersts)
  - [useBloqueados.ts](#2-usebloqueadosts)
  - [useConnectivity.ts](#3-useconnectivityts)
  - [useDebounce.ts](#4-usedebouncets)
  - [useDevNavLogger.ts](#5-usedevnavloggerts)
  - [useDraft.ts](#6-usedraftts)
  - [useModalStack.ts](#7-usemodalstackts)
  - [useNavigation.ts](#8-usenavigationts)
  - [usePWA.ts](#9-usepwats)
  - [usePermission.ts](#10-usepermissionts)
  - [useSessionTimeout.ts](#11-usesessiontimeoutts)
- [Utils](#utils)
  - [cnpjValidator.ts](#1-cnpjvalidatorts)
  - [exportUtils.ts](#2-exportutilsts)
  - [platform.ts](#3-platformts)
  - [slug.ts](#4-slugts)
  - [ticketReceiptPdf.ts](#5-ticketreceiptpdfts)

### Capitulo 7 — Dashboard V2 + Tickets + Supabase
- [Parte 1: features/dashboard-v2/](#parte-1-featuresdashboard-v2)
  - [DashboardV2Gateway.tsx](#11-dashboardv2gatewaytsx)
  - [DashboardV2Home.tsx](#12-dashboardv2hometsx)
  - [VendasTimelineChart.tsx](#13-vendastimelinecharttsx)
  - [CommandPalette.tsx](#14-commandpalettetsx)
  - [SidebarV2.tsx](#15-sidebarv2tsx)
  - [CaixaHome.tsx](#16-caixahometsx)
  - [GerenteHome.tsx](#17-gerentehometsx)
  - [PanoramaHome.tsx](#18-panoramahometsx)
  - [PortariaHome.tsx](#19-portariahometsx)
  - [PromoterHome.tsx](#110-promoterhometsx)
  - [SocioHome.tsx](#111-sociohometsx)
- [Parte 2: features/tickets/](#parte-2-featurestickets)
  - [MyTicketsView.tsx](#21-myticketsviewtsx)
- [Parte 3: supabase/schema.sql](#parte-3-supabaseschemasql)
  - [Extensoes](#extensoes)
  - [ENUM Types (11)](#enum-types)
  - [Tabelas do Schema Base (19)](#tabelas-do-schema-base-19-tabelas)
  - [RPCs no Schema Base](#rpcs-no-schema-base)
  - [Helper Functions](#helper-functions)
  - [Realtime](#realtime)
- [Parte 4: Migrations (223 arquivos)](#parte-4-migrations-223-arquivos-cronologicas)
  - [2026-02-25 (4)](#2026-02-25-4-migrations) — [2026-02-26 (6)](#2026-02-26-6-migrations) — [2026-02-27 (12)](#2026-02-27-12-migrations) — [2026-02-28 (16)](#2026-02-28-16-migrations) — [2026-03-01 (18)](#2026-03-01-18-migrations) — [2026-03-02 (2)](#2026-03-02-2-migrations) — [2026-03-03 (14)](#2026-03-03-14-migrations) — [2026-03-04 (7)](#2026-03-04-7-migrations) — [2026-03-05 (14)](#2026-03-05-14-migrations) — [2026-03-06 (10)](#2026-03-06-10-migrations) — [2026-03-07 (11)](#2026-03-07-11-migrations) — [2026-03-08 (8)](#2026-03-08-8-migrations) — [2026-03-09 (2)](#2026-03-09-2-migrations) — [2026-03-10 (2)](#2026-03-10-2-migrations) — [2026-03-11 (17)](#2026-03-11-17-migrations) — [2026-03-12 (3)](#2026-03-12-3-migrations) — [2026-03-13 (22)](#2026-03-13-22-migrations) — [2026-03-14 (1)](#2026-03-14-1-migration) — [2026-03-15 (2)](#2026-03-15-2-migrations) — [2026-03-16 (2)](#2026-03-16-2-migrations) — [2026-03-17 (6)](#2026-03-17-6-migrations) — [2026-03-19 (8)](#2026-03-19-8-migrations) — [2026-03-20 (2)](#2026-03-20-2-migrations)

### Capitulo 8 — Testes, Scripts e Configuracoes
- [8.1 Testes](#1-testes)
  - [Testes E2E (Playwright) — 14 arq, 55 cases](#11-testes-e2e-playwright----usersvantaprevantatestsoe2e)
  - [Testes de Integracao (Vitest) — 3 arq, 38 cases](#12-testes-de-integracao-vitest----usersvantaprevantatestsintegration)
  - [Testes Unitarios (Vitest) — 9 arq, 75 cases](#13-testes-unitarios-vitest----usersvantaprevantatestsunit)
  - [Testes de Carga (k6) — 2 arq, 4 cenarios](#14-testes-de-carga-k6----usersvantaprevantatestsload)
- [8.2 Scripts](#2-scripts)
  - [Scripts Node.js (.mjs) — 14 scripts](#21-scripts-nodejs-mjs----usersvantaprevantascripts)
  - [Scripts Shell (.sh) — 7 scripts](#22-scripts-shell-sh----usersvantaprevantascripts)
  - [Script Master — full-audit.sh](#23-script-master----usersvantaprevantafull-auditsh)
- [8.3 Git Hooks (.husky/)](#3-git-hooks----usersvantaprevantahusky)
- [8.4 Scripts NPM (package.json)](#4-scripts-npm-packagejson)
- [8.5 Configuracoes](#5-configuracoes)
  - [ESLint](#51-eslint----usersvantaprevantaeslintconfigjs)
  - [Prettier](#52-prettier----usersvantaprevantaprettierrc)
  - [Playwright](#53-playwright----usersvantaprevantaplaywrightconfigts)
  - [Vitest](#54-vitest----usersvantaprevantavitestconfigts)
  - [Vite](#55-vite----usersvantaprevantaviteconfigts)
  - [TypeScript](#56-typescript----usersvantaprevantatsconfigjson)
  - [Knip](#57-knip----usersvantaprevantaknipconfigts)
  - [Capacitor](#58-capacitor----usersvantaprevantacapacitorconfigts)
  - [Gitleaks](#59-gitleaks----usersvantaprevantagitleakstoml)
- [8.6 Resumo Numerico](#6-resumo-numerico)

### Apendices
- [Apendice A — Indice de Arquivos (A-Z)](#apendice-a--indice-de-arquivos-a-z)
- [Apendice B — Glossario](#apendice-b--glossario)
- [Apendice C — Estatisticas](#apendice-c--estatisticas)

---

## Prefacio

O **VANTA** e uma plataforma de eventos e comunidades construida com:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **Mobile**: Capacitor (iOS/Android) + PWA
- **Pagamentos**: Stripe (Checkout Sessions + Webhooks)
- **Monitoramento**: Sentry (error tracking + performance)
- **Deploy**: Vercel (frontend) + Supabase Cloud (backend)
- **Testes**: Vitest (unit/integration) + Playwright (E2E)

A arquitetura segue o padrao de modulos por dominio, com stores Zustand para estado global, services para logica de negocio/API, hooks customizados para logica reutilizavel, e componentes compartilhados. O painel admin usa RBAC granular com permissoes por comunidade/evento.

Este livro documenta **cada arquivo** do projeto: o que faz, de quem depende, quem depende dele, exports, interfaces, e trechos de codigo relevantes.

---


## Capitulo 1

# Investigacao Completa — Arquivos Raiz e Infraestrutura do Prevanta

## 1. App.tsx (entry point principal)
**Caminho:** `/Users/vanta/prevanta/App.tsx`
**Linhas:** 815

**O que faz:** Componente raiz da aplicacao React. Gerencia:
- Layout master (container fixo com safe-areas iOS PWA)
- Sistema de rotas (React Router) com rotas standalone (/checkout, /evento, /convite-mv, /parceiro) e app shell com tab bar
- Inicializacao de todas as stores (auth, tickets, chat, social, extras)
- Escala fluida de font-size baseada na largura do container (360-500px)
- Deep links (Capacitor nativo) para EVENT, COMMUNITY, CHECKOUT, WALLET, PROFILE
- Native push listeners com cleanup
- Guard de authLoading stuck (8s timeout)
- Prefetch de lazy chunks via requestIdleCallback
- PMF survey modal (5s delay apos login)
- Tela de completar perfil social (quando falta dataNascimento)
- Loading state com spinner
- `isFocusView` controla overflow-hidden (regra critica do CLAUDE.md)
- Componente `AppShell` (linhas 651-815): Header, TabBar, overlays (AllEvents, CityView, AllPartners, AllBeneficios, ComunidadePublic, MemberProfile)

**Exports:** `export default function App()` (default export)

**Imports (dependencias):**
- React, react-router-dom (Routes, Route, Navigate, useNavigate)
- Componentes: Header, TabBar, HomeView, ProtectedRoute, ModuleErrorBoundary, NotificationPanel, CitySelector, AppModals, SessionExpiredModal, GlobalToastContainer, DevQuickLogin, PmfSurveyModal, ResetPasswordView
- Hooks: useNavigation, useAppHandlers, usePWA, useDevNavLogger
- Stores: authStore, ticketsStore, chatStore, socialStore, extrasStore
- Services: analyticsService, nativePushService, logger, devLogInit, deepLinkService
- 20+ lazy-loaded views (code splitting)
- Icones: lucide-react (Shield, PartyPopper, Gift, Star, ChevronRight, X)
- constants.ts (TYPOGRAPHY)

**Quem depende dele:** `index.tsx` (unico consumer)

---

## 2. index.tsx (bootstrap)
**Caminho:** `/Users/vanta/prevanta/index.tsx`
**Linhas:** 31

**O que faz:** Ponto de entrada do React. Monta a arvore:
```
React.StrictMode > ErrorBoundary > HelmetProvider > BrowserRouter > App
+ SpeedInsights + Analytics (Vercel)
```
Importa `instrument.ts` (Sentry) e `app.css` como side-effects.

**Exports:** Nenhum (entry point)

**Imports:**
- `./instrument` (side-effect Sentry)
- `./app.css` (side-effect CSS)
- React, react-dom/client, react-router-dom, react-helmet-async
- @vercel/speed-insights, @vercel/analytics
- ./components/ErrorBoundary
- ./App

**Quem depende dele:** `index.html` (via `<script type="module" src="./index.tsx">`)

---

## 3. index.html
**Caminho:** `/Users/vanta/prevanta/index.html`
**Linhas:** 120

**O que faz:** HTML raiz do SPA/PWA. Inclui:
- CSP rigoroso (Content-Security-Policy) com whitelist para Supabase, Google Fonts, Leaflet, Sentry, Vercel Analytics, Firebase, imgur, ViaCEP, OpenStreetMap
- Viewport com `viewport-fit=cover, maximum-scale=1.0, user-scalable=no`
- Open Graph + Twitter Cards
- PWA meta tags (apple-mobile-web-app-capable, manifest, icones 32/192/512)
- Splash screen iOS (fallback com apple-touch-icon)
- Fontes: Inter (300-900) + Playfair Display (700) com preload
- Leaflet CSS (lazy load via `media="print" onload`)
- CSS inline com design tokens: `--bg-midnight: #0A0A0A`, `--bg-void: #050505`, `--gold-canary: #FFD300`, safe-area vars
- Classes utilitarias: `.font-serif`, `.glass-premium`, `.no-scrollbar`, `.bg-noise`, `.animate-fade-up`, `.safe-bottom`
- Overlay de noise texture (`bg-noise`)

**Exports:** N/A (HTML)
**Dependencias:** Carrega `./index.tsx` como module script

---

## 4. constants.ts
**Caminho:** `/Users/vanta/prevanta/constants.ts`
**Linhas:** 69

**O que faz:** Constantes globais de design system e mapeamento de negocios.

**Exports:**
- `TYPOGRAPHY` — objeto com estilos pre-definidos: `screenTitle`, `cardTitle`, `sectionKicker`, `uiLabel`, `uiBody` (Playfair Display serif + Inter sans)
- `inputCls` — classes Tailwind para inputs de formulario
- `labelCls` — classes Tailwind para labels de formulario
- `FORMATOS_POR_TIPO_COMUNIDADE` — Record mapeando 25 tipos de espaco (Boate, Bar, Rooftop, etc.) aos formatos de evento permitidos. `PRODUTORA: null` = todos os formatos

**Constantes internas (nao exportadas):**
- `FONTS` — { serif, sans }
- `COLORS` — { textPrimary, textMuted, textFaint, gold }

**Imports:** Nenhum

**Quem depende dele:** 158 arquivos (praticamente todo o codebase — usado em todas as views, componentes, admin, etc.)

---

## 5. types.ts (proxy de tipos)
**Caminho:** `/Users/vanta/prevanta/types.ts`
**Linhas:** 3

**O que faz:** Re-exporta tudo de `./types/index`. Arquivo bridge para que consumers nao precisem mudar imports.

```ts
export * from './types/index';
```

**Quem depende dele:** 50+ arquivos (via `from '../types'`, `from './types'`)

---

## 6. utils.ts
**Caminho:** `/Users/vanta/prevanta/utils.ts`
**Linhas:** 138

**O que faz:** Funcoes utilitarias globais.

**Exports:**
- `tsBR()` — timestamp Brasil (Sao Paulo) ISO 8601 com `-03:00`
- `todayBR()` — data de hoje `YYYY-MM-DD` em SP (evita bug UTC)
- `fmtBRL(n)` — formata numero como `R$ 1.234,56`
- `fmtBRLCompact(n)` — como fmtBRL mas >= 1M mostra `R$ 1,20M`
- `isEventStartingSoon(evento)` — true se evento comeca em ate 60min
- `isEventEndingSoon(evento)` — true se faltam < 60min para acabar
- `isEventHappeningNow(evento)` — true se agora esta entre start e end
- `sortEvents(events)` — ordena: LIVE/SOON no topo, depois cronologico
- `dataURLtoBlob(dataUrl)` — converte base64 data URL em Blob (compativel iOS Safari + CSP)
- `getMinPrice(evento)` — menor preco dos lotes
- `isEventExpired(evento)` — true se > 1h apos termino

**Funcoes internas:** `getEventBounds(evento)` — calcula start/end Date de um Evento

**Imports:** `Evento` de `./types`

**Quem depende dele:** 14 arquivos (EventCard, supabaseVantaService, criarEvento Steps, transferenciaService, socialStore, chatStore, etc.)

---

## 7. app.css
**Caminho:** `/Users/vanta/prevanta/app.css`
**Linhas:** 125

**O que faz:** CSS global com Tailwind v4 (`@import "tailwindcss"`).

**Conteudo principal:**
- Min-width global: 360px (html, body, #root)
- `@theme` com design tokens VANTA:
  - Superficies: void (#050505), midnight (#0A0A0A), card (#111111), elevated (#141414), input (#1A1A1A), surface (#1F1F1F)
  - Dourado: gold (#FFD300)
  - Texto: primary (#FFFFFF), secondary (#D4D4D8), muted (#A1A1AA), subtle (#71717A)
  - Estado: success, warning, error, info
  - Acentos: accent-purple, accent-cyan
- `@custom-variant hover-real` — hover so em dispositivos com mouse (evita sticky hover mobile)
- `@media (prefers-reduced-motion)` — desativa backdrop-blur e animacoes
- Keyframes: `bounceIn`, `ping`, `glowPulse` (Radar/Leaflet)
- `.vanta-slider` — estilizacao de range input com thumb dourado

**Imports:** N/A (CSS)
**Quem depende dele:** `index.tsx` (import side-effect)

---

## 8. instrument.ts (Sentry)
**Caminho:** `/Users/vanta/prevanta/instrument.ts`
**Linhas:** 13

**O que faz:** Inicializa Sentry para error tracking. So ativa em producao (`import.meta.env.PROD`). Usa `browserTracingIntegration` com `tracesSampleRate: 0.1` (10% das transacoes).

**Exports:** Nenhum (side-effect)
**Imports:** `@sentry/react`
**Quem depende dele:** `index.tsx` (import side-effect, primeiro import)

---

## 9. vite.config.ts
**Caminho:** `/Users/vanta/prevanta/vite.config.ts`
**Linhas:** 128

**O que faz:** Configuracao do Vite (bundler/dev server).

**Configuracoes principais:**
- `logLevel: 'error'` (permanente, por regra CLAUDE.md)
- Dev server: porta 5173, host true
- Proxy: `/api/supabase-mgmt` -> `https://api.supabase.com`
- Plugins: tailwindcss, react, visualizer (condicional `ANALYZE=true`), sentryVitePlugin (condicional `SENTRY_AUTH_TOKEN`), VitePWA
- **VitePWA:**
  - `registerType: 'autoUpdate'`, strategies: `generateSW`
  - `manifest: false` (usa /public/manifest.json)
  - Runtime caching: Supabase REST API (StaleWhileRevalidate 5min), Supabase Storage images (CacheFirst 24h), imgur images (CacheFirst 7d)
  - SW desativado em dev
- **Build:**
  - sourcemap: 'hidden', minify: terser, drop_console + drop_debugger
  - Manual chunks: vendor-supabase, vendor-sentry, vendor-qr
- **Resolve alias:** `@` -> raiz do projeto

**Imports:** path, url, vite, @vitejs/plugin-react, @tailwindcss/vite, vite-plugin-pwa, rollup-plugin-visualizer, @sentry/vite-plugin

---

## 10. vitest.config.ts
**Caminho:** `/Users/vanta/prevanta/vitest.config.ts`
**Linhas:** 19

**O que faz:** Configuracao do Vitest (test runner).
- `globals: true`, environment: `node`
- Include: `tests/unit/**/*.test.{ts,tsx}`, `tests/integration/**/*.test.{ts,tsx}`
- Exclude: node_modules, dist, PREVANTABACKUP, tests/e2e
- Timeout: 30s
- Alias: `@` -> raiz

---

## 11. tsconfig.json
**Caminho:** `/Users/vanta/prevanta/tsconfig.json`
**Linhas:** 39

**O que faz:** Configuracao TypeScript.
- Target: ES2022, Module: ESNext, JSX: react-jsx
- Lib: ES2022, DOM, DOM.Iterable
- Types: node, vite/client
- moduleResolution: bundler
- `noEmit: true` (apenas type-checking)
- Path alias: `@/*` -> `./*`
- Exclude: node_modules, supabase/functions, scripts, api, ios, android, resources, _deprecated

---

## 12. capacitor.config.ts
**Caminho:** `/Users/vanta/prevanta/capacitor.config.ts`
**Linhas:** 35

**O que faz:** Configuracao Capacitor (bridge nativo iOS/Android).
- appId: `com.maisvanta.app`
- appName: `VANTA`
- webDir: `dist`
- hostname: `maisvanta.com` (deep links)
- Plugins: SplashScreen (bg #050505, fullscreen), StatusBar (DARK, #050505), PushNotifications (badge+sound+alert)

---

## 13. knip.config.ts
**Caminho:** `/Users/vanta/prevanta/knip.config.ts`
**Linhas:** 9

**O que faz:** Configuracao do Knip (deteccao de codigo morto).
- Entry: `App.tsx`, `api/**/*.ts`
- Project: `**/*.{ts,tsx}`
- Ignore: `supabase/**`

---

## 14. vercel.json
**Caminho:** `/Users/vanta/prevanta/vercel.json`
**Linhas:** 56

**O que faz:** Configuracao de deploy Vercel.

**Rewrites:**
- `/.well-known/*` -> passthrough
- `/robots.txt` -> `/api/robots`
- `/sitemap.xml` -> `/api/sitemap.xml`
- `/e/:slug` (bots sociais via user-agent match) -> `/api/og?slug=:slug`
- `/*` -> `/index.html` (SPA fallback)

**Headers de seguranca:**
- `.well-known/assetlinks.json` e `apple-app-site-association`: Cache 1h
- `manifest.json`, `index.html`, `sw.js`: no-cache (must-revalidate)
- Assets (png/ico/svg): immutable 1 ano
- Global: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection, Referrer-Policy, Permissions-Policy (camera self, mic none, geo self), HSTS 2 anos

---

## 15. package.json
**Caminho:** `/Users/vanta/prevanta/package.json`
**Linhas:** 126

**Scripts (35 scripts):**
| Script | Descricao |
|--------|-----------|
| `dev` | Vite dev server |
| `build` | Vite build |
| `test` | Vitest run (unit+integration) |
| `test:unit` | Vitest unit only |
| `test:integration` | Vitest integration only |
| `test:watch` | Vitest watch mode |
| `lint` | `tsc --noEmit` |
| `lint:eslint` | ESLint src/modules/features/hooks/services |
| `lint:layout` | Layout lint custom |
| `lint:all` | TSC + ESLint + layout lint |
| `preflight` | Preflight check completo |
| `explore` | Explorador de modulos |
| `audit` | Auditoria profunda |
| `deep-audit` | Auditoria profunda extendida |
| `memory-audit` | Valida memorias vs arquivos |
| `memory-audit-deep` | Valida funcoes/exports das memorias |
| `diff-check` | Check pos-edit |
| `deps` | Analise de dependentes |
| `store-map` | Mapa de stores Zustand |
| `lines` | Contagem de linhas |
| `props` | Analise de props |
| `format` | Prettier write |
| `format:check` | Prettier check |
| `knip` | Dead code detection |
| `analyze` | Bundle analyzer |
| `lighthouse` | Lighthouse audit |
| `preview` | Vite preview |
| `prepare` | Husky hooks |
| `test:e2e` | Playwright |
| `test:e2e:ui` / `test:e2e:headed` | Playwright visual |
| `generate-icons` | Gerador de icones |
| `cap:sync` / `cap:ios` / `cap:android` | Capacitor build/open |
| `security-scan` | Gitleaks + npm audit + Trivy |
| `bundle-audit` | Analise de bundle size |
| `store-readiness` | App store readiness |
| `bridge-audit` | Capacitor bridge audit |
| `privacy-audit` | Info.plist vs uso real |
| `design-audit` | Audit visual |
| `full-audit` | Master audit (tudo) |
| `depcheck` / `type-coverage` / `ncu` | Deps/types/updates |

**Dependencies (24):**
@capacitor/android, @capacitor/app, @capacitor/core, @capacitor/ios, @capacitor/push-notifications, @sentry/react, @supabase/supabase-js, @tanstack/react-virtual, @vercel/analytics, @vercel/speed-insights, dompurify, exceljs, firebase, html5-qrcode, jspdf, leaflet, lucide-react, qrcode.react, react, react-dom, react-easy-crop, react-helmet-async, react-leaflet, react-router-dom, recharts, terser, zustand

**DevDependencies (23):**
@capacitor/cli, @eslint/js, @playwright/test, @sentry/vite-plugin, @tailwindcss/vite, @types/leaflet, @types/node, @vitejs/plugin-react, @vitest/ui, depcheck, dotenv, eslint, eslint-plugin-react-hooks, husky, knip, lighthouse, lint-staged, npm-check-updates, prettier, rollup-plugin-visualizer, supabase, tailwindcss, type-coverage, typescript, typescript-eslint, vite, vite-plugin-pwa, vitest, workbox-window

**lint-staged:** prettier --write + eslint --quiet --fix em *.{ts,tsx}
**overrides:** dompurify >=3.3.2, serialize-javascript >=7.0.3

---

## 16. metadata.json
**Caminho:** `/Users/vanta/prevanta/metadata.json`
**Linhas:** 7

**O que faz:** Metadata do app para stores/permissoes.
```json
{
  "name": "Noite Premium - Eventos e Vida Noturna",
  "description": "Descubra os melhores eventos e gerencie sua vida noturna com elegância e facilidade.",
  "requestFramePermissions": ["camera", "geolocation"]
}
```

---

## Pasta types/

### types/index.ts (7 linhas)
Re-export centralizado de todos os tipos. Exporta tudo de: auth, eventos, social, financeiro, rbac, clube.

### types/auth.ts (201 linhas)
**Tipos exportados:**
- `ContaVanta` — 'vanta_guest' | 'vanta_member' | 'vanta_masteradm'
- `ContaVantaLegacy` — ContaVanta + 7 cargos contextuais (deprecated)
- `PortalRole` — 8 cargos contextuais (gerente, socio, portaria_lista, etc.)
- `AccessNode` — no de acesso RBAC (tipo COMUNIDADE/EVENTO/PLATAFORMA, portalRole, cargoLabel)
- `TipoSelo`, `Selo` — selos de importancia (VIP, INFLUENCER, PARCEIRO, IMPRENSA)
- `TipoCargo`, `Cargo` — cargos dentro de comunidade (GERENTE, PORTARIA, CAIXA, PROMOTER)
- `ComunidadeLog` — log de atividades
- `PrivacidadeOpcao`, `PrivacidadeConfig` — 12 opcoes de privacidade (TODOS/AMIGOS/NINGUEM/AMIGOS_EM_COMUM)
- `Notificacao` — 47 tipos de notificacao (EVENTO, AMIGO, SISTEMA, MAIS_VANTA, etc.)
- `TabState` — 'INICIO' | 'RADAR' | 'BUSCAR' | 'MENSAGENS' | 'PERFIL' | 'ADMIN_HUB'
- `ProfileSubView` — 17 sub-views do perfil

### types/eventos.ts (463 linhas)
**Tipos exportados:**
- `Comunidade` (77 campos!) — venue completo com taxas, horarios, redes sociais, evento privado config
- `VantaIndicaCard`, `TipoIndicaCard`, `AcaoIndicaCard` — cards do VANTA Indica (7 tipos)
- `Lote`, `Evento` (35+ campos) — evento publico com coords, lotes, lineup, dressCode, MAIS VANTA
- `Ingresso` — com status, QR, meia-entrada, acompanhante
- `ComprovanteMeia`, `StatusComprovante`, `TIPOS_COMPROVANTE_MEIA` — 6 tipos de meia-entrada
- `Membro` (30+ campos) — perfil completo com fotos, CPF, genero, interesses, privacidade, selos, clube
- `AreaIngresso`, `GeneroIngresso`, `PapelEquipeEvento` — enums
- `VariacaoIngresso`, `LoteAdmin`, `MembroEquipeEvento` — admin
- `EventoAdmin` (80+ campos!) — evento completo admin com taxas, socios, negociacao, mesas, MAIS VANTA, recorrencia, venda externa
- `ReviewEvento`, `Cupom`, `CondicaoComercial` — reviews, cupons, condicoes comerciais
- `Parceiro`, `CidadeResumo` — home sections
- `SocioEvento` — socios de evento com split e negociacao

### types/financeiro.ts (46 linhas)
**Tipos exportados:**
- `Mesa` — mesas/camarotes (posicao x/y, capacidade, valor, status)
- `CortesiaEvento` — limites e variacoes de cortesia
- `TransferenciaCortesiaLog` — log de transferencia
- `TransferenciaPendente` — transferencias de ingresso pendentes

### types/rbac.ts (122 linhas)
**Tipos exportados:**
- `PermissaoVanta` — 11 permissoes granulares (VER_FINANCEIRO, VENDER_PORTA, CHECKIN_LISTA, etc.)
- `CotaVariacaoConfig`, `PermissaoListaConfig`, `DefinicaoCargoCustom` — cargos customizados
- `CargoUnificado` — 8 cargos (GERENTE, SOCIO, PROMOTER, portarias, CAIXA)
- `TipoTenant`, `ContextoTenant`, `AtribuicaoRBAC` — RBAC multi-tenant
- `RegraLista` — regras de lista (label, teto, cor, valor, horaCorte/Abobora, genero, area)
- `CotaPromoter`, `ConvidadoLista`, `ListaEvento` — listas de eventos

### types/social.ts (31 linhas)
**Tipos exportados:**
- `FriendshipStatus` — 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS'
- `Mensagem` — mensagem de chat (reactions, read status)
- `Chat` — conversa (participantId, messages, unreadCount)

### types/clube.ts (354 linhas)
**Tipos exportados:**
- `TierMaisVanta`, `CreatorSublevel` — tiers do clube
- `MembroClubeVanta` — membro do clube (32 campos: tier, Instagram, bloqueio, tags, etc.)
- `LoteMaisVanta` — lotes exclusivos MV com acompanhantes
- `ReservaMaisVanta` — reservas (status, post verificado, infraction)
- `SolicitacaoClube` — solicitacoes de entrada (20+ campos)
- `PlanoMaisVanta`, `StatusAssinatura` — planos legado
- `PlanoMaisVantaDef`, `TierMaisVantaDef` — planos/tiers dinamicos
- `AssinaturaMaisVanta` — assinatura SaaS
- `PassportAprovacao` — passaporte regional por cidade
- `BeneficioId`, `ClubeConfig` — configuracao do clube (beneficios por tier, limites, infracoes)
- `ConviteClube` — convites de indicacao
- `PlanoProdutor`, `ProdutorPlano` — planos do produtor
- `InfracaoMaisVanta` — infracoes (NO_SHOW, NAO_POSTOU)
- `GeneroMembro`, `TipoParceiro`, `PlanoParceiro`, `TipoDeal`, `StatusDeal`, `StatusResgate` — deals marketplace
- `CidadeMaisVanta`, `ParceiroMaisVanta`, `DealMaisVanta`, `ResgateMaisVanta` — deals v2

### types/supabase.ts (6144 linhas, auto-gerado)
**Resumo:**
- **96 tabelas** incluindo: analytics_events, assinaturas_mais_vanta, atribuicoes_rbac, audit_logs, bloqueios, brand_profiles, cargos, chargebacks, chat_settings, cidades_mais_vanta, clube_config, comemoracoes, community_follows, comprovantes_meia, comunidades, condicoes_comerciais, convidados_lista, convites_clube, cortesias_config/log/pendentes, cotas_promoter, cupons, deals_mais_vanta, denuncias, drafts, equipe_evento, estilos, evento_favoritos, eventos_admin, eventos_privados, experiencias, fidelidade_cliente, formatos, friendships, infracoes_mais_vanta, interesses, legal_documents, listas_evento, lotes, mais_vanta_config, membros_clube, mesas, messages, niveis_prestigio, notifications, pagamentos_promoter, parceiros_mais_vanta, passport_aprovacoes, pedidos_checkout, planos_mais_vanta, planos_produtor, platform_config, pmf_responses, produtor_plano, profiles, push_agendados/subscriptions/templates, reembolsos, regras_lista, relatorios_semanais, resgates_mais_vanta, reviews_evento, site_content, socios_evento, solicitacoes_clube/parceria/saque, splits_config, tickets_caixa, tiers_mais_vanta, transactions, transferencias_ingresso, user_behavior, user_consents, vanta_indica, variacoes_ingresso, vendas_log, waitlist
- **2 Views:** `comunidades_admin`, `comunidades_publico`
- **~40 RPCs** incluindo: aceitar_convite_mv, aceitar_cortesia_rpc, anonimizar_conta, buscar_membros, cidades_com_eventos, criar_comunidade_completa, criar_evento_completo, estilos_por_cidade, eventos_com_beneficio_mv, eventos_recomendados_behavior, eventos_por_cidade_paginado, gerar_cortesias_comemoracao, gerar_ocorrencias_recorrente, get_eventos_por_regiao, get_ocorrencias_serie, has_comunidade_access, has_comunidade_write_access, has_evento_access, has_plataforma_permission, inserir_notificacao, is_event_manager_or_admin, is_masteradm, is_membro_clube, parceiros_por_cidade, processar_compra_checkout, processar_venda_caixa, queimar_ingresso, search_users, sign_ticket_token, top_vendidos_24h, user_shares_tenant, verificar_virada_lote, verify_ticket_token
- **11 Enums:** area_ingresso, conta_vanta, genero_ingresso, membro_status, papel_equipe, pix_tipo, saque_status, ticket_status, tipo_cargo, transaction_status, transaction_tipo
- **Utility types exportados:** Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes, Constants

---

## Pasta data/

### data/avatars.ts (8 linhas)
Exporta `DEFAULT_AVATARS` — Record com URLs de avatares padrao do Supabase Storage (MASCULINO, FEMININO, NEUTRO, PREFIRO_NAO_DIZER).

### data/brData.ts (104 linhas)
Exporta:
- `ESTADOS_CIDADES` — Record<estado, cidades[]> com todos os 27 estados do Brasil e cidades principais
- `ESTADOS` — array sorted dos codigos UF
- `DDDS` — array com todos os DDDs brasileiros (66 DDDs)

---

## Pasta api/ (Vercel Serverless Functions)

### api/og.ts (90 linhas)
Open Graph handler. Busca evento por slug no Supabase REST API e retorna HTML com OG tags para bots sociais (Facebook, WhatsApp, Twitter, etc.). Redireciona usuarios normais para `/e/:slug`. Cache 5min.

### api/robots.ts (20 linhas)
Serve robots.txt. Allow: /, Disallow: /admin, /checkout, /parceiro. Sitemap em maisvanta.com. Cache 24h.

### api/sitemap.xml.ts (71 linhas)
Gera sitemap XML dinamico. Busca ate 1000 eventos publicados do Supabase, gera URLs `/e/:slug` ou `/evento/:id`. Pagina raiz com priority 1.0, eventos com priority 0.8. Cache 1h.

---

## Pasta ios/

### ios/App/App/Info.plist (57 linhas)
Configuracao iOS nativa:
- Bundle: `com.maisvanta.app`, nome: `VANTA`
- Orientacoes suportadas: Portrait + Landscape (iPhone e iPad)
- **Permissoes declaradas:**
  - `NSCameraUsageDescription` — QR codes e fotos do perfil
  - `NSPhotoLibraryUsageDescription` — fotos do perfil e eventos
  - `NSLocationWhenInUseUsageDescription` — eventos perto do usuario

### ios/App/App/capacitor.config.json (34 linhas)
Espelho JSON do `capacitor.config.ts` com `packageClassList`: AppPlugin, PushNotificationsPlugin.

### ios/App/App/config.xml (5 linhas)
Widget Cordova minimo com `<access origin="*" />`.

---

## Pasta audit-reports/

### gitleaks-report.json
Resultado: `[]` (vazio, nenhum segredo vazado).

### npm-audit.json
1 vulnerabilidade **high**: `flatted` (Prototype Pollution via parse(), <=3.4.1). Fix disponivel. Total deps: 1279 (308 prod, 956 dev).

### trivy-report.json (62k+ tokens)
Trivy v0.69.3, scan do repositorio (branch visual-redesign, commit 1f235c5). Analisa package-lock.json. Report muito extenso com detalhes de CVEs de dependencias npm.

### knip-report.txt
27 arquivos nao utilizados (10 em `_deprecated/`, 3 em `api/`, 14 componentes/modulos), 2 dependencias nao usadas (@capacitor/android, terser — listado no report).

### design-audit-report.txt
Lista de ocorrencias de inline styles e valores fixos de largura no codebase (violacoes potenciais da regra "zero valores fixos de largura").

### Outros: build-output.txt, heavy-deps.txt, heavy-imports.txt, large-assets.txt, largest-chunks.txt
Reports de auditoria de bundle, imports pesados e assets grandes.

---


## Capitulo 2

# Inventario Completo de Componentes -- `/Users/vanta/prevanta/components/`

---

## 1. AppModals

- **Arquivo**: `/Users/vanta/prevanta/components/AppModals.tsx`
- **Linhas**: 245
- **O que faz**: Agregador central de todos os modais globais do app. Renderiza condicionalmente: LoginView, GuestAreaModal (modal para guest acessar area restrita), SuccessFeedbackModal, OnboardingView, ReviewModal, banners PWA (update e install), PushPermissionBanner. Usa lazy loading para LoginView, ReviewModal e OnboardingView. Gerencia modal back (hardware back) via `useModalBack`.
- **Props/Interface**:
```ts
interface AppModalsProps {
  isGuest: boolean;
  userId: string;
  pwa: PWA; // ReturnType<typeof usePWA>
  setShowAuthModal: (v: boolean) => void;
  showLoginView: boolean;
  setShowLoginView: (v: boolean) => void;
  guestModalContext: string | null;
  setGuestModalContext: (v: string | null) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (v: boolean) => void;
  successMessage: string;
  showProfileSuccess: boolean;
  setShowProfileSuccess: (v: boolean) => void;
  showOnboarding: boolean;
  reviewTarget: { eventoId: string; eventoNome: string } | null;
  setReviewTarget: (v: { eventoId: string; eventoNome: string } | null) => void;
  handleAuthSuccess: (m: Membro) => void;
  handleLoginSuccess: (m: Membro) => void;
  handleOnboardingComplete: () => void;
  onRegisterFcm: () => void;
}
```
- **Imports**: React (lazy), TYPOGRAPHY, Check/X/Sparkles (lucide), PushPermissionBanner, useModalBack, usePWA type. Lazy: LoginView, ReviewModal, OnboardingView.
- **Quem importa**: `App.tsx`
- **Subcomponentes internos**: GuestAreaModal (inline), SuccessFeedbackModal (inline)
- **Observacoes**: Contém textos contextuais para guest modal (curtir, comprar, mensagem, perfil, notificacao, generico). PWA update/install banners posicionados `absolute bottom-20`. Z-index hierarchy: login z-[340], guest z-[300], success z-[300], PWA z-[500]/z-[499], push z-[200].

---

## 2. AuthModal

- **Arquivo**: `/Users/vanta/prevanta/components/AuthModal.tsx`
- **Linhas**: 373
- **O que faz**: Modal de cadastro (signup) nivel 1 com perfil progressivo. Inclui botoes de login social (Apple/Google), formulario com nome, email, senha, data nascimento, checkbox de consentimento LGPD. Background com foto ambiente e efeito Ken Burns. Rate limiting client-side (10 falhas = 5min lock). Valida nome completo, email, data, idade (16+).
- **Props/Interface**:
```ts
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (membro: Membro) => void;
  returnTo?: () => void;
}
```
- **Imports**: React, ArrowLeft/Check/Eye/EyeOff/Lock/Sparkles/ChevronRight, TYPOGRAPHY, Membro, authService, LegalView/useLegalView, useModalBack, inputCls/isValidDate/isAdult/isValidEmail/isValidNome/fmtDataNasc (authHelpers), FieldError.
- **Quem importa**: Nenhum import direto encontrado (provavelmente renderizado via `App.tsx` com state, nao via import -- verificar App.tsx).
- **Observacoes**: Safe area padding no footer. Overlay LegalView para termos/privacidade inline. Keyframes Ken Burns inline em `<style>`.

---

## 3. BatchActionBar

- **Arquivo**: `/Users/vanta/prevanta/components/BatchActionBar.tsx`
- **Linhas**: 65
- **O que faz**: Barra flutuante de acoes em lote que aparece no bottom quando ha itens selecionados. Mostra contador, botoes de acao (default/danger), e botao limpar selecao.
- **Props/Interface**:
```ts
interface BatchAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}
interface Props {
  count: number;
  actions: BatchAction[];
  onClear: () => void;
}
```
- **Imports**: React, X/LucideIcon (lucide-react).
- **Quem importa**: Nenhum consumer encontrado (pode ser codigo novo ainda nao integrado).
- **Observacoes**: Usa `absolute bottom-0` com backdrop blur. Animate-in slide-in-from-bottom.

---

## 4. BottomSheet

- **Arquivo**: `/Users/vanta/prevanta/components/BottomSheet.tsx`
- **Linhas**: 37
- **O que faz**: Componente reutilizavel de bottom sheet. Backdrop escuro, animacao slide-up, pill handle, safe-area-inset-bottom.
- **Props/Interface**:
```ts
interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```
- **Imports**: React.
- **Quem importa**: Nenhum consumer encontrado.
- **Observacoes**: Usa `absolute inset-0 z-50`. Click no backdrop fecha. Click no conteudo stopPropagation. Regra: "Usar SEMPRE que precisar de bottom sheet no app."

---

## 5. CelebrationScreen

- **Arquivo**: `/Users/vanta/prevanta/components/CelebrationScreen.tsx`
- **Linhas**: 157
- **O que faz**: Tela fullscreen de celebracao com particulas douradas flutuantes, icone central (check ou clock), titulo, subtitulo, botoes de acao (primary/secondary), auto-close opcional.
- **Props/Interface**:
```ts
interface CelebrationScreenProps {
  title: string;
  subtitle?: string;
  icon?: 'check' | 'clock';
  actions: { label: string; onClick: () => void; variant: 'primary' | 'secondary' }[];
  autoCloseMs?: number;
  onClose?: () => void;
}
```
- **Imports**: React, Check/Clock (lucide).
- **Quem importa**: `features/admin/views/CriarEventoView.tsx`, `features/admin/views/criarComunidade/index.tsx`
- **Observacoes**: Export default (nao named export). Particulas geradas com `useMemo` (posicoes estaveis). Animacoes CSS inline (@keyframes celebFloat, celebScaleIn, celebSlideUp, celebFadeIn).

---

## 6. CityCard

- **Arquivo**: `/Users/vanta/prevanta/components/CityCard.tsx`
- **Linhas**: 35
- **O que faz**: Card de cidade com foto destaque, nome e total de eventos. Scroll horizontal snap-start.
- **Props/Interface**:
```ts
interface CityCardProps {
  cidade: string;
  totalEventos: number;
  fotoDestaque?: string;
  onClick: (cidade: string) => void;
}
```
- **Imports**: React, TYPOGRAPHY.
- **Quem importa**: `modules/home/components/DescubraCidadesSection.tsx`
- **Observacoes**: React.memo com displayName. Fallback foto: `/icon-192.png`. Aspect ratio 4/5.

---

## 7. CompletarPerfilCPF

- **Arquivo**: `/Users/vanta/prevanta/components/CompletarPerfilCPF.tsx`
- **Linhas**: 106
- **O que faz**: Modal para usuario informar CPF antes de compra. Valida CPF (algoritmo completo), salva no Supabase profiles, trata duplicidade (23505). Usa useModalBack.
- **Props/Interface**:
```ts
interface CompletarPerfilCPFProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cpf: string) => void;
}
```
- **Imports**: React, Check, inputCls, fmtCPF/isValidCPF (authHelpers), supabase, useAuthStore, useModalBack, FieldError.
- **Quem importa**: `modules/checkout/CheckoutPage.tsx`
- **Observacoes**: Z-index z-[400]. Atualiza authStore profile apos salvar.

---

## 8. CompletarPerfilSocial

- **Arquivo**: `/Users/vanta/prevanta/components/CompletarPerfilSocial.tsx`
- **Linhas**: 128
- **O que faz**: Tela pos-login social pedindo data de nascimento + aceite de termos (LGPD). Exibida quando `profile.data_nascimento` e NULL. Registra consentimento via legalService.
- **Props/Interface**:
```ts
interface Props {
  userId: string;
  userName: string;
  onComplete: () => void;
}
```
- **Imports**: React, Loader2/Check, supabase, isValidDate/isAdult/fmtDataNasc (authHelpers), legalService.
- **Quem importa**: Nao encontrado direto (provavelmente renderizado pelo App.tsx via state).
- **Observacoes**: Timestamp BR correto (`-03:00`). Registra consentimento termos_uso e politica_privacidade versao 1.

---

## 9. DevLogPanel

- **Arquivo**: `/Users/vanta/prevanta/components/DevLogPanel.tsx`
- **Linhas**: 200
- **O que faz**: Painel flutuante de debug visivel apenas em DEV (`import.meta.env.DEV`). Mostra logs do devLogger com filtros por categoria (NAV, API, STORE, ERRO, etc.), contador de erros/warnings, export para clipboard (texto completo ou relatorio de erros). Auto-scroll, expandir entries com dados JSON.
- **Props/Interface**: Nenhuma (componente standalone, sem props).
- **Imports**: React, devLogger/DevLogEntry.
- **Quem importa**: Nenhum import direto (provavelmente montado em App.tsx condicionalmente).
- **Observacoes**: Usa `useSyncExternalStore` para reatividade. Pill flutuante `fixed bottom-20 right-2 z-[9999]`. Painel expandido `fixed bottom-0 right-0 z-[9999] w-full max-w-[500px] h-[50vh]`.

---

## 10. DevQuickLogin

- **Arquivo**: `/Users/vanta/prevanta/components/DevQuickLogin.tsx`
- **Linhas**: 400
- **O que faz**: Botao flutuante draggable (DEV only) para trocar rapidamente entre contas de usuario. Busca profiles+RBAC via service_role key, gera magic links, faz login transparente. Mostra badges de role (Master, Membro, Guest) e cargos RBAC (Gerente, Socio, Promoter, etc.).
- **Props/Interface**: Nenhuma (componente standalone).
- **Imports**: React, createClient (@supabase), supabase, useAuthStore.
- **Quem importa**: `App.tsx`
- **Observacoes**: Usa VITE_DEV_ADMIN_KEY (service_role, DEV only). Sorting: usuario atual > master > gerente > socio > promoter. Touch+Mouse drag com prevenindo de click ao arrastar. Toast com auto-dismiss 3s.

---

## 11. EmptyState

- **Arquivo**: `/Users/vanta/prevanta/components/EmptyState.tsx`
- **Linhas**: 49
- **O que faz**: Empty state reutilizavel com icone dourado, titulo, subtexto opcional, botao CTA. Variante compact para secoes inline.
- **Props/Interface**:
```ts
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon; };
  compact?: boolean;
}
```
- **Imports**: React, LucideIcon.
- **Quem importa**: 7 arquivos -- HistoricoView, MyTicketsView, SearchResults, WalletView, MessagesView, PlacesResults, ExtratoFinanceiro.
- **Observacoes**: Padrao visual Home (fundo dourado sutil #FFD300/5, border dourada).

---

## 12. ErrorBoundary

- **Arquivo**: `/Users/vanta/prevanta/components/ErrorBoundary.tsx`
- **Linhas**: 63
- **O que faz**: Error boundary global (class component). Captura erros de render, mostra fallback fullscreen ("Algo deu errado") com botao "Recarregar". Envia erro para Sentry. Em DEV mostra mensagem de erro.
- **Props/Interface**:
```ts
interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }
```
- **Imports**: React, Sentry, TYPOGRAPHY.
- **Quem importa**: `index.tsx` (root)
- **Observacoes**: Cast necessario para React 19 sem @types/react. Comentario `lint-layout-ok` (standalone/fullscreen).

---

## 13. EventCard

- **Arquivo**: `/Users/vanta/prevanta/components/EventCard.tsx`
- **Linhas**: 222
- **O que faz**: Card de evento visual com imagem, badge de data/status (Acontecendo Agora, Comeca em Breve, Acaba em Breve), badge de estilo musical colorido, titulo, local, preco, coroa MAIS VANTA, carimbos ESGOTADO/ULTIMAS VAGAS, distancia, click em comunidade.
- **Props/Interface**:
```ts
interface EventCardProps {
  evento: Evento;
  onClick: (event: Evento) => void;
  onComunidadeClick?: (comunidadeId: string) => void;
  showCityInsteadOfLocal?: boolean;
  distLabel?: string;
  percentVendido?: number;
}
```
- **Imports**: React, MapPin/Crown/Radio, Evento type, TYPOGRAPHY, getMinPrice/isEventHappeningNow/isEventStartingSoon/isEventEndingSoon (utils), OptimizedImage.
- **Quem importa**: `EventCarousel.tsx`, `AllBeneficiosView.tsx`, `AllEventsView.tsx`
- **Observacoes**: React.memo. Mapeamento de cores por estilo musical (ESTILO_CORES). Aspect ratio 4/5. MV cards tem border dourada e shadow. Carimbos inclinados 35deg com animate-pulse.

---

## 14. HorarioFuncionamentoEditor

- **Arquivo**: `/Users/vanta/prevanta/components/HorarioFuncionamentoEditor.tsx`
- **Linhas**: 80
- **O que faz**: Editor de horario de funcionamento semanal (7 dias). Toggle aberto/fechado, pickers de horario abertura/fechamento via VantaTimePicker.
- **Props/Interface**:
```ts
// Inline no FC:
{ horarios: HorarioSemanal[]; onChange: (h: HorarioSemanal[]) => void; }
```
- **Imports**: React, HorarioSemanal type, VantaTimePicker.
- **Quem importa**: `criarComunidade/index.tsx`, `comunidades/EditarModal.tsx`, `criarComunidade/Step3Operacao.tsx`
- **Observacoes**: Exporta `DEFAULT_HORARIOS` (7 dias fechados). Dias em portugues (Dom-Sab).

---

## 15. HorarioOverridesEditor

- **Arquivo**: `/Users/vanta/prevanta/components/HorarioOverridesEditor.tsx`
- **Linhas**: 105
- **O que faz**: Editor de excecoes de horario (feriados, datas especiais). Adicionar/remover overrides com data, toggle aberto/fechado, horarios, campo motivo.
- **Props/Interface**:
```ts
// Inline no FC:
{ overrides: HorarioOverride[]; onChange: (o: HorarioOverride[]) => void; }
```
- **Imports**: React, Plus/Trash2, HorarioOverride type, VantaDatePicker, VantaTimePicker.
- **Quem importa**: `comunidades/EditarModal.tsx`
- **Observacoes**: Sorted por data. Botao dashed "Adicionar excecao".

---

## 16. HorarioPublicDisplay

- **Arquivo**: `/Users/vanta/prevanta/components/HorarioPublicDisplay.tsx`
- **Linhas**: 179
- **O que faz**: Exibicao publica dos horarios de funcionamento de uma comunidade. Mostra resumo compacto (ex: "Seg a Sex, a partir das 19h"), badge Aberto/Fechado em tempo real (horario BR), dropdown expansivel com horarios detalhados por dia, destaque override do dia.
- **Props/Interface**:
```ts
// Inline no FC:
{ horarios: HorarioSemanal[]; overrides?: HorarioOverride[]; }
```
- **Imports**: React, Clock/ChevronDown, HorarioSemanal/HorarioOverride types.
- **Quem importa**: `modules/community/ComunidadePublicView.tsx`
- **Observacoes**: Calcula dia/hora atual em timezone BR. Suporta virada de meia-noite no calculo de "aberto agora". Resume inteligente (detecta dias consecutivos, horario unico, etc.).

---

## 17. ImageCropModal

- **Arquivo**: `/Users/vanta/prevanta/components/ImageCropModal.tsx`
- **Linhas**: 289
- **O que faz**: Editor de recorte/posicionamento de foto usando react-easy-crop. Zoom slider (VantaSlider), confirmar recorte ou usar original. Auto-skip quando proporcao ja bate. Limita a max-w-[500px] em desktop. Gera dataURL JPEG 0.78.
- **Props/Interface**:
```ts
interface ImageCropModalProps {
  src: string;
  aspect?: number;
  minWidth?: number;
  minHeight?: number;
  maxPx?: number;
  label?: string;
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
  autoSkipWhenFit?: boolean;
}
```
- **Imports**: React, Cropper (react-easy-crop), X/Check/ZoomIn/ZoomOut, useModalBack, VantaSlider.
- **Quem importa**: `criarEvento/Step1Evento.tsx`, `VantaIndicaView.tsx`, `comunidades/EditarModal.tsx`, `criarComunidade/Step1Identidade.tsx`
- **Observacoes**: Fix para react-easy-crop travando touch-action ao desmontar. Z-index z-[500]. Label de dimensao/aspect ratio. Botao "Usar imagem original" quando perfect fit.

---

## 18. Layout

- **Arquivo**: `/Users/vanta/prevanta/components/Layout.tsx`
- **Linhas**: 104
- **O que faz**: Exporta dois componentes: `TabBar` (navegacao inferior com 5 tabs: Inicio, Radar, Buscar, Mensagens, Perfil) e `Header` (barra superior com foto perfil, seletor de cidade, botao admin, badge notificacoes).
- **Props/Interface**:
```ts
// TabBar:
{ activeTab: TabState; setActiveTab: (tab: TabState) => void; }
// Header:
{ onProfileClick: () => void; onCityClick: () => void; onNotificationClick: () => void;
  showAdmin?: boolean; onAdminClick?: () => void; isCitySelectorOpen?: boolean; }
```
- **Imports**: React, Home/Map/Search/User/Shield/Bell/ChevronDown/MessageSquare, TabState, TYPOGRAPHY, OptimizedImage, useChatStore, useAuthStore.
- **Quem importa**: `App.tsx`
- **Observacoes**: TabBar h-11, Header h-16. Badge de mensagens nao lidas (dot). Badge de notificacoes (contador, max 99+). Cidade rotacao com chevron.

---

## 19. LegalView

- **Arquivo**: `/Users/vanta/prevanta/components/LegalView.tsx`
- **Linhas**: 506
- **O que faz**: View fullscreen que renderiza os Termos de Uso e Politica de Privacidade em markdown simplificado. Contem os textos legais completos inline (~415 linhas de conteudo juridico). Exporta tambem o hook `useLegalView` para controlar abertura/fechamento.
- **Props/Interface**:
```ts
type LegalPage = 'TERMOS' | 'PRIVACIDADE';
// LegalView:
{ page: LegalPage; onBack: () => void; }
// useLegalView hook retorna:
{ legalPage, openTermos, openPrivacidade, closeLegal }
```
- **Imports**: React, ArrowLeft, TYPOGRAPHY, useModalBack.
- **Quem importa**: `AuthModal.tsx`
- **Observacoes**: Conteudo juridico completo (CDC, LGPD, meia-entrada, MAIS VANTA, Apple/Google privacy labels). Ultima atualizacao: Marco 2026. Z-index z-[400].

---

## 20. LoginView

- **Arquivo**: `/Users/vanta/prevanta/components/LoginView.tsx`
- **Linhas**: 447
- **O que faz**: Tela de login com email/senha, botoes Apple/Google social login, recuperacao de senha (email reset via Supabase), Ken Burns background, rate limiting (5 fails = 30s, 10 fails = 5min), confirmacao de saida para guest.
- **Props/Interface**:
```ts
interface LoginViewProps {
  onSuccess: (membro: Membro) => void;
  onRegister: () => void;
  onClose?: () => void;
}
```
- **Imports**: React, Eye/EyeOff/Loader/Check/X/Lock, authService, supabase, Membro, TYPOGRAPHY.
- **Quem importa**: Lazy import em `AppModals.tsx`
- **Observacoes**: Modal de confirmacao "Tem certeza?" antes de fechar (para guest). Modo recuperacao de senha inline. Ken Burns keyframes inline.

---

## 21. ModuleErrorBoundary

- **Arquivo**: `/Users/vanta/prevanta/components/ModuleErrorBoundary.tsx`
- **Linhas**: 66
- **O que faz**: Error boundary granular por modulo. Captura erros de render e mostra fallback com nome do modulo e botao "Tentar novamente" (retry). Nao derruba o app inteiro.
- **Props/Interface**:
```ts
interface Props { children: React.ReactNode; moduleName: string; }
interface State { hasError: boolean; error: Error | null; }
```
- **Imports**: React, AlertTriangle/RefreshCw.
- **Quem importa**: `App.tsx`
- **Observacoes**: Similar a ErrorBoundary mas com retry e nome do modulo. Cast React 19.

---

## 22. MoodPicker

- **Arquivo**: `/Users/vanta/prevanta/components/MoodPicker.tsx`
- **Linhas**: 96
- **O que faz**: Bottom sheet para selecionar mood (emoji + texto opcional ate 40 chars). Grid 6 colunas de emojis do MOOD_EMOJIS. Opcao limpar mood existente. Expira em 24h.
- **Props/Interface**:
```ts
interface MoodPickerProps {
  currentEmoji?: string | null;
  currentText?: string | null;
  onSave: (emoji: string, text?: string) => void;
  onClear: () => void;
  onClose: () => void;
}
```
- **Imports**: React, X, MOOD_EMOJIS (moodService).
- **Quem importa**: `modules/profile/ProfileView.tsx`
- **Observacoes**: Z-index z-[200]. Safe area bottom. Animate slide-in-from-bottom.

---

## 23. NotFoundView

- **Arquivo**: `/Users/vanta/prevanta/components/NotFoundView.tsx`
- **Linhas**: 26
- **O que faz**: Pagina 404 fullscreen. "404" grande dourado, texto "Pagina nao encontrada", botao "Voltar ao inicio" que navega para `/`.
- **Props/Interface**: Nenhuma.
- **Imports**: React, useNavigate (react-router-dom), TYPOGRAPHY.
- **Quem importa**: Nenhum consumer direto encontrado (provavelmente no router).
- **Observacoes**: Usa navigate com `replace: true`.

---

## 24. OnboardingView

- **Arquivo**: `/Users/vanta/prevanta/components/OnboardingView.tsx`
- **Linhas**: 350
- **O que faz**: Wizard de onboarding pos-cadastro com 3 steps: (1) selecao de cidade (busca IBGE + fallback brData), (2) selecao de interesses musicais (19 generos), (3) boas-vindas com animacao. Salva cidade e interesses no Supabase profiles.
- **Props/Interface**:
```ts
{ onComplete: () => void; }
```
- **Imports**: React, MapPin/Search/Loader2/Music/Sparkles/ChevronRight, TYPOGRAPHY, ESTADOS_CIDADES (brData), useAuthStore, supabase.
- **Quem importa**: Lazy import em `AppModals.tsx`
- **Observacoes**: API IBGE para cidades com fallback local. Filtro de 15 resultados max. Botao "Pular" no step 2. Step dots animados. Z-index z-[400].

---

## 25. OptimizedImage

- **Arquivo**: `/Users/vanta/prevanta/components/OptimizedImage.tsx`
- **Linhas**: 97
- **O que faz**: Componente de imagem otimizado com lazy loading nativo, Supabase Storage transforms (resize + quality 75), srcSet @2x, fallback placeholder, fade-in ao carregar, cap de resolucao (maxPx default 1200).
- **Props/Interface**:
```ts
interface OptimizedImageProps {
  src: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  maxPx?: number;
}
```
- **Imports**: React.
- **Quem importa**: 19 arquivos (o componente mais reutilizado do projeto) -- EventCard, Layout, NotificationPanel, ProfileView, EventHeader, SearchView, ComunidadePublicView, etc.
- **Observacoes**: Detecta Supabase Storage URL e aplica `?width=X&quality=75`. Gerencia error state internamente (fallback). Checa `img.complete` para cache hits.

---

## 26. PartnerCard

- **Arquivo**: `/Users/vanta/prevanta/components/PartnerCard.tsx`
- **Linhas**: 31
- **O que faz**: Card de parceiro/comunidade com foto, nome e tipo. Scroll horizontal snap-start.
- **Props/Interface**:
```ts
interface PartnerCardProps {
  parceiro: Parceiro;
  onClick: (id: string) => void;
}
```
- **Imports**: React, Parceiro type.
- **Quem importa**: `LocaisParceiroSection.tsx`, `CityView.tsx`
- **Observacoes**: React.memo com displayName. Aspect square. Fallback foto: `/icon-192.png`.

---

## 27. PmfSurveyModal

- **Arquivo**: `/Users/vanta/prevanta/components/PmfSurveyModal.tsx`
- **Linhas**: 66
- **O que faz**: Modal de pesquisa PMF (Product-Market Fit). Pergunta: "Se o VANTA deixasse de existir amanha, como voce se sentiria?" com 3 opcoes (Muito decepcionado, Pouco decepcionado, Indiferente). Envia resposta via analyticsService.
- **Props/Interface**:
```ts
{ userId: string; onClose: () => void; }
```
- **Imports**: React, X/Loader2, submitPmfResponse (analyticsService), useModalBack.
- **Quem importa**: `App.tsx`
- **Observacoes**: Z-index z-50. Cada opcao com cor propria (vermelho, amarelo, cinza).

---

## 28. ProtectedRoute

- **Arquivo**: `/Users/vanta/prevanta/components/ProtectedRoute.tsx`
- **Linhas**: 9
- **O que faz**: Wrapper de rota protegida. Redireciona para `/login` se o usuario e guest (role === 'vanta_guest').
- **Props/Interface**:
```ts
{ children: React.ReactNode; }
```
- **Imports**: React, Navigate (react-router-dom), useAuthStore.
- **Quem importa**: `App.tsx`
- **Observacoes**: Replace navigation.

---

## 29. PushPermissionBanner

- **Arquivo**: `/Users/vanta/prevanta/components/PushPermissionBanner.tsx`
- **Linhas**: 174
- **O que faz**: Modal fullscreen pedindo permissao de notificacoes push. Detecta iOS non-standalone (mostra dica "Adicione a tela inicial" com instrucoes Safari). Dismiss persiste por 7 dias em localStorage.
- **Props/Interface**:
```ts
interface Props {
  permission: NotifPermission;
  isInstalled: boolean;
  onRequestPermission: () => Promise<NotifPermission>;
  onRegisterFcm: () => Promise<void>;
}
```
- **Imports**: React, Bell/BellRing/X/Share/PlusSquare, NotifPermission type.
- **Quem importa**: `AppModals.tsx`
- **Observacoes**: Z-index z-[200]. Beneficios listados (ingressos, eventos, amizade). Auto-detect iOS via userAgent.

---

## 30. ReportModal

- **Arquivo**: `/Users/vanta/prevanta/components/ReportModal.tsx`
- **Linhas**: 186
- **O que faz**: Modal de denuncia com 5 motivos (Ofensivo, Spam, Perfil falso, Assedio, Outro). Suporta tipos USUARIO, EVENTO, COMUNIDADE, CHAT. Opcao de bloquear usuario. Usa `createPortal` para app-root.
- **Props/Interface**:
```ts
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: TipoDenuncia;
  alvoUserId?: string;
  alvoEventoId?: string;
  alvoComunidadeId?: string;
  alvoNome?: string;
  onSuccess?: (msg: string) => void;
  showBlockOption?: boolean;
}
```
- **Imports**: React, createPortal, AlertTriangle/X/Flag/Ban/Shield, criarDenuncia/bloquearUsuario (reportBlockService).
- **Quem importa**: `EventDetailView.tsx`, `PublicProfilePreviewView.tsx`, `ComunidadePublicView.tsx`, `EventHeader.tsx`, `ChatRoomView.tsx`
- **Observacoes**: Z-index z-[400]. Portal em #app-root. Campo textarea so aparece se motivo=OUTRO.

---

## 31. ResetPasswordView

- **Arquivo**: `/Users/vanta/prevanta/components/ResetPasswordView.tsx`
- **Linhas**: 122
- **O que faz**: Tela de redefinicao de senha. Dois campos (nova senha, confirmar), validacao (min 6 chars, match), update via supabase.auth.updateUser. Tela de sucesso com redirect apos 2s.
- **Props/Interface**:
```ts
interface Props { onComplete: () => void; }
```
- **Imports**: React, TYPOGRAPHY, supabase, Lock/Eye/EyeOff/Check/AlertTriangle.
- **Quem importa**: `App.tsx`
- **Observacoes**: Standalone fullscreen (absolute inset-0).

---

## 32. RestrictedModal

- **Arquivo**: `/Users/vanta/prevanta/components/RestrictedModal.tsx`
- **Linhas**: 64
- **O que faz**: Modal para areas restritas -- pede que guest crie conta ou faca login. Sparkles icon, botoes "Ja tenho conta", "Criar Conta", "Agora nao".
- **Props/Interface**:
```ts
interface RestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onCadastro: () => void;
  mensagem?: string;
}
```
- **Imports**: React, Sparkles, useModalBack, TYPOGRAPHY.
- **Quem importa**: `modules/community/ComunidadePublicView.tsx`
- **Observacoes**: Z-index z-[200]. Similar ao GuestAreaModal de AppModals mas reutilizavel com mensagem customizavel.

---

## 33. ReviewModal

- **Arquivo**: `/Users/vanta/prevanta/components/ReviewModal.tsx`
- **Linhas**: 129
- **O que faz**: Bottom sheet para avaliar evento. 5 estrelas (hover/tap), comentario opcional (max 500), carrega review existente, submit/update via reviewsService. Labels: Pessimo, Ruim, Regular, Bom, Excelente.
- **Props/Interface**:
```ts
interface ReviewModalProps {
  eventoId: string;
  eventoNome: string;
  userId: string;
  onClose: () => void;
}
```
- **Imports**: React, X/Star/Send, reviewsService.
- **Quem importa**: `modules/event-detail/EventDetailView.tsx` (e lazy em AppModals)
- **Observacoes**: Export default (nao named). Safe area bottom. Auto-close apos sucesso (1.2s).

---

## 34. SectionFilterChips

- **Arquivo**: `/Users/vanta/prevanta/components/SectionFilterChips.tsx`
- **Linhas**: 56
- **O que faz**: Chips de filtro horizontais (scroll overflow-x-auto no-scrollbar). Suporta 2 niveis de chips em cascata. Chip ativo com estilo dourado.
- **Props/Interface**:
```ts
interface SectionFilterChipsProps {
  chips: string[];
  selected: string;
  onSelect: (chip: string) => void;
  chips2?: string[];
  selected2?: string;
  onSelect2?: (chip: string) => void;
}
```
- **Imports**: React.
- **Quem importa**: `IndicaPraVoceSection.tsx`, `MaisVendidosSection.tsx`, `BeneficiosMVSection.tsx`, `DescubraCidadesSection.tsx`, `LocaisParceiroSection.tsx`
- **Observacoes**: React.memo com displayName. So renderiza se chips > 1.

---

## 35. SessionExpiredModal

- **Arquivo**: `/Users/vanta/prevanta/components/SessionExpiredModal.tsx`
- **Linhas**: 55
- **O que faz**: Modal exibido quando sessao expira. Escuta evento custom `vanta:session-expired` no window. Mostra aviso e botao re-login.
- **Props/Interface**:
```ts
{ onLogin: () => void; }
```
- **Imports**: React, LogIn/AlertTriangle, TYPOGRAPHY, useAuthStore.
- **Quem importa**: `App.tsx`
- **Observacoes**: Z-index z-[200]. So aparece se usuario estava logado (currentAccountId truthy).

---

## 36. Skeleton

- **Arquivo**: `/Users/vanta/prevanta/components/Skeleton.tsx`
- **Linhas**: 82
- **O que faz**: Shimmer placeholder para loading states. Exporta variantes: Skeleton (base), EventCardSkeleton, TicketCardSkeleton, ProfileSkeleton, PersonCardSkeleton, ChatItemSkeleton, HighlightCardSkeleton.
- **Props/Interface**:
```ts
interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}
```
- **Imports**: React.
- **Quem importa**: 12 arquivos -- ProximosEventosSection, IndicaPraVoceSection, MaisVendidosSection, BeneficiosMVSection, AllBeneficiosView, CityView, AllEventsView, HistoricoView, MyTicketsView, WalletView, MessagesView, SearchView.
- **Observacoes**: animate-pulse bg-zinc-800/60. aria-hidden="true".

---

## 37. Toast

- **Arquivo**: `/Users/vanta/prevanta/components/Toast.tsx`
- **Linhas**: 124
- **O que faz**: Sistema de toast completo com 4 tipos (sucesso, erro, aviso, info). Exporta: ToastContainer (renderiza lista), useToast hook (estado local), globalToast (callable de qualquer lugar sem contexto), GlobalToastContainer (singleton pro App). Auto-dismiss 3s.
- **Props/Interface**:
```ts
type ToastType = 'sucesso' | 'erro' | 'aviso' | 'info';
interface ToastData { id: number; tipo: ToastType; msg: string; }
```
- **Imports**: React, Check/X/AlertTriangle/Info.
- **Quem importa**: `App.tsx` (GlobalToastContainer), 18+ arquivos usam `globalToast` (EventDetailView, criarEvento, comunidades, etc.)
- **Observacoes**: Z-index z-[600]. Fade-in/out com translateY. Max 5 toasts simultaneos.

---

## 38. TosAcceptModal

- **Arquivo**: `/Users/vanta/prevanta/components/TosAcceptModal.tsx`
- **Linhas**: 134
- **O que faz**: Modal de aceite obrigatorio de TOS para criar eventos. Checkbox "Li e aceito", salva tos_accepted_at + tos_version no Supabase profiles. Exporta tambem `checkTosAccepted()` utility.
- **Props/Interface**:
```ts
interface TosAcceptModalProps {
  userId: string;
  userName: string;
  onAccepted: () => void;
  onBack: () => void;
}
```
- **Imports**: React, Shield, TYPOGRAPHY, supabase, useModalBack.
- **Quem importa**: `features/admin/views/CriarEventoView.tsx`
- **Observacoes**: TOS_VERSION = '1.0'. Timestamp BR correto. Conteudo dos termos esta em bullets (nao texto legal completo -- esse esta no LegalView).

---

## 39. UnsavedChangesModal

- **Arquivo**: `/Users/vanta/prevanta/components/UnsavedChangesModal.tsx`
- **Linhas**: 47
- **O que faz**: Modal "Sair sem salvar?" com botoes "Continuar Editando" (primary) e "Sair sem salvar" (secondary). Usa useModalBack.
- **Props/Interface**:
```ts
{ onStay: () => void; onLeave: () => void; }
```
- **Imports**: React, AlertTriangle/X, TYPOGRAPHY, useModalBack.
- **Quem importa**: `CriarEventoView.tsx`, `EditarEventoView.tsx`, `criarComunidade/index.tsx`, `VantaIndicaView.tsx`, `comunidades/EditarModal.tsx`
- **Observacoes**: Z-index z-[500]. Identidade visual VANTA (rounded-[2.5rem], dourado).

---

## 40. VantaColorPicker

- **Arquivo**: `/Users/vanta/prevanta/components/VantaColorPicker.tsx`
- **Linhas**: 147
- **O que faz**: Color picker com paleta de 30 cores predefinidas + input hex manual. Botao que abre modal, preview da cor, grid 10 colunas, confirmar.
- **Props/Interface**:
```ts
interface VantaColorPickerProps {
  value: string; // hex
  onChange: (value: string) => void;
  className?: string;
}
```
- **Imports**: React, Check/X, useModalBack.
- **Quem importa**: `features/admin/views/PlanosMaisVantaView.tsx`
- **Observacoes**: Paleta inclui cores VANTA (#FFD300) ate preto. Modal z-[60].

---

## 41. VantaConfirmModal

- **Arquivo**: `/Users/vanta/prevanta/components/VantaConfirmModal.tsx`
- **Linhas**: 92
- **O que faz**: Modal de confirmacao estilo VANTA (substitui confirm() nativo). Variante danger com icone AlertTriangle. Exporta tambem VantaAlertModal (so OK, substitui alert()).
- **Props/Interface**:
```ts
// VantaConfirmModal:
interface VantaConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}
// VantaAlertModal:
{ title: string; message: string; onClose: () => void; }
```
- **Imports**: React, AlertTriangle, TYPOGRAPHY.
- **Quem importa**: `VantaIndicaView.tsx`, `cargosPlataforma/index.tsx`
- **Observacoes**: Bottom sheet style (items-end). Safe area bottom. Pill handle.

---

## 42. VantaDatePicker

- **Arquivo**: `/Users/vanta/prevanta/components/VantaDatePicker.tsx`
- **Linhas**: 270
- **O que faz**: Date picker customizado com calendario modal. Botao trigger com icone Calendar, formatacao BR (DD/MM/YYYY), calendario mensal com navegacao, year picker (grid), suporte min/max date, highlight hoje, highlight selecionado.
- **Props/Interface**:
```ts
interface VantaDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}
```
- **Imports**: React, ChevronLeft/ChevronRight/Calendar/X, useModalBack.
- **Quem importa**: 10 arquivos -- criarEvento, EditProfileView, ComemoracaoFormView, EventoPrivadoFormView, HorarioOverridesEditor, CuponsComunidadeTab, etc.
- **Observacoes**: Meses em portugues. Labels D/S/T/Q/Q/S/S. Year picker range 100 anos. Modal z-[60].

---

## 43. VantaDropdown

- **Arquivo**: `/Users/vanta/prevanta/components/VantaDropdown.tsx`
- **Linhas**: 69
- **O que faz**: Dropdown customizado substituindo `<select>` nativo. Click fora fecha. Suporte a cor por opcao. Check na opcao selecionada.
- **Props/Interface**:
```ts
// Inline no FC:
{
  value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```
- **Imports**: React, Check/ChevronDown.
- **Quem importa**: 19 arquivos (muito usado em admin) -- criarEvento, ComemoracaoFormView, EventoPrivadoFormView, EditarModal, TabEquipe, SiteContentView, etc.
- **Observacoes**: Max-h-48 com scroll no dropdown. Z-50 no dropdown list.

---

## 44. VantaPickerModal

- **Arquivo**: `/Users/vanta/prevanta/components/VantaPickerModal.tsx`
- **Linhas**: 155
- **O que faz**: Picker modal bottom sheet com busca opcional. Botao trigger que abre modal, lista de items com check no selecionado, search filter.
- **Props/Interface**:
```ts
interface PickerItem { value: string; label: string; }
interface VantaPickerModalProps {
  items: PickerItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
}
```
- **Imports**: React, X/Search/Check, useModalBack.
- **Quem importa**: `modules/profile/EditProfileView.tsx`
- **Observacoes**: Z-index z-[600]. Auto-focus no campo de busca. Safe area bottom. Rounded-[2rem] top.

---

## 45. VantaSlider

- **Arquivo**: `/Users/vanta/prevanta/components/VantaSlider.tsx`
- **Linhas**: 33
- **O que faz**: Slider estilizado com visual VANTA. Track escuro, thumb amarelo #FFD300, fill progressivo via linear-gradient.
- **Props/Interface**:
```ts
interface VantaSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}
```
- **Imports**: React.
- **Quem importa**: `VantaIndicaView.tsx`, `PriceFilterModal.tsx`, `ImageCropperModal.tsx`, `criarEvento/Step5Financeiro.tsx`, `ImageCropModal.tsx`
- **Observacoes**: Usa classe CSS `vanta-slider` + inline background gradient.

---

## 46. VantaTimePicker

- **Arquivo**: `/Users/vanta/prevanta/components/VantaTimePicker.tsx`
- **Linhas**: 181
- **O que faz**: Time picker customizado com colunas de hora (0-23) e minuto (step configuravel, default 5). Botao trigger com icone Clock. Modal com scroll colunas, preview HH:MM grande.
- **Props/Interface**:
```ts
interface VantaTimePickerProps {
  value: string; // HH:MM
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  step?: number;
}
```
- **Imports**: React, Clock/X, useModalBack.
- **Quem importa**: `ComemoracaoConfigSubView.tsx`, `HorarioOverridesEditor.tsx`, `criarEvento/Step2Ingressos.tsx`, `DuplicarModal.tsx`, `HorarioFuncionamentoEditor.tsx`
- **Observacoes**: Scroll para posicao inicial na montagem. Item height 40px. Modal z-[60].

---

## 47. ViewAllCard

- **Arquivo**: `/Users/vanta/prevanta/components/ViewAllCard.tsx`
- **Linhas**: 21
- **O que faz**: Card "Ver todos" para carroseis horizontais. Icone seta, label customizavel.
- **Props/Interface**:
```ts
interface ViewAllCardProps {
  onClick: () => void;
  label?: string;
}
```
- **Imports**: React, ArrowRight.
- **Quem importa**: `EventCarousel.tsx`, `LocaisParceiroSection.tsx`, `CityView.tsx`
- **Observacoes**: React.memo com displayName. Aspect 4/5. Border dourada sutil.

---

## 48. auth/FieldError

- **Arquivo**: `/Users/vanta/prevanta/components/auth/FieldError.tsx`
- **Linhas**: 6
- **O que faz**: Componente de erro de campo de formulario. Texto vermelho pulsante uppercase.
- **Props/Interface**:
```ts
{ msg?: string; }
```
- **Imports**: React.
- **Quem importa**: `AuthModal.tsx`, `CompletarPerfilCPF.tsx`
- **Observacoes**: Retorna null se msg undefined. animate-pulse.

---

## 49. auth/authHelpers

- **Arquivo**: `/Users/vanta/prevanta/components/auth/authHelpers.ts`
- **Linhas**: 78
- **O que faz**: Utilitarios de validacao e formatacao para autenticacao: isValidDate, isAdult (16+), isValidEmail, isValidNome (2 palavras, sem fake patterns, sem numeros), fmtDataNasc (DD/MM/YYYY), fmtTelefone, fmtCPF, isValidCPF (algoritmo completo com digitos verificadores).
- **Props/Interface**: N/A (utility module, sem componente).
- **Exports**: inputCls (re-export de constants), isValidDate, isAdult, isValidEmail, isValidNome, fmtDataNasc, fmtTelefone, fmtCPF, isValidCPF.
- **Imports**: inputCls de constants.
- **Quem importa**: `EditProfileView.tsx`, `CompletarPerfilSocial.tsx`, `AuthModal.tsx`, `ClubeOptInView.tsx`, `CheckoutPage.tsx`, `CompletarPerfilCPF.tsx`
- **Observacoes**: isValidNome bloqueia nomes sem vogais, caracteres repetidos 4+, numeros, caracteres especiais (exceto acentos/apostrofo/hifen).

---

## 50. form/AccordionSection

- **Arquivo**: `/Users/vanta/prevanta/components/form/AccordionSection.tsx`
- **Linhas**: 96
- **O que faz**: Secao accordion animada com icone, titulo, badge, borda colorida, conteudo expansivel com transicao maxHeight.
- **Props/Interface**:
```ts
interface AccordionSectionProps {
  title: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
  iconEmoji?: string;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
  borderColor?: string;
  children: React.ReactNode;
  className?: string;
}
```
- **Imports**: React, ChevronDown.
- **Quem importa**: Via barrel `components/form` -- `CriarEventoView.tsx`, `Step3Operacao.tsx`, `Step4ProdutoresTaxas.tsx`
- **Observacoes**: Recalcula scrollHeight ao abrir (timer 10ms). Chevron rotate-180 ao abrir.

---

## 51. form/InputField

- **Arquivo**: `/Users/vanta/prevanta/components/form/InputField.tsx`
- **Linhas**: 90
- **O que faz**: Campo de input reutilizavel com label uppercase, prefix/suffix, contador de caracteres, erro/hint, required asterisk dourado.
- **Props/Interface**:
```ts
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: 'text' | 'number' | 'tel' | 'email';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}
```
- **Imports**: React.
- **Quem importa**: Via barrel `components/form`
- **Observacoes**: Erro com animate fadeIn 150ms. Border vermelho em erro.

---

## 52. form/SectionTitle

- **Arquivo**: `/Users/vanta/prevanta/components/form/SectionTitle.tsx`
- **Linhas**: 38
- **O que faz**: Titulo de secao com icone, subtitulo, slot de acao. Fonte Playfair Display serif.
- **Props/Interface**:
```ts
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
  action?: React.ReactNode;
  className?: string;
}
```
- **Imports**: React.
- **Quem importa**: Via barrel `components/form`
- **Observacoes**: Border-b border-white/5. Titulo truncate.

---

## 53. form/TextAreaField

- **Arquivo**: `/Users/vanta/prevanta/components/form/TextAreaField.tsx`
- **Linhas**: 67
- **O que faz**: TextArea reutilizavel com label, contador de caracteres com cores (verde/amarelo/vermelho por percentual), erro/hint, required.
- **Props/Interface**:
```ts
interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}
```
- **Imports**: React.
- **Quem importa**: Via barrel `components/form`
- **Observacoes**: Contador muda cor: >80% amber, >=100% red.

---

## 54. form/UploadArea

- **Arquivo**: `/Users/vanta/prevanta/components/form/UploadArea.tsx`
- **Linhas**: 120
- **O que faz**: Area de upload de imagem com click para selecionar, preview da imagem atual, label "Trocar foto", validacao de tipo (JPEG/PNG/WebP) e tamanho (maxSizeMB), aspect ratio configuravel.
- **Props/Interface**:
```ts
interface UploadAreaProps {
  label: string;
  aspectRatio?: string;
  currentUrl?: string;
  onSelect: (dataUrl: string) => void;
  maxSizeMB?: number;
  maxHeight?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}
```
- **Imports**: React, Upload (lucide).
- **Quem importa**: Via barrel `components/form`
- **Observacoes**: Accept `image/jpeg,image/png,image/webp`. FileReader para dataURL. Reset input para permitir re-selecao.

---

## 55. form/index

- **Arquivo**: `/Users/vanta/prevanta/components/form/index.ts`
- **Linhas**: 5
- **O que faz**: Barrel export do modulo form.
- **Exports**: InputField, TextAreaField, SectionTitle, UploadArea, AccordionSection.
- **Quem importa**: `CriarEventoView.tsx`, `Step3Operacao.tsx`, `Step4ProdutoresTaxas.tsx`

---

## 56. wizard/DraftBanner

- **Arquivo**: `/Users/vanta/prevanta/components/wizard/DraftBanner.tsx`
- **Linhas**: 83
- **O que faz**: Banner de rascunho nao finalizado. Le draft do localStorage, mostra data de salvamento, botoes "Continuar" e "Descartar".
- **Props/Interface**:
```ts
interface DraftBannerProps {
  draftKey: string;
  onRestore: (data: unknown) => void;
  onDiscard: () => void;
}
```
- **Imports**: React, FileText.
- **Quem importa**: Exportado via wizard/index (sem consumers diretos encontrados -- componentes futuros do FormWizard).
- **Observacoes**: localStorage key: `draft_${draftKey}`. Data formatada em pt-BR timezone SP.

---

## 57. wizard/FormWizard

- **Arquivo**: `/Users/vanta/prevanta/components/wizard/FormWizard.tsx`
- **Linhas**: 118
- **O que faz**: Container wizard generico com header (titulo, subtitulo, botao fechar), StepIndicator, area de conteudo scrollavel, footer com botoes Anterior/Proximo (ou submit no ultimo step). ForwardRef expondo scrollRef.
- **Props/Interface**:
```ts
interface FormWizardProps {
  steps: StepIndicatorStep[];
  currentStep: number; // 0-based
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  nextLabel?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  topSlot?: React.ReactNode;
  children: React.ReactNode;
}
interface FormWizardRef { scrollRef: HTMLDivElement | null; }
```
- **Imports**: React, ArrowLeft, TYPOGRAPHY, StepIndicator.
- **Quem importa**: Exportado via wizard/index (sem consumers diretos encontrados -- pode ser componente preparado para futuro).
- **Observacoes**: Safe area bottom no footer. max-w-3xl no conteudo. Backdrop blur no header.

---

## 58. wizard/StepIndicator

- **Arquivo**: `/Users/vanta/prevanta/components/wizard/StepIndicator.tsx`
- **Linhas**: 60
- **O que faz**: Indicador de progresso do wizard. Barra de progresso animada + labels dos steps. Fallback para telas < 360px (mostra "Step X de Y").
- **Props/Interface**:
```ts
interface StepIndicatorStep {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
}
interface StepIndicatorProps {
  steps: StepIndicatorStep[];
  currentStep: number;
  completedSteps: number[];
}
```
- **Imports**: React.
- **Quem importa**: `FormWizard.tsx`, exportado via wizard/index.
- **Observacoes**: Barra dourada #FFD300 com transicao. Labels com 3 estados (current, completed, future).

---

## 59. wizard/index

- **Arquivo**: `/Users/vanta/prevanta/components/wizard/index.ts`
- **Linhas**: 8
- **O que faz**: Barrel export do modulo wizard.
- **Exports**: StepIndicator, StepIndicatorStep, StepIndicatorProps, FormWizard, FormWizardProps, DraftBanner, DraftBannerProps.
- **Quem importa**: Nenhum consumer direto encontrado (componentes preparados para uso futuro).

---

## 60. Home/CitySelector

- **Arquivo**: `/Users/vanta/prevanta/components/Home/CitySelector.tsx`
- **Linhas**: 78
- **O que faz**: Dropdown de selecao de cidade (overlay flutuante). Busca cidades com eventos via RPC (`vantaService.getCidadesComEventos`). Auto-seleciona primeira cidade se nenhuma selecionada.
- **Props/Interface**:
```ts
{ isOpen: boolean; onClose: () => void; }
```
- **Imports**: React, MapPin/Check/X, TYPOGRAPHY, useAuthStore, vantaService.
- **Quem importa**: `App.tsx`
- **Observacoes**: Z-index z-[100]. Posicao absolute top-[4.5rem] centered. Backdrop blur 2xl. Usa selectedCity do authStore.

---

## 61. Home/NotificationPanel

- **Arquivo**: `/Users/vanta/prevanta/components/Home/NotificationPanel.tsx`
- **Linhas**: 460
- **O que faz**: Painel de notificacoes completo. Filtros (Todas/Social/Eventos/Ingressos), icones por tipo (foto do profile para amizade, foto do evento, icones especificos), acoes inline (aceitar/recusar amizade, aceitar/recusar cortesia), marcar todas como lidas, cache de profiles e fotos de eventos.
- **Props/Interface**:
```ts
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationAction: (notif: Notificacao) => void;
  onMemberClick?: (member: any) => void;
}
```
- **Imports**: React, X/Bell/Check/UserCheck/UserX/Gift/Star/UserCog/Crown/Building2/Wallet, TYPOGRAPHY, OptimizedImage, Notificacao/Membro types, supabase, eventosAdminService, useAuthStore, useSocialStore, useTicketsStore.
- **Quem importa**: `App.tsx`
- **Observacoes**: Z-index z-[120]. Filtra notificacoes dos ultimos 7 dias (exceto friend requests/cortesias/reviews). 18 tipos de notificacao categorizados. Animacoes de aceitar/recusar com fade out. Backdrop blur 80px.

---

## 62. Profile/ProfilePreviewControls

- **Arquivo**: `/Users/vanta/prevanta/components/Profile/ProfilePreviewControls.tsx`
- **Linhas**: 29
- **O que faz**: Toggle para visualizar perfil "como Publico" ou "como Amigo". Dois botoes pill com estado ativo dourado.
- **Props/Interface**:
```ts
interface ProfilePreviewControlsProps {
  profilePreviewStatus: 'PUBLIC' | 'FRIENDS';
  setProfilePreviewStatus: (status: 'PUBLIC' | 'FRIENDS') => void;
}
```
- **Imports**: React, TYPOGRAPHY.
- **Quem importa**: `modules/profile/PublicProfilePreviewView.tsx`
- **Observacoes**: Simples toggle visual. Sem logica de negocio.

---

## Resumo Estatistico

| Metrica | Valor |
|---|---|
| Total de componentes | 62 (incluindo subcomponentes Layout/TabBar+Header, Skeleton variantes, Toast sistema, VantaConfirmModal+VantaAlertModal) |
| Total de arquivos | 59 |
| Total de linhas | ~7.236 |
| Componente mais usado | OptimizedImage (19 consumers) |
| Componente mais longo | LegalView (506 linhas, maioria texto juridico) |
| Componente mais curto | FieldError (6 linhas) |
| Componentes sem consumers | BatchActionBar, BottomSheet, NotFoundView, wizard/* (preparados mas nao integrados) |
| Componentes DEV-only | DevLogPanel, DevQuickLogin |

---


## Capitulo 3

# Documentacao Completa - /Users/vanta/prevanta/modules/

## 1. CHECKOUT (`modules/checkout/`)

---

### 1.1 CheckoutPage.tsx
- **Linhas:** 1108
- **O que faz:** Pagina standalone de checkout de ingressos. Carrega evento e variacoes do Supabase, permite selecao de ingressos com stepper, selecao de mesas (planta interativa), cupons de desconto, acompanhantes, desconto MAIS VANTA, meia-entrada, login inline com email/senha, fluxo gratuito via RPC `processar_compra_checkout`, fluxo pago via Edge Function `create-ticket-checkout` que redireciona ao Stripe Checkout. Inclui perfil progressivo (CPF + telefone), waitlist para esgotados.
- **Props/Interface:**
```ts
// Sem props externas (React.FC sem generics)
// Tipos locais:
type Step = 'select' | 'login' | 'success';
interface CheckoutEvento {
  id: string; titulo: string; data: string; dataReal: string; horario: string;
  local: string; formato: string; imagem: string; ocultarValor: boolean;
  lotes: { nome: string; preco: number }[]; mesasAtivo: boolean; plantaMesas?: string;
}
interface CheckoutVariacao {
  id: string; area: string; areaCustom?: string; genero: string; valor: number;
  limite: number; vendidos: number; requerComprovante?: boolean; tipoComprovante?: string;
}
```
- **Imports:**
  - `react`, `react-router-dom` (useParams, useSearchParams)
  - `lucide-react` (X, Lock, ShoppingBag, Plus, Minus, Loader2, Bell, BellRing, Zap, AlertTriangle, Tag, UserPlus, MapPin)
  - `../../types` (Ingresso, Mesa, Cupom)
  - `../../services/supabaseClient`
  - `../../features/admin/services/cuponsService`
  - `../../features/admin/services/comprovanteService`
  - `../../services/notifyService`
  - `../../services/comemoracaoService`
  - `../../services/logger`
  - `../../components/OptimizedImage`
  - `./SuccessScreen`, `./WaitlistModal`
  - `../../components/CompletarPerfilCPF`
  - `@/components/auth/authHelpers` (fmtTelefone)
- **Quem importa:** `App.tsx` (lazy import, rota `/checkout/:slug`)
- **Trechos relevantes:**
  - Supabase queries: `eventos_admin`, `lotes`, `variacoes_ingresso`, `mesas`, `membros_clube`, `mais_vanta_config_evento`, `profiles`
  - RPC: `processar_compra_checkout`
  - Edge Function: `create-ticket-checkout`
  - Componente interno `Stepper` para +/- quantidade
  - Calculo de preco com cupom + desconto MAIS VANTA
- **Observacoes:**
  - Codigo morto apos `return` na L550-575 (notificacao de comemoracao nunca executa)
  - Arquivo grande (1108 linhas) -- candidato a refactor/split
  - `useMemo` importado mas nao usado

---

### 1.2 CheckoutSuccessPage.tsx
- **Linhas:** 196
- **O que faz:** Pagina de retorno apos pagamento Stripe. Faz polling na tabela `pedidos_checkout` a cada 2s (max 30s) para verificar status do pagamento. Mostra estados: polling, confirmed, failed, timeout. Usa BroadcastChannel para notificar o app principal. Tracking de behavior (PURCHASE).
- **Props/Interface:**
```ts
type Status = 'polling' | 'confirmed' | 'failed' | 'timeout';
// Sem props (React.FC)
```
- **Imports:** `react`, `react-router-dom`, `lucide-react` (Check, Loader2, AlertTriangle, Share2), `supabaseClient`, `logger`, `behaviorService`
- **Quem importa:** `App.tsx` (lazy import, rota `/checkout/sucesso`)
- **Trechos relevantes:**
  - Polling com `setInterval(poll, 2000)` e `MAX_ATTEMPTS = 15`
  - Query `pedidos_checkout` com cast `as 'profiles'` (workaround para tipos nao gerados)
  - `BroadcastChannel('vanta_tickets')` para comunicacao cross-tab
  - `behaviorService.trackPurchase`
  - Share nativo via `navigator.share`
- **Observacoes:** Cast `as 'profiles'` no from e necessario ate regenerar types

---

### 1.3 SuccessScreen.tsx
- **Linhas:** 160
- **O que faz:** Tela de sucesso pos-compra (fluxo gratuito). Mostra confete animado, QR codes pseudo-gerados dos ingressos, botao de compartilhar e "Ver meu ingresso".
- **Props/Interface:**
```ts
interface Props {
  tickets: Ingresso[];
  titulo: string;
  data: string;
}
```
- **Imports:** `react`, `lucide-react` (Sparkles), `../../types` (Ingresso)
- **Quem importa:** `CheckoutPage.tsx`
- **Trechos relevantes:**
  - Componente `Confetti` com 40 pecas CSS animadas (keyframes confetti-fall)
  - Componente `QRGrid` que gera grid 7x7 pseudo-aleatorio a partir de seed
  - `navigator.share` / clipboard fallback
- **Observacoes:** `eventoId` extraido via `window.location.pathname` (variavel global fora do componente)

---

### 1.4 WaitlistModal.tsx
- **Linhas:** 61
- **O que faz:** Modal bottom-sheet para inscrever email na lista de espera quando ingresso esgotado.
- **Props/Interface:**
```ts
interface Props {
  eventoId: string;
  variacaoId: string;
  onClose: () => void;
  onSuccess: (variacaoId: string) => void;
}
```
- **Imports:** `react`, `waitlistService`, `useModalBack`
- **Quem importa:** `CheckoutPage.tsx`
- **Observacoes:** Componente simples e bem encapsulado

---

## 2. COMMUNITY (`modules/community/`)

---

### 2.1 ComemoracaoFormView.tsx
- **Linhas:** 227
- **O que faz:** Formulario para solicitar comemoracao (aniversario, despedida, outro) numa comunidade. Campos: motivo, nome, data aniversario, data comemoracao, celular, Instagram. Usa `comemoracaoService.solicitar()`.
- **Props/Interface:**
```ts
interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  eventoId?: string;
  eventoNome?: string;
  onBack: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `comemoracaoService`, `useAuthStore`, `VantaDropdown`, `VantaDatePicker`, `globalToast`
- **Quem importa:** `ComunidadePublicView.tsx`, `EventDetailView.tsx`

---

### 2.2 EventoPrivadoFormView.tsx
- **Linhas:** 354
- **O que faz:** Formulario para solicitar evento privado numa comunidade. Carrega config da comunidade (formatos, atracoes, faixas de capacidade) do Supabase. Campos: nome, empresa, email, telefone, Instagram, data, estimativa, capacidade, horario, formatos, atracoes, descricao.
- **Props/Interface:**
```ts
interface Props {
  comunidadeId: string;
  comunidadeNome: string;
  onBack: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `eventoPrivadoService`, `useAuthStore`, `VantaDropdown`, `VantaDatePicker`, `globalToast`
- **Quem importa:** `ComunidadePublicView.tsx`

---

### 2.3 ComunidadePublicView.tsx
- **Linhas:** 667
- **O que faz:** Pagina publica de uma comunidade (local/parceiro). Mostra: foto de capa, info, horario de funcionamento, reviews, eventos proximos, deal MAIS VANTA (com modal de termos), botoes de seguir/contato/denunciar, formularios de evento privado e comemoracao. Verifica se a comunidade participa do MAIS VANTA. Botoes de acao: confirmar presenca, solicitar evento, comemorar.
- **Props/Interface:**
```ts
interface ComunidadePublicData {
  id: string; nome: string; foto: string; foto_capa: string | null;
  descricao: string; cidade: string; estado: string | null;
  endereco: string; coords: { lat: number; lng: number } | null;
  horario_funcionamento: HorarioSemanal[] | null;
  horario_overrides: HorarioOverride[] | null;
  evento_privado_ativo: boolean;
}
interface ComunidadePublicViewProps {
  comunidadeId: string; onBack: () => void;
  onEventClick: (evento: Evento) => void;
  onMemberClick?: (membro: Membro) => void;
  onRequestLogin?: () => void;
  onRequestCadastro?: () => void;
  onNavigateToClube?: () => void;
}
```
- **Imports:** `react`, `lucide-react` (muitos icones), `TYPOGRAPHY`, `types` (Evento, Membro, HorarioSemanal, HorarioOverride), `vantaService`, `supabaseClient`, `communityFollowService`, `profileToMembro`, `reviewsService`, `useAuthStore`, `HorarioPublicDisplay`, `RestrictedModal`, `ReportModal`, `globalToast`, `OptimizedImage`, `clubeService`, `getMvConfig`, `EventoPrivadoFormView`, `ComemoracaoFormView`
- **Quem importa:** `App.tsx` (lazy import)

---

## 3. CONVITE (`modules/convite/`)

---

### 3.1 AceitarConviteMVPage.tsx
- **Linhas:** 242
- **O que faz:** Pagina standalone para aceitar convite MAIS VANTA via link `/convite-mv/:token`. Busca convite no Supabase, verifica status/expiracao. Se usuario nao logado, mostra modal de login. Se logado, aceita o convite via RPC. Suporta convites tipo MEMBRO e PARCEIRO.
- **Props/Interface:**
```ts
interface ConviteInfo {
  id: string; tipo: 'MEMBRO' | 'PARCEIRO'; tier?: string;
  parceiro_nome?: string; status: string; expira_em: string;
}
type PageState = 'loading' | 'show' | 'needLogin' | 'accepting' | 'success' | 'error';
```
- **Imports:** `react`, `react-router-dom`, `lucide-react`, `supabaseClient`, `useAuthStore`, lazy `AuthModal`
- **Quem importa:** `App.tsx` (lazy import, rota `/convite-mv/:token`)

---

## 4. EVENT-DETAIL (`modules/event-detail/`)

---

### 4.1 EventDetailView.tsx
- **Linhas:** 656
- **O que faz:** View principal de detalhe do evento. Orquestra subcomponentes (EventHeader, EventInfo, EventFooter, EventSocialProof). Gerencia: presenca, favoritos, reviews, convite de amigos, beneficios MAIS VANTA, comemoracao, report. Busca: review stats, beneficios MV do evento, desconto percentual por tier.
- **Props/Interface:**
```ts
interface EventDetailViewProps {
  evento: Evento; onBack: () => void;
  onBuy: (evento: Evento, variacaoId?: string) => void;
  onConfirmarPresenca: (evento: Evento) => boolean | void;
  onMemberClick: (membro: Membro) => void;
  onComunidadeClick?: (id: string) => void;
  onSuccess?: (message: string) => void;
  onNavigateToClube?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `types`, `TYPOGRAPHY`, `utils` (getMinPrice), `openCheckoutUrl`, `EventHeader`, `EventInfo`, `EventFooter`, `EventSocialProof`, `PresencaConfirmationModal`, `InviteFriendsModal`, `useAuthStore`, `useSocialStore`, `useChatStore`, `useTicketsStore`, `useExtrasStore`, `eventosAdminService`, `reviewsService`, `clubeService`, `MaisVantaBeneficioModal`, `ReviewModal`, `ComemoracaoFormView`, `trackEventOpen`, `behaviorService`, `BeneficioMV`, `getMvConfig`, `ReportModal`, `globalToast`
- **Quem importa:** `App.tsx` (lazy import, usado em overlay de detalhe)
- **Observacoes:** Usa 5 stores Zustand simultaneamente

---

### 4.2 EventFooter.tsx
- **Linhas:** 124
- **O que faz:** Footer do detalhe do evento. Mostra preco/formato, badge "lotando", botoes "Comprar Ingresso" ou "Confirmar Presenca" (evento gratis), e badge MAIS VANTA com desconto.
- **Props/Interface:**
```ts
interface EventFooterProps {
  evento: Evento; minPrice: number; hasTicket: boolean; hasPresenca: boolean;
  capacityPct?: number; temBeneficioMV?: boolean; beneficioMVDetalhe?: string;
  onBuy: () => void; onConfirmarPresenca: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Evento)
- **Quem importa:** `EventDetailView.tsx`

---

### 4.3 EventHeader.tsx
- **Linhas:** 110
- **O que faz:** Header do detalhe do evento com imagem hero, gradient overlay, botoes de voltar/compartilhar/favoritar/denunciar.
- **Props/Interface:**
```ts
interface EventHeaderProps {
  evento: Evento; onBack: () => void; onShareSuccess?: (msg: string) => void;
  isFavorited?: boolean; onToggleFavorite?: () => void; onReport?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (Evento), `OptimizedImage`, `ReportModal`, `globalToast`
- **Quem importa:** `EventDetailView.tsx`

---

### 4.4 EventInfo.tsx
- **Linhas:** 121
- **O que faz:** Bloco de informacoes do evento: data/horario (inicio e fim), local com link Google Maps, comunidade organizadora, descricao.
- **Props/Interface:**
```ts
interface EventInfoProps {
  evento: Evento; isNextDay: boolean; onComunidadeClick?: (id: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (Evento)
- **Quem importa:** `EventDetailView.tsx`

---

### 4.5 EventSocialProof.tsx
- **Linhas:** 337
- **O que faz:** Secao de prova social do evento. Mostra avatares de amigos confirmados, contador de confirmados totais, lista expandivel com busca de confirmados. Busca membros confirmados e amigos do usuario no Supabase.
- **Props/Interface:**
```ts
interface EventSocialProofProps {
  eventoId: string; totalConfirmados: number;
  onMemberClick: (membro: Membro) => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Membro), `TYPOGRAPHY`, `supabaseClient`, `profileToMembro`, `useDebounce`, `useAuthStore`, `OptimizedImage`, `useSocialStore`
- **Quem importa:** `EventDetailView.tsx`

---

### 4.6 InviteFriendsModal.tsx
- **Linhas:** 126
- **O que faz:** Modal para convidar amigos para um evento. Lista de amigos filtravel com busca, selecao multipla, envio de convites.
- **Props/Interface:**
```ts
interface InviteFriendsModalProps {
  isOpen: boolean; onClose: () => void; friends: Membro[];
  evento: Evento; onSendInvite: (friendIds: string[]) => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Membro, Evento), `TYPOGRAPHY`, `useDebounce`, `useModalBack`
- **Quem importa:** `EventDetailView.tsx`

---

### 4.7 MaisVantaBeneficioModal.tsx
- **Linhas:** 195
- **O que faz:** Modal que mostra detalhes de beneficio MAIS VANTA num evento. Inclui aceite de termos de uso, instrucoes, link para Instagram do venue, botao de confirmar resgate.
- **Props/Interface:**
```ts
interface Props {
  isOpen: boolean; onClose: () => void; beneficio: BeneficioMV;
  beneficioLabel: string; descontoPercentual: number | null;
  eventoNome: string; venueName: string; venueInstagram?: string;
  onConfirmar: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `BeneficioMV` type, `maisVantaConfigService`, `useModalBack`
- **Quem importa:** `EventDetailView.tsx`

---

### 4.8 PresencaConfirmationModal.tsx
- **Linhas:** 84
- **O que faz:** Modal de confirmacao apos confirmar presenca. Mostra link copiavel para compartilhar, botao de convidar amigos.
- **Props/Interface:**
```ts
interface PresencaConfirmationModalProps {
  isOpen: boolean; onClose: () => void; evento: Evento;
  userName: string; onInviteFriends: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Evento), `TYPOGRAPHY`, `useModalBack`
- **Quem importa:** `EventDetailView.tsx`

---

## 5. HOME (`modules/home/`)

---

### 5.1 HomeView.tsx
- **Linhas:** 241
- **O que faz:** View principal da Home. Orquestra todas as secoes: greeting personalizado, pull-to-refresh, busca, Highlights (carousel), ProximosEventos, MaisVendidos, IndicaPraVoce, BeneficiosMV, LocaisParceiro, DescubraCidades. Usa LazySection para carregamento preguicoso.
- **Props/Interface:**
```ts
interface HomeViewProps {
  onEventClick: (e: Evento) => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: (sub: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenNotifications?: () => void;
  onEventoIndicaClick?: (eventoId: string) => void;
  onComunidadeClick?: (id: string) => void;
  onComemorarClick?: (comunidadeId?: string) => void;
  onOpenAllEvents?: (cidade: string) => void;
  onOpenAllPartners?: (cidade: string) => void;
  onOpenAllBeneficios?: (cidade: string) => void;
  onOpenCityView?: (cidade: string) => void;
}
```
- **Imports:** `react`, `types` (Evento), `Highlights`, `LazySection`, `ProximosEventosSection`, `MaisVendidosSection`, `LocaisParceiroSection`, `DescubraCidadesSection`, `IndicaPraVoceSection`, `BeneficiosMVSection`, `TYPOGRAPHY`, `lucide-react`, `useAuthStore`, `useExtrasStore`, `clubeService`
- **Quem importa:** `App.tsx` (import direto, nao lazy -- componente principal da tab Home)

---

### 5.2 AllBeneficiosView.tsx
- **Linhas:** 94
- **O que faz:** View full-screen de todos os beneficios MAIS VANTA por cidade. Paginacao infinita (PAGE_SIZE=20), busca eventos com beneficio via `vantaService`.
- **Props/Interface:**
```ts
interface AllBeneficiosViewProps {
  cidade: string; onBack: () => void;
  onEventClick: (e: Evento) => void; onComunidadeClick?: (id: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCard`, `EventCardSkeleton`, `vantaService`, `useAuthStore`, `clubeService`
- **Quem importa:** `App.tsx` (lazy import)

---

### 5.3 AllEventsView.tsx
- **Linhas:** 101
- **O que faz:** View full-screen de todos os eventos por cidade. Tabs futuros/passados. Paginacao infinita.
- **Props/Interface:**
```ts
interface AllEventsViewProps {
  cidade: string; onBack: () => void;
  onEventClick: (e: Evento) => void; onComunidadeClick?: (id: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCard`, `EventCardSkeleton`, `vantaService`
- **Quem importa:** `App.tsx` (lazy import)

---

### 5.4 AllPartnersView.tsx
- **Linhas:** 99
- **O que faz:** View full-screen de todos os parceiros (comunidades) por cidade. Paginacao infinita.
- **Props/Interface:**
```ts
interface AllPartnersViewProps {
  cidade: string; onBack: () => void; onComunidadeClick: (id: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (Parceiro), `vantaService`
- **Quem importa:** `App.tsx` (lazy import)

---

### 5.5 CityView.tsx
- **Linhas:** 154
- **O que faz:** View de uma cidade especifica. Mostra eventos proximos, passados e parceiros da cidade com carrosels. Usa LazySection.
- **Props/Interface:**
```ts
interface CityViewProps {
  cidade: string; onBack: () => void;
  onEventClick: (e: Evento) => void; onComunidadeClick: (id: string) => void;
  onOpenAllEvents: (cidade: string) => void; onOpenAllPartners: (cidade: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCarousel`, `PartnerCard`, `ViewAllCard`, `EventCardSkeleton`, `vantaService`, `LazySection`
- **Quem importa:** `App.tsx` (lazy import)

---

### 5.6 components/Highlights.tsx
- **Linhas:** 320
- **O que faz:** Carousel principal "VANTA Indica" na Home. Cards com imagem, badge de tipo (EVENTO, PARCEIRO, MAIS_VANTA, etc.), auto-play com intervalo de 5s, indicadores de posicao. Suporta clique em evento/comunidade/club.
- **Props/Interface:**
```ts
interface HighlightsProps {
  currentCity: string;
  onEventoClick?: (eventoId: string) => void;
  onComemorarClick?: (comunidadeId?: string) => void;
  onComunidadeClick?: (comunidadeId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToProfile?: (sub: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `adminService`, `VantaIndicaCard` type, `OptimizedImage`
- **Quem importa:** `HomeView.tsx`

---

### 5.7 components/HomeFilterOverlay.tsx
- **Linhas:** 194
- **O que faz:** Overlay de filtros da secao ProximosEventos. Duas tabs: Tipo de Evento (formato) e Estilo Musical. Carrega formatos e estilos que existem em eventos da cidade via Supabase. Permite selecao multipla com reset. Usa `<ModalPortal>` para renderizar no `#vanta-app` (evita posicionamento errado dentro de scroll).
- **Props/Interface:**
```ts
interface HomeFilterOverlayProps {
  onClose: () => void; cidade: string;
  currentFilters?: string[] | null; onApply: (filters: string[] | null) => void;
}
type TabType = 'FORMATO' | 'ESTILO';
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `supabaseClient`, `ModalPortal`
- **Quem importa:** `ProximosEventosSection.tsx`

---

### 5.8 components/EventCarousel.tsx
- **Linhas:** 57
- **O que faz:** Carousel horizontal padronizado de EventCards. Todas as secoes da Home usam este componente. Margem 20px, gap 12px, scroll horizontal.
- **Props/Interface:**
```ts
interface EventCarouselProps {
  eventos: Evento[]; onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void; showCityInsteadOfLocal?: boolean;
  distLabels?: Map<string, string>; onViewAll?: () => void;
  viewAllLabel?: string; maxCards?: number;
}
```
- **Imports:** `react`, `types` (Evento), `EventCard`, `ViewAllCard`
- **Quem importa:** `ProximosEventosSection`, `MaisVendidosSection`, `BeneficiosMVSection`, `IndicaPraVoceSection`, `CityView`

---

### 5.9 components/ProximosEventosSection.tsx
- **Linhas:** 265
- **O que faz:** Secao "Proximos Eventos" na Home. Busca eventos por cidade, carrega estilos musicais para chips de filtro. Suporta filtros locais via overlay + chips. Agrupa em sub-carroseis por formato/estilo. Tracking de visualizacao.
- **Props/Interface:**
```ts
interface ProximosEventosSectionProps {
  cidade: string; userId?: string;
  onEventClick: (e: Evento) => void; onComunidadeClick?: (id: string) => void;
  onViewAll: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCarousel`, `vantaService`, `EventCardSkeleton`, `trackEventView`, `filterTopGroups`, `HomeFilterOverlay`
- **Quem importa:** `HomeView.tsx`

---

### 5.10 components/MaisVendidosSection.tsx
- **Linhas:** 161
- **O que faz:** Secao "Mais Vendidos" (top 10 vendas em 24h). Chips de filtro por formato. Sub-carroseis por formato. Usa `filterTopGroups`.
- **Props/Interface:**
```ts
interface MaisVendidosSectionProps {
  cidade: string; onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCarousel`, `vantaService`, `EventCardSkeleton`, `SectionFilterChips`, `filterTopGroups`
- **Quem importa:** `HomeView.tsx`

---

### 5.11 components/IndicaPraVoceSection.tsx
- **Linhas:** 215
- **O que faz:** Secao "Indica pra voce" personalizada. Busca eventos baseados nos interesses do usuario (behavior tracking). Se membro MAIS VANTA, tambem mostra deals de parceiros. Inclui cards de deals e carousel de eventos.
- **Props/Interface:**
```ts
interface IndicaPraVoceSectionProps {
  cidade: string; onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void; onViewAll?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCarousel`, `vantaService`, `clubeDealsService`, `behaviorService`, `useAuthStore`, `EventCardSkeleton`, `SectionFilterChips`
- **Quem importa:** `HomeView.tsx`
- **Observacoes:** Inclui componentes internos `DealCard` e `DealCarousel`

---

### 5.12 components/BeneficiosMVSection.tsx
- **Linhas:** 168
- **O que faz:** Secao de beneficios MAIS VANTA na Home. So aparece para membros do clube. Mostra eventos com beneficio exclusivo, chips de filtro por tipo, sub-carroseis.
- **Props/Interface:**
```ts
interface BeneficiosMVSectionProps {
  cidade: string; onEventClick: (e: Evento) => void;
  onComunidadeClick?: (id: string) => void; onViewAll: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `EventCarousel`, `vantaService`, `useAuthStore`, `clubeService`, `EventCardSkeleton`, `SectionFilterChips`, `filterTopGroups`
- **Quem importa:** `HomeView.tsx`

---

### 5.13 components/LocaisParceiroSection.tsx
- **Linhas:** 82
- **O que faz:** Secao "Locais Parceiros" na Home. Mostra parceiros (comunidades) por cidade em cards horizontais. Chips de filtro por tipo.
- **Props/Interface:**
```ts
interface LocaisParceiroSectionProps {
  cidade: string; onComunidadeClick: (id: string) => void; onViewAll: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (Parceiro), `PartnerCard`, `ViewAllCard`, `vantaService`, `SectionFilterChips`
- **Quem importa:** `HomeView.tsx`

---

### 5.14 components/DescubraCidadesSection.tsx
- **Linhas:** 86
- **O que faz:** Secao "Descubra Cidades" na Home. Mostra cidades com eventos, excluindo a cidade atual. Chips de filtro por estado.
- **Props/Interface:**
```ts
interface DescubraCidadesSectionProps {
  cidadeAtual: string; onCidadeClick: (cidade: string) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (CidadeResumo), `CityCard`, `vantaService`, `SectionFilterChips`
- **Quem importa:** `HomeView.tsx`

---

### 5.15 components/GuestSignupBanner.tsx
- **Linhas:** 53
- **O que faz:** Banner CTA para visitantes nao cadastrados na Home. Mostra 3 beneficios (favoritos, indicacoes, notificacoes) e botao "Criar minha conta" que abre modal de auth.
- **Props/Interface:** `{ onSignup: () => void }`
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`
- **Quem importa:** `HomeView.tsx` (renderizado entre ProximosEventos e IndicaPraVoce, so quando `isGuest`)

---

### 5.16 components/ModalPortal.tsx
- **Linhas:** 17
- **O que faz:** Portal React que renderiza children no `#vanta-app` via `createPortal`. Usar quando modal com `absolute inset-0` esta dentro de scroll container e precisa cobrir a tela inteira.
- **Props/Interface:** `{ children: React.ReactNode }`
- **Imports:** `react`, `react-dom`
- **Quem importa:** `HomeFilterOverlay.tsx`, `PremiumCalendar.tsx`, `ProfileView.tsx`

---

### 5.17 components/LazySection.tsx
- **Linhas:** 26
- **O que faz:** Wrapper que renderiza children somente quando o elemento entra no viewport (margin 200px). Usa IntersectionObserver.
- **Props/Interface:** `{ children: ReactNode }`
- **Imports:** `react`
- **Quem importa:** `HomeView.tsx`, `CityView.tsx`

---

### 5.16 utils/filterSubCarousels.ts
- **Linhas:** 28
- **O que faz:** Utilitario para filtrar sub-carroseis. Minimo dinamico baseado no total de eventos (< 15: 2, < 30: 3, >= 30: 5). Maximo 4 sub-carroseis. Ordena por quantidade de itens.
- **Props/Interface:**
```ts
export interface SubGroup<T> { label: string; items: T[]; }
export function filterTopGroups<T>(groups: SubGroup<T>[], totalEventos: number): SubGroup<T>[]
```
- **Imports:** nenhum
- **Quem importa:** `ProximosEventosSection`, `MaisVendidosSection`, `BeneficiosMVSection`

---

## 6. LANDING (`modules/landing/`)

---

### 6.1 EventLandingPage.tsx
- **Linhas:** 318
- **O que faz:** Landing page publica de evento para SEO/compartilhamento. Usa react-helmet-async para meta tags (Open Graph). Busca evento do Supabase com lotes e variacoes. Mostra: imagem hero, data/hora, local com link Maps, descricao, tabela de precos por lote. Botao CTA redireciona para checkout. Salva ref do promoter em localStorage.
- **Props/Interface:**
```ts
interface LotePublico {
  id: string; nome: string;
  variacoes: { id: string; label: string; preco: number; limite: number; vendidos: number; }[];
}
interface EventoPublico {
  id: string; nome: string; descricao: string; foto: string;
  dataInicio: string; dataFim: string; local: string;
  endereco: string; cidade: string;
  comunidade: { nome: string; foto: string };
  lotes: LotePublico[];
}
```
- **Imports:** `react`, `react-router-dom`, `react-helmet-async`, `lucide-react`, `supabaseClient`, `fmtBRL`
- **Quem importa:** `App.tsx` (lazy import, rota `/evento/:slug`)
- **Observacoes:** Pagina standalone sem layout do app (sem sidebar/tabs)

---

## 7. MESSAGES (`modules/messages/`)

---

### 7.1 MessagesView.tsx
- **Linhas:** 220
- **O que faz:** View principal de mensagens. Lista de conversas com busca, tabs CONVERSAS/ARQUIVADAS, moods dos participantes, botao de novo chat. Filtra bloqueados. Swipe actions nos items (arquivar/mutar).
- **Props/Interface:**
```ts
type MessagesTab = 'CONVERSAS' | 'ARQUIVADAS';
interface MessagesViewProps {
  onOpenChat: (member: Membro) => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Membro), `TYPOGRAPHY`, `ChatListItem`, `NewChatModal`, `ArchiveModal`, `useChatStore`, `useSocialStore`, `useDebounce`, `EmptyState`, `moodService`, `Skeleton`, `useBloqueados`, `globalToast`
- **Quem importa:** `App.tsx` (lazy import)

---

### 7.2 components/ChatRoomView.tsx
- **Linhas:** 396
- **O que faz:** View completa de sala de chat. Mensagens com scroll infinito, envio de texto, delecao com timer 15min, reacoes com emoji, busca nas mensagens (ctrl+f mobile), perfil do participante inline, acoes de amizade (add/remove/cancel), status online, report e bloqueio.
- **Props/Interface:**
```ts
interface ChatRoomViewProps {
  chat: Chat; onBack: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Chat, Membro), `PublicProfilePreviewView`, `MessageBubble`, `useAuthStore`, `useSocialStore`, `useChatStore`, `useDebounce`, `ReportModal`, `globalToast`
- **Quem importa:** `App.tsx` (lazy import)

---

### 7.3 components/ChatListItem.tsx
- **Linhas:** 141
- **O que faz:** Item de lista de chat com avatar, nome, ultima mensagem, timestamp, badge de nao-lida, indicador online, mood emoji. Swipe horizontal para acoes (arquivar/desarquivar, mutar/desmutar).
- **Props/Interface:**
```ts
interface ChatListItemProps {
  chat: Chat; onClick: () => void; index: number;
  isOnline?: boolean; moodEmoji?: string | null;
  isArchived?: boolean; isMuted?: boolean;
  onArchive?: () => void; onUnarchive?: () => void;
  onMute?: () => void; onUnmute?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `types` (Chat), `formatRelativeTime`, `OptimizedImage`
- **Quem importa:** `MessagesView.tsx`

---

### 7.4 components/MessageBubble.tsx
- **Linhas:** 162
- **O que faz:** Bolha de mensagem individual. Long press para acoes (reagir/deletar). Suporta reacoes com emoji, mensagens deletadas, highlight de busca, timestamp opcional. Delecao limitada a 15min.
- **Props/Interface:**
```ts
interface MessageBubbleProps {
  msg: Mensagem; isMe: boolean; currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  searchQuery?: string; showTimestamp?: boolean;
}
```
- **Imports:** `react`, `lucide-react` (Trash2), `types` (Mensagem)
- **Quem importa:** `ChatRoomView.tsx`

---

### 7.5 components/ArchiveModal.tsx
- **Linhas:** 75
- **O que faz:** Modal de confirmacao para arquivar conversa. Opcao de manter arquivada permanentemente.
- **Props/Interface:**
```ts
interface ArchiveModalProps {
  isOpen: boolean; onClose: () => void;
  onConfirm: (keepArchived: boolean) => void; participantNome: string;
}
```
- **Imports:** `react`, `lucide-react` (Archive, X)
- **Quem importa:** `MessagesView.tsx`

---

### 7.6 components/NewChatModal.tsx
- **Linhas:** 79
- **O que faz:** Modal para iniciar nova conversa. Lista de amigos filtravel com busca debounced.
- **Props/Interface:**
```ts
{ isOpen: boolean; onClose: () => void; friends: Membro[]; onSelectFriend: (m: Membro) => void; }
```
- **Imports:** `react`, `lucide-react`, `types` (Membro), `TYPOGRAPHY`, `useDebounce`, `useModalBack`
- **Quem importa:** `MessagesView.tsx`

---

## 8. PARCEIRO (`modules/parceiro/`)

---

### 8.1 ParceiroDashboardPage.tsx
- **Linhas:** 571
- **O que faz:** Dashboard para parceiros MAIS VANTA. Tabs: DEALS (lista de ofertas), RESGATES (historico de resgates com QR scan), QR_SCAN (scanner de QR Code para check-in). Mostra metricas (total resgates, resgates do mes, membros unicos). Formulario inline para sugerir novo deal. QR Scanner usa html5-qrcode com validacao via `clubeResgatesService`.
- **Props/Interface:**
```ts
type Tab = 'DEALS' | 'RESGATES' | 'QR_SCAN';
// Sem props (React.FC)
```
- **Imports:** `react`, `react-router-dom`, `lucide-react` (muitos icones), `useAuthStore`, `parceiroService`, `clubeResgatesService`, types do `parceiroService`
- **Quem importa:** `App.tsx` (lazy import, rota `/parceiro`)

---

### 8.2 parceiroService.ts
- **Linhas:** 144
- **O que faz:** Service para operacoes do parceiro MAIS VANTA. Funcoes: getMeuParceiro (busca dados do parceiro logado), getDeals (lista deals), getResgates (lista resgates com join), getMetricas (total/mes/unicos), sugerirDeal (insere rascunho de deal).
- **Props/Interface:**
```ts
export interface ParceiroDados {
  id: string; nome: string; tipo: string; foto_url?: string;
  cidade_nome?: string; plano: string;
  resgates_mes_limite: number; resgates_mes_usados: number;
}
export interface DealParceiro {
  id: string; titulo: string; tipo: string; status: string;
  vagas: number; vagas_preenchidas: number; inicio?: string; fim?: string;
}
export interface ResgateParceiro {
  id: string; deal_titulo?: string; user_nome?: string;
  status: string; aplicado_em: string; checkin_em?: string;
}
export interface MetricasParceiro {
  totalResgates: number; resgatesMes: number; membrosUnicos: number;
}
```
- **Imports:** `supabaseClient`
- **Quem importa:** `ParceiroDashboardPage.tsx`
- **Tabelas Supabase:** `parceiros_mais_vanta`, `deals_mais_vanta`, `resgates_mais_vanta`, `cidades_mais_vanta`, `profiles`

---

## 9. PROFILE (`modules/profile/`)

---

### 9.1 ProfileView.tsx
- **Linhas:** 793
- **O que faz:** View principal do perfil do usuario. Gerencia sub-views (edit, preferences, preview, historico, pendencias, clube opt-in, comprovante meia, solicitacoes, bloqueados, solicitar parceria). Menu principal com opcoes de perfil. Mostra avatar, nome, badges, mood picker, contadores (eventos, tickets, presencas). Integra LGPD export service.
- **Props/Interface:**
```ts
interface ProfileViewProps {
  subView: ProfileSubView; setSubView: (view: ProfileSubView) => void;
  onUpdateProfile: (data: Partial<Membro>) => void;
  onAdminClick?: () => void; showAdminGuide?: boolean;
  onClearAdminGuide?: () => void; onLogout?: () => void;
  onEventClick?: (evento: Evento) => void; onSuccess?: (msg: string) => void;
  clubeConviteId?: string | null; onClearConviteId?: () => void;
  onReturnFromSubView?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `OptimizedImage`, `types`, `EditProfileView`, `PreferencesView`, `PublicProfilePreviewView`, `HistoricoView`, `MinhasPendenciasView`, `ClubeOptInView`, `clubeService`, `comprovanteService`, `ComprovanteMeiaSection`, `SolicitarParceriaView`, `MinhasSolicitacoesView`, `BloqueadosView`, `lgpdExportService`, `useAuthStore`, `useTicketsStore`, `useExtrasStore`, `moodService`, `MoodPicker`
- **Quem importa:** `App.tsx` (lazy import)

---

### 9.2 PublicProfilePreviewView.tsx
- **Linhas:** 817
- **O que faz:** Preview de perfil publico (proprio ou de outro usuario). Mostra: avatar com mood, nome, bio, badges, achievements, nivel de participacao, botoes de acao social (adicionar amigo, chat, remover, bloquear), album de fotos, interesses, eventos em comum. Suporte a privacidade (PUBLIC/FRIENDS).
- **Props/Interface:**
```ts
{
  profile: Membro; onBack: () => void; isOwner?: boolean;
  onOpenChat?: (m: Membro) => void;
  profilePreviewStatus?: 'PUBLIC' | 'FRIENDS';
  setProfilePreviewStatus?: (status: 'PUBLIC' | 'FRIENDS') => void;
  friendshipStatusOverride?: string;
  onRequestFriendOverride?: (id: string) => void;
}
```
- **Imports:** `react`, `ProfilePreviewControls`, `lucide-react`, `types` (Membro, PrivacidadeOpcao), `clubeService`, `TYPOGRAPHY`, `achievementsService`, `useSocialStore`, `moodService`, `ReportModal`, `globalToast`
- **Quem importa:** `App.tsx` (lazy import), `ChatRoomView.tsx`

---

### 9.3 EditProfileView.tsx
- **Linhas:** 683
- **O que faz:** Edicao completa de perfil. Campos: avatar (upload, crop, album), nome, email, data nascimento, CPF, telefone, estado/cidade, genero, pronomes, bio, Instagram, interesses. Validacao client-side. Privacidade (quem pode ver bio/foto/eventos). Opcao de deletar conta.
- **Props/Interface:**
```ts
interface ValidationError { field: string; message: string; }
{ profile: Membro; onBack: () => void; onSave: (d: Partial<Membro>) => void; }
```
- **Imports:** `react`, `@/components/auth/authHelpers`, `lucide-react`, `types`, `TYPOGRAPHY`, `InterestSelector`, `ImageCropperModal`, `imageUtils`, `photoService`, `Toast`, `brData`, `avatars`, `VantaPickerModal`, `VantaDatePicker`
- **Quem importa:** `ProfileView.tsx`

---

### 9.4 HistoricoView.tsx
- **Linhas:** 271
- **O que faz:** Historico de eventos do usuario. Mostra: timeline de eventos (ingressos + presencas), achievements/badges com progress, nivel de participacao (baseado em achievementsService).
- **Props/Interface:**
```ts
interface HistoricoViewProps {
  myTickets: Ingresso[]; myPresencas: string[];
  allEvents: Evento[]; userId: string;
  onBack: () => void; onEventClick: (evento: Evento) => void;
}
interface HistoricoItem {
  eventoId: string; evento: Evento;
  tipo: 'INGRESSO' | 'PRESENCA'; dataSort: string;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `achievementsService`, `EmptyState`, `EventCardSkeleton`
- **Quem importa:** `ProfileView.tsx`

---

### 9.5 MinhasPendenciasView.tsx
- **Linhas:** 193
- **O que faz:** View de pendencias do usuario. Tabs: Solicitacoes (parceria), Amizades (pendentes), Eventos Privados. Carrega dados do Supabase e services. Usa contadores por tab.
- **Props/Interface:**
```ts
type TabType = 'SOLICITACOES' | 'AMIZADES' | 'EVENTOS_PRIVADOS';
interface Props { onBack: () => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `supabaseClient`, `useAuthStore`, `eventoPrivadoService`, `TabSolicitacoesParceria`, `TabAmizadesPendentes`, `TabEventosPrivados`
- **Quem importa:** `ProfileView.tsx`

---

### 9.6 MinhasSolicitacoesView.tsx
- **Linhas:** 577
- **O que faz:** View de solicitacoes do usuario (eventos privados + comemoracoes). Tabs PRIVADOS/COMEMORACOES. Mostra timeline visual de status (ENVIADA > VISUALIZADA > EM_ANALISE > APROVADA), QR codes para comemoracoes aprovadas, link de ref para vendas, post de contra-partida, botao copiar link.
- **Props/Interface:**
```ts
type TabType = 'PRIVADOS' | 'COMEMORACOES';
interface TimelineStep { key: string; label: string; color: string; timestamp: string | null; reached: boolean; }
interface Props { onBack: () => void; }
```
- **Imports:** `react`, `lucide-react`, `qrcode.react`, `TYPOGRAPHY`, `eventoPrivadoService`, `comemoracaoService`
- **Quem importa:** `ProfileView.tsx`

---

### 9.7 ClubeOptInView.tsx
- **Linhas:** 1250
- **O que faz:** View de adesao ao MAIS VANTA (clube de beneficios). Duas fases: Fase 1 (formulario de aplicacao - Instagram, profissao, como conheceu, termos) e Fase 2 (dashboard de membro - reservas ativas/passadas, post de contrapartida, cancelamento). Mostra eventos com beneficio, status da solicitacao, termos de uso em modal.
- **Props/Interface:**
```ts
interface Props {
  profile: Membro; onBack: () => void; onSuccess?: (msg: string) => void;
  allEvents?: Evento[]; conviteId?: string;
}
```
- **Imports:** `react`, `@/components/auth/authHelpers`, `lucide-react`, `TYPOGRAPHY`, `types`, `ResgateMV` type, `clubeService`, `maisVantaConfigService`, `tsBR/todayBR`, `supabaseClient`
- **Quem importa:** `ProfileView.tsx`
- **Observacoes:** Arquivo muito grande (1250 linhas) -- forte candidato a refactor/split

---

### 9.8 ComprovanteMeiaSection.tsx
- **Linhas:** 497
- **O que faz:** Secao de upload de comprovante de meia-entrada. Suporta multiplos arquivos (frente, verso, extra), preview de imagem, selecao de tipo (ESTUDANTE, IDOSO, PCD, etc.), custom tipo. Status do comprovante (PENDENTE, APROVADO, EXPIRADO). Versioning com `getVersion`.
- **Props/Interface:**
```ts
interface Props { userId: string; onSuccess?: (msg: string) => void; onBack?: () => void; }
interface ArquivoUpload { label: string; dataUrl: string; filename: string; }
```
- **Imports:** `react`, `lucide-react`, `comprovanteService`, `TIPOS_COMPROVANTE_MEIA`, `ComprovanteMeia` type
- **Quem importa:** `ProfileView.tsx`

---

### 9.9 BloqueadosView.tsx
- **Linhas:** 114
- **O que faz:** Lista de usuarios bloqueados com opcao de desbloquear. Confirmacao antes de desbloquear.
- **Props/Interface:**
```ts
interface Props { onBack: () => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `reportBlockService`, `globalToast`
- **Quem importa:** `ProfileView.tsx`

---

### 9.10 PreferencesView.tsx
- **Linhas:** 83
- **O que faz:** View de preferencias de notificacao. Toggles: Push, Lembretes de evento. Botao salvar.
- **Props/Interface:**
```ts
{ onBack: () => void; onSave: (d: any) => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`
- **Quem importa:** `ProfileView.tsx`
- **Observacoes:** Usa `any` no tipo de onSave. Nao persiste preferencias no Supabase (apenas simula com setTimeout).

---

### 9.11 components/ImageCropperModal.tsx
- **Linhas:** 153
- **O que faz:** Modal de crop de imagem para avatar. Usa react-easy-crop. Suporta zoom com slider. Fix para bug de touch-action apos desmontar.
- **Props/Interface:**
```ts
{ image: string; onConfirm: (img: string) => void; onCancel: () => void; }
```
- **Imports:** `react`, `react-easy-crop`, `lucide-react`, `TYPOGRAPHY`, `imageUtils` (getCroppedImg), `VantaSlider`, `useModalBack`
- **Quem importa:** `EditProfileView.tsx`

---

### 9.12 components/InterestSelector.tsx
- **Linhas:** 304
- **O que faz:** Seletor de interesses/categorias do usuario. Busca interesses e categorias do Supabase, agrupa em secoes com emojis. Sections expandiveis. Grid de chips selecionaveis.
- **Props/Interface:**
```ts
interface InteresseDB { id: string; label: string; icone: string; ativo: boolean; ordem: number; }
interface CategoriaDB { id: string; label: string; ativo: boolean; ordem: number; }
interface Section { key: string; title: string; emoji: string; color: string; items: { label: string; icone?: string }[]; }
{ selected: string[]; onToggle: (id: string) => void; }
```
- **Imports:** `react`, `lucide-react`, `supabaseClient`
- **Quem importa:** `EditProfileView.tsx`
- **Tabelas Supabase:** `interesses`, `categorias`

---

### 9.13 components/TabAmizadesPendentes.tsx
- **Linhas:** 74
- **O que faz:** Tab de amizades pendentes (enviadas e recebidas). Mostra avatar, nome, data, direcao (ENVIADO/RECEBIDO).
- **Props/Interface:**
```ts
export interface AmizadePendente {
  id: string; otherId: string; otherNome: string;
  otherAvatar: string | null; createdAt: string;
  direcao: 'ENVIADO' | 'RECEBIDO';
}
```
- **Imports:** `react`, `lucide-react`, `OptimizedImage`
- **Quem importa:** `MinhasPendenciasView.tsx`

---

### 9.14 components/TabEventosPrivados.tsx
- **Linhas:** 161
- **O que faz:** Tab de solicitacoes de eventos privados. Timeline visual de status (ENVIADA > VISUALIZADA > EM_ANALISE > APROVADA/RECUSADA/CONVERTIDA). Cards com detalhes do evento.
- **Props/Interface:**
```ts
{ items: EventoPrivado[] }
```
- **Imports:** `react`, `lucide-react`, `eventoPrivadoService` (EventoPrivado type)
- **Quem importa:** `MinhasPendenciasView.tsx`

---

### 9.15 components/TabSolicitacoesParceria.tsx
- **Linhas:** 101
- **O que faz:** Tab de solicitacoes de parceria. Status com icones coloridos, motivo de rejeicao, data de analise.
- **Props/Interface:**
```ts
export interface SolicitacaoParceria {
  id: string; nome: string; tipo: string; status: string;
  criado_em: string; motivo_rejeicao: string | null;
  cidade: string; categoria: string;
  comunidade_criada_id: string | null; analisado_em: string | null;
}
```
- **Imports:** `react`, `lucide-react`
- **Quem importa:** `MinhasPendenciasView.tsx`

---

### 9.16 utils/imageUtils.ts
- **Linhas:** 67
- **O que faz:** Utilitarios de compressao e crop de imagem. `compressImage` (dataUrl -> JPEG comprimido), `compressFile` (File -> Blob JPEG), `getCroppedImg` (crop retangular de imagem).
- **Props/Interface:**
```ts
export const compressImage = (dataUrl: string, maxPx?: number, quality?: number): Promise<string>
export const compressFile = (file: File, maxPx?: number, quality?: number): Promise<Blob>
export const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string>
```
- **Imports:** nenhum (vanilla JS/Canvas)
- **Quem importa:** `EditProfileView.tsx`, `ImageCropperModal.tsx`, `features/admin/services/parceriaService.ts`, `features/admin/services/comprovanteService.ts`

---

## 10. RADAR (`modules/radar/`)

---

### 10.1 RadarView.tsx
- **Linhas:** 343
- **O que faz:** Mapa interativo (Leaflet) com eventos e parceiros como pins. Mostra localizacao do usuario, filtros (data, raio, live), calendario premium, zoom controls, cards de evento/parceiro ao clicar nos pins. Pins com icones customizados (foto do evento, foto do parceiro, avatar do usuario).
- **Props/Interface:**
```ts
interface RadarViewProps {
  onEventSelect: (evento: Evento) => void;
  onNavigateToTab?: (tab: TabState) => void;
}
```
- **Imports:** `react`, `react-leaflet` (MapContainer, TileLayer, Marker, Circle), `lucide-react`, `types`, `TYPOGRAPHY`, `MapController`, `PremiumCalendar`, `mapIcons`, `useRadarLogic`, `useAuthStore`, `useGeolocationPermission`, `globalToast`
- **Quem importa:** `App.tsx` (lazy import)

---

### 10.2 hooks/useRadarLogic.ts
- **Linhas:** 251
- **O que faz:** Hook customizado com toda a logica do Radar. Gerencia: geolocalizacao (silenciosa), busca de eventos por raio, busca de parceiros, filtro por data, calculo do evento mais proximo, fallback bounds. Usa Leaflet para distancias.
- **Props/Interface:**
```ts
export interface ParceiroPin {
  id: string; nome: string; foto_url: string | null;
  tipo: string; coords: { lat: number; lng: number };
}
// Retorna objeto com: events, parceiros, loading, activeEvent, userLocation, selectedDate, zoomAction, etc.
```
- **Imports:** `react`, `leaflet`, `types` (Evento), `utils` (isEventExpired, todayBR), `vantaService`, `useGeolocationPermission`, `supabaseClient`
- **Quem importa:** `RadarView.tsx`

---

### 10.3 components/MapController.tsx
- **Linhas:** 97
- **O que faz:** Componente que controla zoom e centralizacao do mapa Leaflet. Responde a: zoom action, clique em evento (fly to), localizacao do usuario, raio selecionado, bounds de fallback.
- **Props/Interface:**
```ts
interface MapControllerProps {
  zoomAction: 'in' | 'out' | null;
  activeEventCoords: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  closestEventCoords: { lat: number; lng: number } | null;
  fallbackBounds: L.LatLngBoundsExpression | null;
  selectedRadius: number | null;
  onMove?: (center: L.LatLng) => void;
}
```
- **Imports:** `react`, `react-leaflet` (useMap, useMapEvents), `leaflet`
- **Quem importa:** `RadarView.tsx`

---

### 10.4 components/PremiumCalendar.tsx
- **Linhas:** 117
- **O que faz:** Calendario modal customizado para selecionar data no Radar. Mostra dots indicadores nas datas que tem eventos. Navegacao mes a mes. Estilo dark.
- **Props/Interface:**
```ts
interface PremiumCalendarProps {
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  eventDates?: Set<string>;
}
```
- **Imports:** `react`, `lucide-react`, `useModalBack`
- **Quem importa:** `RadarView.tsx`

---

### 10.5 utils/mapIcons.ts
- **Linhas:** 50
- **O que faz:** Fabrica de icones Leaflet customizados via `L.divIcon`. Tres tipos: createEventIcon (pin circular com foto, glow, live ring), createPartnerIcon (pin circular amber), createUserIcon (pin com ping animation).
- **Props/Interface:**
```ts
interface EventIconOptions { isActive?: boolean; isLive?: boolean; isClosest?: boolean; }
export const createEventIcon = (imageUrl: string, opts?: EventIconOptions) => L.DivIcon
export const createPartnerIcon = (photoUrl?: string | null) => L.DivIcon
export const createUserIcon = (photoUrl?: string) => L.DivIcon
```
- **Imports:** `leaflet`
- **Quem importa:** `RadarView.tsx`

---

## 11. SEARCH (`modules/search/`)

---

### 11.1 SearchView.tsx
- **Linhas:** 530
- **O que faz:** View principal de busca. 4 tabs: EVENTS, PEOPLE, LUGARES, BENEFICIOS. Busca server-side para eventos (debounced), busca de membros via `authService`, busca de comunidades via Supabase. Filtros: cidade, estilo/vibe, periodo, preco. Historico de buscas em localStorage. Paginacao client-side. Tab BENEFICIOS so para membros MAIS VANTA.
- **Props/Interface:**
```ts
interface SearchViewProps {
  onEventClick: (evento: Evento) => void;
  onMemberClick: (membro: Membro) => void;
  onComunidadeClick: (id: string) => void;
}
```
- **Imports:** `react`, `types`, `lucide-react`, `utils`, `SearchHeader`, `SearchResults`, `PeopleResults`, `PlacesResults`, `CityFilterModal`, `VibeFilterModal`, `TimeFilterModal`, `PriceFilterModal`, `authService`, `useBloqueados`, `OptimizedImage`, `Skeleton`, `supabaseClient`, `useAuthStore`, `useExtrasStore`, `useDebounce`, `BeneficiosMVTab`, `clubeService`
- **Quem importa:** `App.tsx` (lazy import)

---

### 11.2 components/SearchHeader.tsx
- **Linhas:** 161
- **O que faz:** Header de busca com input, tabs (EVENTS/PEOPLE/LUGARES/BENEFICIOS), chips de filtros ativos (cidade, estilo, periodo, preco).
- **Props/Interface:**
```ts
interface SearchHeaderProps {
  currentCity: string; query: string; setQuery: (q: string) => void;
  onClearSearch: () => void;
  activeTab: 'EVENTS' | 'PEOPLE' | 'LUGARES' | 'BENEFICIOS';
  onTabChange: (tab: ...) => void; isMembroMV?: boolean;
  selectedCities: string[]; onOpenCityFilter: () => void;
  selectedCategories: string[]; onOpenEstiloFilter: () => void;
  selectedTimeFilter: string | null; onOpenTimeFilter: () => void;
  maxPrice: number | null; onOpenPriceFilter: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`
- **Quem importa:** `SearchView.tsx`

---

### 11.3 components/SearchResults.tsx
- **Linhas:** 103
- **O que faz:** Lista de resultados de busca de eventos. Usa `@tanstack/react-virtual` para virtualizacao (performance com muitos resultados). Mostra card com foto, titulo, data, preco, local.
- **Props/Interface:**
```ts
{ results: Evento[]; currentCity: string; isDefaultView: boolean;
  onEventClick: (e: Evento) => void; onClearSearch: () => void; }
```
- **Imports:** `react`, `lucide-react`, `EmptyState`, `@tanstack/react-virtual`, `types`, `TYPOGRAPHY`, `getMinPrice`, `OptimizedImage`
- **Quem importa:** `SearchView.tsx`

---

### 11.4 components/BeneficiosMVTab.tsx
- **Linhas:** 547
- **O que faz:** Tab de beneficios MAIS VANTA na busca. Unifica beneficios de eventos e deals de parceiros. Filtros por tipo (todos/eventos/parceiros) e categoria. Modal de resgate com QR code. Verificacao de limite de resgates.
- **Props/Interface:**
```ts
interface DealUnificado {
  id: string; titulo: string; subtitulo: string; descricao: string;
  cidade?: string; data?: string; vagasRestantes?: number;
  fotoUrl?: string; dealId: string; parceiroId: string; parceiroTipo?: string;
}
interface Props {
  userId: string; filteredEvents: Evento[];
  onEventClick?: (evento: Evento) => void; query?: string;
}
```
- **Imports:** `react`, `lucide-react`, `qrcode.react`, `clubeService`, `clubeDealsService`, `clubeResgatesService`, `clubeCidadesService`, `supabaseClient`, `types`
- **Quem importa:** `SearchView.tsx`

---

### 11.5 components/CityFilterModal.tsx
- **Linhas:** 77
- **O que faz:** Modal de filtro por cidade. Lista de cidades com checkboxes, botao limpar.
- **Props/Interface:**
```ts
{ isOpen: boolean; onClose: () => void; allCities: string[];
  selectedCities: string[]; onToggleCity: (city: string) => void; onClear: () => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `useModalBack`
- **Quem importa:** `SearchView.tsx`

---

### 11.6 components/VibeFilterModal.tsx
- **Linhas:** 174
- **O que faz:** Modal de filtro por "vibe" (estilo/formato/experiencia). Busca formatos, estilos e categorias do Supabase. Chips selecionaveis.
- **Props/Interface:**
```ts
interface VibeFilters { formatos: string[]; estilos: string[]; experiencias: string[]; }
{ isOpen: boolean; onClose: () => void; selectedCategories: string[];
  onToggleCategory: (id: string) => void; onClear: () => void;
  vibeFilters?: VibeFilters; onVibeFiltersChange?: (filters: VibeFilters) => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `supabaseClient`, `useModalBack`
- **Quem importa:** `SearchView.tsx`

---

### 11.7 components/TimeFilterModal.tsx
- **Linhas:** 341
- **O que faz:** Modal de filtro por periodo. Presets (Hoje, Amanha, Essa Semana, Fim de Semana, Esse Mes) + calendario para range customizado. Calendario inline com selecao de range.
- **Props/Interface:**
```ts
{ isOpen: boolean; onClose: () => void;
  selectedFilter: string | null; onSelectFilter: (f: string | null) => void; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `useModalBack`
- **Quem importa:** `SearchView.tsx`

---

### 11.8 components/PriceFilterModal.tsx
- **Linhas:** 129
- **O que faz:** Modal de filtro por preco maximo. Quick prices (R$100, R$250, R$500, R$500+) + slider customizado.
- **Props/Interface:**
```ts
interface PriceFilterModalProps {
  isOpen: boolean; onClose: () => void;
  maxPrice: number | null; onSelectMaxPrice: (price: number | null) => void;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `useModalBack`, `VantaSlider`
- **Quem importa:** `SearchView.tsx`

---

### 11.9 components/PeopleResults.tsx
- **Linhas:** 40
- **O que faz:** Lista de resultados de busca de pessoas. Cards com avatar, nome, email (username parte).
- **Props/Interface:**
```ts
{ results: Membro[]; onMemberClick?: (m: Membro) => void; }
```
- **Imports:** `react`, `lucide-react`, `types` (Membro), `TYPOGRAPHY`, `DEFAULT_AVATARS`
- **Quem importa:** `SearchView.tsx`

---

### 11.10 components/PlacesResults.tsx
- **Linhas:** 58
- **O que faz:** Lista de resultados de busca de lugares (comunidades/parceiros). Cards com foto, nome, cidade, tipo, rating.
- **Props/Interface:**
```ts
interface Comunidade { id: string; nome: string; cidade: string; foto: string; tipo_comunidade?: string; }
interface Props { results: Comunidade[]; onPlaceClick: (id: string) => void; }
```
- **Imports:** `react`, `lucide-react`, `EmptyState`, `OptimizedImage`
- **Quem importa:** `SearchView.tsx`

---

## 12. WALLET (`modules/wallet/`)

---

### 12.1 WalletView.tsx
- **Linhas:** 518
- **O que faz:** Carteira digital do usuario. Lock screen com PIN de 4 digitos. Tabs: UPCOMING (proximos) e PAST (passados). Mostra: ingressos agrupados por evento, presencas, cortesias pendentes, transferencias pendentes, reservas MAIS VANTA. Acoes: QR code, transferir, devolver cortesia, aceitar/recusar transferencia, postar obrigacao MAIS VANTA.
- **Props/Interface:**
```ts
interface WalletViewProps {
  onGoToHome: () => void; isSubView?: boolean;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onTransferirIngresso?: (ticket: Ingresso, destinatarioId: string, destinatarioNome: string) => void;
  onSuccess?: (msg: string) => void;
}
type WalletTab = 'UPCOMING' | 'PAST';
```
- **Imports:** `react`, `lucide-react`, `types`, `TYPOGRAPHY`, `utils`, `clubeService`, `TicketList`, `PresencaList`, `WalletLockScreen`, `EventTicketsCarousel`, `useAuthStore`, `useTicketsStore`, `useExtrasStore`, `transferenciaService`, `TicketCardSkeleton`, `EmptyState`
- **Quem importa:** `App.tsx` (lazy import)

---

### 12.2 components/EventTicketsCarousel.tsx
- **Linhas:** 767
- **O que faz:** Carousel horizontal de ingressos de um evento. Cada ticket mostra: QR code (com JWT rotativo via `signTicketToken`), nome do titular, variacao, status, acoes (transferir, devolver, comprovante PDF). Inclui modal de reembolso e modal de editar titular. Suporta download de comprovante PDF.
- **Props/Interface:**
```ts
export interface EventoGroup {
  eventoId: string; titulo: string; data: string;
  imagem?: string; tickets: Ingresso[];
}
interface Props {
  grupo: EventoGroup; onBack: () => void;
  onTransferirIngresso?: (...) => void;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onUpdateTitular?: (ticketId: string, nome: string, cpf: string) => Promise<boolean>;
  userId?: string; onReembolsoSucesso?: () => void;
}
```
- **Imports:** `react`, `lucide-react`, `qrcode.react`, `types`, `TYPOGRAPHY`, `gerarComprovantePdf`, `authService`, `signTicketToken`, `TicketQRModal`
- **Quem importa:** `WalletView.tsx`
- **Observacoes:** Arquivo grande (767 linhas) -- inclui modais internos (ReembolsoModal, EditarTitularModal)

---

### 12.3 components/TicketList.tsx
- **Linhas:** 321
- **O que faz:** Lista de ingressos na carteira. Separa regulares e cortesias. Cards com QR mini, variacao, status. Modal de transferencia inline (busca de membros, selecao, confirmacao). Acoes: ver QR, transferir, devolver cortesia.
- **Props/Interface:**
```ts
interface TicketListProps {
  tickets: Ingresso[]; onSelectTicket: (ticket: Ingresso) => void;
  onDevolverCortesia?: (ticket: Ingresso) => void;
  onTransferirIngresso?: (...) => void;
  isPast?: boolean;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types`, `authService`
- **Quem importa:** `WalletView.tsx`
- **Observacoes:** Inclui componente interno `TransferirModal`

---

### 12.4 components/TicketQRModal.tsx
- **Linhas:** 214
- **O que faz:** Modal fullscreen de QR code do ingresso. JWT rotativo a cada 15s via `signTicketToken`. Mostra: relogio, barra de progresso, countdown, info do ingresso, badge de meia-entrada (verifica comprovante via `comprovanteService`).
- **Props/Interface:**
```ts
interface TicketQRModalProps { ticket: Ingresso; onClose: () => void; }
```
- **Imports:** `react`, `lucide-react`, `qrcode.react`, `types`, `signTicketToken`, `comprovanteService`, `supabaseClient`, `useModalBack`
- **Quem importa:** `EventTicketsCarousel.tsx`, `TicketList.tsx` (indiretamente)

---

### 12.5 components/PresencaList.tsx
- **Linhas:** 39
- **O que faz:** Lista de presencas confirmadas (eventos sem ingresso, apenas nome na lista). Mostra titulo, data/horario, status (ativo ou concluido).
- **Props/Interface:**
```ts
interface PresencaListProps { events: Evento[]; isPast?: boolean; }
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `types` (Evento)
- **Quem importa:** `WalletView.tsx`

---

### 12.6 components/WalletLockScreen.tsx
- **Linhas:** 331
- **O que faz:** Tela de bloqueio com PIN de 4 digitos. Tres screens: setup (primeiro uso), confirm (confirmar PIN), unlock (desbloquear). PIN hasheado com SHA-256 e salvo no Supabase (`profiles.wallet_pin`). Keypad numerico animado. Tentativas de login com feedback visual. Opcao de sair.
- **Props/Interface:**
```ts
type Screen = 'setup' | 'confirm' | 'unlock';
interface WalletLockScreenProps {
  onUnlock: () => void; onExit: () => void; userId: string;
}
```
- **Imports:** `react`, `lucide-react`, `TYPOGRAPHY`, `supabaseClient`
- **Quem importa:** `WalletView.tsx`
- **Observacoes:** SHA-256 hash via `crypto.subtle.digest`

---

## Resumo Geral

| Modulo | Arquivos | Linhas Totais | Observacoes |
|--------|----------|---------------|-------------|
| checkout | 4 | 1525 | CheckoutPage e o maior (1108L), codigo morto L550-575 |
| community | 3 | 1248 | ComunidadePublicView (667L) -- mais complexo |
| convite | 1 | 242 | Standalone, auto-contido |
| event-detail | 8 | 1753 | Bem modularizado em componentes |
| home | 13 | 2288 | HomeView orquestra, LazySection para performance |
| landing | 1 | 318 | SEO com react-helmet-async |
| messages | 6 | 1073 | ChatRoomView (396L) mais complexo |
| parceiro | 2 | 715 | Service + Dashboard para parceiros MV |
| profile | 16 | 5947 | ClubeOptInView (1250L!) e o maior arquivo de todo modules/ |
| radar | 5 | 858 | Leaflet maps com hooks separados |
| search | 10 | 2160 | 4 tabs + 5 modais de filtro |
| wallet | 6 | 2190 | Lock screen, QR JWT rotativo, carousels |
| **TOTAL** | **75** | **20317** | |

**Arquivos candidatos a refactor (>500L):** CheckoutPage (1108), ClubeOptInView (1250), PublicProfilePreviewView (817), ProfileView (793), EventTicketsCarousel (767), EditProfileView (683), ComunidadePublicView (667), EventDetailView (656), MinhasSolicitacoesView (577), ParceiroDashboardPage (571), BeneficiosMVTab (547), SearchView (530), WalletView (518), ComprovanteMeiaSection (497).

---


## Capitulo 4

# Inventario Completo: `/Users/vanta/prevanta/features/admin/views/`

**Total de arquivos**: 170 (`.tsx` + `.ts`)
**Total de linhas**: ~52.700

---

## 1. VIEWS RAIZ (~49 arquivos, ~19.400 linhas)

### AnalyticsMaisVantaView.tsx
- **Linhas**: 320
- **O que faz**: Dashboard de analytics do programa MAIS VANTA. Exibe KPIs de membros (total, ativos, novos no mes, por tier), resgates (total, mensal, top deals), parceiros (total, ranking, inativos), receita (assinaturas ativas, valor total) e engajamento (nunca resgatou, media resgates).
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: Queries diretas ao Supabase em `membros_clube`, `resgates_mais_vanta` (com join em `deals_mais_vanta`), `parceiros_mais_vanta`, `assinaturas_mais_vanta`. Calcula metricas no client-side.

### AssinaturasMaisVantaView.tsx
- **Linhas**: 268
- **O que faz**: Listagem e gestao de assinaturas MAIS VANTA. Filtros por status (ATIVA, PENDENTE, CANCELADA, EXPIRADA). KPIs de MRR, totais por status. Acoes de ativar/cancelar com modal de confirmacao.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: assinaturaService, comunidadesService, AdminViewHeader, fmtBRL
- **Quem importa**: DashboardV2Gateway (lazy), MaisVantaHubView
- **Logica de negocio**: assinaturaService.getTodasAssinaturas(), comunidadesService.getAll()

### AuditLogView.tsx
- **Linhas**: 242
- **O que faz**: Timeline de logs de auditoria. Filtros por categoria (TODOS, EVENTOS, MEMBROS, INGRESSOS, SAQUES, CARGOS, LISTAS). Cada log mostra acao humanizada, quem fez, timestamp. Itens expandiveis com detalhes JSON.
- **Props**: `{ onBack: () => void; initialFilter?: FiltroCategoria }`
- **Imports principais**: auditService, AuditLog, AuditAction, formatAuditLog, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: auditService (in-memory)

### CaixaView.tsx
- **Linhas**: 1 (re-export)
- **O que faz**: Re-export de `./caixa`
- **Quem importa**: DashboardV2Gateway

### CategoriasAdminView.tsx
- **Linhas**: 410
- **O que faz**: CRUD de categorias da plataforma (Formatos de Evento, Estilos Musicais, Experiencias, Interesses do Perfil). 4 secoes colapsaveis com etiquetas de onde cada config e usada. Edicao inline, toggle ativo/inativo, delete.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: CRUD direto no Supabase nas tabelas `formatos`, `estilos`, `experiencias`, `interesses`

### CidadesMaisVantaView.tsx
- **Linhas**: 194
- **O que faz**: CRUD de cidades do programa MAIS VANTA. Master cria cidades, delega gerente por cidade. Toggle ativo/inativo.
- **Props**: `{ onBack?: () => void }`
- **Imports principais**: clubeCidadesService, AdminViewHeader, useAuthStore
- **Quem importa**: DashboardV2Gateway (lazy), MaisVantaHubView
- **Logica de negocio**: clubeCidadesService.listar/criar/atualizar

### ComunidadesView.tsx
- **Linhas**: 2 (re-export)
- **O que faz**: Re-export de `./comunidades`

### CondicoesProducerView.tsx
- **Linhas**: 269
- **O que faz**: Tela do socio/gerente para ver e aceitar condicoes comerciais. Mostra card de condicao pendente com taxas (servico, processamento, minimo/ingresso, porta, nomes/lista, cortesias), botoes aceitar/recusar com motivo. Historico de condicoes.
- **Props**: `{ onBack: () => void; comunidadeId: string; comunidadeNome?: string }`
- **Imports principais**: condicoesService, AdminViewHeader, useAuthStore
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: condicoesService.getCondicaoPendente/getHistorico/aceitarCondicoes/recusarCondicoes. Prazo de 7 dias.

### ConfigMaisVantaView.tsx
- **Linhas**: 432
- **O que faz**: Painel de configuracao dinamica MAIS VANTA (master only). Secoes: Branding, Regras, Beneficios, Textos Membro, Textos Venue, Termos. Campos editaveis com chips, listas de vantagens, beneficios.
- **Props**: `React.FC` (sem props)
- **Imports principais**: maisVantaConfigService, MaisVantaConfig, VantagemTexto, BeneficioConfig
- **Quem importa**: MaisVantaHubView
- **Logica de negocio**: maisVantaConfigService.getConfig/saveConfig

### ConfigPlataformaView.tsx
- **Linhas**: 150
- **O que faz**: Master edita taxas e parametros globais da plataforma. Input numerico para cada parametro (percent ou valor).
- **Props**: `{ onBack: () => void; currentUserId: string }`
- **Imports principais**: platformConfigService, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: platformConfigService.getAll/saveAll

### ConvitesMaisVantaView.tsx
- **Linhas**: 379
- **O que faz**: CRUD de convites MAIS VANTA. Criar convites tipo MEMBRO ou PARCEIRO com tier, cidade. Lista de convites com status (PENDENTE, ACEITO, EXPIRADO, CANCELADO). Copiar link, cancelar convite.
- **Props**: `{ onBack: () => void; toastFn: (tipo, msg) => void }`
- **Imports principais**: clubeService (convites), AdminViewHeader, useAuthStore
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: clubeService.convites.listar/criarMembro/criarParceiro/cancelar/getLinkConvite

### CriarComunidadeView.tsx
- **Linhas**: 2 (re-export)
- **O que faz**: Re-export de `./criarComunidade`

### CriarEventoView.tsx
- **Linhas**: 1382
- **O que faz**: Wizard completo de criacao de evento em 5 steps. Step1: dados basicos (foto, nome, descricao, data, hora, formato, estilos, experiencias, recorrencia). Step2: ingressos (lotes com variacoes). Step3: listas (variantes de lista). Step4: equipe (socio ou festa da casa). Step5: financeiro (split). Validacao, publicacao, geracao de ocorrencias recorrentes.
- **Props**: `{ comunidade: Comunidade; onBack: () => void; currentUserId?: string; currentUserNome?: string }`
- **Imports principais**: supabase, eventosAdminService, listasService, cortesiasService, clubeService, useToast, Steps 1-5
- **Quem importa**: GerenteDashboardView, CentralEventosView
- **Logica de negocio**: eventosAdminService.criarEvento, listasService.criarLista, cortesiasService.atribuirCota, supabase.rpc('gerar_ocorrencias_recorrente'). Classificacoes carregadas do Supabase (formatos, estilos, experiencias).

### DatabaseHealthView.tsx
- **Linhas**: 585
- **O que faz**: Painel Health Check + Broadcast Master. 7 checks configurados (sem instagram, sem cidade, sem foto, sem data nasc, sem telefone, curadoria antiga, role guest). Executa queries no Supabase em `profiles`. Selecao de usuarios + envio de broadcast (in-app notification + email via Edge Function).
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, useToast, notificationsService
- **Quem importa**: DiagnosticoView
- **Logica de negocio**: Queries dinamicas em `profiles` com filtros. INSERT em `notifications`. POST para Edge Function `send-invite`.

### DealsMaisVantaView.tsx
- **Linhas**: 464
- **O que faz**: CRUD de deals (beneficios) MAIS VANTA + gestao de resgates. Master cria deals com tipo (DESCONTO ou BARTER), parceiro, cidade, vagas. Overlay de detalhes do deal com lista de candidatos e acoes (selecionar, recusar, verificar post, no-show, concluir).
- **Props**: `{ onBack?: () => void }`
- **Imports principais**: clubeDealsService, clubeResgatesService, clubeParceirosService, clubeCidadesService, useAuthStore
- **Quem importa**: DashboardV2Gateway (lazy), MaisVantaHubView
- **Logica de negocio**: clubeDealsService.criar/listar. clubeResgatesService.selecionar/recusar/verificarPost/noShow/concluir.

### DiagnosticoView.tsx
- **Linhas**: 124
- **O que faz**: Hub de diagnostico com 4 abas: Saude (Health + Supabase), Analytics, FAQ, Ferramentas (Links + Pendencias). Lazy-loads sub-views.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: DatabaseHealthView, SupabaseDiagnosticView, ProductAnalyticsView (lazy), FaqView (lazy), LinksUteisView (lazy), PendenciasAppView (lazy)
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: Orquestracao de sub-views

### DividaSocialMaisVantaView.tsx
- **Linhas**: 297
- **O que faz**: Visao global de divida social MAIS VANTA. Membros que reservaram mas nao postaram. Filtros (pendentes, vencidas, todas). Card por membro com foto, dias passados, horas restantes. Acao "Resolver Divida" com modal de confirmacao.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: clubeService, getResgatesPendentePost, maisVantaConfigService, supabase
- **Quem importa**: DashboardV2Gateway (lazy), MonitoramentoMaisVantaView
- **Logica de negocio**: getResgatesPendentePost(), supabase.from('infracoes_mais_vanta').update. Calculo de prazo via maisVantaConfigService.getConfig().prazoPostHoras.

### EditarEventoView.tsx
- **Linhas**: 912
- **O que faz**: Edicao de evento existente. Reutiliza Steps do CriarEvento. Hidrata dados do evento nos states. Suporte a EM_REVISAO (campos rejeitados marcados). Submit via enviarCorrecao quando em revisao ou eventosAdminService.atualizarEvento quando publicado.
- **Props**: `{ eventoId: string; onBack: () => void; currentUserId: string }`
- **Imports principais**: eventosAdminService, enviarCorrecao, listasService, cortesiasService, clubeService, comunidadesService, Steps, UnsavedChangesModal
- **Quem importa**: MeusEventosView, eventoDashboard/index
- **Logica de negocio**: eventosAdminService.getEvento/atualizarEvento, enviarCorrecao, listasService.atualizarLista

### EventosGlobaisMaisVantaView.tsx
- **Linhas**: 282
- **O que faz**: Visao global de eventos no contexto MAIS VANTA. Filtros (ATIVOS, INATIVOS, TODOS). Lista eventos com badges MV, contagem de resgates por evento. Formatacao de data/hora.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: clubeService, getResgatesEvento, eventosAdminService, comunidadesService
- **Quem importa**: DashboardV2Gateway (lazy), MonitoramentoMaisVantaView

### EventosPendentesView.tsx
- **Linhas**: 1092
- **O que faz**: Fila de aprovacao de eventos pelo master. Cards de evento com foto, dados, detalhes de ingressos/listas/financeiro. Acoes: aprovar, rejeitar (com selecao de campos e motivo), contraproposta de taxas. Aba de edicoes pendentes.
- **Props**: `{ onBack: () => void; masterUserId: string }`
- **Imports principais**: eventosAdminService, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: eventosAdminService.aprovarEvento/rejeitarEvento/aprovarEdicao/rejeitarEdicao. Sistema de contrapropostas com taxas.

### FaqView.tsx
- **Linhas**: 170
- **O que faz**: FAQ estatico para operadores do app. Secoes: Eventos, Financeiro, Equipe, Listas, Check-in, MAIS VANTA. Perguntas/respostas colapsaveis.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: AdminViewHeader
- **Quem importa**: DiagnosticoView (lazy), DashboardV2Gateway (lazy)
- **Logica de negocio**: Nenhuma (conteudo estatico)

### GerenteDashboardView.tsx
- **Linhas**: 780
- **O que faz**: Dashboard principal do gerente de comunidade. KPIs (eventos ativos, proximos, receita, check-ins). Grafico de vendas semanais (Recharts). Semelhancias com eventos da comunidade, acoes rapidas, notificacoes. Botao criar evento.
- **Props**: `{ onBack: () => void; currentUserId: string; currentUserRole: ContaVantaLegacy; comunidadeId?: string; addNotification; onNavigate }`
- **Imports principais**: eventosAdminService, comunidadesService, rbacService, CriarEventoView, BarChart/Recharts
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: getAcessoComunidades, eventosAdminService, condicoesService

### GestaoComprovantesView.tsx
- **Linhas**: 405
- **O que faz**: Master aprova/rejeita comprovantes de meia-entrada. Tabs (PENDENTES, APROVADOS, OUTROS). Preview de imagem, definir validade, aprovar/rejeitar. Busca por nome.
- **Props**: `{ onBack: () => void; masterId: string }`
- **Imports principais**: comprovanteService, AdminViewHeader, useToast, TIPOS_COMPROVANTE_MEIA
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: comprovanteService.listar/aprovar/rejeitar. Supabase profiles join.

### GestaoUsuariosView.tsx
- **Linhas**: 175
- **O que faz**: Buscar, visualizar e gerenciar qualquer usuario do app. Busca por nome/email. Detalhes do usuario (nome, email, role, cidade, criado em, ultimo acesso). Acoes: alterar role, banir.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: supabase.from('profiles').select com ilike search. Update de role.

### InfracoesGlobaisMaisVantaView.tsx
- **Linhas**: 271
- **O que faz**: Visao global de infracoes MAIS VANTA. Filtros (TODAS, NO_SHOW, NAO_POSTOU). Lista infracoes com nome do membro, tipo, evento, data. Config de regras via maisVantaConfigService.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, clubeService, maisVantaConfigService, useToast
- **Quem importa**: DashboardV2Gateway (lazy), MonitoramentoMaisVantaView
- **Logica de negocio**: supabase.from('infracoes_mais_vanta').select com join profiles

### LegalEditorView.tsx
- **Linhas**: 213
- **O que faz**: Editar Termos de Uso, Politica de Privacidade, Termos MV. Versionamento com publicacao controlada. Preview HTML sanitizado (DOMPurify). CRUD de versoes.
- **Props**: `{ onBack: () => void; currentUserId: string }`
- **Imports principais**: legalService, AdminViewHeader, useToast, DOMPurify
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: legalService.listarVersoes/criarVersao/publicarVersao

### LinksUteisView.tsx
- **Linhas**: 115
- **O que faz**: Lista estatica de links uteis para o admin (WhatsApp suporte, email, Instagram, documentacao, Supabase, etc).
- **Props**: `{ onBack: () => void }`
- **Imports principais**: AdminViewHeader
- **Quem importa**: DiagnosticoView (lazy), DashboardV2Gateway (lazy)
- **Logica de negocio**: Nenhuma (conteudo estatico)

### MaisVantaHubView.tsx
- **Linhas**: 105
- **O que faz**: Hub centralizado MAIS VANTA com abas: Planos & Tiers, Planos Produtor, Cidades, Parceiros, Deals, Notificacoes, Assinaturas, Passaportes, Config. Renderiza sub-views conforme aba selecionada.
- **Props**: `{ onBack: () => void; masterId: string }`
- **Imports principais**: PlanosMaisVantaView, AssinaturasMaisVantaView, PassaportesMaisVantaView, ConfigMaisVantaView, CidadesMaisVantaView, ParceirosMaisVantaView, DealsMaisVantaView, PlanosProdutor, NotifMVPendentesView
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: Orquestracao de sub-views

### MasterFinanceiroView.tsx
- **Linhas**: 1 (re-export)
- **O que faz**: Re-export de `./masterFinanceiro`

### MembrosGlobaisMaisVantaView.tsx
- **Linhas**: 563
- **O que faz**: Gestao global de membros MAIS VANTA. Filtros (ATIVOS, BLOQUEADOS, BANIDOS, DIVIDA_SOCIAL, TODOS). Acoes: bloquear, desbloquear, banir, desbanir. Perfis enriquecidos via Supabase.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: clubeService, getResgatesPendentePost, comunidadesService, supabase, useToast
- **Quem importa**: DashboardV2Gateway (lazy), MonitoramentoMaisVantaView
- **Logica de negocio**: clubeService.getAllMembers/bloquear/desbloquear/banir/desbanir. Supabase profiles lookup.

### MeusEventosView.tsx
- **Linhas**: 319
- **O que faz**: Lista de eventos do usuario/comunidade. Abas: ativos, passados, em_revisao, rejeitados. Card de evento com foto, data, local. Paginacao. Abre EventoDashboard ou EditarEventoView ao clicar.
- **Props**: `{ onBack: () => void; currentUserId: string; currentUserRole: ContaVantaLegacy; comunidadeId?: string }`
- **Imports principais**: eventosAdminService, getAcessoEventos, EventoDashboard, EditarEventoView
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: getAcessoEventos (permissoes), eventosAdminService

### MonitoramentoMaisVantaView.tsx
- **Linhas**: 62
- **O que faz**: Hub de monitoramento global MAIS VANTA. 4 abas: Membros Globais, Eventos Globais, Infracoes, Divida Social. Renderiza sub-views.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: MembrosGlobaisMaisVantaView, EventosGlobaisMaisVantaView, InfracoesGlobaisMaisVantaView, DividaSocialMaisVantaView
- **Quem importa**: DashboardV2Gateway (lazy)

### NotificacoesAdminView.tsx
- **Linhas**: 959
- **O que faz**: Sistema completo de notificacoes push/email do admin. Segmentacao (TODOS, por TAG, COMUNIDADE, EVENTO, CIDADE). Templates de push salvos. Agendamento de push. Campanhas com multi-canal (PUSH, EMAIL, SMS). Historico de campanhas com resultados.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, campanhasService, pushTemplatesService, pushAgendadosService, useAuthStore, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: campanhasService.enviar, pushTemplatesService.salvar/listar, pushAgendadosService.agendar. Queries em profiles com filtros de segmento.

### ParceirosMaisVantaView.tsx
- **Linhas**: 372
- **O que faz**: CRUD de parceiros (venues externos) MAIS VANTA. Tipos: RESTAURANTE, BAR, CLUB, GYM, etc. Planos: STARTER, PRO, ELITE. Formulario com nome, tipo, cidade, endereco, instagram, contato, plano. Toggle ativo/inativo.
- **Props**: `{ onBack?: () => void }`
- **Imports principais**: clubeParceirosService, clubeCidadesService, useAuthStore, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy), MaisVantaHubView

### ParticipantesView.tsx
- **Linhas**: 343
- **O que faz**: Lista de participantes/ingressos de um evento. Export CSV. Acoes por ingresso: editar titular, cancelar, reenviar. Menu contextual por item.
- **Props**: `{ onBack: () => void; eventoId: string; eventoNome: string; addNotification? }`
- **Imports principais**: eventosAdminService, TicketCaixa
- **Quem importa**: eventoDashboard/index
- **Logica de negocio**: eventosAdminService.getTicketsCaixaByEvento, editar titular, cancelar ingresso. Export CSV.

### PassaportesMaisVantaView.tsx
- **Linhas**: 271
- **O que faz**: Gestao de passaportes MAIS VANTA (solicitacoes de acesso a outras cidades). Filtros: PENDENTE, APROVADO, REJEITADO, TODOS. Acoes: aprovar, rejeitar, revogar. Perfis via Supabase.
- **Props**: `{ onBack: () => void; masterId: string }`
- **Imports principais**: clubeService, comunidadesService, supabase, useToast
- **Quem importa**: DashboardV2Gateway (lazy), MaisVantaHubView
- **Logica de negocio**: clubeService.getAllPassports/aprovarPassport/rejeitarPassport/revogarPassport

### PendenciasAppView.tsx
- **Linhas**: 123
- **O que faz**: Checklist de configuracoes pendentes do app. Itens estaticos: email caixa, CNPJ, secrets Stripe, teste celular, dominio, APNs/FCM. Status PENDENTE/CONFIGURADO.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: AdminViewHeader
- **Quem importa**: DiagnosticoView (lazy), DashboardV2Gateway (lazy)
- **Logica de negocio**: Nenhuma (conteudo estatico)

### PendenciasHubView.tsx
- **Linhas**: 113
- **O que faz**: Hub de pendencias do usuario. Busca pendencias via service (curadoria, evento pendente, edicao, reembolso manual, saque, parceria, comemoracao, proposta vanta, evento privado). Lista com contagem e navegacao.
- **Props**: `{ userId: string; role: ContaVantaLegacy; comunidadeIds: string[]; eventoIds: string[]; onBack; onNavigate }`
- **Imports principais**: getPendencias, PendenciaItem, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: getPendencias(userId, role, comunidadeIds, eventoIds)

### PlanosMaisVantaView.tsx
- **Linhas**: 831
- **O que faz**: Gestao completa de planos e tiers MAIS VANTA. Aba planos: CRUD com modais (nome, descricao, preco mensal, limites, tier minimo, beneficios). Aba tiers: CRUD de tiers (nome, cor, beneficios, sublevel, requisitos). Toggle ativo/ordem.
- **Props**: `{ onBack?: () => void }`
- **Imports principais**: assinaturaService, clubeService, maisVantaConfigService, VantaDropdown, VantaColorPicker
- **Quem importa**: MaisVantaHubView
- **Logica de negocio**: clubeService.criarPlano/atualizarPlano/criarTier/atualizarTier

### PlanosProdutor/ (subpasta)
- Ver secao de subpastas abaixo

### PortariaScannerView.tsx
- **Linhas**: 270
- **O que faz**: Scanner de portaria para validacao de ingressos. Input manual ou QR scan (reutiliza jwtService). Feedback visual fullscreen (VERDE/AMARELO/VERMELHO) com selfie do titular para conferencia. Stats de check-ins.
- **Props**: `{ onBack: () => void; eventoId: string }`
- **Imports principais**: eventosAdminService, signTicketToken, verifyTicketToken, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: verifyTicketToken, eventosAdminService.validarIngresso

### ProductAnalyticsView.tsx
- **Linhas**: 479
- **O que faz**: Analytics de produto com graficos Recharts. Weekly engagement (opens/users), discovery funnel (views > opens > converted), tempo medio por evento, pie chart de genero/idade. Dados do Supabase `user_behavior`.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, BarChart, LineChart (Recharts), VantaPieChart, AdminViewHeader
- **Quem importa**: DiagnosticoView (lazy), DashboardV2Gateway (lazy)
- **Logica de negocio**: Queries em `user_behavior`, `profiles`, `eventos`. Agregacoes client-side.

### PromoterCotasView.tsx
- **Linhas**: 156
- **O que faz**: Tela do promoter para ver/gerenciar suas cotas de lista em eventos. Lista de eventos com cotas atribuidas, total de nomes inseridos vs teto.
- **Props**: `{ onBack: () => void; currentUserId: string; currentUserNome: string; eventoId?: string }`
- **Imports principais**: listasService, eventosAdminService
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: listasService, eventosAdminService

### PromoterDashboardView.tsx
- **Linhas**: 254
- **O que faz**: Dashboard do promoter com KPIs (eventos, total nomes, check-ins). Lista de eventos ativos com stats. Links rapidos para lista/check-in.
- **Props**: `{ onBack: () => void; currentUserId: string; currentUserNome: string; addNotification; onNavigate }`
- **Imports principais**: listasService, eventosAdminService
- **Quem importa**: DashboardV2Gateway (lazy)

### SiteContentView.tsx
- **Linhas**: 247
- **O que faz**: CMS de textos. Master edita qualquer texto do app. Lista de chaves editaveis com preview. Busca por chave/valor.
- **Props**: `{ onBack: () => void; currentUserId: string }`
- **Imports principais**: supabase, AdminViewHeader
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: supabase.from('site_content').select/upsert

### SolicitacoesParceriaView.tsx
- **Linhas**: 611
- **O que faz**: Gestao de solicitacoes de parceria. Tabs: pendentes, aprovadas, rejeitadas. Detalhes da solicitacao com dados da empresa, links, proposta. Acoes: aprovar (com condicoes), rejeitar (com motivo).
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, AdminViewHeader, useToast
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: supabase.from('solicitacoes_parceria').select/update. Aprovacao com condicoes comerciais.

### SolicitarParceriaView.tsx
- **Linhas**: 564
- **O que faz**: Formulario publico para solicitar parceria. Multi-step: dados da empresa, tipo de parceria, descricao do negocio, contato. Submit para Supabase.
- **Props**: `{ onBack: () => void; userId?: string; userEmail?: string }`
- **Imports principais**: supabase, AdminViewHeader
- **Quem importa**: ProfileView (modules/profile)
- **Logica de negocio**: supabase.from('solicitacoes_parceria').insert
- **Observacoes**: Unica view importada fora do admin - acessivel pelo perfil do usuario

### SupabaseDiagnosticView.tsx
- **Linhas**: 559
- **O que faz**: Diagnostico completo do Supabase. Checa schema real (tabelas, colunas, RLS, indexes). Compara com schema esperado (supabaseDiagnosticSchema.ts). Exibe divergencias.
- **Props**: `{ onBack: () => void }`
- **Imports principais**: supabase, AdminViewHeader
- **Quem importa**: DiagnosticoView
- **Logica de negocio**: Queries em information_schema.tables/columns, pg_policies, pg_indexes

### supabaseDiagnosticSchema.ts
- **Linhas**: 333
- **O que faz**: Schema esperado para comparacao no SupabaseDiagnosticView. Array de tabelas com colunas esperadas.
- **Observacoes**: Arquivo de dados, nao componente

### VantaIndicaView.tsx
- **Linhas**: 1938
- **O que faz**: Sistema completo "Vanta Indica" (programa de indicacao). Semelhancias com um CRM de leads: cadastro de indicacoes com tipo (PRODUTOR, PARCEIRO), status (PENDENTE, ACEITO, RECUSADO, CONTATO, CONVERTIDO), formulario completo, acompanhamento, historico, regras de recompensa. Dashboard com KPIs.
- **Props**: `{ onBack: () => void; userId?: string }`
- **Imports principais**: supabase, AdminViewHeader, useToast, useAuthStore
- **Quem importa**: DashboardV2Gateway (lazy)
- **Logica de negocio**: CRUD completo em `indicacoes` no Supabase. Sistema de recompensas, follow-ups, conversoes.
- **Observacoes**: Arquivo mais longo de toda a pasta (1938L)

---

## 2. SUBPASTAS

### caixa/ (2 arquivos, 824L)

| Arquivo | Linhas | O que faz | Props |
|---------|--------|-----------|-------|
| **index.tsx** | 88 | CaixaView - seletor de evento para abrir caixa. Lista eventos com filtro por comunidade | `{ onBack; eventoId?; comunidadeId? }` |
| **EventoCaixaView.tsx** | 736 | Caixa de venda na porta. QR code do ingresso, selecao de variacao, venda com selfie do comprador. Offline support. Suporte a meia-entrada com comprovante. | `{ evento: EventoAdmin; onBack }` |

**Logica**: eventosAdminService.venderIngresso, signTicketToken (JWT), offlineEventService, supabase upload de selfie. Usa camera.

### cargosPlataforma/ (1 arquivo, 423L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 423 | CargosPlataformaView - CRUD de cargos de plataforma (nao evento). Criar cargo com permissoes, atribuir a usuarios via busca. Lista cargos e atribuicoes. |

**Logica**: cargosPlataformaService.listar/criar/deletar/atribuir/revogar

### cargosUnificado/ (1 arquivo, 73L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 73 | CargosUnificadoView - Hub com 2 abas: Cargos Plataforma e Definir Cargos (evento). Lazy-loads sub-views. |

### checkin/ (6 arquivos, 967L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 66 | CheckInView - seletor de evento para check-in. Modo fixo LISTA ou QR |
| **EventCheckInView.tsx** | 398 | Check-in completo por evento. Modo LISTA (busca por nome) ou QR. Offline cache com IndexedDB. Sync automatico. |
| **EventoCheckInCard.tsx** | 123 | Card de evento na lista de selecao de check-in. Stats de ingressos |
| **FeedbackOverlay.tsx** | 57 | Overlay fullscreen de feedback (VERDE/AMARELO/VERMELHO) |
| **QRScanner.tsx** | 321 | Scanner QR com camera. Verificacao JWT, burn de ingresso, comemoracoes. Toggle flash/manual input. |
| **checkinTypes.ts** | 2 | Types: Modo, FeedbackTela |

**Logica**: supabase.from('tickets'), offlineEventService, verifyTicketToken, comemoracaoService

### comunidadeDashboard/ (6 arquivos, 770L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 136 | ComunidadeDashboard - analytics de comunidade com tabs e periodo selector |
| **OverviewTab.tsx** | 120 | KPIs (eventos, tickets, receita), time series chart, leaderboard |
| **EventosTab.tsx** | 152 | Ranking de eventos da comunidade com metricas |
| **FinanceiroTab.tsx** | 184 | Breakdown financeiro, comparativo periodo, export |
| **AudienciaTab.tsx** | 77 | Dados de audiencia: breakdown, heatmap, KPIs |
| **EquipeTab.tsx** | 101 | Leaderboard de equipe, KPIs de staff |

**Logica**: getCommunityAnalytics (analytics service)

### comunidades/ (19 arquivos, 4.684L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.ts** | 1 | Re-export ComunidadesView |
| **ComunidadesView.tsx** | 144 | Lista de comunidades do usuario. Card com foto, local, stats. Botao criar. |
| **ComunidadeDetalheView.tsx** | 198 | Detalhe da comunidade com tabs (Eventos, Equipe, Logs, Caixa, Comercial, Privados, Cupons, Comemoracoes). Botao editar. |
| **EditarModal.tsx** | 974 | Modal completo de edicao de comunidade (nome, foto, endereco, horarios, overrides, CNPJ, RBAC) |
| **CentralEventosView.tsx** | 92 | Central de eventos da comunidade com tabs proximos/encerrados + botao criar |
| **ProximosEventosTab.tsx** | 58 | Lista de proximos eventos da comunidade |
| **EventosEncerradosTab.tsx** | 85 | Lista de eventos encerrados com resumo financeiro |
| **EquipeTab.tsx** | 174 | Gestao de equipe da comunidade. CRUD de membros com cargos RBAC |
| **LogsTab.tsx** | 117 | Timeline de logs de auditoria da comunidade |
| **CaixaTab.tsx** | 152 | Resumo financeiro da comunidade com drilldown |
| **CaixaDrilldownModal.tsx** | 203 | Modal detalhado de caixa com lotes, listas, promoters |
| **ComercialTab.tsx** | 276 | Definicao de condicoes comerciais pelo master (taxas, prazos) |
| **EventosPrivadosTab.tsx** | 392 | Gestao de eventos privados (aprovacao, busca, detalhes) |
| **ComemoracoesTab.tsx** | 335 | Gestao de comemoracoes (aniversarios) em eventos |
| **CuponsComunidadeTab.tsx** | 238 | CRUD de cupons que valem pra todos eventos da comunidade |
| **AdicionarMembroModal.tsx** | 157 | Modal busca+adicionar membro a equipe com cargo |
| **PublicoDrilldown.tsx** | 808 | Analise detalhada de publico da comunidade. Pie charts por origem, genero, idade. Drill-down por evento |
| **ResumoEventoModal.tsx** | 907 | Modal com resumo completo de um evento (financeiro, lotacao, pie charts, comparativos) |
| **types.ts** | 46 | Helpers e tipos (CARGO_LABEL, addLog, CaixaTipo) |

### criarComunidade/ (5 arquivos, 1.389L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 564 | Wizard de criacao de comunidade em 4 steps + celebration screen. Draft persistence. |
| **Step1Identidade.tsx** | 164 | Nome, bio, foto (com crop), tipo de comunidade |
| **Step2Localizacao.tsx** | 189 | CEP (busca automatica), rua, bairro, cidade, estado, geocode |
| **Step3Operacao.tsx** | 137 | Horarios de funcionamento, CNPJ, website |
| **Step4ProdutoresTaxas.tsx** | 335 | Busca e adicao de produtores, definicao de taxas por produtor |

**Logica**: comunidadesService.criar, buscarCep, geocodeEndereco, authService.searchMembers

### criarEvento/ (11 arquivos, 3.470L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **Step1Evento.tsx** | 588 | Dados basicos: foto (crop), nome, descricao, data/hora, local, classificacoes (formatos, estilos, experiencias) |
| **Step2Ingressos.tsx** | 797 | Configuracao de lotes com variacoes (area, genero, valor, limite). Cortesias. MAIS VANTA benefits. Meia-entrada. |
| **Step3Listas.tsx** | 513 | Configuracao de listas com variantes (nome, genero, cor, teto, horario, regras abobora) |
| **Step4EquipeSocio.tsx** | 462 | Busca socio, permissoes toggle, equipe do socio |
| **Step4EquipeCasa.tsx** | 487 | Busca gerente, permissoes, equipe da casa com cargos |
| **Step5Financeiro.tsx** | 128 | Split de receita socio/produtor (slider) |
| **TipoEventoScreen.tsx** | 161 | Selecao inicial: venda Vanta sim/nao, fluxo COM_SOCIO ou FESTA_DA_CASA |
| **CopiarModal.tsx** | 180 | Modal para copiar dados de evento existente para novo |
| **CargoModal.tsx** | 69 | Modal selecao de cargo para membro da equipe |
| **CapacidadeModal.tsx** | 56 | Modal aviso quando capacidade excede limite |
| **types.ts** | 77 | Types: VariacaoForm, LoteForm, VarListaForm, EquipeForm, SocioConviteForm, etc. |
| **constants.ts** | 47 | Constantes: classes CSS, AREA_LABELS, PAPEIS_CASA, PERMISSOES_TOGGLE, COR_PALETTE |
| **utils.ts** | 46 | Utils: uid, novaVar, novoLote, novaVarLista, buildLabel |

### curadoria/ (12 arquivos, 2.225L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **types.ts** | 32 | Helpers: formatFollowers, formatDate |
| **tabClube/index.tsx** | 360 | TabClube - aba de curadoria do clube MAIS VANTA. Coordena sub-tabs com dados de membros, solicitacoes, passaportes, reservas |
| **tabClube/SubTabSolicitacoes.tsx** | 318 | Curadoria de solicitacoes de entrada no clube. Detalhes do perfil Instagram, aprovar/rejeitar |
| **tabClube/SubTabMembros.tsx** | 163 | Lista de membros do clube com busca, filtro por tier, edicao de tier |
| **tabClube/SubTabEventos.tsx** | 218 | Eventos com lote MV. Lista de check-ins e resgates por evento |
| **tabClube/SubTabConfig.tsx** | 474 | Configuracao do clube por comunidade: tiers, beneficios, regras |
| **tabClube/SubTabPassaportes.tsx** | 49 | Lista de passaportes pendentes com acoes aprovar/rejeitar |
| **tabClube/SubTabPosts.tsx** | 63 | Lista de posts pendentes de verificacao (divida social) |
| **tabClube/SubTabNotificacoes.tsx** | 41 | Info estatica sobre notificacoes automaticas do sistema |
| **tabClube/PerfilMembroOverlay.tsx** | 198 | Overlay detalhado do perfil de um membro (foto, tier, instagram, historico) |
| **tabClube/TagsPredefinidas.tsx** | 148 | Picker de tags predefinidas por categoria (influencia, persona, interesse, lifestyle) |
| **tabClube/VantaDropdown.tsx** | 2 | Re-export de VantaDropdown compartilhado |
| **tabClube/tierUtils.ts** | 82 | Utils de tier: labels, cores, opcoes, beneficios disponiveis |

### definirCargos/ (7 arquivos, 1.193L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 553 | DefinirCargosView - atribuir cargos a membros em comunidades/eventos. Busca membro, seleciona destino, configura permissoes. |
| **ImportarStaffPanel.tsx** | 249 | Painel para importar staff de eventos anteriores |
| **PainelCargoCustom.tsx** | 158 | Painel de configuracao de cargo customizado com permissoes granulares |
| **ConfirmacaoModal.tsx** | 76 | Modal de confirmacao antes de atribuir cargo |
| **SuccessScreen.tsx** | 50 | Tela de sucesso apos atribuicao |
| **QlCheckbox.tsx** | 28 | Checkbox estilizado reutilizavel |
| **types.ts** | 79 | Types e constantes: DefinirCargosProps, CargoCustomState, DestinoOption, PERM_LABELS |

**Logica**: rbacService.atribuir/revogar, authService.searchMembers, comunidadesService, eventosAdminService

### eventManagement/ (12 arquivos, 4.072L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **EventDetailManagement.tsx** | 197 | Hub de gestao do evento com tabs (Lotacao, Equipe, Lista, Logs, Resumo, Cortesias, Cargos, Relatorio, Mesas) |
| **TabLotacao.tsx** | 135 | Barra de lotacao (total/teto), alertas waitlist |
| **TabEquipePromoter.tsx** | 445 | Gestao de promoters: cotas, links de indicacao, ranking, comissoes |
| **TabEquipeSocio.tsx** | 378 | Gestao de equipe do socio: busca, adicao, cargos, recrutamento |
| **TabLista.tsx** | 450 | Gestao da lista do evento: inserir nomes, check-in, offline sync |
| **TabLogs.tsx** | 94 | Timeline de logs do evento (vendas, check-ins, etc) |
| **TabResumoCaixa.tsx** | 623 | Resumo financeiro do evento: receita bruta, liquida, por variacao. Pie charts. Fechamento por pessoa. |
| **TabCortesias.tsx** | 404 | Gestao de cortesias: distribuir, transferir, revogar |
| **TabCargosPermissoes.tsx** | 232 | Gestao de cargos customizados e permissoes por evento |
| **TabRelatorio.tsx** | 515 | Relatorio completo do evento: avaliacao, pie charts, notas, publicacao |
| **TabMesas.tsx** | 317 | Gestao de mesas VIP: CRUD, upload de mapa, reservas |
| **StaffRecrutamento.tsx** | 231 | Recrutamento de staff para evento: busca, atribuicao de cargos |
| **types.ts** | 46 | Types: Tab, Periodo, PERIODOS, filtrarLog, CORES_PIZZA, etc. |

### eventoDashboard/ (13 arquivos, 3.823L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 1272 | EventoDashboard principal. Header com foto/dados do evento. Sub-views: editar, participantes, listas, financeiro, check-in, caixa, analytics, pedidos, cupons, comemoracoes, duplicar, serie. |
| **PreEventoView.tsx** | 159 | Dashboard pre-evento: vendas, funnel, projecao, breakdown por variacao |
| **OperacaoView.tsx** | 160 | Dashboard de operacao (durante evento): check-ins ao vivo, pulse, heatmap |
| **PosEventoView.tsx** | 226 | Dashboard pos-evento: financeiro final, split, comparativo |
| **AnalyticsSubView.tsx** | 203 | Analytics demograficas: pie charts genero, idade, cidade |
| **PedidosSubView.tsx** | 450 | Gestao de pedidos/ingressos: busca, filtros, acoes (cancelar, reembolsar, reenviar) |
| **EditarLotesSubView.tsx** | 244 | Edicao inline de lotes e cortesias |
| **EditarListaSubView.tsx** | 171 | Edicao inline de listas |
| **CuponsSubView.tsx** | 241 | CRUD de cupons do evento (codigo, desconto, validade, usos) |
| **ComemoracaoConfigSubView.tsx** | 317 | Configuracao de comemoracoes (faixas de vendas, cortesias, beneficio consumo) |
| **DuplicarModal.tsx** | 172 | Modal para duplicar evento com nova data |
| **SerieChips.tsx** | 171 | Chips de selecao de ocorrencia em eventos recorrentes (serie) |
| **eventoDashboardUtils.ts** | 147 | Utils: formatacao de data/hora, cores para pie charts, calculo de idade |

### financeiro/ (6 arquivos, 1.470L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 884 | FinanceiroView principal: resumo financeiro do evento, saques, reembolsos, fechamento. KPIs, split, taxas contratadas. |
| **ModalSaque.tsx** | 121 | Modal de solicitacao de saque com PIX |
| **ModalFechamento.tsx** | 80 | Modal de encerramento financeiro do evento |
| **ModalReembolsoManual.tsx** | 82 | Modal de solicitacao de reembolso manual |
| **HistoricoSaques.tsx** | 136 | Historico de saques com export CSV |
| **ReembolsosSection.tsx** | 167 | Secao de reembolsos: lista, aprovar/rejeitar, export CSV |

**Logica**: eventosAdminService (saques, reembolsos, fechamento), getContractedFees, getGatewayCostByEvento

### insightsDashboard/ (5 arquivos, 374L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 160 | InsightsDashboard - hub de insights inteligentes com 4 tabs |
| **InsightsTab.tsx** | 51 | VIP score, churn radar, trend alerts, no-show, previsao lotacao |
| **FinanceiroTab.tsx** | 53 | Sugestoes de pricing, split preview, break even |
| **OperacoesTab.tsx** | 46 | Channel attribution, buyer communication, loyalty, purchase time |
| **ValorTab.tsx** | 64 | Weekly report, Vanta value panel, smart tips, benchmark |

**Logica**: Componentes de insights (cards inteligentes)

### listas/ (8 arquivos, 962L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 40 | ListasView - seletor de evento para gestao de listas |
| **ListaEventoView.tsx** | 92 | View de lista por evento com tabs (Nomes, Equipe, Lotacao, Checkin) |
| **PainelEventos.tsx** | 147 | Painel de selecao de eventos para lista |
| **TabNomes.tsx** | 235 | Gestao de nomes na lista: busca, adicao individual/lote, regras abobora |
| **TabEquipe.tsx** | 182 | Gestao de equipe da lista (promoters) |
| **TabLotacao.tsx** | 69 | Barra de lotacao da lista |
| **TabCheckin.tsx** | 222 | Check-in por lista: busca, confirmar entrada, status |
| **ModalInserirLote.tsx** | 155 | Modal para inserir multiplos nomes de uma vez |
| **listasUtils.ts** | 26 | Utils: TODAY_STR, formatData, isRegraAbobora, RoleListaNova |

**Logica**: listasService (CRUD convidados, check-in, cotas)

### maisVanta/ (2 arquivos, 483L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **ConviteEspecialMVView.tsx** | 318 | Admin envia convites especiais para membros em eventos. Filtro por tier, cidade, tags, sublevel creator. Selecao individual ou em massa. |
| **NotifMVPendentesView.tsx** | 165 | Admin ve e resolve solicitacoes de notificacao do produtor |

**Logica**: clubeService.conviteEspecial, clubeService.notifProdutor, supabase

### maisVantaDashboard/ (7 arquivos, 716L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 134 | Dashboard MAIS VANTA com tabs e periodo selector |
| **OverviewTab.tsx** | 90 | KPIs globais MV: MRR, membros, churn, parceiros |
| **TiersTab.tsx** | 136 | Distribuicao por tier, breakdown, bar chart |
| **ResgatesTab.tsx** | 61 | KPIs de resgates (total, por tipo, inbox) |
| **RetencaoTab.tsx** | 134 | Metricas de retencao: cohort, churn rate, LTV |
| **ParceirosTab.tsx** | 58 | KPIs de parceiros (total, ativos, deals, clock) |
| **FinanceiroTab.tsx** | 103 | Financeiro MV: MRR, ARPU, time series, breakdown por plano |

**Logica**: getMaisVantaAnalytics (analytics service)

### masterDashboard/ (6 arquivos, 1.017L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 199 | MasterDashboard com tabs e periodo selector |
| **OverviewTab.tsx** | 136 | KPIs master: GMV, receita plataforma, eventos, time series |
| **ComunidadesTab.tsx** | 173 | Ranking de comunidades com bar chart, ordenacao |
| **FinanceiroTab.tsx** | 142 | Financeiro master: breakdown, comparativo, export |
| **OperacoesTab.tsx** | 129 | Operacoes: eventos ativos, tickets/dia, leaderboard |
| **ProjecaoTab.tsx** | 238 | Projecoes financeiras: trend lines, metas, KPIs futuros |

**Logica**: getMasterAnalytics (analytics service)

### masterFinanceiro/ (4 arquivos, 1.131L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 861 | MasterFinanceiroView: gestao financeira global. Saques pendentes (aprovar/rejeitar com comprovante), reembolsos, visao por evento, config de taxas, export. |
| **LucroPorComunidade.tsx** | 104 | Pie chart de lucro por comunidade |
| **RaioXEvento.tsx** | 83 | Raio-X financeiro de um evento (taxas contratadas, receita, custos) |
| **SimuladorGateway.tsx** | 83 | Simulador de custos gateway (credito vs PIX) |

**Logica**: eventosAdminService, getContractedFees, calcGatewayCost, supabase (saques, reembolsos)

### PlanosProdutor/ (1 arquivo, 433L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **PlanosProdutor.tsx** | 433 | CRUD de planos para produtores. Criar/editar planos com nome, preco, limites, tier minimo, beneficios. Atribuir planos a comunidades. |

**Logica**: clubeService.listarPlanosProdutor/criarPlanoProdutor/atualizarPlanoProdutor/atribuirPlano

### relatorios/ (8 arquivos, 1.525L)

| Arquivo | Linhas | O que faz |
|---------|--------|-----------|
| **index.tsx** | 3 | Re-exports |
| **RelatorioEventoView.tsx** | 127 | Relatorio de evento com tabs (Geral, Listas, Ingressos). Export Excel. |
| **RelatorioComunidadeView.tsx** | 253 | Relatorio de comunidade com metricas agregadas. Export Excel. |
| **RelatorioMasterView.tsx** | 324 | Relatorio master global com ranking comunidades. Export Excel. |
| **TabGeral.tsx** | 254 | Tab geral: pie charts de origem publico, receita por tipo |
| **TabIngressos.tsx** | 211 | Tab ingressos: metricas de vendas, ticket medio, breakdown |
| **TabListas.tsx** | 305 | Tab listas: promoters, por lista, portaria, convidados |
| **exportRelatorio.ts** | 173 | Gera export Excel para evento (multiplas sheets) |
| **exportRelatorioComunidade.ts** | 75 | Gera export Excel para comunidade |

**Logica**: eventosAdminService, listasService, exportExcel

---

## 3. OBSERVACOES GERAIS

- **Principal consumer**: `features/dashboard-v2/DashboardV2Gateway.tsx` importa quase todas as views raiz via `lazy()`.
- **Unico import fora do admin**: `SolicitarParceriaView` e importada por `modules/profile/ProfileView.tsx`.
- **Views mais complexas**: VantaIndicaView (1938L), CriarEventoView (1382L), eventoDashboard/index (1272L), EventosPendentesView (1092L), EditarModal (974L), NotificacoesAdminView (959L), EditarEventoView (912L), ResumoEventoModal (907L).
- **Fontes de dados**: Mix entre services in-memory (eventosAdminService, clubeService, listasService, auditService) e queries diretas ao Supabase.
- **Padrao de layout**: Todas seguem o padrao AdminViewHeader + flex-1 overflow-y-auto no-scrollbar.

---


## Capitulo 5

# Investigacao Completa: `/features/admin/`

## 1. `permissoes.ts`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/permissoes.ts` |
| **Linhas** | 208 |
| **O que faz** | Modulo de autorizacao RBAC contextual. Consolida todos os contextos (comunidades + eventos) onde um usuario tem acesso. Fornece guards de permissao usados pelas views admin para controlar visibilidade de rotas e botoes. Master admin (`vanta_masteradm`) sempre tem acesso total. Para demais roles, consulta `rbacService.temPermissaoCtx()` com permissoes granulares. |
| **Exports** | `getAccessNodes`, `getAcessoComunidades`, `getAcessoEventos`, `canAccessFinanceiro`, `canAccessListas`, `canAccessCheckin`, `canAccessQR`, `canAccessCaixa`, `isMasterOnly`, `canAccessMeusEventos`, `canAccessPortariaScanner`, `canAccessComunidades`, `isSocioEvento` |
| **Imports** | `ContaVantaLegacy`, `AccessNode` (types), `comunidadesService`, `eventosAdminService`, `rbacService`, `CARGO_TO_PORTAL`, `CARGO_LABELS` |
| **Consumidores** | `DashboardV2Gateway`, `ComunidadesView`, `GerenteDashboardView`, `eventoDashboard/index`, `MeusEventosView`, `authStore` |
| **Observacoes** | Funcao `isSocioEvento` e legado mantido para compatibilidade. Guards usam triple-check: masteradm bypass, rbac contextual, e fallback por comunidade. |

---

## 2. COMPONENTS (raiz)

### 2.1 `AdminDashboardHome.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/AdminDashboardHome.tsx` |
| **Linhas** | 801 |
| **O que faz** | Tela principal (home) do painel admin. Renderiza conteudo contextual baseado no role do usuario: visao global para master (KPIs, pizza faturamento por comunidade, pendencias, assinaturas MAIS VANTA, visao geral temporal com delta), visao de comunidade para gerente/socio (KPIs comunidade, pizza faturamento por evento, banner MAIS VANTA, onboarding checklist). Mostra botoes de acoes rapidas filtrados por role. |
| **Exports** | `AdminDashboardHome` (component), `getTenantLabel` (funcao utilitaria) |
| **Imports** | `eventosAdminService`, `comunidadesService`, `assinaturaService`, `VantaPieChart`, `getResumoFinanceiroGlobal/Comunidade`, `dashboardAnalyticsService`, `KpiCard/KpiPieCard/KpiDeltaCard/PERIODOS`, `AdminSubView`, `OnboardingChecklist`, `OnboardingWelcome`, `fmtBRL`, `TYPOGRAPHY` |
| **Consumidores** | `DashboardV2Gateway`, `DashboardV2Home` |
| **Observacoes** | Role logic: `isMaster`, `isSocio`, `isGerente`, `isPromoter`, `isPortaria`, `isCaixa`. Bug menor: `isGerente` duplicado na ternary `roleLabel` (L315). |

### 2.2 `AdminSidebar.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/AdminSidebar.tsx` |
| **Linhas** | 617 |
| **O que faz** | Sidebar de navegacao do painel admin. Define o type `AdminSubView` (43 rotas possiveis), duas configuracoes de secoes (`SIDEBAR_SECTIONS` para visao global, `COMMUNITY_SIDEBAR_SECTIONS` para dentro de comunidade). Sidebar colapsavel em mobile (w-14/w-48), fixa em desktop (w-56). Secoes colapsaveis com estado persistido em localStorage. Badges de pendencias nos itens. |
| **Exports** | `AdminSubView` (type), `SidebarSectionItem` (implicitly via section types), `SIDEBAR_SECTIONS`, `COMMUNITY_SIDEBAR_SECTIONS`, `AdminSidebar` (component) |
| **Imports** | 35+ icones Lucide, `ContaVantaLegacy` |
| **Consumidores** | `DashboardV2Gateway`, `DashboardV2Home`, `AdminDashboardHome`, `PendenciasHubView` |
| **Observacoes** | 6 categorias de cores: GERAL (branco), COMUNIDADES (roxo), EVENTOS (roxo), FINANCEIRO (verde), MAIS_VANTA (dourado), PLATAFORMA (cinza), SISTEMA (cinza escuro). `AdminSubView` e o enum central de rotas do admin. |

### 2.3 `AdminViewHeader.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/AdminViewHeader.tsx` |
| **Linhas** | 137 |
| **O que faz** | Header padronizado para todas as subviews do admin. Botao voltar a esquerda (44px touch target), titulo + subtitulo, breadcrumbs opcionais, acoes a direita, badge numerico, kicker opcional acima do titulo. |
| **Exports** | `AdminViewHeader` (component) |
| **Imports** | `ArrowLeft`, `ChevronRight`, `LucideIcon`, `TYPOGRAPHY` |
| **Consumidores** | 20+ views admin (AnalyticsMaisVantaView, comunidadeDashboard, PendenciasAppView, DealsMaisVantaView, SolicitacoesParceriaView, VantaIndicaView, ProductAnalyticsView, CondicoesProducerView, etc.) |
| **Observacoes** | Componente de layout critico. Props: `title`, `subtitle`, `subtitleColor`, `onBack`, `actions`, `breadcrumbs`, `badge`, `badgeColor`, `kicker`. |

### 2.4 `ExtratoFinanceiro.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/ExtratoFinanceiro.tsx` |
| **Linhas** | 203 |
| **O que faz** | Componente de extrato financeiro que busca e exibe vendas, saques e reembolsos do Supabase. Queries diretas em 3 tabelas: `vendas_log`, `solicitacoes_saque`, `reembolsos`. Filtro por tipo (Todos/Vendas/Saques/Reembolsos). Ordena por data descendente. |
| **Exports** | `ExtratoFinanceiro` (component) |
| **Imports** | `supabase`, `fmtBRL`, `EmptyState`, icones Lucide |
| **Consumidores** | `financeiro/index` |
| **Observacoes** | Props: `eventoIds?`, `comunidadeId?`. Limite de 100 vendas + 50 saques + 50 reembolsos. |

### 2.5 `KpiCards.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/KpiCards.tsx` |
| **Linhas** | 144 |
| **O que faz** | Componentes reutilizaveis de KPI: `KpiCard` (simples com icone), `KpiPieCard` (com mini donut SVG mostrando percentual), `KpiDeltaCard` (com delta comparativo e trending icon). Tambem exporta constante `PERIODOS` (Hoje/Semana/Mes/Ano). |
| **Exports** | `KpiCard`, `KpiPieCard`, `KpiDeltaCard`, `PERIODOS` |
| **Imports** | `TrendingUp/Down/Minus`, `MetricaPar`, `Periodo` (de dashboardAnalyticsService) |
| **Consumidores** | `AdminDashboardHome`, 15+ views de dashboards (SocioHome, GerenteHome, DashboardV2Home, comunidadeDashboard tabs, masterDashboard tabs, maisVantaDashboard tabs, eventoDashboard) |
| **Observacoes** | `MiniDonut` e componente interno (nao exportado). `calcDelta` helper para calculo de variacao percentual. |

### 2.6 `OnboardingChecklist.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/OnboardingChecklist.tsx` |
| **Linhas** | 159 |
| **O que faz** | Checklist de onboarding pos-aprovacao de comunidade. Verifica: foto de perfil, foto de capa, endereco (exceto PRODUTORA), horarios de funcionamento, primeiro evento criado. Barra de progresso. Auto-marca `onboarding_completo` quando tudo pronto. Busca existencia de eventos via Supabase. |
| **Exports** | `OnboardingChecklist` (component) |
| **Imports** | `TYPOGRAPHY`, icones Lucide, `Comunidade`, `HorarioSemanal`, `supabase`, `comunidadesService` |
| **Consumidores** | `AdminDashboardHome` |
| **Observacoes** | Props: `comunidade`, `onNavigate`, `onEditarComunidade`. Retorna null quando checking ou allDone. |

### 2.7 `OnboardingWelcome.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/OnboardingWelcome.tsx` |
| **Linhas** | 38 |
| **O que faz** | Modal fullscreen de boas-vindas pos-aprovacao de comunidade. Overlay escuro com card centralizado contendo icone sparkles, mensagem de boas-vindas personalizada com nome da comunidade, botao "Comecar". |
| **Exports** | `OnboardingWelcome` (component) |
| **Imports** | `TYPOGRAPHY`, `Sparkles` |
| **Consumidores** | `AdminDashboardHome` |
| **Observacoes** | Props: `comunidadeNome`, `onClose`. Usa `absolute inset-0` conforme regra de modais. |

### 2.8 `ResumoFinanceiroCard.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/ResumoFinanceiroCard.tsx` |
| **Linhas** | 86 |
| **O que faz** | Card de resumo financeiro com linhas itemizadas: receita bruta (ingressos + listas), custo gateway, receita liquida, taxa VANTA, splits (produtor/socio), ticket medio, saques, saldo disponivel. Aceita estado de loading com skeleton. |
| **Exports** | `ResumoFinanceiroCard` (component) |
| **Imports** | Icones Lucide, `ResumoFinanceiro` (tipo) |
| **Consumidores** | `AdminDashboardHome`, `GerenteHome`, `DashboardV2Home`, `CaixaTab`, `eventoDashboard/index` |
| **Observacoes** | Props: `resumo`, `titulo?`, `loading?`. Usa `fmtBRL` interno. Linhas condicionais para listas pagas, gateway absorvido, splits. |

### 2.9 `VantaPieChart.tsx`

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/admin/components/VantaPieChart.tsx` |
| **Linhas** | 119 |
| **O que faz** | Grafico de pizza (donut) usando recharts. Responsivo (120px mobile, ate 180px desktop via hook `useIsLg`). Tooltip customizado com nome + valor + percentual. Legenda clicavel com highlight de slice. |
| **Exports** | `PieSlice` (interface), `VantaPieChart` (component) |
| **Imports** | `PieChart`, `Pie`, `Cell`, `Tooltip` (recharts) |
| **Consumidores** | `AdminDashboardHome`, `DashboardV2Home`, `ProductAnalyticsView`, `PublicoDrilldown`, `LucroPorComunidade`, `TabRelatorio`, `TabResumoCaixa`, `financeiro/index`, `relatorios/TabGeral`, `eventoDashboard` |
| **Observacoes** | Props: `data` (PieSlice[]), `formatValue?`, `onSliceClick?`, `selectedName?`, `height?`. Hook `useIsLg` e interno. |

---

## 3. COMPONENTS/dashboard/

### 3.1 `index.ts`
| **Linhas** | 10 |
| **Exports** | Re-exporta: `HeatmapCard`, `LeaderboardCard`, `TimeSeriesChart`, `BreakdownCard`, `ComparisonCard`, `ProgressRing`, `PeriodSelector`, `DrillBreadcrumb`, `ExportButton` |

### 3.2 `BarChartCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 81 |
| **O que faz** | Card com grafico de barras verticais usando recharts. Tooltip customizado, cores por barra, click handler. |
| **Exports** | `default BarChartCard` |
| **Imports** | recharts (ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell) |
| **Consumidores** | `masterDashboard/ComunidadesTab`, `maisVantaDashboard/TiersTab`, `eventoDashboard/PreEventoView` |

### 3.3 `BreakdownCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 61 |
| **O que faz** | Card de breakdown com barra de progresso horizontal multi-colorida e listagem com percentuais. |
| **Exports** | `default BreakdownCard` |
| **Consumidores** | 10+ views (insights cards, comunidadeDashboard, masterDashboard, maisVantaDashboard) |

### 3.4 `ComparisonCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 57 |
| **O que faz** | Card comparativo lado a lado (valor A vs B) com calculo de delta percentual e seta direcional. Suporta `invertDelta`. |
| **Exports** | `default ComparisonCard` |
| **Consumidores** | `comunidadeDashboard/FinanceiroTab`, `masterDashboard/FinanceiroTab`, `eventoDashboard/PosEventoView` |

### 3.5 `DashboardSkeleton.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 33 |
| **O que faz** | Skeleton de loading para dashboards com grid de KPIs + grafico + lista. Configuravel via `cards` e `chart`. |
| **Exports** | `default DashboardSkeleton` |
| **Consumidores** | 10+ insight cards como loading state |

### 3.6 `DrillBreadcrumb.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 42 |
| **O que faz** | Breadcrumb de navegacao drill-down. Itens clicaveis com chevron separador, ultimo item em branco bold. |
| **Exports** | `DrillBreadcrumb` |
| **Consumidores** | `comunidadeDashboard/index` |

### 3.7 `ExportButton.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 51 |
| **O que faz** | Botao de exportacao CSV. Gera CSV em memoria, cria blob URL, faz download via link temporario. Escape de valores com aspas/virgulas. |
| **Exports** | `ExportButton` |
| **Consumidores** | `comunidadeDashboard/FinanceiroTab`, `masterDashboard/FinanceiroTab`, `maisVantaDashboard/FinanceiroTab`, `eventoDashboard/PosEventoView` |

### 3.8 `FunnelChart.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 80 |
| **O que faz** | Grafico de funil com barras horizontais decrescentes. Interpolacao de cores entre steps. Min 8% de largura para visibilidade. |
| **Exports** | `default FunnelChart` |
| **Imports** | `FunnelStep` (analytics/types) |
| **Consumidores** | `eventoDashboard/PreEventoView` |

### 3.9 `HeatmapCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 90 |
| **O que faz** | Heatmap 7x24 (dias da semana x horas). Interpolacao linear de cores. Grid com labels de dia (D/S/T/Q/Q/S/S) e hora (0/6/12/18). |
| **Exports** | `default HeatmapCard` |
| **Imports** | `HeatmapCell` (analytics/types) |
| **Consumidores** | `PurchaseTimeCard`, `comunidadeDashboard/AudienciaTab`, `eventoDashboard/OperacaoView` |

### 3.10 `LeaderboardCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 78 |
| **O que faz** | Ranking/leaderboard com posicoes numeradas (ouro/prata/bronze nas 3 primeiras), avatar, nome, valor. Clicavel. |
| **Exports** | `default LeaderboardCard` |
| **Consumidores** | `LoyaltyProgramCard`, `VipScoreCard`, `comunidadeDashboard`, `masterDashboard`, `eventoDashboard` (7+ views) |

### 3.11 `LivePulse.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 22 |
| **O que faz** | Indicador animado "Ao Vivo" com ponto pulsante (ping animation). Cor e label configuraveis. |
| **Exports** | `LivePulse` |
| **Consumidores** | `eventoDashboard/OperacaoView` |

### 3.12 `MetricGrid.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 17 |
| **O que faz** | Grid layout responsivo para metricas. 2, 3 ou 4 colunas. |
| **Exports** | `default MetricGrid` |
| **Consumidores** | `masterDashboard` (4 tabs), `maisVantaDashboard` (5 tabs), `eventoDashboard/OperacaoView` |

### 3.13 `PeriodSelector.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 46 |
| **O que faz** | Chips de selecao de periodo (Hoje/Semana/Mes/Ano). Scroll horizontal, snap-x. |
| **Exports** | `PeriodSelector` |
| **Imports** | `Periodo` (analytics/types) |
| **Consumidores** | `comunidadeDashboard/index`, `masterFinanceiro`, `masterDashboard`, `maisVantaDashboard`, `financeiro/index` |

### 3.14 `ProgressRing.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 44 |
| **O que faz** | Anel circular SVG de progresso com percentual centralizado. Tamanho, cor e espessura configuraveis. Animacao smooth. |
| **Exports** | `default ProgressRing` |
| **Consumidores** | `BreakEvenCard`, `comunidadeDashboard/AudienciaTab`, `maisVantaDashboard/RetencaoTab`, `eventoDashboard` (3 sub-views) |

### 3.15 `SparklineCard.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 75 |
| **O que faz** | Card de metrica com sparkline (mini grafico de area) embaixo. Header com icone, valor grande, delta com seta. Usa recharts AreaChart. |
| **Exports** | `default SparklineCard` |
| **Imports** | recharts, `TimeSeriesPoint`, `LucideIcon` |
| **Consumidores** | `NoShowTrendCard` |

### 3.16 `TimeSeriesChart.tsx`
| Item | Detalhe |
|------|---------|
| **Linhas** | 104 |
| **O que faz** | Grafico de serie temporal. Suporta modo linha (LineChart) e area preenchida (AreaChart) com gradiente. Tooltip customizado. Eixos configuraveis. |
| **Exports** | `default TimeSeriesChart` |
| **Imports** | recharts, `TimeSeriesPoint` |
| **Consumidores** | `PricingSuggestionCard`, `LotacaoPrevisaoCard`, `comunidadeDashboard/OverviewTab`, `masterDashboard` (2 tabs), `maisVantaDashboard` (2 tabs), `eventoDashboard` (3 sub-views) |

---

## 4. COMPONENTS/insights/

### 4.1 `BenchmarkCard.tsx`
| **Linhas** | 91 | **O que faz** | Comparacao "Voce vs Mercado" com barras horizontais comparativas (comunidade vs plataforma), delta percentual. |
| **Exports** | `default BenchmarkCard` | **Consumidores** | `insightsDashboard/ValorTab` |

### 4.2 `BreakEvenCard.tsx`
| **Linhas** | 91 | **O que faz** | Card de break-even com ProgressRing mostrando progresso ate ponto de equilibrio. KPIs: custo total, receita atual, ticket medio. |
| **Exports** | `default BreakEvenCard` | **Consumidores** | `insightsDashboard/FinanceiroTab` |

### 4.3 `BuyerCommunicationCard.tsx`
| **Linhas** | 61 | **O que faz** | Lista de compradores unicos do evento com avatar e nome. Mostra ate 30 + contagem. |
| **Exports** | `default BuyerCommunicationCard` | **Consumidores** | `insightsDashboard/OperacoesTab` |

### 4.4 `ChannelAttributionCard.tsx`
| **Linhas** | 59 | **O que faz** | Atribuicao de vendas por canal (Instagram, Flyer QR, Promoter, Organico, WhatsApp, Link Direto) usando BreakdownCard. |
| **Exports** | `default ChannelAttributionCard` | **Consumidores** | `insightsDashboard/OperacoesTab` |

### 4.5 `ChurnRadarCard.tsx`
| **Linhas** | 87 | **O que faz** | Radar de cancelamento mostrando clientes em risco de churn. Lista com avatar, eventos anteriores, gasto total, dias ausente. |
| **Exports** | `default ChurnRadarCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.6 `InsightsEmptyState.tsx`
| **Linhas** | 19 | **O que faz** | Estado vazio para abas de insights. Icone + mensagem centralizada. |
| **Exports** | `default InsightsEmptyState` | **Consumidores** | `insightsDashboard` (4 tabs) |

### 4.7 `LotacaoPrevisaoCard.tsx`
| **Linhas** | 80 | **O que faz** | Previsao de lotacao por hora usando TimeSeriesChart. Mostra pico estimado e faixa de confianca (semaforo verde/amarelo/vermelho). |
| **Exports** | `default LotacaoPrevisaoCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.8 `LoyaltyProgramCard.tsx`
| **Linhas** | 72 | **O que faz** | Programa de fidelidade: distribuicao por tier (ouro/prata/bronze) via BreakdownCard + leaderboard dos top clientes fieis. |
| **Exports** | `default LoyaltyProgramCard` | **Consumidores** | `insightsDashboard/OperacoesTab` |

### 4.9 `NoShowCard.tsx`
| **Linhas** | 94 | **O que faz** | Analise de no-show: taxa, ausentes, custo fantasma. Breakdown por lote. Top promoters com mais no-show. |
| **Exports** | `default NoShowCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.10 `NoShowTrendCard.tsx`
| **Linhas** | 53 | **O que faz** | Tendencia de no-show ao longo do tempo usando SparklineCard. Media geral + delta. |
| **Exports** | `default NoShowTrendCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.11 `PricingSuggestionCard.tsx`
| **Linhas** | 110 | **O que faz** | Pricing dinamico: sugere SUBIR/DESCONTAR/MANTER preco. KPIs: % vendido, % tempo passado, velocidade relativa. Curva de vendas acumuladas vs ideal. |
| **Exports** | `default PricingSuggestionCard` | **Consumidores** | `insightsDashboard/FinanceiroTab` |

### 4.12 `PurchaseTimeCard.tsx`
| **Linhas** | 65 | **O que faz** | Analise de horario de compra usando HeatmapCard (dia x hora). Top janelas de vendas. |
| **Exports** | `default PurchaseTimeCard` | **Consumidores** | `insightsDashboard/OperacoesTab` |

### 4.13 `SmartTipsCard.tsx`
| **Linhas** | 128 | **O que faz** | Dicas inteligentes com categorias (PRICING/MARKETING/OPERACAO/PUBLICO/FINANCEIRO), prioridades (HIGH/MEDIUM/LOW), dismiss persistido em localStorage. Botao de acao contextual. |
| **Exports** | `default SmartTipsCard` | **Consumidores** | `insightsDashboard/ValorTab` |

### 4.14 `SplitPreviewCard.tsx`
| **Linhas** | 82 | **O que faz** | Preview de split automatico: waterfall (receita bruta -> gateway -> taxa VANTA -> distribuivel) + breakdown por tipo (CASA/SOCIO/VANTA/GATEWAY/PROMOTER). |
| **Exports** | `default SplitPreviewCard` | **Consumidores** | `insightsDashboard/FinanceiroTab` |

### 4.15 `TrendAlertCard.tsx`
| **Linhas** | 85 | **O que faz** | Alertas de tendencias (UP/DOWN) para metricas: vendas, publico, ticket medio, taxa de check-in. Cards coloridos (vermelho para queda, verde para subida) com sugestoes. |
| **Exports** | `default TrendAlertCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.16 `VantaValuePanel.tsx`
| **Linhas** | 93 | **O que faz** | Painel "Valor VANTA" mostrando metricas de ROI da plataforma: insights gerados, tempo economizado, operacoes automaticas, ingressos processados. Cards com gradiente dourado. |
| **Exports** | `default VantaValuePanel` | **Consumidores** | `insightsDashboard/ValorTab` |

### 4.17 `VipScoreCard.tsx`
| **Linhas** | 52 | **O que faz** | Score VIP 0-100 dos top clientes usando LeaderboardCard. Mostra frequencia e gasto total. |
| **Exports** | `default VipScoreCard` | **Consumidores** | `insightsDashboard/InsightsTab` |

### 4.18 `WeeklyReportCard.tsx`
| **Linhas** | 109 | **O que faz** | Resumo semanal: vendas, receita, check-ins, no-show (com deltas) + top promoters da semana. |
| **Exports** | `default WeeklyReportCard` | **Consumidores** | `insightsDashboard/ValorTab` |

---

## 5. SERVICES (raiz)

### 5.1 `IVantaService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 238 |
| **O que faz** | Contrato/interface publica da camada de dados VANTA. Define tipos de I/O e interface `IVantaService` com metodos para: registrar venda, validar ingresso, solicitar saque, checkout, carteira, guestlist, eventos publicos, busca, parceiros, beneficios MV. Formula: `valorLiquido = valor * (1 - taxaOverride || 0.05)`. |
| **Exports** | `RegistrarVendaInput/Result`, `ValidarIngressoInput/Result`, `SolicitarSaqueInput/Result`, `CheckoutInput/Result`, `MyTicket`, `AdicionarNomesResult`, `IVantaService` (interface) |
| **Consumidores** | `MyTicketsView` |

### 5.2 `adminService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 242 |
| **O que faz** | Curadoria de membros + VANTA Indica cards. Curadoria: buscar pendentes, classificar, concluir com tags, notas admin, toggle destaque. Indica: CRUD de cards com cache (5min TTL), audit log automatico. Tudo via Supabase. |
| **Exports** | `adminService` (objeto com metodos) |
| **Consumidores** | `CriarEventoView`, `VantaIndicaView` |

### 5.3 `assinaturaService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 422 |
| **O que faz** | Gestao de assinaturas MAIS VANTA. CRUD de assinaturas por comunidade, info do plano, renovacao, cancelamento, listagem global. |
| **Exports** | `assinaturaService` (objeto) |
| **Consumidores** | `DashboardV2Gateway`, `DashboardV2Home`, `AdminDashboardHome`, `Step2Ingressos`, `AssinaturasMaisVantaView`, `curadoria/tabClube`, `PlanosMaisVantaView`, `extrasStore` |

### 5.4 `auditService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 217 |
| **O que faz** | Servico de audit log. Registra acoes com ator, tipo, entidade, contexto, metadados no Supabase. Busca logs com filtros. Formata logs para exibicao. |
| **Exports** | `AuditLog` (interface), `AuditAction` (type), `auditService` (objeto), `formatAuditLog` (funcao) |
| **Consumidores** | `LogsTab`, `TabLogs`, `AuditLogView` + usado internamente por 7+ services |

### 5.5 `campanhasService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 302 |
| **O que faz** | CRUD de campanhas de marketing (IN_APP/PUSH/EMAIL). Segmentacao por publico, agendamento, resultados (enviados/abertos/clicados). |
| **Exports** | `CanalCampanha`, `SegmentoAlvo`, `CampanhaResultado`, `campanhasService` |
| **Consumidores** | `NotificacoesAdminView`, `pushTemplatesService` |

### 5.6 `cargosPlataformaService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 168 |
| **O que faz** | CRUD de cargos e permissoes da plataforma. Define 8 permissoes (GERIR_EQUIPE, GERIR_LISTAS, VER_FINANCEIRO, etc.). Atribuicao de cargos a usuarios. |
| **Exports** | `PERMISSOES_PLATAFORMA`, `PermissaoPlataforma`, `PERMISSAO_LABELS`, `CargoPlataforma`, `AtribuicaoPlataforma`, `cargosPlataformaService` |
| **Consumidores** | `cargosPlataforma/index` |

### 5.7 `clubeService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 5 |
| **O que faz** | Re-export do modulo splitado `./clube`. Mantido para compatibilidade com ~25 consumidores. |
| **Exports** | `clubeService` (re-export) |
| **Consumidores** | 10+ views (DashboardV2Gateway, CriarEventoView, Step2Ingressos, DividaSocialMaisVantaView, etc.) |

### 5.8 `comprovanteService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 378 |
| **O que faz** | Gestao de comprovantes de pagamento. Upload para Storage, associacao com saques, validacao, listagem com filtros. |
| **Exports** | `getVersion`, `comprovanteService` |
| **Consumidores** | `GestaoComprovantesView`, `authStore` |

### 5.9 `comunidadesService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 429 |
| **O que faz** | CRUD de comunidades. Buscar todas, ativas, por ID. Criar, atualizar, ativar/desativar. Cache local. Refresh do Supabase. |
| **Exports** | `comunidadesService` (objeto) |
| **Consumidores** | `permissoes.ts`, `AdminDashboardHome`, `OnboardingChecklist`, `SolicitacoesParceriaView`, `criarComunidade`, `ComunidadeDetalheView`, `definirCargos`, + 5 mais |

### 5.10 `condicoesService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 292 |
| **O que faz** | Condicoes comerciais por produtor/comunidade. CRUD de taxas, splits, regras de cobranca. Interface `DefinirCondicoesInput`. |
| **Exports** | `DefinirCondicoesInput`, `condicoesService` |
| **Consumidores** | `CondicoesProducerView`, `ComercialTab`, `masterFinanceiro` |

### 5.11 `cortesiasService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 426 |
| **O que faz** | Gestao de cortesias/ingressos gratuitos. CRUD com cotas, registro, listagem por evento. Interface `CortesiaPendente`. |
| **Exports** | `cortesiasService`, `CortesiaPendente` |
| **Consumidores** | `DashboardV2Gateway`, `CriarEventoView`, `TabEquipeSocio`, `EventDetailManagement`, `TabResumoCaixa`, `TabCortesias`, `TabLotacao`, `EditarEventoView`, `eventoDashboard` |

### 5.12 `cuponsService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 142 |
| **O que faz** | CRUD de cupons de desconto. Criar, listar, ativar/desativar, validar uso. |
| **Exports** | `cuponsService` |
| **Consumidores** | `CuponsComunidadeTab`, `eventoDashboard/CuponsSubView` |

### 5.13 `dashboardAnalyticsService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 266 |
| **O que faz** | Metricas temporais do dashboard. Busca KPIs com delta comparativo (periodo atual vs anterior). Tipos: `Periodo`, `MetricaPar`, `DashboardMetrics`. Timeline de vendas. |
| **Exports** | `Periodo`, `MetricaPar`, `DashboardMetrics`, `getPeriodoLabel`, `getDateRanges`, `VendasTimelinePoint`, `dashboardAnalyticsService` |
| **Consumidores** | `SocioHome`, `GerenteHome`, `DashboardV2Home`, `VendasTimelineChart`, `NoShowTrendCard`, `AdminDashboardHome`, `KpiCards`, `insightsDashboard` (3 tabs) |

### 5.14 `eventosAdminAprovacao.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 372 |
| **O que faz** | Fluxo de aprovacao de eventos. Aprovar/rejeitar, enviar correcao, propostas VANTA (enviar/aceitar/recusar/reenviar), buscar pendentes. |
| **Exports** | `aprovarEvento`, `rejeitarEvento`, `getEventosPendentes`, `enviarCorrecao`, `enviarPropostaVanta`, `aceitarPropostaVanta`, `recusarPropostaVanta`, `reenviarPropostaVanta`, `getPropostasPendentes` |
| **Consumidores** | `EditarEventoView`, `eventosAdminService` (re-export) |

### 5.15 `eventosAdminCore.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 323 |
| **O que faz** | Core do modulo eventos admin. Cache in-memory de `EVENTOS_ADMIN`. Refresh do Supabase com query pesada (join lotes + variacoes). Helpers: `ts()`, `varLabel()`, `getSocioId()`. Registro do rbac via `_registerRbac`. |
| **Exports** | `getRbac`, `_registerRbac`, `ts`, `varLabel`, `getSocioId`, `EVENTOS_ADMIN`, `_version`, `_refreshed`, `bumpVersion`, `refresh` |
| **Consumidores** | `insightsDashboard`, `financialIntelligence`, `operationsMarketing`, `valueCommunication`, + 5 sub-modulos internos, `eventosAdminService` |

### 5.16 `eventosAdminCrud.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 705 |
| **O que faz** | CRUD completo de eventos admin. Criar evento (com lotes/variacoes), atualizar, submeter edicao, aprovar/rejeitar edicao, solicitar cancelamento, encerrar evento. Notificacao de escalacao. |
| **Exports** | `getEventos`, `getEvento`, `getEventosByComunidade`, `notificarEscalacao`, `criarEvento`, `updateEvento`, `submeterEdicao`, `aprovarEdicao`, `rejeitarEdicao`, `getNomeById`, `solicitarCancelamento`, `encerrarEvento` |
| **Consumidores** | `eventosAdminService` (re-export) |

### 5.17 `eventosAdminFinanceiro.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 1033 |
| **O que faz** | Modulo financeiro completo. Taxas contratadas (get/set), saldo financeiro, solicitar saque (com hierarquia tripla: socio->gerente->master), confirmar/estornar saque, reembolso automatico/manual, chargebacks, custo gateway, resumo financeiro (por evento/comunidade/global). |
| **Exports** | `getContractedFees`, `setContractedFees`, `getSaldoFinanceiro`, `solicitarSaque`, `getSolicitacoesSaque`, `getSaquesByProdutor`, `uploadComprovanteSaque`, `confirmarSaque`, `estornarSaque`, `isReembolsoAutomaticoElegivel`, `processarReembolsoAutomatico`, `getReembolsos`, `registrarChargeback`, `getChargebacks`, `getGatewayCostByEvento`, `getGatewayCostGlobal`, `autorizarSaqueGerente`, `recusarSaque`, `ResumoFinanceiro` (interface), `getResumoFinanceiroEvento`, `getResumoFinanceiroComunidade`, `getResumoFinanceiroGlobal` |
| **Consumidores** | `SocioHome`, `GerenteHome`, `DashboardV2Home`, `AdminDashboardHome`, `ResumoFinanceiroCard`, `CaixaTab`, `ResumoEventoModal`, `TabResumoCaixa`, `financeiro/index`, `eventoDashboard` |

### 5.18 `eventosAdminService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 171 |
| **O que faz** | Fachada publica que re-exporta todos os sub-modulos (Core, Crud, Aprovacao, Financeiro, Tickets). API publica `eventosAdminService.xxx` permanece inalterada. |
| **Exports** | Re-exporta tipos e constantes + monta objeto `eventosAdminService` com todos os metodos |
| **Consumidores** | 10+ views e componentes (SocioHome, PanoramaHome, CaixaHome, GerenteHome, DashboardV2Gateway, permissoes, AdminDashboardHome, CriarEventoView, etc.) |

### 5.19 `eventosAdminTickets.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 378 |
| **O que faz** | Operacoes de tickets/ingressos. Registrar venda efetiva (INSERT em vendas_log + tickets_caixa), registrar cortesia, check-ins por origem, validar e queimar ingresso, CRUD de tickets, editar titular, selfie, reenviar, cancelar. |
| **Exports** | `registrarVendaEfetiva`, `registrarVenda`, `getVendasLog`, `registrarCortesia`, `getCheckinsIngresso`, `CheckinsPorOrigem`, `getCheckinsPorOrigem`, `validarEQueimarIngresso`, `getTicketsCaixaByEvento`, `addTicketToCaixa`, `editarTitular`, `atualizarSelfieUrl`, `reenviarIngresso`, `cancelarIngresso` |
| **Consumidores** | `ResumoEventoModal`, `eventosAdminService` (re-export) |

### 5.20 `eventosAdminTypes.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 152 |
| **O que faz** | Tipos compartilhados do dominio eventosAdmin. Define: `OrigemIngresso`, `VendaLog`, `TicketCaixa`, `ValidacaoIngresso`, `SolicitacaoSaque` (com hierarquia tripla), `Reembolso` (multi-etapa), `Chargeback`, `SaldoFinanceiro`, `ContractedFees`, `MetodoPagamento`. Constantes: `VANTA_FEE` (5%), `GATEWAY_CREDITO_PERCENT` (3.5%), `GATEWAY_CREDITO_FIXO` (R$0.39), `GATEWAY_PIX_PERCENT` (1%). |
| **Exports** | 15+ tipos e interfaces, 4 constantes, `calcGatewayCost` |
| **Consumidores** | `ResumoEventoModal`, `financeiro/index`, `ReembolsosSection`, `relatorios`, `eventoDashboard`, `reembolsoService` |

### 5.21 `fidelidadeService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 125 |
| **O que faz** | Programa de fidelidade. Pontuacao, tiers, historico. |
| **Exports** | `fidelidadeService` |
| **Consumidores** | `eventosAdminTickets` |

### 5.22 `indicaTemplatesService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 55 |
| **O que faz** | Templates pre-definidos para cards do VANTA Indica. CRUD basico. |
| **Exports** | `IndicaTemplate`, `indicaTemplatesService` |
| **Consumidores** | `VantaIndicaView` |

### 5.23 `jwtService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 21 |
| **O que faz** | JWT para QR codes de tickets via RPCs Supabase (`sign_ticket_token`, `verify_ticket_token`). HMAC-SHA256 server-side com expiracao de 15 segundos. Zero secrets no bundle. |
| **Exports** | `signTicketToken`, `verifyTicketToken` |
| **Consumidores** | `EventoCaixaView`, `QRScanner`, `PortariaScannerView` |

### 5.24 `legalService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 116 |
| **O que faz** | CRUD de documentos legais (termos de uso, politica de privacidade, etc.). |
| **Exports** | `LegalDocument`, `legalService` |
| **Consumidores** | `LegalEditorView` |

### 5.25 `listasService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 1044 |
| **O que faz** | Servico completo de listas/guestlists. CRUD de listas por evento, cotas por promoter, inserir nomes (lote), check-in por lista, busca, filtros, permissoes. O maior service do admin. |
| **Exports** | `PROMOTERS_CACHE`, `listasService` |
| **Consumidores** | `PromoterHome`, `DashboardV2Gateway`, `CriarEventoView`, + 7 views de listas |

### 5.26 `maisVantaConfigService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 155 |
| **O que faz** | Configuracao do MAIS VANTA. Tipos de vantagem, beneficios, config global. |
| **Exports** | `VantagemTexto`, `BeneficioConfig`, `MaisVantaConfig`, `maisVantaConfigService` |
| **Consumidores** | `DashboardV2Gateway`, `DividaSocialMaisVantaView`, `ConfigMaisVantaView`, `InfracoesGlobaisMaisVantaView`, `PlanosMaisVantaView`, `clubeInstagramService`, `extrasStore` |

### 5.27 `mesasService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 117 |
| **O que faz** | CRUD de mesas/cabines para eventos. Reservas, layout. |
| **Exports** | `mesasService` |
| **Consumidores** | `TabMesas` |

### 5.28 `notificationsService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 140 |
| **O que faz** | Envio de notificacoes (in-app, push). Enviar para usuario, broadcast, templates. |
| **Exports** | `notificationsService` |
| **Consumidores** | `DatabaseHealthView`, `campanhasService`, `comprovanteService`, `condicoesService`, `eventosAdminCrud`, `cortesiasService`, `clubeConviteEspecialService`, `clubePassportService`, `clubeSolicitacoesService`, `eventosAdminFinanceiro` |

### 5.29 `parceriaService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 343 |
| **O que faz** | Gestao de solicitacoes de parceria. CRUD, aprovacao/rejeicao, listagem. |
| **Exports** | `SolicitacaoParceria`, `parceriaService` |
| **Consumidores** | `SolicitacoesParceriaView`, `SolicitarParceriaView`, `pendenciasService` |

### 5.30 `pendenciasService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 257 |
| **O que faz** | Agregador de pendencias de todas as areas. Busca pendencias por tipo (eventos, saques, reembolsos, curadoria, passaportes MV, etc.). Contagem total. |
| **Exports** | `PendenciaItem`, `PendenciaTipo`, `getPendencias`, `countPendencias` |
| **Consumidores** | `PanoramaHome`, `DashboardV2Gateway`, `PendenciasHubView` |

### 5.31 `platformConfigService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 57 |
| **O que faz** | Configuracoes da plataforma (taxas, splits, parametros globais). CRUD simples. |
| **Exports** | `PlatformConfigItem`, `platformConfigService` |
| **Consumidores** | `ConfigPlataformaView` |

### 5.32 `pushTemplatesService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 153 |
| **O que faz** | Templates de push notification + agendamento. CRUD de templates e push agendados. |
| **Exports** | `PushTemplate`, `PushAgendado`, `pushTemplatesService`, `pushAgendadosService` |
| **Consumidores** | `NotificacoesAdminView` |

### 5.33 `rbacService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 556 |
| **O que faz** | Role-Based Access Control unificado. Mapas cargo->portal, cargo->label, cargo->descricao, cargo->permissoes. Atribuicoes por tenant (comunidade/evento). Guards contextuais (`temPermissaoCtx`). Refresh do Supabase. |
| **Exports** | `CARGO_TO_PORTAL`, `CARGO_LABELS`, `CARGO_DESCRICOES`, `CARGO_PERMISSOES`, `rbacService` |
| **Consumidores** | `PanoramaHome`, `DashboardV2Gateway`, `permissoes.ts`, `SolicitacoesParceriaView`, `EquipeTab`, `ComunidadesView`, `AdicionarMembroModal`, `EditarModal`, `definirCargos` (2 files) |

### 5.34 `reembolsoService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 595 |
| **O que faz** | Reembolsos multi-etapa. Verificar elegibilidade automatica, solicitar automatico/manual, aprovar por etapa (socio->gerente->master), rejeitar, listar por evento, buscar pendentes. |
| **Exports** | `podeReembolsoAutomatico`, `solicitarReembolsoAutomatico`, `solicitarReembolsoManual`, `aprovarReembolsoEtapa`, `rejeitarReembolsoManual`, `getReembolsosPorEvento`, `getReembolsosPendentes` |
| **Consumidores** | `DashboardV2Gateway`, `financeiro/index`, `pendenciasService`, `eventosAdminFinanceiro`, `relatorioService` |

### 5.35 `relatorioService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 136 |
| **O que faz** | Gerar relatorio completo de evento: vendas por variacao, receita, check-ins, cortesias, no-shows, reviews. |
| **Exports** | `VendaVariacao`, `RelatorioEvento`, `gerarRelatorio` |
| **Consumidores** | `TabRelatorio` |

### 5.36 `reviewsService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 100 |
| **O que faz** | CRUD de reviews/avaliacoes de eventos. Buscar por evento, media, listagem. |
| **Exports** | `reviewsService` |
| **Consumidores** | `GerenteDashboardView`, `eventoDashboard/index`, `relatorioService` |

### 5.37 `siteContentService.ts`
| Item | Detalhe |
|------|---------|
| **Linhas** | 78 |
| **O que faz** | CRUD de textos/conteudo do app (secoees editaveis pelo admin). |
| **Exports** | `SiteContentItem`, `siteContentService` |
| **Consumidores** | `SiteContentView` |

---

## 6. SERVICES/analytics/

### 6.1 `index.ts`
| **Linhas** | 5 | **Exports** | Re-exporta: `types`, `getEventAnalytics`, `getCommunityAnalytics`, `getMasterAnalytics`, `getMaisVantaAnalytics` |

### 6.2 `types.ts`
| **Linhas** | 254 |
| **O que faz** | Tipos para analytics: `TimeSeriesPoint`, `FunnelStep`, `HeatmapCell`, `RevenueBreakdown`, `TicketBreakdown`, `LoteBreakdown`, `VariacaoBreakdown`, `MetodoPagamentoBreakdown`, `AudienceMetrics`, `OperationalMetrics`, `PromoterMetrics`, `StaffMemberMetrics`, `TemporalMode`, `EventAnalytics`, `CommunityAnalytics`, `EventoRankingItem`, `MasterAnalytics`, `CommunityRankingItem`, `MaisVantaAnalytics`, `TierDistributionItem`, `CohortRow`. |

### 6.3 `communityAnalyticsService.ts`
| **Linhas** | 631 | **O que faz** | Analytics agregados por comunidade. Receita, publico, metricas temporais, rankings de eventos, promoters, staff. | **Exports** | `getCommunityAnalytics` |

### 6.4 `eventAnalyticsService.ts`
| **Linhas** | 544 | **O que faz** | Analytics por evento individual. Breakdowns de receita, tickets, lotes, variacoes, metodos de pagamento, audiencia, operacional, promoters, staff. Modo temporal (pre/operacao/pos). | **Exports** | `getEventAnalytics` |

### 6.5 `masterAnalyticsService.ts`
| **Linhas** | 346 | **O que faz** | Analytics globais para master admin. KPIs da plataforma, rankings de comunidades, serie temporal, projecoes. | **Exports** | `getMasterAnalytics` |

### 6.6 `maisVantaAnalyticsService.ts`
| **Linhas** | 459 | **O que faz** | Analytics do programa MAIS VANTA. Distribuicao por tier, cohorts, retencao, resgates, financeiro MV. | **Exports** | `getMaisVantaAnalytics` |

---

## 7. SERVICES/clube/

### 7.1 `index.ts`
| **Linhas** | 290 | **O que faz** | Fachada do modulo clube (MAIS VANTA). Monta objeto `clubeService` agregando todos os sub-modulos. Funcao `refreshClube()` com leitura completa de tiers, membros, solicitacoes, passports do Supabase. |
| **Exports** | `clubeService` (objeto com todos os metodos) |

### 7.2 `clubeCache.ts`
| **Linhas** | 168 | **O que faz** | Cache in-memory do clube. Maps de tiers, membros, lotes, reservas, solicitacoes, passports. Helpers de conversao row->entity. |
| **Exports** | `TIER_ORDER`, `_tiersDef`, `_membros`, `_lotes`, `_reservas`, `_solicitacoes`, `_passports`, `bump`, `getCacheVersion`, `rowToTierDef`, `rowToMembro`, `rowToPassport`, `rowToLote`, `rowToReserva`, `rowToSolicitacao`, `rowToConfig` |

### 7.3 `clubeCidadesService.ts`
| **Linhas** | 77 | **O que faz** | CRUD de cidades habilitadas para MAIS VANTA. |
| **Exports** | `clubeCidadesService` |

### 7.4 `clubeConfigService.ts`
| **Linhas** | 43 | **O que faz** | Get/save config do clube por comunidade. |
| **Exports** | `getConfig`, `saveConfig` |

### 7.5 `clubeConviteEspecialService.ts`
| **Linhas** | 131 | **O que faz** | Convites especiais MV. Buscar membros por filtro, enviar convites, listar por evento. |
| **Exports** | `FiltroMembros`, `buscarMembrosPorFiltro`, `enviarConvitesEspeciais`, `listarConvitesEspeciaisEvento` |

### 7.6 `clubeConvitesIndicacaoService.ts`
| **Linhas** | 75 | **O que faz** | Convites por indicacao. Gerar, listar, buscar por codigo, usar, gerar iniciais, adicionar. |
| **Exports** | `gerarConvite`, `listarConvitesMembro`, `buscarConvitePorCodigo`, `usarConvite`, `gerarConvitesIniciais`, `adicionarConvite`, `getLinkConvite` |

### 7.7 `clubeConvitesService.ts`
| **Linhas** | 102 | **O que faz** | CRUD geral de convites MAIS VANTA. |
| **Exports** | `ConviteMaisVanta`, `clubeConvitesService` |

### 7.8 `clubeDealsService.ts`
| **Linhas** | 184 | **O que faz** | CRUD de deals/ofertas exclusivas MAIS VANTA para parceiros. |
| **Exports** | `clubeDealsService` |

### 7.9 `clubeInfracoesService.ts`
| **Linhas** | 157 | **O que faz** | Gestao de infracoes MV. Verificar bloqueio/banimento, divida social, registrar infracao, castigo no-show. |
| **Exports** | `estaBloqueado`, `isBanidoPermanente`, `getFlagReincidencia`, `getBloqueioAte`, `temDividaSocial`, `getInfracoes`, `getInfracoesCount`, `registrarInfracao`, `temCastigoNoShow`, `aplicarCastigoNoShow`, `getCastigoAte` |

### 7.10 `clubeInstagramService.ts`
| **Linhas** | 92 | **O que faz** | Verificacao de Instagram para MV. Verificar perfil, bio, post automatico, atualizar seguidores. |
| **Exports** | `verificarPerfilInstagram`, `verificarBioInstagram`, `_fetchAndUpdateFollowers`, `verificarPostAutomatico`, `atualizarSeguidores` |

### 7.11 `clubeLotesService.ts`
| **Linhas** | 129 | **O que faz** | Lotes/beneficios MV por evento. CRUD de beneficios, lotes por tier. |
| **Exports** | `BeneficioMV`, `getBeneficiosEvento`, `salvarBeneficiosEvento`, `removerBeneficiosEvento`, `getLoteMaisVanta`, `getLotesEvento`, `getLoteParaTier`, `getAllLotes`, `upsertLotesMaisVanta`, `upsertLoteMaisVanta`, `removeLotesMaisVanta`, `removeLoteMaisVanta` |

### 7.12 `clubeMembrosService.ts`
| **Linhas** | 74 | **O que faz** | Operacoes de membros do clube. Get por userId, verificar se e membro, tier, suficiencia de tier, listar todos, alcance estimado, alterar tier, atualizar meta. |
| **Exports** | `getMembroClubeByUserId`, `isMembro`, `getTier`, `tierSuficiente`, `getAllMembros`, `getAlcanceEstimado`, `alterarTier`, `atualizarMembroMeta` |

### 7.13 `clubeNotifProdutorService.ts`
| **Linhas** | 126 | **O que faz** | Solicitacoes de notificacao MV para produtores. Solicitar, listar por evento, listar pendentes, aprovar/rejeitar. |
| **Exports** | `SolicitacaoNotifMV`, `solicitarNotificacao`, `listarSolicitacoesEvento`, `listarPendentes`, `aprovarSolicitacaoNotif`, `rejeitarSolicitacaoNotif` |

### 7.14 `clubeParceirosService.ts`
| **Linhas** | 127 | **O que faz** | CRUD de parceiros do MAIS VANTA. |
| **Exports** | `clubeParceirosService` |

### 7.15 `clubePassportService.ts`
| **Linhas** | 163 | **O que faz** | Passport MV (acesso por cidade). Solicitar, aprovar/rejeitar, status, cidades disponiveis, listar pendentes/todos. |
| **Exports** | `getPassportAprovacoes`, `isPassportAprovado`, `getPassportStatus`, `getCidadesDisponiveis`, `solicitarPassport`, `aprovarPassport`, `rejeitarPassport`, `getPassportsPendentes`, `getAllPassports` |

### 7.16 `clubePlanosService.ts`
| **Linhas** | 201 | **O que faz** | CRUD de planos de produtor. Listar, criar, atualizar, deletar, atribuir a produtor, cancelar, verificar limites de eventos. |
| **Exports** | `listarPlanos`, `criarPlano`, `atualizarPlano`, `deletarPlano`, `listarAtribuicoes`, `atribuirPlano`, `cancelarPlanoProdutor`, `getPlanoAtivoProdutor`, `verificarLimiteEventos` |

### 7.17 `clubeReservasService.ts`
| **Linhas** | 131 | **O que faz** | Resgates de beneficios MV. Resgatar, buscar, listar por usuario/evento, cancelar, pendentes de post, enviar/verificar post URL. |
| **Exports** | `ResgateMV`, `resgatarBeneficio`, `getResgate`, `getResgatesUsuario`, `getResgatesEvento`, `cancelarResgate`, `getResgatesPendentePost`, `enviarPostUrl`, `verificarPost` |

### 7.18 `clubeResgatesService.ts`
| **Linhas** | 225 | **O que faz** | Servico de resgates do clube (agregador mais completo). |
| **Exports** | `clubeResgatesService` |

### 7.19 `clubeSolicitacoesService.ts`
| **Linhas** | 311 | **O que faz** | Solicitacoes de entrada no clube. Get pendentes/todas, solicitar entrada, convidar amigo, aprovar (com notificacao e criacao de membro), adiar. |
| **Exports** | `getSolicitacoesPendentes`, `getSolicitacoes`, `getAllSolicitacoes`, `getSolicitacaoByUserId`, `solicitarEntrada`, `convidarAmigo`, `aprovarSolicitacao`, `adiarSolicitacao` |

### 7.20 `clubeTiersService.ts`
| **Linhas** | 72 | **O que faz** | CRUD de tiers MV. Listar, get por ID, ordem, refresh, criar, editar. |
| **Exports** | `getTiers`, `getTodosTiers`, `getTierDef`, `getTierOrdem`, `refreshTiers`, `criarTier`, `editarTier` |

---

## 8. SERVICES/insights/

### 8.1 `index.ts`
| **Linhas** | 14 | **Exports** | Re-exporta: `insightsTypes`, `financialTypes`, `insightsEngine` (6 funcoes), `financialIntelligence` (3 funcoes), `valueTypes`, `valueCommunication` (4 funcoes), `operationsTypes` |

### 8.2 `insightsTypes.ts`
| **Linhas** | 89 | **O que faz** | Tipos para insights: `ClientScore`, `NoShowAnalysis`, `NoShowByLote`, `NoShowByPromoter`, `NoShowTrend`, `HourlyPrediction`, `ChurnRadarResult`, `ChurnClient`, `TrendMetric`, `TrendDirection`, `TrendAlert`. |

### 8.3 `insightsEngine.ts`
| **Linhas** | 617 | **O que faz** | Motor de insights. Calcula: client scores (VIP), analise no-show (por lote/promoter), tendencia no-show, previsao lotacao por hora, radar de churn, alertas de tendencia. Tudo via queries Supabase. |
| **Exports** | `getClientScores`, `getNoShowAnalysis`, `getNoShowTrend`, `getLotacaoPrevisao`, `getChurnRadar`, `getTrendAlerts` |

### 8.4 `financialIntelligence.ts`
| **Linhas** | 257 | **O que faz** | Inteligencia financeira. Sugestao de pricing dinamico, calculo de splits, projecao de break-even. |
| **Exports** | `getPricingSuggestion`, `calculateSplits`, `getBreakEvenProjection` |

### 8.5 `financialTypes.ts`
| **Linhas** | 49 | **O que faz** | Tipos financeiros: `PricingAction`, `PricingSuggestion`, `SplitTipo`, `SplitItem`, `SplitResult`, `BreakEvenResult`. |

### 8.6 `operationsMarketing.ts`
| **Linhas** | 334 | **O que faz** | Operacoes e marketing analytics. Atribuicao de canal de vendas, lista de compradores, leaderboard de fidelidade, distribuicao de loyalty, ranking de horario de compra. |
| **Exports** | `getChannelAttribution`, `getEventBuyers`, `getLoyaltyLeaderboard`, `getLoyaltyDistribution`, `getPurchaseTimeRanking` |

### 8.7 `operationsTypes.ts`
| **Linhas** | 74 | **O que faz** | Tipos de operacoes: `ChannelSource`, `ChannelItem`, `ChannelAttribution`, `BuyerContact`, `LoyaltyTier`, `LoyaltyStatus`, `LoyaltyEntry`, `LoyaltyDistribution`, `PurchaseTimeCell`, `TopWindow`, `PurchaseTimeAnalysis`. |

### 8.8 `smartTipsRules.ts`
| **Linhas** | 221 | **O que faz** | Regras de dicas inteligentes. Gera dicas baseadas em contexto (metricas do evento/comunidade) com categorias e prioridades. |
| **Exports** | `generateTips` |

### 8.9 `valueCommunication.ts`
| **Linhas** | 351 | **O que faz** | Comunicacao de valor da plataforma. Gerar relatorio semanal, metricas de valor VANTA, dicas inteligentes, benchmark vs mercado. |
| **Exports** | `generateWeeklyReport`, `getVantaValueMetrics`, `getSmartTips`, `getBenchmarkComparison` |

### 8.10 `valueTypes.ts`
| **Linhas** | 77 | **O que faz** | Tipos de valor: `WeeklyReport`, `VantaValueMetrics`, `TipPriority`, `TipCategory`, `SmartTip`, `PlatformBenchmarks`, `BenchmarkComparison`, `BenchmarkItem`. |

---

## Resumo Quantitativo

| Categoria | Arquivos | Linhas Total |
|-----------|----------|-------------|
| permissoes.ts | 1 | 208 |
| Components (raiz) | 9 | 2.149 |
| Components/dashboard | 16 | 1.446 |
| Components/insights | 18 | 1.321 |
| Services (raiz) | 37 | 10.709 |
| Services/analytics | 6 | 2.234 |
| Services/clube | 20 | 3.428 |
| Services/insights | 10 | 1.538 |
| **TOTAL** | **117** | **23.033** |

---


## Capitulo 6

# Auditoria Completa: services/, stores/, hooks/, utils/

## SERVICES

---

### 1. analyticsService.ts

- **Caminho**: `/Users/vanta/prevanta/services/analyticsService.ts`
- **Linhas**: 67
- **O que faz**: Registra eventos de analytics (APP_OPEN, EVENT_VIEW, EVENT_OPEN) na tabela `analytics_events` via Supabase. Implementa batch buffer para EVENT_VIEW (acumula IDs e insere a cada 3s). Gerencia PMF survey (elegibilidade e resposta).
- **Imports principais**: `supabase` de `./supabaseClient`
- **Exports**:
  - `trackAppOpen(userId: string): void` -- fire-and-forget, registra APP_OPEN
  - `trackEventView(userId: string, eventoId: string): void` -- fire-and-forget, batch a cada 3s
  - `trackEventOpen(userId: string, eventoId: string): void` -- fire-and-forget, registra EVENT_OPEN
  - `checkPmfEligible(userId: string): Promise<boolean>` -- checa se user tem 3+ tickets e 0 respostas PMF
  - `submitPmfResponse(userId: string, response: string): Promise<boolean>` -- insere resposta PMF
- **Quem importa**: `ProximosEventosSection.tsx`, `EventDetailView.tsx`, `App.tsx`, `PmfSurveyModal.tsx`
- **Tabelas**: `analytics_events`, `tickets_caixa`, `pmf_responses`
- **Observacoes**: Usa `void supabase...then(null, () => {})` para fire-and-forget. Batch buffer usa `setTimeout` de 3s e `Set<string>` para deduplicar views.

---

### 2. authService.ts

- **Caminho**: `/Users/vanta/prevanta/services/authService.ts`
- **Linhas**: 441
- **O que faz**: Servico completo de autenticacao via Supabase Auth. Login com email/senha, login social (Google/Apple com suporte a Capacitor idToken), cadastro com upsert de profile, busca de sessao ativa, logout, listener de mudanca de estado, busca de membros, e enriquecimento de seguidores Instagram via Edge Function.
- **Imports principais**: `supabase`, `Membro`, `ContaVantaLegacy`, `Database`, `DEFAULT_AVATARS`, `logger`
- **Exports**:
  - `consumeSignInResolved(): boolean` -- flag para evitar reprocessamento no onAuthStateChange
  - `profileToMembro(row: ProfileRow): Membro` -- mapeador de row profiles para tipo Membro
  - `authService` (objeto com):
    - `signIn(email, senha): Promise<SignInResult>` -- login email/senha
    - `signInWithSocial(provider, idToken?): Promise<{ok, erro?}>` -- login OAuth/idToken
    - `signUp(params): Promise<SignUpResult>` -- cadastro + upsert profile + notificacao ao master
    - `getSession(): Promise<Membro | null>` -- recupera sessao ativa (timeout 4s)
    - `signOut(): Promise<void>` -- logout
    - `buscarMembros(q, limit?): Promise<Membro[]>` -- pesquisa via RPC `buscar_membros`
    - `onAuthStateChange(callback): () => void` -- listener de auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY, INITIAL_SESSION)
  - `enrichInstagramFollowers(userId, instagram): void` -- enriquecimento background, 1x/30 dias via Edge Function `instagram-followers`
- **Quem importa**: 17 arquivos incluindo `LoginView.tsx`, `AuthModal.tsx`, `authStore.ts`, `SearchView.tsx`, `ComunidadePublicView.tsx`, `EventSocialProof.tsx`, etc.
- **Tabelas/RPCs**: `profiles` (select/upsert/update), RPC `buscar_membros`, Edge Function `instagram-followers`
- **Colunas selecionadas** (PROFILE_COLUMNS): `id, nome, email, instagram, instagram_followers, data_nascimento, telefone_ddd, telefone_numero, estado, cidade, genero, biografia, avatar_url, cpf, interesses, album_urls, privacidade, role, destaque_curadoria`
- **Observacoes**: Flag `_intentionalLogout` distingue logout intencional de sessao expirada. Flag `_signInResolved` evita que onAuthStateChange reprocesse quando signIn ja resolveu. Timeout de 4s no getSession para evitar trava em rede lenta.

---

### 3. behaviorService.ts

- **Caminho**: `/Users/vanta/prevanta/services/behaviorService.ts`
- **Linhas**: 51
- **O que faz**: Rastreamento de comportamento do usuario (VIEW, PURCHASE, FAVORITE, DWELL) na tabela `user_behavior`. Usa RPC `eventos_recomendados_behavior` para obter eventos recomendados.
- **Imports principais**: `supabase`, `Evento`, `Json`
- **Exports**:
  - `behaviorService` (objeto com):
    - `trackView(userId, eventId): Promise<void>`
    - `trackPurchase(userId, eventId): Promise<void>`
    - `trackFavorite(userId, eventId): Promise<void>`
    - `trackDwell(userId, eventId, seconds): Promise<void>`
    - `getRecomendados(userId, cidade, limit?): Promise<Evento[]>`
- **Quem importa**: `IndicaPraVoceSection.tsx`, `extrasStore.ts`, `CheckoutSuccessPage.tsx`, `EventDetailView.tsx`
- **Tabelas/RPCs**: `user_behavior` (insert), RPC `eventos_recomendados_behavior`
- **Observacoes**: ActionType e um union literal: `'VIEW' | 'PURCHASE' | 'FAVORITE' | 'DWELL'`. Metadata suporta campo arbitrario JSON (ex: `dwell_seconds`).

---

### 4. circuitBreaker.ts

- **Caminho**: `/Users/vanta/prevanta/services/circuitBreaker.ts`
- **Linhas**: 103
- **O que faz**: Implementa o pattern Circuit Breaker para proteger contra cascata de erros quando Supabase esta lento/fora. Estados: CLOSED (normal), OPEN (bloqueado apos N falhas), HALF_OPEN (teste apos cooldown).
- **Imports principais**: nenhum externo
- **Exports**:
  - `withCircuitBreaker<T>(name, fn, fallback, config?): Promise<T>` -- executa funcao com protecao
  - `resetCircuit(name): void` -- reseta manualmente um circuito
  - `getCircuitState(name): CircuitState` -- retorna estado atual
- **Quem importa**: `extrasStore.ts`, `ticketsStore.ts`, `socialStore.ts`, `chatStore.ts`, `circuitBreaker.test.ts`
- **Config padrao**: `failureThreshold: 3`, `resetTimeout: 30_000ms` (30s)
- **Observacoes**: Stateless entre page reloads (Map em memoria). Cada circuito e identificado por nome string.

---

### 5. deepLinkService.ts

- **Caminho**: `/Users/vanta/prevanta/services/deepLinkService.ts`
- **Linhas**: 68
- **O que faz**: Escuta deep links do Capacitor e traduz para navegacao interna. Suporta URLs de evento, comunidade, checkout, carteira, perfil, e convite socio.
- **Imports principais**: `Capacitor` (@capacitor/core), `App` (@capacitor/app)
- **Exports**:
  - `DeepLinkResult` (interface): `type` (EVENT | COMMUNITY | CHECKOUT | WALLET | PROFILE | CONVITE_SOCIO | UNKNOWN), `id?`, `extra?`
  - `parseDeepLink(url: string): DeepLinkResult` -- parseia URL e retorna tipo + id
  - `registerDeepLinkListener(onDeepLink): () => void` -- registra listener nativo (noop na web)
- **Quem importa**: `App.tsx`
- **URLs suportadas**: `/event/:slug`, `/evento/:id`, `/community/:id`, `/comunidade/:id`, `/checkout/sucesso`, `/checkout/:eventoId`, `/convite-socio/:eventoId/:socioId`, `/perfil`
- **Observacoes**: Retorna cleanup function para remover listener. Noop em plataforma web.

---

### 6. lgpdExportService.ts

- **Caminho**: `/Users/vanta/prevanta/services/lgpdExportService.ts`
- **Linhas**: 42
- **O que faz**: Exportacao de dados pessoais conforme LGPD Art. 18, V. Usa RPC `exportar_dados_usuario` para obter todos os dados do usuario em uma unica chamada.
- **Imports principais**: `supabase`
- **Exports**:
  - `DadosExportados` (interface): perfil, tickets, transacoes, notificacoes, amizades, consentimentos, eventos_favoritos, comunidades_seguidas, exportado_em
  - `lgpdExportService` (objeto com):
    - `exportarMeusDados(): Promise<DadosExportados>` -- chama RPC
    - `downloadJSON(dados): void` -- gera Blob JSON e faz download
- **Quem importa**: `ProfileView.tsx`
- **RPCs**: `exportar_dados_usuario`
- **Observacoes**: Usa timestamp BR formatado para o nome do arquivo.

---

### 7. pushService.ts

- **Caminho**: `/Users/vanta/prevanta/services/pushService.ts`
- **Linhas**: 77
- **O que faz**: Gerencia subscricoes FCM push. Solicita permissao, obtem token FCM, salva no Supabase, e remove ao logout.
- **Imports principais**: `getFirebaseMessaging`, `isFirebaseConfigured` de `./firebaseConfig`, `supabase`
- **Exports**:
  - `pushService` (objeto com):
    - `requestPermissionAndGetToken(): Promise<string | null>` -- pede permissao + obtem FCM token via Service Worker
    - `saveSubscription(userId, fcmToken): Promise<boolean>` -- upsert em `push_subscriptions`
    - `removeSubscription(userId): Promise<void>` -- delete de `push_subscriptions`
- **Quem importa**: `nativePushService.ts`
- **Tabelas**: `push_subscriptions` (upsert/delete)
- **Observacoes**: Usa `VITE_FIREBASE_VAPID_KEY`. Registra Service Worker `/firebase-messaging-sw.js`. Import dinamico de `firebase/messaging`.

---

### 8. rateLimiter.ts

- **Caminho**: `/Users/vanta/prevanta/services/rateLimiter.ts`
- **Linhas**: 77
- **O que faz**: Rate limiter client-side usando token bucket pattern. Protege contra loops infinitos de refetch, bugs de useEffect, e cliques repetidos.
- **Imports principais**: nenhum externo
- **Exports**:
  - `rateLimiter` (objeto com):
    - `allow(key, config?): boolean` -- consome 1 token, retorna true se permitido
    - `reset(key): void` -- reseta um bucket
    - `resetAll(): void` -- reseta todos
- **Quem importa**: `extrasStore.ts`, `rateLimiter.test.ts`
- **Config padrao**: `maxTokens: 30`, `refillRate: 0.5/s` (30/min)
- **Observacoes**: Stateless entre reloads (Map em memoria). Loga warning quando bloqueia.

---

### 9. supabaseClient.ts

- **Caminho**: `/Users/vanta/prevanta/services/supabaseClient.ts`
- **Linhas**: 53
- **O que faz**: Instancia singleton do Supabase tipada com `Database`. Inclui keep-alive (ping leve a cada 4 min em producao) e wrapping com logging via `supabaseProxy`.
- **Imports principais**: `createClient` (@supabase/supabase-js), `Database`, `wrapSupabaseWithLogging`
- **Exports**:
  - `supabase` -- instancia singleton tipada com logging
- **Quem importa**: 141 arquivos (praticamente todo o projeto)
- **Observacoes**: Valida env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Em producao, throw se faltam. Em dev, warning. Keep-alive faz `profiles.select('id', {count: 'exact', head: true}).limit(0)` a cada 4 min. supabaseAdmin REMOVIDO (2026-03-03).

---

### 10. vantaService.ts

- **Caminho**: `/Users/vanta/prevanta/services/vantaService.ts`
- **Linhas**: 28
- **O que faz**: Singleton que expoe a implementacao ativa de IVantaService. Facade que delega para `SupabaseVantaService`.
- **Imports principais**: `SupabaseVantaService`, tipos de `IVantaService`, tipos de `eventosAdminService`
- **Exports**:
  - `vantaService: IVantaService` -- singleton (instancia de SupabaseVantaService)
- **Quem importa**: 17 arquivos incluindo `extrasStore.ts`, `AllEventsView.tsx`, `CityView.tsx`, `useAppHandlers.ts`, `ticketsStore.ts`, etc.
- **Re-exports implícitos** (via IVantaService): `RegistrarVendaInput`, `RegistrarVendaResult`, `ValidarIngressoInput`, `ValidarIngressoResult`, `SolicitarSaqueInput`, `SolicitarSaqueResult`, `AdicionarNomesResult`, `SolicitacaoSaque`, `SaldoFinanceiro`, `VendaLog`, `TicketCaixa`
- **Observacoes**: Pure facade -- zero logica propria. Implementacao real em `supabaseVantaService.ts`.

---

### ARQUIVOS NAO ENCONTRADOS (services/)

- **cacheService.ts** -- NAO EXISTE em `services/`. O codebase usa `services/cache.ts` (ver imports `getCached`, `invalidateCache`, `clearAllCache`).
- **chatService.ts** -- NAO EXISTE em `services/`. O codebase usa `services/messagesService.ts` e `services/chatSettingsService.ts`.
- **clubeService.ts** -- NAO EXISTE em `services/`. Existe em `features/admin/services/clubeService.ts`.
- **notificationService.ts** -- NAO EXISTE em `services/`. Existe em `features/admin/services/notificationsService.ts`.

---

## STORES

---

### 1. authStore.ts

- **Caminho**: `/Users/vanta/prevanta/stores/authStore.ts`
- **Linhas**: 242
- **O que faz**: Store Zustand central de autenticacao. Gerencia usuario logado, profile, notificacoes, cidade selecionada, permissoes RBAC. Coordena init com fallback em cascata (onAuthStateChange -> getSession 2s -> timeout absoluto 6s).
- **Imports principais**: `zustand`, `Membro`, `Notificacao`, `authService`, `enrichInstagramFollowers`, `notificationsService`, `clearAllCache`, `realtimeManager`, `comprovanteService`, `getAccessNodes`, `rbacService`, `logger`, `useExtrasStore`
- **STATE**:
  - `currentAccount: Membro` -- usuario logado (ou GUEST_PLACEHOLDER)
  - `profile: Membro` -- perfil do usuario
  - `authLoading: boolean` -- true durante inicializacao
  - `selectedCity: string` -- cidade selecionada (persistida em localStorage)
  - `notifications: Notificacao[]` -- notificacoes do usuario
  - `unreadNotifications: number` -- contador de nao lidas
  - `accessNodes: ReturnType<typeof getAccessNodes>` -- nos de acesso RBAC
- **ACTIONS**:
  - `loginWithMembro(m: Membro): void` -- configura membro logado (enrichment, realtime, notif, RBAC, comprovante, clube)
  - `logout(): Promise<void>` -- signOut + clearAllCache + unsubscribeAll + limpa sessionStorage
  - `updateProfile(data: Partial<Membro>): boolean` -- atualiza profile local
  - `registerUser(m: Membro): void` -- define como vanta_member
  - `setSelectedCity(city: string): void` -- persiste em localStorage
  - `setNotifications(n: Notificacao[]): void`
  - `setUnreadNotifications(n: number): void`
  - `addNotification(notif: Omit<Notificacao, 'id'>): void`
  - `markAllNotificationsAsRead(): void`
  - `handleNotificationAction(n: Notificacao): void` -- marca como lida
  - `init(): () => void` -- singleton, configura onAuthStateChange com 2 fallbacks
- **Quem importa**: 45 arquivos (store mais usado do projeto)
- **Exports adicionais**: `GUEST_PLACEHOLDER` -- constante Membro placeholder para visitante
- **Observacoes**: `_setupMembro` e helper interno que configura: enrichInstagramFollowers, notificationsService, realtime subscription para notifications, comprovanteService.refresh (3s delay), initClubeData (5s delay), rbacService.refresh. Init usa singleton guard (`_initUnsub`) para evitar double-init do StrictMode.

---

### 2. chatStore.ts

- **Caminho**: `/Users/vanta/prevanta/stores/chatStore.ts`
- **Linhas**: 433
- **O que faz**: Store Zustand de chat/mensagens. Gerencia chats, mensagens, presenca online, settings (archive/mute), notificacoes de mensagens com debounce e agrupamento.
- **Imports principais**: `zustand`, `Chat`, `Membro`, `Mensagem`, `messagesService`, `InboxEntry`, `supabase`, `tsBR`, `getCached`, `withCircuitBreaker`, `useAuthStore`, `GUEST_PLACEHOLDER`, `notificationsService`, `chatSettingsService`, `ChatSetting`
- **STATE**:
  - `chats: Chat[]` -- lista de conversas
  - `onlineUsers: Set<string>` -- set de IDs de usuarios online
  - `activeChatParticipantId: string | null` -- chat aberto atualmente
  - `totalUnreadMessages: number` -- total de mensagens nao lidas
  - `chatSettings: Map<string, ChatSetting>` -- settings de archive/mute por partner
- **ACTIONS**:
  - `ensureChatExists(participantId, participantMembro?): void` -- cria chat se nao existe, carrega historico
  - `sendMessage(participantId, text): void` -- envio otimista + persistencia
  - `markChatAsRead(participantId): void` -- zera unreadCount + persiste
  - `deleteMessage(messageId, participantId): Promise<boolean>` -- soft delete
  - `toggleReaction(messageId, emoji, participantId): Promise<void>` -- toggle emoji reaction
  - `archiveChat(partnerId, keepArchived): Promise<void>`
  - `unarchiveChat(partnerId): Promise<void>`
  - `muteChat(partnerId): Promise<void>`
  - `unmuteChat(partnerId): Promise<void>`
  - `init(userId): () => void` -- carrega inbox (com cache 30s + circuit breaker), configura realtime, presence, retorna cleanup
- **Quem importa**: `EventDetailView.tsx`, `App.tsx`, `MessagesView.tsx`, `useAppHandlers.ts`, `Layout.tsx`, `ChatRoomView.tsx`
- **Logica notavel**: Funcoes auxiliares `createMessageNotification` e `flushNotification` implementam debounce por remetente (2s) com agrupamento de contador (ex: "Nova mensagem de Fulano (3)"). Push FCM via Edge Function `send-push`.

---

### 3. extrasStore.ts

- **Caminho**: `/Users/vanta/prevanta/stores/extrasStore.ts`
- **Linhas**: 138
- **O que faz**: Store Zustand para eventos (listagem paginada, busca, favoritos), presencas, clube. Coordena vantaService, favoritosService, behaviorService, clubeService, assinaturaService, maisVantaConfigService.
- **Imports principais**: `zustand`, `Evento`, `Ingresso`, `vantaService`, `favoritosService`, `behaviorService`, `clubeService`, `assinaturaService`, `maisVantaConfigService`, `getCached`, `invalidateCache`, `withCircuitBreaker`, `rateLimiter`, `useAuthStore`, `useTicketsStore`
- **STATE**:
  - `allEvents: Evento[]` -- lista de eventos carregados
  - `savedEvents: string[]` -- IDs de eventos favoritos
  - `hasMoreEvents: boolean` -- flag de paginacao
  - `eventsLoading: boolean` -- loading de paginacao
- **ACTIONS**:
  - `refreshEvents(): void` -- invalida cache e recarrega pagina 0
  - `loadMoreEvents(): void` -- carrega proxima pagina (paginacao infinita)
  - `searchEventsServerSide(query): Promise<Evento[]>` -- busca server-side
  - `toggleFavorito(eventoId): void` -- toggle otimista + persiste + track behavior
  - `confirmarPresenca(evento): boolean` -- confirma presenca e incrementa contador
  - `addExternalTicket(ticket): void` -- adiciona ticket externo (de checkout via BroadcastChannel)
  - `initEvents(): void` -- carrega pagina 0 com cache 60s
  - `initClubeData(): void` -- refresh clube + assinatura + maisVantaConfig
  - `initFavoritos(userId): void` -- carrega favoritos do usuario
- **Quem importa**: 8 arquivos incluindo `authStore.ts`, `HomeView.tsx`, `EventDetailView.tsx`, `useAppHandlers.ts`, `ProfileView.tsx`, etc.
- **Observacoes**: Paginacao usa `EVENTS_PAGE_SIZE = 20`. Rate limiter key: `eventos-fetch`. Circuit breaker key: `supabase-eventos`. Cache keys: `eventos:p0`, `eventos:p1`, etc.

---

### STORES NAO ENCONTRADOS

- **navigationStore.ts** -- NAO EXISTE. Navegacao e gerenciada pelo hook `useNavigation.ts`.
- **toastStore.ts** -- NAO EXISTE. Toasts sao gerenciados via estado local e `showSuccess` no `useAppHandlers`.

---

## HOOKS

---

### 1. useAppHandlers.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useAppHandlers.ts`
- **Linhas**: 465
- **O que faz**: Hook mega-orquestrador que conecta todas as stores (auth, tickets, extras, social, chat) com a navegacao e gerencia estados de modais, handlers compostos para toda a UI (compra, cortesia, transferencia, presenca, auth, onboarding, notificacoes, chat, amizade). Inclui BroadcastChannel listener para checkout e auto-trigger de onboarding.
- **Parametros**: `(nav: ReturnType<typeof useNavigation>, pwa: ReturnType<typeof usePWA>)`
- **Retorno** (objeto com):
  - Derivados: `isGuest`, `hasAdminAccess`
  - Modal states: `showSuccessModal`, `successMessage`, `showAuthModal`, `showLoginView`, `guestModalContext`, `showOnboarding`, `showAdminGuide`, `showProfileSuccess`, `reviewTarget`, `profilePreviewStatus` (+ setters)
  - Handlers: `showSuccess`, `handleBuyTicketComposite`, `handleDevolverCortesia`, `handleTransferirIngresso`, `handlePresencaComposite`, `handleAuthSuccess`, `handleLoginSuccess`, `handleOnboardingComplete`, `handleUpdateProfile`, `handleNotificationActionClickComposite`, `handleRequestFriendshipComposite`, `guardedOpenMemberProfile`, `openChatRoom`, `guestNavigateToTab`
  - Store refs: `addNotification`, `markAllNotificationsAsRead`, `notifications`, `cortesiasPendentes`, `logout`, `profile`, `currentAccount`, `allEvents`
- **Export adicional**: `adminDeepLink` -- objeto mutavel para deep link de admin (tenantId, tenantTipo)
- **Imports**: Todas as stores (auth, tickets, extras, social, chat), `vantaService`, `supabase`, tipos
- **Quem importa**: `App.tsx`
- **Logica notavel**: `requireAuth` e um HOF que intercepta acoes de guest e mostra modal contextual. `handleNotificationActionClickComposite` e um switch gigante (~80 linhas) que roteia cada tipo de notificacao para a view correta. BroadcastChannel `vanta_tickets` escuta compras do checkout.

---

### 2. useBloqueados.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useBloqueados.ts`
- **Linhas**: 23
- **O que faz**: Retorna Set reativo de IDs bloqueados pelo usuario logado.
- **Parametros**: nenhum
- **Retorno**: `Set<string>` -- IDs bloqueados
- **Imports**: `listarBloqueados` de `reportBlockService`, `useAuthStore`
- **Quem importa**: `DashboardV2Gateway.tsx`, `App.tsx`
- **Observacoes**: Cleanup com `cancelled` flag. So busca se nao e guest.

---

### 3. useConnectivity.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useConnectivity.ts`
- **Linhas**: 44
- **O que faz**: Monitora conectividade online/offline, conta pendencias de sync, e auto-sincroniza quando reconecta.
- **Parametros**: nenhum
- **Retorno**: `{ isOnline: boolean, pendingSyncCount: number, syncing: boolean, refreshPendingCount: () => Promise<void> }`
- **Imports**: `offlineEventService`
- **Quem importa**: `MessagesView.tsx`, `SearchView.tsx`
- **Observacoes**: Escuta `online`/`offline` events do window. Auto-sync via `offlineEventService.syncAll()`.

---

### 4. useDebounce.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useDebounce.ts`
- **Linhas**: 17
- **O que faz**: Debounce generico de valor. Retorna o valor so apos `delay` ms sem mudanca.
- **Parametros**: `<T>(value: T, delay = 300): T`
- **Retorno**: `T` -- valor debounced
- **Quem importa**: `InviteFriendsModal.tsx`, `EventSocialProof.tsx`, `NewChatModal.tsx`, `MessagesView.tsx`, `SearchView.tsx`, `ChatRoomView.tsx`
- **Observacoes**: Hook simples e generico, muito reutilizado.

---

### 5. useDevNavLogger.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useDevNavLogger.ts`
- **Linhas**: 36
- **O que faz**: Observa mudancas de rota (pathname) e tab, logando via `devLogger` somente em DEV.
- **Parametros**: `(activeTab: string)`
- **Retorno**: void
- **Imports**: `useLocation` (react-router-dom), `devLogger`
- **Quem importa**: `App.tsx`
- **Observacoes**: Noop em producao (`import.meta.env.DEV`). Usa refs para comparar valores anteriores.

---

### 6. useDraft.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useDraft.ts`
- **Linhas**: 114
- **O que faz**: Gerencia rascunhos (drafts) de criacao de evento ou comunidade. Salva automaticamente com debounce de 3s no Supabase. Carrega rascunho existente ao montar. Permite descartar.
- **Parametros**: `(tipo: 'EVENTO' | 'COMUNIDADE', comunidadeId?: string)`
- **Retorno**: `{ draftLoaded: boolean, hasDraft: boolean, draftData: DraftData | null, saveDraft: (dados, stepAtual) => void, discardDraft: () => Promise<void> }`
- **Imports**: `createClient` (@supabase/supabase-js) -- cria client proprio sem tipagem (tabela `drafts` nao esta nos types)
- **Quem importa**: `CriarEventoView.tsx`, `criarComunidade/index.tsx`
- **Tabela**: `drafts` (select/upsert/delete) com conflict key `user_id,tipo,comunidade_id`
- **Observacoes**: Rascunhos expiram em 30 dias (`expires_at`). Cria seu proprio Supabase client (sem tipagem de schema).

---

### 7. useModalStack.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useModalStack.ts`
- **Linhas**: 169
- **O que faz**: Gerenciamento centralizado de modais com suporte a browser back (History API) e tecla Escape. Stack global singleton -- primeiro modal faz pushState, subsequentes fazem replaceState.
- **Exports**:
  - `useModalBack(isOpen: boolean, onClose: () => void, id: string): void` -- hook simplificado que registra/desregistra automaticamente baseado em `isOpen`
- **Funcoes internas** (nao exportadas): `registerModal`, `unregisterModal`, `useModalStack`
- **Imports**: `devLogger`
- **Quem importa**: 29 arquivos (todos os modais do app) incluindo `PriceFilterModal.tsx`, `AuthModal.tsx`, `VibeFilterModal.tsx`, `TicketQRModal.tsx`, `ImageCropperModal.tsx`, etc.
- **Logica notavel**: Usa `queueMicrotask` para schedule de limpeza da history entry (evita colisao quando register/unregister acontecem no mesmo ciclo de render). Escape fecha o topo da stack. Browser back fecha o topo e re-push se ainda tem modais.
- **Observacoes**: Arquitetura sofisticada com `ignoreNextPop` flag para evitar loop de back/pop. Garante UX nativa de "voltar" em mobile.

---

### 8. useNavigation.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useNavigation.ts`
- **Linhas**: 256
- **O que faz**: Hook central de navegacao do app. Gerencia tabs, event detail overlay, member profile overlay, comunidade overlay, sub-views do perfil (carteira, ingressos, preview, chat), scroll position saving/restore, deep link sync.
- **Parametros**: nenhum
- **Retorno** (objeto com):
  - Estado: `activeTab`, `selectedEvent`, `selectedMember`, `selectedComunidadeId`, `profileSubView`, `isCityModalOpen`, `isNotificationModalOpen`, `selectedAllEventsCity`, `selectedCityView`, `selectedAllPartnersCity`, `selectedAllBeneficiosCity`, `clubeConviteId`, `mainScrollRef`
  - Setters: `setProfileSubView`, `setIsCityModalOpen`, `setIsNotificationModalOpen`, `setClubeConviteId`
  - Navegacao: `openEventDetail`, `closeEventDetail`, `openMemberProfile`, `closeMemberProfile`, `openComunidade`, `closeComunidade`, `openAllEvents`, `closeAllEvents`, `openCityView`, `closeCityView`, `openAllPartners`, `closeAllPartners`, `openAllBeneficios`, `closeAllBeneficios`, `navigateToTab`, `navigateToProfileFrom`, `returnFromSubView`, `resetNavigation`
- **Imports**: `useNavigate`, `useLocation` (react-router-dom), tipos
- **Quem importa**: `App.tsx`, `useAppHandlers.ts`
- **Mapa de tabs**: INICIO=`/`, RADAR=`/radar`, BUSCAR=`/buscar`, MENSAGENS=`/mensagens`, PERFIL=`/perfil`, ADMIN_HUB=`/admin`
- **Observacoes**: `resolveTab` faz match por prefixo para rotas admin/perfil/mensagens. Scroll positions salvas em Map por tab key. `openComunidade` guarda evento anterior para restaurar ao fechar. Deep link sync na montagem.

---

### 9. usePWA.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/usePWA.ts`
- **Linhas**: 172
- **O que faz**: Gerencia ciclo de vida completo do PWA: registro de Service Worker (Workbox), permissao de notificacoes, prompt de instalacao (Add to Home Screen), deteccao de atualizacao, e registro FCM push.
- **Parametros**: nenhum
- **Retorno** (`UsePWAReturn`):
  - Notificacoes: `notifPermission: NotifPermission`, `requestNotifPermission(): Promise<NotifPermission>`, `sendLocalNotification(title, body, url?)`, `registerFcmPush(userId): Promise<void>`
  - Instalacao: `canInstall: boolean`, `installApp(): Promise<void>`, `isInstalled: boolean`
  - Atualizacao: `updateAvailable: boolean`, `applyUpdate(): void`
- **Imports**: `Workbox` (workbox-window), `nativePushService`
- **Quem importa**: `App.tsx`, `AppModals.tsx`, `useAppHandlers.ts`, `PushPermissionBanner.tsx`
- **Tipos exportados**: `NotifPermission = 'idle' | 'granted' | 'denied' | 'unavailable'`
- **Observacoes**: Detecta standalone via `display-mode: standalone` e `navigator.standalone` (iOS). Notificacao local via SW com fallback para `new Notification()`. `registerFcmPush` delega para `nativePushService`.

---

### 10. usePermission.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/usePermission.ts`
- **Linhas**: 124
- **O que faz**: Hook centralizado para verificar e solicitar permissoes do navegador (camera e geolocalizacao). Compativel com iOS Safari.
- **Exports**:
  - `useCameraPermission()` -- retorna `{ state: PermissionState, request(constraints?): Promise<{stream, denied}>, check(): Promise<PermissionState> }`
  - `useGeolocationPermission()` -- retorna `{ state: PermissionState, check(): Promise<PermissionState>, request(options?): Promise<GeolocationCoordinates | null> }`
- **Tipo**: `PermissionState = 'idle' | 'checking' | 'granted' | 'denied' | 'unavailable'`
- **Quem importa**: `RadarView.tsx`, `EventoCaixaView.tsx`, `useRadarLogic.ts`, `QRScanner.tsx`
- **Observacoes**: iOS Safari nao suporta `navigator.permissions.query` para camera -- vai direto para getUserMedia e trata erro. Geolocalizacao usa `enableHighAccuracy: true, timeout: 10000, maximumAge: 60000`.

---

### 11. useSessionTimeout.ts

- **Caminho**: `/Users/vanta/prevanta/hooks/useSessionTimeout.ts`
- **Linhas**: 34
- **O que faz**: Desloga usuario apos 30 minutos de inatividade. Reseta timer em qualquer interacao (mousedown, keydown, touchstart, scroll).
- **Parametros**: `(onTimeout: () => void, enabled = true)`
- **Retorno**: void
- **Quem importa**: `DashboardV2Gateway.tsx`
- **Observacoes**: Events registrados com `{ passive: true }`. Cleanup remove todos os listeners e limpa timeout.

---

## UTILS

---

### 1. cnpjValidator.ts

- **Caminho**: `/Users/vanta/prevanta/utils/cnpjValidator.ts`
- **Linhas**: 97
- **O que faz**: Validacao de CNPJ com digito verificador offline e consulta a API publica da Receita Federal (BrasilAPI). Fallback se API cair.
- **Exports**:
  - `validarDigitoCnpj(cnpj: string): boolean` -- validacao offline de digito verificador
  - `formatarCnpj(cnpj: string): string` -- formata como `12.345.678/0001-90`
  - `DadosReceitaCnpj` (interface): cnpj, razaoSocial, situacao, atividadePrincipal, uf, municipio, valido
  - `consultarCnpj(cnpj: string): Promise<DadosReceitaCnpj>` -- consulta BrasilAPI com timeout 8s + fallback
- **Quem importa**: `Step3Operacao.tsx` (criar comunidade)
- **API**: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}` com AbortController (8s timeout)

---

### 2. exportUtils.ts

- **Caminho**: `/Users/vanta/prevanta/utils/exportUtils.ts`
- **Linhas**: 160
- **O que faz**: Exportacao de dados em CSV, PDF e Excel (.xlsx) para relatorios financeiros e listas. Imports dinamicos de jsPDF e exceljs (~300KB carregam sob demanda).
- **Exports**:
  - `exportCSV(filename, headers, rows): void` -- gera CSV com BOM UTF-8 e download
  - `exportPDF(options: PDFOptions): Promise<void>` -- gera PDF com header VANTA, tabela, resumo KPIs, paginacao
  - `ExcelSheet` (interface): nome, headers, rows
  - `exportExcel(filename, sheets: ExcelSheet[]): Promise<void>` -- gera .xlsx multi-aba com auto-width
- **Quem importa**: 8 arquivos: `financeiro/index.tsx`, `masterFinanceiro/index.tsx`, `HistoricoSaques.tsx`, `ReembolsosSection.tsx`, `RelatorioMasterView.tsx`, `PromoterCotasView.tsx`, `exportRelatorioComunidade.ts`, `exportRelatorio.ts`
- **Observacoes**: PDF tem pagina A4, header VANTA, linhas separadoras, rodape com data e paginacao. CSV inclui BOM (`\uFEFF`) para Excel reconhecer UTF-8. Excel usa exceljs com auto-width.

---

### 3. platform.ts

- **Caminho**: `/Users/vanta/prevanta/utils/platform.ts`
- **Linhas**: 32
- **O que faz**: Detecta se app esta rodando como PWA standalone ou Capacitor. Abre URL de checkout no browser externo quando dentro de app nativo (evita taxa Apple/Google 30%).
- **Exports**:
  - `openCheckoutUrl(eventoId: string): void` -- abre `/checkout/{eventoId}` em `_system` (app) ou `_blank` (browser)
- **Quem importa**: `EventDetailView.tsx`
- **Observacoes**: Detecta standalone via `display-mode: standalone`, `navigator.standalone` (iOS), e `window.Capacitor`.

---

### 4. slug.ts

- **Caminho**: `/Users/vanta/prevanta/utils/slug.ts`
- **Linhas**: 8
- **O que faz**: Gera slug URL-safe a partir de texto (remove acentos, espacos para hifens).
- **Exports**:
  - `generateSlug(text: string): string`
- **Quem importa**: `comunidadesService.ts`, `slug.test.ts`
- **Observacoes**: Usa `normalize('NFD')` para remover diacriticos.

---

### 5. ticketReceiptPdf.ts

- **Caminho**: `/Users/vanta/prevanta/utils/ticketReceiptPdf.ts`
- **Linhas**: 100
- **O que faz**: Gera PDF de comprovante de ingresso (SEM QR code -- QR fica exclusivo no app/Wallet por seguranca).
- **Exports**:
  - `gerarComprovantePdf(data: ReceiptData): Promise<void>` -- gera e faz download do PDF
- **Interface `ReceiptData`**: nomeEvento, dataEvento, local, cidade, nomeComprador, variacao, valor, codigoPedido, dataCompra
- **Quem importa**: `EventTicketsCarousel.tsx`
- **Observacoes**: Import dinamico de `jsPDF`. PDF A4 portrait com header VANTA, dados do evento/compra, aviso de seguranca, rodape com `maisvanta.com`.

---


## Capitulo 7

# Investigacao Completa: Dashboard V2, Tickets e Supabase Schema

## Parte 1: features/dashboard-v2/

### 1.1 DashboardV2Gateway.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/DashboardV2Gateway.tsx` |
| **Linhas** | 978 |
| **O que faz** | Gateway principal do painel admin V2. Orquestra sidebar, command palette, navegacao entre 50+ subviews lazy-loaded, panorama (caixa de entrada multi-tenant), role simulation, session timeout, realtime deep links, e guards de permissao RBAC. Funciona como rota standalone `/dashboard-v2` com fallback pro authStore. |
| **Props/Interface** | `{ onClose?, adminNome?, adminRole?: ContaVantaLegacy, currentUserId?, addNotification?, initialTenantId?, initialTenantTipo?: 'COMUNIDADE' \| 'EVENTO' }` |
| **Imports principais** | SidebarV2, CommandPalette, DashboardV2Home, PanoramaHome, 50+ lazy views (ComunidadesView, FinanceiroView, MasterFinanceiroView, CheckInView, CaixaView, ListasView, etc.), eventosAdminService, clubeService, comunidadesService, rbacService, permissoes, useAuthStore, useSessionTimeout, adminDeepLink, VantaDropdown |
| **Quem importa** | `App.tsx` |
| **Observacoes** | Mapeia `NavItem` -> `AdminSubView` via `NAV_TO_SUBVIEW`. Suporta role simulation (dev tool desktop). Contexto panorama vs drill-down via `activeContext`. Deep links admin via `adminDeepLink`. Pendencias calculadas em tempo real (saques, reembolsos, curadoria, passaportes MV). Session timeout de 30min com auto-logout. |

### 1.2 DashboardV2Home.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/DashboardV2Home.tsx` |
| **Linhas** | 829 |
| **O que faz** | Dashboard home principal para Master Admin. Renderiza: saudacao, pendencias urgentes (7 tipos com badges e navegacao), hero financeiro com KPIs temporais (vendas, membros, eventos), grafico de vendas (VendasTimelineChart), KPIs estaticos (comunidades ativas, eventos publicados), pizza de faturamento (por comunidade ou evento), resumo financeiro (ResumoFinanceiroCard), banner MAIS VANTA (assinatura ativa/inativa + MRR global), e acoes rapidas contextuais. Roteamento para homes especializadas por role (PromoterHome, PortariaHome, CaixaHome, SocioHome, GerenteHome). |
| **Props/Interface** | `Pendencias { curadoria, pendentes, saques, passaportesMV, solicitacoesMV, dividaSocial, reembolsos }` + `Props { adminNome, adminRole: ContaVantaLegacy, currentUserId, tenantNome, pendencias, onNavigate: (v: AdminSubView) => void, comunidadeId? }` |
| **Imports principais** | eventosAdminService, comunidadesService, assinaturaService, dashboardAnalyticsService, KpiCard/KpiDeltaCard/KpiPieCard, VantaPieChart, ResumoFinanceiroCard, VendasTimelineChart, GerenteHome, SocioHome, PromoterHome, PortariaHome, CaixaHome |
| **Quem importa** | `DashboardV2Gateway.tsx` |
| **Observacoes** | Realtime via Supabase channels (INSERT/UPDATE em tickets_caixa). Filtro de periodo (Semana/Mes/Trimestre/Ano). Calcula delta % entre periodo atual e anterior. Pizza faturamento: top 5 comunidades + "Outros" (master) ou por evento (comunidade). |

### 1.3 VendasTimelineChart.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/VendasTimelineChart.tsx` |
| **Linhas** | 120 |
| **O que faz** | Grafico area/linha de vendas ao longo do tempo usando Recharts. Toggle entre modo "valor" (R$) e "quantidade". Responsivo (150px mobile, 200px desktop via hook useIsLg). Gradiente dourado (#FFD300). Tooltip customizado com data, valor formatado em BRL ou contagem de ingressos. |
| **Props/Interface** | `Props { data: VendasTimelinePoint[], loading?: boolean }` + `Modo = 'valor' \| 'quantidade'` |
| **Imports principais** | recharts (AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area), Loader2, VendasTimelinePoint (type) |
| **Quem importa** | `DashboardV2Home.tsx`, `GerenteHome.tsx`, `SocioHome.tsx`, `features/admin/views/financeiro/index.tsx`, `features/admin/views/masterFinanceiro/index.tsx` |
| **Observacoes** | Hook `useIsLg()` com matchMedia listener para breakpoint 1024px. Skeleton de loading com shimmer. |

### 1.4 CommandPalette.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/components/CommandPalette.tsx` |
| **Linhas** | 351 |
| **O que faz** | Command palette (Cmd+K) com busca hibrida: comandos estaticos (20 telas admin pre-definidas) + busca dinamica no Supabase (eventos, comunidades, membros com debounce 300ms). Suporte a navegacao por teclado (ArrowUp/Down, Enter, Escape). Resultados com icones contextuais, secoes agrupadas, highlight do item selecionado. |
| **Props/Interface** | `CommandItem { id, label, section, icon, keywords }` + `DataResult { id, label, subtitle, section, type: 'evento' \| 'comunidade' \| 'membro' }` + `Props { isOpen, onClose, onSelect: (id: string) => void, onDataSelect?: (type, id) => void }` |
| **Imports principais** | supabase (busca direta em eventos_admin, comunidades, profiles), lucide-react (20+ icones) |
| **Quem importa** | `DashboardV2Gateway.tsx` |
| **Observacoes** | Overlay com backdrop blur. Auto-focus no input ao abrir. 20 comandos pre-definidos cobrindo Dashboard, Financeiro, Analytics, Inteligencia, Relatorios, Comunidades, Eventos, Notificacoes, MAIS VANTA, Categorias, Cargos, Parcerias, Diagnostico, FAQ. |

### 1.5 SidebarV2.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/components/SidebarV2.tsx` |
| **Linhas** | 246 |
| **O que faz** | Sidebar de navegacao do admin V2. 6 secoes (Visao Geral, Comunidades, Eventos, Financeiro, MAIS VANTA, Plataforma) com filtragem por role. Items com badges dinamicos (pendencias, total pendencias MV). Header com foto/nome do tenant. Largura adaptativa (w-52 desktop, w-48 mobile). Backdrop blur com transparencia. |
| **Props/Interface** | `NavItem` (22 valores union type) + `SidebarItemDef { id, label, icon, roles? }` + `SidebarSectionDef { label, items }` + `Props { active: NavItem, onSelect, onClose, isDesktop, adminRole?, pendenciasCount?, totalPendencias?, tenantNome?, tenantFoto? }` |
| **Imports principais** | lucide-react (24 icones), ContaVantaLegacy (type) |
| **Quem importa** | `DashboardV2Gateway.tsx` |
| **Observacoes** | Filtra secoes/items por role (ex: Plataforma so para masteradm). Export do type NavItem usado pelo Gateway. |

### 1.6 CaixaHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/CaixaHome.tsx` |
| **Linhas** | 111 |
| **O que faz** | Home especializada para o operador de Caixa. Mostra evento ativo (ao vivo ou proximo) da comunidade. Grid de variacoes disponiveis com preco e quantidade restante. Botao principal "Abrir Caixa Completo". Estado vazio quando nao ha evento ativo. |
| **Props/Interface** | `Props { adminNome, comunidadeId?, onNavigate: (v: string) => void }` |
| **Imports principais** | eventosAdminService, fmtBRL, TYPOGRAPHY |
| **Quem importa** | `DashboardV2Home.tsx` |
| **Observacoes** | Detecta evento ao vivo (dataInicio <= now <= dataFim) ou proximo futuro. Filtra lotes ativos e variacoes com estoque. |

### 1.7 GerenteHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/GerenteHome.tsx` |
| **Linhas** | 322 |
| **O que faz** | Cockpit do gerente de comunidade. Mostra: evento ao vivo (badge pulsante com % capacidade), proximo evento (countdown em dias + barra progresso vendas), hero faturamento da casa (total vendidos + total eventos), filtro de periodo + grafico VendasTimelineChart, resumo financeiro (ResumoFinanceiroCard), acoes rapidas (Eventos, Listas, Financeiro, Relatorios, Editar Comunidade). |
| **Props/Interface** | `Props { adminNome, comunidadeId?, onNavigate: (v: string) => void }` |
| **Imports principais** | eventosAdminService, comunidadesService, getResumoFinanceiroComunidade, dashboardAnalyticsService, VendasTimelineChart, PERIODOS, ResumoFinanceiroCard |
| **Quem importa** | `DashboardV2Home.tsx` |
| **Observacoes** | Calcula KPIs (totalVendidos, faturamento, totalEventos). Barra de progresso com cores dinamicas (verde <60%, amarelo 60-90%, vermelho 90%+). Dicas contextuais ("Compartilhe o link" quando <30%, "Quase lotando" quando >=90%). |

### 1.8 PanoramaHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/PanoramaHome.tsx` |
| **Linhas** | 479 |
| **O que faz** | Caixa de entrada inteligente / hub de contextos. Consolida pendencias de todos os tenants do usuario. Divide em 3 secoes: "Precisa de Voce" (pendencias urgentes), "Visao Global" (so master, botao dourado), "Seus Negocios" (cards de comunidades onde e gerente/socio com KPIs inline: faturamento, eventos, vendidos, proximo evento), "Operacao Hoje" (cards de cargos operacionais: promoter/portaria/caixa). Toque num card entra no contexto com sidebar filtrada pelo cargo. |
| **Props/Interface** | `AdminAccessComunidade { id, nome, foto, cargo, direto }` + `AdminAccessEvento { id, nome, foto, comunidade_id, cargo }` + `ContextoCard { id, tipo, tenantId, nome, foto?, cargo, cargoLabel, faturamento, totalEventos, totalVendidos, temPendencia, proximoEvento?, proximoEventoData?, splitPct? }` + `OperacaoCard { id, tipo: 'PROMOTER' \| 'PORTARIA' \| 'CAIXA', tenantId, comunidadeId, nome, cargo, cargoLabel, detalhe }` + `Props { adminNome, currentUserId, isMaster, comunidades, eventos, onEnterContext: (tenantId, tenantTipo, cargo) => void }` |
| **Imports principais** | eventosAdminService, getPendencias/PendenciaItem, CARGO_TO_PORTAL, fmtBRL, TYPOGRAPHY |
| **Quem importa** | `DashboardV2Gateway.tsx` |
| **Observacoes** | Mapeamento CARGO_LABEL e CARGO_COR para 8 cargos. Countdown dias ate proximo evento com destaque quando <=3 dias. Split % do socio inline nos cards. |

### 1.9 PortariaHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/PortariaHome.tsx` |
| **Linhas** | 78 |
| **O que faz** | Home minimalista para operador de portaria. Botao gigante central (aspect-square) que abre scanner QR ou check-in lista conforme o role. Acao secundaria inversa (se QR primary, lista como secondary e vice-versa). Zero distracao, foco na acao. |
| **Props/Interface** | `Props { adminNome, adminRole: ContaVantaLegacy, onNavigate: (v: string) => void }` |
| **Imports principais** | QrCode, ListChecks, Users, Search (lucide), TYPOGRAPHY, ContaVantaLegacy |
| **Quem importa** | `DashboardV2Home.tsx` |
| **Observacoes** | Detecta tipo de portaria pelo role: QR (ger_portaria_antecipado/portaria_antecipado) vs Lista (ger_portaria_lista/portaria_lista). |

### 1.10 PromoterHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/PromoterHome.tsx` |
| **Linhas** | 148 |
| **O que faz** | Home do promoter mostrando suas cotas de lista. Carrega listas via listasService, calcula resumo por cota (listaNome, tipo, total, usados). Barras de progresso com cores dinamicas (azul <60%, amarelo 60-90%, vermelho 90%+). Card de resultados (confirmados). Estado vazio quando nenhuma cota atribuida. |
| **Props/Interface** | `CotaResumo { listaId, listaNome, tipo, total, usados }` + `Props { adminNome, currentUserId, comunidadeId?, onNavigate: (v: string) => void }` |
| **Imports principais** | listasService, TYPOGRAPHY |
| **Quem importa** | `DashboardV2Home.tsx` |
| **Observacoes** | Botao "Adicionar nome" em cada cota navega para LISTAS. |

### 1.11 SocioHome.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/dashboard-v2/homes/SocioHome.tsx` |
| **Linhas** | 210 |
| **O que faz** | Home do socio com foco no split financeiro. Hero mostra "Seu split (40%)" em destaque com faturamento total abaixo. KPIs: vendidos, ticket medio, eventos. Grafico VendasTimelineChart com filtro de periodo. Acoes: Meu Evento, Listas, Financeiro, Condicoes Comerciais. |
| **Props/Interface** | `Props { adminNome, comunidadeId?, onNavigate: (v: string) => void }` |
| **Imports principais** | eventosAdminService, getResumoFinanceiroComunidade, dashboardAnalyticsService, KpiCard, VendasTimelineChart, PERIODOS |
| **Quem importa** | `DashboardV2Home.tsx` |
| **Observacoes** | TODO no codigo: "pegar split real do socio via socios_evento" (hardcoded 40%). |

---

## Parte 2: features/tickets/

### 2.1 MyTicketsView.tsx

| Item | Detalhe |
|------|---------|
| **Caminho** | `/Users/vanta/prevanta/features/tickets/views/MyTicketsView.tsx` |
| **Linhas** | 445 |
| **O que faz** | Carteira digital de ingressos do usuario. Busca tickets via `vantaService.getMyTickets(userId)` (Supabase: tickets_caixa WHERE owner_id = userId JOIN eventos_admin). Divide em Disponiveis (borda verde) e Utilizados (borda zinc, opacidade reduzida). Modal QR anti-print com: nonce rotativo a cada 30s, relogio ao vivo (1s interval), shimmer dourado, selo "Utilizado" diagonal. Modal de titular (Nome + CPF) obrigatorio antes de abrir QR para ingressos sem titular. Formatador de CPF com mascara. |
| **Props/Interface** | View: `{ userId: string, onBack: () => void }`. QRModal interno: `{ ticket: MyTicket, onClose }`. TitularModalMyTickets interno: `{ ticket: MyTicket, onSave: (nome, cpf) => Promise<void>, onClose }`. |
| **Imports principais** | vantaService (getMyTickets, updateTicketTitular), MyTicket (type de IVantaService), EmptyState, TicketCardSkeleton, TYPOGRAPHY, fmtBRL |
| **Quem importa** | `App.tsx` |
| **Observacoes** | 3 componentes internos: TitularModalMyTickets, QRModal, MyTicketsView (principal). Anti-fraude: nonce hex rotativo + timestamp vivo no QR. Validacao CPF: 11 digitos obrigatorios. Botao refresh para recarregar tickets. SafeArea no modal titular (paddingBottom com env safe-area-inset-bottom). |

---

## Parte 3: supabase/schema.sql

**Caminho:** `/Users/vanta/prevanta/supabase/schema.sql`
**Linhas:** 1120
**Versao:** v7 (v5 base + v6 financeiro multi-tenant + v7 seguranca JWT/selfie)

### Extensoes
- `pgcrypto` (gen_random_uuid, HMAC)
- `pg_trgm` (busca por trigrama)

### ENUM Types
| Tipo | Valores |
|------|---------|
| `conta_vanta` | vanta_guest, vanta_member, vanta_masteradm, vanta_gerente, vanta_socio, vanta_ger_portaria_lista, vanta_portaria_lista, vanta_ger_portaria_antecipado, vanta_portaria_antecipado, vanta_caixa, vanta_promoter |
| `membro_status` | PENDENTE, APROVADO, REJEITADO |
| `tipo_cargo` | GERENTE, SOCIO, PROMOTER, PORTARIA_LISTA, PORTARIA_ANTECIPADO, GER_PORTARIA_LISTA, GER_PORTARIA_ANTECIPADO, CAIXA |
| `papel_equipe` | SOCIO, PROMOTER, GERENTE, PORTARIA_LISTA, PORTARIA_ANTECIPADO, GER_PORTARIA_LISTA, GER_PORTARIA_ANTECIPADO, CAIXA |
| `area_ingresso` | VIP, PISTA, CAMAROTE, BACKSTAGE, OUTRO |
| `genero_ingresso` | MASCULINO, FEMININO, UNISEX |
| `ticket_status` | DISPONIVEL, USADO, CANCELADO |
| `transaction_status` | PENDENTE, CONCLUIDO, ESTORNADO |
| `transaction_tipo` | VENDA_CAIXA, VENDA_CHECKOUT, CORTESIA |
| `saque_status` | PENDENTE, CONCLUIDO, ESTORNADO |
| `pix_tipo` | CPF, CNPJ, EMAIL, TELEFONE, CHAVE_ALEATORIA |

### Tabelas do Schema Base (19 tabelas)

#### profiles (gerenciada pelo Supabase Auth)
| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | UUID | PK (de auth.users) |
| email | TEXT | |
| full_name | TEXT | NOT NULL DEFAULT '' |
| foto | TEXT | |
| instagram | TEXT | |
| city, state | TEXT | |
| birth_date | DATE | |
| role | TEXT | NOT NULL DEFAULT 'vanta_guest' |
| status | TEXT | NOT NULL DEFAULT 'PENDENTE' |
| biometria_url | TEXT | |
| biometria_captured | BOOLEAN | DEFAULT false |
| prestigio_id | UUID | FK niveis_prestigio |
| tags_curadoria | TEXT[] | DEFAULT '{}' |
| curadoria_concluida | BOOLEAN | DEFAULT false |
| notas_admin | TEXT | |
| updated_at | TIMESTAMPTZ | |

**RLS:** leitura publica, update proprio + masteradm, insert via trigger.
**Trigger:** `handle_new_user()` cria profile no signup.

#### niveis_prestigio
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| nome | TEXT NOT NULL |
| cor | TEXT DEFAULT '#FFD300' |
| icone | TEXT |
| created_at | TIMESTAMPTZ |

**RLS:** somente masteradm (ALL).

#### comunidades
| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | UUID PK | |
| nome | TEXT | NOT NULL |
| descricao, cidade | TEXT | NOT NULL DEFAULT '' |
| estado, endereco, foto, foto_capa | TEXT | |
| coords | JSONB | |
| capacidade_max | INTEGER | |
| ativa | BOOLEAN | DEFAULT true |
| cargos_customizados | JSONB | DEFAULT '[]' |
| vanta_fee_percent | NUMERIC(5,4) | |
| vanta_fee_fixed | NUMERIC(10,2) | DEFAULT 0 |
| gateway_fee_mode | TEXT | DEFAULT 'ABSORVER' CHECK IN ('ABSORVER','REPASSAR') |
| created_by | UUID FK profiles | |
| created_at, updated_at | TIMESTAMPTZ | |

**RLS:** leitura autenticada (ativa=true), masteradm escreve, produtor le/atualiza suas.

#### cargos
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| membro_id | UUID FK profiles NOT NULL |
| comunidade_id | UUID FK comunidades NOT NULL |
| tipo | TEXT NOT NULL |
| atribuido_por | UUID FK profiles |
| atribuido_em | TIMESTAMPTZ |

#### atribuicoes_rbac
| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | UUID PK | |
| user_id | UUID FK profiles NOT NULL | |
| tenant_type | TEXT NOT NULL | CHECK IN ('COMUNIDADE','EVENTO') |
| tenant_id | UUID NOT NULL | |
| cargo | TEXT NOT NULL | |
| permissoes | TEXT[] | DEFAULT '{}' |
| atribuido_por | UUID FK profiles | |
| atribuido_em | TIMESTAMPTZ | |
| ativo | BOOLEAN | DEFAULT true |
| updated_at | TIMESTAMPTZ | |
| | | UNIQUE (user_id, tenant_type, tenant_id, cargo) |

#### eventos_admin
| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | UUID PK | |
| comunidade_id | UUID FK comunidades | |
| nome | TEXT NOT NULL | |
| descricao | TEXT DEFAULT '' | |
| data_inicio | TIMESTAMPTZ NOT NULL | |
| data_fim | TIMESTAMPTZ | |
| local | TEXT DEFAULT '' | |
| endereco, cidade, foto | TEXT | |
| coords | JSONB | |
| publicado | BOOLEAN DEFAULT false | |
| caixa_ativo | BOOLEAN DEFAULT false | |
| vanta_fee_percent | NUMERIC(5,4) | |
| vanta_fee_fixed | NUMERIC(10,2) DEFAULT 0 | |
| gateway_fee_mode | TEXT DEFAULT 'ABSORVER' | CHECK IN ('ABSORVER','REPASSAR') |
| created_by | UUID FK profiles | |
| created_at, updated_at | TIMESTAMPTZ | |

**RLS:** leitura publicados, equipe le seus, produtor da comunidade le, masteradm escreve, produtor atualiza seus.

#### equipe_evento
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| membro_id | UUID FK profiles NOT NULL |
| papel | TEXT NOT NULL |
| liberar_lista | BOOLEAN DEFAULT false |
| created_at | TIMESTAMPTZ |
| UNIQUE(evento_id, membro_id, papel) |

#### lotes
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| nome | TEXT NOT NULL |
| data_validade | TIMESTAMPTZ |
| ativo | BOOLEAN DEFAULT true |
| ordem | INTEGER DEFAULT 0 |
| created_at | TIMESTAMPTZ |

#### variacoes_ingresso
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| lote_id | UUID FK lotes NOT NULL |
| area | TEXT DEFAULT 'PISTA' |
| area_custom | TEXT |
| genero | TEXT DEFAULT 'UNISEX' |
| valor | NUMERIC(10,2) DEFAULT 0 |
| limite | INTEGER DEFAULT 100 |
| vendidos | INTEGER DEFAULT 0 CHECK >=0 |
| created_at | TIMESTAMPTZ |

#### tickets_caixa
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| lote_id | UUID FK lotes |
| variacao_id | UUID FK variacoes_ingresso |
| email | TEXT NOT NULL |
| owner_id | UUID FK profiles |
| valor | NUMERIC(10,2) DEFAULT 0 |
| status | TEXT DEFAULT 'DISPONIVEL' |
| usado_em | TIMESTAMPTZ |
| usado_por | UUID FK profiles |
| criado_por | UUID FK profiles |
| criado_em | TIMESTAMPTZ |
| nome_titular | TEXT DEFAULT '' |
| cpf | TEXT DEFAULT '' |
| selfie_url | TEXT |

#### transactions
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| ticket_id | UUID FK tickets_caixa |
| comprador_id | UUID FK profiles |
| email | TEXT NOT NULL |
| valor_bruto | NUMERIC(10,2) NOT NULL |
| valor_liquido | NUMERIC(10,2) NOT NULL |
| taxa_aplicada | NUMERIC(5,4) DEFAULT 0.05 |
| status | TEXT DEFAULT 'PENDENTE' |
| tipo | TEXT DEFAULT 'VENDA_CHECKOUT' |
| created_at | TIMESTAMPTZ |

#### solicitacoes_saque
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| produtor_id | UUID FK profiles NOT NULL |
| evento_id | UUID FK eventos_admin NOT NULL |
| valor, valor_liquido, valor_taxa | NUMERIC(10,2) NOT NULL |
| pix_tipo | TEXT DEFAULT 'CPF' |
| pix_chave | TEXT NOT NULL |
| status | TEXT DEFAULT 'PENDENTE' |
| solicitado_em | TIMESTAMPTZ |
| processado_em | TIMESTAMPTZ |
| processado_por | UUID FK profiles |

#### listas_evento
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| teto_global_total | INTEGER DEFAULT 0 |
| created_at | TIMESTAMPTZ |

#### regras_lista
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| lista_id | UUID FK listas_evento NOT NULL |
| label | TEXT NOT NULL |
| teto_global | INTEGER DEFAULT 0 |
| saldo_banco | INTEGER DEFAULT 0 |
| cor | TEXT |
| valor | NUMERIC(10,2) |
| created_at | TIMESTAMPTZ |

#### cotas_promoter
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| lista_id | UUID FK listas_evento NOT NULL |
| regra_id | UUID FK regras_lista NOT NULL |
| promoter_id | UUID FK profiles NOT NULL |
| alocado | INTEGER DEFAULT 0 CHECK >=0 |
| usado | INTEGER DEFAULT 0 CHECK >=0 |
| created_at | TIMESTAMPTZ |
| UNIQUE(lista_id, regra_id, promoter_id) |

#### convidados_lista
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| lista_id | UUID FK listas_evento NOT NULL |
| regra_id | UUID FK regras_lista NOT NULL |
| nome | TEXT NOT NULL |
| telefone | TEXT |
| inserido_por | UUID FK profiles |
| checked_in | BOOLEAN DEFAULT false |
| checked_in_em | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |

**Indice GIN** em `nome` para busca por trigrama (portaria).

#### audit_logs
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| user_id | UUID FK profiles |
| action | TEXT NOT NULL |
| entity_type | TEXT NOT NULL |
| entity_id | TEXT |
| old_value, new_value | JSONB |
| created_at | TIMESTAMPTZ |

#### vendas_log
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| variacao_id | UUID FK variacoes_ingresso |
| variacao_label | TEXT NOT NULL |
| valor | NUMERIC(10,2) NOT NULL |
| ts | TIMESTAMPTZ |
| produtor_id | UUID FK profiles |

#### soberania_acesso (dropada na migration 20260313001600)
| Coluna | Tipo |
|--------|------|
| id | UUID PK |
| evento_id | UUID FK eventos_admin NOT NULL |
| solicitante_id | UUID FK profiles NOT NULL |
| status | TEXT CHECK IN ('PENDENTE','AUTORIZADO','NEGADO') |
| solicitado_em, decidido_em | TIMESTAMPTZ |

### RPCs no Schema Base
1. **queimar_ingresso(p_ticket_id, p_event_id, p_operador_id)** -- Valida e marca ingresso como USADO
2. **processar_compra_checkout(p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, p_quantidade, p_comprador_id, p_taxa)** -- Cria tickets + transactions + vendas_log
3. **processar_venda_caixa(p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, p_taxa)** -- Venda na porta pelo operador CAIXA

### Helper Functions
- `set_updated_at()` -- trigger generico updated_at
- `is_masteradm()` -- verifica role vanta_masteradm
- `is_produtor_evento(p_evento_id)` -- verifica SOCIO/PROMOTER no evento
- `handle_new_user()` -- cria profile no signup

### Realtime
Publicacao em: tickets_caixa, transactions, solicitacoes_saque, profiles, vendas_log, convidados_lista, niveis_prestigio.

---

## Parte 4: Migrations (223 arquivos, cronologicas)

### 2026-02-25 (4 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 1 | `20260225231614_criar_evento_fluxos` | Adiciona 6 colunas em eventos_admin: tipo_fluxo, status_evento, socio_convidado_id, split_produtor, split_socio, motivo_negociacao |
| 2 | `20260225235000_fix_motivo_rejeicao_insert_policy` | Adiciona coluna motivo_rejeicao em eventos_admin + policy INSERT para produtor |
| 3 | `20260225240000_friendships` | Cria tabela friendships (amizades entre membros: PENDING/ACCEPTED) + RLS |
| 4 | `20260225240500_friendships_unique_pair` | Indice unico simetrico em friendships (impede pedido duplo A->B e B->A) |

### 2026-02-26 (6 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 5 | `20260226010000_categorias_evento` | Cria tabela categorias_evento + seed 15 categorias padrao |
| 6 | `20260226020000_rodada_negociacao` | Adiciona coluna rodada_negociacao (max 3) em eventos_admin |
| 7 | `20260226030000_pix_profiles` | Adiciona pix_tipo e pix_chave em profiles |
| 8 | `20260226040000_cortesias_pendentes` | Cria tabela cortesias_pendentes (aceite/recusa pelo destinatario) + RLS |
| 9 | `20260226050000_community_follows` | Cria tabela community_follows (seguir comunidades) + RLS |
| 10 | `20260226060000_admin_v2_columns` | Adiciona colunas V2 (scope, etc.) em atribuicoes_rbac |
| 11 | `20260226070000_origem_ingresso` | Adiciona coluna origem (ANTECIPADO/PORTA/LISTA/CORTESIA) em tickets_caixa e vendas_log |
| 12 | `20260226100000_atribuicoes_rbac_rls` | RLS em atribuicoes_rbac (leitura autenticada, escrita admin) |

### 2026-02-27 (12 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 13 | `20260227010000_comunidade_dono_id` | Adiciona dono_id em comunidades (transferencia titularidade) |
| 14 | `20260227020000_reviews_evento` | Cria tabela reviews_evento (avaliacoes pos-evento) + RLS |
| 15 | `20260227030000_push_subscriptions` | Cria tabela push_subscriptions (tokens FCM) + RLS |
| 16 | `20260227040000_mesas` | Cria tabela mesas (camarotes de eventos) + RLS |
| 17 | `20260227040001_profiles_role_constraint` | Fix constraint profiles.role com todos os valores |
| 18 | `20260227050000_categorias_subcategorias` | Adiciona parent_id em categorias_evento + subcategorias em eventos_admin |
| 19 | `20260227060000_evento_favoritos` | Cria tabela evento_favoritos (salvar eventos) + RLS |
| 20 | `20260227070000_waitlist` | Cria tabela waitlist (lista de espera quando esgota) + RLS |
| 21 | `20260227080000_cupons` | Cria tabela cupons (codigos promocionais: PERCENTUAL/FIXO) |
| 22 | `20260227080001_virar_lote_pct` | Adiciona virar_pct em lotes (virada automatica por % vendido) + RPC verificar_virada_lote |
| 23 | `20260227090000_transferencias_ingresso` | Cria tabela transferencias_ingresso (PENDENTE/ACEITO/RECUSADO) + RLS |
| 24 | `20260227100000_edicao_pendente` | Adiciona edicao_pendente (JSONB), edicao_status, edicao_motivo em eventos_admin |
| 25 | `20260227100100_equipe_permissoes` | Adiciona permissoes[] em equipe_evento |
| 26 | `20260227100200_profiles_role_constraint_v2` | Recria constraint profiles.role com todos os roles validos |

### 2026-02-28 (16 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 27 | `20260228100000_clube_mais_vanta` | Cria 4 tabelas MAIS VANTA: membros_clube, lotes_mais_vanta, reservas_mais_vanta, solicitacoes_clube |
| 28 | `20260228110000_mv2_assinaturas` | Cria tabela assinaturas_mais_vanta (SaaS para venues) |
| 29 | `20260228120000_mv3_meta_api` | Adiciona meta_user_id em membros_clube (Instagram Graph API futura) |
| 30 | `20260228130000_mv4_passport` | Cria tabela passport_aprovacoes (passaporte global por cidade/comunidade) |
| 31 | `20260228140000_castigo_noshow` | Adiciona castigo_ate e castigo_motivo em membros_clube |
| 32 | `20260228150000_clube_config` | Cria tabela clube_config (configuracao editavel MAIS VANTA por comunidade) |
| 33 | `20260228160000_clube_config_beneficios_array` | Migra beneficios de TEXT para TEXT[] em clube_config |
| 34 | `20260228170000_seed_subcategorias` | Seed de subcategorias padrao (Festa, Show, etc.) |
| 35 | `20260228180000_cortesias_limites_por_tipo` | Adiciona limites_por_tipo (JSONB) em cortesias_config |
| 36 | `20260228190000_rls_security_hardening` | Substitui policies permissivas por restritivas em 11 tabelas MV |
| 37 | `20260228200000_planos_dinamicos` | Cria tabela planos_mais_vanta (planos dinamicos) |
| 38 | `20260228210000_infracoes_progressivas` | Cria tabela infracoes_mais_vanta + bloqueio progressivo em membros_clube |
| 39 | `20260228220000_lotes_por_tier` | Lotes MV por tier (1 lote por tier por evento) + acompanhantes, tipo_acesso |
| 40 | `20260228230000_notifications_rls_fix` | Fix RLS notifications (INSERT masteradm) |
| 41 | `20260228235000_notifications_rls_reset` | Reset completo policies notifications |
| 42 | `20260228235500_notifications_rls_force` | Force reset RLS notifications (abordagem direta) |
| 43 | `20260228235900_debug_policies` | Debug: desabilitar/reabilitar RLS notifications |

### 2026-03-01 (18 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 44 | `20260301000000_list_and_nuke_rls` | Nuclear: desabilitar RLS notifications |
| 45 | `20260301000100_notifications_rls_final` | Reabilitar RLS notifications com policies corretas |
| 46 | `20260301000200_notifications_rls_permissive` | Abordagem permissiva para policies notifications |
| 47 | `20260301000300_notifications_drop_fk` | Dropar FK notifications.user_id -> profiles.id (RLS bloqueava FK check) |
| 48 | `20260301000400_list_all_policies` | Listar e dropar todas policies notifications |
| 49 | `20260301001000_push_subscriptions_fix` | Dropar FK push_subscriptions -> profiles (mesmo problema) |
| 50 | `20260301002000_drop_all_profiles_fk` | Dropar TODAS as FK que referenciam profiles(id) |
| 51 | `20260301003000_push_subscriptions_upsert_policy` | Adicionar policy UPDATE para push_subscriptions (upsert) |
| 52 | `20260301010000_formatos_estilos_experiencias` | Cria 3 tabelas: formatos, estilos, experiencias (substitui categorias) |
| 53 | `20260301100000_reembolsos_table` | Cria tabela reembolsos (PENDENTE_APROVACAO/APROVADO/REJEITADO) |
| 54 | `20260301110000_notificacoes_clube_fields` | Adiciona campos notificacao pos-evento em reservas_mais_vanta |
| 55 | `20260301120000_fix_rls_clube_seguranca` | Tighten RLS policies tabelas MAIS VANTA |
| 56 | `20260301130000_helper_functions_rls` | Cria helper functions: is_masteradm(), is_membro_clube() |
| 57 | `20260301140000_notificacoes_posevento_table` | Cria tabela notificacoes_posevento (historico notif automaticas MV) |
| 58 | `20260301150000_fix_is_masteradm_function` | Fix is_masteradm() (referenciava tipo inexistente) |
| 59 | `20260301160000_passport_regional_cidade` | Passport regional por cidade (comunidade_id nullable) |
| 60 | `20260301170000_mais_vanta_config` | Cria tabela mais_vanta_config (configuracao global dinamica) |
| 61 | `20260301180000_reembolsos_notificado_em` | Adiciona notificado_em em reembolsos (prova de notificacao) |

### 2026-03-02 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 62 | `20260302000000_comprovante_meia_entrada` | Cria tabela comprovantes_meia (ESTUDANTE/IDOSO/PCD/etc.) + aprovacao master |
| 63 | `20260302010000_comprovante_multiplas_fotos` | Migra foto_url -> fotos (JSONB array: frente/verso/extra) em comprovantes_meia |

### 2026-03-03 (14 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 64 | `20260303000000_messages_table` | Cria tabela messages (DM 1:1) + read_at, deleted_at, reactions |
| 65 | `20260303010000_profiles_last_seen` | Adiciona last_seen em profiles (presenca online/offline) |
| 66 | `20260303020000_instagram_verificacao` | Adiciona campos verificacao Instagram em solicitacoes_clube e membros_clube |
| 67 | `20260303030000_convite_mais_vanta` | Adiciona tier_pre_atribuido em solicitacoes_clube (convite direto master) |
| 68 | `20260303040000_destaque_curadoria` | Adiciona destaque_curadoria em profiles |
| 69 | `20260303050000_relatorios_campos_lista` | Adiciona genero em regras_lista + checked_in_por_nome em convidados_lista |
| 70 | `20260303060000_rbac_definitivo_roles` | Renomear roles: vanta_produtor -> vanta_gerente, split portaria em 4 sub-cargos |
| 71 | `20260303080000_seed_bosque_domingo_azlist` | Seed: evento Bosque Domingo com dados reais AZ List |
| 72 | `20260303080001_seed_bosque_equipe` | Seed: equipe do evento Bosque Domingo |
| 73 | `20260303080002_fix_atribuicoes_cargo_gerente` | Fix cargo PRODUTOR -> GERENTE, PORTARIA -> PORTARIA_LISTA em RBAC |
| 74 | `20260303090000_rename_fee_mode_to_gateway` | Renomeia vanta_fee_mode -> gateway_fee_mode em comunidades e eventos_admin |
| 75 | `20260303100000_evento_slug_promoter` | Adiciona slug em eventos_admin + comissao promoter + pagamentos promoter |
| 76 | `20260303110000_rbac_v2_cleanup` | RBAC V2 cleanup: HOST -> SOCIO, drop colunas V2, recria RLS |
| 77 | `20260303120000_cleanup_dev_accounts` | Remove 18 contas dev/test (mantem apenas conta principal) |
| 78 | `20260303130000_horario_funcionamento` | Adiciona horario_funcionamento (JSONB) e horario_overrides em comunidades |

### 2026-03-04 (7 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 79 | `20260304100000_rpc_get_convite_socio` | RPC get_convite_socio (busca dados convite socio bypass RLS) |
| 80 | `20260304100001_rpc_acoes_convite_socio` | RPCs aceitar/recusar/contra-proposta convite socio (SECURITY DEFINER) |
| 81 | `20260304110000_seed_test_members` | Seed: 8 membros teste @vanta.com |
| 82 | `20260304120000_fix_atribuicoes_rbac_rls_recursion` | Fix recursao infinita em RLS atribuicoes_rbac (42P17) |
| 83 | `20260304130000_fix_test_members` | Remove membros teste criados via INSERT direto (schema incompativel) |
| 84 | `20260304140000_rpc_buscar_membros` | RPC buscar_membros (busca por nome/email bypass RLS) |
| 85 | `20260304150000_mesas_selfies_buckets` | Cria tabela mesas + storage buckets selfies e eventos |
| 86 | `20260304160000_fix_rls_masteradm_produtor` | Fix is_masteradm() com SECURITY DEFINER + cria is_produtor_evento() |

### 2026-03-05 (14 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 87 | `20260305000000_rpc_get_admin_access` | RPC get_admin_access (fonte de verdade para gate admin: role + comunidades + eventos) |
| 88 | `20260305010000_fix_atribuicoes_rbac_unique_constraint` | Fix UNIQUE constraint em atribuicoes_rbac (necessaria para upsert) |
| 89 | `20260305020000_comunidade_cep_storage` | Adiciona CEP em comunidades + bucket storage fotos comunidade |
| 90 | `20260305030000_comunidade_slug` | Adiciona slug em comunidades (URLs amigaveis) |
| 91 | `20260305100000_wallet_pin_hash` | Adiciona wallet_pin_hash em profiles |
| 92 | `20260305200000_rpc_processar_compra_checkout` | RPC processar_compra_checkout (SECURITY DEFINER, bypass RLS) |
| 93 | `20260305300000_onda0_infraestrutura_base` | Onda 0: CNPJ/razao_social/telefone em comunidades, audit_logs nome_ator, etc. |
| 94 | `20260305400000_auto_finalizado_trigger` | Trigger + cron auto-finalizar eventos quando data_fim passou |
| 95 | `20260305500000_analytics_tracking` | Cria tabela analytics_events + pmf_responses (tracking acoes usuario) |
| 96 | `20260305500001_pmf_select_own_policy` | Policy SELECT own em pmf_responses |
| 97 | `20260305600000_gin_index_eventos_search` | Indices GIN pg_trgm em eventos_admin (nome, local, cidade) |
| 98 | `20260305600001_pg_cron_background_jobs` | pg_cron: cleanup tickets expirados + finalizar eventos passados |
| 99 | `20260305700000_push_subscriptions_cleanup` | Adiciona last_used_at em push_subscriptions + trigger update |
| 100 | `20260305800000_rpc_get_eventos_por_regiao` | RPC get_eventos_por_regiao (bounding box + Haversine) |
| 101 | `20260305800001_fix_rpc_eventos_admin` | Fix RPC get_eventos_por_regiao (tabela correta) |
| 102 | `20260305900000_rls_19_tabelas_seguranca` | RLS para 19 tabelas sem protecao + helpers is_vanta_admin() |
| 103 | `20260305900100_fix_colunas_faltantes_cleanup` | Adiciona mesas_ativo, planta_mesas em eventos_admin + excluido em profiles |
| 104 | `20260305900200_rpc_ticket_jwt` | RPCs sign/verify QR codes (pgcrypto HMAC, SECURITY DEFINER) |

### 2026-03-06 (10 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 105 | `20260306100000_add_venda_vanta_column` | Adiciona venda_vanta, link_externo, plataforma_externa, comissao_vanta em eventos_admin |
| 106 | `20260306200000_fix_carteira_rls_security` | Fix RLS breaches em tickets_caixa |
| 107 | `20260306200100_fix_cortesias_update_team` | Policy UPDATE em cortesias_pendentes para equipe |
| 108 | `20260306200200_master_admin_full_access_carteira` | Master admin full access em cortesias_pendentes e transferencias_ingresso |
| 109 | `20260306200300_master_admin_full_access_all_tables` | Master admin policy ALL em todas as tabelas |
| 110 | `20260306200400_fix_profiles_rls_security` | Fix profiles RLS (remover policy aberta) |
| 111 | `20260306200500_fix_all_open_policies` | Fix 21 tabelas com policies abertas (ALL com true) |
| 112 | `20260306210000_socios_evento_multi` | Cria tabela socios_evento (multi-socio por evento) |
| 113 | `20260306210100_rpcs_socios_multi` | Atualiza RPCs convite socio para usar socios_evento |
| 114 | `20260306220000_rejeicao_campos_revisao` | Adiciona rejeicao_campos (JSONB) + rodada_rejeicao + status EM_REVISAO em eventos_admin |

### 2026-03-07 (11 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 115 | `20260307095000_taxas_modelo_completo` | Modelo completo taxas: taxa_processamento, taxa_servico, taxa_antifraude em comunidades/eventos |
| 116 | `20260307100000_solicitacoes_parceria` | Cria tabela solicitacoes_parceria (donos querem entrar no VANTA) |
| 117 | `20260307100001_taxas_modelo_completo` | Duplicata da 115 (idempotente) |
| 118 | `20260307110000_parceria_email_telefone` | Adiciona email_contato e telefone em solicitacoes_parceria |
| 119 | `20260307120000_notif_insert_rpc` | RPC inserir_notificacao (cross-user, SECURITY DEFINER) |
| 120 | `20260307140000_negociacao_turno` | Negociacao socio-produtor: turno alternado, historico JSONB, prazo 48h |
| 121 | `20260307150000_cron_expirar_negociacoes` | Cron job: expirar negociacoes vencidas (a cada hora) |
| 122 | `20260307160000_auto_rbac_socio_aceitar` | Auto-criar RBAC ao aceitar negociacao de socio |
| 123 | `20260307170000_rls_privacidade_eventos` | RLS privacidade entre eventos (socio so ve seus, gerente ve da comunidade) |
| 124 | `20260307180000_fix_rbac_gerente_evento_recusa` | Fix: remove RBAC GERENTE nivel EVENTO + recusa remove RBAC |
| 125 | `20260307190000_fix_rbac_niveis_cargos` | Cargos por nivel: GERENTE=COMUNIDADE, SOCIO/PROMOTER/etc.=EVENTO |
| 126 | `20260307200000_fix_rbac_permissoes_socio` | Corrigir permissoes SOCIO no RBAC (sem VENDER_PORTA/VALIDAR_ENTRADA) |
| 127 | `20260307210000_bucket_parceria_fotos` | Bucket storage para fotos de solicitacoes parceria |
| 128 | `20260307220000_mood_status` | Adiciona mood_emoji, mood_text, mood_expires_at em profiles |
| 129 | `20260307230000_regras_lista_area` | Adiciona area (PISTA/CAMAROTE/etc.) em regras_lista |

### 2026-03-08 (8 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 130 | `20260308000000_eventos_privados` | Feature evento privado/corporativo: config na comunidade + tabela eventos_privados |
| 131 | `20260308010000_comemoracoes` | Feature comemoracoes (aniversario VIP): comemoracoes_config + comemoracoes_faixas + comemoracoes |
| 132 | `20260308020000_comemoracao_ref_tracking_e_cortesias_auto` | RPC processar_compra_checkout com ref_code + cortesias automaticas |
| 133 | `20260308030000_evento_recorrente` | Evento recorrente: campos recorrencia, recorrencia_ate, evento_origem_id + RPC gerar_ocorrencias |
| 134 | `20260308040000_vanta_indica_anon_read` | Leitura publica (anon) de Vanta Indica |
| 135 | `20260308050000_evento_recorrente_v2` | Corrige RPC gerar_ocorrencias + copia lotes/equipe/listas + cancelar serie |
| 136 | `20260308100000_mais_vanta_v2` | MAIS VANTA v2: deals marketplace + curadoria + parceiros + cidades (4 novas tabelas) |
| 137 | `20260308110000_convites_mais_vanta` | Cria tabela convites_mais_vanta (links unicos para convidar membros/parceiros) |
| 138 | `20260308120000_painel_parceiro` | RLS + policies para painel do parceiro MV |
| 139 | `20260308130000_noshow_automatico` | Trigger automatico NO_SHOW em reservas MV quando evento finaliza |
| 140 | `20260308140000_fix_vincular_comemoracao` | Fix vincular_comemoracao_evento (coluna inexistente) |
| 141 | `20260308150000_convidado_forma_pagamento` | Adiciona forma_pagamento em convidados_lista (DINHEIRO/CARTAO/PIX) |

### 2026-03-09 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 142 | `20260309060000_restrict_rls_write_policies` | Restringir policies ALL -> so masteradm em formatos, estilos, experiencias, categorias, clube_config |
| 143 | `20260309200000_pedidos_checkout` | Cria tabela pedidos_checkout (pedidos pendentes pagamento Stripe) |

### 2026-03-10 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 144 | `20260310100000_renomear_tiers_mais_vanta` | Renomear tiers: BRONZE->CONVIDADO, PRATA->PRESENCA, OURO->CREATOR, DIAMANTE->VANTA_BLACK |
| 145 | `20260310200000_mais_vanta_v3_schema` | MAIS VANTA v3: tier DESCONTO, status/nota/tags em membros, nova tabela mais_vanta_lotes_evento |

### 2026-03-11 (17 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 146 | `20260311100000_tiers_lowercase` | Tiers MAIS VANTA -> lowercase (DESCONTO->desconto, etc.) |
| 147 | `20260311110000_resgates_mv_evento` | Cria tabela resgates_mv_evento (substitui reservas_mais_vanta) |
| 148 | `20260311120000_solicitacoes_status_adiado` | Adiciona status ADIADO em solicitacoes_clube |
| 149 | `20260311130000_solicitacoes_indicado_por_texto` | Adiciona indicado_por_texto em solicitacoes_clube |
| 150 | `20260311140000_perfil_progressivo_cpf` | Adiciona CPF em profiles (coleta progressiva, indice unico parcial) |
| 151 | `20260311200000_mais_vanta_v3_fase1` | MV V3 Fase 1: tiers renomeados (desconto->lista, etc.), status simplificados, novas colunas curadoria |
| 152 | `20260311210000_convites_indicacao_config` | Config convites por tier em clube_config |
| 153 | `20260311220000_planos_produtor` | Cria tabela planos_produtor (planos configuraveis pelo admin) |
| 154 | `20260311230000_mv_avaliacao_evento` | Adiciona mv_avaliacao em eventos_admin |
| 155 | `20260311230100_mv_solicitacoes_notificacao` | Cria tabela mv_solicitacoes_notificacao |
| 156 | `20260311230200_mv_convites_especiais` | Cria tabela mv_convites_especiais (convites especiais MV) |
| 157 | `20260311230300_denuncias_bloqueios` | Cria tabelas denuncias e bloqueios entre usuarios |
| 158 | `20260311231000_anonimizar_conta_rpc` | RPC anonimizar_conta (exclusao Apple-compliant LGPD) |
| 159 | `20260311232000_lista_limite_opcional` | Tornar limites de lista opcionais (sem limite = ilimitado) |
| 160 | `20260311233000_splits_config` | Cria tabela splits_config (splits receita por evento/comunidade) |
| 161 | `20260311233100_eventos_custos_fixos` | Adiciona custos_fixos em eventos_admin (break-even projection) |
| 162 | `20260311233200_relatorios_semanais` | Cria tabela relatorios_semanais (historico relatorios) |
| 163 | `20260311233300_utm_source` | Adiciona utm_source em tickets_caixa (atribuicao de canal) |
| 164 | `20260311233400_fidelidade_cliente` | Cria tabela fidelidade_cliente (pontos fidelidade por usuario/comunidade) |
| 165 | `20260311233500_fix_role_master_policies` | Fix role = 'master' -> 'vanta_masteradm' em 3 policies |
| 166 | `20260311233600_fix_aceitar_convite_mv_notifications` | Fix aceitar_convite_mv (tabela notificacoes -> notifications) |
| 167 | `20260311234000_push_templates_agendados` | Cria tabela push_templates (templates reutilizaveis + agendamento) |

### 2026-03-12 (3 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 168 | `20260312000100_fix_finalizar_eventos_expirados` | Fix data_fim TIMESTAMPTZ no cron (erro syntax timestamp) |
| 169 | `20260312000200_fix_noshow_lembrete_resgates_mv` | Fix noshow/lembrete: reservas_mais_vanta -> resgates_mv_evento |
| 170 | `20260312000300_fix_policies_cargos_inexistentes` | Fix 7 policies com cargos 'MASTER'/'DONO' inexistentes -> GERENTE/SOCIO |

### 2026-03-13 (22 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 171 | `20260313000100_cargos_plataforma` | RBAC V2: cria tabelas cargos_plataforma + atribuicoes_plataforma |
| 172 | `20260313000200_rbac_v2_helper_functions` | Functions: has_plataforma_permission, has_comunidade_access, has_comunidade_write_access |
| 173 | `20260313000300_rbac_v2_atribuicoes_rls` | Reescreve RLS atribuicoes_rbac (SELECT autenticado, INSERT/UPDATE master/write) |
| 174 | `20260313000400_rbac_v2_mais_vanta_rls` | Fecha RLS tabelas MAIS VANTA (cidades, parceiros, deals: write so admin) |
| 175 | `20260313000500_rbac_v2_drop_gerente_global` | Remove is_vanta_admin_or_gerente(), substitui em audit_logs |
| 176 | `20260313000600_rbac_v2_comunidades_views` | Views comunidades_publico e comunidades_admin |
| 177 | `20260313000700_rbac_v2_atribuicoes_select_restrito` | Restringir SELECT atribuicoes_rbac (so proprios tenants) |
| 178 | `20260313000800_rbac_v2_simplificar_profiles_role` | profiles.role simplificado para 3 valores: guest, member, masteradm |
| 179 | `20260313000900_fix_aceitar_convite_mv_tier_lista` | Fix fallback CONVIDADO -> lista (CHECK V3) |
| 180 | `20260313001000_simplificar_categorias_evento` | Simplifica categorias: 158 -> 12 limpas |
| 181 | `20260313001100_cleanup_funcoes_duplicadas` | Cleanup: trg_deal_sugerido + migra 70 policies is_vanta_admin() -> is_masteradm() |
| 182 | `20260313001200_cleanup_funcoes_overloads_cron` | Cleanup overloads, funcao quebrada, cron com status invalido |
| 183 | `20260313001300_add_transferido_tickets_caixa_check` | Adiciona TRANSFERIDO e EXPIRADO ao CHECK tickets_caixa.status |
| 184 | `20260313001400_fix_evento_status_publicado_em_revisao` | Fix PUBLICADO -> ATIVO + adiciona EM_REVISAO ao CHECK status_evento |
| 185 | `20260313001500_drop_biometria_columns` | Remove biometria_url/biometria_captured de profiles |
| 186 | `20260313001501_fix_atribuicoes_rbac_recursion_v3` | Fix recursao RLS v3: function user_shares_tenant SECURITY DEFINER |
| 187 | `20260313001502_simplificar_negociacao_socio` | Simplifica negociacao socio (fora do app), auto-aceitar pendentes, drop RPCs negociacao |
| 188 | `20260313001600_drop_soberania_acesso` | Remove tabela soberania_acesso (master tem acesso total) |
| 189 | `20260313001700_padronizar_casing_status` | Padronizar status minusculas -> MAIUSCULAS em 3 tabelas |
| 190 | `20260313001800_reembolso_cadeia_hierarquica` | Reembolso cadeia hierarquica: AGUARDANDO_SOCIO -> GERENTE -> MASTER |
| 191 | `20260313001900_dropar_checks_legados_negociacao` | Dropar CHECKs legados com NEGOCIANDO |
| 192 | `20260313074226_check_solicitacoes_saque` | Adiciona CHECKs status/etapa em solicitacoes_saque |
| 193 | `20260313082329_fix_views_security_definer` | Recria views sem SECURITY DEFINER (Supabase advisor) |
| 194 | `20260313082412_fix_search_path_functions` | Adiciona SET search_path em 9 funcoes vulneraveis |
| 195 | `20260313082435_drop_dead_functions_v2` | Dropa funcoes mortas: reiniciar_negociacao, get_convite_socio, overload antigo checkout |
| 196 | `20260313090000_consolidar_profiles_colunas` | Consolida colunas profiles: full_name->nome, birth_date->data_nascimento, foto->avatar_url |
| 197 | `20260313100000_fix_queimar_ingresso_anonimizar` | Versiona queimar_ingresso + corrige anonimizar_conta |
| 198 | `20260313110000_cron_expirar_pedidos_checkout` | Cron: expirar pedidos_checkout PENDENTE >30min (a cada 5min) |
| 199 | `20260313120000_chat_settings` | Cria tabela chat_settings (arquivar/silenciar conversas) |

### 2026-03-14 (1 migration)
| # | Arquivo | Resumo |
|---|---------|--------|
| 200 | `20260314100000_onboarding_comunidade` | Adiciona onboarding_completo em comunidades |

### 2026-03-15 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 201 | `20260315040000_solicitacao_frequencia` | Adiciona frequencia em solicitacoes_clube (curadoria) |
| 202 | `20260315100000_parceiros_coords` | Adiciona coords (lat/lng) em parceiros_mais_vanta (pins mapa Radar) |

### 2026-03-16 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 203 | `20260316100000_condicoes_comerciais` | Cria tabela condicoes_comerciais (fluxo aceite formal) |
| 204 | `20260316230000_comunidade_redes_sociais` | Adiciona instagram, whatsapp, tiktok, site em comunidades |

### 2026-03-17 (6 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 205 | `20260317100000_platform_config` | Cria tabela platform_config (config editavel master) |
| 206 | `20260317110000_site_content` | Cria tabela site_content (CMS textos editaveis) |
| 207 | `20260317110001_legal_documents` | Cria tabelas legal_documents + user_consents |
| 208 | `20260317200000_comprovante_saque` | Adiciona comprovante_url em solicitacoes_saque + bucket storage |
| 209 | `20260317210000_rpc_exportar_dados_usuario` | RPC exportar_dados_usuario (LGPD portabilidade) |
| 210 | `20260317220000_trigger_profile_social_login` | Trigger handle_new_user para login social (nome de user_metadata) |
| 211 | `20260317230000_fix_avatar_padrao_vanta` | Fix: avatar padrao VANTA (nunca importar foto de provider) |

### 2026-03-19 (8 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 212 | `20260319000100_fix_race_condition_overselling` | Fix race condition overselling (FOR UPDATE na variacao antes de verificar estoque) |
| 213 | `20260319000200_add_status_falha_processamento` | Adiciona FALHA_PROCESSAMENTO em pedidos_checkout |
| 214 | `20260319000300_reembolsos_stripe_refund` | Adiciona stripe_refund_id, processado_em em reembolsos + ON DELETE RESTRICT |
| 215 | `20260319000400_fix_policy_socios_evento` | Fix policy socios_evento (cargos inexistentes -> masteradm + GERENTE) |
| 216 | `20260319000500_recriar_fks_auth_users` | Recriar 44 FKs apontando pra auth.users em vez de profiles (bypass RLS) |
| 217 | `20260319000600_rpcs_criar_comunidade_evento` | RPCs criar_comunidade_completa e criar_evento (extraidas do banco producao) |
| 218 | `20260319000700_buckets_storage_faltantes` | Buckets storage usados no codigo mas sem migration |
| 219 | `20260319000800_fix_transferencias_ingresso_types_fks` | Fix transferencias_ingresso: TEXT -> UUID + FKs para tickets_caixa/eventos_admin |
| 220 | `20260319100000_rpcs_home_sections` | RPCs home: top_vendidos_24h, cidades_com_eventos, parceiros_por_cidade, eventos_por_cidade_paginado |
| 221 | `20260319150000_rpc_filtros_home` | RPCs filtros chips Home: estilos_por_cidade, formatos_por_cidade |

### 2026-03-20 (2 migrations)
| # | Arquivo | Resumo |
|---|---------|--------|
| 222 | `20260320100000_add_home_filters_to_profiles` | Adiciona home_filters (text[]) em profiles (filtro personalizado Home) |
| 223 | `20260320200000_user_behavior` | Cria tabela user_behavior (VIEW/PURCHASE/FAVORITE/DWELL) para IndicaPraVoce |

---

**Totais:**
- **12 arquivos TS/TSX** analisados (4.317 linhas)
- **1 schema.sql** documentado (1.120 linhas, 19 tabelas base + 11 ENUMs + 3 RPCs + 4 helper functions + RLS completo + realtime)
- **223 migrations** catalogadas cronologicamente (2026-02-25 a 2026-03-20)

---


## Capitulo 8

# Inventario Completo: Testes, Scripts e Configuracoes -- Projeto VANTA (prevanta)

---

## 1. TESTES

### 1.1 Testes E2E (Playwright) -- `/Users/vanta/prevanta/tests/e2e/`

| # | Arquivo | O que testa | Test cases | Fixtures/Mocks | Comando | Observacoes |
|---|---------|-------------|------------|----------------|---------|-------------|
| 1 | `acessibilidade.spec.ts` | Acessibilidade basica: tag lang, titulo, alt em imagens, texto em botoes, contraste | 5 `test` | Nenhum | `npx playwright test acessibilidade` | Tolerancia de 15 botoes vazios; nao falha em imagens sem alt, apenas loga |
| 2 | `admin-flow.spec.ts` | Fluxo admin completo: login DevQuickLogin, painel admin, comunidades, criar evento | 5 `test` (serial) | Requer `E2E_ADMIN_EMAIL` env var; helpers: `loginAsAdmin`, `goToAdminPanel`, `clickSidebarItem` | `npx playwright test admin-flow` | Skip automatico sem `E2E_ADMIN_EMAIL`; timeout 120s; fluxo sequencial (`.serial`) |
| 3 | `admin.spec.ts` | Painel admin: visitante nao ve admin, botoes do feed funcionam, secao Vanta Indica | 3 `test` | Nenhum | `npx playwright test admin` | Testa perspectiva de visitante |
| 4 | `auth.spec.ts` | Autenticacao: visitante ve feed, Perfil abre Area Restrita, login com credenciais invalidas | 4 `test` | Nenhum | `npx playwright test auth` | Verifica fluxo completo de visitante ate login |
| 5 | `busca.spec.ts` | Busca: tab abre, digitar texto nao crasha, filtros de categoria clicaveis | 3 `test` | Nenhum; `beforeEach` navega para Buscar | `npx playwright test busca` | Testa input de busca e chips de categoria |
| 6 | `evento-detalhe.spec.ts` | Detalhe do evento: abrir card do feed, landing page com slug inexistente | 2 `test` | Nenhum | `npx playwright test evento-detalhe` | Skip se feed vazio; testa rota `/e/teste-evento-inexistente` |
| 7 | `feed.spec.ts` | Feed/Home: carrega sem branco, saudacao visitante, secoes existem, cards clicaveis, quick actions, sem erros JS criticos | 6 `test` | Nenhum; `beforeEach` carrega `/` | `npx playwright test feed` | Filtra erros firebase/CORS/net |
| 8 | `performance.spec.ts` | Performance: carrega <10s, bundle JS <5MB, nenhum request >15s, nenhuma imagem >2MB | 4 `test` | Nenhum | `npx playwright test performance` | Limites generosos para dev |
| 9 | `pwa.spec.ts` | PWA: manifest.json valido, icones carregam, service worker, apple-touch-icon, meta tags PWA | 5 `test` | Nenhum | `npx playwright test pwa` | Espera SW em dev mode, testa meta tags |
| 10 | `radar.spec.ts` | Radar: tab abre sem crash, mapa ou lista aparece | 2 `test` | Nenhum; `beforeEach` navega para Radar | `npx playwright test radar` | Valida que algum conteudo renderiza |
| 11 | `responsive.spec.ts` | Responsividade: iPhone SE/14 sem scroll horizontal, iPad layout, Desktop centralizado | 4 `test` | Devices: iPhone SE, iPhone 14, iPad gen 7, Desktop 1280x800 | `npx playwright test responsive` | Usa `browser.newContext` com devices |
| 12 | `seguranca.spec.ts` | Seguranca: nao expoe keys no HTML/JS, meta tags seguranca, rotas admin inacessiveis | 4 `test` | Nenhum | `npx playwright test seguranca` | Checa service_role, sk_live_, sk_test_, BEGIN KEY |
| 13 | `erros-globais.spec.ts` | Erros globais: sem erros JS na carga, sem 500, navegacao entre tabs sem 500, sem memory leak (10x tabs), tela minima 360px, iPad, Desktop 1920px | 8 `test` | Devices: iPhone SE, iPad gen 7, Desktop 1920x1080 | `npx playwright test erros-globais` | Teste de estabilidade com multiplos devices |
| 14 | `navigation.spec.ts` | Navegacao: tab bar renderiza 5 tabs, navegar nao causa tela branca, feed mostra secoes, sem console.error | 4 `test` | Nenhum; `beforeEach` carrega `/` + espera `nav` | `npx playwright test navigation` | Tabs: Inicio, Radar, Buscar, Mensagens, Perfil |

**Total E2E: 14 arquivos, 55 test cases**

---

### 1.2 Testes de Integracao (Vitest) -- `/Users/vanta/prevanta/tests/integration/`

| # | Arquivo | O que testa | Test cases | Fixtures/Mocks | Comando | Observacoes |
|---|---------|-------------|------------|----------------|---------|-------------|
| 1 | `supabase-rls.test.ts` | RLS: anon nao le dados sensiveis (profiles, messages, friendships, notifications, tickets_caixa, transactions, reembolsos, solicitacoes_saque, push_subscriptions, audit_logs, atribuicoes_rbac); anon le dados publicos (eventos, comunidades, categorias, estilos); anon nao pode inserir/update/delete | 16 `it` | `supabaseTestClient.ts` (anon key) | `npm run test:integration` | Roda contra banco REAL sem mocks |
| 2 | `supabase-rpcs.test.ts` | RPCs existem e respondem: get_eventos_por_regiao, buscar_eventos_texto, get_saldo_consolidado, get_analytics_overview; retorna array | 5 `it` | `supabaseTestClient.ts` | `npm run test:integration` | Verifica que funcao existe (nao 42883) |
| 3 | `supabase-schema.test.ts` | Schema: 52 tabelas obrigatorias existem; colunas criticas de profiles, eventos_admin, tickets_caixa, lotes, variacoes, listas, RBAC, financeiro, social, notificacoes, MAIS VANTA | 17 `it` | `supabaseTestClient.ts` | `npm run test:integration` | Lista completa de tabelas e colunas |
| 4 | `supabaseTestClient.ts` | Utilitario: cria cliente Supabase com anon key de `.env.local` | N/A (helper) | `dotenv`, `@supabase/supabase-js` | N/A | Le `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` |

**Total Integracao: 3 arquivos de teste, 38 test cases + 1 helper**

---

### 1.3 Testes Unitarios (Vitest) -- `/Users/vanta/prevanta/tests/unit/`

| # | Arquivo | O que testa | Test cases | Fixtures/Mocks | Comando | Observacoes |
|---|---------|-------------|------------|----------------|---------|-------------|
| 1 | `cache.test.ts` | Cache service: getCached, invalidateCache, invalidateCacheByPrefix, clearAllCache, deduplicacao inflight, stale-while-revalidate | 7 `it` | `vi.fn()` mocks | `npm run test:unit` | Testa TTL, prefixos, limpeza |
| 2 | `circuitBreaker.test.ts` | Circuit breaker: sucesso retorna resultado, falha retorna fallback, abre apos N falhas, OPEN retorna fallback sem chamar fn, HALF_OPEN reseta, resetCircuit | 6 `it` | Nenhum (logica pura) | `npm run test:unit` | Testa estados CLOSED/OPEN/HALF_OPEN |
| 3 | `formatCep.test.ts` | Formatacao CEP: hifen, parcial, remove nao-numericos, limita 8 digitos, vazio, letras, 6 digitos | 7 `it` | Nenhum | `npm run test:unit` | Funcao pura |
| 4 | `rateLimiter.test.ts` | Rate limiter (token bucket): permite dentro do limite, bloqueia quando esgota, buckets independentes, recarrega com tempo, reset, resetAll | 6 `it` | Nenhum | `npm run test:unit` | Testa refillRate |
| 5 | `rbac.test.ts` | RBAC mappings estaticos: labels, portal roles, permissoes por cargo (GERENTE, SOCIO, PROMOTER, PORTARIA_LISTA, PORTARIA_ANTECIPADO, CAIXA, GER_PORTARIA_*) | 12 `it` | Nenhum (constantes importadas) | `npm run test:unit` | 8 cargos testados |
| 6 | `slug.test.ts` | Geracao de slug: texto simples, acentos, especiais, hifens, espacos multiplos, vazio, numeros, emojis, cedilha/til | 9 `it` | Nenhum | `npm run test:unit` | Funcao pura |
| 7 | `financeiro.test.ts` | Financeiro: isReembolsoAutomaticoElegivel (CDC Art 49), exports de financeiro/reembolso/cupons/transferencia | 11 `it` | Factory `baseTicket()` com overrides | `npm run test:unit` | Verifica status USADO/CANCELADO/REEMBOLSADO/TRANSFERIDO e regra dos 7 dias |
| 8 | `auth.test.ts` | Auth: profileToMembro mapping (campos basicos, nome vazio, remove @instagram, promoção guest->member, defaults seguros), consumeSignInResolved flag | 7 `it` | Objetos de teste inline | `npm run test:unit` | Testa 6 cenarios de mapeamento |
| 9 | `rbac-permissoes.test.ts` | RBAC integridade: todos os cargos tem label/descricao/portal/permissoes, permissoes especificas por cargo, sem duplicatas, prefixo vanta_ | 10 `it` | Nenhum | `npm run test:unit` | Complementa rbac.test.ts com CARGO_DESCRICOES |

**Total Unitario: 9 arquivos, 75 test cases**

---

### 1.4 Testes de Carga (k6) -- `/Users/vanta/prevanta/tests/load/`

| # | Arquivo | O que testa | Cenarios | Comando | Observacoes |
|---|---------|-------------|----------|---------|-------------|
| 1 | `k6-smoke.js` | Smoke test: home, manifest, landing evento, checkout, API Supabase (eventos, comunidades, profiles) | 1 cenario: ramping 1->10->50->100->0 VUs em 70s | `k6 run tests/load/k6-smoke.js` | Thresholds: p95<3s, errors<5%, home<2s |
| 2 | `k6-stress.js` | Stress test: 4 cenarios simultaneos -- 500 compradores, 200 lista, 30 promoters, 10 portaria | 4 cenarios paralelos: comprarIngresso, entrarLista, promoterAddNome, checkinPortaria | `k6 run tests/load/k6-stress.js` | Thresholds: p95<5s, errors<10%; simula RPCs reais |

**Total Carga: 2 arquivos, 4 cenarios de stress**

---

## 2. SCRIPTS

### 2.1 Scripts Node.js (.mjs) -- `/Users/vanta/prevanta/scripts/`

| # | Arquivo | O que faz | Chamado por | Dependencias | Output |
|---|---------|-----------|-------------|--------------|--------|
| 1 | `audit.mjs` | Auditoria automatizada: TSC + ESLint + lint:layout + Build + 10 regras de codigo (UTC timestamp, catch vazio, hooks apos return, select(*), fixed inset-0, console.log, useEffect sem catch, TODO/FIXME, inline px, imports nao usados) | `npm run audit` | fs, child_process | Erros/warnings/info por severidade; exit code 1 se erros |
| 2 | `deep-audit.mjs` | Auditoria profunda: 14 fases (tooling, schema Supabase real via OpenAPI, queries vs schema, imports orfaos, exports nao usados, duplicados, codigo morto, arquivos duplicados, memorias vs arquivos, dependencias circulares, seguranca, acessibilidade, arquivos grandes, mutations sem error handling) | `npm run deep-audit` | fs, child_process, crypto, fetch para OpenAPI | Relatorio completo com erros/warnings/info |
| 3 | `deps.mjs` | Grafo de dependencias de um arquivo: IMPORTS (o que importa) + USED BY (quem importa) | `npm run deps -- <arquivo>` | fs | Lista bidirecional de dependencias |
| 4 | `diff-check.mjs` | Valida apenas arquivos alterados (staged + unstaged): TSC (projeto inteiro) + ESLint (so alterados) + lint:layout (so alterados) + memory-audit (informativo) | `npm run diff-check` | child_process, fs | 5-10x mais rapido que preflight |
| 5 | `explore.mjs` | Mapeia modulo/diretorio: lista arquivos, interfaces, tipos, funcoes exportadas, props, imports internos | `npm run explore -- <path>` | fs | Resumo compacto para contexto Claude |
| 6 | `fix-supabase-catch.mjs` | Adiciona `.catch()` em useEffects com queries Supabase sem tratamento de erro | `node scripts/fix-supabase-catch.mjs [--fix]` (manual) | fs | Dry-run por padrao; --fix aplica |
| 7 | `generate-icons.mjs` | Gera icones em multiplos tamanhos (48, 72, 96, 144, 1024) a partir de icon-512.png usando `sips` (macOS) | `npm run generate-icons` | child_process, fs | PNGs em public/ |
| 8 | `lines.mjs` | Contagem de linhas por modulo/diretorio; modo `top20` mostra maiores arquivos | `npm run lines [-- <path> \| top20]` | fs | Tabela com files/linhas/percentual |
| 9 | `lint-layout.mjs` | Garante padrao de responsividade: bloqueia w-screen, h-screen, fixed inset-0, w-[Npx] grande, min-w-[Npx], etc. Whitelist para App.tsx e standalone | `npm run lint:layout` | fs | Erros/warnings; suprimir com `lint-layout-ok` |
| 10 | `memory-audit.mjs` | Verifica se memorias .md referenciam arquivos que existem no disco | `npm run memory-audit` | fs | Arquivos ausentes, memorias vazias |
| 11 | `memory-audit-deep.mjs` | Validacao profunda: alem de arquivos, verifica funcoes/exports/componentes/interfaces mencionados nas memorias vs codigo real | `npm run memory-audit-deep` | fs, child_process | Divergencias concretas |
| 12 | `preflight.mjs` | Check completo pre-entrega: Prettier format -> TSC -> ESLint -> lint:layout -> Playwright navigation -> Playwright erros-globais -> Vite build -> Knip | `npm run preflight` | child_process | 8 checks sequenciais; exit 1 se falha (Knip nao bloqueia) |
| 13 | `props.mjs` | Extrai props de componentes React: busca por nome ou `all` para listar todos | `npm run props -- <Component>` | fs | Interface de props com tipos |
| 14 | `store-map.mjs` | Mapa de stores Zustand: para cada store, lista consumidores e selectors/acoes usados | `npm run store-map [-- <nome>]` | fs | Consumers por store |

### 2.2 Scripts Shell (.sh) -- `/Users/vanta/prevanta/scripts/`

| # | Arquivo | O que faz | Chamado por | Dependencias externas | Output |
|---|---------|-----------|-------------|----------------------|--------|
| 1 | `security-scan.sh` | Auditoria seguranca: Gitleaks (secrets), npm audit (deps), Trivy (filesystem), grep manual de patterns (sk_live, AKIA, ghp_, etc.) | `npm run security-scan` | gitleaks, trivy (opcionais), python3 | Relatorios em audit-reports/; exit code = numero de erros |
| 2 | `bundle-audit.sh` | Performance & bundle: build size, maiores chunks JS, deps pesadas em node_modules, assets >100KB, imports pesados | `npm run bundle-audit` | npm run build | Relatorios em audit-reports/ |
| 3 | `store-readiness.sh` | Prontidao para App Store/Google Play: Capacitor config, iOS (Info.plist, icones, splash), Android (manifest, icones, build.gradle), PWA (manifest, SW, favicon), env safety, TSConfig strict, CSP | `npm run store-readiness` | Nenhum externo | 7 verificacoes com erros/warnings |
| 4 | `capacitor-bridge-audit.sh` | Audita chamadas nativas sem guard: navigator.geolocation, mediaDevices, share, clipboard sem try/catch; verificacao Capacitor.isNativePlatform; Notification.requestPermission | `npm run bridge-audit` | Nenhum externo | Warnings por chamada desprotegida |
| 5 | `app-privacy-audit.sh` | Cruza Info.plist vs uso real de APIs privadas (Camera, Photos, Location, Microphone, FaceID, Contacts, Bluetooth, Calendar, ATT, Push); verifica qualidade das Usage Descriptions | `npm run privacy-audit` | Nenhum externo | Erros BLOQUEANTES para App Store |
| 6 | `design-audit.sh` | Auditoria visual: cores fora da paleta, cores inline, opacidades, larguras fixas px, breakpoints responsivos, fixed inset-0, textos sem truncate, a11y (img sem alt, botoes sem aria-label, inputs sem label, divs clicaveis sem role, contraste), safe area, tipografia, select nativo | `npm run design-audit` | Nenhum externo | Relatorio em audit-reports/design-audit-report.txt |
| 7 | `vanta-marker.sh` | Sistema de markers verificaveis para hooks: feedbacks_read, memo_ativado, equipe_consultada, lia_approved, memo_approved, preflight_passed, dan_authorized (TTL 30min), schema_checked, agent:\<nome\>, diffcheck_ran | Manual ou por hooks | Nenhum externo | Marker em /tmp/vanta_\<tipo\> com formato `VANTA_MARKER\|<tipo>\|<timestamp>\|<hash>` |

### 2.3 Script Master -- `/Users/vanta/prevanta/full-audit.sh`

| Arquivo | O que faz | Chamado por | Output |
|---------|-----------|-------------|--------|
| `full-audit.sh` | Orquestra TODAS as auditorias em paralelo: (1) Security Scan, (2) Quality (TSC+ESLint+Prettier), (3) Dead Code (knip), (4) Bundle Audit, (5) Store Readiness, (6) Bridge Audit, (7) Privacy Audit, (8) Cap Sync, (9) Design Audit | `npm run full-audit` | Todos os relatorios consolidados em audit-reports/ |

---

## 3. GIT HOOKS -- `/Users/vanta/prevanta/.husky/`

| Arquivo | Quando executa | O que faz |
|---------|---------------|-----------|
| `pre-commit` | Antes de cada commit | 1. lint-staged (Prettier + ESLint fix nos staged files); 2. Gitleaks protect --staged (se instalado); 3. TSC --noEmit com max-old-space-size 4096 |
| `pre-push` | Antes de cada push | Playwright smoke tests: `navigation` + `erros-globais` (projeto Desktop Chrome). Bloqueia push se falhar |
| `_/h` | Orchestrator interno do Husky | Resolve e executa o hook correto; carrega ~/.huskyrc ou init.sh; exporta node_modules/.bin no PATH |

**lint-staged config** (em package.json):
```json
"*.{ts,tsx}": ["prettier --write", "eslint --quiet --fix"]
```

---

## 4. SCRIPTS NPM (package.json)

| Script | Comando real | Descricao |
|--------|-------------|-----------|
| `dev` | `vite` | Dev server na porta 5173 |
| `build` | `vite build` | Build de producao com terser, sourcemaps hidden |
| `test` | `vitest run --config vitest.config.ts` | Roda todos os testes Vitest (unit + integration) |
| `test:unit` | `vitest run ... tests/unit` | Apenas testes unitarios |
| `test:integration` | `vitest run ... tests/integration` | Apenas testes de integracao |
| `test:watch` | `vitest --config vitest.config.ts` | Vitest em modo watch |
| `lint` | `tsc --noEmit` | Type-check TypeScript |
| `lint:eslint` | `eslint src/ modules/ features/ hooks/ services/ --quiet` | ESLint silencioso |
| `lint:layout` | `node scripts/lint-layout.mjs` | Lint de responsividade |
| `lint:all` | `tsc --noEmit && eslint ... && lint-layout` | Todos os lints em sequencia |
| `preflight` | `node scripts/preflight.mjs && touch /tmp/vanta_preflight_passed` | Check completo (8 etapas) + marker |
| `explore` | `node scripts/explore.mjs` | Explorar modulo/diretorio |
| `audit` | `node scripts/audit.mjs` | Auditoria rapida (~5s) |
| `deep-audit` | `node scripts/deep-audit.mjs` | Auditoria profunda (14 fases) |
| `memory-audit` | `node scripts/memory-audit.mjs` | Verificar memorias vs arquivos |
| `memory-audit-deep` | `node scripts/memory-audit-deep.mjs` | Memorias vs codigo (funcoes/exports) |
| `diff-check` | `node scripts/diff-check.mjs` | Validar so arquivos alterados |
| `deps` | `node scripts/deps.mjs` | Grafo de dependencias |
| `store-map` | `node scripts/store-map.mjs` | Mapa de stores Zustand |
| `lines` | `node scripts/lines.mjs` | Contagem de linhas |
| `props` | `node scripts/props.mjs` | Extrair props de componentes |
| `format` | `prettier --write 'src/**/*.{ts,tsx}' ...` | Formatar todos os arquivos |
| `format:check` | `prettier --check ...` | Verificar formatacao |
| `knip` | `knip` | Detectar codigo morto |
| `analyze` | `ANALYZE=true vite build` | Build com visualizador de bundle |
| `lighthouse` | `lighthouse http://localhost:5173 ...` | Relatorio Lighthouse |
| `preview` | `vite preview` | Preview do build |
| `prepare` | `husky` | Instalar hooks do Husky |
| `test:e2e` | `playwright test` | Todos os testes E2E |
| `test:e2e:ui` | `playwright test --ui` | E2E com UI interativa |
| `test:e2e:headed` | `playwright test --headed` | E2E com browser visivel |
| `generate-icons` | `node scripts/generate-icons.mjs` | Gerar icones de varios tamanhos |
| `cap:sync` | `npm run build && npx cap sync` | Build + sync Capacitor |
| `cap:ios` | `npx cap open ios` | Abrir projeto iOS no Xcode |
| `cap:android` | `npx cap open android` | Abrir projeto Android |
| `security-scan` | `bash scripts/security-scan.sh` | Auditoria de seguranca |
| `bundle-audit` | `bash scripts/bundle-audit.sh` | Auditoria de bundle/performance |
| `store-readiness` | `bash scripts/store-readiness.sh` | Prontidao para lojas |
| `bridge-audit` | `bash scripts/capacitor-bridge-audit.sh` | Auditoria de bridge nativo |
| `privacy-audit` | `bash scripts/app-privacy-audit.sh` | Auditoria de privacidade Apple |
| `design-audit` | `bash scripts/design-audit.sh` | Auditoria de design/UI |
| `full-audit` | `bash full-audit.sh` | Auditoria master (tudo em paralelo) |
| `depcheck` | `depcheck --ignores='...' .` | Verificar deps nao utilizadas |
| `type-coverage` | `type-coverage --at-least 80 --strict ...` | Cobertura de tipagem |
| `ncu` | `ncu` | Verificar updates de deps |
| `ncu:minor` | `ncu --target minor` | Updates apenas minor |
| `db:diff` | `npx supabase db diff --use-migra` | Diff de schema do banco |
| `bundle-viz` | `npx vite-bundle-visualizer` | Visualizador de bundle |

---

## 5. CONFIGURACOES

### 5.1 ESLint -- `/Users/vanta/prevanta/eslint.config.js`

- **Formato**: Flat config (ESLint 9 / `typescript-eslint`)
- **Plugins**: `eslint-plugin-react-hooks`
- **Ignores**: dist, node_modules, supabase, PREVANTABACKUP, *.config.*, scripts, audit-reports, android, ios, memory, tests
- **Regras ativas**: `react-hooks/rules-of-hooks` (error), `react-hooks/exhaustive-deps` (warn), `no-console` (warn, allow warn/error/debug), `no-eval` (error), `no-implied-eval` (error), `no-new-func` (error)
- **Regras desligadas**: `@typescript-eslint/no-explicit-any`, `no-unused-vars`, `no-empty`, `prefer-const`, complexity, max-lines, max-depth, max-params

### 5.2 Prettier -- `/Users/vanta/prevanta/.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Prettier Ignore** (`.prettierignore`): dist, node_modules, PREVANTABACKUP, supabase, *.md, package-lock.json

### 5.3 Playwright -- `/Users/vanta/prevanta/playwright.config.ts`

- **testDir**: `./tests/e2e`
- **Parallel**: sim
- **Retries**: 2 em CI, 0 local
- **Timeout**: 30s
- **baseURL**: `http://localhost:5173`
- **Projetos**: Mobile Chrome (Pixel 7), Mobile Safari (iPhone 14), Desktop Chrome
- **WebServer**: `npm run dev` na porta 5173 (reusa existente localmente)
- **Trace/Screenshot/Video**: on-first-retry / only-on-failure / on-first-retry

### 5.4 Vitest -- `/Users/vanta/prevanta/vitest.config.ts`

- **Environment**: node
- **Include**: `tests/unit/**/*.test.{ts,tsx}`, `tests/integration/**/*.test.{ts,tsx}`
- **Exclude**: node_modules, dist, PREVANTABACKUP, tests/e2e
- **Timeout**: 30s
- **Globals**: true
- **Alias**: `@/` -> raiz do projeto

### 5.5 Vite -- `/Users/vanta/prevanta/vite.config.ts`

- **logLevel**: `error` (permanente por regra)
- **Port**: 5173
- **Plugins**: Tailwind CSS v4, React, PWA (VitePWA com Workbox generateSW), Sentry (condicional), Visualizer (condicional com ANALYZE=true)
- **PWA**: registerType autoUpdate, runtime caching para Supabase API (5min StaleWhileRevalidate), Supabase Storage (24h CacheFirst), imgur (7d CacheFirst)
- **Build**: sourcemap hidden, terser minify (drop_console, drop_debugger), manual chunks (vendor-supabase, vendor-sentry, vendor-qr)
- **Proxy**: `/api/supabase-mgmt` -> `https://api.supabase.com`

### 5.6 TypeScript -- `/Users/vanta/prevanta/tsconfig.json`

- **Target**: ES2022
- **Module**: ESNext / bundler resolution
- **JSX**: react-jsx
- **Strict**: NAO habilitado (nao tem `"strict": true`)
- **skipLibCheck**: true
- **noEmit**: true
- **Paths**: `@/*` -> `./*`
- **Exclude**: node_modules, supabase/functions, scripts, api, ios, android, resources, _deprecated

### 5.7 Knip -- `/Users/vanta/prevanta/knip.config.ts`

- **Entry**: `App.tsx`, `api/**/*.ts`
- **Project**: `**/*.{ts,tsx}`
- **Ignore**: `supabase/**`

### 5.8 Capacitor -- `/Users/vanta/prevanta/capacitor.config.ts`

- **appId**: `com.maisvanta.app`
- **appName**: `VANTA`
- **webDir**: `dist`
- **Plugins**: SplashScreen (#050505, fullscreen, immersive), StatusBar (DARK, #050505), PushNotifications (badge, sound, alert)
- **Deep links**: hostname `maisvanta.com`

### 5.9 Gitleaks -- `/Users/vanta/prevanta/.gitleaks.toml`

- **Allowlist paths**: .env.example, .env.local.template, node_modules, dist, .git, supabase/.temp, android/, ios/

---

## 6. RESUMO NUMERICO

| Categoria | Quantidade |
|-----------|-----------|
| Testes E2E (Playwright) | 14 arquivos, 55 test cases |
| Testes Integracao (Vitest) | 3 arquivos + 1 helper, 38 test cases |
| Testes Unitarios (Vitest) | 9 arquivos, 75 test cases |
| Testes Carga (k6) | 2 arquivos, 4 cenarios |
| **Total test cases** | **168** |
| Scripts .mjs | 14 |
| Scripts .sh | 7 (incluindo full-audit.sh na raiz) |
| **Total scripts** | **21** |
| npm scripts | 37 |
| Hooks Git (Husky) | 2 ativos (pre-commit, pre-push) |
| Arquivos de config na raiz | 10 (eslint, prettier, prettierignore, playwright, vitest, vite, tsconfig, knip, capacitor, gitleaks) |

---



---

## Apendice A — Indice de Arquivos (A-Z)

Lista de todos os arquivos `.ts`/`.tsx` mencionados neste livro, em ordem alfabetica, com descricao de 1 linha.

| Arquivo | Descricao |
|---------|-----------|
| `AceitarConviteMVPage.tsx` | Pagina standalone para aceitar convite MAIS VANTA via link |
| `AccordionSection.tsx` | Secao accordion animada com icone, titulo e badge |
| `AdminDashboardHome.tsx` | Tela principal (home) do painel admin contextual por role |
| `AdminSidebar.tsx` | Sidebar de navegacao do painel admin com 43 rotas e secoes colapsaveis |
| `AdminViewHeader.tsx` | Header padronizado para todas as subviews do admin |
| `AdicionarMembroModal.tsx` | Modal busca+adicionar membro a equipe com cargo |
| `AllBeneficiosView.tsx` | View full-screen de todos os beneficios MAIS VANTA por cidade |
| `AllEventsView.tsx` | View full-screen de todos os eventos por cidade com paginacao infinita |
| `AllPartnersView.tsx` | View full-screen de todos os parceiros por cidade |
| `AnalyticsMaisVantaView.tsx` | Dashboard de analytics do programa MAIS VANTA |
| `App.tsx` | Componente raiz — layout master, rotas, inicializacao de stores |
| `AppModals.tsx` | Agregador central de todos os modais globais do app |
| `ArchiveModal.tsx` | Modal de confirmacao para arquivar conversa |
| `AssinaturasMaisVantaView.tsx` | Listagem e gestao de assinaturas MAIS VANTA |
| `AuditLogView.tsx` | Timeline de logs de auditoria com filtros por categoria |
| `AuthModal.tsx` | Modal de cadastro (signup) com perfil progressivo |
| `BarChartCard.tsx` | Card com grafico de barras verticais usando recharts |
| `BatchActionBar.tsx` | Barra flutuante de acoes em lote com itens selecionados |
| `BenchmarkCard.tsx` | Comparacao "Voce vs Mercado" com barras horizontais |
| `BeneficiosMVSection.tsx` | Secao de beneficios MAIS VANTA na Home |
| `BeneficiosMVTab.tsx` | Tab de beneficios MAIS VANTA na busca com resgate |
| `BloqueadosView.tsx` | Lista de usuarios bloqueados com opcao de desbloquear |
| `BottomSheet.tsx` | Componente reutilizavel de bottom sheet com animacao |
| `BreakEvenCard.tsx` | Card de break-even com ProgressRing |
| `BreakdownCard.tsx` | Card de breakdown com barra de progresso multi-colorida |
| `BuyerCommunicationCard.tsx` | Lista de compradores unicos do evento |
| `CaixaHome.tsx` | Home especializada para operador de Caixa |
| `CaixaTab.tsx` | Resumo financeiro da comunidade com drilldown |
| `CapacidadeModal.tsx` | Modal aviso quando capacidade excede limite |
| `CargoModal.tsx` | Modal selecao de cargo para membro da equipe |
| `CargosPlataformaView.tsx` | CRUD de cargos de plataforma com permissoes |
| `CargosUnificadoView.tsx` | Hub com abas Cargos Plataforma e Definir Cargos |
| `CategoriasAdminView.tsx` | CRUD de categorias (Formatos, Estilos, Experiencias, Interesses) |
| `CelebrationScreen.tsx` | Tela fullscreen de celebracao com particulas douradas |
| `ChannelAttributionCard.tsx` | Atribuicao de vendas por canal |
| `ChatListItem.tsx` | Item de lista de chat com avatar, mood e swipe actions |
| `ChatRoomView.tsx` | View completa de sala de chat com reacoes e busca |
| `CheckoutPage.tsx` | Pagina standalone de checkout de ingressos |
| `CheckoutSuccessPage.tsx` | Pagina de retorno apos pagamento Stripe com polling |
| `ChurnRadarCard.tsx` | Radar de cancelamento mostrando clientes em risco |
| `CidadesMaisVantaView.tsx` | CRUD de cidades do programa MAIS VANTA |
| `CityCard.tsx` | Card de cidade com foto destaque e total de eventos |
| `CityFilterModal.tsx` | Modal de filtro por cidade com checkboxes |
| `CitySelector.tsx` | Dropdown de selecao de cidade com busca no Supabase |
| `CityView.tsx` | View de cidade com eventos e parceiros em carroseis |
| `ClubeOptInView.tsx` | View de adesao ao MAIS VANTA (formulario + dashboard membro) |
| `ComandarPalette.tsx` | Command palette (Cmd+K) com busca hibrida |
| `ComemoracaoConfigSubView.tsx` | Configuracao de comemoracoes por evento |
| `ComemoracaoFormView.tsx` | Formulario para solicitar comemoracao numa comunidade |
| `ComparisonCard.tsx` | Card comparativo lado a lado com delta percentual |
| `CompletarPerfilCPF.tsx` | Modal para informar CPF antes de compra |
| `CompletarPerfilSocial.tsx` | Tela pos-login social pedindo data de nascimento + termos |
| `ComprovanteMeiaSection.tsx` | Upload de comprovante de meia-entrada multi-arquivo |
| `ComunidadeDetalheView.tsx` | Detalhe da comunidade com 8 tabs admin |
| `ComunidadePublicView.tsx` | Pagina publica de comunidade com info, eventos e deals |
| `ComunidadesView.tsx` | Lista de comunidades do usuario no admin |
| `CondicoesProducerView.tsx` | Tela do socio/gerente para aceitar condicoes comerciais |
| `ConfigMaisVantaView.tsx` | Configuracao dinamica MAIS VANTA (master only) |
| `ConfigPlataformaView.tsx` | Master edita taxas e parametros globais da plataforma |
| `ConfirmacaoModal.tsx` | Modal de confirmacao antes de atribuir cargo |
| `ConviteEspecialMVView.tsx` | Admin envia convites especiais para membros em eventos |
| `ConvitesMaisVantaView.tsx` | CRUD de convites MAIS VANTA |
| `CopiarModal.tsx` | Modal para copiar dados de evento existente |
| `CriarComunidadeView.tsx` | Wizard de criacao de comunidade em 4 steps |
| `CriarEventoView.tsx` | Wizard completo de criacao de evento em 5 steps |
| `CuponsComunidadeTab.tsx` | CRUD de cupons que valem pra todos eventos da comunidade |
| `CuponsSubView.tsx` | CRUD de cupons do evento |
| `DashboardSkeleton.tsx` | Skeleton de loading para dashboards |
| `DashboardV2Gateway.tsx` | Gateway principal do painel admin V2 com 50+ lazy views |
| `DashboardV2Home.tsx` | Dashboard home principal para Master Admin |
| `DatabaseHealthView.tsx` | Health Check + Broadcast Master |
| `DealsMaisVantaView.tsx` | CRUD de deals MAIS VANTA + gestao de resgates |
| `DescubraCidadesSection.tsx` | Secao "Descubra Cidades" na Home |
| `DevLogPanel.tsx` | Painel flutuante de debug (DEV only) |
| `DevQuickLogin.tsx` | Botao flutuante draggable para trocar contas (DEV only) |
| `DiagnosticoView.tsx` | Hub de diagnostico com 4 abas |
| `DividaSocialMaisVantaView.tsx` | Visao global de divida social MAIS VANTA |
| `DraftBanner.tsx` | Banner de rascunho nao finalizado |
| `DrillBreadcrumb.tsx` | Breadcrumb de navegacao drill-down |
| `DuplicarModal.tsx` | Modal para duplicar evento com nova data |
| `EditarEventoView.tsx` | Edicao de evento existente reutilizando Steps |
| `EditarLotesSubView.tsx` | Edicao inline de lotes e cortesias |
| `EditarListaSubView.tsx` | Edicao inline de listas |
| `EditProfileView.tsx` | Edicao completa de perfil do usuario |
| `EmptyState.tsx` | Empty state reutilizavel com icone e CTA |
| `ErrorBoundary.tsx` | Error boundary global com fallback e Sentry |
| `EventCard.tsx` | Card de evento visual com badges e precos |
| `EventCarousel.tsx` | Carousel horizontal padronizado de EventCards |
| `EventCheckInView.tsx` | Check-in completo por evento (LISTA ou QR) |
| `EventDetailManagement.tsx` | Hub de gestao do evento com 9 tabs |
| `EventDetailView.tsx` | View principal de detalhe do evento |
| `EventFooter.tsx` | Footer do detalhe do evento com preco e botoes |
| `EventHeader.tsx` | Header do detalhe com imagem hero e acoes |
| `EventInfo.tsx` | Bloco de informacoes do evento |
| `EventLandingPage.tsx` | Landing page publica de evento para SEO |
| `EventSocialProof.tsx` | Secao de prova social (amigos confirmados) |
| `EventTicketsCarousel.tsx` | Carousel de ingressos com QR JWT rotativo |
| `EventoCheckInCard.tsx` | Card de evento na lista de selecao de check-in |
| `EventoCaixaView.tsx` | Caixa de venda na porta com QR e selfie |
| `EventoDashboard.tsx` | Dashboard principal do evento com sub-views |
| `EventosGlobaisMaisVantaView.tsx` | Visao global de eventos no contexto MAIS VANTA |
| `EventosPendentesView.tsx` | Fila de aprovacao de eventos pelo master |
| `EventoPrivadoFormView.tsx` | Formulario para solicitar evento privado |
| `ExportButton.tsx` | Botao de exportacao CSV |
| `ExtratoFinanceiro.tsx` | Extrato financeiro com vendas, saques e reembolsos |
| `FaqView.tsx` | FAQ estatico para operadores do app |
| `FeedbackOverlay.tsx` | Overlay fullscreen de feedback check-in |
| `FieldError.tsx` | Componente de erro de campo de formulario |
| `FormWizard.tsx` | Container wizard generico com steps e navegacao |
| `FunnelChart.tsx` | Grafico de funil com barras horizontais |
| `GerenteDashboardView.tsx` | Dashboard principal do gerente de comunidade |
| `GerenteHome.tsx` | Cockpit do gerente com evento ao vivo e KPIs |
| `GestaoComprovantesView.tsx` | Aprovacao/rejeicao de comprovantes de meia-entrada |
| `GestaoUsuariosView.tsx` | Buscar e gerenciar qualquer usuario do app |
| `HeatmapCard.tsx` | Heatmap 7x24 (dias x horas) |
| `Highlights.tsx` | Carousel principal "VANTA Indica" na Home |
| `HistoricoSaques.tsx` | Historico de saques com export CSV |
| `HistoricoView.tsx` | Historico de eventos do usuario com achievements |
| `HomeFilterOverlay.tsx` | Overlay de filtros da secao ProximosEventos |
| `HomeView.tsx` | View principal da Home com todas as secoes |
| `HorarioFuncionamentoEditor.tsx` | Editor de horario de funcionamento semanal |
| `HorarioOverridesEditor.tsx` | Editor de excecoes de horario |
| `HorarioPublicDisplay.tsx` | Exibicao publica de horarios com badge Aberto/Fechado |
| `ImageCropModal.tsx` | Editor de recorte de foto com react-easy-crop |
| `ImageCropperModal.tsx` | Modal de crop de imagem para avatar |
| `ImportarStaffPanel.tsx` | Painel para importar staff de eventos anteriores |
| `IndicaPraVoceSection.tsx` | Secao personalizada "Indica pra voce" na Home |
| `InfracoesGlobaisMaisVantaView.tsx` | Visao global de infracoes MAIS VANTA |
| `InputField.tsx` | Campo de input reutilizavel com label e validacao |
| `InsightsEmptyState.tsx` | Estado vazio para abas de insights |
| `InterestSelector.tsx` | Seletor de interesses do usuario com categorias |
| `InviteFriendsModal.tsx` | Modal para convidar amigos para evento |
| `KpiCards.tsx` | Componentes reutilizaveis de KPI (Card, Pie, Delta) |
| `Layout.tsx` | TabBar (navegacao inferior) e Header (barra superior) |
| `LazySection.tsx` | Wrapper que renderiza children no viewport (IntersectionObserver) |
| `LeaderboardCard.tsx` | Ranking/leaderboard com posicoes e avatares |
| `LegalEditorView.tsx` | Editor de Termos de Uso e Politica de Privacidade |
| `LegalView.tsx` | View fullscreen de textos legais completos |
| `LinksUteisView.tsx` | Lista estatica de links uteis para o admin |
| `LivePulse.tsx` | Indicador animado "Ao Vivo" com ponto pulsante |
| `LocaisParceiroSection.tsx` | Secao "Locais Parceiros" na Home |
| `LoginView.tsx` | Tela de login com email/senha e social login |
| `LotacaoPrevisaoCard.tsx` | Previsao de lotacao por hora |
| `LoyaltyProgramCard.tsx` | Programa de fidelidade com distribuicao por tier |
| `LucroPorComunidade.tsx` | Pie chart de lucro por comunidade |
| `MaisVantaBeneficioModal.tsx` | Modal de detalhes de beneficio MAIS VANTA |
| `MaisVantaHubView.tsx` | Hub centralizado MAIS VANTA com 9 abas |
| `MaisVendidosSection.tsx` | Secao "Mais Vendidos" na Home (top 10 em 24h) |
| `MapController.tsx` | Controlador de zoom e centralizacao do mapa Leaflet |
| `MasterFinanceiroView.tsx` | Gestao financeira global (saques, reembolsos, taxas) |
| `MembrosGlobaisMaisVantaView.tsx` | Gestao global de membros MAIS VANTA |
| `MessageBubble.tsx` | Bolha de mensagem individual com reacoes |
| `MessagesView.tsx` | View principal de mensagens com lista de conversas |
| `MetricGrid.tsx` | Grid layout responsivo para metricas |
| `MeusEventosView.tsx` | Lista de eventos do usuario/comunidade |
| `MinhasPendenciasView.tsx` | View de pendencias do usuario (3 tabs) |
| `MinhasSolicitacoesView.tsx` | Solicitacoes do usuario (privados + comemoracoes) |
| `ModalFechamento.tsx` | Modal de encerramento financeiro do evento |
| `ModalInserirLote.tsx` | Modal para inserir multiplos nomes na lista |
| `ModalReembolsoManual.tsx` | Modal de solicitacao de reembolso manual |
| `ModalSaque.tsx` | Modal de solicitacao de saque com PIX |
| `ModuleErrorBoundary.tsx` | Error boundary granular por modulo com retry |
| `MonitoramentoMaisVantaView.tsx` | Hub de monitoramento global MAIS VANTA |
| `MoodPicker.tsx` | Bottom sheet para selecionar mood (emoji + texto) |
| `MyTicketsView.tsx` | Carteira digital de ingressos com QR anti-print |
| `NewChatModal.tsx` | Modal para iniciar nova conversa com amigo |
| `NoShowCard.tsx` | Analise de no-show com taxa e breakdown |
| `NoShowTrendCard.tsx` | Tendencia de no-show com sparkline |
| `NotFoundView.tsx` | Pagina 404 fullscreen |
| `NotifMVPendentesView.tsx` | Admin resolve solicitacoes de notificacao do produtor |
| `NotificacoesAdminView.tsx` | Sistema completo de push/email do admin |
| `NotificationPanel.tsx` | Painel de notificacoes com filtros e acoes inline |
| `OnboardingChecklist.tsx` | Checklist de onboarding pos-aprovacao |
| `OnboardingView.tsx` | Wizard de onboarding pos-cadastro (3 steps) |
| `OnboardingWelcome.tsx` | Modal fullscreen de boas-vindas |
| `OptimizedImage.tsx` | Componente de imagem com lazy loading e transforms |
| `PainelCargoCustom.tsx` | Painel de configuracao de cargo customizado |
| `PanoramaHome.tsx` | Caixa de entrada inteligente multi-tenant |
| `ParceirosMaisVantaView.tsx` | CRUD de parceiros MAIS VANTA |
| `ParceiroDashboardPage.tsx` | Dashboard para parceiros MAIS VANTA |
| `ParticipantesView.tsx` | Lista de participantes/ingressos de evento |
| `PartnerCard.tsx` | Card de parceiro/comunidade com foto e tipo |
| `PassaportesMaisVantaView.tsx` | Gestao de passaportes MAIS VANTA por cidade |
| `PedidosSubView.tsx` | Gestao de pedidos/ingressos com acoes |
| `PendenciasAppView.tsx` | Checklist de configuracoes pendentes do app |
| `PendenciasHubView.tsx` | Hub de pendencias do usuario com contagem |
| `PeopleResults.tsx` | Lista de resultados de busca de pessoas |
| `PeriodSelector.tsx` | Chips de selecao de periodo (Hoje/Semana/Mes/Ano) |
| `PerfilMembroOverlay.tsx` | Overlay detalhado do perfil de membro MV |
| `PlacesResults.tsx` | Lista de resultados de busca de lugares |
| `PlanosMaisVantaView.tsx` | Gestao de planos e tiers MAIS VANTA |
| `PlanosProdutor.tsx` | CRUD de planos para produtores |
| `PmfSurveyModal.tsx` | Modal de pesquisa Product-Market Fit |
| `PortariaHome.tsx` | Home minimalista para operador de portaria |
| `PortariaScannerView.tsx` | Scanner de portaria para validacao de ingressos |
| `PreEventoView.tsx` | Dashboard pre-evento (vendas, funnel, projecao) |
| `PreferencesView.tsx` | View de preferencias de notificacao |
| `PremiumCalendar.tsx` | Calendario modal customizado para Radar |
| `PresencaConfirmationModal.tsx` | Modal de confirmacao apos confirmar presenca |
| `PresencaList.tsx` | Lista de presencas confirmadas |
| `PriceFilterModal.tsx` | Modal de filtro por preco maximo |
| `PricingSuggestionCard.tsx` | Pricing dinamico com sugestao SUBIR/DESCONTAR/MANTER |
| `ProductAnalyticsView.tsx` | Analytics de produto com graficos Recharts |
| `ProfilePreviewControls.tsx` | Toggle visualizar perfil como Publico/Amigo |
| `ProfileView.tsx` | View principal do perfil do usuario |
| `ProgressRing.tsx` | Anel circular SVG de progresso |
| `PromoterCotasView.tsx` | Tela do promoter para ver/gerenciar cotas |
| `PromoterDashboardView.tsx` | Dashboard do promoter com KPIs |
| `PromoterHome.tsx` | Home do promoter mostrando cotas de lista |
| `ProtectedRoute.tsx` | Wrapper de rota protegida (redireciona guest) |
| `ProximosEventosSection.tsx` | Secao "Proximos Eventos" na Home |
| `PublicProfilePreviewView.tsx` | Preview de perfil publico com social proof |
| `PublicoDrilldown.tsx` | Analise detalhada de publico da comunidade |
| `PurchaseTimeCard.tsx` | Analise de horario de compra com heatmap |
| `PushPermissionBanner.tsx` | Modal pedindo permissao de notificacoes push |
| `QRScanner.tsx` | Scanner QR com camera e verificacao JWT |
| `QlCheckbox.tsx` | Checkbox estilizado reutilizavel |
| `RadarView.tsx` | Mapa interativo (Leaflet) com eventos e parceiros |
| `RaioXEvento.tsx` | Raio-X financeiro de um evento |
| `ReembolsosSection.tsx` | Secao de reembolsos com aprovar/rejeitar |
| `RelatorioComunidadeView.tsx` | Relatorio de comunidade com export Excel |
| `RelatorioEventoView.tsx` | Relatorio de evento com tabs (Geral, Listas, Ingressos) |
| `RelatorioMasterView.tsx` | Relatorio master global com ranking |
| `ReportModal.tsx` | Modal de denuncia com 5 motivos |
| `ResetPasswordView.tsx` | Tela de redefinicao de senha |
| `RestrictedModal.tsx` | Modal para areas restritas (guest crie conta) |
| `ResumoEventoModal.tsx` | Modal com resumo completo de evento |
| `ResumoFinanceiroCard.tsx` | Card de resumo financeiro itemizado |
| `ReviewModal.tsx` | Bottom sheet para avaliar evento (5 estrelas) |
| `SearchHeader.tsx` | Header de busca com tabs e chips de filtros |
| `SearchResults.tsx` | Lista virtualizada de resultados de busca |
| `SearchView.tsx` | View principal de busca com 4 tabs e filtros |
| `SectionFilterChips.tsx` | Chips de filtro horizontais em cascata |
| `SectionTitle.tsx` | Titulo de secao com icone e subtitulo |
| `SerieChips.tsx` | Chips de selecao de ocorrencia em eventos recorrentes |
| `SessionExpiredModal.tsx` | Modal de sessao expirada |
| `SidebarV2.tsx` | Sidebar de navegacao do admin V2 |
| `SimuladorGateway.tsx` | Simulador de custos gateway (credito vs PIX) |
| `SiteContentView.tsx` | CMS de textos editaveis |
| `Skeleton.tsx` | Shimmer placeholder para loading states |
| `SmartTipsCard.tsx` | Dicas inteligentes categorizadas e priorizadas |
| `SocioHome.tsx` | Home do socio com foco no split financeiro |
| `SolicitacoesParceriaView.tsx` | Gestao de solicitacoes de parceria |
| `SolicitarParceriaView.tsx` | Formulario publico para solicitar parceria |
| `SparklineCard.tsx` | Card de metrica com sparkline embaixo |
| `SplitPreviewCard.tsx` | Preview de split automatico (waterfall) |
| `StaffRecrutamento.tsx` | Recrutamento de staff para evento |
| `Step1Evento.tsx` | Dados basicos do evento (foto, nome, data, classificacoes) |
| `Step1Identidade.tsx` | Nome, bio, foto e tipo da comunidade |
| `Step2Ingressos.tsx` | Configuracao de lotes com variacoes |
| `Step2Localizacao.tsx` | CEP, endereco e geocode da comunidade |
| `Step3Listas.tsx` | Configuracao de listas com variantes |
| `Step3Operacao.tsx` | Horarios, CNPJ e website da comunidade |
| `Step4EquipeCasa.tsx` | Busca gerente e equipe da casa |
| `Step4EquipeSocio.tsx` | Busca socio e permissoes toggle |
| `Step4ProdutoresTaxas.tsx` | Adicao de produtores e definicao de taxas |
| `Step5Financeiro.tsx` | Split de receita socio/produtor |
| `StepIndicator.tsx` | Indicador de progresso do wizard |
| `SuccessScreen.tsx` | Tela de sucesso pos-compra com confete e QR |
| `SupabaseDiagnosticView.tsx` | Diagnostico completo do schema Supabase |
| `TabAmizadesPendentes.tsx` | Tab de amizades pendentes (enviadas/recebidas) |
| `TabCheckin.tsx` | Check-in por lista com busca e confirmacao |
| `TabCortesias.tsx` | Gestao de cortesias (distribuir, transferir, revogar) |
| `TabEquipe.tsx` | Gestao de equipe da comunidade com RBAC |
| `TabEquipePromoter.tsx` | Gestao de promoters (cotas, links, ranking) |
| `TabEquipeSocio.tsx` | Gestao de equipe do socio |
| `TabEventosPrivados.tsx` | Tab de solicitacoes de eventos privados |
| `TabGeral.tsx` | Tab geral relatorio: pie charts de origem publico |
| `TabIngressos.tsx` | Tab ingressos: metricas de vendas |
| `TabLista.tsx` | Gestao da lista do evento com offline sync |
| `TabListas.tsx` | Tab listas relatorio: promoters e convidados |
| `TabLotacao.tsx` | Barra de lotacao com alertas waitlist |
| `TabLogs.tsx` | Timeline de logs do evento |
| `TabMesas.tsx` | Gestao de mesas VIP (CRUD, upload de mapa) |
| `TabNomes.tsx` | Gestao de nomes na lista com regras abobora |
| `TabRelatorio.tsx` | Relatorio completo do evento com pie charts |
| `TabResumoCaixa.tsx` | Resumo financeiro do evento com pie charts |
| `TabSolicitacoesParceria.tsx` | Tab de solicitacoes de parceria |
| `TagsPredefinidas.tsx` | Picker de tags predefinidas por categoria |
| `TextAreaField.tsx` | TextArea reutilizavel com contador de caracteres |
| `TicketList.tsx` | Lista de ingressos na carteira com transferencia |
| `TicketQRModal.tsx` | Modal fullscreen de QR code com JWT rotativo |
| `TimeFilterModal.tsx` | Modal de filtro por periodo com calendario |
| `TimeSeriesChart.tsx` | Grafico de serie temporal (linha/area) |
| `TipoEventoScreen.tsx` | Selecao inicial de tipo de evento |
| `Toast.tsx` | Sistema de toast completo (sucesso, erro, aviso, info) |
| `TosAcceptModal.tsx` | Modal de aceite obrigatorio de TOS |
| `TrendAlertCard.tsx` | Alertas de tendencias para metricas |
| `UnsavedChangesModal.tsx` | Modal "Sair sem salvar?" |
| `UploadArea.tsx` | Area de upload de imagem com preview e validacao |
| `VantaColorPicker.tsx` | Color picker com paleta de 30 cores + hex |
| `VantaConfirmModal.tsx` | Modal de confirmacao estilo VANTA |
| `VantaDatePicker.tsx` | Date picker customizado com calendario modal |
| `VantaDropdown.tsx` | Dropdown customizado substituindo select nativo |
| `VantaIndicaView.tsx` | Sistema completo "Vanta Indica" (CRM de indicacoes) |
| `VantaPieChart.tsx` | Grafico de pizza (donut) usando recharts |
| `VantaPickerModal.tsx` | Picker modal bottom sheet com busca |
| `VantaSlider.tsx` | Slider estilizado com thumb amarelo |
| `VantaTimePicker.tsx` | Time picker customizado com colunas hora/minuto |
| `VendasTimelineChart.tsx` | Grafico area/linha de vendas ao longo do tempo |
| `VibeFilterModal.tsx` | Modal de filtro por vibe (estilo/formato) |
| `ViewAllCard.tsx` | Card "Ver todos" para carroseis horizontais |
| `VipScoreCard.tsx` | Score VIP 0-100 dos top clientes |
| `WaitlistModal.tsx` | Modal de inscricao na lista de espera |
| `WalletLockScreen.tsx` | Tela de bloqueio com PIN de 4 digitos (SHA-256) |
| `WalletView.tsx` | Carteira digital com lock screen e tabs |
| `WeeklyReportCard.tsx` | Resumo semanal com vendas e deltas |
| **Services (.ts)** | |
| `IVantaService.ts` | Contrato/interface publica da camada de dados VANTA |
| `adminService.ts` | Curadoria de membros + VANTA Indica cards |
| `analyticsService.ts` | Registro de analytics (APP_OPEN, EVENT_VIEW, PMF) |
| `assinaturaService.ts` | Gestao de assinaturas MAIS VANTA |
| `auditService.ts` | Servico de audit log com formatacao |
| `authService.ts` | Autenticacao (email, social, busca, sessao) |
| `authHelpers.ts` | Validacao e formatacao para autenticacao |
| `behaviorService.ts` | Rastreamento de comportamento do usuario |
| `campanhasService.ts` | CRUD de campanhas de marketing |
| `cargosPlataformaService.ts` | CRUD de cargos e permissoes da plataforma |
| `circuitBreaker.ts` | Pattern Circuit Breaker para protecao contra cascata |
| `clubeService.ts` | Fachada do modulo clube (MAIS VANTA) |
| `clubeCache.ts` | Cache in-memory do clube |
| `clubeCidadesService.ts` | CRUD de cidades habilitadas MV |
| `clubeConfigService.ts` | Get/save config do clube por comunidade |
| `clubeConviteEspecialService.ts` | Convites especiais MV |
| `clubeConvitesIndicacaoService.ts` | Convites por indicacao MV |
| `clubeConvitesService.ts` | CRUD geral de convites MAIS VANTA |
| `clubeDealsService.ts` | CRUD de deals/ofertas exclusivas MV |
| `clubeInfracoesService.ts` | Gestao de infracoes MV |
| `clubeInstagramService.ts` | Verificacao de Instagram para MV |
| `clubeLotesService.ts` | Lotes/beneficios MV por evento |
| `clubeMembrosService.ts` | Operacoes de membros do clube |
| `clubeNotifProdutorService.ts` | Solicitacoes de notificacao MV para produtores |
| `clubeParceirosService.ts` | CRUD de parceiros do MAIS VANTA |
| `clubePassportService.ts` | Passport MV (acesso por cidade) |
| `clubePlanosService.ts` | CRUD de planos de produtor |
| `clubeReservasService.ts` | Resgates de beneficios MV |
| `clubeResgatesService.ts` | Servico de resgates do clube (agregador) |
| `clubeSolicitacoesService.ts` | Solicitacoes de entrada no clube |
| `clubeTiersService.ts` | CRUD de tiers MV |
| `communityAnalyticsService.ts` | Analytics agregados por comunidade |
| `comprovanteService.ts` | Gestao de comprovantes de pagamento |
| `comunidadesService.ts` | CRUD de comunidades com cache |
| `condicoesService.ts` | Condicoes comerciais por produtor/comunidade |
| `cortesiasService.ts` | Gestao de cortesias/ingressos gratuitos |
| `cuponsService.ts` | CRUD de cupons de desconto |
| `dashboardAnalyticsService.ts` | Metricas temporais do dashboard |
| `deepLinkService.ts` | Deep links do Capacitor para navegacao interna |
| `eventAnalyticsService.ts` | Analytics por evento individual |
| `eventosAdminAprovacao.ts` | Fluxo de aprovacao de eventos |
| `eventosAdminCore.ts` | Core do modulo eventos admin com cache |
| `eventosAdminCrud.ts` | CRUD completo de eventos admin |
| `eventosAdminFinanceiro.ts` | Modulo financeiro completo (saques, reembolsos) |
| `eventosAdminService.ts` | Fachada publica de todos sub-modulos eventos admin |
| `eventosAdminTickets.ts` | Operacoes de tickets/ingressos |
| `eventosAdminTypes.ts` | Tipos compartilhados do dominio eventosAdmin |
| `exportRelatorio.ts` | Gera export Excel para evento |
| `exportRelatorioComunidade.ts` | Gera export Excel para comunidade |
| `fidelidadeService.ts` | Programa de fidelidade |
| `financialIntelligence.ts` | Pricing dinamico, splits, break-even |
| `indicaTemplatesService.ts` | Templates para VANTA Indica |
| `insightsEngine.ts` | Motor de insights (VIP score, no-show, churn) |
| `jwtService.ts` | JWT para QR codes via RPCs Supabase |
| `legalService.ts` | CRUD de documentos legais |
| `lgpdExportService.ts` | Exportacao de dados pessoais LGPD |
| `listasService.ts` | Servico completo de listas/guestlists |
| `maisVantaAnalyticsService.ts` | Analytics do programa MAIS VANTA |
| `maisVantaConfigService.ts` | Configuracao do MAIS VANTA |
| `masterAnalyticsService.ts` | Analytics globais para master admin |
| `mesasService.ts` | CRUD de mesas/cabines |
| `notificationsService.ts` | Envio de notificacoes (in-app, push) |
| `operationsMarketing.ts` | Operacoes e marketing analytics |
| `parceriaService.ts` | Gestao de solicitacoes de parceria |
| `parceiroService.ts` | Service para operacoes do parceiro MV |
| `pendenciasService.ts` | Agregador de pendencias de todas as areas |
| `permissoes.ts` | Modulo de autorizacao RBAC contextual |
| `platformConfigService.ts` | Configuracoes da plataforma (taxas globais) |
| `pushService.ts` | Subscricoes FCM push |
| `pushTemplatesService.ts` | Templates de push notification + agendamento |
| `rateLimiter.ts` | Rate limiter client-side (token bucket) |
| `rbacService.ts` | Role-Based Access Control unificado |
| `reembolsoService.ts` | Reembolsos multi-etapa |
| `relatorioService.ts` | Gerar relatorio completo de evento |
| `reviewsService.ts` | CRUD de reviews/avaliacoes de eventos |
| `siteContentService.ts` | CRUD de textos/conteudo do app |
| `smartTipsRules.ts` | Regras de dicas inteligentes |
| `supabaseClient.ts` | Instancia singleton do Supabase tipada |
| `supabaseDiagnosticSchema.ts` | Schema esperado para diagnostico |
| `valueCommunication.ts` | Comunicacao de valor da plataforma |
| `vantaService.ts` | Facade para IVantaService |
| **Stores (.ts)** | |
| `authStore.ts` | Store Zustand central de autenticacao |
| `chatStore.ts` | Store Zustand de chat/mensagens |
| `extrasStore.ts` | Store Zustand para eventos, favoritos, clube |
| **Hooks (.ts)** | |
| `useAppHandlers.ts` | Hook mega-orquestrador de todas as stores |
| `useBloqueados.ts` | Set reativo de IDs bloqueados |
| `useConnectivity.ts` | Monitora conectividade online/offline |
| `useDebounce.ts` | Debounce generico de valor |
| `useDevNavLogger.ts` | Logger de navegacao DEV only |
| `useDraft.ts` | Gerencia rascunhos de criacao |
| `useModalStack.ts` | Gerenciamento de modais com browser back |
| `useNavigation.ts` | Hook central de navegacao do app |
| `usePWA.ts` | Ciclo de vida PWA (SW, install, push) |
| `usePermission.ts` | Permissoes de camera e geolocalizacao |
| `useRadarLogic.ts` | Logica do Radar (geo, busca, filtro) |
| `useSessionTimeout.ts` | Auto-logout apos 30min de inatividade |
| **Utils (.ts)** | |
| `cnpjValidator.ts` | Validacao de CNPJ com API Receita Federal |
| `constants.ts` | Constantes globais de design system |
| `exportUtils.ts` | Exportacao CSV, PDF e Excel |
| `filterSubCarousels.ts` | Utilitario para filtrar sub-carroseis |
| `imageUtils.ts` | Compressao e crop de imagem |
| `mapIcons.ts` | Fabrica de icones Leaflet customizados |
| `platform.ts` | Detecta PWA/Capacitor e abre checkout externo |
| `slug.ts` | Gera slug URL-safe |
| `ticketReceiptPdf.ts` | Gera PDF de comprovante de ingresso |
| `utils.ts` | Funcoes utilitarias globais (tsBR, fmtBRL, etc.) |
| **Tipos (.ts)** | |
| `types/index.ts` | Re-export centralizado de todos os tipos |
| `types/auth.ts` | Tipos de autenticacao e perfil |
| `types/eventos.ts` | Tipos de eventos, comunidades, ingressos |
| `types/financeiro.ts` | Tipos de mesas, cortesias, transferencias |
| `types/rbac.ts` | Tipos RBAC (permissoes, cargos, listas) |
| `types/social.ts` | Tipos de amizade e chat |
| `types/clube.ts` | Tipos MAIS VANTA (tiers, membros, deals) |
| `types/supabase.ts` | Tipos auto-gerados do Supabase (96 tabelas) |
| **Dados (.ts)** | |
| `data/avatars.ts` | URLs de avatares padrao |
| `data/brData.ts` | Estados, cidades e DDDs do Brasil |
| **Configuracao (.ts/.json)** | |
| `app.css` | CSS global com Tailwind v4 e design tokens |
| `capacitor.config.ts` | Configuracao Capacitor (iOS/Android) |
| `index.tsx` | Ponto de entrada do React |
| `instrument.ts` | Inicializacao Sentry |
| `knip.config.ts` | Configuracao Knip (codigo morto) |
| `vite.config.ts` | Configuracao Vite (bundler/dev) |
| `vitest.config.ts` | Configuracao Vitest (test runner) |
| **API (Vercel)** | |
| `api/og.ts` | Open Graph handler para bots sociais |
| `api/robots.ts` | Serve robots.txt |
| `api/sitemap.xml.ts` | Gera sitemap XML dinamico |

---

## Apendice B — Glossario

| Termo | Definicao |
|-------|-----------|
| **Abobora** | Regra de lista que corta nome apos horario especifico (nome "vira abobora") |
| **AccessNode** | No de acesso RBAC representando permissao em contexto (comunidade/evento/plataforma) |
| **Caixa** | Operador de venda na porta do evento; tambem se refere a view/tab de vendas presenciais |
| **Cargo** | Funcao atribuida a um membro dentro de uma comunidade ou evento (GERENTE, SOCIO, PROMOTER, PORTARIA, CAIXA) |
| **Comemoracao** | Solicitacao de evento especial (aniversario, despedida) em uma comunidade |
| **ContaVanta** | Enum de tipo de conta: vanta_guest, vanta_member, vanta_masteradm |
| **Cortesia** | Ingresso gratuito distribuido pela equipe do evento |
| **Curadoria** | Processo de avaliacao manual de novos membros/solicitacoes pelo admin |
| **Deal** | Oferta exclusiva de parceiro para membros MAIS VANTA (desconto ou barter) |
| **Draft** | Rascunho de criacao (evento/comunidade) salvo automaticamente no Supabase |
| **Evento Privado** | Evento corporativo solicitado por cliente a uma comunidade |
| **Gateway** | Plataforma de pagamento (Stripe) que processa transacoes com taxa |
| **Gateway Fee Mode** | Modo de cobranca: ABSORVER (venue paga) ou REPASSAR (comprador paga) |
| **Guest** | Visitante nao logado (conta vanta_guest) com acesso limitado |
| **Ingresso / Ticket** | Entrada para evento, gerada em tickets_caixa com QR JWT rotativo |
| **Infracao** | Penalidade aplicada a membro MAIS VANTA (NO_SHOW, NAO_POSTOU) |
| **LGPD** | Lei Geral de Protecao de Dados — regulamenta tratamento de dados pessoais no Brasil |
| **Lista / Guestlist** | Lista de nomes para entrada no evento, gerenciada por promoters |
| **Lote** | Grupo de ingressos de um evento com data de validade (1o Lote, 2o Lote, etc.) |
| **MAIS VANTA (MV)** | Clube de beneficios exclusivos com tiers (lista, presenca, creator, vanta_black) |
| **Master Admin** | Administrador da plataforma com acesso total (vanta_masteradm) |
| **Meia-Entrada** | Beneficio legal de 50% desconto (estudante, idoso, PCD) com comprovante |
| **Mood** | Status temporario do usuario (emoji + texto curto, expira em 24h) |
| **No-Show** | Membro MAIS VANTA que reservou beneficio mas nao compareceu ao evento |
| **Passaporte** | Solicitacao de acesso a cidade diferente da original no MAIS VANTA |
| **PMF** | Product-Market Fit — pesquisa de encaixe produto/mercado |
| **Portaria** | Operador de check-in na entrada do evento (via QR scanner ou lista) |
| **Promoter** | Agente que insere nomes na lista do evento; recebe cotas por regra |
| **RBAC** | Role-Based Access Control — controle de acesso baseado em cargos e permissoes |
| **Resgate** | Quando membro MAIS VANTA utiliza um beneficio/deal em evento ou parceiro |
| **Selo** | Badge de importancia no perfil (VIP, INFLUENCER, PARCEIRO, IMPRENSA) |
| **Split** | Divisao da receita entre partes (produtor, socio, VANTA, gateway) |
| **Socio** | Parceiro comercial do evento que traz o local/venue e divide receita |
| **Tenant** | Contexto de permissao: uma comunidade ou evento especifico |
| **Tier** | Nivel hierarquico no MAIS VANTA: lista, presenca, creator, vanta_black |
| **Variacao** | Tipo especifico de ingresso dentro de um lote (area + genero + valor) |
| **VANTA Fee** | Taxa da plataforma cobrada sobre vendas (padrao 5%) |
| **VANTA Indica** | Programa de indicacao (referral) com cards visuais na Home |

---

## Apendice C — Estatisticas

### Arquivos por Pasta

| Pasta | Arquivos TS/TSX | Linhas Totais | Observacoes |
|-------|----------------|---------------|-------------|
| Raiz (config + infra) | 16 | ~1.700 | App.tsx (815L) e o maior |
| `types/` | 7 | ~7.361 | supabase.ts (6.144L) auto-gerado |
| `data/` | 2 | ~112 | Estados, cidades, avatares |
| `api/` | 3 | ~181 | Vercel Serverless Functions |
| `components/` | 59 | ~7.236 | 62 componentes em 59 arquivos |
| `modules/checkout/` | 4 | 1.525 | CheckoutPage (1.108L) |
| `modules/community/` | 3 | 1.248 | ComunidadePublicView (667L) |
| `modules/convite/` | 1 | 242 | Standalone |
| `modules/event-detail/` | 8 | 1.753 | Bem modularizado |
| `modules/home/` | 13 | 2.288 | LazySection para performance |
| `modules/landing/` | 1 | 318 | SEO com react-helmet |
| `modules/messages/` | 6 | 1.073 | ChatRoomView (396L) |
| `modules/parceiro/` | 2 | 715 | Service + Dashboard MV |
| `modules/profile/` | 16 | 5.947 | ClubeOptInView (1.250L) maior de modules/ |
| `modules/radar/` | 5 | 858 | Leaflet maps |
| `modules/search/` | 10 | 2.160 | 4 tabs + 5 modais de filtro |
| `modules/wallet/` | 6 | 2.190 | QR JWT rotativo |
| `features/admin/views/` (raiz) | ~49 | ~19.400 | VantaIndicaView (1.938L) maior |
| `features/admin/views/` (subpastas) | ~121 | ~33.300 | 20 subpastas |
| `features/admin/components/` | 9 | 2.149 | AdminDashboardHome (801L) |
| `features/admin/components/dashboard/` | 16 | 1.446 | Graficos Recharts |
| `features/admin/components/insights/` | 18 | 1.321 | Cards inteligentes |
| `features/admin/services/` (raiz) | 37 | 10.709 | listasService (1.044L) maior |
| `features/admin/services/analytics/` | 6 | 2.234 | 4 services de analytics |
| `features/admin/services/clube/` | 20 | 3.428 | 20 sub-services MV |
| `features/admin/services/insights/` | 10 | 1.538 | Motor de insights |
| `features/dashboard-v2/` | 12 | 4.317 | Gateway (978L) |
| `features/tickets/` | 1 | 445 | MyTicketsView |
| `services/` | 10 | ~1.170 | supabaseClient (53L) singleton |
| `stores/` | 3 | ~813 | authStore (242L) mais usado |
| `hooks/` | 11 | ~1.497 | useAppHandlers (465L) maior |
| `utils/` | 5 | ~397 | exportUtils (160L) |
| **TOTAL TS/TSX** | **~598** | **~120.000+** | |

### Contagem por Tipo

| Tipo | Quantidade |
|------|-----------|
| Componentes (`.tsx`) | 62 compartilhados + ~300 de modulos/admin |
| Services (`.ts`) | ~90 (10 globais + 37 admin raiz + 6 analytics + 20 clube + 10 insights + parceiro + vantaService) |
| Stores Zustand | 3 (auth, chat, extras) |
| Hooks customizados | 11 |
| Utils | 5 globais + ~10 por modulo |
| Tipos/interfaces | 7 arquivos (~7.361 linhas, 96 tabelas Supabase) |

### Supabase

| Metrica | Valor |
|---------|-------|
| Tabelas | 96 |
| Views | 2 (comunidades_admin, comunidades_publico) |
| RPCs | ~40 |
| ENUMs | 11 |
| Migrations | 223 (2026-02-25 a 2026-03-20) |
| Helper Functions | 4 (set_updated_at, is_masteradm, is_produtor_evento, handle_new_user) |
| Realtime habilitado | 7 tabelas |

### Testes

| Tipo | Arquivos | Test Cases |
|------|----------|-----------|
| E2E (Playwright) | 14 | 55 |
| Integracao (Vitest) | 3 + 1 helper | 38 |
| Unitarios (Vitest) | 9 | 75 |
| Carga (k6) | 2 | 4 cenarios |
| **Total** | **28** | **168** |

### Scripts e Ferramentas

| Tipo | Quantidade |
|------|-----------|
| Scripts Node.js (.mjs) | 14 |
| Scripts Shell (.sh) | 7 |
| npm scripts | 37 |
| Git Hooks (Husky) | 2 (pre-commit, pre-push) |
| Configuracoes na raiz | 10 |

### Maiores Arquivos (>800 linhas)

| Arquivo | Linhas | Modulo |
|---------|--------|--------|
| `VantaIndicaView.tsx` | 1.938 | admin/views |
| `CriarEventoView.tsx` | 1.382 | admin/views |
| `eventoDashboard/index.tsx` | 1.272 | admin/views |
| `ClubeOptInView.tsx` | 1.250 | modules/profile |
| `CheckoutPage.tsx` | 1.108 | modules/checkout |
| `EventosPendentesView.tsx` | 1.092 | admin/views |
| `listasService.ts` | 1.044 | admin/services |
| `eventosAdminFinanceiro.ts` | 1.033 | admin/services |
| `DashboardV2Gateway.tsx` | 978 | dashboard-v2 |
| `comunidades/EditarModal.tsx` | 974 | admin/views |
| `NotificacoesAdminView.tsx` | 959 | admin/views |
| `EditarEventoView.tsx` | 912 | admin/views |
| `comunidades/ResumoEventoModal.tsx` | 907 | admin/views |
| `financeiro/index.tsx` | 884 | admin/views |
| `masterFinanceiro/index.tsx` | 861 | admin/views |
| `PlanosMaisVantaView.tsx` | 831 | admin/views |
| `DashboardV2Home.tsx` | 829 | dashboard-v2 |
| `PublicProfilePreviewView.tsx` | 817 | modules/profile |
| `App.tsx` | 815 | raiz |
| `AdminDashboardHome.tsx` | 801 | admin/components |
| `Step2Ingressos.tsx` | 797 | admin/views/criarEvento |
| `ProfileView.tsx` | 793 | modules/profile |
| `comunidades/PublicoDrilldown.tsx` | 808 | admin/views |
| `GerenteDashboardView.tsx` | 780 | admin/views |
| `EventTicketsCarousel.tsx` | 767 | modules/wallet |

### Dependencias do Projeto

| Tipo | Quantidade |
|------|-----------|
| Dependencies (producao) | 24 |
| DevDependencies | 23+ |
| Total deps (npm audit) | 1.279 (308 prod, 956 dev) |

