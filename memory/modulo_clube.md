# Criado: 2026-03-06 01:43 | Ultima edicao: 2026-03-06 01:43

# Modulo: MAIS VANTA (Clube de Influencia)

## O que e
MAIS VANTA = programa de fidelidade/influencia. Membros com Instagram verificado ganham beneficios exclusivos.
Fluxo: usuario solicita entrada → admin aprova com tier → membro reserva ingresso gratis → posta no Instagram → admin verifica.
Tiers: BRONZE, PRATA, OURO, DIAMANTE. Cada tier desbloqueia lotes exclusivos.

## Tabelas Supabase

### membros_clube
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles UNIQUE | Membro |
| tier | TEXT | BRONZE, PRATA, OURO, DIAMANTE |
| instagram_handle | TEXT | @ do Instagram |
| instagram_seguidores | INT | Qtd de seguidores |
| aprovado_por | UUID | Quem aprovou |
| aprovado_em | TIMESTAMPTZ | auto |
| convidado_por | UUID | Quem convidou |
| ativo | BOOLEAN | Default true |
| instagram_verificado_em | TIMESTAMPTZ | Ultima verificacao |
| comunidade_origem | UUID FK comunidades | Onde foi aprovado primeiro |
| castigo_motivo | TEXT | Motivo de castigo (no-show etc) |

### lotes_mais_vanta (lotes exclusivos por evento)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin UNIQUE | Evento |
| tier_minimo | TEXT | BRONZE, PRATA, OURO, DIAMANTE |
| quantidade | INT | Qtd disponivel (default 0) |
| reservados | INT | Qtd reservada (default 0) |
| prazo | TIMESTAMPTZ | Prazo para reservar |
| descricao | TEXT | Descricao do beneficio |
| com_acompanhante | BOOLEAN | Se pode levar +1 (default false) |

### reservas_mais_vanta
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| lote_mais_vanta_id | UUID FK lotes_mais_vanta | Lote |
| evento_id | UUID FK eventos_admin | Evento |
| user_id | UUID FK profiles | Membro |
| reservado_em | TIMESTAMPTZ | auto |
| status | TEXT | RESERVADO, USADO, CANCELADO, PENDENTE_POST |
| post_verificado | BOOLEAN | Se post foi verificado (default false) |
| post_url | TEXT | URL do post no Instagram |

### solicitacoes_clube (pedidos de entrada)
| Coluna | Tipo | Descricao |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Quem solicita |
| instagram_handle | TEXT | @ do Instagram |
| instagram_seguidores | INT | Seguidores |
| convidado_por | UUID | Convite |
| status | TEXT | PENDENTE, APROVADO, REJEITADO |
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

### convites_mais_vanta
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
1. Admin define tier (BRONZE/PRATA/OURO/DIAMANTE)
2. UPDATE solicitacao APROVADO + INSERT membros_clube
**Consequencia**: membro ganha acesso a lotes exclusivos

### RESERVAR INGRESSO MV
**Quem**: Membro ativo com tier >= tier_minimo do lote
**O que acontece**:
1. INSERT reservas_mais_vanta (status RESERVADO)
2. UPDATE lotes_mais_vanta SET reservados + 1
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
| 2 | Aprovar/rejeitar membro | OK | Admin flow |
| 3 | Tiers (BRONZE-DIAMANTE) | OK | CHECK constraint |
| 4 | Lotes exclusivos MV | OK | lotes_mais_vanta |
| 5 | Reservar ingresso MV | OK | reservas_mais_vanta |
| 6 | Post verificacao | OK | post_url + post_verificado |
| 7 | Infracoes progressivas | OK | infracoes_mais_vanta + castigo |
| 8 | Passaporte por cidade | OK | passport_aprovacoes + cidade |
| 9 | Assinaturas comunidade | OK | assinaturas_mais_vanta |
| 10 | Convite por membro | OK | convidado_por |
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
