---
name: Redesign do App VANTA — Decisões e Diretrizes
description: Consolidação de todas as decisões sobre redesign do app baseado no novo posicionamento. Reunião completa com Peter Thiel, Donald Miller, Hormozi, Sugarman, Iris, Théo, Zara. Data: 2026-03-15.
type: project
---

## Contexto

Posicionamento definido: VANTA = descoberta + curadoria + benefícios. Não é ticketeria. Membro não paga pelo clube, empresário paga. Ver `memory/projeto_posicionamento.md`.

## Decisões do Dan (definitivas)

### Camadas de acesso
- **Sem conta**: vê parcialmente (Home e Busca sim, Mensagens/Perfil/Radar bloqueados)
- **Com conta**: quase tudo (comprar ingresso, ver eventos, mensagens, social)
- **Membro MAIS VANTA**: benefícios exclusivos em parceiros + acesso antecipado + curadoria personalizada
- Conta e clube são **separados** — criar conta não te torna membro automaticamente

### MAIS VANTA
- Tiers internos (lista/presenca/social/creator/black) são **100% invisíveis** ao membro
- Todo membro parece igual — vê só "seus benefícios" (que variam por tier, sem explicação)
- Badge discreta (coroa/estrela dourada) ao lado do nome — quem é de dentro sabe
- NUNCA usar a palavra "deals" — tudo em português
- NUNCA usar "grátis" — tom é exclusividade e curadoria
- Curadoria por formulário + aprovação manual (já implementado)

### Sistema de convites (motor de crescimento)
- Pré-cadastro: selecionar manualmente primeiros 50-100 fundadores
- Cada fundador recebe 3 convites
- Ganhar mais convites: check-in em evento (+1), 3 convidados aprovados (+1), resgate em parceiro (+1), indicou Creator/Black (+2)
- Perder/parar de ganhar: convidou gente não aprovada, no-show, inatividade 60+ dias
- Máximo acumulado: 10 convites
- Membro se torna curador involuntário — auto-curadoria distribuída

### Tab Bar
- Manter 5 abas: Início, Radar, Buscar, Mensagens, Perfil
- Melhorar conteúdo, não mudar estrutura

### Por aba

**Início (Home)**
- Serve todos os perfis: quem quer comprar rápido E quem quer explorar
- MAIS VANTA presente mas elegante — "quem é bom não precisa se auto afirmar"

Home por camada:
- **Sem conta**: vitrine atmosférica (logo + frase + fotos carrossel + preview de eventos com blur parcial + "Entrar" / "Explorar primeiro")
- **Com conta (sem MV)**: Saudação → VANTA Indica (com card MV) → Ao Vivo → Amigos Vão → Perto → Semana → Pra Você → Feed. 7 seções (removidos: Novos na Plataforma, Salvos→mover pro Perfil)
- **Membro MV**: Saudação + coroa dourada → seção "Seus Benefícios" no topo → VANTA Indica (sem card MV, mostra benefício) → restante igual Camada 2. Cards com benefício MV têm ícone dourado no canto

VANTA Indica (Highlights) — decisões:
- Expande de 3 pra 5 tipos: Evento, Parceiro, MAIS_VANTA, Experiência, Informativo
- **Banner MV separado MORRE** — MAIS VANTA vira card dentro do Indica (só pra não-membros)
- Pra membros: espaço do card MV mostra benefício disponível
- Curadoria editorial manual (diferencial — impossível copiar por IA)
- Cada tipo com badge visual diferente: Evento (verde), Parceiro (âmbar), MAIS VANTA (dourado), Experiência (roxo), Informativo (sem foto, minimalista)
- Primeiro card do Indica nunca é o mesmo tipo duas vezes seguidas (gera curiosidade)
- Automatização parcial futura (por enquanto manual)

**Radar**
- Manter como mapa de eventos (futuros + ao vivo)
- Não limitar a "o que tá rolando agora"
- Adicionar parceiros MAIS VANTA como pins no mapa — todos veem os parceiros, mas só membros veem que tem benefício

**Buscar**
- 3 sub-abas: Eventos, Pessoas, "Pra Você" (renomeado de Benefícios)
- "Pra Você" visível pra todos, mas com blur/lock pra não-membros (cria FOMO)
- Busca de Pessoas: manter como sub-aba, sem mudança

**Mensagens**
- Essencial — combinar de sair faz parte da experiência
- Manter chat 1-a-1 como está pro lançamento
- Pós-lançamento (v2): notificação contextual ("3 amigos vão na festa X"), status/mood ("Saindo hoje"), grupos por evento

