# MAIS VANTA — VERSÃO ATUAL (Antes do V3)
> Mapa completo de tudo que existe hoje no código e banco de dados
> Gerado em 2026-03-11

---

## 1. VISÃO GERAL DO QUE EXISTE

O MAIS VANTA hoje é um sistema de clube com curadoria + benefícios em eventos + deals com parceiros comerciais.

**Partes ativas:**
1. **Curadoria** — admin aprova membros, define tier e tags
2. **Benefícios em evento** — produtor configura lotes/listas MV por tier no evento
3. **Deals com parceiros** — bares/restaurantes oferecem deals (barter/desconto) para membros
4. **Passaportes** — aprovação por cidade
5. **Convites via link** — admin gera link para convidar membro ou parceiro
6. **Infrações** — NO_SHOW e NÃO_POSTOU com bloqueio progressivo
7. **Assinaturas** — comunidade paga plano (Básico/Pro/Enterprise) para usar MV

---

## 2. TIERS ATUAIS

### No banco (tiers_mais_vanta — 5 registros)

| Ordem | ID (slug) | Nome exibido | Descrição |
|---|---|---|---|
| 0 | `desconto` | Desconto | Membro recebe desconto no ingresso. Não aparece como "MAIS VANTA" |
| 1 | `convidado` | Convidado | Membro ganha nome na lista ou ingresso |
| 2 | `presenca` | Presença | Pessoas que elevam o ambiente visualmente |
| 3 | `creator` | Creator | Influencers com obrigação de postar |
| 4 | `vanta_black` | Vanta Black | Celebridades, tratamento VIP direto |

### Tipo TypeScript (types/clube.ts)
```ts
type TierMaisVanta = 'desconto' | 'convidado' | 'presenca' | 'creator' | 'vanta_black'
```

### Regras de tier
- Tier é interno (nunca exibido ao membro)
- Sem cascata: membro recebe APENAS benefício do SEU tier exato (`===`)
- `desconto` mostra preço menor sem label "MAIS VANTA" (label genérica "desconto" em emerald)
- `vanta_black` é configurado só via curadoria, excluído da config do produtor

### CHECK constraints no banco
- `membros_clube.tier`: desconto, convidado, presenca, creator, vanta_black
- `solicitacoes_clube.tier_atribuido`: idem (nullable)
- `mais_vanta_lotes_evento.tier_minimo`: idem
- `membros_clube.status`: PENDENTE, APROVADO, REJEITADO, BLOQUEADO, BANIDO
- `solicitacoes_clube.status`: PENDENTE, APROVADO, REJEITADO, CONVIDADO (falta ADIADO no banco!)

---

## 3. TABELAS NO BANCO (16 tabelas)

### Dados no banco (registros atuais)
| Tabela | Registros |
|---|---|
| membros_clube | 1 |
| solicitacoes_clube | 1 |
| tiers_mais_vanta | 5 |
| planos_mais_vanta | 3 |
| mais_vanta_config | 1 |
| Todas as outras | 0 |

### membros_clube (28 colunas)
| Coluna | Tipo | Nullable | Descrição |
|---|---|---|---|
| id | UUID PK | NO | auto |
| user_id | UUID FK profiles | NO | UNIQUE |
| tier | TEXT | NO | desconto/convidado/presenca/creator/vanta_black |
| instagram_handle | TEXT | YES | @ do Instagram |
| instagram_seguidores | INT | YES | Qtd seguidores |
| aprovado_por | UUID | NO | Quem aprovou |
| aprovado_em | TIMESTAMPTZ | NO | default now() |
| convidado_por | UUID | YES | Quem convidou |
| ativo | BOOLEAN | NO | default true |
| instagram_verificado_em | TIMESTAMPTZ | YES | Última verificação |
| meta_user_id | TEXT | YES | Instagram Business ID |
| comunidade_origem | UUID FK comunidades | YES | Onde foi aprovado |
| castigo_ate | TIMESTAMPTZ | YES | @deprecated |
| castigo_motivo | TEXT | YES | @deprecated |
| bloqueio_nivel | INT | YES | 0=limpo, 1=1º, 2=2º, 3=banido |
| bloqueio_ate | TIMESTAMPTZ | YES | Se > now = bloqueado |
| banido_permanente | BOOLEAN | YES | default false |
| banido_em | TIMESTAMPTZ | YES | Quando banido |
| instagram_verificado | BOOLEAN | YES | default false |
| categoria | TEXT | YES | Sync com tier |
| alcance | TEXT | YES | NANO/MICRO/MACRO/MEGA |
| genero | TEXT | YES | M/F/NB |
| cidade_base | TEXT | YES | Cidade do membro |
| interesses | TEXT[] | YES | default '{}' |
| nota_engajamento | NUMERIC | YES | Score |
| status | TEXT | NO | PENDENTE/APROVADO/REJEITADO/BLOQUEADO/BANIDO |
| nota_interna | TEXT | YES | Nota admin |
| tags | TEXT[] | YES | Tags internas default '{}' |

