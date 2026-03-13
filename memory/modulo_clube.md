# Criado: 2026-03-06 01:43 | Ultima edicao: 2026-03-11

# Modulo: MAIS VANTA (Clube Exclusivo) — V3

## O que e
MAIS VANTA = clube exclusivo do VANTA. Camada de benefícios silenciosa sobre eventos.
Fluxo: usuario solicita entrada → curador aprova com tier (interno, nunca visível) → produtor configura benefícios por tier no evento → membro resgata benefício.
Tiers V3: LISTA(0), PRESENCA(1), SOCIAL(2), CREATOR(3), BLACK(4). Tier NUNCA exibido ao membro.
CREATOR tem sub-níveis: creator_200k, creator_500k, creator_1m.
Sem cascata: membro recebe APENAS benefício do SEU tier exato (`===`), não dos tiers abaixo.

### Regras de negócio (V3)
- **Não existe rejeição**: todo mundo é aprovado em pelo menos LISTA (tier 0)
- **Desconto silencioso**: tier `desconto` mostra preço menor sem label "MAIS VANTA" (label genérica "desconto" em emerald)
- **VANTA BLACK manual**: excluído do Step2Ingressos (config produtor), aparece como card read-only. Configurado só via curadoria
- **Tags predefinidas**: 33 tags em 6 categorias (Influência, Perfil, Rede, Comportamento, Risco, Fit) — `TagsPredefinidas.tsx`
- **Check-in MV**: marca resgate USADO para QUALQUER tier com resgate ativo (não só convidado/presença)
- **Curadoria standalone**: CURADORIA_MV renderiza TabClube direto (sem wrapper Hub). 7 sub-abas
- **Hub separado**: MaisVantaHubView tem 7 abas (Planos, Cidades, Parceiros, Deals, Assinaturas, Passaportes, Config) — sem CLUBE
- **Passaporte = cidade**: campo principal é `cidade`, `comunidade_id` é deprecated. Label: "Passport Regional"

## Tabelas Supabase

### membros_clube
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles UNIQUE | Membro |
| tier | TEXT | lista, presenca, social, creator, black |
| creator_sublevel | TEXT | creator_200k, creator_500k, creator_1m (null se não creator) |
| status | TEXT NOT NULL | PENDENTE, APROVADO |
| cidade_principal | TEXT | Cidade informada no formulário |
| cidades_ativas | TEXT[] | Cidades com acesso ativo |
| convites_disponiveis | INT | Convites de indicação restantes |
| convites_usados | INT | Convites já usados |
| instagram_handle | TEXT | @ do Instagram |
| instagram_seguidores | INT | Qtd de seguidores |
| aprovado_por | UUID | Quem aprovou |
| aprovado_em | TIMESTAMPTZ | auto |
| convidado_por | UUID | Quem convidou |
| ativo | BOOLEAN | Default true |
| instagram_verificado_em | TIMESTAMPTZ | Ultima verificacao |
| comunidade_origem | UUID FK comunidades | Onde foi aprovado primeiro |
| castigo_motivo | TEXT | Motivo de castigo (no-show etc) |
| nota_interna | TEXT | Nota interna (nunca visível ao membro) |
| tags | TEXT[] | Tags internas padronizadas (nunca visíveis ao membro) |
| categoria | TEXT | Sync com tier na aprovação (sem constraint) |

### mais_vanta_config_evento (benefícios por tier no evento — renomeada de mais_vanta_lotes_evento)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento |
| tier_minimo | TEXT | lista, presenca, social, creator, black |
| tipo | TEXT | 'ingresso', 'lista' ou 'desconto' |
| lote_id | UUID FK lotes | Se tipo=ingresso |
| lista_id | UUID FK listas_evento | Se tipo=lista |
| desconto_percentual | INT 0-100 | Se tipo=desconto |
| creator_sublevel_minimo | TEXT | creator_200k, creator_500k, creator_1m (null se não creator) |
| vagas_limite | INT | Limite de vagas definido pelo produtor |
| vagas_resgatadas | INT | Vagas já usadas (default 0) |
| ativo | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | auto |