**Perfil**
- SIMPLIFICADO de 13 sub-views pra 8: MAIN, EDIT_PROFILE, PREFERENCES, MINHA_EXPERIENCIA, CLUBE, MEIA_ENTRADA, PENDENCIAS, BLOQUEADOS
- Tela principal: foto+nome+badge → [Editar][Config] → Card "Minha Experiência" → Card "MAIS VANTA" (premium, separado) → lista (perfil público, pendências, meia-entrada, bloqueados, parceria)
- "Minha Experiência" = ingressos + presenças + benefícios usados + conquistas (absorve WALLET, MY_TICKETS, HISTORICO)
- MAIS VANTA = card premium separado (não mistura com Minha Experiência). Membros: card dourado com status/convites/benefícios. Não-membros: card com convite sutil
- Badge MV discreta (coroa dourada) ao lado do nome
- Removidos: CHAT_ROOM (já na aba Mensagens), MINHAS_SOLICITACOES (absorvido por Pendências), PREVIEW duplicados

**Detalhe do Evento**
- Estrutura: Header (foto hero) → Social Proof → Info → Descrição → [Comemorar] → [Seção MV] → Footer
- Seção MV pra não-membro: tom sutil — "Este evento tem vantagens pra membros" + link "Saiba mais" (sem botão grande)
- Seção MV pra membro: manter como está (benefício + botão resgatar)
- Botão "Eu vou!": presente em TODO evento (pago e gratuito). É declaração social, não compra. Alimenta "Amigos Vão" na Home
  - Pago: "Eu vou!" (secundário) + "Garantir Ingresso" (principal dourado)
  - Gratuito: "Eu vou!" como botão principal
  - Já comprou: "Garantido ✓" (verde)
  - Lotando: "Eu vou!" + "Últimas vagas" (vermelho)
- Social Proof: amigos primeiro (foto + nome), depois amigos de amigos, depois total geral
- Config privacidade: "Mostrar minha presença em eventos" — ligado por padrão, desligável
- Quando tem amigos: "João, Maria e Pedro vão + 23 pessoas"
- Quando não tem amigos: "47 pessoas confirmadas"

### Painel Admin (Lado B) — Dan aprovou
- NÃO simplificar tirando coisas — o painel já tem TUDO (vendas, equipe, cortesias, financeiro, portaria, relatórios, listas, MV)
- O valor é: tudo num lugar só. O empresário centraliza operação inteira no VANTA
- **Dashboard inicial impactante**: quando o empresário abre, vê tudo de cara — vendas, público, financeiro, equipe, MV — resumo visual que nenhum concorrente dá
- **Onboarding do produtor**: primeira vez no painel = tour guiado mostrando cada área e o que ele ganha
- SEM comparativo com concorrentes — "quem é bom não precisa comparar"
- Painel master (Dan/VANTA): continua igual, sem mudança

### Painel do Parceiro — Dan aprovou
- Card "Impacto VANTA" no topo: X clientes via VANTA + estimativa de economia vs ads
- Card "Seu Público": perfil AGREGADO (idade, gostos, frequência) — nunca individual (LGPD)
- Benefícios ativos + timeline de resgates + QR Scanner
- Visual com narrativa: números contam história, não só dados frios

### Checkout (Dan aprovou)
- Fluxo atual funciona: escolhe variação → CPF se falta → telefone se falta → Stripe se pago
- Tela de sucesso: **confirmação limpa** — confete + "Presença garantida!" + "Ver meu ingresso". SEM menção ao MV, SEM social proof, SEM "seus amigos vão saber"
- Renomear "Cupom" → "Tem um código?" ✅
- Linguagem: "Garantir" em vez de "Processar"

### Onboarding — 5 telas
1. **Vitrine**: foto atmosférica carrossel + logo + "A noite da sua cidade num só lugar" + botão "Fazer Parte" + "Já tem conta? Entrar"
2. **Cadastro**: nome, email, senha, nascimento, termos. Botão "Continuar" (não "Cadastrar")
3. **Cidade**: "Onde você curte a noite?" + busca IBGE + usar localização. Copy: "Pra mostrar o que tá rolando perto de você"
4. **Interesses** (opcional): chips de estilos musicais. Pode pular. Copy: "Quanto mais a gente sabe, melhor fica"
5. **Boas-vindas**: "Pronto, [Nome]. Sua noite começa aqui." + animação dourada + botão "Explorar"
- Regras: máximo 5 telas, pular sempre possível (exceto cadastro), sem menção ao MAIS VANTA no onboarding
- Visual: escuro, atmosférico, dourado mínimo, fotos de alta qualidade (Unsplash/Pexels até ter fotos reais), Playfair nos títulos
- Botão principal vitrine: "Criar Conta" (não "Fazer Parte" — muito compromisso pra quem não conhece)
- Botão secundário: "Já tem conta? Entrar"
- NÃO ter tela Vitrine bloqueante — guest navega livremente (Home, Busca, Radar). Modal aparece só quando tenta interagir (comprar, curtir, mensagem, perfil)

