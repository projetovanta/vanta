# MAIS VANTA — SISTEMA COMPLETO
> Para implementação no Claude Code  
> Versão 2.0 | Março 2026

---

## 1. VISÃO GERAL

O MAIS VANTA é o clube exclusivo do app VANTA. Funciona como uma camada de benefícios silenciosa sobre os eventos — o membro nunca sabe exatamente por que recebe o que recebe, nem o que os outros recebem.

**Três partes:**
1. **Curador** — aprova membros e define tier internamente
2. **Produtor** — configura benefícios por tier ao criar/editar evento
3. **Membro** — resgata o benefício que foi mapeado pro tier dele

---

## 2. TIERS (INTERNOS — NUNCA EXIBIDOS AO MEMBRO)

| Valor | Slug | Nome interno | Descrição interna |
|---|---|---|---|
| 0 | `desconto` | DESCONTO | Aprovado só para receber promoções silenciosas |
| 1 | `convidado` | CONVIDADO | Pessoa agradável, circula nos lugares certos |
| 2 | `presenca` | PRESENÇA | Presença visual marcante, eleva o ambiente |
| 3 | `creator` | CREATOR | Alcance real, vai gerar conteúdo |
| 4 | `vanta_black` | VANTA BLACK | Nome conhecido, celebridade local/nacional |

**Regra de ouro:** O membro NUNCA vê o nome do tier. Ele só vê o benefício.

---

## 3. ESTRUTURA DE DADOS

### `membros_clube` — campos relevantes
```
tier: 'desconto' | 'convidado' | 'presenca' | 'creator' | 'vanta_black'
status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'BLOQUEADO' | 'BANIDO'
categoria: (sync com tier na aprovação)
nota_interna: text (nunca visível ao membro)
tags: text[] (nunca visíveis ao membro)
```

### `solicitacoes_clube` — campos relevantes
```
status: 'NONE' | 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CONVIDADO'
instagram: text
profissao: text
como_conheceu: text
indicado_por: uuid (profile_id, opcional)
```