### solicitacoes_clube (16 colunas)
| Coluna | Tipo | Nullable | Descrição |
|---|---|---|---|
| id | UUID PK | NO | auto |
| user_id | UUID FK profiles | NO | |
| instagram_handle | TEXT | NO | Obrigatório |
| instagram_seguidores | INT | YES | |
| convidado_por | UUID | YES | |
| status | TEXT | NO | PENDENTE/APROVADO/REJEITADO/CONVIDADO |
| criado_em | TIMESTAMPTZ | NO | default now() |
| resolvido_em | TIMESTAMPTZ | YES | |
| resolvido_por | UUID | YES | |
| tier_atribuido | TEXT | YES | Tier se aprovado |
| instagram_verificado | BOOLEAN | YES | default false |
| instagram_verificado_em | TIMESTAMPTZ | YES | |
| codigo_verificacao | TEXT | YES | ex: VANTA-K8M2 |
| tier_pre_atribuido | TEXT | YES | |
| profissao | TEXT | YES | |
| como_conheceu | TEXT | YES | |

**Nota:** Coluna `indicado_por_texto` existe no código/migration (20260311130000) mas pode não estar aplicada no cloud.

### mais_vanta_lotes_evento (9 colunas) — config benefícios por tier no evento
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | auto |
| evento_id | UUID FK eventos_admin | |
| tier_minimo | TEXT | CHECK: 5 tiers |
| tipo | TEXT | 'ingresso' ou 'lista' |
| lote_id | UUID FK lotes | Se tipo=ingresso |
| lista_id | UUID FK listas_evento | Se tipo=lista |
| desconto_percentual | INT 0-100 | Se tier=desconto |
| ativo | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | auto |

### resgates_mv_evento — reservas de benefício MV
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | auto |
| user_id | UUID FK profiles | Membro |
| evento_id | UUID FK eventos_admin | |
| lote_mv_id | UUID FK mais_vanta_lotes_evento | Qual benefício |
| status | TEXT | RESERVADO/USADO/CANCELADO/NO_SHOW/PENDENTE_POST |
| post_url | TEXT | Link do post |
| post_verificado | BOOLEAN | default false |
| reservado_em | TIMESTAMPTZ | auto |

### planos_mais_vanta (17 colunas)
3 planos: Básico (R$0), Pro (R$499), Enterprise (R$999)
Colunas: nome, descricao, preco_mensal, limite_eventos_mv, limite_membros, limite_vagas_evento, tier_minimo, acompanhante, prazo_post_horas, dias_castigo, preco_avulso, ativo, destaque, ordem

### tiers_mais_vanta — definição dos tiers
Colunas: id, nome, descricao, cor, icone, ordem, beneficio_padrao, ativo, criado_em

### assinaturas_mais_vanta — assinatura por comunidade
Colunas: id, comunidade_id (UNIQUE), plano, status, stripe_customer_id, stripe_subscription_id, valor_mensal, inicio, fim, criado_em, criado_por

### passport_aprovacoes — aprovação por cidade
Colunas: id, user_id, comunidade_id, cidade, status (PENDENTE/APROVADO/REJEITADO), solicitado_em, resolvido_em, resolvido_por

### infracoes_mais_vanta — infrações
Colunas: id, user_id, tipo (NO_SHOW/NAO_POSTOU), evento_id, evento_nome, criado_em, criado_por

### convites_mais_vanta — convites via link (admin → membro/parceiro)
Colunas: id, token (UNIQUE), tipo (MEMBRO/PARCEIRO), tier, cidade_id, parceiro_nome, criado_por, aceito_por, aceito_em, expira_em, status (PENDENTE/ACEITO/EXPIRADO/CANCELADO), criado_em

