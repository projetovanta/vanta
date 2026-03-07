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
| 15 | Stripe assinaturas | NAO ATIVO | Edge Function create-checkout retorna placeholder sem STRIPE_SECRET_KEY |
| 16 | Instagram API verificacao | NAO ATIVO | Edge Function verify-instagram-post retorna placeholder sem META_ACCESS_TOKEN |
| 17 | Downgrade automatico de tier | NAO EXISTE | Sem mecanismo automatico |
| 18 | Dashboard do membro MV | NAO EXISTE | Membro nao tem painel proprio |
