# MAIS VANTA — Diferenças: Versão Atual vs V3

> Gerado em 2026-03-11
> Compara o que EXISTE HOJE no código/banco com o que o V3 define

---

## 1. TIERS

### Atual → V3

| Atual (slug) | V3 (slug) | Mudança |
|---|---|---|
| `desconto` | `lista` | **RENOMEAR** — conceito muda: de "só desconto" para "todo mundo entra aqui" |
| `convidado` | ❌ REMOVIDO | **NÃO EXISTE no V3** — tier "convidado" some. Quem era convidado vira `lista` ou outro tier |
| `presenca` | `presenca` | ✅ Mantém (mesmo slug) |
| ❌ não existe | `social` | **NOVO no V3** — tier entre presença e creator |
| `creator` | `creator` | ✅ Mantém slug, mas ganha **sub-níveis** (200k/500k/1m) |
| `vanta_black` | `black` | **RENOMEAR** — de `vanta_black` para `black` |

### Sub-níveis de CREATOR
| Atual | V3 |
|---|---|
| Não existe | `creator_200k`, `creator_500k`, `creator_1m` — nova coluna `creator_sublevel` |

### TypeScript
| Atual | V3 |
|---|---|
| `'desconto' \| 'convidado' \| 'presenca' \| 'creator' \| 'vanta_black'` | `'lista' \| 'presenca' \| 'social' \| 'creator' \| 'black'` |

---

## 2. STATUS DE MEMBROS E SOLICITAÇÕES

### membros_clube.status
| Atual | V3 |
|---|---|
| PENDENTE, APROVADO, **REJEITADO**, BLOQUEADO, BANIDO | PENDENTE, APROVADO *(só esses dois)* |

**V3 remove REJEITADO** — "todo mundo é aprovado em pelo menos LISTA". BLOQUEADO e BANIDO não são mencionados no V3 (infrações existem mas impacto é descrito como "registro interno").

### solicitacoes_clube.status
| Atual | V3 |
|---|---|
| PENDENTE, APROVADO, **REJEITADO**, CONVIDADO | PENDENTE, APROVADO *(só esses dois)* |

**V3 remove REJEITADO e CONVIDADO**. ADIADO existe no código atual mas não no CHECK do banco (e continua no V3 implicitamente via "adiar" na curadoria).

---

## 3. CONVITES — MODELO DIFERENTE

### Atual: convites_mais_vanta
- **Admin gera** link para convidar membro OU parceiro
- Tipo: MEMBRO ou PARCEIRO
- Inclui tier pré-definido, cidade
- RPC `aceitar_convite_mv` cria membro direto

### V3: convites_clube (NOVO conceito)
- **Membro gera** link para indicar amigos
- Indicação NÃO garante aprovação — passa pela curadoria
- Quantidade de convites por tier (configurável pelo admin)
- Renovação por engajamento (+1 ao comparecer)
- Notificação pra quem indicou quando indicado é aprovado
- Não existe tipo PARCEIRO nos convites do membro

### Resumo
| Aspecto | Atual | V3 |
|---|---|---|
| Quem gera convite | Admin | **Membro** (admin pode convidar direto via "convite especial") |
| Garante aprovação? | Sim (pula curadoria) | **Não** (passa pela curadoria normal) |
| Tipo | MEMBRO / PARCEIRO | Só indicação de pessoa |
| Quantidade | Ilimitado (admin gera quantos quiser) | **Limitado por tier** + renovação por engajamento |
| Tabela | `convites_mais_vanta` | `convites_clube` (nova estrutura) |

---

## 4. CURADORIA — BALDES AUTOMÁTICOS

| Aspecto | Atual | V3 |
|---|---|---|
| Fila de solicitações | Lista simples, ordem cronológica | **Baldes automáticos** pré-classificados |
| Classificação | Manual (curador lê tudo) | Automática: "Provável CREATOR", "Provável PRESENÇA", etc. |
| Coluna `balde_sugerido` | Não existe | **NOVO** em `solicitacoes_clube` |
| Botão Rejeitar | Existe | **REMOVIDO** — todo mundo é aprovado em pelo menos LISTA |

### Baldes do V3 (5)
1. "Provável CREATOR" — 200k+ seguidores
2. "Provável PRESENÇA" — perfil visual forte
3. "Provável SOCIAL" — bem conectado com membros existentes
4. "Sem fit claro" — provavelmente LISTA
5. "Indicado por tier alto" — veio via convite de CREATOR/BLACK

---

## 5. TABELA DE CONFIG EVENTO

| Aspecto | Atual | V3 |
|---|---|---|
| Tabela | `mais_vanta_lotes_evento` | `mais_vanta_config_evento` (**RENOMEAR**) |
| Coluna `tipo` | `'ingresso' \| 'lista'` | `'ingresso' \| 'lista' \| 'desconto'` (desconto vira tipo separado) |
| Sub-nível creator | Não existe | `creator_sublevel_minimo` (**NOVO**) |
| Vagas | Não tem controle de vagas | `vagas_limite` + `vagas_resgatadas` (**NOVO**) |

