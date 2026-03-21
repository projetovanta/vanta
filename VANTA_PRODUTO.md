# VANTA — Manual do Produto

> Fonte da verdade sobre O QUE a VANTA e, PRA QUEM, e COMO funciona como negocio.
> Para detalhes de CODIGO, consultar VANTA_LIVRO.md. Para FLUXOS de tela, consultar VANTA_FLUXOS.md.
> Atualizado: 2026-03-21

---

## Sumario

1. [Visao e Posicionamento](#1-visao-e-posicionamento)
2. [Modelo Financeiro](#2-modelo-financeiro)
3. [Design do Produto](#3-design-do-produto)
4. [MAIS VANTA (Clube)](#4-mais-vanta-clube)
5. [Decisoes Ativas do Dan](#5-decisoes-ativas-do-dan)
6. [Features Futuras (Decididas)](#6-features-futuras-decididas)
7. [Pendencias Tecnicas](#7-pendencias-tecnicas)
8. [Pendencias Externas](#8-pendencias-externas)
9. [Regras de Comunicacao](#9-regras-de-comunicacao)
10. [Identidade Visual](#10-identidade-visual)
11. [Protecao Legal](#11-protecao-legal)

---

## 1. Visao e Posicionamento

**O que e:** Plataforma de descoberta de vida noturna no Brasil. NAO e ticketeria — e o app que responde "o que tem de bom pra fazer hoje".

**Segredo (Thiel):** Membro NAO paga pelo clube. Quem paga e o empresario (dono do evento/bar/restaurante) que quer acesso a base curada. Ativo real = dados comportamentais do publico noturno.

**Flywheel:** mais membros → mais valor pro empresario → mais beneficios → mais membros.

### BrandScript (Donald Miller — SB7)

| Elemento | Definicao |
|----------|-----------|
| Heroi | Jovem que quer viver a melhor versao da noite |
| Problema externo | Nao sabe o que tem de bom pra fazer hoje |
| Problema interno | Se sente por fora, perdendo experiencias, pagando caro |
| Problema filosofico | Ninguem deveria perder a melhor noite por falta de info |
| Vilao | Fragmentacao — info espalhada em Instagram, WhatsApp, sites |
| Guia (VANTA) | Curadoria inteligente + beneficios reais sem custo pro membro |
| Plano | 1. Faca parte → 2. Descubra o que rola → 3. Viva com beneficios |
| Chamada | "Faca parte" / "Quero ser membro" |
| Sucesso | Acesso, beneficios e experiencias exclusivas |
| Fracasso | Continuar por fora, pagando preco cheio |

### Mensagens Aprovadas
- **One-liner:** "Beneficios exclusivos nos melhores lugares da cidade. Pra quem e membro."
- **Slogan:** "A noite e sua. Se voce faz parte."
- **App Store:** "Eventos, beneficios e experiencias exclusivas. Faca parte do MAIS VANTA."
- **Posicionamento:** "O app que sabe o que ta rolando na sua cidade"

---

## 2. Modelo Financeiro

### 4 Fontes de Receita

**1. Taxa por ingresso vendido no app**
- % variavel por negocio (master define ao criar comunidade)
- Padrao sugerido: ~10% (mercado cobra 12-20%)
- Minimo por ingresso: R$ 2
- Quem paga: produtor absorve OU repassa ao comprador (escolha do produtor)

**2. Assinaturas dos produtores (MAIS VANTA lado B)**
- Plano mensal pro programa MV nos eventos
- Negociavel caso a caso

**3. Taxas operacionais**
- Processamento Stripe: 3.49% + R$ 0.39 (cartao) / 0.80% (PIX)
- Nomes excedentes na lista: R$ 0.50/nome
- Cortesias excedentes: 5% do valor face
- Taxa fixa por evento: opcional

**4. Publicidade no Vanta Indica**
- Cards patrocinados no carrossel de destaques (formato nativo)
- Modelo: negociavel (CPM, fixo, pacote) — implementacao futura

### Fluxo de Pagamento
```
Comprador paga → Stripe processa → retido
  → D+15 apos evento → Master autoriza → Stripe paga produtor
  → Taxa VANTA ja descontada
```

### Regras Financeiras
- Checkout SEMPRE no site (nunca in-app — Apple cobra 30%). ⚠️ PENDENTE: hoje o checkout funciona in-app via Stripe redirect — migrar pra abrir no browser externo
- Stripe Connect: cada produtor tem sub-conta
- Produtor recebe D+15 (seguranca contra chargebacks)
- Master DEVE autorizar todo repasse
- Reembolso: produtor absorve (taxa VANTA nao devolvida)
- Porta/presencial: VANTA NAO processa pagamento — so emite QR e registra entrada
- NFS-e OBRIGATORIA pra cada taxa (fase 1: manual, fase 2: NFe.io)

### Taxas Negociaveis (11 campos)

| Taxa | Default | Negociavel | Heranca |
|---|---|---|---|
| taxa_servico (%) | Master define | Por comunidade | Comunidade → Evento |
| taxa_minima | R$ 2 | Por comunidade | Comunidade → Evento |
| taxa_processamento (%) | Stripe define | Cascata: VANTA absorve ou repassa ao produtor → produtor absorve ou repassa ao cliente | gateway_fee_mode (ABSORVER/REPASSAR) |
| taxa_porta (%) | = servico | Por comunidade | Comunidade → Evento |
| taxa_fixa_evento | R$ 0 | Por evento | Evento |
| nomes_lista_cota | 500 | Por comunidade | Comunidade → Evento |
| taxa_nome_excedente | R$ 0.50 | Por comunidade | Comunidade → Evento |
| cortesias_cota | 50 | Por comunidade | Comunidade → Evento |
| taxa_cortesia_excedente (%) | 5% | Por comunidade | Comunidade → Evento |
| prazo_pagamento_dias | Negociado | Por evento | Evento |
| quem_paga_servico | PRODUTOR_ESCOLHE | Por evento | Evento |

**Heranca 3 niveis:** Master define defaults na comunidade → Evento herda automaticamente → Produtor pode modificar na criacao → Master aprova/rejeita/contrapropoe (max 3 rodadas)

### Condicoes Comerciais
- Master define condicoes caso a caso
- Responsavel tem 7 dias pra aceitar
- Nao aceitou no prazo → atividades pausadas automaticamente
- Aceite digital com timestamp (Marco Civil art. 7)
- Historico de negociacoes salvo (auditoria)

---

## 3. Design do Produto

### Camadas de Acesso
- **Sem conta (guest):** navega livremente (Home, Busca, Radar). Modal so ao interagir
- **Com conta:** quase tudo (comprar, curtir, mensagem, social)
- **Membro MAIS VANTA:** beneficios exclusivos + curadoria personalizada
- Conta e clube sao SEPARADOS — criar conta nao te torna membro

### Tab Bar — 5 abas fixas + 1 condicional
Inicio, Radar, Buscar, Mensagens, Perfil + ADMIN_HUB (so pra admins)

### Home (por camada)
- **Guest:** mesma Home que logado + GuestSignupBanner entre secoes. Sem nome na saudacao
- **Com conta:** Saudacao → VANTA Indica (Highlights) → Proximos Eventos → Indica Pra Voce → Mais Vendidos 24h → Locais Parceiros → Descubra Cidades → Beneficios MAIS VANTA
- **Membro MV:** Saudacao + coroa → "Seus Beneficios" (card dourado) → resto igual ao logado

### VANTA Indica (Highlights)
- 7 tipos: EVENTO, PARCEIRO, MAIS_VANTA, EXPERIENCIA, INFORMATIVO, DESTAQUE_EVENTO, PUBLICIDADE
- Banner MV separado MORRE → vira card dentro do Indica (so pra nao-membros)
- Curadoria editorial manual (diferencial impossivel de copiar)
- Badges: Evento (verde), Parceiro (ambar), MV (dourado), Experiencia (roxo), Informativo (sem foto)

### Detalhe do Evento
- Estrutura: Header foto → Social Proof → Info → Descricao → [Comemorar] → [Secao MV] → Footer
- "Eu vou!" em TODO evento (social, nao compra). Alimenta "Amigos Vao"
- Footer adaptativo: Pago ("Eu vou!" secundario + "Garantir Ingresso" dourado), Gratuito ("Eu vou!" dourado), Confirmado ("Confirmado ✓"), MV ("Voce tem beneficio" expansivel)
- Social proof: amigos primeiro (foto+nome), depois total geral
- Secao MV pra nao-membro: tom sutil — "Este evento tem vantagens pra membros"

### Checkout
- Escolhe variacao → CPF se falta → telefone se falta → Stripe se pago
- Sucesso: confete + "Presenca garantida!" + "Ver meu ingresso". SEM MV, SEM social proof
- "Tem um codigo?" no lugar de "Cupom"
- Linguagem: "Garantir" em vez de "Processar"

### Onboarding — Login + 3 Steps
Login/Cadastro (separado, em AuthModal.tsx / LoginView.tsx):
- "A noite da sua cidade num so lugar" + "Criar Conta" + "Ja tem conta?"
- Cadastro: nome, email, senha, nascimento, termos

Onboarding pos-cadastro (OnboardingView.tsx, 3 steps):
1. Cidade: busca IBGE + localizacao
2. Interesses: chips (opcional, pode pular)
3. Boas-vindas: "Pronto, [Nome]. Sua noite comeca aqui." + animacao dourada

### Perfil — 17 sub-views
MAIN, EDIT_PROFILE, PREFERENCES, MINHA_EXPERIENCIA, WALLET (legado→redir), MY_TICKETS, PUBLIC_PREVIEW, CHAT_ROOM, PREVIEW_PUBLIC, PREVIEW_FRIENDS, HISTORICO, CLUBE, MEIA_ENTRADA, SOLICITAR_PARCERIA, MINHAS_SOLICITACOES, PENDENCIAS, BLOQUEADOS

### Guest Modal
- "Crie sua conta" + Sparkles dourado (nao Shield cinza)
- Texto contextual: adapta ao que o guest tentou fazer (curtir/comprar/mensagem/perfil)
- Botoes: "Ja tenho conta" (dourado) / "Criar Conta" (borda) / "Agora nao" (texto)

### Radar
- Mapa de eventos (futuros + ao vivo)
- Parceiros MV como pins — todos veem, so membros veem beneficio

### Buscar
- 4 sub-abas: Eventos, Pessoas, Lugares, "Pra Voce"
- "Pra Voce" visivel pra todos, blur/lock pra nao-membros (FOMO)

### Mensagens
- Chat 1-a-1 essencial (so texto, sem fotos, sem grupos)
- Pos-lancamento: notif contextual, status/mood, grupos por evento

### Painel Admin (Lado B)
- NAO simplificar — o valor e tudo num lugar so
- Dashboard inicial impactante: vendas, publico, financeiro, equipe, MV
- Onboarding produtor: tour guiado na primeira vez
- SEM comparativo com concorrentes

### Painel Parceiro
- Card "Impacto VANTA": X clientes via VANTA + economia vs ads
- Card "Seu Publico": perfil AGREGADO (nunca individual — LGPD)
- Beneficios ativos + timeline resgates + QR Scanner

---

## 4. MAIS VANTA (Clube)

### Modelo
- Membro NAO paga. Empresario paga.
- Curadoria por formulario + aprovacao manual
- Tiers internos (lista/presenca/social/creator/black) sao 100% INVISIVEIS ao membro
- Badge discreta (coroa dourada) ao lado do nome — quem e de dentro sabe
- NUNCA usar "deals" — tudo em portugues
- NUNCA usar "gratis" — tom e exclusividade e curadoria

### Convites (motor de crescimento)
- Pre-cadastro: 50-100 fundadores selecionados manualmente
- Cada fundador recebe 3 convites
- Ganhar mais: check-in (+1), 3 aprovados (+1), resgate parceiro (+1), indicou Creator/Black (+2)
- Perder: convidou nao-aprovado, no-show, inatividade 60+ dias
- Maximo acumulado: 10 convites

### Onde MV aparece (sinais sutis)
1. Detalhe do evento: selo "Membros tem beneficios neste evento"
2. Pos-compra: mencao beneficios MV
3. Perfil de outro usuario: badge coroa
4. Card evento na Home: icone dourado no canto
5. Carteira: secao "Beneficios disponiveis"

### Onde MV NAO aparece
- Pop-up na abertura
- Banner grande "Seja membro!"
- Push pedindo pra entrar
- Modal interrompendo fluxo
- **Regra: MV nunca interrompe. Ele e descoberto.**

---

## 5. Decisoes Ativas do Dan

### Visual e UI
- Preco: Inter Bold, centralizado
- Badges: fundo 400/50 + texto 100 + sombra
- EventCard: sem social proof, aspect 4/5
- Fonte: Playfair Display Bold 700
- Responsividade: minimo 360px, maximo 500px
- Profundidade visual: "preto nao preto" — contraste sutil entre camadas

### Home e Navegacao
- Chips NAO aparecem por padrao — so com filtros ativos pelo engrenagem
- Indica pra Voce = posicao 2
- Filtro engrenagem = VOLATIL (estado local, reseta ao sair)
- Proximos Eventos mostra TUDO sempre
- Filtros ativos: chips com X, sem filtro = sem chips

### Comportamento
- User behavior: VIEW, PURCHASE, FAVORITE, DWELL → alimenta IndicaPraVoce
- Indica combina interesses do onboarding + behavior (behavior pesa mais)
- IndicaPraVoce = inteligencia automatica

### Comunidades e Eventos
- 26 tipos de espaco como formatos unicos
- 39 estilos musicais ativos
- Cada comunidade so cria evento do seu proprio tipo
- PRODUTORA = todos os formatos

### Admin
- Pagina unica com secoes + etiquetas de uso
- Interesses = so genuinos
- Form/Wizard components: manter + migracao gradual
- Badge "Acontecendo Agora" vive no EventCard
- APIs Vercel (og, robots, sitemap) ativas — nunca deletar

---

## 6. Features Futuras (Decididas pelo Dan — 17/mar/2026)

| Area | Feature | Decisao |
|---|---|---|
| Carteira | PDF ingresso | Comprovante SEM QR (QR so no app/Wallet) |
| Carteira | Apple/Google Wallet | Sim, os dois (precisa conta Apple + GCP) |
| Carteira | Historico transferencias | Lista com nome e status |
| ~~Busca~~ | ~~Busca por lugares~~ | ~~JA IMPLEMENTADO — aba Lugares ativa no SearchView~~ |
| Busca | Autocomplete | Sugestoes ao vivo conforme digita |
| Busca | Historico buscas | Com opcao de limpar |
| ~~Dashboard~~ | ~~Realtime~~ | ~~JA IMPLEMENTADO — DashboardV2Home escuta vendas e check-ins via Supabase Realtime~~ |
| Dashboard | Notif promoter | Push + in-app quando gerente atribui cota |
| Dashboard | Remover da lista | So quem adicionou pode remover |
| Dashboard | Audit RBAC | Com data e quem atribuiu |
| Dashboard | Extrato financeiro | Completo com filtros |
| Chat | Fotos | Nao, so texto |
| Chat | Grupo | Nao, so 1 a 1 |
| RBAC | Cargo expira | Nao, fica ate remover |
| Financeiro | Nota fiscal | Via integracao NFe.io (quando tiver CNPJ) |
| Financeiro | Limite comunidades | Sem limite |
| Comunidade | Notif comunidade nova | Descartada |
| Comunidade | Notif desativar | Nao precisa |
| Comunidade | Validar CNPJ | API Receita Federal |
| Comunidade | Historico edicoes | Aba dedicada na comunidade |

---

## 7. Pendencias Tecnicas

- C5/C6/C7 — credenciais .env
- C17-C20 — mobile (Apple/Google)
- A5 — N+1 queries financeiro (Dan quer visao planilha)
- LGPD hard delete — decisoes tomadas, implementar
- Push web — config OK, precisa HTTPS (deploy producao)
- Verificar filtros da Search visualmente (5 modais)
- Google OAuth branding — trocar nome no Google Cloud Console
- Pagina publica Promoter/RP — plano desenhado, backend existe, 1 view + 1 rota
- 14 `as any` em 8 arquivos: chatSettingsService (5x workaround Supabase types), authService (2x cast profile), supabaseVantaService (2x join tipagem), achievementsService (1x data cast), eventosAdminCore (1x globalThis legitimo), dashboardAnalyticsService (1x tabela dinamica legitimo), CopiarModal (1x toggle set), ConfigMaisVantaView (1x null cast)
- Stripe TEST MODE ativo — precisa conta real pra producao

### MANTER DURANTE DESENVOLVIMENTO / DELETAR ANTES DO LANCAMENTO
- Funcao `atualizar_eventos_teste()` — pg_cron atualiza datas dos eventos de teste pra manter badges ativos (Acontecendo Agora, Comeca em Breve, etc.)
- Funcao `seed_eventos_home_vitrine()` — popula Home com eventos de exemplo
- ⚠️ REMOVER ambas + pg_cron job + dados seed antes de ir pra producao
- Eventos TESTE: IDs 101c9086, 4f7215b7, 1fad4f03, f6fb4b70
- Eventos seed: IDs b1000001-b1000009, c2000001-c2000018

---

## 8. Pendencias Externas

- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Google Cloud Console: OAuth Consent Screen com nome "VANTA" + logo (conta projetovanta@gmail.com)
- Registro INPI: "VANTA" e "MAIS VANTA" + software
- Termos de Uso + Politica de Privacidade com advogado LGPD
- Contador + advogado tributarista (regime + NFS-e)

---

## 9. Regras de Comunicacao

### Palavras PROIBIDAS no app
deals, gratis, gratuito, free, assinar, premium (no sentido de "pague mais")

### Palavras e termos preferidos
Beneficios exclusivos, membros, fazer parte, seus beneficios, lugares pra voce, pertencimento, acesso, experiencias, descobrir, o que ta rolando, garantir ingresso, confirmar presenca, usar beneficio

### Tom geral
- Mistura: insider + exclusividade + ponto de partida
- Linguagem de pertencimento, nao transacional
- "O que ta rolando" em vez de "Eventos disponiveis"
- "Fazer parte" em vez de "Assinar"
- "Seus beneficios" em vez de "Ofertas"
- "Lugares pra voce" em vez de "Estabelecimentos parceiros"

### Botoes adaptativos
- Pago: "Garantir Ingresso"
- Gratuito: "Eu vou!"
- Lotando (>80%): "Ultimas vagas" (vermelho)
- Membro MV com beneficio: "Voce tem beneficio" (dourado, expansivel com detalhe)

---

## 10. Identidade Visual

### Essencia da Marca
O VANTA e o amigo que sabe tudo — aquele que sempre sabe o que ta rolando, conhece todo mundo, consegue beneficio em qualquer lugar. Baseado na confianca da amizade.

### 3 Palavras-Guia
> **Confianca • Curadoria • Estilo**

### Tom Visual
NAO e clube frio/distante. E caloroso, confiavel e conectado — mas com estilo.

### Paleta — 3 Camadas
| Camada | Cores | Quando |
|--------|-------|--------|
| Base | Preto (#050505), Quase-preto (#0A0A0A), Cinza escuro (#1A1A1A) | Fundos, containers |
| Acento primario | Dourado (#FFD300) | CTAs, badges MV, destaques. **Max 10% da tela** |
| Acento secundario | Branco (#FFF), Cinza claro (#A1A1A1), Cinza medio (#525252) | Texto, icones, bordas |

Cores contextuais (SO em contextos especificos): Verde (#34D399) sucesso, Vermelho (#EF4444) urgencia, Badges Indica (verde/ambar/dourado/roxo)

### Tipografia — 2 Fontes
- **Playfair Display Bold 700** = titulos (NUNCA italic, NUNCA outro peso)
- **Inter** = corpo (Light 300, Regular 400, Medium 500, Semibold 600, Bold 700, Black 900)

### Fotografia
- Escuras, atmosfericas, pessoas estilosas (nao modelos), luzes de festa/neon/contraluz
- NUNCA fotos com flash direto. Aspecto 4:5 (cards) ou 16:9 (banners)
- Gradient overlay (from-black via-transparent) pra legibilidade

### Animacoes
- Transicoes: 300ms ease-out. Fades: 500ms. Botao: scale 0.95
- Nada piscando, nada pulando. Elegancia = calma
- Dourado: glow sutil (shadow 0.15 opacity) — nunca exagerado

### Regras Absolutas
- Dourado NUNCA mais que 10% da tela
- Borda dourada SEMPRE com opacidade (/20 a /30)
- Preto e o protagonista. Dourado e o acento.
- Profundidade visual: "preto nao preto" — contraste sutil entre camadas (fundo #050505, card #111, icone #1A1A1A)

---

## 11. Protecao Legal

### INPI (urgente)
- Registrar "VANTA" e "MAIS VANTA"
- Registrar software (protecao 50 anos)

### LGPD
- Consentimento granular (aceite separado pra dados de curadoria)
- Dados pro empresario: sempre AGREGADOS, nunca individuais
- Hard delete implementar

### Seguranca
- Ofuscacao no build (plugins Vite)
- Logica sensivel no servidor (Edge Functions + RPCs)
- Moat real = dados, nao codigo