### cidades_mais_vanta
Colunas: id, nome (UNIQUE), estado, pais (default BR), ativo, gerente_id, criado_em, criado_por

### parceiros_mais_vanta
Colunas: id, nome, tipo (RESTAURANTE/BAR/etc), descricao, foto_url, endereco, cidade_id, instagram_handle, contato_*, plano (STARTER/PRO/ELITE), resgates_mes_limite/usados, trial_ativo, user_id, ativo

### deals_mais_vanta
Colunas: id, parceiro_id, cidade_id, titulo, tipo (BARTER/DESCONTO), obrigacao_barter, desconto_*, filtro_genero/alcance/categoria, vagas, vagas_preenchidas, inicio/fim, status (RASCUNHO/ATIVO/PAUSADO/ENCERRADO/EXPIRADO)

### resgates_mais_vanta
Colunas: id, deal_id, user_id, parceiro_id, status (9 estados), qr_token (UNIQUE), aplicado_em, selecionado_em/por, checkin_em, post_url/verificado/verificado_em, concluido_em. UNIQUE(deal_id, user_id)

### mais_vanta_config — config global (1 row)
### clube_config — config legada (0 rows)
### lotes_mais_vanta / reservas_mais_vanta — LEGACY (substituídos por mais_vanta_lotes_evento + resgates_mv_evento)

---

## 4. RPCs E TRIGGERS

### RPCs
| Nome | Arquivo migration | O que faz |
|---|---|---|
| aceitar_convite_mv(p_token) | 20260310100000 | Aceita convite via link. Cria membro_clube com tier do convite. SECURITY DEFINER |

### Triggers
| Nome | Tabela | O que faz |
|---|---|---|
| trg_evento_finalizado_noshow | eventos_admin | Quando evento → FINALIZADO, marca reservas RESERVADO como NO_SHOW + insere infração + bloqueio progressivo |
| check_deal_ativo_unico | deals_mais_vanta | 1 deal ativo por parceiro |
| update_vagas_deal | resgates_mais_vanta | Atualiza vagas_preenchidas no deal |
| update_resgates_parceiro | resgates_mais_vanta | Atualiza resgates_mes_usados no parceiro |

### Cron (Edge Functions)
| Nome | O que faz |
|---|---|
| notificar_lembrete_reserva_mv | Lembrete 12h antes do evento pra quem tem reserva MV |
| notif-infraccao-registrada | Notifica membro sobre infração |

---

## 5. EDGE FUNCTIONS RELACIONADAS

| Função | Linhas | O que faz |
|---|---|---|
| create-checkout | 133 | Cria sessão Stripe Checkout (para assinaturas MV) |
| stripe-webhook | 163 | Processa webhook Stripe (checkout.session.completed) |
| update-instagram-followers | 179 | Atualiza seguidores Instagram (Meta API) |
| notif-infraccao-registrada | — | Notifica sobre infração |

**Status:** Código existe mas SECRETS não configurados (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, META_ACCESS_TOKEN)

---

## 6. SERVICES (16 arquivos — 2203L + 581L extras)

### features/admin/services/clube/ (16 arquivos, 2203L)
| Service | Linhas | O que faz |
|---|---|---|
| index.ts | 252 | Fachada `clubeService` que agrega todos os sub-services |
| clubeCache.ts | 155 | TIER_ORDER, cache in-memory, mappers rowTo* |
| clubeSolicitacoesService.ts | 315 | CRUD solicitações, aprovar, rejeitar, adiar |
| clubeResgatesService.ts | 204 | CRUD resgates_mais_vanta (deals) |
| clubeDealsService.ts | 166 | CRUD deals_mais_vanta |
| clubeInfracoesService.ts | 158 | Infrações + bloqueio + consultas |
| clubePassportService.ts | 135 | Passaportes por cidade |
| clubeParceirosService.ts | 128 | CRUD parceiros_mais_vanta |
| clubeLotesService.ts | 122 | Benefícios MV por evento (mais_vanta_lotes_evento) |
| clubeReservasService.ts | 107 | Resgates de benefício em evento (resgates_mv_evento) |
| clubeConvitesService.ts | 103 | Convites via link (convites_mais_vanta) |
| clubeInstagramService.ts | 93 | Verificação Instagram (bio check, seguidores) |
| clubeCidadesService.ts | 78 | CRUD cidades_mais_vanta |
| clubeMembrosService.ts | 75 | Consultas membros (getByUserId, isMembro, tierSuficiente) |
| clubeTiersService.ts | 73 | Consultas tiers_mais_vanta |
| clubeConfigService.ts | 39 | Config global MV (mais_vanta_config) |

