# VANTA — Briefing Executivo para Agentes

> **Todo agente DEVE ler este arquivo ANTES de qualquer ação.**
> Este é o ponto de entrada único. Contém tudo que você precisa saber ou aponta onde achar.

---

## O que é a VANTA

App de **descoberta de vida noturna** no Brasil. NÃO é ticketeria. É o app que responde "o que tem de bom pra fazer hoje?". O VANTA é como um **amigo que sabe tudo** — sabe o que tá rolando, conhece todo mundo e te leva nos melhores lugares.

## Posicionamento (→ `memory/projeto_posicionamento.md`)

- Membro NÃO paga pelo clube. Quem paga é o empresário (dono do evento/bar/restaurante)
- Ativo real = dados comportamentais do público noturno
- Flywheel: mais membros → mais valor pro empresário → mais benefícios → mais membros
- Slogan: "A noite é sua. Se você faz parte."
- BrandScript: herói = frequentador, vilão = fragmentação, guia = VANTA

## Identidade Visual (→ `memory/projeto_identidade_visual.md`)

- **3 palavras-guia:** Confiança • Curadoria • Estilo
- Tom: amigo conectado (caloroso, confiável), NÃO clube frio/distante
- Paleta: preto (#050505/#0A0A0A) + dourado (#FFD300, máx 10% da tela) + branco/cinza
- Tipografia: Playfair Display SC (títulos) + Inter (corpo)
- Fotos: atmosféricas, com pessoas, escuras, sem flash
- Animações: suaves, 300ms, nada piscando

## Redesign do App (→ `memory/projeto_redesign_app.md`)

### Camadas de acesso
- **Sem conta (guest):** navega livremente (Home, Busca, Radar). Modal só ao interagir
- **Com conta:** quase tudo (comprar, curtir, mensagem, social)
- **Membro MAIS VANTA:** benefícios exclusivos + curadoria personalizada

### Resumo por aba
- **Home:** 3 versões por camada. VANTA Indica expandido (5 tipos). Banner MV morreu → vira card no Indica
- **Radar:** mapa de eventos + parceiros (todos veem parceiros, só membros veem benefício)
- **Buscar:** Eventos + Pessoas + "Pra Você" (ex-Benefícios). "Pra Você" visível pra todos com blur pra não-membros
- **Mensagens:** chat 1-a-1 (essencial). Features sociais pós-lançamento
- **Perfil:** simplificado 13→8 sub-views. Card "Minha Experiência" + Card "MAIS VANTA" (separados)

### Detalhe do Evento
- "Eu vou!" em todo evento (social). Social proof: amigos primeiro (nome+foto)
- Seção MV: tom sutil pra não-membro ("Este evento tem vantagens pra membros")

### Checkout
- Confirmação limpa (confete + "Presença garantida!" + "Ver meu ingresso"). SEM MV, SEM social proof
- "Tem um código?" no lugar de "Cupom"

### Onboarding (5 telas)
- Vitrine → Cadastro ("Criar Conta") → Cidade → Interesses (opcional) → Boas-vindas

### Guest Modal (contextual)
- Sparkles dourado (não Shield). Texto adapta ao que o guest tentou fazer

### Painel Admin
- Dashboard impactante pro empresário + onboarding produtor. Sem comparativo concorrente

### Painel Parceiro
- Card "Impacto VANTA" + perfil agregado do público + economia vs ads

## MAIS VANTA — Regras

- Tiers (lista/presenca/social/creator/black) são **100% invisíveis** ao membro
- Badge discreta (coroa dourada) — quem é de dentro sabe
- Convites = motor de crescimento (3 iniciais, ganhar por engajamento, máx 10)
- O MV **nunca interrompe**. Ele é **descoberto**

## Comunicação — Regras absolutas

### PROIBIDO
- deals, grátis, gratuito, free, assinar, premium

### USAR
- Benefícios exclusivos, membros, fazer parte, seus benefícios, lugares pra você
- Garantir ingresso (pago), Confirmar presença (grátis), Usar benefício (membro MV)
- Tom conversacional — como amigo, não empresa

## Proteção

- Registrar "VANTA" e "MAIS VANTA" no INPI (urgente)
- LGPD: dados pro empresário sempre AGREGADOS, nunca individuais
- Consentimento granular no app

## Onde achar mais detalhe

| Tema | Arquivo |
|------|---------|
| Posicionamento completo | `memory/projeto_posicionamento.md` |
| Redesign tela a tela | `memory/projeto_redesign_app.md` |
| Identidade visual | `memory/projeto_identidade_visual.md` |
| Decisões recentes | `.agents/MEMORIA-COMPARTILHADA.md` |
| Regras de operação | `.agents/REGRAS-DA-EMPRESA.md` |
| Briefing da empresa | `.agents/VANTA-EMPRESA.md` |
| Módulos do app | `memory/modulo_*.md` e `memory/sub_*.md` |
| Conexões entre módulos | `memory/EDGES.md` |
| Estado da sessão | `memory/sessao_atual.md` |

---

*Atualizado em 2026-03-17 por Rafa (Gerente Geral). Atualizar ao final de toda sessão.*