### Nova tabela: `mais_vanta_lotes_evento`
```sql
CREATE TABLE mais_vanta_lotes_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid REFERENCES eventos_admin(id) ON DELETE CASCADE,
  tier_minimo text NOT NULL CHECK (tier_minimo IN ('desconto','convidado','presenca','creator','vanta_black')),
  tipo text NOT NULL CHECK (tipo IN ('ingresso', 'lista')),
  -- Se tipo = 'ingresso': referencia um lote existente
  lote_id uuid REFERENCES lotes(id),
  -- Se tipo = 'lista': referencia uma lista existente  
  lista_id uuid REFERENCES listas_evento(id),
  -- Se tier = 'desconto': percentual de desconto
  desconto_percentual int CHECK (desconto_percentual BETWEEN 0 AND 100),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## 4. FLUXO DO PRODUTOR

### 4.1 Ativar MAIS VANTA no evento

Na tela de criação/edição do evento, após assinar o MAIS VANTA, aparece o toggle:

```
[ATIVAR MAIS VANTA NESTE EVENTO]  ← toggle on/off
```

Quando ativado, abre seção: **"Configurar benefícios MAIS VANTA"**

### 4.2 Configuração por tier

O produtor vê os tiers em linguagem humana (não os nomes internos):

```
┌─────────────────────────────────────────────────────────┐
│ MAIS VANTA — Benefícios por perfil de membro            │
├─────────────────────────────────────────────────────────┤
│ 🎟️ Desconto silencioso                                  │
│   [  ] Ativar para este perfil                          │
│   Desconto: [___]%                                      │
│   Aplicar em qual lote: [dropdown lotes do evento]      │
├─────────────────────────────────────────────────────────┤
│ ✨ Perfil geral aprovado                                │
│   [  ] Ativar para este perfil                          │
│   Tipo: ( ) Ingresso  ( ) Lista                         │
│   Qual lote/lista: [dropdown]                           │
├─────────────────────────────────────────────────────────┤
│ 💫 Presença & Ambiente                                  │
│   [  ] Ativar para este perfil                          │
│   Tipo: ( ) Ingresso  ( ) Lista                         │
│   Qual lote/lista: [dropdown]                           │
├─────────────────────────────────────────────────────────┤
│ 📱 Criadores de conteúdo                                │
│   [  ] Ativar para este perfil                          │
│   Tipo: ( ) Ingresso  ( ) Lista                         │
│   Qual lote/lista: [dropdown]                           │
├─────────────────────────────────────────────────────────┤
│ ⭐ Perfil premium                                       │
│   Contato direto — configurar via curadoria             │
└─────────────────────────────────────────────────────────┘
```

**Notas de UX:**
- Labels em linguagem do produtor, não os nomes internos dos tiers
- Dropdown de lotes: mostra TODOS os lotes do evento (incluindo gratuitos e pagos)
- Dropdown de listas: mostra TODAS as listas do evento
- Produtor não sabe que "Presença & Ambiente" = tier PRESENÇA internamente
- Se não ativar um tier, membros daquele tier não veem benefício neste evento

### 4.3 Cascata de tiers

Membro com tier mais alto **sempre** herda benefícios de tiers abaixo se o superior não estiver configurado.

Exemplo: CREATOR configurado, PRESENÇA não configurado → membro PRESENÇA não recebe nada (não herda CREATOR — produtor escolheu explicitamente não ativar PRESENÇA).

> Decisão de negócio: sem cascata automática. O produtor controla exatamente quem recebe o quê.

---

## 5. FLUXO DO MEMBRO

### 5.1 Solicitação de acesso

1. Membro acessa: **Perfil → card "MAIS VANTA" → Solicitar acesso**
2. Preenche formulário:
   - Instagram (obrigatório)
   - Profissão / O que você faz (texto livre)
   - Como conheceu o VANTA (texto livre)
   - Quem te indicou (busca de membro — opcional)
3. Aceita os Termos de Uso do MAIS VANTA (checkbox obrigatório)
4. Status vira `PENDENTE`
5. Membro vê: *"Sua solicitação está em análise. Você será notificado."*

### 5.2 Visualização de benefício no evento

Quando membro APROVADO abre um evento com MAIS VANTA ativo:

```
┌─────────────────────────────────────────────────────────┐
│ ⭐ SEU BENEFÍCIO MAIS VANTA                             │
│                                                         │
│ VIP feminino — entrada gratuita até 22h                 │
│                                                         │
│ ⚠️ Ao resgatar, você se compromete a:                  │
│ • Comparecer ao evento                                  │
│ • [Se obrigação de post] Publicar post com             │
│   @maisvanta @[evento] #Publi em até 24h               │
│                                                         │
│ Termos completos: [ver termos]                          │
│                                                         │
│         [RESGATAR MEU BENEFÍCIO]                        │
└─────────────────────────────────────────────────────────┘
```

**Regras:**
- Membro sem tier aprovado: não vê esta seção
- Tier aprovado mas evento sem configuração para aquele tier: não vê esta seção
- Tier DESCONTO: vê o desconto aplicado no preço do lote (não como "benefício MAIS VANTA" — simplesmente o preço aparece menor)
- Obrigação exibida antes do clique — nunca surpresa

### 5.3 Após resgatar

- Recebe confirmação com resumo do benefício e obrigação
- Notificações automáticas conforme timing configurado
- Portaria faz check-in normalmente → para CONVIDADO/PRESENÇA, check-in encerra obrigação automaticamente

---

## 6. CURADORIA — PAINEL ADMIN

### 6.1 SubTabSolicitacoes (simplificado)

**Fila com:**
- Foto, nome, profissão declarada
- Link direto pro Instagram (abre no browser)
- Quem indicou (se houver)
- Data da solicitação

**Ao clicar no perfil:**
- Todos os dados preenchidos
- Campo **Tier** (dropdown — nomes internos: DESCONTO / CONVIDADO / PRESENÇA / CREATOR / VANTA BLACK)
- Campo **Tags** (multi-select, lista definida abaixo)
- Campo **Nota interna** (textarea — nunca visível ao membro)
- Botões: **APROVAR** | **REJEITAR** | **ADIAR**

Ao aprovar: sync `membros_clube.categoria` com o tier escolhido.

Ao rejeitar: membro fica em status REJEITADO, não recebe notificação de rejeição. Mensagem genérica opcional: *"Sua solicitação não avançou desta vez."*

### 6.2 Tags internas (nunca visíveis ao membro)

**Influência:**
- `influ_nano` — 1k–10k seguidores
- `influ_micro` — 10k–50k
- `influ_mid` — 50k–200k
- `influ_macro` — 200k+
- `engajamento_alto` — taxa >5%
- `engajamento_morto` — taxa <0.5%

**Perfil:**
- `modelo` `atriz` `dj` `chef` `moda` `fitness` `midiatica`
- `celebridade_local` `celebridade_nacional`

**Rede:**
- `indicada_black` `indicada_creator` `indicada_presenca` `indicada_convidado` `organica`
- `rede_forte` — conhece 5+ membros ativos

**Comportamento:**
- `posta_bem` `nao_posta` `cumpre_obrigacao` `deveu_post` `frequente` `sumiu`

**Risco:**
- `risco_comportamento` `risco_imagem` `observacao`

**Fit:**
- `sem_fit` `fit_alto` `fit_medio`

---

## 7. RELATÓRIO DO PRODUTOR (PÓS-EVENTO)

Após o evento, produtor vê seção "MAIS VANTA" no relatório:

```
MAIS VANTA — Desempenho neste evento