### solicitacoes_clube (pedidos de entrada)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Quem solicita |
| instagram_handle | TEXT | @ do Instagram |
| instagram_seguidores | INT | Seguidores |
| convidado_por | UUID | Convite |
| status | TEXT | PENDENTE, APROVADO, ADIADO |
| profissao | TEXT | Profissão / o que faz (nullable) |
| como_conheceu | TEXT | Como conheceu o VANTA (nullable) |
| cidade | TEXT | Cidade informada (nullable) |
| indicado_por | UUID | Quem indicou via convite (nullable) |
| convite_id | UUID | Convite usado (nullable) |
| balde_sugerido | TEXT | Classificação automática (nullable) |
| criado_em | TIMESTAMPTZ | auto |
| resolvido_em | TIMESTAMPTZ | Quando decidido |
| resolvido_por | UUID | Quem decidiu |
| tier_atribuido | TEXT | Tier se aprovado |

### assinaturas_mais_vanta (por comunidade)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| comunidade_id | UUID FK comunidades UNIQUE | Comunidade |
| plano | TEXT | BASICO, PRO, ENTERPRISE |
| status | TEXT | PENDENTE, ATIVA, CANCELADA, EXPIRADA |
| stripe_customer_id | TEXT | Placeholder Stripe |
| stripe_subscription_id | TEXT | Placeholder Stripe |
| valor_mensal | NUMERIC(10,2) | Valor (default 0) |
| inicio | TIMESTAMPTZ | Inicio da assinatura |
| fim | TIMESTAMPTZ | Fim |
| criado_em | TIMESTAMPTZ | auto |
| criado_por | UUID FK profiles | Quem criou |

### passport_aprovacoes (aprovacao por cidade)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Membro |
| comunidade_id | UUID FK comunidades | Comunidade (nullable) |
| cidade | TEXT | Cidade do passaporte |
| status | TEXT | PENDENTE, APROVADO, REJEITADO |
| solicitado_em | TIMESTAMPTZ | auto |
| resolvido_em | TIMESTAMPTZ | Quando decidido |
| resolvido_por | UUID | Quem decidiu |

### infracoes_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID | Membro |
| tipo | TEXT | NO_SHOW ou NAO_POSTOU |
| evento_id | UUID | Evento relacionado |
| evento_nome | TEXT | Nome do evento |
| criado_em | TIMESTAMPTZ | auto |
| criado_por | UUID | Quem registrou |

### cidades_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| nome | TEXT UNIQUE | Nome da cidade |
| estado | TEXT | Estado (nullable) |
| pais | TEXT | Default 'BR' |
| ativo | BOOLEAN | Default true |
| gerente_id | UUID FK profiles | Gerente da cidade (nullable) |
| criado_em | TIMESTAMPTZ | auto |
| criado_por | UUID | Quem criou |

### parceiros_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| nome | TEXT | Nome do venue |
| tipo | TEXT | RESTAURANTE/BAR/CLUB/GYM/SALAO/HOTEL/LOJA/OUTRO |
| descricao | TEXT | Descricao |
| foto_url | TEXT | Foto do parceiro |
| endereco | TEXT | Endereco |
| cidade_id | UUID FK cidades_mais_vanta | Cidade |
| instagram_handle | TEXT | @ do Instagram |
| contato_nome/telefone/email | TEXT | Contato |
| plano | TEXT | STARTER/PRO/ELITE |
| resgates_mes_limite | INT | Default 5 |
| resgates_mes_usados | INT | Default 0 |
| trial_ativo | BOOLEAN | Default false |
| user_id | UUID FK profiles | Acesso ao painel (nullable) |
| ativo | BOOLEAN | Default true |

### deals_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| parceiro_id | UUID FK parceiros_mais_vanta | Parceiro |
| cidade_id | UUID FK cidades_mais_vanta | Cidade |
| titulo | TEXT | Titulo do deal |
| tipo | TEXT | BARTER ou DESCONTO |
| obrigacao_barter | TEXT | Ex: 1 story + 1 post |
| desconto_percentual/valor | NUMERIC | Se desconto |
| filtro_genero/alcance/categoria | TEXT/TEXT[] | Curadoria interna |
| vagas | INT | Total de vagas |
| vagas_preenchidas | INT | Vagas ja preenchidas |
| inicio/fim | TIMESTAMPTZ | Vigencia |
| status | TEXT | RASCUNHO/ATIVO/PAUSADO/ENCERRADO/EXPIRADO |

