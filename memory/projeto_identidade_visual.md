---
name: Identidade Visual VANTA
description: Sistema visual completo — paleta, tipografia, fotografia, animações, 3 palavras-guia. Definido por Marty Neumeier + Iris. Aprovado pelo Dan em 2026-03-15.
type: project
---

## Essência da Marca

O VANTA é o **amigo que sabe tudo** — aquele que sempre sabe o que tá rolando, conhece todo mundo, consegue benefício em qualquer lugar e nunca te deixa de fora. Baseado na confiança da amizade.

## 3 Palavras-Guia (toda decisão visual passa por aqui)

> **Confiança • Curadoria • Estilo**

- **Confiança** — é um amigo, não uma empresa. Você confia nele.
- **Curadoria** — ele não te mostra tudo, ele te mostra o que é BOM.
- **Estilo** — ele tem bom gosto. O que ele recomenda é sempre de qualidade.

## Onlyness Statement

> "O VANTA é o único app de vida noturna que transforma quem frequenta a noite numa comunidade curada — onde o membro não paga pelo clube e o benefício vem de fazer parte."

## Tom Visual

NÃO é um clube exclusivo distante/frio/inacessível.
É **caloroso, confiável e conectado** — mas com estilo.
É a porta que o seu melhor amigo abre e diz "vem comigo, eu conheço o lugar certo".

## 1. Paleta de Cores — 3 Camadas

| Camada | Cores | Quando usar |
|--------|-------|-------------|
| **Base** | Preto (#050505), Quase-preto (#0A0A0A), Cinza escuro (#1A1A1A) | Fundos, containers, separadores |
| **Acento primário** | Dourado (#FFD300) | CTAs principais, badges MV, ícones de destaque. **Regra: máximo 10% da tela** |
| **Acento secundário** | Branco (#FFFFFF), Cinza claro (#A1A1A1), Cinza médio (#525252) | Texto, ícones, bordas sutis |

Sem cores extras pra interface geral. Preto, dourado, branco e cinza. Ponto.

Cores contextuais (SÓ em contextos específicos):
- Verde (#34D399) → sucesso, confirmação, "garantido"
- Vermelho (#EF4444) → urgência, últimas vagas, erro
- Badges VANTA Indica: verde (evento), âmbar (parceiro), dourado (MV), roxo (experiência)

## 2. Tipografia — 2 Fontes, 5 Níveis

**Fonte oficial de títulos: Playfair Display Bold 700** (NÃO é "SC", NÃO é Regular/400)
- Hastes grossas + traços finos delicados = contraste forte, impactante, autoridade
- Uso: manchetes, títulos de página/seção/card, logotipo
- NUNCA italic em Playfair. NUNCA peso diferente de 700.

| Nível | Fonte | Peso | Tamanho | Quando |
|-------|-------|------|---------|--------|
| **Display** | Playfair Display | Bold 700 | 24-32px | Nome do app, títulos de seção |
| **Headline** | Playfair Display | Bold 700 | 18-22px | Nome de evento, títulos de card |
| **Title** | Inter | Semibold 600 | 16px | Subtítulos, labels de seção |
| **Body** | Inter | Regular 400 | 14px | Texto corrido, descrições |
| **Caption** | Inter | Medium 500 | 10-12px | Badges, timestamps, labels menores |

Regra: Playfair Display Bold 700 = identidade (títulos). Inter = funcional (tudo que se lê). Nunca misturar. Nunca italic em Playfair.

## 3. Espaçamento

- Padding interno de cards: 20px (p-5)
- Gap entre seções: 24-32px
- Bordas arredondadas: 16px (rounded-2xl) pra cards, 12px (rounded-xl) pra botões, full (rounded-full) pra badges/chips
- Borda dourada: sempre `border-[#FFD300]/20` — nunca opacidade total (senão fica brega)

## 4. Fotografia

| Regra | Por quê |
|-------|---------|
| Escuras, atmosféricas | Coerente com noite. Nunca fotos "de dia" |
| Pessoas estilosas, não modelos | Autenticidade. Parecer real, não stock photo |
| Luzes de festa, neon, contraluz | Energia, mistério, vontade de estar lá |
| Nunca fotos com flash direto | Flash = amador. Luz ambiente = profissional |
| Aspecto 4:5 ou 16:9 | 4:5 pra cards e detalhe, 16:9 pra banners |
| **Pessoas = conexão** | Fotos com pessoas criam calor. O VANTA é amigo, não vitrine fria |

## 5. Animações

- Transições: slide horizontal, 300ms, ease-out
- Fades: 500ms
- Botão ao tocar: scale 0.95
- Nada piscando, nada pulando. Elegância = calma
- Dourado pode ter glow sutil (shadow-[0_0_15px_rgba(255,211,0,0.15)]) — nunca exagerado

## 6. Regras Absolutas

- Dourado NUNCA mais que 10% da tela
- Borda dourada SEMPRE com opacidade (/20 a /30, nunca /100)
- Preto é o protagonista. Dourado é o acento.
- Texto branco sobre fundo preto: peso Regular/Medium (nunca Light)
- Texto dourado: só em títulos curtos ou badges. Nunca em parágrafos
- Fotos SEMPRE com gradient overlay (from-black via-transparent) pra garantir legibilidade do texto
- Tom conversacional nos textos — como amigo falando, não empresa comunicando