### Guest Modal (Dan aprovou)
- Trocar de "Área Restrita" + escudo → "Crie sua conta" + ✨ Sparkles dourado
- Texto CONTEXTUAL — adapta ao que o guest tentou fazer:
  - Tentou curtir: "Crie sua conta pra salvar eventos que você curte"
  - Tentou comprar: "Crie sua conta pra garantir seu ingresso"
  - Tentou mensagem: "Crie sua conta pra conversar com amigos"
  - Tentou perfil: "Crie sua conta pra ter seu perfil"
  - Genérico: "Crie sua conta pra aproveitar tudo que a noite tem de melhor"
- Botões: "Já tenho conta" (dourado principal) / "Criar Conta" (borda) / "Agora não" (texto)
- Ícone: Sparkles dourado (não Shield cinza)

### Tom geral do app
- Mistura de todas as sensações: insider + exclusividade + ponto de partida
- Linguagem de pertencimento, não transacional
- "O que tá rolando" em vez de "Eventos disponíveis"
- "Fazer parte" em vez de "Assinar"
- "Seus benefícios" em vez de "Ofertas/Deals"
- "Lugares pra você" em vez de "Estabelecimentos parceiros"

### Botões adaptativos
- Evento pago: "Garantir Ingresso"
- Evento gratuito: "Confirmar Presença"
- Evento lotando (>80%): "Últimas vagas" em vermelho
- Membro MV com benefício: "Usar Benefício" em dourado

### Onde o MAIS VANTA aparece (sinais sutis — Miller)
1. Detalhe do evento: selo "Membros têm benefícios neste evento"
2. Após comprar ingresso: tela de sucesso menciona benefícios MV
3. Perfil de outro usuário: badge discreta (coroa) nos membros
4. Card de evento na Home: ícone dourado mínimo no canto (sem texto)
5. Carteira/Minha Experiência: seção "Benefícios disponíveis" só pra membros

### Onde o MAIS VANTA NÃO aparece
- Pop-up na abertura do app
- Banner grande forçando "Seja membro!"
- Notificação push pedindo pra entrar
- Modal interrompendo qualquer fluxo
- Regra: o MAIS VANTA nunca interrompe. Ele é descoberto.

## Regras de comunicação (consolidado)

### Palavras PROIBIDAS no app
- deals, grátis, gratuito, free, assinar, premium (no sentido de "pague mais")

### Palavras e termos preferidos
- Benefícios exclusivos, membros, fazer parte, seus benefícios, lugares pra você
- Pertencimento, acesso, experiências, descobrir, o que tá rolando
- Garantir ingresso, confirmar presença, usar benefício

## Proteção (Legal + Segurança)

### Urgente (Dr. Théo)
- Registrar "VANTA" e "MAIS VANTA" no INPI agora
- Registrar software no INPI (proteção 50 anos)
- Termos de Uso + Política de Privacidade com advogado LGPD
- Consentimento granular no app (aceite separado pra dados de curadoria)
- Dados compartilhados com empresários devem ser AGREGADOS, nunca individuais

### Segurança (Zara)
- Ofuscação avançada no build (plugins Vite)
- Lógica sensível no servidor (Edge Functions + RPCs)
- Moat real = dados, não código

## Status do redesign

Todas as áreas aprofundadas e aprovadas pelo Dan:
- ✅ Home (3 camadas), VANTA Indica (5 tipos), Radar, Busca, Mensagens, Perfil
- ✅ Detalhe do Evento, Checkout, Onboarding (5 telas)
- ✅ Painel Admin (dashboard impactante + onboarding produtor), Painel Parceiro

## Próximas ações — Implementação

1. **Implementar tela a tela** — começar pelo onboarding/login (mais simples)
2. Definir mecânica exata de convites (implementação)
3. Registrar marcas INPI
4. Definir modelo de cobrança do empresário
5. Escolher micro-mercado inicial