### resgates_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| deal_id | UUID FK deals_mais_vanta | Deal |
| user_id | UUID FK profiles | Membro |
| parceiro_id | UUID FK parceiros_mais_vanta | Parceiro |
| status | TEXT | APLICADO/SELECIONADO/RECUSADO/CHECK_IN/PENDENTE_POST/CONCLUIDO/NO_SHOW/EXPIRADO/CANCELADO |
| qr_token | TEXT UNIQUE | Token QR VIP (auto hex 16 bytes) |
| aplicado_em | TIMESTAMPTZ | auto |
| selecionado_em/por | TIMESTAMPTZ/UUID | Quando/quem selecionou |
| checkin_em | TIMESTAMPTZ | Check-in via QR |
| post_url/verificado/verificado_em | TEXT/BOOL/TIMESTAMPTZ | Post Instagram |
| concluido_em | TIMESTAMPTZ | Conclusao |
| UNIQUE(deal_id, user_id) | | 1 aplicacao por membro por deal |

### convites_mais_vanta (legado — convites admin→membro/parceiro)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| token | TEXT UNIQUE | hex 16 bytes, auto |
| tipo | TEXT | MEMBRO ou PARCEIRO |
| tier | TEXT | Nivel se tipo=MEMBRO |
| cidade_id | UUID FK cidades_mais_vanta | Cidade (nullable) |
| parceiro_nome | TEXT | Nome sugerido se tipo=PARCEIRO |
| criado_por | UUID FK profiles | Master/gerente que criou |
| aceito_por | UUID FK profiles | Quem aceitou (nullable) |
| aceito_em | TIMESTAMPTZ | Quando aceitou |
| expira_em | TIMESTAMPTZ | Expira em 7 dias |
| status | TEXT | PENDENTE/ACEITO/EXPIRADO/CANCELADO |
| criado_em | TIMESTAMPTZ | auto |

### convites_clube (V3 — indicação membro→membro)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| membro_id | UUID FK profiles | Quem gerou o convite |
| codigo | TEXT UNIQUE | hex 8 bytes, auto |
| usado_por | UUID FK profiles | Quem usou (nullable) |
| usado_em | TIMESTAMPTZ | Quando foi usado |
| status | TEXT | DISPONIVEL, USADO, EXPIRADO |
| criado_em | TIMESTAMPTZ | auto |

### mv_solicitacoes_notificacao (V3 S5.6 — produtor pede notif para membros)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento alvo |
| produtor_id | UUID FK profiles | Quem pediu |
| mensagem | TEXT | Texto da notificação |
| status | TEXT | PENDENTE, APROVADA, REJEITADA, ENVIADA |
| membros_notificados | INT | Quantos receberam |
| resolvido_por | UUID FK profiles | Admin que resolveu |
| resolvido_em | TIMESTAMPTZ | Quando resolveu |
| criado_em | TIMESTAMPTZ | auto |

### mv_convites_especiais (V3 S6 — convite especial do Vanta)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | Evento |
| user_id | UUID FK profiles | Membro convidado |
| beneficio_id | UUID FK mais_vanta_config_evento | Benefício vinculado (nullable) |
| enviado_por | UUID FK profiles | Admin que enviou |
| mensagem | TEXT | Mensagem do convite |
| status | TEXT | ENVIADO, VISTO, RESGATADO, IGNORADO |
| criado_em | TIMESTAMPTZ | auto |
| UNIQUE(evento_id, user_id) | | Um convite por membro por evento |

## Fluxos

### SOLICITAR ENTRADA NO CLUBE
**Quem**: Usuario logado
**Navegacao**: ProfileView -> ClubeOptInView (785L) ou convite de outro membro
**O que acontece**:
1. Usuario preenche instagram_handle
2. INSERT solicitacoes_clube (status PENDENTE)
3. Admin ve em SolicitacoesClubeView

### APROVAR MEMBRO
**Quem**: Admin/master
**Navegacao**: Painel Admin -> MAIS VANTA -> Solicitacoes
**O que acontece**:
1. Admin define tier (desconto/convidado/presenca/creator/vanta_black)
2. UPDATE solicitacao APROVADO + INSERT membros_clube (com tags e nota_interna opcionais)
**Consequencia**: membro ganha acesso a benefícios do tier