Resgates: 47 benefícios resgatados
Comparecimento: 41/47 (87%)
Posts enviados: 23/23 (100%)
Posts verificados: 21/23 (91%)

Alcance estimado via posts: ~124.000 pessoas

[  ] Avaliar como eficiente  [  ] Avaliar como ineficiente
```

Isso permite ao produtor decidir se vale renovar o MAIS VANTA no próximo evento.

---

## 8. TERMOS DE USO — RESUMO PARA IMPLEMENTAÇÃO

Os termos completos estão no documento separado `MAIS_VANTA_TERMOS_DE_USO.md`.

**O que o membro aceita no momento da solicitação:**
1. Que a aprovação é discricionária e pode ser negada sem motivo
2. Que os benefícios variam por evento e por perfil
3. Que ao resgatar um benefício, assume obrigação (presença ou post)
4. Que descumprimento gera registro interno e pode bloquear acesso
5. Que os dados do Instagram podem ser consultados para análise de perfil

**O que deve aparecer antes do clique em RESGATAR:**
- Benefício específico (ex: "VIP feminino até 22h — gratuito")
- Obrigação específica (ex: "comparecer ao evento" ou "publicar post em 24h com @maisvanta @evento #Publi")
- Link para termos completos

---

## 9. IMPLEMENTAÇÃO — ORDEM SUGERIDA

### Fase 1 — Banco de dados
- [ ] Criar tabela `mais_vanta_lotes_evento`
- [ ] Adicionar campos de tags ao painel de curadoria (SubTabSolicitacoes)
- [ ] Adicionar campo `nota_interna` ao painel

### Fase 2 — Produtor
- [ ] Toggle "Ativar MAIS VANTA" na criação/edição do evento
- [ ] Seção de configuração de benefícios por tier (com linguagem em português)
- [ ] Salvar em `mais_vanta_lotes_evento`

### Fase 3 — Membro
- [ ] Card de benefício no EventDetailView (verificar tier + buscar configuração)
- [ ] Modal de resgate com obrigação explícita antes do clique
- [ ] Confirmação pós-resgate com resumo

### Fase 4 — Termos
- [ ] Tela de termos completos do MAIS VANTA (acessível sempre)
- [ ] Checkbox obrigatório no formulário de solicitação
- [ ] Exibição da obrigação específica antes do resgate

### Fase 5 — Relatório
- [ ] Seção MAIS VANTA no relatório do evento
- [ ] Métricas: resgates, comparecimento, posts

---

## 10. REGRAS DE NEGÓCIO CRÍTICAS

1. **Tier nunca é exibido ao membro** — nem na UI, nem nas notificações
2. **Rejeição nunca é comunicada** — membro fica em análise indefinidamente ou recebe mensagem neutra
3. **Obrigação SEMPRE aparece antes do resgate** — nunca surpresa pós-confirmação
4. **Termos sempre acessíveis** — link visível em qualquer ponto do fluxo MAIS VANTA
5. **Check-in encerra obrigação de presença** — automático para CONVIDADO/PRESENÇA
6. **VANTA BLACK é manual** — sem configuração de lote; curador gerencia diretamente
7. **Desconto silencioso** — tier DESCONTO não aparece como "benefício MAIS VANTA"; o preço simplesmente aparece diferente para o membro