### Outros services MV
| Service | Linhas | O que faz |
|---|---|---|
| maisVantaConfigService.ts | 155 | Config MV global + helper Instagram |
| assinaturaService.ts | 426 | Assinaturas Stripe + planos |
| campanhasService.ts | 302 | Campanhas push MV (não implementado 100%) |

---

## 7. VIEWS — PAINEL ADMIN (15 views, ~5500L)

### Hub MAIS VANTA (MaisVantaHubView — 7 abas)
| Aba | View | Linhas | O que faz |
|---|---|---|---|
| Planos | PlanosMaisVantaView | 819 | CRUD planos (nome, preço, limites, tiers) |
| Cidades | CidadesMaisVantaView | 179 | CRUD cidades MV |
| Parceiros | ParceirosMaisVantaView | 365 | CRUD parceiros (bares, restaurantes) |
| Deals | DealsMaisVantaView | 455 | CRUD deals (barter/desconto) |
| Assinaturas | AssinaturasMaisVantaView | 287 | Gerenciar assinaturas de comunidades |
| Passaportes | PassaportesMaisVantaView | 280 | Gerenciar passaportes por cidade |
| Config | ConfigMaisVantaView | 426 | Config global MV |

### Curadoria (CURADORIA_MV — TabClube com 7 sub-abas)
| Sub-aba | Componente | Linhas | O que faz |
|---|---|---|---|
| Solicitações | SubTabSolicitacoes | 212 | Fila de solicitações, aprovar/rejeitar/adiar, tags |
| Membros | SubTabMembros | 166 | Lista de membros, filtros por tier |
| Eventos | SubTabEventos | 202 | Eventos com MV ativo, config por tier |
| Posts | SubTabPosts | 64 | Posts pendentes de verificação |
| Passaportes | SubTabPassaportes | 50 | Passaportes pendentes |
| Config | SubTabConfig | 435 | Config benefícios por tier no evento |
| Notificações | SubTabNotificacoes | 42 | Placeholder |
| — | PerfilMembroOverlay | 219 | Overlay de perfil do membro (tier, tags, nota) |
| — | TagsPredefinidas | 149 | 33 tags em 6 categorias |
| — | tierUtils.ts | 85 | Labels, cores, opções de tiers |

### Views globais standalone
| View | Linhas | O que faz |
|---|---|---|
| MonitoramentoMaisVantaView | 80 | Dashboard monitoramento |
| DividaSocialMaisVantaView | 317 | Membros com dívida social |
| MembrosGlobaisMaisVantaView | 573 | Todos os membros cross-comunidade |
| EventosGlobaisMaisVantaView | 299 | Eventos com MV ativo |
| InfracoesGlobaisMaisVantaView | 293 | Infrações cross-comunidade |
| ConvitesMaisVantaView | 382 | Convites via link |
| AnalyticsMaisVantaView | 323 | Analytics (membros, resgates, parceiros) |

---

## 8. VIEWS — MEMBRO (4 views, ~1800L)

| View | Linhas | O que faz |
|---|---|---|
| ClubeOptInView | 961 | Tela "MAIS VANTA" no perfil: solicitar entrada, ver status, reservas, passaportes, deals |
| DealsMembroSection | 391 | Feed de deals + modal QR VIP dourado |
| MaisVantaBeneficioModal | 193 | Modal de benefício MV na página do evento |
| MaisVantaReservaModal | 212 | Modal de resgate/reserva de benefício |

---

## 9. PÁGINAS STANDALONE (2 routes)

| Rota | Componente | Linhas | O que faz |
|---|---|---|---|
| /convite-mv/:token | AceitarConviteMVPage | 242 | Aceitar convite via link. Se não logado: AuthModal inline |
| /parceiro | ParceiroDashboardPage | 567 | Painel do parceiro: deals, resgates, QR scan |

---

## 10. TYPES (types/clube.ts — 295L)