### RESGATAR BENEFÍCIO MV
**Quem**: Membro ativo com tier >= tier_minimo do benefício
**O que acontece**:
1. INSERT resgates_mv_evento (status RESGATADO)
**Consequencia**: membro deve ir ao evento e postar no Instagram

### VERIFICAR POST
**Quem**: Admin
**O que acontece**: admin verifica URL do post → UPDATE post_verificado = true
**Se nao postou**: registra infracao NAO_POSTOU

### INFRACAO (NO_SHOW / NAO_POSTOU)
**Quem**: Admin
**O que acontece**: INSERT infracoes_mais_vanta
**Consequencia**: infracoes progressivas podem gerar castigo (castigo_motivo no membros_clube)

### CONVITE VIA LINK
**Quem**: Master/gerente
**Navegacao**: Painel Admin -> MAIS VANTA -> Convites -> Novo Convite
**O que acontece**:
1. Master escolhe tipo (MEMBRO/PARCEIRO), nivel, cidade
2. INSERT convites_mais_vanta (token unico, expira 7 dias, uso unico)
3. Master copia link e envia por WhatsApp/email
4. Convidado abre link → /convite-mv/:token → AceitarConviteMVPage
5. Se nao logado: abre AuthModal inline → cria conta ou loga
6. Clica "Aceitar" → RPC aceitar_convite_mv (SECURITY DEFINER)
7. Se MEMBRO: INSERT/UPSERT membros_clube com tier definido
8. Se PARCEIRO: retorna dados pra master linkar ao parceiro
9. Notificacao de boas-vindas (MV_APROVADO ou PARCERIA_APROVADA)

### PASSAPORTE (aprovacao por cidade)
**Quem**: Membro com passaporte aprovado
**O que acontece**: passport_aprovacoes define em quais cidades o membro pode usar beneficios
**Fluxo**: PENDENTE → admin aprova → APROVADO → membro usa em eventos da cidade

## Onde este modulo aparece (propagacao)

| Tela | O que usa |
|---|---|
| ClubeOptInView (perfil) | Solicitar entrada |
| EventDetailView | Badge MV + lote exclusivo |
| CheckoutPage | Lotes MV disponiveis |
| HomeView | Secao beneficios MV |
| SearchView | Filtro beneficios MV |
| AdminDashboardView | Secao MAIS VANTA |
| AssinaturasMaisVantaView | Gerenciar assinaturas |
| PassaportesMaisVantaView | Gerenciar passaportes |
| ConvitesMaisVantaView | Convites master → membro/parceiro |
| AnalyticsMaisVantaView | Analytics completo MV |
| AceitarConviteMVPage | Standalone /convite-mv/:token |
| ParceiroDashboardPage | Standalone /parceiro (deals, resgates, QR scan) |
| DealsMembroSection | Feed deals + QR VIP dourado modal |