---

## 6. PLANOS DO PRODUTOR

| Aspecto | Atual | V3 |
|---|---|---|
| Tabela | `planos_mais_vanta` (17 cols) | `planos_produtor` (**RENOMEAR** + reestruturar) |
| Quem usa | Comunidade (assinatura) | **Produtor** individual |
| Personalizado? | Não | Sim — `personalizado_para` (produtor específico) |
| Colunas novas | — | `tiers_acessiveis`, `limite_notificacoes_mes`, `preco_evento_extra`, `preco_notificacao_extra` |
| Colunas removidas | `tier_minimo`, `acompanhante`, `prazo_post_horas`, `dias_castigo`, `preco_avulso` | — |

### Assinaturas
| Aspecto | Atual | V3 |
|---|---|---|
| Tabela | `assinaturas_mais_vanta` (por comunidade) | `produtor_plano` (**NOVA** — por produtor) |
| Vínculo | Comunidade → plano | Produtor → plano |

---

## 7. CIDADES

| Aspecto | Atual | V3 |
|---|---|---|
| Tabela | `cidades_mais_vanta` (existe) | Mantém + adiciona `slug`, `lancada_em` |
| Acesso do membro | `passport_aprovacoes` (solicitação + aprovação manual) | **Automático** pra BLACK/CREATOR, solicitação simplificada pros demais (sem curadoria, só confirmação) |
| Colunas novas | `gerente_id`, `criado_por` | `slug`, `lancada_em` |

---

## 8. MEMBROS_CLUBE — COLUNAS

### Colunas que MUDAM
| Coluna atual | V3 | Mudança |
|---|---|---|
| `tier` (5 valores) | `tier` (5 novos valores) | Enum muda |
| `status` (5 valores) | `status` (2 valores) | Remove REJEITADO/BLOQUEADO/BANIDO |
| `castigo_ate` | ❌ | Já marcado @deprecated |
| `castigo_motivo` | ❌ | Já marcado @deprecated |
| `categoria` | ❌ | "sync com tier" — redundante, pode remover |

### Colunas NOVAS no V3
| Coluna | Tipo | Descrição |
|---|---|---|
| `creator_sublevel` | TEXT | `creator_200k` / `creator_500k` / `creator_1m` / null |
| `cidade_principal` | TEXT | Cidade informada no formulário |
| `cidades_ativas` | TEXT[] | Cidades com acesso ativo |
| `convites_disponiveis` | INT | Convites restantes |
| `convites_usados` | INT | Convites já usados |

### Colunas que EXISTEM HOJE mas V3 não menciona
| Coluna | Decisão necessária |
|---|---|
| `meta_user_id` | Instagram Business ID — manter? |
| `alcance` (NANO/MICRO/MACRO/MEGA) | V3 usa sub-níveis de creator ao invés disso |
| `genero` (M/F/NB) | V3 não menciona — manter pra filtros de deals? |
| `interesses` | V3 não menciona — manter? |
| `nota_engajamento` | V3 não menciona — manter? |
| `comunidade_origem` | V3 não tem vínculo comunidade → membro |
| `bloqueio_nivel` / `bloqueio_ate` / `banido_*` | V3 só fala em "registro interno" |

---

## 9. PARCEIROS E DEALS

| Aspecto | Atual | V3 |
|---|---|---|
| `parceiros_mais_vanta` | 16 colunas, planos STARTER/PRO/ELITE | **V3 NÃO MENCIONA** parceiros/deals |
| `deals_mais_vanta` | 20+ colunas, 5 status | **V3 NÃO MENCIONA** |
| `resgates_mais_vanta` | 15 colunas, 9 status | **V3 NÃO MENCIONA** |
| DealsMembroSection | 391L, QR VIP | **V3 NÃO MENCIONA** |
| ParceiroDashboardPage | 567L, standalone | **V3 NÃO MENCIONA** |

**Decisão necessária:** Parceiros/deals continuam existindo ou saem do V3?

---

## 10. INFRAÇÕES

| Aspecto | Atual | V3 |
|---|---|---|
| Tabela | `infracoes_mais_vanta` | V3 menciona "registro interno" mas não detalha tabela |
| Trigger NO_SHOW | Automático + bloqueio progressivo | V3 diz "pode impactar benefícios futuros" — menos específico |
| Views | InfracoesGlobaisMaisVantaView, DividaSocialMaisVantaView | V3 não menciona views específicas |

---

## 11. VIEWS ADMIN — O QUE MUDA