### Interfaces principais
| Interface | Campos-chave |
|---|---|
| MembroClubeVanta | userId, tier, instagramHandle, instagramSeguidores, bloqueioNivel, bloqueioAte, banidoPermanente, tags, notaInterna |
| LoteMaisVanta | id, eventoId, tierMinimo, tierId, quantidade, reservados, prazo, descricao, acompanhantes, tipoAcesso |
| ReservaMaisVanta | id, loteMaisVantaId, eventoId, userId, status (5 estados), postVerificado, postUrl |
| SolicitacaoClube | id, userId, instagramHandle, status (PENDENTE/APROVADO/REJEITADO/CONVIDADO/ADIADO), profissao, comoConheceu |
| NotificacaoClubePayload | userId, tipo (5 tipos), eventoId, titulo, corpo |
| PassportAprovacao | id, userId, comunidadeId, cidade, status |
| TierMaisVantaDef | id, nome, descricao, cor, icone, ordem, beneficioPadrao, ativo |
| ClubeConfig | prazoPostHoras, diasCastigoNoShow, notificacoesPush, verificacaoInstagram, beneficios* por tier |

---

## 11. SIDEBAR / NAVEGAÇÃO ADMIN

SubViews relacionadas a MV no AdminDashboardView:
- `MAIS_VANTA_HUB` → MaisVantaHubView (7 abas)
- `CURADORIA_MV` → TabClube (7 sub-abas)
- `MONITORAMENTO_MV`, `ASSINATURAS_MV`, `PASSAPORTES_MV`
- `DIVIDA_SOCIAL_MV`, `MEMBROS_GLOBAIS_MV`, `EVENTOS_GLOBAIS_MV`, `INFRACOES_GLOBAIS_MV`
- `CIDADES_MV`, `PARCEIROS_MV`, `DEALS_MV`
- `CONVITES_MV`, `ANALYTICS_MV`

---

## 12. FLUXOS QUE FUNCIONAM HOJE

### Solicitar entrada
1. Perfil → ClubeOptInView → preenche instagram, profissão, como conheceu
2. INSERT solicitacoes_clube (PENDENTE)
3. Admin vê em SubTabSolicitacoes

### Aprovar membro
1. Admin define tier + tags + nota interna
2. UPDATE solicitacao APROVADO + INSERT membros_clube
3. Notificação MV_APROVADO

### Rejeitar (vai sumir no V3)
1. Admin clica Rejeitar → UPDATE solicitacao REJEITADO
2. SEM notificação ao membro (rejeição silenciosa)

### Adiar
1. Admin clica Adiar → UPDATE solicitacao ADIADO
2. Sai da fila de pendentes

### Config benefícios no evento
1. CriarEvento/EditarEvento → toggle MAIS VANTA → Step2Ingressos
2. Produtor configura por tier: ingresso OU lista + desconto percentual
3. INSERT mais_vanta_lotes_evento

### Resgatar benefício
1. Membro vê benefício na EventDetailView → MaisVantaBeneficioModal
2. Confirma → INSERT resgates_mv_evento (RESERVADO)
3. Check-in na portaria → USADO automaticamente

### Convite via link (admin)
1. Admin gera link em ConvitesMaisVantaView
2. Link com token → /convite-mv/:token
3. Convidado aceita → RPC aceitar_convite_mv → INSERT membros_clube

### NO_SHOW automático
1. Evento muda para FINALIZADO
2. Trigger marca reservas RESERVADO como NO_SHOW
3. Insere infração + aplica bloqueio progressivo
4. Notificação ao membro

### Deals com parceiros
1. Parceiro sugere deal (RASCUNHO) ou admin cria
2. Admin ativa deal → membros veem no ClubeOptInView/DealsMembroSection
3. Membro aplica → QR VIP → parceiro escaneia → check-in → post → concluído

---

## 13. TOTAIS

- **16 tabelas** no banco
- **19 services** (16 clube/ + 3 extras)
- **26 views/componentes** (15 admin + 4 membro + 2 standalone + 5 curadoria helpers)
- **~14.300 linhas** de código MV total
- **1 RPC** (aceitar_convite_mv)
- **4 triggers** (noshow, deal ativo, vagas deal, resgates parceiro)
- **4 edge functions**
- **14 subViews** no AdminDashboard
- **2 rotas standalone** (/convite-mv, /parceiro)