## Checklist de status
| # | Item | Status | Detalhe |
|---|---|---|---|
| 1 | Solicitar entrada | OK | solicitacoes_clube |
| 2 | Aprovar membro (sem rejeição) | OK | Admin flow V3 — todo mundo entra em pelo menos LISTA |
| 3 | Tiers V3 (5 lowercase) | OK | lista/presenca/social/creator/black. CHECK constraints no banco |
| 4 | Benefícios MV por evento | OK | mais_vanta_config_evento + UI toggle/config. Labels humanas pro produtor. black = contato direto |
| 5 | Resgatar benefício MV | OK | resgates_mv_evento + clubeReservasService CRUD real + EventDetailView salva no banco |
| 28 | Termos MV | OK | Modal inline em ClubeOptInView e MaisVantaBeneficioModal. Contrapartidas CONAR antes do resgate |
| 29 | Campo como conheceu | OK | Dropdown no formulário de solicitação (Redes sociais/Amigo/Evento/Outro) → como_conheceu |
| 34 | Campo cidade obrigatório | OK | Input texto no formulário ClubeOptInView → solicitacoes_clube.cidade |
| 35 | Baldes automáticos curadoria | OK | calcularBalde() por seguidores (200K+=creator, 5K+=presenca, else sem_fit). Filtro chips em SubTabSolicitacoes |
| 36 | Badge balde + cidade na curadoria | OK | SubTabSolicitacoes mostra badge colorido do balde + cidade da solicitação |
| 37 | Convites de indicação membro→membro | OK | convites_clube + clubeConvitesIndicacaoService (gerar, listar, usar, buscar por código). Link: /mais-vanta?convite=CODIGO |
| 38 | Config convites por tier | OK | clube_config.convites_lista/presenca/social/creator/black + UI em SubTabConfig |
| 39 | Convites iniciais na aprovação | OK | aprovarSolicitacao gera N convites conforme config do tier + atualiza membros_clube.convites_disponiveis |
| 40 | Notificação indicador aprovado | OK | Quando indicado é aprovado, quem indicou recebe notificação in-app + push |
| 41 | Balde indicado_tier_alto | OK | Solicitação via convite de creator/black vai pro balde 'indicado_tier_alto' na curadoria |
| 42 | Renovação convites por engajamento | OK | +1 convite ao fazer check-in com resgate (clubeResgatesService) |
| 43 | UI convites membro | OK | Seção "Convidar amigos" no ClubeOptInView — mostra disponíveis/usados, botão gerar+compartilhar (Web Share API ou clipboard) |
| 44 | Planos do produtor V3 | OK | planos_produtor + produtor_plano (tabelas). clubePlanosService (CRUD + atribuição). PlanosProdutor view no MaisVantaHubView |
| 45 | Config plano produtor | OK | nome, precoMensal, limiteEventosMes, limiteResgatesEvento, tiersAcessiveis[], limiteNotificacoesMes, precoEventoExtra, precoNotificacaoExtra, personalizadoPara |
| 46 | Creator sublevel no benefício | OK | creator_sublevel_minimo em mais_vanta_config_evento. UI seletor 200K+/500K+/1M+ no Step2Ingressos. Elegibilidade verifica sublevel no EventDetailView |
| 47 | Vagas limite por tier | OK | vagas_limite em mais_vanta_config_evento. Input numérico no Step2Ingressos. Persistido via clubeLotesService |
| 48 | Labels produtor V3 | OK | TIER_LABELS_PRODUTOR + TIER_DESC_PRODUTOR no Step2Ingressos. Linguagem humana: Público geral, Presença visual, Conexão social, Criadores de conteúdo |
| 49 | Load/save benefícios com novos campos | OK | CriarEventoView, EditarEventoView, EditarLotesSubView passam creatorSublevelMinimo + vagasLimite. Load preenche campos ao editar evento existente |
| 30 | Check-in encerra obrigação | OK | convidado/presenca: check-in marca resgate USADO automaticamente (query online) |
| 31 | Botão Adiar curadoria | OK | Status ADIADO + migration CHECK. Solicitação sai da fila pendentes |
| 32 | Relatório MV produtor | OK | Seção MAIS VANTA no TabRelatorio (resgates, comparecimento, posts, alcance) |
| 33 | ClubeConfig lowercase | OK | Propriedades renomeadas (beneficiosConvidado/Presenca/Creator/VantaBlack) |
| 34 | Tags/nota membro existente | OK | atualizarMembroMeta() + campos no MembroClubeVanta |
| 6 | Post verificacao | OK | post_url + post_verificado |
| 7 | Infracoes progressivas | OK | infracoes_mais_vanta + castigo |
| 8 | Passaporte por cidade | OK | passport_aprovacoes + cidade |
| 9 | Assinaturas comunidade | OK | assinaturas_mais_vanta |
| 10 | Convite por membro | OK | convidado_por |
| 50 | MV avaliação evento | OK | mv_avaliacao em eventos_admin. Eficiente/Ineficiente toggle no TabRelatorio |
| 51 | Vagas resgatadas tracking | OK | vagas_resgatadas em mais_vanta_config_evento. Incrementado no resgate. Verificado antes de resgatar |
| 52 | Limite eventos produtor | OK | verificarLimiteEventos() compara count mensal vs plano.limiteEventosMes |
| 53 | Solicitação notif produtor (V3 S5.6) | OK | mv_solicitacoes_notificacao + clubeNotifProdutorService (solicitar, listar, aprovar, rejeitar). Respeita limite plano |
| 54 | Convite especial Vanta (V3 S6) | OK | mv_convites_especiais + clubeConviteEspecialService (buscarPorFiltro, enviar, listar). Notif in-app MV_CONVITE_ESPECIAL |
| 55 | Auto-aprovação passport cidade | OK | Membros ativos do clube aprovados automaticamente ao solicitar passport (V3 style) |
| 56 | UI notif produtor admin (V3 S5.6) | OK | NotifMVPendentesView — aba "Notif Produtor" no Hub. Lista pendentes, aprovar (dispara push) ou rejeitar |
| 57 | UI convite especial Vanta (V3 S6) | OK | ConviteEspecialMVView — aba "Convites" no Hub. Filtro tier/cidade/sublevel, seleção membros, enviar convite |
| 58 | Botão solicitar notif MV (produtor) | OK | TabRelatorio seção MV — botão "Solicitar notificação para membros" abre form inline, envia via clubeService |
| 11 | RLS todas tabelas MV | OK | Migrations confirmam |
| 12 | Tiers config | OK | tiers_mais_vanta (4 tiers no banco) |
| 13 | Planos MV | OK | planos_mais_vanta (3 planos no banco) |
| 14 | Config global MV | OK | mais_vanta_config (1 row) + clube_config |
| 15 | Stripe assinaturas | CÓDIGO OK, SECRETS FALTAM | create-checkout (133L) + stripe-webhook (163L) implementados. Falta configurar STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET no Supabase Dashboard |
| 16 | Instagram API verificacao | CÓDIGO OK, SECRETS FALTAM | verify-instagram-post (132L) + verify-instagram-bio (124L) + update-instagram-followers (179L) implementados. Falta configurar META_ACCESS_TOKEN no Supabase Dashboard |
| 17 | NO_SHOW automatico | OK | Trigger `trg_evento_finalizado_noshow` + função `registrar_noshow_evento_finalizado()` — quando evento muda pra FINALIZADO, marca reservas RESERVADO como NO_SHOW + insere infração + bloqueio progressivo + notificação. Cron `lembrete-reserva-mv` (30min) notifica 12h antes. Migration: 20260308130000 |
| 18 | Dashboard do membro MV | OK | ClubeOptInView mostra tier, reservas, passaportes, deals. Inclui: botão cancelar reserva (>12h antes), badge NO_SHOW, modal confirmação cancelamento |
| 19 | Curadoria v2 campos | OK | membros_clube: categoria, alcance, genero, cidade_base, interesses, nota_engajamento |
| 20 | Cidades MV | OK | cidades_mais_vanta + clubeCidadesService |
| 21 | Parceiros MV | OK | parceiros_mais_vanta + clubeParceirosService |
| 22 | Deals MV | OK | deals_mais_vanta + clubeDealsService |
| 23 | Resgates MV | OK | resgates_mais_vanta + clubeResgatesService |
| 24 | Trigger 1 deal ativo | OK | check_deal_ativo_unico (banco) |
| 25 | Trigger vagas deal | OK | update_vagas_deal (banco) |
| 26 | Trigger resgates parceiro | OK | update_resgates_parceiro (banco) |
| 27 | Feed deals membro | OK | DealsMembroSection no ClubeOptInView |
| 28 | Convite via link | OK | convites_mais_vanta + RPC aceitar_convite_mv + ConvitesMaisVantaView + AceitarConviteMVPage |
| 29 | Painel do parceiro | OK | /parceiro + ParceiroDashboardPage + parceiroService + RLS parceiro_own/deals/resgates |
| 30 | Sugerir deal (parceiro) | OK | INSERT status=RASCUNHO + trigger notifica master (MV_DEAL_SUGERIDO) |
| 31 | Analytics MV | OK | AnalyticsMaisVantaView (membros, resgates, parceiros, receita, engajamento) |
| 32 | Notificacoes MV v2 | OK | 13 tipos novos (MV_APROVADO ate MV_RESGATE_PARCEIRO) |
| 33 | Gerente por cidade | OK | Sidebar + guards expandidos para vanta_gerente |
| 34 | QR VIP dourado | OK | DealsMembroSection modal QR + ParceiroDashboardPage tab QR Scan + checkin com joins |
