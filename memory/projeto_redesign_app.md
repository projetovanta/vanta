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

### Painel Admin (Lado B)
- Dar autonomia/controle/execução aos donos de estabelecimentos
- Pensar junto como facilitar a vida do empresário
- Painel do parceiro precisa mostrar valor: quantas pessoas vieram via VANTA, economia vs marketing tradicional

### Onboarding / Primeira Impressão
- Especialistas recomendam: experiência emocional, não formulário
- Visual: escuro, atmosférico, dourado mínimo, fotos de alta qualidade
- Fluxo: curiosidade primeiro (mostrar o que vai ganhar) → cadastro → personalização (cidade + interesses)
- Botão de cadastro: "Entrar" ou "Fazer parte" (não "Cadastrar")
- Copy onboarding: "Pra saber o que combina com você"

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

## Próximas ações

1. Aprofundar cada área (Home, Radar, Busca, Mensagens, Perfil, Painel)
2. Definir mecânica exata de convites (implementação)
3. Redesenhar onboarding (copy + visual)
4. Simplificar Perfil (decidir o que sai/fica)
5. Melhorar painel do parceiro (mostrar valor)
6. Registrar marcas INPI
7. Definir modelo de cobrança do empresário
8. Escolher micro-mercado inicial
