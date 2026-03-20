---
name: vanta-design
description: "Contexto de design do projeto VANTA. Identidade visual, paleta, tipografia, componentes, padroes de layout. DEVE ser consultado ANTES de qualquer decisao visual, criacao de componente, ou alteracao de estilo no projeto. Ativa automaticamente quando qualquer skill de design (ui-ux-pro-max, brand, design-system, ui-styling, banner-design) e usado."
---

# VANTA Design System — Contexto do Projeto

Este skill injeta o contexto visual do VANTA em qualquer decisao de design. Consultar SEMPRE antes de criar ou alterar componentes visuais.

## Quando Ativar

- Qualquer decisao visual (cor, fonte, espacamento, layout)
- Criacao de componente novo
- Review de UI/UX
- Quando qualquer outro skill de design for ativado
- Quando Iris (Especialista Visual) for convocada

## Essencia da Marca

O VANTA e o **amigo que sabe tudo** — aquele que sempre sabe o que ta rolando, conhece todo mundo, consegue beneficio em qualquer lugar e nunca te deixa de fora.

> **3 Palavras-Guia: Confianca, Curadoria, Estilo**

Tom: caloroso, confiavel e conectado — mas com estilo. NAO e um clube exclusivo distante/frio.

---

## Paleta de Cores (UNICA)

| Camada | Cores | Uso |
|--------|-------|-----|
| **Base** | #050505, #0A0A0A, #1A1A1A | Fundos, containers |
| **Acento primario** | #FFD300 (dourado) | CTAs, badges MV, icones destaque. **MAX 10% da tela** |
| **Texto** | #FFFFFF, rgba(255,255,255,0.92), rgba(255,255,255,0.58), rgba(255,255,255,0.38) | Texto primario, muted, faint |
| **Neutros** | #A1A1A1, #525252 | Icones, bordas, placeholders |
| **Contextual** | Verde #34D399, Vermelho #EF4444 | SOMENTE sucesso/erro |

### Regras de cor
- Dourado NUNCA mais que 10% da tela
- Borda dourada SEMPRE com opacidade (/20 a /30, nunca /100)
- Preto e protagonista. Dourado e acento.
- Texto dourado so em titulos curtos ou badges. Nunca em paragrafos.

---

## Tipografia (2 fontes, ZERO exceções)

### Fontes
- **Titulos**: a fonte chama-se "Playfair Display Bold 700" — esse e o NOME da fonte. 700 = peso, nao tamanho. NUNCA usar Playfair Display (sem Bold 700), NUNCA SC, NUNCA italic
- **Corpo**: Inter (Regular 400, Medium 500, Semibold 600, Bold 700)

### Tokens (constants.ts → TYPOGRAPHY)
| Token | Fonte | Peso | Cor | Caixa | Tracking | Size |
|-------|-------|------|-----|-------|----------|------|
| `screenTitle` | Playfair | 700 | rgba(255,255,255,0.92) | normal | — | via className |
| `cardTitle` | Playfair | 700 | rgba(255,255,255,0.92) | normal | — | via className |
| `sectionKicker` | Inter | 600 | #FFD300 | UPPER | 0.28em | 0.625rem |
| `uiLabel` | Inter | 900 | rgba(255,255,255,0.58) | UPPER | 0.22em | 0.625rem |
| `uiBody` | Inter | — | rgba(255,255,255,0.92) | normal | — | via className |

### Cores nomeadas (constants.ts → COLORS)
| Token | Valor | Uso |
|-------|-------|-----|
| `textPrimary` | rgba(255,255,255,0.92) | Texto principal |
| `textMuted` | rgba(255,255,255,0.58) | Labels, subtitulos |
| `textFaint` | rgba(255,255,255,0.38) | Placeholders, hints |
| `gold` | #FFD300 | Acento dourado |

