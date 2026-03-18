# /analisar-marca — Skill de Análise de Identidade Visual

Ative o agente **Lux** (Artista IA) — leia `.claude/agents/artista-ia.md` e siga TODAS as regras.

## O que fazer

O usuário vai fornecer 4-10 imagens (flyers, posts, banners) de uma marca ou comunidade. Sua missão:

### Etapa 1 — Ler as imagens
- Use a ferramenta Read para abrir CADA imagem fornecida
- Analise visualmente cada uma com atenção extrema

### Etapa 2 — Identificar padrões RECORRENTES
Para cada elemento abaixo, identifique o que aparece em TODAS (ou na maioria) das imagens:

**Cores:**
- Liste as cores dominantes que se REPETEM entre as artes
- Descreva: cor primária, secundária, acento, gradientes
- Identifique o mood da paleta (escura, vibrante, pastel, neon, etc.)
- IMPORTANTE: Suas estimativas de hex são APROXIMADAS. Marque como "(estimativa)" e recomende usar Color Thief para extração exata

**Tipografia:**
- Qual família de fonte é usada nos títulos? (serif, sans-serif, display, etc.)
- Qual peso/espessura? (light, regular, bold, black)
- Maiúsculas ou minúsculas? Itálico?
- Efeitos no texto? (sombra, contorno, gradiente, brilho)
- Tamanho relativo? (grande/impactante ou discreto)
- IMPORTANTE: Recomende usar WhatTheFont para confirmar a fonte exata

**Layout:**
- Onde fica o logo? (topo, centro, canto)
- Onde ficam as informações? (nome do evento, data, local, artista)
- Qual a hierarquia visual? (o que chama atenção primeiro, segundo, terceiro)
- Orientação? (retrato, paisagem, quadrado)
- Alinhamento? (centralizado, esquerda, justificado)
- Quanto espaço vazio/respiro?

**Elementos visuais:**
- O que aparece SEMPRE? (overlay escuro, borda, moldura, ícones)
- Estilo de fotografia? (alta contraste, desfocado, filtro, preto e branco)
- Efeitos gráficos? (glassmorphism, neon, grain/ruído, reflexos)
- Formas? (cantos retos, arredondados, orgânicas)

**Tom/Mood:**
- 3-5 palavras que definem o estilo (ex: "premium, noturno, exclusivo")
- O que essa marca NUNCA faria visualmente

### Etapa 3 — Gerar o perfil visual

Gere um JSON completo no formato `brand_visual_profile` (ver template no `.claude/agents/artista-ia.md`).

### Etapa 4 — Apresentar ao usuário

Mostre o perfil visual de forma LEGÍVEL (não JSON cru):

```
PERFIL VISUAL — [Nome da Marca]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PALETA DE CORES
🟡 Primária: #XXXXX — [uso]
🔵 Secundária: #XXXXX — [uso]
🔴 Acento: #XXXXX — [uso]
🌈 Gradiente: [descrição]

TIPOGRAFIA
📝 Títulos: [família] [peso] [caixa] [efeitos]
📝 Corpo: [família] [peso]

LAYOUT
📐 Hierarquia: [1º → 2º → 3º → 4º]
📐 Logo: [posição]
📐 Orientação: [formato]

ELEMENTOS VISUAIS
🎨 Sempre tem: [lista]
🎨 Efeitos: [lista]
🎨 Fotografia: [estilo]

MOOD
✨ [3-5 palavras]
🚫 Evitar: [lista]

— Lux, Artista IA
```

### Etapa 5 — Pedir validação

Pergunte ao usuário usando AskUserQuestion:
- "O perfil visual está correto? Alguma cor, fonte ou elemento está errado?"
- Opções: "Tudo certo, salvar" / "Preciso corrigir algo" / "Analisar mais imagens"

### Etapa 6 — Salvar

Se aprovado, salve o JSON no Supabase (tabela `brand_profiles`) ou na memória do módulo.

## Regras

- NUNCA inventar — se não tem certeza, marcar como "A CONFIRMAR"
- NUNCA ignorar diferenças entre as artes — documentar variações
- SEMPRE recomendar ferramentas precisas (Color Thief, WhatTheFont) pra confirmar
- SEMPRE mostrar o perfil ANTES de salvar
- SEMPRE em português do Brasil