### Existem hoje, NÃO mencionadas no V3
| View | Status |
|---|---|
| PlanosMaisVantaView (819L) | Planos mudam de estrutura → reescrever |
| AssinaturasMaisVantaView (287L) | Assinaturas por comunidade → muda pra por produtor |
| PassaportesMaisVantaView (280L) | Passaportes simplificam no V3 |
| DealsMaisVantaView (455L) | V3 não menciona deals |
| ParceirosMaisVantaView (365L) | V3 não menciona parceiros |
| MonitoramentoMaisVantaView (80L) | V3 não menciona |
| DividaSocialMaisVantaView (317L) | V3 não menciona |
| ConvitesMaisVantaView (382L) | Convites mudam de modelo (admin → membro) |
| AnalyticsMaisVantaView (323L) | V3 menciona relatório do produtor (seção 8) — diferente |

### Novas no V3
| Funcionalidade | Descrição |
|---|---|
| Curadoria com baldes | Fila pré-classificada (substituir SubTabSolicitacoes) |
| Config convites por tier | Admin define quantidade de convites por tier |
| Planos do produtor (novo modelo) | Genéricos + personalizados, com limites granulares |
| Relatório MV no evento | Seção com métricas agregadas pós-evento |
| Tutorial primeiro uso | Quando produtor ativa MV pela primeira vez |

---

## 12. FLUXOS — COMPARAÇÃO

### Fluxo de solicitação
| Etapa | Atual | V3 |
|---|---|---|
| Campos | Instagram, profissão, como conheceu | + **cidade** (obrigatório) + aceite termos MV |
| Via convite | Admin gera link | **Membro gera link** (indicação) |

### Fluxo de aprovação
| Etapa | Atual | V3 |
|---|---|---|
| Rejeitar | Existe (silencioso) | **NÃO EXISTE** — todo mundo entra em LISTA |
| Adiar | Existe | Mantém (implícito) |
| Balde automático | Não existe | **NOVO** — pré-classificação |
| Notificação | Diferenciada por status | **Igual pra todos** ("Aprovado no MAIS VANTA!") |

### Fluxo de benefício no evento
| Etapa | Atual | V3 |
|---|---|---|
| Vagas | Sem controle explícito | **Limite de vagas** + lista de espera |
| Obrigação | Implícita | **Explícita antes do resgate** |
| Desconto tier baixo | Label "desconto" em emerald | **Silencioso** — preço menor sem label MV |

### Fluxo de convite
| Etapa | Atual | V3 |
|---|---|---|
| Quem gera | Admin | **Membro** |
| Aprovação automática? | Sim | **Não** (passa pela curadoria) |
| Quantidade | Ilimitada | **Limitada por tier** + renovação |

---

## 13. EDGE FUNCTIONS E RPCS

| Atual | V3 |
|---|---|
| `aceitar_convite_mv` (RPC) | Precisa adaptar — convite do membro não aprova direto |
| `create-checkout` (Stripe assinaturas) | Muda de comunidade pra produtor |
| `stripe-webhook` | Idem |
| `update-instagram-followers` | Mantém — V3 usa seguidores pra sub-níveis creator |
| `notif-infraccao-registrada` | V3 não detalha mas conceito persiste |

---

## 14. RESUMO — O QUE FAZER

### Remover do sistema
- Tier `desconto` (vira `lista`)
- Tier `convidado` (não existe no V3)
- Tier `vanta_black` (vira `black`)
- Status `REJEITADO` (membros e solicitações)
- Convites admin → membro (muda pra membro → membro)
- Assinaturas por comunidade (muda pra por produtor)
- Colunas deprecated: `castigo_ate`, `castigo_motivo`, `categoria`

### Adicionar ao sistema
- Tier `social` (novo)
- Tier `lista` (substitui desconto)
- Tier `black` (substitui vanta_black)
- Sub-níveis creator (`creator_sublevel`)
- Convites de membro (`convites_clube`)
- Baldes automáticos na curadoria (`balde_sugerido`)
- Vagas por config evento (`vagas_limite`, `vagas_resgatadas`)
- Planos do produtor (nova estrutura)
- Colunas: `cidade_principal`, `cidades_ativas`, `convites_disponiveis`, `convites_usados`

### Renomear
- `mais_vanta_lotes_evento` → `mais_vanta_config_evento`
- `planos_mais_vanta` → `planos_produtor`
- `assinaturas_mais_vanta` → `produtor_plano`

### Decisões pendentes (perguntar ao Dan)
1. Parceiros e deals — continuam no V3 ou saem?
2. Infrações/bloqueio/banimento — manter sistema progressivo ou simplificar?
3. Colunas `meta_user_id`, `alcance`, `genero`, `interesses`, `nota_engajamento` — manter?
4. `comunidade_origem` — V3 desvincula MV de comunidade?
5. Passaportes — manter tabela `passport_aprovacoes` ou simplificar pra `cidades_ativas[]`?
6. Status ADIADO — adicionar ao V3 formalmente?