### Padroes de uso
- **Titulo tab principal**: `style={TYPOGRAPHY.screenTitle} className="text-3xl"` + text-[#FFD300]
- **Titulo sub-view**: `style={TYPOGRAPHY.screenTitle} className="text-xl"` (branco)
- **Kicker de secao**: `style={TYPOGRAPHY.sectionKicker}` (size 0.625rem inline) + icone dourado
- **Labels caps**: `style={TYPOGRAPHY.uiLabel}`
- **font-serif ja aplica weight 700** — NUNCA adicionar font-bold junto

---

## Espacamento

- Padding cards: 20px (p-5)
- Gap entre secoes: 24-32px
- Bordas: rounded-2xl (cards), rounded-xl (botoes), rounded-full (badges)
- Headers tabs: pt-6 px-6 pb-4
- Headers sub-views: shrink-0 bg-[#0A0A0A] border-b border-white/5 px-6 pt-6 pb-4

---

## Componentes Padrao

### EventCard
- Aspect ratio 4/5
- Largura: w-[9.5rem] (cabe 2 + pedaco do 3o em 360px)
- Sem truncate, sem social proof
- Foto obrigatoria

### EventCarousel
- Carrossel horizontal: overflow-x-auto no-scrollbar
- Inner div: flex gap-3 w-max px-5
- Props: onViewAll + maxCards (default 9) + ViewAllCard automatico

### Cards novos
- **ViewAllCard**: mesmo tamanho EventCard, gradient dourado, seta, "Ver todos"
- **PartnerCard**: aspect 1/1 quadrado, foto + nome + tipo, bg-[#111] border-white/5
- **CityCard**: aspect 4/5, foto destaque + gradient overlay + nome + contagem

### Modais
- SEMPRE `absolute inset-0` (nunca `fixed inset-0` ou `w-screen`)
- Excecao: paginas standalone

### Formularios (constants.ts)
- **inputCls**: `w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD300]/30 placeholder-zinc-700`
- **labelCls**: `text-[0.5rem] text-zinc-400 font-black uppercase tracking-widest mb-1.5 block`
- Usar SEMPRE esses padroes em inputs e labels de formulario

### Botoes
- Touch: active:scale-95 transition-transform
- CTA dourado: bg-[#FFD300] text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest

---

## Layout

### Responsividade
- Minimo: 360px, maximo: 500px
- CSS global: min-width: 360px
- ZERO valores vw nos componentes
- ZERO larguras fixas — usar %, flex, w-full, min-w-0

### Safe Areas (PWA/Nativo)
- Header: `pt-[env(safe-area-inset-top)]`
- Footer/TabBar: `pb-[env(safe-area-inset-bottom)]`
- Obrigatorio em todo componente que toca topo ou fundo da tela

### Container Master (App.tsx)
- Outer: fixed inset-0, items-center, bg radial-gradient chumbo
- Inner: max-w-[500px] (app normal), max-w-4xl (admin)

### Scroll (FocusViews)
```
absolute inset-0 flex flex-col overflow-hidden
  → flex-1 overflow-y-auto no-scrollbar
```

---

## Fotografia

- Escuras, atmosfericas (noite)
- Pessoas estilosas, nao modelos
- Luzes de festa, neon, contraluz
- NUNCA flash direto
- Aspecto 4:5 (cards) ou 16:9 (banners)
- SEMPRE gradient overlay pra legibilidade

---

## Animacoes

- Transicoes: slide horizontal, 300ms, ease-out
- Fades: 500ms (animate-in fade-in duration-500)
- Touch: scale 0.95
- Glow dourado: shadow-[0_0_15px_rgba(255,211,0,0.15)] — sutil
- Nada piscando, nada pulando. Elegancia = calma.

---

## Secoes da Home (ordem)

1. Highlights (VANTA Indica)
2. Proximos Eventos (9 + ver todos)
3. Mais Vendidos 24h (10, some se 0)
4. Locais Parceiros (9 + ver todos)
5. Descubra Cidades (exceto atual)
6. VANTA Indica pra Voce (so logado + interesses)

---

## Overlays (z-index)

| View | z-index |
|------|---------|
| AllEventsView | z-[160] |
| AllPartnersView | z-[160] |
| CityView | z-[170] |
| ComunidadePublicView | z-[180] |
| PublicProfilePreview | z-[200] |

---

## Regras Absolutas

1. ZERO scroll horizontal
2. ZERO valores fixos de largura
3. ZERO hover em mobile (active: apenas)
4. Dourado max 10% da tela
5. Fonte de titulo = "Playfair Display Bold 700" (nome da fonte, 700 e peso, nao tamanho)
6. font-serif ja tem weight 700 — nunca font-bold junto
7. Fotos com gradient overlay SEMPRE
8. Tom conversacional nos textos
9. Preto nao e preto puro: usar camadas (#050505 → #0A0A0A → #1A1A1A)
10. Profundidade entre camadas via border-white/5, bg sutis, shadow minimos
